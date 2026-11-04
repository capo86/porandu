# porandu

Plataforma en español (Paraguay) para completar Heymans, CHASIDE y Eysenck sin crear una cuenta.

## Desarrollo

Requiere Node.js 24 LTS y npm. En PowerShell con ejecución de scripts restringida, usá `npm.cmd` y `npx.cmd`.

```sh
npm install
npm run dev
```

Abrí `http://127.0.0.1:5173`. Sin configuración de Supabase se muestra una **vista de prueba**: usá datos ficticios. Las respuestas viven únicamente en memoria y desaparecen al recargar; no se simula persistencia real.

## Estado y alcance

- React + TypeScript estricto, Vite, Tailwind con plugin oficial y rutas para SPA.
- 185 preguntas importadas de los tres Google Forms originales, con 30 pares de opciones propios en Heymans.
- Datos mínimos del paciente, consentimiento explícito, una pregunta por pantalla, revisión y envío final.
- Cinco tablas con RLS y sin acceso directo de `anon` ni `authenticated`.
- RPCs para iniciar, recuperar, guardar y completar intentos; validación en Postgres y control de revisión para evitar sobrescrituras entre pestañas.
- Acceso por UUID privado en el fragmento de la URL (`/intento#...`), que no se envía al servidor de alojamiento. No se almacenan respuestas ni datos personales en localStorage.
- Guardado al pulsar **Continuar** o **Anterior**. Un error de red mantiene la respuesta en pantalla y permite reintentar.
- Resultado guardado con estado `pending_validation`, respuestas crudas y versión de corrección. **No hay puntajes ni interpretaciones clínicas**: el responsable pidió dejar la corrección pendiente.
- Tabla `professionals` preparada, sin UI ni acceso habilitado.

Las funciones de puntaje contienen TODOs explícitos. La finalización en producción ocurre exclusivamente en el servidor; el navegador no puede enviar sus propios puntajes. Las claves oficiales y los baremos deberán implementarse en una migración versionada y probarse con casos aprobados antes de habilitar resultados.

## Credenciales

Completá `.env.local` (ya creado, ignorado por Git y Vercel):

| Variable | Uso |
| --- | --- |
| `VITE_SUPABASE_URL` | URL pública del proyecto |
| `VITE_SUPABASE_ANON_KEY` | Clave **anon/publishable**, pública y protegida por RLS/RPCs |
| `SUPABASE_ACCESS_TOKEN` | Token privado de la cuenta, para la CLI |
| `SUPABASE_PROJECT_REF` | Referencia del proyecto elegido |
| `SUPABASE_DB_PASSWORD` | Contraseña privada de Postgres, si la CLI la requiere |
| `VERCEL_TOKEN` | Token privado de despliegue |
| `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID` | Identificadores del proyecto de Vercel, si ya existe |

Una service role key nunca se usa en el frontend ni en variables `VITE_*`. Los tokens privados no son variables de la app web. No se deben subir `.env*`, material de referencia ni PDFs personales: se excluyen también mediante `.vercelignore`.

## Supabase y despliegue

Proyecto vinculado: `porandu` (`ruftlpyfrubgqsqrdepz`). La migración `202611030001_initial_schema.sql` ya se aplicó y figura en el historial remoto. Se verificaron RLS en las cinco tablas, ausencia de acceso directo para `anon`/`authenticated`, RPCs y catálogo de tests. La prueba de inicio, guardado y finalización se ejecutó con datos ficticios dentro de una transacción revertida.

El comando `npm run supabase` carga `.env.local` usando Node, sin pasar credenciales en los argumentos. Con la CLI 3, `--remote` selecciona explícitamente el proyecto remoto; sin ese flag, los comandos de base de datos apuntan al entorno local. Para futuras migraciones, revisar el SQL y el resultado de la simulación antes de aplicar:

```sh
npm run supabase -- link --project-ref ruftlpyfrubgqsqrdepz
npm run supabase -- migration list --remote
npm run supabase -- db push --remote --dry-run --skip-vault
npm run supabase -- db push --remote --skip-vault
```

`src/lib/database.types.ts` fue generado por la CLI de Supabase desde la base remota. Para regenerarlo, ejecutar `npm run --silent supabase -- gen types typescript --remote --schema public` y guardar únicamente la salida TypeScript en ese archivo, con codificación UTF-8. `npm run db:types` genera una alternativa offline desde PostgreSQL embebido; usarla solo cuando no haya acceso al proyecto real.

Repositorio: https://github.com/capo86/porandu. Para desplegar, conectar el repositorio a Vercel y configurar **únicamente** las dos variables `VITE_SUPABASE_*` para el build. Configuración: framework Vite, comando `npm run build`, salida `dist`. `vercel.json` incluye rewrites SPA y cabeceras de privacidad y seguridad. El despliegue en Vercel está pendiente.

La CLI de Vercel se usa con `npx vercel@latest` cuando se necesite desplegar, sin agregar sus herramientas de todos los frameworks al árbol de dependencias del proyecto.

La política CSP permite `https://*.supabase.co`. Si el proyecto usa un dominio personalizado de Supabase, agregar su origen explícitamente a `connect-src` antes del despliegue.

## Verificación

```sh
npm run lint
npm test
npm run db:test
npm run build
npx playwright install chromium
npm run test:e2e
```

`db:test` ejecuta la migración real en PostgreSQL embebido (PGlite) y prueba permisos, RLS, consentimiento, respuestas válidas, guardado, conflictos de revisión y finalización idempotente. Además se verificó la integración en el proyecto real: RPCs, transacción de prueba revertida y bloqueo de consultas directas mediante la clave pública.

Las pruebas unitarias usan respuestas ficticias: no afirman correcciones clínicas. Las pruebas de navegador recorren los tres cuestionarios en escritorio y móvil en modo demo.

Las E2E levantan su propio servidor en el puerto 5175 con la conexión remota deshabilitada, incluso si `.env.local` tiene credenciales. Para usar Chrome instalado en Windows, establecer `PLAYWRIGHT_CHANNEL=chrome` en el entorno antes de ejecutarlas.

Verificación local completada: lint, build, 29 pruebas unitarias, 62 comprobaciones de base de datos y 8 recorridos de navegador. La auditoría de dependencias de producción no reporta vulnerabilidades; npm informa avisos moderados en herramientas de desarrollo de ESLint/minimatch.

## Fuentes de preguntas

- Heymans: https://forms.gle/WovzZSVarEf4Z8mc8
- CHASIDE: https://forms.gle/UrpnH8BnGXiWi7te7
- Eysenck: https://forms.gle/qHPqUFZLQ8HvSwEf6

`npm run import:forms` vuelve a importar exclusivamente preguntas públicas, verifica los conteos e IDs y separa las etiquetas X/Z. No envía respuestas a Google ni obtiene datos de pacientes. Los borradores descargados van a `tmp/`, ignorado por Git. Revisar cualquier cambio y versionar el cuestionario antes de reemplazar preguntas en producción.
