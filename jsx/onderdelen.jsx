// Kleine, herbruikbare UI-onderdelen van Biljart Tracker: grafiekjes, balkjes, opmerkingen-raster,
// beurtregel, prestatie-overzicht en niveaukaart. JSX: geladen via Babel (type="text/babel") als
// eerste Babel-script, vóór de code in index.html. Alles hier is daarna overal beschikbaar.

const {useState,useEffect,useRef,useMemo,useContext}=React;
// Staat het spelelement (badges, punten, slechtste partijen schrappen) aan? Uit = niets daarvan tonen.
const SpelContext=React.createContext(true);
// Eenvoudige modus (Info > Weergave): spelen zonder opmerkingen-stap, geen spelelement, minder Dash-onderdelen
const EenvoudigContext=React.createContext(false);
// Kop en tabbalk (index.html, kopBlok): elk tabblad zet die bovenaan zijn eigen scrollvak, zodat de kop meeschuift
// met de inhoud. null = de kop staat vast bovenaan (tijdens een partij).
const KopContext=React.createContext(null);
// Opmerkingen van een opgeslagen partij achteraf aanvullen/wijzigen: slaOpmerkingenOp(partijId,beurten) uit index.html.
// null (bijv. een oude index.html met nieuwe jsx) = knop niet tonen.
const OpmerkingenContext=React.createContext(null);

// Logo in de kop: laken (kleur van de discipline via --c-3f8a3a/--c-1d4a1d), twee gekruiste keus en drie
// ballen met glimlicht en schaduw. SVG met kleuren via style (var() werkt niet in SVG-attributen).
function Logo({maat=44}){
  const bal=function(x,y,kleur,id){
    return(
      <g>
        <ellipse cx={x+1.5} cy={y+8} rx={8} ry={2.6} style={{fill:"rgba(0,0,0,0.35)"}}/>
        <circle cx={x} cy={y} r={8.5} style={{fill:"url(#"+id+")"}}/>
        <circle cx={x-2.8} cy={y-3} r={2.2} style={{fill:"rgba(255,255,255,0.85)"}}/>
      </g>
    );
  };
  const balKleur=function(id,licht,donker){
    return(
      <radialGradient id={id} cx="35%" cy="30%" r="75%">
        <stop offset="0%" style={{stopColor:licht}}/><stop offset="100%" style={{stopColor:donker}}/>
      </radialGradient>
    );
  };
  // Keu: dun lichtgekleurd hout naar de tip, donker handvat met een goud ringetje
  const keu=function(x1,y1,x2,y2){
    const mx=x1+(x2-x1)*0.3,my=y1+(y2-y1)*0.3;
    return(
      <g style={{strokeLinecap:"round"}}>
        <line x1={x1} y1={y1} x2={x2} y2={y2} style={{stroke:"rgba(0,0,0,0.3)",strokeWidth:5.5}} transform="translate(1.5,2)"/>
        <line x1={mx} y1={my} x2={x2} y2={y2} style={{stroke:"url(#lg-hout)",strokeWidth:3.2}}/>
        <line x1={x1} y1={y1} x2={mx} y2={my} style={{stroke:"#2b1a10",strokeWidth:5.2}}/>
        <line x1={mx-(x2-x1)*0.015} y1={my-(y2-y1)*0.015} x2={mx+(x2-x1)*0.015} y2={my+(y2-y1)*0.015} style={{stroke:GOUD,strokeWidth:5.4}}/>
        <line x1={x2-(x2-x1)*0.03} y1={y2-(y2-y1)*0.03} x2={x2} y2={y2} style={{stroke:"#f5f0e8",strokeWidth:3.2}}/>
      </g>
    );
  };
  return(
    <svg width={maat} height={maat} viewBox="0 0 100 100" style={{flexShrink:0,display:"block"}} aria-label="Biljart Tracker">
      <defs>
        <radialGradient id="lg-laken" cx="50%" cy="42%" r="70%">
          <stop offset="0%" style={{stopColor:"var(--c-3f8a3a)"}}/><stop offset="100%" style={{stopColor:"var(--c-1d4a1d)"}}/>
        </radialGradient>
        <linearGradient id="lg-glans" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{stopColor:"rgba(255,255,255,0.22)"}}/><stop offset="45%" style={{stopColor:"rgba(255,255,255,0)"}}/>
        </linearGradient>
        <linearGradient id="lg-hout" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" style={{stopColor:"#8a5a2b"}}/><stop offset="100%" style={{stopColor:"#f0d39a"}}/>
        </linearGradient>
        {balKleur("lg-rood","#ff7a6b","#a3120b")}
        {balKleur("lg-wit","#ffffff","#cfc9bc")}
        {balKleur("lg-geel","#ffe58a","#d18a00")}
      </defs>
      <rect x="2" y="2" width="96" height="96" rx="22" style={{fill:"url(#lg-laken)",stroke:GOUD,strokeWidth:2.5,strokeOpacity:0.8}}/>
      {keu(14,88,86,16)}
      {keu(86,88,14,16)}
      {bal(50,26,"rood","lg-rood")}
      {bal(25,50,"wit","lg-wit")}
      {bal(75,50,"geel","lg-geel")}
      <rect x="2" y="2" width="96" height="96" rx="22" style={{fill:"url(#lg-glans)"}}/>
    </svg>
  );
}

