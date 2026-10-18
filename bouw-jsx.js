// Zet jsx/*.jsx om naar gewone JavaScript in gebouwd/*.js (esbuild), zodat de browser geen Babel meer nodig heeft
// en de app sneller start. Geen bundel: elk bestand blijft een los script in de gedeelde globale scope, in dezelfde
// volgorde als in index.html. gebouwd/ wordt meegecommit (GitHub Pages bouwt niets).
//   node bouw-jsx.js            bouwen (ook via npm run jsx en npm run build)
//   node bouw-jsx.js --controle alleen controleren of gebouwd/ bij jsx/ past (test)
const fs=require("fs"),path=require("path"),esbuild=require("esbuild");
const map=path.join(__dirname,"jsx"),uit=path.join(__dirname,"gebouwd");
const controle=process.argv.includes("--controle");
const bestanden=fs.readdirSync(map).filter(function(f){return f.endsWith(".jsx");}).sort();
let fout=0;
if(!controle&&!fs.existsSync(uit))fs.mkdirSync(uit);
bestanden.forEach(function(f){
  const bron=fs.readFileSync(path.join(map,f),"utf8");
  const code="// Gebouwd uit jsx/"+f+" door bouw-jsx.js; niet zelf aanpassen.\n"+esbuild.transformSync(bron,{
    loader:"jsx",jsx:"transform",jsxFactory:"React.createElement",jsxFragment:"React.Fragment",
    target:"es2017",charset:"utf8",sourcefile:"jsx/"+f
  }).code;
  const doel=path.join(uit,f.replace(/\.jsx$/,".js"));
  if(controle){
    if(!fs.existsSync(doel)||fs.readFileSync(doel,"utf8")!==code){console.log("Verouderd: gebouwd/"+path.basename(doel)+" (draai npm run jsx)");fout++;}
  }else fs.writeFileSync(doel,code);
});
if(controle){
  const over=fs.existsSync(uit)?fs.readdirSync(uit).filter(function(f){return bestanden.indexOf(f.replace(/\.js$/,".jsx"))===-1;}):[];
  over.forEach(function(f){console.log("Overbodig: gebouwd/"+f);fout++;});
  console.log(fout?"FOUT":"gebouwd/ klopt ("+bestanden.length+" bestanden)");
  process.exit(fout?1:0);
}else console.log("Gebouwd: "+bestanden.length+" bestanden in gebouwd/");
