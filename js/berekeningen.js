// Rekenlogica van Biljart Tracker: statistiek per partij, badges (prestaties), records, niveau en
// badge-drops, voorspelling, seizoenen en mijlpalen. Gewone JavaScript zonder React of JSX, geladen
// na js/constanten.js en vóór de Babel-code in index.html. Puur rekenwerk: leest of schrijft geen opslag.

// Wat een "goede", "sterke" en "top"-beurt is, verschilt enorm per discipline — bij Driebanden is
// 1 carambole al een prestatie, bij Libre pas 5+. Kader 38/2 en 47/2 (grotere vakken) liggen dicht bij
// Libre; Kader 57/2 en 71/2 (kleinere vakken) zitten lager, net als Bandstoten.
function beurtDrempels(discipline){
  if(discipline==="driebanden")return{opbouwMin:1,opbouwMax:1,sterkMin:2,sterkMax:2,topMin:3};
  if(discipline==="bandstoten")return{opbouwMin:3,opbouwMax:4,sterkMin:5,sterkMax:6,topMin:7};
  if(discipline==="kader57"||discipline==="kader71")return{opbouwMin:3,opbouwMax:4,sterkMin:5,sterkMax:6,topMin:7};
  return{opbouwMin:5,opbouwMax:7,sterkMin:8,sterkMax:9,topMin:10}; // libre, kader38, kader47
}
// Buckets voor de caramboles-verdeling-histogram (Patronen-tab) — dezelfde indeling-logica als
// beurtDrempels, maar dan als volledige reeks bakjes in plaats van drie drempels.
function histogramBuckets(discipline){
  if(discipline==="driebanden")return[["0 (poedel)",0,0],["1",1,1],["2",2,2],["3",3,3],["4",4,4],["5+",5,Infinity]];
  if(discipline==="bandstoten"||discipline==="kader57"||discipline==="kader71")
    return[["0 (poedel)",0,0],["1",1,1],["2",2,2],["3-4",3,4],["5-6",5,6],["7+",7,Infinity]];
  return[["0 (poedel)",0,0],["1-2",1,2],["3-4",3,4],["5-7",5,7],["8-9",8,9],["10+",10,Infinity]]; // libre, kader38, kader47
}

// Stapgrootte van de meeschuivende gemiddelde-drempels (⭐-badge, hint tijdens het spelen, Consistentie in
// Dash): ongeveer een kwart van een gangbaar gemiddelde in die discipline.
function gemStap(discipline){
  if(discipline==="driebanden")return 0.1;
  if(discipline==="bandstoten"||discipline==="kader57"||discipline==="kader71")return 0.25;
  return 0.5; // libre, kader38, kader47
}
// Eerstvolgende drempel boven `basis` in stappen van `stap` (afgerond tegen rekenfoutjes als 0,30000000004)
function gemDrempelBoven(basis,stap){return Math.round((Math.floor(basis/stap)*stap+stap)*1000)/1000;}
// Drempel als tekst met komma: 1 decimaal bij stappen van 0,5, anders 2 (0,40 / 1,25)
function gemDrempelTekst(v,stap){return(stap<0.5?v.toFixed(2):v.toFixed(1)).replace(".",",");}

function stat(beurten,discipline){
  if(!beurten||!beurten.length)return null;
  const d=beurtDrempels(discipline);
  const cars=beurten.map(b=>b.caramboles);
  const totCar=cars.reduce((a,b)=>a+b,0);
  const mx=Math.max(...cars);
  const poedels=beurten.filter(b=>b.caramboles===0).length;
  const gemPerBeurt=(totCar/beurten.length).toFixed(2);
  const opbouw5=beurten.filter(b=>b.caramboles>=d.opbouwMin).length;
  const opbouw57=beurten.filter(b=>b.caramboles>=d.opbouwMin&&b.caramboles<=d.opbouwMax).length;
  const opbouw89=beurten.filter(b=>b.caramboles>=d.sterkMin&&b.caramboles<=d.sterkMax).length;
  const opbouw10=beurten.filter(b=>b.caramboles>=d.topMin).length;
  return{totCar,max:mx,aantalBeurten:beurten.length,poedels,gemPerBeurt,opbouw5,opbouw57,opbouw89,opbouw10};
}

// Berekent chronologisch (oud->nieuw) welke prestatie-badges elke partij heeft verdiend.
// "Record"-achtige badges vergelijken tegen de staat VOOR die partij, niet achteraf.
// Retourneert een array in dezelfde volgorde als partijen: [{id,badges:[{label,emoji,aantal,punten}],punten}]
function berekenPrestaties(partijen,tijdsvensterMaanden,discipline){
  let allTimeMaxBeurt=0;
  const verwerkt=[];
  const resultaten=[];
  const d=beurtDrempels(discipline);

  function vensterSlice(datum){
    if(!tijdsvensterMaanden)return verwerkt;
    const cutoff=new Date(datum);
    cutoff.setMonth(cutoff.getMonth()-tijdsvensterMaanden);
    return verwerkt.filter(function(w){return new Date(w.datum)>=cutoff;});
  }

  (partijen||[]).forEach(function(p){
    const st=stat(p.beurten,discipline);
    if(!st){resultaten.push({id:p.id,badges:[],punten:0});return;}
    const gem=parseFloat(st.gemPerBeurt);
    const badges=[];

    if(st.opbouw57>0){
      const waarden=p.beurten.filter(function(b){return b.caramboles>=d.opbouwMin&&b.caramboles<=d.opbouwMax;}).map(function(b){return b.caramboles;});
      badges.push({label:"Opbouw",emoji:"🎯",aantal:st.opbouw57,punten:st.opbouw57*10,categorie:"Beurt-pieken",detail:t("Beurten van {w} car (drempel: {a}-{b} car per beurt)",{w:waarden.join(", "),a:d.opbouwMin,b:d.opbouwMax})});
    }
    if(st.opbouw89>0){
      const waarden=p.beurten.filter(function(b){return b.caramboles>=d.sterkMin&&b.caramboles<=d.sterkMax;}).map(function(b){return b.caramboles;});
      badges.push({label:"Sterke serie",emoji:"🔥",aantal:st.opbouw89,punten:st.opbouw89*20,categorie:"Beurt-pieken",detail:t("Beurten van {w} car (drempel: {a}-{b} car per beurt)",{w:waarden.join(", "),a:d.sterkMin,b:d.sterkMax})});
    }
    if(st.opbouw10>0){
      const waarden=p.beurten.filter(function(b){return b.caramboles>=d.topMin;}).map(function(b){return b.caramboles;});
      badges.push({label:"Topserie",emoji:"💫",aantal:st.opbouw10,punten:st.opbouw10*35,categorie:"Beurt-pieken",detail:t("Beurten van {w} car (drempel: {a}+ car per beurt)",{w:waarden.join(", "),a:d.topMin})});
    }

    if(st.max>allTimeMaxBeurt&&allTimeMaxBeurt>0){
      badges.push({label:"Nieuw record beurt",emoji:"🏆",aantal:1,punten:50,categorie:"Beurt-pieken",detail:t("Nieuwe hoogste beurt: {n} car (vorig record: {r} car)",{n:st.max,r:allTimeMaxBeurt})});
    }

    let langsteReeks=0,huidigeReeks=0;
    p.beurten.forEach(function(b){
      if(b.caramboles>0){huidigeReeks++;langsteReeks=Math.max(langsteReeks,huidigeReeks);}
      else huidigeReeks=0;
    });
    if(st.poedels===0){
      badges.push({label:"Geen poedel hele partij",emoji:"🛡️",aantal:1,punten:30,categorie:"Consistentie",detail:t("0 van de {n} beurten was een poedel",{n:st.aantalBeurten})});
    }else if(langsteReeks>=8){
      badges.push({label:"Lange reeks zonder poedel",emoji:"⛓️",aantal:1,punten:25,categorie:"Consistentie",detail:t("Langste reeks: {n} beurten op rij zonder poedel (drempel: {d}+)",{n:langsteReeks,d:8})});
    }else if(langsteReeks>=5){
      badges.push({label:"Reeks zonder poedel",emoji:"⛓️",aantal:1,punten:15,categorie:"Consistentie",detail:t("Langste reeks: {n} beurten op rij zonder poedel (drempel: {d}+)",{n:langsteReeks,d:5})});
    }
    const poedelPct=st.poedels/st.aantalBeurten*100;
    if(poedelPct<20&&st.poedels>0){
      badges.push({label:"Weinig poedels",emoji:"✅",aantal:1,punten:15,categorie:"Consistentie",detail:t("{p} van de {n} beurten poedel ({pct}%, drempel: <20%)",{p:st.poedels,n:st.aantalBeurten,pct:Math.round(poedelPct)})});
    }

    const herstelDetails=[];
    p.beurten.forEach(function(b,i){
      if(b.caramboles===0){
        const next=p.beurten[i+1];
        if(next&&next.caramboles>=d.opbouwMin)herstelDetails.push(t("na poedel volgde {n} car",{n:next.caramboles}));
      }
    });
    if(herstelDetails.length>0)badges.push({label:"Sterk herstel na poedel",emoji:"💪",aantal:herstelDetails.length,punten:herstelDetails.length*15,categorie:"Mentaliteit",detail:herstelDetails.join(" · ")+t(" (drempel: {n}+ car direct na een poedel)",{n:d.opbouwMin})});

    const venster=vensterSlice(p.datum);
    const vensterCar=venster.reduce(function(a,w){return a+w.tot;},0);
    const vensterBeurt=venster.reduce(function(a,w){return a+w.n;},0);
    const totaalGemTotDan=vensterBeurt>0?vensterCar/vensterBeurt:null;
    const vensterLabel=tijdsvensterMaanden?t(" (laatste {n} mnd)",{n:tijdsvensterMaanden}):t(" ooit");

    const helft=Math.floor(p.beurten.length/2);
    if(helft>=3){
      const eerste=p.beurten.slice(0,helft),tweede=p.beurten.slice(helft);
      const gemE=eerste.reduce(function(a,b){return a+b.caramboles;},0)/eerste.length;
      const gemT=tweede.reduce(function(a,b){return a+b.caramboles;},0)/tweede.length;
      if(gemT>gemE&&totaalGemTotDan!==null&&gem>totaalGemTotDan){
        badges.push({label:"Sterke afsluiting",emoji:"📈",aantal:1,punten:15,categorie:"Mentaliteit",detail:t("1e helft: {a} · 2e helft: {b} · partijgemiddelde {g} boven totaalgemiddelde{v} {t}",{a:gemE.toFixed(2),b:gemT.toFixed(2),g:gem.toFixed(2),v:vensterLabel,t:totaalGemTotDan.toFixed(2)})});
      }
    }

    const basis=totaalGemTotDan!==null?totaalGemTotDan:0;
    const stap=gemStap(discipline);
    const drempel1=gemDrempelBoven(basis,stap);
    const drempel2=Math.round((drempel1+stap)*1000)/1000;
    if(gem>=drempel2){
      badges.push({label:"Gemiddelde boven "+gemDrempelTekst(drempel2,stap),emoji:"⭐",aantal:1,punten:30,categorie:"Doel & totaal",detail:t("Partijgemiddelde: {g} (persoonlijke drempel: {d}, op basis van je totaalgemiddelde{v} {b})",{g:gem.toFixed(2),d:drempel2.toFixed(2),v:vensterLabel,b:basis.toFixed(2)})});
    }else if(gem>=drempel1){
      badges.push({label:"Gemiddelde boven "+gemDrempelTekst(drempel1,stap),emoji:"⭐",aantal:1,punten:15,categorie:"Doel & totaal",detail:t("Partijgemiddelde: {g} (persoonlijke drempel: {d}, op basis van je totaalgemiddelde{v} {b})",{g:gem.toFixed(2),d:drempel1.toFixed(2),v:vensterLabel,b:basis.toFixed(2)})});
    }

    const vensterBestGem=verwerkt.length?Math.max.apply(null,verwerkt.map(function(w){return w.gem;})):0;
    if(gem>vensterBestGem&&vensterBestGem>0){
      badges.push({label:"Nieuw beste gemiddelde ooit",emoji:"👑",aantal:1,punten:60,categorie:"Doel & totaal",detail:t("Nieuw record: {g} (vorig record ooit: {v})",{g:gem.toFixed(2),v:vensterBestGem.toFixed(2)})});
    }

    const tafelKey=p.tafel||"230";
    const vensterTafel=verwerkt.filter(function(w){return w.tafel===tafelKey;});
    const vensterTafelBest=vensterTafel.length?Math.max.apply(null,vensterTafel.map(function(w){return w.gem;})):0;
    if(gem>vensterTafelBest&&vensterTafelBest>0){
      badges.push({label:"Beste partij ooit op deze tafel",emoji:"🔝",aantal:1,punten:40,categorie:"Tafel-specifiek",detail:t("Nieuw record op {tafel}-tafel: {g} (vorig: {v})",{tafel:tafelLabel(tafelKey),g:gem.toFixed(2),v:vensterTafelBest.toFixed(2)})});
    }

    if(totaalGemTotDan!==null){
      if(gem>totaalGemTotDan)badges.push({label:"Beter dan je totaalgemiddelde",emoji:"📊",aantal:1,punten:10,categorie:"Vergelijking",detail:t("Deze partij: {g} vs totaalgemiddelde{v} {t}",{g:gem.toFixed(2),v:vensterLabel,t:totaalGemTotDan.toFixed(2)})});
    }
    const laatste5=verwerkt.slice(-5);
    if(laatste5.length>=5){
      const rC=laatste5.reduce(function(a,r){return a+r.tot;},0),rN=laatste5.reduce(function(a,r){return a+r.n;},0);
      const rollingGem=rC/rN;
      if(gem>rollingGem)badges.push({label:"Beter dan je 5-partij rolling gemiddelde",emoji:"📉",aantal:1,punten:15,categorie:"Vergelijking",detail:t("Deze partij: {g} vs 5-partij rolling: {r}",{g:gem.toFixed(2),r:rollingGem.toFixed(2)})});
    }

    const totaalPunten=badges.reduce(function(a,b){return a+b.punten;},0);
    resultaten.push({id:p.id,badges:badges,punten:totaalPunten});

    allTimeMaxBeurt=Math.max(allTimeMaxBeurt,st.max);
    verwerkt.push({datum:p.datum,tot:st.totCar,n:st.aantalBeurten,gem:gem,tafel:tafelKey});
  });

  return resultaten;
}

