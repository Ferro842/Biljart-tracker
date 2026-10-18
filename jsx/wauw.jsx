// "Wauw"-onderdelen van Biljart Tracker: optellende cijfers (Telop), vieringen (vier/VieringLaag), deelbare
// afbeeldingen (partijkaart en seizoenskaart via canvas), "Je seizoen in beeld" (SeizoenVerhaal), de
// speelkalender (KalenderPaneel) en het doel met voortgangsring (DoelRing/DoelInstellen).
// JSX via Babel, direct na jsx/onderdelen.jsx. Animaties staan uit als <html> de klasse "rustig" heeft
// (Info → Weergave → Animaties uit) of het toestel om minder beweging vraagt.

function rustig(){
  // window.__testRustig: de browsertests zetten animaties uit, zodat ze eindwaarden lezen
  try{return!!window.__testRustig||document.documentElement.classList.contains("rustig")||window.matchMedia("(prefers-reduced-motion: reduce)").matches;}
  catch(e){return false;}
}

// Getal dat bij verschijnen in ongeveer een halve seconde optelt naar zijn waarde
function Telop({waarde,dec=2,duur=650,komma=false}){
  const [toon,setToon]=useState(rustig()?waarde:0);
  useEffect(function(){
    if(rustig()||!isFinite(waarde)){setToon(waarde);return;}
    let start=null,raf;
    const stap=function(t){
      if(start===null)start=t;
      const f=Math.min(1,(t-start)/duur),e=1-Math.pow(1-f,3);
      setToon(waarde*e);
      if(f<1)raf=requestAnimationFrame(stap);
    };
    raf=requestAnimationFrame(stap);
    // Vangnet: zonder animatieframes (app op de achtergrond) staat het eindgetal er na de animatietijd toch
    const zeker=setTimeout(function(){setToon(waarde);},duur+150);
    return function(){cancelAnimationFrame(raf);clearTimeout(zeker);};
  },[waarde]);
  const tekst=Number(toon).toFixed(dec);
  return <span>{komma?getalTekst(toon,dec):tekst}</span>;
}

// Korte tik in je hand (iOS-app met Haptics-plugin; anders trillen waar dat kan, bijv. Android)
function tik(){
  try{
    const H=window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.Haptics;
    if(H&&H.impact)H.impact({style:"MEDIUM"});else if(navigator.vibrate)navigator.vibrate(30);
  }catch(e){}
}

// Viering: vier({tekst,sub}) laat een paar seconden gouden balletjes vallen met een tekst. Gaat nooit over
// de invoer heen (pointer-events:none) en hoeft niet weggetikt te worden.
function vier(opts){
  try{window.dispatchEvent(new CustomEvent("biljart-viering",{detail:opts||{}}));}catch(e){}
}
function VieringLaag({aan}){
  const [v,setV]=useState(null);
  useEffect(function(){
    const luister=function(e){
      if(!aan||rustig())return;
      tik();
      setV(Object.assign({id:Date.now()},e.detail));
    };
    window.addEventListener("biljart-viering",luister);
    return function(){window.removeEventListener("biljart-viering",luister);};
  },[aan]);
  useEffect(function(){
    if(!v)return;
    const t=setTimeout(function(){setV(null);},2600);
    return function(){clearTimeout(t);};
  },[v]);
  if(!v)return null;
  const kleuren=["#f5f0e8",GOUDL,"#e05555",GOUD,"#f5f0e8","#e8a84c"];
  const ballen=[];
  for(let i=0;i<16;i++){
    ballen.push(<span key={i} className="viering-bal" style={{left:(4+i*6)%96+"%",width:14+(i%3)*5,height:14+(i%3)*5,
      background:"radial-gradient(circle at 35% 30%,#fff,"+kleuren[i%kleuren.length]+" 45%,rgba(0,0,0,0.35))",
      animationDelay:(i%5)*0.12+"s",animationDuration:(1.6+(i%4)*0.25)+"s"}}/>);
  }
  return(
    <div data-viering={v.tekst} style={{position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:450,pointerEvents:"none",overflow:"hidden"}}>
      {ballen}
      <div className="viering-tekst" style={{position:"absolute",top:"30%",left:0,right:0,textAlign:"center",padding:"0 20px"}}>
        <div style={{display:"inline-block",background:"rgba(10,18,10,0.88)",border:"1.5px solid "+GOUD,borderRadius:16,padding:"14px 22px",boxShadow:"0 10px 40px rgba(0,0,0,0.5)"}}>
          <div style={{fontSize:26,fontWeight:"bold",color:GOUDL}}>{v.tekst}</div>
          {v.sub&&<div style={{fontSize:14,color:WIT,marginTop:4}}>{v.sub}</div>}
        </div>
      </div>
    </div>
  );
}

