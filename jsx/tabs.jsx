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
