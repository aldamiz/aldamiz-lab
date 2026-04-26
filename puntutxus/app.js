// ============= CONFIG =============
const WORKER_URL = 'https://puntutxus-chat.aldamiz.workers.dev';

// ============= HAPTICS =============
function haptic(pattern) {
  if (navigator.vibrate) {
    try { navigator.vibrate(pattern); } catch (e) {}
  }
}
const H_TAP = 12;        // botón normal
const H_YN = 30;         // Sí/No
const H_ARM = 50;        // tap-to-confirm armado
const H_COMMIT = [50, 60, 110];   // confirmación final (borrar, logout)
const H_COIN = [50, 50, 90];      // ganar puntutxu
const RANDE_DATE = new Date('2026-06-20T08:00:00');
const TXIFON_PW = '123';
const TXIFON_SESSION_DAYS = 90;

// ============= DATA =============
const PRE_QUESTIONS = [
  // Cena anoche
  { id: 'cena_grasa',    section: 'Cena anoche',   text: '¿Cenaste con grasa?',                           hint: 'Fritos, salsas, embutido, queso',          good: 'no' },
  { id: 'cena_fibra',    section: 'Cena anoche',   text: '¿Cenaste con fibra?',                           hint: 'Ensalada grande, legumbres, integrales',   good: 'no' },
  { id: 'cena_alcohol',  section: 'Cena anoche',   text: '¿Bebiste alcohol?',                             hint: '',                                          good: 'no' },
  // Desayuno
  { id: 'des_lacteos',   section: 'Desayuno hoy',  text: '¿Has desayunado lácteos?',                      hint: 'Leche, yogur, queso',                       good: 'no' },
  { id: 'des_grasa',     section: 'Desayuno hoy',  text: '¿Has desayunado grasa?',                        hint: 'Mantequilla, embutido, frutos secos',       good: 'no' },
  { id: 'des_fibra',     section: 'Desayuno hoy',  text: '¿Has desayunado fibra?',                        hint: 'Integrales, fruta con piel',                good: 'no' },
  { id: 'des_2h',        section: 'Desayuno hoy',  text: '¿Te metes al agua antes de 2h del desayuno?',   hint: '',                                          good: 'no' },
  // Durante
  { id: 'dur_solidos',   section: 'Durante el entreno', text: '¿Vas a tomar algún sólido?', hint: 'Plátano, barrita, fruta...',                good: 'no' },
  { id: 'dur_sodio',     section: 'Durante el entreno', text: '¿Vas a tomar sodio?',         hint: 'Pastillas Sub9 Salts o similar',            good: 'yes' },
  { id: 'dur_sorbos',    section: 'Durante el entreno', text: '¿Vas a beber a sorbos pequeños y frecuentes?', hint: 'En lugar de tragos grandes', good: 'yes' },
  { id: 'dur_nuevo',     section: 'Durante el entreno', text: '¿Vas a probar un gel o bebida nuevo?', hint: 'Algo que no hayas usado antes',     good: 'no' },
  { id: 'dur_cafe',      section: 'Durante el entreno', text: '¿Has tomado o vas a tomar café/cafeína?', hint: 'No quita puntutxu, solo aviso', good: '*', noScore: true },
];

const POST_QUESTIONS = [
  { id: 'post_vomito',   text: '¿Has vomitado?',                  hint: 'Durante o después del entreno', good: 'no',  weight: 'estomago' },
  { id: 'post_intestino',text: '¿El intestino fue bien?',         hint: '',                              good: 'yes', weight: 'estomago' },
  { id: 'post_pedos',    text: '¿Has tenido muchos gases / pedos?', hint: 'No quita puntutxu, solo dato', good: 'no', noScore: true },
];

