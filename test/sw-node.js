// Test van sw.js in Node, met een nagebootste browseromgeving (cache, netwerk aan/uit/traag).
// Gebruik: node test/sw-node.js   -> per situatie OK/FOUT, en exitcode 1 bij een fout
const fs=require("fs"),path=require("path"),vm=require("vm");
const BASIS="https://ferro842.github.io/Biljart-tracker/";
const bron=fs.readFileSync(path.join(__dirname,"..","sw.js"),"utf8").replace("var NETWERK_WACHT_MS = 4000;","var NETWERK_WACHT_MS = 150;");

function maakOmgeving(){
  const handlers={};
  const opslag=new Map(); // cachenaam -> Map(url -> {body,status})
  const netwerk={stand:"online",vertraging:0,ontbreekt:new Set(),opgevraagd:[]};
  class Req extends Request{constructor(u,o){super(u instanceof Request?u:new URL(u,BASIS).href,o);}}
  const sleutel=function(u,negeerQuery){const x=new URL(typeof u==="string"?new URL(u,BASIS).href:u.url);if(negeerQuery)x.search="";return x.href;};
  function cacheObject(naam){
    if(!opslag.has(naam))opslag.set(naam,new Map());
    const m=opslag.get(naam);
    return{
      add:function(r){return fetchMock(r).then(function(a){if(!a.ok)throw new Error("status "+a.status);return a.text().then(function(t){m.set(sleutel(r),{body:t,status:a.status});});});},
      put:function(r,a){return a.text().then(function(t){m.set(sleutel(r),{body:t,status:a.status});});},
      match:function(r,o){
        const ign=o&&o.ignoreSearch;
        for(const [k,v] of m){if((ign?sleutel(k,true):k)===sleutel(r,ign))return Promise.resolve(new Response(v.body,{status:v.status}));}
        return Promise.resolve(undefined);
      }
    };
  }
  const caches={open:function(n){return Promise.resolve(cacheObject(n));},keys:function(){return Promise.resolve([...opslag.keys()]);},
    delete:function(n){return Promise.resolve(opslag.delete(n));}};
  function fetchMock(r){
    const url=typeof r==="string"?new URL(r,BASIS).href:r.url;
    netwerk.opgevraagd.push(url);
    if(netwerk.stand==="offline")return Promise.reject(new TypeError("Failed to fetch"));
    const pad=new URL(url).pathname.replace("/Biljart-tracker/","")||"./";
    const antwoord=netwerk.ontbreekt.has(pad)?new Response("niet gevonden",{status:404}):new Response("NET:"+pad+new URL(url).search,{status:200});
    Object.defineProperty(antwoord,"type",{value:"basic"});
    return new Promise(function(res){setTimeout(function(){res(antwoord);},netwerk.vertraging);});
  }
  const self={addEventListener:function(t,f){handlers[t]=f;},skipWaiting:function(){},clients:{claim:function(){return Promise.resolve();}},
    location:new URL(BASIS+"sw.js")};
  vm.runInNewContext(bron,{self:self,caches:caches,fetch:fetchMock,Request:Req,Response:Response,URL:URL,Promise:Promise,setTimeout:setTimeout,clearTimeout:clearTimeout,console:console});
  async function event(type,extra){
    const wachten=[];let antwoord;
    // Net als een browser het antwoord meteen oppakken (anders meldt Node een "onafgehandelde" fout)
    const ev=Object.assign({waitUntil:function(p){wachten.push(p);},respondWith:function(p){antwoord=Promise.resolve(p);antwoord.catch(function(){});}},extra||{});
    // Verpakt teruggeven: een async functie zou een promise anders zelf uitpakken
    handlers[type](ev);await Promise.all(wachten);return{antwoord:antwoord};
  }
  async function haal(url,opties){
    const r=new Req(url,{method:(opties&&opties.method)||"GET"});
    if(opties&&opties.navigate)Object.defineProperty(r,"mode",{value:"navigate"});
    const p=(await event("fetch",{request:r})).antwoord;
    if(!p)return{doorgelaten:true};
    try{const a=await p;return{status:a.status,body:await a.text()};}catch(e){return{fout:e.message};}
  }
  return{opslag,netwerk,event,haal,cacheNaam:function(){return [...opslag.keys()];}};
}

