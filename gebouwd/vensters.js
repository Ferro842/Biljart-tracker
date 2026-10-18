// Gebouwd uit jsx/vensters.jsx door bouw-jsx.js; niet zelf aanpassen.
function PartijSamenvatting({ partij, st, prestatie, infoNa, nieuweDrop, niveauOmhoog, discipline, onClose }) {
  const spel = useContext(SpelContext);
  const punten = prestatie ? prestatie.punten : 0;
  const dec = discipline === "driebanden" ? 3 : 2;
  return /* @__PURE__ */ React.createElement("div", { onClick: onClose, style: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.75)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, cursor: "pointer" } }, /* @__PURE__ */ React.createElement("div", { onClick: function(e) {
    e.stopPropagation();
  }, style: { background: "linear-gradient(160deg,var(--c-1e3a1e),var(--c-0d1f0d))", border: "2px solid " + GOUD, borderRadius: 18, padding: "18px 16px", maxWidth: 380, width: "100%", maxHeight: "calc(85vh / var(--zoom,1))", overflowY: "auto", boxShadow: "0 10px 40px rgba(0,0,0,0.6)" } }, niveauOmhoog && /* @__PURE__ */ React.createElement("div", { style: { background: "linear-gradient(160deg,var(--c-2a4a1e),var(--c-0d1f0d))", border: "2px solid " + niveauOmhoog.naar.kleur, borderRadius: 14, padding: "16px 12px", marginBottom: 14, textAlign: "center", animation: "badgePopIn 0.5s cubic-bezier(0.34,1.56,0.64,1)", boxShadow: "0 0 30px " + niveauOmhoog.naar.kleur + "66" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: WITD, marginBottom: 8 } }, "🎉 ", t("Niveau omhoog!")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "center", gap: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", opacity: 0.6 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 24 } }, niveauOmhoog.van.emoji), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: WITD } }, niveauOmhoog.van.naam)), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 18, color: niveauOmhoog.naar.kleur } }, "→"), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { width: 48, height: 48, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%," + niveauOmhoog.naar.kleur + "ee," + niveauOmhoog.naar.kleur + "55)", border: "2px solid " + niveauOmhoog.naar.kleur, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 4px", boxShadow: "0 0 16px " + niveauOmhoog.naar.kleur + "aa" } }, niveauOmhoog.naar.emoji), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, fontWeight: "bold", color: niveauOmhoog.naar.kleur } }, niveauOmhoog.naar.naam)))), spel && nieuweDrop && /* @__PURE__ */ React.createElement("div", { style: { background: "linear-gradient(135deg," + GOUD + "," + GOUDL + ")", borderRadius: 14, padding: "14px", marginBottom: 14, textAlign: "center", animation: "badgePopIn 0.5s cubic-bezier(0.34,1.56,0.64,1)", boxShadow: "0 0 30px " + GOUD + "aa" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 28 } }, "🎉🥇🎉"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, fontWeight: "bold", color: G, marginTop: 4 } }, t("Slechtste-partij-drop ontgrendeld!")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: G, marginTop: 4 } }, t("p{n} (gem {g}) is geschrapt uit je gemiddelde", { n: nieuweDrop.nr, g: nieuweDrop.gem.toFixed(dec) }))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, fontWeight: "bold", color: GOUD, marginBottom: 4, textAlign: "center" } }, t("Partij afgesloten")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: WITD, textAlign: "center", marginBottom: 14 } }, new Date(partij.datum).toLocaleDateString(taalLocale(), { weekday: "long", day: "numeric", month: "long" })), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { background: "rgba(0,0,0,0.2)", borderRadius: 8, padding: "8px 4px", textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 18, fontWeight: "bold", color: GOUD } }, st.totCar), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: WITD } }, t("caramboles"))), /* @__PURE__ */ React.createElement("div", { style: { background: "rgba(0,0,0,0.2)", borderRadius: 8, padding: "8px 4px", textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 18, fontWeight: "bold", color: GOUD } }, st.gemPerBeurt), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: WITD } }, t("gemiddelde"))), /* @__PURE__ */ React.createElement("div", { style: { background: "rgba(0,0,0,0.2)", borderRadius: 8, padding: "8px 4px", textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 18, fontWeight: "bold", color: GOUD } }, st.max), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: WITD } }, t("hoogste beurt")))), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", fontSize: 13, color: WITD, marginBottom: 14 } }, t("{b} beurten · {p}x poedel", { b: st.aantalBeurten, p: st.poedels }), strafTotaal(partij) > 0 && /* @__PURE__ */ React.createElement("span", { style: { color: ROOD } }, " · ", t("{n}x straf", { n: strafTotaal(partij) })), spel && /* @__PURE__ */ React.createElement(React.Fragment, null, " · ", /* @__PURE__ */ React.createElement("span", { style: { color: GOUD, fontWeight: "bold" } }, t("{n}pt aan badges", { n: punten })))), infoNa && /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 14, background: "rgba(0,0,0,0.2)", borderRadius: 10, padding: "10px 12px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: WITD } }, "📊 ", t("Je vorm nu")), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 15, fontWeight: "bold", color: GOUD } }, infoNa.effectiefGemiddelde.toFixed(dec))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: WITD, marginTop: -3, marginBottom: 6 } }, vormUitleg(infoNa, dec)), spel && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: WITD } }, "🎖️ ", infoNa.venster ? t("Punten in je laatste {n} partijen", { n: infoNa.aantalPartijen }) : t("Badge-punten")), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, fontWeight: "bold", color: GOUD } }, infoNa.badgePunten, " / ", infoNa.aantalDrops * PUNTEN_PER_DROP + PUNTEN_PER_DROP, "pt")), /* @__PURE__ */ React.createElement(DashBalk, { pct: infoNa.badgePunten % PUNTEN_PER_DROP / PUNTEN_PER_DROP * 100, kleur: GOUD, hoogte: 5 }), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", marginTop: 6, fontSize: 11, color: WITD, opacity: 0.8 } }, infoNa.plafondBereikt ? t("Maximum bereikt: nooit meer dan 1 op de 10 partijen geschrapt") : t("Nog {n}pt tot je volgende slechtste-partij-drop", { n: infoNa.puntenTotVolgendeDrop })))), spel && /* @__PURE__ */ React.createElement(PrestatieOverzicht, { prestatie }), /* @__PURE__ */ React.createElement("div", { onClick: function(e) {
    e.stopPropagation();
  }, style: { display: "flex", justifyContent: "center", marginTop: 14 } }, /* @__PURE__ */ React.createElement(DeelKaartKnop, { partij, discipline, niveauNaam: infoNa ? bepaalNiveau(infoNa.effectiefGemiddelde, discipline).huidig.naam : null, stijl: { padding: "11px 18px", fontSize: 15 } })), /* @__PURE__ */ React.createElement("div", { onClick: onClose, style: { textAlign: "center", marginTop: 16, fontSize: 13, color: WITD, opacity: 0.7, cursor: "pointer", padding: "6px 0" } }, t("Tik om te sluiten"))));
}
function WelkomstFlow({ stap, setStap, discipline, wisselDiscipline, onKlaar, tekstgrootte, eenvoudig, setWeergave }) {
  const schermen = [
    {
      titel: t("Welkom! Hoe wil je het zien?"),
      body: t("Kies de tekstgrootte die prettig leest; je ziet het meteen. Eenvoudige modus houdt alleen het belangrijkste over: per beurt je caramboles en Noteer. Standaard staat alles aan. Je kunt dit later altijd wijzigen bij Info → Weergave."),
      weergave: true
    },
    {
      titel: t("Zet de app op je beginscherm"),
      body: t("Voor het beste gebruik installeer je de app als een normale app-icoon op je beginscherm — dat opent sneller dan steeds de link opzoeken, en voelt als een echte app. Na de eerste keer opent de app ook zonder internet."),
      installeer: true,
      alleenWeb: true
    },
    {
      titel: t("Welkom bij Carom Tracker"),
      body: t("Een app om je carambole-partijen bij te houden — met niveaus op basis van de echte KNBB-klassen, en een spelelement dat je motiveert om net dat beetje boven je eigen niveau uit te blijven presteren.")
    },
    {
      titel: t("Kies je discipline"),
      body: t("Libre, Driebanden, Bandstoten en Kader (35/2, 38/2, 47/1, 47/2, 52/2, 57/2 en 71/2) zijn losse trajecten — elk met een eigen gemiddelde en niveau, helemaal gescheiden van elkaar. Je kunt in de app altijd van discipline wisselen."),
      kies: true
    },
    {
      titel: t("Een partij invoeren"),
      body: t("Zo noteer je een partij, beurt voor beurt:"),
      lijst: [
        [t("Start"), t("Kies tafelmaat en doel en tik op Start partij.")],
        [t("Per beurt"), t("Vul je caramboles in en tik op Noteer. Kies daarna waardoor de serie eindigde, en bij caramboles ook wat goed ging.")],
        [t("Klaar"), t("Tik rechtsboven op Afsluiten en dan op Opslaan.")]
      ],
      alleenApp: true
    },
    {
      titel: t("De tabbladen"),
      body: t("Alles wat je invoert wordt direct automatisch op dit toestel bewaard. Via de tabbladen bovenin bekijk je het:"),
      lijst: [
        [t("Stats"), t("Je niveau, elke partij met badges en je seizoenen.")],
        [t("Dash"), t("Grafieken van trend, consistentie, patronen, vergelijking en punten.")],
        [t("Log"), t("Al je partijen beurt voor beurt terugkijken, met notities.")],
        [t("Info"), t("Uitleg, weergave en instellingen, AI-analyse, en Exporteer/Importeer data voor een extra kopie of om over te zetten.")]
      ],
      alleenApp: true
    },
    {
      titel: t("Hoe niveau werkt"),
      body: t("Je niveau volgt je vorm: het gemiddelde van je laatste partijen (standaard 20; ook 10, 30 of alle, in te stellen bij je klasse rechtsboven), met de officiële KNBB-klassegrenzen. Je moyenne over al je partijen zie je ernaast. Speel je goed, dan verdien je badges — genoeg badge-punten en je slechtste partij telt niet mee voor je vorm (hoogstens 1 op de 10).")
    },
    {
      titel: t("Klaar om te beginnen!"),
      body: t("Dat is het zo'n beetje — de rest ontdek je vanzelf tijdens het spelen. Kom je er niet uit? Onder Start partij staat altijd ℹ️ Zo werkt de app. Veel plezier!")
    }
  ].filter(function(s2) {
    return IS_NATIVE ? !s2.alleenWeb : !s2.alleenApp;
  });
  const s = schermen[stap];
  const laatste = stap === schermen.length - 1;
  const kaderActief = KADER_VARIANTEN.indexOf(discipline) !== -1;
  const [kaderOpen, setKaderOpen] = useState(kaderActief);
  return /* @__PURE__ */ React.createElement("div", { style: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.85)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 } }, /* @__PURE__ */ React.createElement("div", { style: { background: "linear-gradient(160deg,var(--c-1e3a1e),var(--c-0d1f0d))", border: "2px solid " + GOUD, borderRadius: 18, padding: "22px 20px", maxWidth: 380, width: "100%", boxShadow: "0 10px 40px rgba(0,0,0,0.6)" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "center", gap: 6, marginBottom: 16 } }, schermen.map(function(_, i) {
    return /* @__PURE__ */ React.createElement("div", { key: i, style: { width: i === stap ? 18 : 7, height: 7, borderRadius: 4, background: i === stap ? GOUD : KBDR, transition: "all 0.25s" } });
  })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 19, fontWeight: "bold", color: GOUD, textAlign: "center", marginBottom: 10 } }, s.titel), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, color: WITD, textAlign: "center", lineHeight: 1.5, marginBottom: 16 } }, s.body), s.kies && /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 16 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 } }, hoofdDisciplines(null, discipline).map(function(d) {
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: d,
        onClick: function() {
          wisselDiscipline(d);
          setKaderOpen(false);
        },
        style: { padding: "9px 4px", background: discipline === d ? "var(--c-2d4a1e)" : "none", border: "1px solid " + (discipline === d ? GOUD : KBDR), borderRadius: 8, color: discipline === d ? GOUD : WITD, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }
      },
      DISCIPLINES[d].naam
    );
  }), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: function() {
        if (!kaderActief) {
          wisselDiscipline("kader38");
          setKaderOpen(true);
        } else setKaderOpen(function(v) {
          return !v;
        });
      },
      style: { padding: "9px 4px", background: kaderActief ? "var(--c-2d4a1e)" : "none", border: "1px solid " + (kaderActief || kaderOpen ? GOUD : KBDR), borderRadius: 8, color: kaderActief ? GOUD : WITD, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }
    },
    kaderActief ? DISCIPLINES[discipline].naam : t("Kader"),
    " ",
    kaderOpen ? "▴" : "▾"
  )), kaderOpen && /* @__PURE__ */ React.createElement("div", { "data-welkom-kader": "", style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6, marginTop: 6 } }, KADER_VARIANTEN.map(function(k) {
    const actief = discipline === k;
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: k,
        onClick: function() {
          wisselDiscipline(k);
        },
        style: { padding: "8px 2px", background: actief ? "var(--c-2d4a1e)" : "none", border: "1px solid " + (actief ? GOUD : KBDR), borderRadius: 8, color: actief ? GOUD : WITD, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }
      },
      DISCIPLINES[k].naam.replace(/^\D+/, "")
    );
  }))), s.weergave && /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 16 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: WIT, marginBottom: 6 } }, t("Taal"), TAAL !== "en" ? " · Language" : ""), /* @__PURE__ */ React.createElement("div", { "data-taalkeuze": "", style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 12 } }, TALEN.map(function(x) {
    const actief = TAAL === x.code;
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: x.code,
        onClick: function() {
          setWeergave("taal", x.code);
        },
        style: { padding: "9px 2px", background: actief ? "var(--c-2d4a1e)" : "none", border: "1px solid " + (actief ? GOUD : KBDR), borderRadius: 8, color: actief ? GOUD : WITD, fontSize: 13, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }
      },
      x.vlag,
      " ",
      x.naam
    );
  })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: WIT, marginBottom: 6 } }, t("Tekstgrootte")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, marginBottom: 12 } }, TEKSTGROOTTES.map(function(x) {
    const actief = tekstgrootte === x[0];
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: x[0],
        onClick: function() {
          setWeergave("tekstgrootte", x[0]);
        },
        style: { flex: 1, padding: "10px 2px", background: actief ? "var(--c-2d4a1e)" : "none", border: "1px solid " + (actief ? GOUD : KBDR), borderRadius: 8, color: actief ? GOUD : WITD, fontSize: 12 + (x[2] - 1) * 20, cursor: "pointer", fontFamily: "inherit" }
      },
      t(x[1])
    );
  })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: WIT, marginBottom: 6 } }, t("Eenvoudige modus")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6 } }, [[false, t("Alles laten zien")], [true, t("Eenvoudig")]].map(function(x) {
    const actief = eenvoudig === x[0];
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: x[1],
        onClick: function() {
          setWeergave("eenvoudig", x[0]);
        },
        style: { flex: 1, padding: "10px 2px", background: actief ? "var(--c-2d4a1e)" : "none", border: "1px solid " + (actief ? GOUD : KBDR), borderRadius: 8, color: actief ? GOUD : WITD, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }
      },
      x[1]
    );
  }))), s.lijst && /* @__PURE__ */ React.createElement("div", { style: { background: "rgba(0,0,0,0.2)", borderRadius: 10, padding: "12px 12px", marginBottom: 16, fontSize: 13, color: WITD, lineHeight: 1.5 } }, s.lijst.map(function(r, i) {
    return /* @__PURE__ */ React.createElement("div", { key: r[0], style: { marginBottom: i < s.lijst.length - 1 ? 8 : 0 } }, /* @__PURE__ */ React.createElement("span", { style: { color: GOUD, fontWeight: "bold" } }, r[0]), " — ", r[1]);
  })), s.installeer && /* @__PURE__ */ React.createElement("div", { style: { background: "rgba(0,0,0,0.2)", borderRadius: 10, padding: "12px 12px", marginBottom: 16, fontSize: 13, color: WITD, lineHeight: 1.6 } }, /* @__PURE__ */ React.createElement("div", { style: { color: GOUD, fontWeight: "bold", marginBottom: 4 } }, "📱 iPhone/iPad (Safari)"), /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 10 } }, t('Tik rechtsonderin op •••  (of het deel-icoontje) → "Deel" → eventueel "Toon meer" → "Zet op beginscherm" → "Voeg toe"')), /* @__PURE__ */ React.createElement("div", { style: { color: GOUD, fontWeight: "bold", marginBottom: 4 } }, "🤖 Android (Chrome)"), /* @__PURE__ */ React.createElement("div", null, t('Menu (⋮) rechtsboven → "App installeren" (verschijnt soms ook automatisch als balkje onderin)'))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, !laatste && /* @__PURE__ */ React.createElement("button", { onClick: onKlaar, style: { padding: "12px 10px", background: "none", border: "none", color: WITD, fontSize: 13, cursor: "pointer", fontFamily: "inherit", opacity: 0.7 } }, t("Overslaan")), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "plusmin-btn",
      onClick: function() {
        laatste ? onKlaar() : setStap(function(n) {
          return n + 1;
        });
      },
      style: { flex: 1, padding: 13, background: "linear-gradient(135deg," + GOUD + "," + GOUDL + ")", border: "none", borderRadius: 12, color: G, fontSize: 15, fontWeight: "bold", cursor: "pointer", fontFamily: "inherit" }
    },
    laatste ? t("Eerste partij starten") : t("Volgende")
  ))));
}
function UitlegVenster({ eenvoudig, onClose }) {
  const blokken = [
    ["logo", t("Een partij spelen"), [
      t("Kies de tafel en het doel (aantal beurten of caramboles) en tik op Start partij."),
      t("Per beurt: zet je caramboles met + en − (of typ ze) en tik op Noteer."),
      t("Vergist? Tik op terug; de laatste beurt wordt weggehaald."),
      t("Tijdens een partij zie je bovenin alleen een smalle balk, zodat alles goed in beeld past. Via ☰ Menu kom je bij de andere tabbladen; je partij blijft gewoon staan."),
      t("Klaar: tik rechtsboven op Afsluiten en dan op Opslaan. Stop je tussendoor, dan onthoudt de app de partij."),
      t("Op papier gespeeld? Tik op 📷 Partij van een wedstrijdbriefje: je eigen AI-chat leest de foto, jij controleert de beurten en slaat op.")
    ]],
    ["✍️", t("Opmerkingen (mag, hoeft niet)"), [
      t("Na Noteer kun je aanvinken waardoor je serie eindigde en wat er goed ging."),
      eenvoudig ? t("Je staat in de eenvoudige modus: die stap wordt overgeslagen. Wil je bij een beurt toch iets aanvinken, tik dan op + opmerking in plaats van Noteer.") : t("In de eenvoudige modus wordt die stap overgeslagen; daar tik je + opmerking als je bij een beurt toch iets wilt aanvinken."),
      t("Je hoeft niet altijd opmerkingen te zetten. Een partij telt als bijgehouden als ongeveer een kwart van de beurten een opmerking heeft. Alleen die partijen gebruikt Dash → Inzicht voor je technieken; hoe vaker je het doet, hoe meer de app je kan vertellen.")
    ]],
    ["📊", t("Waar vind je wat"), [
      t("Spelen: een partij invoeren."),
      t("Stats: je niveau, je seizoenen en al je partijen."),
      t("Dash: Inzicht (wat je data zegt, je hoogste series, je poedels) en grafieken."),
      t("Log: elke partij beurt voor beurt terugkijken."),
      t("Info: deze uitleg, weergave (grotere letters, eenvoudige modus), instellingen en je back-up.")
    ]],
    ["🏅", t("Je niveau"), [
      t("Je vorm is het gemiddelde van je laatste 20 partijen (of 10, 30 of alle: tik op je klasse rechtsboven); daarop is je klasse gebaseerd (KNBB-grenzen)."),
      t("Je moyenne is het gemiddelde van al je partijen, zoals officieel.")
    ]],
    ["✨", t("Extra"), [
      t("📤 Deel als kaart: na het opslaan van een partij (en bij elke partij in Stats en Log) maak je er een mooie afbeelding van voor WhatsApp of de mail."),
      t("🎬 Je seizoen in beeld: Stats → Seizoen → Bekijk je seizoen (ook in het Archief). Tik rechts voor verder, links terug."),
      t("📅 Kalender: Dash → Kalender laat per dag zien wanneer je speelde, gekleurd naar je gemiddelde."),
      t("🎯 Doel: tik op je klasse rechtsboven → Stel een doel. Daar laat een ring zien hoe ver je bent, en kies je ook op hoeveel partijen je vorm gebaseerd is."),
      t("🎉 Bij een topserie, record, hogere klasse of gehaald doel volgt een korte viering. Uitzetten kan bij Info → Weergave."),
      t("🔴 Vierbal (Korea, Japan): aanzetten bij Info → Weergave. Met −1 strafpunt noteer je dat je speelbal die van je tegenstander raakte; dat gaat van je partijscore af, niet van je gemiddelde.")
    ]],
    ["🔎", t("Weergave"), [
      t("Info → Weergave: kies Normaal, Groot of Extra groot voor grotere letters en knoppen."),
      t("Eenvoudige modus: alleen caramboles en Noteer, en in Dash alleen het belangrijkste."),
      t("Spelelement (badges en punten) zet je los aan of uit, ook in de eenvoudige modus.")
    ]],
    ["💾", t("Je gegevens"), [
      t("Alles staat alleen op dit toestel. Maak af en toe een back-up: Info → Exporteer, en bewaar die bijvoorbeeld in iCloud Drive of je mail. De app herinnert je eraan na 10 nieuwe partijen of een maand."),
      t("Nieuw toestel of opnieuw installeren? Info → Importeer zet de back-up terug.")
    ]]
  ];
  return /* @__PURE__ */ React.createElement("div", { onClick: onClose, style: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.85)", zIndex: 300, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "20px 14px", overflowY: "auto" } }, /* @__PURE__ */ React.createElement("div", { onClick: function(e) {
    e.stopPropagation();
  }, style: { background: "linear-gradient(160deg,var(--c-1e3a1e),var(--c-0d1f0d))", border: "2px solid " + GOUD, borderRadius: 16, padding: "18px 16px", maxWidth: 420, width: "100%" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 20, fontWeight: "bold", color: GOUD } }, "ℹ️ ", t("Zo werkt de app")), /* @__PURE__ */ React.createElement("button", { onClick: onClose, style: { background: "none", border: "1px solid " + KBDR, borderRadius: 8, color: WIT, fontSize: 16, padding: "4px 12px", cursor: "pointer", fontFamily: "inherit" } }, "✕")), blokken.map(function(b) {
    return /* @__PURE__ */ React.createElement("div", { key: b[1], style: { background: "rgba(0,0,0,0.2)", borderRadius: 10, padding: "10px 12px", marginBottom: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 16, color: GOUD, fontWeight: "bold", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 } }, b[0] === "logo" ? /* @__PURE__ */ React.createElement(Logo, { maat: 20 }) : /* @__PURE__ */ React.createElement("span", null, b[0]), /* @__PURE__ */ React.createElement("span", null, b[1])), b[2].map(function(r, i) {
      return /* @__PURE__ */ React.createElement("div", { key: i, style: { fontSize: 15, color: WIT, lineHeight: 1.5, marginBottom: i < b[2].length - 1 ? 6 : 0, paddingLeft: 12, position: "relative" } }, /* @__PURE__ */ React.createElement("span", { style: { position: "absolute", left: 0, color: GOUD } }, "•"), r);
    }));
  }), /* @__PURE__ */ React.createElement("button", { className: "plusmin-btn", onClick: onClose, style: { width: "100%", padding: 13, background: "linear-gradient(135deg," + GOUD + "," + GOUDL + ")", border: "none", borderRadius: 12, color: G, fontSize: 16, fontWeight: "bold", cursor: "pointer", fontFamily: "inherit" } }, t("Sluiten"))));
}
function BriefjeImport({ discipline, tafelStandaard, onOpslaan, onClose }) {
  const [stap, setStap] = useState("plakken");
  const [tekst, setTekst] = useState("");
  const [fout, setFout] = useState("");
  const [gekopieerd, setGekopieerd] = useState(false);
  const [gelezen, setGelezen] = useState(null);
  const [spelerIdx, setSpelerIdx] = useState(0);
  const [beurten, setBeurten] = useState([]);
  const [acquit, setAcquit] = useState("eerste");
  const [openBeurt, setOpenBeurt] = useState(null);
  const [aangevuld, setAangevuld] = useState(0);
  const vandaag = /* @__PURE__ */ new Date();
  const tweeCijfers = function(n) {
    return ("0" + n).slice(-2);
  };
  const [datum, setDatum] = useState(vandaag.getFullYear() + "-" + tweeCijfers(vandaag.getMonth() + 1) + "-" + tweeCijfers(vandaag.getDate()));
  const [tafel, setTafel] = useState(tafelStandaard || "230");
  const [doel, setDoel] = useState("");
  function kopieerVraag() {
    const klaar = function() {
      setGekopieerd(true);
      setTimeout(function() {
        setGekopieerd(false);
      }, 2500);
    };
    const oud = function() {
      const el = document.createElement("textarea");
      el.value = t(BRIEFJE_PROMPT);
      el.setAttribute("readonly", "");
      el.style.position = "absolute";
      el.style.left = "-9999px";
      document.body.appendChild(el);
      el.select();
      try {
        document.execCommand("copy");
      } catch (e) {
      }
      document.body.removeChild(el);
      klaar();
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t(BRIEFJE_PROMPT)).then(klaar).catch(oud);
    else oud();
  }
  function kiesSpeler(r, i) {
    const s = r.spelers[i];
    setSpelerIdx(i);
    setOpenBeurt(null);
    setAcquit(i === 0 ? "eerste" : "laatste");
    const meeste = Math.max.apply(null, r.spelers.map(function(x) {
      return x.beurten.length;
    }).concat([r.aantalBeurten || 0]));
    const eigen = s.beurten.map(function(b) {
      return { nr: b.nr, car: b.car, totaal: b.totaal, gemist: [], goed: [] };
    });
    const laatsteTotaal = eigen.reduce(function(t2, b) {
      return b.totaal !== null ? b.totaal : t2;
    }, null);
    for (let n = eigen.length + 1; n <= meeste; n++) eigen.push({ nr: n, car: 0, totaal: laatsteTotaal, gemist: [], goed: [], aangevuld: true });
    setAangevuld(meeste - s.beurten.length);
    setBeurten(eigen);
    setDoel(s.teMaken ? String(s.teMaken) : "");
  }
  function inlezen() {
    const r = leesBriefje(tekst);
    if (!r) {
      setFout(t('Ik kan hier geen beurten in vinden. Plak het hele antwoord van je AI-chat, met de regels "SPELER:" en "1: … / …".'));
      return;
    }
    setFout("");
    setGelezen(r);
    kiesSpeler(r, 0);
    if (r.datum && r.datum.jaar > 2e3) setDatum(r.datum.jaar + "-" + tweeCijfers(r.datum.maand) + "-" + tweeCijfers(r.datum.dag));
    setStap("controle");
  }
  const zetAantal = function(n) {
    if (n < 1) return;
    if (n < beurten.length) {
      setBeurten(beurten.slice(0, n));
      return;
    }
    const extra = [];
    const laatste = beurten.reduce(function(t2, b) {
      return b.totaal !== null ? b.totaal : t2;
    }, null);
    for (let i = beurten.length + 1; i <= n; i++) extra.push({ nr: i, car: 0, totaal: laatste, gemist: [], goed: [] });
    setBeurten(beurten.concat(extra));
  };
  const zetCar = function(i, v) {
    setBeurten(beurten.map(function(b, j) {
      return j === i ? Object.assign({}, b, { car: Math.max(0, v) }) : b;
    }));
  };
  const acquitIdx = acquit === "eerste" ? 0 : acquit === "laatste" ? beurten.length - 1 : -1;
  const metAcquit = beurten.map(function(b, i) {
    const gemist = (b.gemist || []).filter(function(l) {
      return l !== "Acquit";
    }), goed = (b.goed || []).filter(function(l) {
      return l !== "Acquit";
    });
    if (i === acquitIdx) {
      if (b.car > 0) goed.unshift("Acquit");
      else gemist.unshift("Acquit");
    }
    return Object.assign({}, b, { gemist, goed: b.car > 0 ? goed : [] });
  });
  const wisselOpm = function(i, sleutel) {
    const veld = sleutel.indexOf("G__") === 0 ? "gemist" : "goed", label = sleutel.slice(3);
    setBeurten(beurten.map(function(b, j) {
      if (j !== i) return b;
      const lijst = b[veld] || [];
      return Object.assign({}, b, { [veld]: lijst.indexOf(label) !== -1 ? lijst.filter(function(l) {
        return l !== label;
      }) : lijst.concat([label]) });
    }));
  };
  const controle = controleerBriefje(beurten);
  const afwijkend = controle.filter(function(c) {
    return !c.klopt;
  });
  const totaal = beurten.reduce(function(s, b) {
    return s + b.car;
  }, 0);
  const hoogste = beurten.reduce(function(m, b) {
    return Math.max(m, b.car);
  }, 0);
  const dec = discipline === "driebanden" ? 3 : 2;
  const gem = beurten.length ? (totaal / beurten.length).toFixed(dec).replace(".", ",") : "–";
  const doelGetal = parseInt(doel, 10);
  function opslaan() {
    const d = datum.split("-").map(function(x) {
      return parseInt(x, 10);
    });
    const iso = new Date(d[0], d[1] - 1, d[2], 20, 0, 0).toISOString();
    onOpslaan({
      beurten: metAcquit.map(function(b) {
        return { car: b.car, gemist: b.gemist, goed: b.goed };
      }),
      datum: iso,
      tafel,
      doel: doelGetal > 0 ? doelGetal : beurten.length,
      doelType: doelGetal > 0 ? "caramboles" : "beurten"
    });
  }
  const knop = function(tekst2, klik, stijl) {
    return /* @__PURE__ */ React.createElement("button", { onClick: klik, style: Object.assign({ padding: "11px 12px", borderRadius: 10, border: "1px solid " + KBDR, background: "none", color: WIT, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }, stijl || {}) }, tekst2);
  };
  const goud = { background: "linear-gradient(135deg," + GOUD + "," + GOUDL + ")", border: "none", color: G, fontWeight: "bold" };
  const kopje = function(tekst2) {
    return /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: GOUDL, textTransform: "uppercase", letterSpacing: 1, margin: "14px 0 6px" } }, tekst2);
  };
  const stapRegel = function(nr, tekst2) {
    return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" } }, /* @__PURE__ */ React.createElement("span", { style: { flexShrink: 0, width: 24, height: 24, borderRadius: "50%", border: "1.5px solid " + GOUD, color: GOUD, fontSize: 13, fontWeight: "bold", textAlign: "center", lineHeight: "21px" } }, nr), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 14, color: WIT, lineHeight: 1.45 } }, tekst2));
  };
  return /* @__PURE__ */ React.createElement("div", { style: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.85)", zIndex: 300, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "18px 12px", overflowY: "auto" } }, /* @__PURE__ */ React.createElement("div", { style: { background: "linear-gradient(160deg,var(--c-1e3a1e),var(--c-0d1f0d))", border: "2px solid " + GOUD, borderRadius: 16, padding: "16px 14px", maxWidth: 440, width: "100%" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, gap: 8 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 19, fontWeight: "bold", color: GOUD } }, "📷 ", t("Partij van een briefje")), /* @__PURE__ */ React.createElement("button", { onClick: onClose, "aria-label": "Sluiten", style: { background: "none", border: "1px solid " + KBDR, borderRadius: 8, color: WIT, fontSize: 16, padding: "4px 12px", cursor: "pointer", fontFamily: "inherit" } }, "✕")), stap === "plakken" && /* @__PURE__ */ React.createElement(React.Fragment, null, stapRegel(1, t("Maak een foto van het wedstrijdbriefje, zo recht en scherp mogelijk.")), stapRegel(2, t("Tik hieronder op Kopieer de vraag. Open je eigen AI-chat (bijvoorbeeld ChatGPT of Claude), voeg de foto toe, plak de vraag en verstuur.")), stapRegel(3, t("Kopieer het antwoord, plak het in het vak hieronder en tik op Inlezen. Daarna controleer je alles voordat het wordt opgeslagen.")), knop(gekopieerd ? "✓ " + t("Vraag gekopieerd") : "📋 " + t("Kopieer de vraag"), kopieerVraag, { width: "100%", marginTop: 4, borderColor: GOUD, color: GOUD }), /* @__PURE__ */ React.createElement(
    "textarea",
    {
      value: tekst,
      onChange: function(e) {
        setTekst(e.target.value);
      },
      placeholder: t("Plak hier het antwoord"),
      style: { width: "100%", minHeight: 150, marginTop: 12, padding: 10, borderRadius: 10, border: "1px solid " + KBDR, background: "rgba(0,0,0,0.3)", color: WIT, fontSize: 14, fontFamily: "Menlo,monospace", lineHeight: 1.4, resize: "vertical" }
    }
  ), fout && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: ROOD, marginTop: 6, lineHeight: 1.4 } }, fout), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, marginTop: 12 } }, knop(t("Annuleer"), onClose, { flex: 1 }), knop(t("Inlezen"), inlezen, Object.assign({ flex: 2 }, goud, tekst.trim() ? {} : { opacity: 0.5 }))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: WITD, opacity: 0.75, marginTop: 10, lineHeight: 1.4 } }, t("De app stuurt zelf niets naar internet; de foto gaat alleen naar je eigen AI-chat."))), stap === "controle" && gelezen && /* @__PURE__ */ React.createElement(React.Fragment, null, gelezen.spelers.length > 1 && /* @__PURE__ */ React.createElement(React.Fragment, null, kopje(t("Welke kolom is van jou?")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap" } }, gelezen.spelers.map(function(s, i) {
    const aan = i === spelerIdx;
    return /* @__PURE__ */ React.createElement("button", { key: i, onClick: function() {
      kiesSpeler(gelezen, i);
    }, style: {
      flex: 1,
      minWidth: 110,
      padding: "9px 8px",
      borderRadius: 10,
      cursor: "pointer",
      fontFamily: "inherit",
      fontSize: 15,
      background: aan ? "linear-gradient(180deg,var(--c-2d4a1e),var(--c-1e3a1e))" : "none",
      border: "1px solid " + (aan ? GOUD : KBDR),
      color: aan ? GOUD : WIT,
      fontWeight: aan ? "bold" : "normal"
    } }, s.naam, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: WITD, fontWeight: "normal" } }, t("{n} beurten", { n: s.beurten.length }), s.teMaken ? " · " + t("te maken {n}", { n: s.teMaken }) : ""));
  }))), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 12, background: "rgba(0,0,0,0.25)", borderRadius: 10, padding: "10px 12px", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 4, textAlign: "center" } }, [[t("car."), totaal], [t("beurten"), beurten.length], [t("gem."), gem], [t("hoogste"), hoogste]].map(function(x) {
    return /* @__PURE__ */ React.createElement("div", { key: x[0] }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 18, fontWeight: "bold", color: WIT } }, x[1]), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: WITD } }, x[0]));
  })), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 8, fontSize: 13, lineHeight: 1.4, color: afwijkend.length ? GOUDL : GRNT } }, afwijkend.length ? "⚠️ " + (afwijkend.length > 1 ? t("{n} beurten wijken af van de totalen op het briefje. Controleer ze met de foto, of tik op het voorstel.", { n: afwijkend.length }) : t("1 beurt wijkt af van de totalen op het briefje. Controleer hem met de foto, of tik op het voorstel.")) : "✓ " + t("Alle beurten kloppen met de totalen op het briefje.")), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 10, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: WIT, marginRight: 2 } }, t("Aantal beurten:"), " ", /* @__PURE__ */ React.createElement("b", { style: { color: GOUD } }, beurten.length)), [20, 25, 30].map(function(n) {
    const aan = beurten.length === n;
    return /* @__PURE__ */ React.createElement("button", { key: n, onClick: function() {
      zetAantal(n);
    }, style: {
      padding: "5px 10px",
      borderRadius: 8,
      cursor: "pointer",
      fontFamily: "inherit",
      fontSize: 14,
      background: aan ? "var(--c-2d4a1e)" : "none",
      border: "1px solid " + (aan ? GOUD : KBDR),
      color: aan ? GOUD : WITD,
      fontWeight: aan ? "bold" : "normal"
    } }, n);
  })), kopje(t("Beurten")), aangevuld > 0 && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: GOUDL, marginBottom: 6, lineHeight: 1.4 } }, "ℹ️ ", aangevuld === 1 ? t('De laatste beurt ontbrak in je kolom; aangevuld als poedel tot {n} beurten, evenveel als je tegenstander. Klopt dat niet, haal hem weg met "− laatste beurt".', { n: beurten.length }) : t('De laatste {a} beurten ontbraken in je kolom; aangevuld als poedel tot {n} beurten, evenveel als je tegenstander. Klopt dat niet, haal ze weg met "− laatste beurt".', { a: aangevuld, n: beurten.length })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: WITD, marginBottom: 6, lineHeight: 1.4 } }, t("Tik op een beurtnummer (✎) om opmerkingen toe te voegen, net als tijdens het spelen.")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", fontSize: 10, color: WITD, textTransform: "uppercase", letterSpacing: 0.5, padding: "0 4px 4px" } }, /* @__PURE__ */ React.createElement("span", { style: { width: 44 } }, t("beurt")), /* @__PURE__ */ React.createElement("span", { style: { flex: 1, textAlign: "center" } }, t("caramboles")), /* @__PURE__ */ React.createElement("span", { style: { width: 44, textAlign: "right" } }, t("briefje")), /* @__PURE__ */ React.createElement("span", { style: { width: 62 } })), /* @__PURE__ */ React.createElement("div", { style: { border: "1px solid " + KBDR, borderRadius: 10, overflow: "hidden" } }, controle.map(function(c, i) {
    const rond = { width: 30, height: 30, borderRadius: "50%", border: "1.5px solid " + GOUD, background: "none", color: GOUD, fontSize: 17, lineHeight: "26px", padding: 0, cursor: "pointer", fontFamily: "inherit" };
    const b = metAcquit[i], open = openBeurt === i, opm = b.gemist.length + b.goed.length;
    const sel = new Set(b.gemist.map(function(l) {
      return "G__" + l;
    }).concat(b.goed.map(function(l) {
      return "P__" + l;
    })));
    return /* @__PURE__ */ React.createElement("div", { key: c.nr, style: { background: c.klopt ? open ? "rgba(201,168,76,0.08)" : i % 2 ? "rgba(255,255,255,0.03)" : "none" : "rgba(224,85,85,0.16)", borderTop: i ? "1px solid rgba(255,255,255,0.05)" : "none" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", padding: "6px 8px", gap: 4 } }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: function() {
          setOpenBeurt(open ? null : i);
        },
        "aria-label": "Opmerkingen beurt " + c.nr,
        style: { width: 44, textAlign: "left", background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit", color: WITD, fontSize: 13 }
      },
      c.nr,
      " ",
      /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: opm ? GOUDL : "rgba(255,255,255,0.35)" } }, open ? "▴" : "✎")
    ), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 } }, /* @__PURE__ */ React.createElement("button", { onClick: function() {
      zetCar(i, c.car - 1);
    }, style: rond, "aria-label": "min" }, "−"), /* @__PURE__ */ React.createElement("span", { style: { width: 28, textAlign: "center", fontSize: 18, fontWeight: "bold", color: c.car === 0 ? WITD : beurtKleur(c.car, discipline) } }, c.car === 0 ? "–" : c.car), /* @__PURE__ */ React.createElement("button", { onClick: function() {
      zetCar(i, c.car + 1);
    }, style: rond, "aria-label": "plus" }, "+")), /* @__PURE__ */ React.createElement("span", { style: { width: 44, textAlign: "right", fontSize: 13, color: WITD } }, c.totaal === null ? "" : c.totaal), /* @__PURE__ */ React.createElement("span", { style: { width: 62, textAlign: "right" } }, c.klopt ? /* @__PURE__ */ React.createElement("span", { style: { color: GRNT, fontSize: 14 } }, "✓") : /* @__PURE__ */ React.createElement("button", { onClick: function() {
      zetCar(i, c.verwacht);
    }, style: { fontSize: 12, padding: "4px 6px", borderRadius: 6, border: "1px solid " + GOUDL, background: "none", color: GOUDL, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" } }, "→ ", c.verwacht))), opm > 0 && !open && /* @__PURE__ */ React.createElement("div", { onClick: function() {
      setOpenBeurt(i);
    }, style: { padding: "0 8px 6px 52px", fontSize: 11, lineHeight: 1.4, cursor: "pointer" } }, b.goed.length > 0 && /* @__PURE__ */ React.createElement("span", { style: { color: GRNT } }, "✓ ", b.goed.join(", "), " "), b.gemist.length > 0 && /* @__PURE__ */ React.createElement("span", { style: { color: ROOD } }, "✗ ", b.gemist.join(", "))), open && /* @__PURE__ */ React.createElement("div", { style: { padding: "2px 0 8px", borderTop: "1px solid rgba(255,255,255,0.06)" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: ROOD, padding: "6px 12px 0" } }, c.car === 0 ? t("Waardoor was het een poedel?") : t("Waardoor eindigde de serie?")), /* @__PURE__ */ React.createElement(OpmGrid, { lijst: GEMIST.filter(function(o) {
      return o.label !== "Acquit";
    }), prefix: "G__", kleur: ROOD, geselecteerd: sel, toggle: function(k) {
      wisselOpm(i, k);
    } }), c.car > 0 && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: GRNT, padding: "2px 12px 0" } }, t("Wat ging goed?")), /* @__PURE__ */ React.createElement(OpmGrid, { lijst: GOED.filter(function(o) {
      return o.label !== "Acquit";
    }), prefix: "P__", kleur: GRNT, geselecteerd: sel, toggle: function(k) {
      wisselOpm(i, k);
    } })), i === acquitIdx && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: WITD, padding: "0 12px" } }, "🎬 ", c.car > 0 ? t("Acquit staat er automatisch bij (goed); wijzigen kan bij Acquit hieronder.") : t("Acquit staat er automatisch bij (gemist); wijzigen kan bij Acquit hieronder.")), /* @__PURE__ */ React.createElement("div", { style: { padding: "6px 12px 0" } }, knop(t("Klaar"), function() {
      setOpenBeurt(null);
    }, { width: "100%", padding: "8px", fontSize: 14, borderColor: GOUD, color: GOUD }))));
  })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, marginTop: 8 } }, knop("+ " + t("beurt"), function() {
    setBeurten(beurten.concat([{ nr: beurten.length + 1, car: 0, totaal: null }]));
  }, { flex: 1, fontSize: 14, padding: "8px" }), knop("− " + t("laatste beurt"), function() {
    if (beurten.length > 1) setBeurten(beurten.slice(0, -1));
  }, { flex: 1, fontSize: 14, padding: "8px", opacity: beurten.length > 1 ? 1 : 0.4 })), kopje(t("Partij")), /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: 12, color: WITD } }, t("Datum"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "date",
      value: datum,
      onChange: function(e) {
        setDatum(e.target.value);
      },
      style: { display: "block", width: "100%", boxSizing: "border-box", marginTop: 4, padding: "10px 10px", borderRadius: 8, border: "1px solid " + KBDR, background: "rgba(0,0,0,0.3)", color: WIT, fontSize: 16, fontFamily: "inherit", colorScheme: "dark", minHeight: 44 }
    }
  )), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: WITD, margin: "10px 0 4px" } }, t("Tafel")), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6 } }, Object.keys(TAFELS).map(function(k) {
    const aan = k === tafel;
    return /* @__PURE__ */ React.createElement("button", { key: k, onClick: function() {
      setTafel(k);
    }, style: {
      padding: "8px 2px",
      borderRadius: 8,
      cursor: "pointer",
      fontFamily: "inherit",
      fontSize: 15,
      background: aan ? "var(--c-2d4a1e)" : "none",
      border: "1px solid " + (aan ? GOUD : KBDR),
      color: aan ? GOUD : WITD,
      fontWeight: aan ? "bold" : "normal"
    } }, TAFELS[k].label);
  })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: WITD, margin: "12px 0 4px" } }, "🎬 ", t("Acquit"), " ", gelezen.spelers.length > 1 ? spelerIdx === 0 ? t("(je stond links)") : t("(je stond rechts)") : ""), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6 } }, [["eerste", t("Beurt {n}", { n: 1 })], ["laatste", t("Laatste beurt")], ["geen", t("Niet")]].map(function(x) {
    const aan = acquit === x[0];
    return /* @__PURE__ */ React.createElement("button", { key: x[0], onClick: function() {
      setAcquit(x[0]);
    }, style: {
      padding: "8px 2px",
      borderRadius: 8,
      cursor: "pointer",
      fontFamily: "inherit",
      fontSize: 13,
      background: aan ? "var(--c-2d4a1e)" : "none",
      border: "1px solid " + (aan ? GOUD : KBDR),
      color: aan ? GOUD : WITD,
      fontWeight: aan ? "bold" : "normal"
    } }, x[1]);
  })), acquitIdx >= 0 && beurten[acquitIdx] && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, marginTop: 4, color: beurten[acquitIdx].car > 0 ? GRNT : ROOD } }, t("Beurt {n}", { n: acquitIdx + 1 }), ": ", beurten[acquitIdx].car > 0 ? "✓ " + t("acquit gelukt ({n})", { n: beurten[acquitIdx].car }) : "✗ " + t("acquit gemist (poedel)")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: WITD, marginTop: 8 } }, t("Discipline:"), " ", /* @__PURE__ */ React.createElement("span", { style: { color: WIT } }, DISCIPLINES[discipline].naam), " ", t("(de discipline die nu bovenaan gekozen is)")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, marginTop: 16 } }, knop(t("Terug"), function() {
    setStap("plakken");
  }, { flex: 1 }), knop(afwijkend.length ? t("Toch opslaan") : t("Partij opslaan"), opslaan, Object.assign({ flex: 2 }, goud))))));
}
function SeizoenArchief({ seizoenen, alleP, discipline, onClose, onOngedaan, onVerhaal }) {
  const spel = useContext(SpelContext);
  const [confOngedaan, setConfOngedaan] = useState(false);
  const afgesloten = seizoenen.filter(function(s) {
    return s.eindDatum !== null;
  });
  const huidig = seizoenen[seizoenen.length - 1];
  return /* @__PURE__ */ React.createElement("div", { onClick: onClose, style: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.75)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, cursor: "pointer" } }, /* @__PURE__ */ React.createElement("div", { onClick: function(e) {
    e.stopPropagation();
  }, style: { background: "linear-gradient(160deg,var(--c-1e3a1e),var(--c-0d1f0d))", border: "2px solid " + GOUD, borderRadius: 18, padding: "18px 16px", maxWidth: 380, width: "100%", maxHeight: "calc(85vh / var(--zoom,1))", overflowY: "auto", boxShadow: "0 10px 40px rgba(0,0,0,0.6)" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, fontWeight: "bold", color: GOUD, marginBottom: 4, textAlign: "center" } }, t("Seizoensarchief")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: WITD, textAlign: "center", marginBottom: 14 } }, t("Elke afgesloten periode, met de eindstand van dat seizoen")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, seizoenen.filter(function(s) {
    return s.eindDatum !== null;
  }).slice().reverse().map(function(s) {
    const stats = berekenSeizoenStats(alleP, s, discipline, !spel, {});
    return /* @__PURE__ */ React.createElement("div", { key: s.id, style: { background: "rgba(0,0,0,0.2)", border: "1px solid " + KBDR, borderRadius: 10, padding: "10px 12px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 6 } }, /* @__PURE__ */ React.createElement("div", { style: { width: 32, height: 32, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%," + stats.niveau.kleur + "cc," + stats.niveau.kleur + "33)", border: "2px solid " + stats.niveau.kleur, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 } }, stats.niveau.emoji), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, fontWeight: "bold", color: WIT } }, seizoenNaam(s)), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: WITD } }, s.startDatum ? new Date(s.startDatum).toLocaleDateString(taalLocale(), { day: "numeric", month: "short", year: "numeric" }) : t("begin"), " – ", new Date(s.eindDatum).toLocaleDateString(taalLocale(), { day: "numeric", month: "short", year: "numeric" })))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: WITD } }, t("{n} partijen · gem {g}", { n: stats.aantalPartijen, g: stats.gemiddelde.toFixed(discipline === "driebanden" ? 3 : 2) }), " · ", spel && /* @__PURE__ */ React.createElement(React.Fragment, null, stats.badgePunten, "pt · "), /* @__PURE__ */ React.createElement("span", { style: { color: stats.niveau.kleur, fontWeight: "bold" } }, stats.niveau.naam)), onVerhaal && /* @__PURE__ */ React.createElement("button", { onClick: function() {
      onVerhaal(s);
    }, style: { marginTop: 8, padding: "6px 12px", background: "none", border: "1px solid " + GOUD, borderRadius: 8, color: GOUD, cursor: "pointer", fontFamily: "inherit", fontSize: 13 } }, "🎬 ", t("Bekijk dit seizoen")), stats.aantalDrops > 0 && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: WITD, opacity: 0.8, marginTop: 2 } }, t("Gemiddelde"), " ", gemUitleg(stats, discipline === "driebanden" ? 3 : 2, t(" van dit seizoen"))));
  })), onOngedaan && afgesloten.length > 0 && (!confOngedaan ? /* @__PURE__ */ React.createElement("button", { onClick: function() {
    setConfOngedaan(true);
  }, style: { display: "block", margin: "14px auto 0", padding: "4px 0", background: "none", border: "none", color: WITD, cursor: "pointer", fontSize: 12, fontFamily: "inherit", textDecoration: "underline", opacity: 0.75 } }, "Laatste seizoensgrens ongedaan maken") : /* @__PURE__ */ React.createElement("div", { style: { marginTop: 12, background: "rgba(0,0,0,0.25)", border: "1px solid " + KBDR, borderRadius: 8, padding: "9px 10px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: WITD, marginBottom: 8, lineHeight: 1.4 } }, t("{a} en {b} weer samenvoegen tot één lopend seizoen?", { a: seizoenNaam(huidig), b: seizoenNaam(afgesloten[afgesloten.length - 1]) })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6 } }, /* @__PURE__ */ React.createElement("button", { onClick: onOngedaan, style: { flex: 1, padding: 8, background: "var(--c-2d4a1e)", border: "none", borderRadius: 6, color: GOUD, cursor: "pointer", fontFamily: "inherit", fontSize: 13 } }, t("Ja, samenvoegen")), /* @__PURE__ */ React.createElement("button", { onClick: function() {
    setConfOngedaan(false);
  }, style: { flex: 1, padding: 8, background: "none", border: "1px solid " + KBDR, borderRadius: 6, color: WITD, cursor: "pointer", fontFamily: "inherit", fontSize: 13 } }, t("Annuleer"))))), /* @__PURE__ */ React.createElement("div", { onClick: onClose, style: { textAlign: "center", marginTop: 14, fontSize: 13, color: WITD, opacity: 0.7, cursor: "pointer", padding: "6px 0" } }, t("Tik om te sluiten"))));
}
function BadgeCatalogus({ discipline, onClose }) {
  const BADGE_CATALOGUS = bouwBadgeCatalogus(discipline);
  const categorieen = [];
  BADGE_CATALOGUS.forEach(function(b) {
    if (categorieen.indexOf(b.categorie) === -1) categorieen.push(b.categorie);
  });
  return /* @__PURE__ */ React.createElement("div", { onClick: onClose, style: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.75)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, cursor: "pointer" } }, /* @__PURE__ */ React.createElement("div", { onClick: function(e) {
    e.stopPropagation();
  }, style: { background: "linear-gradient(160deg,var(--c-1e3a1e),var(--c-0d1f0d))", border: "2px solid " + GOUD, borderRadius: 18, padding: "18px 16px", maxWidth: 400, width: "100%", maxHeight: "calc(85vh / var(--zoom,1))", overflowY: "auto", boxShadow: "0 10px 40px rgba(0,0,0,0.6)" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, fontWeight: "bold", color: GOUD, marginBottom: 4, textAlign: "center" } }, t("Alle badges")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: WITD, textAlign: "center", marginBottom: 14 } }, t("Elke badge die je kunt verdienen, en wat ervoor nodig is")), categorieen.map(function(cat) {
    return /* @__PURE__ */ React.createElement("div", { key: cat, style: { marginBottom: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: GOUD, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, borderBottom: "1px solid " + KBDR, paddingBottom: 4 } }, t(cat)), BADGE_CATALOGUS.filter(function(b) {
      return b.categorie === cat;
    }).map(function(b) {
      return /* @__PURE__ */ React.createElement("div", { key: b.label, style: { display: "flex", alignItems: "flex-start", gap: 8, padding: "6px 0" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 18, flexShrink: 0 } }, b.emoji), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", gap: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, fontWeight: "bold", color: WIT } }, badgeLabel(b.label)), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: GOUD, flexShrink: 0 } }, b.punten)), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: WITD, marginTop: 1 } }, b.uitleg)));
    }));
  }), /* @__PURE__ */ React.createElement("div", { onClick: onClose, style: { textAlign: "center", marginTop: 6, fontSize: 13, color: WITD, opacity: 0.7, cursor: "pointer", padding: "6px 0" } }, t("Tik om te sluiten"))));
}
function NiveauOverzicht({ niveau, discipline, onClose, mijnDoel, openDoel, vormVenster, setVormVenster, schrappen, setSchrappen }) {
  const niveaus = (DISCIPLINES[discipline] || DISCIPLINES.libre).niveaus;
  const decimalen = discipline === "driebanden" ? 3 : 2;
  return /* @__PURE__ */ React.createElement("div", { onClick: onClose, style: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.75)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, cursor: "pointer" } }, /* @__PURE__ */ React.createElement("div", { onClick: function(e) {
    e.stopPropagation();
  }, style: { background: "linear-gradient(160deg,var(--c-1e3a1e),var(--c-0d1f0d))", border: "2px solid " + GOUD, borderRadius: 18, padding: "18px 16px", maxWidth: 380, width: "100%", maxHeight: "calc(85vh / var(--zoom,1))", overflowY: "auto", boxShadow: "0 10px 40px rgba(0,0,0,0.6)" } }, /* @__PURE__ */ React.createElement(NiveauKaart, { niveau, discipline }), setVormVenster && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: WITD, marginBottom: 6 } }, t("Je vorm (en klasse) volgt je laatste:")), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6 } }, [[10, "10"], [20, "20"], [30, "30"], ["alles", t("Alle")]].map(function(x) {
    const actief = vormVenster === x[0];
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: x[1],
        onClick: function() {
          if (!actief) setVormVenster(x[0]);
        },
        style: { padding: "8px 0", background: actief ? "var(--c-2d4a1e)" : "none", border: "1px solid " + (actief ? GOUD : KBDR), borderRadius: 8, color: actief ? GOUD : WITD, cursor: "pointer", fontFamily: "inherit", fontSize: 14 }
      },
      x[1]
    );
  })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: WITD, marginTop: 4, textAlign: "center" } }, t("partijen"))), setSchrappen && schrappen !== null && schrappen !== void 0 && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: WITD, marginBottom: 6 } }, t("Slechtste partijen schrappen met je punten:")), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 } }, [[true, t("Aan")], [false, t("Uit")]].map(function(x) {
    const actief = schrappen === x[0];
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: x[1],
        onClick: function() {
          if (!actief) setSchrappen(x[0]);
        },
        style: { padding: "8px 0", background: actief ? "var(--c-2d4a1e)" : "none", border: "1px solid " + (actief ? GOUD : KBDR), borderRadius: 8, color: actief ? GOUD : WITD, cursor: "pointer", fontFamily: "inherit", fontSize: 14 }
      },
      x[1]
    );
  })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: WITD, marginTop: 4, lineHeight: 1.4 } }, schrappen ? t("Per {n} verdiende punten valt je slechtste partij weg (hoogstens 1 op de 10).", { n: PUNTEN_PER_DROP }) : t("Alle partijen tellen mee; je punten en badges blijven gewoon."))), openDoel && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 12 } }, mijnDoel ? /* @__PURE__ */ React.createElement(DoelRing, { doel: mijnDoel, vorm: niveau.effectiefGemiddelde, discipline, onWijzig: openDoel }) : /* @__PURE__ */ React.createElement("button", { onClick: openDoel, style: { width: "100%", padding: "11px 12px", background: "none", border: "1px dashed " + GOUD, borderRadius: 12, color: GOUD, cursor: "pointer", fontFamily: "inherit", fontSize: 14 } }, "🎯 ", t("Stel een doel"))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, fontWeight: "bold", color: GOUD, marginTop: 16, marginBottom: 8, textAlign: "center", textTransform: "uppercase", letterSpacing: 1 } }, t("Alle niveaus"), " — ", (DISCIPLINES[discipline] || DISCIPLINES.libre).naam), discipline === "vierbal" && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: WITD, textAlign: "center", lineHeight: 1.45, marginBottom: 8 } }, t("Koreaanse handicap: met handicap 150 maak je 15 caramboles (1 carambole = 10 punten). De grenzen zijn een schatting: handicap ÷ 200 als gemiddelde per beurt.")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, niveaus.map(function(n, i) {
    const bereikt = i < niveau.index;
    const isHuidig = i === niveau.index;
    const toekomstig = i > niveau.index;
    return /* @__PURE__ */ React.createElement("div", { key: n.naam, style: { display: "flex", alignItems: "center", gap: 10, background: isHuidig ? "rgba(201,168,76,0.12)" : "transparent", border: "1px solid " + (isHuidig ? GOUD : KBDR), borderRadius: 10, padding: "8px 10px", opacity: toekomstig ? 0.6 : 1 } }, /* @__PURE__ */ React.createElement("div", { style: { width: 38, height: 38, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%," + n.kleur + "cc," + n.kleur + "33)", border: "2px solid " + n.kleur, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 } }, n.emoji), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, fontWeight: "bold", color: isHuidig ? GOUD : WIT } }, n.naam, isHuidig && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: WITD, fontWeight: "normal" } }, " — ", t("jouw niveau"))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: WITD } }, t("vanaf gemiddelde {g}", { g: n.gemDrempel.toFixed(decimalen) }))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14 } }, bereikt ? "✅" : toekomstig ? "🔒" : ""));
  })), /* @__PURE__ */ React.createElement("div", { onClick: onClose, style: { textAlign: "center", marginTop: 14, fontSize: 13, color: WITD, opacity: 0.7, cursor: "pointer", padding: "6px 0" } }, t("Tik om te sluiten"))));
}
function OpmerkingenBewerken({ partij, discipline, onOpslaan, onClose }) {
  const [beurten, setBeurten] = useState(function() {
    return partij.beurten.map(function(b2) {
      return Object.assign({}, b2, { gemist: (b2.gemist || []).slice(), goed: (b2.goed || []).slice() });
    });
  });
  const [stap, setStap] = useState(null);
  const gewijzigd = JSON.stringify(beurten.map(function(b2) {
    return [b2.gemist, b2.goed];
  })) !== JSON.stringify(partij.beurten.map(function(b2) {
    return [b2.gemist || [], b2.goed || []];
  }));
  const wissel = function(i, sleutel) {
    setBeurten(function(oud) {
      return oud.map(function(b2, j) {
        if (j !== i) return b2;
        const gem = sleutel.indexOf("G__") === 0, label = sleutel.slice(3), lijst = (gem ? b2.gemist : b2.goed).slice(), k = lijst.indexOf(label);
        if (k === -1) lijst.push(label);
        else lijst.splice(k, 1);
        return Object.assign({}, b2, gem ? { gemist: lijst } : { goed: lijst });
      });
    });
  };
  const metOpm = beurten.filter(function(b2) {
    return b2.gemist.length + b2.goed.length > 0;
  }).length;
  const knopStijl = function(hoofd, kleur) {
    return hoofd ? { flex: 1, padding: 13, background: "linear-gradient(135deg," + (kleur || GOUD) + "," + (kleur === GRNT ? "#66bb6a" : GOUDL) + ")", border: "none", borderRadius: 10, color: kleur === GRNT ? WIT : G, fontSize: 15, fontWeight: "bold", cursor: "pointer", fontFamily: "inherit" } : { padding: "13px 14px", background: "none", border: "1px solid " + KBDR, borderRadius: 10, color: WITD, fontSize: 14, cursor: "pointer", fontFamily: "inherit" };
  };
  const onderbalk = { display: "flex", gap: 8, padding: "10px 12px", borderTop: "1px solid " + KBDR, flexShrink: 0, background: "var(--c-152015)" };
  const b = stap ? beurten[stap.i] : null;
  return /* @__PURE__ */ React.createElement("div", { style: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.85)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "14px 10px" } }, /* @__PURE__ */ React.createElement("div", { "data-opm-bewerken": "", style: Object.assign({
    background: "linear-gradient(160deg,var(--c-1e3a1e),var(--c-0d1f0d))",
    border: "2px solid " + GOUD,
    borderRadius: 16,
    maxWidth: 440,
    width: "100%",
    maxHeight: "calc(92vh / var(--zoom,1))",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden"
  }, stap ? { height: "calc(92vh / var(--zoom,1))" } : null) }, !stap && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { padding: "14px 14px 8px", borderBottom: "1px solid " + KBDR, flexShrink: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 16, fontWeight: "bold", color: GOUD } }, "✎ ", t("Opmerkingen aanvullen")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: WITD, marginTop: 2 } }, fmtDatum(partij.datum), " · ", tafelLabel(partij.tafel || "230"), " · ", t("{a} van {b} beurten met opmerking. Tik op een beurt.", { a: metOpm, b: beurten.length }))), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minHeight: 0, overflowY: "auto" } }, beurten.map(function(bt, i) {
    const opm = bt.gemist.length + bt.goed.length;
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        key: i,
        "data-beurt-rij": "",
        onClick: function() {
          setStap({ i, soort: "gemist" });
        },
        style: { display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", cursor: "pointer", borderTop: i ? "1px solid rgba(255,255,255,0.06)" : "none" }
      },
      /* @__PURE__ */ React.createElement("span", { style: { width: 26, fontSize: 13, color: WITD } }, i + 1),
      /* @__PURE__ */ React.createElement("span", { style: { width: 30, fontSize: 18, fontWeight: "bold", color: bt.caramboles === 0 ? "#e08055" : beurtKleur(bt.caramboles, discipline) } }, bt.caramboles),
      /* @__PURE__ */ React.createElement("span", { style: { flex: 1, minWidth: 0, fontSize: 12, lineHeight: 1.35 } }, bt.goed.length > 0 && /* @__PURE__ */ React.createElement("span", { style: { color: GRNT } }, "✓ ", bt.goed.map(function(l) {
        return t(l);
      }).join(", "), " "), bt.gemist.length > 0 && /* @__PURE__ */ React.createElement("span", { style: { color: ROOD } }, "✗ ", bt.gemist.map(function(l) {
        return t(l);
      }).join(", ")), opm === 0 && /* @__PURE__ */ React.createElement("span", { style: { color: "rgba(255,255,255,0.3)" } }, t("geen opmerking"))),
      /* @__PURE__ */ React.createElement("span", { style: { color: GOUDL, fontSize: 14 } }, "✎")
    );
  })), /* @__PURE__ */ React.createElement("div", { style: onderbalk }, /* @__PURE__ */ React.createElement("button", { onClick: function() {
    if (gewijzigd) onOpslaan(partij.id, beurten);
    onClose();
  }, style: knopStijl(true) }, gewijzigd ? t("Opslaan") : t("Sluiten")), gewijzigd && /* @__PURE__ */ React.createElement("button", { onClick: onClose, style: knopStijl(false) }, t("Annuleer")))), stap && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { padding: "12px 14px 8px", borderBottom: "1px solid " + KBDR, flexShrink: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: WITD } }, t("Beurt {n}", { n: stap.i + 1 }), " · ", b.caramboles, " ", b.caramboles === 1 ? t("carambole") : t("caramboles")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 18, fontWeight: "bold", color: stap.soort === "gemist" ? ROOD : GRNT } }, stap.soort === "gemist" ? b.caramboles === 0 ? t("Waardoor was het een poedel?") : t("Waardoor eindigde de serie?") : t("Wat ging goed?"))), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minHeight: 0, display: "flex", flexDirection: "column" } }, stap.soort === "gemist" ? /* @__PURE__ */ React.createElement(OpmGrid, { lijst: GEMIST, prefix: "G__", kleur: ROOD, geselecteerd: new Set(b.gemist.map(function(l) {
    return "G__" + l;
  })), toggle: function(k) {
    wissel(stap.i, k);
  }, vullen: true }) : /* @__PURE__ */ React.createElement(OpmGrid, { lijst: GOED, prefix: "P__", kleur: GRNT, geselecteerd: new Set(b.goed.map(function(l) {
    return "P__" + l;
  })), toggle: function(k) {
    wissel(stap.i, k);
  }, vullen: true })), /* @__PURE__ */ React.createElement("div", { style: onderbalk }, stap.soort === "gemist" ? /* @__PURE__ */ React.createElement("button", { onClick: function() {
    if (b.caramboles === 0) setStap(null);
    else setStap({ i: stap.i, soort: "goed" });
  }, style: knopStijl(true) }, b.caramboles === 0 ? t("Klaar") : t("Volgende stap")) : /* @__PURE__ */ React.createElement("button", { onClick: function() {
    setStap(null);
  }, style: knopStijl(true, GRNT) }, t("Klaar")), /* @__PURE__ */ React.createElement("button", { onClick: function() {
    if (stap.soort === "goed") setStap({ i: stap.i, soort: "gemist" });
    else setStap(null);
  }, style: knopStijl(false) }, t("terug"))))));
}
