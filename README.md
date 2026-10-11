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
- Webhook oficial para recibir mensajes de WhatsApp y responder con IA.

## Variables en Vercel
Obligatoria:
- `RESEND_API_KEY`

Opcionales:
- `RESEND_FROM_EMAIL`: `AIROTHIX Web <contacto@airothix.cl>`
- `CONTACT_TO_EMAIL`: `contacto@airothix.cl`

## Bot de WhatsApp

El endpoint `/api/whatsapp` está preparado para WhatsApp Cloud API de Meta.
Configura estas variables en Vercel:

- `WHATSAPP_VERIFY_TOKEN`: token secreto que usarás al verificar el webhook.
- `WHATSAPP_ACCESS_TOKEN`: token permanente o de larga duración de Meta.
- `WHATSAPP_PHONE_NUMBER_ID`: ID del número de WhatsApp Business.
- `OPENAI_API_KEY`: clave para generar respuestas con IA.
- `OPENAI_MODEL`: opcional; por defecto `gpt-4o-mini`.

En Meta, configura el webhook como `https://www.airothix.cl/api/whatsapp`, usa el mismo `WHATSAPP_VERIFY_TOKEN` y suscribe el campo `messages`.

## Chat del sitio web

El sitio incluye un asistente comercial de respuestas frecuentes sobre desarrollo web, automatización, CRM, analítica, inteligencia artificial, precios y contacto. No necesita una clave de API ni configuración adicional en Vercel. El endpoint `/api/chat` entrega respuestas predefinidas y deriva consultas específicas al formulario, correo o WhatsApp.

## Políticas y consentimiento

- `/privacidad`, `/terminos` y `/cookies` publican las políticas del sitio.
- El formulario requiere autorización expresa antes de enviar datos personales; `/api/contact` también la valida.
- La analítica opcional permanece bloqueada hasta que la persona la acepta. Actualmente no hay un ID válido de Google Analytics configurado; para habilitarlo, establecer un ID real en `GA_MEASUREMENT_ID` dentro de `index.html` y mantener el consentimiento previo.
- La decisión se guarda en el almacenamiento local del navegador por hasta 180 días. El enlace de preferencias del pie de página permite cambiarla.

Las políticas reflejan la información disponible sobre el sitio y sus proveedores. Deben revisarse con asesoría legal antes de usarlas como cumplimiento jurídico definitivo, especialmente al cambiar datos, servicios o proveedores.

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
