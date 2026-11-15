/* ============ APLICAȚIA: stare, ecrane, acțiuni ============ */

const LS_KEY = 'fisa-antrenament.v2'; /* nume intern vechi, păstrat ca datele salvate să rămână */
const APP_VERSION = '2.6';
const ACCENTS = {rust: ['#DB7440', '#7A3F1E'], teal: ['#4FB3A2', '#235B52'], violet: ['#A488E6', '#4E3C86'], rose: ['#E0708F', '#7E3550']};
const GOALS = {masa: 'Masă musculară', ton: 'Tonifiere și formă', slab: 'Slăbire'};
const FOCUS = {echilibrat: 'Echilibrat, tot corpul', inferior: 'Accent pe fesieri și picioare', superior: 'Accent pe partea superioară'};
const UNI = {bulgarian: 1, lunge: 1, stepup: 1, kickback: 1, dbrow: 1};

let S = null, storageOK = true;
try { const raw = localStorage.getItem(LS_KEY); if (raw) S = JSON.parse(raw); } catch (e) { storageOK = false; }
if (!S || typeof S !== 'object' || !S.profiles) S = {v: 2, active: null, profiles: {}};
if (!S.profiles[S.active]) S.active = Object.keys(S.profiles)[0] || null;

function save() {
  try { localStorage.setItem(LS_KEY, JSON.stringify(S)); }
  catch (e) { storageOK = false; const b = $('#banner'); if (b) b.hidden = false; }
}

const $ = (s, r) => (r || document).querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const P = () => S.profiles[S.active] || null;
const TODAY = () => ymd();
const fmtD = (s, o) => parseYmd(s).toLocaleDateString('ro-RO', o || {day: 'numeric', month: 'short'});
const fmtK = n => Math.round(n).toLocaleString('ro-RO');
const ui = {tab: 'train', day: null, open: null, meal: null, form: null, hist: null, lastDate: ymd(), sy: 0, ask: null};
/* elementele de listă apăsabile se pot folosi și de la tastatură / cititor de ecran */
const TAP = ' role="button" tabindex="0"';

function normProfile(p) {
  p.swaps = p.swaps || {}; p.sessions = p.sessions || []; p.bw = p.bw || []; p.food = p.food || {};
  const keys = Object.keys(p.food).sort();
  keys.slice(0, Math.max(0, keys.length - 45)).forEach(k => delete p.food[k]);
  return p;
}
Object.values(S.profiles).forEach(normProfile);

/* ---------- ședințe ---------- */
const hasOk = s => Object.keys(s.sets || {}).some(id => okSets(s, id).length);
function findSession(p, d, i) { return p.sessions.find(s => s.d === d && s.i === i) || null; }
function ensureSession(p, d, day) {
  let s = findSession(p, d, day.i);
  if (!s) { s = {d, i: day.i, k: day.k, n: day.name, sets: {}}; p.sessions.push(s); p.sessions.sort((a, b) => (a.d < b.d ? -1 : a.d > b.d ? 1 : 0)); }
  return s;
}
/* Data antrenamentului: un antrenament început înainte de miezul nopții și încă deschis (ultimul set bifat
   acum mai puțin de 3 ore) continuă pe data lui, ca seturile să nu se rupă în două ședințe. */
function trainDate(p) {
  const t = TODAY(); p = p || P(); if (!p) return t;
  const now = Date.now(), open = p.sessions.filter(s => s.d < t && !s.done && s.t1 && now - s.t1 < 3 * 3600000 && hasOk(s)).pop();
  return open ? open.d : t;
}
function nextDay(p, prog, today) {
  const ss = p.sessions;
  const cur = ss.filter(s => s.d === today && !s.done && hasOk(s) && s.i < 100).pop();
  if (cur) return cur.i % prog.length;
  for (let i = ss.length - 1; i >= 0; i--) if (hasOk(ss[i]) && ss[i].i < 100) return (ss[i].i + 1) % prog.length;
  return 0;
}
function sesVolume(s) { let v = 0; Object.keys(s.sets).forEach(id => { if (EX[id] && EX[id].k !== 't' && !EX[id].assist) okSets(s, id).forEach(x => { v += (x.w || 0) * x.r; }); }); return v; }
function sesSetCount(s) { return Object.keys(s.sets).reduce((n, id) => n + okSets(s, id).length, 0); }
function weekDates(p, today) {
  const mon = mondayOf(today), set = {};
  p.sessions.forEach(s => { if (hasOk(s) && mondayOf(s.d) === mon) set[s.d] = 1; });
  return Object.keys(set).length;
}
function bestBefore(p, id, before) {
  let best = 0;
  p.sessions.forEach(s => { if (s.d < before) okSets(s, id).forEach(x => { best = Math.max(best, score(id, x)); }); });
  return best;
}

