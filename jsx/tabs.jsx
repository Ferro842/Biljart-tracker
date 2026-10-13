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
