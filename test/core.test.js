// Test pe date și calcule: rulează cu `node core.test.js`
const fs = require('fs'), vm = require('vm'), path = require('path');
const src = ['data.js', 'core.js'].map(f => fs.readFileSync(path.join(__dirname, '../src', f), 'utf8')).join('\n');
const ctx = {module: undefined, console};
vm.createContext(ctx);
vm.runInContext(src + '\nthis.API={LIB,LIB_ORDER,LIBK,buildDay,dayByIndex,dayIndexFor,EX,BLOCKS,PROGRAMS,ING,SLOTS,SLOTSETS,RECIPES,targets,program,planDay,suggest,qtyText,mealCount,score};', ctx);
const A = ctx.API;
let fail = 0;
const ok = (c, msg) => { if (!c) { fail++; console.log('  FAIL: ' + msg); } };

// 1. Integritatea datelor
Object.entries(A.EX).forEach(([id, e]) => {
  ok(e.n && e.en && e.m && e.eq && e.s.length >= 2 && e.b.length >= 1, 'exercițiu incomplet: ' + id);
  (e.alt || []).forEach(a => ok(A.EX[a], 'alternativă inexistentă ' + a + ' la ' + id));
});
const used = new Set();
Object.entries(A.BLOCKS).forEach(([k, b]) => {
  ok(b.e.length >= 4 && b.e.length <= 8, 'zi cu număr ciudat de exerciții: ' + k);
  const ids = b.e.map(e => e[0]);
  ok(new Set(ids).size === ids.length, 'exercițiu dublat în ' + k);
  b.e.forEach(e => { ok(A.EX[e[0]], 'exercițiu inexistent ' + e[0] + ' în ' + k); used.add(e[0]); });
});
Object.entries(A.PROGRAMS).forEach(([f, byDays]) => [3, 4, 5].forEach(d => {
  ok(byDays[d] && byDays[d].length === d, 'program ' + f + '/' + d);
  byDays[d].forEach(k => ok(A.BLOCKS[k], 'zi inexistentă ' + k));
}));
const usedOrAlt = new Set(used);
Object.values(A.EX).forEach(e => (e.alt || []).forEach(a => usedOrAlt.add(a)));
Object.keys(A.EX).forEach(id => ok(usedOrAlt.has(id), 'exercițiu nefolosit: ' + id));
let nRec = 0;
Object.entries(A.RECIPES).forEach(([slot, list]) => {
  ok(list.length >= 8, slot + ' are prea puține rețete');
  list.forEach(r => { nRec++; ok(r.prep && r.prep.length > 10, 'fără preparare: ' + r.n); r.i.forEach(x => ok(A.ING[x[0]], 'ingredient inexistent ' + x[0] + ' în ' + r.n)); });
});
// biblioteca: fiecare antrenament există, fiecare categorie apare în ordinea pentru bărbați și femei
A.LIB.forEach(c => c.k.forEach(k => ok(A.BLOCKS[k], 'antrenament inexistent în bibliotecă: ' + k)));
['m', 'f'].forEach(g => ok(A.LIB_ORDER[g].length === A.LIB.length && A.LIB.every(c => A.LIB_ORDER[g].includes(c.id)), 'ordine incompletă pentru ' + g));
{ const pp = {days: 4, focus: 'echilibrat', level: 'beg', swaps: {}};
  ok(A.dayIndexFor(pp, 'UB') === 2, 'o zi din program trebuie să rămână în rotație');
  const ct = A.dayByIndex(pp, A.dayIndexFor(pp, 'CT'));
  ok(ct.lib && ct.name === 'Piept și triceps' && ct.ex[0].id === 'bench', 'ziua Piept și triceps'); }
console.log('Antrenamente în bibliotecă: ' + A.LIBK.length);
console.log('Exerciții: ' + Object.keys(A.EX).length + ' · zile: ' + Object.keys(A.BLOCKS).length + ' · rețete: ' + nRec);