// ── Afbeeldingen om te delen (canvas) ──
function themaKleurenNu(){
  const s=getComputedStyle(document.documentElement);
  const k=function(h,v){return(s.getPropertyValue("--c-"+h)||"").trim()||v;};
  return{diep:k("0d1f0d","#0d1f0d"),achter:k("1a2e1a","#1a2e1a"),kaart:k("22341f","#22341f"),rand:k("3a5c35","#3a5c35"),
    lakenLicht:k("3f8a3a","#3f8a3a"),lakenDonker:k("1d4a1d","#1d4a1d")};
}
function rondRect(ctx,x,y,b,h,r){
  ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+b,y,x+b,y+h,r);ctx.arcTo(x+b,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+b,y,r);ctx.closePath();
}
// Het logo (laken, gekruiste keus, drie ballen) op canvas, s = breedte
function tekenLogo(ctx,x,y,s,th){
  const f=s/100;
  const lg=ctx.createRadialGradient(x+50*f,y+42*f,4*f,x+50*f,y+50*f,70*f);
  lg.addColorStop(0,th.lakenLicht);lg.addColorStop(1,th.lakenDonker);
  rondRect(ctx,x+2*f,y+2*f,96*f,96*f,22*f);ctx.fillStyle=lg;ctx.fill();
  ctx.lineWidth=2.5*f;ctx.strokeStyle=GOUD;ctx.stroke();
  const keu=function(x1,y1,x2,y2){
    const mx=x1+(x2-x1)*0.3,my=y1+(y2-y1)*0.3;ctx.lineCap="round";
    ctx.strokeStyle="#e9c98d";ctx.lineWidth=3.2*f;ctx.beginPath();ctx.moveTo(x+mx*f,y+my*f);ctx.lineTo(x+x2*f,y+y2*f);ctx.stroke();
    ctx.strokeStyle="#2b1a10";ctx.lineWidth=5.2*f;ctx.beginPath();ctx.moveTo(x+x1*f,y+y1*f);ctx.lineTo(x+mx*f,y+my*f);ctx.stroke();
  };
  keu(14,88,86,16);keu(86,88,14,16);
  const bal=function(bx,by,licht,donker){
    const g=ctx.createRadialGradient(x+(bx-3)*f,y+(by-3)*f,1,x+bx*f,y+by*f,9*f);
    g.addColorStop(0,licht);g.addColorStop(1,donker);ctx.fillStyle=g;ctx.beginPath();ctx.arc(x+bx*f,y+by*f,8.5*f,0,Math.PI*2);ctx.fill();
  };
  bal(50,26,"#ff7a6b","#a3120b");bal(25,50,"#ffffff","#cfc9bc");bal(75,50,"#ffe58a","#d18a00");
}
function canvasAchtergrond(ctx,B,H,th){
  const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,th.diep);g.addColorStop(1,th.lakenDonker);
  ctx.fillStyle=g;ctx.fillRect(0,0,B,H);
  ctx.strokeStyle=GOUD;ctx.lineWidth=6;rondRect(ctx,24,24,B-48,H-48,40);ctx.stroke();
}
function tekst(ctx,t,x,y,grootte,kleur,uitlijn,vet){
  ctx.font=(vet?"bold ":"")+grootte+"px Georgia, serif";ctx.fillStyle=kleur;ctx.textAlign=uitlijn||"left";ctx.textBaseline="alphabetic";ctx.fillText(t,x,y);
}
function kommaGetal(x,dec){return getalTekst(x,dec);}