/* ---------- afișare ---------- */
function applyAccent(p) {
  const a = ACCENTS[p && p.accent] || ACCENTS.rust;
  document.documentElement.style.setProperty('--accent', a[0]);
  document.documentElement.style.setProperty('--accent-dim', a[1]);
}
function render() {
  const p = P(), app = $('#app');
  $('#banner').hidden = storageOK;
  if (!p || ui.form) {
    if (!ui.form) ui.form = {mode: 'new', d: {accent: 'rust', meals: 0}};
    applyAccent(ui.form.d);
    $('#tabs').hidden = true;
    app.innerHTML = vForm();
    return;
  }
  applyAccent(p);
  $('#tabs').hidden = false;
  document.querySelectorAll('#tabs button').forEach(b => { const on = b.dataset.tab === ui.tab; b.classList.toggle('on', on); if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
  const title = {train: 'Antrenament', food: 'Nutriție', prog: 'Progres', me: 'Profil'}[ui.tab];
  const dateTxt = new Date().toLocaleDateString('ro-RO', {weekday: 'long', day: 'numeric', month: 'long'});
  app.innerHTML = '<header class="top"><div><div class="eyebrow">' + esc(dateTxt) + '</div><h1>' + title + '</h1></div>' +
    '<button class="avatar" data-act="profiles" aria-label="Schimbă profilul">' + esc(p.name.charAt(0).toUpperCase()) + '</button></header>' +
    (ui.tab === 'train' ? vTrain(p) : ui.tab === 'food' ? vFood(p) : ui.tab === 'prog' ? vProg(p) : vMe(p));
  ANIM.scan();
}
function rerender() { const y = window.scrollY; render(); window.scrollTo(0, y); }

function plates(done, total) {
  let h = '<div class="plates">';
  for (let i = 0; i < Math.max(total, done); i++) h += '<span class="plate' + (i < done ? ' on' : '') + '"></span>';
  return h + '</div>';
}

/* ---------- ANTRENAMENT ---------- */
function dayMuscles(day) { return ANIM.dayMuscles(day.ex.map(x => x.id)); }
function dayMins(day) { return Math.round(day.ex.reduce((n, x) => n + x.sets * (restFor(x.id) + 45), 0) / 60 + 8); }
function libCat(k) { return LIB.find(c => c.k.includes(k)) || LIB[0]; }
function musChips(m, maxP, maxS) { return '<div class="mus">' + m.p.slice(0, maxP).map(k => '<span class="mu p">' + ANIM.MN[k] + '</span>').join('') + m.s.slice(0, maxS).map(k => '<span class="mu s">' + ANIM.MN[k] + '</span>').join('') + '</div>'; }
function ring(done, total, label) {
  const C = 2 * Math.PI * 22, fr = total ? clamp(done / total, 0, 1) : 0;
  return '<div class="pring"><svg viewBox="0 0 54 54" aria-hidden="true"><circle cx="27" cy="27" r="22" class="pr-bg"/><circle cx="27" cy="27" r="22" class="pr-fg" stroke-dasharray="' + (fr * C).toFixed(1) + ' ' + C.toFixed(1) + '" transform="rotate(-90 27 27)"' + (fr ? '' : ' opacity="0"') + '/></svg><span><em><b>' + done + '</b>/' + total + '</em><small>' + label + '</small></span></div>';
}
function sesDone(ses, day) { return ses ? day.ex.reduce((n, x) => n + Math.min(x.sets, okSets(ses, x.id).length), 0) : 0; }
function vTrain(p) {
  const prog = program(p), today = trainDate(p);
  if (ui.day == null || (ui.day < 100 && ui.day >= prog.length)) {
    /* antrenamentul ales azi din bibliotecă rămâne ales și dacă telefonul închide aplicația;
       dacă azi s-a lucrat deja, rămâi pe antrenamentul de azi; altfel arată ziua care urmează în rotație */
    const pk = p.pick && p.pick.d === today && LIBK[p.pick.i - 100] ? p.pick.i : null;
    const mine = p.sessions.filter(s => s.d === today && hasOk(s) && (s.i < prog.length || s.i >= 100)).pop();
    ui.day = pk != null ? pk : mine ? mine.i : nextDay(p, prog, today);
  }
  const nd = nextDay(p, prog, today), day = dayByIndex(p, ui.day), ses = findSession(p, today, day.i), wk = weekDates(p, today);
  const total = day.ex.reduce((n, x) => n + x.sets, 0), done = sesDone(ses, day), mins = dayMins(day);
  const nextEx = day.ex.find(x => !ses || okSets(ses, x.id).length < x.sets);
  const status = ses && ses.done ? 'Încheiat azi' : done ? 'În desfășurare' : day.i === nd ? 'Azi' : 'Ales de tine';
  const where = day.lib ? libCat(day.k).n : 'ziua ' + (day.i + 1) + ' din ' + prog.length;
  let h = '<section class="hero"><div class="hero-top"><div><div class="eyebrow">' + status + ' · ' + esc(where) + '</div><h2>' + esc(day.name) + '</h2></div>' + ring(done, total, 'seturi') + '</div>' +
    '<div class="hero-body">' + ANIM.bodyMap(dayMuscles(day)) + musChips(dayMuscles(day), 4, 2) + '</div>' +
    '<div class="hero-stats"><span><b>' + day.ex.length + '</b> exerciții</span><span><b>' + total + '</b> seturi</span><span><b>~' + mins + '</b> minute</span></div>' +
    (ses && ses.done ? '<div class="hero-done"><span>✓ ' + sesSetCount(ses) + ' seturi · ' + fmtK(sesVolume(ses)) + ' kg volum</span><button class="btn small ghost" data-act="reopen">Redeschide</button></div>'
      : nextEx ? '<button class="btn big" data-act="start">' + (done ? 'Continuă: ' + esc(EX[nextEx.id].n) : 'Începe antrenamentul') + '</button>'
      : '<button class="btn big" data-act="finish">Încheie antrenamentul</button>') +
    (done ? '' : '<button class="linkbtn" data-act="picker"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h13l-3-3M20 17H7l3 3"/></svg>Vreau alt antrenament azi</button>') + '</section>';
  if (day.lib && libCat(day.k).id === 'bro') h += '<section class="card note"><b>Antrenament pe grupe</b><p>Aici fiecare grupă e lucrată o dată pe săptămână. Ca să crești la fel de bine ca în program, fă în aceeași săptămână și celelalte zile: piept și triceps, spate și biceps, umeri și brațe, picioare.</p></section>';
  h += '<section class="card week"><div><b>' + wk + ' din ' + p.days + '</b> antrenamente săptămâna aceasta<small>' + (wk >= p.days ? 'Ținta săptămânii este atinsă.' : 'Program sugerat: ' + WEEKPLAN[p.days]) + '</small></div>' + plates(wk, p.days) + '</section>';

  const from = p.deload || p.created, weeks = {};
  p.sessions.forEach(s => { if (s.d > from && hasOk(s)) weeks[mondayOf(s.d)] = 1; });
  if (Object.keys(weeks).length >= 7) h += '<section class="card note warn"><b>E timpul pentru o săptămână ușoară</b><p>Ai strâns 7 săptămâni de antrenament. Săptămâna aceasta fă aceleași exerciții cu un set mai puțin și cu greutăți cu 10-20% mai mici. Corpul se reface și revii mai puternic.</p><button class="btn small" data-act="deload">Am înțeles, repornește numărătoarea</button></section>';

  h += '<h3 class="sec">Programul tău</h3><div class="chips">' +
    (day.lib ? '<button class="chip on" data-act="picker"><b>Ales azi</b><span>' + esc(day.name) + '</span><i>schimbă</i></button>' : '') +
    prog.map(d => '<button class="chip' + (d.i === ui.day ? ' on' : '') + '" data-act="day" data-i="' + d.i + '"><b>Ziua ' + (d.i + 1) + '</b><span>' + esc(d.name) + '</span>' + (d.i === nd ? '<i>urmează</i>' : '') + '</button>').join('') +
    '<button class="chip more" data-act="picker"><b>Altceva</b><span>Toate antrenamentele</span><i>+</i></button></div>';
  if (!p.sessions.some(hasOk)) h += '<section class="card note"><b>Cum funcționează</b><p>Începe cu 5-8 minute de încălzire ușoară (bandă, bicicletă). Apasă pe un exercițiu: vezi mișcarea animată și mușchii lucrați, scrii greutatea și repetările, apoi bifezi setul. Cronometrul de pauză pornește singur. Dacă azi vrei altceva decât programul, alege din „Altceva”.</p></section>';
  h += '<h3 class="sec">Exercițiile zilei</h3>' + day.ex.map(ex => vExercise(p, ex, ses, today, nextEx)).join('');

  if (ses && hasOk(ses) && !ses.done && nextEx) h += '<button class="btn big ghost" data-act="finish">Încheie antrenamentul</button>';
  if (targets(p).goal === 'slab') h += '<section class="card note"><b>Pentru slăbire</b><p>Greutățile rămân la fel de grele ca la masă musculară: ele îți păstrează mușchii. Adaugă 8.000-10.000 de pași pe zi și, dacă vrei, 20-30 de minute de mers alert după antrenament.</p></section>';
  return h;
}

/* fereastra „Ce lucrezi azi?”: programul tău + toată biblioteca, pe categorii */
function vPicker(p) {
  const prog = program(p), nd = nextDay(p, prog, TODAY()), order = LIB_ORDER[p.sex] || LIB_ORDER.m;
  const card = (d, badge) => {
    const m = dayMuscles(d);
    return '<button class="wcard' + (d.i === ui.day ? ' on' : '') + '" data-act="pickday" data-i="' + d.i + '">' + ANIM.bodyMap(m) +
      '<span class="wtxt">' + (badge ? '<i class="badge">' + badge + '</i>' : '') + '<b>' + esc(d.name) + '</b><small>' + m.p.slice(0, 3).map(k => ANIM.MN[k]).join(' · ') + '</small><em>' + d.ex.length + ' exerciții · ~' + dayMins(d) + ' min</em></span></button>';
  };
  let h = '<h3>Ce lucrezi azi?</h3><p class="fine">Alege orice antrenament. Greutățile și recordurile se păstrează pe fiecare exercițiu, indiferent de ziua în care îl faci.</p>' +
    '<div class="jumps"><button data-act="jump" data-to="pk-prog">Programul tău</button>' + order.map(id => '<button data-act="jump" data-to="pk-' + id + '">' + LIB.find(c => c.id === id).n + '</button>').join('') + '</div>' +
    '<section class="pk" id="pk-prog"><h4>Programul tău</h4><p class="fine">' + esc(FOCUS[p.focus]) + ' · ' + p.days + ' zile pe săptămână</p><div class="wgrid">' +
    prog.map(d => card(d, d.i === nd ? 'urmează' : '')).join('') + '</div></section>';
  order.forEach((id, n) => {
    const c = LIB.find(x => x.id === id);
    h += '<section class="pk" id="pk-' + id + '"><h4>' + c.n + (n === 0 ? ' <i class="badge">potrivit pentru tine</i>' : '') + '</h4><p class="fine">' + c.d + '</p><div class="wgrid">' +
      c.k.map(k => card(dayByIndex(p, dayIndexFor(p, k)))).join('') + '</div></section>';
  });
  return h + '<button class="btn ghost big" data-act="closesheet">Închide</button>';
}

function vExercise(p, ex, ses, today, nextEx) {
  const e = EX[ex.id], rows = (ses && ses.sets[ex.id]) || [], done = rows.filter(s => s && s.ok).length;
  const n = Math.max(ex.sets, rows.length), open = ui.open === ex.id, isNext = !!(nextEx && nextEx.id === ex.id && !(ses && ses.done));
  const target = ex.sets + ' × ' + ex.reps + (e.k === 't' ? ' sec' : UNI[ex.id] ? ' pe parte' : '');
  let h = '<section class="ex' + (open ? ' open' : '') + (done >= ex.sets ? ' complete' : '') + (isNext ? ' next' : '') + '" id="ex-' + ex.id + '">' +
    '<button class="ex-head" data-act="ex" data-id="' + ex.id + '" aria-expanded="' + open + '">' + ANIM.thumb(ex.id) +
    '<span class="ex-txt">' + (isNext && !open ? '<i class="nx">' + (ses && hasOk(ses) ? 'Urmează' : 'Începe aici') + '</i>' : '') + '<b>' + esc(e.n) + '</b><small>' + esc(e.m) + '</small><small class="tgt">' + target + '</small></span><span class="ring">' + (done >= ex.sets ? '✓' : done + '/' + ex.sets) + '</span></button>';
  if (!open) return h + '</section>';
  const sg = suggest(p, ex, today);
  h += '<div class="ex-body">' + ANIM.html(ex.id, e.n) + '<p class="sug">' + esc(sg.text) + '</p><div class="sets">';
  for (let j = 0; j < n; j++) {
    const r = rows[j] || {}, ok = r.ok ? ' ok' : '';
    const attrs = ' data-in="set" data-id="' + ex.id + '" data-j="' + j + '"';
    if (e.k === 't') h += '<div class="set' + ok + '"><span class="sn">' + (j + 1) + '</span><input class="in"' + attrs + ' data-f="r" inputmode="numeric" autocomplete="off" aria-label="Secunde, setul ' + (j + 1) + '" value="' + (r.r != null ? r.r : '') + '" placeholder="' + (sg.r || 30) + '"><span class="unit">sec</span><button class="chk" data-act="chk" data-id="' + ex.id + '" data-j="' + j + '" aria-label="Set făcut">✓</button></div>';
    else h += '<div class="set' + ok + '"><span class="sn">' + (j + 1) + '</span><input class="in"' + attrs + ' data-f="w" inputmode="decimal" autocomplete="off" aria-label="Greutate în kg, setul ' + (j + 1) + '" value="' + (r.w != null ? fmtN(r.w) : '') + '" placeholder="' + (sg.w != null ? fmtN(sg.w) : e.bw ? '0' : 'kg') + '"><span class="unit">kg ×</span><input class="in"' + attrs + ' data-f="r" inputmode="numeric" autocomplete="off" aria-label="Repetări, setul ' + (j + 1) + '" value="' + (r.r != null ? r.r : '') + '" placeholder="' + (sg.r || repRange(ex.reps)[0]) + '"><span class="unit">rep</span><button class="chk" data-act="chk" data-id="' + ex.id + '" data-j="' + j + '" aria-label="Set făcut">✓</button></div>';
  }
  const after = done >= ex.sets && nextEx && nextEx.id !== ex.id && !(ses && ses.done);
  h += '</div>' + (after ? '<button class="btn big next-btn" data-act="start">Următorul: ' + esc(EX[nextEx.id].n) + ' →</button>' : '') + '<div class="ex-actions"><button class="btn small ghost" data-act="addset" data-id="' + ex.id + '">+ Set</button>' +
    (rows.length > ex.sets && !(rows[rows.length - 1] || {}).ok ? '<button class="btn small ghost" data-act="delset" data-id="' + ex.id + '">− Set</button>' : '') +
    (EX[ex.base].alt.length ? '<button class="btn small ghost" data-act="swap" data-base="' + ex.base + '" data-id="' + ex.id + '">Înlocuiește</button>' : '') +
    '<a class="btn small ghost" target="_blank" rel="noopener" href="https://www.youtube.com/results?search_query=' + encodeURIComponent(e.en + ' proper form tutorial') + '">Video ↗</a></div>' +
    '<details class="how"' + (sg.last ? '' : ' open') + '><summary>Cum se execută</summary><p class="eq"><b>Ai nevoie de:</b> ' + esc(e.eq) + ' <span class="en">(' + esc(e.en) + ')</span></p><ol>' + e.s.map(x => '<li>' + esc(x) + '</li>').join('') + '</ol>' +
    '<h4>Greșeli frecvente</h4><ul>' + e.b.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>' + (e.tip ? '<p class="tip">' + esc(e.tip) + '</p>' : '') +
    '<p class="rest">Pauză între seturi: ' + (restFor(ex.id) >= 120 ? '2 minute' : restFor(ex.id) + ' de secunde') + '.</p></details></div></section>';
  return h;
}

/* ---------- cronometru de pauză ---------- */
let timer = null, actx = null, wake = null;
function primeAudio() { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === 'suspended') actx.resume(); } catch (e) {} }
function beep() {
  try { if (navigator.vibrate) navigator.vibrate([200, 100, 200]); } catch (e) {}
  try {
    if (!actx) return;
    [0, 0.28].forEach(dt => { const o = actx.createOscillator(), g = actx.createGain(), t0 = actx.currentTime + dt; o.frequency.value = 880; o.connect(g); g.connect(actx.destination); g.gain.setValueAtTime(0.3, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.22); o.start(t0); o.stop(t0 + 0.24); });
  } catch (e) {}
}
function startTimer(sec) { stopTimer(); timer = {end: Date.now() + sec * 1000, total: sec}; timer.int = setInterval(tick, 250); tick(); }
function stopTimer() { if (timer) clearInterval(timer.int); timer = null; const b = $('#timer'); if (b) { b.hidden = true; b.classList.remove('fin'); } }
function tick() {
  const bar = $('#timer'); if (!timer || !bar) return;
  const left = Math.ceil((timer.end - Date.now()) / 1000);
  bar.hidden = false;
  if (left <= 0) {
    if (!timer.fin) { timer.fin = Date.now(); beep(); bar.classList.add('fin'); $('#timer-t').textContent = 'Gata, următorul set!'; $('#timer-fill').style.width = '100%'; }
    else if (Date.now() - timer.fin > 8000) stopTimer();
    return;
  }
  bar.classList.remove('fin');
  $('#timer-t').textContent = 'Pauză ' + Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0');
  $('#timer-fill').style.width = clamp(100 - left / timer.total * 100, 0, 100) + '%';
}
function keepAwake() { try { if (navigator.wakeLock && !wake) navigator.wakeLock.request('screen').then(w => { wake = w; w.addEventListener('release', () => { wake = null; }); }).catch(() => {}); } catch (e) {} }
function releaseWake() { try { if (wake) wake.release(); } catch (e) {} wake = null; }

