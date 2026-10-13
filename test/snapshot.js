// Berekent per discipline de kerncijfers met de functies van de app zelf. Draai dit in de browser-
// console op een geladen app (met test/testdata.json in localStorage) en vergelijk met
// de referentie-hash hieronder: na een puur technische wijziging moet de uitkomst exact gelijk zijn.
// Alleen bij een bewuste wijziging in de berekeningen mag REFERENTIE worden bijgewerkt.
// Snel draaien: await eval(await fetch("/test/snapshot.js").then(r=>r.text()))
const REFERENTIE="b7883ea45f248ef4";
(function(){
  const data=JSON.parse(localStorage.getItem("biljart-tracker-v2"));
  const uit={aantalPartijen:data.partijen.length,tafelsNaMigratie:data.partijen.map(function(p){return p.tafel;}).join(""),disciplines:{}};
  Object.keys(DISCIPLINES).forEach(function(disc){
    const ps=data.partijen.filter(function(p){return(p.discipline||"libre")===disc;});
    if(!ps.length)return;
    const info=berekenNiveauInfo(ps);
    const niv=bepaalNiveau(info.effectiefGemiddelde,disc);
    const prest=berekenPrestaties(ps,null,disc);
    const prest3=berekenPrestaties(ps,3,disc);
    const records=berekenLopendeRecords(ps,null);
    const voorspelling=berekenVoorspelling(ps,disc);
    uit.disciplines[disc]={
      partijen:ps.length,
      totaalGemiddelde:info.totaalGemiddelde.toFixed(6),
      effectiefGemiddelde:info.effectiefGemiddelde.toFixed(6),
      badgePunten:info.badgePunten,
      aantalDrops:info.aantalDrops,
      niveau:niv.huidig.naam+" "+niv.progressPct+"%",
      puntenPerPartij:prest.map(function(r){return r.punten;}).join(","),
      badges:prest.map(function(r){return r.badges.map(function(b){return b.label+"x"+b.aantal;}).join("|");}).join(";"),
      puntenVenster3:prest3.map(function(r){return r.punten;}).join(","),
      records:JSON.stringify(records),
      voorspelling:JSON.stringify(voorspelling),
      seizoenen:data.seizoenen.map(function(s){const st=berekenSeizoenStats(ps,s,disc);return st.aantalPartijen+"/"+st.gemiddelde.toFixed(4)+"/"+st.badgePunten;}).join(" "),
      mijlpalen:berekenMijlpalen(ps).filter(function(m){return m.bereikt;}).length
    };
  });
  const tekst=JSON.stringify(uit);
  return crypto.subtle.digest("SHA-256",new TextEncoder().encode(tekst)).then(function(h){
    const hash=Array.from(new Uint8Array(h)).map(function(b){return b.toString(16).padStart(2,"0");}).join("").slice(0,16);
    return{hash:hash,gelijk:hash===REFERENTIE,uit:uit};
  });
})()
