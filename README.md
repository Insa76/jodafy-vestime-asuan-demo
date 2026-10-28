# Jodafy · Vestime Asuan — demo visual

Esta versión está preparada para publicar en Vercel como una demo estática. Conserva la landing actual de Jodafy y presenta la invitación de 15 años, ejemplos de tarjetas individuales y una pantalla ilustrativa de control de acceso.

## Publicar en Vercel
1. Subí el contenido de esta carpeta a un repositorio nuevo de GitHub.
2. En https://vercel.com/new importá ese repositorio.
3. Framework Preset: Vite. Build Command: `npm run build`. Output Directory: `dist`.
4. Presioná Deploy. `vercel.json` ya configura el fallback para las rutas internas.

## Rutas de la demo
- `/` landing actual de Jodafy
- `/invitacion/demo` invitación Vestime Asuan
- `/admin/demo` ejemplos visuales de tarjetas QR
- `/tarjeta/demo-invitado` tarjeta individual de muestra
- `/scanner/demo` vista previa del control de acceso

## Limitaciones
El formulario de tarjetas crea ejemplos solo en la memoria de la página. No hay servidor, autenticación, base de datos ni control real de acceso. Las respuestas RSVP se guardan localmente en el navegador. Esta versión es exclusivamente para revisión visual; no usar en un evento real.
