// Test van de Spelen-tab: partij starten, caramboles met +, Noteer, opmerking kiezen, in "Anders..."
// typen zonder dat het veld de focus verliest, poedel noteren, terug-knop, afsluiten en opslaan.
// Overschrijft de opslag; alles.js zet testdata terug.
// Draaien: await eval(await fetch("/test/spelen.js").then(r=>r.text()))
(async function(){
  const w=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
  const k=function(t){return Array.from(document.querySelectorAll("button")).find(function(b){return b.textContent.trim()===t;});};
  const kb=function(t){return Array.from(document.querySelectorAll("button")).find(function(b){return b.textContent.trim().indexOf(t)===0;});};
  const sluit=function(){const o=Array.from(document.querySelectorAll("div")).find(function(d){return d.style.position==="fixed";});if(o)o.click();};
  const data=function(){return JSON.parse(localStorage.getItem("biljart-tracker-v2"));};
  const uit={};
  kb("Libre").click();await w(150);k("Spelen").click();await w(150);
  const voor=data().partijen.length;
  k("Start partij").click();await w(150);
  for(let i=0;i<7;i++){k("+").click();await w(20);}
  uit.opbouwHint=document.body.textContent.indexOf("Opbouw!")!==-1;
  k("Noteer").click();await w(150);
  kb("↩️").click();await w(100);
  k("Volgende stap").click();await w(150);
  // Typen in Anders...: elk teken apart, het veld moet de focus houden
  const veld=document.querySelector("input[placeholder^='Anders']");
  veld.focus();
  const zet=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value").set;
  let tekst="";
  for(const c of "Mooi"){tekst+=c;zet.call(veld,tekst);veld.dispatchEvent(new Event("input",{bubbles:true}));await w(30);}
  const veldNa=document.querySelector("input[placeholder^='Anders']");
  uit.typenHoudtFocus=veldNa===veld&&document.activeElement===veldNa&&veldNa.value==="Mooi";
  k("Beurt opslaan").click();await w(200);sluit();await w(150);
  k("Noteer").click();await w(150);k("Opslaan").click();await w(200);sluit();await w(150);
  // terug haalt de laatste beurt weg, daarna weer een poedel noteren
  k("terug").click();await w(150);
  uit.terugWerkt=document.body.textContent.indexOf("2e Beurt")!==-1;
  k("Noteer").click();await w(150);k("Opslaan").click();await w(200);sluit();await w(150);
  k("Afsluiten").click();await w(150);k("Opslaan").click();await w(300);
  uit.samenvatting=document.body.textContent.indexOf("Partij afgesloten")!==-1;sluit();await w(150);
  const na=data().partijen,p=na[na.length-1];
  uit.opgeslagen=na.length===voor+1&&p.beurten.length===2&&p.beurten[0].caramboles===7&&p.beurten[1].caramboles===0
    &&p.beurten[0].gemist.indexOf("Trekstoot")!==-1&&p.beurten[0].goed.indexOf("Mooi")!==-1;
  uit.goed=uit.opbouwHint&&uit.typenHoudtFocus&&uit.terugWerkt&&uit.samenvatting&&uit.opgeslagen;
  return uit;
})()
