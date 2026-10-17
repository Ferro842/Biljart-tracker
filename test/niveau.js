// Test van "Je niveau" (Stats): kiezen van 10/20/30/alle partijen; de getoonde vorm moet gelijk zijn aan
// berekenNiveauInfo met dat venster (inclusief plafond), de moyenne blijft over alle partijen, en de keuze
// wordt opgeslagen; per tafel klopt het ook. Overschrijft de opslag; alles.js zet testdata terug.
// Draaien: await eval(await fetch("/test/niveau.js").then(r=>r.text()))
(async function(){
  const w=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
  const k=function(t){return Array.from(document.querySelectorAll("button")).find(function(b){return b.textContent.trim()===t;});};
  const kb=function(t){return Array.from(document.querySelectorAll("button")).find(function(b){return b.textContent.trim().indexOf(t)===0;});};
  const tekst=function(){return document.getElementById("root").textContent;};
  const data=function(){return JSON.parse(localStorage.getItem("biljart-tracker-v2"));};
  // Getal uit het vakje waarvan het label met `label` begint (direct uit de DOM, niet uit de platte tekst)
  const getal=function(label){const d=Array.from(document.querySelectorAll("#root div")).find(function(x){return x.children.length===0&&x.textContent.indexOf(label)===0;});return d&&d.previousElementSibling?d.previousElementSibling.textContent:null;};
  kb("Libre").click();await w(150);k("Stats").click();await w(200);
  const uit={};
  const libre=function(){return data().partijen.filter(function(p){return(p.discipline||"libre")==="libre";});};
  let moyennes=[];
  for(const keuze of [["10",10],["30",30],["Alle","alles"],["20",20]]){
    // De keuze staat in het klasse-overzicht (knop rechtsboven); daarna sluiten
    document.querySelector("[data-kop] button").click();await w(250);
    const ov=Array.from(document.querySelectorAll("div")).find(function(d){return d.style.position==="fixed"&&d.textContent.indexOf("Alle niveaus")!==-1;});
    Array.from(ov.querySelectorAll("button")).find(function(b){return b.textContent.trim()===keuze[0];}).click();await w(250);
    ov.click();await w(200);
    const info=berekenNiveauInfo(libre(),false,{venster:keuze[1]==="alles"?null:keuze[1]});
    const vorm=getal("vorm · ");
    const moy=getal("moyenne · alle");
    moyennes.push(moy);
    uit["vorm_"+keuze[1]]={getoond:vorm,verwacht:info.effectiefGemiddelde.toFixed(2),opgeslagen:data().vormVenster===keuze[1]};
  }
  uit.moyenneGelijk=moyennes.every(function(m){return m&&m===moyennes[0];});
  // Tafelkeuze: vorm en moyenne van alleen die tafel; "Alle tafels" terug
  const tafelKnop=function(t){return Array.from(document.querySelectorAll("button")).find(function(b){return b.textContent.trim()===t;});};
  tafelKnop("2,10").click();await w(250);
  const op210=libre().filter(function(p){return p.tafel==="210";});
  const info210=berekenNiveauInfo(op210,false,{venster:20});
  uit.tafel210={getoond:getal("vorm · "),verwacht:info210.effectiefGemiddelde.toFixed(2),
    moyenne:getal("moyenne · alle"),moyenneVerwacht:info210.moyenne.toFixed(2),
    melding:tekst().indexOf("Alleen je partijen op de 2,10")!==-1};
  tafelKnop("Alle tafels").click();await w(250);
  uit.terugNaarAlle=tekst().indexOf("Alleen je partijen op de")===-1;
  uit.plafond=berekenNiveauInfo(libre(),false,{venster:10}).aantalDrops<=1;
  uit.goed=Object.keys(uit).filter(function(x){return x.indexOf("vorm_")===0;}).every(function(x){return uit[x].getoond===uit[x].verwacht&&uit[x].opgeslagen;})
    &&uit.moyenneGelijk&&uit.plafond&&uit.tafel210.getoond===uit.tafel210.verwacht&&uit.tafel210.moyenne===uit.tafel210.moyenneVerwacht
    &&uit.tafel210.melding&&uit.terugNaarAlle;
  return uit;
})()
