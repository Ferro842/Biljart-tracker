# Biljart Tracker

Nederlandstalige app voor het bijhouden van carambole-partijen. Communiceer in het Nederlands; alle
UI-teksten zijn Nederlands. De eigenaar test op de telefoon, dus werk in kleine stappen die daar te
controleren zijn.

- Web/PWA: https://ferro842.github.io/Biljart-tracker/ (GitHub Pages vanaf `main`, repo Ferro842/Biljart-tracker)
- iOS-app: Capacitor (`appId nl.ferrovandam.biljarttracker`, webDir `www/`, map `ios/`). Alleen iPhone
  (`TARGETED_DEVICE_FAMILY = 1`), `ITSAppUsesNonExemptEncryption = false`. Apple Developer-account goedgekeurd (17 okt 2026).
- Android-app: Capacitor (map `android/`, zelfde id; `npm run android` opent Android Studio). Iconen en opstartscherm
  gemaakt uit het iOS-icoon (Swift-scriptjes, geen extra pakketten).
  Bouwen zonder Android Studio: `npx cap sync android && cd android && JAVA_HOME=~/Library/Java/JavaVirtualMachines/jbr-21.0.11/Contents/Home ./gradlew assembleDebug`
  (Gradle 8.14 werkt niet met Java 25). Emulator `Pixel_9` (API 36): `~/Library/Android/sdk/emulator/emulator -avd Pixel_9`.
  Systeembalken donkergroen via `res/values/styles.xml` + `colors.xml`; witte icoontjes via `SystemBars.style = DARK` in
  `capacitor.config.json` (geldt ook voor iOS). Play-schermafbeeldingen max. 2:1 → `store/screenshots/android/play/` (1080×2160).
- Vindbaarheid (ASO): `store/aso.md` gaat vóór naam/ondertitel/trefwoorden in `app-store.md` en `talen.md` (per taal,
  plus English (U.K.) en Spanish (Mexico) voor extra trefwoorden; controle met `node store/controleer-lengtes.js`, ook op
  dubbele woorden). Merknaam nog niet gekozen (voorkeur "Carom Tracker"). Website: `<title>`, meta description, Open Graph
  en JSON-LD in de kop van `index.html`, plus `<noscript>`-tekst.
- Beoordeling vragen: `beoordelingMoment()`/`vraagBeoordeling()` in `js/opslag.js`, aangeroepen in `bewaarPartij` (record,
  beste partij, hogere klasse, gehaald doel; vanaf 5 partijen, hoogstens eens per 120 dagen en 3 keer; `data.beoordelingGevraagd`).
  Werkt alleen met de InAppReview-plugin (@capacitor-community/in-app-review); zonder plugin gebeurt er niets.
- Store-materiaal in `store/`: teksten (`app-store.md`, `play-store.md`), voorbeelddata voor schermafbeeldingen
  (`node store/maak-demodata.js` → `demodata.json`, geen echte namen), Play-pictogram en feature graphic (`store/play/`).
- Privacybeleid (voor App Store Connect): `privacy.html`

## Opbouw

React 18.2 en Babel standalone 7.23 draaien in de browser, zonder bundler. Ze staan lokaal in `vendor/`
(identiek aan cdnjs), zodat de app geen externe scripts laadt en offline kan starten.

Laadvolgorde in `index.html` (alles deelt de globale scope):

