// Klikt in de geladen app alle disciplines, hoofdtabs en Dash-subtabs langs en meldt per scherm of
// het iets toont (een crash in React laat een lege pagina achter). Draait daarna test/snapshot.js.
// Draaien in de browser-console: await eval(await fetch("/test/rondgang.js").then(r=>r.text()))
(async function(){
  const wacht=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
  const knop=function(tekst){return Array.from(document.querySelectorAll("button")).find(function(b){return b.textContent.trim()===tekst;});};
  const fouten=[];
  const bekeken=[];
  async function klik(tekst,label){
    const b=knop(tekst);
    if(!b){fouten.push("knop niet gevonden: "+tekst+" ("+label+")");return;}
    b.click();await wacht(150);
    const app=document.querySelector(".app");
    if(!app||app.innerText.trim().length<50)fouten.push("leeg scherm na: "+label);
    else bekeken.push(label);
  }
  for(const disc of ["Libre","Driebanden","Bandstoten"]){
    await klik(disc,disc);
    for(const tab of ["Spelen","Stats","Log","Data"])await klik(tab,disc+"/"+tab);
    await klik("Dash",disc+"/Dash");
    for(const sub of ["✨ Inzicht","Trend","Constant","Patronen","Vergelijk","Punten"])await klik(sub,disc+"/Dash/"+sub);
  }
  // Kader-variant via de kiezer
  await klik("Kader","Kader-kiezer");
  await klik("Kader 38/2","Kader 38/2");
  await klik("Stats","Kader 38/2/Stats");
  await klik("Libre","terug naar Libre");
  await klik("Spelen","Libre/Spelen");
  const snap=await eval(await fetch("/test/snapshot.js?"+Date.now()).then(function(r){return r.text();}));
  return{schermen:bekeken.length,fouten:fouten,berekeningenGelijk:snap.gelijk,versie:typeof APP_VERSIE!=="undefined"?APP_VERSIE:"?"};
})()
