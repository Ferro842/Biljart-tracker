// Test van de wauw-onderdelen (jsx/wauw.jsx): optellende cijfers, speelkalender, doel met ring, "Je seizoen in
// beeld", partijkaart, viering bij een topserie en het uitzetten van animaties. Overschrijft de opslag;
// alles.js zet testdata terug.
// Draaien: await eval(await fetch("/test/wauw.js").then(r=>r.text()))
(async function(){
  const w=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
  const k=function(t){return Array.from(document.querySelectorAll("button")).find(function(b){return b.textContent.trim()===t;});};
  const kb=function(t){return Array.from(document.querySelectorAll("button")).find(function(b){return b.textContent.indexOf(t)!==-1;});};
  const tekst=function(){return document.getElementById("root").textContent+document.body.innerText;};
  const data=function(){return JSON.parse(localStorage.getItem("biljart-tracker-v2"));};
  const uit={};
  kb("Libre").click();await w(150);
  // Optellende cijfers: eindwaarde klopt (tests draaien zonder animatie)
  k("Stats").click();await w(300);
  const vormVak=Array.from(document.querySelectorAll("#root div")).find(function(x){return x.children.length===0&&x.textContent.indexOf("vorm · ")===0;});
  uit.telop=!!vormVak&&/^\d+\.\d{2}$/.test(vormVak.previousElementSibling.textContent);
  // Doel instellen → ring op Spelen
  kb("Stel een doel").click();await w(250);
  uit.doelVenster=tekst().indexOf("Je doel")!==-1;
  k("Doel opslaan").click();await w(300);
  uit.doelOpgeslagen=!!(data().doelen&&data().doelen.libre&&data().doelen.libre.waarde>0);
  k("Spelen").click();await w(250);
  uit.doelRing=tekst().indexOf("Doel ")!==-1&&!!document.querySelector("#root svg circle");
  // Je seizoen in beeld: openen, doorbladeren, laatste kaart met delen, sluiten
  k("Stats").click();await w(250);kb("Bekijk je seizoen").click();await w(400);
  uit.verhaalOpen=tekst().indexOf("Jouw seizoen in beeld")!==-1;
  const zone=Array.from(document.querySelectorAll("div")).find(function(d){return d.style.width==="67%";});
  for(let i=0;i<7;i++){zone.click();await w(80);}
  uit.verhaalSlot=!!kb("Deel je seizoen");
  document.querySelector('[aria-label="Sluiten"]').click();await w(250);
  uit.verhaalDicht=tekst().indexOf("Deel je seizoen")===-1;
  // Kalender in Dash
  k("Dash").click();await w(300);k("Kalender").click();await w(300);
  const dag=Array.from(document.querySelectorAll("#root div[title]")).filter(function(d){return d.title;})[0];
  uit.kalender=!!dag&&tekst().indexOf("speeldag")!==-1;
  if(dag){dag.click();await w(200);}
  uit.kalenderDag=tekst().indexOf("car. in")!==-1;
  // Partijkaart
  const p=data().partijen.find(function(x){return(x.discipline||"libre")==="libre";});
  const c=maakPartijKaart(p,"libre","3e klasse");
  uit.kaart=c.width===1080&&c.height===1350&&c.toDataURL("image/png").length>10000;
  // Viering bij een topserie (animaties even aan)
  window.__testRustig=false;
  k("Spelen").click();await w(200);(k("Start partij")||k("Doorgaan")).click();await w(250);
  for(let i=0;i<12;i++){k("+").click();await w(15);}
  k("Noteer").click();await w(150);k("Volgende stap").click();await w(150);k("Beurt opslaan").click();await w(300);
  uit.viering=!!document.querySelector("[data-viering]");
  window.__testRustig=true;
  k("Afsluiten").click();await w(150);k("Opslaan").click();await w(400);
  uit.deelKnop=!!kb("Deel als kaart");
  const o=Array.from(document.querySelectorAll("div")).find(function(d){return d.style.position==="fixed"&&d.style.zIndex==="200";});if(o)o.click();await w(200);
  // Animaties uit en weer aan
  k("Info").click();await w(250);
  const kaartA=Array.from(document.querySelectorAll("#root div")).find(function(d){return d.textContent==="Animaties en vieringen";}).parentElement;
  Array.from(kaartA.querySelectorAll("button")).find(function(b){return b.textContent.trim()==="Uit";}).click();await w(250);
  uit.animatiesUit=data().animaties===false&&document.documentElement.classList.contains("rustig");
  Array.from(kaartA.querySelectorAll("button")).find(function(b){return b.textContent.indexOf("Aan")!==-1;}).click();await w(250);
  uit.animatiesAan=data().animaties===true&&!document.documentElement.classList.contains("rustig");
  k("Spelen").click();await w(150);
  uit.goed=uit.telop&&uit.doelVenster&&uit.doelOpgeslagen&&uit.doelRing&&uit.verhaalOpen&&uit.verhaalSlot&&uit.verhaalDicht&&uit.kalender&&uit.kalenderDag
    &&uit.kaart&&uit.viering&&uit.deelKnop&&uit.animatiesUit&&uit.animatiesAan;
  return uit;
})()
