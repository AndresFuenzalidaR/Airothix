
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav-links');
toggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open);
});
document.querySelectorAll('.nav-links a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
document.getElementById('year').textContent = new Date().getFullYear();

const blocks = [...document.querySelectorAll('.question-block')];
const progress = document.getElementById('progress-bar');
const result = document.getElementById('diagnostic-result');
const scoreNumber = document.getElementById('score-number');
const scoreRing = document.querySelector('.score-ring');
let current = 0;
let total = 0;

blocks.forEach((block, index) => {
  block.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      total += Number(btn.dataset.value);
      block.classList.remove('active');
      current++;
      progress.style.width = `${Math.min((current + 1) * 20, 100)}%`;

      if (current < blocks.length) {
        blocks[current].classList.add('active');
      } else {
        const score = total * 10;
        let title, copy;
        if (score <= 25) {
          title = 'Inicio Digital';
          copy = 'Tu empresa necesita construir una base digital sólida: presencia web, contacto con clientes y organización inicial.';
        } else if (score <= 50) {
          title = 'Crecimiento Digital';
          copy = 'Ya existen avances, pero aún hay procesos aislados. El siguiente paso es integrar CRM, analítica y automatización.';
        } else if (score <= 75) {
          title = 'Empresa Integrada';
          copy = 'Tu organización tiene una base sólida. Conviene profundizar integraciones, KPIs e inteligencia operacional.';
        } else {
          title = 'Empresa Inteligente';
          copy = 'Tu empresa presenta una madurez digital avanzada. El foco debe estar en optimización, IA y mejora continua.';
        }
        document.getElementById('result-title').textContent = `${score}/100 · ${title}`;
        document.getElementById('result-copy').textContent = copy;
        scoreNumber.textContent = score;
        const degrees = score * 3.6;
        scoreRing.style.background = `conic-gradient(var(--cyan) 0deg, var(--blue) ${degrees}deg, rgba(255,255,255,.08) ${degrees}deg)`;
        result.classList.add('active');
      }
    });
  });
});

document.getElementById('contact-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const company = document.getElementById('company').value;
  const email = document.getElementById('email').value;
  const need = document.getElementById('need').value;
  const message = document.getElementById('message').value;
  const subject = encodeURIComponent(`Solicitud AIROTHIX - ${need}`);
  const body = encodeURIComponent(`Nombre: ${name}\nEmpresa: ${company}\nCorreo: ${email}\nNecesidad: ${need}\n\nMensaje:\n${message}`);
  window.location.href = `mailto:hola@airothix.cl?subject=${subject}&body=${body}`;
});
