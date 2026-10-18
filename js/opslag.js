// Laden en opslaan van Carom Tracker. Web: localStorage (en window.storage als dat bestaat) onder
// sleutel SK. iOS-app (Capacitor): bestand in de Library-map, localStorage als extra kopie.
// Migraties van oude data gebeuren hier bij het laden: gebruikers mogen nooit een lege app zien.
// Gewone JavaScript, geladen na js/constanten.js en vóór de Babel-code in index.html.

// true in de native iOS-app; de class "native" wordt gezet door het script in <head>
const IS_NATIVE=document.documentElement.classList.contains("native");

// Vult tafelmaat aan voor partijen die dit veld nog niet hebben (oude data van vóór deze functie).
// Regel: 25 beurten -> 2,10-tafel, alle overige -> 2,30-tafel.
// Correctie: de partij met 40 beurten was ook op de 2,10-tafel.
const TAFELKEUZE_SINDS="2026-07-16";
function migreerTafels(d){
  let changed=false;
  (d.partijen||[]).forEach(function(p){
    if(!p.tafel){
      p.tafel=(p.beurten&&p.beurten.length===25)?"210":"230";
      changed=true;
    }
    // Eenmalige correctie (15 jul 2026, toen de tafelkeuze kwam): oude partijen van 40 beurten waren op de 2,10 gespeeld.
    // Alleen voor partijen van vóór die dag; latere partijen houden de tafel die de speler zelf koos.
    if(p.beurten&&p.beurten.length===40&&p.tafel!=="210"&&String(p.datum)<TAFELKEUZE_SINDS){
      p.tafel="210";
      changed=true;
    }
  });
  return changed;
}

// In de iOS-app (Capacitor) staat de data in een bestand in de Library-map van de app: dat blijft
// bewaard en gaat mee in iPhone-backups, anders dan de localStorage van de webview. localStorage wordt
// daarnaast bijgehouden als extra kopie. De webversie gebruikt alleen localStorage.
// Eenmalige aanvulling met terugwerkende kracht: in partijen op de 2,30 van vóór ACQUIT_AANVULLING_TOT
// begon iedereen met de acquit. Beurt 1 met caramboles = acquit gemaakt (bij Goed), een poedel = gemist
// (bij Gemist). Latere partijen blijven ongemoeid. Alleen toevoegen, nooit iets weghalen; staat het er al,
// dan verandert er niets. Geeft true terug als de partij is aangevuld.
function isOudeAcquitPartij(p){
  return !!p&&p.tafel==="230"&&new Date(p.datum).getTime()<new Date(ACQUIT_AANVULLING_TOT).getTime();
}
function vulAcquitAan(p){
  if(!isOudeAcquitPartij(p)||!p.beurten||!p.beurten.length)return false;
  const b=p.beurten[0];
  const lijst=b.caramboles>0?"goed":"gemist";
  const huidig=b[lijst]||[];
  if(huidig.indexOf("Acquit")!==-1)return false;
  const nieuw=Object.assign({},b);
  nieuw[lijst]=huidig.concat(["Acquit"]);
  p.beurten=[nieuw].concat(p.beurten.slice(1));
  return true;
}
function migreerAcquit(d){
  let changed=false;
  (d.partijen||[]).forEach(function(p){if(vulAcquitAan(p))changed=true;});
  return changed;
}

// Herstel (16 okt 2026): een ingelezen wedstrijdbriefje kon door een tijdelijk verschil tussen bestanden
// (nieuw controlescherm, oud index.html uit de cache) beurten opslaan met een object {car,gemist,goed} op de
// plek van het getal caramboles ("[object Object]" in de app). Haal het getal en de opmerkingen eruit en
// reken de partij opnieuw door. Acquit staat in Goed bij caramboles, anders in Gemist. Geeft true bij herstel.
function herstelBeurten(d){
  let changed=false;
  (d.partijen||[]).forEach(function(p){
    let kapot=false;
    const beurten=(p.beurten||[]).map(function(b){
      if(!b||typeof b.caramboles!=="object"||b.caramboles===null)return b;
      kapot=true;
      const o=b.caramboles,car=Math.max(0,parseInt(o.car,10)||0);
      const samen=function(a,c){const uit=[];(a||[]).concat(c||[]).forEach(function(l){if(typeof l==="string"&&uit.indexOf(l)===-1)uit.push(l);});return uit;};
      let gemist=samen(b.gemist,o.gemist),goed=car>0?samen(b.goed,o.goed):[];
      if(gemist.indexOf("Acquit")!==-1&&goed.indexOf("Acquit")!==-1){if(car>0)gemist=gemist.filter(function(l){return l!=="Acquit";});else goed=goed.filter(function(l){return l!=="Acquit";});}
      return Object.assign({},b,{caramboles:car,gemist:gemist,goed:goed});
    });
    if(!kapot)return;
    p.beurten=beurten;
    const st=typeof stat==="function"?stat(beurten,p.discipline||"libre"):null;
    if(st)Object.assign(p,st);
    changed=true;
  });
  return changed;
}

