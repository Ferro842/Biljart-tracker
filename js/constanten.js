// Vaste gegevens van Biljart Tracker: kleuren, opmerkingenlijsten, opslagsleutel, niveaus per
// discipline, tafelmaten en mijlpalen. Gewone JavaScript (geen JSX), geladen vóór de Babel-code in
// index.html; alles hier is daardoor overal in de app beschikbaar.

// Laken-kleur per discipline: alle groentinten van de app zijn CSS-variabelen (--c-<hex>, standaard groen in
// css/app.css). zetThema() zet ze om naar blauw (driebanden), grijs (bandstoten) of rood (kader); libre blijft
// groen. Goud, wit en de signaalkleuren ROOD/GRNT blijven overal gelijk. In SVG var() alleen via style={{}}.
const THEMA_KLEUREN=["1a2e1a","22341f","3a5c35","2d4a1e","0d1f0d","1e3a1e","182e14","152015","1a3019","1a2e10",
  "1c3019","2a4a1e","5a7a55","1c2c1c","1c2e18","24401f","132613","1a3a1a","2a3d20","2d4a22",
  "3f8a3a","1d4a1d"]; // laatste twee: het laken in het logo (licht midden, donkere rand)
const G="var(--c-1a2e1a)",GOUD="#c9a84c",GOUDL="#e8c96a",WIT="#f5f0e8",WITD="#e3ded4"; // WITD lichter voor beter contrast (was #d4cfc5)
const KBG="var(--c-22341f)",KBDR="var(--c-3a5c35)",ROOD="#e05555",GRNT="#4caf50";
// Tekstgrootte (Stats > Weergave): vergroot de hele app inclusief knoppen via CSS zoom op .app
const TEKSTGROOTTES=[["normaal","Normaal",1],["groot","Groot",1.15],["extra","Extra groot",1.3]];
function tekstZoom(k){const x=TEKSTGROOTTES.find(function(t){return t[0]===k;});return x?x[2]:1;}
// Tint (graden), verzadiging- en lichtheidsfactor per laken; null = groen zoals de kleuren zelf
function themaVan(discipline){
  if(discipline==="driebanden")return{tint:212,verz:1.35,licht:1.08};       // biljartblauw
  if(discipline==="bandstoten")return{tint:210,verz:0.18,licht:1.05};       // grijs
  if(String(discipline).indexOf("kader")===0)return{tint:356,verz:1.25,licht:1.05}; // rood
  return null;
}
function themaKleur(hex,th){
  if(!th)return"#"+hex;
  const r=parseInt(hex.slice(0,2),16)/255,g=parseInt(hex.slice(2,4),16)/255,b=parseInt(hex.slice(4,6),16)/255;
  const max=Math.max(r,g,b),min=Math.min(r,g,b),l0=(max+min)/2,d=max-min;
  const s0=d===0?0:d/(1-Math.abs(2*l0-1));
  const l=Math.min(1,l0*th.licht),s=Math.min(1,s0*th.verz),h=th.tint/360;
  const q=l<0.5?l*(1+s):l+s-l*s,p=2*l-q;
  const kan=function(t){t=(t+1)%1;return t<1/6?p+(q-p)*6*t:t<1/2?q:t<2/3?p+(q-p)*(2/3-t)*6:p;};
  return"#"+[kan(h+1/3),kan(h),kan(h-1/3)].map(function(x){return("0"+Math.round(x*255).toString(16)).slice(-2);}).join("");
}
function zetThema(discipline){
  if(typeof document==="undefined")return;
  const th=themaVan(discipline),st=document.documentElement.style;
  THEMA_KLEUREN.forEach(function(h){st.setProperty("--c-"+h,themaKleur(h,th));});
  const meta=document.querySelector('meta[name="theme-color"]');
  if(meta)meta.setAttribute("content",themaKleur("1a2e1a",th));
}


