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
| `jsx/inzicht.jsx` | `InzichtPaneel`: Dash > ✨ Inzicht (coach-samenvatting, hoogste series, je poedels, poedels en series met vergelijken, speelprofiel, seriemakers, seriestoppers, omstandigheden, trend) |
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
- Eenmalige aanvulling: in partijen op de 2,30 van vóór `ACQUIT_AANVULLING_TOT` (15 okt 2026) begon iedereen
  met de acquit; `migreerAcquit()`/`vulAcquitAan()` zetten bij laden/importeren in beurt 1 "Acquit" bij Goed
  (caramboles) of Gemist (poedel). Alleen toevoegen, idempotent. Nieuwe partijen nooit automatisch (soms
  wordt de acquit als laatste beurt genomen). Telt niet mee voor "bijgehouden" in Inzicht.
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
  Opmerkingen worden niet in elke partij bijgehouden: alles wat op opmerkingen leunt gebruikt alleen partijen
  met minstens `INZICHT_DEKKING` (25%) beurten met een opmerking; tafel/avond/fase gebruiken alle partijen.
  Kloktijden bewust niet gebruiken: partijen in het Woutje (2,10) worden vaak thuis nagetypt, en partij 1–29
  (apr–jul 2026) zijn op 3 juli in één keer ingeladen (geen tijd per beurt, rond tijdstip). "Partij van de
  avond" (1e/2e/3e, avonden met 2+ partijen) klopt wel. Omstandigheden vergelijken binnen hun eigen groep.
  Vorm wordt uitgelegd in **poedels en series** (`series` in `berekenInzicht`, profiel via `seriesProfiel`): per
  serie-groep (`histogramBuckets`) aantal per partij en aandeel van je caramboles; `hefboom` rekent voor wat één
  poedel minder of één serie van `topMin` per partij oplevert. Niet "caramboles als je scoort" gebruiken: dat zegt
  de speler niets. Vergelijken gaat altijd per tafel via `vergelijkSeries(partijen,discipline,modus,opties)`:
  `helften` (ook voor de coach), `laatste10`, `goedslecht` (slechtste/beste derde) en `vanaf` (alles vóór een
  gekozen maand tegenover alles daarna; standaard `standaardVanaf`). Losse maanden vergelijken is bewust
  weggelaten: per tafel te weinig partijen per maand. Per kant minstens 3 partijen en 50 beurten.
  Hoogste series (`berekenHoogsteSeries`, ook als `inz.hoogste`): alle series vanaf `sterkMin` gegroepeerd per
  aantal (`perAantal`, aantikken in de kaart) met datum/partij/beurt/opmerkingen, record per tafel en per
  tafel laatste 10 partijen tegenover ervoor (gemiddelde hoogste serie en series vanaf `sterkMin` per partij);
  oordeel beter/stabiel/minder bij ±8%, pas vanaf 6 partijen op die tafel.
  Grafiek: per partij een groepje (eigen vlakje, label pNr) met al je series vanaf `vanaf` in volgorde van de
  partij, zonder zo'n serie alleen de hoogste; scrollt zijwaarts en opent rechts (nieuwste). Aantikken toont
  poedels en alle series van die partij (`series`) met beurt en opmerkingen.
  Je poedels (`berekenPoedels`, ook als `inz.poedels`): per tafel percentage en aantal per partij (grafiek zoals bij
  hoogste series, aantikken = beurten, langste reeks, redenen), beste partij (laagste %, alleen partijen van 15+
  beurten), langste reeks, laatste 10 tegenover ervoor (oordeel bij ±2 procentpunt, vanaf 6 partijen) en
  `redenen` (Gemist-labels bij poedels).
  Poedel na poedel per tafel (`poedel.perTafel`) en vergeleken met "na een score", niet met de gewone
  poedelkans: over alle tafels samen geeft de moeilijkere tafel een vals "poedels komen in reeksen".
- Niveau volgt je **vorm**: gemiddelde van je laatste `vormVenster` partijen (Stats; 10/20/30/"alles", standaard
  20). Met het spelelement aan valt per `PUNTEN_PER_DROP` (1000) punten verdiend in die partijen de slechtste
  partij binnen het venster weg, hoogstens `MAX_SCHRAP_AANDEEL` (1 op de 10). **Moyenne** = alle partijen,
  niets geschrapt (officieel). `berekenNiveauInfo(partijen,zonderDrops,opties)`; zonder opties de oude
  berekening (alle partijen, geen plafond), waar `test/snapshot.js` op rust. Teksten via `vormUitleg()`.