// Geeft de "records om te verslaan" op basis van alle AFGESLOTEN partijen — gebruikt tijdens het
// live spelen om te checken of een nieuwe beurt/partij een record aan het breken is.
function berekenLopendeRecords(partijen,tijdsvensterMaanden){
  let allTimeMaxBeurt=0;
  const verwerkt=[];
  (partijen||[]).forEach(function(p){
    const st=stat(p.beurten);
    if(!st)return;
    const gem=parseFloat(st.gemPerBeurt);
    const tafelKey=p.tafel||"230";
    allTimeMaxBeurt=Math.max(allTimeMaxBeurt,st.max);
    verwerkt.push({datum:p.datum,tot:st.totCar,n:st.aantalBeurten,gem:gem,tafel:tafelKey});
  });
  let venster=verwerkt;
  if(tijdsvensterMaanden){
    const cutoff=new Date();
    cutoff.setMonth(cutoff.getMonth()-tijdsvensterMaanden);
    venster=verwerkt.filter(function(w){return new Date(w.datum)>=cutoff;});
  }
  const allTimeBestGem=verwerkt.length?Math.max.apply(null,verwerkt.map(function(w){return w.gem;})):0;
  const tafelBest={};
  verwerkt.forEach(function(w){tafelBest[w.tafel]=Math.max(tafelBest[w.tafel]||0,w.gem);});
  const laatste5=verwerkt.slice(-5);
  const rolling5p=laatste5.length>=5?(laatste5.reduce(function(a,r){return a+r.tot;},0)/laatste5.reduce(function(a,r){return a+r.n;},0)):null;
  const vensterCar=venster.reduce(function(a,w){return a+w.tot;},0);
  const vensterBeurt=venster.reduce(function(a,w){return a+w.n;},0);
  const totaalGem=vensterBeurt>0?vensterCar/vensterBeurt:null;
  return{allTimeMaxBeurt:allTimeMaxBeurt,allTimeBestGem:allTimeBestGem,tafelBest:tafelBest,totaalGem:totaalGem,rolling5p:rolling5p,vensterPartijen:venster.length,vensterBeurten:vensterBeurt};
}

function bouwBadgeCatalogus(discipline){
  const d=beurtDrempels(discipline);
  return[
    {label:"Opbouw",emoji:"🎯",punten:t("{n}pt per keer",{n:10}),categorie:"Beurt-pieken",uitleg:t("Een beurt van {a}-{b} caramboles",{a:d.opbouwMin,b:d.opbouwMax})},
    {label:"Sterke serie",emoji:"🔥",punten:t("{n}pt per keer",{n:20}),categorie:"Beurt-pieken",uitleg:t("Een beurt van {a}-{b} caramboles",{a:d.sterkMin,b:d.sterkMax})},
    {label:"Topserie",emoji:"💫",punten:t("{n}pt per keer",{n:35}),categorie:"Beurt-pieken",uitleg:t("Een beurt van {a}+ caramboles",{a:d.topMin})},
    {label:"Nieuw record beurt",emoji:"🏆",punten:"50pt",categorie:"Beurt-pieken",uitleg:t("Je hoogste beurt ooit verbreken")},
    {label:"Geen poedel hele partij",emoji:"🛡️",punten:"30pt",categorie:"Consistentie",uitleg:t("Geen enkele poedel in de hele partij")},
    {label:"Lange reeks zonder poedel",emoji:"⛓️",punten:"25pt",categorie:"Consistentie",uitleg:t("8 of meer beurten op rij zonder poedel")},
    {label:"Reeks zonder poedel",emoji:"⛓️",punten:"15pt",categorie:"Consistentie",uitleg:t("5 of meer beurten op rij zonder poedel")},
    {label:"Weinig poedels",emoji:"✅",punten:"15pt",categorie:"Consistentie",uitleg:t("Minder dan 20% van je beurten was een poedel")},
    {label:"Sterk herstel na poedel",emoji:"💪",punten:t("{n}pt per keer",{n:15}),categorie:"Mentaliteit",uitleg:t("{n} of meer caramboles direct na een poedel",{n:d.opbouwMin})},
    {label:"Sterke afsluiting",emoji:"📈",punten:"15pt",categorie:"Mentaliteit",uitleg:t("Tweede helft van de partij beter dan de eerste, én partijgemiddelde boven je totaalgemiddelde")},
    {label:"Gemiddelde boven persoonlijke drempel",emoji:"⭐",punten:"15-30pt",categorie:"Doel & totaal",uitleg:t("Partijgemiddelde boven een drempel net boven je eigen totaalgemiddelde (schuift automatisch mee)")},
    {label:"Nieuw beste gemiddelde",emoji:"👑",punten:"60pt",categorie:"Doel & totaal",uitleg:t("Je hoogste partijgemiddelde ooit verbreken")},
    {label:"Beste partij op deze tafel",emoji:"🔝",punten:"40pt",categorie:"Tafel-specifiek",uitleg:t("Nieuw record-gemiddelde specifiek op deze tafelmaat")},
    {label:"Beter dan je totaalgemiddelde",emoji:"📊",punten:"10pt",categorie:"Vergelijking",uitleg:t("Partijgemiddelde boven je totaalgemiddelde tot dan toe")},
    {label:"Beter dan je 5-partij rolling gemiddelde",emoji:"📉",punten:"15pt",categorie:"Vergelijking",uitleg:t("Partijgemiddelde boven het gemiddelde van je laatste 5 partijen")}
  ];
}

function maandKey(iso){
  const MND=["jan","feb","mrt","apr","mei","jun","jul","aug","sep","okt","nov","dec"];
  const d=new Date(iso);
  return MND[d.getMonth()]+" "+d.getFullYear();
}
function fmtDatum(iso){
  return new Date(iso).toLocaleDateString(taalLocale(),{day:"numeric",month:"short"});
}
function categorieKleur(cat){
  const map={
    "Beurt-pieken":"#f5c542",
    "Consistentie":"#4caf50",
    "Mentaliteit":"#ff8a4c",
    "Doel & totaal":"#b18cf0",
    "Tafel-specifiek":"#4cc3e8",
    "Vergelijking":"#ff6b81"
  };
  return map[cat]||"#c9a84c";
}

