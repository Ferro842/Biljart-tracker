// Tabbladen Log, Data en Stats van Biljart Tracker, als losse componenten. De gegevens en acties komen
// als props uit BiljartTracker (index.html). JSX via Babel, na jsx/dashboard.jsx.

// Log-tab: lopende partij en alle partijen beurt voor beurt
function LogTab({lp,alleP,prestatiesMap,niveau,huidigeDiscipline,verwijderPartij,slaNotitieOp}){
  return(
    <div style={{overflowY:"auto",padding:"12px 14px",height:"100%"}}>
      {lp.length>0&&(
        <div style={{background:KBG,border:"2px solid "+GOUD,borderRadius:10,padding:"12px 14px",marginBottom:10}}>
          <div style={{fontSize:13,textTransform:"uppercase",letterSpacing:2,color:GOUD,marginBottom:8}}>Lopende partij</div>
          {[].concat(lp).reverse().map(function(b,i){return <LogRij key={b.id} b={b} nr={lp.length-i}/>;}) }
        </div>
      )}
      {[].concat(alleP).reverse().map(function(p,pi){
        return <LogPartijRij key={p.id} p={p} nr={alleP.length-pi} prestatie={prestatiesMap[p.id]} gedropt={niveau.gedropteIds&&niveau.gedropteIds.has(p.id)} discipline={huidigeDiscipline} onVerwijder={verwijderPartij} onNotitie={slaNotitieOp}/>;
      })}
    </div>
  );
}

