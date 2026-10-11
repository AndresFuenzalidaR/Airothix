const MAX_MESSAGES = 10;
const MAX_MESSAGE_LENGTH = 1500;

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
  if (!process.env.OPENAI_API_KEY) {
    return json({ message: 'El chat todavía no está configurado. Escríbenos por WhatsApp.' }, 503);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ message: 'El mensaje enviado no es válido.' }, 400);
  }

  if (!Array.isArray(body?.messages) || body.messages.length === 0 || body.messages.length > MAX_MESSAGES) {
    return json({ message: 'La conversación enviada no es válida.' }, 400);
  }

  const messages = [];
  for (const message of body.messages) {
    if (!message || !['user', 'assistant'].includes(message.role) || typeof message.content !== 'string') {
      return json({ message: 'La conversación enviada no es válida.' }, 400);
    }

    const content = message.content.trim();
    if (!content || content.length > MAX_MESSAGE_LENGTH) {
      return json({ message: 'Cada mensaje debe tener entre 1 y 1500 caracteres.' }, 400);
    }

    messages.push({ role: message.role, content });
  }

  if (messages[messages.length - 1].role !== 'user') {
    return json({ message: 'Envía un mensaje para continuar la conversación.' }, 400);
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(8000),
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        temperature: 0.4,
        max_tokens: 400,
        messages: [
          {
            role: 'system',
            content: 'Eres el asistente comercial de AIROTHIX, una empresa chilena que ayuda a empresas con desarrollo web, automatización, CRM, analítica e inteligencia artificial. Responde siempre en español, de forma cordial, clara y breve. Entiende primero el desafío del cliente y explica cómo estas soluciones podrían ayudar. No inventes precios, plazos, clientes ni resultados garantizados. Si falta contexto, haz una pregunta concreta. Para una cotización o evaluación específica, invita a compartir nombre, empresa y correo en el formulario de https://www.airothix.cl/#contacto o a escribir a contacto@airothix.cl. No solicites datos sensibles.'
          },
          ...messages
        ]
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error('Error OpenAI /api/chat:', data.error?.message || response.status);
      return json({ message: 'El chat no pudo responder en este momento. Escríbenos por WhatsApp o intenta nuevamente.' }, 502);
    }

    const reply = data.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      console.error('OpenAI /api/chat devolvió una respuesta vacía.');
      return json({ message: 'No recibimos una respuesta. Intenta nuevamente.' }, 502);
    }

    return json({ reply });
  } catch (error) {
    console.error('Error /api/chat:', error);
    return json({ message: 'El chat no está disponible temporalmente. Escríbenos por WhatsApp o intenta nuevamente.' }, 502);
  }
}