// Twee losse, simpele assen:
// 1. Gemiddelde (na eventuele drops) bepaalt rechtstreeks je niveau — geen formules, geen bonus,
//    gewoon: zit je over de grens, dan zit je in het volgende niveau.
// 2. Badge-punten zijn gewoon de rechte som van je badges (Opbouw, Sterke serie, records, etc.) —
//    geen straf, geen correctie voor een laag gemiddelde. Hoe beter je speelt, hoe meer je verdient.
//    Hun enige functie: elke 1000 punten ontgrendelt het schrappen van je eerstvolgende slechtste
//    partij uit de gemiddelde-berekening (net als bij golf-handicaps) — zo krijgt goed spelen ook
//    direct invloed op je gemiddelde, zonder dat een mindere partij ooit "aftrekt".
// Niveau-informatie: je vorm (het gemiddelde waar je niveau op gebaseerd is), geschrapte partijen en punten.
// - zonderDrops: spelelement uit, dan wordt er niets geschrapt.
// - opties (de app geeft dit altijd mee):
//     venster: aantal laatste partijen voor je vorm (null = alle partijen). Alleen de punten die je in die
//              partijen verdiende tellen voor schrappen, en er wordt alleen binnen het venster geschrapt.
//     plafond: nooit meer dan MAX_SCHRAP_AANDEEL van de partijen schrappen (1 op de 10).
//   Zonder opties rekent het zoals vroeger (alle partijen, geen plafond); zo blijft de testreferentie geldig.
// - moyenne: het officiële gemiddelde, altijd over al je partijen en zonder iets te schrappen.
function berekenNiveauInfo(partijen,zonderDrops,opties){
  const discipline=(partijen&&partijen.length>0)?(partijen[0].discipline||"libre"):"libre";
  const venster=opties&&opties.venster?opties.venster:null;
  // nr = partijnummer zoals in Stats en Log (positie binnen deze discipline), id = intern id
  const alleGeldige=(partijen||[]).map(function(p,i){return{p:p,nr:i+1,st:stat(p.beurten,discipline)};}).filter(function(x){return x.st;});
  const som=function(lijst){let c=0,b=0;lijst.forEach(function(x){c+=x.st.totCar;b+=x.st.aantalBeurten;});return{car:c,beurt:b};};
  const alles=som(alleGeldige);
  const moyenne=alles.beurt>0?alles.car/alles.beurt:0;
  const geldige=venster?alleGeldige.slice(-venster):alleGeldige;
  const s=som(geldige),car=s.car,beurt=s.beurt;
  const totaalGemiddelde=beurt>0?car/beurt:0;
  // Punten worden over je hele geschiedenis berekend (records zijn records), maar bij een venster tellen
  // alleen de punten die je in die partijen verdiende
  const prestaties=berekenPrestaties(partijen,null,discipline);
  const badgePuntenTotaal=prestaties.reduce(function(a,r){return a+r.punten;},0);
  const inVenster=new Set(geldige.map(function(x){return x.p.id;}));
  const badgePunten=venster?prestaties.filter(function(r){return inVenster.has(r.id);}).reduce(function(a,r){return a+r.punten;},0):badgePuntenTotaal;

  const maxDrops=opties?Math.floor(geldige.length*MAX_SCHRAP_AANDEEL):Infinity;
  const verdiend=Math.floor(badgePunten/PUNTEN_PER_DROP);
  const aantalDrops=zonderDrops?0:Math.min(verdiend,maxDrops);
  const plafondBereikt=!zonderDrops&&opties&&verdiend>=maxDrops;
  const gesorteerd=geldige.slice().sort(function(a,b){return parseFloat(a.st.gemPerBeurt)-parseFloat(b.st.gemPerBeurt);});
  const gedropt=gesorteerd.slice(0,aantalDrops);
  const gedropteIds=new Set(gedropt.map(function(x){return x.p.id;}));
  let effCar=car,effBeurt=beurt;
  gedropt.forEach(function(x){effCar-=x.st.totCar;effBeurt-=x.st.aantalBeurten;});
  const effectiefGemiddelde=effBeurt>0?effCar/effBeurt:totaalGemiddelde;

  const gedroptePartijen=gedropt.map(function(x){
    return{id:x.p.id,nr:x.nr,datum:x.p.datum,gem:parseFloat(x.st.gemPerBeurt)};
  });

  const volgendeKandidaat=plafondBereikt?null:(gesorteerd[aantalDrops]||null);
  const puntenTotVolgendeDrop=PUNTEN_PER_DROP-(badgePunten%PUNTEN_PER_DROP);

  return{totaalGemiddelde:totaalGemiddelde,effectiefGemiddelde:effectiefGemiddelde,badgePunten:badgePunten,
    aantalDrops:aantalDrops,gedropteIds:gedropteIds,gedroptePartijen:gedroptePartijen,
    volgendeKandidaatId:volgendeKandidaat?volgendeKandidaat.p.id:null,
    volgendeKandidaatNr:volgendeKandidaat?volgendeKandidaat.nr:null,
    volgendeKandidaatGem:volgendeKandidaat?parseFloat(volgendeKandidaat.st.gemPerBeurt):null,
    puntenTotVolgendeDrop:puntenTotVolgendeDrop,
    moyenne:moyenne,venster:venster,aantalPartijen:geldige.length,aantalPartijenTotaal:alleGeldige.length,
    badgePuntenTotaal:badgePuntenTotaal,maxDrops:maxDrops,plafondBereikt:!!plafondBereikt};
}
// Simuleert, uitgaande van je recente vorm (laatste 5 partijen, beurt-gewogen gemiddelde), hoeveel
// partijen je op dat niveau nog nodig hebt om je EFFECTIEVE gemiddelde over de volgende gemiddelde-
// drempel te tillen. Blijft je recente vorm onder die drempel, dan kan het nooit lukken puur op dit
// tempo — dat wordt dan ook zo teruggegeven i.p.v. een oneindig aantal partijen.
function berekenVoorspelling(partijen,discipline,zonderDrops,opties){
  const info=berekenNiveauInfo(partijen,zonderDrops,opties);
  const huidig=bepaalNiveau(info.effectiefGemiddelde,discipline);
  if(!huidig.volgende)return null;

  const geldige=(partijen||[]).map(function(p){return{p:p,st:stat(p.beurten)};}).filter(function(x){return x.st;});
  const laatste5=geldige.slice(-5);
  if(laatste5.length<3)return{mogelijk:null,recenteVorm:null};
  let rCar=0,rBeurt=0;
  laatste5.forEach(function(x){rCar+=x.st.totCar;rBeurt+=x.st.aantalBeurten;});
  const recenteVorm=rCar/rBeurt;
  const gemBeurtenPerPartij=Math.round(rBeurt/laatste5.length);

  if(recenteVorm<huidig.volgende.gemDrempel){
    return{mogelijk:false,recenteVorm:recenteVorm};
  }

  let simPartijen=partijen.slice();
  let volgendId=Math.max.apply(null,geldige.map(function(x){return x.p.id;}))+1;
  for(let i=1;i<=100;i++){
    const nieuweBeurten=[];
    let rest=Math.round(recenteVorm*gemBeurtenPerPartij);
    for(let j=0;j<gemBeurtenPerPartij;j++){
      const overgebleven=gemBeurtenPerPartij-j;
      const v=Math.max(0,Math.round(rest/overgebleven));
      nieuweBeurten.push({caramboles:v,gemist:[],goed:[]});
      rest-=v;
    }
    simPartijen=simPartijen.concat([{id:volgendId++,datum:new Date().toISOString(),tafel:"230",beurten:nieuweBeurten}]);
    const simInfo=berekenNiveauInfo(simPartijen,zonderDrops,opties);
    if(simInfo.effectiefGemiddelde>=huidig.volgende.gemDrempel){
      return{mogelijk:true,recenteVorm:recenteVorm,aantalPartijen:i};
    }
  }
  return{mogelijk:false,recenteVorm:recenteVorm};
}
// Berekent de eindstand van een afgesloten (of lopend) seizoen: elk seizoen wordt behandeld als een
// eigen, verse geschiedenis (badge-punten en records tellen alleen partijen binnen dat seizoen mee).
function berekenSeizoenStats(alleP,seizoen,discipline,zonderDrops,opties){
  const gefilterd=(alleP||[]).filter(function(p){
    const t=new Date(p.datum).getTime();
    const vanaf=seizoen.startDatum?new Date(seizoen.startDatum).getTime():-Infinity;
    const tot=seizoen.eindDatum?new Date(seizoen.eindDatum).getTime():Infinity;
    return t>=vanaf&&t<tot;
  });
  const info=berekenNiveauInfo(gefilterd,zonderDrops,opties);
  const niveau=bepaalNiveau(info.effectiefGemiddelde,discipline);
  let aantalPartijen=0;
  gefilterd.forEach(function(p){if(stat(p.beurten))aantalPartijen++;});
  return{seizoen:seizoen,aantalPartijen:aantalPartijen,gemiddelde:info.effectiefGemiddelde,
    badgePunten:info.badgePunten,niveau:niveau.huidig,
    aantalDrops:info.aantalDrops,totaalGemiddelde:info.totaalGemiddelde};
}

function bepaalNiveau(effectiefGemiddelde,discipline){
  const niveaus=(DISCIPLINES[discipline]||DISCIPLINES.libre).niveaus;
  let idx=0;
  for(let i=0;i<niveaus.length;i++){
    if(effectiefGemiddelde>=niveaus[i].gemDrempel)idx=i;
  }
  const huidig=niveaus[idx];
  const volgende=niveaus[idx+1]||null;
  const progressPct=volgende?Math.min(100,Math.max(0,Math.round((effectiefGemiddelde-huidig.gemDrempel)/(volgende.gemDrempel-huidig.gemDrempel)*100))):100;
  const sterren=Math.max(1,Math.min(5,Math.ceil(progressPct/20)));
  return{huidig:huidig,volgende:volgende,progressPct:progressPct,sterren:sterren,index:idx};
}

function berekenMijlpalen(partijen){
  const geldige=(partijen||[]).map(function(p){return stat(p.beurten);}).filter(Boolean);
  const aantalPartijen=geldige.length;
  const totaalCaramboles=geldige.reduce(function(a,st){return a+st.totCar;},0);
  return MIJLPALEN.map(function(m){
    const huidigeWaarde=m.type==="partijen"?aantalPartijen:totaalCaramboles;
    return Object.assign({},m,{bereikt:huidigeWaarde>=m.aantal,huidigeWaarde:huidigeWaarde});
  });
}

// Kerncijfers van een willekeurige reeks beurten (bijv. een stuk dat je in de beurtengrafiek selecteert,
// ook over partijgrenzen heen). waarden = caramboles per beurt, in volgorde.
function reeksStats(waarden,discipline){
  const n=waarden.length;
  if(!n)return null;
  const d=beurtDrempels(discipline);
  let tot=0,max=0,poedels=0,opbouw=0,sterk=0,top=0,langste=0,huidige=0;
  waarden.forEach(function(v){
    tot+=v;
    if(v>max)max=v;
    if(v===0){poedels++;huidige=0;}
    else{huidige++;if(huidige>langste)langste=huidige;}
    if(v>=d.topMin)top++;
    else if(v>=d.sterkMin)sterk++;
    else if(v>=d.opbouwMin)opbouw++;
  });
  return{aantal:n,totaal:tot,gemiddelde:tot/n,max:max,poedels:poedels,poedelPct:poedels/n*100,
    opbouw:opbouw,sterk:sterk,top:top,langsteZonderPoedel:langste};
}

