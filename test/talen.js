// Test van de talen: wisselen via Info → Weergave → Taal, vertaalde knoppen (en korte disciplinenamen in de balk),
// opmerkingen blijven intern Nederlands, en weer terug naar Nederlands. Overschrijft de opslag; alles.js zet testdata terug.
// Ook Spaans, Turks, Koreaans, Japans, Vietnamees en Portugees.
// Draaien: await eval(await fetch("/test/talen.js").then(r=>r.text()))
(async function(){
  const w=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
  const k=function(tk){return Array.from(document.querySelectorAll("button")).find(function(b){return b.textContent.trim()===tk;});};
  const kb=function(tk){return Array.from(document.querySelectorAll("button")).find(function(b){return b.textContent.trim().indexOf(tk)!==-1;});};
  const data=function(){return JSON.parse(localStorage.getItem("biljart-tracker-v2"));};
  const tekst=function(){return document.getElementById("root").textContent;};
  const uit={};
  k("Info").click();await w(250);
  uit.keuze=document.querySelectorAll("[data-taalkeuze] button").length===TALEN.length;
  kb("English").click();await w(300);
  uit.engelsBewaard=data().taal==="en";
  k("Play").click();await w(250);
  uit.engels=!!k("Start game")&&tekst().indexOf("Table size")!==-1&&!!k("Straight");
  // Opmerking aanvinken in het Engels: opgeslagen als Nederlands label
  k("Start game").click();await w(200);k("+").click();await w(50);k("Record").click();await w(250);
  kb("Kiss").click();await w(100);k("Next step").click();await w(200);k("Save inning").click();await w(300);
  const lp=(data().lopendePartij||{beurten:[]}).beurten;
  uit.labelNederlands=lp.length>0&&(lp[lp.length-1].gemist||[]).indexOf("Klos")!==-1;
  k("back").click();await w(200);k("back").click();await w(250);
  // Frans en Duits: korte Engelse namen lekken niet door
  k("Info").click();await w(250);kb("Français").click();await w(300);
  uit.frans=!!k("Libre")&&!k("Straight")&&tekst().indexOf("Affichage")!==-1;
  kb("Deutsch").click();await w(300);
  uit.duits=!!k("Freie Partie")&&tekst().indexOf("Anzeige")!==-1;
  // Spaans en Turks (Turks: procentteken vóór het getal)
  kb("Español").click();await w(300);
  uit.spaans=!!k("3 bandas")&&tekst().indexOf("Vista")!==-1&&t("Gemist door")==="Fallada por";
  kb("Türkçe").click();await w(300);
  uit.turks=!!k("Serbest")&&tekst().indexOf("Görünüm")!==-1&&procentTekst(0.43)==="%43";
  // Koreaans: vierbal (4구) staat standaard in de balk, decimale punt
  kb("한국어").click();await w(300);
  const segKo=Array.from(document.querySelectorAll("#root button.seg-knop")).map(function(b){return b.textContent.trim();});
  uit.koreaans=segKo.indexOf("4구")!==-1&&getalTekst(2.5,2)==="2.50"&&tekst().indexOf("화면")!==-1;
  // Japans: ook vierbal (四つ球) in de balk, decimale punt; Vietnamees en Portugees: decimale komma
  kb("日本語").click();await w(300);
  const segJa=Array.from(document.querySelectorAll("#root button.seg-knop")).map(function(b){return b.textContent.trim();});
  uit.japans=segJa.indexOf("四つ球")!==-1&&getalTekst(2.5,2)==="2.50"&&tekst().indexOf("表示")!==-1;
  kb("Tiếng Việt").click();await w(300);
  uit.vietnamees=!!k("3 băng")&&tekst().indexOf("Hiển thị")!==-1&&getalTekst(2.5,2)==="2,50"&&segJa.length>0&&
    Array.from(document.querySelectorAll("#root button.seg-knop")).every(function(b){return b.textContent.trim()!=="4 bi";});
  kb("Português").click();await w(300);
  uit.portugees=!!k("3 tabelas")&&tekst().indexOf("Exibição")!==-1&&t("Gemist door")==="Errou por";
  kb("Nederlands").click();await w(300);
  uit.turks=uit.turks&&procentTekst(0.43)==="43%";
  uit.koreaans=uit.koreaans&&Array.from(document.querySelectorAll("#root button.seg-knop")).every(function(b){return b.textContent.trim()!=="Vierbal";});
  uit.terug=data().taal==="nl"&&tekst().indexOf("Weergave")!==-1;
  k("Spelen").click();await w(200);
  uit.goed=uit.keuze&&uit.engelsBewaard&&uit.engels&&uit.labelNederlands&&uit.frans&&uit.duits&&uit.spaans&&uit.turks&&uit.koreaans&&uit.japans&&uit.vietnamees&&uit.portugees&&uit.terug;
  return uit;
})()
