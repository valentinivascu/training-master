// Audit nutrițional: porții extreme, abateri, repetări de rețete
const fs = require('fs'), vm = require('vm'), path = require('path');
const ctx = {module: undefined, console}; vm.createContext(ctx);
vm.runInContext(['data.js', 'core.js'].map(f => fs.readFileSync(path.join(__dirname, '../src', f), 'utf8')).join('\n') + ';this.A={ING,RECIPES,targets,planDay,qtyText};', ctx);
const A = ctx.A;
// consistența valorilor la 100 g: kcal ≈ 4P + 4C + 9F
Object.entries(A.ING).forEach(([id, v]) => { const calc = v.p * 4 + v.c * 4 + v.f * 9, d = (calc - v.k) / v.k * 100; if (Math.abs(d) > 9) console.log('ING ' + id.padEnd(11) + ' declarat ' + v.k + ' / calculat ' + Math.round(calc) + ' (' + d.toFixed(0) + '%)'); });
const base = {swaps: {}, sessions: [], food: {}, bw: []};
const P = [
  {id: 'v', sex: 'm', age: 27, h: 178, w: 70.5, goal: 'masa', act: 'mod', days: 4},
  {id: 'a', sex: 'f', age: 26, h: 165, w: 58, goal: 'ton', act: 'mod', days: 4},
  {id: 'b', sex: 'f', age: 30, h: 162, w: 72, goal: 'slab', act: 'sed', days: 3},
  {id: 'c', sex: 'm', age: 22, h: 190, w: 88, goal: 'masa', act: 'act', days: 5}];
P.forEach(pp => {
  const p = Object.assign({}, base, pp), t = A.targets(p), mx = {}, devs = [], pdev = [], seen = {};
  let repeats = 0;
  for (let d = 0; d < 60; d++) {
    const dt = new Date(2026, 10, 1 + d), ds = dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0');
    const pl = A.planDay(p, ds, t);
    devs.push((pl.tot.k - t.kcal) / t.kcal * 100); pdev.push((pl.tot.p - t.prot) / t.prot * 100);
    pl.meals.forEach(m => { const key = m.slot; if (seen[key] && seen[key].slice(-3).includes(m.idx)) repeats++; (seen[key] = seen[key] || []).push(m.idx);
      m.items.forEach(it => { const k = it.id; if (!mx[k] || it.g > mx[k].g) mx[k] = {g: it.g, txt: A.qtyText(it), meal: m.name}; }); });
  }
  const abs = devs.map(Math.abs).sort((a, b) => a - b);
  console.log('\n' + pp.id + ': ' + t.kcal + ' kcal / ' + t.prot + ' g P | abatere kcal medie ' + (abs.reduce((a, b) => a + b, 0) / abs.length).toFixed(1) + '%, max ' + abs[abs.length - 1].toFixed(1) + '% | proteine min ' + Math.min(...pdev).toFixed(0) + '%, max +' + Math.max(...pdev).toFixed(0) + '% | aceeași rețetă în 3 zile: ' + repeats);
  Object.values(mx).sort((a, b) => b.g - a.g).slice(0, 9).forEach(m => console.log('   max: ' + m.txt + '  (' + m.meal + ')'));
});
