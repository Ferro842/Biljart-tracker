# Biljart Tracker

Nederlandstalige app voor het bijhouden van carambole-partijen. Communiceer in het Nederlands; alle
UI-teksten zijn Nederlands. De eigenaar test op de telefoon, dus werk in kleine stappen die daar te
controleren zijn.

- Web/PWA: https://ferro842.github.io/Biljart-tracker/ (GitHub Pages vanaf `main`, repo Ferro842/Biljart-tracker)
- iOS-app: Capacitor (`appId nl.ferrovandam.biljarttracker`, webDir `www/`, map `ios/`). Nog niet in de
  App Store; Apple Developer-account is aangevraagd.
- Privacybeleid (voor App Store Connect): `privacy.html`

## Opbouw

React 18.2 en Babel standalone 7.23 draaien in de browser, zonder bundler. Ze staan lokaal in `vendor/`
(identiek aan cdnjs), zodat de app geen externe scripts laadt en offline kan starten.

Laadvolgorde in `index.html` (alles deelt de globale scope):

| Bestand | Inhoud |
|---|---|
| `css/app.css` | Opmaak die niet inline staat (layout, safe area, animaties) |
| `js/constanten.js` | Kleuren, opmerkingenlijsten `GEMIST`/`GOED`, `SK`, `WEB_URL`/`APP_STORE_URL`, `NIVEAUS_*`, `DISCIPLINES`, `TAFELS`, `MIJLPALEN` |
| `js/berekeningen.js` | Puur rekenwerk: `beurtDrempels`, `histogramBuckets`, `stat`, `berekenPrestaties` (badges), records, `berekenNiveauInfo` (drops), `bepaalNiveau`, voorspelling, seizoenen, mijlpalen, `reeksStats`, `besteVenster`, `gemUitleg`, `berekenInzicht` |
| `js/opslag.js` | `IS_NATIVE`, `laadData`/`laadWebData`/`slaOp`, `migreerTafels`, native bestand-I/O |
| `jsx/onderdelen.jsx` | Eerste Babel-script: React-hooks, `Grafiek`, `OpmGrid`, `LogRij`, `PrestatieOverzicht`, `NiveauKaart`, `DashBalk`, `DashGrafiek` |
| `jsx/vensters.jsx` | Overlays: `PartijSamenvatting`, `WelkomstFlow`, `SeizoenArchief`, `BadgeCatalogus`, `NiveauOverzicht` |
| `jsx/partijrij.jsx` | `PartijRij` (Stats) en `LogPartijRij` (Log), met gedeelde `PartijLabels` en `PartijBeheer` |
| `jsx/inzicht.jsx` | `InzichtPaneel`: Dash > ✨ Inzicht (coach-samenvatting, speelprofiel, seriemakers, seriestoppers, omstandigheden, trend) |
| `jsx/dashboard.jsx` | `BeurtenTijdlijn` (beurtengrafiek met selecteren, beste/zwakste reeks) en `Dashboard` |
| `jsx/tabs.jsx` | `LogTab`, `DataTab` (AI-prompt, tekstexport, export/import), `StatsTab` |
| `jsx/spelen.jsx` | `SetupScherm`, `InvoerScherm`, `GemistScherm`, `GoedScherm`; krijgen de spelstatus als object `spel` |
| `index.html` | `APP_VERSIE` en `BiljartTracker`: alle app-status, acties, kop, disciplinekeuze, tabbladen |

Gewone JavaScript (zonder JSX) hoort in `js/`, componenten in `jsx/`. Nieuwe JSX-bestanden krijgen een
`<script type="text/babel" src=...>` vóór het inline Babel-script; volgorde telt.

## Data

- Web: localStorage (en `window.storage` als dat bestaat) onder sleutel `biljart-tracker-v2`.
- iOS-app: bestand `biljart-data.json` in de Library-map (atomisch via `.tmp` + rename), localStorage als
  extra kopie. Zonder bestand wordt eenmalig de localStorage-data overgezet.
- Structuur: `{ partijen:[{id,datum,tafel,doel,doelType,discipline,beurten:[{id,caramboles,gemist[],goed[],tijd}],
  notitie?,...statvelden}], huidigeId, tijdsvenster, seizoenen, laatstGezienNiveauIndex, huidigeDiscipline,
  onboardingGezien, lopendePartij? }`. `huidigeId` is één teller voor partijen én beurten.
- `lopendePartij` (optioneel): `{beurten,tafel,doel,doelType}` van een nog niet afgesloten partij; wordt bij
  elke wijziging bewaard, bij het laden teruggezet en bij afsluiten in dezelfde opslag verwijderd.
- Partij zonder `discipline` = libre; zonder `tafel` wordt gemigreerd door `migreerTafels()`.
- Back-up: Data → Exporteer/Importeer (JSON). "Kopieer data" is alleen een leesbare tekstexport.

## Domein