const DATA_BESTAND="biljart-data.json",DATA_TMP="biljart-data.tmp";
function nativeFS(){return window.Capacitor.Plugins.Filesystem;}
async function leesNative(pad){
  try{
    const r=await nativeFS().readFile({path:pad,directory:"LIBRARY",encoding:"utf8"});
    const d=JSON.parse(r.data);
    return d&&Array.isArray(d.partijen)?d:null;
  }catch(e){return null;}
}
// Schrijven gaat via een tijdelijk bestand dat daarna wordt hernoemd, zodat een crash halverwege nooit
// een half bestand achterlaat. De wachtrij zorgt dat snel opeenvolgende saves niet door elkaar lopen.
let schrijfRij=Promise.resolve();
function schrijfNative(json){
  schrijfRij=schrijfRij.then(async function(){
    await nativeFS().writeFile({path:DATA_TMP,data:json,directory:"LIBRARY",encoding:"utf8"});
    try{await nativeFS().deleteFile({path:DATA_BESTAND,directory:"LIBRARY"});}catch(e){}
    await nativeFS().rename({from:DATA_TMP,to:DATA_BESTAND,directory:"LIBRARY",toDirectory:"LIBRARY"});
  }).catch(function(e){console.log("Native opslaan mislukt:",e);});
  return schrijfRij;
}

async function laadData(){
  if(IS_NATIVE){
    // Het tijdelijke bestand is de fallback voor als de app crashte tussen verwijderen en hernoemen
    const d=(await leesNative(DATA_BESTAND))||(await leesNative(DATA_TMP));
    if(d){
      console.log("Geladen uit native bestand: "+d.partijen.length+" partijen");
      let changed=migreerTafels(d);
      if(herstelBeurten(d))changed=true;
      if(migreerAcquit(d))changed=true;
      if(d.onboardingGezien===undefined&&d.partijen.length>0){d.onboardingGezien=true;changed=true;}
      if(changed)await slaOp(d);
      return d;
    }
    // Nog geen bestand: eenmalige migratie van bestaande localStorage-data (die blijft ook staan)
    const oud=await laadWebData();
    if(oud.partijen.length>0){
      await slaOp(oud);
      console.log("Gemigreerd naar native bestand: "+oud.partijen.length+" partijen");
    }
    return oud;
  }
  return laadWebData();
}

async function laadWebData(){
  // Eerst localStorage. Zonder partijen (nieuwe speler: alleen instellingen, welkomstscherm gezien of een
  // eerste lopende partij) bewaren we hem als terugval: een kopie mét partijen in window.storage gaat voor.
  let zonderPartijen=null;
  try{
    const s=localStorage.getItem(SK);
    if(s){
      const d=JSON.parse(s);
      if(d&&Array.isArray(d.partijen)&&d.partijen.length===0)zonderPartijen=d;
      if(d&&d.partijen&&d.partijen.length>0){
        console.log("Geladen uit localStorage: "+d.partijen.length+" partijen");
        let changed=migreerTafels(d);
        if(herstelBeurten(d))changed=true;
      if(migreerAcquit(d))changed=true;
        if(d.onboardingGezien===undefined){d.onboardingGezien=true;changed=true;}
        if(changed)await slaOp(d);
        return d;
      }
    }
  }catch(e){console.log("localStorage fout:",e);}
  // Dan window.storage (Claude app)
  try{
    if(window.storage){
      const r=await window.storage.get(SK);
      if(r){
        const d=JSON.parse(r.value);
        if(d&&d.partijen&&d.partijen.length>0){
          console.log("Geladen uit window.storage: "+d.partijen.length+" partijen");
          let changed=migreerTafels(d);
          if(herstelBeurten(d))changed=true;
      if(migreerAcquit(d))changed=true;
          if(d.onboardingGezien===undefined){d.onboardingGezien=true;changed=true;}
          if(changed)await slaOp(d);
          return d;
        }
      }
    }
  }catch(e){console.log("window.storage fout:",e);}
  if(zonderPartijen){
    console.log("Geladen uit localStorage: instellingen, nog geen partijen");
    if(!zonderPartijen.huidigeId)zonderPartijen.huidigeId=1;
    return zonderPartijen;
  }
  // Alleen leeg beginnen als er ECHT geen data is
  console.log("Geen opgeslagen data gevonden, start leeg");
  return{huidigeId:1,partijen:[]};
}
async function slaOp(d){
  if(IS_NATIVE)await schrijfNative(JSON.stringify(d));
  try{localStorage.setItem(SK,JSON.stringify(d));}catch(e){console.log("Opslaan mislukt:",e);}
  try{if(window.storage)await window.storage.set(SK,JSON.stringify(d));}catch(e){}
}

