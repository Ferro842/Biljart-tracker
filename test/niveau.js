// Test van "Je niveau" (Stats): kiezen van 10/20/30/alle partijen; de getoonde vorm moet gelijk zijn aan
// berekenNiveauInfo met dat venster (inclusief plafond), de moyenne blijft over alle partijen, en de keuze
// wordt opgeslagen. Overschrijft de opslag; alles.js zet testdata terug.
// Draaien: await eval(await fetch("/test/niveau.js").then(r=>r.text()))
(async function(){
  const w=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
  const k=function(t){return Array.from(document.querySelectorAll("button")).find(function(b){return b.textContent.trim()===t;});};
  const kb=function(t){return Array.from(document.querySelectorAll("button")).find(function(b){return b.textContent.trim().indexOf(t)===0;});};
  const tekst=function(){return document.getElementById("root").textContent;};
  const data=function(){return JSON.parse(localStorage.getItem("biljart-tracker-v2"));};
  kb("Libre").click();await w(150);k("Stats").click();await w(200);
  const uit={};
  const libre=function(){return data().partijen.filter(function(p){return(p.discipline||"libre")==="libre";});};
  let moyennes=[];
  for(const keuze of [["10",10],["30",30],["Alle","alles"],["20",20]]){
    k(keuze[0]).click();await w(250);
    const info=berekenNiveauInfo(libre(),false,{venster:keuze[1]==="alles"?null:keuze[1]});
    const vorm=(tekst().match(/Je niveau(\d+\.\d+)vorm/)||[])[1];
    const moy=(tekst().match(/(\d+\.\d+)moyenne · alle/)||[])[1];
    moyennes.push(moy);
    uit["vorm_"+keuze[1]]={getoond:vorm,verwacht:info.effectiefGemiddelde.toFixed(2),opgeslagen:data().vormVenster===keuze[1]};
  }
  uit.moyenneGelijk=moyennes.every(function(m){return m&&m===moyennes[0];});
  uit.plafond=berekenNiveauInfo(libre(),false,{venster:10}).aantalDrops<=1;
  uit.goed=Object.keys(uit).filter(function(x){return x.indexOf("vorm_")===0;}).every(function(x){return uit[x].getoond===uit[x].verwacht&&uit[x].opgeslagen;})
    &&uit.moyenneGelijk&&uit.plafond;
  return uit;
})()
