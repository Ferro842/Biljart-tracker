// Draait alle browsertests (rondgang, tijdlijn, statstab, spelen, vensters, datatab) achter elkaar op de geladen app en zet daarna test/testdata.json terug.
// Vooraf: testdata in localStorage en de pagina (her)laden. Liefst op telefoonformaat (375 breed).
// Draaien: await eval(await fetch("/test/alles.js").then(r=>r.text()))
(async function(){
  const laad=async function(naam){return eval(await fetch("/test/"+naam+"?"+Date.now()).then(function(r){return r.text();}));};
  const uit={};
  uit.rondgang=await laad("rondgang.js");
  uit.tijdlijn=await laad("tijdlijn.js");
  uit.statstab=await laad("statstab.js");
  uit.spelen=await laad("spelen.js");
  uit.vensters=await laad("vensters.js");
  uit.datatab=await laad("datatab.js");
  const d=await fetch("/test/testdata.json").then(function(r){return r.json();});
  localStorage.setItem("biljart-tracker-v2",JSON.stringify(d));
  const v=uit.vensters;
  uit.allesGoed=uit.rondgang.fouten.length===0&&uit.rondgang.berekeningenGelijk&&uit.tijdlijn.goed
    &&v.niveauOverzicht&&v.badgeCatalogus&&v.seizoensArchief&&v.partijSamenvatting&&uit.datatab.goed&&uit.statstab.goed&&uit.spelen.goed;
  return uit;
})()
