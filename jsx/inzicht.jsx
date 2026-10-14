// Dash > Inzicht: wat gaat goed, wat minder, en waar valt winst te halen. De cijfers komen uit
// berekenInzicht() (js/berekeningen.js); dit bestand tekent ze. JSX via Babel, vóór jsx/dashboard.jsx.

function komma(x,dec){return x.toFixed(dec).replace(".",",");}

// Kaart met kop en optionele uitleg, in dezelfde stijl als de rest van Dash
function InzichtKaart({titel,uitleg,children,rand}){
  return(
    <div style={{background:KBG,border:"1px solid "+(rand||KBDR),borderRadius:10,padding:"12px"}}>
      <div style={{fontSize:13,color:GOUD,textTransform:"uppercase",letterSpacing:1,marginBottom:uitleg?4:10}}>{titel}</div>
      {uitleg&&<div style={{fontSize:12,color:WITD,opacity:0.8,marginBottom:10,lineHeight:1.4}}>{uitleg}</div>}
      {children}
    </div>
  );
}

function InzichtPaneel({partijen,discipline}){
  const inz=useMemo(function(){return berekenInzicht(partijen,discipline);},[partijen,discipline]);
  if(!inz)return <div style={{fontSize:14,color:WITD,padding:"8px 0"}}>Nog geen beurten in deze selectie.</div>;
  const dec=discipline==="driebanden"?3:2;
  const pctTekst=function(x){return Math.round(x*100)+"%";};
  const icoon={vorm:"📊",sterk:"💪",werk:"🎯",motor:"⚙️",serie:"🔥",mentaal:"🧘",omstandigheid:"🧭",trend:"📈"};
  const spelZinnen=inz.coach.filter(function(c){return c.soort!=="omstandigheid";});
  const omstZinnen=inz.coach.filter(function(c){return c.soort==="omstandigheid";});
  const zin=function(c,i,lijst){
    return(
      <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:i<lijst.length-1?10:0}}>
        <span style={{fontSize:18,lineHeight:1.3,flexShrink:0}}>{icoon[c.soort]}</span>
        <span style={{fontSize:14,color:WIT,lineHeight:1.45}}>{c.tekst}</span>
      </div>
    );
  };
  const kopje=function(t){return <div style={{fontSize:11,color:GOUDL,textTransform:"uppercase",letterSpacing:1,margin:"4px 0 8px",opacity:0.85}}>{t}</div>;};
  const op=inz.opbouw;
  const opbouwRijen=[op.totaal].concat(op.perTafel).concat(op.eerste&&op.tweede?[op.eerste,op.tweede]:[]);
  const maxAlsScoort=Math.max(1,...opbouwRijen.map(function(x){return x.alsScoort;}));
  const maxGebruik=Math.max(1,...inz.profiel.map(function(x){return x.gebruik;}));
  const maxSerie=Math.max(1,...inz.seriemakers.map(function(x){return x.gem;}));
  const stoppers=inz.seriestoppers.filter(function(x){return x.aantal>=3;}).slice(0,6);
  const maxStop=Math.max(0.01,...stoppers.map(function(x){return x.aandeel;}));
  // Als bijna alle bijgehouden partijen op één tafel zijn gespeeld, zegt de techniekanalyse vooral iets over die tafel
  const metTafels=inz.dekking.perTafel.filter(function(x){return x.partijen>0;});
  const hoofdTafel=metTafels.slice().sort(function(a,b){return b.bijgehouden-a.bijgehouden;})[0];
  const dekkingWaarschuwing=inz.dekking.bijgehouden>=3&&metTafels.length>1&&hoofdTafel&&hoofdTafel.bijgehouden/inz.dekking.bijgehouden>=0.75
    ?"Dat zegt dus vooral iets over je spel op de "+tafelLabel(hoofdTafel.tafel)+"."
    :null;
  // Kleur van een slagingspercentage t.o.v. je eigen gemiddelde over alle technieken
  const pctKleur=function(p){return p>=inz.refPct+0.1?GRNT:p<=inz.refPct-0.1?ROOD:GOUD;};

  return(
    <div style={{display:"flex",flexDirection:"column",gap:10}}>

      {/* Coach-samenvatting */}
      <div style={{background:"linear-gradient(160deg,#24401f,#132613)",border:"1px solid "+GOUD,borderRadius:12,padding:"14px 12px"}}>
        <div style={{fontSize:13,color:GOUD,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Wat je data zegt</div>
        {inz.coach.length===0
          ?<div style={{fontSize:14,color:WITD,lineHeight:1.5}}>Nog te weinig opmerkingen in deze selectie voor duidelijke conclusies. Vink in een partij na elke beurt aan waardoor je serie eindigde en wat goed ging, dan vult dit zich vanzelf.</div>
          :<>
            {spelZinnen.length>0&&kopje("Je spel")}
            {spelZinnen.map(zin)}
            {omstZinnen.length>0&&<div style={{height:12}}/>}
            {omstZinnen.length>0&&kopje("Omstandigheden")}
            {omstZinnen.map(zin)}
          </>}
        <div style={{fontSize:11,color:WITD,opacity:0.8,marginTop:12,lineHeight:1.45,borderTop:"1px solid "+KBDR,paddingTop:8}}>
          📋 Technieken en series: {inz.dekking.bijgehouden} van je {inz.dekking.partijen} partijen bijgehouden
          (minstens {pctTekst(INZICHT_DEKKING)} van de beurten met een opmerking); alleen die tellen mee.
          {inz.dekking.perTafel.length>1&&(" Per tafel: "+inz.dekking.perTafel.map(function(x){return tafelLabel(x.tafel)+" "+x.bijgehouden+" van "+x.partijen;}).join(", ")+".")}
          {dekkingWaarschuwing&&<span style={{color:GOUDL}}> {dekkingWaarschuwing}</span>}
          {" "}Tafel, avond en fase gaan over al je partijen. Conclusies pas vanaf {INZICHT_MIN} voorbeelden.
        </div>
      </div>

      {/* Opbouw van je gemiddelde */}
      <InzichtKaart titel="Waar komt je gemiddelde vandaan"
        uitleg="Je gemiddelde is twee dingen: hoe vaak je in een beurt scoort, en hoeveel caramboles je dan maakt. Hier tellen alle partijen mee, ook de geschrapte.">
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,flexWrap:"wrap",background:"rgba(0,0,0,0.2)",borderRadius:10,padding:"12px 8px",marginBottom:12}}>
          <div style={{textAlign:"center"}}><div style={{fontSize:24,fontWeight:"bold",color:GRNT}}>{pctTekst(op.totaal.scoorPct)}</div><div style={{fontSize:11,color:WITD}}>van je beurten<br/>scoor je</div></div>
          <div style={{fontSize:20,color:WITD}}>×</div>
          <div style={{textAlign:"center"}}><div style={{fontSize:24,fontWeight:"bold",color:GOUDL}}>{komma(op.totaal.alsScoort,2)}</div><div style={{fontSize:11,color:WITD}}>caramboles<br/>als je scoort</div></div>
          <div style={{fontSize:20,color:WITD}}>=</div>
          <div style={{textAlign:"center"}}><div style={{fontSize:24,fontWeight:"bold",color:GOUD}}>{komma(op.totaal.gem,dec)}</div><div style={{fontSize:11,color:WITD}}>gemiddeld<br/>per beurt</div></div>
        </div>
        {opbouwRijen.length>1&&(
          <div>
            <div style={{display:"flex",fontSize:10,color:WITD,textTransform:"uppercase",letterSpacing:0.5,marginBottom:4}}>
              <span style={{width:84}}></span><span style={{flex:1}}>scoort</span><span style={{flex:1,paddingLeft:6}}>als je scoort</span><span style={{width:42,textAlign:"right"}}>gem</span>
            </div>
            {opbouwRijen.map(function(x,i){
              const scheiding=(i===1&&op.perTafel.length>0)||(op.eerste&&x===op.eerste);
              return(
                <div key={x.label} style={{display:"flex",alignItems:"center",fontSize:12,padding:"5px 0",borderTop:scheiding?"1px solid "+KBDR:"none"}}>
                  <span style={{width:84,color:WIT}}>{x.label}</span>
                  <span style={{flex:1,display:"flex",alignItems:"center",gap:4}}>
                    <span style={{flex:1,height:6,background:"rgba(255,255,255,0.08)",borderRadius:3,overflow:"hidden"}}><span style={{display:"block",width:(x.scoorPct*100)+"%",height:"100%",background:GRNT}}/></span>
                    <span style={{width:30,color:WITD,textAlign:"right"}}>{pctTekst(x.scoorPct)}</span>
                  </span>
                  <span style={{flex:1,display:"flex",alignItems:"center",gap:4,paddingLeft:6}}>
                    <span style={{flex:1,height:6,background:"rgba(255,255,255,0.08)",borderRadius:3,overflow:"hidden"}}><span style={{display:"block",width:(x.alsScoort/maxAlsScoort*100)+"%",height:"100%",background:GOUDL}}/></span>
                    <span style={{width:30,color:WITD,textAlign:"right"}}>{komma(x.alsScoort,1)}</span>
                  </span>
                  <span style={{width:42,textAlign:"right",fontWeight:"bold",color:GOUD}}>{komma(x.gem,dec)}</span>
                </div>
              );
            })}
          </div>
        )}
        {/* Motor, poedel en hoogste serie als drie kleine tegels */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginTop:12}}>
          <div style={{background:"rgba(0,0,0,0.2)",borderRadius:8,padding:"8px 6px",textAlign:"center"}}>
            <div style={{fontSize:18,fontWeight:"bold",color:GOUDL}}>{pctTekst(inz.motor.carPct)}</div>
            <div style={{fontSize:10,color:WITD,lineHeight:1.3}}>van je caramboles uit {pctTekst(inz.motor.beurtPct)} van je beurten ({inz.motor.drempel}+)</div>
          </div>
          <div style={{background:"rgba(0,0,0,0.2)",borderRadius:8,padding:"8px 6px",textAlign:"center"}}>
            <div style={{fontSize:18,fontWeight:"bold",color:inz.poedel.naPoedel!==null&&inz.poedel.naPoedel-inz.poedel.kans>=0.1?ROOD:GRNT}}>{inz.poedel.naPoedel===null?"—":pctTekst(inz.poedel.naPoedel)}</div>
            <div style={{fontSize:10,color:WITD,lineHeight:1.3}}>kans op poedel na een poedel (gewoonlijk {pctTekst(inz.poedel.kans)})</div>
          </div>
          <div style={{background:"rgba(0,0,0,0.2)",borderRadius:8,padding:"8px 6px",textAlign:"center"}}>
            <div style={{fontSize:18,fontWeight:"bold",color:GOUD}}>{inz.hoogsteSerie?komma(inz.hoogsteSerie.eerste,1)+" → "+komma(inz.hoogsteSerie.tweede,1):"—"}</div>
            <div style={{fontSize:10,color:WITD,lineHeight:1.3}}>hoogste serie per partij, eerste → tweede helft</div>
          </div>
        </div>
      </InzichtKaart>

      {/* Speelprofiel per techniek */}
      {inz.profiel.length>0&&(
        <InzichtKaart titel="Je speelprofiel per techniek"
          uitleg={"Lengte = hoe vaak de techniek voorkwam, groen = ging goed, rood = serie eindigde erdoor. Een lange rode balk betekent niet dat je er slecht in bent: misschien speel je hem gewoon veel. Kijk naar het percentage; gemiddeld over al je technieken is dat "+pctTekst(inz.refPct)+"."}>
          {inz.profiel.map(function(x){
            const weinig=x.gebruik<INZICHT_MIN;
            return(
              <div key={x.label} style={{display:"flex",alignItems:"center",gap:8,marginBottom:7,opacity:weinig?0.45:1}}>
                <div style={{width:92,flexShrink:0}}>
                  <div style={{fontSize:13,color:WIT,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{x.label}</div>
                  <div style={{fontSize:10,color:WITD}}>{x.gebruik}× · {x.goed} goed</div>
                </div>
                <div style={{flex:1,height:14,display:"flex"}}>
                  <div style={{width:(x.gebruik/maxGebruik*100)+"%",display:"flex",borderRadius:4,overflow:"hidden",minWidth:4}}>
                    <div style={{width:(x.pct*100)+"%",background:GRNT}}/>
                    <div style={{flex:1,background:"#b84a4a"}}/>
                  </div>
                </div>
                <div style={{width:40,textAlign:"right",fontSize:14,fontWeight:"bold",color:weinig?WITD:pctKleur(x.pct)}}>{pctTekst(x.pct)}</div>
              </div>
            );
          })}
          <div style={{fontSize:11,color:WITD,marginTop:6,display:"flex",gap:12,flexWrap:"wrap"}}>
            <span><span style={{color:GRNT}}>■</span> ging goed</span>
            <span><span style={{color:"#b84a4a"}}>■</span> serie eindigde erdoor</span>
            <span style={{opacity:0.6}}>vaag = minder dan {INZICHT_MIN}×</span>
          </div>
          {inz.acquitPartijen>0&&(
            <div style={{fontSize:11,color:WITD,opacity:0.8,marginTop:6}}>
              Acquit: in je {inz.acquitPartijen} partijen op de 2,30 tot 14 oktober 2026 telt beurt 1 als acquit (caramboles = gemaakt, poedel = gemist). Daarna alleen als je hem zelf aanvinkt.
            </div>
          )}
        </InzichtKaart>
      )}

      {/* Seriemakers */}
      {inz.seriemakers.length>0&&(
        <InzichtKaart titel="Wat levert grote series op"
          uitleg={"Gemiddeld aantal caramboles in beurten waarin dit goed ging, tegenover je gemiddelde van "+komma(inz.basisTag,dec)+" per beurt in de bijgehouden partijen."}>
          {inz.seriemakers.map(function(x){
            return(
              <div key={x.label} style={{marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:3}}>
                  <span style={{color:WIT}}>{x.label} <span style={{fontSize:11,color:WITD}}>({x.aantal}×)</span></span>
                  <span style={{color:GOUDL,fontWeight:"bold"}}>{komma(x.gem,1)} car <span style={{color:GRNT}}>· {komma(x.factor,1)}×</span></span>
                </div>
                <div style={{height:8,background:"rgba(255,255,255,0.08)",borderRadius:4,overflow:"hidden"}}>
                  <div style={{width:(x.gem/maxSerie*100)+"%",height:"100%",background:"linear-gradient(90deg,"+GOUD+","+GOUDL+")",borderRadius:4}}/>
                </div>
              </div>
            );
          })}
        </InzichtKaart>
      )}

      {/* Seriestoppers */}
      {stoppers.length>0&&(
        <InzichtKaart titel="Waardoor eindigden je series"
          uitleg={"Van de "+inz.metOorzaak+" beurten waarbij je aanvinkte waardoor de serie eindigde. Beschrijvend, geen oordeel."}>
          {stoppers.map(function(x){
            return(
              <div key={x.label} style={{marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:3}}>
                  <span style={{color:WIT}}>{x.label}</span>
                  <span style={{color:WITD}}><strong style={{color:"#e08055"}}>{pctTekst(x.aandeel)}</strong> · gem {komma(x.gem,1)} car in die beurt</span>
                </div>
                <div style={{height:8,background:"rgba(255,255,255,0.08)",borderRadius:4,overflow:"hidden"}}>
                  <div style={{width:(x.aandeel/maxStop*100)+"%",height:"100%",background:"#b8604a",borderRadius:4}}/>
                </div>
              </div>
            );
          })}
        </InzichtKaart>
      )}

      {/* Omstandigheden */}
      {inz.omstandigheden.length>0&&(
        <InzichtKaart titel="Omstandigheden" uitleg={"Gemiddelde per beurt; ▲▼ tegenover het gemiddelde van de partijen die in dat blok meetellen. Partij van de avond: alleen avonden met 2 of meer partijen."}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {inz.omstandigheden.map(function(o){
              return(
                <div key={o.titel} style={{background:"rgba(0,0,0,0.2)",borderRadius:8,padding:"8px 9px"}}>
                  <div style={{fontSize:11,color:GOUD,textTransform:"uppercase",letterSpacing:0.5,marginBottom:6}}>{o.titel}</div>
                  {o.rijen.map(function(r){
                    const k=r.verschil>=0.05?GRNT:r.verschil<=-0.05?ROOD:WITD;
                    return(
                      <div key={r.label} style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",fontSize:12,marginBottom:4}}>
                        <span style={{color:WITD}}>{r.label}</span>
                        <span><strong style={{color:WIT}}>{komma(r.gem,dec)}</strong> <span style={{color:k,fontSize:11}}>{r.verschil>=0?"▲":"▼"}{Math.abs(Math.round(r.verschil*100))}%</span></span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </InzichtKaart>
      )}

      {/* Trend van seriestoppers */}
      {inz.trend.length>0&&(
        <InzichtKaart titel="Werk je je werkpunten weg?"
          uitleg="Hoe vaak een oorzaak je serie beëindigde, per 100 beurten: eerste helft van je bijgehouden partijen tegenover de tweede helft. Ben je anders gaan aanvinken, dan zie je dat hier ook terug.">
          {inz.trend.map(function(x){
            const beter=x.verandering<=-0.3,slechter=x.verandering>=0.3;
            return(
              <div key={x.label} style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",fontSize:13,padding:"5px 0",borderBottom:"1px solid "+KBDR}}>
                <span style={{color:WIT}}>{x.label}</span>
                <span style={{color:WITD}}>{komma(x.voor,1)} → <strong style={{color:WIT}}>{komma(x.na,1)}</strong>{" "}
                  <span style={{color:beter?GRNT:slechter?ROOD:WITD,fontSize:12}}>{beter?"▼ minder":slechter?"▲ vaker":"≈ gelijk"}</span>
                </span>
              </div>
            );
          })}
        </InzichtKaart>
      )}
    </div>
  );
}