(async function(){
  const uitslagen=[];
  const check=function(naam,ok,detail){uitslagen.push((ok?"OK   ":"FOUT ")+naam+(ok?"":"  -> "+JSON.stringify(detail)));};
  const s="?v=2026-10-14.28";

  // 1. Eerste bezoek: installeren slaat alle app-bestanden op, ook als er één ontbreekt
  let o=maakOmgeving();
  o.netwerk.ontbreekt.add("jsx/spelen.jsx");
  await o.event("install");
  const c=o.opslag.get("biljart-tracker-v1");
  check("installeren bewaart de app-bestanden",c&&c.size===25,c&&c.size);
  check("installeren mislukt niet bij een ontbrekend bestand",true);
  o.netwerk.ontbreekt.clear();

  // 2. Online: altijd van het netwerk, en bewaard onder de volledige url
  let r=await o.haal("js/opslag.js"+s);
  check("online: bestand komt van het netwerk",r.body==="NET:js/opslag.js"+s,r);
  check("online: bewaard met ?v=",c.has(BASIS+"js/opslag.js"+s));

  // 3. Offline: zelfde versie uit de cache
  o.netwerk.stand="offline";
  r=await o.haal("js/opslag.js"+s);
  check("offline: zelfde versie uit de cache",r.body==="NET:js/opslag.js"+s,r);
  // 4. Offline: andere ?v= -> kopie zonder query
  r=await o.haal("js/berekeningen.js?v=2099-01-01.1");
  check("offline: andere ?v= valt terug op opgeslagen kopie",r.status===200&&r.body.indexOf("NET:js/berekeningen.js")===0,r);
  // 5. Offline: pagina openen
  r=await o.haal(BASIS,{navigate:true});
  check("offline: startpagina opent",r.status===200&&r.body.indexOf("NET:")===0,r);
  r=await o.haal(BASIS+"index.html?bron=beginscherm",{navigate:true});
  check("offline: index.html met query opent",r.status===200,r);
  // 6. Offline en niet bewaard -> fout (geen verzonnen antwoord)
  r=await o.haal("bestaat-niet.js");
  check("offline: onbekend bestand geeft een fout",!!r.fout,r);

  // 7. Traag netwerk met kopie: na de wachttijd de kopie, nieuwe versie wordt toch bewaard
  o.netwerk.stand="online";o.netwerk.vertraging=600;
  const t0=Date.now();r=await o.haal("css/app.css"+s);const duur=Date.now()-t0;
  check("traag netwerk: kopie uit de cache na de wachttijd",r.status===200&&duur<500,{duur,r});
  await new Promise(function(res){setTimeout(res,700);});
  check("traag netwerk: nieuwe versie daarna alsnog bewaard",c.has(BASIS+"css/app.css"+s));
  // 8. Traag netwerk zonder kopie: wacht op het netwerk
  r=await o.haal("nieuw-bestand.js");
  check("traag netwerk zonder kopie: wacht op het netwerk",r.body==="NET:nieuw-bestand.js",r);
  o.netwerk.vertraging=0;

  // 9. Foutpagina (404) wordt doorgegeven maar niet bewaard
  o.netwerk.ontbreekt.add("weg.js");
  r=await o.haal("weg.js");
  check("404 wordt doorgegeven",r.status===404,r);
  check("404 wordt niet bewaard",!c.has(BASIS+"weg.js"));

  // 10. Andere verzoeken worden niet aangeraakt
  r=await o.haal("data.json",{method:"POST"});
  check("POST wordt doorgelaten",r.doorgelaten===true,r);
  r=await o.haal("https://cdnjs.cloudflare.com/iets.js");
  check("andere website wordt doorgelaten",r.doorgelaten===true,r);

  // 11. Activeren ruimt oude caches op
  o=maakOmgeving();
  o.opslag.set("biljart-tracker-oud",new Map());
  await o.event("install");await o.event("activate");
  check("activeren ruimt oude caches op",JSON.stringify(o.cacheNaam())==='["biljart-tracker-v1"]',o.cacheNaam());

  // 12. De lijst VOORAF in sw.js klopt met de bestanden die index.html laadt, en die bestaan echt
  const map=path.join(__dirname,"..");
  const vooraf=JSON.parse("["+bron.match(/var VOORAF = \[([\s\S]*?)\];/)[1]+"]");
  const html=fs.readFileSync(path.join(map,"index.html"),"utf8");
  const geladen=[...html.matchAll(/(?:src|href)="([^"?#:]+)(?:\?[^"]*)?"/g)].map(function(m){return m[1];}).filter(function(p){return !/^https?:/.test(p);});
  const ontbreektInLijst=geladen.filter(function(p){return vooraf.indexOf(p)===-1;});
  check("elk bestand uit index.html staat in VOORAF",ontbreektInLijst.length===0,ontbreektInLijst);
  const bestaatNiet=vooraf.filter(function(p){return p!=="./"&&!fs.existsSync(path.join(map,p));});
  check("elk bestand in VOORAF bestaat",bestaatNiet.length===0,bestaatNiet);

  console.log(uitslagen.join("\n"));
  const fouten=uitslagen.filter(function(u){return u.indexOf("FOUT")===0;}).length;
  console.log(fouten?fouten+" fout(en)":"Alles goed ("+uitslagen.length+" controles)");
  process.exit(fouten?1:0);
})();