const GEMIST=[
  {label:"Trekstoot",emoji:"↩️"},{label:"Direct",emoji:"➤"},
  {label:"Bandstoot",emoji:"💢"},{label:"Driebanden",emoji:"🔺"},
  {label:"Achterom",emoji:"🔙"},{label:"Te zacht",emoji:"🐌"},
  {label:"Doorstoot",emoji:"➡️"},{label:"Moeilijk",emoji:"😓"},
  {label:"Onnodige fout",emoji:"😌"},{label:"Verzamelen",emoji:"🔄"},
  {label:"Positioneren",emoji:"📍"},{label:"Slechte positie",emoji:"⚠️"},
  {label:"Klos",emoji:"💥"},{label:"Slechte keuze",emoji:"🤔"},
  {label:"Snijden",emoji:"✂️"},{label:"Amorti",emoji:"🪃"},
  {label:"Massé",emoji:"🌀"},{label:"Piqué",emoji:"🎯"},
  {label:"Dun",emoji:"🪶"},{label:"Acquit",emoji:"🎬"},
  {label:"Los",emoji:"🍃"},
];
const GOED=[
  {label:"Verzamelen",emoji:"🔄"},{label:"Positioneren",emoji:"📍"},
  {label:"Compact gehouden",emoji:"🤏"},{label:"Trekstoot",emoji:"↩️"},
  {label:"Direct",emoji:"➤"},{label:"Driebanden",emoji:"🔺"},
  {label:"Bandstoot",emoji:"💢"},{label:"Snijden",emoji:"✂️"},
  {label:"Dun",emoji:"🪶"},{label:"Amorti",emoji:"🪃"},
  {label:"Massé",emoji:"🌀"},{label:"Piqué",emoji:"🎯"},
  {label:"Doorstoot",emoji:"➡️"},{label:"Acquit",emoji:"🎬"},
  {label:"Los",emoji:"🍃"},
];

const SK="biljart-tracker-v2";
// Openbare adressen van de app, o.a. voor "Deel deze app" vanuit de iOS-app. APP_STORE_URL invullen
// zodra de app in de App Store staat (vorm: https://apps.apple.com/app/id1234567890).
// Eenmalige aanvulling (14 okt 2026): in partijen op de 2,30 tot deze datum begon iedereen met de acquit,
// dus beurt 1 is daar de acquit. Voor latere partijen geldt dat niet vanzelf (bijv. met z'n tweeën).
const ACQUIT_AANVULLING_TOT="2026-10-15T00:00:00";
const WEB_URL="https://ferro842.github.io/Biljart-tracker/";
const APP_STORE_URL=null;