| Bestand | Inhoud |
|---|---|
| `css/app.css` | Opmaak die niet inline staat (layout, safe area, animaties) |
| `js/constanten.js` | Kleuren, opmerkingenlijsten `GEMIST`/`GOED`, `SK`, `WEB_URL`/`APP_STORE_URL`, `NIVEAUS_*`, `DISCIPLINES`, `TAFELS`, `MIJLPALEN` |
| `js/taal.js`, `js/taal-en/fr/de.js` | Talen: `t("Nederlandse tekst",{vars})`, `TAAL`, `zetTaal`, `taalVoorData`, `kortNaam`, `getalTekst`; vertalingen per taal (sleutel = Nederlandse tekst) |
| `js/berekeningen.js` | Puur rekenwerk: `beurtDrempels`, `histogramBuckets`, `stat`, `berekenPrestaties` (badges), records, `berekenNiveauInfo` (drops), `bepaalNiveau`, voorspelling, seizoenen, mijlpalen, `reeksStats`, `besteVenster`, `gemUitleg`, `berekenInzicht` |
| `js/opslag.js` | `IS_NATIVE`, `laadData`/`laadWebData`/`slaOp`, `migreerTafels`, native bestand-I/O |
| `jsx/onderdelen.jsx` | Eerste Babel-script: React-hooks, `Grafiek`, `OpmGrid`, `LogRij`, `PrestatieOverzicht`, `NiveauKaart`, `DashBalk`, `DashGrafiek` |
| `jsx/wauw.jsx` | Wauw-onderdelen: `Telop` (optellende cijfers), `vier()`/`VieringLaag`, `maakPartijKaart`/`maakSeizoenKaart` + `deelAfbeelding` (canvas → delen), `DeelKaartKnop`, `SeizoenVerhaal` ("Je seizoen in beeld"), `KalenderPaneel` (Dash → Kalender), `DoelRing`/`DoelInstellen` |
| `jsx/vensters.jsx` | Overlays: `PartijSamenvatting`, `WelkomstFlow`, `SeizoenArchief`, `BadgeCatalogus`, `NiveauOverzicht` |
| `jsx/partijrij.jsx` | `PartijRij` (Stats) en `LogPartijRij` (Log), met gedeelde `PartijLabels` en `PartijBeheer` |
| `jsx/inzicht.jsx` | `InzichtPaneel`: Dash > ✨ Inzicht (coach-samenvatting, hoogste series, je poedels, poedels en series met vergelijken, speelprofiel, seriemakers, seriestoppers, omstandigheden, trend) |
| `jsx/dashboard.jsx` | `BeurtenTijdlijn` (beurtengrafiek met selecteren, beste/zwakste reeks) en `Dashboard` |
| `jsx/tabs.jsx` | `LogTab`, `StatsTab` (seizoen, niveau, partijen), `InfoTab` (uitleg, weergave, spelelement, back-up via `DataTab ingebed`, wissen, over) |
| `jsx/spelen.jsx` | `SetupScherm`, `InvoerScherm`, `GemistScherm`, `GoedScherm`; krijgen de spelstatus als object `spel` |
| `index.html` | `APP_VERSIE` en `BiljartTracker`: alle app-status, acties, kop, disciplinekeuze, tabbladen |

Gewone JavaScript (zonder JSX) hoort in `js/`, componenten in `jsx/`. Nieuwe JSX-bestanden krijgen een
`<script type="text/babel" src=...>` vóór het inline Babel-script; volgorde telt.

## Data

