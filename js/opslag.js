// Laden en opslaan van Biljart Tracker. Web: localStorage (en window.storage als dat bestaat) onder
// sleutel SK. iOS-app (Capacitor): bestand in de Library-map, localStorage als extra kopie.
// Migraties van oude data gebeuren hier bij het laden: gebruikers mogen nooit een lege app zien.
// Gewone JavaScript, geladen na js/constanten.js en vóór de Babel-code in index.html.

// true in de native iOS-app; de class "native" wordt gezet door het script in <head>
const IS_NATIVE=document.documentElement.classList.contains("native");

// Vult tafelmaat aan voor partijen die dit veld nog niet hebben (oude data van vóór deze functie).
// Regel: 25 beurten -> 2,10-tafel, alle overige -> 2,30-tafel.
// Correctie: de partij met 40 beurten was ook op de 2,10-tafel.
function migreerTafels(d){
  let changed=false;
  (d.partijen||[]).forEach(function(p){
    if(!p.tafel){
      p.tafel=(p.beurten&&p.beurten.length===25)?"210":"230";
      changed=true;
    }
    if(p.beurten&&p.beurten.length===40&&p.tafel!=="210"){
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
  // Eerst localStorage
  try{
    const s=localStorage.getItem(SK);
    if(s){
      const d=JSON.parse(s);
      if(d&&d.partijen&&d.partijen.length>0){
        console.log("Geladen uit localStorage: "+d.partijen.length+" partijen");
        let changed=migreerTafels(d);
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
          if(migreerAcquit(d))changed=true;
          if(d.onboardingGezien===undefined){d.onboardingGezien=true;changed=true;}
          if(changed)await slaOp(d);
          return d;
        }
      }
    }
  }catch(e){console.log("window.storage fout:",e);}
  // Alleen leeg beginnen als er ECHT geen data is
  console.log("Geen opgeslagen data gevonden, start leeg");
  return{huidigeId:1,partijen:[]};
}
async function slaOp(d){
  if(IS_NATIVE)await schrijfNative(JSON.stringify(d));
  try{localStorage.setItem(SK,JSON.stringify(d));}catch(e){console.log("Opslaan mislukt:",e);}
  try{if(window.storage)await window.storage.set(SK,JSON.stringify(d));}catch(e){}
}