// Niveautabellen op basis van de officiële KNBB-klassegrenzen (moyennetabel dagbiljarten, libre/
// driebanden/bandstoten klein). Boven de hoogste officiële "klein"-klasse (waar de top overstapt op
// groot-tafels) is een redelijke inschatting gebruikt — expliciet als zodanig gelabeld.
const NIVEAUS_LIBRE=[
  {naam:"5e klasse",gemDrempel:0,emoji:"🔰",kleur:"#9aa89a"},
  {naam:"4e klasse",gemDrempel:1.20,emoji:"⭐",kleur:"#a8b0c0"},
  {naam:"3e klasse",gemDrempel:1.70,emoji:"🥉",kleur:"#c9915a"},
  {naam:"2e klasse",gemDrempel:2.50,emoji:"🥈",kleur:"#c4c4cf"},
  {naam:"1e klasse",gemDrempel:4.00,emoji:"🥇",kleur:"#e8c96a"},
  {naam:"Hoofdklasse",gemDrempel:11.00,emoji:"🏆",kleur:"#7fd8e0"},
  {naam:"Ereklasse",gemDrempel:13.20,emoji:"💎",kleur:"#ff9fd1"}
];
const NIVEAUS_DRIEBANDEN=[
  {naam:"3e klasse",gemDrempel:0,emoji:"🥉",kleur:"#c9915a"},
  {naam:"2e klasse",gemDrempel:0.350,emoji:"🥈",kleur:"#c4c4cf"},
  {naam:"1e klasse",gemDrempel:0.500,emoji:"🥇",kleur:"#e8c96a"},
  {naam:"Hoofdklasse",gemDrempel:0.800,emoji:"🏆",kleur:"#7fd8e0"},
  {naam:"Ereklasse",gemDrempel:1.100,emoji:"👑",kleur:"#b18cf0"},
  {naam:"Topklasse*",gemDrempel:1.500,emoji:"💎",kleur:"#ff9fd1"}
];
const NIVEAUS_BANDSTOTEN=[
  {naam:"3e klasse",gemDrempel:0,emoji:"🥉",kleur:"#c9915a"},
  {naam:"2e klasse",gemDrempel:1.00,emoji:"🥈",kleur:"#c4c4cf"},
  {naam:"1e klasse",gemDrempel:2.00,emoji:"🥇",kleur:"#e8c96a"},
  {naam:"Extraklasse",gemDrempel:4.00,emoji:"🏆",kleur:"#7fd8e0"},
  {naam:"Ereklasse*",gemDrempel:6.00,emoji:"💎",kleur:"#ff9fd1"}
];
// Kader kent geen nette "5e klasse t/m Ereklasse"-systeem zoals Libre — de KNBB gebruikt hier losse
// letter-intervallen en toernooiniveaus per variant, geen doorlopende klassenreeks. Onderstaande is
// daarom een praktische, zelf opgezette indeling op basis van de officiële interval/partijlengte-
// tabellen, geen letterlijke KNBB-klassenaam. Genummerd aflopend (3→2→1), net als bij Driebanden en
// Bandstoten, zodat medaille en klassenummer overeenkomen (🥉=3, 🥈=2, 🥇=1).
// 38/2 en 47/2 hebben 9 (grotere) vakken en zijn de instapvarianten; 57/2 en 71/2 hebben 6 (kleinere,
// dus lastigere) vakken en liggen een niveau hoger.
const NIVEAUS_KADER38=[
  {naam:"Klasse 3",gemDrempel:0,emoji:"🥉",kleur:"#c9915a"},
  {naam:"Klasse 2",gemDrempel:2.00,emoji:"🥈",kleur:"#c4c4cf"},
  {naam:"Klasse 1",gemDrempel:4.00,emoji:"🥇",kleur:"#e8c96a"},
  {naam:"Hoofdklasse*",gemDrempel:7.00,emoji:"🏆",kleur:"#7fd8e0"},
  {naam:"Ereklasse*",gemDrempel:11.00,emoji:"💎",kleur:"#ff9fd1"}
];
const NIVEAUS_KADER47=[
  {naam:"Klasse 3",gemDrempel:0,emoji:"🥉",kleur:"#c9915a"},
  {naam:"Klasse 2",gemDrempel:2.00,emoji:"🥈",kleur:"#c4c4cf"},
  {naam:"Klasse 1",gemDrempel:4.00,emoji:"🥇",kleur:"#e8c96a"},
  {naam:"Hoofdklasse*",gemDrempel:7.00,emoji:"🏆",kleur:"#7fd8e0"},
  {naam:"Ereklasse*",gemDrempel:11.00,emoji:"💎",kleur:"#ff9fd1"}
];
const NIVEAUS_KADER57=[
  {naam:"Klasse 3",gemDrempel:0,emoji:"🥉",kleur:"#c9915a"},
  {naam:"Klasse 2",gemDrempel:1.00,emoji:"🥈",kleur:"#c4c4cf"},
  {naam:"Klasse 1",gemDrempel:2.00,emoji:"🥇",kleur:"#e8c96a"},
  {naam:"Hoofdklasse*",gemDrempel:3.50,emoji:"🏆",kleur:"#7fd8e0"},
  {naam:"Ereklasse*",gemDrempel:5.50,emoji:"💎",kleur:"#ff9fd1"}
];
const NIVEAUS_KADER71=[
  {naam:"Klasse 3",gemDrempel:0,emoji:"🥉",kleur:"#c9915a"},
  {naam:"Klasse 2",gemDrempel:1.00,emoji:"🥈",kleur:"#c4c4cf"},
  {naam:"Klasse 1",gemDrempel:2.00,emoji:"🥇",kleur:"#e8c96a"},
  {naam:"Hoofdklasse*",gemDrempel:3.50,emoji:"🏆",kleur:"#7fd8e0"},
  {naam:"Ereklasse*",gemDrempel:5.50,emoji:"💎",kleur:"#ff9fd1"}
];
const DISCIPLINES={
  libre:{naam:"Libre",niveaus:NIVEAUS_LIBRE},
  driebanden:{naam:"Driebanden",niveaus:NIVEAUS_DRIEBANDEN},
  bandstoten:{naam:"Bandstoten",niveaus:NIVEAUS_BANDSTOTEN},
  kader38:{naam:"Kader 38/2",niveaus:NIVEAUS_KADER38,groep:"kader"},
  kader47:{naam:"Kader 47/2",niveaus:NIVEAUS_KADER47,groep:"kader"},
  kader57:{naam:"Kader 57/2",niveaus:NIVEAUS_KADER57,groep:"kader"},
  kader71:{naam:"Kader 71/2",niveaus:NIVEAUS_KADER71,groep:"kader"}
};
// De hoofdknoppen bovenin de app: Libre/Driebanden/Bandstoten zijn losse disciplines, Kader is één
// knop die daarna een sub-keuze toont tussen de vier varianten.
const HOOFDDISCIPLINES=["libre","driebanden","bandstoten"];
const KADER_VARIANTEN=["kader38","kader47","kader57","kader71"];
const MAX_SCHRAP_AANDEEL=0.1; // nooit meer dan 1 op de 10 partijen schrappen, hoeveel punten je ook hebt
const PUNTEN_PER_DROP=1000; // elke 1000 badge-punten ontgrendelt het schrappen van 1 extra slechte partij

