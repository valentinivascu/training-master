# Fișa de Antrenament

Aplicație de telefon pentru sală: plan de antrenament pe profil (gen, obiectiv, nivel, zile pe săptămână), meniu cu porții calculate și jurnal de progres. Merge și fără internet. Datele rămân doar pe telefonul fiecăruia.

## Publicare pe GitHub Pages

1. Pe github.com apasă **New repository**. Nume: `fisa`. Alege **Public** și apasă **Create repository**.
2. În pagina repository-ului apasă **uploading an existing file**.
3. Trage în pagină TOT conținutul acestui folder (`index.html`, `manifest.webmanifest`, `sw.js`, `README.md` și folderul `icons`), apoi apasă **Commit changes**.
4. Mergi la **Settings → Pages**. La **Branch** alege `main` și `/ (root)`, apoi **Save**.
5. După 1-2 minute aplicația este la adresa `https://NUMELE-TĂU.github.io/fisa/`.

## Instalare pe telefon

- **iPhone:** deschide adresa în Safari → butonul de partajare → **Adaugă pe ecranul principal**.
- **Android:** deschide adresa în Chrome → meniul cu trei puncte → **Instalează aplicația**.

Fiecare persoană își face profilul pe telefonul ei. Folosiți mereu pictograma de pe ecran: acolo sunt salvate datele. Din Profil → „Salvează o copie” se face o copie de siguranță.

## Actualizare

Când înlocuiești fișierele cu o versiune nouă, schimbă și numărul din `sw.js` (linia `const CACHE = ...`). Telefoanele iau versiunea nouă la a doua deschidere.
