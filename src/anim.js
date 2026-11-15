/* ============ ANIMAȚII: siluetă SVG pentru fiecare exercițiu ============
   Vedere laterală, silueta privește spre dreapta. Unghiuri în grade, în coordonate SVG:
   0 = înainte (dreapta), 90 = în jos, -90 = în sus, 180 = înapoi.
   Fiecare exercițiu are două poziții (A = start, B = capătul mișcării); animația merge A → B → A. */
const ANIM = (() => {
  const L = {t: 29, ua: 16, fa: 15.5, th: 23, sh: 23, ft: 7, nk: 4, hr: 5.5};
  const R = Math.PI / 180;
  const V = (a, l) => [Math.cos(a * R) * l, Math.sin(a * R) * l];
  const P_ = (p, q) => [p[0] + q[0], p[1] + q[1]];
  const ST = {ank: [80, 99], th: 90, sh: 90, t: -90};
  const VB = '0 -14 160 118';

  /* b = comun ambelor poziții; pr = aparate și greutăți */
  const D = {
    bench: {b: {hip: [96, 72], t: 180, foot: [121, 99], us: 0.65}, A: {hand: [70, 46]}, B: {hand: [72, 64]},
      pr: [['bench', 50, 77, 112, 77], ['plate', 'hand', 9]]},
    dbbench: {b: {hip: [96, 72], t: 180, foot: [121, 99], us: 0.65}, A: {hand: [70, 46]}, B: {hand: [74, 66]},
      pr: [['bench', 50, 77, 112, 77], ['db', 'hand']]},
    chestpress: {b: {hip: [68, 78], t: -98, hd: -92, foot: [92, 99]}, A: {hand: [94, 51]}, B: {hand: [76, 49]},
      pr: [['stack', 40, 18, 'hand'], ['seat', 58, 82, 82, 82], ['seat', 61, 80, 55, 40], ['line', 70, 85, 70, 100, 2.6], ['lever', 100, 6, 'hand'], ['grip', 'hand']]},
    incline: {b: {hip: [92, 74], t: -140, hd: -128, foot: [119, 99], us: 0.65}, A: {hand: [73, 29]}, B: {hand: [77, 48]},
      pr: [['seat', 86, 79, 106, 79], ['seat', 89, 77, 62, 54], ['line', 96, 81, 96, 100, 2.5], ['db', 'hand']]},
    pushup: {mir: true, b: {hand: [55, 99], us: 0.85}, A: {hip: [77.6, 79.7], t: 203, th: 20, sh: 20, ft: 60}, B: {hip: [79.7, 89], t: 186, th: 8.5, sh: 8.5, ft: 55}, eb: -1,
      pr: []},
    flye: {b: {hip: [68, 78], t: -98, hd: -92, foot: [92, 99]}, A: {hand: [57, 52]}, B: {hand: [91, 52]},
      pr: [['stack', 40, 18, 'hand', 0.25], ['seat', 58, 82, 82, 82], ['seat', 61, 80, 55, 40], ['line', 70, 85, 70, 100, 2.6], ['lever', 64, 14, 'hand'], ['grip', 'hand']]},
    latpull: {b: {hip: [72, 76], t: -100, hd: -95, th: -2, sh: 90, us: 0.7}, A: {hand: [73, 22]}, B: {hand: [76, 44]},
      pr: [['stack', 44, -14, 'hand'], ['line', 44, -14, 78, -14, 2.6], ['seat', 58, 80, 86, 80], ['line', 72, 83, 72, 100, 2.6], ['pad', 'knee', 4, 0, -6], ['cable', 76, -12, 'hand'], ['grip', 'hand']]},
    asstpull: {b: {hand: [86, 14], th: 30, sh: 160, ft: 170}, A: {hip: [81, 73.5], t: -92}, B: {hip: [80, 46], t: -92},
      pr: [['stack', 112, 6, 'hip', 0.3], ['line', 72, 14, 106, 14, 3], ['line', 98, 14, 98, 100, 2.6], ['seat', 'knee', 0]]},
    crow: {b: {hip: [60, 86], foot: [100, 82], ft: -80}, A: {t: -70, hand: [99, 64]}, B: {t: -98, hand: [67, 72]},
      pr: [['stack', 134, 34, 'hand'], ['seat', 38, 91, 76, 91], ['line', 104, 70, 104, 98, 3], ['cable', 127.5, 80, 'hand'], ['grip', 'hand']]},
    dbrow: {b: {hip: [62, 54], t: -4, hd: 10, th: 90, sh: 180, ft: 90, foot2: [50, 99], hand2: [99, 76]}, A: {hand: [92, 83]}, B: {hand: [74, 62]},
      pr: [['bench', 36, 79, 104, 79], ['db', 'hand']]},
    brow: {b: {ank: [80, 99], th: 60, sh: 100, t: -40, hd: -15}, A: {hand: [95, 69]}, B: {hand: [80, 53]},
      pr: [['plate', 'hand', 9]]},
    facepull: {b: Object.assign({}, ST, {t: -95, eb: -1}), A: {hand: [106, 26]}, B: {hand: [88, 13]},
      pr: [['stack', 146, -4, 'hand'], ['cable', 139.5, 20, 'hand'], ['grip', 'hand']]},
    ohp: {b: Object.assign({}, ST, {us: 0.65}), A: {hand: [85, 17]}, B: {hand: [81, -2]}, pr: [['plate', 'hand', 9]]},
    dbshoulder: {b: {hip: [72, 74], t: -92, foot: [96, 99], us: 0.65}, A: {hand: [77, 38]}, B: {hand: [74, 18]},
      pr: [['seat', 60, 78, 88, 78], ['seat', 64, 76, 60, 30], ['line', 74, 80, 74, 100, 2.5], ['db', 'hand']]},
    latraise: {front: true, b: {hy: 53, sy: 24, kx: 6, ky: 76, fx: 7, fy: 99, ef: 8}, A: {aa: 8, ef: 0}, B: {aa: 86},
      pr: [['db2']]},
    bicep: {b: Object.assign({}, ST, {ua: 92}), A: {fa: 92}, B: {fa: -75}, pr: [['db', 'hand']]},
    hammer: {b: Object.assign({}, ST, {ua: 92}), A: {fa: 92}, B: {fa: -75}, pr: [['dbv', 'hand']]},
    tricep: {b: Object.assign({}, ST, {t: -82, ua: 100}), A: {fa: -5}, B: {fa: 92},
      pr: [['stack', 112, -14, 'hand'], ['cable', 105.5, -10, 'hand'], ['grip', 'hand']]},
    ohtri: {b: {hip: [80, 54], t: -66, hd: -70, foot: [98, 99], foot2: [58, 95], ft2: 40, ua: -78}, A: {fa: 150}, B: {fa: 282},
      pr: [['stack', 22, 2, 'hand', 0.3], ['cable', 28.5, 92, 'hand'], ['grip', 'hand']]},
    squat: {b: {ank: [80, 99], hr: [1, 1], eb: 1}, A: {th: 90, sh: 90, t: -90, hd: -90}, B: {th: 15, sh: 115, t: -50, hd: -70},
      pr: [['rack', 106, 2, 64], ['plate', 'sh', 10, -2, -1]]},
    goblet: {b: {ank: [80, 99], hr: [8, 9], eb: 1}, A: {th: 90, sh: 90, t: -90, hd: -90}, B: {th: 12, sh: 112, t: -62, hd: -78},
      pr: [['db', 'hand', 4.5]]},
    legpress: {b: {hip: [62, 86], t: -132, hd: -115, kb: -1, hand: [68, 86]}, A: {foot: [99, 59], ft: -40}, B: {foot: [84, 72], ft: -45},
      pr: [['line', 70, 98, 130, 42, 2.4], ['line', 40, 100, 70, 92, 2.6], ['seat', 66, 91, 40, 61], ['platform', 'ank', 47, 22, 2, 2]]},
    rdl: {b: {ank: [80, 99], hr: [0, 31]}, A: {th: 90, sh: 92, t: -90, hd: -90}, B: {th: 45, sh: 95, t: -20, hd: -5},
      pr: [['plate', 'hand', 10]]},
    deadlift: {b: {ank: [80, 99], hr: [0, 31]}, A: {th: 30, sh: 112, t: -25, hd: -10}, B: {th: 90, sh: 90, t: -90, hd: -90},
      pr: [['plate', 'hand', 11]]},
    hipthrust: {b: {foot: [104, 99], hh: [-2, -3], eb: -1}, A: {hip: [80.2, 90.6], t: 220, hd: 230}, B: {hip: [87, 72], t: 180, hd: 205},
      pr: [['bench', 28, 78, 60, 78], ['plate', 'hip', 10, 0, -6]]},
    glutebridge: {b: {foot: [96, 99], hand: [79, 98.5]}, A: {hip: [79, 94], t: 180}, B: {hip: [76.3, 81.7], t: 155},
      pr: [['mat', 30, 101, 110, 101]]},
    bulgarian: {b: {foot: [98, 99], foot2: [56, 73], ft2: 170, hr: [0, 31]}, A: {hip: [77, 52], t: -86}, B: {hip: [75, 70], t: -78},
      pr: [['bench', 34, 78, 62, 78], ['db', 'hand']]},
    lunge: {b: {foot: [100, 99], foot2: [56, 94], ft2: 40, hr: [0, 31]}, A: {hip: [78, 54], t: -90}, B: {hip: [77, 72], t: -86},
      pr: [['db', 'hand']]},
    stepup: {b: {foot: [102, 79], hr: [0, 31]}, A: {hip: [86, 58], t: -76, foot2: [68, 99]}, B: {hip: [99, 33], t: -90, foot2: [95, 79]},
      pr: [['box', 88, 80, 44, 20], ['db', 'hand']]},
    legext: {b: {hip: [64, 74], t: -96, th: 0, hh: [6, 5]}, A: {sh: 92, ft: 0}, B: {sh: -4, ft: -80},
      pr: [['stack', 34, 30, 'ank', 0.3], ['seat', 52, 79, 88, 79], ['seat', 55, 77, 51, 40], ['line', 62, 82, 62, 100, 2.6], ['pad', 'ank', 3.6, 3, -1]]},
    legcurl: {b: {hip: [52, 74], t: -96, th: 0, hh: [7, 5]}, A: {sh: -2, ft: -80}, B: {sh: 112, ft: 10},
      pr: [['stack', 24, 30, 'ank', 0.3], ['seat', 40, 79, 76, 79], ['seat', 43, 77, 39, 40], ['line', 52, 82, 52, 100, 2.6], ['pad', 'knee', 4, -3, -7], ['pad', 'ank', 3.6, 0, 4.5]]},
    kickback: {b: {hip: [72, 56], t: -38, hd: -25, foot2: [72, 99], hand: [106, 48]}, A: {th: 115, sh: 75, ft: 0}, B: {th: 165, sh: 172, ft: 80},
      pr: [['stack', 120, 30, 'ank', 0.3], ['line', 104, 48, 114, 48, 2.6], ['line', 113.5, 46, 113.5, 100, 2.6], ['cable', 113.5, 97, 'ank'], ['grip', 'ank']]},
    abduction: {front: true, b: {hy: 64, sy: 34, ky: 70, fy: 95, aa: 12, ef: 0}, A: {kx: 7, fx: 7}, B: {kx: 21, fx: 17},
      pr: [['box', 60, 66, 40, 7], ['kpad']]},
    backext: {b: {hip: [82, 58], th: 136, sh: 136, ft: 226, hc: [0, 0]}, A: {t: 78}, B: {t: -44},
      pr: [['line', 40, 99, 88, 62, 3], ['line', 84, 66, 92, 100, 2.6], ['pad', 'hip', 4.5, 3, 3], ['pad', 'ank', 3.2, 2, 3.5]]},
    calf: {b: {th: 90, sh: 90, t: -90, hr: [3, 31]}, A: {ank: [80, 95], ft: -23}, B: {ank: [83.5, 85.7], ft: 60},
      pr: [['box', 85, 92, 42, 8]]},
    plank: {hold: true, mir: true, b: {t: 192, th: 11, sh: 11, ft: 85, ua: 90, fa: 0}, A: {hip: [80.5, 85.5]}, B: {hip: [80.5, 86.3]},
      pr: [['mat', 40, 101, 132, 101]]},
    legraise: {b: {hand: [82, -12]}, A: {hip: [82, 50], t: -90, th: 90, sh: 90}, B: {hip: [86, 46], t: -98, th: -6, sh: -6},
      pr: [['line', 68, -12, 98, -12, 3], ['line', 98, -12, 98, 100, 2.8]]},
    cablecrunch: {b: {hip: [74, 74], th: 90, sh: 180, ft: 90, hx: [3, 2]}, A: {t: -82, hd: -80}, B: {t: 8, hd: 70},
      pr: [['stack', 108, -14, 'hand', 0.3], ['cable', 101.5, -10, 'hand'], ['grip', 'hand']]},
    machinepress: {b: {hip: [72, 74], t: -92, foot: [96, 99], us: 0.65}, A: {hand: [77, 38]}, B: {hand: [74, 18]},
      pr: [['stack', 40, 4, 'hand'], ['seat', 60, 78, 88, 78], ['seat', 64, 76, 60, 30], ['line', 74, 81, 74, 100, 2.6], ['lever', 52, 46, 'hand'], ['grip', 'hand']]},
    machinerow: {b: {hip: [62, 78], t: -86, hd: -88, foot: [86, 99]}, A: {hand: [99, 52]}, B: {hand: [74, 55]},
      pr: [['stack', 128, 12, 'hand'], ['seat', 50, 82, 74, 82], ['line', 62, 85, 62, 100, 2.6], ['cpad', 80, 42, 80, 66], ['line', 80, 66, 84, 100, 2.4], ['lever', 112, 12, 'hand'], ['grip', 'hand']]},
    cablecurl: {b: Object.assign({}, ST, {ua: 92}), A: {fa: 92}, B: {fa: -75},
      pr: [['stack', 120, 36, 'hand'], ['cable', 113.5, 95, 'hand'], ['grip', 'hand']]},
    hacksquat: {b: {ank: [88, 97], hr: [2, -1], eb: 1}, A: {th: 88, sh: 95, t: -110, hd: -100}, B: {th: 20, sh: 120, t: -110, hd: -100},
      pr: [['line', 96, 100, 104, 92, 2.6], ['line', 77, 100, 47, 18, 2.6], ['backpad'], ['plate', 'hip', 9, -15, -2]]}
  };

  function ik(r, tg, l1, l2, s) {
    const dx = tg[0] - r[0], dy = tg[1] - r[1], d = Math.hypot(dx, dy), a = Math.atan2(dy, dx);
    const dc = Math.min(l1 + l2 - 0.01, Math.max(Math.abs(l1 - l2) + 0.01, d));
    const al = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + dc * dc - l2 * l2) / (2 * l1 * dc))));
    const ja = a + s * al, j = [r[0] + Math.cos(ja) * l1, r[1] + Math.sin(ja) * l1];
    const ea = Math.atan2(tg[1] - j[1], tg[0] - j[0]);
    return [j, [j[0] + Math.cos(ea) * l2, j[1] + Math.sin(ea) * l2]];
  }
  const lerp = (a, b, s) => Array.isArray(a) ? a.map((x, i) => x + (b[i] - x) * s) : typeof a === 'number' ? a + (b - a) * s : (s < 0.5 ? a : b);
  function pose(def, s) {
    const A = Object.assign({}, def.b, def.A), B = Object.assign({}, def.b, def.B), o = {};
    for (const k in A) o[k] = k in B ? lerp(A[k], B[k], s) : A[k];
    ['eb', 'kb'].forEach(k => { if (def[k] != null && o[k] == null) o[k] = def[k]; });
    return o;
  }

  /* ---------- vedere laterală ---------- */
  function solve(P) {
    let hip;
    if (P.ank) { const knee = P_(P.ank, V(P.sh + 180, L.sh)); hip = P_(knee, V(P.th + 180, L.th)); } else hip = P.hip;
    const sh = P_(hip, V(P.t, L.t)), head = P_(sh, V(P.hd != null ? P.hd : P.t, L.nk + L.hr));
    const s = {hip, sh, head, chest: P_(hip, V(P.t, L.t * 0.72))};
    const leg = (f, th, shA, kb, ft) => {
      let k, a;
      if (f) [k, a] = ik(hip, f, L.th, L.sh, kb); else { k = P_(hip, V(th, L.th)); a = P_(k, V(shA, L.sh)); }
      return [hip, k, a, P_(a, V(ft, L.ft))];
    };
    s.leg1 = P.ank ? leg(null, P.th, P.sh, 0, P.ft || 0) : leg(P.foot, P.th, P.sh, P.kb != null ? P.kb : -1, P.ft || 0);
    s.leg2 = (P.foot2 || P.th2 != null) ? leg(P.foot2, P.th2 != null ? P.th2 : P.th, P.sh2 != null ? P.sh2 : P.sh, P.kb2 != null ? P.kb2 : -1, P.ft2 != null ? P.ft2 : (P.ft || 0)) : null;
    const tgt = x => P['hand' + x] || (P['hr' + x] && P_(sh, P['hr' + x])) || (P['hh' + x] && P_(hip, P['hh' + x])) || (P['hc' + x] && P_(s.chest, P['hc' + x])) || (P['hx' + x] && P_(head, P['hx' + x]));
    const arm = x => {
      const t = tgt(x);
      const ua = L.ua * (P.us || 1);
      if (t) { const r = ik(sh, t, ua, L.fa, P['eb' + x] != null ? P['eb' + x] : P.eb != null ? P.eb : 1); return [sh, r[0], r[1]]; }
      const e = P_(sh, V(P['ua' + x], ua)); return [sh, e, P_(e, V(P['fa' + x], L.fa))];
    };
    s.arm1 = arm('');
    s.arm2 = ['hand2', 'hr2', 'hh2', 'hc2', 'hx2', 'ua2'].some(k => k in P) ? arm('2') : null;
    return s;
  }

  const f1 = n => (Math.round(n * 10) / 10).toString();
  const pts = a => a.map(p => f1(p[0]) + ',' + f1(p[1])).join(' ');
  const line = (a, w, st, op) => '<polyline points="' + pts(a) + '" fill="none" stroke="' + (st || 'currentColor') + '" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round"' + (op != null ? ' opacity="' + op + '"' : '') + '/>';
  const circ = (c, r, fill, st, sw, op) => '<circle cx="' + f1(c[0]) + '" cy="' + f1(c[1]) + '" r="' + f1(r) + '" fill="' + fill + '"' + (st ? ' stroke="' + st + '" stroke-width="' + sw + '"' : '') + (op != null ? ' opacity="' + op + '"' : '') + '/>';
  const poly = (a, fill, op) => '<polygon points="' + pts(a) + '" fill="' + fill + '" stroke="' + fill + '" stroke-width="0.7" stroke-linejoin="round"' + (op != null ? ' opacity="' + op + '"' : '') + '/>';
  const rect = (x, y, w, h, fill, rx, st) => '<rect x="' + f1(x) + '" y="' + f1(y) + '" width="' + f1(w) + '" height="' + f1(h) + '" rx="' + (rx || 0) + '" fill="' + fill + '"' + (st ? ' stroke="' + st + '" stroke-width="0.9"' : '') + '/>';
  const OUT = 'var(--anim-outline)', PAD = 'var(--anim-pad)', PADHI = 'var(--anim-padhi)', MET = 'var(--anim-metal)', MET2 = 'var(--anim-metal2)', STEEL = 'var(--anim-steel)';
  const WT = 'var(--accent)', WTD = 'var(--accent-dim)';
  const SKIN = 'var(--anim-body)', SKIN2 = 'var(--anim-body2)', HAIR = 'var(--anim-hair)', MP = 'var(--anim-mp)', MS = 'var(--anim-ms)';
  const GROUND = '<rect x="-80" y="100.6" width="320" height="40" fill="var(--anim-floor)"/><line x1="-80" y1="100.6" x2="240" y2="100.6" stroke="' + MET2 + '" stroke-width="0.9"/>';
  let ACTV = 0, MIR = 1;

  /* ---------- grupe musculare: p = principale, s = secundare ---------- */
  const MN = {chest: 'Piept', abs: 'Abdomen', back: 'Spate', traps: 'Trapez', lowerback: 'Zona lombară', glutes: 'Fesieri', gmed: 'Fesier lateral',
    shoulders: 'Umeri', reardelt: 'Umeri (spate)', biceps: 'Biceps', triceps: 'Triceps', forearms: 'Antebrațe', quads: 'Cvadriceps',
    hamstrings: 'Ischiogambieri', calves: 'Gambe', hipflex: 'Flexorii șoldului'};
  const MUS = {
    bench: 'chest|triceps shoulders', dbbench: 'chest|triceps shoulders', chestpress: 'chest|triceps shoulders', incline: 'chest shoulders|triceps',
    pushup: 'chest|triceps shoulders abs', flye: 'chest|shoulders', latpull: 'back|biceps reardelt', asstpull: 'back|biceps reardelt',
    crow: 'back|biceps reardelt traps', dbrow: 'back|biceps reardelt', brow: 'back|biceps reardelt lowerback', facepull: 'reardelt traps|back',
    machinerow: 'back|biceps reardelt traps', machinepress: 'shoulders|triceps', cablecurl: 'biceps|forearms', hacksquat: 'quads glutes|hamstrings',
    ohp: 'shoulders|triceps traps abs', dbshoulder: 'shoulders|triceps', latraise: 'shoulders|traps', bicep: 'biceps|forearms', hammer: 'biceps forearms|',
    tricep: 'triceps|', ohtri: 'triceps|', squat: 'quads glutes|hamstrings lowerback abs', goblet: 'quads glutes|abs', legpress: 'quads glutes|hamstrings',
    rdl: 'hamstrings glutes|lowerback', deadlift: 'glutes hamstrings lowerback|quads back traps', hipthrust: 'glutes|hamstrings', glutebridge: 'glutes|hamstrings',
    bulgarian: 'quads glutes|hamstrings', lunge: 'quads glutes|hamstrings calves', stepup: 'glutes quads|hamstrings', legext: 'quads|', legcurl: 'hamstrings|calves',
    kickback: 'glutes|hamstrings', abduction: 'gmed|glutes', backext: 'lowerback glutes|hamstrings', calf: 'calves|', plank: 'abs|shoulders glutes',
    legraise: 'abs|hipflex', cablecrunch: 'abs|'
  };
  const ONE = {dbrow: 'arm', kickback: 'leg', stepup: 'leg', bulgarian: 'leg'};
  function muscles(id) { const m = (MUS[id] || '|').split('|'); return {p: m[0].split(' ').filter(Boolean), s: (m[1] || '').split(' ').filter(Boolean)}; }
  const mcol = (mus, m) => mus.p.includes(m) ? MP : mus.s.includes(m) ? MS : null;

  /* profilul fiecărui segment: [poziția pe segment, grosime în față, grosime în spate] */
  const PR = {
    torso: [[0, 4.6, 6.6], [0.14, 5, 6.2], [0.42, 4.5, 4.6], [0.72, 6.2, 5.6], [0.9, 5.6, 5.4], [1, 4.4, 4.4]],
    thigh: [[0, 5.4, 5.8], [0.3, 5.3, 5], [0.75, 4.2, 4], [1, 3.4, 3.4]],
    shin: [[0, 3.3, 3.4], [0.28, 2.9, 4.4], [0.62, 2.4, 2.9], [1, 2, 2.1]],
    uarm: [[0, 3.9, 3.9], [0.45, 3.5, 3.6], [1, 2.6, 2.6]],
    farm: [[0, 2.7, 2.7], [0.3, 2.9, 2.7], [1, 1.9, 1.9]],
    neck: [[0, 2.7, 2.7], [1, 2.3, 2.3]],
    foot: [[0, 2.5, 1.8], [0.35, 2.1, 1.5], [1, 1.1, 1]]
  };
  /* "în față" = partea anterioară a corpului; trunchiul e orientat invers față de membre */
  function fr(p, q, sg) { const d = [q[0] - p[0], q[1] - p[1]], l = Math.hypot(d[0], d[1]) || 1, u = [d[0] / l, d[1] / l]; sg *= MIR; return {p, u, l, n: [sg * u[1], -sg * u[0]]}; }
  const at = (F, t, o) => [F.p[0] + F.u[0] * F.l * t + F.n[0] * o, F.p[1] + F.u[1] * F.l * t + F.n[1] * o];
  function rad(pr, t, side) {
    for (let i = 1; i < pr.length; i++) if (t <= pr[i][0]) { const a = pr[i - 1], b = pr[i], k = (t - a[0]) / ((b[0] - a[0]) || 1); return a[side] + (b[side] - a[side]) * k; }
    return pr[pr.length - 1][side];
  }
  function shape(F, pr) {
    const A = [], B = [];
    for (let i = 0; i <= 12; i++) { const t = i / 12; A.push(at(F, t, rad(pr, t, 1))); B.push(at(F, t, -rad(pr, t, 2))); }
    return A.concat(B.reverse());
  }
  function lens(F, pr, side, t0, t1, depth, inset) {
    const A = [], B = [], sg = side === 1 ? 1 : -1, fib = [[], []];
    for (let i = 0; i <= 10; i++) {
      const t = t0 + (t1 - t0) * i / 10, r = rad(pr, t, side) - (inset == null ? 0.3 : inset), k = Math.sin(Math.PI * i / 10);
      A.push(at(F, t, sg * r)); B.push(at(F, t, sg * (r - r * depth * k)));
      fib[0].push(at(F, t, sg * (r - r * depth * k * 0.36))); fib[1].push(at(F, t, sg * (r - r * depth * k * 0.7)));
    }
    return {p: A.concat(B.reverse()), fib};
  }
  /* mușchiul: formă, fibre și intensitate care crește în timpul efortului */
  function musc(L_, col, op) {
    const o = (op == null ? 1 : op) * (col === MP ? 0.68 + 0.32 * ACTV : 1);
    return poly(L_.p, col, o) + line(L_.fib[0].slice(2, 9), 0.42, 'rgba(0,0,0,.25)', op) + line(L_.fib[1].slice(2, 9), 0.42, 'rgba(0,0,0,.18)', op);
  }
  /* un grup de forme cu contur exterior comun (fără linii între segmentele aceluiași membru) */
  function grp(list, fill) {
    let o = '', f = '';
    list.forEach(x => {
      if (x.c) { o += circ(x.c, x.r + 0.8, OUT); f += circ(x.c, x.r, fill); }
      else { o += '<polygon points="' + pts(x) + '" fill="' + OUT + '" stroke="' + OUT + '" stroke-width="1.7" stroke-linejoin="round"/>'; f += poly(x, fill); }
    });
    return o + f;
  }
  const shade = (F, pr) => poly(lens(F, pr, 2, 0.04, 0.96, 0.4, 0.1).p, '#000', 0.09);
  const MDEF = {
    chest: [['torso', 1, 0.46, 1, 1]], abs: [['torso', 1, 0.08, 0.56, 0.7]], back: [['torso', 2, 0.36, 0.95, 0.9]],
    traps: [['torso', 2, 0.84, 1, 0.9], ['neck', 2, 0, 0.95, 0.85]], lowerback: [['torso', 2, 0.1, 0.44, 0.65]],
    reardelt: [['uarm', 2, 0, 0.42, 0.95]], biceps: [['uarm', 1, 0.3, 0.92, 0.85]], triceps: [['uarm', 2, 0.28, 0.94, 0.85]],
    forearms: [['farm', 1, 0.05, 0.62, 0.8], ['farm', 2, 0.05, 0.62, 0.8]],
    quads: [['thigh', 1, 0.08, 0.93, 0.85]], hamstrings: [['thigh', 2, 0.26, 0.92, 0.85]], calves: [['shin', 2, 0.06, 0.62, 0.85]], hipflex: [['thigh', 1, 0, 0.32, 0.8]]
  };

  /* un membru (braț sau picior) desenat cu volum, contur și mușchii lui */
  function limbSide(pts3, kind, mus, far) {
    const body = far ? SKIN2 : SKIN, op = far ? 0.5 : 1;
    let h = '';
    if (kind === 'leg') {
      const T = fr(pts3[0], pts3[1], 1), S = fr(pts3[1], pts3[2], 1), fd = [pts3[3][0] - pts3[2][0], pts3[3][1] - pts3[2][1]], fl = Math.hypot(fd[0], fd[1]) || 1;
      const heel = [pts3[2][0] - fd[0] / fl * 2, pts3[2][1] - fd[1] / fl * 2], toe = [pts3[3][0] + fd[0] / fl * 0.8, pts3[3][1] + fd[1] / fl * 0.8];
      h += grp([shape(fr(heel, toe, 1), PR.foot), shape(S, PR.shin), {c: pts3[1], r: 3.6}, shape(T, PR.thigh)], body);
      if (!far) h += shade(S, PR.shin) + shade(T, PR.thigh);
      ['quads', 'hamstrings', 'calves', 'hipflex'].forEach(m => { const c = mcol(mus, m); if (c) MDEF[m].forEach(d => { h += musc(lens(d[0] === 'thigh' ? T : S, PR[d[0]], d[1], d[2], d[3], d[4]), c, op); }); });
    } else {
      const U = fr(pts3[0], pts3[1], 1), F = fr(pts3[1], pts3[2], 1), hd = [pts3[2][0] + F.u[0] * 1.6, pts3[2][1] + F.u[1] * 1.6];
      h += grp([shape(F, PR.farm), {c: pts3[1], r: 2.6}, shape(U, PR.uarm), {c: pts3[0], r: 4.2}, {c: hd, r: 2.3}], body);
      if (!far) h += shade(U, PR.uarm) + shade(F, PR.farm);
      const dc = mcol(mus, 'shoulders');
      if (dc) {
        const A = [], B = [];
        for (let i = 0; i <= 8; i++) { const t = 0.42 * i / 8, k = 1 - Math.pow(i / 8, 2) * 0.75; A.push(at(U, t, (rad(PR.uarm, t, 1) - 0.25) * k)); B.push(at(U, t, -(rad(PR.uarm, t, 2) - 0.25) * k)); }
        const o = op * (dc === MP ? 0.68 + 0.32 * ACTV : 1);
        h += circ(pts3[0], 3.8, dc, null, 0, o) + poly(A.concat(B.reverse()), dc, o) + line([at(U, 0.05, 0), at(U, 0.36, 0)], 0.45, 'rgba(0,0,0,.22)', op);
      }
      ['reardelt', 'biceps', 'triceps', 'forearms'].forEach(m => { const c = mcol(mus, m); if (c) MDEF[m].forEach(d => { h += musc(lens(d[0] === 'uarm' ? U : F, PR[d[0]], d[1], d[2], d[3], d[4]), c, op); }); });
    }
    return h;
  }

  function ref(s, r) {
    return ({hand: s.arm1[2], hand2: (s.arm2 || s.arm1)[2], elbow: s.arm1[1], sh: s.sh, hip: s.hip, head: s.head, chest: s.chest,
      knee: s.leg1[1], ank: s.leg1[2], toe: s.leg1[3], knee2: (s.leg2 || s.leg1)[1], ank2: (s.leg2 || s.leg1)[2]})[r];
  }

  /* ---------- echipament ---------- */
  function padSeg(a, b, w) {
    const d = [b[0] - a[0], b[1] - a[1]], l = Math.hypot(d[0], d[1]) || 1;
    let n = [-d[1] / l, d[0] / l]; if (n[1] > 0 || (Math.abs(n[1]) < 0.01 && n[0] > 0)) n = [-n[0], -n[1]];
    const k = w / 2 - 1.1, s = 0.12;
    const hi = [[a[0] + d[0] * s + n[0] * k, a[1] + d[1] * s + n[1] * k], [b[0] - d[0] * s + n[0] * k, b[1] - d[1] * s + n[1] * k]];
    return line([a, b], w + 1.6, OUT) + line([a, b], w, PAD) + line(hi, 1, PADHI);
  }
  const post = (a, b, w) => line([a, b], (w || 2.6) + 1.4, OUT) + line([a, b], w || 2.6, MET) + line([[a[0] - 0.5, a[1]], [b[0] - 0.5, b[1]]], 0.5, 'rgba(255,255,255,.18)');
  const foot = (x) => line([[x - 3.5, 100], [x + 3.5, 100]], 2.4, MET2);
  function plate(q, r) {
    return circ(q, r + 0.8, OUT) + circ(q, r, WTD, WT, 1.3) + circ(q, r * 0.8, 'none', 'rgba(0,0,0,.28)', 0.8) + circ(q, r * 0.48, 'none', WT, 0.6, 0.7) +
      circ(q, 2.3, MET, OUT, 0.6) + circ(q, 1, MET2);
  }
  function hexDb(c, r) {
    const p = []; for (let i = 0; i < 6; i++) p.push(P_(c, V(30 + i * 60, r)));
    return '<polygon points="' + pts(p) + '" fill="' + WT + '" stroke="' + OUT + '" stroke-width="0.9" stroke-linejoin="round"/>' + circ(c, r * 0.38, WTD);
  }
  function stack(x, top, lift) {
    const n = 10, ph = 2.3, w = 11, base = 99.4;
    let h = post([x - 6.5, top], [x - 6.5, 100.6], 2.2) + post([x + 6.5, top], [x + 6.5, 100.6], 2.2) + post([x - 7.5, top], [x + 7.5, top], 2.6);
    h += line([[x, top + 3], [x, base - n * ph - lift]], 0.8, STEEL) + circ([x, top + 3], 2.6, MET2, MET, 0.8) + circ([x, top + 3], 0.9, MET);
    h += line([[x - 3, top + 2], [x - 3, base]], 0.6, 'rgba(255,255,255,.14)') + line([[x + 3, top + 2], [x + 3, base]], 0.6, 'rgba(255,255,255,.14)');
    for (let i = 0; i < n; i++) {
      const mv = i >= n - 3, y = base - (i + 1) * ph - (mv ? lift : 0);
      h += rect(x - w / 2, y, w, ph - 0.35, mv ? WT : MET2, 0.5, OUT);
    }
    h += rect(x + w / 2 - 0.5, base - (n - 2.5) * ph - lift - 0.5, 3, 1.2, MET, 0.4);
    return h + foot(x - 6.5) + foot(x + 6.5);
  }
  function props(def, s, layer, sA) {
    let h = '';
    (def.pr || []).forEach(p => {
      const k = p[0];
      if (layer === 'back') {
        if (k === 'bench') h += post([p[1] + 5, p[2] + 2], [p[1] + 5, 100]) + post([p[3] - 5, p[4] + 2], [p[3] - 5, 100]) + foot(p[1] + 5) + foot(p[3] - 5) + padSeg([p[1], p[2]], [p[3], p[4]], 6);
        else if (k === 'seat' && typeof p[1] === 'number') h += padSeg([p[1], p[2]], [p[3], p[4]], 6);
        else if (k === 'seat') { const c = ref(s, p[1]); h += padSeg([c[0] - 7, c[1] + 4.6], [c[0] + 7, c[1] + 4.6], 5.5); }
        else if (k === 'mat') h += line([[p[1], p[2]], [p[3], p[4]]], 2.6, PAD) + line([[p[1] + 2, p[2] - 0.9], [p[3] - 2, p[4] - 0.9]], 0.6, PADHI);
        else if (k === 'line') h += post([p[1], p[2]], [p[3], p[4]], p[5] || 2.6);
        else if (k === 'box') h += rect(p[1], p[2], p[3], p[4], PAD, 2, OUT) + line([[p[1] + 2, p[2] + 1.2], [p[1] + p[3] - 2, p[2] + 1.2]], 1, PADHI);
        else if (k === 'stack') { const c = ref(s, p[3]), c0 = ref(sA, p[3]); h += stack(p[1], p[2], Math.min(16, Math.hypot(c[0] - c0[0], c[1] - c0[1]) * (p[4] || 0.42))); }
        else if (k === 'cable') { const c = ref(s, p[3]); h += line([[p[1], p[2]], c], 0.8, STEEL) + circ([p[1], p[2]], 2.7, MET2, MET, 0.8) + circ([p[1], p[2]], 0.9, MET); }
        else if (k === 'lever') { const c = ref(s, p[3]); h += line([[p[1], p[2]], c], 5, OUT) + line([[p[1], p[2]], c], 3.6, MET) + circ([p[1], p[2]], 3.2, MET2, OUT, 0.8) + circ([p[1], p[2]], 1.1, MET); }
        else if (k === 'pad') { const c = ref(s, p[1]), q = [c[0] + (p[3] || 0), c[1] + (p[4] || 0)]; h += circ(q, p[2] + 0.8, OUT) + circ(q, p[2], PAD) + circ(q, p[2] * 0.35, MET); }
        else if (k === 'rack') h += post([p[1], p[2]], [p[1], 100.6], 3) + foot(p[1]) + post([p[1], p[3]], [p[1] - 9, p[3]], 2) + post([p[1], p[2] + 18], [p[1] - 4, p[2] + 18], 1.8);
        else if (k === 'backpad') { const T = fr(s.hip, s.sh, -1); h += padSeg(at(T, 0.05, -8.4), at(T, 1.02, -8.4), 6) + circ(at(T, 1.05, -2), 3.2, PAD, OUT, 0.9); }
        else if (k === 'cpad') h += padSeg([p[1], p[2]], [p[3], p[4]], 6);
      } else if (layer === 'weight') {
        if (k === 'plate') { const c = ref(s, p[1]); h += plate([c[0] + (p[3] || 0), c[1] + (p[4] || 0)], p[2]); }
        else if (k === 'platform') {
          const c = ref(s, p[1]), q = [c[0] + (p[4] || 0), c[1] + (p[5] || 0)], d = V(p[2], p[3] / 2), back = V(p[2] - 90, 6);
          h += line([[q[0] - d[0], q[1] - d[1]], [q[0] + d[0], q[1] + d[1]]], 5.6, OUT) + line([[q[0] - d[0], q[1] - d[1]], [q[0] + d[0], q[1] + d[1]]], 4.2, MET) +
            plate([q[0] + back[0], q[1] + back[1]], 7.5);
        }
      } else {
        if (k === 'db') { const c = ref(s, p[1]); h += hexDb(c, p[2] || 3.9); }
        else if (k === 'dbv') { const c = ref(s, p[1]); h += hexDb([c[0], c[1] - 4], 2.9) + hexDb([c[0], c[1] + 4], 2.9) + line([[c[0], c[1] - 2], [c[0], c[1] + 2]], 1.6, MET); }
        else if (k === 'grip') { const c = ref(s, p[1]); h += circ(c, 2.3, MET2, OUT, 0.8) + circ(c, 0.9, MET); }
      }
    });
    return h;
  }
  function head(c, dirDeg, front) {
    if (front) return grp([{c: [c[0], c[1] - 1.1], r: 5.9}], HAIR) + circ([c[0], c[1] + 0.4], 5.3, SKIN) + circ([c[0] - 2, c[1] + 0.2], 0.65, HAIR) + circ([c[0] + 2, c[1] + 0.2], 0.65, HAIR);
    const u = V(dirDeg, 1), n = [-u[1] * MIR, u[0] * MIR];
    const hc = [c[0] + u[0] * 0.9 - n[0] * 1.2, c[1] + u[1] * 0.9 - n[1] * 1.2], fc = [c[0] + n[0] * 0.3, c[1] + n[1] * 0.3];
    return circ(hc, 6.6, OUT) + circ(fc, 6.2, OUT) + circ(hc, 5.8, HAIR) + circ(fc, 5.4, SKIN) +
      circ([c[0] + n[0] * 5.3 - u[0] * 0.6, c[1] + n[1] * 5.3 - u[1] * 0.6], 1.2, SKIN) +
      circ([c[0] - n[0] * 0.6 + u[0] * 0.2, c[1] - n[1] * 0.6 + u[1] * 0.2], 1.3, 'rgba(0,0,0,.12)') +
      circ([c[0] + n[0] * 3 + u[0] * 0.7, c[1] + n[1] * 3 + u[1] * 0.7], 0.65, HAIR);
  }

  function sideSVG(def, s, id, sA) {
    MIR = def.mir ? -1 : 1;
    const mus = muscles(id), none = {p: [], s: []}, one = ONE[id];
    const T = fr(s.hip, s.sh, -1), hdDeg = Math.atan2(s.head[1] - s.sh[1], s.head[0] - s.sh[0]) / R;
    const NK = fr(s.sh, [s.sh[0] + Math.cos(hdDeg * R) * (L.nk + 1.5), s.sh[1] + Math.sin(hdDeg * R) * (L.nk + 1.5)], -1);
    const d = [-1.4, -1], offL = a => a.map(p => [p[0] + d[0], p[1] + d[1]]);
    let h = '<g class="fig">';
    const lowY = Math.max(s.leg1[2][1], s.leg1[3][1], (s.leg2 || s.leg1)[2][1]);
    if (lowY > 92) h += '<ellipse cx="' + f1((s.leg1[2][0] + (s.leg2 || s.leg1)[2][0] + s.hip[0]) / 3) + '" cy="101.3" rx="22" ry="2" fill="#000" opacity=".32"/>';
    h += props(def, s, 'back', sA);
    h += limbSide(s.leg2 || offL(s.leg1), 'leg', one === 'leg' ? none : mus, true);
    h += limbSide(s.arm2 || offL(s.arm1), 'arm', one === 'arm' ? none : mus, true);
    h += props(def, s, 'weight', sA);
    /* trunchi, fesieri, gât */
    h += grp([shape(T, PR.torso), {c: s.hip, r: 5.6}, shape(NK, PR.neck)], SKIN) + shade(T, PR.torso);
    ['chest', 'abs', 'back', 'lowerback', 'traps'].forEach(m => { const c = mcol(mus, m); if (c) MDEF[m].forEach(q => { h += musc(lens(q[0] === 'neck' ? NK : T, PR[q[0]], q[1], q[2], q[3], q[4]), c); }); });
    if (mcol(mus, 'abs')) [0.2, 0.32, 0.44].forEach(t => { h += line([at(T, t, rad(PR.torso, t, 1) - 0.5), at(T, t, rad(PR.torso, t, 1) * 0.45)], 0.5, 'rgba(0,0,0,.28)'); });
    const gc = mcol(mus, 'glutes');
    h += limbSide(s.leg1, 'leg', mus, false);
    if (gc) {
      const TH = fr(s.leg1[0], s.leg1[1], 1), o = [];
      for (let i = 0; i <= 6; i++) { const t = 0.24 - 0.24 * i / 6; o.push(at(T, t, -(rad(PR.torso, t, 2) - 0.35))); }
      for (let i = 0; i <= 6; i++) { const t = 0.34 * i / 6; o.push(at(TH, t, -(rad(PR.thigh, t, 2) - 0.35))); }
      const op = gc === MP ? 0.68 + 0.32 * ACTV : 1;
      h += poly(o.concat([at(TH, 0.3, -1.4), [s.hip[0], s.hip[1]], at(T, 0.2, -1.6)]), gc, op) + line([at(T, 0.16, -3.2), s.hip.map((v, i) => v + T.n[i] * -2.8), at(TH, 0.22, -3)], 0.45, 'rgba(0,0,0,.25)');
    }
    h += head(s.head, hdDeg, false);
    h += limbSide(s.arm1, 'arm', mus, false);
    return GROUND + h + props(def, s, 'front', sA) + '</g>';
  }

  /* ---------- vedere frontală (ridicări laterale, abducții) ---------- */
  function frontSVG(def, P, id) {
    MIR = 1;
    const cx = 80, mus = muscles(id), col = m => mcol(mus, m);
    let h = '<g class="fig"><ellipse cx="80" cy="101.3" rx="20" ry="2" fill="#000" opacity=".32"/>';
    (def.pr || []).forEach(p => { if (p[0] === 'box') h += rect(p[1], p[2], p[3], p[4], PAD, 2, OUT) + line([[p[1] + 2, p[2] + 1.2], [p[1] + p[3] - 2, p[2] + 1.2]], 1, PADHI) + post([p[1] + 6, p[2] + p[4]], [p[1] + 6, 100]) + post([p[1] + p[3] - 6, p[2] + p[4]], [p[1] + p[3] - 6, 100]); });
    const sy = P.sy, hy = P.hy, hands = [];
    [-1, 1].forEach(sg => {
      const hip = [cx + sg * 4.6, hy + 1], knee = [cx + sg * P.kx, P.ky], ft = [cx + sg * P.fx, P.fy];
      const T = fr(hip, knee, 1), S = fr(knee, ft, 1);
      h += '<ellipse cx="' + f1(ft[0] + sg * 1.5) + '" cy="' + f1(ft[1] + 0.6) + '" rx="4.2" ry="2.5" fill="' + OUT + '"/><ellipse cx="' + f1(ft[0] + sg * 1.5) + '" cy="' + f1(ft[1] + 0.6) + '" rx="3.6" ry="1.9" fill="' + SKIN + '"/>';
      h += grp([shape(S, PR.shin), {c: knee, r: 3.4}, shape(T, PR.thigh)], SKIN);
      if (col('gmed')) h += musc(lens(T, PR.thigh, sg < 0 ? 1 : 2, 0, 0.45, 0.9), col('gmed'));
      if (def.pr.some(p => p[0] === 'kpad')) h += rect(knee[0] + sg * 5.6 - 2.4, knee[1] - 6, 4.8, 12, PAD, 2, OUT) + line([[knee[0] + sg * 5.6, knee[1] - 4.5], [knee[0] + sg * 5.6, knee[1] + 4.5]], 0.8, PADHI);
    });
    const tw = (y0, y1, k) => y0 + (y1 - y0) * k;
    const torso = [[cx - 2.6, sy - 2], [cx - 10.6, sy + 0.4], [cx - 9.4, tw(sy, hy, 0.3)], [cx - 6.6, tw(sy, hy, 0.68)], [cx - 8.2, hy], [cx - 6, hy + 4], [cx, hy + 5.5],
      [cx + 6, hy + 4], [cx + 8.2, hy], [cx + 6.6, tw(sy, hy, 0.68)], [cx + 9.4, tw(sy, hy, 0.3)], [cx + 10.6, sy + 0.4], [cx + 2.6, sy - 2]];
    h += grp([torso, [[cx - 2.4, sy - 1], [cx - 2.2, sy - 5], [cx + 2.2, sy - 5], [cx + 2.4, sy - 1]]], SKIN);
    h += line([[cx - 6, tw(sy, hy, 0.24)], [cx, tw(sy, hy, 0.3)], [cx + 6, tw(sy, hy, 0.24)]], 0.5, 'rgba(0,0,0,.16)') + line([[cx, tw(sy, hy, 0.35)], [cx, hy - 1]], 0.5, 'rgba(0,0,0,.12)');
    if (col('traps')) h += poly([[cx - 2.6, sy - 3.4], [cx - 9.6, sy - 0.2], [cx - 5, sy + 1.6], [cx, sy + 0.6], [cx + 5, sy + 1.6], [cx + 9.6, sy - 0.2], [cx + 2.6, sy - 3.4]], col('traps'), col('traps') === MP ? 0.68 + 0.32 * ACTV : 1);
    [-1, 1].forEach(sg => {
      const s0 = [cx + sg * 9.6, sy + 1.2], a1 = 90 - sg * P.aa, a2 = a1 - sg * P.ef;
      const e = P_(s0, V(a1, L.ua)), w = P_(e, V(a2, L.fa)), U = fr(s0, e, 1), F = fr(e, w, 1);
      hands.push(P_(w, V(a2, 1.6)));
      h += grp([shape(F, PR.farm), {c: e, r: 2.6}, shape(U, PR.uarm), {c: s0, r: 4.4}, {c: P_(w, V(a2, 1.6)), r: 2.3}], SKIN);
      const c = col('shoulders');
      if (c) h += musc(lens(U, PR.uarm, 1, 0, 0.42, 0.95), c) + musc(lens(U, PR.uarm, 2, 0, 0.42, 0.95), c) + circ(s0, 3.6, c, null, 0, c === MP ? 0.68 + 0.32 * ACTV : 1);
    });
    h += head([cx, sy - L.nk - L.hr - 0.6], 0, true);
    if (def.pr.some(p => p[0] === 'db2')) hands.forEach(w => { h += hexDb(w, 3.9); });
    return GROUND + h + '</g>';
  }

  /* p = faza ciclului (0..1): pauză scurtă în A, A→B, pauză în B, B→A */
  function ease(p) {
    const seg = p < 0.12 ? 0 : p < 0.5 ? (p - 0.12) / 0.38 : p < 0.62 ? 1 : 1 - (p - 0.62) / 0.38;
    return 0.5 - 0.5 * Math.cos(Math.PI * seg);
  }
  const startPose = {};
  function svgInner(id, p) {
    const def = D[id]; if (!def) return '';
    const e = ease(p);
    ACTV = e;
    const P = pose(def, e);
    if (def.front) return frontSVG(def, P, id);
    const sA = startPose[id] || (startPose[id] = solve(pose(def, 0)));
    return sideSVG(def, solve(P), id, sA);
  }

  /* ---------- harta musculară: corp văzut din față și din spate, cu grupele colorate ---------- */
  function bodyMap(m) {
    const col = k => m.p.includes(k) ? 'var(--accent)' : m.s.includes(k) ? 'var(--anim-ms)' : null;
    const BASE = 'var(--map-base)', LINE = 'var(--map-line)';
    const el = (x, y, rx, ry, f) => '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="' + f + '"/>';
    const rr = (x, y, w, h, r, f) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + r + '" fill="' + f + '"/>';
    const pair = (cx, dx, y, rx, ry, f) => el(cx - dx, y, rx, ry, f) + el(cx + dx, y, rx, ry, f);
    function base(cx) {
      return el(cx, 9, 6, 6.6, BASE) + rr(cx - 2.6, 14, 5.2, 5, 1.5, BASE) +
        '<path d="M' + (cx - 11) + ',20 Q' + cx + ',16 ' + (cx + 11) + ',20 L' + (cx + 9.5) + ',38 L' + (cx + 7.5) + ',51 L' + (cx - 7.5) + ',51 L' + (cx - 9.5) + ',38 Z" fill="' + BASE + '"/>' +
        rr(cx - 8.5, 48, 17, 10, 4, BASE) + pair(cx, 11.5, 23, 4.8, 4.4, BASE) +
        pair(cx, 14, 34, 3.1, 7.4, BASE) + pair(cx, 16, 49, 2.5, 7.2, BASE) + pair(cx, 16.6, 58, 1.9, 2.3, BASE) +
        pair(cx, 4.8, 68, 4.9, 11.5, BASE) + pair(cx, 4.8, 81, 3.3, 2.6, BASE) + pair(cx, 4.8, 92, 3.3, 9, BASE) + pair(cx, 5.3, 103, 3.4, 1.7, BASE);
    }
    const F = 25, B = 75;
    let h = '<svg class="bmap" viewBox="0 0 100 108" aria-hidden="true">' + base(F) + base(B);
    /* față */
    if (col('shoulders')) h += pair(F, 11.5, 23, 4.6, 4.2, col('shoulders'));
    if (col('chest')) h += '<path d="M' + (F - 0.6) + ',24 Q' + (F - 9) + ',22.5 ' + (F - 9) + ',27.5 Q' + (F - 7.5) + ',32.5 ' + (F - 0.6) + ',31.5 Z" fill="' + col('chest') + '"/><path d="M' + (F + 0.6) + ',24 Q' + (F + 9) + ',22.5 ' + (F + 9) + ',27.5 Q' + (F + 7.5) + ',32.5 ' + (F + 0.6) + ',31.5 Z" fill="' + col('chest') + '"/>';
    if (col('abs')) h += rr(F - 4, 33.5, 8, 16, 3, col('abs')) + '<path d="M' + F + ',34 V49 M' + (F - 4) + ',38.5 H' + (F + 4) + ' M' + (F - 4) + ',43.5 H' + (F + 4) + '" stroke="' + LINE + '" stroke-width=".6"/>';
    if (col('biceps')) h += pair(F, 14, 34, 2.7, 6.2, col('biceps'));
    if (col('forearms')) { h += pair(F, 16, 49, 2.2, 6.2, col('forearms')); h += pair(B, 16, 49, 2.2, 6.2, col('forearms')); }
    if (col('hipflex')) h += pair(F, 4.8, 58.5, 3.6, 3.4, col('hipflex'));
    if (col('quads')) h += pair(F, 4.8, 68, 4.4, 10.5, col('quads'));
    if (col('gmed')) h += pair(F, 8.2, 58, 1.8, 4, col('gmed'));
    /* spate */
    if (col('traps')) h += '<path d="M' + B + ',14 L' + (B - 9.5) + ',20.5 L' + B + ',29 L' + (B + 9.5) + ',20.5 Z" fill="' + col('traps') + '"/>';
    if (col('shoulders') || col('reardelt')) h += pair(B, 11.5, 23, 4.6, 4.2, col('reardelt') || col('shoulders'));
    if (col('back')) h += '<path d="M' + (B - 1) + ',27 L' + (B - 9) + ',23.5 L' + (B - 8) + ',35 L' + (B - 1.5) + ',42 Z" fill="' + col('back') + '"/><path d="M' + (B + 1) + ',27 L' + (B + 9) + ',23.5 L' + (B + 8) + ',35 L' + (B + 1.5) + ',42 Z" fill="' + col('back') + '"/>';
    if (col('lowerback')) h += rr(B - 4.5, 41, 9, 9, 3, col('lowerback'));
    if (col('triceps')) h += pair(B, 14, 34, 2.7, 6.2, col('triceps'));
    if (col('glutes')) h += pair(B, 4.4, 56, 4.6, 4.6, col('glutes'));
    if (col('gmed')) h += pair(B, 8.2, 52.5, 2, 3.6, col('gmed'));
    if (col('hamstrings')) h += pair(B, 4.8, 70, 4.1, 9.5, col('hamstrings'));
    if (col('calves')) h += pair(B, 4.8, 91, 3, 7.5, col('calves'));
    return h + '<text x="' + F + '" y="107.5" text-anchor="middle">față</text><text x="' + B + '" y="107.5" text-anchor="middle">spate</text></svg>';
  }
  function dayMuscles(exIds) {
    const p = [], s = [];
    exIds.forEach(id => muscles(id).p.forEach(k => { if (!p.includes(k)) p.push(k); }));
    exIds.forEach(id => muscles(id).s.forEach(k => { if (!p.includes(k) && !s.includes(k)) s.push(k); }));
    return {p, s};
  }

  /* ---------- redare în pagină ---------- */
  const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  let paused = reduce, frozenAt = 0.5, raf = 0, last = 0;
  const DUR = 3600;
  function phase(now) { return paused ? frozenAt : (now % DUR) / DUR; }
  function frame(now) {
    raf = 0;
    const els = document.querySelectorAll('.anim[data-anim]');
    if (!els.length) return;
    if (now - last > 30) {
      last = now;
      const p = phase(now);
      els.forEach(el => { const svg = el.querySelector('svg'); if (svg) svg.innerHTML = svgInner(el.dataset.anim, p); });
    }
    if (!paused) raf = requestAnimationFrame(frame);
  }
  /* cadrul se strânge pe zona în care se mișcă silueta; calculat o singură dată pe exercițiu */
  const vbCache = {}, thumbCache = {};
  function fit(svg, id) {
    if (vbCache[id]) { svg.setAttribute('viewBox', vbCache[id]); return true; }
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    [0, 0.2, 0.31, 0.42, 0.5].forEach(p => {
      svg.innerHTML = svgInner(id, p);
      const g = svg.querySelector('g.fig'); if (!g) return;
      const b = g.getBBox(); if (!b.width) return;
      x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y); x1 = Math.max(x1, b.x + b.width); y1 = Math.max(y1, b.y + b.height);
    });
    if (!(x1 > x0)) return false;
    const pad = 6; x0 -= pad; y0 -= pad; x1 += pad; y1 = Math.max(y1 + 2, 104);
    let w = x1 - x0; const h = y1 - y0;
    if (w < h * 1.3) { const nw = h * 1.3; x0 -= (nw - w) / 2; w = nw; }
    vbCache[id] = [x0, y0, w, h].map(n => n.toFixed(1)).join(' ');
    svg.setAttribute('viewBox', vbCache[id]);
    return true;
  }
  function scan(force) {
    document.querySelectorAll('.anim-thumb[data-thumb]').forEach(el => {
      const svg = el.querySelector('svg'), id = el.dataset.thumb; if (!svg || svg.dataset.fit) return;
      if (!fit(svg, id)) return;
      svg.dataset.fit = 1;
      svg.innerHTML = thumbCache[id] || (thumbCache[id] = svgInner(id, 0.5));
    });
    document.querySelectorAll('.anim[data-anim]').forEach(el => {
      const svg = el.querySelector('svg'); if (!svg) return;
      let f = force;
      if (!svg.dataset.fit && fit(svg, el.dataset.anim)) { svg.dataset.fit = 1; f = true; }
      if (f || !svg.innerHTML) svg.innerHTML = svgInner(el.dataset.anim, phase(performance.now()));
      const b = el.querySelector('.anim-btn'); if (b) { b.textContent = paused ? '▶' : '❚❚'; b.setAttribute('aria-label', paused ? 'Pornește animația' : 'Oprește animația'); }
    });
    last = 0;
    if (!raf && !paused) raf = requestAnimationFrame(frame);
  }
  function toggle() {
    if (paused) paused = false; else { frozenAt = phase(performance.now()); paused = true; if (raf) { cancelAnimationFrame(raf); raf = 0; } }
    scan(true);
  }
  function legend(id) {
    const m = muscles(id);
    return '<div class="mus">' + m.p.map(k => '<span class="mu p">' + MN[k] + '</span>').join('') + m.s.map(k => '<span class="mu s">' + MN[k] + '</span>').join('') + '</div>';
  }
  function html(id, name) {
    if (!D[id]) return '';
    return '<div class="anim" data-anim="' + id + '"><svg viewBox="' + VB + '" role="img" aria-label="Animație: ' + name.replace(/"/g, '') + '"></svg>' +
      (D[id].hold ? '<span class="anim-cap">Menține poziția nemișcat</span>' : '') +
      '<button class="anim-btn" data-act="animtoggle" aria-label="Oprește animația">❚❚</button>' + legend(id) + '</div>';
  }
  function thumb(id) { return D[id] ? '<span class="anim-thumb" data-thumb="' + id + '" aria-hidden="true"><svg viewBox="' + VB + '"></svg></span>' : ''; }
  return {D, VB, MN, svgInner, html, thumb, scan, toggle, muscles, bodyMap, dayMuscles, has: id => !!D[id]};
})();

if (typeof module !== 'undefined') module.exports = {ANIM};
