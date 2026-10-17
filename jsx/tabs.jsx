// Tabbladen Log, Stats en Info (met de back-up uit DataTab) van Biljart Tracker, als losse componenten. De gegevens en acties komen
// als props uit BiljartTracker (index.html). JSX via Babel, na jsx/dashboard.jsx.

// Log-tab: lopende partij en alle partijen beurt voor beurt
function LogTab({lp,alleP,prestatiesMap,niveau,huidigeDiscipline,verwijderPartij,slaNotitieOp}){
  const kopBlok=useContext(KopContext);
  return(
    <div className="scrollvak" style={{overflowY:"auto",padding:kopBlok?"0 14px 12px":"12px 14px",height:"100%"}}>
      {kopBlok&&kopBlok({rand:14,onder:12})}
      {lp.length>0&&(
        <div style={{background:KBG,border:"2px solid "+GOUD,borderRadius:10,padding:"12px 14px",marginBottom:10}}>
          <div style={{fontSize:13,textTransform:"uppercase",letterSpacing:2,color:GOUD,marginBottom:8}}>Lopende partij</div>
          {[].concat(lp).reverse().map(function(b,i){return <LogRij key={b.id} b={b} nr={lp.length-i} discipline={huidigeDiscipline}/>;}) }
        </div>
      )}
      {[].concat(alleP).reverse().map(function(p,pi){
        return <LogPartijRij key={p.id} p={p} nr={alleP.length-pi} prestatie={prestatiesMap[p.id]} gedropt={niveau.gedropteIds&&niveau.gedropteIds.has(p.id)} discipline={huidigeDiscipline} onVerwijder={verwijderPartij} onNotitie={slaNotitieOp}/>;
      })}
    </div>
  );
}

