// Test van de wensen van 23 okt 2026: vaste tafel bij een kadervariant, spelelement vóór vierbal in Info, caramboles
// bij een aangetikte partij in Inzicht, voorspelling met aantal partijen, in Stats → Je niveau de vormkeuze en meerdere
// tafels aanvinken, doel "eerder gehaald" en de carambole-ballen in "Je seizoen in beeld".
// Overschrijft de opslag; alles.js zet testdata terug.
// Draaien: await eval(await fetch("/test/wensen.js").then(r=>r.text()))
(async function(){
  const w=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
  const k=function(tk){return Array.from(document.querySelectorAll("#root button")).find(function(b){return b.textContent.trim()===tk;});};
  const kb=function(tk){return Array.from(document.querySelectorAll("button")).find(function(b){return b.textContent.trim().indexOf(tk)===0;});};
  const data=function(){return JSON.parse(localStorage.getItem("biljart-tracker-v2"));};
  const tekst=function(){return document.getElementById("root").textContent;};
  const tafelKnop=function(l){return Array.from(document.querySelectorAll("#root button")).find(function(b){return b.textContent.trim().indexOf(l+"×")===0;});};
  const uit={};

  // 1. Kader 47/2: geen tafelknoppen maar vast de 2,84; de partij krijgt die tafel
  kb("Kader").click();await w(250);
  Array.from(document.querySelectorAll("[data-kaderkiezer] button")).find(function(b){return b.textContent.trim()==="Kader 47/2";}).click();await w(300);
  k("Spelen").click();await w(200);
  const vast=document.querySelector("[data-vaste-tafel]");
  uit.vasteTafel=!!vast&&vast.textContent.indexOf("2,84")!==-1&&!tafelKnop("2,10");
  const voor=data().partijen.length;
  k("Start partij").click();await w(200);k("+").click();await w(50);k("Noteer").click();await w(250);
  k("Volgende stap").click();await w(200);k("Beurt opslaan").click();await w(300);
  Array.from(document.querySelectorAll("button")).find(function(b){return b.textContent.trim()==="Afsluiten";}).click();await w(200);
  k("Opslaan").click();await w(400);
  const ps=data().partijen;
  uit.kaderTafel=ps.length===voor+1&&ps[ps.length-1].discipline==="kader47"&&ps[ps.length-1].tafel==="284";
  const o=Array.from(document.querySelectorAll("div")).find(function(d){return d.style.position==="fixed";});if(o)o.click();await w(200);
  kb("Libre").click();await w(250);
  uit.libreKiest=!document.querySelector("[data-vaste-tafel]")&&!!tafelKnop("2,10");

  // 2. Info: Spelelement staat boven Vierbal
  k("Info").click();await w(250);
  const t2=tekst();
  uit.volgordeInfo=t2.indexOf("Spelelement")!==-1&&t2.indexOf("Spelelement")<t2.indexOf("Vierbal (twee rode ballen)");

  // 4. Voorspelling noemt over hoeveel partijen de recente vorm gaat (tekst in de vertaalsleutel)
  uit.voorspelling=t("Bij je recente vorm (laatste {p} partijen: {v}) bereik je {k} over ongeveer {n} partijen",{p:5,v:"2,27",k:"x",n:3}).indexOf("laatste 5 partijen")!==-1;

  // 5. Stats → Je niveau: vormkeuze (zelfde instelling als rechtsboven) en meerdere tafels
  k("Stats").click();await w(300);
  const venster=document.querySelector("[data-niveau-venster]");
  uit.vormKnoppen=!!venster&&venster.querySelectorAll("button").length===4;
  Array.from(venster.querySelectorAll("button")).find(function(b){return b.textContent.trim()==="10";}).click();await w(300);
  uit.vormGezet=data().vormVenster===10;
  const tafels=document.querySelector("[data-niveau-tafels]");
  const tk=tafels?Array.from(tafels.querySelectorAll("button")):[];
  if(tk.length>=3){
    tk[1].click();await w(200);
    const een=tekst().indexOf("Alleen je partijen op de")!==-1;
    Array.from(document.querySelectorAll("[data-niveau-tafels] button"))[2].click();await w(200);
    // Twee aangevinkt: bij drie of meer gespeelde tafels twee vinkjes; bij precies twee is dat gewoon "Alle tafels"
    const vinkjes=Array.from(document.querySelectorAll("[data-niveau-tafels] button")).filter(function(b){return b.textContent.indexOf("✓")===0;}).length;
    const twee=tk.length>=4?vinkjes===2:vinkjes===0&&tekst().indexOf("Alleen je partijen op de")===-1;
    Array.from(document.querySelectorAll("[data-niveau-tafels] button"))[0].click();await w(200);
    uit.tafelsAanvinken=een&&twee&&tekst().indexOf("Alleen je partijen op de")===-1;
  }else uit.tafelsAanvinken=true; // testdata met maar één tafel
  Array.from(document.querySelectorAll("[data-niveau-venster] button")).find(function(b){return b.textContent.trim()==="20";}).click();await w(250);

  // 6. Doel eerder gehaald met een andere instelling: de ring zegt het, zonder "Doel gehaald!"
  const doos=document.createElement("div");document.body.appendChild(doos);
  const wortel=ReactDOM.createRoot(doos);
  wortel.render(React.createElement(DoelRing,{doel:{waarde:2,datum:"2099-01-01",start:1.5,gehaald:false,eerder:{op:"2026-10-18T12:00:00Z",venster:10}},vorm:1.8,discipline:"libre"}));
  await w(200);
  uit.doelEerder=!!doos.querySelector("[data-doel-eerder]")&&doos.textContent.indexOf("laatste 10 partijen")!==-1&&doos.textContent.indexOf("Doel gehaald!")===-1;
  wortel.unmount();doos.remove();

  // 7. Seizoen in beeld: carambole-ballen in plaats van de poolbal
  const doos2=document.createElement("div");document.body.appendChild(doos2);
  const w2=ReactDOM.createRoot(doos2);w2.render(React.createElement(CaromBallen,{maat:40}));await w(100);
  uit.caromBallen=doos2.querySelectorAll("circle").length===6&&doos2.textContent.indexOf("🎱")===-1;
  w2.unmount();doos2.remove();

  k("Spelen").click();await w(200);
  uit.goed=uit.vasteTafel&&uit.kaderTafel&&uit.libreKiest&&uit.volgordeInfo&&uit.voorspelling&&uit.vormKnoppen&&uit.vormGezet&&uit.tafelsAanvinken&&uit.doelEerder&&uit.caromBallen;
  return uit;
})()
