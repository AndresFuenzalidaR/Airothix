const GRAPH_VERSION = 'v23.0';

function json(data, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json; charset=utf-8'
    }
  });
}

function getConfig() {
  return {
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN,
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    openAiKey: process.env.OPENAI_API_KEY
  };
}

function extractMessage(body) {
  const change = body?.entry?.[0]?.changes?.[0]?.value;
  const message = change?.messages?.[0];

  if (!message || message.type !== 'text' || !message.from) return null;

  return {
    from: message.from,
    text: message.text?.body?.trim() || ''
  };
}

async function generateReply(text, openAiKey) {
  if (!openAiKey) {
    return '¡Hola! Soy el asistente de AIROTHIX. Cuéntame qué necesitas mejorar: sitio web, CRM, automatización, dashboards o inteligencia artificial.';
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openAiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.4,
      max_tokens: 300,
      messages: [
        {
          role: 'system',
          content: 'Eres el asistente comercial de AIROTHIX, una empresa chilena de desarrollo web, automatización, CRM, analítica e inteligencia artificial. Responde en español, con claridad y brevedad. No inventes precios, plazos ni promesas. Si la consulta requiere una evaluación, solicita nombre, empresa y correo, o deriva a contacto@airothix.cl.'
        },
        { role: 'user', content: text }
      ]
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error('Error OpenAI:', data);
    return 'Gracias por escribir a AIROTHIX. En este momento no puedo responder con IA, pero puedes dejarme tu nombre, empresa y desafío para que te contactemos.';
  }

  return data.choices?.[0]?.message?.content?.trim() || 'Cuéntame un poco más sobre tu desafío.';
}

async function sendWhatsAppMessage(to, message, config) {
  const response = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${config.phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { preview_url: false, body: message }
    })
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    console.error('Error WhatsApp Cloud API:', data);
  }
}

export function GET(request) {
  const url = new URL(request.url);
  const config = getConfig();
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token && token === config.verifyToken) {
    return new Response(challenge || '', { status: 200 });
  }

  return new Response('Forbidden', { status: 403 });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const message = extractMessage(body);

    // Meta espera una respuesta rápida; los eventos sin texto se ignoran.
    if (!message) return json({ received: true });

    const config = getConfig();
    if (!config.accessToken || !config.phoneNumberId) {
      console.error('Faltan WHATSAPP_ACCESS_TOKEN o WHATSAPP_PHONE_NUMBER_ID.');
      return json({ message: 'WhatsApp no está configurado todavía.' }, 500);
    }

    const reply = await generateReply(message.text, config.openAiKey);
    await sendWhatsAppMessage(message.from, reply, config);

    return json({ received: true });
  } catch (error) {
    console.error('Error /api/whatsapp:', error);
    return json({ message: 'Error procesando el mensaje de WhatsApp.' }, 500);
  }
}
