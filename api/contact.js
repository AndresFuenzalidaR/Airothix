const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function clean(value, maxLength) {
  return String(value ?? '').trim().slice(0, maxLength);
}

function json(data, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json; charset=utf-8'
    }
  });
}

export async function POST(request) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('Falta RESEND_API_KEY.');
      return json({ message: 'El servicio de correo aún no está configurado.' }, 500);
    }

    const body = await request.json();

    // Campo oculto antispam.
    if (clean(body.website, 200)) {
      return json({ ok: true });
    }

    const data = {
      name: clean(body.name, 100),
      company: clean(body.company, 120),
      email: clean(body.email, 160).toLowerCase(),
      phone: clean(body.phone, 40),
      need: clean(body.need, 160),
      message: clean(body.message, 3000)
    };

    if (!data.name || !data.email || !data.need || !data.message) {
      return json({ message: 'Completa todos los campos obligatorios.' }, 400);
    }

    if (!EMAIL_RE.test(data.email)) {
      return json({ message: 'Ingresa un correo electrónico válido.' }, 400);
    }

    const createdAt = new Intl.DateTimeFormat('es-CL', {
      dateStyle: 'full',
      timeStyle: 'short',
      timeZone: 'America/Santiago'
    }).format(new Date());

    const safe = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, escapeHtml(value)])
    );

    const emailHtml = `
      <!doctype html>
      <html lang="es">
        <body style="margin:0;background:#06101f;font-family:Arial,Helvetica,sans-serif;color:#eaf4ff">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#06101f;padding:30px 12px">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
                  style="max-width:680px;background:#0b1729;border:1px solid #1c3f68;border-radius:18px;overflow:hidden">
                  <tr>
                    <td style="padding:28px 30px;background:linear-gradient(135deg,#0d47d9,#17c9ef)">
                      <div style="font-size:12px;font-weight:700;letter-spacing:2px;color:#dff8ff">AIROTHIX</div>
                      <h1 style="margin:8px 0 0;font-size:27px;color:#fff">Nuevo contacto desde la web</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:30px">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                        <tr><td style="padding:9px 0;color:#84bff9;width:140px">Nombre</td><td style="padding:9px 0;color:#fff;font-weight:700">${safe.name}</td></tr>
                        <tr><td style="padding:9px 0;color:#84bff9">Empresa</td><td style="padding:9px 0;color:#fff">${safe.company || 'No informada'}</td></tr>
                        <tr><td style="padding:9px 0;color:#84bff9">Correo</td><td style="padding:9px 0"><a href="mailto:${safe.email}" style="color:#5edcff">${safe.email}</a></td></tr>
                        <tr><td style="padding:9px 0;color:#84bff9">Teléfono</td><td style="padding:9px 0;color:#fff">${safe.phone || 'No informado'}</td></tr>
                        <tr><td style="padding:9px 0;color:#84bff9">Servicio</td><td style="padding:9px 0;color:#fff;font-weight:700">${safe.need}</td></tr>
                        <tr><td style="padding:9px 0;color:#84bff9">Fecha</td><td style="padding:9px 0;color:#fff">${escapeHtml(createdAt)}</td></tr>
                      </table>
                      <div style="margin-top:24px;padding:20px;border-radius:13px;background:#071222;border:1px solid #17395f">
                        <div style="margin-bottom:10px;color:#84bff9;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px">Mensaje</div>
                        <div style="white-space:pre-wrap;line-height:1.65;color:#f3f8ff">${safe.message}</div>
                      </div>
                      <p style="margin:24px 0 0;color:#93a9c4;font-size:13px;line-height:1.5">
                        Responde directamente a este correo para contactar a ${safe.name}.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>`;

    const from = process.env.RESEND_FROM_EMAIL || 'AIROTHIX Web <contacto@airothix.cl>';
    const to = process.env.CONTACT_TO_EMAIL || 'contacto@airothix.cl';

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: data.email,
        subject: `Nuevo contacto AIROTHIX · ${data.need}`,
        html: emailHtml
      })
    });

    const resendResult = await resendResponse.json().catch(() => ({}));

    if (!resendResponse.ok) {
      console.error('Error Resend:', resendResult);
      return json({
        message: 'No pudimos enviar tu solicitud en este momento. Escríbenos a contacto@airothix.cl.'
      }, 502);
    }

    return json({ ok: true, id: resendResult.id });
  } catch (error) {
    console.error('Error /api/contact:', error);
    return json({ message: 'Ocurrió un error inesperado al enviar la solicitud.' }, 500);
  }
}

export function GET() {
  return json({ service: 'AIROTHIX Contact API', status: 'ok' });
}