- Web: localStorage (en `window.storage` als dat bestaat) onder sleutel `biljart-tracker-v2`. `laadWebData()` gebruikt
  ook data zonder partijen (nieuwe speler: instellingen, welkomstscherm gezien, eerste lopende partij); een kopie mét
  partijen in `window.storage` gaat dan voor. (Tot 18 okt 2026 werd zo'n kopie genegeerd: na herladen weer welkomstscherm.)
- iOS-app: bestand `biljart-data.json` in de Library-map (atomisch via `.tmp` + rename), localStorage als
  extra kopie. Zonder bestand wordt eenmalig de localStorage-data overgezet.
- Structuur: `{ partijen:[{id,datum,tafel,doel,doelType,discipline,beurten:[{id,caramboles,gemist[],goed[],tijd}],
  notitie?,...statvelden}], huidigeId, tijdsvenster, seizoenen, laatstGezienNiveauIndex, huidigeDiscipline,
  onboardingGezien, lopendePartij? }`. `huidigeId` is één teller voor partijen én beurten.
- `lopendePartij` (optioneel): `{beurten,tafel,doel,doelType}` van een nog niet afgesloten partij; wordt bij
  elke wijziging bewaard, bij het laden teruggezet en bij afsluiten in dezelfde opslag verwijderd.
  Op het startscherm staat hij bovenaan (Doorgaan/Afsluiten); Start partij met een lopende partij vraagt eerst bevestiging.
- Partij zonder `discipline` = libre; zonder `tafel` wordt gemigreerd door `migreerTafels()`.
- Eenmalige aanvulling: in partijen op de 2,30 van vóór `ACQUIT_AANVULLING_TOT` (15 okt 2026) begon iedereen
  met de acquit; `migreerAcquit()`/`vulAcquitAan()` zetten bij laden/importeren in beurt 1 "Acquit" bij Goed
  (caramboles) of Gemist (poedel). Alleen toevoegen, idempotent. Nieuwe partijen nooit automatisch (soms
  wordt de acquit als laatste beurt genomen). Telt niet mee voor "bijgehouden" in Inzicht.
- Seizoenen: `data.seizoenen` [{id,naam,startDatum,eindDatum}]. "Seizoen afsluiten" (Stats) vraagt de begindatum van
  het nieuwe seizoen (standaard nu; eerder kan, bijv. om een grens te herstellen). "Laatste seizoensgrens ongedaan
  maken" staat in het archiefvenster (niet direct onder de knoppen: was per ongeluk aan te tikken).
- Back-up: Info → Exporteer/Importeer (JSON). "Kopieer data" is alleen een leesbare tekstexport.

## Domein

- Vierbal (`vierbal`, 18 okt 2026; Korea "sagu"/4구, Japan): paars laken, klassen = Koreaanse handicap 30–1000
  (`NIVEAUS_VIERBAL`, grens = handicap ÷ 200 als gemiddelde: een schatting), drempels zoals Bandstoten. In de balk via
  `hoofdDisciplines(data,discipline)`/`vierbalZichtbaar()`: standaard alleen in het Koreaans (en Japans), anders Info →
  Weergave → Vierbal (`data.vierbal`). Met vijf knoppen is de balk smaller (`vijfKnoppen`; gemeten op 375 breed in alle
  talen, ook met "Kader 47/1"). Strafpunt (speelbal raakt die van de tegenstander): knop alleen bij vierbal, optioneel veld
  `straf` op de beurt; gaat van de partijscore af (`totCarLp`, doel), niet van gemiddelde/niveau (`strafTotaal(p)`).
- Disciplines: libre, driebanden, bandstoten, kader35/38/471/47/52/57/71 (`KADER_VARIANTEN`, op volgorde van de getallen);
  elk eigen partijen, gemiddelde, niveau, badges. 35/2 en 52/2 = Duits klein biljart (volgen 38/2 en 57/2), 47/1 = groot
  biljart (volgt 71/2). Lagere drempels voor `KADER_LAAG` (52/2, 57/2, 47/1, 71/2), zoals Bandstoten.
  Welkomstscherm: Kader aantikken kiest meteen Kader 38/2 (laken rood), daarna eventueel een andere variant.
- Info → Kopieer data / AI-prompts: na gelukt kopiëren alleen "Gekopieerd!"; alleen als kopiëren mislukt staat de tekst
  in beeld om zelf te kopiëren (`handmatig`, `data-handmatig-kopieren`).
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
  `redenen` (Gemist-labels bij poedels). Wat als: per partij poedels aantikken en omzetten naar N caramboles (nieuw
  partijgemiddelde); per tafel `acquit` (beurten met label Acquit): kans en caramboles bij lukken kiezen → nieuw
  gemiddelde. Vanaf 5 aangevinkte acquits per tafel (onder 15 met waarschuwing; op de 2,10 vaak niet aangevinkt); zonder keuze rekent het met de echte waarden (nu = ±0).
  Poedel na poedel per tafel (`poedel.perTafel`) en vergeleken met "na een score", niet met de gewone
  poedelkans: over alle tafels samen geeft de moeilijkere tafel een vals "poedels komen in reeksen".
- Niveau volgt je **vorm**: gemiddelde van je laatste `vormVenster` partijen (klasse-overzicht rechtsboven; 10/20/30/"alles", standaard
  20; Stats verwijst ernaar). Met het spelelement aan valt per `PUNTEN_PER_DROP` (1000) punten verdiend in die partijen de slechtste
  partij binnen het venster weg, hoogstens `MAX_SCHRAP_AANDEEL` (1 op de 10). **Moyenne** = alle partijen,
  niets geschrapt (officieel). `berekenNiveauInfo(partijen,zonderDrops,opties)`; zonder opties de oude
  berekening (alle partijen, geen plafond), waar `test/snapshot.js` op rust. Teksten via `vormUitleg()`.
  Altijd via `berekenVorm(partijen,schrapt,vormVenster)` met `schrapt` = spelelement aan én `data.schrappen!==false`
  (schakelaar "Slechtste partijen schrappen" in het klasse-overzicht; uit = punten/badges blijven, niets geschrapt).
  Label "moyenne" alleen bij alle partijen en niets geschrapt (`!venster&&!aantalDrops`), anders "vorm".
- Laken-kleur per discipline: libre groen, driebanden blauw, bandstoten grijs, kader rood. Alle groentinten zijn
  CSS-variabelen `--c-<hex>` (standaard in `css/app.css`); `zetThema()` in `js/constanten.js` rekent ze om (met het kader-keuzemenu open al rood)
  (`themaVan`/`themaKleur`). Nieuwe groentint? Toevoegen aan `THEMA_KLEUREN` en `:root` en als `var(--c-..)` gebruiken;
  in SVG alleen via `style={{fill/stroke}}`. GOUD/WIT/ROOD/GRNT blijven vast. Het logo in de kop is de SVG-component `Logo`
  (`jsx/onderdelen.jsx`), laken via `--c-3f8a3a`/`--c-1d4a1d`; `logo.png` blijft voor favicon en offline-cache.
- Weergave (Info → Weergave, ook het eerste welkomstscherm; bestaande gebruikers krijgen eenmalig een melding op Spelen,
  `data.weergaveTipGezien`): `data.tekstgrootte` normaal/groot/extra (`TEKSTGROOTTES`,
  CSS `zoom` op `.app` met hoogte `calc(100vh / zoom)`; bij groter geen ondertitel in de kop en tijdens een partij
  geen klasse-knop) en `data.eenvoudig` (`EenvoudigContext`): Noteer slaat direct op zonder opmerkingen-stap,
  spelelement staat er los van (eigen instelling), Dash alleen Inzicht, Trend (en Punten als het spelelement aan staat), Inzicht zonder de uitgebreide kaarten. Knop "+ opmerking" naast
  Noteer geeft toch de opmerkingen-stap; de opmerkingenkaarten in Inzicht verschijnen dan vanzelf (vanaf één
  bijgehouden partij). Uitleg voor gebruikers: `UitlegVenster` ("ℹ️ Zo werkt de app", onder Start partij en in
  bovenaan Info); bij nieuwe functies daar ook bijwerken. Schuifbalken in flex:
  `minWidth:0`, anders steken ze uit bij grote tekst.
- Wedstrijdbriefje (📷 op Spelen, `BriefjeImport` in `jsx/vensters.jsx`): de speler stuurt een foto met
  `BRIEFJE_PROMPT` naar zijn eigen AI-chat en plakt het antwoord; `leesBriefje()` leest het (ruimhartig),
  `controleerBriefje()` markeert alleen beurten die afwijken van de lopende totalen (met voorstel). Acquit: linker kolom = beurt 1,
  rechter = laatste beurt (aanpasbaar); Goed of Gemist "Acquit" volgt uit caramboles >0. Opmerkingen per beurt via ✎ (OpmGrid). Opslaan via
  `bewaarPartij()` (ook gebruikt door `sluit()`): op datumvolgorde ingevoegd, `bron:"briefje"`, geen opmerkingen.
  Later eventueel: herkenning op de iPhone zelf (Apple Vision, eigen plugin) met hetzelfde controlescherm.
- Wauw (17 okt 2026): vieringen bij topserie/record (in `noteer`), hogere klasse, beste partij ooit en gehaald doel
  (in `bewaarPartij`); `data.animaties===false` zet animaties en vieringen uit (klasse `rustig` op `<html>`).
  Doel per discipline in `data.doelen[discipline]` = {waarde,datum,start,gehaald,gezet}; ring in het klasse-overzicht
  (`NiveauOverzicht`, knop rechtsboven; daar ook de keuze 10/20/30/alle voor je vorm) via `mijnDoel`; let op: `doel`/`setDoel` zijn het partijdoel). Het beginpunt rekent `mijnDoel` (index.html) steeds opnieuw uit
  met de huidige vorm-instelling over de partijen van vóór `gezet`; de bewaarde `start` alleen als terugval. Anders springt
  het percentage mee als je de vorm-instelling wisselt (gebeurde: begin over alle partijen, vorm over 10). "Je seizoen in beeld" opent vanzelf na Seizoen afsluiten
  (`berekenSeizoenVerhaal` in `js/berekeningen.js`). Partijkaart via "📤 Deel als kaart" (samenvatting, partijregels).
  Tests zetten `window.__testRustig=true` (alles.js), zodat `Telop` meteen eindwaarden toont.