const FAQ = [
  { q: '¿Por qué la grasa antes de nadar es mala?',
    a: 'La grasa retrasa el vaciado gástrico. Mucha grasa la noche antes o en el desayuno significa que cuando empieces a nadar todavía tendrás comida en el estómago. En agua fría y bajo esfuerzo, eso es exactamente lo que provoca el vómito.' },
  { q: '¿Por qué la fibra es problemática?',
    a: 'La fibra acelera el tránsito intestinal y aumenta gases. Una ensalada grande, legumbres o pan integral en la cena pueden hacerte parar a buscar un baño en mitad de la travesía. La regla en aguas abiertas: 24h antes, fibra mínima.' },
  { q: '¿Por qué la fruta es delicada?',
    a: 'La fructosa concentrada (fruta con piel, zumos) puede dar gases y diarrea durante el ejercicio. Plátano maduro pequeño en pre-entreno se tolera mejor; durante la travesía mejor evitar fruta sólida.' },
  { q: '¿Por qué los lácteos pueden dar gases?',
    a: 'La lactosa se digiere mal en muchas personas, sobre todo a partir de los 50. En el desayuno antes de un entreno largo en frío, los lácteos suelen producir gases y a veces vómito. Mejor sustituir por bebida vegetal sin azúcar añadido.' },
  { q: '¿Por qué nada de alcohol la noche antes?',
    a: 'El alcohol deshidrata, irrita la mucosa gástrica y altera el sueño profundo. Las tres cosas combinadas son receta para vomitar al día siguiente. Cero copas mínimo 24h antes de un entreno o travesía importante.' },
  { q: '¿Por qué entrenar el intestino?',
    a: 'El intestino es entrenable. Si nunca tomas geles ni mucha bebida nadando, el día de la travesía no sabrá qué hacer. Hay que practicar la nutrición real (geles, bebida con sodio, frecuencia) en entrenos largos durante semanas. Eso reduce vómitos y gases.' },
  { q: '¿Cómo se entrena el intestino?',
    a: 'Empieza tomando 200-300 ml/h de bebida con sodio en entrenos de 1h. Sube a 400-500 ml/h en entrenos de 2h. Añade 1 gel cada 30-40 min. Repite varias semanas. El intestino se va adaptando a tolerar volumen y carbohidratos bajo esfuerzo.' },
  { q: '¿Por qué tragos pequeños y no grandes?',
    a: 'Un trago grande de líquido frío en estómago vacío y nadando vertical puede provocar náusea inmediata. Sorbos pequeños (50-100 ml) cada pocos minutos se absorben mejor y no distienden el estómago.' },
  { q: '¿Para qué sirve el sodio?',
    a: 'En agua fría se sigue sudando aunque no lo notes. Perder sodio sin reponerlo da calambres y náusea. Una pastilla 226ers Sub9 Salts cada 30-45 min con agua mantiene el equilibrio. Sin sodio, el agua que tomas no se absorbe bien.' },
  { q: '¿Por qué el agua fría afecta al intestino?',
    a: 'A 15°C el cuerpo desvía sangre del intestino hacia músculos y piel para mantener temperatura. Eso enlentece la digestión. Si hay comida pendiente o bebida hipertónica, hola vómito. Por eso a más frío, más cuidado con la nutrición.' },
  { q: '¿Cuánto antes hay que dejar de comer sólido?',
    a: 'Mínimo 2-3 horas antes de meterse al agua. Para Txifon (58 años, vaciado gástrico más lento que un joven), 3 horas es lo seguro. Lo último sólido: tostada blanca con miel, sin grasa ni fibra.' },
  { q: '¿La proteína durante una travesía es buena o mala?',
    a: 'Mala. La proteína retrasa el vaciado gástrico todavía más que los carbohidratos. La barrita Protein Boom Cookies & Cream que te dan en Rande es para después de salir del agua, no durante. Durante: solo carbohidrato líquido + sodio.' },
  { q: '¿Café sí o no?',
    a: 'Es personal. La cafeína mejora rendimiento, pero a algunas personas les acelera el intestino y les da diarrea. Si nunca has tenido problemas con el café, sigue. Si tienes el intestino delicado, mejor sin cafeína el día de Rande, o solo media taza pequeña 2h antes.' },
  { q: '¿Cuánto líquido por hora?',
    a: '400-500 ml/h en agua fría, en sorbos pequeños. Más de 700 ml/h te puede dar vómito por sobre-distensión gástrica. Menos de 300 ml/h en travesía larga lleva a deshidratación. El sodio (Sub9 Salts) es lo que permite que el agua se absorba.' },
  { q: '¿Qué hago si vomito durante Rande?',
    a: 'Para 30 segundos en el siguiente avituallamiento, enjuaga la boca, toma sólo unos sorbos de agua sin sal ni gel, y sigue nadando suave 5-10 min antes de retomar la nutrición. No fuerces. Un solo vómito no descarrila la travesía si después no insistes con producto fuerte.' },
  { q: '¿La edad (58 años) influye en la digestión nadando?',
    a: 'Sí. A partir de los 50 el vaciado gástrico es ~15-20% más lento que en jóvenes. Eso significa: menos margen para errores nutricionales, más tiempo de espera entre comer y nadar, y tolerancia más baja a sólidos durante el ejercicio.' },
  { q: '¿Por qué nunca probar geles nuevos el día de la travesía?',
    a: 'Cada gel tiene una osmolaridad y composición distintas. Tu intestino reacciona diferente a cada uno. Si pruebas algo nuevo el día D, te juegas un vómito por novedad. Regla absoluta: lo que tomes en Rande lo tienes que haber probado en mínimo 3 entrenos largos.' },
];

