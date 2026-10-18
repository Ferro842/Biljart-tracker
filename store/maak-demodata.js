// Maakt store/demodata.json: verzonnen voorbeeldpartijen voor de schermafbeeldingen in de App Store en Play Store
// (geen echte namen of notities). Vaste "toevalsgenerator", dus elke keer dezelfde uitkomst.
// Gebruik: node store/maak-demodata.js              -> demodata.json (libre, 2,30 en 2,10)
//          node store/maak-demodata.js driebanden   -> demodata-driebanden.json (driebanden, 2,84 en 2,55; voor Korea)
const fs=require("fs"),path=require("path");
global.document={documentElement:{classList:{contains:function(){return false;}}}};
const code=fs.readFileSync(path.join(__dirname,"..","js","constanten.js"),"utf8");
const {GEMIST,GOED}=(new Function(code+";return{GEMIST:GEMIST,GOED:GOED};"))();
const DRIEBANDEN=process.argv[2]==="driebanden";
let zaad=DRIEBANDEN?20261018:20260317;
const rnd=function(){zaad=(zaad*1103515245+12345)%2147483648;return zaad/2147483648;};
const kies=function(l){return l[Math.floor(rnd()*l.length)];};
const gemistL=GEMIST.map(function(o){return o.label;}).filter(function(l){return l!=="Acquit";});
const goedL=GOED.map(function(o){return o.label;}).filter(function(l){return l!=="Acquit";});
let id=1;const partijen=[];
const start=new Date(2026,2,3);
for(let w=0;w<32;w++){
  const dagen=rnd()<0.75?[2]:[2,5]; // dinsdag, soms ook vrijdag
  dagen.forEach(function(dd){
    if(rnd()<0.12)return; // weekje overgeslagen
    const d=new Date(start.getTime()+(w*7+dd-2)*86400000);d.setHours(19,30);
    if(d>new Date(2026,9,16))return;
    const tafel=DRIEBANDEN?(dd===5?"255":"284"):(dd===5?"210":"230");
    const n=DRIEBANDEN?35:tafel==="210"?25:30; // driebanden geen 40: die oude correctie zet partijen van 40 beurten van vóór 16 jul op de 2,10
    const niveau=1.55+w*0.022+(tafel==="210"?0.25:0)+(rnd()-0.5)*0.5; // langzaam beter
    // Driebanden: veel meer poedels en korte series (moyenne van ongeveer 0,55 naar 0,75)
    const pPoedel=DRIEBANDEN?Math.max(0.5,0.62-w*0.004+(tafel==="255"?-0.03:0)+(rnd()-0.5)*0.06):Math.max(0.18,0.42-w*0.006);
    const beurten=[];
    for(let i=0;i<n;i++){
      let c=0;
      if(DRIEBANDEN){if(rnd()>pPoedel){c=1;while(rnd()<0.36&&c<9)c++;}}
      else if(rnd()>pPoedel){c=1;const doorgaan=Math.min(0.86,0.42+niveau*0.13);while(rnd()<doorgaan&&c<22)c++;}
      const b={id:id++,caramboles:c,gemist:[],goed:[],tijd:new Date(d.getTime()+i*(DRIEBANDEN?120000:150000)).toISOString()};
      if(i===0){(c>0?b.goed:b.gemist).push("Acquit");}
      const groot=DRIEBANDEN?2:4,top=DRIEBANDEN?3:8;
      if(rnd()<0.6){b.gemist.push(kies(gemistL));if(c>=groot&&rnd()<0.7){b.goed.push(kies(goedL));if(c>=top)b.goed.push(kies(goedL));}}
      b.goed=Array.from(new Set(b.goed));
      beurten.push(b);
    }
    partijen.push({id:id++,datum:d.toISOString(),tafel:tafel,doel:n,doelType:"beurten",discipline:DRIEBANDEN?"driebanden":"libre",beurten:beurten});
  });
}
const data={
  huidigeId:id,partijen:partijen,
  seizoenen:[{id:1,naam:"Seizoen 1",startDatum:null,eindDatum:"2026-07-31T22:00:00.000Z"},{id:2,naam:"Seizoen 2",startDatum:"2026-07-31T22:00:00.000Z",eindDatum:null}],
  huidigeDiscipline:DRIEBANDEN?"driebanden":"libre",onboardingGezien:true,weergaveTipGezien:true,vormVenster:20,
  laatsteBackup:new Date(2026,9,16,22).toISOString(),laatsteBackupAantal:partijen.length,
  doelen:DRIEBANDEN?{driebanden:{waarde:0.8,datum:"2026-12-31",start:0.68,gehaald:false,gezet:"2026-09-01T12:00:00.000Z"}}
    :{libre:{waarde:2.4,datum:"2026-12-31",start:2.1,gehaald:false,gezet:"2026-09-01T12:00:00.000Z"}}
};
fs.writeFileSync(path.join(__dirname,DRIEBANDEN?"demodata-driebanden.json":"demodata.json"),JSON.stringify(data));
const tot=partijen.reduce(function(a,p){return a+p.beurten.reduce(function(s,b){return s+b.caramboles;},0);},0);
const nb=partijen.reduce(function(a,p){return a+p.beurten.length;},0);
console.log(partijen.length+" partijen, moyenne "+(tot/nb).toFixed(2)+", hoogste serie "+Math.max.apply(null,partijen.map(function(p){return Math.max.apply(null,p.beurten.map(function(b){return b.caramboles;}));})));