- Kop (logo, klasse, disciplines; `data-kop`) en tabbalk (`data-tabbalk`, sticky) komen uit `kopBlok(opties)` in
  `index.html` en staan bovenaan in het scrollvak van elk tabblad (`useContext(KopContext)`), zodat de kop gewoon met je
  vinger meeschuift en vanzelf terugkomt bovenaan. Geen animatie of scroll-luisteraar (het oude inklappen voelde houterig:
  de inhoud sprong los van je vinger). Opties: `rand` (zijpadding van het vak, negatief teruggezet), `onder` (ruimte
  onder de tabbalk), `extra` (rij die mee plakt, bijv. de Dash-tabs). Tijdens een partij (`inSpel`) is KopContext null en
  staat de kop niet in beeld: op het invoerscherm alleen een smalle spelbalk (`data-spelbalk`: discipline · tafel, ☰ Menu
  klapt `kopBlok()` uit, Afsluiten), in de opmerkingen-stappen (Gemist/Goed) niets; hun vervolgknoppen staan vast
  onderaan (`STAP_KNOPPEN`) en het raster (`OpmGrid vullen`) past altijd in één keer: rijen verdelen de hoogte, bij krappe
  rijen eerst zonder icoontjes, dan kleinere tekst (gemeten met ResizeObserver; scrollen alleen als vangnet). Nieuw tabblad? Zelf `kopBlok` bovenaan het scrollvak zetten.
