// Draait alle browsertests (rondgang, tijdlijn, statstab, spelen, partijrij, spelelement, niveau, vensters, datatab, weergave) achter elkaar op de geladen app en zet daarna test/testdata.json terug.
// Vooraf: testdata in localStorage en de pagina (her)laden. Liefst op telefoonformaat (375 breed).
// Na afloop direct herladen: de app heeft dan nog de geïmporteerde testback-up in het geheugen en zou
// die bij de volgende klik over de teruggezette testdata heen opslaan.
// Draaien: await eval(await fetch("/test/alles.js").then(r=>r.text()))
(async function(){
  const laad=async function(naam){return eval(await fetch("/test/"+naam+"?"+Date.now()).then(function(r){return r.text();}));};
  const uit={};
  uit.rondgang=await laad("rondgang.js");
  uit.tijdlijn=await laad("tijdlijn.js");
  uit.statstab=await laad("statstab.js");
  uit.spelen=await laad("spelen.js");
  uit.partijrij=await laad("partijrij.js");
  uit.spelelement=await laad("spelelement.js");
  uit.niveau=await laad("niveau.js");
  uit.vensters=await laad("vensters.js");
  uit.datatab=await laad("datatab.js");
  uit.weergave=await laad("weergave.js");
  const d=await fetch("/test/testdata.json").then(function(r){return r.json();});
  localStorage.setItem("biljart-tracker-v2",JSON.stringify(d));
  const v=uit.vensters;
  uit.allesGoed=uit.rondgang.fouten.length===0&&uit.rondgang.berekeningenGelijk&&uit.tijdlijn.goed
    &&v.niveauOverzicht&&v.badgeCatalogus&&v.seizoensArchief&&v.partijSamenvatting&&uit.datatab.goed&&uit.statstab.goed&&uit.spelen.goed&&uit.partijrij.goed&&uit.spelelement.goed&&uit.niveau.goed&&uit.weergave.goed;
  return uit;
})()