const PRODUCTS = [
  {
    name: 'NUT-GEL Lemon Energy 35g',
    sub: 'Gel energético sin cafeína',
    risk: 'low',
    risk_label: 'Riesgo bajo',
    description: 'Gel base de carbohidratos, sin cafeína. Ideal para uso continuo en travesías largas.',
    rules: ['Uno cada 30-40 min', 'Siempre con un par de tragos de agua', 'Empezar antes de tener hambre, no esperar a estar hundido'],
    rule: '✅ Tu gel base. El que más vas a usar.',
  },
  {
    name: 'NUT-GEL Strawberry Stiml Red 34ml',
    sub: 'Gel energético CON cafeína',
    risk: 'mid',
    risk_label: 'Riesgo medio',
    description: 'Gel con cafeína. La cafeína da chispa, pero acumulada acelera el intestino y puede dar diarrea.',
    rules: ['Solo en la 2ª mitad de la travesía', 'Máximo 1-2 unidades en toda la prueba', 'Nunca con el estómago revuelto'],
    rule: '⚠️ Úsalo con cabeza. La cafeína no perdona el intestino sensible.',
  },
  {
    name: '226ers Sub9 Salts Electrolytes',
    sub: 'Pastillas de sodio + electrolitos',
    risk: 'low',
    risk_label: 'Riesgo bajo',
    description: 'Aporta el sodio que necesitas para que el agua se absorba y para evitar calambres y náusea.',
    rules: ['Una pastilla cada 30-45 min', 'Siempre con agua, no sola', 'No te saltes ninguna dosis aunque no tengas sed'],
    rule: '✅ Imprescindible. Sin sodio, lo que bebes no se absorbe.',
  },
  {
    name: 'Protein Boom Cookies & Cream 49g',
    sub: 'Barrita de proteína',
    risk: 'high',
    risk_label: 'NO durante la travesía',
    description: 'La proteína retrasa el vaciado gástrico. En agua fría y a esfuerzo, es la receta clásica del vómito durante una travesía larga.',
    rules: ['❌ NO la tomes mientras nadas', '✅ Sí, después de salir del agua, para recuperar', 'Si te la dan en un avituallamiento, guárdala'],
    rule: '🔴 La organización te la da, pero esto NO es comida de travesía. Es post-meta.',
  },
];

const AVITUALLAMIENTOS = [
  { num: 1, km: 5 },
  { num: 2, km: 9 },
  { num: 3, km: 12.3 },
  { num: 4, km: 15.6 },
  { num: 5, km: 18.7 },
  { num: 6, km: 21.5 },
  { num: 7, km: 24 },
];

// ============= STATE =============
const state = {
  current_view: 'onboard-1',
  user_type: null,           // 'txifon' | 'amigo'
  onboarding_done: false,
  txifon_session_expires: 0,
  entrenos: [],              // {id, fecha, pre_done, post_done, respuestas_pre, respuestas_post, puntutxu_prepa, puntutxu_estomago, tip}
  current_entreno_id: null,
  pre_step: 0,
  post_step: 0,
  pre_answers: {},
  post_answers: {},
  plan_inputs: { duration: null, temp: null },
  chat_history: [],          // [{role, content}]
};

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem('puntutxus_state') || '{}');
    Object.assign(state, saved);
  } catch (e) {}
}

function saveState() {
  const persist = {
    user_type: state.user_type,
    onboarding_done: state.onboarding_done,
    txifon_session_expires: state.txifon_session_expires,
    entrenos: state.entrenos,
  };
  localStorage.setItem('puntutxus_state', JSON.stringify(persist));
}

function isTxifonSessionValid() {
  return state.user_type === 'txifon' && state.txifon_session_expires > Date.now();
}

// ============= ROUTING =============
function showView(name) {
  state.current_view = name;
  document.querySelectorAll('.view').forEach((el) => {
    el.classList.toggle('active', el.dataset.view === name);
  });
  // Reinicia animaciones cuando entra la vista
  if (name === 'onboard-2') {
    const coin = document.querySelector('[data-view="onboard-2"] .puntutxu-coin');
    if (coin) {
      coin.classList.remove('animate-spin-pop');
      void coin.offsetWidth;
      coin.classList.add('animate-spin-pop');
    }
  }
  window.scrollTo(0, 0);
}

// ============= ONBOARDING =============
function initOnboarding() {
  if (!state.onboarding_done) {
    showView('onboard-1');
    return;
  }
  if (state.user_type === 'txifon' && !isTxifonSessionValid()) {
    showView('onboard-3');
    return;
  }
  goHome();
}

function identify(who) {
  if (who === 'txifon') {
    showView('onboard-pw');
  } else {
    state.user_type = 'amigo';
    state.onboarding_done = true;
    saveState();
    goHome();
  }
}

let logoutArmed = false;
let logoutTimer = null;