// Zoekt het aaneengesloten stuk van precies `lengte` beurten met het hoogste (richting "beste") of
// laagste (richting "zwakste") gemiddelde. Bij gelijke stand wint het meest recente stuk.
// Retourneert {van,tot,gemiddelde} (indexen in waarden, tot inclusief) of null als er te weinig beurten zijn.
function besteVenster(waarden,lengte,richting){
  if(!lengte||waarden.length<lengte)return null;
  let som=0;
  for(let i=0;i<lengte;i++)som+=waarden[i];
  let besteSom=som,besteVan=0;
  for(let i=lengte;i<waarden.length;i++){
    som+=waarden[i]-waarden[i-lengte];
    const beter=richting==="zwakste"?som<=besteSom:som>=besteSom;
    if(beter){besteSom=som;besteVan=i-lengte+1;}
  }
  return{van:besteVan,tot:besteVan+lengte-1,gemiddelde:besteSom/lengte};
}

// "Je gemiddelde" in de app is altijd het gemiddelde ZONDER de slechtste partijen die je met badge-punten
// hebt weggespeeld (1 per PUNTEN_PER_DROP). Deze tekst legt dat uit, overal op dezelfde manier.
// Uitleg bij je vorm (het getal waar je niveau op is gebaseerd), naast je officiële moyenne
// Je vorm volgens de instelling vormVenster (10/20/30/"alles"). schrapt = spelelement aan én schrappen aan (klasse-
// overzicht): dan vallen weggespeelde slechtste partijen weg. "alles" zonder schrappen = je moyenne (officieel).
function vormOpties(vormVenster){return{venster:vormVenster==="alles"?null:vormVenster};}
function berekenVorm(partijen,schrapt,vormVenster){
  return berekenNiveauInfo(partijen,!schrapt,vormOpties(vormVenster));
}
function vormUitleg(info,dec){
  const k=function(x){return getalTekst(x,dec);};
  if(!info.venster&&!info.aantalDrops)return t("Moyenne: al je {n} partijen, niets geschrapt. Je klasse is hierop gebaseerd.",{n:info.aantalPartijenTotaal});
  let tekst=info.venster?t("Vorm: je laatste {n} partijen",{n:info.aantalPartijen}):t("Vorm: al je partijen");
  if(info.aantalDrops)tekst+=info.aantalDrops===1?t(", zonder de slechtste daarvan (met: {g})",{g:k(info.totaalGemiddelde)}):t(", zonder de {n} slechtste daarvan (met: {g})",{n:info.aantalDrops,g:k(info.totaalGemiddelde)});
  if(info.venster||info.aantalDrops)tekst+=t(". Moyenne (alle {n} partijen): {g}",{n:info.aantalPartijenTotaal,g:k(info.moyenne)});
  return tekst+".";
}
function gemUitleg(info,dec,periode){
  if(!info.aantalDrops)return t("alle partijen tellen mee");
  return(info.aantalDrops===1?t("zonder je slechtste partij"):t("zonder je {n} slechtste partijen",{n:info.aantalDrops}))+(periode||"")+t(" (met alle partijen: {g})",{g:info.totaalGemiddelde.toFixed(dec)});
}

// Kleurgrenzen voor een gemiddelde, per discipline en op basis van je huidige klasse: groen vanaf de
// drempel van je volgende klasse, goud binnen je huidige klasse, rood daaronder. In de laagste klasse
// (drempel 0) ligt de ondergrens halverwege de volgende klasse; in de hoogste klasse ligt de bovengrens
// 20% boven je klassedrempel.
function gemGrenzen(effectiefGemiddelde,discipline){
  const n=bepaalNiveau(effectiefGemiddelde,discipline);
  const laag=n.huidig.gemDrempel>0?n.huidig.gemDrempel:(n.volgende?n.volgende.gemDrempel/2:0);
  const hoog=n.volgende?n.volgende.gemDrempel:n.huidig.gemDrempel*1.2;
  return{laag:laag,hoog:hoog,huidigNaam:n.huidig.naam,volgendeNaam:n.volgende?n.volgende.naam:null};
}
function gemKleur(v,grenzen){return v>=grenzen.hoog?GRNT:v>=grenzen.laag?GOUD:ROOD;}

// Kleur van een beurt (caramboles) volgens de drempels van de discipline, zoals in de beurtengrafiek
function beurtKleur(v,discipline){
  const d=beurtDrempels(discipline);
  return v===0?"#e08055":v>=d.topMin?"#ff9f40":v>=d.sterkMin?GOUDL:v>=d.opbouwMin?GRNT:GOUD;
}

// ── INZICHT ──
// Analyse van je speelstijl op basis van de opmerkingen per beurt en de omstandigheden. `partijen` zijn
// partijen van één discipline met {beurten, tafel, datum, nr}. Uitgangspunten:
// - Een techniek (staat in zowel GEMIST als GOED) wordt beoordeeld op slagingspercentage, niet op het
//   aantal missers: wie een stoot vaak speelt, mist hem ook vaak (het Ronaldo-effect).
// - Er wordt vaker aangevinkt wat misging dan wat goed ging, dus percentages worden met elkaar
//   vergeleken (refPct), niet met 100%.
// - Conclusies alleen bij genoeg voorbeelden (INZICHT_MIN).
// - Opmerkingen worden niet in elke partij bijgehouden (vaak wel of juist helemaal niet, en op de ene tafel
//   meer dan op de andere). Alles wat op opmerkingen leunt gebruikt daarom alleen "bijgehouden" partijen:
//   minstens INZICHT_DEKKING van de beurten heeft een opmerking. In andere partijen zegt het ontbreken van
//   een opmerking niets. Omstandigheden (tafel, avond, fase) gebruiken geen opmerkingen: alle partijen.
// - Kloktijden worden bewust niet gebruikt: partijen worden soms later nagetypt (bijv. thuis na het Woutje)
//   en de oudste partijen hebben geen tijd per beurt. De volgorde op de avond klopt wel altijd.
const INZICHT_MIN=5;
const INZICHT_DEKKING=0.25;

// Poedels en series van een rij beurten ({pi,car}): per seriegroep (histogramBuckets) aantal per partij,
// caramboles per beurt en aandeel van je caramboles, plus de gemiddelde hoogste serie per partij.
function seriesProfiel(a,groepen){
  const som=function(x){return x.reduce(function(s,b){return s+b.car;},0);};
  const hoogstePerPartij={};
  a.forEach(function(b){hoogstePerPartij[b.pi]=Math.max(hoogstePerPartij[b.pi]||0,b.car);});
  const hoog=Object.keys(hoogstePerPartij).map(function(k){return hoogstePerPartij[k];});
  const np=Math.max(1,hoog.length),tot=som(a);
  return{partijen:hoog.length,beurtenPP:a.length/np,gem:a.length?tot/a.length:0,
    hoogste:hoog.length?hoog.reduce(function(s,x){return s+x;},0)/hoog.length:0,
    groepen:groepen.map(function(g){
      const x=a.filter(function(b){return b.car>=g[1]&&b.car<=g[2];});
      return{label:g[1]===0?"poedel":g[0],van:g[1],perPartij:x.length/np,carPerBeurt:a.length?som(x)/a.length:0,carAandeel:tot>0?som(x)/tot:0};
    })};
}

// Maanden (maandKey) waarin gespeeld is, in volgorde van datum
function maandenVan(partijen){
  const uit=[];
  (partijen||[]).slice().sort(function(a,b){return new Date(a.datum)-new Date(b.datum);}).forEach(function(p){
    const m=maandKey(p.datum);if(uit.indexOf(m)===-1)uit.push(m);
  });
  return uit;
}

// Standaardknip voor "vanaf": de maand (niet de eerste) waarbij de partijen het eerlijkst in tweeën vallen
function standaardVanaf(partijen){
  const maanden=maandenVan(partijen),tel=maanden.map(function(m){return(partijen||[]).filter(function(p){return maandKey(p.datum)===m;}).length;});
  const tot=tel.reduce(function(s,x){return s+x;},0);
  let beste=maanden[1]||maanden[0],verschil=Infinity,voor=tel[0]||0;
  for(let i=1;i<maanden.length;i++){const v=Math.abs(tot-2*voor);if(v<verschil){verschil=v;beste=maanden[i];}voor+=tel[i];}
  return beste;
}

// Twee groepen partijen naast elkaar in poedels en series, per tafel (over alle tafels samen zou een andere
// verhouding tussen de tafels, bijv. vaker op de makkelijkere 2,10, als vooruitgang lijken). Groep a is
// eerder/slechter, b is nu/beter. modus:
//   "helften"    eerste tegenover tweede helft van alle partijen
//   "laatste10"  per tafel je laatste 10 partijen (of de laatste helft bij minder dan 20) tegenover die ervoor
//   "goedslecht" per tafel je slechtste derde tegenover je beste derde (op gemiddelde)
//   "vanaf"      alles vóór maand opties.vanaf tegenover alles vanaf die maand (maandKey); zonder keuze de
//                maand die de partijen het eerlijkst in tweeën deelt (standaardVanaf)
// bijdrage[i] = hoeveel groep i aan het verschil in gemiddelde bijdraagt (samen precies het verschil).
// Per kant minstens 3 partijen en 50 beurten, anders staat de tafel in `teWeinig`.
function vergelijkSeries(partijen,discipline,modus,opties){
  partijen=partijen||[];opties=opties||{};
  const groepen=histogramBuckets(discipline);
  const tafelVan=function(p){return p.tafel||"230";};
  const gemVan=function(pi){const b=partijen[pi].beurten||[];return b.length?b.reduce(function(s,x){return s+x.caramboles;},0)/b.length:0;};
  const alle=partijen.map(function(p,pi){return pi;}).filter(function(pi){return(partijen[pi].beurten||[]).length>0;});
  const tafels=Object.keys(TAFELS).filter(function(k){return alle.some(function(pi){return tafelVan(partijen[pi])===k;});});
  const sets=tafels.length>1?tafels.map(function(k){return{tafel:k,pis:alle.filter(function(pi){return tafelVan(partijen[pi])===k;})};}):[{tafel:null,pis:alle}];
  const helftP=Math.floor(partijen.length/2);
  const beurtenVan=function(pis){
    const uit=[];pis.forEach(function(pi){(partijen[pi].beurten||[]).forEach(function(b){uit.push({pi:pi,car:b.caramboles});});});return uit;
  };
  const vergelijkingen=[],teWeinig=[];
  sets.forEach(function(s){
    let a=[],b=[],labelA=null,labelB=null;
    if(modus==="laatste10"){
      const k=Math.min(10,Math.floor(s.pis.length/2));
      a=s.pis.slice(0,s.pis.length-k);b=s.pis.slice(s.pis.length-k);
      labelA=a.length===1?"de partij ervoor":"de "+a.length+" ervoor";labelB="laatste "+k;
    }else if(modus==="goedslecht"){
      const k=Math.floor(s.pis.length/3),gesorteerd=s.pis.slice().sort(function(x,y){return gemVan(x)-gemVan(y);});
      a=gesorteerd.slice(0,k);b=gesorteerd.slice(gesorteerd.length-k);
      labelA="slechtste "+k;labelB="beste "+k;
    }else if(modus==="vanaf"){
      const maanden=maandenVan(partijen),grens=maanden.indexOf(opties.vanaf||standaardVanaf(partijen));
      const voor=function(pi){return maanden.indexOf(maandKey(partijen[pi].datum))<grens;};
      a=s.pis.filter(voor);b=s.pis.filter(function(pi){return!voor(pi);});
      labelA=a.length+" ervoor";labelB=b.length+" vanaf";
    }else{
      a=s.pis.filter(function(pi){return pi<helftP;});b=s.pis.filter(function(pi){return pi>=helftP;});
    }
    const ea=beurtenVan(a),wa=beurtenVan(b);
    if(a.length<3||b.length<3||ea.length<50||wa.length<50){teWeinig.push(s.tafel);return;}
    const pe=seriesProfiel(ea,groepen),pw=seriesProfiel(wa,groepen);
    vergelijkingen.push({tafel:s.tafel,e:pe,w:pw,labelA:labelA,labelB:labelB,
      bijdrage:pe.groepen.map(function(g,i){return pw.groepen[i].carPerBeurt-g.carPerBeurt;})});
  });
  return{modus:modus,vergelijkingen:vergelijkingen,teWeinig:teWeinig};
}