// Partijkaart: staande afbeelding (1080×1350) van één partij
function maakPartijKaart(partij,discipline,niveauNaam){
  const B=1080,H=1350,c=document.createElement("canvas");c.width=B;c.height=H;
  const ctx=c.getContext("2d"),th=themaKleurenNu(),dec=discipline==="driebanden"?3:2;
  const bt=(partij.beurten||[]).map(function(b){return b.caramboles;});
  const car=bt.reduce(function(s,x){return s+x;},0),n=bt.length,gem=n?car/n:0,max=n?Math.max.apply(null,bt):0;
  const poedels=bt.filter(function(x){return x===0;}).length;
  canvasAchtergrond(ctx,B,H,th);
  tekenLogo(ctx,80,80,120,th);
  tekst(ctx,"Biljart Tracker",230,140,52,GOUD,"left",true);
  const d=new Date(partij.datum);
  tekst(ctx,(DISCIPLINES[discipline]||DISCIPLINES.libre).naam+" · "+d.toLocaleDateString(taalLocale(),{weekday:"short",day:"numeric",month:"long",year:"numeric"})+" · "+tafelLabel(partij.tafel||"230"),230,190,30,WITD);
  tekst(ctx,kommaGetal(gem,dec),B/2,470,230,GOUDL,"center",true);
  tekst(ctx,t("gemiddelde"),B/2,565,36,WITD,"center");
  const vakken=[[String(car),t("caramboles")],[String(n),t("beurten")],[String(max),t("hoogste serie")],[String(poedels),t("poedels")]];
  vakken.forEach(function(v,i){
    const vb=(B-160-3*24)/4,x=80+i*(vb+24);
    rondRect(ctx,x,610,vb,165,24);ctx.fillStyle="rgba(0,0,0,0.3)";ctx.fill();
    tekst(ctx,v[0],x+vb/2,705,72,i===2?"#ff9f40":WIT,"center",true);
    tekst(ctx,v[1],x+vb/2,750,26,WITD,"center");
  });
  // Beurtengrafiek
  const gx=80,gy=815,gb=B-160,gh=320;
  rondRect(ctx,gx,gy,gb,gh,24);ctx.fillStyle="rgba(0,0,0,0.25)";ctx.fill();
  tekst(ctx,t("Beurt voor beurt"),gx+30,gy+50,30,WITD);
  const top=Math.max(1,max),bb=(gb-60)/Math.max(1,n);
  bt.forEach(function(x,i){
    const bx=gx+30+i*bb+bb*0.15,breed=Math.max(3,bb*0.7);
    if(x===0){ // poedel: rood stipje op de grondlijn
      ctx.fillStyle="#e08055";ctx.beginPath();ctx.arc(bx+breed/2,gy+gh-36,Math.min(6,breed/2),0,Math.PI*2);ctx.fill();return;
    }
    const h=(x/top)*(gh-110);
    ctx.fillStyle=beurtKleur(x,discipline);
    rondRect(ctx,bx,gy+gh-30-h,breed,h,Math.min(8,bb*0.3));ctx.fill();
  });
  if(niveauNaam)tekst(ctx,niveauNaam,B/2,1200,40,GOUD,"center",true);
  return c;
}

// Afbeelding delen: in de iOS-app via het deelmenu, op de website via navigator.share of als download
async function deelAfbeelding(canvas,naam){
  const dataUrl=canvas.toDataURL("image/png");
  if(typeof IS_NATIVE!=="undefined"&&IS_NATIVE){
    await nativeFS().writeFile({path:naam,data:dataUrl.split(",")[1],directory:"CACHE"});
    const r=await nativeFS().getUri({path:naam,directory:"CACHE"});
    await window.Capacitor.Plugins.Share.share({files:[r.uri]});
    return;
  }
  const blob=await (await fetch(dataUrl)).blob();
  const bestand=new File([blob],naam,{type:"image/png"});
  if(navigator.canShare&&navigator.canShare({files:[bestand]})){await navigator.share({files:[bestand],title:"Biljart Tracker"});return;}
  const a=document.createElement("a");a.href=dataUrl;a.download=naam;document.body.appendChild(a);a.click();document.body.removeChild(a);
}

// Knop "Deel als kaart" voor een partij
function DeelKaartKnop({partij,discipline,niveauNaam,stijl}){
  const [bezig,setBezig]=useState(false);
  const deel=async function(e){
    if(e)e.stopPropagation();
    setBezig(true);
    try{await deelAfbeelding(maakPartijKaart(partij,discipline,niveauNaam),"partij-"+String(partij.datum).slice(0,10)+".png");}
    catch(err){if(!/cancel|abort/i.test(String(err&&(err.message||err))))alert(t("Delen lukte niet: {f}",{f:err&&err.message||err}));}
    setBezig(false);
  };
  return <button onClick={deel} style={Object.assign({padding:"9px 12px",background:"none",border:"1px solid "+GOUD,borderRadius:8,color:GOUD,cursor:"pointer",fontFamily:"inherit",fontSize:14},stijl||{})}>
    {bezig?t("Bezig…"):"📤 "+t("Deel als kaart")}
  </button>;
}

