# AGENTS.md — porandu

Guía para agentes de IA (y humanos) que trabajen en este repositorio. Léela completa antes de tocar código.

## 1. Qué es porandu

Plataforma web para **aplicar tests psicológicos y obtener los resultados automáticamente**.

**MVP (alcance actual):** replicar tres tests que hoy están en Google Forms:

| Test | Formato | Ítems | Origen |
|---|---|---|---|
| Heymans (Cuestionario Caracterológico) | Elegir `X` o `Z` por ítem | 30 | https://forms.gle/WovzZSVarEf4Z8mc8 |
| CHASIDE (Test de Orientación Vocacional) | `SÍ` / `NO` | 98 | https://forms.gle/UrpnH8BnGXiWi7te7 |
| Eysenck (Inventario de Personalidad) | `SÍ` / `NO` | 57 | https://forms.gle/qHPqUFZLQ8HvSwEf6 |

**Flujo del MVP:** la persona (paciente) se registra → elige un test → lo completa → ve su resultado calculado automáticamente → el resultado queda guardado.

**Fuera del MVP (después):** funcionalidades para profesionales de la salud (psicólogos): panel, asignación de tests a pacientes, revisión de resultados, informes. Solo se crea la **tabla** `professionals` ahora; no construir su UI todavía.

**No hacer:** no agregar tests nuevos, pagos, chat, agenda ni nada fuera del MVP sin que se pida.

## 2. Stack

- **React** (última versión estable) + **TypeScript** en modo estricto
- **Vite** como bundler
- **Tailwind CSS** (última versión estable; con Vite usar el plugin oficial `@tailwindcss/vite`)
- **Supabase** (Postgres + Auth + RLS + RPC/Edge Functions) con `@supabase/supabase-js`
- **Vercel** para el deploy (SPA)

> Antes de instalar, verificar la versión estable vigente con `npm view <paquete> version`. No usar versiones beta, canary ni RC.

## 3. Setup inicial

```bash
npm create vite@latest porandu -- --template react-ts
cd porandu
npm install
npm install @supabase/supabase-js react-router-dom
npm install tailwindcss @tailwindcss/vite
npm install -D vitest @types/node
# CLIs (globales o con npx)
npm install -D supabase vercel
```

`vite.config.ts` (resumen):

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
})
```

`src/index.css`: `@import "tailwindcss";`

`vercel.json` (rewrites para SPA):

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

Supabase:

```bash
npx supabase init
npx supabase link --project-ref <PROJECT_REF>
npx supabase db push        # aplica /supabase/migrations
npx supabase gen types typescript --linked > src/lib/database.types.ts
```

Variables de entorno (`.env.local`, nunca commitear; replicar en Vercel → Project Settings → Environment Variables):

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

La **service role key jamás** va al frontend ni a variables `VITE_*`.

## 4. Comandos

| Comando | Acción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | `tsc -b && vite build` |
| `npm run preview` | Previsualizar build |
| `npm run lint` | Lint |
| `npm test` | Tests unitarios (Vitest) |

Antes de dar una tarea por terminada: `npm run lint && npm test && npm run build` deben pasar.

## 5. Estructura del proyecto

```
src/
  components/        # UI reutilizable (Button, Card, ProgressBar, etc.)
  features/
    patients/        # registro/datos del paciente
    tests/           # runner genérico de tests (pantalla de preguntas, progreso, envío)
    results/         # pantallas de resultado por test
  data/tests/        # definiciones de cada test (preguntas, opciones, claves de corrección)
    heymans.ts
    chaside.ts
    eysenck.ts
  lib/
    supabase.ts      # cliente único
    scoring/         # funciones puras de puntaje (una por test) + tests unitarios
    database.types.ts
  pages/
  routes.tsx
supabase/
  migrations/        # SQL versionado (única fuente de verdad del esquema)
  seed.sql
```

## 6. Modelo de datos (Supabase / Postgres)

Todas las tablas con `id uuid primary key default gen_random_uuid()`, `created_at timestamptz default now()`. Nombres en `snake_case`, en español o inglés pero **consistentes** (este documento usa inglés para tablas y columnas).

- **`patients`**: `full_name`, `document_number`, `birth_date`, `sex`, `email`, `phone`, `consent_accepted_at`.
- **`professionals`** (solo tabla por ahora): `auth_user_id` (→ `auth.users`), `full_name`, `license_number`, `email`, `phone`, `specialty`.
- **`tests`**: `code` (`heymans` | `chaside` | `eysenck`), `name`, `version`, `item_count`.
- **`test_attempts`**: `patient_id`, `test_id`, `status` (`in_progress` | `completed`), `started_at`, `completed_at`, `answers jsonb` (mapa `{ "1": "X", "2": "Z", ... }`).
- **`test_results`**: `attempt_id` (único), `scores jsonb` (puntajes por escala/área), `interpretation jsonb`, `scoring_version`.

Reglas:

- El esquema se cambia **solo** con migraciones en `supabase/migrations/`. No editar tablas desde el dashboard sin migración.
- **RLS activado en todas las tablas.** Sin política = sin acceso.
- Los datos de tests psicológicos son **datos sensibles**: recolectar solo lo necesario, pedir consentimiento explícito antes de empezar (`consent_accepted_at`), no loguear respuestas ni resultados en consola/servicios externos.
- Guardar siempre las **respuestas crudas** además del resultado, para poder recalcular si cambia la clave de corrección (`scoring_version`).

### Acceso (MVP)

El paciente completa el test sin crear cuenta. Para no exponer las tablas al rol `anon`:

- Crear/consultar pacientes, intentos y resultados mediante **funciones RPC** (`security definer`) o Edge Functions que validen la entrada.
- El paciente accede a su resultado con un **token/UUID no adivinable** del intento, no con listados abiertos.
- Los profesionales (más adelante) acceden con Supabase Auth y políticas RLS basadas en `auth.uid()`.

## 7. Cómo modelar los tests

Cada test es **datos + una función pura de puntaje**; la UI es genérica y se alimenta de los datos.

```ts
// src/data/tests/types.ts
export type TestDefinition = {
  code: 'heymans' | 'chaside' | 'eysenck'
  name: string
  version: string
  options: { value: string; label: string }[]   // ej. X/Z  o  SI/NO
  items: { id: number; text: string; optionLabels?: Record<string, string> }[]
}