function logout() {
  const btn = document.getElementById('logoutBtn');
  if (!logoutArmed) {
    haptic(H_ARM);
    logoutArmed = true;
    if (btn) {
      btn.textContent = 'Tócame otra vez para borrarlo todo';
      btn.classList.add('logout-armed');
    }
    logoutTimer = setTimeout(() => {
      logoutArmed = false;
      if (btn) {
        btn.textContent = 'Cerrar sesión y borrar todo';
        btn.classList.remove('logout-armed');
      }
    }, 4000);
    return;
  }
  haptic(H_COMMIT);
  clearTimeout(logoutTimer);
  // Borrar TODO: localStorage, estado en memoria, vuelve a onboarding
  localStorage.removeItem('puntutxus_state');
  state.user_type = null;
  state.onboarding_done = false;
  state.txifon_session_expires = 0;
  state.entrenos = [];
  state.chat_history = [];
  state.current_entreno_id = null;
  state.pre_step = 0;
  state.post_step = 0;
  state.pre_answers = {};
  state.post_answers = {};
  state.plan_inputs = { duration: null, temp: null };
  logoutArmed = false;
  showView('onboard-1');
}

function checkPw() {
  const v = (document.getElementById('pwInput').value || '').trim();
  if (v === TXIFON_PW) {
    state.user_type = 'txifon';
    state.txifon_session_expires = Date.now() + TXIFON_SESSION_DAYS * 86400 * 1000;
    state.onboarding_done = true;
    saveState();
    showView('onboard-howitworks');
  } else {
    document.getElementById('pwError').classList.remove('hidden');
    document.getElementById('pwInput').value = '';
  }
}

// ============= HOME =============
function goHome() {
  // Día de Rande (20 jun 2026)
  if (isRandeDay()) {
    renderRandeDay();
    showView('rande-day');
    return;
  }
  renderHome();
  showView('home');
}

function isRandeDay() {
  const now = new Date();
  return now.getFullYear() === RANDE_DATE.getFullYear() &&
         now.getMonth() === RANDE_DATE.getMonth() &&
         now.getDate() === RANDE_DATE.getDate();
}

function renderHome() {
  const total = countTotalPuntutxus();
  const counter = document.getElementById('counterNum');
  animateCount(counter, parseInt(counter.textContent || '0', 10), total, 700);

  const label = document.getElementById('counterLabel');
  label.textContent = total === 1 ? 'puntutxu' : 'puntutxus';
}

function countTotalPuntutxus() {
  return state.entrenos.reduce((acc, e) => {
    return acc + (e.puntutxu_prepa ? 1 : 0) + (e.puntutxu_estomago ? 1 : 0);
  }, 0);
}

