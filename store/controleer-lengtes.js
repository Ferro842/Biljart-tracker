// Controleert de maximale lengtes van de winkelteksten per taal in store/talen.md (Apple/Google-limieten).
// Gebruik: node store/controleer-lengtes.js
const fs=require("fs"),path=require("path");
const md=fs.readFileSync(path.join(__dirname,"talen.md"),"utf8");
const delen=md.split(/^## /m).filter(function(d){return/^(Engels|Frans|Duits|Spaans|Turks|Koreaans|Japans|Vietnamees|Portugees)/.test(d);});
let fout=false;
const meld=function(taal,veld,tekst,max){
  const n=[...tekst].length,ok=n<=max;if(!ok)fout=true;
  console.log((ok?"OK  ":"TE LANG ")+taal+" · "+veld+": "+n+"/"+max);
};
delen.forEach(function(d){
  const taal=d.split("\n")[0].trim();
  const rij=function(naam){const m=new RegExp("\\| "+naam.replace(/[()]/g,"\\$&")+" \\| (.*) \\|").exec(d);return m?m[1]:"";};
  meld(taal,"Ondertitel",rij("Ondertitel (30)"),30);
  meld(taal,"Play korte beschrijving",rij("Play: korte beschrijving (80)"),80);
  const blok=function(kop){const i=d.indexOf("**"+kop);const rest=d.slice(i).split("\n").slice(1);const regels=[];
    for(const r of rest){if(r.startsWith(">"))regels.push(r.replace(/^> ?/,""));else if(regels.length&&r.trim()==="")break;}
    return regels.join("\n").trim();};
  meld(taal,"Promotietekst",blok("Promotietekst"),170);
  meld(taal,"Beschrijving",blok("Beschrijving"),4000);
  const kw=/```\n([^`]*)\n```/.exec(d);meld(taal,"Trefwoorden",kw?kw[1]:"",100);
});
if(fout)process.exitCode=1;

// store/aso.md: naam, ondertitel, Play-titel, korte beschrijving en trefwoorden per taal, plus dubbele woorden
// (woorden uit naam/ondertitel nog eens in de trefwoorden levert bij Apple niets op)
(function(){
  const aso=fs.readFileSync(path.join(__dirname,"aso.md"),"utf8");
  let asoFout=false;
  aso.split(/^## /m).filter(function(d){return/^(Nederlands|Engels|Frans|Duits|Spaans|Turks|Koreaans|Japans|Vietnamees|Portugees)/.test(d);}).forEach(function(d){
    const taal=d.split("\n")[0].trim();
    const rij=function(naam){const m=new RegExp("\\| "+naam.replace(/[()]/g,"\\$&")+" \\| (.*) \\|").exec(d);return m?m[1]:null;};
    const tel=function(veld,tekst,max){if(tekst===null)return;const n=[...tekst].length;if(n>max)asoFout=true;console.log((n<=max?"OK  ":"TE LANG ")+"aso "+taal+" · "+veld+": "+n+"/"+max);};
    tel("Naam",rij("Naam (30)"),30);tel("Ondertitel",rij("Ondertitel (30)"),30);
    tel("Play titel",rij("Play: titel (30)"),30);tel("Play kort",rij("Play: korte beschrijving (80)"),80);
    const kw=/```\n([^`]*)\n```/.exec(d);
    if(kw){
      tel("Trefwoorden",kw[1],100);
      if(/, /.test(kw[1])){asoFout=true;console.log("FOUT aso "+taal+": spatie na komma in trefwoorden");}
      const woorden=((rij("Naam (30)")||"")+" "+(rij("Ondertitel (30)")||"")).toLowerCase().split(/[\s:·,&]+/).filter(Boolean);
      const dubbel=kw[1].toLowerCase().split(",").filter(function(w){return woorden.indexOf(w)!==-1;});
      const zelf=kw[1].toLowerCase().split(",").filter(function(w,i,a){return a.indexOf(w)!==i;});
      if(dubbel.length||zelf.length){asoFout=true;console.log("DUBBEL aso "+taal+": "+dubbel.concat(zelf).join(", "));}
    }
  });
  if(asoFout)process.exitCode=1;
})();
