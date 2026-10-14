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
  // Vergelijken in poedels en series: welke twee groepen partijen (zie vergelijkSeries)
  const [vgModus,setVgModus]=useState("helften");
  // "Vanaf": knip bij een zelf gekozen maand (standaard de maand die de partijen het eerlijkst in tweeën deelt)
  const [vgVanaf,setVgVanaf]=useState(null);
  const maanden=useMemo(function(){return maandenVan(partijen);},[partijen]);
  const vanaf=maanden.indexOf(vgVanaf)>0?vgVanaf:standaardVanaf(partijen);
  const vg=useMemo(function(){return vergelijkSeries(partijen,discipline,vgModus,{vanaf:vanaf});},[partijen,discipline,vgModus,vanaf]);

  if(!inz)return <div style={{fontSize:14,color:WITD,padding:"8px 0"}}>Nog geen beurten in deze selectie.</div>;
  const dec=discipline==="driebanden"?3:2;
  const pctTekst=function(x){return Math.round(x*100)+"%";};
  const icoon={vorm:"📊",poedel:"⭕",sterk:"💪",werk:"🎯",motor:"⚙️",serie:"🔥",mentaal:"🧘",omstandigheid:"🧭",trend:"📈"};
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
  // Poedels en series: kleur per groep (poedel, kleine series ... grootste series)
  const se=inz.series;
  const groepKleur=[ROOD,"#7d8f72",GOUD,GRNT,GOUDL,"#ff9f40"];
  const kleurVan=function(i){return groepKleur[Math.min(i,groepKleur.length-1)];};
  const groepNaam=function(g){return g.van===0?"Poedels":"Series van "+g.label.replace("-","–");};
  const k1=function(x){return komma(x,1);};
  // Je gemiddelde partij als blokjes: per groep afgerond, samen precies het aantal beurten (grootste rest)
  const blokjes=(function(){
    const N=se.hefboom.beurten,ruw=se.nu.groepen.map(function(g){return g.perPartij*N/Math.max(se.nu.beurtenPP,1);});
    const af=ruw.map(Math.floor);let rest=N-af.reduce(function(s,x){return s+x;},0);
    ruw.map(function(x,i){return{i:i,r:x-Math.floor(x)};}).sort(function(a,b){return b.r-a.r;}).forEach(function(x){if(rest>0){af[x.i]++;rest--;}});
    const lijst=[];af.forEach(function(aantal,i){for(let j=0;j<aantal;j++)lijst.push(i);});
    return lijst;
  })();
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

      {/* Poedels en series: waar je gemiddelde vandaan komt */}
      <InzichtKaart titel="Poedels en series"
        uitleg="Elke beurt eindigt met een misser. Je gemiddelde gaat alleen omhoog door minder poedels en grotere series. Hier tellen alle partijen mee, ook de geschrapte.">
        <div style={{fontSize:12,color:WITD,marginBottom:6}}>Je gemiddelde partij van {se.hefboom.beurten} beurten:</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:3,marginBottom:6}}>
          {blokjes.map(function(i,j){return <div key={j} style={{width:14,height:14,borderRadius:3,background:kleurVan(i)}}/>;})}
        </div>
        <div style={{fontSize:11,color:WITD,display:"flex",flexWrap:"wrap",gap:"2px 10px",marginBottom:4}}>
          {se.nu.groepen.map(function(g,i){return <span key={g.label}><span style={{color:kleurVan(i)}}>■</span> {g.van===0?"poedel":g.label.replace("-","–")}</span>;})}
        </div>
        {(function(){
          // Groepen die door het afronden niet als blokje te zien zijn, toch even noemen
          const zeldzaam=se.nu.groepen.filter(function(g){return g.van>0&&g.perPartij>0&&g.perPartij<0.5;});
          return zeldzaam.length?<div style={{fontSize:11,color:WITD,opacity:0.8,marginBottom:4}}>
            {zeldzaam.map(function(g){return"Series van "+g.label.replace("-","–")+": gemiddeld "+k1(g.perPartij)+" per partij (ongeveer 1 op de "+Math.round(1/g.perPartij)+" partijen)";}).join(". ")}.
          </div>:null;
        })()}
        <div style={{display:"flex",fontSize:10,color:WITD,textTransform:"uppercase",letterSpacing:0.5,margin:"10px 0 2px"}}>
          <span style={{flex:1}}></span><span style={{width:44,textAlign:"right"}}>per partij</span>
          <span style={{width:110,textAlign:"right"}}>van je caramboles</span>
        </div>
        {se.nu.groepen.map(function(g,i){
          return(
            <div key={g.label} style={{display:"flex",alignItems:"center",gap:8,fontSize:13,padding:"4px 0",borderTop:i?"1px solid rgba(255,255,255,0.05)":"none"}}>
              <span style={{flex:1,color:WIT,whiteSpace:"nowrap"}}><span style={{color:kleurVan(i)}}>■</span> {groepNaam(g)}</span>
              <span style={{width:36,textAlign:"right",color:WIT,fontWeight:"bold"}}>{k1(g.perPartij)}</span>
              <span style={{width:66,height:7,background:"rgba(255,255,255,0.08)",borderRadius:3,overflow:"hidden"}}>
                <span style={{display:"block",width:(g.carAandeel*100)+"%",height:"100%",background:kleurVan(i)}}/>
              </span>
              <span style={{width:34,textAlign:"right",color:g.van===0?ROOD:WITD}}>{g.van===0?"0":pctTekst(g.carAandeel)}</span>
            </div>
          );
        })}

        {/* Vergelijken, per tafel: eerder tegenover nu, laatste 10, goed tegenover slecht, vanaf een maand */}
        {(function(){
          const chip=function(aan,tekst,klik,key){
            return <button key={key||tekst} onClick={klik} style={{flex:"0 0 auto",padding:"4px 10px",background:aan?"#2d4a1e":"none",border:"1px solid "+(aan?GOUD:KBDR),
              borderRadius:5,color:aan?GOUD:WITD,fontSize:12,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>{tekst}</button>;
          };
          const kop={helften:inz.helftLabels?"Eerder tegenover nu · "+inz.helftLabels.eerste+" → "+inz.helftLabels.tweede:"Eerder tegenover nu",
            laatste10:"Je laatste partijen tegenover die ervoor",goedslecht:"Je slechtste tegenover je beste partijen",
            vanaf:"Vóór "+vanaf+" → vanaf "+vanaf}[vgModus];
          const uitleg={helften:null,laatste10:"Per tafel je laatste 10 partijen (bij minder dan 20 partijen de laatste helft) tegenover alles daarvoor.",
            goedslecht:"Per tafel je slechtste derde tegenover je beste derde partijen (op gemiddelde): waar zit het verschil tussen een goede en een slechte partij?",
            vanaf:"Kies vanaf welke maand: alles daarvoor tegenover alles daarna, bijv. sinds de zomerstop of sinds je anders traint."}[vgModus];
          return(
            <div style={{marginTop:14}}>
              <div style={{fontSize:11,color:WITD,marginBottom:5}}>Vergelijk:</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:8}}>
                {[["helften","Eerder vs nu"],["laatste10","Recent vs ervoor"],["goedslecht","Goed vs slecht"],["vanaf","Vanaf"]].map(function(x){
                  return chip(vgModus===x[0],x[1],function(){setVgModus(x[0]);},x[0]);
                })}
              </div>
              {vgModus==="vanaf"&&maanden.length>1&&<div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:8}}>
                {maanden.slice(1).map(function(m){return chip(m===vanaf,m,function(){setVgVanaf(m);},m);})}
              </div>}
              <div style={{fontSize:12,color:GOUDL,textTransform:"uppercase",letterSpacing:0.5,marginBottom:uitleg?3:6}}>{kop}</div>
              {uitleg&&<div style={{fontSize:11,color:WITD,opacity:0.8,marginBottom:6,lineHeight:1.4}}>{uitleg}</div>}
              {vg.vergelijkingen.length===0&&<div style={{fontSize:12,color:WITD,padding:"6px 0"}}>
                {"Te weinig partijen om zo te vergelijken (minstens 3 partijen per kant, per tafel)."}
              </div>}
              {vg.vergelijkingen.map(function(v){
                return(
                  <div key={v.tafel||"alle"} style={{background:"rgba(0,0,0,0.2)",borderRadius:8,padding:"8px 10px",marginBottom:8}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:v.labelA?2:6}}>
                      <span style={{color:WIT,fontWeight:"bold"}}>{v.tafel?tafelLabel(v.tafel):"Alle partijen"}</span>
                      <span style={{color:WITD}}>gemiddelde {komma(v.e.gem,dec)} → <strong style={{color:v.w.gem>=v.e.gem?GRNT:ROOD}}>{komma(v.w.gem,dec)}</strong></span>
                    </div>
                    {v.labelA&&<div style={{fontSize:11,color:WITD,textAlign:"right",marginBottom:6}}>{v.labelA} → {v.labelB}</div>}
                    <div style={{display:"flex",fontSize:10,color:WITD,textTransform:"uppercase",letterSpacing:0.5,marginBottom:2}}>
                      <span style={{flex:1}}></span><span style={{width:84,textAlign:"right"}}>per partij</span><span style={{width:64,textAlign:"right"}}>effect</span>
                    </div>
                    {v.e.groepen.map(function(g,i){
                      const w=v.w.groepen[i],eff=v.bijdrage[i];
                      const beter=g.van===0?w.perPartij<g.perPartij-0.2:eff>0.02,slechter=g.van===0?w.perPartij>g.perPartij+0.2:eff<-0.02;
                      return(
                        <div key={g.label} style={{display:"flex",fontSize:12,padding:"2px 0"}}>
                          <span style={{flex:1,color:WITD}}><span style={{color:kleurVan(i)}}>■</span> {groepNaam(g)}</span>
                          <span style={{width:84,textAlign:"right",color:WIT}}>{k1(g.perPartij)} → {k1(w.perPartij)}</span>
                          <span style={{width:64,textAlign:"right",color:beter?GRNT:slechter?ROOD:WITD}}>
                            {g.van===0?(beter?"▼ minder":slechter?"▲ meer":"≈"):(Math.abs(eff)<0.005?"≈":(eff>0?"+":"−")+komma(Math.abs(eff),2))}
                          </span>
                        </div>
                      );
                    })}
                    <div style={{display:"flex",fontSize:12,padding:"4px 0 0",marginTop:2,borderTop:"1px solid rgba(255,255,255,0.08)"}}>
                      <span style={{flex:1,color:WITD}}>🔥 Hoogste serie</span>
                      <span style={{width:84,textAlign:"right",color:WIT}}>{k1(v.e.hoogste)} → {k1(v.w.hoogste)}</span>
                      <span style={{width:64}}></span>
                    </div>
                  </div>
                );
              })}
              {vg.vergelijkingen.length>0&&vg.teWeinig.filter(Boolean).length>0&&<div style={{fontSize:11,color:WITD,opacity:0.8,marginBottom:6}}>
                Te weinig partijen voor deze vergelijking op de {vg.teWeinig.filter(Boolean).map(tafelLabel).join(", ").replace(/, ([^,]*)$/," en $1")}.
              </div>}
              {vg.vergelijkingen.length>0&&<div style={{fontSize:11,color:WITD,opacity:0.8}}>"Effect" is hoeveel die groep je gemiddelde omhoog (+) of omlaag (−) bracht; samen is dat precies het verschil. Minder poedels zie je terug als meer series. "Per partij" hangt ook af van hoe lang de partijen waren.</div>}
            </div>
          );
        })()}

        {/* Wat levert het op */}
        <div style={{marginTop:14,background:"rgba(201,168,76,0.08)",border:"1px solid "+KBDR,borderRadius:8,padding:"10px 12px"}}>
          <div style={{fontSize:12,color:GOUDL,textTransform:"uppercase",letterSpacing:0.5,marginBottom:6}}>Wat levert het op? (partij van {se.hefboom.beurten} beurten)</div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:13,padding:"3px 0"}}>
            <span style={{color:WITD}}>1 poedel minder (een beurt van {se.hefboom.klein})</span><strong style={{color:GRNT}}>+{komma(se.hefboom.klein/se.hefboom.beurten,2)}</strong>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:13,padding:"3px 0"}}>
            <span style={{color:WITD}}>1 serie van {se.hefboom.groot} in plaats van een poedel</span><strong style={{color:GRNT}}>+{komma(se.hefboom.groot/se.hefboom.beurten,2)}</strong>
          </div>
          <div style={{fontSize:12,color:WIT,marginTop:4}}>Eén grote serie is evenveel waard als {Math.round(se.hefboom.groot/se.hefboom.klein)} poedels minder.</div>
        </div>

        {/* Motor en reactie op een poedel */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginTop:12}}>
          <div style={{background:"rgba(0,0,0,0.2)",borderRadius:8,padding:"8px 6px",textAlign:"center"}}>
            <div style={{fontSize:18,fontWeight:"bold",color:GOUDL}}>{pctTekst(inz.motor.carPct)}</div>
            <div style={{fontSize:10,color:WITD,lineHeight:1.3}}>van je caramboles uit {pctTekst(inz.motor.beurtPct)} van je beurten ({inz.motor.drempel}+)</div>
          </div>
          <div style={{background:"rgba(0,0,0,0.2)",borderRadius:8,padding:"8px 6px",textAlign:"center"}}>
            <div style={{fontSize:10,color:WITD,lineHeight:1.3,marginBottom:3}}>kans op nog een poedel na een poedel</div>
            {inz.poedel.perTafel.length===0&&<div style={{fontSize:18,fontWeight:"bold",color:WITD}}>—</div>}
            {inz.poedel.perTafel.map(function(x){
              const verschil=x.naPoedel-x.naScore;
              return(
                <div key={x.tafel||"alle"} style={{fontSize:12,color:WITD,lineHeight:1.4}}>
                  {x.tafel?tafelLabel(x.tafel)+": ":""}<strong style={{fontSize:15,color:verschil>=0.05?ROOD:verschil<=-0.03?GRNT:GOUDL}}>{pctTekst(x.naPoedel)}</strong> <span style={{fontSize:10}}>(na score {pctTekst(x.naScore)})</span>
                </div>
              );
            })}
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
