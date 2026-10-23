// Dash > Inzicht: wat gaat goed, wat minder, en waar valt winst te halen. De cijfers komen uit
// berekenInzicht() (js/berekeningen.js); dit bestand tekent ze. JSX (vooraf omgezet door bouw-jsx.js), vóór jsx/dashboard.jsx.

function komma(x,dec){return getalTekst(x,dec);}

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
  const eenvoudig=useContext(EenvoudigContext);
  // Hoogste series: welk aantal caramboles is opengeklapt (null = het hoogste)
  const [serieAantal,setSerieAantal]=useState(null);
  // Aangetikt staafje in de grafiek hoogste serie per partij: {tafel,nr}
  const [staaf,setStaaf]=useState(null);
  // Aangetikte partij in de poedelgrafiek: {tafel,nr}
  const [poedelStaaf,setPoedelStaaf]=useState(null);
  // Wat als: omgezette poedels in de gekozen partij (beurtnummers) en hoeveel caramboles elk dan oplevert;
  // per tafel de gekozen acquit-kans en caramboles bij een gelukte acquit
  const [watAls,setWatAls]=useState({sleutel:null,beurten:[]});
  const [watAlsCar,setWatAlsCar]=useState(null);
  const [acqKeuze,setAcqKeuze]=useState({});
  // Grafieken hoogste series scrollen zijwaarts; bij openen naar rechts (je nieuwste partijen)
  const grafiekRefs=useRef({});
  useEffect(function(){
    Object.keys(grafiekRefs.current).forEach(function(k){const el=grafiekRefs.current[k];if(el)el.scrollLeft=el.scrollWidth;});
  },[partijen,discipline]);
  // Vergelijken in poedels en series: welke twee groepen partijen (zie vergelijkSeries)
  const [vgModus,setVgModus]=useState("helften");
  // "Vanaf": knip bij een zelf gekozen maand (standaard de maand die de partijen het eerlijkst in tweeën deelt)
  const [vgVanaf,setVgVanaf]=useState(null);
  const maanden=useMemo(function(){return maandenVan(partijen);},[partijen]);
  const vanaf=maanden.indexOf(vgVanaf)>0?vgVanaf:standaardVanaf(partijen);
  const vg=useMemo(function(){return vergelijkSeries(partijen,discipline,vgModus,{vanaf:vanaf});},[partijen,discipline,vgModus,vanaf]);

  if(!inz)return <div style={{fontSize:14,color:WITD,padding:"8px 0"}}>{t("Nog geen beurten in deze selectie.")}</div>;
  const dec=discipline==="driebanden"?3:2;
  // Kaarten over opmerkingen: altijd, behalve in eenvoudige modus zonder één bijgehouden partij
  const metOpm=!eenvoudig||inz.dekking.bijgehouden>0;
  const pctTekst=procentTekst;
  const icoon={vorm:"📊",hoogste:"🏆",poedeltrend:"⭕",poedel:"⭕",sterk:"💪",werk:"🎯",motor:"⚙️",serie:"🔥",mentaal:"🧘",omstandigheid:"🧭",trend:"📈"};
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
  const kopje=function(x){return <div style={{fontSize:11,color:GOUDL,textTransform:"uppercase",letterSpacing:1,margin:"4px 0 8px",opacity:0.85}}>{x}</div>;};
  // Poedels en series: kleur per groep (poedel, kleine series ... grootste series)
  const se=inz.series;
  const groepKleur=[ROOD,"#7d8f72",GOUD,GRNT,GOUDL,"#ff9f40"];
  const kleurVan=function(i){return groepKleur[Math.min(i,groepKleur.length-1)];};
  const groepNaam=function(g){return g.van===0?t("Poedels"):t("Series van {n}",{n:g.label.replace("-","–")});};
  const labels=function(l){return l.map(function(x){return t(x);}).join(", ");};
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
    ?t("Dat zegt dus vooral iets over je spel op de {tafel}.",{tafel:tafelLabel(hoofdTafel.tafel)})
    :null;
  // Kleur van een slagingspercentage t.o.v. je eigen gemiddelde over alle technieken
  const pctKleur=function(p){return p>=inz.refPct+0.1?GRNT:p<=inz.refPct-0.1?ROOD:GOUD;};

  return(
    <div style={{display:"flex",flexDirection:"column",gap:10}}>

      {/* Coach-samenvatting */}
      <div style={{background:"linear-gradient(160deg,var(--c-24401f),var(--c-132613))",border:"1px solid "+GOUD,borderRadius:12,padding:"14px 12px"}}>
        <div style={{fontSize:13,color:GOUD,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>{t("Wat je data zegt")}</div>
        {inz.coach.length===0
          ?<div style={{fontSize:14,color:WITD,lineHeight:1.5}}>{t("Nog te weinig opmerkingen in deze selectie voor duidelijke conclusies. Vink in een partij na elke beurt aan waardoor je serie eindigde en wat goed ging, dan vult dit zich vanzelf.")}</div>
          :<>
            {spelZinnen.length>0&&kopje(t("Je spel"))}
            {spelZinnen.map(zin)}
            {omstZinnen.length>0&&<div style={{height:12}}/>}
            {omstZinnen.length>0&&kopje(t("Omstandigheden"))}
            {omstZinnen.map(zin)}
          </>}
        <div style={{fontSize:11,color:WITD,opacity:0.8,marginTop:12,lineHeight:1.45,borderTop:"1px solid "+KBDR,paddingTop:8}}>
          📋 {t("Technieken en series: {a} van je {b} partijen bijgehouden (minstens {p} van de beurten met een opmerking); alleen die tellen mee.",{a:inz.dekking.bijgehouden,b:inz.dekking.partijen,p:pctTekst(INZICHT_DEKKING)})}
          {inz.dekking.perTafel.length>1&&(" "+t("Per tafel:")+" "+inz.dekking.perTafel.map(function(x){return tafelLabel(x.tafel)+" "+t("{a} van {b}",{a:x.bijgehouden,b:x.partijen});}).join(", ")+".")}
          {dekkingWaarschuwing&&<span style={{color:GOUDL}}> {dekkingWaarschuwing}</span>}
          {" "}{t("Tafel, avond en fase gaan over al je partijen. Conclusies pas vanaf {n} voorbeelden.",{n:INZICHT_MIN})}
        </div>
      </div>


      {/* Je hoogste series: record per tafel, gaat het de goede kant op, en je top 10 */}
      {inz.hoogste&&(function(){
        const hs=inz.hoogste;
        const oordeelStijl={beter:["✅ "+t("Gaat de goede kant op"),GRNT],stabiel:["➖ "+t("Blijft gelijk"),GOUD],minder:["⚠️ "+t("Heeft nog wat nodig"),ROOD]};
        const hoogsteOoit=Math.max(1,...hs.perTafel.map(function(x){return x.record?x.record.car:0;}));
        return(
          <InzichtKaart titel={t("Je hoogste series")} rand={GOUD}
            uitleg={t("Per tafel je record en je hoogste serie per partij. Je laatste partijen (fel) tegenover die ervoor (vaag): gaat het de goede kant op? Grote series = {n} of meer.",{n:hs.grootMin})}>
            {hs.perTafel.map(function(x){
              const o=x.oordeel?oordeelStijl[x.oordeel]:null;
              return(
                <div key={x.tafel} style={{background:"rgba(0,0,0,0.2)",borderRadius:8,padding:"10px",marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,gap:8}}>
                    <span style={{fontSize:14,color:WIT,fontWeight:"bold"}}>{hs.perTafel.length>1?tafelLabel(x.tafel):t("Alle partijen")}</span>
                    <span style={{fontSize:12,color:o?o[1]:WITD,fontWeight:o?"bold":"normal",textAlign:"right"}}>{o?o[0]:t("Nog te weinig partijen voor een oordeel")}</span>
                  </div>
                  {x.record&&<div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:8}}>
                    <span style={{fontSize:30,fontWeight:"bold",color:"#ff9f40",lineHeight:1}}>🏆 {x.record.car}</span>
                    <span style={{fontSize:12,color:WITD}}>{t("record")} · {fmtDatum(x.record.datum)} · p{x.record.nr}, {t("beurt {b}",{b:x.record.beurt})}</span>
                  </div>}
                  {/* Hoogste serie per partij */}
                  <div style={{fontSize:11,color:WITD,marginBottom:4,lineHeight:1.4}}>
                    {t("Per partij al je series van {n}+ (geen {n}+? dan je hoogste). Eén vlakje = één partij; scroll naar links voor eerdere partijen, tik voor details.",{n:hs.vanaf})}
                  </div>
                  <div ref={function(el){grafiekRefs.current[x.tafel||"alle"]=el;}} style={{overflowX:"auto",WebkitOverflowScrolling:"touch",paddingBottom:4}}>
                    <div style={{display:"flex",alignItems:"flex-end",gap:5,width:"max-content",minWidth:"100%"}}>
                      {x.partijen.map(function(p,i){
                        const recent=i>=x.partijen.length-x.aantal;
                        const gekozen=staaf&&staaf.tafel===x.tafel&&staaf.nr===p.nr;
                        // In volgorde van de partij; zonder grote serie alleen de hoogste
                        const staven=p.series.length?p.series.slice().sort(function(a,b){return a.beurt-b.beurt;}):[{car:p.max,beurt:p.beurt}];
                        const zwak=!gekozen&&!recent;
                        return(
                          <div key={p.nr} onClick={function(){setStaaf(gekozen?null:{tafel:x.tafel,nr:p.nr});}}
                            style={{display:"flex",flexDirection:"column",alignItems:"center",cursor:"pointer",flexShrink:0}}>
                            <div style={{display:"flex",alignItems:"flex-end",gap:2,height:76,padding:"0 3px",borderRadius:"4px 4px 0 0",
                              background:gekozen?"rgba(255,255,255,0.16)":"rgba(255,255,255,0.05)",
                              // Rand binnen het vlakje (altijd 1px, anders transparant): een outline valt buiten en wordt door het scrollvak afgeknipt
                              border:"1px solid "+(gekozen?WIT:"transparent"),borderBottom:"none"}}>
                              {staven.map(function(s){
                                const isRecord=x.record&&p.nr===x.record.nr&&s.beurt===x.record.beurt;
                                return(
                                  <div key={s.beurt} style={{width:13,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",height:"100%"}}>
                                    <span style={{fontSize:9,color:zwak?WITD:WIT,opacity:zwak?0.6:1,marginBottom:1,fontWeight:isRecord?"bold":"normal"}}>{s.car}</span>
                                    <div className="staaf-groei" style={{width:"100%",height:Math.max(2,s.car/hoogsteOoit*58),background:beurtKleur(s.car,discipline),opacity:zwak?0.35:1,
                                      borderRadius:"2px 2px 0 0",boxShadow:isRecord?"0 0 0 1px "+WIT:"none"}}/>
                                  </div>
                                );
                              })}
                            </div>
                            <div style={{fontSize:8,color:gekozen?WIT:WITD,opacity:zwak?0.6:1,marginTop:2,whiteSpace:"nowrap"}}>p{p.nr}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div style={{height:1,background:"rgba(255,255,255,0.15)",marginBottom:8}}/>
                  {(function(){
                    const p=staaf&&staaf.tafel===x.tafel?x.partijen.find(function(y){return y.nr===staaf.nr;}):null;
                    if(!p)return null;
                    return(
                      <div style={{background:"rgba(255,255,255,0.05)",border:"1px solid "+KBDR,borderRadius:6,padding:"7px 9px",marginBottom:8}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",gap:8}}>
                          <span style={{fontSize:12,color:WIT}}>p{p.nr} · {fmtDatum(p.datum)} · {t("{c} caramboles in {b} beurten",{c:p.car,b:p.n})} · {t("gemiddelde")} {komma(p.gem,dec)}</span>
                          <span onClick={function(){setStaaf(null);}} style={{fontSize:14,color:WITD,cursor:"pointer",padding:"0 2px"}}>✕</span>
                        </div>
                        {(function(){
                          // Alle grote series in deze partij; zonder grote serie alleen de hoogste
                          const rijen=p.series.length?p.series:[{car:p.max,beurt:p.beurt,goed:p.goed,gemist:p.gemist}];
                          return(
                            <>
                              <div style={{fontSize:12,color:WITD,marginTop:2}}>
                                <span style={{color:ROOD}}>⭕ {t("{n} poedels",{n:p.poedels})}</span> {t("van de {n} beurten",{n:p.n})} ({Math.round(p.poedels/Math.max(1,p.n)*100)}%)
                              </div>
                              <div style={{fontSize:12,color:WITD,marginTop:2}}>
                                {p.series.length>1?t("{s} series van {n} of meer in deze partij ({b} beurten):",{s:p.series.length,n:hs.vanaf,b:p.n})
                                  :p.series.length===1?t("1 serie van {n} of meer in deze partij ({b} beurten):",{n:hs.vanaf,b:p.n})
                                  :t("Geen serie van {n} of meer; je hoogste ({b} beurten):",{n:hs.vanaf,b:p.n})}
                              </div>
                              {rijen.map(function(s,i){
                                return(
                                  <div key={i} style={{display:"flex",gap:8,padding:"4px 0",borderTop:i?"1px solid rgba(255,255,255,0.06)":"none"}}>
                                    <strong style={{width:24,fontSize:16,color:beurtKleur(s.car,discipline),lineHeight:1.2}}>{s.car}</strong>
                                    <div style={{flex:1,minWidth:0}}>
                                      <div style={{fontSize:11,color:WIT}}>{t("beurt {b}",{b:s.beurt})}</div>
                                      {s.goed.length>0&&<div style={{fontSize:11,color:GRNT,lineHeight:1.35}}>✓ {labels(s.goed)}</div>}
                                      {s.gemist.length>0&&<div style={{fontSize:11,color:ROOD,lineHeight:1.35}}>✗ {t("eindigde door:")} {labels(s.gemist)}</div>}
                                      {!s.goed.length&&!s.gemist.length&&<div style={{fontSize:11,color:WITD,opacity:0.7}}>{t("geen opmerkingen bijgehouden")}</div>}
                                    </div>
                                  </div>
                                );
                              })}
                            </>
                          );
                        })()}
                      </div>
                    );
                  })()}
                  {x.aantal>0&&x.voor.partijen>0&&<div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:6,alignItems:"center",fontSize:12}}>
                    <div style={{color:WITD,textAlign:"center"}}>
                      <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:0.5}}>{t("{n} ervoor",{n:x.voor.partijen})}</div>
                      <div><strong style={{fontSize:16,color:WIT}}>{k1(x.voor.hoogste)}</strong> {t("hoogste")}</div>
                      <div>{k1(x.voor.groot)} × {hs.grootMin}+ {t("per partij")}</div>
                    </div>
                    <div style={{fontSize:16,color:o?o[1]:WITD}}>→</div>
                    <div style={{color:WITD,textAlign:"center"}}>
                      <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:0.5}}>{t("laatste {n}",{n:x.aantal})}</div>
                      <div><strong style={{fontSize:16,color:o?o[1]:WIT}}>{k1(x.na.hoogste)}</strong> {t("hoogste")}</div>
                      <div style={{color:x.na.groot>x.voor.groot+0.1?GRNT:x.na.groot<x.voor.groot-0.1?ROOD:WITD}}>{k1(x.na.groot)} × {hs.grootMin}+ {t("per partij")}</div>
                    </div>
                  </div>}
                </div>
              );
            })}
            {/* Al je grote series per aantal; tik een aantal aan voor wanneer het was */}
            {hs.perAantal.length>0&&(function(){
              const open=hs.perAantal.find(function(g){return g.car===serieAantal;})||hs.perAantal[0];
              const max=30;
              return(
                <div>
                  <div style={{fontSize:12,color:GOUDL,textTransform:"uppercase",letterSpacing:0.5,margin:"4px 0 3px"}}>{t("Al je series van {n} of meer",{n:hs.vanaf})}</div>
                  <div style={{fontSize:11,color:WITD,opacity:0.8,marginBottom:8}}>{t("Tik een aantal aan om te zien wanneer het was.")}</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>
                    {hs.perAantal.map(function(g){
                      const aan=g===open;
                      return(
                        <button key={g.car} onClick={function(){setSerieAantal(g.car);}}
                          style={{padding:"5px 10px",background:aan?"var(--c-2d4a1e)":"rgba(0,0,0,0.2)",border:"1px solid "+(aan?GOUD:KBDR),borderRadius:6,
                            cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"baseline",gap:4}}>
                          <strong style={{fontSize:16,color:beurtKleur(g.car,discipline)}}>{g.car}</strong>
                          <span style={{fontSize:11,color:aan?GOUD:WITD}}>×{g.series.length}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div style={{fontSize:12,color:WIT,marginBottom:2}}>
                    <strong style={{color:beurtKleur(open.car,discipline)}}>{open.series.length}×</strong> {t("een serie van")} <strong style={{color:beurtKleur(open.car,discipline)}}>{open.car}</strong>:
                  </div>
                  {open.series.slice(0,max).map(function(b,i){
                    return(
                      <div key={i} style={{padding:"7px 0",borderTop:i?"1px solid rgba(255,255,255,0.06)":"none"}}>
                        <div style={{fontSize:12,color:WIT}}>{tafelLabel(b.tafel)} · {fmtDatum(b.datum)} · p{b.nr}, {t("beurt {b} van {n}",{b:b.beurt,n:b.beurten})}</div>
                        {b.goed.length>0&&<div style={{fontSize:11,color:GRNT,lineHeight:1.35}}>✓ {labels(b.goed)}</div>}
                        {b.gemist.length>0&&<div style={{fontSize:11,color:ROOD,lineHeight:1.35}}>✗ {t("eindigde door:")} {labels(b.gemist)}</div>}
                        {!b.goed.length&&!b.gemist.length&&<div style={{fontSize:11,color:WITD,opacity:0.7}}>{t("geen opmerkingen bijgehouden")}</div>}
                      </div>
                    );
                  })}
                  {open.series.length>max&&<div style={{fontSize:11,color:WITD,paddingTop:4}}>{t("en nog {n} keer",{n:open.series.length-max})}</div>}
                </div>
              );
            })()}
          </InzichtKaart>
        );
      })()}

      {/* Je poedels: percentage en aantal per partij, per tafel; gaat het de goede kant op */}
      {inz.poedels&&(function(){
        const pd=inz.poedels;
        const oordeelStijl={beter:["✅ "+t("Gaat de goede kant op"),GRNT],stabiel:["➖ "+t("Blijft gelijk"),GOUD],minder:["⚠️ "+t("Heeft nog wat nodig"),ROOD]};
        const maxPct=Math.max(0.01,...pd.perTafel.map(function(x){return Math.max(...x.partijen.map(function(p){return p.pct;}));}));
        const maxReden=Math.max(1,...pd.redenen.map(function(x){return x.aantal;}));
        return(
          <InzichtKaart titel={t("Je poedels")} rand={ROOD}
            uitleg={t("Met een poedel maak je in die beurt niets. Per tafel je poedels per partij, in procenten van je beurten (hoogte) en in aantal (getal). Lager is beter.")}>
            {pd.perTafel.map(function(x){
              const o=x.oordeel?oordeelStijl[x.oordeel]:null;
              const kleur=function(p){return p.pct<=x.alle.pct-0.05?GRNT:p.pct>=x.alle.pct+0.05?ROOD:GOUD;};
              const gekozenP=poedelStaaf&&poedelStaaf.tafel===x.tafel?x.partijen.find(function(y){return y.nr===poedelStaaf.nr;}):null;
              return(
                <div key={x.tafel} style={{background:"rgba(0,0,0,0.2)",borderRadius:8,padding:"10px",marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,gap:8}}>
                    <span style={{fontSize:14,color:WIT,fontWeight:"bold"}}>{pd.perTafel.length>1?tafelLabel(x.tafel):t("Alle partijen")}</span>
                    <span style={{fontSize:12,color:o?o[1]:WITD,fontWeight:o?"bold":"normal",textAlign:"right"}}>{o?o[0]:t("Nog te weinig partijen voor een oordeel")}</span>
                  </div>
                  <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:4}}>
                    <span style={{fontSize:28,fontWeight:"bold",color:ROOD,lineHeight:1,whiteSpace:"nowrap",flexShrink:0}}><span style={{fontSize:22}}>⭕</span> {pctTekst(x.alle.pct)}</span>
                    <span style={{fontSize:12,color:WITD,flex:1,minWidth:0}}>{t("van je beurten · {a} per partij ({n} partijen)",{a:k1(x.alle.perPartij),n:x.partijen.length})}</span>
                  </div>
                  <div style={{fontSize:12,color:WITD,marginBottom:8,lineHeight:1.5}}>
                    {t("Beste partij:")} <strong style={{color:GRNT}}>{t("{n} poedels",{n:x.beste.poedels})}</strong> {t("van {n}",{n:x.beste.n})} ({pctTekst(x.beste.pct)}) · p{x.beste.nr}, {fmtDatum(x.beste.datum)}
                    {x.langste.langste>1&&<><br/>{t("Langste reeks:")} <strong style={{color:ROOD}}>{t("{n} poedels op rij",{n:x.langste.langste})}</strong> · p{x.langste.nr}, {t("beurt {b}",{b:x.langste.langsteVan+"–"+(x.langste.langsteVan+x.langste.langste-1)})}</>}
                  </div>
                  <div style={{fontSize:11,color:WITD,marginBottom:4}}>{t("Per partij (scroll naar links voor eerdere, tik voor details):")}</div>
                  <div ref={function(el){grafiekRefs.current["poedel"+(x.tafel||"alle")]=el;}} style={{overflowX:"auto",WebkitOverflowScrolling:"touch",paddingBottom:4}}>
                    <div style={{display:"flex",alignItems:"flex-end",gap:4,width:"max-content",minWidth:"100%"}}>
                      {x.partijen.map(function(p,i){
                        const recent=i>=x.partijen.length-x.aantal,gekozen=gekozenP===p,zwak=!gekozen&&!recent;
                        return(
                          <div key={p.nr} onClick={function(){setPoedelStaaf(gekozen?null:{tafel:x.tafel,nr:p.nr});}}
                            style={{display:"flex",flexDirection:"column",alignItems:"center",cursor:"pointer",flexShrink:0}}>
                            <div style={{width:21,height:70,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",padding:"0 2px",borderRadius:"4px 4px 0 0",
                              background:gekozen?"rgba(255,255,255,0.16)":"rgba(255,255,255,0.05)",border:"1px solid "+(gekozen?WIT:"transparent"),borderBottom:"none"}}>
                              <span style={{fontSize:9,color:zwak?WITD:WIT,opacity:zwak?0.6:1,marginBottom:1}}>{p.poedels}</span>
                              <div className="staaf-groei" style={{width:"100%",height:Math.max(2,p.pct/maxPct*50),background:kleur(p),opacity:zwak?0.35:1,borderRadius:"2px 2px 0 0"}}/>
                            </div>
                            <div style={{fontSize:8,color:gekozen?WIT:WITD,opacity:zwak?0.6:1,marginTop:2}}>p{p.nr}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div style={{height:1,background:"rgba(255,255,255,0.15)",marginBottom:8}}/>
                  {gekozenP&&(
                    <div style={{background:"rgba(255,255,255,0.05)",border:"1px solid "+KBDR,borderRadius:6,padding:"7px 9px",marginBottom:8}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",gap:8}}>
                        <span style={{fontSize:12,color:WIT}}>p{gekozenP.nr} · {fmtDatum(gekozenP.datum)} · {t("{c} caramboles in {b} beurten",{c:gekozenP.totCar,b:gekozenP.n})} · {t("gemiddelde")} {komma(gekozenP.gem,dec)}</span>
                        <span onClick={function(){setPoedelStaaf(null);}} style={{fontSize:14,color:WITD,cursor:"pointer",padding:"0 2px"}}>✕</span>
                      </div>
                      <div style={{fontSize:12,color:WITD,marginTop:2}}>
                        <strong style={{fontSize:15,color:kleur(gekozenP)}}>{t("{n} poedels",{n:gekozenP.poedels})}</strong> {t("van de {n} beurten",{n:gekozenP.n})} ({pctTekst(gekozenP.pct)})
                        {gekozenP.langste>1?" · "+t("langste reeks {n} op rij",{n:gekozenP.langste}):""}
                      </div>
                      {gekozenP.beurten.length>0&&(function(){
                        // Wat als: tik poedels aan die je wel had gemaakt
                        const sleutel=x.tafel+"-"+gekozenP.nr;
                        const aan=watAls.sleutel===sleutel?watAls.beurten:[];
                        const acq=pd.acquit.find(function(a){return a.tafel===x.tafel;});
                        const standaard=Math.max(1,Math.round(acq&&acq.anderGem?acq.anderGem:2));
                        const v=watAlsCar||standaard;
                        const wissel=function(b){
                          const nieuw=aan.indexOf(b)!==-1?aan.filter(function(y){return y!==b;}):aan.concat([b]);
                          setWatAls({sleutel:sleutel,beurten:nieuw});
                        };
                        const nieuwGem=(gekozenP.totCar+aan.length*v)/gekozenP.n;
                        const knop=function(tekst,klik,uit){return <button onClick={klik} disabled={uit} style={{width:26,height:26,borderRadius:13,border:"1px solid "+GOUD,background:"none",color:GOUD,fontSize:15,lineHeight:1,cursor:uit?"default":"pointer",opacity:uit?0.35:1,fontFamily:"inherit",padding:0}}>{tekst}</button>;};
                        return(
                          <div style={{marginTop:6}}>
                            <div style={{fontSize:11,color:WITD,marginBottom:4}}>{t("Poedels in beurt (tik aan: wat als je die wel had gemaakt?")}{gekozenP.acquitPoedels.length?" "+t("A = acquit"):""}):</div>
                            <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                              {gekozenP.beurten.map(function(b){
                                const isAan=aan.indexOf(b)!==-1,isAcq=gekozenP.acquitPoedels.indexOf(b)!==-1;
                                return <button key={b} onClick={function(){wissel(b);}} style={{minWidth:26,fontSize:12,padding:"2px 5px",borderRadius:4,cursor:"pointer",fontFamily:"inherit",
                                  border:"1px solid "+(isAan?GRNT:"transparent"),background:isAan?"rgba(76,175,80,0.25)":"rgba(224,85,85,0.25)",color:WIT}}>
                                  {b}{isAcq?" A":""}{isAan?" → "+v:""}</button>;
                              })}
                            </div>
                            {aan.length>0&&<div style={{marginTop:8,background:"rgba(76,175,80,0.08)",border:"1px solid rgba(76,175,80,0.35)",borderRadius:6,padding:"7px 9px"}}>
                              <div style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:WITD,flexWrap:"wrap"}}>
                                <span>{t("Elke omgezette poedel wordt")}</span>
                                {knop("−",function(){setWatAlsCar(Math.max(1,v-1));},v<=1)}
                                <strong style={{fontSize:16,color:WIT,minWidth:18,textAlign:"center"}}>{v}</strong>
                                {knop("+",function(){setWatAlsCar(Math.min(30,v+1));},v>=30)}
                                <span>{t("caramboles")}</span>
                              </div>
                              <div style={{fontSize:13,color:WIT,marginTop:6}}>
                                {t("Gemiddelde deze partij:")} {komma(gekozenP.gem,dec)} → <strong style={{fontSize:16,color:GRNT}}>{komma(nieuwGem,dec)}</strong>
                                <span style={{color:GRNT}}> (+{komma(nieuwGem-gekozenP.gem,dec)})</span>
                              </div>
                              <div style={{fontSize:11,color:WITD,marginTop:2}}>
                                {t(aan.length>1?"{n} poedels minder ({a} → {b}), {c} → {d} caramboles in {e} beurten.":"{n} poedel minder ({a} → {b}), {c} → {d} caramboles in {e} beurten.",{n:aan.length,a:gekozenP.poedels,b:gekozenP.poedels-aan.length,c:gekozenP.totCar,d:gekozenP.totCar+aan.length*v,e:gekozenP.n})}
                                <span onClick={function(){setWatAls({sleutel:null,beurten:[]});}} style={{color:GOUD,cursor:"pointer",marginLeft:6}}>{t("Wissen")}</span>
                              </div>
                            </div>}
                          </div>
                        );
                      })()}
                      <div style={{fontSize:11,lineHeight:1.4,marginTop:5,color:gekozenP.redenen.length?ROOD:WITD,opacity:gekozenP.redenen.length?1:0.7}}>
                        {gekozenP.redenen.length?"✗ "+gekozenP.redenen.map(function(r){return t(r.label)+(r.aantal>1?" ×"+r.aantal:"");}).join(", "):t("geen opmerkingen bij deze poedels")}
                      </div>
                    </div>
                  )}
                  {x.aantal>0&&x.voor.partijen>0&&<div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:6,alignItems:"center",fontSize:12}}>
                    <div style={{color:WITD,textAlign:"center"}}>
                      <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:0.5}}>{t("{n} ervoor",{n:x.voor.partijen})}</div>
                      <div><strong style={{fontSize:16,color:WIT}}>{pctTekst(x.voor.pct)}</strong> {t("poedels")}</div>
                      <div>{k1(x.voor.perPartij)} {t("per partij")}</div>
                    </div>
                    <div style={{fontSize:16,color:o?o[1]:WITD}}>→</div>
                    <div style={{color:WITD,textAlign:"center"}}>
                      <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:0.5}}>{t("laatste {n}",{n:x.aantal})}</div>
                      <div><strong style={{fontSize:16,color:o?o[1]:WIT}}>{pctTekst(x.na.pct)}</strong> {t("poedels")}</div>
                      <div style={{color:o?o[1]:WITD}}>{k1(x.na.perPartij)} {t("per partij")}</div>
                    </div>
                  </div>}
                </div>
              );
            })}
            {/* Wat als je acquit beter gaat? */}
            {pd.acquit.some(function(a){return a.stoten>=5;})&&<div style={{marginBottom:12}}>
              <div style={{fontSize:12,color:GOUDL,textTransform:"uppercase",letterSpacing:0.5,margin:"4px 0 3px"}}>{t("Wat als je acquit beter gaat?")}</div>
              <div style={{fontSize:11,color:WITD,opacity:0.8,marginBottom:8,lineHeight:1.4}}>{t("Kies hoe vaak je acquit lukt en hoeveel je er dan van maakt; je ziet meteen je gemiddelde op die tafel. Eén acquit per partij, dus het effect is per partij klein maar telt over een seizoen op.")}</div>
              {pd.acquit.filter(function(a){return a.stoten>0&&a.stoten<5;}).map(function(a){
                return <div key={a.tafel} style={{fontSize:11,color:WITD,opacity:0.8,marginBottom:6}}>{t("Op de {tafel} heb je de acquit nog maar {n} keer aangevinkt; vanaf 5 komt die tafel erbij.",{tafel:tafelLabel(a.tafel),n:a.stoten})}</div>;
              })}
              {pd.acquit.filter(function(a){return a.stoten>=5;}).map(function(a){
                const keuze=acqKeuze[a.tafel]||{};
                const kans=keuze.kans!=null?keuze.kans:a.kans;
                // Zolang je niets kiest, rekenen met je echte gemiddelde bij een gelukte acquit (dan klopt "nu" precies)
                const echt=a.gemBijLukken||a.anderGem||1,v=keuze.car!=null?keuze.car:Math.max(1,Math.round(echt));
                const reken=keuze.car!=null?keuze.car:echt;
                const zet=function(w){setAcqKeuze(Object.assign({},acqKeuze,{[a.tafel]:Object.assign({kans:keuze.kans!=null?keuze.kans:null,car:keuze.car!=null?keuze.car:null},w)}));};
                const extra=kans*a.stoten*reken-a.acqCar,nieuw=(a.car+extra)/a.beurten;
                const chip=function(aan,tekst,klik){return <button key={tekst} onClick={klik} style={{padding:"3px 8px",background:aan?"var(--c-2d4a1e)":"none",border:"1px solid "+(aan?GOUD:KBDR),borderRadius:5,color:aan?GOUD:WITD,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>{tekst}</button>;};
                const knop=function(tekst,klik,uit){return <button onClick={klik} disabled={uit} style={{width:26,height:26,borderRadius:13,border:"1px solid "+GOUD,background:"none",color:GOUD,fontSize:15,lineHeight:1,cursor:uit?"default":"pointer",opacity:uit?0.35:1,fontFamily:"inherit",padding:0}}>{tekst}</button>;};
                return(
                  <div key={a.tafel} style={{background:"rgba(0,0,0,0.2)",borderRadius:8,padding:"9px 10px",marginBottom:8}}>
                    <div style={{fontSize:13,color:WIT,fontWeight:"bold",marginBottom:4}}>{pd.acquit.length>1?tafelLabel(a.tafel):t("Acquit")}</div>
                    <div style={{fontSize:12,color:WITD,lineHeight:1.5,marginBottom:6}}>
                      {t("Nu: lukt in")} <strong style={{color:WIT}}>{t("{a} van de {b}",{a:a.gelukt,b:a.stoten})}</strong> ({pctTekst(a.kans)}); {t("dan maak je er gemiddeld")} <strong style={{color:WIT}}>{komma(a.gemBijLukken,1)}</strong>.
                      {" "}{t("Je andere beurten: {p} raak, gemiddeld {g} als je scoort.",{p:pctTekst(a.anderKans),g:komma(a.anderGem,1)})}
                    </div>
                    {a.stoten<15&&<div style={{fontSize:11,color:GOUDL,lineHeight:1.4,marginBottom:6}}>
                      ⚠️ {t("Nog maar {n} acquits aangevinkt op deze tafel, dus een ruwe schatting. Vink bij elke partij de acquit aan (Goed of Gemist), dan wordt dit steeds betrouwbaarder.",{n:a.stoten})}
                    </div>}
                    <div style={{display:"flex",flexWrap:"wrap",gap:5,alignItems:"center",marginBottom:6}}>
                      <span style={{fontSize:11,color:WITD,width:62}}>{t("Lukt in")}</span>
                      {chip(keuze.kans==null,t("nu {p}",{p:pctTekst(a.kans)}),function(){zet({kans:null});})}
                      {[0.5,0.6,0.75,1].filter(function(k){return Math.abs(k-a.kans)>0.01;}).map(function(k){return chip(keuze.kans===k,pctTekst(k),function(){zet({kans:k});});})}
                    </div>
                    <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}>
                      <span style={{fontSize:11,color:WITD,width:62}}>{t("Je maakt dan")}</span>
                      {knop("−",function(){zet({car:Math.max(1,v-1)});},v<=1)}
                      <strong style={{fontSize:16,color:WIT,minWidth:18,textAlign:"center"}}>{keuze.car!=null?v:komma(echt,1)}</strong>
                      {knop("+",function(){zet({car:Math.min(30,v+1)});},v>=30)}
                      <span style={{fontSize:11,color:WITD}}>{t("caramboles")}{keuze.car==null?" ("+t("nu")+")":""}</span>
                    </div>
                    <div style={{fontSize:13,color:WIT}}>
                      {t("Gemiddelde:")} {komma(a.gem,dec)} → <strong style={{fontSize:16,color:nieuw>=a.gem?GRNT:ROOD}}>{komma(nieuw,dec)}</strong>
                      <span style={{color:nieuw>=a.gem?GRNT:ROOD}}> ({Math.abs(nieuw-a.gem)<0.005?"±":nieuw>=a.gem?"+":"−"}{komma(Math.abs(nieuw-a.gem),dec)})</span>
                    </div>
                    <div style={{fontSize:11,color:WITD,marginTop:2}}>{t("Dat is {v} caramboles per partij ({n} partijen).",{v:(Math.abs(extra)<0.05?"±":extra>=0?"+":"−")+komma(Math.abs(extra/Math.max(1,a.partijen)),1),n:a.partijen})}</div>
                  </div>
                );
              })}
            </div>}
            {/* Waardoor je poedelt */}
            {pd.redenen.length>0&&<div>
              <div style={{fontSize:12,color:GOUDL,textTransform:"uppercase",letterSpacing:0.5,margin:"4px 0 3px"}}>{t("Waardoor je poedelt")}</div>
              <div style={{fontSize:11,color:WITD,opacity:0.8,marginBottom:8}}>{t("Bij {a} van je {b} poedels heb je aangevinkt wat er misging.",{a:pd.metReden,b:pd.totaal})}</div>
              {pd.redenen.slice(0,8).map(function(x){
                return(
                  <div key={x.label} style={{display:"flex",alignItems:"center",gap:8,fontSize:12,marginBottom:5}}>
                    <span style={{width:110,color:WIT,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{t(x.label)}</span>
                    <span style={{flex:1,height:7,background:"rgba(255,255,255,0.08)",borderRadius:3,overflow:"hidden"}}>
                      <span style={{display:"block",width:(x.aantal/maxReden*100)+"%",height:"100%",background:ROOD}}/>
                    </span>
                    <span style={{width:62,textAlign:"right",color:WITD}}>{x.aantal}× ({pctTekst(x.aantal/Math.max(1,pd.metReden))})</span>
                  </div>
                );
              })}
            </div>}
          </InzichtKaart>
        );
      })()}

      {/* Eenvoudige modus: alleen de samenvatting, je hoogste series en je poedels. De kaarten over opmerkingen
          komen er vanzelf bij zodra je in een partij opmerkingen hebt bijgehouden (+ opmerking bij Noteer). */}
      {!eenvoudig&&<>
      {/* Poedels en series: waar je gemiddelde vandaan komt */}
      <InzichtKaart titel={t("Poedels en series")}
        uitleg={t("Elke beurt eindigt met een misser. Je gemiddelde gaat alleen omhoog door minder poedels en grotere series. Hier tellen alle partijen mee, ook de geschrapte.")}>
        <div style={{fontSize:12,color:WITD,marginBottom:6}}>{t("Je gemiddelde partij van {n} beurten:",{n:se.hefboom.beurten})}</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:3,marginBottom:6}}>
          {blokjes.map(function(i,j){return <div key={j} style={{width:14,height:14,borderRadius:3,background:kleurVan(i)}}/>;})}
        </div>
        <div style={{fontSize:11,color:WITD,display:"flex",flexWrap:"wrap",gap:"2px 10px",marginBottom:4}}>
          {se.nu.groepen.map(function(g,i){return <span key={g.label}><span style={{color:kleurVan(i)}}>■</span> {g.van===0?t("poedel"):g.label.replace("-","–")}</span>;})}
        </div>
        {(function(){
          // Groepen die door het afronden niet als blokje te zien zijn, toch even noemen
          const zeldzaam=se.nu.groepen.filter(function(g){return g.van>0&&g.perPartij>0&&g.perPartij<0.5;});
          return zeldzaam.length?<div style={{fontSize:11,color:WITD,opacity:0.8,marginBottom:4}}>
            {zeldzaam.map(function(g){return t("Series van {n}: gemiddeld {g} per partij (ongeveer 1 op de {x} partijen)",{n:g.label.replace("-","–"),g:k1(g.perPartij),x:Math.round(1/g.perPartij)});}).join(". ")}.
          </div>:null;
        })()}
        <div style={{display:"flex",fontSize:10,color:WITD,textTransform:"uppercase",letterSpacing:0.5,margin:"10px 0 2px"}}>
          <span style={{flex:1}}></span><span style={{width:44,textAlign:"right"}}>{t("per partij")}</span>
          <span style={{width:110,textAlign:"right"}}>{t("van je caramboles")}</span>
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
            return <button key={key||tekst} onClick={klik} style={{flex:"0 0 auto",padding:"4px 10px",background:aan?"var(--c-2d4a1e)":"none",border:"1px solid "+(aan?GOUD:KBDR),
              borderRadius:5,color:aan?GOUD:WITD,fontSize:12,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>{tekst}</button>;
          };
          const kop={helften:inz.helftLabels?t("Eerder tegenover nu")+" · "+inz.helftLabels.eerste+" → "+inz.helftLabels.tweede:t("Eerder tegenover nu"),
            laatste10:t("Je laatste partijen tegenover die ervoor"),goedslecht:t("Je slechtste tegenover je beste partijen"),
            vanaf:t("Vóór {m} → vanaf {m}",{m:maandTekst(vanaf)})}[vgModus];
          const uitleg={helften:null,laatste10:t("Per tafel je laatste 10 partijen (bij minder dan 20 partijen de laatste helft) tegenover alles daarvoor."),
            goedslecht:t("Per tafel je slechtste derde tegenover je beste derde partijen (op gemiddelde): waar zit het verschil tussen een goede en een slechte partij?"),
            vanaf:t("Kies vanaf welke maand: alles daarvoor tegenover alles daarna, bijv. sinds de zomerstop of sinds je anders traint.")}[vgModus];
          return(
            <div style={{marginTop:14}}>
              <div style={{fontSize:11,color:WITD,marginBottom:5}}>{t("Vergelijk:")}</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:8}}>
                {[["helften",t("Eerder vs nu")],["laatste10",t("Recent vs ervoor")],["goedslecht",t("Goed vs slecht")],["vanaf",t("Vanaf")]].map(function(x){
                  return chip(vgModus===x[0],x[1],function(){setVgModus(x[0]);},x[0]);
                })}
              </div>
              {vgModus==="vanaf"&&maanden.length>1&&<div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:8}}>
                {maanden.slice(1).map(function(m){return chip(m===vanaf,maandTekst(m),function(){setVgVanaf(m);},m);})}
              </div>}
              <div style={{fontSize:12,color:GOUDL,textTransform:"uppercase",letterSpacing:0.5,marginBottom:uitleg?3:6}}>{kop}</div>
              {uitleg&&<div style={{fontSize:11,color:WITD,opacity:0.8,marginBottom:6,lineHeight:1.4}}>{uitleg}</div>}
              {vg.vergelijkingen.length===0&&<div style={{fontSize:12,color:WITD,padding:"6px 0"}}>
                {t("Te weinig partijen om zo te vergelijken (minstens 3 partijen per kant, per tafel).")}
              </div>}
              {vg.vergelijkingen.map(function(v){
                return(
                  <div key={v.tafel||"alle"} style={{background:"rgba(0,0,0,0.2)",borderRadius:8,padding:"8px 10px",marginBottom:8}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:v.labelA?2:6}}>
                      <span style={{color:WIT,fontWeight:"bold"}}>{v.tafel?tafelLabel(v.tafel):t("Alle partijen")}</span>
                      <span style={{color:WITD}}>{t("gemiddelde")} {komma(v.e.gem,dec)} → <strong style={{color:v.w.gem>=v.e.gem?GRNT:ROOD}}>{komma(v.w.gem,dec)}</strong></span>
                    </div>
                    {v.labelA&&<div style={{fontSize:11,color:WITD,textAlign:"right",marginBottom:6}}>{v.labelA} → {v.labelB}</div>}
                    <div style={{display:"flex",fontSize:10,color:WITD,textTransform:"uppercase",letterSpacing:0.5,marginBottom:2}}>
                      <span style={{flex:1}}></span><span style={{width:84,textAlign:"right"}}>{t("per partij")}</span><span style={{width:64,textAlign:"right"}}>{t("effect")}</span>
                    </div>
                    {v.e.groepen.map(function(g,i){
                      const w=v.w.groepen[i],eff=v.bijdrage[i];
                      const beter=g.van===0?w.perPartij<g.perPartij-0.2:eff>0.02,slechter=g.van===0?w.perPartij>g.perPartij+0.2:eff<-0.02;
                      return(
                        <div key={g.label} style={{display:"flex",fontSize:12,padding:"2px 0"}}>
                          <span style={{flex:1,color:WITD}}><span style={{color:kleurVan(i)}}>■</span> {groepNaam(g)}</span>
                          <span style={{width:84,textAlign:"right",color:WIT}}>{k1(g.perPartij)} → {k1(w.perPartij)}</span>
                          <span style={{width:64,textAlign:"right",color:beter?GRNT:slechter?ROOD:WITD}}>
                            {g.van===0?(beter?"▼ "+t("minder"):slechter?"▲ "+t("meer"):"≈"):(Math.abs(eff)<0.005?"≈":(eff>0?"+":"−")+komma(Math.abs(eff),2))}
                          </span>
                        </div>
                      );
                    })}
                    <div style={{display:"flex",fontSize:12,padding:"4px 0 0",marginTop:2,borderTop:"1px solid rgba(255,255,255,0.08)"}}>
                      <span style={{flex:1,color:WITD}}>🔥 {t("Hoogste serie")}</span>
                      <span style={{width:84,textAlign:"right",color:WIT}}>{k1(v.e.hoogste)} → {k1(v.w.hoogste)}</span>
                      <span style={{width:64}}></span>
                    </div>
                  </div>
                );
              })}
              {vg.vergelijkingen.length>0&&vg.teWeinig.filter(Boolean).length>0&&<div style={{fontSize:11,color:WITD,opacity:0.8,marginBottom:6}}>
                {t("Te weinig partijen voor deze vergelijking op de {tafels}.",{tafels:vg.teWeinig.filter(Boolean).map(tafelLabel).join(", ").replace(/, ([^,]*)$/," "+t("en")+" $1")})}
              </div>}
              {vg.vergelijkingen.length>0&&<div style={{fontSize:11,color:WITD,opacity:0.8}}>{t("\"Effect\" is hoeveel die groep je gemiddelde omhoog (+) of omlaag (−) bracht; samen is dat precies het verschil. Minder poedels zie je terug als meer series. \"Per partij\" hangt ook af van hoe lang de partijen waren.")}</div>}
            </div>
          );
        })()}

        {/* Wat levert het op */}
        <div style={{marginTop:14,background:"rgba(201,168,76,0.08)",border:"1px solid "+KBDR,borderRadius:8,padding:"10px 12px"}}>
          <div style={{fontSize:12,color:GOUDL,textTransform:"uppercase",letterSpacing:0.5,marginBottom:6}}>{t("Wat levert het op? (partij van {n} beurten)",{n:se.hefboom.beurten})}</div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:13,padding:"3px 0"}}>
            <span style={{color:WITD}}>{t("1 poedel minder (een beurt van {n})",{n:se.hefboom.klein})}</span><strong style={{color:GRNT}}>+{komma(se.hefboom.klein/se.hefboom.beurten,2)}</strong>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:13,padding:"3px 0"}}>
            <span style={{color:WITD}}>{t("1 serie van {n} in plaats van een poedel",{n:se.hefboom.groot})}</span><strong style={{color:GRNT}}>+{komma(se.hefboom.groot/se.hefboom.beurten,2)}</strong>
          </div>
          <div style={{fontSize:12,color:WIT,marginTop:4}}>{t("Eén grote serie is evenveel waard als {n} poedels minder.",{n:Math.round(se.hefboom.groot/se.hefboom.klein)})}</div>
        </div>

        {/* Motor en reactie op een poedel */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginTop:12}}>
          <div style={{background:"rgba(0,0,0,0.2)",borderRadius:8,padding:"8px 6px",textAlign:"center"}}>
            <div style={{fontSize:18,fontWeight:"bold",color:GOUDL}}>{pctTekst(inz.motor.carPct)}</div>
            <div style={{fontSize:10,color:WITD,lineHeight:1.3}}>{t("van je caramboles uit {p} van je beurten ({n}+)",{p:pctTekst(inz.motor.beurtPct),n:inz.motor.drempel})}</div>
          </div>
          <div style={{background:"rgba(0,0,0,0.2)",borderRadius:8,padding:"8px 6px",textAlign:"center"}}>
            <div style={{fontSize:10,color:WITD,lineHeight:1.3,marginBottom:3}}>{t("kans op nog een poedel na een poedel")}</div>
            {inz.poedel.perTafel.length===0&&<div style={{fontSize:18,fontWeight:"bold",color:WITD}}>—</div>}
            {inz.poedel.perTafel.map(function(x){
              const verschil=x.naPoedel-x.naScore;
              return(
                <div key={x.tafel||"alle"} style={{fontSize:12,color:WITD,lineHeight:1.4}}>
                  {x.tafel?tafelLabel(x.tafel)+dubbelePunt():""}<strong style={{fontSize:15,color:verschil>=0.05?ROOD:verschil<=-0.03?GRNT:GOUDL}}>{pctTekst(x.naPoedel)}</strong> <span style={{fontSize:10}}>({t("na score {p}",{p:pctTekst(x.naScore)})})</span>
                </div>
              );
            })}
          </div>
        </div>
      </InzichtKaart>
      </>}

      {/* Speelprofiel per techniek */}
      {metOpm&&inz.profiel.length>0&&(
        <InzichtKaart titel={t("Je speelprofiel per techniek")}
          uitleg={t("Lengte = hoe vaak de techniek voorkwam, groen = ging goed, rood = serie eindigde erdoor. Een lange rode balk betekent niet dat je er slecht in bent: misschien speel je hem gewoon veel. Kijk naar het percentage; gemiddeld over al je technieken is dat {p}.",{p:pctTekst(inz.refPct)})}>
          {inz.profiel.map(function(x){
            const weinig=x.gebruik<INZICHT_MIN;
            return(
              <div key={x.label} style={{display:"flex",alignItems:"center",gap:8,marginBottom:7,opacity:weinig?0.45:1}}>
                <div style={{width:92,flexShrink:0}}>
                  <div style={{fontSize:13,color:WIT,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{t(x.label)}</div>
                  <div style={{fontSize:10,color:WITD}}>{x.gebruik}× · {t("{n} goed",{n:x.goed})}</div>
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
            <span><span style={{color:GRNT}}>■</span> {t("ging goed")}</span>
            <span><span style={{color:"#b84a4a"}}>■</span> {t("serie eindigde erdoor")}</span>
            <span style={{opacity:0.6}}>{t("vaag = minder dan {n}×",{n:INZICHT_MIN})}</span>
          </div>
          {inz.acquitPartijen>0&&(
            <div style={{fontSize:11,color:WITD,opacity:0.8,marginTop:6}}>
              {t("Acquit: in je {n} partijen op de 2,30 tot 14 oktober 2026 telt beurt 1 als acquit (caramboles = gemaakt, poedel = gemist). Daarna alleen als je hem zelf aanvinkt.",{n:inz.acquitPartijen})}
            </div>
          )}
        </InzichtKaart>
      )}

      {/* Seriemakers */}
      {metOpm&&inz.seriemakers.length>0&&(
        <InzichtKaart titel={t("Wat levert grote series op")}
          uitleg={t("Gemiddeld aantal caramboles in beurten waarin dit goed ging, tegenover je gemiddelde van {g} per beurt in de bijgehouden partijen.",{g:komma(inz.basisTag,dec)})}>
          {inz.seriemakers.map(function(x){
            return(
              <div key={x.label} style={{marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:3}}>
                  <span style={{color:WIT}}>{t(x.label)} <span style={{fontSize:11,color:WITD}}>({x.aantal}×)</span></span>
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
      {metOpm&&stoppers.length>0&&(
        <InzichtKaart titel={t("Waardoor eindigden je series")}
          uitleg={t("Van de {n} beurten waarbij je aanvinkte waardoor de serie eindigde. Beschrijvend, geen oordeel.",{n:inz.metOorzaak})}>
          {stoppers.map(function(x){
            return(
              <div key={x.label} style={{marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:3}}>
                  <span style={{color:WIT}}>{t(x.label)}</span>
                  <span style={{color:WITD}}><strong style={{color:"#e08055"}}>{pctTekst(x.aandeel)}</strong> · {t("gem {g} car in die beurt",{g:komma(x.gem,1)})}</span>
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
      {!eenvoudig&&inz.omstandigheden.length>0&&(
        <InzichtKaart titel={t("Omstandigheden")} uitleg={t("Gemiddelde per beurt; ▲▼ tegenover het gemiddelde van de partijen die in dat blok meetellen. Partij van de avond: alleen avonden met 2 of meer partijen.")}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {inz.omstandigheden.map(function(o){
              return(
                <div key={o.titel} style={{background:"rgba(0,0,0,0.2)",borderRadius:8,padding:"8px 9px"}}>
                  <div style={{fontSize:11,color:GOUD,textTransform:"uppercase",letterSpacing:0.5,marginBottom:6}}>{t(o.titel)}</div>
                  {o.rijen.map(function(r){
                    const k=r.verschil>=0.05?GRNT:r.verschil<=-0.05?ROOD:WITD;
                    return(
                      <div key={r.label} style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",fontSize:12,marginBottom:4}}>
                        <span style={{color:WITD}}>{t(r.label)}</span>
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
      {metOpm&&inz.trend.length>0&&(
        <InzichtKaart titel={t("Werk je je werkpunten weg?")}
          uitleg={t("Hoe vaak een oorzaak je serie beëindigde, per 100 beurten: eerste helft van je bijgehouden partijen tegenover de tweede helft. Ben je anders gaan aanvinken, dan zie je dat hier ook terug.")}>
          {inz.trend.map(function(x){
            const beter=x.verandering<=-0.3,slechter=x.verandering>=0.3;
            return(
              <div key={x.label} style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",fontSize:13,padding:"5px 0",borderBottom:"1px solid "+KBDR}}>
                <span style={{color:WIT}}>{t(x.label)}</span>
                <span style={{color:WITD}}>{komma(x.voor,1)} → <strong style={{color:WIT}}>{komma(x.na,1)}</strong>{" "}
                  <span style={{color:beter?GRNT:slechter?ROOD:WITD,fontSize:12}}>{beter?"▼ "+t("minder"):slechter?"▲ "+t("vaker"):"≈ "+t("gelijk")}</span>
                </span>
              </div>
            );
          })}
        </InzichtKaart>
      )}
    </div>
  );
}