// Je hoogste series: al je grote series (vanaf sterkMin, of vanaf opbouwMin als je die nog niet hebt) per
// aantal, elk met datum, tafel, partij, beurt en opmerkingen, je record per tafel en per tafel of het de
// goede kant op gaat: je laatste 10 partijen (bij minder dan 20 de laatste helft) tegenover die ervoor, in
// gemiddelde hoogste serie per partij en grote series (sterkMin en hoger) per partij. Per tafel, want op de
// kleinere tafel maak je vanzelf grotere series. Oordeel bij minstens 6 partijen op die tafel; een verschil
// van minder dan 8% in de hoogste serie heet "stabiel".
function berekenHoogsteSeries(partijen,discipline){
  partijen=partijen||[];
  const d=beurtDrempels(discipline);
  const alle=[];
  partijen.forEach(function(p,pi){
    (p.beurten||[]).forEach(function(b,bi){
      alle.push({car:b.caramboles,tafel:p.tafel||"230",datum:p.datum,nr:p.nr||pi+1,beurt:bi+1,beurten:p.beurten.length,
        goed:(b.goed||[]).slice(),gemist:b.gemist||[]});
    });
  });
  if(!alle.length)return null;
  // Hoogste eerst; bij gelijke stand de recentste eerst. Gegroepeerd per aantal caramboles.
  const vanaf=alle.some(function(b){return b.car>=d.sterkMin;})?d.sterkMin:d.opbouwMin;
  const groot=alle.filter(function(b){return b.car>=vanaf;}).sort(function(a,b){return b.car-a.car||new Date(b.datum)-new Date(a.datum)||b.beurt-a.beurt;});
  const perAantal=[];
  groot.forEach(function(b){
    const g=perAantal[perAantal.length-1];
    if(g&&g.car===b.car)g.series.push(b);else perAantal.push({car:b.car,series:[b]});
  });
  const tafels=Object.keys(TAFELS).filter(function(k){return alle.some(function(b){return b.tafel===k;});});
  const gemVan=function(x){return x.length?x.reduce(function(s,v){return s+v;},0)/x.length:0;};
  const perTafel=tafels.map(function(k){
    const lijst=partijen.map(function(p,pi){
      const c=(p.beurten||[]).map(function(b){return b.caramboles;});
      const max=c.length?Math.max.apply(null,c):0,bi=c.indexOf(max),b=(p.beurten||[])[bi]||{};
      // Beurt van de hoogste serie (de eerste als hij vaker voorkwam), met de opmerkingen van die beurt
      return{nr:p.nr||pi+1,datum:p.datum,tafel:p.tafel||"230",max:max,groot:c.filter(function(x){return x>=d.sterkMin;}).length,n:c.length,
        gem:c.length?c.reduce(function(s,x){return s+x;},0)/c.length:0,beurt:bi+1,poedels:c.filter(function(x){return x===0;}).length,keer:c.filter(function(x){return x===max;}).length,
        goed:(b.goed||[]).slice(),gemist:b.gemist||[],
        // Alle grote series (vanaf `vanaf`) in deze partij, hoogste eerst: er kunnen er meer in één partij zitten
        series:(p.beurten||[]).map(function(x,j){return{car:x.caramboles,beurt:j+1,goed:(x.goed||[]).slice(),gemist:x.gemist||[]};})
          .filter(function(x){return x.car>=vanaf;}).sort(function(a,b){return b.car-a.car||a.beurt-b.beurt;})};
    }).filter(function(x){return x.tafel===k&&x.n>0;});
    const record=alle.filter(function(b){return b.tafel===k;}).sort(function(a,b){return b.car-a.car||new Date(b.datum)-new Date(a.datum);})[0];
    const aantal=Math.min(10,Math.floor(lijst.length/2));
    const voor=lijst.slice(0,lijst.length-aantal),na=lijst.slice(lijst.length-aantal);
    const meet=function(x){return{partijen:x.length,hoogste:gemVan(x.map(function(y){return y.max;})),groot:gemVan(x.map(function(y){return y.groot;}))};};
    const mv=meet(voor),mn=meet(na);
    let oordeel=null;
    if(lijst.length>=6&&mv.hoogste>0){
      const v=(mn.hoogste-mv.hoogste)/mv.hoogste;
      oordeel=v>=0.08?"beter":v<=-0.08?"minder":"stabiel";
    }
    return{tafel:k,record:record,partijen:lijst,aantal:aantal,voor:mv,na:mn,oordeel:oordeel};
  });
  return{perAantal:perAantal,vanaf:vanaf,perTafel:perTafel,grootMin:d.sterkMin};
}

// Je poedels: per tafel per partij aantal en percentage poedels (in welke beurten, langste reeks op rij, de
// opmerkingen bij die poedels), je beste partij (laagste percentage) en je langste poedelreeks, en of het de
// goede kant op gaat: je laatste 10 partijen (bij minder dan 20 de laatste helft) tegenover die ervoor.
// Minder poedels is beter; oordeel bij minstens 6 partijen, "stabiel" bij minder dan 2 procentpunt verschil
// (ongeveer een halve poedel per partij). Beste partij alleen uit partijen van minstens 15 beurten (als die er zijn).
// `redenen`: wat er bij je poedels is aangevinkt (Gemist), over alle tafels, hoogste eerst.
function berekenPoedels(partijen,discipline){
  partijen=partijen||[];
  const lijst=partijen.map(function(p,pi){
    const bt=p.beurten||[],c=bt.map(function(b){return b.caramboles;});
    const nul=[];c.forEach(function(x,j){if(x===0)nul.push(j+1);});
    // Langste reeks poedels op rij
    let lang=0,langVan=0,run=0;
    c.forEach(function(x,j){if(x===0){run++;if(run>lang){lang=run;langVan=j+2-run;}}else run=0;});
    const redenen={};
    bt.forEach(function(b){if(b.caramboles===0)(b.gemist||[]).forEach(function(l){redenen[l]=(redenen[l]||0)+1;});});
    const isAcq=function(b){return(b.goed||[]).indexOf("Acquit")!==-1||(b.gemist||[]).indexOf("Acquit")!==-1;};
    return{nr:p.nr||pi+1,datum:p.datum,tafel:p.tafel||"230",n:c.length,poedels:nul.length,pct:c.length?nul.length/c.length:0,
      totCar:c.reduce(function(s,x){return s+x;},0),acquitPoedels:nul.filter(function(j){return isAcq(bt[j-1]);}),
      beurten:nul,langste:lang,langsteVan:langVan,gem:c.length?c.reduce(function(s,x){return s+x;},0)/c.length:0,
      redenen:Object.keys(redenen).map(function(k){return{label:k,aantal:redenen[k]};}).sort(function(a,b){return b.aantal-a.aantal;})};
  }).filter(function(x){return x.n>0;});
  if(!lijst.length)return null;
  const tafels=Object.keys(TAFELS).filter(function(k){return lijst.some(function(x){return x.tafel===k;});});
  const meet=function(x){
    const n=x.reduce(function(s,y){return s+y.n;},0),p=x.reduce(function(s,y){return s+y.poedels;},0);
    return{partijen:x.length,pct:n?p/n:0,perPartij:x.length?p/x.length:0};
  };
  const perTafel=tafels.map(function(k){
    const pt=lijst.filter(function(x){return x.tafel===k;});
    const aantal=Math.min(10,Math.floor(pt.length/2));
    const voor=meet(pt.slice(0,pt.length-aantal)),na=meet(pt.slice(pt.length-aantal)),alle=meet(pt);
    let oordeel=null;
    if(pt.length>=6){const v=na.pct-voor.pct;oordeel=v<=-0.02?"beter":v>=0.02?"minder":"stabiel";}
    // Beste partij = laagste percentage; bij gelijke stand de recentste
    const lang=pt.filter(function(x){return x.n>=15;});
    const beste=(lang.length?lang:pt).slice().sort(function(a,b){return a.pct-b.pct||new Date(b.datum)-new Date(a.datum);})[0];
    const langste=pt.slice().sort(function(a,b){return b.langste-a.langste||new Date(b.datum)-new Date(a.datum);})[0];
    return{tafel:k,partijen:pt,aantal:aantal,voor:voor,na:na,alle:alle,oordeel:oordeel,beste:beste,langste:langste};
  });
  const redenen={};let metReden=0,totaal=0;
  lijst.forEach(function(x){totaal+=x.poedels;});
  partijen.forEach(function(p){(p.beurten||[]).forEach(function(b){
    if(b.caramboles!==0)return;
    if((b.gemist||[]).length)metReden++;
    (b.gemist||[]).forEach(function(l){redenen[l]=(redenen[l]||0)+1;});
  });});
  // Acquit per tafel (beurten met "Acquit" bij Goed of Gemist): hoe vaak lukt hij en hoeveel maak je er dan
  // van, tegenover je andere beurten. Voor de "wat als"-berekening in de kaart.
  const acquit=tafels.map(function(k){
    const ps=partijen.filter(function(p){return(p.tafel||"230")===k&&(p.beurten||[]).length;});
    let stoten=0,gelukt=0,acqCar=0,car=0,beurten=0,anderN=0,anderRaak=0,anderCar=0;const waarden=[];
    ps.forEach(function(p){p.beurten.forEach(function(b){
      car+=b.caramboles;beurten++;
      if((b.goed||[]).indexOf("Acquit")!==-1||(b.gemist||[]).indexOf("Acquit")!==-1){
        stoten++;if(b.caramboles>0){gelukt++;acqCar+=b.caramboles;waarden.push(b.caramboles);}
      }else{anderN++;if(b.caramboles>0){anderRaak++;anderCar+=b.caramboles;}}
    });});
    return{tafel:k,partijen:ps.length,stoten:stoten,gelukt:gelukt,kans:stoten?gelukt/stoten:0,gemBijLukken:gelukt?acqCar/gelukt:0,
      waarden:waarden.sort(function(a,b){return a-b;}),acqCar:acqCar,car:car,beurten:beurten,gem:beurten?car/beurten:0,
      anderKans:anderN?anderRaak/anderN:0,anderGem:anderRaak?anderCar/anderRaak:0};
  });
  return{perTafel:perTafel,totaal:totaal,metReden:metReden,acquit:acquit,
    redenen:Object.keys(redenen).map(function(k){return{label:k,aantal:redenen[k]};}).sort(function(a,b){return b.aantal-a.aantal;})};
}

