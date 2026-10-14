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
      badges.push({label:"Opbouw",emoji:"🎯",aantal:st.opbouw57,punten:st.opbouw57*10,categorie:"Beurt-pieken",detail:"Beurten van "+waarden.join(", ")+" car (drempel: "+d.opbouwMin+"-"+d.opbouwMax+" car per beurt)"});
    }
    if(st.opbouw89>0){
      const waarden=p.beurten.filter(function(b){return b.caramboles>=d.sterkMin&&b.caramboles<=d.sterkMax;}).map(function(b){return b.caramboles;});
      badges.push({label:"Sterke serie",emoji:"🔥",aantal:st.opbouw89,punten:st.opbouw89*20,categorie:"Beurt-pieken",detail:"Beurten van "+waarden.join(", ")+" car (drempel: "+d.sterkMin+"-"+d.sterkMax+" car per beurt)"});
    }
    if(st.opbouw10>0){
      const waarden=p.beurten.filter(function(b){return b.caramboles>=d.topMin;}).map(function(b){return b.caramboles;});
      badges.push({label:"Topserie",emoji:"💫",aantal:st.opbouw10,punten:st.opbouw10*35,categorie:"Beurt-pieken",detail:"Beurten van "+waarden.join(", ")+" car (drempel: "+d.topMin+"+ car per beurt)"});
    }

    if(st.max>allTimeMaxBeurt&&allTimeMaxBeurt>0){
      badges.push({label:"Nieuw record beurt",emoji:"🏆",aantal:1,punten:50,categorie:"Beurt-pieken",detail:"Nieuwe hoogste beurt: "+st.max+" car (vorig record: "+allTimeMaxBeurt+" car)"});
    }

    let langsteReeks=0,huidigeReeks=0;
    p.beurten.forEach(function(b){
      if(b.caramboles>0){huidigeReeks++;langsteReeks=Math.max(langsteReeks,huidigeReeks);}
      else huidigeReeks=0;
    });
    if(st.poedels===0){
      badges.push({label:"Geen poedel hele partij",emoji:"🛡️",aantal:1,punten:30,categorie:"Consistentie",detail:"0 van de "+st.aantalBeurten+" beurten was een poedel"});
    }else if(langsteReeks>=8){
      badges.push({label:"Lange reeks zonder poedel",emoji:"⛓️",aantal:1,punten:25,categorie:"Consistentie",detail:"Langste reeks: "+langsteReeks+" beurten op rij zonder poedel (drempel: 8+)"});
    }else if(langsteReeks>=5){
      badges.push({label:"Reeks zonder poedel",emoji:"⛓️",aantal:1,punten:15,categorie:"Consistentie",detail:"Langste reeks: "+langsteReeks+" beurten op rij zonder poedel (drempel: 5+)"});
    }
    const poedelPct=st.poedels/st.aantalBeurten*100;
    if(poedelPct<20&&st.poedels>0){
      badges.push({label:"Weinig poedels",emoji:"✅",aantal:1,punten:15,categorie:"Consistentie",detail:st.poedels+" van de "+st.aantalBeurten+" beurten poedel ("+Math.round(poedelPct)+"%, drempel: <20%)"});
    }

    const herstelDetails=[];
    p.beurten.forEach(function(b,i){
      if(b.caramboles===0){
        const next=p.beurten[i+1];
        if(next&&next.caramboles>=5)herstelDetails.push("na poedel volgde "+next.caramboles+" car");
      }
    });
    if(herstelDetails.length>0)badges.push({label:"Sterk herstel na poedel",emoji:"💪",aantal:herstelDetails.length,punten:herstelDetails.length*15,categorie:"Mentaliteit",detail:herstelDetails.join(" · ")+" (drempel: 5+ car direct na een poedel)"});

    const venster=vensterSlice(p.datum);
    const vensterCar=venster.reduce(function(a,w){return a+w.tot;},0);
    const vensterBeurt=venster.reduce(function(a,w){return a+w.n;},0);
    const totaalGemTotDan=vensterBeurt>0?vensterCar/vensterBeurt:null;
    const vensterLabel=tijdsvensterMaanden?" (laatste "+tijdsvensterMaanden+" mnd)":" ooit";

    const helft=Math.floor(p.beurten.length/2);
    if(helft>=3){
      const eerste=p.beurten.slice(0,helft),tweede=p.beurten.slice(helft);
      const gemE=eerste.reduce(function(a,b){return a+b.caramboles;},0)/eerste.length;
      const gemT=tweede.reduce(function(a,b){return a+b.caramboles;},0)/tweede.length;
      if(gemT>gemE&&totaalGemTotDan!==null&&gem>totaalGemTotDan){
        badges.push({label:"Sterke afsluiting",emoji:"📈",aantal:1,punten:15,categorie:"Mentaliteit",detail:"1e helft: "+gemE.toFixed(2)+" · 2e helft: "+gemT.toFixed(2)+" · partijgemiddelde "+gem.toFixed(2)+" boven totaalgemiddelde"+vensterLabel+" "+totaalGemTotDan.toFixed(2)});
      }
    }

    const basis=totaalGemTotDan!==null?totaalGemTotDan:0;
    const drempel1=Math.floor(basis/0.5)*0.5+0.5;
    const drempel2=drempel1+0.5;
    if(gem>=drempel2){
      badges.push({label:"Gemiddelde boven "+drempel2.toFixed(1).replace(".",","),emoji:"⭐",aantal:1,punten:30,categorie:"Doel & totaal",detail:"Partijgemiddelde: "+gem.toFixed(2)+" (persoonlijke drempel: "+drempel2.toFixed(2)+", op basis van je totaalgemiddelde"+vensterLabel+" "+basis.toFixed(2)+")"});
    }else if(gem>=drempel1){
      badges.push({label:"Gemiddelde boven "+drempel1.toFixed(1).replace(".",","),emoji:"⭐",aantal:1,punten:15,categorie:"Doel & totaal",detail:"Partijgemiddelde: "+gem.toFixed(2)+" (persoonlijke drempel: "+drempel1.toFixed(2)+", op basis van je totaalgemiddelde"+vensterLabel+" "+basis.toFixed(2)+")"});
    }

    const vensterBestGem=verwerkt.length?Math.max.apply(null,verwerkt.map(function(w){return w.gem;})):0;
    if(gem>vensterBestGem&&vensterBestGem>0){
      badges.push({label:"Nieuw beste gemiddelde ooit",emoji:"👑",aantal:1,punten:60,categorie:"Doel & totaal",detail:"Nieuw record: "+gem.toFixed(2)+" (vorig record ooit: "+vensterBestGem.toFixed(2)+")"});
    }

    const tafelKey=p.tafel||"230";
    const vensterTafel=verwerkt.filter(function(w){return w.tafel===tafelKey;});
    const vensterTafelBest=vensterTafel.length?Math.max.apply(null,vensterTafel.map(function(w){return w.gem;})):0;
    if(gem>vensterTafelBest&&vensterTafelBest>0){
      badges.push({label:"Beste partij ooit op deze tafel",emoji:"🏓",aantal:1,punten:40,categorie:"Tafel-specifiek",detail:"Nieuw record op "+tafelLabel(tafelKey)+"-tafel: "+gem.toFixed(2)+" (vorig: "+vensterTafelBest.toFixed(2)+")"});
    }

    if(totaalGemTotDan!==null){
      if(gem>totaalGemTotDan)badges.push({label:"Beter dan je totaalgemiddelde",emoji:"📊",aantal:1,punten:10,categorie:"Vergelijking",detail:"Deze partij: "+gem.toFixed(2)+" vs totaalgemiddelde"+vensterLabel+" "+totaalGemTotDan.toFixed(2)});
    }
    const laatste5=verwerkt.slice(-5);
    if(laatste5.length>=5){
      const rC=laatste5.reduce(function(a,r){return a+r.tot;},0),rN=laatste5.reduce(function(a,r){return a+r.n;},0);
      const rollingGem=rC/rN;
      if(gem>rollingGem)badges.push({label:"Beter dan je 5-partij rolling gemiddelde",emoji:"📉",aantal:1,punten:15,categorie:"Vergelijking",detail:"Deze partij: "+gem.toFixed(2)+" vs 5-partij rolling: "+rollingGem.toFixed(2)});
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
    {label:"Opbouw",emoji:"🎯",punten:"10pt per keer",categorie:"Beurt-pieken",uitleg:"Een beurt van "+d.opbouwMin+"-"+d.opbouwMax+" caramboles"},
    {label:"Sterke serie",emoji:"🔥",punten:"20pt per keer",categorie:"Beurt-pieken",uitleg:"Een beurt van "+d.sterkMin+"-"+d.sterkMax+" caramboles"},
    {label:"Topserie",emoji:"💫",punten:"35pt per keer",categorie:"Beurt-pieken",uitleg:"Een beurt van "+d.topMin+"+ caramboles"},
    {label:"Nieuw record beurt",emoji:"🏆",punten:"50pt",categorie:"Beurt-pieken",uitleg:"Je hoogste beurt ooit verbreken"},
    {label:"Geen poedel hele partij",emoji:"🛡️",punten:"30pt",categorie:"Consistentie",uitleg:"Geen enkele poedel in de hele partij"},
    {label:"Lange reeks zonder poedel",emoji:"⛓️",punten:"25pt",categorie:"Consistentie",uitleg:"8 of meer beurten op rij zonder poedel"},
    {label:"Reeks zonder poedel",emoji:"⛓️",punten:"15pt",categorie:"Consistentie",uitleg:"5 of meer beurten op rij zonder poedel"},
    {label:"Weinig poedels",emoji:"✅",punten:"15pt",categorie:"Consistentie",uitleg:"Minder dan 20% van je beurten was een poedel"},
    {label:"Sterk herstel na poedel",emoji:"💪",punten:"15pt per keer",categorie:"Mentaliteit",uitleg:d.opbouwMin+" of meer caramboles direct na een poedel"},
    {label:"Sterke afsluiting",emoji:"📈",punten:"15pt",categorie:"Mentaliteit",uitleg:"Tweede helft van de partij beter dan de eerste, én partijgemiddelde boven je totaalgemiddelde"},
    {label:"Gemiddelde boven persoonlijke drempel",emoji:"⭐",punten:"15-30pt",categorie:"Doel & totaal",uitleg:"Partijgemiddelde boven een drempel net boven je eigen totaalgemiddelde (schuift automatisch mee)"},
    {label:"Nieuw beste gemiddelde",emoji:"👑",punten:"60pt",categorie:"Doel & totaal",uitleg:"Je hoogste partijgemiddelde ooit verbreken"},
    {label:"Beste partij op deze tafel",emoji:"🏓",punten:"40pt",categorie:"Tafel-specifiek",uitleg:"Nieuw record-gemiddelde specifiek op deze tafelmaat"},
    {label:"Beter dan je totaalgemiddelde",emoji:"📊",punten:"10pt",categorie:"Vergelijking",uitleg:"Partijgemiddelde boven je totaalgemiddelde tot dan toe"},
    {label:"Beter dan je 5-partij rolling gemiddelde",emoji:"📉",punten:"15pt",categorie:"Vergelijking",uitleg:"Partijgemiddelde boven het gemiddelde van je laatste 5 partijen"}
  ];
}

