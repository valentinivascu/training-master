const fs = require('fs'), vm = require('vm'), path = require('path');
const ctx = {module: undefined, console}; vm.createContext(ctx);
vm.runInContext(['data.js', 'core.js'].map(f => fs.readFileSync(path.join(__dirname, '../src', f), 'utf8')).join('\n') + ';this.A={targets,planDay,qtyText,SLOTS};', ctx);
const A = ctx.A, base = {swaps: {}, sessions: [], food: {}, bw: []};
[{id: 'u', sex: 'f', age: 22, h: 170, w: 50, goal: 'slab', act: 'mod', days: 3}, {id: 'c', sex: 'm', age: 22, h: 190, w: 88, goal: 'masa', act: 'act', days: 5}].forEach(pp => {
  const p = Object.assign({}, base, pp), t = A.targets(p); let worst = null;
  for (let d = 0; d < 60; d++) { const dt = new Date(2026, 10, 1 + d), ds = dt.toISOString().slice(0, 10), pl = A.planDay(p, ds, t), dev = (pl.tot.k - t.kcal) / t.kcal; if (!worst || Math.abs(dev) > Math.abs(worst.dev)) worst = {dev, pl}; }
  console.log(pp.id, t.kcal, 'abatere', (worst.dev * 100).toFixed(1) + '%', 'total', worst.pl.tot.k);
  worst.pl.meals.forEach(m => console.log('  ', A.SLOTS[m.slot], m.k, 'kcal', m.name, '|', m.items.map(A.qtyText).join(', ')));
});
