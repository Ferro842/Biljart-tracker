// Uitklapbare partijregels: PartijRij in de Stats-tab (met grafiek en series) en LogPartijRij in de
// Log-tab (beurt voor beurt). Beide gebruiken PartijLabels en PartijBeheer (notitie en verwijderen).
// JSX (vooraf omgezet door bouw-jsx.js), na jsx/vensters.jsx.

// Labels achter de datum van een partij: tafelmaat, badge-punten, geschrapt uit gemiddelde, notitie
function PartijLabels({p,punten,gedropt}){
  const spel=useContext(SpelContext);
  return(
    <>
      {p.tafel&&<span style={{fontSize:13,color:WITD,marginLeft:6,border:"1px solid "+KBDR,borderRadius:4,padding:"1px 5px"}}>{tafelLabel(p.tafel)}</span>}
      {spel&&punten>0&&<span style={{fontSize:13,color:GOUD,marginLeft:6,border:"1px solid "+GOUD,borderRadius:4,padding:"1px 5px"}}>{punten}pt</span>}
      {gedropt&&<span style={{fontSize:13,color:"#e8c96a",marginLeft:6}}>🏅 {t("geschrapt uit je vorm")}</span>}
      {p.notitie&&<span style={{fontSize:13,marginLeft:6}}>📝</span>}
    </>
  );
}