function maandKey(iso){
  const MND=["jan","feb","mrt","apr","mei","jun","jul","aug","sep","okt","nov","dec"];
  const d=new Date(iso);
  return MND[d.getMonth()]+" "+d.getFullYear();
}
function fmtDatum(iso){
  return new Date(iso).toLocaleDateString("nl-NL",{day:"numeric",month:"short"});
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
function berekenNiveauInfo(partijen){
  const discipline=(partijen&&partijen.length>0)?(partijen[0].discipline||"libre"):"libre";
  // nr = partijnummer zoals in Stats en Log (positie binnen deze discipline), id = intern id
  const geldige=(partijen||[]).map(function(p,i){return{p:p,nr:i+1,st:stat(p.beurten,discipline)};}).filter(function(x){return x.st;});
  let car=0,beurt=0;
  geldige.forEach(function(x){car+=x.st.totCar;beurt+=x.st.aantalBeurten;});
  const totaalGemiddelde=beurt>0?car/beurt:0;
  const badgePunten=berekenPrestaties(partijen,null,discipline).reduce(function(a,r){return a+r.punten;},0);

  const aantalDrops=Math.floor(badgePunten/PUNTEN_PER_DROP);
  const gesorteerd=geldige.slice().sort(function(a,b){return parseFloat(a.st.gemPerBeurt)-parseFloat(b.st.gemPerBeurt);});
  const gedropt=gesorteerd.slice(0,aantalDrops);
  const gedropteIds=new Set(gedropt.map(function(x){return x.p.id;}));
  let effCar=car,effBeurt=beurt;
  gedropt.forEach(function(x){effCar-=x.st.totCar;effBeurt-=x.st.aantalBeurten;});
  const effectiefGemiddelde=effBeurt>0?effCar/effBeurt:totaalGemiddelde;

  const gedroptePartijen=gedropt.map(function(x){
    return{id:x.p.id,nr:x.nr,datum:x.p.datum,gem:parseFloat(x.st.gemPerBeurt)};
  });

  const volgendeKandidaat=gesorteerd[aantalDrops]||null;
  const puntenTotVolgendeDrop=PUNTEN_PER_DROP-(badgePunten%PUNTEN_PER_DROP);

  return{totaalGemiddelde:totaalGemiddelde,effectiefGemiddelde:effectiefGemiddelde,badgePunten:badgePunten,
    aantalDrops:aantalDrops,gedropteIds:gedropteIds,gedroptePartijen:gedroptePartijen,
    volgendeKandidaatId:volgendeKandidaat?volgendeKandidaat.p.id:null,
    volgendeKandidaatNr:volgendeKandidaat?volgendeKandidaat.nr:null,
    volgendeKandidaatGem:volgendeKandidaat?parseFloat(volgendeKandidaat.st.gemPerBeurt):null,
    puntenTotVolgendeDrop:puntenTotVolgendeDrop};
}
// Simuleert, uitgaande van je recente vorm (laatste 5 partijen, beurt-gewogen gemiddelde), hoeveel
// partijen je op dat niveau nog nodig hebt om je EFFECTIEVE gemiddelde over de volgende gemiddelde-
// drempel te tillen. Blijft je recente vorm onder die drempel, dan kan het nooit lukken puur op dit
// tempo — dat wordt dan ook zo teruggegeven i.p.v. een oneindig aantal partijen.
function berekenVoorspelling(partijen,discipline){
  const info=berekenNiveauInfo(partijen);
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
    const simInfo=berekenNiveauInfo(simPartijen);
    if(simInfo.effectiefGemiddelde>=huidig.volgende.gemDrempel){
      return{mogelijk:true,recenteVorm:recenteVorm,aantalPartijen:i};
    }
  }
  return{mogelijk:false,recenteVorm:recenteVorm};
}
// Berekent de eindstand van een afgesloten (of lopend) seizoen: elk seizoen wordt behandeld als een
// eigen, verse geschiedenis (badge-punten en records tellen alleen partijen binnen dat seizoen mee).
function berekenSeizoenStats(alleP,seizoen,discipline){
  const gefilterd=(alleP||[]).filter(function(p){
    const t=new Date(p.datum).getTime();
    const vanaf=seizoen.startDatum?new Date(seizoen.startDatum).getTime():-Infinity;
    const tot=seizoen.eindDatum?new Date(seizoen.eindDatum).getTime():Infinity;
    return t>=vanaf&&t<tot;
  });
  const info=berekenNiveauInfo(gefilterd);
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
function gemUitleg(info,dec,periode){
  if(!info.aantalDrops)return"alle partijen tellen mee";
  return"zonder je "+(info.aantalDrops===1?"slechtste partij":info.aantalDrops+" slechtste partijen")+(periode||"")+" (met alle partijen: "+info.totaalGemiddelde.toFixed(dec)+")";
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
