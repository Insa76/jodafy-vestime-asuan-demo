# Recuperación de Jodafy + metadatos de WhatsApp

Este paquete restaura los archivos de estructura desde `jodafy-codigo(1).zip` y recupera el CSS completo observado en la captura funcional de `/invitacion/demo`.

## Copiar
Extraer el contenido de este paquete sobre la raíz de `jodafy-invitaciones1`, conservando la estructura de carpetas.

## MUY IMPORTANTE: archivos que NO se reemplazan
- `src/pages/InvitationPage.tsx`: conservar el archivo local simplificado que ya estaba funcionando.
- `src/data/`, `src/lib/`, `src/components/`, `src/pages/` (excepto que NO se toca ningún archivo de pages), `src/types/`, `backend/`, `public/`, `package-lock.json`.

El `App.tsx` recuperado vuelve a enrutar hacia `InvitationPage` en `/invitacion/demo` y conserva las rutas originales de Home, tarjetas, scanner y administración.

`index.html` restaura la plantilla original y añade únicamente metadatos Open Graph/Twitter para compartir Vestime por WhatsApp. La URL e imagen usan el dominio publicado conocido; antes de publicar hay que confirmar que la imagen exista en ese dominio.

No se ejecutó build ni se publicó ningún cambio.
