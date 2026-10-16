// Test van de Data-tab: kopieerknoppen, tekstexport en importeren van een back-up (met migratie van een
// partij zonder tafel en herstel van huidigeId). Overschrijft de opslag; alles.js zet testdata terug.
// Draaien: await eval(await fetch("/test/datatab.js").then(r=>r.text()))
(async function(){
  const w=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
  const k=function(t){return Array.from(document.querySelectorAll("button")).find(function(b){return b.textContent.trim().indexOf(t)===0;});};
  const uit={};
  k("Info").click();await w(200);
  k("Kopieer data").click();await w(150);
  uit.gekopieerd=!!k("Gekopieerd!");
  const ta=document.querySelector("textarea[readonly]");
  uit.tekstExport=!!ta&&ta.value.indexOf("BILJART DATA")===0;
  k("📋 Partij-analyse").click();await w(100);uit.promptKnop=!!k("Gekopieerd!");
  const klein={huidigeId:5,partijen:[{id:1,datum:"2026-05-01T19:00:00.000Z",beurten:[{id:2,caramboles:3,gemist:[],goed:[]},{id:3,caramboles:0,gemist:[],goed:[]}]}],onboardingGezien:true};
  const oudConfirm=window.confirm;window.confirm=function(){return true;};
  const inp=document.querySelector("input[type=file]"),dt=new DataTransfer();
  dt.items.add(new File([JSON.stringify(klein)],"b.json",{type:"application/json"}));
  inp.files=dt.files;inp.dispatchEvent(new Event("change",{bubbles:true}));
  await w(400);window.confirm=oudConfirm;
  const na=JSON.parse(localStorage.getItem("biljart-tracker-v2"));
  uit.geimporteerd=na.partijen.length===1&&na.partijen[0].tafel==="230"&&na.huidigeId===5;
  k("Stats").click();await w(200);uit.statsNaImport=document.body.textContent.indexOf("Alle 1 partijen")!==-1;
  uit.goed=uit.gekopieerd&&uit.tekstExport&&uit.promptKnop&&uit.geimporteerd&&uit.statsNaImport;
  return uit;
})()