/* ---------- NUTRIȚIE ---------- */
function foodDay(p, d) { const f = p.food[d] || (p.food[d] = {}); f.pick = f.pick || {}; f.eat = f.eat || {}; return f; }
function vFood(p) {
  const today = TODAY(), plan = planDay(p, today), t = plan.t, f = p.food[today] || {}, eat = f.eat || {};
  let ek = 0, ep = 0, ec = 0, ef = 0;
  plan.meals.forEach(m => { if (eat[m.slot]) { ek += m.k; ep += m.p; ec += m.c; ef += m.f; } });
  const glasses = Math.round(t.water / 0.25), w = f.water || 0, C = 2 * Math.PI * 40, fr = clamp(ek / t.kcal, 0, 1);
  const mac = (lbl, v, tg, cls) => '<div class="bar"><div class="bar-l"><span>' + lbl + '</span><span><b>' + v + '</b> / ' + tg + ' g</span></div><div class="track"><i class="' + cls + '" style="width:' + clamp(v / tg * 100, 0, 100) + '%"></i></div></div>';
  let h = '<section class="card nut"><div class="kring"><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="40" class="kr-bg"/><circle cx="50" cy="50" r="40" class="kr-fg' + (ek > t.kcal ? ' over' : '') + '" stroke-dasharray="' + (fr * C).toFixed(1) + ' ' + C.toFixed(1) + '" transform="rotate(-90 50 50)"/></svg>' +
    '<div>' + (ek > t.kcal ? '<b class="over">+' + fmtK(ek - t.kcal) + '</b><span>kcal peste țintă</span>' : '<b>' + fmtK(t.kcal - ek) + '</b><span>kcal rămase</span>') + '<small>din ' + fmtK(t.kcal) + '</small></div></div>' +
    '<div class="macros">' + mac('Proteine', ep, t.prot, 'mp') + mac('Carbohidrați', ec, t.carb, 'mc') + mac('Grăsimi', ef, t.fat, 'mf') + '</div></section>' +
    '<p class="fine pad0">Meniul de azi are în total ' + fmtK(plan.tot.k) + ' kcal și ' + plan.tot.p + ' g proteine, cu porții calculate pentru tine. Bifează fiecare masă după ce o mănânci.</p>';
  if (t.note) h += '<section class="card note warn"><p>' + esc(t.note) + '</p></section>';
  h += '<section class="card water"><div><b>Apă</b><small>' + fmtN(w * 0.25) + ' din ' + fmtN(t.water) + ' litri</small><small>un pahar = 250 ml</small></div><div class="stepper"><button data-act="water" data-d="-1" aria-label="Scade un pahar">−</button><span>' + w + '<small>/' + glasses + '</small></span><button data-act="water" data-d="1" aria-label="Adaugă un pahar">+</button></div></section>';
  h += '<div class="row2"><button class="btn" data-act="shuffle">Amestecă tot meniul</button><button class="btn ghost" data-act="shop">Lista de ingrediente</button></div>';
  h += plan.meals.map(m => {
    const on = !!eat[m.slot], open = ui.meal === m.slot;
    return '<section class="meal' + (on ? ' eaten' : '') + (open ? ' open' : '') + '"><div class="meal-head"><button class="mchk' + (on ? ' on' : '') + '" data-act="eat" data-slot="' + m.slot + '" aria-label="Am mâncat">✓</button>' +
      '<button class="meal-txt" data-act="meal" data-slot="' + m.slot + '"><small>' + SLOTS[m.slot] + ' · ' + m.k + ' kcal · ' + m.p + ' g proteine</small><b>' + esc(m.name) + '</b></button>' +
      '<button class="icon" data-act="reroll" data-slot="' + m.slot + '" aria-label="Altă rețetă"' + (on ? ' aria-disabled="true"' : '') + '>↻</button></div>' +
      (open ? '<div class="meal-body"><ul class="ingr">' + m.items.map(it => '<li>' + esc(qtyText(it)) + '</li>').join('') + '</ul><p class="prep">' + esc(m.prep) + '</p><p class="fine">' + m.c + ' g carbohidrați · ' + m.f + ' g grăsimi</p></div>' : '') + '</section>';
  }).join('');
  h += '<p class="fine pad">Valorile sunt estimări (±10%). Carnea, peștele, orezul, pastele și quinoa se cântăresc crude. Sare, condimente, lămâie și verdețuri după gust.</p>';
  return h;
}

