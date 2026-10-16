// Vensters (overlays) van Biljart Tracker: samenvatting na een partij, welkomstflow, seizoensarchief,
// badgecatalogus en niveau-overzicht. JSX via Babel, geladen na jsx/onderdelen.jsx.

function PartijSamenvatting({partij,st,prestatie,infoNa,nieuweDrop,niveauOmhoog,discipline,onClose}){
  const spel=useContext(SpelContext);
  const punten=prestatie?prestatie.punten:0;
  const dec=discipline==="driebanden"?3:2;
  return(
    <div onClick={onClose} style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.75)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20,cursor:"pointer"}}>
      <div onClick={function(e){e.stopPropagation();}} style={{background:"linear-gradient(160deg,var(--c-1e3a1e),var(--c-0d1f0d))",border:"2px solid "+GOUD,borderRadius:18,padding:"18px 16px",maxWidth:380,width:"100%",maxHeight:"85vh",overflowY:"auto",boxShadow:"0 10px 40px rgba(0,0,0,0.6)"}}>
        {niveauOmhoog&&(
          <div style={{background:"linear-gradient(160deg,var(--c-2a4a1e),var(--c-0d1f0d))",border:"2px solid "+niveauOmhoog.naar.kleur,borderRadius:14,padding:"16px 12px",marginBottom:14,textAlign:"center",animation:"badgePopIn 0.5s cubic-bezier(0.34,1.56,0.64,1)",boxShadow:"0 0 30px "+niveauOmhoog.naar.kleur+"66"}}>
            <div style={{fontSize:13,color:WITD,marginBottom:8}}>🎉 Niveau omhoog!</div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:14}}>
              <div style={{textAlign:"center",opacity:0.6}}>
                <div style={{fontSize:24}}>{niveauOmhoog.van.emoji}</div>
                <div style={{fontSize:12,color:WITD}}>{niveauOmhoog.van.naam}</div>
              </div>
              <div style={{fontSize:18,color:niveauOmhoog.naar.kleur}}>→</div>
              <div style={{textAlign:"center"}}>
                <div style={{width:48,height:48,borderRadius:"50%",background:"radial-gradient(circle at 35% 30%,"+niveauOmhoog.naar.kleur+"ee,"+niveauOmhoog.naar.kleur+"55)",border:"2px solid "+niveauOmhoog.naar.kleur,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,margin:"0 auto 4px",boxShadow:"0 0 16px "+niveauOmhoog.naar.kleur+"aa"}}>
                  {niveauOmhoog.naar.emoji}
                </div>
                <div style={{fontSize:13,fontWeight:"bold",color:niveauOmhoog.naar.kleur}}>{niveauOmhoog.naar.naam}</div>
              </div>
            </div>
          </div>
        )}
        {spel&&nieuweDrop&&(
          <div style={{background:"linear-gradient(135deg,"+GOUD+","+GOUDL+")",borderRadius:14,padding:"14px",marginBottom:14,textAlign:"center",animation:"badgePopIn 0.5s cubic-bezier(0.34,1.56,0.64,1)",boxShadow:"0 0 30px "+GOUD+"aa"}}>
            <div style={{fontSize:28}}>🎉🥇🎉</div>
            <div style={{fontSize:15,fontWeight:"bold",color:G,marginTop:4}}>Slechtste-partij-drop ontgrendeld!</div>
            <div style={{fontSize:13,color:G,marginTop:4}}>p{nieuweDrop.nr} (gem {nieuweDrop.gem.toFixed(dec)}) is geschrapt uit je gemiddelde</div>
          </div>
        )}
        <div style={{fontSize:15,fontWeight:"bold",color:GOUD,marginBottom:4,textAlign:"center"}}>Partij afgesloten</div>
        <div style={{fontSize:12,color:WITD,textAlign:"center",marginBottom:14}}>{new Date(partij.datum).toLocaleDateString("nl-NL",{weekday:"long",day:"numeric",month:"long"})}</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:14}}>
          <div style={{background:"rgba(0,0,0,0.2)",borderRadius:8,padding:"8px 4px",textAlign:"center"}}>
            <div style={{fontSize:18,fontWeight:"bold",color:GOUD}}>{st.totCar}</div>
            <div style={{fontSize:11,color:WITD}}>caramboles</div>
          </div>
          <div style={{background:"rgba(0,0,0,0.2)",borderRadius:8,padding:"8px 4px",textAlign:"center"}}>
            <div style={{fontSize:18,fontWeight:"bold",color:GOUD}}>{st.gemPerBeurt}</div>
            <div style={{fontSize:11,color:WITD}}>gemiddelde</div>
          </div>
          <div style={{background:"rgba(0,0,0,0.2)",borderRadius:8,padding:"8px 4px",textAlign:"center"}}>
            <div style={{fontSize:18,fontWeight:"bold",color:GOUD}}>{st.max}</div>
            <div style={{fontSize:11,color:WITD}}>hoogste beurt</div>
          </div>
        </div>
        <div style={{textAlign:"center",fontSize:13,color:WITD,marginBottom:14}}>{st.aantalBeurten} beurten · {st.poedels}x poedel{spel&&<> · <span style={{color:GOUD,fontWeight:"bold"}}>{punten}pt aan badges</span></>}</div>
        {infoNa&&(
          <div style={{marginBottom:14,background:"rgba(0,0,0,0.2)",borderRadius:10,padding:"10px 12px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <span style={{fontSize:12,color:WITD}}>📊 Je vorm nu</span>
              <span style={{fontSize:15,fontWeight:"bold",color:GOUD}}>{infoNa.effectiefGemiddelde.toFixed(dec)}</span>
            </div>
            <div style={{fontSize:11,color:WITD,marginTop:-3,marginBottom:6}}>{vormUitleg(infoNa,dec)}</div>
            {spel&&<>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <span style={{fontSize:12,color:WITD}}>🎖️ {infoNa.venster?"Punten in je laatste "+infoNa.aantalPartijen+" partijen":"Badge-punten"}</span>
                <span style={{fontSize:13,fontWeight:"bold",color:GOUD}}>{infoNa.badgePunten} / {infoNa.aantalDrops*PUNTEN_PER_DROP+PUNTEN_PER_DROP}pt</span>
              </div>
              <DashBalk pct={(infoNa.badgePunten%PUNTEN_PER_DROP)/PUNTEN_PER_DROP*100} kleur={GOUD} hoogte={5}/>
              <div style={{textAlign:"center",marginTop:6,fontSize:11,color:WITD,opacity:0.8}}>
                {infoNa.plafondBereikt?"Maximum bereikt: nooit meer dan 1 op de 10 partijen geschrapt":"Nog "+infoNa.puntenTotVolgendeDrop+"pt tot je volgende slechtste-partij-drop"}
              </div>
            </>}
          </div>
        )}
        {spel&&<PrestatieOverzicht prestatie={prestatie}/>}
        <div onClick={onClose} style={{textAlign:"center",marginTop:16,fontSize:13,color:WITD,opacity:0.7,cursor:"pointer",padding:"6px 0"}}>Tik om te sluiten</div>
      </div>
    </div>
  );
}

