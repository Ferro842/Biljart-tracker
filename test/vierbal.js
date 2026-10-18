// Test van vierbal: standaard verborgen (Nederlands), aanzetten in Info → Weergave, kiezen in de balk (paars laken),
// een beurt met strafpunt noteren (partijscore = caramboles − straf, gemiddelde over de caramboles), afsluiten en
// opslaan, en weer verbergen. Overschrijft de opslag; alles.js zet testdata terug.
// Draaien: await eval(await fetch("/test/vierbal.js").then(r=>r.text()))
(async function(){
  const w=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
  const k=function(tk){return Array.from(document.querySelectorAll("button")).find(function(b){return b.textContent.trim()===tk;});};
  const kb=function(tk){return Array.from(document.querySelectorAll("button")).find(function(b){return b.textContent.trim().indexOf(tk)===0;});};
  const seg=function(){return Array.from(document.querySelectorAll("#root button.seg-knop")).map(function(b){return b.textContent.trim();});};
  const data=function(){return JSON.parse(localStorage.getItem("biljart-tracker-v2"));};
  const sluit=function(){const o=Array.from(document.querySelectorAll("div")).find(function(d){return d.style.position==="fixed";});if(o)o.click();};
  const uit={};
  kb("Libre").click();await w(150);
  uit.verborgen=seg().indexOf("Vierbal")===-1;
  // Aanzetten in Info
  k("Info").click();await w(250);
  Array.from(document.querySelectorAll("[data-vierbal-keuze] button")).find(function(b){return b.textContent.trim()==="Tonen";}).click();await w(250);
  uit.aangezet=data().vierbal===true&&seg().indexOf("Vierbal")!==-1;
  // Kiezen: paars laken, handicapklassen
  Array.from(document.querySelectorAll("#root button.seg-knop")).find(function(b){return b.textContent.trim()==="Vierbal";}).click();await w(250);
  uit.gekozen=data().huidigeDiscipline==="vierbal"&&getComputedStyle(document.documentElement).getPropertyValue("--c-3f8a3a").trim()!=="#3f8a3a"&&bepaalNiveau(0.8,"vierbal").huidig.naam==="Handicap 150";
  // Partij: beurt van 2 met strafpunt, daarna een beurt van 3 zonder
  k("Spelen").click();await w(200);
  const voor=data().partijen.length;
  k("Start partij").click();await w(200);
  k("+").click();await w(30);k("+").click();await w(30);
  const strafKnop=document.querySelector("[data-straf]");
  uit.strafKnop=!!strafKnop;
  strafKnop.click();await w(100);
  uit.strafAan=document.querySelector("[data-straf]").textContent.indexOf("tik om weg te halen")!==-1;
  k("Noteer").click();await w(200);k("Volgende stap").click();await w(200);k("Beurt opslaan").click();await w(300);
  for(let i=0;i<3;i++){k("+").click();await w(30);}
  k("Noteer").click();await w(200);k("Volgende stap").click();await w(200);k("Beurt opslaan").click();await w(300);
  const lp=(data().lopendePartij||{beurten:[]}).beurten;
  uit.strafBewaard=lp.length===2&&lp[0].straf===1&&!lp[1].straf;
  // Caramboles-vak toont de partijscore: 5 − 1 = 4
  uit.score=document.getElementById("root").textContent.indexOf("4 −1")!==-1;
  // Afsluiten en opslaan; gemiddelde over de caramboles (5 in 2 beurten = 2.50), straf apart
  Array.from(document.querySelectorAll("button")).find(function(b){return b.textContent.trim()==="Afsluiten";}).click();await w(200);
  k("Opslaan").click();await w(400);
  const p=data().partijen[data().partijen.length-1];
  uit.opgeslagen=data().partijen.length===voor+1&&p.discipline==="vierbal"&&strafTotaal(p)===1&&stat(p.beurten,"vierbal").gemPerBeurt==="2.50";
  uit.samenvatting=document.getElementById("root").textContent.indexOf("1x straf")!==-1;
  sluit();await w(200);
  // Terug naar Libre en weer verbergen
  kb("Libre").click();await w(200);
  k("Info").click();await w(250);
  Array.from(document.querySelectorAll("[data-vierbal-keuze] button")).find(function(b){return b.textContent.trim()==="Verbergen";}).click();await w(250);
  uit.weerVerborgen=data().vierbal===false&&seg().indexOf("Vierbal")===-1;
  k("Spelen").click();await w(200);
  uit.goed=uit.verborgen&&uit.aangezet&&uit.gekozen&&uit.strafKnop&&uit.strafAan&&uit.strafBewaard&&uit.score&&uit.opgeslagen&&uit.samenvatting&&uit.weerVerborgen;
  return uit;
})()
