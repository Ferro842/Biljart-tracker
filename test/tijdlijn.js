// Test van de beurtengrafiek in Dash > Trend (draai op telefoonformaat, met test/testdata.json):
// nieuwe selectie slepen, rechterrand verlengen, linkerrand verkorten, midden verschuiven, ernaast
// slepen scrolt zonder de selectie te veranderen, tik met
// Selecteer uit wist de selectie, Beste springt mee bij een andere reekslengte.
// Draaien: await eval(await fetch("/test/tijdlijn.js").then(r=>r.text()))
(async function(){
  const w=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
  const k=function(t){return Array.from(document.querySelectorAll("button")).find(function(b){return b.textContent.trim().indexOf(t)===0;});};
  const svg=function(){return Array.from(document.querySelectorAll("svg")).find(function(s){return +s.getAttribute("width")>1000;});};
  const aantal=function(){
    const d=Array.from(document.querySelectorAll("div")).find(function(d){return d.children.length===0&&/^(Selectie: \d+ beurt|🏆 Je beste reeks van \d+)/.test(d.textContent);});
    if(!d)return 0;
    return +d.textContent.match(/(\d+) beurt/)[1];
  };
  const plek=function(){
    const d=Array.from(document.querySelectorAll("div")).find(function(d){return d.children.length===0&&/^p\d+ beurt \d+/.test(d.textContent);});
    return d?d.textContent:"";
  };
  async function sleep(x1,x2){
    const s=svg(),r=s.getBoundingClientRect(),y=r.top+80;
    const ev=function(t,x){s.dispatchEvent(new PointerEvent(t,{bubbles:true,clientX:x,clientY:y,pointerId:1,pointerType:"touch"}));};
    ev("pointerdown",x1);
    for(let i=1;i<=8;i++){ev("pointermove",x1+(x2-x1)*i/8);await w(15);}
    ev("pointerup",x2);await w(150);
  }
  const randen=function(){
    const rr=svg().querySelector("rect[stroke='#7fd8e0']"),r=svg().getBoundingClientRect(),x=+rr.getAttribute("x");
    return[r.left+x,r.left+x+ +rr.getAttribute("width")];
  };
  k("Libre").click();await w(150);
  k("Dash").click();await w(300);k("Trend").click();await w(200);
  const uit={};
  k("✋").click();await w(150);
  const L=svg().parentElement.getBoundingClientRect().left;
  await sleep(L+60,L+200);uit.nieuw=aantal();
  let rd=randen();await sleep(rd[1],rd[1]+70);uit.rechterRand=aantal();
  rd=randen();await sleep(rd[0],rd[0]+42);uit.linkerRand=aantal();
  const plekVoor=plek();
  rd=randen();await sleep((rd[0]+rd[1])/2,(rd[0]+rd[1])/2-56);uit.verschuiven=aantal();uit.verschoven=plek()!==plekVoor;
  // Naast de selectie slepen scrolt de grafiek, de selectie blijft gelijk
  rd=randen();const scrollVoor=svg().parentElement.scrollLeft,plekVoorScroll=plek();
  await sleep(rd[1]+40,rd[1]+140);
  uit.scrolltNaast=svg().parentElement.scrollLeft!==scrollVoor&&plek()===plekVoorScroll&&aantal()===uit.verschuiven;
  uit.handvatjes=svg().querySelectorAll("rect[fill='#7fd8e0']").length;
  k("✋").click();await w(150);svg().dispatchEvent(new MouseEvent("click",{bubbles:true}));await w(150);uit.naTik=aantal();
  k("🏆").click();await w(300);uit.beste25=aantal();
  k("50").click();await w(300);uit.beste50=aantal();
  k("10").click();await w(300);uit.beste10=aantal();
  k("25").click();await w(200);
  const goed=uit.nieuw>1&&uit.rechterRand>uit.nieuw&&uit.linkerRand<uit.rechterRand&&uit.verschuiven===uit.linkerRand&&uit.verschoven&&uit.scrolltNaast
    &&uit.handvatjes===2&&uit.naTik===0&&uit.beste25===25&&uit.beste50===50&&uit.beste10===10;
  return{goed:goed,details:uit};
})()
