// De vier schermen van de Spelen-tab (Setup -> Invoer -> Gemist -> Goed). Alle spelstatus leeft in
// BiljartTracker (index.html), omdat ook de kop (Afsluiten) en het opslaan-venster die gebruiken; de
// schermen krijgen die als één object `spel` mee en halen er bovenaan uit wat ze nodig hebben.
// JSX via Babel, na jsx/tabs.jsx.

// Spelen, voor de start: tafelmaat, partijdoel en Start partij (je klasse staat rechtsboven in de kop)
function SetupScherm({spel}){
  const {doel,doelType,huidigeDiscipline,lp,niveau,setBeurtNr,setCar,setConfPartij,setDoel,setDoelType,setFase,setInp,setLp,setNiveauOpen,setSel,setTafel,setUitlegOpen,setBriefjeOpen,tafel,totCarLp,weergaveTip,zieWeergaveTip,mijnDoel,openDoel}=spel;
  const kopBlok=useContext(KopContext);
  return(
    <div className="scrollvak" style={{flex:1,display:"flex",flexDirection:"column",padding:kopBlok?"0 14px 10px":"10px 14px",gap:7,overflowY:"auto"}}>
      {kopBlok&&kopBlok({rand:14,onder:3,gap:7})}
      {weergaveTip&&(
        <div style={{background:"rgba(201,168,76,0.12)",border:"1px solid "+GOUD,borderRadius:10,padding:"12px 14px"}}>
          <div style={{fontSize:15,color:GOUD,fontWeight:"bold",marginBottom:4}}>🔎 Nieuw: kies zelf hoe je de app ziet</div>
          <div style={{fontSize:14,color:WIT,lineHeight:1.5,marginBottom:10}}>
            Grotere letters en knoppen, of een eenvoudige weergave met alleen het belangrijkste. Standaard staat alles aan; je vindt het altijd bij Info → Weergave.
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={function(){zieWeergaveTip(true);}} style={{flex:1,padding:10,background:"linear-gradient(135deg,"+GOUD+","+GOUDL+")",border:"none",borderRadius:8,color:G,fontWeight:"bold",fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>Bekijken</button>
            <button onClick={function(){zieWeergaveTip(false);}} style={{flex:1,padding:10,background:"none",border:"1px solid "+KBDR,borderRadius:8,color:WITD,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>Niet nodig</button>
          </div>
        </div>
      )}
      {mijnDoel&&<DoelRing doel={mijnDoel} vorm={niveau.effectiefGemiddelde} discipline={huidigeDiscipline} onWijzig={openDoel}/>}
      <div style={{background:KBG,border:"1px solid "+KBDR,borderRadius:10,padding:"12px 14px"}}>
        <div style={{fontSize:13,textTransform:"uppercase",letterSpacing:2,color:WITD,marginBottom:8}}>Tafelmaat</div>
        {/* Eén rij van vier: zo past het hele scherm ook bij de grootste tekst */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>
          {Object.keys(TAFELS).map(function(t){
            return(
              <button key={t} style={{padding:"7px 2px",background:tafel===t?"var(--c-2d4a1e)":"none",border:"1px solid "+(tafel===t?GOUD:KBDR),borderRadius:8,color:tafel===t?GOUD:WITD,cursor:"pointer",fontFamily:"inherit",fontSize:14}}
                onClick={function(){setTafel(t);}}>
                <div style={{fontSize:15,fontWeight:tafel===t?"bold":"normal"}}>{TAFELS[t].label}</div>
                <div style={{fontSize:10,opacity:0.8}}>× {TAFELS[t].vol.split(" x ")[1]}</div>
              </button>
            );
          })}
        </div>
      </div>
      <div style={{background:KBG,border:"1px solid "+KBDR,borderRadius:10,padding:"10px 14px"}}>
        <div style={{fontSize:13,textTransform:"uppercase",letterSpacing:2,color:WITD,marginBottom:6}}>Partij doel</div>
        <div style={{display:"flex",gap:8,marginBottom:10}}>
          <button style={{flex:1,padding:"8px 8px",background:doelType==="beurten"?"var(--c-2d4a1e)":"none",border:"1px solid "+(doelType==="beurten"?GOUD:KBDR),borderRadius:8,color:doelType==="beurten"?GOUD:WITD,cursor:"pointer",fontFamily:"inherit",fontSize:15}}
            onClick={function(){setDoelType("beurten");}}>Beurten</button>
          <button style={{flex:1,padding:"8px 8px",background:doelType==="caramboles"?"var(--c-2d4a1e)":"none",border:"1px solid "+(doelType==="caramboles"?GOUD:KBDR),borderRadius:8,color:doelType==="caramboles"?GOUD:WITD,cursor:"pointer",fontFamily:"inherit",fontSize:15}}
            onClick={function(){setDoelType("caramboles");}}>Caramboles</button>
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:20,marginBottom:10}}>
          <button className="plusmin-btn" style={{width:38,height:38,borderRadius:"50%",background:"none",border:"2px solid "+GOUD,color:GOUD,fontSize:22,cursor:"pointer"}}
            onClick={function(){setDoel(function(n){return Math.max(5,n-5);});}}>-</button>
          <div style={{textAlign:"center",width:100}}>
            <div style={{fontSize:32,fontWeight:"bold",color:WIT,lineHeight:1}}>{doel}</div>
            <div style={{fontSize:13,color:WITD,marginTop:2}}>{doelType==="beurten"?"beurten":"caramboles"}</div>
          </div>
          <button className="plusmin-btn" style={{width:38,height:38,borderRadius:"50%",background:"none",border:"2px solid "+GOUD,color:GOUD,fontSize:22,cursor:"pointer"}}
            onClick={function(){setDoel(function(n){return n+5;});}}>+</button>
        </div>
        <div style={{display:"flex",gap:6}}>
          {(doelType==="beurten"?[15,20,25,30]:[50,75,100,150]).map(function(n){
            return <button key={n} style={{flex:1,padding:"7px 0",background:doel===n?"var(--c-2d4a1e)":"none",border:"1px solid "+(doel===n?GOUD:KBDR),borderRadius:6,color:doel===n?GOUD:WITD,cursor:"pointer",fontFamily:"inherit",fontSize:14}}
              onClick={function(){setDoel(n);}}>{n}</button>;
          })}
        </div>
      </div>
      {lp.length>0&&(
        <div style={{background:"var(--c-1a2e10)",border:"1px solid "+GOUD,borderRadius:10,padding:"10px 14px",fontSize:14,color:WITD}}>
          Lopende partij: {lp.length} beurten - {totCarLp} car - tafel {tafelLabel(tafel)}
          <div style={{display:"flex",gap:8,marginTop:8}}>
            <button style={{flex:1,padding:8,background:"none",border:"1px solid "+GOUD,borderRadius:6,color:GOUD,cursor:"pointer",fontFamily:"inherit",fontSize:14}}
              onClick={function(){setFase("invoer");}}>Doorgaan</button>
            <button style={{flex:1,padding:8,background:"#7a3030",border:"none",borderRadius:6,color:WIT,cursor:"pointer",fontFamily:"inherit",fontSize:14}}
              onClick={function(){setConfPartij(true);}}>Afsluiten</button>
          </div>
        </div>
      )}
      {/* Start partij blijft onderaan in beeld, ook als het scherm te klein is (bijv. iPhone SE met extra grote tekst) */}
      <button style={{position:"sticky",bottom:0,zIndex:2,flexShrink:0,padding:18,background:"linear-gradient(135deg,"+GOUD+","+GOUDL+")",border:"none",borderRadius:12,color:G,fontSize:17,fontWeight:"bold",cursor:"pointer",fontFamily:"inherit",boxShadow:"0 -6px 14px "+G}}
        onClick={function(){setLp([]);setBeurtNr(1);setCar(0);setInp("0");setSel(new Set());setFase("invoer");}}>
        Start partij
      </button>
      <button onClick={function(){setBriefjeOpen(true);}}
        style={{padding:"11px",background:"none",border:"1px solid "+KBDR,borderRadius:12,color:WIT,fontSize:15,cursor:"pointer",fontFamily:"inherit"}}>
        📷 Partij van een wedstrijdbriefje
      </button>
      <button onClick={function(){setUitlegOpen(true);}}
        style={{padding:"8px",background:"none",border:"none",color:WIT,fontSize:15,cursor:"pointer",fontFamily:"inherit",textDecoration:"underline",textUnderlineOffset:3}}>
        ℹ️ Zo werkt de app
      </button>
    </div>
  );
}

// Spelen, tijdens de partij: tellers, caramboles invoeren, hints en grafiek van de lopende partij
function InvoerScherm({spel}){
  const spelAan=useContext(SpelContext);
  const {alleP,beurtNr,car,doel,doelType,eenvoudig,huidigeDiscipline,huidigeRecords,inp,inputRef,lp,niveau,noteer,progPct,setBeurtNr,setCar,setFase,setInp,setLp,stL,tafel,tijdsvensterMaanden,totCarLp}=spel;
  // Eenvoudige modus: Noteer slaat de beurt meteen op, zonder de stap met opmerkingen
  const volgende=function(){if(eenvoudig)noteer();else setFase("gemist");};
  const dInv=beurtDrempels(huidigeDiscipline);
  const s57=lp.filter(function(b){return b.caramboles>=dInv.opbouwMin&&b.caramboles<=dInv.opbouwMax;}).length;
  const s89=lp.filter(function(b){return b.caramboles>=dInv.sterkMin&&b.caramboles<=dInv.sterkMax;}).length;
  const s10=lp.filter(function(b){return b.caramboles>=dInv.topMin;}).length;
  const poedels=lp.filter(function(b){return b.caramboles===0;}).length;
  const poedelPct=lp.length>0?Math.round(poedels/lp.length*100):0;
  const opbouwPct=lp.length>0?Math.round((stL?stL.opbouw5:0)/lp.length*100):0;
  let partijPunten=0;
  if(lp.length>0){
    const virtuelePartij=Object.assign({id:-1,datum:new Date().toISOString(),tafel:tafel,discipline:huidigeDiscipline,beurten:lp},stat(lp,huidigeDiscipline));
    const resultaten=berekenPrestaties(alleP.concat([virtuelePartij]),tijdsvensterMaanden,huidigeDiscipline);
    const entry=resultaten.find(function(r){return r.id===-1;});
    partijPunten=entry?entry.punten:0;
  }
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{height:3,background:KBDR,flexShrink:0}}>
        <div style={{height:3,background:GOUD,width:progPct+"%",transition:"width 0.3s"}}/>
      </div>
      <div style={{padding:"10px 12px 6px",flexShrink:0}}>
        {spelAan&&<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"var(--c-182e14)",border:"1px solid "+GOUD,borderRadius:8,padding:"7px 10px",marginBottom:6}}>
          <span style={{fontSize:12,color:WITD}}>🎖️ Deze partij: <strong style={{color:GOUD}}>{partijPunten}pt</strong></span>
          <span style={{fontSize:12,color:WITD}}>Totaal: <strong style={{color:GOUD}}>{(niveau.badgePuntenTotaal!==undefined?niveau.badgePuntenTotaal:niveau.badgePunten)+partijPunten}pt</strong></span>
        </div>}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:6}}>
          {[["Gespeeld",lp.length,WIT],["Caramboles",stL?stL.totCar:0,GOUD],["Gem.",stL?stL.gemPerBeurt:"0.00",GOUDL],["Max",stL?stL.max:0,"#e8a84c"]].map(function(arr){
            return(
              <div key={arr[0]} style={{textAlign:"center",background:"var(--c-182e14)",border:"1px solid "+KBDR,borderRadius:8,padding:"7px 2px"}}>
                <div style={{fontSize:20,fontWeight:"bold",color:arr[2],lineHeight:1}}>{arr[1]}</div>
                <div style={{fontSize:11,color:WITD,marginTop:3,textTransform:"uppercase",letterSpacing:0.5}}>{arr[0]}</div>
              </div>
            );
          })}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 2fr",gap:6}}>
          <div style={{background:"var(--c-182e14)",border:"1px solid "+KBDR,borderRadius:8,padding:"7px 6px",textAlign:"center"}}>
            <div style={{fontSize:18,fontWeight:"bold",color:GRNT,lineHeight:1}}>{stL?stL.opbouw5:0}x</div>
            <div style={{fontSize:11,color:WITD,marginTop:3,textTransform:"uppercase",letterSpacing:0.5}}>Opbouw {dInv.opbouwMin}+</div>
            <div style={{fontSize:13,color:GRNT,marginTop:1}}>{opbouwPct}%</div>
          </div>
          <div style={{background:"var(--c-182e14)",border:"1px solid "+KBDR,borderRadius:8,padding:"7px 6px",textAlign:"center"}}>
            <div style={{fontSize:18,fontWeight:"bold",color:poedels>0?"#e08055":WITD,lineHeight:1}}>{poedels}x</div>
            <div style={{fontSize:11,color:WITD,marginTop:3,textTransform:"uppercase",letterSpacing:0.5}}>Poedels</div>
            <div style={{fontSize:13,color:poedels>0?"#e08055":WITD,marginTop:1}}>{poedelPct}%</div>
          </div>
          <div style={{background:"var(--c-182e14)",border:"1px solid "+KBDR,borderRadius:8,padding:"7px 8px"}}>
            <div style={{fontSize:11,color:WITD,textTransform:"uppercase",letterSpacing:0.5,marginBottom:4}}>Series</div>
            <div style={{display:"flex",gap:4,justifyContent:"space-around"}}>
              {[[dInv.opbouwMin+"-"+dInv.opbouwMax,s57,"#4caf50"],[dInv.sterkMin+"-"+dInv.sterkMax,s89,"#e8c96a"],[dInv.topMin+"+",s10,"#ff9f40"]].map(function(arr){
                return(
                  <div key={arr[0]} style={{textAlign:"center"}}>
                    <div style={{fontSize:16,fontWeight:"bold",color:arr[1]>0?arr[2]:KBDR}}>{arr[1]}</div>
                    <div style={{fontSize:11,color:WITD}}>{arr[0]}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <div style={{padding:"6px 12px 10px",flexShrink:0,borderTop:"1px solid "+KBDR,borderBottom:"1px solid "+KBDR}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:16,marginBottom:4}}>
          <button className="plusmin-btn" style={{width:60,height:60,borderRadius:"50%",background:"none",border:"2px solid "+GOUD,color:GOUD,fontSize:30,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}
            onClick={function(){const n=Math.max(0,car-1);setCar(n);setInp(String(n));}}>-</button>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:13,color:WITD,marginBottom:4}}>{beurtNr}e Beurt</div>
            <input ref={inputRef} type="number" inputMode="numeric" pattern="[0-9]*" value={inp}
              onChange={function(e){const v=e.target.value;if(v===""||v==="-"){setInp(v);return;}const n=parseInt(v);if(!isNaN(n)&&n>=0){setCar(n);setInp(String(n));};}}
              onFocus={function(e){e.target.select();}}
              onKeyDown={function(e){if(e.key==="Enter")volgende();}}
              style={{width:86,fontSize:48,fontWeight:"bold",color:WIT,background:"transparent",border:"none",borderBottom:"3px solid "+(car>=dInv.opbouwMin?GRNT:GOUD),textAlign:"center",fontFamily:"Georgia,serif",outline:"none",paddingBottom:3}}
            />
            <div style={{fontSize:13,color:car>=dInv.opbouwMin?GRNT:GOUD,marginTop:4,height:18,lineHeight:"18px"}}>
              {car===0?"Poedel":car>=dInv.topMin?"💫 Topserie!":car>=dInv.sterkMin?"🔥 Sterke serie!":car>=dInv.opbouwMin?"🎯 Opbouw!":""}
            </div>
          </div>
          <button className="plusmin-btn" style={{width:60,height:60,borderRadius:"50%",background:"none",border:"2px solid "+GOUD,color:GOUD,fontSize:30,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}
            onClick={function(){const n=car+1;setCar(n);setInp(String(n));}}>+</button>
        </div>
        <div style={{display:"flex",gap:8,marginTop:10}}>
          <button className="plusmin-btn" style={{flex:1,padding:14,background:"linear-gradient(135deg,"+GOUD+","+GOUDL+")",border:"none",borderRadius:12,color:G,fontSize:16,fontWeight:"bold",cursor:"pointer",fontFamily:"inherit"}}
            onClick={volgende}>Noteer</button>
          {/* Eenvoudige modus: wil je bij deze beurt toch iets aanvinken, dan via de gewone opmerkingen-stap */}
          {eenvoudig&&<button style={{padding:"14px 11px",background:"none",border:"1px solid "+GOUD,borderRadius:12,color:GOUD,fontSize:14,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}
            onClick={function(){setFase("gemist");}}>+ opmerking</button>}
          <button style={{padding:"14px 13px",background:"none",border:"1px solid "+KBDR,borderRadius:12,color:WITD,fontSize:15,cursor:"pointer",fontFamily:"inherit"}}
            onClick={function(){if(lp.length){setLp(function(p){return p.slice(0,-1);});setBeurtNr(function(n){return Math.max(1,n-1);});}else{setFase("setup");}}}>terug</button>
        </div>
      </div>
      <div style={{padding:"8px 12px",flex:1,overflowY:"auto"}}>
        {(function(){
          let huidigeStreak=0;
          for(let i=lp.length-1;i>=0;i--){
            if(lp[i].caramboles>0)huidigeStreak++;
            else break;
          }
          const hints=[];
          if(huidigeStreak>0&&huidigeStreak<8){
            if(huidigeStreak<5)hints.push(spelAan&&"⛓️ Reeks zonder poedel: "+huidigeStreak+" (nog "+(5-huidigeStreak)+" tot 15pt)");
            else hints.push(spelAan&&"⛓️ Reeks zonder poedel: "+huidigeStreak+" (nog "+(8-huidigeStreak)+" tot 25pt)");
          }
          if(lp.length>0&&lp[lp.length-1].caramboles===0){
            hints.push(spelAan&&"💪 Volgende beurt "+dInv.opbouwMin+"+ car = sterk herstel (+15pt)");
          }
          if(stL){
            const gemNu=parseFloat(stL.gemPerBeurt);
            const basisNu=huidigeRecords.totaalGem!==null?huidigeRecords.totaalGem:0;
            const stapNu=gemStap(huidigeDiscipline);
            const drempel1Nu=gemDrempelBoven(basisNu,stapNu);
            const drempel2Nu=Math.round((drempel1Nu+stapNu)*1000)/1000;
            if(gemNu<drempel2Nu){
              const drempel=gemNu<drempel1Nu?drempel1Nu:drempel2Nu;
              const afstand=drempel-gemNu;
              if(afstand<stapNu)hints.push(spelAan&&"⭐ Nog "+afstand.toFixed(2)+" tot gemiddelde "+gemDrempelTekst(drempel,stapNu));
            }
            if(huidigeRecords.allTimeBestGem>0){
              const afstandRecord=huidigeRecords.allTimeBestGem-gemNu;
              if(afstandRecord>0&&afstandRecord<0.3)hints.push("👑 Nog "+afstandRecord.toFixed(2)+" tot je beste gemiddelde ooit ("+huidigeRecords.allTimeBestGem.toFixed(2)+")");
            }
            const tafelRecord=huidigeRecords.tafelBest[tafel];
            if(tafelRecord&&tafelRecord>0){
              const afstandTafel=tafelRecord-gemNu;
              if(afstandTafel>0&&afstandTafel<0.3)hints.push("🔝 Nog "+afstandTafel.toFixed(2)+" tot je tafelrecord ("+tafelRecord.toFixed(2)+")");
            }
            if(huidigeRecords.totaalGem!==null){
              const afstandTotaal=huidigeRecords.totaalGem-gemNu;
              if(afstandTotaal>0&&afstandTotaal<0.3)hints.push("📊 Nog "+afstandTotaal.toFixed(2)+" tot je totaalgemiddelde ("+huidigeRecords.totaalGem.toFixed(2)+")");
            }
            if(huidigeRecords.rolling5p!==null){
              const afstandRolling=huidigeRecords.rolling5p-gemNu;
              if(afstandRolling>0&&afstandRolling<0.3)hints.push("📉 Nog "+afstandRolling.toFixed(2)+" tot je 5-partij rolling gemiddelde ("+huidigeRecords.rolling5p.toFixed(2)+")");
            }
          }
          if(lp.length>=3){
            const poedelsNu=lp.filter(function(x){return x.caramboles===0;}).length;
            if(poedelsNu===0){
              hints.push(spelAan&&"🛡️ Nog 0 poedels in "+lp.length+" beurten, blijf dit volhouden voor +30pt");
            }else{
              const poedelPctNu=poedelsNu/lp.length*100;
              if(poedelPctNu<20)hints.push(spelAan&&"✅ "+Math.round(poedelPctNu)+"% poedels tot nu toe (drempel: <20%)");
            }
          }
          if(lp.length>0&&huidigeRecords.allTimeMaxBeurt>0){
            const maxInPartij=Math.max.apply(null,lp.map(function(x){return x.caramboles;}));
            const afstandMax=huidigeRecords.allTimeMaxBeurt-maxInPartij;
            if(afstandMax>0&&afstandMax<=3)hints.push("🏆 Hoogste beurt nu: "+maxInPartij+" car (record: "+huidigeRecords.allTimeMaxBeurt+" car)");
          }
          const helftNu=Math.floor(lp.length/2);
          if(helftNu>=3&&huidigeRecords.totaalGem!==null){
            const eersteNu=lp.slice(0,helftNu),tweedeNu=lp.slice(helftNu);
            const gemENu=eersteNu.reduce(function(a,b){return a+b.caramboles;},0)/eersteNu.length;
            const gemTNu=tweedeNu.reduce(function(a,b){return a+b.caramboles;},0)/tweedeNu.length;
            if(gemTNu>gemENu&&stL&&parseFloat(stL.gemPerBeurt)>huidigeRecords.totaalGem){
              hints.push(spelAan&&"📈 Tot nu toe op koers voor sterke afsluiting: 1e helft "+gemENu.toFixed(2)+" · 2e helft "+gemTNu.toFixed(2)+" (schatting, kan nog veranderen)");
            }
          }
          if(doel&&doelType==="caramboles"){
            if(totCarLp<doel)hints.push("🎯 Nog "+(doel-totCarLp)+" caramboles tot je doel");
          }
          const zichtbaar=hints.filter(Boolean); // badge-hints zijn false als het spelelement uit staat
          if(zichtbaar.length===0)return null;
          return(
            <div style={{background:"var(--c-182e14)",border:"1px solid "+GOUD,borderRadius:8,padding:"7px 10px",marginBottom:6}}>
              {zichtbaar.map(function(h,i){return <div key={i} style={{fontSize:13,color:WITD,padding:"2px 0"}}>{h}</div>;})}
            </div>
          );
        })()}
        {lp.length>1&&(
          <div style={{background:"var(--c-182e14)",border:"1px solid "+KBDR,borderRadius:8,padding:"6px 8px"}}>
            <Grafiek beurten={lp} discipline={huidigeDiscipline}/>
          </div>
        )}
      </div>
    </div>
  );
}

// Spelen, na een beurt: waardoor de serie eindigde
// Onderbalk met de vervolgknoppen van de opmerkingen-stappen (Gemist/Goed)
const STAP_KNOPPEN={padding:"10px 14px 12px",display:"flex",gap:8,flexShrink:0,borderTop:"1px solid "+KBDR,background:"var(--c-152015)"};

function GemistScherm({spel}){
  const {andersGemist,car,noteer,sel,setAndersGemist,setFase,toggle}=spel;
  const gs=Array.from(sel).filter(function(k){return k.startsWith("G__");});
  const heeftSelectie=gs.length>0||andersGemist.trim().length>0;
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      {/* Alles in één keer in beeld: titel, raster (vult de ruimte), Anders..., knoppen vast onderaan */}
      <div style={{flex:1,minHeight:0,display:"flex",flexDirection:"column"}}>
        <div style={{padding:"10px 14px 8px",borderBottom:"1px solid "+KBDR,flexShrink:0}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontSize:19,color:ROOD,fontWeight:"bold"}}>Gemist door — {car} {car===1?"carambole":"caramboles"}</div>
            {gs.length>0&&<span style={{fontSize:15,color:ROOD,fontWeight:"bold"}}>{gs.length}x</span>}
          </div>
          <div style={{fontSize:12,color:WITD,marginTop:2}}>Tik om te selecteren — je kunt er meerdere kiezen</div>
        </div>
        <OpmGrid lijst={GEMIST} prefix="G__" kleur={ROOD} geselecteerd={sel} toggle={toggle} vullen={true}/>
        <div style={{padding:"0 12px 8px",flexShrink:0}}>
          <input type="text" value={andersGemist} onChange={function(e){setAndersGemist(e.target.value);}}
            placeholder="Anders... (typ zelf iets)"
            style={{width:"100%",padding:"8px 10px",background:"var(--c-1c3019)",border:"1px solid "+KBDR,borderRadius:8,color:WIT,fontSize:13,fontFamily:"inherit"}}/>
        </div>
      </div>
      {/* Vervolgknoppen vast onderaan: altijd in beeld, ook bij grote tekst */}
      <div style={STAP_KNOPPEN}>
        <button style={{flex:1,padding:15,background:heeftSelectie?"linear-gradient(135deg,"+GOUD+","+GOUDL+")":"rgba(224,96,96,0.08)",border:"1px solid "+(heeftSelectie?"transparent":"rgba(224,96,96,0.45)"),borderRadius:12,color:heeftSelectie?G:"#e0a0a0",fontSize:15,fontWeight:"bold",cursor:"pointer",fontFamily:"inherit",transition:"all 0.25s"}}
          onClick={function(){if(car===0){noteer();}else{setFase("goed");}}}>
        {car===0?"Opslaan":"Volgende stap"}
      </button>
        <button style={{padding:"15px 12px",background:"none",border:"1px solid "+KBDR,borderRadius:12,color:WITD,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}
          onClick={function(){setFase("invoer");}}>terug</button>
      </div>
    </div>
  );
}

// Spelen, na een beurt met caramboles: wat er goed ging
function GoedScherm({spel}){
  const {andersGoed,noteer,sel,setAndersGoed,setFase,toggle}=spel;
  const gs=Array.from(sel).filter(function(k){return k.startsWith("P__");});
  const heeftSelectie=gs.length>0||andersGoed.trim().length>0;
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      {/* Alles in één keer in beeld: titel, raster (vult de ruimte), Anders..., knoppen vast onderaan */}
      <div style={{flex:1,minHeight:0,display:"flex",flexDirection:"column"}}>
        <div style={{padding:"10px 14px 8px",borderBottom:"1px solid "+KBDR,flexShrink:0}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontSize:19,color:GRNT,fontWeight:"bold"}}>Wat ging goed?</div>
            {gs.length>0&&<span style={{fontSize:15,color:GRNT,fontWeight:"bold"}}>{gs.length}x</span>}
          </div>
          <div style={{fontSize:12,color:WITD,marginTop:2}}>Tik om te selecteren — je kunt er meerdere kiezen</div>
        </div>
        <OpmGrid lijst={GOED} prefix="P__" kleur={GRNT} geselecteerd={sel} toggle={toggle} vullen={true}/>
        <div style={{padding:"0 12px 8px",flexShrink:0}}>
          <input type="text" value={andersGoed} onChange={function(e){setAndersGoed(e.target.value);}}
            placeholder="Anders... (typ zelf iets)"
            style={{width:"100%",padding:"8px 10px",background:"var(--c-1c3019)",border:"1px solid "+KBDR,borderRadius:8,color:WIT,fontSize:13,fontFamily:"inherit"}}/>
        </div>
      </div>
      {/* Vervolgknoppen vast onderaan: altijd in beeld, ook bij grote tekst */}
      <div style={STAP_KNOPPEN}>
        <button style={{flex:1,padding:15,background:heeftSelectie?"linear-gradient(135deg,"+GRNT+",#66bb6a)":"rgba(102,187,106,0.08)",border:"1px solid "+(heeftSelectie?"transparent":"rgba(102,187,106,0.45)"),borderRadius:12,color:heeftSelectie?WIT:"#a8d5aa",fontSize:15,fontWeight:"bold",cursor:"pointer",fontFamily:"inherit",transition:"all 0.25s"}}
          onClick={noteer}>Beurt opslaan</button>
        <button style={{padding:"15px 12px",background:"none",border:"1px solid "+KBDR,borderRadius:12,color:WITD,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}
          onClick={function(){setFase("gemist");}}>terug</button>
      </div>
    </div>
  );
}