/* ---------- PROGRES ---------- */
function spark(vals) {
  if (vals.length < 2) return '';
  const mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals), sp = mx - mn || 1, W = 300, H = 56;
  const pts = vals.map((v, i) => [(i / (vals.length - 1)) * (W - 12) + 6, H - 8 - ((v - mn) / sp) * (H - 16)]);
  const l = pts[pts.length - 1];
  return '<svg class="spark" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Evoluție"><polyline fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" points="' + pts.map(q => q[0].toFixed(1) + ',' + q[1].toFixed(1)).join(' ') + '"/><circle cx="' + l[0].toFixed(1) + '" cy="' + l[1].toFixed(1) + '" r="4.5" fill="var(--accent)"/></svg>';
}
function bwAdvice(p) {
  /* după o schimbare a țintei de calorii, ritmul se măsoară doar pe cântăririle de după schimbare,
     altfel aceeași recomandare s-ar aplica de mai multe ori pe aceleași date */
  const at = p.kcalAt, b = at ? p.bw.filter(x => x.d > at) : p.bw;
  if (at && (b.length < 2 || daysBetween(b[0].d, b[b.length - 1].d) < 10)) return {cls: '', text: 'Ai schimbat ținta de calorii pe ' + fmtD(at, {day: 'numeric', month: 'long'}) + '. Îți dau o nouă recomandare după ce strâng cântăriri pe cel puțin 10 zile de atunci.'};
  if (b.length < 2) return null;
  const last = b[b.length - 1]; let first = b[0];
  for (let i = 0; i < b.length; i++) if (daysBetween(b[i].d, last.d) <= 35) { first = b[i]; break; }
  const days = daysBetween(first.d, last.d);
  if (days < 10) return {cls: '', text: 'Am nevoie de cântăriri întinse pe cel puțin 10 zile ca să calculez ritmul. Cântărește-te dimineața, pe nemâncate, de 2-3 ori pe săptămână.'};
  const kg = (last.w - first.w) / (days / 7), rate = kg / first.w * 100, t = targets(p), g = t.goal;
  const r = 'Ritm: ' + (kg >= 0 ? '+' : '−') + fmtN(Math.abs(Math.round(kg * 100) / 100)) + ' kg pe săptămână. ';
  let cls = 'good', text, adj = 0;
  if (g === 'masa') {
    if (rate < 0.1) { cls = 'warn'; adj = 150; text = 'Prea lent pentru masă musculară: adaugă 150 kcal pe zi.'; }
    else if (rate > 0.6) { cls = 'warn'; adj = -150; text = 'Prea rapid: o parte din creștere este grăsime. Scade 150 kcal pe zi.'; }
    else text = 'Este ritmul bun pentru masă musculară cu puțină grăsime. Continuă așa.';
  } else if (g === 'slab') {
    if (rate > -0.25) { cls = 'warn'; adj = -100; text = 'Slăbești prea lent: scade 100 kcal pe zi sau adaugă 2.000 de pași zilnic.'; }
    else if (rate < -1) { cls = 'warn'; adj = 150; text = 'Prea rapid: riști să pierzi mușchi și energie. Adaugă 150 kcal pe zi.'; }
    else text = 'Este ritmul sănătos de slăbire. Continuă așa.';
  } else {
    if (rate > 0.3) { cls = 'warn'; adj = -100; text = 'Greutatea urcă: scade 100 kcal pe zi dacă vrei să rămâi la aceeași greutate.'; }
    else if (rate < -0.3) { cls = 'warn'; adj = 100; text = 'Greutatea scade: adaugă 100 kcal pe zi ca să ai energie pentru antrenamente.'; }
    else text = 'Greutate stabilă, exact ce trebuie. Urmărește talia și greutățile din sală, nu doar cântarul.';
  }
  let nk = adj ? t.kcal + adj : 0;
  if (adj < 0 && g === 'slab' && nk < t.floor) { nk = 0; text = 'Slăbești lent, dar ești deja la pragul minim de calorii. Nu mânca mai puțin: adaugă pași și mișcare.'; }
  return {cls, text: r + text, nk, cur: t.kcal};
}
function vProg(p) {
  const today = TODAY(), wk = weekDates(p, today), done = p.sessions.filter(hasOk);
  let streak = 0; const wkSet = {}; done.forEach(s => { wkSet[mondayOf(s.d)] = 1; });
  const d0 = parseYmd(mondayOf(today)); if (!wkSet[ymd(d0)]) d0.setDate(d0.getDate() - 7);
  while (wkSet[ymd(d0)]) { streak++; d0.setDate(d0.getDate() - 7); }
  let h = '<div class="stats"><div><b>' + wk + '/' + p.days + '</b><span>săptămâna asta</span></div><div><b>' + done.length + '</b><span>antrenamente</span></div><div><b>' + streak + '</b><span>' + (streak === 1 ? 'săptămână' : 'săptămâni') + ' la rând</span></div></div>';
  if (done.length) {
    const vol = {}; done.forEach(s => { const m = mondayOf(s.d); vol[m] = (vol[m] || 0) + sesVolume(s); });
    const m0 = parseYmd(mondayOf(today)), weeksV = [];
    for (let i = 7; i >= 0; i--) { const d = new Date(m0); d.setDate(d.getDate() - i * 7); const k = ymd(d); weeksV.push({k, v: vol[k] || 0}); }
    const mx = Math.max(1, ...weeksV.map(w => w.v)), tons = v => v >= 1000 ? fmtN(Math.round(v / 100) / 10) + 't' : v ? Math.round(v) + '' : '';
    h += '<section class="card"><h3>Volum pe săptămână</h3><div class="vchart" role="img" aria-label="Volumul ridicat în ultimele 8 săptămâni">' + weeksV.map((w, i) => '<div class="vb' + (i === 7 ? ' cur' : '') + (w.v ? ' has' : '') + '"><b>' + tons(w.v) + '</b><i style="height:' + Math.max(3, w.v / mx * 100) + '%"></i><span>' + fmtD(w.k, {day: 'numeric', month: 'numeric'}) + '</span></div>').join('') + '</div><p class="fine">Kilograme ridicate pe săptămână (greutate × repetări). Dacă bara crește încet de la o lună la alta, progresezi.</p></section>';
  }

  const adv = bwAdvice(p), last = p.bw[p.bw.length - 1];
  h += '<section class="card"><h3>Greutate corporală</h3><div class="bwrow"><label>Greutate (kg)<input class="in" id="bw-w" inputmode="decimal" autocomplete="off" placeholder="' + (last ? fmtN(last.w) : '70,5') + '"></label><label>Talie (cm)<input class="in" id="bw-c" inputmode="decimal" autocomplete="off" placeholder="' + (last && last.c ? fmtN(last.c) : 'opțional') + '"></label><button class="btn" data-act="bwsave">Salvează</button></div>' +
    spark(p.bw.slice(-14).map(x => x.w)) + (adv ? '<div class="advice ' + adv.cls + '"><p>' + esc(adv.text) + '</p>' + (adv.nk ? '<button class="btn small" data-act="applykcal" data-k="' + adv.nk + '">Aplică: ' + fmtK(adv.cur) + ' → ' + fmtK(adv.nk) + ' kcal</button>' : '') + '</div>' : '<p class="fine">Cântărește-te dimineața, pe nemâncate, de 2-3 ori pe săptămână. După două săptămâni îți spun dacă trebuie ajustate caloriile.</p>') +
    '<ul class="list">' + p.bw.slice(-5).reverse().map(x => '<li><span>' + fmtD(x.d, {day: 'numeric', month: 'short', year: 'numeric'}) + '</span><b>' + fmtN(x.w) + ' kg' + (x.c ? ' · talie ' + fmtN(x.c) + ' cm' : '') + '</b></li>').join('') + '</ul></section>';

  const pr = {};
  done.forEach(s => Object.keys(s.sets).forEach(id => { if (!EX[id]) return; okSets(s, id).forEach(x => { const v = score(id, x); if (!pr[id] || v > pr[id].v) pr[id] = {v, w: x.w, r: x.r, d: s.d}; }); }));
  const ids = Object.keys(pr).sort((a, b) => (pr[a].d < pr[b].d ? 1 : pr[a].d > pr[b].d ? -1 : 0));
  h += '<section class="card"><h3>Recorduri personale</h3>' + (ids.length ? '<ul class="list tap">' + ids.map(id => '<li' + TAP + ' data-act="exhist" data-id="' + id + '"><span>' + esc(EX[id].n) + '<small>' + fmtD(pr[id].d) + '</small></span><b>' + (EX[id].k === 't' ? pr[id].r + ' sec' : (pr[id].w ? fmtN(pr[id].w) + ' kg × ' : '') + pr[id].r) + ' ›</b></li>').join('') + '</ul>' : '<p class="fine">Aici apar cele mai bune seturi ale tale la fiecare exercițiu, după primul antrenament.</p>') + '</section>';

  h += '<section class="card"><h3>Istoric antrenamente</h3>' + (done.length ? done.slice(-30).reverse().map(s => {
    const key = s.d + '|' + s.i, open = ui.hist === key;
    return '<div class="hist' + (open ? ' open' : '') + '"><button class="hist-head" data-act="hist" data-k="' + key + '"><span>' + fmtD(s.d, {weekday: 'short', day: 'numeric', month: 'short'}) + ' · ' + esc(s.n || 'Antrenament') + '</span><b>' + sesSetCount(s) + ' seturi · ' + fmtK(sesVolume(s)) + ' kg</b></button>' +
      (open ? '<div class="hist-body">' + Object.keys(s.sets).filter(id => EX[id] && okSets(s, id).length).map(id => '<p><b>' + esc(EX[id].n) + '</b><br>' + okSets(s, id).map(x => EX[id].k === 't' ? x.r + ' s' : (x.w ? fmtN(x.w) + ' kg × ' : '') + x.r).join(' · ') + '</p>').join('') + '<button class="btn small ghost danger" data-act="delses" data-k="' + key + '">Șterge ședința</button></div>' : '') + '</div>';
  }).join('') : '<p class="fine">Niciun antrenament salvat încă.</p>') + '</section>';
  return h;
}

