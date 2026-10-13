// Opent in de geladen app (met test/testdata.json) elk venster en controleert of de verwachte tekst
// verschijnt: niveau-overzicht, badgecatalogus, seizoensarchief, partijsamenvatting na een gespeelde
// partij, en de welkomstflow bij lege opslag. Let op: speelt een testpartij en wist daarna de opslag;
// laad test/testdata.json opnieuw na afloop.
// Draaien: await eval(await fetch("/test/vensters.js").then(r=>r.text()))
(async function(){
  const wacht=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
  const knop=function(t){return Array.from(document.querySelectorAll("button")).find(function(b){return b.textContent.trim().indexOf(t)===0;});};
  const sluit=function(){const o=Array.from(document.querySelectorAll("div")).find(function(d){return d.style.position==="fixed";});if(o)o.click();};
  const heeft=function(t){return document.body.textContent.indexOf(t)!==-1;}; // textContent: innerText volgt text-transform (hoofdletters)
  const uit={};
  knop("Libre").click();await wacht(150);
  knop("Spelen").click();await wacht(150);
  // Niveau-overzicht via de niveauknop rechtsboven
  document.querySelector(".app button").click();await wacht(200);
  uit.niveauOverzicht=heeft("Alle niveaus");sluit();await wacht(150);
  // Badgecatalogus via Dash > Punten
  knop("Dash").click();await wacht(200);knop("Punten").click();await wacht(200);knop("🎖️ Alle badges").click();await wacht(200);
  uit.badgeCatalogus=heeft("Elke badge die je kunt verdienen");sluit();await wacht(150);
  // Seizoensarchief via Stats
  knop("Stats").click();await wacht(200);
  const archief=knop("Archief");
  if(archief){archief.click();await wacht(200);uit.seizoensArchief=heeft("Seizoensarchief");sluit();await wacht(150);}
  else uit.seizoensArchief="geen archiefknop";
  // Partijsamenvatting na een korte partij
  knop("Spelen").click();await wacht(150);knop("Start partij").click();await wacht(150);
  for(let i=0;i<3;i++){knop("+").click();await wacht(20);}
  knop("Noteer").click();await wacht(150);knop("Volgende stap").click();await wacht(150);knop("Beurt opslaan").click();await wacht(200);sluit();await wacht(150);
  Array.from(document.querySelectorAll("button")).find(function(b){return b.textContent.trim()==="Afsluiten";}).click();await wacht(150);
  knop("Opslaan").click();await wacht(300);
  uit.partijSamenvatting=heeft("Partij afgesloten");sluit();await wacht(150);
  // Welkomstflow bij lege opslag
  localStorage.removeItem("biljart-tracker-v2");
  return uit;
})()
