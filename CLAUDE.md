# Training Master: context pentru Claude

Aplicație web instalabilă pe telefon (PWA) pentru sală: plan de antrenament pe profil, animații ale exercițiilor cu mușchii lucrați, meniu cu porții calculate și jurnal de progres. Funcționează fără internet, iar datele stau doar pe telefonul fiecărui utilizator.

- Adresă publică: https://valentinivascu.github.io/training-master/
- Repository: `valentinivascu/training-master` (GitHub Pages servește rădăcina ramurii `main`)
- O folosesc doi oameni: proprietarul (iPhone, Safari) și partenera lui (Samsung, Android, Chrome). Fiecare are profilul lui pe telefonul lui.

## Cum lucrăm cu proprietarul

- Toată comunicarea și tot textul din aplicație sunt **în română, cu diacritice** (ș, ț, ă, î, â).
- Preferă **pași numerotați**, explicații scurte și lucruri care merg pe bune: testează înainte să spui că e gata.
- E începător la programare: nu presupune că știe termeni tehnici. Instrucțiunile pentru telefon trebuie date pas cu pas, separat pentru iPhone și Android.
- După fiecare publicare, verifică online că versiunea nouă se servește (vezi „Publicare”).

## Structură

```
src/                 sursele (aici se lucrează)
  data.js            exerciții (EX), zile de antrenament (BLOCKS), programe (PROGRAMS),
                     biblioteca de antrenamente (LIB, LIB_ORDER, LIBK), ingrediente (ING), rețete (RECIPES)
  core.js            calcule: ținte nutriționale, program, progresie, scoruri, rezolvarea porțiilor
  anim.js            motorul de animație SVG, grupele musculare (MUS, MDEF), harta musculară (bodyMap)
  app.js             interfața: stare, ecrane, acțiuni, salvare în localStorage
  styles.css         design (variabile de culoare în :root)
  template.html      scheletul paginii; build-ul pune CSS și JS în el
  sw.js              service worker (funcționare fără internet)
  manifest.webmanifest, fonts/ (Manrope, licență OFL)
build.py             construiește fișierele publicate în rădăcină
tools/make_icons.py  generează icons/ (Pillow)
test/core.test.js    teste pentru date și calcule (Node)
test/smoke.py        parcurgere reală în browser, ecran de telefon (Playwright)
test/sheet.py        planșă cu toate animațiile (start, mijloc, capăt) în test/shots/
test/audit.js        audit nutrițional: abateri, porții maxime, repetări de rețete
test/worst-day.js    cel mai prost meniu pentru două profiluri extreme
index.html, sw.js, manifest.webmanifest, fonts/, icons/, .nojekyll   = fișierele PUBLICATE (generate)
```

**Nu edita niciodată `index.html` din rădăcină de mână.** Se generează din `src/` cu `python3 build.py`.

## Comenzi

```bash
python3 build.py                 # asamblează index.html + copiază sw.js, manifest, fonts
node test/core.test.js           # trebuie să termine cu „TOATE VERIFICĂRILE AU TRECUT”
python3 test/smoke.py            # trebuie să termine cu „TOATE PROBELE AU TRECUT”
python3 test/sheet.py            # planșe cu animațiile; uită-te la ele după orice schimbare în anim.js
python3 test/sheet.py squat,bench  # doar anumite exerciții, mai mari
node test/audit.js               # după orice schimbare la ingrediente, rețete sau calcule
python3 tools/make_icons.py      # doar dacă schimbi iconița
```

Testele de browser au nevoie de `pip install playwright` și de un Chromium (`playwright install chromium`). Folosesc Chrome dacă există, altfel Chromium.

## Publicare (fiecare versiune nouă)

1. Mărește `APP_VERSION` în `src/app.js` **și** `CACHE` în `src/sw.js` (ex. `training-master-2.6`). Fără schimbarea lui `CACHE`, telefoanele nu iau versiunea nouă.
2. `python3 build.py`, apoi ambele seturi de teste.
3. Commit cu sursele **și** fișierele generate, în română, apoi push pe `main`.
4. GitHub Pages publică în 1-2 minute. Verifică în browser: `fetch('index.html')` de două ori (primul apel actualizează memoria service worker-ului) și caută `APP_VERSION`.
5. Spune-i proprietarului să deschidă aplicația de două ori pe telefon: prima dată descarcă versiunea nouă în fundal, a doua oară o afișează.

## Reguli care nu se încalcă

- **`LS_KEY = 'fisa-antrenament.v2'` nu se schimbă niciodată.** E cheia de salvare; numele vechi a rămas intenționat ca datele existente să nu se piardă. Orice schimbare de format a datelor se face cu migrare în `normProfile`.
- **`LIB` se modifică doar adăugând la final.** Antrenamentele din bibliotecă au indicele `100 + poziția în LIBK`, iar ședințele salvate folosesc acest indice. Zilele din program au indicii `0..n-1`.
- Totul rămâne într-un singur `index.html`, fără biblioteci externe și fără resurse de pe alte domenii (aplicația trebuie să meargă offline). Fonturile sunt locale.
- Fișiere noi publicate (imagini, fonturi) se adaugă și în `ASSETS` din `src/sw.js`.
- Datele nu pleacă niciodată de pe telefon. Nu adăuga analytics, servere sau conturi fără să întrebi.
- Repository-ul e **public**: nu pune date personale (greutăți, nume, telefoane) în cod sau în commit-uri.

## Modelul de date (localStorage)

