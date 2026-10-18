// Talen van Biljart Tracker. De Nederlandse tekst is zelf de sleutel: t("Start partij") geeft in het Engels
// "Start game". Vertalingen staan per taal in js/taal-<code>.js (VERTALING.en = {...}). Ontbreekt een vertaling,
// dan valt t() terug op Engels en daarna op het Nederlands, zodat er nooit een lege knop staat.
// Variabelen tussen accolades: t("Seizoen {n}",{n:2}). Opgeslagen gegevens (opmerkingen, disciplines,
// klassen) blijven intern Nederlands en worden alleen bij het tonen vertaald (met t(label)).
// Controle op ontbrekende vertalingen: node test/vertalingen-node.js
const TALEN=[
  {code:"nl",naam:"Nederlands",vlag:"🇳🇱"},
  {code:"en",naam:"English",vlag:"🇬🇧"},
  {code:"fr",naam:"Français",vlag:"🇫🇷"},
  {code:"de",naam:"Deutsch",vlag:"🇩🇪"},
  {code:"es",naam:"Español",vlag:"🇪🇸"},
  {code:"tr",naam:"Türkçe",vlag:"🇹🇷"},
  {code:"ko",naam:"한국어",vlag:"🇰🇷"}
];
const VERTALING={};
let TAAL="nl";

function zetTaal(code){
  TAAL=TALEN.some(function(x){return x.code===code;})?code:"nl";
  if(typeof document!=="undefined")document.documentElement.lang=TAAL;
}
// Taal van de telefoon/browser, als die er is; anders Engels
function taalVanToestel(){
  const lijst=(typeof navigator!=="undefined"&&(navigator.languages||[navigator.language]))||[];
  for(let i=0;i<lijst.length;i++){
    const c=String(lijst[i]||"").slice(0,2).toLowerCase();
    if(TALEN.some(function(x){return x.code===c;}))return c;
  }
  return"en";
}
// Gekozen taal: zelf ingesteld, anders Nederlands voor wie de app al gebruikte (alles was Nederlands), en voor een
// nieuwe gebruiker de taal van het toestel
function taalVoorData(data){
  if(data&&data.taal)return data.taal;
  if(data&&(data.onboardingGezien||(data.partijen&&data.partijen.length)))return"nl";
  return taalVanToestel();
}
function t(nl,vars){
  let s=nl;
  if(TAAL!=="nl"){
    const v=VERTALING[TAAL],e=VERTALING.en;
    s=(v&&v[nl]!==undefined)?v[nl]:(e&&e[nl]!==undefined)?e[nl]:nl;
  }
  if(vars)s=s.replace(/\{(\w+)\}/g,function(m,k){return vars[k]!==undefined&&vars[k]!==null?vars[k]:m;});
  return s;
}
// Korte naam voor de disciplinebalk bovenin, als een taal die heeft ("kort:Libre"); anders de gewone naam
function kortNaam(disc){
  const d=DISCIPLINES[disc];if(!d)return disc;
  const v=VERTALING[TAAL]&&VERTALING[TAAL]["kort:"+(d._naam||d.naam)]; // alleen van de taal zelf, niet via Engels
  return v||d.naam;
}
// Badge-labels blijven intern Nederlands (de code vergelijkt erop); zo worden ze getoond
function badgeLabel(l){
  const m=/^Gemiddelde boven (.+)$/.exec(l||"");
  return m?t("Gemiddelde boven {g}",{g:m[1]}):t(l);
}
// Datumnotatie van de taal (voor toLocaleDateString)
function taalLocale(){return{nl:"nl-NL",en:"en-GB",fr:"fr-FR",de:"de-DE",es:"es-ES",tr:"tr-TR",ko:"ko-KR"}[TAAL]||"nl-NL";}
// Seizoennamen worden als "Seizoen 2" opgeslagen; zo tonen ze in de gekozen taal (een eigen naam blijft staan)
function seizoenNaam(s){
  const m=/^Seizoen (\d+)$/.exec((s&&s.naam)||"");
  return m?t("Seizoen {n}",{n:m[1]}):(s&&s.naam)||"";
}
// Maandsleutel "mrt 2026" (maandKey) als tekst in de gekozen taal; lang = volledige maandnaam
const MAANDEN_NL=["jan","feb","mrt","apr","mei","jun","jul","aug","sep","okt","nov","dec"];
function maandTekst(k,lang){
  const m=/^([a-z]+) (\d{4})$/.exec(k||""),i=m?MAANDEN_NL.indexOf(m[1]):-1;
  if(i<0)return k||"";
  return new Date(+m[2],i,1).toLocaleDateString(taalLocale(),{month:lang?"long":"short",year:"numeric"});
}
// Maandnaam (0-11) en eenletterige weekdagen vanaf maandag in de gekozen taal
function maandNaam(i){return new Date(2026,i,1).toLocaleDateString(taalLocale(),{month:"long"});}
function weekdagLetters(){
  const uit=[];for(let i=0;i<7;i++)uit.push(new Date(2026,0,5+i).toLocaleDateString(taalLocale(),{weekday:"narrow"}).toLowerCase());
  return uit;
}
// Getal met de decimaalkomma of -punt van de taal (Engels: punt)
// Percentage (0,43 → "43%"); Turks zet het procentteken ervoor ("%43")
function procentTekst(x){const n=Math.round(x*100);return TAAL==="tr"?"%"+n:n+"%";}
// Dubbele punt tussen twee stukken tekst: Frans met spatie ervoor (" : ")
function dubbelePunt(){return TAAL==="fr"?" : ":": ";}
function getalTekst(x,dec){
  const s=Number(x).toFixed(dec);
  return TAAL==="en"||TAAL==="ko"?s:s.replace(".",","); // Engels en Koreaans: decimale punt
}

// Namen van disciplines, klassen, tafels en mijlpalen worden overal getoond via .naam; die geeft voortaan de
// vertaalde naam (de Nederlandse blijft als _naam bewaard). Zo hoeft niet elke plek t() te gebruiken.
(function(){
  if(typeof DISCIPLINES==="undefined")return;
  const vertaalbaar=function(o){
    if(!o||o._naam!==undefined)return;
    const nl=o.naam;
    Object.defineProperty(o,"_naam",{value:nl,enumerable:false});
    Object.defineProperty(o,"naam",{get:function(){return t(nl);},enumerable:true,configurable:true});
  };
  Object.keys(DISCIPLINES).forEach(function(k){vertaalbaar(DISCIPLINES[k]);(DISCIPLINES[k].niveaus||[]).forEach(vertaalbaar);});
  Object.keys(TAFELS).forEach(function(k){vertaalbaar(TAFELS[k]);});
  (MIJLPALEN||[]).forEach(vertaalbaar);
})();
