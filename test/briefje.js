// Test van "📷 Partij van een wedstrijdbriefje" (Spelen): antwoord plakken, inlezen, kolom kiezen, foute beurt
// gemarkeerd met voorstel, voorstel overnemen, datum in het verleden kiezen en opslaan. De partij moet op
// datumvolgorde tussen de andere staan, met unieke ids, en een lopende partij blijft ongemoeid.
// Overschrijft de opslag; alles.js zet testdata terug.
// Draaien: await eval(await fetch("/test/briefje.js").then(r=>r.text()))
(async function(){
  const w=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
  const k=function(t){return Array.from(document.querySelectorAll("button")).find(function(b){return b.textContent.trim()===t;});};
  const kb=function(t){return Array.from(document.querySelectorAll("button")).find(function(b){return b.textContent.trim().indexOf(t)===0;});};
  const tekst=function(){return document.getElementById("root").textContent;};
  const data=function(){return JSON.parse(localStorage.getItem("biljart-tracker-v2"));};
  const zet=function(el,v){const proto=el.tagName==="TEXTAREA"?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto,"value").set.call(el,v);el.dispatchEvent(new Event("input",{bubbles:true}));};
  const uit={};
  kb("Libre").click();await w(150);k("Spelen").click();await w(200);
  const lopendVoor=JSON.stringify(data().lopendePartij||null);
  k("📷 Partij van een wedstrijdbriefje").click();await w(250);
  uit.vraag=typeof BRIEFJE_PROMPT==="string"&&BRIEFJE_PROMPT.indexOf("SPELER:")!==-1&&BRIEFJE_PROMPT.indexOf("codeblok")!==-1;
  // Fout in beurt 3 (1 i.p.v. 3); tweede speler eerst, zodat kolom kiezen getest wordt
  zet(document.querySelector("textarea"),"```\nSPELER: Tegenstander | TE MAKEN: 40\n1: 2 / 2\n2: - / 2\n\n**SPELER: Ik | TE MAKEN: 30**\n1: – / 0\n2: 5 / 5\n3: 1 / 8\n4: - / 8\n5: 2 / 10\nDATUM: 15-05-2026\n```");
  await w(150);k("Inlezen").click();await w(300);
  uit.controlescherm=tekst().indexOf("Welke kolom is van jou?")!==-1;
  // Tegenstander (eerste kolom) heeft 2 beurten gelezen, "Ik" 5: aangevuld tot 5 met een melding
  uit.aangevuld=tekst().indexOf("aangevuld als poedel tot 5 beurten")!==-1;
  kb("Ik").click();await w(200);
  uit.afwijkingGevonden=tekst().indexOf("1 beurt wijkt af")!==-1&&!!kb("→ 3");
  kb("→ 3").click();await w(200);
  uit.naVoorstel=tekst().indexOf("Alle beurten kloppen")!==-1;
  // Rechts gestaan: acquit is de laatste beurt (2 caramboles, dus gelukt)
  uit.acquitLaatste=tekst().indexOf("je stond rechts")!==-1&&tekst().indexOf("Beurt 5: ✓ acquit gelukt")!==-1;
  // Opmerking toevoegen bij beurt 2: Klos
  document.querySelector('[aria-label="Opmerkingen beurt 2"]').click();await w(200);
  Array.from(document.querySelectorAll("button")).find(function(b){return b.textContent.indexOf("Klos")!==-1;}).click();await w(100);
  k("Klaar").click();await w(150);
  uit.opmerkingZichtbaar=tekst().indexOf("✗ Klos")!==-1;
  // Snelknop aantal beurten: 20 vult aan met poedels; daarna terug naar 5 met "− laatste beurt"
  k("20").click();await w(200);
  uit.aantalKnop=tekst().indexOf("Aantal beurten: 20")!==-1;
  for(let i=0;i<15;i++){k("− laatste beurt").click();await w(40);}
  await w(150);uit.aantalTerug=tekst().indexOf("Aantal beurten: 5")!==-1;
  uit.beurtenRegel=leesBriefje("SPELER: A\n1: 2/2\nBEURTEN: 25").aantalBeurten===25&&BRIEFJE_PROMPT.indexOf("BEURTEN:")!==-1;
  const datumVeld=document.querySelector('input[type="date"]');
  uit.datumGelezen=datumVeld&&datumVeld.value==="2026-05-15";
  const voor=data().partijen.length;
  k("Partij opslaan").click();await w(500);
  const d=data(),p=d.partijen.find(function(x){return x.bron==="briefje";});
  uit.opgeslagen=!!p&&d.partijen.length===voor+1&&p.beurten.length===5&&p.beurten.reduce(function(s,b){return s+b.caramboles;},0)===10&&p.doel===30&&p.doelType==="caramboles";
  const i=d.partijen.indexOf(p);
  uit.acquitOpgeslagen=p.beurten[4].goed.indexOf("Acquit")!==-1&&p.beurten[0].gemist.indexOf("Acquit")===-1;
  uit.opmerkingOpgeslagen=p.beurten[1].gemist.indexOf("Klos")!==-1;
  uit.opVolgorde=d.partijen.every(function(x,j){return j===0||new Date(d.partijen[j-1].datum)<=new Date(x.datum);});
  uit.middenIn=i>0&&i<d.partijen.length-1;
  const ids=d.partijen.flatMap(function(x){return[x.id].concat(x.beurten.map(function(b){return b.id;}));});
  uit.uniekeIds=new Set(ids).size===ids.length&&d.huidigeId>Math.max.apply(null,ids);
  uit.lopendeOngemoeid=JSON.stringify(d.lopendePartij||null)===lopendVoor;
  uit.samenvatting=tekst().indexOf("Partij afgesloten")!==-1;
  const o=Array.from(document.querySelectorAll("div")).find(function(x){return x.style.position==="fixed";});if(o)o.click();await w(150);
  uit.goed=uit.aantalKnop&&uit.aantalTerug&&uit.beurtenRegel&&uit.aangevuld&&uit.acquitLaatste&&uit.opmerkingZichtbaar&&uit.acquitOpgeslagen&&uit.opmerkingOpgeslagen&&uit.vraag&&uit.controlescherm&&uit.afwijkingGevonden&&uit.naVoorstel&&uit.datumGelezen&&uit.opgeslagen&&uit.opVolgorde&&uit.middenIn&&uit.uniekeIds&&uit.lopendeOngemoeid&&uit.samenvatting;
  return uit;
})()
