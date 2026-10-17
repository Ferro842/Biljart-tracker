// Test van de partijregels in Stats en Log: labels, notitie typen en opslaan (📝 verschijnt), verwijderen
// met bevestiging en annuleren. Overschrijft de opslag; alles.js zet testdata terug.
// Draaien: await eval(await fetch("/test/partijrij.js").then(r=>r.text()))
(async function(){
  const w=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
  const k=function(t){return Array.from(document.querySelectorAll("button")).find(function(b){return b.textContent.trim().indexOf(t)===0;});};
  const kc=function(t){return Array.from(document.querySelectorAll("button")).find(function(b){return b.textContent.indexOf(t)!==-1;});};
  const data=function(){return JSON.parse(localStorage.getItem("biljart-tracker-v2"));};
  const typ=async function(tekst){const ta=document.querySelector("textarea:not([readonly])");const zet=Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,"value").set;zet.call(ta,tekst);ta.dispatchEvent(new Event("input",{bubbles:true}));await w(150);};
  const uit={};
  k("Libre").click();await w(150);
  // Stats: p17 openklappen, notitie opslaan
  k("Stats").click();await w(200);
  kc(" · p17").click();await w(200);
  uit.statsLabels=kc(" · p17").textContent.indexOf("pt")!==-1;
  // Beurtengrafiek past in de breedte (alle beurten in beeld)
  const graf=document.querySelector("[data-grafiek]");
  uit.grafiekPast=!!graf&&graf.scrollWidth<=graf.clientWidth+1;
  await typ("Stats-notitie");k("Notitie opslaan").click();await w(200);
  uit.statsNotitie=data().partijen.some(function(p){return p.notitie==="Stats-notitie";})&&kc(" · p17").textContent.indexOf("📝")!==-1;
  // annuleren laat de partij staan
  const voor=data().partijen.length;
  k("Partij verwijderen").click();await w(150);k("Annuleer").click();await w(150);
  uit.annuleren=data().partijen.length===voor&&!!k("Partij verwijderen");
  // Opmerkingen achteraf aanvullen: p17, beurt 1, "Klos" erbij, opslaan; zelf getypte opmerkingen blijven staan
  const p17=function(){const l=data().partijen.filter(function(p){return(p.discipline||"libre")==="libre";});return l[16];};
  const b1voor=p17().beurten[0];
  k("✎ Opmerkingen aanvullen").click();await w(250);
  const venster=document.querySelector("[data-opm-bewerken]");
  uit.opmVenster=!!venster;
  venster.querySelector("div[style*='cursor: pointer']").click();await w(200);
  const klos=Array.from(venster.querySelectorAll("button")).find(function(b){return /Klos$/.test(b.textContent.trim());});
  const hadKlos=b1voor.gemist.indexOf("Klos")!==-1;
  klos.click();await w(150);
  Array.from(venster.querySelectorAll("button")).find(function(b){return b.textContent.trim()==="Opslaan";}).click();await w(250);
  const b1na=p17().beurten[0];
  uit.opmBewaard=!document.querySelector("[data-opm-bewerken]")&&(b1na.gemist.indexOf("Klos")!==-1)!==hadKlos
    &&b1na.caramboles===b1voor.caramboles&&b1na.goed.join()===b1voor.goed.join();
  // Log: p16 openklappen, notitie opslaan en verwijderen
  k("Log").click();await w(200);
  kc("p16 -").click();await w(200);
  await typ("Log-notitie");k("Notitie opslaan").click();await w(200);
  uit.logNotitie=data().partijen.some(function(p){return p.notitie==="Log-notitie";});
  k("Partij verwijderen").click();await w(150);k("Ja, verwijderen").click();await w(200);
  uit.logVerwijderd=data().partijen.length===voor-1;
  uit.goed=uit.grafiekPast&&uit.opmVenster&&uit.opmBewaard&&uit.statsLabels&&uit.statsNotitie&&uit.annuleren&&uit.logNotitie&&uit.logVerwijderd;
  return uit;
})()