// Data-tab: AI-analyse-prompts, leesbare tekstexport en back-up (exporteren/importeren als JSON)
function DataTab({data,alleP,huidigeDiscipline,vervangData}){
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
    <div style={{overflowY:"auto",padding:"12px 14px",height:"100%"}}>
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
            style={{width:"100%",height:220,background:"#0d1f0d",border:"1px solid "+KBDR,borderRadius:8,color:WITD,fontSize:13,padding:8,fontFamily:"monospace",resize:"none"}}/>
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

// Stats-tab: seizoen, tijdvenster, totalen, alle partijen, data wissen en 'Over deze app'
function StatsTab({data,alleP,huidigeDiscipline,niveau,huidigeRecords,prestatiesMap,tijdsvenster,setTijdsvenster,
  seizoenAfsluiten,seizoensplitsingOngedaanMaken,openArchief,verwijderPartij,slaNotitieOp,resetAlles}){
  const [confSeizoenAfsluiten,setConfSeizoenAfsluiten]=useState(false);
  const [confSeizoenOngedaan,setConfSeizoenOngedaan]=useState(false);
  const [confReset,setConfReset]=useState(false);
  const [deelResultaat,setDeelResultaat]=useState("");
  const statsScrollRef=useRef(null);

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

  const allB=alleP.flatMap(function(p){return p.beurten;});
  const stA=stat(allB,huidigeDiscipline);
  return(
    <div ref={statsScrollRef} style={{overflowY:"auto",padding:"12px 14px",height:"100%"}}>
      <div style={{background:KBG,border:"1px solid "+KBDR,borderRadius:10,padding:"12px 14px",marginBottom:12}}>
        <div style={{fontSize:13,textTransform:"uppercase",letterSpacing:2,color:GOUD,marginBottom:8}}>Seizoen</div>
        {(function(){
          const seizoenen=data.seizoenen||[{id:1,naam:"Seizoen 1",startDatum:null,eindDatum:null}];
          const huidig=seizoenen[seizoenen.length-1];
          const afgesloten=seizoenen.filter(function(s){return s.eindDatum!==null;});
          const huidigStats=berekenSeizoenStats(alleP,huidig,huidigeDiscipline);
          return(
            <div>
              <div style={{fontSize:14,color:WIT,marginBottom:2}}>{huidig.naam} <span style={{fontSize:13,color:WITD}}>(sinds {huidig.startDatum?new Date(huidig.startDatum).toLocaleDateString("nl-NL",{day:"numeric",month:"short",year:"numeric"}):"het begin"})</span></div>
              <div style={{fontSize:13,color:WITD,marginBottom:huidigStats.aantalDrops>0?2:10}}>{huidigStats.aantalPartijen} partijen · gem {huidigStats.gemiddelde.toFixed(huidigeDiscipline==="driebanden"?3:2)} · {huidigStats.niveau.emoji} {huidigStats.niveau.naam}</div>
              {huidigStats.aantalDrops>0&&<div style={{fontSize:11,color:WITD,opacity:0.8,marginBottom:10}}>Gemiddelde {gemUitleg(huidigStats,huidigeDiscipline==="driebanden"?3:2," van dit seizoen")}. Elk seizoen telt zijn eigen badge-punten.</div>}
              <div style={{display:"flex",gap:6}}>
                {!confSeizoenAfsluiten
                  ?<button style={{flex:1,padding:8,background:"none",border:"1px solid "+GOUD,borderRadius:6,color:GOUD,cursor:"pointer",fontSize:13,fontFamily:"inherit"}}
                    onClick={function(){setConfSeizoenAfsluiten(true);}}>Seizoen afsluiten</button>
                  :<div style={{flex:1,background:"#1a2e10",border:"1px solid "+GOUD,borderRadius:6,padding:"7px 8px"}}>
                    <div style={{fontSize:13,color:GOUD,marginBottom:6}}>Huidig seizoen afsluiten en een nieuwe beginnen?</div>
                    <div style={{display:"flex",gap:6}}>
                      <button style={{flex:1,padding:6,background:"#2d4a1e",border:"none",borderRadius:5,color:GOUD,cursor:"pointer",fontFamily:"inherit",fontSize:13}}
                        onClick={function(){seizoenAfsluiten();setConfSeizoenAfsluiten(false);}}>Ja, afsluiten</button>
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
              {afgesloten.length>0&&!confSeizoenAfsluiten&&(
                !confSeizoenOngedaan
                  ?<button style={{marginTop:8,padding:0,background:"none",border:"none",color:WITD,cursor:"pointer",fontSize:12,fontFamily:"inherit",textDecoration:"underline",opacity:0.7}}
                    onClick={function(){setConfSeizoenOngedaan(true);}}>Laatste seizoensgrens ongedaan maken</button>
                  :<div style={{marginTop:8,background:"#1a2e10",border:"1px solid "+KBDR,borderRadius:6,padding:"7px 8px"}}>
                    <div style={{fontSize:13,color:WITD,marginBottom:6}}>{huidig.naam} en {afgesloten[afgesloten.length-1].naam} weer samenvoegen tot één lopend seizoen?</div>
                    <div style={{display:"flex",gap:6}}>
                      <button style={{flex:1,padding:6,background:"#2d4a1e",border:"none",borderRadius:5,color:GOUD,cursor:"pointer",fontFamily:"inherit",fontSize:13}}
                        onClick={function(){seizoensplitsingOngedaanMaken();setConfSeizoenOngedaan(false);}}>Ja, samenvoegen</button>
                      <button style={{flex:1,padding:6,background:"none",border:"1px solid "+KBDR,borderRadius:5,color:WITD,cursor:"pointer",fontFamily:"inherit",fontSize:13}}
                        onClick={function(){setConfSeizoenOngedaan(false);}}>Annuleer</button>
                    </div>
                  </div>
              )}
            </div>
          );
        })()}
      </div>
      <div style={{background:KBG,border:"1px solid "+KBDR,borderRadius:10,padding:"12px 14px",marginBottom:12}}>
        <div style={{fontSize:13,textTransform:"uppercase",letterSpacing:2,color:GOUD,marginBottom:6}}>Tijdvenster voor prestatie-drempels</div>
        <div style={{fontSize:13,color:WITD,marginBottom:8}}>Bepaalt over welke periode je ⭐-drempels berekend worden. Je gemiddelde, je niveau en je 👑🏓-records blijven altijd all-time — een record blijft een record.</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginBottom:10}}>
          {[["1","1 mnd"],["2","2 mnd"],["3","3 mnd"],["6","6 mnd"],["12","12 mnd"],["alles","Alles"]].map(function(arr){
            const v=arr[0],l=arr[1];
            return <button key={v} style={{padding:"7px 0",background:tijdsvenster===v?"#2d4a1e":"none",border:"1px solid "+(tijdsvenster===v?GOUD:KBDR),borderRadius:6,color:tijdsvenster===v?GOUD:WITD,cursor:"pointer",fontFamily:"inherit",fontSize:14}}
              onClick={function(){setTijdsvenster(v);}}>{l}</button>;
          })}
        </div>
        <div style={{background:"rgba(0,0,0,0.2)",borderRadius:8,padding:"9px 10px"}}>
          <div style={{display:"flex",justifyContent:"space-between"}}>
            <div>
              <div style={{fontSize:11,color:WITD}}>⭐-drempel-basis</div>
              <div style={{fontSize:17,fontWeight:"bold",color:GOUD}}>{huidigeRecords.totaalGem!==null?huidigeRecords.totaalGem.toFixed(huidigeDiscipline==="driebanden"?3:2):"—"}</div>
              <div style={{fontSize:10,color:WITD,opacity:0.7}}>{huidigeRecords.vensterPartijen} partij{huidigeRecords.vensterPartijen===1?"":"en"} · {huidigeRecords.vensterBeurten} beurten</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:11,color:WITD}}>je gemiddelde (all-time)</div>
              <div style={{fontSize:17,fontWeight:"bold",color:WIT}}>{niveau.effectiefGemiddelde.toFixed(huidigeDiscipline==="driebanden"?3:2)}</div>
              <div style={{fontSize:10,color:WITD,opacity:0.7}}>{alleP.length} partij{alleP.length===1?"":"en"}</div>
            </div>
          </div>
          {niveau.aantalDrops>0
            ?<div style={{fontSize:10,color:GOUD,marginTop:6,textAlign:"center"}}>🏅 Je gemiddelde is {gemUitleg(niveau,huidigeDiscipline==="driebanden"?3:2)}</div>
            :<div style={{fontSize:10,color:WITD,opacity:0.6,marginTop:6,textAlign:"center"}}>nog geen badge-drops verdiend</div>
          }
        </div>
      </div>
      {stA&&(
        <div style={{background:KBG,border:"1px solid "+KBDR,borderRadius:10,padding:"12px 14px",marginBottom:12}}>
          <div style={{fontSize:13,textTransform:"uppercase",letterSpacing:2,color:GOUD,marginBottom:8}}>Alle {alleP.length} partijen</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:8}}>
            {[["Car.",stA.totCar],["Max",stA.max],["Gem. alle partijen",stA.gemPerBeurt],["Beurten",stA.aantalBeurten],["Poedels",stA.poedels],["Partijen",alleP.length]].map(function(arr){
              return(
                <div key={arr[0]} style={{textAlign:"center",background:"#1a3019",borderRadius:8,padding:"8px 4px"}}>
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
              {!confReset
        ?<button style={{width:"100%",padding:10,background:"none",border:"1px solid #7a3030",borderRadius:8,color:"#e06060",cursor:"pointer",fontSize:14,fontFamily:"inherit"}}
          onClick={function(e){
            const el=statsScrollRef.current;
            const y=el?el.scrollTop:0;
            if(e.currentTarget&&e.currentTarget.blur)e.currentTarget.blur();
            setConfReset(true);
            const herstel=function(){if(el)el.scrollTop=y;};
            requestAnimationFrame(function(){requestAnimationFrame(herstel);});
            setTimeout(herstel,0);
            setTimeout(herstel,50);
            setTimeout(herstel,150);
            setTimeout(herstel,300);
          }}>Alle data wissen</button>
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