function WelkomstFlow({stap,setStap,discipline,wisselDiscipline,onKlaar,tekstgrootte,eenvoudig,setWeergave}){
  const schermen=[
    {
      titel:"Welkom! Hoe wil je het zien?",
      body:"Kies de tekstgrootte die prettig leest; je ziet het meteen. Eenvoudige modus houdt alleen het belangrijkste over: per beurt je caramboles en Noteer. Standaard staat alles aan. Je kunt dit later altijd wijzigen bij Info → Weergave.",
      weergave:true
    },
    {
      titel:"Zet de app op je beginscherm",
      body:"Voor het beste gebruik installeer je de app als een normale app-icoon op je beginscherm — dat opent sneller dan steeds de link opzoeken, en voelt als een echte app. Na de eerste keer opent de app ook zonder internet.",
      installeer:true,
      alleenWeb:true
    },
    {
      titel:"Welkom bij Biljart Tracker",
      body:"Een app om je carambole-partijen bij te houden — met niveaus op basis van de echte KNBB-klassen, en een spelelement dat je motiveert om net dat beetje boven je eigen niveau uit te blijven presteren."
    },
    {
      titel:"Kies je discipline",
      body:"Libre, Driebanden, Bandstoten en Kader (38/2, 47/2, 57/2 en 71/2) zijn losse trajecten — elk met een eigen gemiddelde en niveau, helemaal gescheiden van elkaar. Je kunt in de app altijd van discipline wisselen.",
      kies:true
    },
    {
      titel:"Een partij invoeren",
      body:"Zo noteer je een partij, beurt voor beurt:",
      lijst:[
        ["Start","Kies tafelmaat en doel en tik op Start partij."],
        ["Per beurt","Vul je caramboles in en tik op Noteer. Kies daarna waardoor de serie eindigde, en bij caramboles ook wat goed ging."],
        ["Klaar","Tik rechtsboven op Afsluiten en dan op Opslaan."]
      ],
      alleenApp:true
    },
    {
      titel:"De tabbladen",
      body:"Alles wat je invoert wordt direct automatisch op je iPhone bewaard. Via de tabbladen bovenin bekijk je het:",
      lijst:[
        ["Stats","Je niveau, elke partij met badges en je seizoenen."],
        ["Dash","Grafieken van trend, consistentie, patronen, vergelijking en punten."],
        ["Log","Al je partijen beurt voor beurt terugkijken, met notities."],
        ["Info","Uitleg, weergave en instellingen, AI-analyse, en Exporteer/Importeer data voor een extra kopie of om over te zetten."]
      ],
      alleenApp:true
    },
    {
      titel:"Hoe niveau werkt",
      body:"Je niveau volgt je vorm: het gemiddelde van je laatste 20 partijen, met de officiële KNBB-klassegrenzen. Je moyenne over al je partijen zie je ernaast. Speel je goed, dan verdien je badges — genoeg badge-punten en je slechtste partij telt niet mee voor je vorm (hoogstens 1 op de 10)."
    },
    {
      titel:"Klaar om te beginnen!",
      body:"Dat is het zo'n beetje — de rest ontdek je vanzelf tijdens het spelen. Kom je er niet uit? Onder Start partij staat altijd ℹ️ Zo werkt de app. Veel plezier!"
    }
  ].filter(function(s){return IS_NATIVE?!s.alleenWeb:!s.alleenApp;});
  const s=schermen[stap];
  const laatste=stap===schermen.length-1;
  const kaderActief=KADER_VARIANTEN.indexOf(discipline)!==-1;
  const [kaderOpen,setKaderOpen]=useState(kaderActief);
  return(
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.85)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"linear-gradient(160deg,var(--c-1e3a1e),var(--c-0d1f0d))",border:"2px solid "+GOUD,borderRadius:18,padding:"22px 20px",maxWidth:380,width:"100%",boxShadow:"0 10px 40px rgba(0,0,0,0.6)"}}>
        <div style={{display:"flex",justifyContent:"center",gap:6,marginBottom:16}}>
          {schermen.map(function(_,i){
            return <div key={i} style={{width:i===stap?18:7,height:7,borderRadius:4,background:i===stap?GOUD:KBDR,transition:"all 0.25s"}}/>;
          })}
        </div>
        <div style={{fontSize:19,fontWeight:"bold",color:GOUD,textAlign:"center",marginBottom:10}}>{s.titel}</div>
        <div style={{fontSize:14,color:WITD,textAlign:"center",lineHeight:1.5,marginBottom:16}}>{s.body}</div>
        {s.kies&&(
          <div style={{marginBottom:16}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
              {HOOFDDISCIPLINES.map(function(d){
                return(
                  <button key={d} onClick={function(){wisselDiscipline(d);setKaderOpen(false);}}
                    style={{padding:"9px 4px",background:discipline===d?"var(--c-2d4a1e)":"none",border:"1px solid "+(discipline===d?GOUD:KBDR),borderRadius:8,color:discipline===d?GOUD:WITD,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
                    {DISCIPLINES[d].naam}
                  </button>
                );
              })}
              <button onClick={function(){setKaderOpen(function(v){return !v;});}}
                style={{padding:"9px 4px",background:kaderActief?"var(--c-2d4a1e)":"none",border:"1px solid "+(kaderActief||kaderOpen?GOUD:KBDR),borderRadius:8,color:kaderActief?GOUD:WITD,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
                {kaderActief?DISCIPLINES[discipline].naam:"Kader"} {kaderOpen?"▴":"▾"}
              </button>
            </div>
            {kaderOpen&&(
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:6,marginTop:6}}>
                {KADER_VARIANTEN.map(function(k){
                  const actief=discipline===k;
                  return(
                    <button key={k} onClick={function(){wisselDiscipline(k);}}
                      style={{padding:"8px 2px",background:actief?"var(--c-2d4a1e)":"none",border:"1px solid "+(actief?GOUD:KBDR),borderRadius:8,color:actief?GOUD:WITD,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
                      {DISCIPLINES[k].naam.replace("Kader ","")}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
        {s.weergave&&(
          <div style={{marginBottom:16}}>
            <div style={{fontSize:13,color:WIT,marginBottom:6}}>Tekstgrootte</div>
            <div style={{display:"flex",gap:6,marginBottom:12}}>
              {TEKSTGROOTTES.map(function(x){
                const actief=tekstgrootte===x[0];
                return <button key={x[0]} onClick={function(){setWeergave("tekstgrootte",x[0]);}}
                  style={{flex:1,padding:"10px 2px",background:actief?"var(--c-2d4a1e)":"none",border:"1px solid "+(actief?GOUD:KBDR),borderRadius:8,color:actief?GOUD:WITD,fontSize:12+(x[2]-1)*20,cursor:"pointer",fontFamily:"inherit"}}>{x[1]}</button>;
              })}
            </div>
            <div style={{fontSize:13,color:WIT,marginBottom:6}}>Eenvoudige modus</div>
            <div style={{display:"flex",gap:6}}>
              {[[false,"Alles laten zien"],[true,"Eenvoudig"]].map(function(x){
                const actief=eenvoudig===x[0];
                return <button key={x[1]} onClick={function(){setWeergave("eenvoudig",x[0]);}}
                  style={{flex:1,padding:"10px 2px",background:actief?"var(--c-2d4a1e)":"none",border:"1px solid "+(actief?GOUD:KBDR),borderRadius:8,color:actief?GOUD:WITD,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>{x[1]}</button>;
              })}
            </div>
          </div>
        )}
        {s.lijst&&(
          <div style={{background:"rgba(0,0,0,0.2)",borderRadius:10,padding:"12px 12px",marginBottom:16,fontSize:13,color:WITD,lineHeight:1.5}}>
            {s.lijst.map(function(r,i){
              return <div key={r[0]} style={{marginBottom:i<s.lijst.length-1?8:0}}><span style={{color:GOUD,fontWeight:"bold"}}>{r[0]}</span> — {r[1]}</div>;
            })}
          </div>
        )}
        {s.installeer&&(
          <div style={{background:"rgba(0,0,0,0.2)",borderRadius:10,padding:"12px 12px",marginBottom:16,fontSize:13,color:WITD,lineHeight:1.6}}>
            <div style={{color:GOUD,fontWeight:"bold",marginBottom:4}}>📱 iPhone/iPad (Safari)</div>
            <div style={{marginBottom:10}}>Tik rechtsonderin op •••  (of het deel-icoontje) → "Deel" → eventueel "Toon meer" → "Zet op beginscherm" → "Voeg toe"</div>
            <div style={{color:GOUD,fontWeight:"bold",marginBottom:4}}>🤖 Android (Chrome)</div>
            <div>Menu (⋮) rechtsboven → "App installeren" (verschijnt soms ook automatisch als balkje onderin)</div>
          </div>
        )}
        <div style={{display:"flex",gap:8}}>
          {!laatste&&(
            <button onClick={onKlaar} style={{padding:"12px 10px",background:"none",border:"none",color:WITD,fontSize:13,cursor:"pointer",fontFamily:"inherit",opacity:0.7}}>
              Overslaan
            </button>
          )}
          <button className="plusmin-btn" onClick={function(){laatste?onKlaar():setStap(function(n){return n+1;});}}
            style={{flex:1,padding:13,background:"linear-gradient(135deg,"+GOUD+","+GOUDL+")",border:"none",borderRadius:12,color:G,fontSize:15,fontWeight:"bold",cursor:"pointer",fontFamily:"inherit"}}>
            {laatste?"Eerste partij starten":"Volgende"}
          </button>
        </div>
      </div>
    </div>
  );
}

// "Zo werkt de app": vaste uitleg in gewone taal, altijd te openen (onder Start partij en bovenaan Info)
function UitlegVenster({eenvoudig,onClose}){
  const blokken=[
    ["🎱","Een partij spelen",[
      "Kies de tafel en het doel (aantal beurten of caramboles) en tik op Start partij.",
      "Per beurt: zet je caramboles met + en − (of typ ze) en tik op Noteer.",
      "Vergist? Tik op terug; de laatste beurt wordt weggehaald.",
      "Klaar: tik rechtsboven op Afsluiten en dan op Opslaan. Stop je tussendoor, dan onthoudt de app de partij."
    ]],
    ["✍️","Opmerkingen (mag, hoeft niet)",[
      "Na Noteer kun je aanvinken waardoor je serie eindigde en wat er goed ging.",
      eenvoudig
        ?"Je staat in de eenvoudige modus: die stap wordt overgeslagen. Wil je bij een beurt toch iets aanvinken, tik dan op + opmerking in plaats van Noteer."
        :"In de eenvoudige modus wordt die stap overgeslagen; daar tik je + opmerking als je bij een beurt toch iets wilt aanvinken.",
      "Je hoeft niet altijd opmerkingen te zetten. Een partij telt als bijgehouden als ongeveer een kwart van de beurten een opmerking heeft. Alleen die partijen gebruikt Dash → Inzicht voor je technieken; hoe vaker je het doet, hoe meer de app je kan vertellen."
    ]],
    ["📊","Waar vind je wat",[
      "Spelen: een partij invoeren.",
      "Stats: je niveau, je seizoenen en al je partijen.",
      "Dash: Inzicht (wat je data zegt, je hoogste series, je poedels) en grafieken.",
      "Log: elke partij beurt voor beurt terugkijken.",
      "Info: deze uitleg, weergave (grotere letters, eenvoudige modus), instellingen en je back-up."
    ]],
    ["🏅","Je niveau",[
      "Je vorm is het gemiddelde van je laatste 20 partijen; daarop is je klasse gebaseerd (KNBB-grenzen).",
      "Je moyenne is het gemiddelde van al je partijen, zoals officieel."
    ]],
    ["🔎","Weergave",[
      "Info → Weergave: kies Normaal, Groot of Extra groot voor grotere letters en knoppen.",
      "Eenvoudige modus: alleen caramboles en Noteer, geen badges en punten, en in Dash alleen het belangrijkste."
    ]],
    ["💾","Je gegevens",[
      "Alles staat alleen op dit toestel. Maak af en toe een back-up: Info → Exporteer, en bewaar die bijvoorbeeld in iCloud Drive of je mail.",
      "Nieuwe telefoon of opnieuw installeren? Info → Importeer zet de back-up terug."
    ]]
  ];
  return(
    <div onClick={onClose} style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.85)",zIndex:300,display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"20px 14px",overflowY:"auto"}}>
      <div onClick={function(e){e.stopPropagation();}} style={{background:"linear-gradient(160deg,var(--c-1e3a1e),var(--c-0d1f0d))",border:"2px solid "+GOUD,borderRadius:16,padding:"18px 16px",maxWidth:420,width:"100%"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{fontSize:20,fontWeight:"bold",color:GOUD}}>ℹ️ Zo werkt de app</div>
          <button onClick={onClose} style={{background:"none",border:"1px solid "+KBDR,borderRadius:8,color:WIT,fontSize:16,padding:"4px 12px",cursor:"pointer",fontFamily:"inherit"}}>✕</button>
        </div>
        {blokken.map(function(b){
          return(
            <div key={b[1]} style={{background:"rgba(0,0,0,0.2)",borderRadius:10,padding:"10px 12px",marginBottom:10}}>
              <div style={{fontSize:16,color:GOUD,fontWeight:"bold",marginBottom:6}}>{b[0]} {b[1]}</div>
              {b[2].map(function(r,i){
                return <div key={i} style={{fontSize:15,color:WIT,lineHeight:1.5,marginBottom:i<b[2].length-1?6:0,paddingLeft:12,position:"relative"}}><span style={{position:"absolute",left:0,color:GOUD}}>•</span>{r}</div>;
              })}
            </div>
          );
        })}
        <button className="plusmin-btn" onClick={onClose} style={{width:"100%",padding:13,background:"linear-gradient(135deg,"+GOUD+","+GOUDL+")",border:"none",borderRadius:12,color:G,fontSize:16,fontWeight:"bold",cursor:"pointer",fontFamily:"inherit"}}>Sluiten</button>
      </div>
    </div>
  );
}

function SeizoenArchief({seizoenen,alleP,discipline,onClose}){
  const spel=useContext(SpelContext);
  return(
    <div onClick={onClose} style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.75)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20,cursor:"pointer"}}>
      <div onClick={function(e){e.stopPropagation();}} style={{background:"linear-gradient(160deg,var(--c-1e3a1e),var(--c-0d1f0d))",border:"2px solid "+GOUD,borderRadius:18,padding:"18px 16px",maxWidth:380,width:"100%",maxHeight:"85vh",overflowY:"auto",boxShadow:"0 10px 40px rgba(0,0,0,0.6)"}}>
        <div style={{fontSize:15,fontWeight:"bold",color:GOUD,marginBottom:4,textAlign:"center"}}>Seizoensarchief</div>
        <div style={{fontSize:12,color:WITD,textAlign:"center",marginBottom:14}}>Elke afgesloten periode, met de eindstand van dat seizoen</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {seizoenen.filter(function(s){return s.eindDatum!==null;}).slice().reverse().map(function(s){
            const stats=berekenSeizoenStats(alleP,s,discipline,!spel,{});
            return(
              <div key={s.id} style={{background:"rgba(0,0,0,0.2)",border:"1px solid "+KBDR,borderRadius:10,padding:"10px 12px"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                  <div style={{width:32,height:32,borderRadius:"50%",background:"radial-gradient(circle at 35% 30%,"+stats.niveau.kleur+"cc,"+stats.niveau.kleur+"33)",border:"2px solid "+stats.niveau.kleur,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>
                    {stats.niveau.emoji}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:"bold",color:WIT}}>{s.naam}</div>
                    <div style={{fontSize:11,color:WITD}}>
                      {s.startDatum?new Date(s.startDatum).toLocaleDateString("nl-NL",{day:"numeric",month:"short",year:"numeric"}):"begin"} – {new Date(s.eindDatum).toLocaleDateString("nl-NL",{day:"numeric",month:"short",year:"numeric"})}
                    </div>
                  </div>
                </div>
                <div style={{fontSize:13,color:WITD}}>
                  {stats.aantalPartijen} partijen · gem {stats.gemiddelde.toFixed(discipline==="driebanden"?3:2)} · {spel&&<>{stats.badgePunten}pt · </>}<span style={{color:stats.niveau.kleur,fontWeight:"bold"}}>{stats.niveau.naam}</span>
                </div>
                {stats.aantalDrops>0&&<div style={{fontSize:11,color:WITD,opacity:0.8,marginTop:2}}>Gemiddelde {gemUitleg(stats,discipline==="driebanden"?3:2," van dit seizoen")}</div>}
              </div>
            );
          })}
        </div>
        <div onClick={onClose} style={{textAlign:"center",marginTop:14,fontSize:13,color:WITD,opacity:0.7,cursor:"pointer",padding:"6px 0"}}>Tik om te sluiten</div>
      </div>
    </div>
  );
}

function BadgeCatalogus({discipline,onClose}){
  const BADGE_CATALOGUS=bouwBadgeCatalogus(discipline);
  const categorieen=[];
  BADGE_CATALOGUS.forEach(function(b){if(categorieen.indexOf(b.categorie)===-1)categorieen.push(b.categorie);});
  return(
    <div onClick={onClose} style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.75)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20,cursor:"pointer"}}>
      <div onClick={function(e){e.stopPropagation();}} style={{background:"linear-gradient(160deg,var(--c-1e3a1e),var(--c-0d1f0d))",border:"2px solid "+GOUD,borderRadius:18,padding:"18px 16px",maxWidth:400,width:"100%",maxHeight:"85vh",overflowY:"auto",boxShadow:"0 10px 40px rgba(0,0,0,0.6)"}}>
        <div style={{fontSize:15,fontWeight:"bold",color:GOUD,marginBottom:4,textAlign:"center"}}>Alle badges</div>
        <div style={{fontSize:12,color:WITD,textAlign:"center",marginBottom:14}}>Elke badge die je kunt verdienen, en wat ervoor nodig is</div>
        {categorieen.map(function(cat){
          return(
            <div key={cat} style={{marginBottom:14}}>
              <div style={{fontSize:12,color:GOUD,textTransform:"uppercase",letterSpacing:1,marginBottom:6,borderBottom:"1px solid "+KBDR,paddingBottom:4}}>{cat}</div>
              {BADGE_CATALOGUS.filter(function(b){return b.categorie===cat;}).map(function(b){
                return(
                  <div key={b.label} style={{display:"flex",alignItems:"flex-start",gap:8,padding:"6px 0"}}>
                    <span style={{fontSize:18,flexShrink:0}}>{b.emoji}</span>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",justifyContent:"space-between",gap:8}}>
                        <span style={{fontSize:13,fontWeight:"bold",color:WIT}}>{b.label}</span>
                        <span style={{fontSize:12,color:GOUD,flexShrink:0}}>{b.punten}</span>
                      </div>
                      <div style={{fontSize:12,color:WITD,marginTop:1}}>{b.uitleg}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
        <div onClick={onClose} style={{textAlign:"center",marginTop:6,fontSize:13,color:WITD,opacity:0.7,cursor:"pointer",padding:"6px 0"}}>Tik om te sluiten</div>
      </div>
    </div>
  );
}

function NiveauOverzicht({niveau,discipline,onClose}){
  const niveaus=(DISCIPLINES[discipline]||DISCIPLINES.libre).niveaus;
  const decimalen=discipline==="driebanden"?3:2;
  return(
    <div onClick={onClose} style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.75)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20,cursor:"pointer"}}>
      <div onClick={function(e){e.stopPropagation();}} style={{background:"linear-gradient(160deg,var(--c-1e3a1e),var(--c-0d1f0d))",border:"2px solid "+GOUD,borderRadius:18,padding:"18px 16px",maxWidth:380,width:"100%",maxHeight:"85vh",overflowY:"auto",boxShadow:"0 10px 40px rgba(0,0,0,0.6)"}}>
        <NiveauKaart niveau={niveau} discipline={discipline}/>
        <div style={{fontSize:13,fontWeight:"bold",color:GOUD,marginTop:16,marginBottom:8,textAlign:"center",textTransform:"uppercase",letterSpacing:1}}>Alle niveaus — {(DISCIPLINES[discipline]||DISCIPLINES.libre).naam}</div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {niveaus.map(function(n,i){
            const bereikt=i<niveau.index;
            const isHuidig=i===niveau.index;
            const toekomstig=i>niveau.index;
            return(
              <div key={n.naam} style={{display:"flex",alignItems:"center",gap:10,background:isHuidig?"rgba(201,168,76,0.12)":"transparent",border:"1px solid "+(isHuidig?GOUD:KBDR),borderRadius:10,padding:"8px 10px",opacity:toekomstig?0.6:1}}>
                <div style={{width:38,height:38,borderRadius:"50%",background:"radial-gradient(circle at 35% 30%,"+n.kleur+"cc,"+n.kleur+"33)",border:"2px solid "+n.kleur,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>
                  {n.emoji}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:"bold",color:isHuidig?GOUD:WIT}}>{n.naam}{isHuidig&&<span style={{fontSize:12,color:WITD,fontWeight:"normal"}}> — jouw niveau</span>}</div>
                  <div style={{fontSize:12,color:WITD}}>vanaf gemiddelde {n.gemDrempel.toFixed(decimalen)}</div>
                </div>
                <div style={{fontSize:14}}>{bereikt?"✅":toekomstig?"🔒":""}</div>
              </div>
            );
          })}
        </div>
        <div onClick={onClose} style={{textAlign:"center",marginTop:14,fontSize:13,color:WITD,opacity:0.7,cursor:"pointer",padding:"6px 0"}}>Tik om te sluiten</div>
      </div>
    </div>
  );
}