/* ---------- PROFIL ---------- */
function vMe(p) {
  const t = targets(p), prog = program(p), others = Object.values(S.profiles);
  let h = '<section class="card"><h3>' + esc(p.name) + '</h3><p class="kv">' + (p.sex === 'f' ? 'Femeie' : 'Bărbat') + ' · ' + p.age + ' ani · ' + p.h + ' cm · ' + fmtN(curWeight(p)) + ' kg</p>' +
    '<p class="kv">' + GOALS[p.goal] + ' · ' + (p.level === 'int' ? 'intermediar' : 'începător') + ' · ' + p.days + ' zile pe săptămână</p>' +
    '<div class="tgrid"><div><b>' + fmtK(t.kcal) + '</b><span>kcal</span></div><div><b>' + t.prot + ' g</b><span>proteine</span></div><div><b>' + t.carb + ' g</b><span>carbohidrați</span></div><div><b>' + t.fat + ' g</b><span>grăsimi</span></div></div>' +
    (t.note ? '<p class="advice warn">' + esc(t.note) + '</p>' : '') +
    '<details class="how"><summary>Cum am calculat</summary><p>Metabolism de bază (formula Mifflin-St Jeor): <b>' + fmtK(t.bmr) + ' kcal</b>. Cu activitatea zilnică și ' + p.days + ' antrenamente pe săptămână consumi aproximativ <b>' + fmtK(t.tdee) + ' kcal</b> pe zi.</p><p>' +
    (t.goal === 'masa' ? 'Pentru masă musculară am adăugat un surplus de 12%.' : t.goal === 'slab' ? 'Pentru slăbire am aplicat un deficit de cel mult 18%, fără să cobor sub pragul de siguranță de ' + fmtK(t.floor) + ' kcal.' : 'Pentru tonifiere rămâi la calorii de menținere: slăbești grăsime și pui mușchi în același timp, mai lent, dar fără foame.') +
    ' Proteine: ' + (t.goal === 'ton' ? '1,8' : '2') + ' g pe kilogram de greutate.</p><p>Formula diferă între bărbați și femei doar la metabolismul de bază. Regulile de antrenament sunt aceleași.</p></details>' +
    '<button class="btn" data-act="edit">Modifică profilul</button></section>';

  h += '<section class="card"><h3>Planul tău de antrenament</h3><p class="kv">' + FOCUS[p.focus] + '</p><ol class="plan">' + prog.map(d => '<li><b>' + esc(d.name) + '</b><span>' + esc(d.sub) + '</span></li>').join('') + '</ol><p class="fine">Program sugerat: ' + WEEKPLAN[p.days] + '. Lasă cel puțin o zi de pauză după două zile de antrenament la rând.</p>' +
    '<details class="how"><summary>Regulile planului</summary><ul><li><b>Progresie:</b> păstrezi greutatea până faci numărul maxim de repetări la toate seturile, apoi urci greutatea și reiei de la numărul minim.</li><li><b>Efort:</b> fiecare set se termină când mai aveai 1-3 repetări în rezervă, cu tehnică curată.</li><li><b>Pauze:</b> 2 minute la exercițiile mari, 60-90 de secunde la cele mici.</li><li><b>Săptămâna ușoară:</b> la 6-8 săptămâni, o săptămână cu mai puține seturi și greutăți mai mici.</li><li><b>Somn:</b> 7-9 ore. Mușchiul crește la odihnă, nu în sală.</li></ul></details></section>';

  h += '<section class="card"><h3>Ținte personalizate</h3><p class="fine">Lasă gol ca să folosești valorile calculate (' + fmtK(t.auto.kcal) + ' kcal, ' + t.auto.prot + ' g proteine).</p><div class="bwrow"><label>Calorii pe zi<input class="in" id="o-k" inputmode="numeric" autocomplete="off" value="' + (p.kcalO || '') + '" placeholder="' + t.auto.kcal + '"></label><label>Proteine (g)<input class="in" id="o-p" inputmode="numeric" autocomplete="off" value="' + (p.protO || '') + '" placeholder="' + t.auto.prot + '"></label><button class="btn" data-act="osave">Salvează</button></div></section>';

  h += '<section class="card"><h3>Cine folosește aplicația</h3><ul class="list tap">' + others.map(o => '<li' + TAP + ' data-act="switch" data-id="' + o.id + '"><span><i class="dot" style="background:' + (ACCENTS[o.accent] || ACCENTS.rust)[0] + '"></i>' + esc(o.name) + '<small>' + GOALS[o.goal] + '</small></span><b>' + (o.id === p.id ? 'activ' : 'Alege ›') + '</b></li>').join('') + '</ul><button class="btn ghost big" data-act="newprofile">+ Adaugă profil</button><p class="fine pad">Fiecare profil are propriul plan, meniu și istoric. Pe telefonul fiecăruia, aplicația pornește cu profilul lui.</p></section>';

  h += '<section class="card"><h3>Datele tale</h3><p class="fine">Totul se salvează doar pe acest telefon, în aplicație. Nu se trimite nimic pe internet. Fă din când în când o copie de siguranță, mai ales înainte să schimbi telefonul.</p><p class="bk' + (S.bk ? '' : ' none') + '">' + (S.bk ? 'Ultima copie: ' + fmtD(S.bk, {day: 'numeric', month: 'long', year: 'numeric'}) : 'Nu ai făcut încă nicio copie de siguranță.') + '</p><div class="row2"><button class="btn ghost" data-act="export">Salvează o copie</button><button class="btn ghost" data-act="import">Restaurează</button></div><input type="file" id="imp" accept="application/json,.json" hidden>' +
    '<details class="how"><summary>Cum pun aplicația pe ecranul telefonului</summary><p><b>iPhone:</b> deschide adresa aplicației în Safari, apasă butonul de partajare (pătratul cu săgeată) și alege „Adaugă pe ecranul principal”.</p><p><b>Android:</b> deschide adresa în Chrome, apasă meniul cu trei puncte și alege „Instalează aplicația” sau „Adaugă pe ecranul principal”.</p><p>După instalare merge și fără internet. Folosește mereu pictograma de pe ecran: acolo sunt salvate datele.</p></details></section>';
  h += '<section class="card dz"><h3>Șterge profilul</h3><p class="fine">Șterge profilul „' + esc(p.name) + '” de pe acest telefon, cu tot istoricul lui. Nu se poate anula, așa că fă înainte o copie de siguranță.</p><button class="btn ghost danger" data-act="delprofile">Șterge profilul ' + esc(p.name) + '</button></section>';
  h += '<p class="fine pad">Training Master ' + APP_VERSION + '. Recomandările sunt generale, pentru adulți sănătoși. Dacă ești însărcinată, ai o problemă medicală sau o accidentare, cere întâi sfatul medicului.</p>';
  return h;
}