// Back-up als JSON-bestand: in de app via het deelmenu (Bewaar in Bestanden, AirDrop, mail, ...), op de website als
// download. Geeft true als het gelukt is (niet geannuleerd); op de website is annuleren niet te zien.
async function maakBackupBestand(data){
  const naam="biljart-backup-"+new Date().toISOString().slice(0,10)+".json";
  if(IS_NATIVE){
    try{
      await nativeFS().writeFile({path:naam,data:JSON.stringify(data,null,2),directory:"CACHE",encoding:"utf8"});
      const r=await nativeFS().getUri({path:naam,directory:"CACHE"});
      await window.Capacitor.Plugins.Share.share({files:[r.uri]});
      return true;
    }catch(e){
      if(!/cancel/i.test(String(e&&e.message)))alert("Exporteren mislukt: "+(e&&e.message||e));
      return false;
    }
  }
  const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url;a.download=naam;
  document.body.appendChild(a);a.click();document.body.removeChild(a);
  setTimeout(function(){URL.revokeObjectURL(url);},1000);
  return true;
}

// Back-upherinnering: je partijen staan alleen op dit toestel. Seintje na BACKUP_NA_PARTIJEN nieuwe partijen sinds je
// laatste back-up, of na BACKUP_NA_DAGEN dagen met minstens één nieuwe partij. "Later" = een week niet vragen.
// data.laatsteBackup (datum) en data.laatsteBackupAantal (aantal partijen toen) worden gezet bij elke export.
const BACKUP_NA_PARTIJEN=10,BACKUP_NA_DAGEN=30;
function backupNodig(data){
  const ps=(data&&data.partijen)||[];
  if(ps.length<3)return null;
  const nu=Date.now();
  if(data.backupLaterTot&&nu<new Date(data.backupLaterTot).getTime())return null;
  const nieuw=ps.length-(data.laatsteBackup?(data.laatsteBackupAantal||0):0);
  const sinds=data.laatsteBackup?new Date(data.laatsteBackup).getTime()
    :ps.reduce(function(m,p){const t=new Date(p.datum).getTime();return t<m?t:m;},nu);
  const dagen=Math.floor((nu-sinds)/86400000);
  if(nieuw>=BACKUP_NA_PARTIJEN||(nieuw>=1&&dagen>=BACKUP_NA_DAGEN))return{nieuw:nieuw,dagen:dagen,ooit:!!data.laatsteBackup};
  return null;
}

// Website: vraag de browser om de opslag niet zomaar op te ruimen (bijv. bij weinig ruimte). In de app niet nodig.
async function vraagBlijvendeOpslag(){
  if(IS_NATIVE||!navigator.storage||!navigator.storage.persist)return;
  try{if(!(await navigator.storage.persisted()))await navigator.storage.persist();}catch(e){}
}

// Beoordeling vragen (alleen in de iOS-/Android-app), via Apple en Google zelf: de InAppReview-plugin
// (@capacitor-community/in-app-review). Een eigen "Vind je de app leuk?"-venster mag niet (Apple-richtlijn 5.6.1).
// Alleen op een goed moment (record, beste partij, hogere klasse, gehaald doel), vanaf 5 partijen, hoogstens eens per
// 4 maanden en hoogstens 3 keer; Apple toont het venster zelf hoogstens 3 keer per jaar.
const BEOORDELING_MIN_PARTIJEN=5,BEOORDELING_MAX=3,BEOORDELING_TUSSEN_DAGEN=120;
function beoordelingPlugin(){
  const P=typeof window!=="undefined"&&window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.InAppReview;
  return P&&P.requestReview?P:null;
}
function beoordelingMoment(data,goedMoment,nu,kan){
  if(kan===undefined)kan=IS_NATIVE&&!!beoordelingPlugin();
  if(!kan||!goedMoment)return false;
  if(((data&&data.partijen)||[]).length<BEOORDELING_MIN_PARTIJEN)return false;
  const g=(data&&data.beoordelingGevraagd)||[];
  if(g.length>=BEOORDELING_MAX)return false;
  if(g.length&&(nu||Date.now())-new Date(g[g.length-1]).getTime()<BEOORDELING_TUSSEN_DAGEN*86400000)return false;
  return true;
}
function vraagBeoordeling(){
  const P=beoordelingPlugin();
  if(P)P.requestReview().catch(function(e){console.log("Beoordeling:",e);});
}
