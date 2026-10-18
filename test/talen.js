// Test van de talen: wisselen via Info → Weergave → Taal, vertaalde knoppen (en korte disciplinenamen in de balk),
// opmerkingen blijven intern Nederlands, en weer terug naar Nederlands. Overschrijft de opslag; alles.js zet testdata terug.
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
  kb("Nederlands").click();await w(300);
  uit.terug=data().taal==="nl"&&tekst().indexOf("Weergave")!==-1;
  k("Spelen").click();await w(200);
  uit.goed=uit.keuze&&uit.engelsBewaard&&uit.engels&&uit.labelNederlands&&uit.frans&&uit.duits&&uit.terug;
  return uit;
})()
