// Gebouwd uit jsx/spelen.jsx door bouw-jsx.js; niet zelf aanpassen.
function SetupScherm({ spel }) {
  const { doel, doelType, huidigeDiscipline, lp, niveau, setBeurtNr, setCar, setConfPartij, setDoel, setDoelType, setFase, setInp, setLp, setNiveauOpen, setSel, setTafel, setUitlegOpen, setBriefjeOpen, tafel, totCarLp, weergaveTip, zieWeergaveTip, backupHerinnering, maakBackupNu, backupLater } = spel;
  const kopBlok = useContext(KopContext);
  const [bevestigNieuw, setBevestigNieuw] = useState(false);
  const startNieuw = function() {
    setBevestigNieuw(false);
    setLp([]);
    setBeurtNr(1);
    setCar(0);
    setInp("0");
    setSel(/* @__PURE__ */ new Set());
    setFase("invoer");
  };
  return /* @__PURE__ */ React.createElement("div", { className: "scrollvak", style: { flex: 1, display: "flex", flexDirection: "column", padding: kopBlok ? "0 14px 10px" : "10px 14px", gap: 7, overflowY: "auto" } }, bevestigNieuw && /* @__PURE__ */ React.createElement("div", { onClick: function() {
    setBevestigNieuw(false);
  }, style: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.75)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 } }, /* @__PURE__ */ React.createElement("div", { onClick: function(e) {
    e.stopPropagation();
  }, style: { background: "var(--c-1a2e1a)", border: "2px solid " + GOUD, borderRadius: 14, padding: 20, maxWidth: 340, width: "100%" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 16, color: WIT, fontWeight: "bold", marginBottom: 6, textAlign: "center" } }, t("Je hebt nog een lopende partij")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, color: WITD, marginBottom: 16, textAlign: "center", lineHeight: 1.45 } }, t("{n} beurten · {c} car. Begin je een nieuwe partij, dan gaat deze verloren. Wil je hem bewaren, kies dan Doorgaan en daarna Afsluiten.", { n: lp.length, c: totCarLp })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, /* @__PURE__ */ React.createElement("button", { onClick: function() {
    setBevestigNieuw(false);
    setFase("invoer");
  }, style: { padding: 12, background: "linear-gradient(135deg," + GOUD + "," + GOUDL + ")", border: "none", borderRadius: 8, color: G, fontWeight: "bold", fontSize: 15, cursor: "pointer", fontFamily: "inherit" } }, t("Doorgaan met lopende partij")), /* @__PURE__ */ React.createElement("button", { onClick: startNieuw, style: { padding: 12, background: "#7a3030", border: "none", borderRadius: 8, color: WIT, fontSize: 14, cursor: "pointer", fontFamily: "inherit" } }, t("Toch nieuwe partij beginnen")), /* @__PURE__ */ React.createElement("button", { onClick: function() {
    setBevestigNieuw(false);
  }, style: { padding: 10, background: "none", border: "1px solid " + KBDR, borderRadius: 8, color: WITD, fontSize: 14, cursor: "pointer", fontFamily: "inherit" } }, t("Annuleer"))))), kopBlok && kopBlok({ rand: 14, onder: 3, gap: 7 }), lp.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { background: "var(--c-1a2e10)", border: "1px solid " + GOUD, borderRadius: 10, padding: "10px 14px", fontSize: 14, color: WITD } }, t("Lopende partij: {n} beurten - {c} car - tafel {tafel}", { n: lp.length, c: totCarLp, tafel: tafelLabel(tafel) }), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, marginTop: 8 } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      style: { flex: 1, padding: 10, background: "linear-gradient(135deg," + GOUD + "," + GOUDL + ")", border: "none", borderRadius: 6, color: G, fontWeight: "bold", cursor: "pointer", fontFamily: "inherit", fontSize: 15 },
      onClick: function() {
        setFase("invoer");
      }
    },
    t("Doorgaan")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      style: { flex: 1, padding: 8, background: "#7a3030", border: "none", borderRadius: 6, color: WIT, cursor: "pointer", fontFamily: "inherit", fontSize: 14 },
      onClick: function() {
        setConfPartij(true);
      }
    },
    t("Afsluiten")
  ))), backupHerinnering && lp.length === 0 && /* @__PURE__ */ React.createElement("div", { "data-backup-herinnering": "", style: { background: "rgba(201,168,76,0.12)", border: "1px solid " + GOUD, borderRadius: 10, padding: "12px 14px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, color: GOUD, fontWeight: "bold", marginBottom: 4 } }, "💾 ", t("Tijd voor een back-up")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, color: WIT, lineHeight: 1.5, marginBottom: 10 } }, backupHerinnering.ooit ? t(backupHerinnering.nieuw === 1 ? "1 nieuwe partij sinds je laatste back-up ({d} dagen geleden)." : "{n} nieuwe partijen sinds je laatste back-up ({d} dagen geleden).", { n: backupHerinnering.nieuw, d: backupHerinnering.dagen }) : t("Je hebt nog geen back-up gemaakt."), " ", t("Je partijen staan alleen op dit toestel; raakt het kwijt of verwijder je de app, dan zijn ze weg. Bewaar een kopie in Bestanden, iCloud Drive of je mail.")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement("button", { onClick: maakBackupNu, style: { flex: 1, padding: 10, background: "linear-gradient(135deg," + GOUD + "," + GOUDL + ")", border: "none", borderRadius: 8, color: G, fontWeight: "bold", fontSize: 14, cursor: "pointer", fontFamily: "inherit" } }, t("Back-up maken")), /* @__PURE__ */ React.createElement("button", { onClick: backupLater, style: { flex: 1, padding: 10, background: "none", border: "1px solid " + KBDR, borderRadius: 8, color: WITD, fontSize: 14, cursor: "pointer", fontFamily: "inherit" } }, t("Later")))), weergaveTip && /* @__PURE__ */ React.createElement("div", { style: { background: "rgba(201,168,76,0.12)", border: "1px solid " + GOUD, borderRadius: 10, padding: "12px 14px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, color: GOUD, fontWeight: "bold", marginBottom: 4 } }, "🔎 ", t("Nieuw: kies zelf hoe je de app ziet")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, color: WIT, lineHeight: 1.5, marginBottom: 10 } }, t("Grotere letters en knoppen, of een eenvoudige weergave met alleen het belangrijkste. Standaard staat alles aan; je vindt het altijd bij Info → Weergave.")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement("button", { onClick: function() {
    zieWeergaveTip(true);
  }, style: { flex: 1, padding: 10, background: "linear-gradient(135deg," + GOUD + "," + GOUDL + ")", border: "none", borderRadius: 8, color: G, fontWeight: "bold", fontSize: 14, cursor: "pointer", fontFamily: "inherit" } }, t("Bekijken")), /* @__PURE__ */ React.createElement("button", { onClick: function() {
    zieWeergaveTip(false);
  }, style: { flex: 1, padding: 10, background: "none", border: "1px solid " + KBDR, borderRadius: 8, color: WITD, fontSize: 14, cursor: "pointer", fontFamily: "inherit" } }, t("Niet nodig")))), /* @__PURE__ */ React.createElement("div", { style: { background: KBG, border: "1px solid " + KBDR, borderRadius: 10, padding: "12px 14px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, textTransform: "uppercase", letterSpacing: 2, color: WITD, marginBottom: 8 } }, t("Tafelmaat")), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6 } }, Object.keys(TAFELS).map(function(tk) {
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: tk,
        style: { padding: "7px 2px", background: tafel === tk ? "var(--c-2d4a1e)" : "none", border: "1px solid " + (tafel === tk ? GOUD : KBDR), borderRadius: 8, color: tafel === tk ? GOUD : WITD, cursor: "pointer", fontFamily: "inherit", fontSize: 14 },
        onClick: function() {
          setTafel(tk);
        }
      },
      /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, fontWeight: tafel === tk ? "bold" : "normal" } }, TAFELS[tk].label),
      /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, opacity: 0.8 } }, "× ", TAFELS[tk].vol.split(" x ")[1])
    );
  }))), /* @__PURE__ */ React.createElement("div", { style: { background: KBG, border: "1px solid " + KBDR, borderRadius: 10, padding: "10px 14px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, textTransform: "uppercase", letterSpacing: 2, color: WITD, marginBottom: 6 } }, t("Partij doel")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, marginBottom: 10 } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      style: { flex: 1, padding: "8px 8px", background: doelType === "beurten" ? "var(--c-2d4a1e)" : "none", border: "1px solid " + (doelType === "beurten" ? GOUD : KBDR), borderRadius: 8, color: doelType === "beurten" ? GOUD : WITD, cursor: "pointer", fontFamily: "inherit", fontSize: 15 },
      onClick: function() {
        setDoelType("beurten");
      }
    },
    t("Beurten")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      style: { flex: 1, padding: "8px 8px", background: doelType === "caramboles" ? "var(--c-2d4a1e)" : "none", border: "1px solid " + (doelType === "caramboles" ? GOUD : KBDR), borderRadius: 8, color: doelType === "caramboles" ? GOUD : WITD, cursor: "pointer", fontFamily: "inherit", fontSize: 15 },
      onClick: function() {
        setDoelType("caramboles");
      }
    },
    t("Caramboles")
  )), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "center", gap: 20, marginBottom: 10 } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "plusmin-btn",
      style: { width: 38, height: 38, borderRadius: "50%", background: "none", border: "2px solid " + GOUD, color: GOUD, fontSize: 22, cursor: "pointer" },
      onClick: function() {
        setDoel(function(n) {
          return Math.max(5, n - 5);
        });
      }
    },
    "-"
  ), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", width: 100 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 32, fontWeight: "bold", color: WIT, lineHeight: 1 } }, doel), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: WITD, marginTop: 2 } }, doelType === "beurten" ? t("beurten") : t("caramboles"))), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "plusmin-btn",
      style: { width: 38, height: 38, borderRadius: "50%", background: "none", border: "2px solid " + GOUD, color: GOUD, fontSize: 22, cursor: "pointer" },
      onClick: function() {
        setDoel(function(n) {
          return n + 5;
        });
      }
    },
    "+"
  )), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6 } }, (doelType === "beurten" ? [15, 20, 25, 30] : [50, 75, 100, 150]).map(function(n) {
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: n,
        style: { flex: 1, padding: "7px 0", background: doel === n ? "var(--c-2d4a1e)" : "none", border: "1px solid " + (doel === n ? GOUD : KBDR), borderRadius: 6, color: doel === n ? GOUD : WITD, cursor: "pointer", fontFamily: "inherit", fontSize: 14 },
        onClick: function() {
          setDoel(n);
        }
      },
      n
    );
  }))), /* @__PURE__ */ React.createElement(
    "button",
    {
      style: { position: "sticky", bottom: 0, zIndex: 2, flexShrink: 0, padding: 18, background: "linear-gradient(135deg," + GOUD + "," + GOUDL + ")", border: "none", borderRadius: 12, color: G, fontSize: 17, fontWeight: "bold", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 -6px 14px " + G },
      onClick: function() {
        if (lp.length > 0) setBevestigNieuw(true);
        else startNieuw();
      }
    },
    t("Start partij")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: function() {
        setBriefjeOpen(true);
      },
      style: { padding: "11px", background: "none", border: "1px solid " + KBDR, borderRadius: 12, color: WIT, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }
    },
    "📷 ",
    t("Partij van een wedstrijdbriefje")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: function() {
        setUitlegOpen(true);
      },
      style: { padding: "8px", background: "none", border: "none", color: WIT, fontSize: 15, cursor: "pointer", fontFamily: "inherit", textDecoration: "underline", textUnderlineOffset: 3 }
    },
    "ℹ️ ",
    t("Zo werkt de app")
  ));
}
function InvoerScherm({ spel }) {
  const spelAan = useContext(SpelContext);
  const { alleP, beurtNr, car, doel, doelType, eenvoudig, huidigeDiscipline, huidigeRecords, inp, inputRef, lp, niveau, noteer, progPct, setBeurtNr, setCar, setFase, setInp, setLp, stL, tafel, tijdsvensterMaanden, totCarLp, straf, setStraf } = spel;
  const isVierbal = huidigeDiscipline === "vierbal";
  const strafLp = lp.reduce(function(a, b) {
    return a + (b.straf || 0);
  }, 0);
  const volgende = function() {
    if (eenvoudig) noteer();
    else setFase("gemist");
  };
  const dInv = beurtDrempels(huidigeDiscipline);
  const s57 = lp.filter(function(b) {
    return b.caramboles >= dInv.opbouwMin && b.caramboles <= dInv.opbouwMax;
  }).length;
  const s89 = lp.filter(function(b) {
    return b.caramboles >= dInv.sterkMin && b.caramboles <= dInv.sterkMax;
  }).length;
  const s10 = lp.filter(function(b) {
    return b.caramboles >= dInv.topMin;
  }).length;
  const poedels = lp.filter(function(b) {
    return b.caramboles === 0;
  }).length;
  const poedelPct = lp.length > 0 ? Math.round(poedels / lp.length * 100) : 0;
  const opbouwPct = lp.length > 0 ? Math.round((stL ? stL.opbouw5 : 0) / lp.length * 100) : 0;
  let partijPunten = 0;
  if (lp.length > 0) {
    const virtuelePartij = Object.assign({ id: -1, datum: (/* @__PURE__ */ new Date()).toISOString(), tafel, discipline: huidigeDiscipline, beurten: lp }, stat(lp, huidigeDiscipline));
    const resultaten = berekenPrestaties(alleP.concat([virtuelePartij]), tijdsvensterMaanden, huidigeDiscipline);
    const entry = resultaten.find(function(r) {
      return r.id === -1;
    });
    partijPunten = entry ? entry.punten : 0;
  }
  return /* @__PURE__ */ React.createElement("div", { style: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { height: 3, background: KBDR, flexShrink: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { height: 3, background: GOUD, width: progPct + "%", transition: "width 0.3s" } })), /* @__PURE__ */ React.createElement("div", { style: { padding: "10px 12px 6px", flexShrink: 0 } }, spelAan && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--c-182e14)", border: "1px solid " + GOUD, borderRadius: 8, padding: "7px 10px", marginBottom: 6 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: WITD } }, "🎖️ ", t("Deze partij:"), " ", /* @__PURE__ */ React.createElement("strong", { style: { color: GOUD } }, partijPunten, "pt")), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: WITD } }, t("Totaal:"), " ", /* @__PURE__ */ React.createElement("strong", { style: { color: GOUD } }, (niveau.badgePuntenTotaal !== void 0 ? niveau.badgePuntenTotaal : niveau.badgePunten) + partijPunten, "pt"))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6, marginBottom: 6 } }, [[t("Gespeeld"), lp.length, WIT], [t("Caramboles"), isVierbal && strafLp > 0 ? /* @__PURE__ */ React.createElement(React.Fragment, null, totCarLp, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: ROOD } }, " −", strafLp)) : stL ? stL.totCar : 0, GOUD], [t("Gem."), stL ? stL.gemPerBeurt : "0.00", GOUDL], [t("Max"), stL ? stL.max : 0, "#e8a84c"]].map(function(arr) {
    return /* @__PURE__ */ React.createElement("div", { key: arr[0], style: { textAlign: "center", background: "var(--c-182e14)", border: "1px solid " + KBDR, borderRadius: 8, padding: "7px 2px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 20, fontWeight: "bold", color: arr[2], lineHeight: 1 } }, arr[1]), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: WITD, marginTop: 3, textTransform: "uppercase", letterSpacing: 0.5 } }, arr[0]));
  })), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: 6 } }, /* @__PURE__ */ React.createElement("div", { style: { background: "var(--c-182e14)", border: "1px solid " + KBDR, borderRadius: 8, padding: "7px 6px", textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 18, fontWeight: "bold", color: GRNT, lineHeight: 1 } }, stL ? stL.opbouw5 : 0, "x ", /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, fontWeight: "normal" } }, opbouwPct, "%")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: WITD, marginTop: 3, textTransform: "uppercase", letterSpacing: 0.5 } }, t("Opbouw {n}+", { n: dInv.opbouwMin }))), /* @__PURE__ */ React.createElement("div", { style: { background: "var(--c-182e14)", border: "1px solid " + KBDR, borderRadius: 8, padding: "7px 6px", textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 18, fontWeight: "bold", color: poedels > 0 ? "#e08055" : WITD, lineHeight: 1 } }, poedels, "x ", /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, fontWeight: "normal" } }, poedelPct, "%")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: WITD, marginTop: 3, textTransform: "uppercase", letterSpacing: 0.5 } }, t("Poedels"))), /* @__PURE__ */ React.createElement("div", { style: { background: "var(--c-182e14)", border: "1px solid " + KBDR, borderRadius: 8, padding: "7px 8px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: WITD, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 1 } }, t("Series")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 4, justifyContent: "space-around", lineHeight: 1.15 } }, [[dInv.opbouwMin + "-" + dInv.opbouwMax, s57, "#4caf50"], [dInv.sterkMin + "-" + dInv.sterkMax, s89, "#e8c96a"], [dInv.topMin + "+", s10, "#ff9f40"]].map(function(arr) {
    return /* @__PURE__ */ React.createElement("div", { key: arr[0], style: { textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 16, fontWeight: "bold", color: arr[1] > 0 ? arr[2] : KBDR } }, arr[1]), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: WITD } }, arr[0]));
  }))))), /* @__PURE__ */ React.createElement("div", { style: { padding: "6px 12px 10px", flexShrink: 0, borderTop: "1px solid " + KBDR, borderBottom: "1px solid " + KBDR } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 4 } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "plusmin-btn",
      style: { width: 60, height: 60, borderRadius: "50%", background: "none", border: "2px solid " + GOUD, color: GOUD, fontSize: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
      onClick: function() {
        const n = Math.max(0, car - 1);
        setCar(n);
        setInp(String(n));
      }
    },
    "-"
  ), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: WITD, marginBottom: 4 } }, t("{n}e Beurt", { n: beurtNr })), /* @__PURE__ */ React.createElement(
    "input",
    {
      ref: inputRef,
      type: "number",
      inputMode: "numeric",
      pattern: "[0-9]*",
      value: inp,
      onChange: function(e) {
        const v = e.target.value;
        if (v === "" || v === "-") {
          setInp(v);
          return;
        }
        const n = parseInt(v);
        if (!isNaN(n) && n >= 0) {
          setCar(n);
          setInp(String(n));
        }
        ;
      },
      onFocus: function(e) {
        e.target.select();
      },
      onKeyDown: function(e) {
        if (e.key === "Enter") volgende();
      },
      style: { width: 86, fontSize: 48, fontWeight: "bold", color: WIT, background: "transparent", border: "none", borderBottom: "3px solid " + (car >= dInv.opbouwMin ? GRNT : GOUD), textAlign: "center", fontFamily: "Georgia,serif", outline: "none", paddingBottom: 3 }
    }
  ), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: car >= dInv.opbouwMin ? GRNT : GOUD, marginTop: 4, height: 18, lineHeight: "18px" } }, car === 0 ? t("Poedel") : car >= dInv.topMin ? "💫 " + t("Topserie!") : car >= dInv.sterkMin ? "🔥 " + t("Sterke serie!") : car >= dInv.opbouwMin ? "🎯 " + t("Opbouw!") : "")), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "plusmin-btn",
      style: { width: 60, height: 60, borderRadius: "50%", background: "none", border: "2px solid " + GOUD, color: GOUD, fontSize: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
      onClick: function() {
        const n = car + 1;
        setCar(n);
        setInp(String(n));
      }
    },
    "+"
  )), isVierbal && /* @__PURE__ */ React.createElement(
    "button",
    {
      "data-straf": "",
      onClick: function() {
        setStraf(straf > 0 ? 0 : 1);
      },
      style: { display: "block", margin: "8px auto 0", padding: "5px 14px", background: straf > 0 ? "rgba(224,85,85,0.18)" : "none", border: "1px solid " + (straf > 0 ? ROOD : KBDR), borderRadius: 16, color: straf > 0 ? ROOD : WITD, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }
    },
    straf > 0 ? "⚠️ " + t("−1 strafpunt (tik om weg te halen)") : t("−1 strafpunt: speelbal tegenstander geraakt")
  ), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, marginTop: 10 } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "plusmin-btn",
      style: { flex: 1, padding: 14, background: "linear-gradient(135deg," + GOUD + "," + GOUDL + ")", border: "none", borderRadius: 12, color: G, fontSize: 16, fontWeight: "bold", cursor: "pointer", fontFamily: "inherit" },
      onClick: volgende
    },
    t("Noteer")
  ), eenvoudig && /* @__PURE__ */ React.createElement(
    "button",
    {
      style: { padding: "14px 11px", background: "none", border: "1px solid " + GOUD, borderRadius: 12, color: GOUD, fontSize: 14, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" },
      onClick: function() {
        setFase("gemist");
      }
    },
    "+ ",
    t("opmerking")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      style: { padding: "14px 13px", background: "none", border: "1px solid " + KBDR, borderRadius: 12, color: WITD, fontSize: 15, cursor: "pointer", fontFamily: "inherit" },
      onClick: function() {
        if (lp.length) {
          setLp(function(p) {
            return p.slice(0, -1);
          });
          setBeurtNr(function(n) {
            return Math.max(1, n - 1);
          });
        } else {
          setFase("setup");
        }
      }
    },
    t("terug")
  ))), /* @__PURE__ */ React.createElement("div", { style: { padding: "8px 12px", flex: 1, overflowY: "auto" } }, lp.length > 1 && /* @__PURE__ */ React.createElement("div", { style: { background: "var(--c-182e14)", border: "1px solid " + KBDR, borderRadius: 8, padding: "6px 8px", marginBottom: 6 } }, /* @__PURE__ */ React.createElement(Grafiek, { beurten: lp, discipline: huidigeDiscipline })), (function() {
    let huidigeStreak = 0;
    for (let i = lp.length - 1; i >= 0; i--) {
      if (lp[i].caramboles > 0) huidigeStreak++;
      else break;
    }
    const hints = [];
    if (huidigeStreak > 0 && huidigeStreak < 8) {
      if (huidigeStreak < 5) hints.push(spelAan && "⛓️ " + t("Reeks zonder poedel: {n} (nog {r} tot {p}pt)", { n: huidigeStreak, r: 5 - huidigeStreak, p: 15 }));
      else hints.push(spelAan && "⛓️ " + t("Reeks zonder poedel: {n} (nog {r} tot {p}pt)", { n: huidigeStreak, r: 8 - huidigeStreak, p: 25 }));
    }
    if (lp.length > 0 && lp[lp.length - 1].caramboles === 0) {
      hints.push(spelAan && "💪 " + t("Volgende beurt {n}+ car = sterk herstel (+15pt)", { n: dInv.opbouwMin }));
    }
    if (stL) {
      const gemNu = parseFloat(stL.gemPerBeurt);
      const basisNu = huidigeRecords.totaalGem !== null ? huidigeRecords.totaalGem : 0;
      const stapNu = gemStap(huidigeDiscipline);
      const drempel1Nu = gemDrempelBoven(basisNu, stapNu);
      const drempel2Nu = Math.round((drempel1Nu + stapNu) * 1e3) / 1e3;
      if (gemNu < drempel2Nu) {
        const drempel = gemNu < drempel1Nu ? drempel1Nu : drempel2Nu;
        const afstand = drempel - gemNu;
        if (afstand < stapNu) hints.push(spelAan && "⭐ " + t("Nog {a} tot gemiddelde {g}", { a: afstand.toFixed(2), g: gemDrempelTekst(drempel, stapNu) }));
      }
      if (huidigeRecords.allTimeBestGem > 0) {
        const afstandRecord = huidigeRecords.allTimeBestGem - gemNu;
        if (afstandRecord > 0 && afstandRecord < 0.3) hints.push("👑 " + t("Nog {a} tot je beste gem. ooit ({g})", { a: afstandRecord.toFixed(2), g: huidigeRecords.allTimeBestGem.toFixed(2) }));
      }
      const tafelRecord = huidigeRecords.tafelBest[tafel];
      if (tafelRecord && tafelRecord > 0) {
        const afstandTafel = tafelRecord - gemNu;
        if (afstandTafel > 0 && afstandTafel < 0.3) hints.push("🔝 " + t("Nog {a} tot je tafelrecord ({g})", { a: afstandTafel.toFixed(2), g: tafelRecord.toFixed(2) }));
      }
      if (huidigeRecords.totaalGem !== null) {
        const afstandTotaal = huidigeRecords.totaalGem - gemNu;
        if (afstandTotaal > 0 && afstandTotaal < 0.3) hints.push("📊 " + t("Nog {a} tot je moyenne ({g})", { a: afstandTotaal.toFixed(2), g: huidigeRecords.totaalGem.toFixed(2) }));
      }
      if (huidigeRecords.rolling5p !== null) {
        const afstandRolling = huidigeRecords.rolling5p - gemNu;
        if (afstandRolling > 0 && afstandRolling < 0.3) hints.push("📉 " + t("Nog {a} tot je gem. laatste 5 partijen ({g})", { a: afstandRolling.toFixed(2), g: huidigeRecords.rolling5p.toFixed(2) }));
      }
    }
    if (lp.length >= 3) {
      const poedelsNu = lp.filter(function(x) {
        return x.caramboles === 0;
      }).length;
      if (poedelsNu === 0) {
        hints.push(spelAan && "🛡️ " + t("0 poedels in {n} beurten: houd vol voor +30pt", { n: lp.length }));
      } else {
        const poedelPctNu = poedelsNu / lp.length * 100;
        if (poedelPctNu < 20) hints.push(spelAan && "✅ " + t("{p}% poedels (onder 20%)", { p: Math.round(poedelPctNu) }));
      }
    }
    if (lp.length > 0 && huidigeRecords.allTimeMaxBeurt > 0) {
      const maxInPartij = Math.max.apply(null, lp.map(function(x) {
        return x.caramboles;
      }));
      const afstandMax = huidigeRecords.allTimeMaxBeurt - maxInPartij;
      if (afstandMax > 0 && afstandMax <= 3) hints.push("🏆 " + t("Hoogste beurt nu {n} (record {r})", { n: maxInPartij, r: huidigeRecords.allTimeMaxBeurt }));
    }
    const helftNu = Math.floor(lp.length / 2);
    if (helftNu >= 3 && huidigeRecords.totaalGem !== null) {
      const eersteNu = lp.slice(0, helftNu), tweedeNu = lp.slice(helftNu);
      const gemENu = eersteNu.reduce(function(a, b) {
        return a + b.caramboles;
      }, 0) / eersteNu.length;
      const gemTNu = tweedeNu.reduce(function(a, b) {
        return a + b.caramboles;
      }, 0) / tweedeNu.length;
      if (gemTNu > gemENu && stL && parseFloat(stL.gemPerBeurt) > huidigeRecords.totaalGem) {
        hints.push(spelAan && "📈 " + t("Sterke 2e helft:") + " " + gemENu.toFixed(2) + " → " + gemTNu.toFixed(2));
      }
    }
    if (doel && doelType === "caramboles") {
      if (totCarLp < doel) hints.push("🎯 " + t("Nog {n} caramboles tot je doel", { n: doel - totCarLp }));
    }
    const zichtbaar = hints.filter(Boolean);
    if (zichtbaar.length === 0) return null;
    return /* @__PURE__ */ React.createElement("div", { style: { background: "var(--c-182e14)", border: "1px solid " + GOUD, borderRadius: 8, padding: "5px 10px" } }, zichtbaar.map(function(h, i) {
      return /* @__PURE__ */ React.createElement("div", { key: i, style: { fontSize: 12.5, color: WITD, padding: "1px 0", lineHeight: 1.3 } }, h);
    }));
  })()));
}
const STAP_KNOPPEN = { padding: "10px 14px 12px", display: "flex", gap: 8, flexShrink: 0, borderTop: "1px solid " + KBDR, background: "var(--c-152015)" };
function GemistScherm({ spel }) {
  const { andersGemist, car, noteer, sel, setAndersGemist, setFase, toggle } = spel;
  const gs = Array.from(sel).filter(function(k) {
    return k.startsWith("G__");
  });
  const heeftSelectie = gs.length > 0 || andersGemist.trim().length > 0;
  return /* @__PURE__ */ React.createElement("div", { style: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minHeight: 0, display: "flex", flexDirection: "column" } }, /* @__PURE__ */ React.createElement("div", { style: { padding: "10px 14px 8px", borderBottom: "1px solid " + KBDR, flexShrink: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 19, color: ROOD, fontWeight: "bold" } }, t("Gemist door")), gs.length > 0 && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 15, color: ROOD, fontWeight: "bold" } }, gs.length, "x")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: WITD, marginTop: 2 } }, t("Tik om te selecteren — je kunt er meerdere kiezen"))), /* @__PURE__ */ React.createElement(OpmGrid, { lijst: GEMIST, prefix: "G__", kleur: ROOD, geselecteerd: sel, toggle, vullen: true }), /* @__PURE__ */ React.createElement("div", { style: { padding: "0 12px 8px", flexShrink: 0 } }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: andersGemist,
      onChange: function(e) {
        setAndersGemist(e.target.value);
      },
      placeholder: t("Anders... (typ zelf iets)"),
      style: { width: "100%", padding: "8px 10px", background: "var(--c-1c3019)", border: "1px solid " + KBDR, borderRadius: 8, color: WIT, fontSize: 13, fontFamily: "inherit" }
    }
  ))), /* @__PURE__ */ React.createElement("div", { style: STAP_KNOPPEN }, /* @__PURE__ */ React.createElement(
    "button",
    {
      style: { flex: 1, padding: 15, background: heeftSelectie ? "linear-gradient(135deg," + GOUD + "," + GOUDL + ")" : "rgba(224,96,96,0.08)", border: "1px solid " + (heeftSelectie ? "transparent" : "rgba(224,96,96,0.45)"), borderRadius: 12, color: heeftSelectie ? G : "#e0a0a0", fontSize: 15, fontWeight: "bold", cursor: "pointer", fontFamily: "inherit", transition: "all 0.25s" },
      onClick: function() {
        if (car === 0) {
          noteer();
        } else {
          setFase("goed");
        }
      }
    },
    car === 0 ? t("Opslaan") : t("Volgende stap")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      style: { padding: "15px 12px", background: "none", border: "1px solid " + KBDR, borderRadius: 12, color: WITD, fontSize: 14, cursor: "pointer", fontFamily: "inherit" },
      onClick: function() {
        setFase("invoer");
      }
    },
    t("terug")
  )));
}
function GoedScherm({ spel }) {
  const { andersGoed, noteer, sel, setAndersGoed, setFase, toggle } = spel;
  const gs = Array.from(sel).filter(function(k) {
    return k.startsWith("P__");
  });
  const heeftSelectie = gs.length > 0 || andersGoed.trim().length > 0;
  return /* @__PURE__ */ React.createElement("div", { style: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minHeight: 0, display: "flex", flexDirection: "column" } }, /* @__PURE__ */ React.createElement("div", { style: { padding: "10px 14px 8px", borderBottom: "1px solid " + KBDR, flexShrink: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 19, color: GRNT, fontWeight: "bold" } }, t("Wat ging goed?")), gs.length > 0 && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 15, color: GRNT, fontWeight: "bold" } }, gs.length, "x")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: WITD, marginTop: 2 } }, t("Tik om te selecteren — je kunt er meerdere kiezen"))), /* @__PURE__ */ React.createElement(OpmGrid, { lijst: GOED, prefix: "P__", kleur: GRNT, geselecteerd: sel, toggle, vullen: true }), /* @__PURE__ */ React.createElement("div", { style: { padding: "0 12px 8px", flexShrink: 0 } }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: andersGoed,
      onChange: function(e) {
        setAndersGoed(e.target.value);
      },
      placeholder: t("Anders... (typ zelf iets)"),
      style: { width: "100%", padding: "8px 10px", background: "var(--c-1c3019)", border: "1px solid " + KBDR, borderRadius: 8, color: WIT, fontSize: 13, fontFamily: "inherit" }
    }
  ))), /* @__PURE__ */ React.createElement("div", { style: STAP_KNOPPEN }, /* @__PURE__ */ React.createElement(
    "button",
    {
      style: { flex: 1, padding: 15, background: heeftSelectie ? "linear-gradient(135deg," + GRNT + ",#66bb6a)" : "rgba(102,187,106,0.08)", border: "1px solid " + (heeftSelectie ? "transparent" : "rgba(102,187,106,0.45)"), borderRadius: 12, color: heeftSelectie ? WIT : "#a8d5aa", fontSize: 15, fontWeight: "bold", cursor: "pointer", fontFamily: "inherit", transition: "all 0.25s" },
      onClick: noteer
    },
    t("Beurt opslaan")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      style: { padding: "15px 12px", background: "none", border: "1px solid " + KBDR, borderRadius: 12, color: WITD, fontSize: 14, cursor: "pointer", fontFamily: "inherit" },
      onClick: function() {
        setFase("gemist");
      }
    },
    t("terug")
  )));
}