// 2. Ținte și meniuri pe profiluri diferite
const base = {id: 'x', swaps: {}, sessions: [], food: {}, bw: []};
const profiles = [
  {name: 'Bărbat masă (exemplu)', sex: 'm', age: 27, h: 178, w: 70.5, goal: 'masa', act: 'mod', days: 4, focus: 'echilibrat', level: 'beg'},
  {name: 'Femeie tonifiere', sex: 'f', age: 26, h: 165, w: 58, goal: 'ton', act: 'mod', days: 4, focus: 'inferior', level: 'beg'},
  {name: 'Femeie slăbire', sex: 'f', age: 30, h: 162, w: 72, goal: 'slab', act: 'sed', days: 3, focus: 'inferior', level: 'beg'},
  {name: 'Femeie masă', sex: 'f', age: 24, h: 170, w: 55, goal: 'masa', act: 'mod', days: 5, focus: 'inferior', level: 'int'},
  {name: 'Bărbat slăbire', sex: 'm', age: 35, h: 182, w: 98, goal: 'slab', act: 'sed', days: 3, focus: 'echilibrat', level: 'beg'},
  {name: 'Bărbat mare masă', sex: 'm', age: 22, h: 190, w: 88, goal: 'masa', act: 'act', days: 5, focus: 'superior', level: 'int'},
  {name: 'Femeie mică slăbire', sex: 'f', age: 45, h: 155, w: 60, goal: 'slab', act: 'sed', days: 3, focus: 'echilibrat', level: 'beg'},
  {name: 'Subponderal + slăbire', sex: 'f', age: 22, h: 170, w: 50, goal: 'slab', act: 'mod', days: 3, focus: 'echilibrat', level: 'beg'}
];
profiles.forEach(pp => {
  const p = Object.assign({}, base, pp);
  const t = A.targets(p);
  let minK = 1e9, maxK = 0, minP = 1e9, maxP = 0;
  for (let d = 1; d <= 300; d++) {
    const date = '2026-' + String(1 + (d % 12)).padStart(2, '0') + '-' + String(1 + (d % 28)).padStart(2, '0');
    p.id = 'p' + d; // schimbă combinația de rețete
    const plan = A.planDay(p, date, t);
    minK = Math.min(minK, plan.tot.k); maxK = Math.max(maxK, plan.tot.k);
    minP = Math.min(minP, plan.tot.p); maxP = Math.max(maxP, plan.tot.p);
    plan.meals.forEach(m => m.items.forEach(it => ok(it.g > 0 && A.qtyText(it).length > 3, 'cantitate greșită')));
  }
  const kDev = Math.max(Math.abs(minK - t.kcal), Math.abs(maxK - t.kcal)) / t.kcal * 100;
  const pLow = (t.prot - minP) / t.prot * 100;
  console.log(pp.name.padEnd(24) + ' țintă ' + t.kcal + ' kcal / ' + t.prot + ' g P | meniuri: ' + minK + '-' + maxK + ' kcal, ' + minP + '-' + maxP + ' g P | abatere kcal max ' + kDev.toFixed(1) + '%' + (t.note ? ' | NOTĂ' : ''));
  ok(kDev <= 6, 'abatere calorică mare la ' + pp.name);
  ok(pLow <= 12, 'proteine prea puține la ' + pp.name + ' (' + pLow.toFixed(0) + '% sub)');
  ok(t.kcal >= (p.sex === 'f' ? 1300 : 1600), 'calorii sub pragul de siguranță la ' + pp.name);
  const prog = A.program(p);
  ok(prog.length === p.days, 'număr de zile greșit');
});
ok(A.targets(Object.assign({}, base, profiles[7])).goal === 'ton', 'subponderal trebuie trecut pe menținere');
// rotație: nicio rețetă nu se repetă la aceeași masă în 8 zile consecutive
{ const p = Object.assign({}, base, profiles[0], {id: 'rot'}), seen = {}; let rep = 0;
  for (let d = 1; d <= 8; d++) A.planDay(p, '2026-12-' + String(d).padStart(2, '0')).meals.forEach(m => { const k = m.slot + ':' + m.idx; if (seen[k]) rep++; seen[k] = 1; });
  ok(rep === 0, 'rețete repetate în 8 zile: ' + rep); }
// porțiile nu depășesc limitele realiste
{ let over = 0; profiles.forEach(pp => { const p = Object.assign({}, base, pp); for (let d = 1; d <= 28; d++) A.planDay(p, '2026-11-' + String(d).padStart(2, '0')).meals.forEach(m => m.items.forEach(it => { if (A.ING[it.id].mx && it.g > A.ING[it.id].mx) over++; })); });
  ok(over === 0, 'porții peste limită: ' + over); }
// recorduri: la tracțiuni asistate, contragreutatea mai mică e mai bună; la greutatea corpului contează repetările
ok(A.score('asstpull', {w: 20, r: 8}) > A.score('asstpull', {w: 30, r: 8}), 'record greșit la tracțiuni asistate');
ok(A.score('pushup', {w: 0, r: 15}) > A.score('pushup', {w: 0, r: 10}), 'record greșit la flotări');
// progresie: la picioare, sub 40 kg se urcă cu 2,5 kg; la gantere cu 2 kg
{ const q = Object.assign({}, base, profiles[1], {sessions: [{d: '2026-11-01', i: 0, sets: {goblet: [{w: 16, r: 12, ok: 1}, {w: 16, r: 12, ok: 1}, {w: 16, r: 12, ok: 1}], hipthrust: [{w: 30, r: 15, ok: 1}, {w: 30, r: 15, ok: 1}, {w: 30, r: 15, ok: 1}]}}]});
  ok(A.suggest(q, {id: 'goblet', sets: 3, reps: '10-12'}, '2026-11-05').w === 18, 'goblet: trebuia +2 kg');
  ok(A.suggest(q, {id: 'hipthrust', sets: 3, reps: '12-15'}, '2026-11-05').w === 32.5, 'hip thrust: trebuia +2,5 kg'); }

// 3. Progresie
const pv = Object.assign({}, base, profiles[0], {sessions: [{d: '2026-11-01', i: 0, sets: {bench: [{w: 40, r: 10, ok: 1}, {w: 40, r: 10, ok: 1}, {w: 40, r: 10, ok: 1}]}}]});
let s = A.suggest(pv, {id: 'bench', sets: 3, reps: '8-10'}, '2026-11-05');
ok(s.w === 42.5 && s.r === 8, 'progresie: trebuia 42,5 kg × 8, a ieșit ' + s.w + '×' + s.r);
pv.sessions[0].sets.bench[2].r = 8;
s = A.suggest(pv, {id: 'bench', sets: 3, reps: '8-10'}, '2026-11-05');
ok(s.w === 40 && s.r === 9, 'progresie: trebuia 40 kg × 9');
ok(A.suggest(pv, {id: 'squat', sets: 3, reps: '8-10'}, '2026-11-05').w === undefined, 'fără istoric nu se sugerează greutate');

console.log(fail ? '\n' + fail + ' PROBLEME' : '\nTOATE VERIFICĂRILE AU TRECUT');
process.exit(fail ? 1 : 0);
