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
  // Back-upherinnering: regels (backupNodig) en het kaartje op Spelen met "Later"
  const ps=function(n){return Array.from({length:n},function(_,i){return{id:i,datum:"2026-0"+(1+i%8)+"-01T19:00:00.000Z",beurten:[]};});};
  const dag=86400000,iso=function(t){return new Date(t).toISOString();};
  uit.backupRegels=!!backupNodig({partijen:ps(12)})&&!backupNodig({partijen:ps(2)})
    &&!backupNodig({partijen:ps(12),laatsteBackup:iso(Date.now()),laatsteBackupAantal:12})
    &&!backupNodig({partijen:ps(15),laatsteBackup:iso(Date.now()-5*dag),laatsteBackupAantal:12})
    &&!!backupNodig({partijen:ps(22),laatsteBackup:iso(Date.now()-5*dag),laatsteBackupAantal:12})
    &&!!backupNodig({partijen:ps(13),laatsteBackup:iso(Date.now()-40*dag),laatsteBackupAantal:12})
    &&!backupNodig({partijen:ps(12),backupLaterTot:iso(Date.now()+dag)});
  k("Spelen").click();await w(250);
  const kaart=!!document.querySelector("[data-backup-herinnering]");
  k("Later").click();await w(250);
  uit.backupKaart=kaart&&!document.querySelector("[data-backup-herinnering]")&&!!JSON.parse(localStorage.getItem("biljart-tracker-v2")).backupLaterTot;
  k("Info").click();await w(250);
  uit.backupDatumRegel=document.getElementById("root").textContent.indexOf("Je hebt nog geen back-up gemaakt.")!==-1;
  const klein={huidigeId:5,partijen:[{id:1,datum:"2026-05-01T19:00:00.000Z",beurten:[{id:2,caramboles:3,gemist:[],goed:[]},{id:3,caramboles:0,gemist:[],goed:[]}]}],onboardingGezien:true};
  const oudConfirm=window.confirm;window.confirm=function(){return true;};
  const inp=document.querySelector("input[type=file]"),dt=new DataTransfer();
  dt.items.add(new File([JSON.stringify(klein)],"b.json",{type:"application/json"}));
  inp.files=dt.files;inp.dispatchEvent(new Event("change",{bubbles:true}));
  await w(400);window.confirm=oudConfirm;
  const na=JSON.parse(localStorage.getItem("biljart-tracker-v2"));
  uit.geimporteerd=na.partijen.length===1&&na.partijen[0].tafel==="230"&&na.huidigeId===5;
  k("Stats").click();await w(200);uit.statsNaImport=document.body.textContent.indexOf("Alle 1 partijen")!==-1;
  uit.goed=uit.backupRegels&&uit.backupKaart&&uit.backupDatumRegel&&uit.gekopieerd&&uit.tekstExport&&uit.promptKnop&&uit.geimporteerd&&uit.statsNaImport;
  return uit;
})()