- Vensters (overlays) binnen `.app` worden mee-gezoomd bij grote tekst: hoogtes in vh altijd als
  `calc(85vh / var(--zoom,1))`, anders vallen ze bij Extra groot onder het scherm.
- Kalender (Dash): alle maanden vanaf je eerste partij tot nu (ook lege maanden); details van een dag als hele rij direct
  onder de rij met die maand (`kolommen` gemeten).
- Opmerkingen achteraf: Log/Stats → partij → ✎ Opmerkingen aanvullen (`OpmerkingenBewerken` in `jsx/vensters.jsx`, opslaan via
  `OpmerkingenContext` = `slaOpmerkingenOp` in index.html; alleen gemist/goed per beurt, zelf getypte blijven staan).
  Stappen zoals tijdens het spelen: lijst → beurt → "Waardoor eindigde de serie?" → "Wat ging goed?" (niet bij poedel) →
  Klaar = terug in de lijst; Opslaan/Annuleer alleen in de lijst.
- `Grafiek` (beurten van een partij, ook tijdens het spelen) meet zijn breedte: alle beurten passend; pas onder 6 px per
  beurt zijwaarts scrollen, dan schuift hij mee naar de laatste beurt.
- Invoerscherm: onder Noteer eerst de grafiek, dan de spelelement-meldingen. Meldingen kort houden (één regel bij Extra
  groot, ±40 tekens); bij Extra groot past zo alles in één scherm (402×778 getest), scrollen alleen als vangnet.