// ── Je seizoen in beeld ──
function maakSeizoenKaart(v,discipline){
  const B=1080,H=1350,c=document.createElement("canvas");c.width=B;c.height=H;
  const ctx=c.getContext("2d"),th=themaKleurenNu(),dec=discipline==="driebanden"?3:2;
  canvasAchtergrond(ctx,B,H,th);
  tekenLogo(ctx,B/2-70,90,140,th);
  tekst(ctx,seizoenNaam(v.seizoen),B/2,330,64,GOUD,"center",true);
  tekst(ctx,(DISCIPLINES[discipline]||DISCIPLINES.libre).naam+" · "+fmtDatum(v.van)+" – "+fmtDatum(v.totDatum),B/2,385,32,WITD,"center");
  tekst(ctx,kommaGetal(v.gem,dec),B/2,580,180,GOUDL,"center",true);
  tekst(ctx,t("gemiddelde")+" · "+v.niveau.naam,B/2,670,36,WITD,"center");
  const regels=[[t("Partijen"),String(v.partijen)],[t("Caramboles"),String(v.caramboles)],[t("Hoogste serie"),String(v.hoogste.car)],
    [t("Beste partij"),kommaGetal(v.beste.gem,dec)],[t("Poedels per partij"),kommaGetal(v.poedelsPerPartij,1)]];
  regels.forEach(function(r,i){
    const y=750+i*92;
    rondRect(ctx,120,y,B-240,72,20);ctx.fillStyle="rgba(0,0,0,0.28)";ctx.fill();
    tekst(ctx,r[0],160,y+48,34,WITD);tekst(ctx,r[1],B-160,y+50,40,i===2?"#ff9f40":WIT,"right",true);
  });
  return c;
}