// Back-up en gegevens (in de Info-tab): AI-analyse-prompts, leesbare tekstexport en back-up (exporteren/importeren als JSON)
function DataTab({data,alleP,huidigeDiscipline,vervangData,ingebed}){
  const [gekopieerd,setGekopieerd]=useState("");
  const [toonData,setToonData]=useState(false);

  async function exporteerData(){
    const naam="biljart-backup-"+new Date().toISOString().slice(0,10)+".json";
    if(IS_NATIVE){
      // In de iOS-app werkt een download-link niet: schrijf een tijdelijk bestand en open het deelmenu
      // (Bewaar in Bestanden, AirDrop, mail, ...).
      try{
        await nativeFS().writeFile({path:naam,data:JSON.stringify(data,null,2),directory:"CACHE",encoding:"utf8"});
        const r=await nativeFS().getUri({path:naam,directory:"CACHE"});
        await window.Capacitor.Plugins.Share.share({files:[r.uri]});
      }catch(e){
        if(!/cancel/i.test(String(e&&e.message)))alert("Exporteren mislukt: "+(e&&e.message||e));
      }
      return;
    }
    const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;a.download=naam;
    document.body.appendChild(a);a.click();document.body.removeChild(a);
    setTimeout(function(){URL.revokeObjectURL(url);},1000);
  }

  function importeerData(e){
    const bestand=e.target.files&&e.target.files[0];
    e.target.value="";
    if(!bestand)return;
    const reader=new FileReader();
    reader.onload=function(){
      let parsed;
      try{parsed=JSON.parse(reader.result);}catch(err){parsed=null;}
      if(!parsed||!Array.isArray(parsed.partijen)){
        alert("Dit lijkt geen geldige back-up te zijn (geen partijen-lijst gevonden).");
        return;
      }
      const perDiscipline={};
      parsed.partijen.forEach(function(p){
        const d=p.discipline||"libre";
        perDiscipline[d]=(perDiscipline[d]||0)+1;
      });
      const overzicht=Object.keys(perDiscipline).map(function(d){return d+": "+perDiscipline[d];}).join(", ");
      if(!window.confirm("Gevonden: "+parsed.partijen.length+" partijen ("+overzicht+").\n\nDit vervangt ALLE huidige data ("+data.partijen.length+" partijen). Doorgaan?"))return;
      migreerTafels(parsed);
      herstelBeurten(parsed);
      migreerAcquit(parsed);
      let maxId=0;
      parsed.partijen.forEach(function(p){
        maxId=Math.max(maxId,p.id||0);
        (p.beurten||[]).forEach(function(b){maxId=Math.max(maxId,b.id||0);});
      });
      if(!(parsed.huidigeId>maxId))parsed.huidigeId=maxId+1;
      vervangData(parsed);
    };
    reader.readAsText(bestand);
  }

  function bouwTekst(){
    const stA=stat(alleP.flatMap(function(p){return p.beurten;}),huidigeDiscipline);
    const r=["BILJART DATA — "+new Date().toLocaleDateString("nl-NL",{weekday:"long",day:"numeric",month:"long",year:"numeric"}),"========================================"];
    if(stA)r.push("TOTAAL: "+alleP.length+" partijen · "+stA.totCar+"car · gem "+stA.gemPerBeurt+" · max "+stA.max+" · "+stA.poedels+" poedels");
    var alleOmgekeerd=[].concat(alleP).reverse();
    const dTxt=beurtDrempels(huidigeDiscipline);
    alleOmgekeerd.forEach(function(p,i){
      const st=stat(p.beurten,huidigeDiscipline);
      r.push("");
      r.push("Partij "+(alleP.length-i)+" · "+new Date(p.datum).toLocaleDateString("nl-NL",{weekday:"long",day:"numeric",month:"long"})+(p.tafel?" · Tafel "+tafelVol(p.tafel):""));
      if(st)r.push(st.aantalBeurten+"b · max "+st.max+" · gem "+st.gemPerBeurt+" · "+st.poedels+"x poedel · "+st.opbouw5+"x"+dTxt.opbouwMin+"+");
      p.beurten.forEach(function(b,j){
        const g=(b.gemist||[]).join(", ");
        const gd=(b.goed||[]).join(", ");
        var rule="  B"+(j+1)+": "+b.caramboles+"car"+(b.caramboles===0?" [poedel]":"");
        if(g)rule+=" - Gemist: "+g;
        if(gd)rule+=" - Goed: "+gd;
        r.push(rule);
      });
    });
    return r.join("\n");
  }

  function kopieer(tekst,key){
    var el=document.createElement("textarea");
    el.value=tekst;
    el.setAttribute("readonly","");
    el.style.position="absolute";
    el.style.left="-9999px";
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    setGekopieerd(key);
    setTimeout(function(){setGekopieerd("");},2500);
  }

  const dataTekst=bouwTekst();
  const promptPartij="Je bent een biljartcoach voor carambole/libre. Analyseer mijn meest recente partij. Geef: Wat ging goed, Grootste rem, Foutpatronen, Trainingsadvies, Focus. Antwoord beknopt.\n\n"+dataTekst;
  const promptTrend="Je bent een biljartcoach voor carambole/libre. Analyseer mijn trends over al mijn partijen. Geef: Trend, Vooruitgang, Remmers, Inzicht, Trainingsfocus. Antwoord beknopt.\n\n"+dataTekst;
  return(
    <div className={ingebed?null:"scrollvak"} style={ingebed?null:{overflowY:"auto",padding:"12px 14px",height:"100%"}}>
      <div style={{background:KBG,border:"1px solid "+KBDR,borderRadius:10,padding:"12px 14px",marginBottom:12}}>
        <div style={{fontSize:13,textTransform:"uppercase",letterSpacing:2,color:GOUD,marginBottom:6}}>AI Analyse</div>
        <div style={{fontSize:13,color:WITD,marginBottom:10,lineHeight:1.5}}>
          Kopieer een kant-en-klare prompt met al je data erin, en plak die in ChatGPT, Claude of een andere AI-chat voor een persoonlijke analyse.
        </div>
        <div style={{display:"flex",gap:8}}>
          <button style={{flex:1,padding:12,background:"none",border:"1px solid "+GOUD,borderRadius:8,color:GOUD,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}
            onClick={function(){kopieer(promptPartij,"aipartij");}}>{gekopieerd==="aipartij"?"Gekopieerd!":"📋 Partij-analyse-prompt"}</button>
          <button style={{flex:1,padding:12,background:"none",border:"1px solid "+GOUD,borderRadius:8,color:GOUD,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}
            onClick={function(){kopieer(promptTrend,"aitrend");}}>{gekopieerd==="aitrend"?"Gekopieerd!":"📋 Trend-analyse-prompt"}</button>
        </div>
      </div>
      <button style={{width:"100%",padding:14,background:"linear-gradient(135deg,"+GOUD+","+GOUDL+")",border:"none",borderRadius:10,color:G,fontSize:15,fontWeight:"bold",cursor:"pointer",fontFamily:"inherit",marginBottom:12}}
        onClick={function(){kopieer(dataTekst,"data");setToonData(function(v){return !v;});}}>
        {gekopieerd==="data"?"Gekopieerd!":"Kopieer data"}
      </button>
      {toonData&&(
        <div>
          <div style={{fontSize:13,color:WITD,marginBottom:6}}>Selecteer alles hieronder en kopieer:</div>
          <textarea readOnly value={dataTekst}
            onClick={function(e){e.target.select();}}
            style={{width:"100%",height:220,background:"var(--c-0d1f0d)",border:"1px solid "+KBDR,borderRadius:8,color:WITD,fontSize:13,padding:8,fontFamily:"monospace",resize:"none"}}/>
        </div>
      )}
      <div style={{background:KBG,border:"1px solid "+KBDR,borderRadius:10,padding:"12px 14px",marginTop:12}}>
        <div style={{fontSize:13,textTransform:"uppercase",letterSpacing:2,color:GOUD,marginBottom:6}}>Back-up</div>
        <div style={{fontSize:13,color:WITD,marginBottom:10,lineHeight:1.5}}>
          Sla al je data op als bestand, of zet een eerder bestand terug.
        </div>
        <div style={{display:"flex",gap:8}}>
          <button style={{flex:1,padding:12,background:"none",border:"1px solid "+GOUD,borderRadius:8,color:GOUD,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}
            onClick={exporteerData}>📤 Exporteer data</button>
          <label style={{flex:1,padding:12,background:"none",border:"1px solid "+GOUD,borderRadius:8,color:GOUD,fontSize:14,cursor:"pointer",fontFamily:"inherit",textAlign:"center",boxSizing:"border-box"}}>
            📥 Importeer data
            <input type="file" accept=".json,application/json" onChange={importeerData} style={{display:"none"}}/>
          </label>
        </div>
      </div>
    </div>
  );
}

// Stats-tab: je cijfers. Seizoen, je niveau (vorm en moyenne), totalen en alle partijen. Instellingen,
// uitleg en back-up staan in de Info-tab.
function StatsTab({data,alleP,huidigeDiscipline,niveau,prestatiesMap,seizoenAfsluiten,seizoensplitsingOngedaanMaken,
  openArchief,verwijderPartij,slaNotitieOp,vormVenster,openVerhaal}){
  const kopBlok=useContext(KopContext);
  const spel=useContext(SpelContext);
  const [niveauTafel,setNiveauTafel]=useState("alle"); // weergave in "Je niveau": alle tafels of één tafel
  const [confSeizoenAfsluiten,setConfSeizoenAfsluiten]=useState(false);
  // Begindatum van het nieuwe seizoen bij afsluiten (jjjj-mm-dd, standaard vandaag)
  const vandaagStr=(function(){const d=new Date();return d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2);})();
  const [nieuwSeizoenVanaf,setNieuwSeizoenVanaf]=useState(vandaagStr);
  const allB=alleP.flatMap(function(p){return p.beurten;});
  const stA=stat(allB,huidigeDiscipline);
  return(
    <div className="scrollvak" style={{overflowY:"auto",padding:kopBlok?"0 14px 12px":"12px 14px",height:"100%"}}>
      {kopBlok&&kopBlok({rand:14,onder:12})}
      <div style={{background:KBG,border:"1px solid "+KBDR,borderRadius:10,padding:"12px 14px",marginBottom:12}}>
        <div style={{fontSize:13,textTransform:"uppercase",letterSpacing:2,color:GOUD,marginBottom:8}}>Seizoen</div>
        {(function(){
          const seizoenen=data.seizoenen||[{id:1,naam:"Seizoen 1",startDatum:null,eindDatum:null}];
          const huidig=seizoenen[seizoenen.length-1];
          const afgesloten=seizoenen.filter(function(s){return s.eindDatum!==null;});
          const huidigStats=berekenSeizoenStats(alleP,huidig,huidigeDiscipline,!spel,{});
          return(
            <div>
              <div style={{fontSize:14,color:WIT,marginBottom:2}}>{huidig.naam} <span style={{fontSize:13,color:WITD}}>(sinds {huidig.startDatum?new Date(huidig.startDatum).toLocaleDateString("nl-NL",{day:"numeric",month:"short",year:"numeric"}):"het begin"})</span></div>
              <div style={{fontSize:13,color:WITD,marginBottom:huidigStats.aantalDrops>0?2:10}}>{huidigStats.aantalPartijen} partijen · gem {huidigStats.gemiddelde.toFixed(huidigeDiscipline==="driebanden"?3:2)} · {huidigStats.niveau.emoji} {huidigStats.niveau.naam}</div>
              {huidigStats.aantalDrops>0&&<div style={{fontSize:11,color:WITD,opacity:0.8,marginBottom:10}}>Gemiddelde {gemUitleg(huidigStats,huidigeDiscipline==="driebanden"?3:2," van dit seizoen")}. Elk seizoen telt zijn eigen badge-punten.</div>}
              <div style={{display:"flex",gap:6}}>
                {!confSeizoenAfsluiten
                  ?<button style={{flex:1,padding:8,background:"none",border:"1px solid "+GOUD,borderRadius:6,color:GOUD,cursor:"pointer",fontSize:13,fontFamily:"inherit"}}
                    onClick={function(){setConfSeizoenAfsluiten(true);}}>Seizoen afsluiten</button>
                  :<div style={{flex:1,minWidth:0,background:"var(--c-1a2e10)",border:"1px solid "+GOUD,borderRadius:6,padding:"7px 8px"}}>
                    <div style={{fontSize:13,color:GOUD,marginBottom:6}}>Huidig seizoen afsluiten en een nieuwe beginnen?</div>
                    <label style={{display:"block",fontSize:12,color:WITD,marginBottom:8}}>Nieuw seizoen begint op
                      <input type="date" value={nieuwSeizoenVanaf} max={vandaagStr} onChange={function(e){setNieuwSeizoenVanaf(e.target.value);}}
                        style={{display:"block",width:"100%",boxSizing:"border-box",marginTop:4,padding:"8px 10px",borderRadius:6,border:"1px solid "+KBDR,background:"rgba(0,0,0,0.3)",color:WIT,fontSize:15,fontFamily:"inherit",colorScheme:"dark",minHeight:40}}/>
                      <span style={{display:"block",marginTop:4,lineHeight:1.4}}>Partijen vanaf die dag horen bij het nieuwe seizoen. Kies een eerdere datum om een grens achteraf te leggen.</span>
                    </label>
                    {(function(){
                      // Een begindatum vóór de start van het huidige seizoen kan niet
                      const start=huidig.startDatum?new Date(huidig.startDatum):null;
                      const d=nieuwSeizoenVanaf.split("-").map(function(x){return parseInt(x,10);});
                      const gekozen=new Date(d[0],d[1]-1,d[2],0,0,0);
                      return start&&gekozen<=start?<div style={{fontSize:12,color:ROOD,marginBottom:6}}>Kies een datum na {start.toLocaleDateString("nl-NL",{day:"numeric",month:"short",year:"numeric"})}.</div>:null;
                    })()}
                    <div style={{display:"flex",gap:6}}>
                      <button style={{flex:1,padding:6,background:"var(--c-2d4a1e)",border:"none",borderRadius:5,color:GOUD,cursor:"pointer",fontFamily:"inherit",fontSize:13}}
                        onClick={function(){
                          const d=nieuwSeizoenVanaf.split("-").map(function(x){return parseInt(x,10);});
                          const gekozen=new Date(d[0],d[1]-1,d[2],0,0,0);
                          const start=huidig.startDatum?new Date(huidig.startDatum):null;
                          if(isNaN(gekozen.getTime())||(start&&gekozen<=start))return;
                          // Vandaag gekozen: het huidige moment (zoals altijd); anders het begin van die dag
                          seizoenAfsluiten(nieuwSeizoenVanaf===vandaagStr?new Date().toISOString():gekozen.toISOString());
                          setConfSeizoenAfsluiten(false);setNieuwSeizoenVanaf(vandaagStr);
                        }}>Ja, afsluiten</button>
                      <button style={{flex:1,padding:6,background:"none",border:"1px solid "+KBDR,borderRadius:5,color:WITD,cursor:"pointer",fontFamily:"inherit",fontSize:13}}
                        onClick={function(){setConfSeizoenAfsluiten(false);}}>Annuleer</button>
                    </div>
                  </div>
                }
                {afgesloten.length>0&&!confSeizoenAfsluiten&&(
                  <button style={{padding:"8px 12px",background:"none",border:"1px solid "+KBDR,borderRadius:6,color:WITD,cursor:"pointer",fontSize:13,fontFamily:"inherit"}}
                    onClick={openArchief}>Archief ({afgesloten.length})</button>
                )}
              </div>
              {!confSeizoenAfsluiten&&openVerhaal&&<button onClick={function(){openVerhaal(huidig);}}
                style={{marginTop:8,width:"100%",padding:9,background:"none",border:"1px solid "+KBDR,borderRadius:6,color:WIT,cursor:"pointer",fontSize:14,fontFamily:"inherit"}}>🎬 Bekijk je seizoen tot nu toe</button>}
            </div>
          );
        })()}
      </div>
      {/* Je niveau: vorm (laatste N partijen) naast de officiële moyenne, de keuze voor N, en een weergave
          per tafel. Het niveau bovenin de app gaat altijd over alle tafels. */}
      {(function(){
        const dec=huidigeDiscipline==="driebanden"?3:2;
        const gespeeld=Object.keys(TAFELS).filter(function(k){return alleP.some(function(p){return(p.tafel||"230")===k;});});
        const tafel=gespeeld.indexOf(niveauTafel)!==-1?niveauTafel:"alle";
        const opTafel=tafel==="alle"?"":" op "+tafelLabel(tafel);
        // Voor één tafel: zelfde berekening, alleen met de partijen op die tafel
        const info=tafel==="alle"?niveau:berekenVorm(alleP.filter(function(p){return(p.tafel||"230")===tafel;}),spel,vormVenster);
        const niv=bepaalNiveau(info.effectiefGemiddelde,huidigeDiscipline);
        const chip=function(actief){return{flex:1,padding:"7px 0",background:actief?"var(--c-2d4a1e)":"none",border:"1px solid "+(actief?GOUD:KBDR),borderRadius:8,color:actief?GOUD:WITD,cursor:"pointer",fontFamily:"inherit",fontSize:13};};
        return(
          <div style={{background:KBG,border:"1px solid "+KBDR,borderRadius:10,padding:"12px 14px",marginBottom:12}}>
            <div style={{fontSize:13,textTransform:"uppercase",letterSpacing:2,color:GOUD,marginBottom:8}}>Je niveau</div>
            {gespeeld.length>1&&(
              <div style={{display:"flex",gap:6,marginBottom:10}}>
                {[["alle","Alle tafels"]].concat(gespeeld.map(function(k){return[k,tafelLabel(k)];})).map(function(x){
                  return <button key={x[0]} onClick={function(){setNiveauTafel(x[0]);}} style={chip(tafel===x[0])}>{x[1]}</button>;
                })}
              </div>
            )}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:tafel==="alle"?10:6}}>
              <div style={{background:"rgba(0,0,0,0.2)",borderRadius:8,padding:"8px",textAlign:"center"}}>
                <div style={{fontSize:22,fontWeight:"bold",color:GOUD}}><Telop waarde={info.effectiefGemiddelde} dec={dec}/></div>
                <div style={{fontSize:11,color:WITD}}>vorm · {info.venster?"laatste "+info.aantalPartijen:"alle partijen (= moyenne)"}{opTafel}</div>
                <div style={{fontSize:10,color:spel&&info.aantalDrops>0?GOUD:WITD,marginTop:2}}>
                  {!spel?"niets geschrapt · spelelement uit"
                    :info.aantalDrops>0?"zonder je "+(info.aantalDrops===1?"slechtste":info.aantalDrops+" slechtste")+" · spelelement aan"
                    :"nog niets geschrapt · spelelement aan"}
                </div>
                <div style={{fontSize:10,color:niv.huidig.kleur,marginTop:2}}>{niv.huidig.emoji} {niv.huidig.naam} {niv.progressPct}%</div>
              </div>
              <div style={{background:"rgba(0,0,0,0.2)",borderRadius:8,padding:"8px",textAlign:"center"}}>
                <div style={{fontSize:22,fontWeight:"bold",color:WIT}}><Telop waarde={info.moyenne} dec={dec}/></div>
                <div style={{fontSize:11,color:WITD}}>moyenne · alle {info.aantalPartijenTotaal}{opTafel}</div>
                <div style={{fontSize:10,color:WITD,opacity:0.7}}>officieel, niets geschrapt</div>
              </div>
            </div>
            {tafel!=="alle"&&(
              <div style={{fontSize:11,color:GOUDL,marginBottom:10}}>Alleen je partijen op de {tafelLabel(tafel)}. Je niveau bovenin de app gaat over alle tafels.</div>
            )}
            <div style={{fontSize:11,color:WITD,opacity:0.8,lineHeight:1.45}}>
              {vormVenster==="alles"
                ?"Je klasse is nu gebaseerd op je moyenne: al je partijen, niets geschrapt."
                :<>Je vorm is het gemiddelde van je laatste {vormVenster} partijen{spel?", zonder je slechtste partijen die je met badge-punten hebt weggespeeld (hoogstens 1 op de 10)":""}; je moyenne gaat altijd over al je partijen.</>}
              Op hoeveel partijen je vorm gebaseerd is (10, 20, 30 of alle) en je doel stel je in bij <b style={{color:GOUD}}>je klasse rechtsboven</b>.
            </div>
          </div>
        );
      })()}

      {stA&&(
        <div style={{background:KBG,border:"1px solid "+KBDR,borderRadius:10,padding:"12px 14px",marginBottom:12}}>
          <div style={{fontSize:13,textTransform:"uppercase",letterSpacing:2,color:GOUD,marginBottom:8}}>Alle {alleP.length} partijen</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:8}}>
            {[["Car.",stA.totCar],["Max",stA.max],["Gem. alle partijen",stA.gemPerBeurt],["Beurten",stA.aantalBeurten],["Poedels",stA.poedels],["Partijen",alleP.length]].map(function(arr){
              return(
                <div key={arr[0]} style={{textAlign:"center",background:"var(--c-1a3019)",borderRadius:8,padding:"8px 4px"}}>
                  <div style={{fontSize:22,fontWeight:"bold",color:GOUD}}>{arr[1]}</div>
                  <div style={{fontSize:13,color:WITD}}>{arr[0]}</div>
                </div>
              );
            })}
          </div>
          <div style={{fontSize:13,color:GRNT}}>Opbouw: {stA.opbouw5}/{stA.aantalBeurten} beurten {beurtDrempels(huidigeDiscipline).opbouwMin}+</div>
        </div>
      )}
      <div style={{background:KBG,border:"1px solid "+KBDR,borderRadius:10,padding:"12px 14px",marginBottom:12}}>
        <div style={{fontSize:13,textTransform:"uppercase",letterSpacing:2,color:GOUD,marginBottom:8}}>Per partij</div>
        {[].concat(alleP).reverse().map(function(p,i){return <PartijRij key={p.id} p={p} nr={alleP.length-i} prestatie={prestatiesMap[p.id]} gedropt={niveau.gedropteIds&&niveau.gedropteIds.has(p.id)} discipline={huidigeDiscipline} onVerwijder={verwijderPartij} onNotitie={slaNotitieOp}/>;}) }
      </div>
    </div>
  );
}

