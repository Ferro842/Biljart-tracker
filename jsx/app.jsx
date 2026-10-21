// Ophogen bij elke wijziging: staat onderaan de Stats-tab, zo zie je op de telefoon welke versie geladen is
const APP_VERSIE="2026-10-21.1";

function BiljartTracker(){
  const [data,setData]=useState(null);
  const [tab,setTab]=useState("spelen");
  const [car,setCar]=useState(0);
  const [straf,setStraf]=useState(0); // vierbal: strafpunt in de huidige beurt (speelbal raakte de speelbal van de tegenstander)
  const [inp,setInp]=useState("0");
  const [beurtNr,setBeurtNr]=useState(1);
  const [sel,setSel]=useState(new Set());
  const [andersGemist,setAndersGemist]=useState("");
  const [andersGoed,setAndersGoed]=useState("");
  const [fase,setFase]=useState("setup");
  const [lp,setLp]=useState([]);
  const [doel,setDoel]=useState(25);
  const [doelType,setDoelType]=useState("beurten");
  const [tafel,setTafel]=useState("210");
  const [confPartij,setConfPartij]=useState(false);
  const [seizoenArchiefOpen,setSeizoenArchiefOpen]=useState(false);
  const [onboardingStap,setOnboardingStap]=useState(0);
  // iCloud-back-up (js/opslag.js): opnieuw tekenen als de status of de laatste kopie verandert
  const [,setIcloudTik]=useState(0);
  useEffect(function(){
    const f=function(){setIcloudTik(function(x){return x+1;});};
    ICLOUD.luisteraars.push(f);
    return function(){ICLOUD.luisteraars=ICLOUD.luisteraars.filter(function(g){return g!==f;});};
  },[]);
  const [kaderKiezerOpen,setKaderKiezerOpen]=useState(false);
  const inputRef=useRef(null);
  const [toastGroep,setToastGroep]=useState(null);
  const [niveauOpen,setNiveauOpen]=useState(false);
  const [uitlegOpen,setUitlegOpen]=useState(false); // "Zo werkt de app"
  const [briefjeOpen,setBriefjeOpen]=useState(false); // partij van een wedstrijdbriefje inlezen
  const [verhaalSeizoen,setVerhaalSeizoen]=useState(null); // "Je seizoen in beeld" open voor dit seizoen
  const [doelOpen,setDoelOpen]=useState(false); // doel instellen
  const [menuTijdensSpel,setMenuTijdensSpel]=useState(false); // tijdens een partij: het gewone menu even uitklappen
  const [partijSamenvatting,setPartijSamenvatting]=useState(null);
  const [niveauUpInfo,setNiveauUpInfo]=useState(null);

  // ⭐-drempels gaan altijd over al je eerdere partijen (zoals ook het schrappen in je vorm). De instelling
  // "Tijdvenster voor prestatie-drempels" is vervallen; een oude data.tijdsvenster wordt genegeerd.
  const tijdsvensterMaanden=null;
  const huidigeDiscplineVoorLading=(data&&data.huidigeDiscipline)||"libre";
  // Spelelement (badges, punten, slechtste partijen schrappen); standaard aan, uit = data.spelelement false
  // Weergave voor wie het rustiger en groter wil: eenvoudige modus zet ook het spelelement uit
  const eenvoudig=!!(data&&data.eenvoudig);
  const tekstgrootte=(data&&data.tekstgrootte)||"normaal";
  // Taal (Info → Weergave, ook het eerste welkomstscherm); vóór het tekenen zetten, want t() leest hem
  zetTaal(taalVoorData(data));
  const spelAan=!(data&&data.spelelement===false); // los van de eenvoudige modus
  // Schrappen van je slechtste partijen (alleen met het spelelement aan); uit te zetten in het klasse-overzicht
  const schrappenAan=!(data&&data.schrappen===false);
  const schrapt=spelAan&&schrappenAan;
  // Over hoeveel laatste partijen je vorm (en dus je niveau) gaat: 10, 20, 30 of "alles"; standaard 20
  const vormVenster=(data&&data.vormVenster)||20;

  const alleP=useMemo(function(){
    if(!data)return[];
    return data.partijen.filter(function(p){return(p.discipline||"libre")===huidigeDiscplineVoorLading;});
  },[data,huidigeDiscplineVoorLading]);

  const prestatiesMap=useMemo(function(){
    const arr=berekenPrestaties(alleP,tijdsvensterMaanden,huidigeDiscplineVoorLading);
    const m={};
    arr.forEach(function(r){m[r.id]=r;});
    return m;
  },[alleP,tijdsvensterMaanden]);
  const huidigeRecords=useMemo(function(){
    return berekenLopendeRecords(alleP,tijdsvensterMaanden);
  },[alleP,tijdsvensterMaanden]);
  const niveau=useMemo(function(){
    // Je niveau volgt je vorm: het gemiddelde van je laatste N partijen (instelling vormVenster), met het
    // spelelement aan zonder de slechtste daarvan (max 1 op de 10). Moyenne = alle partijen, officieel.
    const opties=vormOpties(vormVenster);
    const info=berekenVorm(alleP,schrapt,vormVenster);
    const voorspelling=berekenVoorspelling(alleP,huidigeDiscplineVoorLading,!schrapt,opties);
    return Object.assign({},bepaalNiveau(info.effectiefGemiddelde,huidigeDiscplineVoorLading),info,{voorspelling:voorspelling,schrapt:schrapt});
  },[alleP,huidigeDiscplineVoorLading,schrapt,vormVenster]);
  // Je doel (Spelen → ring): het beginpunt wordt steeds opnieuw berekend met dezelfde vorm-instelling als je vorm nu,
  // over de partijen van vóór het instellen. Anders vergelijkt de ring bijv. een vorm over 10 partijen met een begin
  // over al je partijen, en springt het percentage mee met de instelling. Oude doelen zonder "gezet": bewaarde start.
  const mijnDoel=useMemo(function(){
    const d=data&&data.doelen&&data.doelen[huidigeDiscplineVoorLading];
    if(!d||!d.gezet)return d||null;
    const grens=new Date(d.gezet).getTime();
    const voor=alleP.filter(function(p){return new Date(p.datum).getTime()<grens;});
    if(!voor.length)return d;
    const info=berekenVorm(voor,schrapt,vormVenster);
    return Object.assign({},d,{start:info.effectiefGemiddelde});
  },[data,alleP,huidigeDiscplineVoorLading,schrapt,vormVenster]);

  useEffect(function(){
    if(!data)return;
    if(data.laatstGezienNiveauIndex===undefined){
      const nd=Object.assign({},data,{laatstGezienNiveauIndex:niveau.index});
      setData(nd);slaOp(nd);
      return;
    }
    if(niveau.index>data.laatstGezienNiveauIndex){
      const niveaus=(DISCIPLINES[huidigeDiscplineVoorLading]||DISCIPLINES.libre).niveaus;
      setNiveauUpInfo({van:niveaus[data.laatstGezienNiveauIndex],naar:niveau.huidig});
      const nd=Object.assign({},data,{laatstGezienNiveauIndex:niveau.index});
      setData(nd);slaOp(nd);
    }
  },[niveau.index]);

  // Bij het laden een onderbroken partij terugzetten (bijv. als de app tijdens het spelen werd gesloten)
  useEffect(function(){laadData().then(function(d){
    setData(d);
    const lo=d.lopendePartij;
    if(lo&&Array.isArray(lo.beurten)&&lo.beurten.length>0){
      setLp(lo.beurten);setBeurtNr(lo.beurten.length+1);
      if(lo.tafel)setTafel(lo.tafel);
      if(lo.doel)setDoel(lo.doel);
      if(lo.doelType)setDoelType(lo.doelType);
    }
  });},[]);
  // De lopende partij staat in het optionele veld data.lopendePartij, zodat die een herstart overleeft.
  // Alleen opslaan als er echt iets veranderd is; zonder lopende partij verdwijnt het veld weer.
  useEffect(function(){
    if(!data)return;
    const lopend=lp.length>0?{beurten:lp,tafel:tafel,doel:doel,doelType:doelType}:null;
    if(JSON.stringify(data.lopendePartij||null)===JSON.stringify(lopend))return;
    const nd=Object.assign({},data);
    if(lopend)nd.lopendePartij=lopend;else delete nd.lopendePartij;
    setData(nd);slaOp(nd);
  },[data,lp,tafel,doel,doelType]);
  // Laken-kleur van de gekozen discipline (vóór het tekenen, dus zonder groene flits); met het kader-keuzemenu
  // open al rood, bij annuleren weer terug
  const themaDiscipline=kaderKiezerOpen?"kader":huidigeDiscplineVoorLading;
  React.useLayoutEffect(function(){zetThema(themaDiscipline);},[themaDiscipline]);
  // Animaties en vieringen uit (Info → Weergave): klasse "rustig" op <html>
  const animatiesAan=!(data&&data.animaties===false);
  useEffect(function(){document.documentElement.classList.toggle("rustig",!animatiesAan);},[animatiesAan]);
  useEffect(function(){setMenuTijdensSpel(false);},[tab,fase]);
  useEffect(function(){vraagBlijvendeOpslag();},[]);
  if(!data)return <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",color:GOUD,fontSize:18,background:G}}>Laden...</div>;

  const huidigeDiscipline=huidigeDiscplineVoorLading;
  const stL=stat(lp,huidigeDiscipline);
  // Partijscore: caramboles min strafpunten (vierbal); gemiddelde en niveau gaan over de caramboles zelf
  const totCarLp=lp.reduce(function(a,b){return a+b.caramboles-(b.straf||0);},0);
  const voortgang=doelType==="beurten"?lp.length:totCarLp;
  const progPct=Math.min(100,Math.round(voortgang/doel*100));

  function toggle(key){setSel(function(prev){const n=new Set(prev);n.has(key)?n.delete(key):n.add(key);return n;});}

  function toonToast(items){
    if(items&&items.length)setToastGroep(items);
  }

  function checkLiveBadges(lpVoor,car){
    const dLive=beurtDrempels(huidigeDiscipline);
    const items=[];
    if(car>=dLive.opbouwMin&&car<=dLive.opbouwMax)items.push({emoji:"🎯",label:"Opbouw",punten:10,categorie:"Beurt-pieken"});
    else if(car>=dLive.sterkMin&&car<=dLive.sterkMax)items.push({emoji:"🔥",label:"Sterke serie",punten:20,categorie:"Beurt-pieken"});
    else if(car>=dLive.topMin)items.push({emoji:"💫",label:"Topserie",punten:35,categorie:"Beurt-pieken"});

    const maxInPartijVoor=lpVoor.length?Math.max.apply(null,lpVoor.map(function(x){return x.caramboles;})):0;
    if(car>huidigeRecords.allTimeMaxBeurt&&huidigeRecords.allTimeMaxBeurt>0&&car>maxInPartijVoor){
      items.push({emoji:"🏆",label:"Nieuw record beurt!",punten:50,categorie:"Beurt-pieken"});
    }

    if(lpVoor.length>0&&lpVoor[lpVoor.length-1].caramboles===0&&car>=dLive.opbouwMin){
      items.push({emoji:"💪",label:"Sterk herstel na poedel",punten:15,categorie:"Mentaliteit"});
    }

    let vorigeStreak=0;
    for(let i=lpVoor.length-1;i>=0;i--){
      if(lpVoor[i].caramboles>0)vorigeStreak++;
      else break;
    }
    const nieuweStreak=car>0?vorigeStreak+1:0;
    if(nieuweStreak===5)items.push({emoji:"⛓️",label:"Reeks zonder poedel",punten:15,categorie:"Consistentie"});
    if(nieuweStreak===8)items.push({emoji:"⛓️",label:"Lange reeks zonder poedel",punten:25,categorie:"Consistentie"});

    return items;
  }

  function noteer(){
    const gemist=Array.from(sel).filter(function(k){return k.startsWith("G__");}).map(function(k){return k.replace("G__","");});
    const goed=Array.from(sel).filter(function(k){return k.startsWith("P__");}).map(function(k){return k.replace("P__","");});
    if(andersGemist.trim())gemist.push(andersGemist.trim());
    if(andersGoed.trim())goed.push(andersGoed.trim());
    const b={id:data.huidigeId,caramboles:car,gemist:gemist,goed:goed,tijd:new Date().toISOString()};
    if(straf>0&&huidigeDiscipline==="vierbal")b.straf=straf;
    const nd=Object.assign({},data,{huidigeId:data.huidigeId+1});
    setData(nd);slaOp(nd);
    if(spelAan)toonToast(checkLiveBadges(lp,car));
    // Vieren: nieuw record (hoogste serie ooit) of een topserie
    const dV=beurtDrempels(huidigeDiscipline),recordVoor=Math.max(huidigeRecords.allTimeMaxBeurt||0,lp.reduce(function(m,x){return Math.max(m,x.caramboles);},0));
    if(car>recordVoor&&recordVoor>0)vier({tekst:"🏆 "+t("Record: serie van {n}!",{n:car}),sub:t("Je hoogste serie ooit")});
    else if(car>=dV.topMin)vier({tekst:"🔥 "+t("Serie van {n}!",{n:car})});
    setLp(function(p){return p.concat([b]);});
    setCar(0);setStraf(0);setInp("0");setBeurtNr(function(n){return n+1;});setSel(new Set());setAndersGemist("");setAndersGoed("");setFase("invoer");
  }

  // Slaat een complete partij op (ook een ingelezen wedstrijdbriefje): op datumvolgorde tussen de partijen, met
  // prestaties, niveau en de samenvatting. Partijen moeten op datum staan: vorm, nummers en grafieken gaan daarvan uit.
  function bewaarPartij(p,opties){
    const pos=data.partijen.findIndex(function(x){return new Date(x.datum)>new Date(p.datum);});
    const nieuwePartijen=pos===-1?data.partijen.concat([p]):data.partijen.slice(0,pos).concat([p],data.partijen.slice(pos));
    const disc=p.discipline||"libre";
    const nieuweAlleP=nieuwePartijen.filter(function(x){return(x.discipline||"libre")===disc;});
    const resultaten=berekenPrestaties(nieuweAlleP,tijdsvensterMaanden,disc);
    const prestatie=resultaten.find(function(r){return r.id===p.id;});
    const infoVoor=berekenVorm(alleP,schrapt,vormVenster);
    const infoNa=berekenVorm(nieuweAlleP,schrapt,vormVenster);
    const nieuweDrop=spelAan&&infoNa.aantalDrops>infoVoor.aantalDrops?infoNa.gedroptePartijen[infoNa.gedroptePartijen.length-1]:null;
    const niveauVoor=bepaalNiveau(infoVoor.effectiefGemiddelde,disc);
    const niveauNa=bepaalNiveau(infoNa.effectiefGemiddelde,disc);
    const niveauOmhoog=niveauNa.index>niveauVoor.index?{van:niveauVoor.huidig,naar:niveauNa.huidig}:null;
    const nd=Object.assign({},data,{partijen:nieuwePartijen,huidigeId:Math.max(data.huidigeId,p.id)+1,laatstGezienNiveauIndex:niveauNa.index});
    // Doel gehaald? Dan markeren en vieren
    const doelNu=data.doelen&&data.doelen[disc];
    const doelGehaald=doelNu&&!doelNu.gehaald&&infoNa.effectiefGemiddelde>=doelNu.waarde;
    if(doelGehaald)nd.doelen=Object.assign({},data.doelen,{[disc]:Object.assign({},doelNu,{gehaald:true,gehaaldOp:new Date().toISOString()})});
    const besteOoit=prestatie&&prestatie.badges&&prestatie.badges.some(function(b){return b.label==="Nieuw beste gemiddelde ooit";});
    if(doelGehaald)vier({tekst:"🎯 "+t("Doel gehaald!"),sub:t("Je vorm is nu {v}",{v:getalTekst(infoNa.effectiefGemiddelde,disc==="driebanden"?3:2)})});
    else if(niveauOmhoog)vier({tekst:"🎉 "+niveauOmhoog.naar.naam+"!",sub:t("Je bent een klasse omhoog")});
    else if(besteOoit)vier({tekst:"👑 "+t("Beste partij ooit!")});
    if(opties&&opties.lopendeWeg)delete nd.lopendePartij; // in dezelfde opslag weg, zodat de partij nooit dubbel terugkomt
    // Goed moment voor een beoordeling (alleen in de app; zie beoordelingMoment in js/opslag.js): na de viering en samenvatting
    const beurtRecord=prestatie&&prestatie.badges&&prestatie.badges.some(function(b){return b.label==="Nieuw record beurt";});
    if(beoordelingMoment(nd,doelGehaald||niveauOmhoog||besteOoit||beurtRecord)){
      nd.beoordelingGevraagd=(nd.beoordelingGevraagd||[]).concat([new Date().toISOString()]);
      setTimeout(vraagBeoordeling,4000);
    }
    setData(nd);slaOp(nd);
    setPartijSamenvatting({partij:p,st:stat(p.beurten,disc),prestatie:prestatie,infoNa:infoNa,nieuweDrop:nieuweDrop,niveauOmhoog:niveauOmhoog});
  }

  function sluit(){
    if(!lp.length){setConfPartij(false);return;}
    const st=stat(lp,huidigeDiscipline);
    const p=Object.assign({id:data.huidigeId,datum:new Date().toISOString(),tafel:tafel,doel:doel,doelType:doelType,discipline:huidigeDiscipline,beurten:lp},st);
    bewaarPartij(p,{lopendeWeg:true});
    setLp([]);setBeurtNr(1);setCar(0);setStraf(0);setInp("0");setSel(new Set());
    setConfPartij(false);setFase("setup");
  }

  // Wedstrijdbriefje (📷 op Spelen): beurten met nieuwe ids, met de opmerkingen uit het controlescherm (incl. acquit)
  function bewaarBriefje(inv){
    let id=data.huidigeId;
    // Ook een kaal getal per beurt (oudere versie van het controlescherm) wordt goed verwerkt
    const beurten=inv.beurten.map(function(b){
      const o=typeof b==="object"&&b!==null?b:{car:b};
      return{id:id++,caramboles:Math.max(0,parseInt(o.car,10)||0),gemist:o.gemist||[],goed:o.goed||[],tijd:inv.datum};
    });
    const st=stat(beurten,huidigeDiscipline);
    const p=Object.assign({id:id,datum:inv.datum,tafel:inv.tafel,doel:inv.doel,doelType:inv.doelType,discipline:huidigeDiscipline,beurten:beurten,bron:"briefje"},st);
    bewaarPartij(p);
    setBriefjeOpen(false);
  }

  function resetAlles(){
    const overigeDisciplines=data.partijen.filter(function(p){return(p.discipline||"libre")!==huidigeDiscipline;});
    const nd=Object.assign({},data,{partijen:overigeDisciplines});
    setData(nd);slaOp(nd);setLp([]);setBeurtNr(1);setCar(0);setStraf(0);setInp("0");
    setSel(new Set());setFase("setup");
  }

  // Vervangt alle data in één keer (bijv. na importeren van een back-up) en slaat op
  function vervangData(nd){
    setData(nd);slaOp(nd);
  }

  function verwijderPartij(id){
    const nd=Object.assign({},data,{partijen:data.partijen.filter(function(p){return p.id!==id;})});
    setData(nd);slaOp(nd);
  }

  // Opmerkingen van een opgeslagen partij achteraf aanvullen (✎ in Log/Stats); alleen gemist/goed per beurt verandert
  function slaOpmerkingenOp(id,beurten){
    const nd=Object.assign({},data,{partijen:data.partijen.map(function(p){
      if(p.id!==id)return p;
      return Object.assign({},p,{beurten:p.beurten.map(function(b,i){
        const n=beurten[i];return n?Object.assign({},b,{gemist:n.gemist.slice(),goed:n.goed.slice()}):b;
      })});
    })});
    setData(nd);slaOp(nd);
  }
  function slaNotitieOp(id,tekst){
    const nd=Object.assign({},data,{partijen:data.partijen.map(function(p){
      return p.id===id?Object.assign({},p,{notitie:tekst}):p;
    })});
    setData(nd);slaOp(nd);
  }


  function wisselDiscipline(d){
    const nd=Object.assign({},data,{huidigeDiscipline:d});
    setData(nd);slaOp(nd);
  }

  // Spelelement aan/uit. Het niveau verandert mee (met of zonder geschrapte partijen); dat nieuwe niveau
  // geldt meteen als "gezien", zodat er geen onterechte "Niveau omhoog!" verschijnt.
  function setSpelelement(aan){
    const info=berekenVorm(alleP,aan&&schrappenAan,vormVenster);
    const idx=bepaalNiveau(info.effectiefGemiddelde,huidigeDiscipline).index;
    const nd=Object.assign({},data,{spelelement:aan,laatstGezienNiveauIndex:idx});
    setData(nd);slaOp(nd);
  }
  // Schrappen aan/uit (klasse-overzicht); ook hier geen onterechte "Niveau omhoog!"
  function setSchrappen(aan){
    const info=berekenVorm(alleP,spelAan&&aan,vormVenster);
    const idx=bepaalNiveau(info.effectiefGemiddelde,huidigeDiscipline).index;
    const nd=Object.assign({},data,{schrappen:aan,laatstGezienNiveauIndex:idx});
    setData(nd);slaOp(nd);
  }
  // Vorm-venster kiezen (10, 20, 30 of "alles"); ook hier geen onterechte "Niveau omhoog!"
  function setVormVenster(v){
    const info=berekenVorm(alleP,schrapt,v);
    const idx=bepaalNiveau(info.effectiefGemiddelde,huidigeDiscipline).index;
    const nd=Object.assign({},data,{vormVenster:v,laatstGezienNiveauIndex:idx});
    setData(nd);slaOp(nd);
  }

  // Weergave (tekstgrootte, eenvoudige modus); raakt je niveau niet
  function setWeergave(veld,waarde){
    const extra={};extra[veld]=waarde;
    const nd=Object.assign({},data,extra);
    setData(nd);slaOp(nd);
  }

  // Eenmalige melding voor wie de welkomstschermen al eerder zag: je kunt grotere letters of een eenvoudige
  // weergave kiezen (nieuwe gebruikers kiezen dat in het eerste welkomstscherm)
  // Back-upherinnering (js/opslag.js): kaartje bovenaan Spelen; Exporteer in Info telt ook als back-up
  const backupHerinnering=data?backupNodig(data):null;
  function backupGemaakt(){
    const nd=Object.assign({},data,{laatsteBackup:new Date().toISOString(),laatsteBackupAantal:(data.partijen||[]).length});
    delete nd.backupLaterTot;
    setData(nd);slaOp(nd);
  }
  async function maakBackupNu(){if(await maakBackupBestand(data))backupGemaakt();}
  function backupLater(){
    const nd=Object.assign({},data,{backupLaterTot:new Date(Date.now()+7*86400000).toISOString()});
    setData(nd);slaOp(nd);
  }
  const weergaveTip=!!(data&&data.onboardingGezien&&!data.weergaveTipGezien);
  function zieWeergaveTip(bekijken){
    const nd=Object.assign({},data,{weergaveTipGezien:true});
    setData(nd);slaOp(nd);
    if(bekijken)setTab("info");
  }

  // Doel per discipline (null = weg); de ring staat bovenaan Spelen
  function zetMijnDoel(doel){
    const doelen=Object.assign({},data.doelen||{});
    if(doel)doelen[huidigeDiscipline]=doel;else delete doelen[huidigeDiscipline];
    const nd=Object.assign({},data,{doelen:doelen});
    setData(nd);slaOp(nd);setDoelOpen(false);
  }

  function sluitOnboarding(){
    const nd=Object.assign({},data,{onboardingGezien:true,weergaveTipGezien:true});
    setData(nd);slaOp(nd);
  }

  // Huidig seizoen afsluiten; het nieuwe seizoen begint op `vanaf` (ISO, standaard nu). Zo kun je ook een grens
  // in het verleden leggen (bijv. per ongeluk samengevoegd, of later bedacht).
  function seizoenAfsluiten(vanaf){
    const huidigeSeizoenen=data.seizoenen||[{id:1,naam:"Seizoen 1",startDatum:null,eindDatum:null}];
    const nu=vanaf||new Date().toISOString();
    const bijgewerkt=huidigeSeizoenen.map(function(s){
      return s.eindDatum===null?Object.assign({},s,{eindDatum:nu}):s;
    });
    const nieuwId=Math.max.apply(null,huidigeSeizoenen.map(function(s){return s.id;}))+1;
    bijgewerkt.push({id:nieuwId,naam:"Seizoen "+nieuwId,startDatum:nu,eindDatum:null});
    const nd=Object.assign({},data,{seizoenen:bijgewerkt});
    setData(nd);slaOp(nd);
    // Meteen het afgesloten seizoen in beeld
    setVerhaalSeizoen(bijgewerkt[bijgewerkt.length-2]);
  }

  function seizoensplitsingOngedaanMaken(){
    const huidigeSeizoenen=data.seizoenen||[{id:1,naam:"Seizoen 1",startDatum:null,eindDatum:null}];
    if(huidigeSeizoenen.length<2)return;
    const zonderLaatste=huidigeSeizoenen.slice(0,-1);
    const bijgewerkt=zonderLaatste.map(function(s,i){
      return i===zonderLaatste.length-1?Object.assign({},s,{eindDatum:null}):s;
    });
    const nd=Object.assign({},data,{seizoenen:bijgewerkt});
    setData(nd);slaOp(nd);
  }

  // Alles wat de Spelen-schermen (jsx/spelen.jsx) nodig hebben
  const spel={alleP,andersGemist,andersGoed,beurtNr,car,straf,setStraf,doel,doelType,huidigeDiscipline,huidigeRecords,inp,inputRef,lp,niveau,noteer,eenvoudig,progPct,sel,setAndersGemist,setAndersGoed,setBeurtNr,setCar,setConfPartij,setDoel,setDoelType,setFase,setInp,setLp,setNiveauOpen,setSel,setTafel,setUitlegOpen,setBriefjeOpen,stL,weergaveTip,zieWeergaveTip,backupHerinnering,maakBackupNu,backupLater,tafel,tijdsvensterMaanden,toggle,totCarLp};

  // Naam in een segment: een onzichtbare vette kopie houdt de breedte vast, zodat er bij wisselen niets verspringt
  const segmentTekst=function(naam){
    return <span className="seg-tekst" data-tekst={naam}>{naam}</span>; // vette kopie via CSS ::after (css/app.css)
  };
  // Disciplinekeuze: segment in de keuzebalk (gekozen = gouden rand, lichte verhoging)
  const groot=tekstgrootte!=="normaal";
  // Met vierbal erbij vijf knoppen: iets smaller, anders past de balk niet op een smalle telefoon
  const vijfKnoppen=hoofdDisciplines(data,huidigeDiscipline).length>HOOFDDISCIPLINES.length;
  const segment=function(actief){
    // Breedte volgt de naam (flex auto), zodat een vetgedrukte gekozen naam als "Driebanden" nooit wordt afgekort
    return{flex:groot?1:"1 1 auto",padding:groot?"6px 4px":vijfKnoppen?"8px 2px":"8px 6px",border:"none",borderRadius:9,cursor:"pointer",fontFamily:"inherit",
      fontSize:groot?13:vijfKnoppen?12:13.5,letterSpacing:0.2,whiteSpace:"nowrap",
      background:actief?"linear-gradient(180deg,var(--c-2d4a1e),var(--c-1e3a1e))":"transparent",
      color:actief?GOUD:WITD,fontWeight:actief?"bold":"normal",
      boxShadow:actief?"inset 0 0 0 1px "+GOUD+", 0 2px 6px rgba(0,0,0,0.35)":"none",
      transition:"background 160ms ease, color 160ms ease, box-shadow 160ms ease"};
  };
  // Kop (logo, klasse, disciplines) en tabbalk. Staan bovenaan in het scrollvak van elk tabblad (via KopContext), zodat
  // de kop gewoon met je vinger meeschuift en vanzelf terugkomt als je weer bovenaan bent; de tabbalk blijft plakken
  // (sticky), met daaronder eventueel een eigen rij van het tabblad (extra, bijv. de Dash-tabs). Tijdens een partij
  // staat alles vast bovenaan (Afsluiten moet altijd bereikbaar zijn). rand: zijpadding van het scrollvak (negatief
  // teruggezet), onder: ruimte onder de tabbalk, gap: flex-gap van het vak (geen strook tussen kop en tabbalk).
  const inSpel=tab==="spelen"&&fase!=="setup";
  const kopBlok=function(opties){
    const o=opties||{},zij=o.rand?{marginLeft:-o.rand,marginRight:-o.rand}:null;
    return(
      <React.Fragment>
        <div data-kop="" style={Object.assign({flexShrink:0,marginBottom:-(o.gap||0)},zij)}>
          <div style={{background:"linear-gradient(135deg,var(--c-0d1f0d),var(--c-1a2e1a))",borderBottom:"2px solid "+GOUD,padding:"9px 14px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,flex:1,minWidth:0}}>
              <Logo maat={44}/>
              <div style={{minWidth:0}}>
                <div style={{fontSize:16,fontWeight:"bold",color:GOUD,letterSpacing:1}}>Carom Tracker</div>
                {/* Bij grotere tekst is er geen ruimte voor de ondertitel */}
                {tekstgrootte==="normaal"&&<div style={{fontSize:12,color:WITD,letterSpacing:2,textTransform:"uppercase"}}>{t("Carambole - Series")}</div>}
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
              {/* Bij grotere tekst tijdens een partij wijkt de klasse voor de knop Afsluiten */}
              {!(tekstgrootte!=="normaal"&&fase!=="setup"&&lp.length>0)&&<button onClick={function(){setNiveauOpen(true);}} style={{display:"flex",alignItems:"center",gap:4,background:"rgba(0,0,0,0.25)",border:"1px solid "+niveau.huidig.kleur,borderRadius:20,padding:"4px 10px 4px 6px",cursor:"pointer",fontFamily:"inherit"}}>
                <span style={{fontSize:14}}>{niveau.huidig.emoji}</span>
                <span style={{fontSize:13,fontWeight:"bold",color:niveau.huidig.kleur}}>{niveau.huidig.naam}</span>
              </button>}
              {fase!=="setup"&&lp.length>0&&(
                <button style={{background:"none",border:"1px solid "+KBDR,borderRadius:8,color:WITD,padding:"5px 10px",fontSize:13,cursor:"pointer",fontFamily:"inherit"}}
                  onClick={function(){setConfPartij(true);}}>{t("Afsluiten")}</button>
              )}
            </div>
          </div>
              {/* Disciplines als één afgeronde keuzebalk (segmenten). Normaal één rij met ruimte; bij grotere tekst twee
                  compacte rijen van twee, anders worden de namen te krap. */}
              <div style={{padding:groot?"6px 10px 7px":"9px 12px 10px",background:"var(--c-152015)",borderBottom:"1px solid "+KBDR}}>
                <div style={Object.assign({gap:3,padding:3,background:"rgba(0,0,0,0.28)",border:"1px solid "+KBDR,borderRadius:12},
                  groot?{display:"grid",gridTemplateColumns:"1fr 1fr"}:{display:"flex"})}>
                  {hoofdDisciplines(data,huidigeDiscipline).map(function(d){
                    const actief=huidigeDiscipline===d&&!kaderKiezerOpen; // met het kader-menu open staat Kader al aan
                    return <button key={d} className="seg-knop" onClick={function(){wisselDiscipline(d);}} style={segment(actief)}>{segmentTekst(kortNaam(d))}</button>;
                  })}
                  {(function(){
                    const kaderGekozen=KADER_VARIANTEN.indexOf(huidigeDiscipline)!==-1;
                    return <button className="seg-knop" onClick={function(){setKaderKiezerOpen(true);}} style={segment(kaderGekozen||kaderKiezerOpen)}>
                      {segmentTekst(kaderGekozen?kortNaam(huidigeDiscipline):t("Kader"))}
                    </button>;
                  })()}
                </div>
              </div>
        </div>
        <div data-tabbalk="" style={Object.assign({position:"sticky",top:0,zIndex:4,flexShrink:0,marginBottom:o.onder||0},zij)}>
        <div style={{display:"flex",borderBottom:"1px solid "+KBDR,background:"var(--c-152015)",flexShrink:0}}>
          {[["spelen",t("Spelen")],["stats",t("Stats")],["dash",t("Dash")],["log",t("Log")],["info",t("Info")]].map(function(arr){
            return <button key={arr[0]} style={{flex:1,padding:"11px 0",background:tab===arr[0]?"var(--c-1c2c1c)":"none",border:"none",color:tab===arr[0]?GOUD:WITD,fontSize:14,cursor:"pointer",fontFamily:"inherit",borderBottom:tab===arr[0]?"2px solid "+GOUD:"2px solid transparent"}}
              onClick={function(){setTab(arr[0]);}}>{arr[1]}</button>;
          })}
        </div>
          {o.extra}
        </div>
      </React.Fragment>
    );
  };

  return(
    <OpmerkingenContext.Provider value={slaOpmerkingenOp}>
    <KopContext.Provider value={inSpel?null:kopBlok}>
    <SpelContext.Provider value={spelAan}>
    <EenvoudigContext.Provider value={eenvoudig}>
    <div className="app" style={tekstZoom(tekstgrootte)!==1?{zoom:tekstZoom(tekstgrootte),"--zoom":tekstZoom(tekstgrootte),height:"calc(100vh / "+tekstZoom(tekstgrootte)+")"}:null}>
      {/* Kop en tabbalk: tijdens een partij vast bovenaan; anders bovenaan in het scrollvak van elk tabblad (KopContext) */}
      {/* Tijdens een partij alleen een smalle balk (meer ruimte voor invoer en opmerkingen); ☰ Menu klapt het gewone
          menu uit. In de opmerkingen-stappen helemaal niets: daar ben je alleen met die stap bezig. */}
      {inSpel&&menuTijdensSpel&&kopBlok()}
      {inSpel&&fase==="invoer"&&(
        <div data-spelbalk="" style={{display:"flex",alignItems:"center",gap:8,padding:"7px 12px",background:"var(--c-152015)",borderBottom:"1px solid "+KBDR,flexShrink:0}}>
          <div style={{flex:1,minWidth:0,fontSize:14,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
            <span style={{color:GOUD,fontWeight:"bold"}}>{DISCIPLINES[huidigeDiscipline].naam}</span>
            <span style={{color:WITD}}> · {tafelLabel(tafel)}</span>
          </div>
          <button onClick={function(){setMenuTijdensSpel(function(v){return !v;});}}
            style={{background:"none",border:"1px solid "+KBDR,borderRadius:8,color:WITD,padding:"5px 10px",fontSize:13,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>
            {menuTijdensSpel?"✕ "+t("Menu"):"☰ "+t("Menu")}
          </button>
          {lp.length>0&&<button onClick={function(){setConfPartij(true);}}
            style={{background:"none",border:"1px solid "+GOUD,borderRadius:8,color:GOUD,padding:"5px 10px",fontSize:13,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>{t("Afsluiten")}</button>}
        </div>
      )}

      {!data.onboardingGezien&&<WelkomstFlow stap={onboardingStap} setStap={setOnboardingStap} discipline={huidigeDiscipline} wisselDiscipline={wisselDiscipline} onKlaar={sluitOnboarding}
        tekstgrootte={tekstgrootte} eenvoudig={eenvoudig} setWeergave={setWeergave}/>}

      <VieringLaag aan={data.animaties!==false}/>
      {verhaalSeizoen&&<SeizoenVerhaal seizoen={verhaalSeizoen} alleP={alleP} discipline={huidigeDiscipline} onClose={function(){setVerhaalSeizoen(null);}}/>}
      {doelOpen&&<DoelInstellen doel={(data.doelen||{})[huidigeDiscipline]||null} vorm={niveau.effectiefGemiddelde} discipline={huidigeDiscipline}
        onOpslaan={zetMijnDoel} onVerwijder={function(){zetMijnDoel(null);}} onClose={function(){setDoelOpen(false);}}/>}
      {briefjeOpen&&<BriefjeImport discipline={huidigeDiscipline} tafelStandaard={tafel} onOpslaan={bewaarBriefje} onClose={function(){setBriefjeOpen(false);}}/>}
      {uitlegOpen&&<UitlegVenster eenvoudig={eenvoudig} onClose={function(){setUitlegOpen(false);}}/>}

      {niveauOpen&&<NiveauOverzicht niveau={niveau} discipline={huidigeDiscipline} onClose={function(){setNiveauOpen(false);}}
        mijnDoel={mijnDoel} openDoel={function(){setDoelOpen(true);}} vormVenster={vormVenster} setVormVenster={setVormVenster}
        schrappen={spelAan?schrappenAan:null} setSchrappen={setSchrappen}/>}

      {seizoenArchiefOpen&&<SeizoenArchief seizoenen={data.seizoenen||[{id:1,naam:"Seizoen 1",startDatum:null,eindDatum:null}]} alleP={alleP} discipline={huidigeDiscipline} onClose={function(){setSeizoenArchiefOpen(false);}}
        onOngedaan={function(){seizoensplitsingOngedaanMaken();setSeizoenArchiefOpen(false);}}
        onVerhaal={function(s){setSeizoenArchiefOpen(false);setVerhaalSeizoen(s);}}/>}

      {partijSamenvatting&&<PartijSamenvatting partij={partijSamenvatting.partij} st={partijSamenvatting.st} prestatie={partijSamenvatting.prestatie} infoNa={partijSamenvatting.infoNa} nieuweDrop={partijSamenvatting.nieuweDrop} niveauOmhoog={partijSamenvatting.niveauOmhoog} discipline={huidigeDiscipline} onClose={function(){setPartijSamenvatting(null);}}/>}

      {niveauUpInfo&&(
        <div onClick={function(){setNiveauUpInfo(null);}}
          style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.85)",zIndex:210,display:"flex",alignItems:"center",justifyContent:"center",padding:20,cursor:"pointer"}}>
          <div style={{background:"linear-gradient(160deg,var(--c-2a4a1e),var(--c-0d1f0d))",border:"3px solid "+niveauUpInfo.naar.kleur,borderRadius:22,padding:"28px 22px",maxWidth:360,width:"100%",textAlign:"center",boxShadow:"0 0 60px "+niveauUpInfo.naar.kleur+"66, 0 10px 44px rgba(0,0,0,0.7)",animation:"badgePopIn 0.5s cubic-bezier(0.34,1.56,0.64,1)"}}>
            <div style={{fontSize:15,color:WITD,textTransform:"uppercase",letterSpacing:3,marginBottom:10}}>{t("Niveau omhoog!")}</div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:14,marginBottom:14}}>
              <div style={{textAlign:"center",opacity:0.5}}>
                <div style={{fontSize:30}}>{niveauUpInfo.van.emoji}</div>
                <div style={{fontSize:13,color:WITD}}>{niveauUpInfo.van.naam}</div>
              </div>
              <div style={{fontSize:22,color:niveauUpInfo.naar.kleur}}>→</div>
              <div style={{textAlign:"center"}}>
                <div style={{width:64,height:64,borderRadius:"50%",background:"radial-gradient(circle at 35% 30%,"+niveauUpInfo.naar.kleur+"ee,"+niveauUpInfo.naar.kleur+"55)",border:"3px solid "+niveauUpInfo.naar.kleur,display:"flex",alignItems:"center",justifyContent:"center",fontSize:34,boxShadow:"0 0 22px "+niveauUpInfo.naar.kleur+"aa",margin:"0 auto 6px"}}>
                  {niveauUpInfo.naar.emoji}
                </div>
                <div style={{fontSize:14,fontWeight:"bold",color:niveauUpInfo.naar.kleur}}>{niveauUpInfo.naar.naam}</div>
              </div>
            </div>
            <div style={{fontSize:13,color:WITD,opacity:0.85}}>{t("Je vorm heeft de {d}-drempel gehaald",{d:getalTekst(niveauUpInfo.naar.gemDrempel,1)})}</div>
            <div style={{fontSize:13,color:WITD,marginTop:16,opacity:0.7}}>{t("Tik om te sluiten")}</div>
          </div>
        </div>
      )}

      {toastGroep&&(
        <div onClick={function(){setToastGroep(null);}}
          style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.75)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20,cursor:"pointer"}}>
          <div style={{background:"linear-gradient(160deg,var(--c-1e3a1e),var(--c-0d1f0d))",border:"2px solid "+GOUD,borderRadius:20,padding:"24px 20px 18px",maxWidth:360,width:"100%",textAlign:"center",boxShadow:"0 10px 44px rgba(0,0,0,0.6)",animation:"badgePopIn 0.4s cubic-bezier(0.34,1.56,0.64,1)"}}>
            <div style={{fontSize:14,color:WITD,textTransform:"uppercase",letterSpacing:2,marginBottom:4}}>{t("Prestatie behaald!")}</div>
            <div style={{fontSize:36,fontWeight:"bold",color:GOUD,marginBottom:18,textShadow:"0 0 20px rgba(201,168,76,0.5)"}}>+{toastGroep.reduce(function(a,b){return a+b.punten;},0)}pt</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:14,justifyContent:"center"}}>
              {toastGroep.map(function(b,i){
                const kleur=categorieKleur(b.categorie);
                return(
                  <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",width:88}}>
                    <div style={{width:66,height:66,borderRadius:"50%",background:"radial-gradient(circle at 35% 30%,"+kleur+"dd,"+kleur+"44)",border:"3px solid "+kleur,display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,boxShadow:"0 0 18px "+kleur+"99",marginBottom:6}}>
                      {b.emoji}
                    </div>
                    <div style={{fontSize:13,color:WIT,fontWeight:"bold",lineHeight:1.25}}>{badgeLabel(b.label)}</div>
                    <div style={{fontSize:14,color:kleur,fontWeight:"bold"}}>+{b.punten}</div>
                  </div>
                );
              })}
            </div>
            <div style={{fontSize:13,color:WITD,marginTop:20,opacity:0.7}}>{t("Tik om te sluiten")}</div>
          </div>
        </div>
      )}

      {confPartij&&(
        <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:20}}>
          <div style={{background:"var(--c-1a2e1a)",border:"2px solid "+GOUD,borderRadius:14,padding:24,maxWidth:320,width:"100%"}}>
            <div style={{fontSize:15,color:WIT,marginBottom:6,textAlign:"center"}}>{t("Partij opslaan?")}</div>
            <div style={{fontSize:14,color:WITD,marginBottom:18,textAlign:"center"}}>{t("{n} beurten - {c} car",{n:lp.length,c:totCarLp})}{stL?" - "+t("gem")+" "+decTekst(stL.gemPerBeurt):""}</div>
            <div style={{display:"flex",gap:10}}>
              <button style={{flex:1,padding:14,background:GRNT,border:"none",borderRadius:8,color:WIT,cursor:"pointer",fontFamily:"inherit",fontSize:14}} onClick={sluit}>{t("Opslaan")}</button>
              <button style={{flex:1,padding:14,background:"none",border:"1px solid "+KBDR,borderRadius:8,color:WITD,cursor:"pointer",fontFamily:"inherit",fontSize:14}} onClick={function(){setConfPartij(false);}}>{t("Annuleer")}</button>
            </div>
          </div>
        </div>
      )}

      {kaderKiezerOpen&&(
        <div onClick={function(){setKaderKiezerOpen(false);}} style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.75)",zIndex:220,display:"flex",alignItems:"center",justifyContent:"center",padding:20,cursor:"pointer"}}>
          <div data-kaderkiezer="" onClick={function(e){e.stopPropagation();}} style={{background:"linear-gradient(160deg,var(--c-1e3a1e),var(--c-0d1f0d))",border:"2px solid "+GOUD,borderRadius:16,padding:"18px 16px",maxWidth:340,width:"100%",maxHeight:"calc(85vh / var(--zoom,1))",overflowY:"auto"}}>
            <div style={{fontSize:16,fontWeight:"bold",color:GOUD,marginBottom:4,textAlign:"center"}}>{t("Kies je kader-variant")}</div>
            <div style={{fontSize:12,color:WITD,textAlign:"center",marginBottom:14}}>{t("Elke variant heeft zijn eigen gemiddelde en niveau, los van de andere")}</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {KADER_VARIANTEN.map(function(k){
                const actief=huidigeDiscipline===k;
                return(
                  <button key={k} onClick={function(){wisselDiscipline(k);setKaderKiezerOpen(false);}}
                    style={{padding:"12px 10px",background:actief?"var(--c-2d4a1e)":"none",border:"1px solid "+(actief?GOUD:KBDR),borderRadius:10,color:actief?GOUD:WIT,cursor:"pointer",fontFamily:"inherit",fontSize:15,textAlign:"left"}}>
                    {DISCIPLINES[k].naam}
                  </button>
                );
              })}
            </div>
            <div onClick={function(){setKaderKiezerOpen(false);}} style={{textAlign:"center",marginTop:14,fontSize:12,color:WITD,opacity:0.7,cursor:"pointer"}}>{t("Tik om te sluiten")}</div>
          </div>
        </div>
      )}

      <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
        {tab==="spelen"&&(
          <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
            {fase==="setup"&&<SetupScherm spel={spel}/>}
            {fase==="invoer"&&<InvoerScherm spel={spel}/>}
            {fase==="gemist"&&<GemistScherm spel={spel}/>}
            {fase==="goed"&&<GoedScherm spel={spel}/>}
          </div>
        )}
        {tab==="stats"&&<StatsTab data={data} alleP={alleP} huidigeDiscipline={huidigeDiscipline} niveau={niveau}
          prestatiesMap={prestatiesMap} seizoenAfsluiten={seizoenAfsluiten} seizoensplitsingOngedaanMaken={seizoensplitsingOngedaanMaken}
          openArchief={function(){setSeizoenArchiefOpen(true);}} verwijderPartij={verwijderPartij} slaNotitieOp={slaNotitieOp}
          openVerhaal={function(s){setVerhaalSeizoen(s);}}
          vormVenster={vormVenster}/>}
        {tab==="info"&&<InfoTab data={data} alleP={alleP} huidigeDiscipline={huidigeDiscipline} niveau={niveau}
          resetAlles={resetAlles}
          setSpelelement={setSpelelement} setWeergave={setWeergave} openUitleg={function(){setUitlegOpen(true);}} vervangData={vervangData}
          backupGemaakt={backupGemaakt}/>}
        {tab==="log"&&<LogTab lp={lp} alleP={alleP} prestatiesMap={prestatiesMap} niveau={niveau} huidigeDiscipline={huidigeDiscipline} verwijderPartij={verwijderPartij} slaNotitieOp={slaNotitieOp}/>}
        {tab==="dash"&&<Dashboard key={huidigeDiscipline} partijen={alleP} niveau={niveau} tijdsvensterMaanden={tijdsvensterMaanden} discipline={huidigeDiscipline}/>}
      </div>
    </div>
    </EenvoudigContext.Provider>
    </SpelContext.Provider>
    </KopContext.Provider>
    </OpmerkingenContext.Provider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(BiljartTracker,null));