function Grafiek({beurten,discipline}){
  // Past zich aan de beschikbare breedte aan, zodat alle beurten in beeld zijn. Bij heel veel beurten (minder dan 6 px per
  // beurt) scrolt hij zijwaarts en schuift hij vanzelf mee naar de laatste beurt.
  const vakRef=useRef(null);
  const [breedte,setBreedte]=useState(0);
  const n=beurten?beurten.length:0;
  useEffect(function(){
    const el=vakRef.current;if(!el)return;
    const meet=function(){setBreedte(el.clientWidth);};
    meet();
    if(typeof ResizeObserver==="undefined")return;
    const ro=new ResizeObserver(meet);ro.observe(el);return function(){ro.disconnect();};
  },[n>=2]);
  useEffect(function(){const el=vakRef.current;if(el)el.scrollLeft=el.scrollWidth;},[n,breedte]);
  const opbouwMin=beurtDrempels(discipline||"libre").opbouwMin;
  if(!beurten||beurten.length<2)return null;
  const vals=beurten.map(b=>b.caramboles);
  const maxV=Math.max(...vals,1);
  const lp=8,tp=16,H=36;
  const ruimte=breedte>0?(breedte-lp-8)/(vals.length-1):300/vals.length;
  const ppp=Math.max(6,Math.min(18,ruimte));
  const W=lp+ppp*(vals.length-1);
  const ps=vals.map((v,i)=>(lp+i*ppp)+","+(tp+H-(v/maxV)*H)).join(" ");
  const fs=ppp<9?7:ppp<12?8:9;
  return(
    <div ref={vakRef} data-grafiek="" style={{overflowX:"auto"}}>
      <svg width={Math.max(W+8,40)} height={H+tp+6} style={{overflow:"visible",display:"block"}}>
        <polyline points={ps} fill="none" stroke={GOUD} strokeWidth="1.5" strokeLinejoin="round"/>
        {vals.map(function(v,i){
          const cx=lp+i*ppp,cy=tp+H-(v/maxV)*H;
          const k=beurtKleur(v,discipline||"libre");
          return React.createElement("g",{key:i},
            React.createElement("circle",{cx:cx,cy:cy,r:v>=opbouwMin?3:2,fill:k}),
            React.createElement("text",{x:cx,y:cy-5,textAnchor:"middle",fontSize:fs,fill:k,fontFamily:"Georgia,serif",fontWeight:v>=opbouwMin?"bold":"normal"},v)
          );
        })}
      </svg>
    </div>
  );
}