- Spelelement aan/uit (Stats, `data.spelelement`, standaard aan; `SpelContext` in `jsx/onderdelen.jsx`). Uit =
  geen badges/punten/Punten-tab/prestatiemeldingen/badge-hints en geen geschrapte partijen
  (`berekenNiveauInfo(partijen,zonderDrops)`); punten worden op de achtergrond wel berekend.
  Leg vorm en moyenne overal uit (`vormUitleg()`, voor seizoenen `gemUitleg()`); waar alle partijen
  meetellen, zeg dat er expliciet bij.

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
  → `allesGoed` moet `true` zijn. Draait `rondgang`, `tijdlijn`, `statstab`, `spelen`, `partijrij`, `spelelement`, `niveau`, `vensters`, `datatab`
  en zet daarna de testdata terug.
- `test/snapshot.js` bevat een referentie-hash van alle berekeningen op de testdata. Puur technische
  wijzigingen moeten die exact gelijk laten; alleen bij een bewuste rekenwijziging `REFERENTIE` bijwerken.
- Zonder browser: `node test/snapshot-node.js` geeft dezelfde hash als `snapshot.js`; met `--details` de volledige
  uitkomst (handig om voor en na een rekenwijziging per discipline te vergelijken).
- Tests die tekst zoeken: gebruik `#root`, niet `document.body` (daarin staat ook de broncode van het Babel-script).
- Na `alles.js` direct herladen, anders schrijft de app de geïmporteerde testback-up terug over de testdata.
- Service worker: `node test/sw-node.js` (de ingebouwde browser ondersteunt geen service workers).
- iOS: `npm run build && npx cap sync ios`, daarna bouwen voor de simulator of `npm run ios` (opent Xcode).

## Bekende eigenaardigheden

- iOS beginscherm-PWA heeft eigen opslag, los van Safari; een opnieuw toegevoegd icoon start leeg.
- iOS legt het beginscherm-icoon eenmalig vast; het verandert niet bij een update.
- GitHub Pages cachet ongeveer 10 minuten; daarom de `?v=`-versie in de script-tags.
- `sw.js` (website): eerst het netwerk, cache als terugval (offline of na 4 s). Nieuwe app-bestanden ook in
  `VOORAF` in `sw.js` zetten; `node test/sw-node.js` controleert dat en test online/offline/traag.
- Na een push: `npm run ios` en opnieuw installeren is nodig om de iOS-app bij te werken.

## Open punten

### Na goedkeuring van het Apple Developer-account (staat op "Pending", paspoort is ingestuurd)

1. **App Store klaarmaken**: ontwikkelteam kiezen in Xcode (Signing & Capabilities), Product → Archive →
   Distribute App → App Store Connect; in App Store Connect schermafbeeldingen (kunnen uit de simulator),
   beschrijving, privacy-URL (`privacy.html`) en App Privacy "Data Not Collected". Na publicatie
   `APP_STORE_URL` in `js/constanten.js` invullen (voor "Deel deze app").
2. **Automatische back-up naar iCloud Drive** (alleen iOS-app), zodat je nooit meer zelf hoeft te exporteren:
   - De app zet zelf een kopie van de data in de iCloud Drive van de gebruiker, map "Biljart Tracker",
     bijgewerkt na elke partij (laatste paar versies bewaren). Blijft bestaan als de app verwijderd wordt en
     is zichtbaar op iPad/Mac.
   - Iedere gebruiker gebruikt zijn eigen iCloud (eigen Apple ID); niets gaat naar de maker of een server.
     Geen externe dienst, dus binnen de harde regels.
   - Nodig: iCloud-capability (iCloud Documents/ubiquity container) in Xcode en een klein eigen Swift-
     plugin, omdat `@capacitor/filesystem` iCloud Drive niet ondersteunt. Kan pas met het betaalde account.
   - Werkt alleen als iCloud Drive aan staat. Zo niet: app werkt zoals nu (data alleen op de telefoon) en
     valt terug op de back-upherinnering hieronder.
   - In het Data-tabblad tonen: "Back-up: automatisch in iCloud Drive ✓" met de datum van de laatste kopie.
   - `privacy.html` aanpassen: er komt een reservekopie in je eigen iCloud Drive waar alleen jij bij kunt.
     "Data Not Collected" in App Store Connect blijft kloppen.
   - De eigen data van de eigenaar gaat één keer over van de website naar de app via Exporteer/Importeer.
3. **Back-upherinnering** (website, Android, en iOS zonder iCloud Drive): alleen bedoeld om eraan te
   herinneren dat data die alleen op je telefoon staat uiteindelijk kwijt kan raken (telefoon kwijt/kapot,
   app of website-opslag verwijderd). Af en toe tonen (bijv. na 10 partijen of een maand zonder export),
   met één tik naar het deelmenu (Exporteer). Op de website ook `navigator.storage.persist()` aanvragen.
   Niet tonen als de automatische iCloud Drive-back-up werkt.

### Overig

- Sneller opstarten: JSX vooraf laten vertalen (bijv. esbuild) in plaats van Babel in de browser; vraagt
  een ontwikkelpakket, dus alleen met akkoord van de eigenaar.