function SeizoenVerhaal({seizoen,alleP,discipline,onClose}){
  const v=useMemo(function(){return berekenSeizoenVerhaal(alleP,seizoen,discipline);},[alleP,seizoen,discipline]);
  const [i,setI]=useState(0);
  const [bezig,setBezig]=useState(false);
  const dec=discipline==="driebanden"?3:2;
  if(!v){
    return(
      <div onClick={onClose} style={{position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:320,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
        <div style={{color:WIT,fontSize:16,textAlign:"center"}}>{t("Nog geen partijen in {s} voor deze discipline.",{s:seizoenNaam(seizoen)})}<div style={{color:WITD,fontSize:13,marginTop:10}}>{t("Tik om te sluiten")}</div></div>
      </div>
    );
  }
  const groot=function(inhoud,kleur){return <div style={{fontSize:76,fontWeight:"bold",color:kleur||GOUDL,lineHeight:1.05}}>{inhoud}</div>;};
  const sub=function(x){return <div style={{fontSize:18,color:WIT,marginTop:10,lineHeight:1.45}}>{x}</div>;};
  const klein=function(x){return <div style={{fontSize:14,color:WITD,marginTop:12,lineHeight:1.5}}>{x}</div>;};
  const kaarten=[
    {k:"🎬",titel:seizoenNaam(v.seizoen),inhoud:<>
      <div style={{margin:"10px auto 18px",display:"flex",justifyContent:"center"}}><Logo maat={110}/></div>
      {sub(t("Jouw seizoen in beeld"))}
      {klein((DISCIPLINES[discipline]||DISCIPLINES.libre).naam+" · "+fmtDatum(v.van)+" – "+fmtDatum(v.totDatum))}
      {klein(t("Tik rechts voor verder, links om terug te gaan."))}
    </>},
    {k:"🎱",titel:t("Aan tafel"),inhoud:<>
      {groot(<Telop waarde={v.partijen} dec={0}/>)}{sub(t(v.speeldagen===1?"partijen, op {n} speeldag":"partijen, op {n} speeldagen",{n:v.speeldagen}))}
      {klein(<>{t("Samen")} <b style={{color:WIT}}><Telop waarde={v.caramboles} dec={0}/></b> {t("caramboles in {n} beurten.",{n:v.beurten})}</>)}
    </>},
    {k:"📈",titel:t("Je gemiddelde"),inhoud:<>
      {groot(<Telop waarde={v.gem} dec={dec} komma={true}/>)}{sub(t("gemiddeld per beurt dit seizoen"))}
      {klein(t("Daarmee speel je in de {k}.",{k:v.niveau.naam}))}
    </>},
    {k:"🔥",titel:t("Je hoogste serie"),inhoud:<>
      {groot(<Telop waarde={v.hoogste.car} dec={0}/>,"#ff9f40")}{sub(t("caramboles achter elkaar"))}
      {klein(t("{d} op de {tafel}, in beurt {b}.",{d:fmtDatum(v.hoogste.datum),tafel:tafelLabel(v.hoogste.tafel),b:v.hoogste.beurt}))}
    </>},
    {k:"🏆",titel:t("Je beste partij"),inhoud:<>
      {groot(<Telop waarde={v.beste.gem} dec={dec} komma={true}/>,GRNT)}{sub(t("{c} caramboles in {b} beurten",{c:v.beste.car,b:v.beste.beurten}))}
      {klein(t("{d} op de {tafel}.",{d:fmtDatum(v.beste.datum),tafel:tafelLabel(v.beste.tafel)}))}
    </>},
    {k:"⭕",titel:t("Je poedels"),inhoud:v.poedelVerloop?<>
      {groot(<Telop waarde={Math.abs(v.poedelVerloop.eerst-v.poedelVerloop.nu)} dec={1} komma={true}/>,v.poedelVerloop.nu<=v.poedelVerloop.eerst?GRNT:ROOD)}
      {sub(t(v.poedelVerloop.nu<=v.poedelVerloop.eerst?"poedel per partij minder dan aan het begin":"poedel per partij meer dan aan het begin"))}
      {klein(t("Eerste helft van het seizoen {a} per partij, tweede helft {b}.",{a:kommaGetal(v.poedelVerloop.eerst,1),b:kommaGetal(v.poedelVerloop.nu,1)}))}
    </>:<>
      {groot(<Telop waarde={v.poedelsPerPartij} dec={1} komma={true}/>,ROOD)}{sub(t("poedels per partij"))}
    </>},
    v.besteMaand&&{k:"📅",titel:t("Je beste maand"),inhoud:<>
      <div style={{fontSize:52,fontWeight:"bold",color:GOUDL}}>{maandTekst(v.besteMaand.naam)}</div>
      {sub(t("gemiddeld {g} in {n} partijen",{g:kommaGetal(v.besteMaand.gem,dec),n:v.besteMaand.partijen}))}
    </>},
    {k:"🎉",titel:t("Op naar meer!"),inhoud:<>
      <div style={{fontSize:64,marginBottom:6}}>{v.niveau.emoji}</div>
      <div style={{fontSize:30,fontWeight:"bold",color:GOUD}}>{v.niveau.naam}</div>
      {sub(t("Deel je seizoen met je club of je biljartmaten."))}
      <button onClick={async function(e){e.stopPropagation();setBezig(true);
          try{await deelAfbeelding(maakSeizoenKaart(v,discipline),"seizoen-"+v.seizoen.id+".png");}catch(err){if(!/cancel|abort/i.test(String(err&&(err.message||err))))alert(t("Delen lukte niet: {f}",{f:err&&err.message||err}));}
          setBezig(false);}}
        style={{marginTop:22,padding:"14px 26px",background:"linear-gradient(135deg,"+GOUD+","+GOUDL+")",border:"none",borderRadius:12,color:G,fontSize:17,fontWeight:"bold",cursor:"pointer",fontFamily:"inherit"}}>
        {bezig?t("Bezig…"):"📤 "+t("Deel je seizoen")}
      </button>
    </>}
  ].filter(Boolean);
  const kaart=kaarten[Math.min(i,kaarten.length-1)];
  const verder=function(){if(i<kaarten.length-1)setI(i+1);else onClose();};
  const terug=function(){if(i>0)setI(i-1);};
  return(
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:320,background:"radial-gradient(ellipse at 50% 30%,var(--c-1e3a1e),var(--c-0d1f0d) 70%)",display:"flex",flexDirection:"column",
      paddingTop:"calc(env(safe-area-inset-top) + 12px)",paddingBottom:"env(safe-area-inset-bottom)"}}>
      {/* Voortgang zoals bij verhalen */}
      <div style={{display:"flex",gap:4,padding:"0 14px"}}>
        {kaarten.map(function(_,j){return <div key={j} style={{flex:1,height:3,borderRadius:2,background:j<=i?GOUD:"rgba(255,255,255,0.2)",transition:"background 0.3s"}}/>;})}
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",padding:"8px 14px 0"}}>
        <button onClick={onClose} aria-label={t("Sluiten")} style={{background:"rgba(0,0,0,0.3)",border:"1px solid "+KBDR,borderRadius:20,color:WIT,fontSize:16,width:36,height:36,cursor:"pointer"}}>✕</button>
      </div>
      <div style={{flex:1,position:"relative",display:"flex",alignItems:"center",justifyContent:"center",padding:"0 28px"}}>
        {/* Tikzones: links terug, rechts verder */}
        <div onClick={terug} style={{position:"absolute",left:0,top:0,bottom:0,width:"33%",zIndex:1}}/>
        <div onClick={verder} style={{position:"absolute",right:0,top:0,bottom:0,width:"67%",zIndex:1}}/>
        <div key={i} className="verhaal-in" style={{textAlign:"center",maxWidth:420,position:"relative",zIndex:2,pointerEvents:"none"}}>
          <div style={{fontSize:40,marginBottom:6}}>{kaart.k}</div>
          <div style={{fontSize:15,color:GOUD,textTransform:"uppercase",letterSpacing:2,marginBottom:16}}>{kaart.titel}</div>
          <div style={{pointerEvents:"auto"}}>{kaart.inhoud}</div>
        </div>
      </div>
      <div style={{textAlign:"center",fontSize:12,color:WITD,opacity:0.7,padding:"0 0 14px"}}>{i+1} / {kaarten.length}</div>
    </div>
  );
}