/* ---------- FORMULAR PROFIL ---------- */
function opts(name, list, d) {
  return '<div class="opts">' + list.map(o => '<label class="opt"><input type="radio" data-in="form" name="' + name + '" value="' + o[0] + '"' + (String(d[name]) === String(o[0]) ? ' checked' : '') + '><span><b>' + o[1] + '</b>' + (o[2] ? '<small>' + o[2] + '</small>' : '') + '</span></label>').join('') + '</div>';
}
const STEPS = ['Despre tine', 'Obiectivul tău', 'Antrenament', 'Preferințe'];
function stepErr(d, step) {
  const age = num(d.age), hh = num(d.h), w = num(d.w);
  if (step === 0 || step < 0) {
    if (!String(d.name || '').trim()) return 'Scrie un prenume.';
    if (!d.sex) return 'Alege genul: este folosit la calculul caloriilor.';
    if (!age || age < 16 || age > 85) return 'Vârsta trebuie să fie între 16 și 85 de ani.';
    if (!hh || hh < 130 || hh > 220) return 'Înălțimea trebuie să fie între 130 și 220 cm.';
    if (!w || w < 35 || w > 250) return 'Greutatea trebuie să fie între 35 și 250 kg.';
    if (!d.act) return 'Alege nivelul de activitate din afara sălii.';
  }
  if ((step === 1 || step < 0) && !d.goal) return 'Alege un obiectiv.';
  if (step === 2 || step < 0) {
    if (!d.level) return 'Alege experiența la sală.';
    if (!d.days) return 'Alege numărul de zile de antrenament.';
    if (!d.focus) return 'Alege pe ce pui accentul.';
  }
  return '';
}
function vForm() {
  const f = ui.form, d = f.d, first = !Object.keys(S.profiles).length, wiz = f.mode !== 'edit', step = f.step || 0;
  const rec = d.sex === 'f' ? 'inferior' : d.sex === 'm' ? 'echilibrat' : '';
  const tag = k => (rec === k ? 'recomandat pentru tine' : '');
  const sec = [
    '<section class="card"><h3>Despre tine</h3>' +
    '<label class="fld">Prenume<input class="in" data-in="form" name="name" maxlength="20" autocomplete="off" value="' + esc(d.name || '') + '" placeholder="ex. Andrei"></label>' +
    '<div class="fld"><span>Gen</span>' + opts('sex', [['m', 'Bărbat'], ['f', 'Femeie']], d) + '</div>' +
    '<div class="grid3"><label class="fld">Vârstă<input class="in" data-in="form" name="age" inputmode="numeric" autocomplete="off" value="' + esc(d.age || '') + '" placeholder="ani"></label><label class="fld">Înălțime<input class="in" data-in="form" name="h" inputmode="numeric" autocomplete="off" value="' + esc(d.h || '') + '" placeholder="cm"></label><label class="fld">Greutate<input class="in" data-in="form" name="w" inputmode="decimal" autocomplete="off" value="' + esc(d.w || '') + '" placeholder="kg"></label></div>' +
    '<div class="fld"><span>Activitatea ta în afara sălii</span>' + opts('act', [['sed', 'Sedentar', 'birou, mașină'], ['mod', 'Moderat', 'mult mers pe jos'], ['act', 'Activ', 'muncă fizică']], d) + '</div></section>',
    '<section class="card"><h3>Obiectiv</h3>' + opts('goal', [['masa', 'Masă musculară', 'mai mult mușchi și forță, cu surplus caloric'], ['ton', 'Tonifiere și formă', 'corp mai ferm și definit, la aceeași greutate'], ['slab', 'Slăbire', 'mai puțină grăsime, cu mușchii păstrați']], d) + '</section>',
    '<section class="card"><h3>Antrenament</h3><div class="fld"><span>Experiență la sală</span>' + opts('level', [['beg', 'Începător', 'sub un an de antrenament constant'], ['int', 'Intermediar', 'peste un an, tehnică sigură']], d) + '</div>' +
    '<div class="fld"><span>Zile de antrenament pe săptămână</span>' + opts('days', [[3, '3 zile'], [4, '4 zile'], [5, '5 zile']], d) + '<small class="hint">Pentru început, 3 sau 4 zile sunt ideale. Contează să poți veni în fiecare săptămână.</small></div>' +
    '<div class="fld"><span>Pe ce pui accentul</span>' + opts('focus', [['echilibrat', 'Echilibrat', tag('echilibrat') || 'tot corpul, în mod egal'], ['inferior', 'Fesieri și picioare', tag('inferior') || 'mai mult volum pe partea de jos'], ['superior', 'Partea superioară', tag('superior') || 'piept, spate, umeri și brațe']], d) + '<small class="hint">Poți alege orice variantă, indiferent de gen. Regulile de antrenament sunt aceleași pentru toți.</small></div></section>',
    '<section class="card"><h3>Preferințe</h3><div class="fld"><span>Mese pe zi</span>' + opts('meals', [[0, 'Automat'], [3, '3'], [4, '4'], [5, '5'], [6, '6']], d) + '<small class="hint">Automat alege 4-6 mese după câte calorii ai de mâncat.</small></div>' +
    '<div class="fld"><span>Culoarea profilului</span><div class="opts sw">' + Object.keys(ACCENTS).map(k => '<label class="opt swatch"><input type="radio" data-in="form" name="accent" value="' + k + '"' + (d.accent === k ? ' checked' : '') + '><span style="--c:' + ACCENTS[k][0] + '" aria-label="' + k + '"></span></label>').join('') + '</div></div></section>'
  ];
  let h = '<header class="top"><div><div class="eyebrow">' + (!wiz ? 'Modifică profilul' : first ? 'Bine ai venit' : 'Profil nou') + '</div><h1>' + (!wiz ? esc(d.name || '') : first && step === 0 ? 'Training Master' : STEPS[step]) + '</h1></div></header>';
  if (wiz) {
    h += '<div class="steps" aria-label="Pasul ' + (step + 1) + ' din 4">' + STEPS.map((x, i) => '<span class="' + (i < step ? 'done' : i === step ? 'on' : '') + '"></span>').join('') + '</div>';
    if (step === 0) h += '<p class="lead">Spune-mi câteva lucruri despre tine și îți construiesc planul de antrenament și meniul, cu porții calculate pe măsura ta.</p>';
  }
  h += '<form id="pform" novalidate>' + (wiz ? sec[step] : sec.join(''));
  if (f.err) h += '<p class="advice warn" id="ferr">' + esc(f.err) + '</p>';
  if (wiz) h += '<div class="row2 wiz">' + (step > 0 ? '<button type="button" class="btn ghost" data-act="fback">Înapoi</button>' : first ? '<span></span>' : '<button type="button" class="btn ghost" data-act="cancelform">Renunță</button>') +
    (step < 3 ? '<button type="button" class="btn" data-act="fnext">Continuă</button>' : '<button type="submit" class="btn">Construiește planul</button>') + '</div></form>';
  else h += '<button type="submit" class="btn big">Salvează modificările</button><button type="button" class="btn ghost big" data-act="cancelform">Renunță</button></form>';
  return h;
}
function submitForm() {
  const f = ui.form, d = f.d, age = num(d.age), hh = num(d.h), w = num(d.w), name = String(d.name || '').trim();
  const err = stepErr(d, -1);
  if (err) { f.err = err; render(); const el = $('#ferr'); if (el) el.scrollIntoView({block: 'center'}); return; }
  const today = TODAY(), vals = {name, sex: d.sex, age: Math.round(age), h: Math.round(hh), w, act: d.act, goal: d.goal, level: d.level, days: +d.days, focus: d.focus, meals: +d.meals || 0, accent: d.accent || 'rust'};
  let p, isNew = f.mode !== 'edit';
  if (isNew) { p = normProfile(Object.assign({id: 'p' + Date.now().toString(36), created: today}, vals)); p.bw.push({d: today, w}); S.profiles[p.id] = p; S.active = p.id; }
  else {
    p = P(); const wOld = curWeight(p); Object.assign(p, vals);
    if (Math.abs(wOld - w) > 0.01) { p.bw = p.bw.filter(x => x.d !== today); p.bw.push({d: today, w}); }
  }
  ui.form = null; ui.day = null; ui.open = null; ui.tab = isNew ? 'train' : 'me';
  save(); render(); window.scrollTo(0, 0);
  if (isNew) openSheet(vPlanSheet(p));
}
function vPlanSheet(p) {
  const t = targets(p), prog = program(p);
  return '<h3>Planul tău este gata, ' + esc(p.name) + '</h3><p class="kv">' + GOALS[p.goal] + ' · ' + FOCUS[p.focus].toLowerCase() + '</p><ol class="plan">' + prog.map(d => '<li><b>' + esc(d.name) + '</b><span>' + esc(d.sub) + '</span></li>').join('') + '</ol>' +
    '<div class="tgrid"><div><b>' + fmtK(t.kcal) + '</b><span>kcal pe zi</span></div><div><b>' + t.prot + ' g</b><span>proteine</span></div><div><b>' + mealCount(p, t.kcal) + '</b><span>mese</span></div><div><b>' + fmtN(t.water) + ' l</b><span>apă</span></div></div>' +
    (t.note ? '<p class="advice warn">' + esc(t.note) + '</p>' : '') + '<button class="btn big" data-act="closesheet">Hai la treabă</button>';
}

/* ---------- foi (ferestre de jos) și mesaje ---------- */
/* pe iPhone, overflow:hidden nu oprește derularea paginii din spate: corpul paginii se fixează pe loc și se reface la închidere */
function openSheet(html) {
  const s = $('#sheet'), b = document.body;
  $('#sheet-in').innerHTML = html;
  if (s.hidden) { ui.sy = window.scrollY; b.style.top = -ui.sy + 'px'; b.classList.add('noscroll'); s.hidden = false; }
  $('#sheet-in').scrollTop = 0;
}
function closeSheet() {
  const s = $('#sheet'), b = document.body; if (s.hidden) return;
  s.hidden = true; ui.ask = null; b.classList.remove('noscroll'); b.style.top = ''; window.scrollTo(0, ui.sy || 0);
}
/* confirmare în fereastra aplicației, în loc de fereastra sistemului */
function ask(title, text, okLabel, fn) {
  openSheet('<h3>' + esc(title) + '</h3><p class="fine">' + esc(text) + '</p><div class="row2"><button class="btn ghost" data-act="closesheet">Renunță</button><button class="btn danger-fill" data-act="askok">' + esc(okLabel) + '</button></div>');
  ui.ask = fn;
}
let toastT = null;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 2600); }
function curDay() { return dayByIndex(P(), ui.day == null ? 0 : ui.day); }

