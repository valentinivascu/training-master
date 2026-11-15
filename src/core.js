/* ============ CALCULE: ținte nutriționale, program, porții, progresie ============ */

const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const num = v => { const n = parseFloat(String(v == null ? '' : v).replace(',', '.')); return isFinite(n) ? n : null; };

function ymd(d) {
  d = d || new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function parseYmd(s) { const a = s.split('-').map(Number); return new Date(a[0], a[1] - 1, a[2]); }
function daysBetween(a, b) { return Math.round((parseYmd(b) - parseYmd(a)) / 86400000); }
function mondayOf(s) { const d = parseYmd(s); const wd = d.getDay(); d.setDate(d.getDate() + (wd === 0 ? -6 : 1 - wd)); return ymd(d); }

/* Greutatea curentă = ultima cântărire */
function curWeight(p) { return p.bw && p.bw.length ? p.bw[p.bw.length - 1].w : p.w; }

/* Ținte zilnice: Mifflin-St Jeor + nivel de activitate + obiectiv */
function targets(p) {
  const w = curWeight(p);
  const bmr = 10 * w + 6.25 * p.h - 5 * p.age + (p.sex === 'f' ? -161 : 5);
  const af = ({sed: 1.4, mod: 1.55, act: 1.7}[p.act] || 1.55) + (p.days - 4) * 0.025;
  const tdee = bmr * af;
  const bmi = w / Math.pow(p.h / 100, 2);
  let goal = p.goal, note = '';
  if (goal === 'slab' && bmi < 18.5) { goal = 'ton'; note = 'Greutatea ta este deja sub intervalul sănătos pentru înălțime, așa că am calculat calorii de menținere, nu de slăbire.'; }
  else if (goal === 'slab' && p.age < 18) { goal = 'ton'; note = 'Sub 18 ani nu recomandăm deficit caloric. Am calculat calorii de menținere.'; }
  const floor = Math.max(bmr * 1.05, p.sex === 'f' ? 1300 : 1600);
  let kcal = goal === 'masa' ? tdee * 1.12 : goal === 'slab' ? Math.max(tdee * 0.82, floor) : tdee;
  kcal = Math.round(kcal / 50) * 50;
  /* proteinele se raportează la o greutate de referință, ca să nu iasă exagerate la greutăți mari */
  const refW = Math.min(w, 25 * Math.pow(p.h / 100, 2));
  let prot = refW * (goal === 'ton' ? 1.8 : 2.0);
  prot = Math.round(Math.min(prot, kcal * 0.3 / 4) / 5) * 5;
  const auto = {kcal, prot};
  if (p.kcalO) kcal = goal === 'slab' || p.goal === 'slab' ? Math.max(p.kcalO, Math.round(floor / 50) * 50) : p.kcalO;
  if (p.protO) prot = p.protO;
  const fat = Math.round(Math.max(0.8 * refW, kcal * 0.25 / 9));
  const carb = Math.max(0, Math.round((kcal - prot * 4 - fat * 9) / 4));
  const water = Math.round(w * 0.035 * 4) / 4;
  return {bmr: Math.round(bmr), tdee: Math.round(tdee), kcal, prot, fat, carb, water, bmi, goal, note, auto, floor: Math.round(floor / 50) * 50};
}

function mealCount(p, kcal) { return p.meals || (kcal < 1900 ? 4 : kcal < 2500 ? 5 : 6); }

/* Programul profilului: zile + exerciții (cu înlocuirile alese și seturi în plus la nivel intermediar) */
function buildDay(p, k, i) {
  const b = BLOCKS[k];
  return {i, k, name: b.n, sub: b.s, lib: i >= 100, ex: b.e.map((e, j) => {
    const sw = p.swaps && p.swaps[k + ':' + e[0]];
    return {base: e[0], id: sw && EX[sw] ? sw : e[0], sets: e[1] + (p.level === 'int' && j < 2 ? 1 : 0), reps: e[2]};
  })};
}
function programKeys(p) { return (PROGRAMS[p.focus] || PROGRAMS.echilibrat)[p.days] || PROGRAMS.echilibrat[4]; }
function program(p) { return programKeys(p).map((k, i) => buildDay(p, k, i)); }
/* indicele unei zile: dacă antrenamentul e în programul tău, rămâne ziua din program (rotația continuă firesc) */
function dayIndexFor(p, k) { const i = programKeys(p).indexOf(k); return i >= 0 ? i : 100 + LIBK.indexOf(k); }
function dayByIndex(p, i) {
  const keys = programKeys(p);
  if (i >= 100 && LIBK[i - 100]) return buildDay(p, LIBK[i - 100], i);
  return buildDay(p, keys[Math.min(Math.max(0, i || 0), keys.length - 1)], Math.min(Math.max(0, i || 0), keys.length - 1));
}

function repRange(reps) { const m = String(reps).match(/(\d+)\D+(\d+)/); return m ? [+m[1], +m[2]] : [+reps || 0, +reps || 0]; }
function restFor(id) { const k = EX[id].k; return k === 'i' ? 75 : k === 't' ? 60 : 120; }
function e1rm(w, r) { return w * (1 + r / 30); }
/* Scorul unui set, pentru recorduri: forța estimată; la greutatea corpului contează repetările,
   la tracțiunile asistate o contragreutate mai mică e mai bună, la plank contează secundele */
function score(id, x) {
  const e = EX[id]; if (!e) return 0;
  if (e.k === 't') return x.r;
  if (e.assist) return 300 - (x.w || 0) + x.r / 100;
  return e1rm(x.w || 0, x.r) + x.r / 100;
}
function okSets(ses, id) { return ((ses && ses.sets && ses.sets[id]) || []).filter(s => s && s.ok); }

/* Ultima ședință (înainte de `before`) în care exercițiul a fost făcut */
function lastPerf(p, id, before) {
  const ss = p.sessions || [];
  for (let i = ss.length - 1; i >= 0; i--) {
    if (before && ss[i].d >= before) continue;
    const s = okSets(ss[i], id);
    if (s.length) return {d: ss[i].d, sets: s};
  }
  return null;
}

/* Progresie dublă: întâi repetări până la capătul intervalului, apoi greutate */
function suggest(p, ex, today) {
  const e = EX[ex.id], last = lastPerf(p, ex.id, today), rr = repRange(ex.reps);
  if (!last) {
    if (e.k === 't') return {text: 'Prima dată: ține poziția cât poți corect, chiar dacă sunt mai puțin de ' + rr[0] + ' secunde.'};
    return {text: 'Prima dată: alege o greutate cu care termini seturile simțind că mai puteai face 2-3 repetări.'};
  }
  const top = last.sets.reduce((a, b) => (b.w > a.w ? b : a), last.sets[0]);
  if (e.k === 't') {
    const best = Math.max.apply(null, last.sets.map(s => s.r));
    return {w: 0, r: Math.min(rr[1] + 15, best + 5), last, text: 'Data trecută: ' + last.sets.map(s => s.r + ' s').join(' · ') + '. Azi încearcă +5 secunde.'};
  }
  const lastTxt = last.sets.map(s => (s.w ? fmtN(s.w) + ' kg × ' : '') + s.r).join(' · ');
  const allTop = last.sets.length >= Math.min(ex.sets, 2) && last.sets.every(s => s.r >= rr[1]);
  if (allTop && !top.w && !e.assist) return {w: 0, r: rr[1], up: true, last, text: 'Data trecută: ' + lastTxt + '. Ai atins maximul de repetări: ține o ganteră sau un disc ușor ca să crești dificultatea.'};
  if (allTop && top.w > 0) {
    /* pași mici: 2 kg pe ganteră, 2,5 kg la bară; 5 kg la picioare doar peste 40 kg */
    const db = /ganter/i.test(e.eq);
    const inc = db && e.k !== 'i' ? 2 : e.k === 'l' ? (top.w >= 40 ? 5 : 2.5) : e.k === 'c' ? 2.5 : 0;
    if (ex.id === 'asstpull') return {w: Math.max(0, top.w - 5), r: rr[0], last, text: 'Data trecută: ' + lastTxt + '. Ai atins maximul de repetări: scade contragreutatea cu un pas.'};
    if (inc) return {w: top.w + inc, r: rr[0], last, text: 'Data trecută: ' + lastTxt + '. Ai atins ' + rr[1] + ' repetări la toate seturile: urcă la ' + fmtN(top.w + inc) + ' kg.'};
    return {w: top.w, r: rr[0], up: true, last, text: 'Data trecută: ' + lastTxt + '. Ai atins maximul de repetări: treci la următoarea greutate disponibilă.'};
  }
  const minR = Math.min.apply(null, last.sets.map(s => s.r));
  return {w: top.w, r: Math.min(rr[1], minR + 1), last, text: 'Data trecută: ' + lastTxt + '. Păstrează greutatea și încearcă o repetare în plus.'};
}

function fmtN(n) { return (Math.round(n * 100) / 100).toString().replace('.', ','); }

/* ---------- NUTRIȚIE: porții calculate pe ținta fiecărei mese ---------- */
function mac(id, g) { const a = ING[id]; return {k: a.k * g / 100, p: a.p * g / 100, c: a.c * g / 100, f: a.f * g / 100}; }
function roundQty(id, g) {
  const a = ING[id];
  if (a.u) { const st = a.st || 1; return Math.max(st, Math.round(g / a.u / st) * st) * a.u; }
  const step = a.ml ? (g < 100 ? 10 : 50) : (g < 40 ? 5 : 10);
  return Math.max(step, Math.round(g / step) * step);
}
function qtyText(it) {
  const a = ING[it.id];
  if (a.u) {
    const n = Math.round(it.g / a.u * 2) / 2, whole = Math.floor(n), half = n - whole > 0;
    const q = (whole ? whole : '') + (half ? '½' : '');
    return q + ' ' + (n <= 1 ? a.one : a.many);
  }
  return it.g + (a.ml ? ' ml ' : ' g ') + a.n;
}

/* dacă porțiile ating limita realistă, restul caloriilor vine din alimente care se potrivesc firesc la masa respectivă */
const FILL = {m1: ['paine', 'miere'], m2: ['migdale'], m3: ['paine', 'ulei'], m4: ['miere', 'rondele'], m5: ['paine', 'ulei'], m6: ['nuci']};
function minStep(id) { const a = ING[id]; return a.u ? a.u * (a.st || 1) : a.ml ? 25 : 5; }
function capQty(id, g) {
  const a = ING[id]; if (!a.mx || g <= a.mx) return g;
  if (a.u) { const st = a.st || 1; return Math.max(st, Math.floor(a.mx / a.u / st) * st) * a.u; }
  return a.mx;
}
function solveMeal(rc, K, Pt, slot) {
  const base = rc.i.reduce((s, x) => s + mac(x[0], x[1]).k, 0);
  const s0 = clamp(K / base, 0.5, 1.8), sx = clamp(K / base, 0.6, 1.25);
  const fix = {k: 0, p: 0}, gp = {k: 0, p: 0}, gc = {k: 0, p: 0};
  rc.i.forEach(x => {
    const m = mac(x[0], x[2] === 'f' ? x[1] * s0 : x[2] === 'x' ? x[1] * sx : x[1]);
    const t = x[2] === 'p' ? gp : x[2] === 'c' ? gc : fix;
    t.k += m.k; t.p += m.p;
  });
  const LO = 0.4, HI = 2.3, CLO = 0.25, CHI = 3.2;
  let sp = 1, sc = 1;
  if (gp.k > 0 && gc.k > 0) {
    const det = gp.p * gc.k - gc.p * gp.k;
    if (Math.abs(det) > 1e-6) sp = ((Pt - fix.p) * gc.k - gc.p * (K - fix.k)) / det;
    sp = clamp(sp, LO, HI);
    sc = clamp((K - fix.k - sp * gp.k) / gc.k, CLO, CHI);
    sp = clamp((K - fix.k - sc * gc.k) / gp.k, LO, HI);
  } else if (gp.k > 0) sp = clamp((K - fix.k) / gp.k, LO, HI);
  else if (gc.k > 0) sc = clamp((K - fix.k) / gc.k, CLO, CHI);
  const items = rc.i.map(x => ({id: x[0], r: x[2], g: capQty(x[0], roundQty(x[0], x[1] * (x[2] === 'p' ? sp : x[2] === 'c' ? sc : x[2] === 'f' ? s0 : sx)))}));
  const sum = () => items.reduce((t, it) => { const m = mac(it.id, it.g); return {k: t.k + m.k, p: t.p + m.p, c: t.c + m.c, f: t.f + m.f}; }, {k: 0, p: 0, c: 0, f: 0});
  let tot = sum();
  (FILL[slot] || []).forEach(id => {
    const miss = K - tot.k; if (miss < 60) return;
    const it = items.find(x => x.id === id), have = it ? it.g : 0;
    const g = capQty(id, roundQty(id, have + Math.min(ING[id].mx - have, miss / ING[id].k * 100)));
    if (g <= have) return;
    if (it) it.g = g; else items.push({id, g, r: 'c'});
    tot = sum();
  });
  /* porțiile minime (un baton, un ou) pot depăși masa: atunci scad pe rând sursele de carbohidrați și grăsimi */
  for (let guard = 0; guard < 14 && tot.k > K * 1.06; guard++) {
    const cand = items.filter(it => (it.r === 'c' || it.r === 'f') && it.g > minStep(it.id)).sort((x, y) => mac(y.id, y.g).k - mac(x.id, x.g).k)[0];
    if (!cand) break;
    cand.g = Math.max(minStep(cand.id), cand.g - minStep(cand.id));
    tot = sum();
  }
  return {name: rc.n, prep: rc.prep, items, k: Math.round(tot.k), p: Math.round(tot.p), c: Math.round(tot.c), f: Math.round(tot.f)};
}

function hashStr(s) { let h = 7; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
/* Rotație: fiecare masă trece prin toate rețetele ei înainte să se repete */
function pickIdx(p, date, slot) {
  const f = p.food && p.food[date];
  if (f && f.pick && f.pick[slot] != null && RECIPES[slot][f.pick[slot]]) return f.pick[slot];
  const a = date.split('-').map(Number), day = Math.floor(Date.UTC(a[0], a[1] - 1, a[2]) / 86400000);
  return (day + hashStr(slot + p.id)) % RECIPES[slot].length;
}

/* Meniul unei zile: fiecare masă primește o parte din calorii și proteine; două treceri de corecție
   aduc totalul zilei cât mai aproape de țintă */
function planDay(p, date, t) {
  t = t || targets(p);
  const set = SLOTSETS[mealCount(p, t.kcal)];
  const mainShare = set.filter(s => /m[135]/.test(s[0])).reduce((a, s) => a + s[1], 0);
  let extra = 0, kf = 1, meals = [], tot = null, best = null;
  for (let pass = 0; pass < 8; pass++) {
    meals = set.map(s => {
      const rc = RECIPES[s[0]][pickIdx(p, date, s[0])];
      const main = /m[135]/.test(s[0]);
      const m = solveMeal(rc, t.kcal * s[1] * kf, t.prot * s[1] + (main ? extra * s[1] / mainShare : 0), s[0]);
      m.slot = s[0]; m.idx = pickIdx(p, date, s[0]);
      return m;
    });
    tot = meals.reduce((a, m) => ({k: a.k + m.k, p: a.p + m.p, c: a.c + m.c, f: a.f + m.f}), {k: 0, p: 0, c: 0, f: 0});
    const dp = t.prot - tot.p, dk = t.kcal / tot.k;
    /* păstrează cea mai bună variantă: caloriile contează mai mult; proteinele doar să nu fie sub țintă */
    const err = Math.abs(dk - 1) * 100 * (dk < 1 && t.goal === 'slab' ? 1.5 : 1) + Math.max(0, dp) / t.prot * 30;
    if (!best || err < best.err) best = {err, meals, tot};
    if (Math.abs(dp) < 5 && Math.abs(dk - 1) < 0.02) break;
    extra += dp; kf = clamp(kf * Math.pow(dk, 1.3), 0.75, 1.35);
  }
  return {meals: best.meals, tot: best.tot, t};
}

if (typeof module !== 'undefined') module.exports = {targets, program, buildDay, dayByIndex, dayIndexFor, planDay, solveMeal, suggest, qtyText, mealCount, ymd, mondayOf, repRange, score};
