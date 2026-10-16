// Test van de Stats-tab (seizoen afsluiten en weer samenvoegen, archief openen) en de Info-tab
// ("Alle data wissen" (alleen de huidige discipline, hier Kader 71/2). Overschrijft de opslag;
// alles.js zet testdata terug.
// Draaien: await eval(await fetch("/test/statstab.js").then(r=>r.text()))
(async function(){
  const w=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
  const k=function(t){return Array.from(document.querySelectorAll("button")).find(function(b){return b.textContent.trim().indexOf(t)===0;});};
  const data=function(){return JSON.parse(localStorage.getItem("biljart-tracker-v2"));};
  const sluit=function(){const o=Array.from(document.querySelectorAll("div")).find(function(d){return d.style.position==="fixed";});if(o)o.click();};
  const uit={};
  k("Libre").click();await w(150);k("Stats").click();await w(200);
  const seizoenenVoor=data().seizoenen.length;
  k("Seizoen afsluiten").click();await w(150);k("Ja, afsluiten").click();await w(200);
  uit.seizoenAfgesloten=data().seizoenen.length===seizoenenVoor+1;
  k("Archief").click();await w(200);uit.archief=document.body.textContent.indexOf("Seizoensarchief")!==-1;sluit();await w(150);
  k("Laatste seizoensgrens ongedaan maken").click();await w(150);k("Ja, samenvoegen").click();await w(200);
  uit.samengevoegd=data().seizoenen.length===seizoenenVoor;
  // Alle data wissen alleen voor Kader 71/2
  const libreVoor=data().partijen.filter(function(p){return(p.discipline||"libre")==="libre";}).length;
  k("Kader").click();await w(150);k("Kader 71/2").click();await w(150);k("Info").click();await w(200);
  k("Alle data wissen").click();await w(150);k("Ja, wis alles").click();await w(200);
  const na=data().partijen;
  uit.kaderGewist=na.filter(function(p){return p.discipline==="kader71";}).length===0;
  uit.libreBehouden=na.filter(function(p){return(p.discipline||"libre")==="libre";}).length===libreVoor;
  uit.bevestigingWeg=!k("Ja, wis alles")&&!!k("Alle data wissen");
  k("Libre").click();await w(150);
  uit.goed=uit.seizoenAfgesloten&&uit.archief&&uit.samengevoegd&&uit.kaderGewist&&uit.libreBehouden&&uit.bevestigingWeg;
  return uit;
})()