/* ---------- ACȚIUNI ---------- */
const ACT = {
  tab(el) { ui.tab = el.dataset.tab; render(); window.scrollTo(0, 0); },
  day(el) { ui.day = +el.dataset.i; ui.open = null; const p = P(); if (p.pick) { delete p.pick; save(); } rerender(); },
  picker() { openSheet(vPicker(P())); ANIM.scan(); },
  pickday(el) {
    const p = P(); ui.day = +el.dataset.i; ui.open = null;
    if (ui.day >= 100) p.pick = {d: trainDate(p), i: ui.day}; else delete p.pick;
    save(); closeSheet(); render(); window.scrollTo(0, 0);
    toast('Antrenamentul de azi: ' + curDay().name);
  },
  jump(el) { const t = document.getElementById(el.dataset.to), box = $('#sheet-in'), j = $('.jumps', box); if (t && box) box.scrollTo({top: t.offsetTop - (j ? j.offsetHeight : 0) - 8, behavior: 'smooth'}); },
  start() {
    const p = P(), day = curDay(), ses = findSession(p, trainDate(p), day.i), nx = day.ex.find(x => !ses || okSets(ses, x.id).length < x.sets);
    if (!nx) return;
    ui.open = nx.id; rerender();
    const c = $('#ex-' + nx.id); if (c) window.scrollTo(0, window.scrollY + c.getBoundingClientRect().top - 12);
  },
  ex(el) { ui.open = ui.open === el.dataset.id ? null : el.dataset.id; rerender(); const c = $('#ex-' + el.dataset.id); if (c && ui.open) { const r = c.getBoundingClientRect(); if (r.top < 0 || r.top > window.innerHeight * 0.6) window.scrollTo(0, window.scrollY + r.top - 80); } },
  chk(el) {
    const p = P(), today = trainDate(p), day = curDay(), id = el.dataset.id, j = +el.dataset.j, ex = day.ex.find(x => x.id === id), e = EX[id];
    if (!ex) return;
    const ses = ensureSession(p, today, day), rows = ses.sets[id] || (ses.sets[id] = []);
    for (let k = 0; k <= j; k++) rows[k] = rows[k] || {};
    const row = rows[j];
    if (row.ok) { row.ok = 0; save(); rerender(); return; }
    primeAudio();
    const box = el.closest('.set'), wi = $('[data-f=w]', box), ri = $('[data-f=r]', box), sg = suggest(p, ex, today);
    const prev = rows.slice(0, j).reverse().find(x => x && x.ok);
    let w = wi ? num(wi.value) : 0, r = num(ri.value);
    if (wi && w == null) w = prev ? prev.w : sg.w != null ? sg.w : e.bw ? 0 : null;
    if (r == null) r = sg.r != null ? sg.r : prev ? prev.r : null;
    if (w == null || r == null) { toast(e.k === 't' ? 'Scrie câte secunde ai ținut.' : 'Scrie greutatea și repetările.'); (w == null && wi ? wi : ri).focus(); return; }
    if (w < 0 || w > 600 || r < 1 || r > (e.k === 't' ? 900 : 100)) { toast('Verifică valorile introduse.'); return; }
    row.w = Math.round(w * 100) / 100; row.r = Math.round(r); row.ok = 1;
    if (!ses.t0) ses.t0 = Date.now();
    ses.t1 = Date.now(); ses.done = false;
    save(); keepAwake(); startTimer(restFor(id)); rerender();
  },
  addset(el) { const p = P(), day = curDay(), id = el.dataset.id, ex = day.ex.find(x => x.id === id), ses = ensureSession(p, trainDate(p), day), rows = ses.sets[id] || (ses.sets[id] = []); while (rows.length < ex.sets) rows.push({}); if (rows.length >= 8) return toast('Opt seturi sunt de ajuns.'); rows.push({}); save(); rerender(); },
  delset(el) { const p = P(), ses = findSession(p, trainDate(p), curDay().i); if (ses && ses.sets[el.dataset.id]) { ses.sets[el.dataset.id].pop(); save(); rerender(); } },
  swap(el) {
    const base = el.dataset.base, cur = el.dataset.id, list = [base].concat(EX[base].alt);
    openSheet('<h3>Înlocuiește exercițiul</h3><p class="fine">Aparat ocupat sau exercițiu care nu ți se potrivește? Alege o variantă care lucrează aceiași mușchi. Alegerea rămâne salvată pentru ziua aceasta din plan.</p><ul class="list tap">' + list.map(id => '<li' + TAP + ' data-act="swapset" data-base="' + base + '" data-to="' + id + '"><span>' + esc(EX[id].n) + '<small>' + esc(EX[id].eq) + '</small></span><b>' + (id === cur ? 'ales' : id === base ? 'original ›' : 'Alege ›') + '</b></li>').join('') + '</ul><button class="btn ghost big" data-act="closesheet">Închide</button>');
  },
  swapset(el) { const p = P(), day = curDay(), key = day.k + ':' + el.dataset.base; if (el.dataset.to === el.dataset.base) delete p.swaps[key]; else p.swaps[key] = el.dataset.to; ui.open = el.dataset.to; save(); closeSheet(); rerender(); },
  finish() {
    const p = P(), today = trainDate(p), ses = findSession(p, today, curDay().i); if (!ses) return;
    ses.done = true; ses.t1 = Date.now(); save(); stopTimer(); releaseWake();
    const prs = [];
    Object.keys(ses.sets).forEach(id => { if (!EX[id]) return; const old = bestBefore(p, id, today); if (!old) return; const now = Math.max.apply(null, okSets(ses, id).map(x => score(id, x)).concat([0])); if (now > old + 0.001) prs.push(EX[id].n); });
    const mins = ses.t0 ? Math.max(1, Math.round((ses.t1 - ses.t0) / 60000)) : 0;
    openSheet('<h3>Bravo, ' + esc(p.name) + '!</h3><div class="tgrid"><div><b>' + sesSetCount(ses) + '</b><span>seturi</span></div><div><b>' + fmtK(sesVolume(ses)) + '</b><span>kg volum</span></div><div><b>' + (mins || '—') + '</b><span>minute</span></div><div><b>' + weekDates(p, today) + '/' + p.days + '</b><span>săptămâna</span></div></div>' +
      (prs.length ? '<div class="advice good"><p><b>Recorduri noi:</b> ' + prs.map(esc).join(', ') + '.</p></div>' : '') + '<p class="fine">Mănâncă o masă cu proteine în următoarele două ore și bea apă.</p><button class="btn big" data-act="closesheet">Gata</button>');
    ui.open = null; if (p.pick) delete p.pick; save(); rerender();
  },
  reopen() { const ses = findSession(P(), trainDate(), curDay().i); if (ses) { ses.done = false; save(); rerender(); } },
  deload() { P().deload = TODAY(); save(); rerender(); },
  tminus() { if (timer) { timer.end -= 15000; tick(); } },
  tplus() { if (timer) { timer.end += 15000; timer.total += 15; timer.fin = 0; tick(); } },
  tskip() { stopTimer(); },

  eat(el) { const f = foodDay(P(), TODAY()); f.eat[el.dataset.slot] = f.eat[el.dataset.slot] ? 0 : 1; save(); rerender(); },
  meal(el) { ui.meal = ui.meal === el.dataset.slot ? null : el.dataset.slot; rerender(); },
  reroll(el) { const p = P(), d = TODAY(), slot = el.dataset.slot, f = foodDay(p, d); if (f.eat[slot]) return toast('Ai bifat masa ca mâncată. Debifeaz-o ca s-o schimbi.'); const n = RECIPES[slot].length, cur = pickIdx(p, d, slot); f.pick[slot] = (cur + 1 + Math.floor(Math.random() * (n - 1))) % n; ui.meal = slot; save(); rerender(); },
  shuffle() { const p = P(), d = TODAY(), f = foodDay(p, d); let kept = 0; Object.keys(RECIPES).forEach(slot => { if (f.eat[slot]) { kept++; return; } const n = RECIPES[slot].length, cur = pickIdx(p, d, slot); f.pick[slot] = (cur + 1 + Math.floor(Math.random() * (n - 1))) % n; }); ui.meal = null; save(); rerender(); toast(kept ? 'Meniu nou. Mesele bifate au rămas la fel.' : 'Meniu nou pentru azi.'); },
  water(el) { const f = foodDay(P(), TODAY()); f.water = clamp((f.water || 0) + (+el.dataset.d), 0, 30); save(); rerender(); },
  shop() {
    const plan = planDay(P(), TODAY()), sum = {};
    plan.meals.forEach(m => m.items.forEach(it => { sum[it.id] = (sum[it.id] || 0) + it.g; }));
    const lines = Object.keys(sum).map(id => qtyText({id, g: sum[id]})).sort((a, b) => a.replace(/^[\d½\s]+(g|ml)?\s*/, '').localeCompare(b.replace(/^[\d½\s]+(g|ml)?\s*/, ''), 'ro'));
    ui.shopText = 'Ingrediente pentru meniul de azi:\n' + lines.map(l => '• ' + l).join('\n');
    openSheet('<h3>Ingrediente pentru meniul de azi</h3><p class="fine">Cantitățile sunt pentru o singură persoană, adunate din toate mesele zilei. Carnea, peștele, orezul și pastele sunt cântărite crude.</p><ul class="ingr">' + lines.map(l => '<li>' + esc(l) + '</li>').join('') + '</ul><div class="row2"><button class="btn" data-act="copyshop">Copiază lista</button><button class="btn ghost" data-act="closesheet">Închide</button></div>');
  },
  copyshop() { const done = () => toast('Lista a fost copiată.'); try { navigator.clipboard.writeText(ui.shopText).then(done, () => toast('Nu am putut copia lista.')); } catch (e) { toast('Nu am putut copia lista.'); } },

  bwsave() {
    const p = P(), w = num($('#bw-w').value), c = num($('#bw-c').value), today = TODAY();
    if (!w || w < 35 || w > 250) return toast('Scrie greutatea în kilograme.');
    if (c != null && (c < 40 || c > 200)) return toast('Talia trebuie să fie între 40 și 200 cm.');
    p.bw = p.bw.filter(x => x.d !== today); const e = {d: today, w}; if (c) e.c = c; p.bw.push(e); p.w = w;
    save(); rerender(); toast('Cântărire salvată.');
  },
  applykcal(el) { const p = P(); p.kcalO = +el.dataset.k; p.kcalAt = TODAY(); save(); rerender(); toast('Ținta de calorii a fost actualizată.'); },
  hist(el) { ui.hist = ui.hist === el.dataset.k ? null : el.dataset.k; rerender(); },
  delses(el) {
    const a = el.dataset.k.split('|');
    ask('Ștergi ședința?', 'Ședința din ' + fmtD(a[0], {day: 'numeric', month: 'long'}) + ' dispare din istoric și din recorduri. Nu se poate anula.', 'Șterge ședința', () => { const p = P(); p.sessions = p.sessions.filter(s => !(s.d === a[0] && s.i === +a[1])); ui.hist = null; save(); rerender(); toast('Ședința a fost ștearsă.'); });
  },
  exhist(el) {
    const p = P(), id = el.dataset.id, e = EX[id], rows = [];
    p.sessions.forEach(s => { const o = okSets(s, id); if (o.length) rows.push({d: s.d, sets: o, v: Math.max.apply(null, o.map(x => score(id, x)))}); });
    openSheet('<h3>' + esc(e.n) + '</h3><p class="fine">' + (e.k === 't' ? 'Cel mai lung set din fiecare ședință.' : e.assist ? 'O contragreutate mai mică înseamnă progres.' : 'Evoluția forței estimate (greutate și repetări combinate).') + '</p>' + spark(rows.slice(-14).map(r => r.v)) + '<ul class="list">' + rows.slice(-10).reverse().map(r => '<li><span>' + fmtD(r.d, {day: 'numeric', month: 'short', year: 'numeric'}) + '</span><b>' + r.sets.map(x => (e.k === 't' ? x.r + ' s' : (x.w ? fmtN(x.w) + '×' : '') + x.r)).join(' · ') + '</b></li>').join('') + '</ul><button class="btn ghost big" data-act="closesheet">Închide</button>');
  },

  profiles() {
    const p = P();
    openSheet('<h3>Cine se antrenează?</h3><ul class="list tap">' + Object.values(S.profiles).map(o => '<li' + TAP + ' data-act="switch" data-id="' + o.id + '"><span><i class="dot" style="background:' + (ACCENTS[o.accent] || ACCENTS.rust)[0] + '"></i>' + esc(o.name) + '<small>' + GOALS[o.goal] + ' · ' + o.days + ' zile</small></span><b>' + (o.id === p.id ? 'activ' : 'Alege ›') + '</b></li>').join('') + '</ul><div class="row2"><button class="btn ghost" data-act="newprofile">Adaugă profil</button><button class="btn ghost" data-act="closesheet">Închide</button></div>');
  },
  'switch'(el) { if (S.profiles[el.dataset.id]) { S.active = el.dataset.id; ui.day = null; ui.open = null; ui.meal = null; ui.hist = null; stopTimer(); save(); closeSheet(); render(); window.scrollTo(0, 0); toast('Profil activ: ' + P().name); } },
  newprofile() { const used = Object.values(S.profiles).map(o => o.accent), free = Object.keys(ACCENTS).find(k => used.indexOf(k) < 0) || 'rust'; closeSheet(); ui.form = {mode: 'new', d: {accent: free, meals: 0}}; render(); window.scrollTo(0, 0); },
  edit() { const p = P(); ui.form = {mode: 'edit', touched: true, d: {name: p.name, sex: p.sex, age: p.age, h: p.h, w: fmtN(curWeight(p)), act: p.act, goal: p.goal, level: p.level, days: p.days, focus: p.focus, meals: p.meals || 0, accent: p.accent}}; render(); window.scrollTo(0, 0); },
  cancelform() { ui.form = null; render(); window.scrollTo(0, 0); },
  fnext() {
    const f = ui.form, err = stepErr(f.d, f.step || 0);
    if (err) { f.err = err; render(); const el = $('#ferr'); if (el) el.scrollIntoView({block: 'center'}); return; }
    f.err = ''; f.step = Math.min(3, (f.step || 0) + 1); render(); window.scrollTo(0, 0);
  },
  fback() { const f = ui.form; f.err = ''; f.step = Math.max(0, (f.step || 0) - 1); render(); window.scrollTo(0, 0); },
  delprofile() {
    const p = P();
    ask('Ștergi profilul ' + p.name + '?', 'Dispar planul, meniul și tot istoricul lui de pe acest telefon. Nu se poate anula.', 'Șterge definitiv', () => { delete S.profiles[p.id]; S.active = Object.keys(S.profiles)[0] || null; ui.day = null; ui.tab = 'train'; save(); render(); window.scrollTo(0, 0); });
  },
  osave() {
    const p = P(), k = num($('#o-k').value), pr = num($('#o-p').value);
    if (k != null && (k < 1200 || k > 6000)) return toast('Caloriile trebuie să fie între 1.200 și 6.000.');
    if (pr != null && (pr < 40 || pr > 350)) return toast('Proteinele trebuie să fie între 40 și 350 g.');
    if ((k ? Math.round(k) : 0) !== (p.kcalO || 0)) p.kcalAt = TODAY();
    if (k) p.kcalO = Math.round(k); else delete p.kcalO;
    if (pr) p.protO = Math.round(pr); else delete p.protO;
    save(); rerender(); toast('Țintele au fost salvate.');
  },
  'export'() {
    const name = 'training-master-' + TODAY() + '.json', text = JSON.stringify(S);
    try {
      const file = new File([text], name, {type: 'application/json'});
      if (navigator.canShare && navigator.canShare({files: [file]})) { navigator.share({files: [file], title: 'Copie de siguranță'}).then(() => { S.bk = TODAY(); save(); rerender(); }).catch(() => {}); return; }
    } catch (e) {}
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], {type: 'application/json'})); a.download = name; document.body.appendChild(a); a.click(); a.remove();
    S.bk = TODAY(); save(); rerender(); toast('Copia a fost descărcată.');
  },
  'import'() { $('#imp').click(); },
  animtoggle() { ANIM.toggle(); },
  closesheet() { closeSheet(); },
  askok() { const f = ui.ask; closeSheet(); if (f) f(); },
  sheetbg(el, e) { if (e.target === el) closeSheet(); }
};