// src/lib/scoring/types.ts
export type Answers = Record<number, string>
export type ScoreFn = (answers: Answers) => { scores: Record<string, number>; interpretation: unknown }
```

Particularidades de cada test (según los formularios originales):

- **Heymans:** 30 ítems; en cada uno hay dos enunciados (`X` / `Z`) y la persona elige uno. El texto de cada opción es distinto por ítem, así que cada ítem guarda sus propias etiquetas para `X` y `Z`. Mide las dimensiones del carácter de Heymans (emotividad, actividad, resonancia).
- **CHASIDE:** 98 ítems `SÍ/NO`. Se puntúa por áreas vocacionales (C, H, A, S, I, D, E), normalmente con interés y aptitud por separado.
- **Eysenck:** 57 ítems `SÍ/NO`. Se puntúa por escalas (extraversión, neuroticismo, sinceridad/mentira).

### Claves de corrección (importante)

Los formularios **no incluyen** la clave de corrección ni los baremos/interpretaciones. **No inventarlos ni inferirlos de memoria.**

- Pedir al responsable (psicólogo/a) las claves oficiales y las tablas de interpretación de cada test, y guardarlas como datos versionados (`src/data/tests/*.ts` o tabla en Supabase).
- Hasta tenerlas, implementar la estructura y dejar los puntajes con `TODO` explícito y tests con datos de ejemplo claramente marcados como ficticios.
- Cada función de puntaje debe tener **tests unitarios** con casos conocidos (todo SÍ, todo NO, mixto) y validar que se respondieron **todos** los ítems antes de calcular.
- Los resultados son **orientativos**: mostrar siempre un aviso de que no reemplazan la evaluación de un profesional.

## 8. Convenciones de código

- TypeScript estricto: sin `any`; preferir `unknown` + validación. Tipos de DB generados con `supabase gen types`.
- Componentes funcionales, un componente por archivo, nombres en `PascalCase`; hooks `useAlgo`.
- Importar con alias `@/`.
- Estado de servidor: llamadas a Supabase encapsuladas en `features/*/api.ts`; los componentes no llaman a `supabase` directamente.
- Validar formularios (zod recomendado) antes de enviar; manejar y mostrar errores de red.
- Tailwind: clases utilitarias, **mobile-first**; sin CSS suelto salvo casos justificados. Extraer componentes en vez de repetir cadenas largas de clases.
- Accesibilidad: labels asociados, foco visible, navegación por teclado; las opciones de respuesta deben ser grandes y fáciles de tocar en móvil (los tests se completarán mayormente desde el celular).
- UX del test: una pregunta (o pocas) por pantalla, barra de progreso, posibilidad de volver atrás, **guardar progreso** en el intento (`in_progress`) para poder retomar, y bloquear el envío si falta alguna respuesta.
- Idioma de la interfaz: **español (Paraguay)**. Código, nombres de variables y commits en inglés.
- Commits pequeños y descriptivos (Conventional Commits: `feat:`, `fix:`, `chore:`).

## 9. Deploy

- Repositorio en Git conectado a **Vercel**; cada push a `main` despliega a producción, cada PR genera un preview.
- Build command: `npm run build` · Output: `dist`.
- Las migraciones de Supabase se aplican con `supabase db push` **antes** de desplegar código que dependa de ellas.
- Nunca cambiar el esquema de producción sin migración revisada.

## 10. Límites para el agente

- Ignorar la carpeta `Automatizacion pruebaspsi/`: no leer, procesar, importar ni usar su contenido como referencia. Mantenerla excluida de Git y de los despliegues.
- No commitear secretos ni `.env*`.
- No desactivar RLS ni usar la service role key en el cliente.
- No inventar claves de corrección, baremos ni interpretaciones clínicas.
- No agregar dependencias pesadas sin justificarlo.
- Ante dudas de alcance, preguntar en vez de ampliar el MVP.

## 11. Orden de trabajo sugerido

1. Scaffold del proyecto, Tailwind, alias, lint, Vitest y `vercel.json`.
2. Migración inicial: `patients`, `professionals`, `tests`, `test_attempts`, `test_results` + RLS + RPCs.
3. Cargar las definiciones de preguntas de los tres tests en `src/data/tests/` (ya extraídas de los formularios).
4. Runner genérico de tests + registro del paciente + consentimiento.
5. Funciones de puntaje con tests unitarios (cuando estén las claves oficiales).
6. Pantalla de resultados y guardado.
7. Deploy a Vercel y prueba de punta a punta en móvil.