- Hoofdschermen hebben `className="scrollvak"` (`css/app.css`): een onzichtbaar streepje 1 px hoger dan het vak, zodat ze
  op iOS altijd meeveren aan de rand, ook als alles past. Nieuw scrollend hoofdscherm? Ook `scrollvak` geven.
- Dash-tabrij loopt door op een tweede regel (`flexWrap`) als de tabs niet naast elkaar passen.
- Grafieken die zijwaarts scrollen: `touchAction` "pan-x pan-y", nooit alleen "pan-x" (dan kun je er niet overheen
  omhoog/omlaag vegen en lijkt het scherm te hangen). Alleen tijdens slepen/selecteren "none". Dash heeft geen eigen kopbalk meer; ❓ Uitleg staat vooraan in de Dash-tabrij.
- ⭐-drempels (badges) gaan altijd over al je eerdere partijen (`tijdsvensterMaanden` = null); de instelling
  "Tijdvenster voor prestatie-drempels" is vervallen (16 okt 2026; op echte data vrijwel geen verschil met de laatste
  20 partijen). `berekenPrestaties` accepteert nog maanden voor de snapshot-test.
- Spelelement aan/uit (Info, `data.spelelement`, standaard aan; `SpelContext` in `jsx/onderdelen.jsx`). Uit =
  geen badges/punten/Punten-tab/prestatiemeldingen/badge-hints en geen geschrapte partijen
  (`berekenNiveauInfo(partijen,zonderDrops)`); punten worden op de achtergrond wel berekend.
  Leg vorm en moyenne overal uit (`vormUitleg()`, voor seizoenen `gemUitleg()`); waar alle partijen
  meetellen, zeg dat er expliciet bij.

## Talen (vanaf 18 okt 2026)

- Nederlands, Engels, Frans, Duits, Spaans, Turks, Koreaans (18 okt 2026); later eventueel Japans en Vietnamees. Nieuwe taal:
  `js/taal-<code>.js` + `TALEN` en `taalLocale()` in `js/taal.js` + script-tag in index.html + `VOORAF` in sw.js (en het aantal
  in `test/sw-node.js`); de controle vindt taalbestanden zelf. Dash-tabs moeten op 440 breed op één regel passen (meten;
  Frans/Spaans/Engels hebben daarom kortere tabnamen). Keuze: Info → Weergave → Taal en het eerste
  welkomstscherm (`data.taal`). Zonder keuze: Nederlands voor bestaande gebruikers (onboardingGezien/partijen), anders de taal
  van het toestel (`taalVoorData`). `zetTaal()` draait bovenaan de render van BiljartTracker; `t()` leest de globale `TAAL`.
- Nieuwe tekst altijd als `t("Nederlandse tekst",{n:..})` en vertalen in alle `js/taal-*.js`; controle:
  `node test/vertalingen-node.js` (zoekt `t("...")` en `t(cond?"a":"b")` in de code; teksten via een andere variabele ziet hij
  niet en staan dan als "overbodig"). Ontbreekt een vertaling, dan valt `t()` terug op Engels en daarna Nederlands.
- Hulpjes in `js/taal.js`: `badgeLabel()`, `seizoenNaam()` ("Seizoen 2" → taal), `taalLocale()` (voor toLocaleDateString),
  `getalTekst()` (komma/punt), `procentTekst()` (Turks "%43"), `dubbelePunt()` (Frans " : "), `maandTekst()` (maandKey "mrt 2026" → taal), `maandNaam()`, `weekdagLetters()`.
- `BRIEFJE_PROMPT` wordt vertaald met `t(BRIEFJE_PROMPT)`; de trefwoorden SPELER/TE MAKEN/BEURTEN/DATUM blijven Nederlands
  (de vertaalde vraag zegt dat), want `leesBriefje()` zoekt daarop.
- Opgeslagen gegevens blijven Nederlands (opmerkingen, badge-labels, seizoennamen): alleen bij tonen `t(label)`. `.naam` van
  DISCIPLINES, niveaus, TAFELS en MIJLPALEN is een getter die al vertaalt (Nederlands in `_naam`); nooit kopiëren met Object.assign.
