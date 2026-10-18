// Test van de Data-tab: kopieerknoppen, tekstexport en importeren van een back-up (met migratie van een
// partij zonder tafel en herstel van huidigeId). Overschrijft de opslag; alles.js zet testdata terug.
// Draaien: await eval(await fetch("/test/datatab.js").then(r=>r.text()))
(async function(){
  const w=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
  const k=function(t){return Array.from(document.querySelectorAll("button")).find(function(b){return b.textContent.trim().indexOf(t)===0;});};
  const uit={};
  k("Info").click();await w(200);
  // Kopieer data: gelukt = alleen "Gekopieerd!" (geen tekstvak); de gekopieerde tekst vangen we af bij execCommand
  let gekopieerdeTekst=null;const oudExec=document.execCommand;
  // (een gescripte klik mag in de testbrowser niet echt kopiëren; daarom doen we een gelukte kopie na)
  document.execCommand=function(c){if(c==="copy"){const ta=Array.from(document.querySelectorAll("textarea[readonly]")).pop();gekopieerdeTekst=ta&&ta.value;return true;}return oudExec.apply(document,arguments);};
  k("Kopieer data").click();await w(150);
  uit.gekopieerd=!!k("Gekopieerd!")&&!document.querySelector("[data-handmatig-kopieren]");
  uit.tekstExport=!!gekopieerdeTekst&&gekopieerdeTekst.indexOf("BILJART DATA")===0;
  // Mislukt kopiëren: dan staat de tekst in beeld om zelf te kopiëren
  document.execCommand=function(){return false;};
  (k("Kopieer data")||k("Gekopieerd!")).click();await w(150);
  const hand=document.querySelector("[data-handmatig-kopieren] textarea");
  uit.handmatig=!!hand&&hand.value.indexOf("BILJART DATA")===0;
  document.execCommand=function(c){return c==="copy"?true:oudExec.apply(document,arguments);};
  k("📋 Partij-analyse").click();await w(100);uit.promptKnop=!!k("Gekopieerd!")&&!document.querySelector("[data-handmatig-kopieren]");
  document.execCommand=oudExec;
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
  // Beoordeling vragen: alleen in de app, op een goed moment, vanaf 5 partijen, hoogstens eens per 4 maanden en 3 keer
  const nu=Date.now(),dagB=86400000,pB=ps(6);
  uit.beoordelingRegels=beoordelingMoment({partijen:pB},true,nu,true)&&!beoordelingMoment({partijen:pB},false,nu,true)
    &&!beoordelingMoment({partijen:pB},true,nu,false)&&!beoordelingMoment({partijen:ps(3)},true,nu,true)
    &&!beoordelingMoment({partijen:pB,beoordelingGevraagd:[new Date(nu-30*dagB).toISOString()]},true,nu,true)
    &&beoordelingMoment({partijen:pB,beoordelingGevraagd:[new Date(nu-130*dagB).toISOString()]},true,nu,true)
    &&!beoordelingMoment({partijen:pB,beoordelingGevraagd:["2025-01-01","2025-06-01","2025-11-01"]},true,nu,true)
    &&!beoordelingMoment({partijen:pB},true);
  // Laden zonder partijen (nieuwe speler): instellingen en lopende partij blijven bewaard, niet leeg beginnen
  const bewaard=localStorage.getItem("biljart-tracker-v2");
  localStorage.setItem("biljart-tracker-v2",JSON.stringify({huidigeId:7,partijen:[],onboardingGezien:true,taal:"de",huidigeDiscipline:"kader471",lopendePartij:{tafel:"230",doel:30,doelType:"beurten",beurten:[{id:6,caramboles:2,gemist:[],goed:[]}]}}));
  const geladen=await laadWebData();
  localStorage.setItem("biljart-tracker-v2",bewaard);
  uit.ladenZonderPartijen=geladen.onboardingGezien===true&&geladen.taal==="de"&&geladen.huidigeDiscipline==="kader471"&&!!geladen.lopendePartij&&geladen.huidigeId===7;
  const klein={huidigeId:5,partijen:[{id:1,datum:"2026-05-01T19:00:00.000Z",beurten:[{id:2,caramboles:3,gemist:[],goed:[]},{id:3,caramboles:0,gemist:[],goed:[]}]}],onboardingGezien:true};
  const oudConfirm=window.confirm;window.confirm=function(){return true;};
  const inp=document.querySelector("input[type=file]"),dt=new DataTransfer();
  dt.items.add(new File([JSON.stringify(klein)],"b.json",{type:"application/json"}));
  inp.files=dt.files;inp.dispatchEvent(new Event("change",{bubbles:true}));
  await w(400);window.confirm=oudConfirm;
  const na=JSON.parse(localStorage.getItem("biljart-tracker-v2"));
  uit.geimporteerd=na.partijen.length===1&&na.partijen[0].tafel==="230"&&na.huidigeId===5;
  k("Stats").click();await w(200);uit.statsNaImport=document.body.textContent.indexOf("Alle 1 partijen")!==-1;
  uit.goed=uit.backupRegels&&uit.backupKaart&&uit.backupDatumRegel&&uit.gekopieerd&&uit.tekstExport&&uit.handmatig&&uit.ladenZonderPartijen&&uit.beoordelingRegels&&uit.promptKnop&&uit.geimporteerd&&uit.statsNaImport;
  return uit;
})()