// Onderkant van een opengeklapte partij: notitie bewerken en partij verwijderen (met bevestiging)
function PartijBeheer({p,onNotitie,onVerwijder}){
  const [confVerwijder,setConfVerwijder]=useState(false);
  const slaOpmerkingenOp=useContext(OpmerkingenContext);
  const [opmOpen,setOpmOpen]=useState(false);
  const [notitieTekst,setNotitieTekst]=useState(p.notitie||"");
  return(
    <>
      {onNotitie&&(
        <div style={{marginTop:8}}>
          <div style={{fontSize:12,color:WITD,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>{t("Notitie")}</div>
          <textarea value={notitieTekst} onChange={function(e){setNotitieTekst(e.target.value);}}
            placeholder={t("Sfeer, met wie, hoe het voelde...")}
            style={{width:"100%",minHeight:50,background:"var(--c-182e14)",border:"1px solid "+KBDR,borderRadius:6,color:WIT,fontSize:13,padding:8,fontFamily:"inherit",resize:"vertical"}}/>
          {notitieTekst!==(p.notitie||"")&&(
            <button style={{marginTop:6,padding:"6px 12px",background:"var(--c-2d4a1e)",border:"1px solid "+GOUD,borderRadius:6,color:GOUD,cursor:"pointer",fontSize:13,fontFamily:"inherit"}}
              onClick={function(){onNotitie(p.id,notitieTekst);}}>{t("Notitie opslaan")}</button>
          )}
        </div>
      )}
      <div style={{marginTop:8,display:"flex",gap:8,flexWrap:"wrap"}}>
        {/* Opmerkingen achteraf aanvullen, ook als de partij zonder (of met weinig) opmerkingen is ingevuld */}
        {slaOpmerkingenOp&&<button onClick={function(){setOpmOpen(true);}}
          style={{padding:"6px 10px",background:"none",border:"1px solid "+GOUD,borderRadius:6,color:GOUD,cursor:"pointer",fontSize:13,fontFamily:"inherit"}}>✎ {t("Opmerkingen aanvullen")}</button>}
        <DeelKaartKnop partij={p} discipline={p.discipline||"libre"} stijl={{fontSize:13,padding:"6px 10px"}}/>
      </div>
      {opmOpen&&<OpmerkingenBewerken partij={p} discipline={p.discipline||"libre"} onOpslaan={slaOpmerkingenOp} onClose={function(){setOpmOpen(false);}}/>}
      {onVerwijder&&(
        !confVerwijder
          ?<button style={{marginTop:8,padding:"6px 10px",background:"none",border:"1px solid #7a3030",borderRadius:6,color:"#e06060",cursor:"pointer",fontSize:13,fontFamily:"inherit"}}
            onClick={function(){setConfVerwijder(true);}}>{t("Partij verwijderen")}</button>
          :<div style={{marginTop:8,background:"#2a1515",border:"1px solid #7a3030",borderRadius:6,padding:"8px 10px"}}>
            <div style={{fontSize:13,color:"#e06060",marginBottom:6}}>{t("Deze partij definitief verwijderen?")}</div>
            <div style={{display:"flex",gap:6}}>
              <button style={{flex:1,padding:6,background:"#7a3030",border:"none",borderRadius:5,color:WIT,cursor:"pointer",fontFamily:"inherit",fontSize:13}}
                onClick={function(){onVerwijder(p.id);}}>{t("Ja, verwijderen")}</button>
              <button style={{flex:1,padding:6,background:"none",border:"1px solid "+KBDR,borderRadius:5,color:WITD,cursor:"pointer",fontFamily:"inherit",fontSize:13}}
                onClick={function(){setConfVerwijder(false);}}>{t("Annuleer")}</button>
            </div>
          </div>
      )}
    </>
  );
}

function PartijRij({p,nr,prestatie,gedropt,discipline,onVerwijder,onNotitie}){
  const spel=useContext(SpelContext);
  const [open,setOpen]=useState(false);
  const st=stat(p.beurten,discipline);
  if(!st)return null;
  const dRij=beurtDrempels(discipline);
  const punten=prestatie?prestatie.punten:0;
  return(
    <div style={{borderBottom:"1px solid "+KBDR}}>
      <button onClick={function(){setOpen(function(v){return !v;});}}
        style={{width:"100%",background:"none",border:"none",color:"inherit",cursor:"pointer",fontFamily:"inherit",padding:"9px 0",display:"flex",justifyContent:"space-between",alignItems:"center",textAlign:"left"}}>
        <div>
          <div style={{fontSize:15,color:GOUD,textDecoration:gedropt?"line-through":"none",opacity:gedropt?0.6:1}}>{new Date(p.datum).toLocaleDateString(taalLocale(),{weekday:"short",day:"numeric",month:"short"})} · p{nr}<PartijLabels p={p} punten={punten} gedropt={gedropt}/></div>
          <div style={{fontSize:13,color:WITD,marginTop:2,opacity:gedropt?0.6:1}}>{t("{c} car · {b}b · gem {g} · max {m} · {p}x poedel",{c:st.totCar,b:st.aantalBeurten,g:decTekst(st.gemPerBeurt),m:st.max,p:st.poedels})}{strafTotaal(p)>0&&<span style={{color:ROOD}}> · {t("{n}x straf",{n:strafTotaal(p)})}</span>} · <span style={{color:GRNT}}>🎯{st.opbouw5}x</span></div>
        </div>
        <span style={{color:GOUD,fontSize:14,marginLeft:8}}>{open?"▲":"▼"}</span>
      </button>
      {open&&(
        <div style={{paddingBottom:10}}>
          <Grafiek beurten={p.beurten} discipline={discipline}/>
          <div style={{display:"flex",gap:6,marginTop:8,flexWrap:"wrap"}}>
            {[[dRij.opbouwMin+"-"+dRij.opbouwMax,st.opbouw57,"#4caf50"],[dRij.sterkMin+"-"+dRij.sterkMax,st.opbouw89,"#e8c96a"],[dRij.topMin+"+",st.opbouw10,"#ff9f40"]].map(function(arr){
              const l=arr[0],n=arr[1],k=arr[2];
              return(
                <div key={l} style={{background:n>0?"var(--c-2d4a1e)":"var(--c-1c2e18)",border:"1px solid "+(n>0?k:KBDR),borderRadius:6,padding:"4px 10px",textAlign:"center",minWidth:48}}>
                  <div style={{fontSize:16,fontWeight:"bold",color:n>0?k:"var(--c-5a7a55)"}}>{n}x</div>
                  <div style={{fontSize:12,color:WITD}}>{l}</div>
                </div>
              );
            })}
          </div>
          {spel&&<PrestatieOverzicht prestatie={prestatie}/>}
          <PartijBeheer p={p} onNotitie={onNotitie} onVerwijder={onVerwijder}/>
        </div>
      )}
    </div>
  );
}

function LogPartijRij({p,nr,prestatie,gedropt,discipline,onVerwijder,onNotitie}){
  const spel=useContext(SpelContext);
  const [open,setOpen]=useState(false);
  const st=stat(p.beurten,discipline);
  const punten=prestatie?prestatie.punten:0;
  return(
    <div style={{background:KBG,border:"1px solid "+KBDR,borderRadius:10,marginBottom:10}}>
      <button onClick={function(){setOpen(function(v){return !v;});}}
        style={{width:"100%",background:"none",border:"none",color:"inherit",cursor:"pointer",fontFamily:"inherit",padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",textAlign:"left"}}>
        <div>
          <div style={{fontSize:15,color:GOUD,textDecoration:gedropt?"line-through":"none",opacity:gedropt?0.6:1}}>p{nr} - {new Date(p.datum).toLocaleDateString(taalLocale(),{weekday:"short",day:"numeric",month:"short"})}<PartijLabels p={p} punten={punten} gedropt={gedropt}/></div>
          {st&&<div style={{fontSize:13,color:WITD,marginTop:2,opacity:gedropt?0.6:1}}>{t("{c} car - {b}b - gem {g} - max {m} - {p}x poedel",{c:st.totCar,b:st.aantalBeurten,g:decTekst(st.gemPerBeurt),m:st.max,p:st.poedels})}{strafTotaal(p)>0&&<span style={{color:ROOD}}> - {t("{n}x straf",{n:strafTotaal(p)})}</span>}</div>}
        </div>
        <span style={{color:GOUD,fontSize:14,marginLeft:8}}>{open?"▲":"▼"}</span>
      </button>
      {open&&(
        <div style={{padding:"0 14px 12px"}}>
          {spel&&<PrestatieOverzicht prestatie={prestatie}/>}
          {[].concat(p.beurten).reverse().map(function(b,i){return <LogRij key={b.id} b={b} nr={p.beurten.length-i} discipline={discipline}/>;}) }
          <PartijBeheer p={p} onNotitie={onNotitie} onVerwijder={onVerwijder}/>
        </div>
      )}
    </div>
  );
}