// Officiële KNBB-tafelmaten voor carambole: café-biljart, kleine matchtafel, halve match, grote
// matchtafel (wedstrijdbiljart).
const TAFELS={
  "210":{label:"2,10",vol:"2,10 x 1,05",naam:"Café-biljart"},
  "230":{label:"2,30",vol:"2,30 x 1,15",naam:"Kleine matchtafel"},
  "255":{label:"2,55",vol:"2,55 x 1,275",naam:"Halve match"},
  "284":{label:"2,84",vol:"2,84 x 1,42",naam:"Grote matchtafel"}
};
function tafelLabel(t){return(TAFELS[t]||TAFELS["230"]).label;}
function tafelVol(t){return(TAFELS[t]||TAFELS["230"]).vol;}

// Mijlpaal-badges: puur voor trouw blijven spelen, los van hoe goed je speelt. Tellen NIET mee voor
// niveau of badge-punten — alleen decoratief, om te laten zien dat je erbij blijft.
const MIJLPALEN=[
  {type:"partijen",aantal:10,naam:"10 partijen",emoji:"🎮"},
  {type:"partijen",aantal:25,naam:"25 partijen",emoji:"🎮"},
  {type:"partijen",aantal:50,naam:"50 partijen",emoji:"🎮"},
  {type:"partijen",aantal:100,naam:"100 partijen",emoji:"🎮"},
  {type:"partijen",aantal:250,naam:"250 partijen",emoji:"🎮"},
  {type:"caramboles",aantal:1000,naam:"1.000 caramboles",emoji:"🔴"},
  {type:"caramboles",aantal:5000,naam:"5.000 caramboles",emoji:"🔴"},
  {type:"caramboles",aantal:10000,naam:"10.000 caramboles",emoji:"🔴"},
  {type:"caramboles",aantal:25000,naam:"25.000 caramboles",emoji:"🔴"}
];
