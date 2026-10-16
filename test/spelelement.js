// Test van de knop Spelelement (Stats): uit = geen badges, punten, Punten-tab of geschrapte partijen, en je
// vorm = gewoon het gemiddelde van je laatste 20 partijen; een partij spelen geeft dan geen prestatiemelding.
// Weer aan = alles terug.
// Overschrijft de opslag; alles.js zet testdata terug.
// Draaien: await eval(await fetch("/test/spelelement.js").then(r=>r.text()))
(async function(){
  const w=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
  const k=function(t){return Array.from(document.querySelectorAll("button")).find(function(b){return b.textContent.trim()===t;});};
  const kb=function(t){return Array.from(document.querySelectorAll("button")).find(function(b){return b.textContent.trim().indexOf(t)===0;});};
  // Alleen de app zelf (#root): document.body bevat ook de broncode van het inline Babel-script
  const tekst=function(){return document.getElementById("root").textContent;};
  const data=function(){return JSON.parse(localStorage.getItem("biljart-tracker-v2"));};
  const sluit=function(){const o=Array.from(document.querySelectorAll("div")).find(function(d){return d.style.position==="fixed";});if(o)o.click();};
  const uit={};
  kb("Libre").click();await w(150);k("Stats").click();await w(200);
  uit.aanVooraf=tekst().indexOf("Badge-punten")!==-1||tekst().indexOf("pt")!==-1;
  const gemAan=(tekst().match(/je vorm(\d+\.\d+)/)||[])[1];
  // Uitzetten (kaart Spelelement staat in Info; Weergave heeft ook een "Uit")
  k("Info").click();await w(200);
  const kaart=Array.from(document.querySelectorAll("#root div")).find(function(d){return d.textContent==="Spelelement";}).parentElement;
  Array.from(kaart.querySelectorAll("button")).find(function(b){return b.textContent.trim()==="Uit";}).click();await w(250);
  uit.opgeslagen=data().spelelement===false;
  const t=tekst();
  uit.uitlegUit=t.indexOf("Staat uit")!==-1;
  k("Stats").click();await w(200);
  uit.geenPuntenInStats=!/\d+pt/.test(tekst());
  // Vorm zonder schrappen = gewoon het gemiddelde van de laatste 20 libre-partijen
  const libre=data().partijen.filter(function(p){return(p.discipline||"libre")==="libre";}).slice(-20);
  let c=0,n=0;libre.forEach(function(p){p.beurten.forEach(function(b){c+=b.caramboles;n++;});});
  const ruw=(c/n).toFixed(2);
  k("Spelen").click();await w(200);
  const kaartGem=(tekst().match(/klasse(\d+\.\d+)/)||tekst().match(/Klasse \d(\d+\.\d+)/)||[])[1];
  uit.vormZonderSchrappen=!!ruw&&kaartGem===ruw;
  uit.geenDropTekst=tekst().indexOf("slechtste partij")===-1;
  // Dash: geen Punten-tab
  k("Dash").click();await w(250);
  uit.geenPuntenTab=!k("Punten");
  // Partij spelen: geen prestatiemelding en geen punten in de samenvatting
  k("Spelen").click();await w(150);k("Start partij").click();await w(150);
  uit.geenPuntenBalk=tekst().indexOf("Deze partij:")===-1;
  for(let i=0;i<12;i++){k("+").click();await w(15);}
  k("Noteer").click();await w(150);k("Volgende stap").click();await w(150);k("Beurt opslaan").click();await w(250);
  uit.geenToast=tekst().indexOf("Prestatie behaald")===-1;
  k("Afsluiten").click();await w(150);k("Opslaan").click();await w(300);
  uit.samenvattingZonderPunten=tekst().indexOf("Partij afgesloten")!==-1&&tekst().indexOf("pt aan badges")===-1;
  sluit();await w(150);
  // Weer aanzetten
  k("Info").click();await w(200);k("🎖️ Aan").click();await w(250);
  k("Stats").click();await w(200);
  uit.weerAan=data().spelelement===true&&/\d+pt/.test(tekst());
  k("Dash").click();await w(200);uit.puntenTabTerug=!!k("Punten");
  k("Spelen").click();await w(150);
  uit.goed=uit.opgeslagen&&uit.geenPuntenInStats&&uit.uitlegUit&&uit.vormZonderSchrappen&&uit.geenDropTekst
    &&uit.geenPuntenTab&&uit.geenPuntenBalk&&uit.geenToast&&uit.samenvattingZonderPunten&&uit.weerAan&&uit.puntenTabTerug;
  uit.gemAan=gemAan;uit.gemUit=ruw;
  return uit;
})()
