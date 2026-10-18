// Node-versie van test/snapshot.js: rekent op test/testdata.json met js/constanten.js, js/berekeningen.js
// en de migratie uit js/opslag.js, en print de hash (gelijk aan die in de browser) en eventueel de details.
// Gebruik: node test/snapshot-node.js            -> hash
//          node test/snapshot-node.js --details  -> volledige uitkomst als JSON
// Met een andere map als bron (bijv. een oude versie): node test/snapshot-node.js --map /pad/naar/kopie
const fs=require("fs"),path=require("path"),crypto=require("crypto");
const args=process.argv.slice(2);
const map=args.indexOf("--map")!==-1?args[args.indexOf("--map")+1]:path.join(__dirname,"..");
global.document={documentElement:{classList:{contains:function(){return false;}}}};
const code=["js/constanten.js","js/taal.js","js/berekeningen.js","js/opslag.js"].map(function(f){return fs.readFileSync(path.join(map,f),"utf8");}).join("\n");
const data=JSON.parse(fs.readFileSync(path.join(__dirname,"testdata.json"),"utf8"));
const uit=(new Function("data",code+`
  migreerTafels(data);
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
  return uit;`))(data);
const hash=crypto.createHash("sha256").update(JSON.stringify(uit)).digest("hex").slice(0,16);
if(args.indexOf("--details")!==-1)console.log(JSON.stringify(uit,null,1));
else console.log(hash);
