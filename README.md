# Training Master

Aplicație de telefon pentru sală: plan de antrenament pe profilul tău, animații care arată cum se face fiecare exercițiu și ce mușchi lucrează, meniu cu porții calculate și jurnal de progres. Merge și fără internet, iar datele rămân pe telefon.

**Deschide aplicația:** https://valentinivascu.github.io/training-master/

## Instalare pe telefon

**iPhone (Safari)**
1. Deschide adresa de mai sus în Safari.
2. Apasă butonul de partajare (pătratul cu săgeată).
3. Alege „Adaugă pe ecranul principal”, lasă activă opțiunea „Deschide ca aplicație web” și apasă „Adaugă”.

**Android (Chrome)**
1. Deschide adresa în Chrome.
2. Apasă meniul cu trei puncte și alege „Instalează aplicația” (sau „Adaugă pe ecranul de pornire”).

Deschide aplicația mereu din iconiță. Din Profil → „Salvează o copie” faci o copie de siguranță a datelor, pe care o poți restaura pe alt telefon.

## Pentru dezvoltare

Sursele sunt în `src/`. Fișierele din rădăcină (`index.html`, `sw.js`, `manifest.webmanifest`, `fonts/`, `icons/`) sunt cele publicate și se generează cu:

```bash
python3 build.py
node test/core.test.js
python3 test/smoke.py
```

Detaliile complete (structură, reguli, logica de calcul, motorul de animație, pașii de publicare) sunt în [CLAUDE.md](CLAUDE.md).

Fontul Manrope este inclus sub licența SIL Open Font License (`fonts/OFL-Manrope.txt`).