- Disciplines: libre, driebanden, bandstoten, kader38/47/57/71; elk eigen partijen, gemiddelde, niveau, badges.
- Tafels: "210", "230", "255", "284" (KNBB-maten).
- Niveaus: libre volgt de KNBB-tabel; kader is een eigen praktische indeling, geen officiële KNBB-klassen.
- Badge-drempels per discipline uit `beurtDrempels()`/`histogramBuckets()`; nooit libre-waarden hardcoden.
  Kleur van een beurt: `beurtKleur()`. Kleur van een gemiddelde: `gemGrenzen()`/`gemKleur()` (groen vanaf je
  volgende klasse, goud binnen je huidige klasse, rood daaronder).
- Meeschuivende gemiddelde-drempels (⭐-badge, hint tijdens spelen, Consistentie) gaan in stappen van
  `gemStap()`: 0,5 (libre, kader 38/47), 0,25 (bandstoten, kader 57/71), 0,1 (driebanden).
- "Sterk herstel na poedel" = `opbouwMin` of meer caramboles direct na een poedel.
- Inzicht (`berekenInzicht`): technieken (labels in zowel `GEMIST` als `GOED`) worden beoordeeld op
  slagingspercentage, niet op aantal missers (wie een stoot veel speelt, mist hem ook vaak). Er wordt vaker
  aangevinkt wat misging, dus percentages worden met elkaar vergeleken (`refPct`). Conclusies pas vanaf
  `INZICHT_MIN` voorbeelden; zelf getypte opmerkingen tellen als "Overig".
- Elke `PUNTEN_PER_DROP` (1000) badge-punten schrapt de slechtste partij uit het gemiddelde.
  **"Je gemiddelde" is overal het gemiddelde zonder die geschrapte partijen**; leg dat uit met `gemUitleg()`.
  Waar alle partijen meetellen, zeg dat er expliciet bij.

## Harde regels

1. URL, opslagsleutel `biljart-tracker-v2` en datastructuur behouden. Formaatwijziging = migratie in
   `js/opslag.js` die oude data blijft laden. Gebruikers mogen nooit een lege app zien.
2. Hooks (`useState`, `useMemo`, `useEffect`, `useRef`) altijd vóór een early return.
3. Geen grote base64-blokken in `<head>`, `manifest.json` of de code (gaf eerder een crash op Samsung Internet).
4. `manifest.json`, `sw.js`, `icon192.png`, `icon512.png` niet hernoemen of verplaatsen.
5. Geen API-sleutels, externe diensten of externe scripts. AI-analyse = kopieerbare prompt.
6. Na elke wijziging testen (zie hieronder) en `APP_VERSIE` plus alle `?v=` in `index.html` ophogen
   (formaat `JJJJ-MM-DD.n`); die staat onderaan Stats, zo ziet de eigenaar welke versie geladen is.
7. Niets committen, pushen of installeren zonder akkoord van de eigenaar. Geen `sudo`.

## Testen

Lokaal serveren: `python3 -m http.server 8642` in de projectmap, openen op http://localhost:8642/.

- Testdata laden (in de browserconsole), daarna herladen:
  `localStorage.setItem("biljart-tracker-v2", JSON.stringify(await fetch("/test/testdata.json").then(r=>r.json())))`
- Alle tests (liefst op telefoonformaat 375 breed): `await eval(await fetch("/test/alles.js").then(r=>r.text()))`
  → `allesGoed` moet `true` zijn. Draait `rondgang`, `tijdlijn`, `statstab`, `spelen`, `partijrij`, `vensters`, `datatab`
  en zet daarna de testdata terug.
- `test/snapshot.js` bevat een referentie-hash van alle berekeningen op de testdata. Puur technische
  wijzigingen moeten die exact gelijk laten; alleen bij een bewuste rekenwijziging `REFERENTIE` bijwerken.
- Zonder browser: `node test/snapshot-node.js` geeft dezelfde hash als `snapshot.js`; met `--details` de volledige
  uitkomst (handig om voor en na een rekenwijziging per discipline te vergelijken).
- Na `alles.js` direct herladen, anders schrijft de app de geïmporteerde testback-up terug over de testdata.
- iOS: `npm run build && npx cap sync ios`, daarna bouwen voor de simulator of `npm run ios` (opent Xcode).

## Bekende eigenaardigheden

- iOS beginscherm-PWA heeft eigen opslag, los van Safari; een opnieuw toegevoegd icoon start leeg.
- iOS legt het beginscherm-icoon eenmalig vast; het verandert niet bij een update.
- GitHub Pages cachet ongeveer 10 minuten; daarom de `?v=`-versie in de script-tags.
- De service worker cachet niets; de website heeft dus internet nodig (de iOS-app niet).
- Na een push: `npm run ios` en opnieuw installeren is nodig om de iOS-app bij te werken.

## Open punten

- Offline-cache voor de website (service worker) is nog niet gebouwd.