function berekenInzicht(partijen,discipline){
  const d=beurtDrempels(discipline);
  const gemistLabels=GEMIST.map(function(o){return o.label;}),goedLabels=GOED.map(function(o){return o.label;});
  const technieken=gemistLabels.filter(function(l){return goedLabels.indexOf(l)!==-1;});
  const beurten=[];
  // Volgorde op de avond: partijen op dezelfde speelavond (na middernacht telt nog als de avond ervoor),
  // alleen voor avonden met 2 of meer partijen (clubavonden); een losse partij zegt hier niets over.
  const avondVan=function(p){const t=new Date(new Date(p.datum).getTime()-6*3600e3);return t.getFullYear()+"-"+t.getMonth()+"-"+t.getDate();};
  const avonden={};
  (partijen||[]).forEach(function(p,pi){(avonden[avondVan(p)]=avonden[avondVan(p)]||[]).push(pi);});
  const avondNr={};
  Object.keys(avonden).forEach(function(k){
    const lijst=avonden[k];
    if(lijst.length<2)return;
    lijst.slice().sort(function(a,b){return new Date(partijen[a].datum)-new Date(partijen[b].datum);}).forEach(function(pi,i){avondNr[pi]=i+1;});
  });
  (partijen||[]).forEach(function(p,pi){
    (p.beurten||[]).forEach(function(b,bi){
      beurten.push({avondNr:avondNr[pi]||null,car:b.caramboles,gemist:b.gemist||[],goed:b.goed||[],pi:pi,bi:bi,tafel:p.tafel||"230",
        oudeAcquit:bi===0&&p.tafel==="230"&&new Date(p.datum).getTime()<new Date(ACQUIT_AANVULLING_TOT).getTime(),vorige:bi>0?p.beurten[bi-1].caramboles:null});
    });
  });
  const n=beurten.length;
  if(!n)return null;
  const som=function(a){return a.reduce(function(s,b){return s+b.car;},0);};
  const basis=som(beurten)/n;

  // Welke partijen zijn bijgehouden? Alleen daarvan tellen de opmerkingen mee. De acquit in beurt 1 van de
  // oude 2,30-partijen is automatisch aangevuld (vulAcquitAan) en telt daarom niet mee voor "bijgehouden".
  const isAcquitBeurt=function(b){return b.oudeAcquit;};
  const eigen=function(lijst,b){return isAcquitBeurt(b)?lijst.filter(function(x){return x!=="Acquit";}):lijst;};
  const heeftOpmerking=function(b){return eigen(b.gemist,b).length>0||eigen(b.goed,b).length>0;};
  const bijgehouden={},perTafel={};
  (partijen||[]).forEach(function(p,pi){
    const bs=beurten.filter(function(b){return b.pi===pi;});
    const ok=bs.length>0&&bs.filter(heeftOpmerking).length/bs.length>=INZICHT_DEKKING;
    if(ok)bijgehouden[pi]=true;
    const t=p.tafel||"230";
    perTafel[t]=perTafel[t]||{tafel:t,partijen:0,bijgehouden:0};
    perTafel[t].partijen++;if(ok)perTafel[t].bijgehouden++;
  });
  const bijgehoudenIdx=Object.keys(bijgehouden).map(Number).sort(function(a,b){return a-b;});
  const tagBeurten=beurten.filter(function(b){return bijgehouden[b.pi];});
  const basisTag=tagBeurten.length?som(tagBeurten)/tagBeurten.length:0;
  // In die oude 2,30-partijen is de acquit (beurt 1) altijd bekend, ook als de partij verder niet bijgehouden is
  const acquitExtra=beurten.filter(function(b){return isAcquitBeurt(b)&&!bijgehouden[b.pi];});
  const bron=function(t){return t==="Acquit"?tagBeurten.concat(acquitExtra):tagBeurten;};
  const dekking={partijen:(partijen||[]).length,bijgehouden:bijgehoudenIdx.length,
    perTafel:Object.keys(perTafel).map(function(k){return perTafel[k];})};

  // 1. Speelprofiel per techniek: gebruik (goed+fout), slagingspercentage, gem. caramboles als het goed ging
  const profiel=technieken.map(function(t){
    let goed=0,fout=0,carGoed=0;
    bron(t).forEach(function(b){
      if(b.goed.indexOf(t)!==-1){goed++;carGoed+=b.car;}
      if(b.gemist.indexOf(t)!==-1)fout++;
    });
    return{label:t,goed:goed,fout:fout,gebruik:goed+fout,pct:goed+fout?goed/(goed+fout):0,gemGoed:goed?carGoed/goed:null};
  }).filter(function(x){return x.gebruik>0;}).sort(function(a,b){return b.gebruik-a.gebruik;});
  const totGoed=profiel.reduce(function(s,x){return s+x.goed;},0),totGebruik=profiel.reduce(function(s,x){return s+x.gebruik;},0);
  const refPct=totGebruik?totGoed/totGebruik:0;
  const genoeg=profiel.filter(function(x){return x.gebruik>=INZICHT_MIN;});
  // Sterkste techniek/werkpunt: gewogen naar gebruik, dus "waar zit de meeste winst": vaak gespeeld én
  // duidelijk beter (of slechter) dan je andere technieken.
  const winst=function(x){return x.gebruik*(x.pct-refPct);};
  const sterkste=genoeg.filter(function(x){return x.pct>refPct;}).sort(function(a,b){return winst(b)-winst(a);})[0]||null;
  const werkpunt=genoeg.filter(function(x){return x.pct<refPct;}).sort(function(a,b){return winst(a)-winst(b);})[0]||null;

  // 2. Seriemakers: wat je aanvinkte als het goed ging, en wat dat aan caramboles opleverde
  const seriemakers=goedLabels.map(function(t){
    const met=bron(t).filter(function(b){return b.goed.indexOf(t)!==-1;});
    return{label:t,aantal:met.length,gem:met.length?som(met)/met.length:0};
  }).filter(function(x){return x.aantal>=INZICHT_MIN;}).map(function(x){return Object.assign(x,{factor:basisTag>0?x.gem/basisTag:0});})
    .sort(function(a,b){return b.gem-a.gem;});

  // 3. Seriestoppers: waardoor je series eindigden (alleen beschrijvend). Zelf getypte tekst = Overig.
  const metOorzaak=tagBeurten.filter(function(b){return b.gemist.length>0;});
  const stopTel={};
  metOorzaak.forEach(function(b){
    b.gemist.forEach(function(t){
      const k=gemistLabels.indexOf(t)!==-1?t:"Overig";
      if(!stopTel[k])stopTel[k]={label:k,aantal:0,car:0,poedels:0,techniek:technieken.indexOf(k)!==-1};
      stopTel[k].aantal++;stopTel[k].car+=b.car;if(b.car===0)stopTel[k].poedels++;
    });
  });
  const seriestoppers=Object.keys(stopTel).map(function(k){const x=stopTel[k];
    return Object.assign(x,{aandeel:x.aantal/metOorzaak.length,gem:x.car/x.aantal,poedelPct:x.poedels/x.aantal});})
    .sort(function(a,b){return b.aantal-a.aantal;});

  // 4. Omstandigheden: gemiddelde per groep t.o.v. het geheel (alleen groepen met genoeg beurten)
  const groep=function(titel,sleutelVan,volgorde,naam){
    const g={};
    beurten.forEach(function(b){const k=sleutelVan(b);if(k===null)return;(g[k]=g[k]||[]).push(b);});
    // Vergelijk met het gemiddelde van de beurten die in deze groep meetellen (bij Partij van de avond
    // alleen clubavonden), niet met het geheel
    const mee=[].concat.apply([],Object.keys(g).map(function(k){return g[k];}));
    const ref=mee.length?som(mee)/mee.length:basis;
    const rijen=volgorde.filter(function(k){return g[k]&&g[k].length>=30;}).map(function(k){
      const gem=som(g[k])/g[k].length;
      return{label:naam(k),aantal:g[k].length,gem:gem,verschil:ref>0?(gem-ref)/ref:0};
    });
    return rijen.length>=2?{titel:titel,rijen:rijen,ref:ref,aantal:mee.length}:null;
  };
  const omstandigheden=[
    groep("Tafel",function(b){return b.tafel;},Object.keys(TAFELS),function(k){return tafelLabel(k);}),
    groep("Partij van de avond",function(b){return b.avondNr===null?null:b.avondNr>=3?"3":String(b.avondNr);},["1","2","3"],
      function(k){return k==="3"?"3e partij of later":k+"e partij";}),
    groep("Fase in de partij",function(b){return b.bi<3?"a":b.bi<10?"b":b.bi<20?"c":"d";},["a","b","c","d"],
      function(k){return{a:"beurt 1–3",b:"beurt 4–10",c:"beurt 11–20",d:"beurt 21+"}[k];}),
    groep("Na de vorige beurt",function(b){return b.vorige===null?null:b.vorige===0?"p":b.vorige<d.opbouwMin?"k":"s";},["p","k","s"],
      function(k){return{p:"na een poedel",k:"na 1–"+(d.opbouwMin-1)+" car",s:"na "+d.opbouwMin+"+ car"}[k];})
  ].filter(Boolean);

  // 5. Trend binnen de bijgehouden partijen: eerste helft tegenover tweede helft (per 100 beurten)
  const helft=Math.floor(bijgehoudenIdx.length/2);
  const grens=helft>0?bijgehoudenIdx[helft]:Infinity;
  const eerste=tagBeurten.filter(function(b){return b.pi<grens;}),tweede=tagBeurten.filter(function(b){return b.pi>=grens;});
  const trend=helft<2?[]:seriestoppers.filter(function(x){return x.label!=="Overig"&&x.aantal>=6;}).slice(0,6).map(function(x){
    const tel=function(a){return a.filter(function(b){return b.gemist.indexOf(x.label)!==-1;}).length;};
    const v=tel(eerste)/Math.max(1,eerste.length)*100,n2=tel(tweede)/Math.max(1,tweede.length)*100;
    return{label:x.label,voor:v,na:n2,verandering:v>0?(n2-v)/v:0};
  });

  // 6. Poedels en series (alleen caramboles, dus alle partijen). Elke beurt eindigt met een misser; je
  // gemiddelde gaat alleen omhoog door minder poedels en grotere series. Groepen per discipline
  // (histogramBuckets: poedel, 1-2, 3-4, 5-7, 8-9, 10+ bij libre).
  const helftP=Math.floor((partijen||[]).length/2);
  const nrVan=function(pi){const p=partijen[pi];return p&&p.nr?p.nr:pi+1;};
  const reeks=function(van,tot){return"p"+nrVan(van)+"–p"+nrVan(tot);};
  const helftLabels=helftP>=2?{eerste:reeks(0,helftP-1),tweede:reeks(helftP,partijen.length-1)}:null;
  const groepen=histogramBuckets(discipline);
  const vergelijkingen=helftLabels?vergelijkSeries(partijen,discipline,"helften").vergelijkingen:[];
  // Hefboom: wat levert één poedel minder op, en wat één grote serie (per partij van gemiddeld N beurten)
  const nu=seriesProfiel(beurten,groepen);
  const series={nu:nu,vergelijkingen:vergelijkingen,
    hefboom:{beurten:Math.max(1,Math.round(nu.beurtenPP)),klein:d.opbouwMin>1?2:1,groot:d.topMin}};
  // Motor: welk deel van je caramboles komt uit series vanaf opbouwMin
  const groot=beurten.filter(function(b){return b.car>=d.opbouwMin;}),totCar=som(beurten);
  const motor={drempel:d.opbouwMin,beurtPct:groot.length/n,carPct:totCar>0?som(groot)/totCar:0};
  // Na een poedel: kans op nog een poedel tegenover je gewone poedelkans
  const naPoedel=beurten.filter(function(b){return b.vorige===0;});
  const poedel={kans:beurten.filter(function(b){return b.car===0;}).length/n,
    naPoedel:naPoedel.length?naPoedel.filter(function(b){return b.car===0;}).length/naPoedel.length:null,aantal:naPoedel.length};
  // Per tafel: kans op nog een poedel na een poedel tegenover na een score. Over alle tafels samen klopt dat
  // niet (op de moeilijkere tafel maak je meer poedels, dus ook vaker twee op rij). `verwacht` = de kans als
  // de beurten binnen een partij los van elkaar staan: op een mindere avond maak je gewoon meer poedels.
  const poedelsInPartij={},beurtenInPartij={};
  beurten.forEach(function(b){beurtenInPartij[b.pi]=(beurtenInPartij[b.pi]||0)+1;if(b.car===0)poedelsInPartij[b.pi]=(poedelsInPartij[b.pi]||0)+1;});
  const poedelTafels=Object.keys(TAFELS).filter(function(k){return beurten.some(function(b){return b.tafel===k;});});
  poedel.perTafel=(poedelTafels.length>1?poedelTafels:[null]).map(function(k){
    const bij=beurten.filter(function(b){return(k===null||b.tafel===k)&&b.vorige!==null;});
    const np=bij.filter(function(b){return b.vorige===0;}),ns=bij.filter(function(b){return b.vorige>0;});
    if(np.length<20||ns.length<20)return null;
    const verwacht=np.reduce(function(s,b){return s+((poedelsInPartij[b.pi]||0)-1)/Math.max(1,beurtenInPartij[b.pi]-1);},0)/np.length;
    return{tafel:k,aantal:np.length,naPoedel:np.filter(function(b){return b.car===0;}).length/np.length,
      naScore:ns.filter(function(b){return b.car===0;}).length/ns.length,verwacht:verwacht};
  }).filter(Boolean);

  // 7. Coach: een paar zinnen, alleen bij genoeg voorbeelden
  const coach=[];
  const k2=function(x){return x.toFixed(2).replace(".",",");},k1=function(x){return x.toFixed(1).replace(".",",");},pc=function(x){return Math.round(x*100)+"%";};
  const teken=function(x){return(x>=0?"+":"−")+k2(Math.abs(x));};
  // Vorm in poedels en series: wat veranderde er concreet per partij, en wat leverde dat op
  if(helftLabels&&vergelijkingen.length){
    const zinnen=vergelijkingen.map(function(v){
      const e=v.e,w=v.w,verschil=e.gem>0?(w.gem-e.gem)/e.gem:0,waar=v.tafel?"Op de "+tafelLabel(v.tafel):null;
      const pe=e.groepen[0].perPartij,pw=w.groepen[0].perPartij;
      const poedels=Math.abs(pw-pe)<0.2?"evenveel poedels ("+k1(pe)+")"
        :k1(Math.abs(pw-pe))+(pw<pe?" poedels minder":" poedels meer")+" ("+k1(pe)+" → "+k1(pw)+")";
      if(Math.abs(verschil)<0.05)return(waar?waar+" ben je":"Je bent")+" gelijk gebleven ("+k2(e.gem)+" → "+k2(w.gem)+"), met "+poedels+" per partij.";
      // De seriegroep die het meest bijdroeg in de richting van de verandering
      let i=1;
      for(let j=2;j<v.bijdrage.length;j++)if(verschil>0?v.bijdrage[j]>v.bijdrage[i]:v.bijdrage[j]<v.bijdrage[i])i=j;
      const ge=e.groepen[i],gw=w.groepen[i];
      return(waar?waar+" "+(verschil>0?"ga je vooruit":"zak je wat terug"):(verschil>0?"Je gaat vooruit":"Je zakt wat terug"))+": "+k2(e.gem)+" → "+k2(w.gem)+
        ". Per partij maak je "+poedels+" en "+(gw.perPartij>=ge.perPartij?"vaker":"minder vaak")+" een serie van "+gw.label+" ("+k1(ge.perPartij)+" → "+k1(gw.perPartij)+
        "); dat scheelt "+teken(v.bijdrage[i])+" op je gemiddelde.";
    });
    coach.push({soort:"vorm",tekst:"Eerder tegenover nu ("+helftLabels.eerste+" → "+helftLabels.tweede+"): "+zinnen.join(" ")});
  }
  // Poedels en de hefboom van één grote serie
  if(n>=50){
    const h=series.hefboom;
    coach.push({soort:"poedel",tekst:"Poedels: gemiddeld "+k1(nu.groepen[0].perPartij)+" per partij van "+h.beurten+" beurten ("+pc(poedel.kans)+"). Eén poedel minder (een beurt van "+h.klein+" in plaats van 0) levert +"+k2(h.klein/h.beurten)+" op je gemiddelde; één serie van "+h.groot+" in plaats van een poedel levert +"+k2(h.groot/h.beurten)+", evenveel als "+Math.round(h.groot/h.klein)+" poedels minder."});
  }
  // Hoogste series per tafel: record en of het de goede kant op gaat
  const hs=berekenHoogsteSeries(partijen,discipline);
  if(hs){
    hs.perTafel.filter(function(x){return x.record&&x.oordeel;}).forEach(function(x){
      const waar=hs.perTafel.length>1?" op de "+tafelLabel(x.tafel):"";
      const richting={beter:"dat gaat de goede kant op",stabiel:"dat blijft gelijk",minder:"daar is nog wat nodig"}[x.oordeel];
      coach.push({soort:"hoogste",tekst:"Hoogste serie"+waar+": record "+x.record.car+" ("+fmtDatum(x.record.datum)+"). Je laatste "+x.aantal+" partijen gemiddeld "+k1(x.na.hoogste)+", ervoor "+k1(x.voor.hoogste)+": "+richting+"."});
    });
  }
  // Poedels per tafel: gaat het de goede kant op (minder poedels)?
  const pd=berekenPoedels(partijen,discipline);
  if(pd){
    pd.perTafel.filter(function(x){return x.oordeel;}).forEach(function(x){
      const waar=pd.perTafel.length>1?" op de "+tafelLabel(x.tafel):"";
      const richting={beter:"dat gaat de goede kant op",stabiel:"dat blijft gelijk",minder:"daar is nog wat nodig"}[x.oordeel];
      coach.push({soort:"poedeltrend",tekst:"Poedels"+waar+": je laatste "+x.aantal+" partijen "+pc(x.na.pct)+" ("+k1(x.na.perPartij)+" per partij), ervoor "+pc(x.voor.pct)+" ("+k1(x.voor.perPartij)+"): "+richting+"."});
    });
  }
  if(sterkste)coach.push({soort:"sterk",tekst:"Je sterkste techniek is "+sterkste.label+": "+sterkste.goed+" van de "+sterkste.gebruik+" keer goed ("+Math.round(sterkste.pct*100)+"%, tegen gemiddeld "+Math.round(refPct*100)+"% over al je technieken)."});
  if(werkpunt)coach.push({soort:"werk",tekst:werkpunt.label+(werkpunt.gebruik>=15?" speel je vaak":" komt voor")+" ("+werkpunt.gebruik+"×), maar lukt minder vaak dan je andere technieken: "+werkpunt.goed+" van de "+werkpunt.gebruik+" keer goed ("+Math.round(werkpunt.pct*100)+"%). Daar valt het meest te winnen."});
  const topSerie=seriemakers.filter(function(x){return x.aantal>=10;})[0];
  if(motor.carPct>=0.3&&motor.beurtPct<=0.25)coach.push({soort:"motor",tekst:"Je grote series zijn je motor: "+pc(motor.carPct)+" van je caramboles komt uit maar "+pc(motor.beurtPct)+" van je beurten (series van "+motor.drempel+" of meer)."});
  if(topSerie&&topSerie.factor>=1.5)coach.push({soort:"serie",tekst:"Je grootste series: in beurten waarin \u201c"+topSerie.label+"\u201d goed ging maak je gemiddeld "+topSerie.gem.toFixed(1).replace(".",",")+" caramboles, "+topSerie.factor.toFixed(1).replace(".",",")+"× je gemiddelde in die partijen ("+topSerie.aantal+" beurten)."});
  if(poedel.perTafel.length){
    let avond=false;
    const delen=poedel.perTafel.map(function(x){
      const waar=x.tafel?"op de "+tafelLabel(x.tafel)+" ":"",verschil=x.naPoedel-x.naScore;
      const cijfers=pc(x.naPoedel)+" kans op nog een poedel, na een score "+pc(x.naScore);
      if(verschil<=-0.03)return waar+"herpak je je ("+cijfers+")";
      if(verschil<0.05)return waar+"maakt het weinig uit ("+cijfers+")";
      if(x.naPoedel-x.verwacht<0.03)avond=true;
      return waar+"blijft een poedel wat hangen ("+cijfers+")";
    });
    coach.push({soort:"mentaal",tekst:"Na een poedel: "+delen.join("; ")+"."+
      (avond?" Dat komt vooral doordat je op een mindere avond meer poedels maakt, niet door die ene poedel zelf.":"")});
  }
  // De (hoogstens drie) omstandigheden met het grootste verschil tussen beste en slechtste groep
  const opvallend=[];
  omstandigheden.forEach(function(o){
    if(o.titel==="Na de vorige beurt")return;
    const r=o.rijen.filter(function(x){return x.aantal>=50;});
    if(r.length<2)return;
    const hoog=r.reduce(function(a,b){return b.gem>a.gem?b:a;}),laag=r.reduce(function(a,b){return b.gem<a.gem?b:a;});
    const spreiding=laag.gem>0?(hoog.gem-laag.gem)/laag.gem:0;
    if(spreiding>=0.15)opvallend.push({titel:o.titel,hoog:hoog,laag:laag,spreiding:spreiding});
  });
  opvallend.sort(function(a,b){return b.spreiding-a.spreiding;}).slice(0,3).forEach(function(x){
    coach.push({soort:"omstandigheid",tekst:x.titel+": "+x.hoog.label+" speel je "+Math.round(x.spreiding*100)+"% beter dan "+x.laag.label+" ("+x.hoog.gem.toFixed(2).replace(".",",")+" tegen "+x.laag.gem.toFixed(2).replace(".",",")+")."});
  });
  const beter=trend.filter(function(x){return x.verandering<=-0.3;}).sort(function(a,b){return a.verandering-b.verandering;})[0];
  if(beter)coach.push({soort:"trend",tekst:beter.label+" kost je minder series dan eerst: van "+beter.voor.toFixed(1).replace(".",",")+" naar "+beter.na.toFixed(1).replace(".",",")+" per 100 beurten."});

  // Volgorde in de samenvatting: eerst poedels en series (waar je gemiddelde vandaan komt), dan technieken
  const volgorde={vorm:0,hoogste:1,poedeltrend:2,poedel:3,motor:4,serie:5,sterk:6,werk:7,mentaal:8,trend:9,omstandigheid:10};
  const plek=function(c){return c.soort in volgorde?volgorde[c.soort]:11;}; // let op: vorm heeft plek 0
  coach.sort(function(a,b){return plek(a)-plek(b);});
  return{aantalBeurten:n,hoogste:hs,poedels:pd,basis:basis,basisTag:basisTag,dekking:dekking,series:series,helftLabels:helftLabels,motor:motor,poedel:poedel,
    acquitPartijen:beurten.filter(isAcquitBeurt).length,metOpmerking:beurten.filter(function(b){return b.gemist.length||b.goed.length;}).length,
    profiel:profiel,refPct:refPct,sterkste:sterkste,werkpunt:werkpunt,seriemakers:seriemakers,seriestoppers:seriestoppers,
    metOorzaak:metOorzaak.length,omstandigheden:omstandigheden,trend:trend,coach:coach};
}