function daysToRande() {
  const now = new Date();
  const ms = RANDE_DATE - now;
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

function animateCount(el, from, to, duration) {
  const start = performance.now();
  function tick(t) {
    const p = Math.min(1, (t - start) / duration);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(from + (to - from) * eased);
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// ============= PRE FLOW =============
function startPre() {
  state.current_entreno_id = 'e_' + Date.now();
  state.pre_answers = {};
  state.plan_inputs = { duration: null, temp: null };
  showView('plan-ask');
  initPlanAsk();
}

function initPlanAsk() {
  document.querySelectorAll('[data-view="plan-ask"] .chip').forEach((chip) => {
    chip.classList.remove('selected');
  });
  refreshPlanAskBtn();
}

function refreshPlanAskBtn() {
  const ok = state.plan_inputs.duration && state.plan_inputs.temp;
  document.getElementById('btnGetPlan').disabled = !ok;
}

async function getPlan() {
  showView('plan-result');
  const card = document.getElementById('planCard');
  card.innerHTML = '<div class="plan-loading">Pensando un plan para ti...</div>';

  const userMessage = `Voy a nadar hoy ${state.plan_inputs.duration === 'rande-sim' ? 'un simulacro de Rande' : state.plan_inputs.duration} en agua a ${state.plan_inputs.temp}°C. Dame un plan nutricional concreto: cuánto líquido por hora, cuántos geles (Lemon Energy y Strawberry Stiml Red), cuántas pastillas Sub9 Salts, qué evitar. Sé breve y muy específico, en bullets.`;

  try {
    const reply = await callLLM([{ role: 'user', content: userMessage }]);
    card.innerHTML = '';
    card.textContent = reply;
  } catch (e) {
    card.innerHTML = '<div class="plan-loading">No he podido generar el plan. Sigue al cuestionario.</div>';
    console.error(e);
  }
}

function continueToPreFromPlan() {
  state.pre_step = 0;
  showView('pre');
  renderPreStep();
}

function skipPlan() {
  state.pre_step = 0;
  showView('pre');
  renderPreStep();
}

function renderPreStep() {
  const stack = document.getElementById('preStack');
  const total = PRE_QUESTIONS.length;
  const i = state.pre_step;
  if (i >= total) {
    finishPre();
    return;
  }
  const q = PRE_QUESTIONS[i];
  const lastSection = i > 0 ? PRE_QUESTIONS[i - 1].section : null;
  const sectionHeader = q.section !== lastSection ? `<h3 style="color: var(--c-text-dim); font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em;">${q.section}</h3>` : '';
  stack.innerHTML = `
    ${sectionHeader}
    <div class="q-card">
      <div class="q-text">${q.text}</div>
      ${q.hint ? `<div class="q-hint">${q.hint}</div>` : ''}
      <div class="yn-buttons">
        <button class="yn-btn yn-no" data-yn="no">No</button>
        <button class="yn-btn yn-yes" data-yn="yes">Sí</button>
      </div>
    </div>
  `;
  stack.querySelectorAll('.yn-btn').forEach((btn) => {
    btn.addEventListener('click', () => answerPre(q.id, btn.dataset.yn));
  });
  document.querySelector('#preProgress .progress-bar').style.width = `${(i / total) * 100}%`;
}

function answerPre(id, yn) {
  haptic(H_YN);
  state.pre_answers[id] = yn;
  state.pre_step += 1;
  setTimeout(renderPreStep, 100);
}

function finishPre() {
  // Guardar entreno con PRE completo
  const entreno = {
    id: state.current_entreno_id,
    fecha: new Date().toISOString(),
    pre_done: true,
    post_done: false,
    respuestas_pre: { ...state.pre_answers },
    respuestas_post: null,
    puntutxu_prepa: scorePrepa(state.pre_answers),
    puntutxu_estomago: false,
    tip: null,
  };
  state.entrenos.unshift(entreno);
  saveState();
  showResult(entreno, /* fromPre */ true);
}

function scorePrepa(answers) {
  for (const q of PRE_QUESTIONS) {
    if (q.noScore) continue;
    if (q.good === '*') continue;
    if (answers[q.id] !== q.good) return false;
  }
  return true;
}

// ============= POST FLOW =============
function startPost() {
  // Buscar último entreno con PRE done y POST not done
  const pending = state.entrenos.find((e) => e.pre_done && !e.post_done);
  if (pending) {
    state.current_entreno_id = pending.id;
  } else {
    // Crear entreno nuevo solo POST
    const entreno = {
      id: 'e_' + Date.now(),
      fecha: new Date().toISOString(),
      pre_done: false,
      post_done: false,
      respuestas_pre: null,
      respuestas_post: null,
      puntutxu_prepa: false,
      puntutxu_estomago: false,
      tip: null,
    };
    state.entrenos.unshift(entreno);
    state.current_entreno_id = entreno.id;
    saveState();
  }
  state.post_answers = {};
  state.post_step = 0;
  showView('post');
  renderPostStep();
}

function renderPostStep() {
  const stack = document.getElementById('postStack');
  const total = POST_QUESTIONS.length;
  const i = state.post_step;
  if (i >= total) {
    finishPost();
    return;
  }
  const q = POST_QUESTIONS[i];
  stack.innerHTML = `
    <div class="q-card">
      <div class="q-text">${q.text}</div>
      ${q.hint ? `<div class="q-hint">${q.hint}</div>` : ''}
      <div class="yn-buttons">
        <button class="yn-btn yn-no" data-yn="no">No</button>
        <button class="yn-btn yn-yes" data-yn="yes">Sí</button>
      </div>
    </div>
  `;
  stack.querySelectorAll('.yn-btn').forEach((btn) => {
    btn.addEventListener('click', () => answerPost(q.id, btn.dataset.yn));
  });
  document.querySelector('#postProgress .progress-bar').style.width = `${(i / total) * 100}%`;
}

function answerPost(id, yn) {
  haptic(H_YN);
  state.post_answers[id] = yn;
  state.post_step += 1;
  setTimeout(renderPostStep, 100);
}

function finishPost() {
  const entreno = state.entrenos.find((e) => e.id === state.current_entreno_id);
  if (!entreno) return;
  entreno.post_done = true;
  entreno.respuestas_post = { ...state.post_answers };
  entreno.puntutxu_estomago = scoreEstomago(state.post_answers);
  saveState();
  showResult(entreno, /* fromPre */ false);
}

function scoreEstomago(answers) {
  return answers.post_vomito === 'no' && answers.post_intestino === 'yes';
}

// ============= RESULT =============
function showResult(entreno, fromPre) {
  const coins = (entreno.puntutxu_prepa ? 1 : 0) + (entreno.puntutxu_estomago ? 1 : 0);
  const totalPossible = fromPre ? 1 : (entreno.pre_done ? 2 : 1);

  const coinsEl = document.getElementById('resultCoins');
  coinsEl.innerHTML = '';
  if (coins === 0) {
    coinsEl.innerHTML = '<div style="font-size: 70px;">🥲</div>';
  } else {
    for (let i = 0; i < coins; i++) {
      coinsEl.appendChild(makeCoinSvg(i * 200));
    }
    // Vibración al ganar puntutxu(s) — pattern más fuerte si son 2
    setTimeout(() => haptic(coins === 2 ? [60, 60, 80, 60, 110] : H_COIN), 600);
  }

  const titleEl = document.getElementById('resultTitle');
  const msgEl = document.getElementById('resultMessage');
  const tipEl = document.getElementById('resultTip');

  let title, message;

  if (fromPre) {
    if (entreno.puntutxu_prepa) {
      title = '+1 puntutxu';
      message = 'Has preparado bien la nutri. Ahora a nadar y a cuidar el intestino.';
    } else {
      title = '0 puntutxus de prepa';
      message = 'La preparación no ha estado fina. Mira el tip y aprende para la próxima.';
    }
  } else {
    if (coins === 2) {
      title = '+2 puntutxus';
      message = 'Aupa Txifon. Vas a triunfar.';
    } else if (coins === 1 && entreno.puntutxu_prepa) {
      title = '+1 puntutxu';
      message = 'La prepa estuvo. El estómago aún no se ha enterado del plan.';
    } else if (coins === 1 && entreno.puntutxu_estomago) {
      title = '+1 puntutxu';
      message = 'Cero mérito en la prepa pero el intestino aguantó. Suerte de campeón.';
    } else {
      title = '0 puntutxus';
      message = 'Día duro. Mañana otra oportunidad.';
    }
  }

  titleEl.textContent = title;
  msgEl.textContent = message;

  // Tip personalizado
  const tip = buildTip(entreno);
  if (tip) {
    tipEl.innerHTML = `<b>Tip</b>${tip}`;
    entreno.tip = tip;
    saveState();
  } else {
    tipEl.innerHTML = '';
  }

  showView('result');
}

function buildTip(entreno) {
  const tips = [];
  const a = entreno.respuestas_pre || {};
  const p = entreno.respuestas_post || {};

  if (a.cena_grasa === 'yes') tips.push('La grasa en la cena retrasa el vaciado gástrico hasta 12h después. Mañana nada de fritos ni embutido.');
  if (a.cena_fibra === 'yes') tips.push('Fibra en la cena = gases mañana en el agua. Sustituye ensalada/legumbres por arroz blanco o patata.');
  if (a.cena_alcohol === 'yes') tips.push('El alcohol deshidrata e irrita el estómago. Mínimo 24h sin nada antes de un entreno largo.');
  if (a.des_lacteos === 'yes') tips.push('Los lácteos suelen dar gases nadando. Prueba bebida vegetal sin azúcar añadido.');
  if (a.des_grasa === 'yes' || a.des_fibra === 'yes') tips.push('Desayuno: tostada blanca con miel o mermelada. Sin grasa, sin fibra.');
  if (a.des_2h === 'yes') tips.push('Necesitas mínimo 3h entre el desayuno y meterte al agua. Adelanta la hora del desayuno mañana.');
  if (a.dur_solidos === 'yes') tips.push('Sólidos durante una travesía en frío = receta del vómito. Solo gel y bebida.');
  if (a.dur_sodio === 'no') tips.push('Sin sodio el agua que tomas no se absorbe. Una pastilla Sub9 Salts cada 30-45 min.');
  if (a.dur_sorbos === 'no') tips.push('Tragos grandes en frío y vertical = vómito casi seguro. Sorbos pequeños y frecuentes.');
  if (a.dur_nuevo === 'yes') tips.push('Probar producto nuevo el día D es ruleta rusa. Cualquier gel debes probarlo en mínimo 3 entrenos antes.');
  if (a.dur_cafe === 'yes' && (p.post_vomito === 'yes' || p.post_intestino === 'no')) {
    tips.push('Hoy combinaste café e intestino mal. Apunta el patrón, igual a ti la cafeína te juega malas pasadas.');
  }
  if (p.post_pedos === 'yes' && a.des_lacteos === 'yes') tips.push('Pedos + lácteos en desayuno: clarísimo culpable.');

  if (tips.length === 0) return '';
  return tips.slice(0, 2).join(' ');
}

function makeCoinSvg(delay) {
  const wrap = document.createElement('div');
  wrap.className = 'coin-anim';
  // Cada moneda con un retraso distinto para que caigan en cascada
  wrap.style.animationDelay = `${delay}ms, ${delay + 1200}ms`;
  wrap.innerHTML = `
    <svg viewBox="0 0 100 100">
      <defs>
        <radialGradient id="goldGrad-${delay}" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#fff5b8"/>
          <stop offset="40%" stop-color="#ffd34d"/>
          <stop offset="100%" stop-color="#b78700"/>
        </radialGradient>
        <clipPath id="coinClip-${delay}">
          <circle cx="50" cy="50" r="46"/>
        </clipPath>
      </defs>
      <circle cx="50" cy="50" r="46" fill="url(#goldGrad-${delay})" stroke="#8a6500" stroke-width="2"/>
      <g clip-path="url(#coinClip-${delay})" opacity="0.18">
        <path d="M0 70 Q15 60, 30 70 T60 70 T90 70 T120 70 L120 100 L0 100 Z" fill="#063562"/>
      </g>
      <text x="50" y="64" font-family="Inter, sans-serif" font-size="46" font-weight="900" fill="#063562" text-anchor="middle">+1</text>
    </svg>
  `;
  return wrap;
}

// ============= SHARE =============
function shareLast() {
  const total = countTotalPuntutxus();
  const days = daysToRande();
  const last = state.entrenos[0];
  const won = last ? (last.puntutxu_prepa ? 1 : 0) + (last.puntutxu_estomago ? 1 : 0) : 0;
  const text = `Acabo de ganar ${won} puntutxu${won !== 1 ? 's' : ''}. Llevo ${total} en total. ${days >= 0 ? `Faltan ${days} días para Rande.` : ''} 🌊\n\nhttps://puntutxus.com`;
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

// ============= CHAT (LLM) =============
function openChat() {
  showView('chat');
  if (state.chat_history.length === 0) {
    const msg = state.user_type === 'txifon'
      ? 'Aupa Txifon. ¿En qué te ayudo? Pregúntame lo que quieras de nutrición, geles, hidratación o Rande.'
      : 'Aupa. Soy el asistente nutricional de Txifon. Pregúntame lo que quieras de nutrición en aguas abiertas.';
    appendChatMsg('asst', msg);
  }
}

function appendChatMsg(role, text) {
  const list = document.getElementById('chatList');
  const div = document.createElement('div');
  div.className = `msg msg-${role}`;
  div.textContent = text;
  list.appendChild(div);
  list.scrollTop = list.scrollHeight;
  return div;
}

async function sendChatMessage(text) {
  if (!text.trim()) return;
  state.chat_history.push({ role: 'user', content: text });
  appendChatMsg('user', text);

  const thinkingMsg = appendChatMsg('asst', 'Pensando...');
  thinkingMsg.classList.add('thinking');

  try {
    const reply = await callLLM(state.chat_history);
    thinkingMsg.classList.remove('thinking');
    thinkingMsg.textContent = reply;
    state.chat_history.push({ role: 'assistant', content: reply });
  } catch (e) {
    thinkingMsg.classList.remove('thinking');
    thinkingMsg.textContent = 'No he podido contestar ahora mismo. Prueba en un minuto.';
    console.error(e);
  }
}

async function callLLM(messages) {
  const res = await fetch(WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });
  if (!res.ok) throw new Error(`Worker ${res.status}`);
  const data = await res.json();
  return data.reply || '';
}

// ============= VOICE =============
function setupVoice() {
  const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Rec) {
    document.getElementById('micBtn').style.display = 'none';
    return;
  }
  const rec = new Rec();
  rec.lang = 'es-ES';
  rec.continuous = false;
  rec.interimResults = false;
  let recording = false;
  const btn = document.getElementById('micBtn');

  btn.addEventListener('click', () => {
    if (recording) { rec.stop(); return; }
    try { rec.start(); } catch (e) {}
  });

  rec.addEventListener('start', () => { recording = true; btn.classList.add('recording'); });
  rec.addEventListener('end',   () => { recording = false; btn.classList.remove('recording'); });
  rec.addEventListener('result', (e) => {
    const text = e.results[0][0].transcript;
    const input = document.getElementById('chatInput');
    input.value = text;
    input.focus();
  });
}

// ============= FAQ =============
function renderFaq() {
  const list = document.getElementById('faqList');
  list.innerHTML = FAQ.map((item, i) => `
    <div class="faq-item" data-idx="${i}">
      <button class="faq-q">${item.q}</button>
      <div class="faq-a">${item.a}</div>
    </div>
  `).join('');
  list.querySelectorAll('.faq-item').forEach((it) => {
    it.querySelector('.faq-q').addEventListener('click', () => it.classList.toggle('open'));
  });
}

// ============= PRODUCTS =============
function renderProducts() {
  const list = document.getElementById('productsList');
  list.innerHTML = PRODUCTS.map((p) => `
    <div class="product-card risk-${p.risk}">
      <div class="product-name">${p.name}</div>
      <div style="font-size: 13px; color: var(--c-text-dim);">${p.sub}</div>
      <span class="product-tag">${p.risk_label}</span>
      <p>${p.description}</p>
      <ul>${p.rules.map((r) => `<li>${r}</li>`).join('')}</ul>
      <div class="product-rule">${p.rule}</div>
    </div>
  `).join('');
}

// ============= RANDE =============
function renderRandeAvitu() {
  const wrap = document.getElementById('avituPoints');
  const html = AVITUALLAMIENTOS.map((a) =>
    `<div class="avitu-pt"><b>km ${a.km}</b><span>Avituallamiento ${a.num}</span></div>`
  ).join('') + `<div class="avitu-pt meta"><b>km 27</b><span>🏁 META</span></div>`;
  wrap.innerHTML = html;
}

// ============= HISTORY =============
function renderHistory() {
  const list = document.getElementById('historyList');
  if (state.entrenos.length === 0) {
    list.innerHTML = '<div class="history-empty">Aún no hay entrenos. Pulsa "Voy a nadar" en la home.</div>';
    return;
  }
  list.innerHTML = state.entrenos.map((e) => {
    const d = new Date(e.fecha);
    const fechaStr = d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
    const horaStr = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const won = (e.puntutxu_prepa ? 1 : 0) + (e.puntutxu_estomago ? 1 : 0);
    const status = e.pre_done && e.post_done ? 'completo' : (e.pre_done ? 'sin cerrar' : 'solo post');
    return `
      <div class="history-item" data-id="${e.id}">
        <div class="history-meta">
          <div class="history-date">${fechaStr} · ${horaStr}</div>
          <div class="history-pts"><span class="gold">${won} puntutxu${won !== 1 ? 's' : ''}</span> · ${status}</div>
        </div>
        <button class="history-del" data-id="${e.id}" aria-label="Borrar">🗑</button>
      </div>
    `;
  }).join('');
  // Tap-to-confirm pattern: 1st tap muestra "Confirmar", 2º tap borra. Se resetea a los 3s.
  list.querySelectorAll('.history-del').forEach((btn) => {
    let armed = false;
    let timer = null;
    btn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      if (!armed) {
        haptic(H_ARM);
        armed = true;
        btn.textContent = '¿Seguro?';
        btn.classList.add('history-del-armed');
        timer = setTimeout(() => {
          armed = false;
          btn.textContent = '🗑';
          btn.classList.remove('history-del-armed');
        }, 3000);
      } else {
        haptic(H_COMMIT);
        clearTimeout(timer);
        const id = btn.dataset.id;
        state.entrenos = state.entrenos.filter((e) => e.id !== id);
        saveState();
        renderHistory();
      }
    });
  });
}

