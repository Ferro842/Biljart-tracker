// Test van wedstrijd/training (28 okt 2026): keuze op Spelen, tegenstander en uitslag bij Afsluiten, oude partijen
// aanvinken (Log), "Alleen wedstrijden" en het overzicht in Stats → Je niveau. Overschrijft de opslag; alles.js zet
// testdata terug. Draaien: await eval(await fetch("/test/wedstrijd.js").then(r=>r.text()))
(async function(){
  const w=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
  const k=function(tk){return Array.from(document.querySelectorAll("#root button")).find(function(b){return b.textContent.trim()===tk;});};
  const data=function(){return JSON.parse(localStorage.getItem("biljart-tracker-v2"));};
  const typ=function(el,v){Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value").set.call(el,v);el.dispatchEvent(new Event("input",{bubbles:true}));};
  const uit={};

  // 1. Rekenwerk: soort zonder veld, uitslag met en zonder "te maken"
  const b=function(c){return{caramboles:c,gemist:[],goed:[]};};
  uit.soortStandaard=partijSoort({beurten:[]})==="training"&&partijSoort({bron:"briefje",beurten:[]})==="wedstrijd"&&partijSoort({soort:"training",bron:"briefje",beurten:[]})==="training";
  uit.uitslag=partijUitslag({soort:"wedstrijd",beurten:[b(50),b(30)],doelType:"caramboles",doel:80,tegen:{car:60,doel:80}})==="gewonnen"
    &&partijUitslag({soort:"wedstrijd",beurten:[b(50)],doelType:"caramboles",doel:100,tegen:{car:30,doel:50}})==="verloren" // handicap: 50% tegen 60%
    &&partijUitslag({soort:"wedstrijd",beurten:[b(40)],doelType:"beurten",doel:20,tegen:{car:40}})==="gelijk"
    &&partijUitslag({soort:"training",beurten:[b(40)],tegen:{car:10}})===null;

  // 2. Spelen: Wedstrijd kiezen, partij spelen, bij Afsluiten de tegenstander invullen
  k("Libre")&&k("Libre").click();await w(200);
  k("Spelen").click();await w(250);
  uit.keuzeOpSpelen=!!document.querySelector("[data-soort-keuze]");
  Array.from(document.querySelectorAll("[data-soort-keuze] button")).find(function(x){return x.textContent.indexOf("Wedstrijd")!==-1;}).click();await w(150);
  k("Start partij").click();await w(200);k("+").click();await w(50);k("+").click();await w(50);k("Noteer").click();await w(250);
  k("Volgende stap")&&k("Volgende stap").click();await w(200);k("Beurt opslaan")&&k("Beurt opslaan").click();await w(300);
  Array.from(document.querySelectorAll("button")).find(function(x){return x.textContent.trim()==="Afsluiten";}).click();await w(250);
  const venster=document.querySelector("[data-afsluiten]");
  uit.velden=!!venster&&!!venster.querySelector("[data-tegenstander]");
  typ(venster.querySelector("[data-tegen-car]"),"1");await w(150);
  typ(venster.querySelector("[data-tegen-naam]"),"Testtegenstander");await w(150);
  const vb=document.querySelector("[data-uitslag-voorbeeld]");
  uit.voorbeeld=!!vb&&vb.textContent.indexOf("Gewonnen")!==-1;
  const voor=data().partijen.length;
  k("Opslaan").click();await w(500);
  const ps=data().partijen,laatste=ps[ps.length-1];
  uit.opgeslagen=ps.length===voor+1&&laatste.soort==="wedstrijd"&&laatste.tegen&&laatste.tegen.car===1&&laatste.tegen.naam==="Testtegenstander"&&data().laatsteSoort==="wedstrijd";
  const sv=Array.from(document.querySelectorAll("div")).find(function(d){return d.style.position==="fixed";});
  uit.samenvatting=!!sv&&!!sv.querySelector("[data-uitslag]");
  if(sv)sv.click();await w(200);

  // 3. Log: label met uitslag, en een oude partij als wedstrijd aanvinken
  k("Log").click();await w(300);
  uit.label=Array.from(document.querySelectorAll("#root [data-uitslag]")).some(function(x){return x.textContent.indexOf("Testtegenstander")!==-1;});
  document.querySelector("#root [data-aanvinken-knop]").click();await w(300);
  const rijen=document.querySelectorAll("[data-aanvink-rij]");
  const libre=ps.filter(function(p){return(p.discipline||"libre")==="libre";});
  const doelId=libre[libre.length-2].id,wasSoort=partijSoort(libre[libre.length-2]);
  rijen[1].click();await w(100); // tweede van boven = de partij vóór de nieuwe
  Array.from(document.querySelectorAll("[data-wedstrijden-aanvinken] button")).find(function(x){return x.textContent.indexOf("Opslaan")===0;}).click();await w(400);
  const na=data().partijen.find(function(p){return p.id===doelId;});
  uit.aanvinken=rijen.length===libre.length&&partijSoort(na)!==wasSoort;

  // 4. Stats → Je niveau: alleen wedstrijden en het overzicht
  k("Stats").click();await w(300);
  const soortRij=document.querySelector("[data-niveau-soort]");
  uit.overzicht=!!document.querySelector("[data-wedstrijd-overzicht]")&&document.querySelector("[data-wedstrijd-overzicht]").textContent.indexOf("gewonnen")!==-1;
  if(soortRij){Array.from(soortRij.querySelectorAll("button"))[1].click();await w(300);}
  uit.alleenWedstrijden=!!soortRij&&!!document.querySelector("[data-niveau-deel]")&&document.querySelector("[data-niveau-deel]").textContent.indexOf("wedstrijden")!==-1;
  if(soortRij){Array.from(document.querySelectorAll("[data-niveau-soort] button"))[0].click();await w(200);}

  // 5. Partij wijzigen: terug naar training haalt de uitslag weg
  k("Log").click();await w(300);
  document.querySelector("#root [data-uitslag]").closest("button").click();await w(250);
  document.querySelector("#root [data-wedstrijd-knop]").click();await w(200);
  Array.from(document.querySelectorAll("[data-wedstrijd-bewerken] [data-soort-keuze] button"))[0].click();await w(100);
  Array.from(document.querySelectorAll("[data-wedstrijd-bewerken] button")).find(function(x){return x.textContent.trim()==="Opslaan";}).click();await w(300);
  const p5=data().partijen.find(function(p){return p.id===laatste.id;});
  uit.terugTraining=p5.soort==="training"&&!p5.tegen;

  k("Spelen").click();await w(200);
  Array.from(document.querySelectorAll("[data-soort-keuze] button"))[0].click();await w(100);
  uit.goed=uit.soortStandaard&&uit.uitslag&&uit.keuzeOpSpelen&&uit.velden&&uit.voorbeeld&&uit.opgeslagen&&uit.samenvatting&&uit.label&&uit.aanvinken&&uit.overzicht&&uit.alleenWedstrijden&&uit.terugTraining;
  return uit;
})()
