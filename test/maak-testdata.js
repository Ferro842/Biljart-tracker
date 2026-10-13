// Maakt test/testdata.json: een vaste (deterministische) dataset om na elke wijziging te controleren
// dat bestaande data nog laadt en dat gemiddelde, niveau en badges niet veranderen.
// Bevat ook partijen in het OUDE formaat (zonder tafel en zonder discipline) om de migratie te testen.
// Gebruik: node test/maak-testdata.js
const fs = require("fs");
const path = require("path");

let zaad = 42;
function willekeurig() { zaad = (zaad * 1103515245 + 12345) % 2147483648; return zaad / 2147483648; }

const GEMIST = ["Trekstoot", "Direct", "Te zacht", "Positioneren", "Klos", "Dun"];
const GOED = ["Verzamelen", "Positioneren", "Doorstoot", "Snijden"];
// [discipline, aantal partijen, gemiddelde caramboles per beurt]
const PLAN = [["libre", 18, 2.4], ["driebanden", 8, 0.45], ["bandstoten", 6, 1.6], ["kader38", 4, 2.2], ["kader71", 3, 1.3]];

let id = 1;
const partijen = [];
let datum = new Date("2026-03-02T19:00:00.000Z").getTime();
PLAN.forEach(function ([discipline, aantal, gem]) {
  for (let i = 0; i < aantal; i++) {
    const oudFormaat = discipline === "libre" && i < 3;
    const n = oudFormaat ? [25, 40, 30][i] : 15 + Math.floor(willekeurig() * 16);
    const beurten = [];
    for (let j = 0; j < n; j++) {
      const r = willekeurig();
      const car = r < 0.25 ? 0 : Math.round(-Math.log(1 - willekeurig()) * gem * 1.3);
      beurten.push({
        id: id++, caramboles: car,
        gemist: willekeurig() < 0.6 ? [GEMIST[Math.floor(willekeurig() * GEMIST.length)]] : [],
        goed: car > 0 && willekeurig() < 0.5 ? [GOED[Math.floor(willekeurig() * GOED.length)]] : [],
        tijd: new Date(datum + j * 60000).toISOString()
      });
    }
    const p = { id: id++, datum: new Date(datum + n * 60000).toISOString(), beurten: beurten };
    if (!oudFormaat) Object.assign(p, { tafel: ["210", "230", "255", "284"][i % 4], doel: 25, doelType: "beurten", discipline: discipline });
    if (i === 1) p.notitie = "Testnotitie";
    partijen.push(p);
    datum += 4 * 86400000;
  }
});
// Datums door elkaar per discipline is prima; de app filtert per discipline en houdt de volgorde aan.
const data = {
  huidigeId: id, partijen: partijen, tijdsvenster: "alles",
  seizoenen: [{ id: 1, naam: "Seizoen 1", startDatum: null, eindDatum: "2026-05-01T00:00:00.000Z" },
              { id: 2, naam: "Seizoen 2", startDatum: "2026-05-01T00:00:00.000Z", eindDatum: null }],
  huidigeDiscipline: "libre", onboardingGezien: true
};
fs.writeFileSync(path.join(__dirname, "testdata.json"), JSON.stringify(data, null, 1));
console.log("testdata.json: " + partijen.length + " partijen, huidigeId " + id);