- Disciplinebalk: `kortNaam(d)` ("kort:Libre" in een taalbestand, alleen van die taal zelf). Geen lusvariabele `t` gebruiken
  waar `t()` nodig is (overschaduwt de functie).
- Termen: beurt = inning / reprise / Aufnahme; serie = run / série / Serie; poedel = miss / reprise blanche / Nuller;
  libre/driebanden/bandstoten/kader = straight rail, three-cushion, one-cushion, balkline / libre, trois bandes, une bande, cadre /
  Freie Partie, Dreiband, Einband, Cadre. Spaans: entrada, serie, cero, carambolas, promedio; Libre, Tres bandas, Una banda,
  Cuadro. Turks: istaka, seri, sıfır, sayı, ortalama; Serbest, Üç Bant, Tek Bant, Kadr.
- Fase 1 klaar (kop, tabbladen, Spelen, opmerkingen, Info, welkom). Fase 2 klaar (Stats, Log, partijregels, vensters, uitleg,
  badges, vormUitleg, wauw: doel, kalender, seizoen in beeld, deelkaarten). Fase 3 klaar (Dash, Inzicht, coachzinnen en
  omstandigheden in `berekenInzicht`; titels van omstandigheden blijven Nederlands in de data, want de code vergelijkt erop,
  en worden getoond met `t(o.titel)`). Fase 4 klaar: winkelteksten Engels/Frans/Duits in `store/talen.md` (lengtes:
  `node store/controleer-lengtes.js`; knopnamen in de teksten gelijk houden aan de vertalingen in de app). Daarna nieuwe talen.
  Na een tekstwijziging in `berekenInzicht`: Nederlandse uitkomst oud tegenover nieuw vergelijken (de snapshot-hash
  bevat de coachzinnen niet).

## Harde regels

1. URL, opslagsleutel `biljart-tracker-v2` en datastructuur behouden. Formaatwijziging = migratie in
   `js/opslag.js` die oude data blijft laden. Gebruikers mogen nooit een lege app zien.
2. Hooks (`useState`, `useMemo`, `useEffect`, `useRef`) altijd vóór een early return.
3. Geen grote base64-blokken in `<head>`, `manifest.json` of de code (gaf eerder een crash op Samsung Internet).
4. `manifest.json`, `sw.js`, `icon192.png`, `icon512.png` niet hernoemen of verplaatsen.
5. Geen API-sleutels, externe diensten of externe scripts. AI-analyse = kopieerbare prompt.
6. Na elke wijziging testen (zie hieronder) en `APP_VERSIE` plus alle `?v=` in `index.html` ophogen
   (formaat `JJJJ-MM-DD.n`); die staat onderaan Info, zo ziet de eigenaar welke versie geladen is.
7. Niets committen, pushen of installeren zonder akkoord van de eigenaar. Geen `sudo`.

## Testen

Lokaal serveren: `python3 -m http.server 8642` in de projectmap, openen op http://localhost:8642/.

- Testdata laden (in de browserconsole), daarna herladen:
  `localStorage.setItem("biljart-tracker-v2", JSON.stringify(await fetch("/test/testdata.json").then(r=>r.json())))`
- Alle tests (liefst op telefoonformaat 375 breed): `await eval(await fetch("/test/alles.js").then(r=>r.text()))`
  → `allesGoed` moet `true` zijn. Draait `rondgang`, `tijdlijn`, `statstab`, `spelen`, `partijrij`, `spelelement`, `niveau`, `vensters`, `datatab`, `weergave`, `briefje`, `wauw`, `talen`
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
  Let op: GitHub Pages negeert `?v=`; vlak na een push kan een telefoon een oud `index.html` met nieuwe `jsx`-bestanden
  combineren. Verandert de vorm van gegevens tussen bestanden (props, callbacks), laat de ontvangende kant dan ook de
  oude vorm accepteren. (16 okt 2026: briefje-beurten als object op de plek van het getal; hersteld met
  `herstelBeurten()` in `js/opslag.js`, die bij laden en importeren draait.)
