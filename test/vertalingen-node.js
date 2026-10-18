// Controle van de vertalingen: zoekt alle t("...")-teksten in de code (plus de vaste labels uit js/constanten.js,
// die met t(label) getoond worden) en meldt per taal welke vertaling ontbreekt of niet meer gebruikt wordt.
// Controleert ook dat {variabelen} in de vertaling dezelfde zijn als in het Nederlands.
// Gebruik: node test/vertalingen-node.js            -> samenvatting, exit 1 bij ontbrekende vertalingen
//          node test/vertalingen-node.js --lijst en  -> alle ontbrekende sleutels voor die taal (één per regel, als JSON)
const fs=require("fs"),path=require("path");
const map=path.join(__dirname,"..");
const bestanden=["index.html"].concat(
  fs.readdirSync(path.join(map,"js")).filter(function(f){return/\.js$/.test(f)&&!/^taal-/.test(f);}).map(function(f){return"js/"+f;}),
  fs.readdirSync(path.join(map,"jsx")).filter(function(f){return/\.jsx$/.test(f);}).map(function(f){return"jsx/"+f;}));
const sleutels=new Set();
bestanden.forEach(function(f){
  const src=fs.readFileSync(path.join(map,f),"utf8");
  const re=/(?:^|[^\w.$])t\(\s*"((?:[^"\\]|\\.)*)"/g;let m;
  while((m=re.exec(src))){sleutels.add(JSON.parse('"'+m[1]+'"'));}
  // t(voorwaarde?"a":"b"): beide teksten
  const re2=/(?:^|[^\w.$])t\(\s*[\w.$!=<>&|() +-]+\?\s*"((?:[^"\\]|\\.)*)"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
  while((m=re2.exec(src))){sleutels.add(JSON.parse('"'+m[1]+'"'));sleutels.add(JSON.parse('"'+m[2]+'"'));}
});
// Vaste labels die als variabele in t() gaan
global.document=undefined;
const c=(new Function(fs.readFileSync(path.join(map,"js/constanten.js"),"utf8")+
  ";return{GEMIST:GEMIST,GOED:GOED,DISCIPLINES:DISCIPLINES,TAFELS:TAFELS,TEKSTGROOTTES:TEKSTGROOTTES,MIJLPALEN:MIJLPALEN,BRIEFJE_PROMPT:BRIEFJE_PROMPT};"))();
c.GEMIST.concat(c.GOED).forEach(function(o){sleutels.add(o.label);});
Object.keys(c.DISCIPLINES).forEach(function(k){const d=c.DISCIPLINES[k];sleutels.add(d.naam);d.niveaus.forEach(function(n){sleutels.add(n.naam);});});
Object.keys(c.TAFELS).forEach(function(k){sleutels.add(c.TAFELS[k].naam);});
c.TEKSTGROOTTES.forEach(function(x){sleutels.add(x[1]);});
c.MIJLPALEN.forEach(function(m){sleutels.add(m.naam);});
sleutels.add(c.BRIEFJE_PROMPT);
// Badge-labels en -categorieën (getoond met badgeLabel()/t()), "Gemiddelde boven X" als sjabloon
(function(){
  const src=fs.readFileSync(path.join(map,"js/berekeningen.js"),"utf8");const re=/(?:label|categorie):"([^"]+)"/g;let m;
  while((m=re.exec(src))){if(m[1]!=="Gemiddelde boven ")sleutels.add(m[1]);}
  sleutels.add("Gemiddelde boven {g}");sleutels.add("Overig");
  // Titels van de omstandigheden in berekenInzicht (blijven Nederlands, getoond met t(o.titel))
  sleutels.add("0 (poedel)"); // eerste groep van histogramBuckets, getoond met t(label)
  const re3=/groep\("([^"]+)"/g;while((m=re3.exec(src))){sleutels.add(m[1]);}
})();

global.VERTALING={};
["en","fr","de"].forEach(function(code){(new Function("VERTALING",fs.readFileSync(path.join(map,"js/taal-"+code+".js"),"utf8")))(global.VERTALING);});
const vars=function(s){return(s.match(/\{\w+\}/g)||[]).sort().join(",");};
const lijstTaal=process.argv.indexOf("--lijst")!==-1?process.argv[process.argv.indexOf("--lijst")+1]:null;
let fout=false;
Object.keys(global.VERTALING).forEach(function(code){
  const v=global.VERTALING[code];
  const ontbreekt=[...sleutels].filter(function(k){return v[k]===undefined;});
  const overbodig=Object.keys(v).filter(function(k){return!sleutels.has(k)&&k.indexOf("kort:")!==0;});
  const varFout=Object.keys(v).filter(function(k){return sleutels.has(k)&&vars(k)!==vars(v[k]);});
  if(lijstTaal===code){ontbreekt.forEach(function(k){console.log(JSON.stringify(k));});return;}
  if(!lijstTaal)console.log(code+": "+(sleutels.size-ontbreekt.length)+"/"+sleutels.size+" vertaald"+
    (ontbreekt.length?", "+ontbreekt.length+" ontbreken":"")+(overbodig.length?", "+overbodig.length+" overbodig":"")+
    (varFout.length?", variabelen fout: "+JSON.stringify(varFout):""));
  if(ontbreekt.length||varFout.length)fout=true;
});
if(!lijstTaal)process.exit(fout?1:0);
