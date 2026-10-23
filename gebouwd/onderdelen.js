// Gebouwd uit jsx/onderdelen.jsx door bouw-jsx.js; niet zelf aanpassen.
const { useState, useEffect, useRef, useMemo, useContext } = React;
const SpelContext = React.createContext(true);
const EenvoudigContext = React.createContext(false);
const KopContext = React.createContext(null);
const OpmerkingenContext = React.createContext(null);
function Logo({ maat = 44 }) {
  const bal = function(x, y, kleur, id) {
    return /* @__PURE__ */ React.createElement("g", null, /* @__PURE__ */ React.createElement("ellipse", { cx: x + 1.5, cy: y + 8, rx: 8, ry: 2.6, style: { fill: "rgba(0,0,0,0.35)" } }), /* @__PURE__ */ React.createElement("circle", { cx: x, cy: y, r: 8.5, style: { fill: "url(#" + id + ")" } }), /* @__PURE__ */ React.createElement("circle", { cx: x - 2.8, cy: y - 3, r: 2.2, style: { fill: "rgba(255,255,255,0.85)" } }));
  };
  const balKleur = function(id, licht, donker) {
    return /* @__PURE__ */ React.createElement("radialGradient", { id, cx: "35%", cy: "30%", r: "75%" }, /* @__PURE__ */ React.createElement("stop", { offset: "0%", style: { stopColor: licht } }), /* @__PURE__ */ React.createElement("stop", { offset: "100%", style: { stopColor: donker } }));
  };
  const keu = function(x1, y1, x2, y2) {
    const mx = x1 + (x2 - x1) * 0.3, my = y1 + (y2 - y1) * 0.3;
    return /* @__PURE__ */ React.createElement("g", { style: { strokeLinecap: "round" } }, /* @__PURE__ */ React.createElement("line", { x1, y1, x2, y2, style: { stroke: "rgba(0,0,0,0.3)", strokeWidth: 5.5 }, transform: "translate(1.5,2)" }), /* @__PURE__ */ React.createElement("line", { x1: mx, y1: my, x2, y2, style: { stroke: "url(#lg-hout)", strokeWidth: 3.2 } }), /* @__PURE__ */ React.createElement("line", { x1, y1, x2: mx, y2: my, style: { stroke: "#2b1a10", strokeWidth: 5.2 } }), /* @__PURE__ */ React.createElement("line", { x1: mx - (x2 - x1) * 0.015, y1: my - (y2 - y1) * 0.015, x2: mx + (x2 - x1) * 0.015, y2: my + (y2 - y1) * 0.015, style: { stroke: GOUD, strokeWidth: 5.4 } }), /* @__PURE__ */ React.createElement("line", { x1: x2 - (x2 - x1) * 0.03, y1: y2 - (y2 - y1) * 0.03, x2, y2, style: { stroke: "#f5f0e8", strokeWidth: 3.2 } }));
  };
  return /* @__PURE__ */ React.createElement("svg", { width: maat, height: maat, viewBox: "0 0 100 100", style: { flexShrink: 0, display: "block" }, "aria-label": "Carom Tracker" }, /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("radialGradient", { id: "lg-laken", cx: "50%", cy: "42%", r: "70%" }, /* @__PURE__ */ React.createElement("stop", { offset: "0%", style: { stopColor: "var(--c-3f8a3a)" } }), /* @__PURE__ */ React.createElement("stop", { offset: "100%", style: { stopColor: "var(--c-1d4a1d)" } })), /* @__PURE__ */ React.createElement("linearGradient", { id: "lg-glans", x1: "0", y1: "0", x2: "0", y2: "1" }, /* @__PURE__ */ React.createElement("stop", { offset: "0%", style: { stopColor: "rgba(255,255,255,0.22)" } }), /* @__PURE__ */ React.createElement("stop", { offset: "45%", style: { stopColor: "rgba(255,255,255,0)" } })), /* @__PURE__ */ React.createElement("linearGradient", { id: "lg-hout", x1: "0", y1: "0", x2: "1", y2: "1" }, /* @__PURE__ */ React.createElement("stop", { offset: "0%", style: { stopColor: "#8a5a2b" } }), /* @__PURE__ */ React.createElement("stop", { offset: "100%", style: { stopColor: "#f0d39a" } })), balKleur("lg-rood", "#ff7a6b", "#a3120b"), balKleur("lg-wit", "#ffffff", "#cfc9bc"), balKleur("lg-geel", "#ffe58a", "#d18a00")), /* @__PURE__ */ React.createElement("rect", { x: "2", y: "2", width: "96", height: "96", rx: "22", style: { fill: "url(#lg-laken)", stroke: GOUD, strokeWidth: 2.5, strokeOpacity: 0.8 } }), keu(14, 88, 86, 16), keu(86, 88, 14, 16), bal(50, 26, "rood", "lg-rood"), bal(25, 50, "wit", "lg-wit"), bal(75, 50, "geel", "lg-geel"), /* @__PURE__ */ React.createElement("rect", { x: "2", y: "2", width: "96", height: "96", rx: "22", style: { fill: "url(#lg-glans)" } }));
}
function Grafiek({ beurten, discipline }) {
  const vakRef = useRef(null);
  const [breedte, setBreedte] = useState(0);
  const n = beurten ? beurten.length : 0;
  useEffect(function() {
    const el = vakRef.current;
    if (!el) return;
    const meet = function() {
      setBreedte(el.clientWidth);
    };
    meet();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(meet);
    ro.observe(el);
    return function() {
      ro.disconnect();
    };
  }, [n >= 2]);
  useEffect(function() {
    const el = vakRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [n, breedte]);
  const opbouwMin = beurtDrempels(discipline || "libre").opbouwMin;
  if (!beurten || beurten.length < 2) return null;
  const vals = beurten.map((b) => b.caramboles);
  const maxV = Math.max(...vals, 1);
  const lp = 8, tp = 16, H = 36;
  const ruimte = breedte > 0 ? (breedte - lp - 14) / (vals.length - 1) : 300 / vals.length;
  const ppp = Math.max(6, Math.min(28, ruimte));
  const W = lp + ppp * (vals.length - 1);
  const ps = vals.map((v, i) => lp + i * ppp + "," + (tp + H - v / maxV * H)).join(" ");
  const fs = ppp < 9 ? 7 : ppp < 12 ? 8 : 9;
  return /* @__PURE__ */ React.createElement("div", { ref: vakRef, "data-grafiek": "", style: { overflowX: ruimte < 6 ? "auto" : "hidden" } }, /* @__PURE__ */ React.createElement("svg", { width: Math.max(W + 8, 40), height: H + tp + 6, style: { overflow: "visible", display: "block" } }, /* @__PURE__ */ React.createElement("polyline", { points: ps, fill: "none", stroke: GOUD, strokeWidth: "1.5", strokeLinejoin: "round" }), vals.map(function(v, i) {
    const cx = lp + i * ppp, cy = tp + H - v / maxV * H;
    const k = beurtKleur(v, discipline || "libre");
    return React.createElement(
      "g",
      { key: i },
      React.createElement("circle", { cx, cy, r: v >= opbouwMin ? 3 : 2, fill: k }),
      React.createElement("text", { x: cx, y: cy - 5, textAnchor: "middle", fontSize: fs, fill: k, fontFamily: "Georgia,serif", fontWeight: v >= opbouwMin ? "bold" : "normal" }, v)
    );
  })));
}
function OpmGrid({ lijst, prefix, kleur, geselecteerd, toggle, vullen }) {
  const ref = useRef(null);
  const [krap, setKrap] = useState(0);
  const rijen = Math.ceil(lijst.length / 3);
  useEffect(function() {
    if (!vullen) return;
    const el = ref.current;
    if (!el) return;
    const meet = function() {
      const rij = (el.clientHeight - 16 - 5 * (rijen - 1)) / rijen;
      setKrap(rij >= 50 ? 0 : rij >= 34 ? 1 : 2);
    };
    meet();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(meet);
    ro.observe(el);
    return function() {
      ro.disconnect();
    };
  }, [vullen, rijen]);
  return /* @__PURE__ */ React.createElement("div", { ref, "data-opmgrid": vullen ? krap : void 0, style: Object.assign(
    { display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 5, padding: "8px 12px" },
    vullen ? { flex: 1, minHeight: 0, gridAutoRows: "1fr", overflowY: "auto" } : null
  ) }, lijst.map(function(o) {
    const key = prefix + o.label;
    const actief = geselecteerd.has(key);
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: o.label,
        onClick: function() {
          toggle(key);
        },
        style: {
          background: actief ? kleur === ROOD ? "#3a1010" : "var(--c-1a3a1a)" : "var(--c-1c3019)",
          border: "1px solid " + (actief ? kleur : KBDR),
          borderRadius: 8,
          padding: krap ? "2px 3px" : "7px 4px",
          color: actief ? kleur : WITD,
          cursor: "pointer",
          fontSize: krap === 2 ? 11.5 : 13,
          lineHeight: 1.15,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          fontFamily: "inherit",
          minHeight: 0,
          overflow: "hidden"
        }
      },
      !krap && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 14 } }, o.emoji),
      /* @__PURE__ */ React.createElement("span", null, t(o.label))
    );
  }));
}
function LogRij({ b, nr, discipline }) {
  const isPoedel = b.caramboles === 0;
  const heeftGemist = (b.gemist || []).length > 0;
  const heeftGoed = (b.goed || []).length > 0;
  const oudeOpm = b.opmerking && b.opmerking !== "" ? b.opmerking : null;
  return /* @__PURE__ */ React.createElement("div", { style: { borderBottom: "1px solid " + KBDR, padding: "5px 0" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: WITD, minWidth: 18, textAlign: "right" } }, nr), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 20, fontWeight: "bold", color: b.caramboles >= beurtDrempels(discipline || "libre").opbouwMin ? GOUDL : isPoedel ? "#e08055" : WIT, minWidth: 26 } }, b.caramboles), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, display: "flex", gap: 3, flexWrap: "wrap", alignItems: "center" } }, isPoedel && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, background: "#3a1010", color: "#e08055", borderRadius: 3, padding: "2px 6px", fontWeight: "bold" } }, t("poedel")), b.straf > 0 && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, background: "#3a1010", color: ROOD, borderRadius: 3, padding: "2px 6px", fontWeight: "bold" } }, "−", b.straf, " ", t("straf")), heeftGemist && (b.gemist || []).map(function(o) {
    return /* @__PURE__ */ React.createElement("span", { key: o, style: { fontSize: 13, background: "#3a1010", color: ROOD, borderRadius: 3, padding: "2px 6px" } }, t(o));
  }), !isPoedel && heeftGoed && (b.goed || []).map(function(o) {
    return /* @__PURE__ */ React.createElement("span", { key: o, style: { fontSize: 13, background: "#0f2e14", color: GRNT, borderRadius: 3, padding: "2px 6px" } }, t(o));
  }), oudeOpm && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, background: "var(--c-2a3d20)", color: GOUD, borderRadius: 3, padding: "2px 6px" } }, oudeOpm))));
}
function PrestatieOverzicht({ prestatie }) {
  const [perCategorie, setPerCategorie] = useState(false);
  const badges = prestatie && prestatie.badges ? prestatie.badges : [];
  const groepen = useMemo(function() {
    const g = {};
    badges.forEach(function(b) {
      const k = b.categorie || "Overig";
      if (!g[k]) g[k] = [];
      g[k].push(b);
    });
    return Object.entries(g).map(function(entry) {
      const naam = entry[0], lijst = entry[1];
      return { naam, lijst, subtotaal: lijst.reduce(function(a, b) {
        return a + b.punten;
      }, 0) };
    });
  }, [badges]);
  if (!prestatie || badges.length === 0) return null;
  const punten = prestatie.punten;
  return /* @__PURE__ */ React.createElement("div", { style: { marginTop: 10, marginBottom: 10, background: "var(--c-1a2e10)", border: "1px solid " + GOUD, borderRadius: 8, padding: "8px 10px" } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: function() {
        setPerCategorie(function(v) {
          return !v;
        });
      },
      style: { width: "100%", background: "none", border: "none", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", fontFamily: "inherit", padding: 0, marginBottom: 6 }
    },
    /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: GOUD, textTransform: "uppercase", letterSpacing: 1 } }, t("Prestaties · {n}pt totaal", { n: punten })),
    /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: WITD } }, perCategorie ? t("lijst") + " ▸" : t("per categorie") + " ▾")
  ), !perCategorie && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, prestatie.badges.map(function(b, i) {
    return /* @__PURE__ */ React.createElement("div", { key: i }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 13, color: WITD } }, /* @__PURE__ */ React.createElement("span", null, b.emoji, " ", badgeLabel(b.label), b.aantal > 1 ? " ×" + b.aantal : ""), /* @__PURE__ */ React.createElement("span", { style: { color: GOUD, fontWeight: "bold" } }, "+", b.punten)), b.detail && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: WITD, opacity: 0.65, marginTop: 1 } }, b.detail));
  })), perCategorie && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, groepen.map(function(g) {
    return /* @__PURE__ */ React.createElement("div", { key: g.naam }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 13, color: GOUDL, marginBottom: 4, fontWeight: "bold" } }, /* @__PURE__ */ React.createElement("span", null, t(g.naam)), /* @__PURE__ */ React.createElement("span", null, g.subtotaal, "pt")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6 } }, g.lijst.map(function(b, i) {
      return /* @__PURE__ */ React.createElement("div", { key: i, style: { paddingLeft: 8 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 13, color: WITD } }, /* @__PURE__ */ React.createElement("span", null, b.emoji, " ", badgeLabel(b.label), b.aantal > 1 ? " ×" + b.aantal : ""), /* @__PURE__ */ React.createElement("span", { style: { color: GOUD } }, "+", b.punten)), b.detail && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: WITD, opacity: 0.65, marginTop: 1 } }, b.detail));
    })));
  })));
}
function NiveauKaart({ niveau, compact, discipline, onClick }) {
  const spel = useContext(SpelContext);
  const dec = discipline === "driebanden" ? 3 : 2;
  const recentP = Math.min(5, niveau.aantalPartijenTotaal || 5);
  if (compact) {
    return /* @__PURE__ */ React.createElement("div", { onClick, style: { background: "linear-gradient(160deg,var(--c-1e3a1e),var(--c-0d1f0d))", border: "2px solid " + niveau.huidig.kleur, borderRadius: 12, padding: "10px 12px", cursor: onClick ? "pointer" : "default" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { width: 34, height: 34, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%," + niveau.huidig.kleur + "dd," + niveau.huidig.kleur + "44)", border: "2px solid " + niveau.huidig.kleur, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 } }, niveau.huidig.emoji), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 14, fontWeight: "bold", color: niveau.huidig.kleur } }, niveau.huidig.naam), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 15, fontWeight: "bold", color: GOUD } }, getalTekst(niveau.effectiefGemiddelde, dec))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, letterSpacing: 1 } }, "★".repeat(niveau.sterren), "☆".repeat(5 - niveau.sterren)), niveau.moyenne !== void 0 && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: WITD, marginTop: 2 } }, vormUitleg(niveau, dec)))), niveau.volgende && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 6 } }, /* @__PURE__ */ React.createElement(DashBalk, { pct: niveau.progressPct, kleur: niveau.huidig.kleur, hoogte: 6 }), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginTop: 3, fontSize: 11, color: WITD } }, /* @__PURE__ */ React.createElement("span", null, niveau.progressPct, "%"), /* @__PURE__ */ React.createElement("span", null, niveau.volgende.emoji, " ", niveau.volgende.naam, " · ", t("gem"), " ", getalTekst(niveau.volgende.gemDrempel, dec)))));
  }
  return /* @__PURE__ */ React.createElement("div", { onClick, style: { background: "linear-gradient(160deg,var(--c-1e3a1e),var(--c-0d1f0d))", border: "2px solid " + niveau.huidig.kleur, borderRadius: 14, padding: "16px", cursor: onClick ? "pointer" : "default" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12, marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { width: 52, height: 52, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%," + niveau.huidig.kleur + "dd," + niveau.huidig.kleur + "44)", border: "3px solid " + niveau.huidig.kleur, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, boxShadow: "0 0 16px " + niveau.huidig.kleur + "88" } }, niveau.huidig.emoji), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 20, fontWeight: "bold", color: niveau.huidig.kleur } }, niveau.huidig.naam), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, letterSpacing: 1 } }, "★".repeat(niveau.sterren), "☆".repeat(5 - niveau.sterren))), /* @__PURE__ */ React.createElement("div", { style: { marginLeft: "auto", textAlign: "right" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: WITD } }, !niveau.venster && !niveau.aantalDrops && niveau.moyenne !== void 0 ? t("moyenne") : t("vorm")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 16, fontWeight: "bold", color: GOUD } }, getalTekst(niveau.effectiefGemiddelde, dec)))), niveau.moyenne !== void 0 && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: WITD, lineHeight: 1.4, marginTop: -4, marginBottom: 12 } }, vormUitleg(niveau, dec)), niveau.volgende ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(DashBalk, { pct: niveau.progressPct, kleur: niveau.huidig.kleur, hoogte: 9 }), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginTop: 5, fontSize: 13 } }, /* @__PURE__ */ React.createElement("span", { style: { fontWeight: "bold", color: niveau.huidig.kleur } }, getalTekst(niveau.effectiefGemiddelde, dec)), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: WITD } }, niveau.volgende.emoji, " ", niveau.volgende.naam, " · ", t("gem"), " ", getalTekst(niveau.volgende.gemDrempel, dec)))) : /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", fontSize: 13, color: niveau.huidig.kleur, fontWeight: "bold" } }, t("Hoogste niveau bereikt!"), " 💎"), spel && niveau.schrapt !== false && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 12, background: "rgba(0,0,0,0.2)", borderRadius: 8, padding: "9px 10px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: WITD } }, "🎖️ ", niveau.venster ? t("Punten in je laatste {n} partijen", { n: niveau.aantalPartijen }) : t("Badge-punten")), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 14, fontWeight: "bold", color: GOUD } }, niveau.badgePunten, " / ", niveau.aantalDrops * PUNTEN_PER_DROP + PUNTEN_PER_DROP, "pt")), /* @__PURE__ */ React.createElement(DashBalk, { pct: niveau.badgePunten % PUNTEN_PER_DROP / PUNTEN_PER_DROP * 100, kleur: GOUD, hoogte: 5 }), niveau.aantalDrops > 0 ? /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" } }, Array.from({ length: niveau.aantalDrops }).map(function(_, i) {
    const p = niveau.gedroptePartijen[i];
    return /* @__PURE__ */ React.createElement("div", { key: i, style: { background: "rgba(201,168,76,0.15)", border: "1px solid " + GOUD, borderRadius: 10, padding: "5px 9px", textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 4, justifyContent: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13 } }, "🥇"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: GOUD, fontWeight: "bold" } }, (i + 1) * PUNTEN_PER_DROP, "pt")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: WITD, marginTop: 2, textDecoration: "line-through", opacity: 0.8 } }, "p", p.nr, " · ", t("gem"), " ", getalTekst(p.gem, dec)), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: "#ff9f80", marginTop: 1 } }, t("telt niet mee")));
  })) : /* @__PURE__ */ React.createElement("div", { style: { marginTop: 8, fontSize: 12, color: WITD, opacity: 0.75, textAlign: "center" } }, t("Bij {n}pt: je slechtste partij schrappen uit je vorm", { n: PUNTEN_PER_DROP })), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 8, fontSize: 11, color: WITD, opacity: 0.75, textAlign: "center" } }, niveau.plafondBereikt ? t("Maximum bereikt: nooit meer dan 1 op de 10 partijen geschrapt ({m} van {n}).", { m: niveau.maxDrops, n: niveau.aantalPartijen }) : t("Maximaal 1 op de 10 partijen kan geschrapt worden."))), spel && niveau.volgendeKandidaatId && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 8, textAlign: "center", fontSize: 11, color: "#ff9f80" } }, "🎯 ", t("Eerstvolgende partij die vervalt: p{n} (gem {g})", { n: niveau.volgendeKandidaatNr, g: getalTekst(niveau.volgendeKandidaatGem, dec) })), niveau.voorspelling && niveau.volgende && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 8, textAlign: "center", fontSize: 11, color: WITD } }, niveau.voorspelling.recenteVorm === null ? "📈 " + t("Nog te weinig recente partijen voor een voorspelling") : niveau.voorspelling.mogelijk === false ? "📈 " + t("Je recente vorm (laatste {p} partijen: {v}) ligt onder de {d} die nodig is voor {k}", { p: recentP, v: getalTekst(niveau.voorspelling.recenteVorm, dec), d: getalTekst(niveau.volgende.gemDrempel, dec), k: niveau.volgende.naam }) : "📈 " + t("Bij je recente vorm (laatste {p} partijen: {v}) bereik je {k} over ongeveer {n} partijen", { p: recentP, v: getalTekst(niveau.voorspelling.recenteVorm, dec), k: niveau.volgende.naam, n: niveau.voorspelling.aantalPartijen })));
}
function DashBalk({ pct, kleur, hoogte = 8 }) {
  return /* @__PURE__ */ React.createElement("div", { style: { height: hoogte, background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 4, overflow: "hidden", boxSizing: "border-box" } }, /* @__PURE__ */ React.createElement("div", { className: "balk-groei", style: { height: "100%", width: Math.max(0, Math.min(100, pct)) + "%", background: kleur, borderRadius: 4, transition: "width 0.4s" } }));
}
function DashGrafiek({ data, h = 70, grenzen }) {
  if (!data || data.length < 2) return null;
  const vals = data.filter((v) => v !== null);
  if (vals.length < 1) return null;
  const max = Math.max(...vals, 0.1);
  const W = data.length * 16;
  const segmenten = [];
  let huidig = [];
  data.forEach((v, i) => {
    if (v !== null) {
      huidig.push(`${i * 16 + 8},${h - v / max * (h - 8) + 4}`);
    } else {
      if (huidig.length > 1) segmenten.push(huidig.join(" "));
      huidig = [];
    }
  });
  if (huidig.length > 1) segmenten.push(huidig.join(" "));
  return /* @__PURE__ */ React.createElement("div", { style: { overflowX: "auto" } }, /* @__PURE__ */ React.createElement("svg", { width: W, height: h + 8, style: { display: "block" } }, (grenzen ? [grenzen.laag, grenzen.hoog] : [1, 2, 3]).filter((v) => v > 0).map((v) => /* @__PURE__ */ React.createElement(
    "line",
    {
      key: v,
      x1: 0,
      y1: h - v / max * (h - 8) + 4,
      x2: W,
      y2: h - v / max * (h - 8) + 4,
      style: { stroke: KBDR },
      strokeWidth: "0.5",
      strokeDasharray: "3,3"
    }
  )), segmenten.map((pts, i) => /* @__PURE__ */ React.createElement("polyline", { key: i, points: pts, fill: "none", style: { stroke: "var(--c-2d4a22)" }, strokeWidth: "1.5", strokeLinejoin: "round" })), data.map((v, i) => {
    if (v === null) return null;
    const cx = i * 16 + 8, cy = h - v / max * (h - 8) + 4;
    const k = grenzen ? gemKleur(v, grenzen) : v >= 2.5 ? GRNT : v >= 2 ? GOUD : v >= 1.5 ? WITD : ROOD;
    return /* @__PURE__ */ React.createElement("g", { key: i }, /* @__PURE__ */ React.createElement("circle", { cx, cy, r: 3, fill: k }), /* @__PURE__ */ React.createElement("text", { x: cx, y: cy - 6, textAnchor: "middle", fontSize: "8", fill: k, fontFamily: "Georgia" }, decTekst(v)));
  })));
}
