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

function normalize(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function getReply(text) {
  const message = normalize(text);

  if (/\b(precio|precios|cuanto|cuesta|cotizacion|cotizar|valor|valores)\b/.test(message)) {
    return 'El valor depende del alcance y las necesidades de cada proyecto. Para preparar una cotización, cuéntanos sobre tu empresa y lo que necesitas en el formulario de contacto: https://www.airothix.cl/#contacto';
  }

  if (/\b(plazo|plazos|tiempo|demora|fecha|cuando|rapido)\b/.test(message)) {
    return 'Los plazos dependen del alcance de cada proyecto. Cuéntanos qué necesitas y podremos orientarte: https://www.airothix.cl/#contacto';
  }

  if (/\b(web|sitio|pagina|paginas|desarrollo|software)\b/.test(message)) {
    return 'AIROTHIX diseña y desarrolla sitios web y soluciones digitales a medida para empresas. ¿Buscas crear un sitio nuevo o mejorar uno que ya tienes?';
  }

  if (/\b(crm|cliente|clientes|ventas|comercial)\b/.test(message)) {
    return 'Podemos ayudarte a organizar y fortalecer tus procesos comerciales con CRM e integración de sistemas. ¿Qué parte del seguimiento de clientes te gustaría mejorar?';
  }

  if (/\b(automatizacion|automatizar|proceso|procesos|integracion|integrar)\b/.test(message)) {
    return 'AIROTHIX ayuda a automatizar procesos e integrar herramientas digitales para reducir tareas manuales y ordenar la operación. ¿Qué proceso te gustaría automatizar?';
  }

  if (/\b(dashboard|dashboards|analitica|analisis|datos|indicadores|kpi)\b/.test(message)) {
    return 'Podemos ayudarte con analítica, dashboards e indicadores para dar más visibilidad al negocio. ¿Qué información o métricas necesitas revisar?';
  }

  if (/\b(inteligencia artificial|ia|artificial)\b/.test(message)) {
    return 'AIROTHIX trabaja con soluciones de inteligencia artificial aplicadas a las necesidades de cada empresa. Cuéntame qué tarea o desafío te gustaría resolver con IA.';
  }

  if (/\b(contacto|contactar|correo|email|whatsapp|persona|hablar)\b/.test(message)) {
    return 'Puedes escribirnos a contacto@airothix.cl, enviarnos tus datos en https://www.airothix.cl/#contacto o conversar por WhatsApp: https://wa.me/56995458478';
  }

  if (/\b(hola|buenas|buenos dias|buenas tardes|buenas noches)\b/.test(message)) {
    return '¡Hola! Puedo orientarte sobre sitios web, automatización, CRM, analítica e inteligencia artificial. ¿Qué te gustaría mejorar en tu negocio?';
  }

  return 'Puedo orientarte sobre desarrollo web, automatización, CRM, analítica e inteligencia artificial. También puedes contarnos tu desafío en https://www.airothix.cl/#contacto o escribirnos por WhatsApp: https://wa.me/56995458478';
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ message: 'El mensaje enviado no es válido.' }, 400);
  }

  if (!Array.isArray(body?.messages) || body.messages.length === 0 || body.messages.length > MAX_MESSAGES) {
    return json({ message: 'La conversación enviada no es válida.' }, 400);
  }

  for (const message of body.messages) {
    if (!message || !['user', 'assistant'].includes(message.role) || typeof message.content !== 'string') {
      return json({ message: 'La conversación enviada no es válida.' }, 400);
    }

    if (!message.content.trim() || message.content.length > MAX_MESSAGE_LENGTH) {
      return json({ message: 'Cada mensaje debe tener entre 1 y 1500 caracteres.' }, 400);
    }
  }

  const lastMessage = body.messages[body.messages.length - 1];
  if (lastMessage.role !== 'user') {
    return json({ message: 'Envía un mensaje para continuar la conversación.' }, 400);
  }

  return json({ reply: getReply(lastMessage.content) });
}