// Leest het antwoord van een AI-chat op BRIEFJE_PROMPT (zie js/constanten.js). Ruimhartig: andere scheiders,
// streepjes voor poedels, ontbrekende totalen en extra tekst mogen. Geeft {spelers:[{naam,teMaken,beurten:
// [{nr,car,totaal}]}],datum} of null als er niets bruikbaars in staat. Totaal is null als het ontbreekt.
function leesBriefje(tekst){
  const spelers=[];let huidig=null,datum=null,aantalBeurten=null;
  String(tekst||"").split(/\r?\n/).forEach(function(regel){
    const r=regel.replace(/[*_`#>]/g,"").trim();
    if(!r)return;
    const sp=r.match(/^speler\s*[:\-]\s*([^|]*?)\s*(?:\|\s*te\s*maken\s*[:\-]?\s*(\d+))?\s*$/i);
    if(sp){huidig={naam:sp[1].trim()||("Speler "+(spelers.length+1)),teMaken:sp[2]?parseInt(sp[2],10):null,beurten:[]};spelers.push(huidig);return;}
    const ab=r.match(/^beurten\s*[:\-]\s*(\d{1,3})/i);
    if(ab){aantalBeurten=parseInt(ab[1],10);return;}
    const dt=r.match(/^datum\s*[:\-]\s*(\d{1,2})[-./](\d{1,2})[-./](\d{2,4})/i);
    if(dt){const j=parseInt(dt[3],10);datum={dag:parseInt(dt[1],10),maand:parseInt(dt[2],10),jaar:j<100?2000+j:j};return;}
    const b=r.match(/^(\d{1,2})\s*[:.)\-]\s*(\d{1,3}|[-–—]|x|poedel)?\s*(?:[\/|;,]\s*(\d{1,4}|[-–—]))?/i);
    if(b&&huidig){
      const car=b[2]&&/^\d+$/.test(b[2])?parseInt(b[2],10):0;
      const totaal=b[3]&&/^\d+$/.test(b[3])?parseInt(b[3],10):null;
      huidig.beurten.push({nr:parseInt(b[1],10),car:car,totaal:totaal});
    }
  });
  const bruikbaar=spelers.filter(function(s){return s.beurten.length>0;});
  if(!bruikbaar.length)return null;
  // Beurten op volgorde en zonder dubbele nummers; ontbrekende tussenbeurten worden poedels
  bruikbaar.forEach(function(s){
    const perNr={};s.beurten.forEach(function(b){perNr[b.nr]=b;});
    const max=Math.max.apply(null,s.beurten.map(function(b){return b.nr;}));
    s.beurten=[];for(let i=1;i<=max;i++)s.beurten.push(perNr[i]||{nr:i,car:0,totaal:null});
  });
  return{spelers:bruikbaar,datum:datum,aantalBeurten:aantalBeurten};
}

// Controle tegen de lopende totalen op het briefje. Per beurt wat het briefje verwacht (totaal min het vorige
// bekende totaal); alleen een beurt die daarvan afwijkt is fout, niet alle beurten erna. Plus het eigen totaal.
function controleerBriefje(beurten){
  let som=0,vorigBriefje=0;
  return beurten.map(function(b){
    som+=b.car;
    const verwacht=b.totaal!==null?b.totaal-vorigBriefje:null;
    if(b.totaal!==null)vorigBriefje=b.totaal;
    return{nr:b.nr,car:b.car,totaal:b.totaal,eigenTotaal:som,verwacht:verwacht,klopt:verwacht===null||verwacht===b.car};
  });
}

// "Je seizoen in beeld": de feiten voor de verhaal-kaarten van één seizoen (alleen de huidige discipline).
// Geeft null als er in dat seizoen nog geen partij is.
function berekenSeizoenVerhaal(alleP,seizoen,discipline){
  const vanaf=seizoen.startDatum?new Date(seizoen.startDatum).getTime():-Infinity;
  const tot=seizoen.eindDatum?new Date(seizoen.eindDatum).getTime():Infinity;
  const ps=(alleP||[]).filter(function(p){const t=new Date(p.datum).getTime();return t>=vanaf&&t<tot&&(p.beurten||[]).length;});
  if(!ps.length)return null;
  let car=0,beurten=0,poedels=0,hoogste={car:-1};
  const perPartij=ps.map(function(p){
    const c=p.beurten.map(function(b){return b.caramboles;});
    const som=c.reduce(function(s,x){return s+x;},0);
    car+=som;beurten+=c.length;poedels+=c.filter(function(x){return x===0;}).length;
    c.forEach(function(x,i){if(x>hoogste.car||(x===hoogste.car&&new Date(p.datum)>new Date(hoogste.datum)))hoogste={car:x,datum:p.datum,tafel:p.tafel||"230",beurt:i+1};});
    return{datum:p.datum,tafel:p.tafel||"230",gem:som/c.length,car:som,beurten:c.length,poedels:c.filter(function(x){return x===0;}).length};
  });
  const beste=perPartij.slice().sort(function(a,b){return b.gem-a.gem;})[0];
  // Poedels per partij: eerste tegenover tweede helft van het seizoen (vanaf 4 partijen)
  let poedelVerloop=null;
  if(perPartij.length>=4){
    const h=Math.floor(perPartij.length/2),gemP=function(x){return x.reduce(function(s,y){return s+y.poedels/y.beurten;},0)/x.length;};
    const bpp=beurten/perPartij.length;
    poedelVerloop={eerst:gemP(perPartij.slice(0,h))*bpp,nu:gemP(perPartij.slice(h))*bpp};
  }
  // Beste maand (minstens 2 partijen)
  const maanden={};
  perPartij.forEach(function(p){const k=maandKey(p.datum);(maanden[k]=maanden[k]||{car:0,beurten:0,n:0,naam:k});maanden[k].car+=p.car;maanden[k].beurten+=p.beurten;maanden[k].n++;});
  const besteMaand=Object.keys(maanden).map(function(k){return maanden[k];}).filter(function(m){return m.n>=2;})
    .map(function(m){return{naam:m.naam,gem:m.car/m.beurten,partijen:m.n};}).sort(function(a,b){return b.gem-a.gem;})[0]||null;
  const gem=car/beurten;
  const datums=ps.map(function(p){return new Date(p.datum).getTime();});
  const dagen={};ps.forEach(function(p){dagen[new Date(p.datum).toDateString()]=1;});
  return{seizoen:seizoen,partijen:ps.length,speeldagen:Object.keys(dagen).length,caramboles:car,beurten:beurten,gem:gem,
    poedelsPerPartij:poedels/ps.length,hoogste:hoogste,beste:beste,poedelVerloop:poedelVerloop,besteMaand:besteMaand,
    van:new Date(Math.min.apply(null,datums)).toISOString(),totDatum:new Date(Math.max.apply(null,datums)).toISOString(),
    niveau:bepaalNiveau(gem,discipline).huidig};
}