```js
S = {v: 2, active: profileId, profiles: {
  [id]: {id, name, sex: 'm'|'f', age, h, w, act: 'sed'|'mod'|'act', goal: 'masa'|'ton'|'slab',
         level: 'beg'|'int', days: 3|4|5, focus: 'echilibrat'|'inferior'|'superior', meals: 0|3..6,
         accent: 'rust'|'teal'|'violet'|'rose', created, deload?, kcalO?, protO?,
         swaps: {'BLOCK:exId': altExId},
         sessions: [{d: 'YYYY-MM-DD', i, k: blockKey, n: nume, sets: {exId: [{w, r, ok}]}, done?, t0?, t1?}],
         bw: [{d, w, c?}],                      // cântăriri (c = talie)
         food: {'YYYY-MM-DD': {pick: {m1: idx}, eat: {m1: 1}, water: pahare}}}  // păstrate ~45 de zile
}}
```

## Logica de domeniu (pe scurt)

- **Calorii:** Mifflin-St Jeor × activitate (sed 1,4 / mod 1,55 / act 1,7, +0,025 pe fiecare zi peste 4). Masă musculară +12%, slăbire −18% cu prag minim (max(BMR×1,05; 1300 F / 1600 M)). Sub IMC 18,5 sau sub 18 ani, slăbirea devine menținere.
- **Proteine:** 2 g/kg (1,8 la tonifiere), raportat la greutatea de referință plafonată la IMC 25 și la maximum 30% din calorii. Grăsimi: max(0,8 g/kg, 25% kcal). Carbohidrați: restul.
- **Meniu:** fiecare masă primește o parte din calorii (`SLOTSETS`). `solveMeal` scalează sursa de proteine și de carbohidrați, plafonează porțiile la `ING.mx` (valori realiste) și completează cu alimente potrivite mesei (`FILL`). `planDay` face mai multe treceri și păstrează cea mai bună variantă. Rețetele se rotesc pe zile (nicio repetare în 8 zile la aceeași masă). Țintă: abatere zilnică sub 6% (testată).
- **Progresie dublă:** păstrezi greutatea până la capătul intervalului de repetări la toate seturile, apoi urci: +2 kg la gantere, +2,5 kg la bară, +5 kg la picioare doar peste 40 kg. La exercițiile cu greutatea corpului se adaugă o greutate mică; la tracțiunile asistate se scade contragreutatea.
- **Recorduri:** `score()` din core.js (forță estimată Epley; la greutatea corpului contează repetările; la asistate, contragreutatea mai mică e mai bună; la plank, secundele).
- **Programe:** `PROGRAMS[focus][zile]` → chei din `BLOCKS`. Intermediarii primesc un set în plus la primele două exerciții.
- **Biblioteca „Ce lucrezi azi?”:** `LIB` pe categorii, ordinea din `LIB_ORDER` depinde de gen (femei: fesieri primele; bărbați: Push/Pull/Legs). Bazată pe cercetare: fiecare grupă de 2 ori pe săptămână e mai bine decât o dată (Schoenfeld 2016); fesierii, 2-3 ședințe pe săptămână, combinând hip thrust, genuflexiuni sau fandări, îndreptări și abducții (Contreras). La zilele „pe grupe”, aplicația afișează un sfat despre frecvență.
- **Săptămână ușoară:** după 7 săptămâni cu antrenamente de la ultima resetare.

## Animații (src/anim.js)

- Vedere laterală, silueta privește spre dreapta. Unghiuri în grade, coordonate SVG: 0 = înainte, 90 = jos, −90 = sus. Lungimi în `L`.
- Fiecare exercițiu din `D` are `b` (comun), `A` (start) și `B` (capătul mișcării); animația merge A → B → A. Poziția se dă prin unghiuri (`th`, `sh`, `t`, `ua`, `fa`) sau prin ținte rezolvate cu cinematică inversă (`hand`, `hr` relativ la umăr, `hh` relativ la șold, `foot`, `foot2`). `ank` ancorează glezna pe podea. `us` scurtează vizual brațul (coate depărtate). `mir: true` pentru poziții cu fața în jos (flotări, plank). `front: true` pentru vedere frontală (ridicări laterale, abducții).
- Echipament (`pr`): `bench`, `seat`, `box`, `line` (cadru metalic), `rack`, `stack` (turn cu greutăți care se ridică după deplasarea mâinii sau a gleznei), `cable`, `lever`, `pad`, `plate`, `db`, `dbv`, `grip`, `platform`, `backpad`, `cpad`, `mat`.
- Mușchii: `MUS[id] = 'principali|secundari'`, desenați după `MDEF`. Principalii își cresc intensitatea în timpul efortului.
- Orice exercițiu nou din `EX` are nevoie de intrare în `D` și în `MUS` (testul o verifică indirect prin `ANIM.has`). Verifică vizual cu `test/sheet.py id`.

## Design

- Temă închisă. Culori în `:root` din styles.css (`--bg #141619`, `--surface`, `--line`, `--text`, `--muted`). Accentul (`--accent`, `--accent-dim`) vine din culoarea profilului: rust, teal, violet sau rose.
- Font Manrope (variabil, inclus local). Butoane mari (min. 44-54 px), carduri cu colțuri de 14-20 px, fereastră de jos (`openSheet`) pentru alegeri, mesaje scurte (`toast`).
- Componente: `.hero` (antrenamentul zilei), `.ex` (exercițiu cu animație și seturi), `.wcard` + `.bmap` (selector cu hartă musculară), `.meal`, `.kring` (inel de calorii), `.vchart` (volum pe săptămână).
- Ton: direct, prietenos, fără jargon. Butoanele spun ce fac („Începe antrenamentul”, „Salvează o copie”).

## Idei pentru mai departe (necerute încă)

- Sincronizare între telefoane sau copie automată în cloud (acum doar export și import manual de fișier JSON).
- Constructor de antrenament propriu (alegi exercițiile).
- Încălzire ghidată și seturi de încălzire calculate.
- Notificare când se termină pauza, cu ecranul blocat.
- Temă deschisă.
