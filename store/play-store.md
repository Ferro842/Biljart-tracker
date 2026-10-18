# Google Play Console – Carom Tracker

Alles om in de Play Console in te vullen (Nederlands als standaardtaal).

## Belangrijk vooraf

- **Ontwikkelaarsaccount:** eenmalig 25 dollar, aan te maken op play.google.com/console. Dat doe je zelf. Google vraagt om
  identiteitsverificatie en een **openbaar e-mailadres** (tip: een apart adres, bijvoorbeeld biljarttracker@…).
- **Persoonlijk account = eerst testen:** bij een nieuw persoonlijk account moet de app eerst **minstens 14 dagen in een
  gesloten test met minstens 12 testers** staan voordat je hem openbaar mag maken. Vraag dus vast 12 biljartvrienden
  met een Android-telefoon (hun Gmail-adres is nodig). Een organisatie-account (met D-U-N-S-nummer) heeft deze eis niet.

## Winkelvermelding

| Veld | Invullen |
|---|---|
| App-naam (30) | Carom Tracker |
| Pakketnaam | nl.ferrovandam.biljarttracker |
| Categorie | Sport |
| Tags | Biljart, Sport |
| Prijs | Gratis |
| Contactgegevens | je openbare e-mailadres; website https://ferro842.github.io/Biljart-tracker/ |
| Privacybeleid | https://ferro842.github.io/Biljart-tracker/privacy.html |

**Korte beschrijving (80)**

> Houd je carambolepartijen bij: per beurt, met moyenne, series en klasse.

**Volledige beschrijving (4000):** dezelfde tekst als bij de App Store (`store/app-store.md`, Beschrijving).

**Andere talen:** Engels, Frans en Duits staan in `store/talen.md` (Winkelvermelding → Vertalingen beheren).

## Afbeeldingen

| Wat | Maat | Bestand |
|---|---|---|
| App-pictogram | 512 × 512 | `store/play/icoon-512.png` |
| Feature graphic | 1024 × 500 | `store/play/feature-graphic.png` |
| Telefoon-schermafbeeldingen (2–8) | staand, 9:16 | `store/screenshots/` |

## Beleid en vragenlijsten

- **Gegevensveiligheid (Data safety):** "Verzamelt of deelt je app gegevens?" → **Nee**. Versleuteling bij overdracht: n.v.t.
  (er gaat niets over het netwerk). Gegevens verwijderen: verwijder de app of gebruik Info → Alle data wissen.
- **Advertenties:** Nee.
- **Inhoudsclassificatie (IARC):** categorie "Hulpprogramma/overig", overal "Nee" → PEGI 3.
- **Doelgroep:** 13 jaar en ouder (niet specifiek voor kinderen).
- **App-toegang:** alle functies zonder inloggen beschikbaar.
- **Overheid/financieel/gezondheid:** Nee.

## Uploaden

1. In Android Studio: Build → Generate Signed App Bundle → Android App Bundle → nieuwe **uploadsleutel** maken.
   **Bewaar het sleutelbestand (.jks) en het wachtwoord goed** (bijv. in je wachtwoordbeheerder én een back-up):
   zonder die sleutel kun je geen updates meer uploaden.
2. In de Play Console: Testen → Gesloten testen → nieuwe release → het .aab-bestand uploaden → testers toevoegen.
3. Na 14 dagen met 12 testers: productietoegang aanvragen en de release naar Productie zetten.