document.addEventListener('click', e => { const el = e.target.closest('[data-act]'); if (el && ACT[el.dataset.act]) ACT[el.dataset.act](el, e); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !$('#sheet').hidden) { closeSheet(); return; }
  const el = e.target;
  if ((e.key === 'Enter' || e.key === ' ') && el.getAttribute && el.getAttribute('role') === 'button' && el.tagName !== 'BUTTON' && el.dataset.act) { e.preventDefault(); el.click(); }
});
document.addEventListener('input', e => {
  const el = e.target; if (!el.dataset) return;
  if (el.dataset.in === 'set') {
    /* valorile scrise se păstrează ca ciornă chiar dacă setul nu e încă bifat */
    const p = P(), day = curDay(), id = el.dataset.id, j = +el.dataset.j, f = el.dataset.f;
    const ses = ensureSession(p, trainDate(p), day), rows = ses.sets[id] || (ses.sets[id] = []);
    for (let k = 0; k <= j; k++) rows[k] = rows[k] || {};
    const v = num(el.value);
    if (v == null || v < 0) { if (!rows[j].ok) delete rows[j][f]; }
    else rows[j][f] = f === 'r' ? Math.round(v) : v;
    save();
  } else if (el.dataset.in === 'form' && ui.form && el.type !== 'radio') ui.form.d[el.name] = el.value;
});
document.addEventListener('change', e => {
  const el = e.target;
  if (el.id === 'imp' && el.files && el.files[0]) {
    const rd = new FileReader();
    rd.onload = () => {
      try {
        const data = JSON.parse(rd.result);
        if (!data || !data.profiles || !Object.keys(data.profiles).length) throw new Error('gol');
        Object.values(data.profiles).forEach(o => { if (!o.id || !o.name || !o.sex || !o.h) throw new Error('profil'); });
        const n = Object.keys(data.profiles).length;
        ask('Restaurezi copia?', 'Copia are ' + (n === 1 ? 'un profil' : n + ' profiluri') + '. Toate datele de acum din aplicație vor fi înlocuite cu cele din copie.', 'Restaurează', () => {
          S = {v: 2, active: data.active, profiles: data.profiles, bk: data.bk}; Object.values(S.profiles).forEach(normProfile);
          if (!S.profiles[S.active]) S.active = Object.keys(S.profiles)[0];
          ui.day = null; ui.form = null; save(); render(); toast('Datele au fost restaurate.');
        });
      } catch (err) { toast('Fișierul nu este o copie validă.'); }
    };
    rd.readAsText(el.files[0]); el.value = '';
    return;
  }
  if (el.dataset && el.dataset.in === 'form' && el.type === 'radio' && ui.form) {
    const f = ui.form, d = f.d;
    d[el.name] = el.value;
    if (el.name === 'focus') f.touched = true;
    if (el.name === 'sex' && !f.touched) d.focus = el.value === 'f' ? 'inferior' : 'echilibrat';
    f.err = '';
    rerender();
  }
});
document.addEventListener('submit', e => { if (e.target.id !== 'pform') return; e.preventDefault(); if (ui.form && ui.form.mode !== 'edit' && (ui.form.step || 0) < 3) ACT.fnext(); else submitForm(); });
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;
  if (ui.lastDate !== ymd()) { ui.lastDate = ymd(); ui.day = null; if (!ui.form) rerender(); }
  const p = P(); if (p && p.sessions.some(s => s.d === trainDate(p) && !s.done && hasOk(s))) keepAwake();
  tick();
});

render();
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