// ============= RANDE DAY =============
function renderRandeDay() {
  const total = countTotalPuntutxus();
  document.getElementById('rdCounter').textContent = total;
}

// ============= EVENT WIRING =============
function wireEvents() {
  document.body.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    // Haptic por tipo de acción
    if (['start-pre', 'start-post', 'get-plan', 'continue-to-pre', 'rd-go', 'check-pw', 'identify'].includes(action)) {
      haptic(H_TAP);
    } else if (['onboard-next', 'onboard-done', 'open-menu', 'open-qe', 'open-faq', 'open-products', 'open-rande', 'open-history', 'open-chat', 'home', 'back-to-identify', 'skip-plan', 'rd-after', 'result-share'].includes(action)) {
      haptic(H_TAP);
    }
    switch (action) {
      case 'onboard-next':
        showView(btn.dataset.next);
        break;
      case 'identify':
        identify(btn.dataset.who);
        break;
      case 'check-pw':
        checkPw();
        break;
      case 'back-to-identify':
        showView('onboard-3');
        break;
      case 'onboard-done':
        goHome();
        break;
      case 'home':
        goHome();
        break;
      case 'open-qe':
        showView('qe');
        break;
      case 'open-menu':
        showView('menu');
        break;
      case 'logout':
        logout();
        break;
      case 'start-pre':
        startPre();
        break;
      case 'start-post':
        startPost();
        break;
      case 'get-plan':
        getPlan();
        break;
      case 'skip-plan':
        skipPlan();
        break;
      case 'continue-to-pre':
        continueToPreFromPlan();
        break;
      case 'open-chat':
        openChat();
        break;
      case 'open-faq':
        renderFaq(); showView('faq');
        break;
      case 'open-products':
        renderProducts(); showView('products');
        break;
      case 'open-rande':
        renderRandeAvitu(); showView('rande');
        break;
      case 'open-history':
        renderHistory(); showView('history');
        break;
      case 'result-share':
        shareLast();
        break;
      case 'rd-go':
        startPre();
        break;
      case 'rd-after':
        startPost();
        break;
    }
  });

  // chip group selection
  document.body.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    const group = chip.closest('.chip-group');
    if (!group) return;
    group.querySelectorAll('.chip').forEach((c) => c.classList.remove('selected'));
    chip.classList.add('selected');
    const field = group.dataset.field;
    if (field) {
      state.plan_inputs[field] = chip.dataset.value;
      refreshPlanAskBtn();
    }
  });

  // pw input — enter
  document.getElementById('pwInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') checkPw();
  });

  // chat form
  document.getElementById('chatForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    sendChatMessage(text);
  });
}

// ============= INIT =============
loadState();
wireEvents();
setupVoice();
initOnboarding();