// Info-tab: uitleg, weergave en instellingen, back-up en gegevens, alles wissen en 'Over deze app'
function InfoTab({data,alleP,huidigeDiscipline,niveau,resetAlles,setSpelelement,setWeergave,openUitleg,vervangData}){
  const kopBlok=useContext(KopContext);
  const spel=useContext(SpelContext);
  const eenvoudig=useContext(EenvoudigContext);
  const [confReset,setConfReset]=useState(false);
  const [deelResultaat,setDeelResultaat]=useState("");

  function deelApp(){
    // In de iOS-app is location.href een interne capacitor://-link; deel dan de App Store-link (zodra die
    // er is) of anders de website.
    const url=IS_NATIVE?(APP_STORE_URL||WEB_URL):window.location.href;
    const tekst="Ik gebruik deze Biljart Tracker om mijn carambole-partijen bij te houden — misschien iets voor jou ook?";
    if(navigator.share){
      navigator.share({title:"Biljart Tracker",text:tekst,url:url}).catch(function(){});
    }else if(navigator.clipboard){
      navigator.clipboard.writeText(url).then(function(){
        setDeelResultaat("Link gekopieerd naar klembord!");
        setTimeout(function(){setDeelResultaat("");},2500);
      }).catch(function(){
        setDeelResultaat("Kopiëren mislukt — kopieer de link handmatig uit de adresbalk.");
      });
    }else{
      setDeelResultaat("Kopieer de link handmatig uit de adresbalk.");
    }
  }

  const kop=function(t){return <div style={{fontSize:13,textTransform:"uppercase",letterSpacing:2,color:GOUDL,margin:"18px 2px 8px"}}>{t}</div>;};
  return(
    <div className="scrollvak" style={{overflowY:"auto",padding:kopBlok?"0 14px 12px":"12px 14px",height:"100%"}}>
      {kopBlok&&kopBlok({rand:14,onder:12})}
      <button onClick={openUitleg} style={{width:"100%",padding:"16px",marginBottom:12,background:"linear-gradient(135deg,"+GOUD+","+GOUDL+")",border:"none",borderRadius:12,color:G,fontSize:17,fontWeight:"bold",cursor:"pointer",fontFamily:"inherit"}}>
        ℹ️ Zo werkt de app
      </button>

      {/* Weergave: tekstgrootte en eenvoudige modus (voor wie het groter en rustiger wil) */}
      <div style={{background:KBG,border:"1px solid "+GOUD,borderRadius:10,padding:"12px 14px",marginBottom:12}}>
        <div style={{fontSize:13,textTransform:"uppercase",letterSpacing:2,color:GOUD,marginBottom:8}}>Weergave</div>
        <div style={{fontSize:14,color:WIT,marginBottom:6}}>Tekstgrootte</div>
        <div style={{display:"flex",gap:6,marginBottom:12}}>
          {TEKSTGROOTTES.map(function(x){
            const actief=(data.tekstgrootte||"normaal")===x[0];
            return <button key={x[0]} onClick={function(){setWeergave("tekstgrootte",x[0]);}}
              style={{flex:1,padding:"10px 0",background:actief?"var(--c-2d4a1e)":"none",border:"1px solid "+(actief?GOUD:KBDR),borderRadius:8,color:actief?GOUD:WITD,cursor:"pointer",fontFamily:"inherit",fontSize:12+(x[2]-1)*20}}>{x[1]}</button>;
          })}
        </div>
        <div style={{fontSize:14,color:WIT,marginBottom:4}}>Eenvoudige modus</div>
        <div style={{fontSize:13,color:WITD,marginBottom:8,lineHeight:1.5}}>
          Alleen het belangrijkste: per beurt je caramboles invullen en Noteer, zonder de stap met opmerkingen. Wil je bij een beurt toch iets aanvinken, tik dan + opmerking. In Dash alleen het belangrijkste. Badges en punten zet je hieronder los aan of uit.
        </div>
        <div style={{display:"flex",gap:6}}>
          {[[true,"Aan"],[false,"Uit"]].map(function(x){
            const actief=eenvoudig===x[0];
            return <button key={x[1]} onClick={function(){if(!actief)setWeergave("eenvoudig",x[0]);}}
              style={{flex:1,padding:"10px 0",background:actief?"var(--c-2d4a1e)":"none",border:"1px solid "+(actief?GOUD:KBDR),borderRadius:8,color:actief?GOUD:WITD,cursor:"pointer",fontFamily:"inherit",fontSize:14}}>{x[1]}</button>;
          })}
        </div>
      </div>

      {/* Animaties en vieringen (optellende cijfers, groeiende balken, vallende balletjes) */}
      <div style={{background:KBG,border:"1px solid "+KBDR,borderRadius:10,padding:"12px 14px",marginBottom:12}}>
        <div style={{fontSize:13,textTransform:"uppercase",letterSpacing:2,color:GOUD,marginBottom:6}}>Animaties en vieringen</div>
        <div style={{fontSize:13,color:WITD,marginBottom:10,lineHeight:1.5}}>Optellende cijfers, groeiende balken en een korte viering bij een topserie, record, hogere klasse of gehaald doel.</div>
        <div style={{display:"flex",gap:6}}>
          {[[true,"✨ Aan"],[false,"Uit"]].map(function(x){
            const actief=(data.animaties!==false)===x[0];
            return <button key={x[1]} onClick={function(){if(!actief)setWeergave("animaties",x[0]);}}
              style={{flex:1,padding:"9px 0",background:actief?"var(--c-2d4a1e)":"none",border:"1px solid "+(actief?GOUD:KBDR),borderRadius:8,color:actief?GOUD:WITD,cursor:"pointer",fontFamily:"inherit",fontSize:14}}>{x[1]}</button>;
          })}
        </div>
      </div>

      {/* Spelelement aan/uit: badges, punten en het schrappen van slechtste partijen (ook in eenvoudige modus) */}
      <div style={{background:KBG,border:"1px solid "+KBDR,borderRadius:10,padding:"12px 14px",marginBottom:12}}>
        <div style={{fontSize:13,textTransform:"uppercase",letterSpacing:2,color:GOUD,marginBottom:6}}>Spelelement</div>
        <div style={{fontSize:13,color:WITD,marginBottom:10,lineHeight:1.5}}>
          Badges, punten en het schrappen van je slechtste partijen uit je vorm (1 per {PUNTEN_PER_DROP} punten, hoogstens 1 op de 10 partijen). Werkt ook in de eenvoudige modus.
          {spel?" Zet je het uit, dan zie je daar niets meer van en is je vorm gewoon het gemiddelde van die partijen.":" Staat uit: je vorm is gewoon het gemiddelde van die partijen, niets geschrapt. De punten worden op de achtergrond bijgehouden; zet je het weer aan, dan is alles direct terug."}
        </div>
        <div style={{display:"flex",gap:6}}>
          {[[true,"🎖️ Aan"],[false,"Uit"]].map(function(x){
            const actief=spel===x[0];
            return <button key={x[1]} onClick={function(){if(!actief)setSpelelement(x[0]);}}
              style={{flex:1,padding:"9px 0",background:actief?"var(--c-2d4a1e)":"none",border:"1px solid "+(actief?GOUD:KBDR),borderRadius:8,color:actief?GOUD:WITD,cursor:"pointer",fontFamily:"inherit",fontSize:14}}>{x[1]}</button>;
          })}
        </div>
      </div>

      {kop("Back-up en gegevens")}
      <DataTab data={data} alleP={alleP} huidigeDiscipline={huidigeDiscipline} vervangData={vervangData} ingebed={true}/>

      {!confReset
        ?<button style={{width:"100%",padding:10,background:"none",border:"1px solid #7a3030",borderRadius:8,color:"#e06060",cursor:"pointer",fontSize:14,fontFamily:"inherit"}}
          onClick={function(){setConfReset(true);}}>Alle data wissen</button>
        :<div style={{background:"#2a1515",border:"1px solid #7a3030",borderRadius:8,padding:"12px 14px"}}>
          <div style={{fontSize:14,color:"#e06060",marginBottom:10}}>Weet je het zeker?</div>
          <div style={{display:"flex",gap:8}}>
            <button style={{flex:1,padding:10,background:"#7a3030",border:"none",borderRadius:6,color:WIT,cursor:"pointer",fontFamily:"inherit",fontSize:14}} onClick={function(){resetAlles();setConfReset(false);}}>Ja, wis alles</button>
            <button style={{flex:1,padding:10,background:"none",border:"1px solid "+KBDR,borderRadius:6,color:WITD,cursor:"pointer",fontFamily:"inherit",fontSize:14}} onClick={function(){setConfReset(false);}}>Annuleer</button>
          </div>
        </div>}

        <div style={{background:KBG,border:"1px solid "+KBDR,borderRadius:10,padding:"12px 14px",marginBottom:12}}>
          <div style={{fontSize:13,textTransform:"uppercase",letterSpacing:2,color:GOUD,marginBottom:6}}>Over deze app</div>
          <div style={{fontSize:13,color:WITD,marginBottom:10,lineHeight:1.5}}>
            Biljart Tracker houdt je carambole-partijen bij (Libre, Driebanden, Bandstoten en Kader) met een niveausysteem op basis van de echte KNBB-klassen, plus badges en mijlpalen om je voortgang leuk te houden. Al je data blijft alleen op dit toestel staan.
          </div>
          <button onClick={deelApp} style={{width:"100%",padding:11,background:"linear-gradient(135deg,"+GOUD+","+GOUDL+")",border:"none",borderRadius:8,color:G,fontWeight:"bold",cursor:"pointer",fontSize:14,fontFamily:"inherit",marginBottom:8}}>
            📤 Deel deze app
          </button>
          {deelResultaat&&<div style={{textAlign:"center",fontSize:12,color:GRNT}}>{deelResultaat}</div>}
          <div style={{textAlign:"center",fontSize:11,color:WITD,opacity:0.6,marginTop:4}}>
            Versie {APP_VERSIE} · <a href={WEB_URL+"privacy.html"} target="_blank" rel="noopener" style={{color:WITD}}>Privacybeleid</a>
          </div>
        </div>
    </div>
  );
}