// ── Speelkalender: per dag een vakje, gekleurd naar je gemiddelde die dag ──
function KalenderPaneel({partijen,discipline}){
  const [gekozen,setGekozen]=useState(null);
  // Aantal maanden naast elkaar (gemeten), zodat de details direct onder de rij van de aangetikte maand komen
  const [kolommen,setKolommen]=useState(2);
  const rasterRef=useRef(null),detailRef=useRef(null);
  useEffect(function(){
    const el=rasterRef.current;if(!el)return;
    const meet=function(){setKolommen(Math.max(1,Math.floor((el.clientWidth+12)/(150+12))));};
    meet();
    if(typeof ResizeObserver==="undefined")return;
    const ro=new ResizeObserver(meet);ro.observe(el);return function(){ro.disconnect();};
  },[]);
  // Valt de details-kaart onder de rand van het scherm, dan schuift hij net in beeld
  useEffect(function(){
    if(gekozen&&detailRef.current&&detailRef.current.scrollIntoView)detailRef.current.scrollIntoView({block:"nearest",behavior:rustig()?"auto":"smooth"});
  },[gekozen]);
  const dec=discipline==="driebanden"?3:2;
  const perDag=useMemo(function(){
    const m={};
    (partijen||[]).forEach(function(p){
      const d=new Date(p.datum),k=d.getFullYear()+"-"+d.getMonth()+"-"+d.getDate();
      const bt=p.beurten||[];if(!bt.length)return;
      (m[k]=m[k]||{car:0,beurten:0,partijen:[]});
      m[k].car+=bt.reduce(function(s,b){return s+b.caramboles;},0);m[k].beurten+=bt.length;m[k].partijen.push(p);
    });
    return m;
  },[partijen]);
  const alleGem=(function(){let c=0,n=0;Object.keys(perDag).forEach(function(k){c+=perDag[k].car;n+=perDag[k].beurten;});return n?c/n:0;})();
  const grenzen=gemGrenzen(alleGem,discipline);
  // Alle maanden vanaf je eerste partij tot en met nu (ook maanden zonder partijen: dan zie je wanneer je minder speelde)
  const nu=new Date(),maanden=[];
  const eerste=(partijen||[]).reduce(function(m,p){const d=new Date(p.datum);return !m||d<m?d:m;},null)||nu;
  for(let d=new Date(eerste.getFullYear(),eerste.getMonth(),1);d<=nu;d=new Date(d.getFullYear(),d.getMonth()+1,1))maanden.push(d);
  const MND=[0,1,2,3,4,5,6,7,8,9,10,11].map(maandNaam);
  const speeldagen=Object.keys(perDag).filter(function(k){const p=k.split("-").map(Number);return new Date(p[0],p[1],p[2])>=maanden[0];}).length;
  const sel=gekozen?perDag[gekozen]:null;
  // Details van de gekozen dag: als hele rij direct onder de rij met die maand
  const detail=sel&&(
    <div key="detail" ref={detailRef} data-kalender-detail="" style={{gridColumn:"1 / -1",background:"rgba(201,168,76,0.08)",border:"1px solid "+GOUD,borderRadius:10,padding:"10px 12px",scrollMarginTop:120,scrollMarginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
        <span style={{fontSize:14,color:GOUD,fontWeight:"bold"}}>{new Date(sel.partijen[0].datum).toLocaleDateString(taalLocale(),{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</span>
        <span onClick={function(){setGekozen(null);}} style={{color:WITD,cursor:"pointer",fontSize:16}}>✕</span>
      </div>
      {sel.partijen.map(function(p,j){
        const bt=p.beurten.map(function(b){return b.caramboles;}),c=bt.reduce(function(s,x){return s+x;},0);
        return <div key={j} style={{fontSize:13,color:WIT,padding:"3px 0",borderTop:j?"1px solid rgba(255,255,255,0.06)":"none"}}>
          {tafelLabel(p.tafel||"230")} · <b style={{color:gemKleur(c/bt.length,grenzen)}}>{kommaGetal(c/bt.length,dec)}</b> · {t("{c} car. in {b} beurten · hoogste {m}",{c:c,b:bt.length,m:Math.max.apply(null,bt)})}
        </div>;
      })}
    </div>
  );
  const rijen=maanden.slice().reverse();
  const gekozenMaand=gekozen?rijen.findIndex(function(m){const p=gekozen.split("-").map(Number);return m.getFullYear()===p[0]&&m.getMonth()===p[1];}):-1;
  const naRij=gekozenMaand<0?-1:Math.min(rijen.length-1,Math.floor(gekozenMaand/kolommen)*kolommen+kolommen-1);
  return(
    <div>
      <div style={{fontSize:13,color:WITD,lineHeight:1.5,marginBottom:10}}>
        <b style={{color:WIT}}>{speeldagen}</b> {t(speeldagen===1?"speeldag sinds {m}. Kleur = je gemiddelde die dag:":"speeldagen sinds {m}. Kleur = je gemiddelde die dag:",{m:MND[maanden[0].getMonth()]+" "+maanden[0].getFullYear()})}
        <span style={{color:GRNT}}> ■ {t("goed")}</span><span style={{color:GOUD}}> ■ {t("gemiddeld")}</span><span style={{color:ROOD}}> ■ {t("minder")}</span>. {t("Tik op een dag voor de partijen.")}
      </div>
      <div ref={rasterRef} style={{display:"grid",gridTemplateColumns:"repeat("+kolommen+",minmax(0,1fr))",gap:12}}>
        {rijen.map(function(m,mi){
          const dagen=new Date(m.getFullYear(),m.getMonth()+1,0).getDate(),begin=(m.getDay()+6)%7;
          const cellen=[];
          for(let i=0;i<begin;i++)cellen.push(<div key={"l"+i}/>);
          for(let d=1;d<=dagen;d++){
            const k=m.getFullYear()+"-"+m.getMonth()+"-"+d,info=perDag[k],aan=gekozen===k;
            const kleur=info?gemKleur(info.car/info.beurten,grenzen):null;
            cellen.push(<div key={d} onClick={info?function(){setGekozen(aan?null:k);}:undefined} title={info?kommaGetal(info.car/info.beurten,dec):""}
              style={{aspectRatio:"1",borderRadius:3,cursor:info?"pointer":"default",background:info?kleur:"rgba(255,255,255,0.06)",
                opacity:info?1:1,boxShadow:aan?"0 0 0 2px "+WIT:"none",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:info?"rgba(0,0,0,0.6)":"rgba(255,255,255,0.25)"}}>{info&&info.partijen.length>1?info.partijen.length:""}</div>);
          }
          return[(
            <div key={m.getTime()} style={{background:KBG,border:"1px solid "+KBDR,borderRadius:10,padding:"8px 9px"}}>
              <div style={{fontSize:12,color:GOUD,marginBottom:5,textTransform:"capitalize"}}>{MND[m.getMonth()]} {m.getFullYear()}</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:2}}>
                {weekdagLetters().map(function(l,j){return <div key={j} style={{fontSize:8,color:WITD,opacity:0.7,textAlign:"center"}}>{l}</div>;})}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>{cellen}</div>
            </div>
          ),mi===naRij?detail:null];
        })}
      </div>
    </div>
  );
}

// ── Doel met voortgangsring ──
// doel = {waarde, datum (jjjj-mm-dd), start (vorm bij instellen), gehaald}
function doelVoortgang(doel,vorm){
  if(!doel)return 0;
  const start=doel.start!=null?doel.start:0;
  if(doel.waarde<=start)return vorm>=doel.waarde?1:0;
  return Math.max(0,Math.min(1,(vorm-start)/(doel.waarde-start)));
}
function DoelRing({doel,vorm,discipline,onWijzig}){
  if(!doel)return null;
  const dec=discipline==="driebanden"?3:2,pct=doel.gehaald?1:doelVoortgang(doel,vorm);
  const dagen=Math.ceil((new Date(doel.datum+"T23:59:59")-new Date())/86400000);
  const r=22,omtrek=2*Math.PI*r;
  const stand=doel.gehaald?"🎉 "+t("Doel gehaald!"):dagen<0?t("Datum verstreken"):dagen<14?t(dagen===1?"nog {n} dag":"nog {n} dagen",{n:dagen}):t("nog {n} weken",{n:Math.round(dagen/7)});
  return(
    <div onClick={onWijzig} style={{display:"flex",alignItems:"center",gap:12,background:KBG,border:"1px solid "+(doel.gehaald?GRNT:GOUD),borderRadius:12,padding:"9px 12px",cursor:"pointer"}}>
      <svg width="56" height="56" viewBox="0 0 56 56" style={{flexShrink:0}}>
        <circle cx="28" cy="28" r={r} style={{fill:"none",stroke:"rgba(255,255,255,0.12)",strokeWidth:6}}/>
        <circle cx="28" cy="28" r={r} className="ring-groei" style={{fill:"none",stroke:doel.gehaald?GRNT:GOUD,strokeWidth:6,strokeLinecap:"round",
          strokeDasharray:omtrek,strokeDashoffset:omtrek*(1-pct),transform:"rotate(-90deg)",transformOrigin:"50% 50%",transition:"stroke-dashoffset 0.8s ease"}}/>
        <text x="28" y="32" textAnchor="middle" style={{fill:WIT,fontSize:12,fontWeight:"bold",fontFamily:"Georgia,serif"}}>{Math.round(pct*100)}%</text>
      </svg>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:13,color:GOUD,textTransform:"uppercase",letterSpacing:1}}>🎯 {t("Doel {g}",{g:kommaGetal(doel.waarde,dec)})}</div>
        <div style={{fontSize:14,color:WIT,marginTop:2}}>{t("Nu")} <b>{kommaGetal(vorm,dec)}</b>{doel.start!=null&&!doel.gehaald?<span> · {t("begon op {g}",{g:kommaGetal(doel.start,dec)})}</span>:null} · {stand}</div>
      </div>
      <span style={{color:WITD,fontSize:18}}>›</span>
    </div>
  );
}
function DoelInstellen({doel,vorm,discipline,onOpslaan,onVerwijder,onClose}){
  const dec=discipline==="driebanden"?3:2,stap=gemStap(discipline);
  const tweeMnd=new Date();tweeMnd.setMonth(tweeMnd.getMonth()+3);
  const iso=function(d){return d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2);};
  const [waarde,setWaarde]=useState(doel&&!doel.gehaald?doel.waarde:Math.ceil((vorm+stap*0.01)/stap)*stap);
  const [datum,setDatum]=useState(doel&&!doel.gehaald?doel.datum:iso(tweeMnd));
  const knop={width:40,height:40,borderRadius:"50%",border:"1.5px solid "+GOUD,background:"none",color:GOUD,fontSize:20,cursor:"pointer",fontFamily:"inherit"};
  return(
    <div onClick={onClose} style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.8)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div onClick={function(e){e.stopPropagation();}} style={{background:"linear-gradient(160deg,var(--c-1e3a1e),var(--c-0d1f0d))",border:"2px solid "+GOUD,borderRadius:16,padding:"18px 16px",maxWidth:380,width:"100%"}}>
        <div style={{fontSize:19,fontWeight:"bold",color:GOUD,marginBottom:6}}>🎯 {t("Je doel")}</div>
        <div style={{fontSize:13,color:WITD,marginBottom:14,lineHeight:1.45}}>{t("Welke vorm wil je halen, en wanneer? Je vorm is nu {v}. De ring laat zien hoe ver je bent.",{v:kommaGetal(vorm,dec)})}</div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:18,marginBottom:14}}>
          <button style={knop} onClick={function(){setWaarde(Math.max(stap,+(waarde-stap).toFixed(3)));}}>−</button>
          <div style={{fontSize:40,fontWeight:"bold",color:GOUDL,minWidth:110,textAlign:"center"}}>{kommaGetal(waarde,dec)}</div>
          <button style={knop} onClick={function(){setWaarde(+(waarde+stap).toFixed(3));}}>+</button>
        </div>
        <label style={{display:"block",fontSize:12,color:WITD}}>{t("Vóór")}
          <input type="date" value={datum} min={iso(new Date())} onChange={function(e){setDatum(e.target.value);}}
            style={{display:"block",width:"100%",marginTop:4,padding:"10px",borderRadius:8,border:"1px solid "+KBDR,background:"rgba(0,0,0,0.3)",color:WIT,fontSize:16,fontFamily:"inherit",colorScheme:"dark",minHeight:44}}/>
        </label>
        <div style={{display:"flex",gap:8,marginTop:16}}>
          {doel&&<button onClick={onVerwijder} style={{flex:1,padding:12,background:"none",border:"1px solid #7a3030",borderRadius:10,color:"#e06060",fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>{t("Geen doel")}</button>}
          <button onClick={function(){onOpslaan({waarde:waarde,datum:datum,start:vorm,gehaald:false,gezet:new Date().toISOString()});}}
            style={{flex:2,padding:12,background:"linear-gradient(135deg,"+GOUD+","+GOUDL+")",border:"none",borderRadius:10,color:G,fontSize:15,fontWeight:"bold",cursor:"pointer",fontFamily:"inherit"}}>{t("Doel opslaan")}</button>
        </div>
      </div>
    </div>
  );
}
