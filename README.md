# AIROTHIX v3.1 — Formulario automático con Resend

## Incluye
- Sitio HTML aprobado.
- Formulario con nombre, empresa, correo, teléfono, servicio y mensaje.
- Envío automático sin abrir Outlook ni Gmail.
- Vercel Function en `api/contact.js`.
- API Key protegida en el servidor.
- Plantilla HTML corporativa.
- Respuesta directa al correo del cliente mediante `reply_to`.
- Validación de campos, spinner, confirmación y manejo de errores.
- Campo antispam invisible.

## Variables en Vercel
Obligatoria:
- `RESEND_API_KEY`

Opcionales:
- `RESEND_FROM_EMAIL`: `AIROTHIX Web <contacto@airothix.cl>`
- `CONTACT_TO_EMAIL`: `contacto@airothix.cl`

## Requisito en Resend
El dominio usado en `RESEND_FROM_EMAIL` debe estar verificado en Resend.
Si `airothix.cl` todavía no está verificado, entra a Resend → Domains y completa SPF y DKIM.

## Publicación
Sube todo el contenido de esta carpeta a la raíz del repositorio conectado a Vercel.
Luego realiza un nuevo deployment. Las variables deben estar activas en Production y Preview.

## Prueba
1. Abre el sitio publicado, no el archivo local.
2. Completa el formulario.
3. Verifica la llegada del mensaje a `contacto@airothix.cl`.
4. En caso de error, revisa Vercel → Logs y Resend → Logs.