- `sw.js` (website): eerst het netwerk, cache als terugval (offline of na 4 s). Nieuwe app-bestanden ook in
  `VOORAF` in `sw.js` zetten; `node test/sw-node.js` controleert dat en test online/offline/traag.
- Na een push: `npm run ios` en opnieuw installeren is nodig om de iOS-app bij te werken.

## Open punten (stand 18 okt 2026)

### Bij de eigenaar
1. **App Store 1.0**: ingediend; Apple vroeg om uitleg (2.1), antwoord met video staat in de Notes. Controleren of
   Update Review/Resubmit is gedaan, dan wachten op goedkeuring. TestFlight-uitnodiging staat nog op "Invited".
2. **Google Play**: ontwikkelaarsaccount (25 dollar) en 12 testers met Android; daarna 14 dagen gesloten test.
3. **Vertalingen laten nalezen**: Spaans, Turks, Koreaans en de Koreaanse handicapgrenzen (vierbal), door iemand die
   de taal of de praktijk kent.

### Samen, na goedkeuring van 1.0
4. **Versie 1.1 naar de App Store**: zeven talen, vierbal, kader 35/2, 47/1 en 52/2, laden zonder partijen, groene
   systeembalken. Per taal de winkelteksten uit `store/talen.md` invullen; schermafbeeldingen Engels/Frans/Duits staan in
   `store/screenshots/ios-en|fr|de` (en iCloud Drive "Biljart Tracker store"). Eventueel nog Spaans/Turks/Koreaans maken.
5. **`APP_STORE_URL`** in `js/constanten.js` invullen na publicatie (voor "Deel deze app").
6. **Google Play-release**: uploadsleutel (.jks, goed bewaren) en ondertekende .aab bouwen zodra het account er is
   (zie `store/play-store.md`).

### Later
7. **Automatische back-up naar iCloud Drive** (alleen iOS-app), zodat je nooit meer zelf hoeft te exporteren:
   - De app zet zelf een kopie van de data in de iCloud Drive van de gebruiker, map "Biljart Tracker",
     bijgewerkt na elke partij (laatste paar versies bewaren). Blijft bestaan als de app verwijderd wordt en
     is zichtbaar op iPad/Mac.
   - Iedere gebruiker gebruikt zijn eigen iCloud (eigen Apple ID); niets gaat naar de maker of een server.
     Geen externe dienst, dus binnen de harde regels.
   - Nodig: iCloud-capability (iCloud Documents/ubiquity container) in Xcode en een klein eigen Swift-
     plugin, omdat `@capacitor/filesystem` iCloud Drive niet ondersteunt.
   - Werkt alleen als iCloud Drive aan staat. Zo niet: app werkt zoals nu en valt terug op de back-upherinnering
     (gebouwd 17 okt 2026: `backupNodig()`/`maakBackupBestand()` in `js/opslag.js`; dan niet meer tonen).
   - In Info (Back-up en gegevens) tonen: "Back-up: automatisch in iCloud Drive ✓" met de datum van de laatste kopie.
   - `privacy.html` aanpassen: reservekopie in je eigen iCloud Drive waar alleen jij bij kunt. "Data Not Collected"
     blijft kloppen.
8. **Meer talen**: Japans (vierbal staat dan vanzelf in de balk, zie `vierbalZichtbaar`) en Vietnamees.
9. **Inkomsten** (alleen als de eigenaar dat wil): eerst gratis houden; later eventueel een eenmalige Pro-aankoop of
   fooienpot via Apple/Google zelf (geen externe dienst). Geen advertenties of abonnement.
10. **Wedstrijdbriefje op de iPhone zelf herkennen** (Apple Vision, eigen plugin), met hetzelfde controlescherm.
11. **Sneller opstarten**: JSX vooraf laten vertalen (bijv. esbuild) in plaats van Babel in de browser; vraagt een
    ontwikkelpakket, dus alleen met akkoord van de eigenaar.
12. **Eigen domeinnaam** in plaats van ferro842.github.io (ook in `WEB_URL`, privacy-URL en store-teksten).
