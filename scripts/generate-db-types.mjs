import { writeFile } from 'node:fs/promises'
import { createTestDatabase } from './database-runtime.mjs'

// Offline generation uses actual PostgreSQL catalogs after applying the migrations.
// Once linked, regenerate with: npx supabase gen types typescript --linked
const db = await createTestDatabase()
try {
  const { rows: columns } = await db.query(`select table_name, column_name, udt_name, is_nullable, column_default
    from information_schema.columns where table_schema = 'public' order by table_name, ordinal_position`)
  const { rows: functions } = await db.query(`select p.proname, p.proargnames,
    array(select format_type(t, null) from unnest(p.proargtypes::oid[]) t) as arg_types,
    format_type(p.prorettype, null) as return_type
    from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.prosecdef order by p.proname`)
  function type(name) {
    if (['text', 'uuid', 'date', 'timestamptz', 'timestamp with time zone'].includes(name)) return 'string'
    if (['int4', 'integer'].includes(name)) return 'number'
    if (['bool', 'boolean'].includes(name)) return 'boolean'
    if (name === 'jsonb') return 'Json'
    throw new Error(`Unsupported PostgreSQL type ${name}`)
  }
  const tables = [...new Set(columns.map((column) => column.table_name))].map((name) => {
    const fields = columns.filter((column) => column.table_name === name)
    const shape = (mode) => fields.map((field) => {
      const optional = mode === 'Update' || (mode === 'Insert' && (field.column_default !== null || field.is_nullable === 'YES'))
      return `${field.column_name}${optional ? '?' : ''}: ${type(field.udt_name)}${field.is_nullable === 'YES' ? ' | null' : ''}`
    }).join('; ')
    return `      ${name}: {\n        Row: { ${shape('Row')} }\n        Insert: { ${shape('Insert')} }\n        Update: { ${shape('Update')} }\n        Relationships: []\n      }`
  }).join('\n')
  const rpc = functions.map((fn) => `      ${fn.proname}: { Args: { ${fn.proargnames.map((name, index) => `${name}: ${type(fn.arg_types[index])}`).join('; ')} }; Returns: ${type(fn.return_type)} }`).join('\n')
  await writeFile('src/lib/database.types.ts', `// GENERATED from PostgreSQL catalogs. Do not edit by hand.\n// Regenerate: npm run db:types (offline) or npx supabase gen types typescript --linked\nexport type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]\n\nexport type Database = {\n  public: {\n    Tables: {\n${tables}\n    }\n    Views: { [_ in never]: never }\n    Functions: {\n${rpc}\n    }\n    Enums: { [_ in never]: never }\n    CompositeTypes: { [_ in never]: never }\n  }\n}\n`)
  console.log(`Generated database types: ${new Set(columns.map((column) => column.table_name)).size} tables, ${functions.length} RPCs.`)
} finally { await db.close() }