function OpmGrid({lijst,prefix,kleur,geselecteerd,toggle,vullen}){
  // vullen: het raster neemt de beschikbare hoogte (tijdens het spelen) en alles moet in één keer in beeld. Het meet de
  // ruimte per rij: krap = zonder icoontjes, nog krapper = ook kleinere tekst. Past het dan nog niet: scrollen als vangnet.
  const ref=useRef(null);
  const [krap,setKrap]=useState(0);
  const rijen=Math.ceil(lijst.length/3);
  useEffect(function(){
    if(!vullen)return;
    const el=ref.current;if(!el)return;
    const meet=function(){
      const rij=(el.clientHeight-16-5*(rijen-1))/rijen; // padding 8+8, gap 5
      setKrap(rij>=50?0:rij>=34?1:2);
    };
    meet();
    if(typeof ResizeObserver==="undefined")return;
    const ro=new ResizeObserver(meet);ro.observe(el);return function(){ro.disconnect();};
  },[vullen,rijen]);
  return(
    <div ref={ref} data-opmgrid={vullen?krap:undefined} style={Object.assign({display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:5,padding:"8px 12px"},
      vullen?{flex:1,minHeight:0,gridAutoRows:"1fr",overflowY:"auto"}:null)}>
      {lijst.map(function(o){
        const key=prefix+o.label;
        const actief=geselecteerd.has(key);
        return(
          <button key={o.label} onClick={function(){toggle(key);}}
            style={{background:actief?(kleur===ROOD?"#3a1010":"var(--c-1a3a1a)"):"var(--c-1c3019)",border:"1px solid "+(actief?kleur:KBDR),borderRadius:8,padding:krap?"2px 3px":"7px 4px",color:actief?kleur:WITD,cursor:"pointer",
              fontSize:krap===2?11.5:13,lineHeight:1.15,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,fontFamily:"inherit",minHeight:0,overflow:"hidden"}}>
            {!krap&&<span style={{fontSize:14}}>{o.emoji}</span>}
            <span>{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function LogRij({b,nr,discipline}){
  const isPoedel=b.caramboles===0;
  const heeftGemist=(b.gemist||[]).length>0;
  const heeftGoed=(b.goed||[]).length>0;
  const oudeOpm=b.opmerking&&b.opmerking!==""?b.opmerking:null;
  return(
    <div style={{borderBottom:"1px solid "+KBDR,padding:"5px 0"}}>
      <div style={{display:"flex",alignItems:"center",gap:6}}>
        <span style={{fontSize:13,color:WITD,minWidth:18,textAlign:"right"}}>{nr}</span>
        <span style={{fontSize:20,fontWeight:"bold",color:b.caramboles>=beurtDrempels(discipline||"libre").opbouwMin?GOUDL:isPoedel?"#e08055":WIT,minWidth:26}}>{b.caramboles}</span>
        <div style={{flex:1,display:"flex",gap:3,flexWrap:"wrap",alignItems:"center"}}>
          {isPoedel&&<span style={{fontSize:13,background:"#3a1010",color:"#e08055",borderRadius:3,padding:"2px 6px",fontWeight:"bold"}}>poedel</span>}
          {heeftGemist&&(b.gemist||[]).map(function(o){return <span key={o} style={{fontSize:13,background:"#3a1010",color:ROOD,borderRadius:3,padding:"2px 6px"}}>{o}</span>;})}
          {!isPoedel&&heeftGoed&&(b.goed||[]).map(function(o){return <span key={o} style={{fontSize:13,background:"#0f2e14",color:GRNT,borderRadius:3,padding:"2px 6px"}}>{o}</span>;})}
          {oudeOpm&&<span style={{fontSize:13,background:"var(--c-2a3d20)",color:GOUD,borderRadius:3,padding:"2px 6px"}}>{oudeOpm}</span>}
        </div>
      </div>
    </div>
  );
}

function PrestatieOverzicht({prestatie}){
  const [perCategorie,setPerCategorie]=useState(false);
  const badges=prestatie&&prestatie.badges?prestatie.badges:[];
  const groepen=useMemo(function(){
    const g={};
    badges.forEach(function(b){
      const k=b.categorie||"Overig";
      if(!g[k])g[k]=[];
      g[k].push(b);
    });
    return Object.entries(g).map(function(entry){
      const naam=entry[0],lijst=entry[1];
      return{naam:naam,lijst:lijst,subtotaal:lijst.reduce(function(a,b){return a+b.punten;},0)};
    });
  },[badges]);
  if(!prestatie||badges.length===0)return null;
  const punten=prestatie.punten;
  return(
    <div style={{marginTop:10,marginBottom:10,background:"var(--c-1a2e10)",border:"1px solid "+GOUD,borderRadius:8,padding:"8px 10px"}}>
      <button onClick={function(){setPerCategorie(function(v){return !v;});}}
        style={{width:"100%",background:"none",border:"none",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer",fontFamily:"inherit",padding:0,marginBottom:6}}>
        <span style={{fontSize:13,color:GOUD,textTransform:"uppercase",letterSpacing:1}}>Prestaties · {punten}pt totaal</span>
        <span style={{fontSize:12,color:WITD}}>{perCategorie?"lijst ▸":"per categorie ▾"}</span>
      </button>
      {!perCategorie&&(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {prestatie.badges.map(function(b,i){
            return(
              <div key={i}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:WITD}}>
                  <span>{b.emoji} {b.label}{b.aantal>1?" ×"+b.aantal:""}</span>
                  <span style={{color:GOUD,fontWeight:"bold"}}>+{b.punten}</span>
                </div>
                {b.detail&&<div style={{fontSize:12,color:WITD,opacity:0.65,marginTop:1}}>{b.detail}</div>}
              </div>
            );
          })}
        </div>
      )}
      {perCategorie&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {groepen.map(function(g){
            return(
              <div key={g.naam}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:GOUDL,marginBottom:4,fontWeight:"bold"}}>
                  <span>{g.naam}</span><span>{g.subtotaal}pt</span>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {g.lijst.map(function(b,i){
                    return(
                      <div key={i} style={{paddingLeft:8}}>
                        <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:WITD}}>
                          <span>{b.emoji} {b.label}{b.aantal>1?" ×"+b.aantal:""}</span>
                          <span style={{color:GOUD}}>+{b.punten}</span>
                        </div>
                        {b.detail&&<div style={{fontSize:12,color:WITD,opacity:0.65,marginTop:1}}>{b.detail}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function NiveauKaart({niveau,compact,discipline,onClick}){
  const spel=useContext(SpelContext);
  const dec=discipline==="driebanden"?3:2;
  if(compact){
    return(
      <div onClick={onClick} style={{background:"linear-gradient(160deg,var(--c-1e3a1e),var(--c-0d1f0d))",border:"2px solid "+niveau.huidig.kleur,borderRadius:12,padding:"10px 12px",cursor:onClick?"pointer":"default"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:34,height:34,borderRadius:"50%",background:"radial-gradient(circle at 35% 30%,"+niveau.huidig.kleur+"dd,"+niveau.huidig.kleur+"44)",border:"2px solid "+niveau.huidig.kleur,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>
            {niveau.huidig.emoji}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
              <span style={{fontSize:14,fontWeight:"bold",color:niveau.huidig.kleur}}>{niveau.huidig.naam}</span>
              <span style={{fontSize:15,fontWeight:"bold",color:GOUD}}>{niveau.effectiefGemiddelde.toFixed(dec)}</span>
            </div>
            <div style={{fontSize:12,letterSpacing:1}}>{"★".repeat(niveau.sterren)}{"☆".repeat(5-niveau.sterren)}</div>
            {niveau.moyenne!==undefined&&<div style={{fontSize:11,color:WITD,marginTop:2}}>{vormUitleg(niveau,dec)}</div>}
          </div>
        </div>
        {niveau.volgende&&<div style={{marginTop:6}}>
          <DashBalk pct={niveau.progressPct} kleur={niveau.huidig.kleur} hoogte={6}/>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:3,fontSize:11,color:WITD}}>
            <span>{niveau.progressPct}%</span>
            <span>{niveau.volgende.emoji} {niveau.volgende.naam} · gem {niveau.volgende.gemDrempel.toFixed(dec)}</span>
          </div>
        </div>}
      </div>
    );
  }
  return(
    <div onClick={onClick} style={{background:"linear-gradient(160deg,var(--c-1e3a1e),var(--c-0d1f0d))",border:"2px solid "+niveau.huidig.kleur,borderRadius:14,padding:"16px",cursor:onClick?"pointer":"default"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
        <div style={{width:52,height:52,borderRadius:"50%",background:"radial-gradient(circle at 35% 30%,"+niveau.huidig.kleur+"dd,"+niveau.huidig.kleur+"44)",border:"3px solid "+niveau.huidig.kleur,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,boxShadow:"0 0 16px "+niveau.huidig.kleur+"88"}}>
          {niveau.huidig.emoji}
        </div>
        <div>
          <div style={{fontSize:20,fontWeight:"bold",color:niveau.huidig.kleur}}>{niveau.huidig.naam}</div>
          <div style={{fontSize:13,letterSpacing:1}}>{"★".repeat(niveau.sterren)}{"☆".repeat(5-niveau.sterren)}</div>
        </div>
        <div style={{marginLeft:"auto",textAlign:"right"}}>
          <div style={{fontSize:12,color:WITD}}>{!niveau.venster&&!niveau.aantalDrops&&niveau.moyenne!==undefined?"moyenne":"vorm"}</div>
          <div style={{fontSize:16,fontWeight:"bold",color:GOUD}}>{niveau.effectiefGemiddelde.toFixed(dec)}</div>
        </div>
      </div>
      {/* Uitleg over de volle breedte (naast de klasse werd het bij grote tekst een smal, lang kolommetje) */}
      {niveau.moyenne!==undefined&&<div style={{fontSize:12,color:WITD,lineHeight:1.4,marginTop:-4,marginBottom:12}}>{vormUitleg(niveau,dec)}</div>}
      {niveau.volgende
        ?<>
          <DashBalk pct={niveau.progressPct} kleur={niveau.huidig.kleur} hoogte={9}/>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:5,fontSize:13}}>
            <span style={{fontWeight:"bold",color:niveau.huidig.kleur}}>{niveau.effectiefGemiddelde.toFixed(dec)}</span>
            <span style={{fontSize:12,color:WITD}}>{niveau.volgende.emoji} {niveau.volgende.naam} · gem {niveau.volgende.gemDrempel.toFixed(dec)}</span>
          </div>
        </>
        :<div style={{textAlign:"center",fontSize:13,color:niveau.huidig.kleur,fontWeight:"bold"}}>Hoogste niveau bereikt! 💎</div>
      }

      {/* Punten tot de volgende schrapping: niet als schrappen uit staat (klasse-overzicht) */}
      {spel&&niveau.schrapt!==false&&<div style={{marginTop:12,background:"rgba(0,0,0,0.2)",borderRadius:8,padding:"9px 10px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
          <span style={{fontSize:13,color:WITD}}>🎖️ {niveau.venster?"Punten in je laatste "+niveau.aantalPartijen+" partijen":"Badge-punten"}</span>
          <span style={{fontSize:14,fontWeight:"bold",color:GOUD}}>{niveau.badgePunten} / {niveau.aantalDrops*PUNTEN_PER_DROP+PUNTEN_PER_DROP}pt</span>
        </div>
        <DashBalk pct={(niveau.badgePunten%PUNTEN_PER_DROP)/PUNTEN_PER_DROP*100} kleur={GOUD} hoogte={5}/>
        {niveau.aantalDrops>0
          ?<div style={{display:"flex",gap:6,marginTop:8,flexWrap:"wrap"}}>
            {Array.from({length:niveau.aantalDrops}).map(function(_,i){
              const p=niveau.gedroptePartijen[i];
              return(
                <div key={i} style={{background:"rgba(201,168,76,0.15)",border:"1px solid "+GOUD,borderRadius:10,padding:"5px 9px",textAlign:"center"}}>
                  <div style={{display:"flex",alignItems:"center",gap:4,justifyContent:"center"}}>
                    <span style={{fontSize:13}}>🥇</span>
                    <span style={{fontSize:12,color:GOUD,fontWeight:"bold"}}>{(i+1)*PUNTEN_PER_DROP}pt</span>
                  </div>
                  <div style={{fontSize:11,color:WITD,marginTop:2,textDecoration:"line-through",opacity:0.8}}>
                    p{p.nr} · gem {p.gem.toFixed(dec)}
                  </div>
                  <div style={{fontSize:10,color:"#ff9f80",marginTop:1}}>telt niet mee</div>
                </div>
              );
            })}
          </div>
          :<div style={{marginTop:8,fontSize:12,color:WITD,opacity:0.75,textAlign:"center"}}>
            Bij {PUNTEN_PER_DROP}pt: je slechtste partij schrappen uit je vorm
          </div>
        }
        <div style={{marginTop:8,fontSize:11,color:WITD,opacity:0.75,textAlign:"center"}}>
          {niveau.plafondBereikt
            ?"Maximum bereikt: nooit meer dan 1 op de 10 partijen geschrapt ("+niveau.maxDrops+" van "+niveau.aantalPartijen+")."
            :"Maximaal 1 op de 10 partijen kan geschrapt worden."}
        </div>
      </div>}

      {spel&&niveau.volgendeKandidaatId&&(
        <div style={{marginTop:8,textAlign:"center",fontSize:11,color:"#ff9f80"}}>
          🎯 Eerstvolgende partij die vervalt: p{niveau.volgendeKandidaatNr} (gem {niveau.volgendeKandidaatGem.toFixed(dec)})
        </div>
      )}
      {niveau.voorspelling&&niveau.volgende&&(
        <div style={{marginTop:8,textAlign:"center",fontSize:11,color:WITD}}>
          {niveau.voorspelling.recenteVorm===null
            ?"📈 Nog te weinig recente partijen voor een voorspelling"
            :niveau.voorspelling.mogelijk===false
              ?"📈 Je recente vorm ("+niveau.voorspelling.recenteVorm.toFixed(dec)+") ligt onder de "+niveau.volgende.gemDrempel.toFixed(dec)+" die nodig is voor "+niveau.volgende.naam
              :"📈 Bij je recente vorm ("+niveau.voorspelling.recenteVorm.toFixed(dec)+") bereik je "+niveau.volgende.naam+" over ongeveer "+niveau.voorspelling.aantalPartijen+" partijen"}
        </div>
      )}
    </div>
  );
}

function DashBalk({pct,kleur,hoogte=8}){
  return(
    <div style={{height:hoogte,background:"rgba(255,255,255,0.14)",border:"1px solid rgba(255,255,255,0.18)",borderRadius:4,overflow:"hidden",boxSizing:"border-box"}}>
      <div className="balk-groei" style={{height:"100%",width:Math.max(0,Math.min(100,pct))+"%",background:kleur,borderRadius:4,transition:"width 0.4s"}}/>
    </div>
  );
}

function DashGrafiek({data,h=70,grenzen}){
  if(!data||data.length<2)return null;
  const vals=data.filter(v=>v!==null);
  if(vals.length<1)return null;
  const max=Math.max(...vals,0.1);
  const W=data.length*16;
  // Bouw meerdere polyline segmenten zodat nulls een "gat" geven
  const segmenten=[];
  let huidig=[];
  data.forEach((v,i)=>{
    if(v!==null){
      huidig.push(`${i*16+8},${h-(v/max)*(h-8)+4}`);
    } else {
      if(huidig.length>1)segmenten.push(huidig.join(" "));
      huidig=[];
    }
  });
  if(huidig.length>1)segmenten.push(huidig.join(" "));
  return(
    <div style={{overflowX:"auto"}}>
      <svg width={W} height={h+8} style={{display:"block"}}>
        {(grenzen?[grenzen.laag,grenzen.hoog]:[1,2,3]).filter(v=>v>0).map(v=>(
          <line key={v} x1={0} y1={h-(v/max)*(h-8)+4} x2={W} y2={h-(v/max)*(h-8)+4}
            style={{stroke:KBDR}} strokeWidth="0.5" strokeDasharray="3,3"/>
        ))}
        {segmenten.map((pts,i)=>(
          <polyline key={i} points={pts} fill="none" style={{stroke:"var(--c-2d4a22)"}} strokeWidth="1.5" strokeLinejoin="round"/>
        ))}
        {data.map((v,i)=>{
          if(v===null)return null;
          const cx=i*16+8, cy=h-(v/max)*(h-8)+4;
          const k=grenzen?gemKleur(v,grenzen):v>=2.5?GRNT:v>=2?GOUD:v>=1.5?WITD:ROOD;
          return <g key={i}>
            <circle cx={cx} cy={cy} r={3} fill={k}/>
            <text x={cx} y={cy-6} textAnchor="middle" fontSize="8" fill={k} fontFamily="Georgia">{v}</text>
          </g>;
        })}
      </svg>
    </div>
  );
}
