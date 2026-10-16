// Test van Info > Weergave: tekstgrootte (zoom op .app, scherm blijft precies gevuld en niets steekt uit)
// en eenvoudige modus (Noteer slaat de beurt direct op zonder opmerkingen-stap, geen spelelement, in Dash alleen
// Inzicht en Trend; + opmerking geeft toch de opmerkingen-stap) en het uitlegscherm. Zet alles weer terug. Overschrijft de opslag; alles.js zet testdata terug.
// Draaien: await eval(await fetch("/test/weergave.js").then(r=>r.text()))
(async function(){
  const w=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
  const k=function(t){return Array.from(document.querySelectorAll("button")).find(function(b){return b.textContent.trim()===t;});};
  const kb=function(t){return Array.from(document.querySelectorAll("button")).find(function(b){return b.textContent.trim().indexOf(t)===0;});};
  const tekst=function(){return document.getElementById("root").textContent;};
  const data=function(){return JSON.parse(localStorage.getItem("biljart-tracker-v2"));};
  // Knoppen in de kaart Weergave (er zijn meer "Aan"/"Uit"-knoppen in Stats)
  const weergaveKnop=function(t){
    const kop=Array.from(document.querySelectorAll("#root div")).find(function(d){return d.textContent==="Weergave";});
    return kop?Array.from(kop.parentElement.querySelectorAll("button")).find(function(b){return b.textContent.trim()===t;}):null;
  };
  const uit={};
  kb("Libre").click();await w(150);k("Spelen").click();await w(200);
  // Eenmalige melding voor bestaande gebruikers; "Bekijken" opent Info en komt niet terug
  const metTip=tekst().indexOf("Nieuw: kies zelf hoe je de app ziet")!==-1;
  if(metTip){k("Bekijken").click();await w(250);}
  uit.tip=(!metTip||(data().weergaveTipGezien===true&&tekst().indexOf("Zo werkt de app")!==-1));
  k("Spelen").click();await w(200);uit.tipWeg=tekst().indexOf("Nieuw: kies zelf hoe je de app ziet")===-1;
  k("Info").click();await w(250);
  // Tekstgrootte
  weergaveKnop("Extra groot").click();await w(300);
  const app=document.querySelector(".app"),r=app.getBoundingClientRect();
  uit.zoom=getComputedStyle(app).zoom==="1.3"&&data().tekstgrootte==="extra";
  uit.vultScherm=Math.abs(r.height-innerHeight)<2&&document.documentElement.scrollWidth<=innerWidth;
  weergaveKnop("Normaal").click();await w(300);
  uit.terugNormaal=getComputedStyle(app).zoom==="1"&&data().tekstgrootte==="normaal";
  // Eenvoudige modus
  weergaveKnop("Aan").click();await w(300);
  uit.opgeslagen=data().eenvoudig===true;
  // Spelelement staat los van de eenvoudige modus: kaart blijft, instelling ongewijzigd
  uit.spelelementLos=tekst().indexOf("Spelelement")!==-1&&data().spelelement!==false;
  k("Dash").click();await w(300);
  uit.dashTabs=!!k("Trend")&&!k("Constant")&&!k("Patronen")&&!k("Vergelijk")&&!!k("Punten");
  k("Spelen").click();await w(200);(k("Start partij")||k("Doorgaan")).click();await w(200);
  const voor=(data().lopendePartij||{beurten:[]}).beurten.length;
  k("+").click();await w(30);k("+").click();await w(30);k("Noteer").click();await w(300);
  const lp=(data().lopendePartij||{beurten:[]}).beurten;
  uit.direct=lp.length===voor+1&&lp[lp.length-1].caramboles===2&&tekst().indexOf("Noteer")!==-1;
  uit.puntenBalk=tekst().indexOf("Deze partij:")!==-1;
  // + opmerking: toch de gewone opmerkingen-stap voor deze beurt
  k("+").click();await w(30);k("+ opmerking").click();await w(250);
  const klos=Array.from(document.querySelectorAll("button")).find(function(b){return b.textContent.indexOf("Klos")!==-1;});
  if(klos)klos.click();await w(100);
  k("Volgende stap").click();await w(200);k("Beurt opslaan").click();await w(300);
  const lp2=(data().lopendePartij||{beurten:[]}).beurten,laatste=lp2[lp2.length-1]||{};
  uit.plusOpmerking=lp2.length===voor+2&&laatste.caramboles===1&&(laatste.gemist||[]).indexOf("Klos")!==-1;
  k("Afsluiten").click();await w(150);k("Opslaan").click();await w(300);
  const o=Array.from(document.querySelectorAll("div")).find(function(d){return d.style.position==="fixed";});if(o)o.click();await w(150);
  k("Info").click();await w(250);weergaveKnop("Uit").click();await w(300);
  uit.weerUit=data().eenvoudig===false&&tekst().indexOf("Spelelement")!==-1;
  k("Spelen").click();await w(150);
  // Uitleg is altijd bereikbaar onder Start partij
  k("ℹ️ Zo werkt de app").click();await w(250);
  uit.uitleg=tekst().indexOf("Zo werkt de app")!==-1&&tekst().indexOf("+ opmerking")!==-1&&tekst().indexOf("Info → Exporteer")!==-1;
  k("Sluiten").click();await w(200);
  uit.uitlegDicht=tekst().indexOf("Een partij spelen")===-1;
  uit.goed=uit.tip&&uit.tipWeg&&uit.plusOpmerking&&uit.uitleg&&uit.uitlegDicht&&uit.zoom&&uit.vultScherm&&uit.terugNormaal&&uit.opgeslagen&&uit.spelelementLos&&uit.dashTabs&&uit.direct&&uit.puntenBalk&&uit.weerUit;
  return uit;
})()
