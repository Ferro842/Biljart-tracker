// Dash-tab van Carom Tracker: BeurtenTijdlijn (doorlopende beurtengrafiek met selecteren en
// beste/zwakste reeks) en Dashboard (Trend, Consistentie, Patronen, Vergelijk, Punten).
// JSX (vooraf omgezet door bouw-jsx.js), na jsx/partijrij.jsx.

// Doorlopende grafiek met alle beurten van alle (geselecteerde) partijen achter elkaar, horizontaal
// scrollbaar. Elke partij heeft een eigen band met nummer en datum; de eerste beurt van een partij
// krijgt een ring, de laatste een vierkantje. Tik op een punt voor de details van die beurt.
// Met "Selecteren" aan sleep je met je vinger een reeks beurten (ook over partijgrenzen heen) en zie je
// daar de cijfers van; "Beste/Zwakste reeks" zoekt zelf het sterkste of zwakste stuk van N beurten.
function BeurtenTijdlijn({partijen,nummers,discipline,niveau}){
  const scrollRef=useRef(null);
  const svgRef=useRef(null);
  const sleepRef=useRef(null); // tijdens slepen: {modus:"nieuw"|"rand"|"verplaats",...}, anders null
  const [gekozen,setGekozen]=useState(null);
  const [selectie,setSelectie]=useState(null); // {van,tot,bron} met globale beurtindexen
  const [selecteerModus,setSelecteerModus]=useState(false);
  const [vensterLengte,setVensterLengte]=useState(25);
  useEffect(function(){
    const el=scrollRef.current;
    if(el)el.scrollLeft=el.scrollWidth;
    setGekozen(null);
    setSelectie(null);
  },[partijen]);
  if(!partijen||!partijen.length)return null;

  const d=beurtDrempels(discipline);
  const dec=discipline==="driebanden"?3:2;
  const STAP=14,TUSSEN=14,BOVEN=34,H=90,ONDER=10;
  let maxV=1;
  partijen.forEach(function(p){p.beurten.forEach(function(b){if(b.caramboles>maxV)maxV=b.caramboles;});});
  const y=function(v){return BOVEN+H-(v/maxV)*H;};
  const kleur=function(v){return v===0?"#e08055":v>=d.topMin?"#ff9f40":v>=d.sterkMin?GOUDL:v>=d.opbouwMin?GRNT:GOUD;};

  // Alle beurten plat achter elkaar, met hun positie en globale index g
  const alle=[];
  let x=TUSSEN/2;
  const blokken=partijen.map(function(p,pi){
    const x0=x;
    const punten=p.beurten.map(function(b,bi){
      const pt={x:x0+bi*STAP+STAP/2,y:y(b.caramboles),v:b.caramboles,pi:pi,bi:bi,g:alle.length};
      alle.push(pt);
      return pt;
    });
    x+=p.beurten.length*STAP+TUSSEN;
    return{p:p,pi:pi,x0:x0,x1:x0+p.beurten.length*STAP,punten:punten};
  });
  const W=Math.max(x-TUSSEN/2,60);
  const waarden=alle.map(function(pt){return pt.v;});
  // Vergelijken met "je gemiddelde" zoals overal in de app: zonder de weggespeelde slechtste partijen
  const basisGem=niveau?niveau.effectiefGemiddelde:waarden.reduce(function(a,v){return a+v;},0)/waarden.length;

  const sel=selectie?{van:Math.min(selectie.van,selectie.tot),tot:Math.max(selectie.van,selectie.tot)}:null;
  const inSel=function(g){return sel&&g>=sel.van&&g<=sel.tot;};
  const selStats=sel?reeksStats(waarden.slice(sel.van,sel.tot+1),discipline):null;

  // Vingerpositie -> dichtstbijzijnde beurt
  function indexBij(clientX){
    const r=svgRef.current.getBoundingClientRect();
    const px=clientX-r.left;
    let beste=0,afstand=Infinity;
    for(let i=0;i<alle.length;i++){
      const a=Math.abs(alle[i].x-px);
      if(a<afstand){afstand=a;beste=i;}
      else if(alle[i].x>px)break;
    }
    return beste;
  }
  // Bij slepen tegen de rand van het zichtbare stuk scrolt de grafiek mee
  function randScroll(clientX){
    const el=scrollRef.current;
    if(!el)return;
    const r=el.getBoundingClientRect();
    if(clientX<r.left+30)el.scrollLeft-=12;
    else if(clientX>r.right-30)el.scrollLeft+=12;
  }
  // Met Selecteer aan: een rand van de selectie vastpakken verschuift alleen die rand, binnen de
  // selectie pakken verschuift het hele stuk (zelfde lengte), ernaast slepen scrolt de grafiek zonder de
  // selectie te veranderen. Zonder selectie begint slepen een nieuwe selectie.
  const RAND=16; // grijpafstand in px rond een rand, ruim genoeg voor een vinger
  function onDown(e){
    if(!selecteerModus)return;
    const px=e.clientX-svgRef.current.getBoundingClientRect().left;
    const g=indexBij(e.clientX);
    setGekozen(null);
    if(sel){
      const dL=Math.abs(px-(alle[sel.van].x-STAP/2)),dR=Math.abs(px-(alle[sel.tot].x+STAP/2));
      if(Math.min(dL,dR)<=RAND){
        sleepRef.current={modus:"rand",anker:dL<=dR?sel.tot:sel.van};
      }else if(g>=sel.van&&g<=sel.tot){
        sleepRef.current={modus:"verplaats",start:g,van:sel.van,lengte:sel.tot-sel.van};
      }else{
        // touch-action staat uit tijdens Selecteer, dus het scrollen doen we hier zelf
        sleepRef.current={modus:"scroll",startX:e.clientX,startScroll:scrollRef.current.scrollLeft};
      }
    }else{
      sleepRef.current={modus:"nieuw",anker:g};
      setSelectie({van:g,tot:g,bron:"hand"});
    }
    try{e.currentTarget.setPointerCapture(e.pointerId);}catch(err){}
  }
  function onMove(e){
    const s=sleepRef.current;
    if(!selecteerModus||!s)return;
    if(s.modus==="scroll"){
      scrollRef.current.scrollLeft=s.startScroll-(e.clientX-s.startX);
      return;
    }
    randScroll(e.clientX);
    const g=indexBij(e.clientX);
    if(s.modus==="verplaats"){
      const van=Math.max(0,Math.min(alle.length-1-s.lengte,s.van+g-s.start));
      setSelectie({van:van,tot:van+s.lengte,bron:"hand"});
    }else{
      setSelectie({van:s.anker,tot:g,bron:"hand"});
    }
  }
  function onUp(){sleepRef.current=null;}
  // Met Selecteer uit haalt een tik op de grafiek de selectie weg
  function onTik(){
    if(!selecteerModus&&selectie)setSelectie(null);
  }

  function zoekReeks(richting,lengteKeuze){
    const lengte=Math.min(lengteKeuze||vensterLengte,waarden.length);
    const r=besteVenster(waarden,lengte,richting);
    if(!r)return;
    setGekozen(null);
    setSelectie({van:r.van,tot:r.tot,bron:richting});
    const el=scrollRef.current;
    if(el){
      const midden=(alle[r.van].x+alle[r.tot].x)/2;
      el.scrollTo({left:Math.max(0,midden-el.clientWidth/2),behavior:"smooth"});
    }
  }

  const plek=function(g){const pt=alle[g];return t("p{p} beurt {b}",{p:nummers[pt.pi],b:pt.bi+1});};

  let info=selecteerModus
    ?t(selectie?"Sleep een rand om te verlengen, het midden om te verschuiven, of ernaast om de grafiek te scrollen. ✕ voor een nieuwe selectie":"Sleep met je vinger over de grafiek om beurten te selecteren")
    :t(selectie?"Tik op de grafiek om de selectie weg te halen":"Tik op een punt voor de details van die beurt");
  if(gekozen){
    const p=partijen[gekozen.pi];
    const n=p.beurten.length;
    const v=p.beurten[gekozen.bi].caramboles;
    info="p"+nummers[gekozen.pi]+" · "+fmtDatum(p.datum)+" · "+t("beurt {b} van {n}",{b:gekozen.bi+1,n:n})+" · "+v+" car"+(v===0?" ("+t("poedel")+")":"")+
      (gekozen.bi===0?" · "+t("eerste beurt"):gekozen.bi===n-1?" · "+t("laatste beurt"):"");
  }

  const chip=function(actief){return{padding:"5px 9px",background:actief?"var(--c-2d4a1e)":"none",border:"1px solid "+(actief?GOUD:KBDR),borderRadius:6,color:actief?GOUD:WITD,fontSize:12,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"};};

  return(
    <div>
      <div ref={scrollRef} style={{overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
        {/* Zonder Selecteer ook omhoog/omlaag vegen over de grafiek (alleen pan-x liet het scherm onderaan Trend "hangen") */}
        <svg ref={svgRef} width={W} height={BOVEN+H+ONDER}
          onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onClick={onTik}
          style={{display:"block",touchAction:selecteerModus?"none":"pan-x pan-y",userSelect:"none",WebkitUserSelect:"none"}}>
          {blokken.map(function(bl){
            return(
              <rect key={"b"+bl.p.id} x={bl.x0-TUSSEN/2+1} y={0} width={bl.x1-bl.x0+TUSSEN-2} height={BOVEN+H+ONDER} rx={4}
                fill={bl.pi%2===0?"rgba(255,255,255,0.05)":"rgba(255,255,255,0.015)"}/>
            );
          })}
          {sel&&(
            <g>
              <rect x={alle[sel.van].x-STAP/2} y={BOVEN-6} width={alle[sel.tot].x-alle[sel.van].x+STAP} height={H+12} rx={4}
                fill="rgba(127,216,224,0.13)" stroke="#7fd8e0" strokeWidth="1"/>
              <line x1={alle[sel.van].x-STAP/2} x2={alle[sel.tot].x+STAP/2} y1={y(selStats.gemiddelde)} y2={y(selStats.gemiddelde)}
                stroke="#7fd8e0" strokeWidth="1.5" strokeDasharray="4,3"/>
              {selecteerModus&&[alle[sel.van].x-STAP/2,alle[sel.tot].x+STAP/2].map(function(hx,i){
                return <rect key={i} x={hx-3} y={BOVEN+H/2-14} width={6} height={28} rx={3} fill="#7fd8e0"/>;
              })}
            </g>
          )}
          {blokken.map(function(bl){
            const smal=bl.x1-bl.x0<44;
            return(
              <g key={bl.p.id} opacity={sel&&!bl.punten.some(function(pt){return inSel(pt.g);})?0.35:1}>
                <text x={bl.x0} y={11} fontSize="10" fill={GOUD} fontFamily="Georgia,serif" fontWeight="bold">p{nummers[bl.pi]}</text>
                {!smal&&<text x={bl.x0} y={23} fontSize="9" fill={WITD} fontFamily="Georgia,serif">{fmtDatum(bl.p.datum)}</text>}
                <polyline points={bl.punten.map(function(pt){return pt.x+","+pt.y;}).join(" ")} fill="none" style={{stroke:"var(--c-5a7a55)"}} strokeWidth="1.2" strokeLinejoin="round"/>
                {bl.punten.map(function(pt){
                  const k=kleur(pt.v);
                  const eerste=pt.bi===0,laatste=pt.bi===bl.punten.length-1;
                  const actief=gekozen&&gekozen.pi===bl.pi&&gekozen.bi===pt.bi;
                  const gedimd=sel&&!inSel(pt.g);
                  return(
                    <g key={pt.bi} opacity={gedimd?0.45:1} style={{cursor:"pointer"}}
                      onClick={function(){if(!selecteerModus&&!selectie)setGekozen({pi:bl.pi,bi:pt.bi});}}>
                      <circle cx={pt.x} cy={pt.y} r={8} fill="transparent"/>
                      {laatste&&!eerste
                        ?<rect x={pt.x-4} y={pt.y-4} width={8} height={8} style={{fill:G}} stroke={WIT} strokeWidth="1.5"/>
                        :eerste
                          ?<circle cx={pt.x} cy={pt.y} r={4.5} style={{fill:G}} stroke={WIT} strokeWidth="1.5"/>
                          :null}
                      <circle cx={pt.x} cy={pt.y} r={actief?4:2.5} fill={k} stroke={actief?WIT:"none"}/>
                      {pt.v>0&&<text x={pt.x} y={pt.y-7} textAnchor="middle" fontSize="8" fill={k} fontFamily="Georgia,serif">{pt.v}</text>}
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>

      <div style={{fontSize:12,color:gekozen?WIT:WITD,marginTop:6,minHeight:16}}>{info}</div>
      <div style={{fontSize:11,color:WITD,marginTop:4,display:"flex",gap:10,flexWrap:"wrap"}}>
        <span>◯ {t("eerste beurt")}</span><span>□ {t("laatste beurt")}</span>
        <span style={{color:GRNT}}>● {d.opbouwMin}+</span><span style={{color:GOUDL}}>● {d.sterkMin}+</span><span style={{color:"#ff9f40"}}>● {d.topMin}+</span><span style={{color:"#e08055"}}>● {t("poedel")}</span>
      </div>

      <div style={{display:"flex",gap:6,marginTop:10,flexWrap:"wrap",alignItems:"center"}}>
        <button onClick={function(){setSelecteerModus(function(v){return !v;});setGekozen(null);}} style={chip(selecteerModus)}>
          ✋ {t("Selecteer")}
        </button>
        <button onClick={function(){zoekReeks("beste");}} style={chip(selectie&&selectie.bron==="beste")}>🏆 {t("Beste")}</button>
        <button onClick={function(){zoekReeks("zwakste");}} style={chip(selectie&&selectie.bron==="zwakste")}>🧊 {t("Zwakste")}</button>
        {selectie&&<button onClick={function(){setSelectie(null);}} style={chip(false)}>✕</button>}
      </div>
      <div style={{display:"flex",gap:6,marginTop:6,alignItems:"center",fontSize:12,color:WITD}}>
        <span>{t("Beste/zwakste reeks van")}</span>
        {/* De gekozen lengte licht niet op zolang je een zelf gesleepte selectie hebt: die heeft een andere lengte */}
        {[10,25,50].map(function(n){
          return <button key={n} onClick={function(){
            setVensterLengte(n);
            if(selectie&&(selectie.bron==="beste"||selectie.bron==="zwakste"))zoekReeks(selectie.bron,n);
          }} style={chip(vensterLengte===n&&!(selectie&&selectie.bron==="hand"))}>{n}</button>;
        })}
        <span>{t("beurten")}</span>
      </div>

      {selStats&&(
        <div style={{marginTop:10,background:"rgba(127,216,224,0.08)",border:"1px solid #7fd8e0",borderRadius:10,padding:"10px 12px"}}>
          <div style={{fontSize:12,color:"#7fd8e0",marginBottom:2}}>
            {selectie.bron==="beste"?"🏆 "+t("Je beste reeks van {n} beurten",{n:selStats.aantal}):selectie.bron==="zwakste"?"🧊 "+t("Je zwakste reeks van {n} beurten",{n:selStats.aantal}):t(selStats.aantal===1?"Selectie: {n} beurt":"Selectie: {n} beurten",{n:selStats.aantal})}
          </div>
          <div style={{fontSize:11,color:WITD,marginBottom:8}}>
            {plek(sel.van)}{sel.tot!==sel.van?" → "+plek(sel.tot):""}
            {alle[sel.van].pi!==alle[sel.tot].pi?" · "+t("{n} partijen",{n:alle[sel.tot].pi-alle[sel.van].pi+1}):""}
          </div>
          <div style={{display:"flex",alignItems:"baseline",gap:10,marginBottom:10}}>
            <span style={{fontSize:30,fontWeight:"bold",color:GOUD,lineHeight:1}}>{getalTekst(selStats.gemiddelde,dec)}</span>
            <span style={{fontSize:12,color:WITD}}>{t("gemiddelde")}</span>
            {(function(){
              const verschil=selStats.gemiddelde-basisGem;
              return <span style={{marginLeft:"auto",fontSize:13,fontWeight:"bold",color:verschil>=0?GRNT:ROOD}}>
                {verschil>=0?"▲ +":"▼ "}{getalTekst(verschil,dec)} <span style={{fontWeight:"normal",color:WITD,fontSize:11}}>{t("t.o.v. je vorm {g}",{g:getalTekst(basisGem,dec)})}</span>
              </span>;
            })()}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6}}>
            {[[t("Caramboles"),selStats.totaal,GOUD],[t("Hoogste"),selStats.max,"#ff9f40"],[t("Poedels"),selStats.poedels+" · "+Math.round(selStats.poedelPct)+"%","#e08055"],
              [d.opbouwMin+"–"+d.opbouwMax,selStats.opbouw+"x",GRNT],[d.sterkMin+"–"+d.sterkMax,selStats.sterk+"x",GOUDL],[d.topMin+"+",selStats.top+"x","#ff9f40"]].map(function(arr){
              return(
                <div key={arr[0]} style={{background:"rgba(0,0,0,0.2)",borderRadius:8,padding:"6px 4px",textAlign:"center"}}>
                  <div style={{fontSize:16,fontWeight:"bold",color:arr[2]}}>{arr[1]}</div>
                  <div style={{fontSize:11,color:WITD}}>{arr[0]}</div>
                </div>
              );
            })}
          </div>
          <div style={{fontSize:12,color:WITD,marginTop:8}}>⛓️ {t("Langste reeks zonder poedel:")} <strong style={{color:WIT}}>{selStats.langsteZonderPoedel}</strong> {t("beurten")}</div>
        </div>
      )}
    </div>
  );
}

function Dashboard({partijen,niveau,tijdsvensterMaanden,discipline}){
  const spel=useContext(SpelContext); // spelelement uit: geen Punten-tab
  const eenvoudig=useContext(EenvoudigContext); // eenvoudige modus: alleen Inzicht en Trend
  const kopBlok=useContext(KopContext); // kop schuift mee in het scrollvak (index.html)
  // ST wordt live afgeleid van de echte partijen (inclusief nieuwe partijen en comments)
  const ST=useMemo(()=>{
    return (partijen||[]).map(function(p,i){
      const st=stat(p.beurten,discipline);
      if(!st)return null;
      return{nr:i+1,id:p.id,datum:p.datum,tafel:p.tafel||"230",tot:st.totCar,n:st.aantalBeurten,max:st.max,poedels:st.poedels,opbouw:st.opbouw5,gem:parseFloat(st.gemPerBeurt),beurten:p.beurten};
    }).filter(Boolean);
  },[partijen,discipline]);

  const [va,setVa]=useState(0);
  const [tot,setTot]=useState(Math.max(ST.length-1,0));
  const [w3,setW3]=useState(true);
  const [w5,setW5]=useState(true);
  const [trimL,setTrimL]=useState(0);
  const [trimH,setTrimH]=useState(0);
  const [tab,setTab]=useState("inzicht");
  const [tafelFilter,setTafelFilter]=useState("alle");
  const [niveauOpen,setNiveauOpen]=useState(false);
  const [badgeCatalogusOpen,setBadgeCatalogusOpen]=useState(false);
  const [uitlegModus,setUitlegModus]=useState(false);
  const [uitlegSectie,setUitlegSectie]=useState(null);
  const [geselecteerdeMaanden,setGeselecteerdeMaanden]=useState(null); // null=uit, anders Set van maand-keys

  const selRange=useMemo(()=>{
    if(geselecteerdeMaanden&&geselecteerdeMaanden.size>0){
      return ST.filter(p=>geselecteerdeMaanden.has(maandKey(p.datum)));
    }
    return ST.slice(va,tot+1);
  },[ST,va,tot,geselecteerdeMaanden]);
  // Alleen tafels waarop in deze discipline gespeeld is; een gekozen tafel die er niet (meer) is telt als "alle"
  const gespeeldeTafels=useMemo(()=>Object.keys(TAFELS).filter(k=>ST.some(p=>p.tafel===k)),[ST]);
  const tafelKeuze=gespeeldeTafels.indexOf(tafelFilter)!==-1?tafelFilter:"alle";
  const sel=useMemo(()=>tafelKeuze==="alle"?selRange:selRange.filter(p=>p.tafel===tafelKeuze),[selRange,tafelKeuze]);

  // Kleuren van gemiddeldes volgen je klassegrenzen in deze discipline (zie gemGrenzen)
  const grenzen=gemGrenzen(niveau.effectiefGemiddelde||0,discipline);
  const decD=discipline==="driebanden"?3:2;

  const maxTrim=Math.max(0,Math.floor((sel.length-1)/2));
  const trimLClamped=Math.min(trimL,maxTrim);
  const trimHClamped=Math.min(trimH,maxTrim);

  const filt=useMemo(()=>{
    const s=[...sel].sort((a,b)=>a.gem-b.gem);
    const ids=new Set(s.slice(trimLClamped,s.length-trimHClamped).map(p=>p.id));
    return sel.filter(p=>ids.has(p.id));
  },[sel,trimLClamped,trimHClamped]);

  const filtTot=filt.reduce((a,p)=>a+p.tot,0);
  const filtN=filt.reduce((a,p)=>a+p.n,0);
  const gemGem=filtN>0?(filtTot/filtN).toFixed(2):"—";
  // Drempels schuiven mee met je huidige gemiddelde: eerste drempel is het hoogste 0,5-veelvoud
  // op of onder je gemiddelde, daarna telkens +0,5.
  const stapC=gemStap(discipline);
  const rondC=function(x){return Math.round(x*1000)/1000;};
  const eersteDrempel=rondC(Math.floor((niveau.effectiefGemiddelde||0)/stapC)*stapC);
  const drempD1=eersteDrempel,drempD2=rondC(eersteDrempel+stapC),drempD3=rondC(eersteDrempel+2*stapC),drempD4=rondC(eersteDrempel+3*stapC);
  const b15=Math.round(filt.filter(p=>p.gem>=drempD1).length/Math.max(filt.length,1)*100);
  const b20=Math.round(filt.filter(p=>p.gem>=drempD2).length/Math.max(filt.length,1)*100);
  const b25=Math.round(filt.filter(p=>p.gem>=drempD3).length/Math.max(filt.length,1)*100);
  const b30=Math.round(filt.filter(p=>p.gem>=drempD4).length/Math.max(filt.length,1)*100);

  // rolGems: behoudt originele volgorde van sel, null voor weggefilterde partijen (voor de puntjes-grafiek, per partij)
  const filtIds=useMemo(()=>new Set(filt.map(p=>p.id)),[filt]);
  const rolGems=sel.map(p=>filtIds.has(p.id)?p.gem:null);
  // rolData: tot/n per partij, voor beurt-gewogen rolling gemiddeldes
  const rolData=sel.map(p=>filtIds.has(p.id)?{tot:p.tot,n:p.n}:null);
  const r3=rolData.map((_,i)=>{
    const slice=rolData.slice(Math.max(0,i-2),i+1).filter(v=>v!==null);
    if(slice.length<3)return null;
    const sTot=slice.reduce((a,v)=>a+v.tot,0),sN=slice.reduce((a,v)=>a+v.n,0);
    return parseFloat((sTot/sN).toFixed(2));
  });
  const r5=rolData.map((_,i)=>{
    const slice=rolData.slice(Math.max(0,i-4),i+1).filter(v=>v!==null);
    if(slice.length<5)return null;
    const sTot=slice.reduce((a,v)=>a+v.tot,0),sN=slice.reduce((a,v)=>a+v.n,0);
    return parseFloat((sTot/sN).toFixed(2));
  });

  // Maand-blokken voor de snelfilters, dynamisch afgeleid van de echte data
  const maandBlokken=useMemo(()=>{
    const blocks=[];
    ST.forEach((p,i)=>{
      const key=maandKey(p.datum);
      const last=blocks[blocks.length-1];
      if(last&&last.key===key){last.eind=i;}
      else blocks.push({key,begin:i,eind:i});
    });
    return blocks;
  },[ST]);

  // Vergelijking eerste vs tweede helft
  const h=Math.floor(sel.length/2);
  const h1=sel.slice(0,h), h2=sel.slice(h);
  const g1=h1.length?((h1.reduce((a,p)=>a+p.tot,0))/(h1.reduce((a,p)=>a+p.n,0))).toFixed(2):"—";
  const g2=h2.length?((h2.reduce((a,p)=>a+p.tot,0))/(h2.reduce((a,p)=>a+p.n,0))).toFixed(2):"—";

  // Per maand
  const maandGroepen=useMemo(()=>{
    const groups={};
    sel.forEach(p=>{
      const k=maandKey(p.datum);
      if(!groups[k])groups[k]=[];
      groups[k].push(p);
    });
    return Object.entries(groups);
  },[sel]);
  // Volle balk per maand: ruim boven je volgende klasse, of het beste maandgemiddelde als dat hoger is
  const maandSchaal=Math.max(grenzen.hoog*1.25,...maandGroepen.map(([,ps])=>ps.reduce((a,p)=>a+p.tot,0)/Math.max(1,ps.reduce((a,p)=>a+p.n,0))));

  // ── PUNTEN: prestatie-badges, chronologisch berekend over de volledige geschiedenis ──
  const prestatiesMap=useMemo(()=>{
    const m={};
    const disc=(partijen&&partijen.length>0)?(partijen[0].discipline||"libre"):"libre";
    berekenPrestaties(partijen,tijdsvensterMaanden,disc).forEach(r=>{m[r.id]=r;});
    return m;
  },[partijen,tijdsvensterMaanden]);
  const puntenSel=useMemo(()=>sel.map(p=>Object.assign({},p,prestatiesMap[p.id]||{badges:[],punten:0})),[sel,prestatiesMap]);
  const totaalPuntenSel=puntenSel.reduce((a,p)=>a+p.punten,0);
  const gemPuntenSel=puntenSel.length?Math.round(totaalPuntenSel/puntenSel.length):0;
  const top5Punten=useMemo(()=>[...puntenSel].sort((a,b)=>b.punten-a.punten).slice(0,5),[puntenSel]);
  const badgeFrequentie=useMemo(()=>{
    const freq={};
    puntenSel.forEach(p=>{
      (p.badges||[]).forEach(b=>{
        if(!freq[b.label])freq[b.label]={emoji:b.emoji,aantal:0,punten:0};
        freq[b.label].aantal+=b.aantal;
        freq[b.label].punten+=b.punten;
      });
    });
    return Object.entries(freq).sort((a,b)=>b[1].punten-a[1].punten);
  },[puntenSel]);

  // ── PATRONEN: tag-analyse, verdeling per beurt, poedel-herstel ──
  const gemistCounts=useMemo(()=>{
    const c={};
    sel.forEach(p=>p.beurten.forEach(b=>(b.gemist||[]).forEach(t=>{c[t]=(c[t]||0)+1;})));
    return Object.entries(c).sort((a,b)=>b[1]-a[1]);
  },[sel]);
  const goedCounts=useMemo(()=>{
    const c={};
    sel.forEach(p=>p.beurten.forEach(b=>(b.goed||[]).forEach(t=>{c[t]=(c[t]||0)+1;})));
    return Object.entries(c).sort((a,b)=>b[1]-a[1]);
  },[sel]);

  const histData=useMemo(()=>{
    const buckets=histogramBuckets(discipline);
    const allCar=sel.flatMap(p=>p.beurten.map(b=>b.caramboles));
    const counts=buckets.map(([label,lo,hi])=>({label,n:allCar.filter(c=>c>=lo&&c<=hi).length}));
    return{counts,totBeurt:allCar.length};
  },[sel,discipline]);

  const poedelHerstel=useMemo(()=>{
    const herstelMin=beurtDrempels(discipline).opbouwMin;
    let tilt=0,klein=0,sterk=0,totaalPoedels=0,geenVolgende=0;
    sel.forEach(p=>{
      const bs=p.beurten;
      bs.forEach((b,i)=>{
        if(b.caramboles===0){
          totaalPoedels++;
          const next=bs[i+1];
          if(!next){geenVolgende++;return;}
          if(next.caramboles===0)tilt++;
          else if(next.caramboles>=herstelMin)sterk++;
          else klein++;
        }
      });
    });
    return{tilt,klein,sterk,totaalPoedels,basis:totaalPoedels-geenVolgende,herstelMin};
  },[sel,discipline]);

  const kaart=(label,waarde,sub,kleur=GOUD)=>(
    <div style={{background:KBG,border:`1px solid ${KBDR}`,borderRadius:10,padding:"10px 8px",textAlign:"center"}}>
      <div style={{fontSize:12,color:WITD,textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>{label}</div>
      <div style={{fontSize:26,fontWeight:"bold",color:kleur,lineHeight:1}}>{decTekst(waarde)}</div>
      {sub&&<div style={{fontSize:12,color:WITD,marginTop:3}}>{sub}</div>}
    </div>
  );

  const UITLEG_TITEL={inzicht:t("Inzicht"),trend:t("Trend"),consist:t("Consistentie"),patronen:t("Patronen"),vergelijk:t("Vergelijk"),punten:t("Punten"),kalender:t("Kalender")};
  const UITLEG_TEKST={
    trend:t("Hoe je gemiddelde zich ontwikkelt over de tijd. Met een rollend gemiddelde over 3 en 5 partijen, en een schuifje om uitschieters (heel goede of slechte partijen) tijdelijk weg te filteren."),
    consist:t("Hoeveel procent van je partijen boven bepaalde gemiddelde-drempels uitkomt — die drempels schuiven automatisch mee met je eigen niveau, in stappen van 0,5. Plus je 5 beste en 5 slechtste partijen op een rij."),
    patronen:t("Analyse van je opmerkingen (wat je vaak mist of juist goed doet), hoe je caramboles per beurt verdeeld zijn, en hoe je herstelt na een poedel."),
    vergelijk:t("Vergelijkt de eerste met de tweede helft van je geselecteerde partijen (zie je progressie?), en toont je gemiddelde per maand naast elkaar."),
    kalender:t("Je speeldagen per maand, vanaf je eerste partij tot nu (ook maanden zonder partijen, zodat je ziet wanneer je minder speelde). Elk gekleurd vakje is een dag waarop je speelde; de kleur is je gemiddelde die dag (groen = op of boven het niveau van de volgende klasse, goud = binnen je huidige klasse, rood = daaronder). Een cijfer in het vakje = aantal partijen die dag. Tik op een dag voor de partijen met tafel, gemiddelde, caramboles en hoogste serie. De kalender gebruikt altijd al je partijen, los van de selectie hierboven bij de andere onderdelen."),
    punten:t("Je niveau, badge-punten, mijlpalen, en een overzicht van je best scorende partijen op badges."),
    inzicht:t("Wat je opmerkingen en omstandigheden zeggen over je spel: je sterkste techniek en grootste werkpunt (op slagingspercentage, niet op aantal missers), wat grote series oplevert, waardoor series eindigen, hoe tafel, tijdstip en fase in de partij uitpakken, en of je werkpunten minder vaak voorkomen.")
  };
  const btn=(k,l)=>(
    <button onClick={function(){if(uitlegModus){setUitlegSectie(k);}else{setTab(k);}}} style={{flex:"1 1 auto",padding:"10px 4px",whiteSpace:"nowrap",background:tab===k&&!uitlegModus?"var(--c-1c2c1c)":"none",
      border:"none",color:tab===k&&!uitlegModus?GOUD:(uitlegModus?"#7fd8e0":WITD),fontSize:12.5,cursor:"pointer",fontFamily:"Georgia,serif",
      borderBottom:tab===k&&!uitlegModus?`2px solid ${GOUD}`:"2px solid transparent"}}>
      {l}
    </button>
  );

  // Tabs: lopen door op een tweede regel als ze niet naast elkaar passen (grote tekst, smal scherm)
  const tabRij=(
    <div style={{display:"flex",flexWrap:"wrap",borderBottom:`1px solid ${KBDR}`,background:"var(--c-152015)",flexShrink:0}}>
      {/* Uitleg per onderdeel (vooraan, zodat hij ook bij grote tekst in beeld is; de oude kopbalk is weg voor meer leesruimte) */}
      <button onClick={function(){setUitlegModus(function(v){return !v;});setUitlegSectie(null);}} aria-label={t("Uitleg")}
        style={{flex:"0 0 auto",alignSelf:"center",width:30,height:30,margin:"0 4px 0 10px",padding:0,borderRadius:"50%",
          background:uitlegModus?GOUD:"transparent",border:"1.5px solid "+GOUD,color:uitlegModus?G:GOUD,
          fontSize:16,fontWeight:"bold",lineHeight:"27px",textAlign:"center",cursor:"pointer",fontFamily:"Georgia,serif"}}>
        {uitlegModus?"✕":"?"}
      </button>
      {btn("inzicht","✨ "+t("Inzicht"))}
      {btn("trend",t("Trend"))}
      {!eenvoudig&&btn("consist",t("Constant"))}
      {!eenvoudig&&btn("patronen",t("Patronen"))}
      {!eenvoudig&&btn("vergelijk",t("Vergelijk"))}
      {spel&&btn("punten",t("Punten"))}
      {btn("kalender",t("Kalender"))}
    </div>
  );

  return(
    <div style={{height:"100%",display:"flex",flexDirection:"column",background:G,fontFamily:"Georgia,serif",color:WIT}}>


      {/* Selectie + inhoud scrollen samen, zodat het selectieblok op een telefoon wegscrolt */}
      <div className="scrollvak" style={{flex:1,overflowY:"auto"}}>
        {/* Kop schuift mee met de inhoud; tabbalk en Dash-tabs plakken bovenaan (zie kopBlok in index.html) */}
        {kopBlok?kopBlok({extra:tabRij}):tabRij}
        {/* Partijselectie (niet bij de kalender: die toont altijd alles vanaf je eerste partij) */}
        <div style={{background:"var(--c-152015)",padding:"8px 14px",borderBottom:`1px solid ${KBDR}`,display:tab==="kalender"?"none":"block"}}>
          <div style={{fontSize:12,color:WITD,marginBottom:5}}>
            {geselecteerdeMaanden&&geselecteerdeMaanden.size>0
              ?<>{t("Selectie:")} {[...geselecteerdeMaanden].map(function(k){return maandTekst(k);}).join(", ")} · <span style={{color:GOUD}}>{t("{n} partijen",{n:filt.length})}</span></>
              :<>{t("Selectie:")} p{va+1}–p{tot+1} · <span style={{color:GOUD}}>{t("{n} partijen",{n:filt.length})}</span></>
            }
          </div>
          <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:6}}>
            <span style={{fontSize:12,color:WITD,minWidth:14}}>{va+1}</span>
            <input type="range" min={0} max={Math.max(ST.length-1,0)} value={va}
              onChange={e=>{setGeselecteerdeMaanden(null);setVa(Math.min(+e.target.value,tot-1));}}
              style={{flex:1,minWidth:0,accentColor:GOUD}}/>
            <input type="range" min={0} max={Math.max(ST.length-1,0)} value={tot}
              onChange={e=>{setGeselecteerdeMaanden(null);setTot(Math.max(+e.target.value,va+1));}}
              style={{flex:1,minWidth:0,accentColor:GOUD}}/>
            <span style={{fontSize:12,color:WITD,minWidth:14}}>{tot+1}</span>
          </div>
          <div style={{display:"flex",gap:5,overflowX:"auto",paddingBottom:2}}>
            {[[t("Alles"),0,Math.max(ST.length-1,0)]].concat(ST.length>10?[[t("Laatste 10"),ST.length-10,ST.length-1]]:[]).map(([l,v,eind])=>{
              const actief=(!geselecteerdeMaanden||geselecteerdeMaanden.size===0)&&va===v&&tot===eind;
              return(
                <button key={l} onClick={()=>{setGeselecteerdeMaanden(null);setVa(v);setTot(eind);}}
                  style={{flex:"0 0 auto",padding:"4px 10px",background:actief?"var(--c-2d4a1e)":"none",border:`1px solid ${actief?GOUD:KBDR}`,
                    borderRadius:5,color:actief?GOUD:WITD,fontSize:12,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>
                  {l}
                </button>
              );
            })}
            {maandBlokken.map(b=>{
              const actief=geselecteerdeMaanden?geselecteerdeMaanden.has(b.key):false;
              return(
                <button key={b.key} onClick={()=>{
                  setGeselecteerdeMaanden(prev=>{
                    const huidige=prev?new Set(prev):new Set();
                    if(huidige.has(b.key))huidige.delete(b.key);
                    else huidige.add(b.key);
                    return huidige;
                  });
                }}
                  style={{flex:"0 0 auto",padding:"4px 10px",background:actief?"var(--c-2d4a1e)":"none",border:`1px solid ${actief?GOUD:KBDR}`,
                    borderRadius:5,color:actief?GOUD:WITD,fontSize:12,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>
                  {maandTekst(b.key)}
                </button>
              );
            })}
          </div>
          <div style={{display:"flex",gap:5,marginTop:6,overflowX:"auto",paddingBottom:2}}>
            {[["alle",t("Alle tafels")]].concat(gespeeldeTafels.map(function(tk){return[tk,TAFELS[tk].label];})).map(([k,l])=>(
              <button key={k} onClick={()=>setTafelFilter(k)}
                style={{flex:"0 0 auto",padding:"4px 12px",background:tafelKeuze===k?"var(--c-2d4a1e)":"none",border:`1px solid ${tafelKeuze===k?GOUD:KBDR}`,
                  borderRadius:5,color:tafelKeuze===k?GOUD:WITD,fontSize:12,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>
                {l}
              </button>
            ))}
          </div>
        </div>
        <div style={{padding:"12px 14px"}}>

        {/* TREND */}
        {tab==="trend"&&<div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
            {kaart(t("Gem."),gemGem,t("alle partijen in selectie"),gemKleur(parseFloat(gemGem),grenzen))}
            {kaart(t("Max"),filt.length?Math.max(...filt.map(p=>p.gem)):"—",t("partij"),GOUDL)}
            {kaart(t("Opbouw"),filt.length?Math.round(filt.reduce((a,p)=>a+p.opbouw,0)/filt.reduce((a,p)=>a+p.n,0)*100)+"%":"—",t("beurten")+" ≥"+beurtDrempels(discipline).opbouwMin,GRNT)}
          </div>

          <div style={{background:KBG,border:`1px solid ${KBDR}`,borderRadius:10,padding:"12px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <span style={{fontSize:13,color:GOUD,textTransform:"uppercase",letterSpacing:1}}>{t(filt.length>=3?"Rolling gemiddelde":"Gemiddelde per partij")}</span>
              <div style={{display:"flex",gap:6}}>
                {filt.length>=3&&<button onClick={()=>setW3(!w3)} style={{background:"none",border:`1px solid ${w3?GOUD:KBDR}`,
                  borderRadius:4,color:w3?GOUD:WITD,fontSize:12,padding:"2px 8px",cursor:"pointer",fontFamily:"inherit"}}>3p</button>}
                {filt.length>=5&&<button onClick={()=>setW5(!w5)} style={{background:"none",border:`1px solid ${w5?WIT:KBDR}`,
                  borderRadius:4,color:w5?WIT:WITD,fontSize:12,padding:"2px 8px",cursor:"pointer",fontFamily:"inherit"}}>5p</button>}
              </div>
            </div>
            <div style={{fontSize:12,color:WITD,marginBottom:6,display:"flex",gap:12}}>
              <span style={{color:"var(--c-3a5c35)"}}>● {t("Ruw")}</span>
              {filt.length>=3&&w3&&<span style={{color:GOUD}}>── {t("3-partij")}</span>}
              {filt.length>=5&&w5&&<span style={{color:WIT}}>╌╌ {t("5-partij")}</span>}
            </div>
            <DashGrafiek data={rolGems} grenzen={grenzen}/>
            <div style={{fontSize:11,color:WITD,marginTop:4,display:"flex",gap:10,flexWrap:"wrap"}}>
              <span style={{color:GRNT}}>● {t("vanaf")} {getalTekst(grenzen.hoog,decD)}{grenzen.volgendeNaam?" ("+grenzen.volgendeNaam+")":""}</span>
              <span style={{color:GOUD}}>● {getalTekst(grenzen.laag,decD)}–{getalTekst(grenzen.hoog,decD)}{grenzen.volgendeNaam?" ("+grenzen.huidigNaam+")":""}</span>
              <span style={{color:ROOD}}>● {t("onder")} {getalTekst(grenzen.laag,decD)}</span>
            </div>
            {((filt.length>=3&&w3)||(filt.length>=5&&w5))&&<div style={{marginTop:6,display:"flex",gap:12,fontSize:13}}>
              {filt.length>=3&&w3&&<span style={{color:GOUD}}>{t("3p nu:")} <strong>{decTekst(r3.filter(v=>v!==null).slice(-1)[0])}</strong></span>}
              {filt.length>=5&&w5&&<span style={{color:WIT}}>{t("5p nu:")} <strong>{decTekst(r5.filter(v=>v!==null).slice(-1)[0])}</strong></span>}
            </div>}
          </div>

          <div style={{background:KBG,border:`1px solid ${KBDR}`,borderRadius:10,padding:"12px"}}>
            <div style={{fontSize:13,color:GOUD,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>{t("Uitschieters weggooien")}</div>
            <div style={{display:"flex",gap:10,marginBottom:8}}>
              <div style={{flex:1}}>
                <div style={{fontSize:12,color:ROOD,marginBottom:4}}>{t("Slechtste {n} weg",{n:trimLClamped})}</div>
                <input type="range" min={0} max={maxTrim} step={1} value={trimLClamped}
                  onChange={e=>setTrimL(+e.target.value)} style={{width:"100%",accentColor:ROOD}}/>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:12,color:GRNT,marginBottom:4}}>{t("Beste {n} weg",{n:trimHClamped})}</div>
                <input type="range" min={0} max={maxTrim} step={1} value={trimHClamped}
                  onChange={e=>setTrimH(+e.target.value)} style={{width:"100%",accentColor:GRNT}}/>
              </div>
            </div>
            <div style={{textAlign:"center",background:"var(--c-1a3019)",borderRadius:8,padding:"8px"}}>
              <span style={{fontSize:13,color:WITD}}>{t("Gefilterd gemiddelde:")} </span>
              <span style={{fontSize:20,fontWeight:"bold",color:parseFloat(gemGem)>=grenzen.laag?GOUD:WITD}}>{decTekst(gemGem)}</span>
            </div>
          </div>
          {sel.length>0&&<div style={{background:KBG,border:`1px solid ${KBDR}`,borderRadius:10,padding:"12px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:8}}>
              <span style={{fontSize:13,color:GOUD,textTransform:"uppercase",letterSpacing:1}}>{t("Alle beurten")}</span>
              <span style={{fontSize:12,color:WITD}}>{t("{p} partijen · {b} beurten",{p:sel.length,b:sel.reduce((a,p)=>a+p.n,0)})}</span>
            </div>
            <BeurtenTijdlijn partijen={sel} nummers={sel.map(p=>p.nr)} discipline={discipline} niveau={niveau}/>
          </div>}
        </div>}

        {/* CONSISTENTIE */}
        {tab==="consist"&&<div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{background:KBG,border:`1px solid ${KBDR}`,borderRadius:10,padding:"14px"}}>
            <div style={{fontSize:13,color:GOUD,textTransform:"uppercase",letterSpacing:1,marginBottom:14}}>{t("% boven drempel")}</div>
            {[[drempD1,b15,"#5a8a50"],[drempD2,b20,GOUD],[drempD3,b25,"#e8a84c"],[drempD4,b30,ROOD]].map(([d,pct,k])=>(
              <div key={d} style={{marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontSize:14,color:WITD}}>{t("Boven {g}",{g:kommaTekst(gemDrempelTekst(d,stapC))})}</span>
                  <span style={{fontSize:18,fontWeight:"bold",color:k}}>{pct}%</span>
                </div>
                <DashBalk pct={pct} kleur={k}/>
                <div style={{fontSize:12,color:WITD,marginTop:2}}>
                  {t("{a} van {b} partijen",{a:filt.filter(p=>p.gem>=d).length,b:filt.length})}
                </div>
              </div>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <div style={{background:KBG,border:`1px solid ${KBDR}`,borderRadius:10,padding:"12px"}}>
              <div style={{fontSize:13,color:GRNT,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>{t("Beste 5")}</div>
              {[...filt].sort((a,b)=>b.gem-a.gem).slice(0,5).map(p=>(
                <div key={p.id} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",borderBottom:`1px solid ${KBDR}`}}>
                  <span style={{fontSize:13,color:WITD}}>p{p.nr} {fmtDatum(p.datum)}</span>
                  <span style={{fontSize:14,fontWeight:"bold",color:GRNT}}>{decTekst(p.gem)}</span>
                </div>
              ))}
            </div>
            <div style={{background:KBG,border:`1px solid ${KBDR}`,borderRadius:10,padding:"12px"}}>
              <div style={{fontSize:13,color:ROOD,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>{t("Slechtste 5")}</div>
              {[...filt].sort((a,b)=>a.gem-b.gem).slice(0,5).map(p=>(
                <div key={p.id} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",borderBottom:`1px solid ${KBDR}`}}>
                  <span style={{fontSize:13,color:WITD}}>p{p.nr} {fmtDatum(p.datum)}</span>
                  <span style={{fontSize:14,fontWeight:"bold",color:ROOD}}>{decTekst(p.gem)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>}

        {/* PATRONEN */}
        {tab==="patronen"&&<div style={{display:"flex",flexDirection:"column",gap:10}}>

          <div style={{background:KBG,border:`1px solid ${KBDR}`,borderRadius:10,padding:"12px"}}>
            <div style={{fontSize:13,color:GOUD,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>{t("Meest genoteerde redenen")}</div>
            {gemistCounts.length===0&&goedCounts.length===0
              ?<div style={{fontSize:14,color:WITD}}>{t("Nog geen opmerkingen genoteerd in deze selectie.")}</div>
              :<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div>
                  <div style={{fontSize:13,color:ROOD,marginBottom:6}}>{t("Gemist door")}</div>
                  {gemistCounts.length===0?<div style={{fontSize:13,color:WITD}}>—</div>:gemistCounts.slice(0,8).map(([label,n])=>(
                    <div key={label} style={{marginBottom:6}}>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:WITD,marginBottom:2}}>
                        <span>{t(label)}</span><span>{n}x</span>
                      </div>
                      <DashBalk pct={Math.round(n/gemistCounts[0][1]*100)} kleur={ROOD} hoogte={5}/>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{fontSize:13,color:GRNT,marginBottom:6}}>{t("Ging goed door")}</div>
                  {goedCounts.length===0?<div style={{fontSize:13,color:WITD}}>—</div>:goedCounts.slice(0,8).map(([label,n])=>(
                    <div key={label} style={{marginBottom:6}}>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:WITD,marginBottom:2}}>
                        <span>{t(label)}</span><span>{n}x</span>
                      </div>
                      <DashBalk pct={Math.round(n/goedCounts[0][1]*100)} kleur={GRNT} hoogte={5}/>
                    </div>
                  ))}
                </div>
              </div>
            }
          </div>

          <div style={{background:KBG,border:`1px solid ${KBDR}`,borderRadius:10,padding:"12px"}}>
            <div style={{fontSize:13,color:GOUD,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>{t("Verdeling caramboles per beurt")}</div>
            {histData.totBeurt===0
              ?<div style={{fontSize:14,color:WITD}}>{t("Geen beurten in selectie.")}</div>
              :<>
                {histData.counts.map(({label,n},idx)=>{
                  const pct=Math.round(n/histData.totBeurt*100);
                  const laatste=histData.counts.length-1;
                  const kleur=idx===0?"#e08055":idx===laatste?"#ff9f40":idx===laatste-1?GOUDL:idx===laatste-2?GRNT:GOUD;
                  return(
                    <div key={label} style={{marginBottom:10}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                        <span style={{fontSize:14,color:WITD}}>{t(label)}</span>
                        <span style={{fontSize:14,fontWeight:"bold",color:kleur}}>{n}x · {pct}%</span>
                      </div>
                      <DashBalk pct={pct} kleur={kleur}/>
                    </div>
                  );
                })}
                <div style={{fontSize:12,color:WITD,marginTop:2}}>{t("{n} beurten totaal",{n:histData.totBeurt})}</div>
              </>
            }
          </div>

          <div style={{background:KBG,border:`1px solid ${KBDR}`,borderRadius:10,padding:"12px"}}>
            <div style={{fontSize:13,color:GOUD,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>{t("Na een poedel")}</div>
            {poedelHerstel.basis===0
              ?<div style={{fontSize:14,color:WITD}}>{t("Geen poedels met vervolgbeurt in selectie.")}</div>
              :<>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:10}}>
                  {kaart(t("Opnieuw poedel"),Math.round(poedelHerstel.tilt/poedelHerstel.basis*100)+"%",poedelHerstel.tilt+"x",ROOD)}
                  {kaart(t("Klein herstel"),Math.round(poedelHerstel.klein/poedelHerstel.basis*100)+"%",poedelHerstel.klein+"x",GOUD)}
                  {kaart(t("Sterk herstel"),Math.round(poedelHerstel.sterk/poedelHerstel.basis*100)+"%",poedelHerstel.sterk+"x ("+poedelHerstel.herstelMin+"+)",GRNT)}
                </div>
                <div style={{fontSize:12,color:WITD,lineHeight:1.4}}>
                  {t("Gebaseerd op {n} poedels.",{n:poedelHerstel.basis})}
                  {poedelHerstel.totaalPoedels>poedelHerstel.basis&&<> {t(poedelHerstel.totaalPoedels-poedelHerstel.basis===1?"Je had er {t} in de selectie; één daarvan was de laatste beurt van een partij, daarna kwam geen beurt meer om te beoordelen.":"Je had er {t} in de selectie; {n} daarvan waren de laatste beurt van een partij, daarna kwam geen beurt meer om te beoordelen.",{t:poedelHerstel.totaalPoedels,n:poedelHerstel.totaalPoedels-poedelHerstel.basis})}</>}
                </div>
              </>
            }
          </div>

        </div>}

        {/* VERGELIJK */}
        {tab==="vergelijk"&&<div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{background:KBG,border:`1px solid ${KBDR}`,borderRadius:10,padding:"12px"}}>
            <div style={{fontSize:13,color:GOUD,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>{t("Eerste vs tweede helft")}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
              {[[`p1–p${h}`,g1,h1],[`p${h+1}–p${sel.length}`,g2,h2]].map(([label,gem,ps])=>(
                <div key={label} style={{background:"var(--c-1a3019)",borderRadius:8,padding:"12px",textAlign:"center"}}>
                  <div style={{fontSize:13,color:WITD,marginBottom:4}}>{label}</div>
                  <div style={{fontSize:28,fontWeight:"bold",color:gemKleur(parseFloat(gem),grenzen)}}>{decTekst(gem)}</div>
                  <div style={{fontSize:12,color:WITD,marginTop:4}}>{t("{n} partijen",{n:ps.length})}</div>
                  <div style={{fontSize:12,color:GRNT}}>{Math.round(ps.filter(p=>p.gem>=grenzen.hoog).length/Math.max(ps.length,1)*100)}% {t("vanaf")} {getalTekst(grenzen.hoog,decD)}</div>
                </div>
              ))}
            </div>
            <div style={{textAlign:"center",padding:"8px",background:"var(--c-1a3019)",borderRadius:8}}>
              {parseFloat(g2)>parseFloat(g1)
                ?<span style={{color:GRNT}}>↑ {t("Tweede helft {v} hoger — progressie!",{v:getalTekst(g2-g1,2)})}</span>
                :<span style={{color:ROOD}}>↓ {t("Eerste helft {v} hoger",{v:getalTekst(parseFloat(g1)-parseFloat(g2),2)})}</span>
              }
            </div>
          </div>
          <div style={{background:KBG,border:`1px solid ${KBDR}`,borderRadius:10,padding:"12px"}}>
            <div style={{fontSize:13,color:GOUD,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>{t("Per maand")}</div>
            {maandGroepen.map(([naam,ps])=>{
              const gem=(ps.reduce((a,p)=>a+p.tot,0)/ps.reduce((a,p)=>a+p.n,0)).toFixed(2);
              const k=parseFloat(gem)>=grenzen.hoog?GRNT:parseFloat(gem)>=grenzen.laag?GOUD:WITD;
              return(
                <div key={naam} style={{marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                    <span style={{fontSize:14,color:WITD}}>{maandTekst(naam)} <span style={{fontSize:12,color:WITD}}>({ps.length}p)</span></span>
                    <span style={{fontSize:14,fontWeight:"bold",color:k}}>{decTekst(gem)}</span>
                  </div>
                  <DashBalk pct={parseFloat(gem)/maandSchaal*100} kleur={k}/>
                </div>
              );
            })}
          </div>
        </div>}

        {/* INZICHT */}
        {(tab==="inzicht"||(!spel&&tab==="punten"))&&<InzichtPaneel partijen={sel} discipline={discipline}/>}
        {tab==="kalender"&&<KalenderPaneel partijen={partijen} discipline={discipline}/>}

        {/* PUNTEN */}
        {spel&&tab==="punten"&&<div style={{display:"flex",flexDirection:"column",gap:10}}>
          <NiveauKaart niveau={niveau} discipline={discipline} onClick={function(){setNiveauOpen(true);}}/>

          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
            {kaart(t("Totaal"),totaalPuntenSel,t("punten"),GOUD)}
            {kaart(t("Gem."),gemPuntenSel,t("per partij"),GOUDL)}
            {kaart(t("Beste partij"),top5Punten.length?top5Punten[0].punten:0,top5Punten.length?"p"+top5Punten[0].nr:"—",GRNT)}
          </div>

          <div style={{background:KBG,border:`1px solid ${KBDR}`,borderRadius:10,padding:"12px"}}>
            <div style={{fontSize:13,color:GOUD,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>{t("Beste partijen op punten")}</div>
            {top5Punten.length===0||top5Punten[0].punten===0
              ?<div style={{fontSize:14,color:WITD}}>{t("Nog geen prestaties behaald in deze selectie.")}</div>
              :top5Punten.filter(p=>p.punten>0).map(p=>(
                <div key={p.id} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${KBDR}`}}>
                  <span style={{fontSize:13,color:WITD}}>p{p.nr} · {fmtDatum(p.datum)} <span style={{color:WITD,opacity:0.7}}>({t("{n} badges",{n:p.badges.length})})</span></span>
                  <span style={{fontSize:15,fontWeight:"bold",color:GOUD}}>{p.punten}pt</span>
                </div>
              ))
            }
          </div>

          <div style={{background:KBG,border:`1px solid ${KBDR}`,borderRadius:10,padding:"12px"}}>
            <div style={{fontSize:13,color:GOUD,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Meest behaalde prestaties</div>
            {badgeFrequentie.length===0
              ?<div style={{fontSize:14,color:WITD}}>{t("Nog geen prestaties behaald in deze selectie.")}</div>
              :badgeFrequentie.map(([label,d])=>(
                <div key={label} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${KBDR}`}}>
                  <span style={{fontSize:13,color:WITD}}>{d.emoji} {badgeLabel(label)} <span style={{color:WITD,opacity:0.7}}>×{d.aantal}</span></span>
                  <span style={{fontSize:14,fontWeight:"bold",color:GOUD}}>{d.punten}pt</span>
                </div>
              ))
            }
          </div>

          <div style={{background:KBG,border:`1px solid ${KBDR}`,borderRadius:10,padding:"12px"}}>
            <div style={{fontSize:13,color:GOUD,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>{t("Mijlpalen")}</div>
            <div style={{fontSize:11,color:WITD,opacity:0.75,marginBottom:10}}>{t("Voor trouw blijven spelen — los van je niveau of gemiddelde")}</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
              {berekenMijlpalen(partijen).map(function(m){
                return(
                  <div key={m.type+m.aantal} style={{background:m.bereikt?"rgba(201,168,76,0.15)":"var(--c-1c2e18)",border:"1px solid "+(m.bereikt?GOUD:KBDR),borderRadius:8,padding:"8px 4px",textAlign:"center",opacity:m.bereikt?1:0.55}}>
                    <div style={{fontSize:18}}>{m.emoji}</div>
                    <div style={{fontSize:11,color:m.bereikt?GOUD:WITD,fontWeight:m.bereikt?"bold":"normal",marginTop:2}}>{m.naam}</div>
                    <div style={{fontSize:14}}>{m.bereikt?"✅":"🔒"}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <button onClick={function(){setBadgeCatalogusOpen(true);}} style={{width:"100%",padding:12,background:"none",border:"1px solid "+GOUD,borderRadius:10,color:GOUD,cursor:"pointer",fontSize:14,fontFamily:"inherit"}}>🎖️ {t("Alle badges bekijken")}</button>
        </div>}

        </div>
      </div>
      {niveauOpen&&<NiveauOverzicht niveau={niveau} discipline={discipline} onClose={function(){setNiveauOpen(false);}}/>}
      {badgeCatalogusOpen&&<BadgeCatalogus discipline={discipline} onClose={function(){setBadgeCatalogusOpen(false);}}/>}
      {uitlegSectie&&(
        <div onClick={function(){setUitlegSectie(null);}} style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.7)",zIndex:250,display:"flex",alignItems:"center",justifyContent:"center",padding:20,cursor:"pointer"}}>
          <div onClick={function(e){e.stopPropagation();}} style={{background:"linear-gradient(160deg,var(--c-1e3a1e),var(--c-0d1f0d))",border:"2px solid #7fd8e0",borderRadius:16,padding:"18px 18px",maxWidth:340,width:"100%",maxHeight:"calc(85vh / var(--zoom,1))",overflowY:"auto",boxShadow:"0 10px 40px rgba(0,0,0,0.6)"}}>
            <div style={{fontSize:16,fontWeight:"bold",color:"#7fd8e0",marginBottom:8}}>❓ {UITLEG_TITEL[uitlegSectie]}</div>
            <div style={{fontSize:14,color:WITD,lineHeight:1.5}}>{UITLEG_TEKST[uitlegSectie]}</div>
            <div onClick={function(){setUitlegSectie(null);}} style={{textAlign:"center",marginTop:14,fontSize:12,color:WITD,opacity:0.7,cursor:"pointer",padding:"6px 0"}}>{t("Tik om te sluiten")}</div>
          </div>
        </div>
      )}
    </div>
  );
}
