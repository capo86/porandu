# porandu

Plataforma en español (Paraguay) para completar Heymans, CHASIDE y Eysenck sin crear una cuenta.

## Desarrollo

Requiere Node.js 24 LTS y npm. En PowerShell con ejecución de scripts restringida, usá `npm.cmd` y `npx.cmd`.

```sh
npm install
npm run dev
```

Abrí `http://127.0.0.1:5173`. El acceso profesional y los enlaces existentes requieren la configuración de Supabase en `.env.local`.

## Estado y alcance

- React + TypeScript estricto, Vite, Tailwind con plugin oficial y rutas para SPA.
- 185 preguntas importadas de los tres Google Forms originales, con 30 pares de opciones propios en Heymans.
- Los intentos existentes conservan los datos mínimos y el consentimiento registrados; permiten responder una pregunta por pantalla, revisar y finalizar.
- Acceso profesional con correo y contraseña, recuperación de contraseña y sesión persistente; las cuentas se crean manualmente en Supabase Auth.
- Cinco tablas con RLS y sin acceso directo de `anon` ni `authenticated`.
- RPCs para recuperar, guardar y completar intentos existentes; la creación libre mediante `start_test` está bloqueada para `anon` y `authenticated`. La asignación de nuevos intentos es una etapa posterior.
- Acceso a intentos existentes por UUID privado en el fragmento de la URL (`/intento#...`). No se almacenan respuestas ni datos de pacientes en localStorage; Supabase Auth guarda la sesión profesional hasta cerrar sesión.
- Guardado al pulsar **Continuar** o **Anterior**. Un error de red mantiene la respuesta en pantalla y permite reintentar.
- Resultado guardado con estado `pending_validation`, respuestas crudas y versión de corrección. **No hay puntajes ni interpretaciones clínicas**: el responsable pidió dejar la corrección pendiente.
- Panel profesional básico; tabla `professionals` preparada sin acceso a pacientes ni datos entre profesionales.

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

Proyecto vinculado: `porandu` (`ruftlpyfrubgqsqrdepz`). Las migraciones están en `supabase/migrations/`; verificá su estado remoto antes de publicar. Las cinco tablas tienen RLS y no permiten acceso directo para `anon`/`authenticated`.

Las cuentas se crean manualmente en Supabase, **Authentication → Users → Add user**, con correo confirmado y contraseña inicial. El registro público debe permanecer deshabilitado. No hace falta crear todavía una fila en `professionals`.

En **Authentication → URL Configuration**, agregar las URL locales de `/recuperar/actualizar` y la URL equivalente del sitio desplegado. La recuperación necesita configurar un proveedor SMTP propio para enviar mensajes a profesionales externos; el servidor SMTP predeterminado de Supabase está limitado a direcciones autorizadas del equipo. No guardar credenciales SMTP en el cliente ni en el repositorio.

El comando `npm run supabase` carga `.env.local` usando Node, sin pasar credenciales en los argumentos. Con la CLI 3, `--remote` selecciona explícitamente el proyecto remoto; sin ese flag, los comandos de base de datos apuntan al entorno local. Para futuras migraciones, revisar el SQL y el resultado de la simulación antes de aplicar:

```sh
npm run supabase -- link --project-ref ruftlpyfrubgqsqrdepz
npm run supabase -- migration list --remote
npm run supabase -- db push --remote --dry-run --skip-vault
npm run supabase -- db push --remote --skip-vault
```

`src/lib/database.types.ts` fue generado por la CLI de Supabase desde la base remota. Para regenerarlo, ejecutar `npm run --silent supabase -- gen types typescript --remote --schema public` y guardar únicamente la salida TypeScript en ese archivo, con codificación UTF-8. `npm run db:types` genera una alternativa offline desde PostgreSQL embebido; usarla solo cuando no haya acceso al proyecto real.

Repositorio: https://github.com/capo86/porandu. Para desplegar, conectar el repositorio a Vercel y configurar **únicamente** las dos variables `VITE_SUPABASE_*` para el build. Configuración: framework Vite, comando `npm run build`, salida `dist`. `vercel.json` incluye rewrites SPA y cabeceras de privacidad y seguridad. Aplicar primero las migraciones que requiera cada versión.

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

Las pruebas unitarias usan respuestas ficticias: no afirman correcciones clínicas. Las pruebas de navegador verifican acceso profesional, recuperación, bloqueo de inicio libre y la continuidad de un intento existente en escritorio y móvil, con respuestas de Supabase simuladas.

Las E2E levantan su propio servidor en el puerto 5175 con una URL y clave ficticias, incluso si `.env.local` tiene credenciales; las peticiones se interceptan y no llegan a Supabase. Para usar Chrome instalado en Windows, establecer `PLAYWRIGHT_CHANNEL=chrome` en el entorno antes de ejecutarlas.

La auditoría de dependencias de producción no reporta vulnerabilidades; npm informa avisos moderados en herramientas de desarrollo de ESLint/minimatch.

## Fuentes de preguntas

- Heymans: https://forms.gle/WovzZSVarEf4Z8mc8
- CHASIDE: https://forms.gle/UrpnH8BnGXiWi7te7
- Eysenck: https://forms.gle/qHPqUFZLQ8HvSwEf6

`npm run import:forms` vuelve a importar exclusivamente preguntas públicas, verifica los conteos e IDs y separa las etiquetas X/Z. No envía respuestas a Google ni obtiene datos de pacientes. Los borradores descargados van a `tmp/`, ignorado por Git. Revisar cualquier cambio y versionar el cuestionario antes de reemplazar preguntas en producción.
