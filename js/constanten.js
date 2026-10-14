// Vaste gegevens van Biljart Tracker: kleuren, opmerkingenlijsten, opslagsleutel, niveaus per
// discipline, tafelmaten en mijlpalen. Gewone JavaScript (geen JSX), geladen vóór de Babel-code in
// index.html; alles hier is daardoor overal in de app beschikbaar.

const G="#1a2e1a",GOUD="#c9a84c",GOUDL="#e8c96a",WIT="#f5f0e8",WITD="#d4cfc5";
const KBG="#22341f",KBDR="#3a5c35",ROOD="#e05555",GRNT="#4caf50";


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
