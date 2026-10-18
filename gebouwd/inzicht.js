// Gebouwd uit jsx/inzicht.jsx door bouw-jsx.js; niet zelf aanpassen.
function komma(x, dec) {
  return getalTekst(x, dec);
}
function InzichtKaart({ titel, uitleg, children, rand }) {
  return /* @__PURE__ */ React.createElement("div", { style: { background: KBG, border: "1px solid " + (rand || KBDR), borderRadius: 10, padding: "12px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: GOUD, textTransform: "uppercase", letterSpacing: 1, marginBottom: uitleg ? 4 : 10 } }, titel), uitleg && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: WITD, opacity: 0.8, marginBottom: 10, lineHeight: 1.4 } }, uitleg), children);
}
function InzichtPaneel({ partijen, discipline }) {
  const inz = useMemo(function() {
    return berekenInzicht(partijen, discipline);
  }, [partijen, discipline]);
  const eenvoudig = useContext(EenvoudigContext);
  const [serieAantal, setSerieAantal] = useState(null);
  const [staaf, setStaaf] = useState(null);
  const [poedelStaaf, setPoedelStaaf] = useState(null);
  const [watAls, setWatAls] = useState({ sleutel: null, beurten: [] });
  const [watAlsCar, setWatAlsCar] = useState(null);
  const [acqKeuze, setAcqKeuze] = useState({});
  const grafiekRefs = useRef({});
  useEffect(function() {
    Object.keys(grafiekRefs.current).forEach(function(k) {
      const el = grafiekRefs.current[k];
      if (el) el.scrollLeft = el.scrollWidth;
    });
  }, [partijen, discipline]);
  const [vgModus, setVgModus] = useState("helften");
  const [vgVanaf, setVgVanaf] = useState(null);
  const maanden = useMemo(function() {
    return maandenVan(partijen);
  }, [partijen]);
  const vanaf = maanden.indexOf(vgVanaf) > 0 ? vgVanaf : standaardVanaf(partijen);
  const vg = useMemo(function() {
    return vergelijkSeries(partijen, discipline, vgModus, { vanaf });
  }, [partijen, discipline, vgModus, vanaf]);
  if (!inz) return /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, color: WITD, padding: "8px 0" } }, t("Nog geen beurten in deze selectie."));
  const dec = discipline === "driebanden" ? 3 : 2;
  const metOpm = !eenvoudig || inz.dekking.bijgehouden > 0;
  const pctTekst = procentTekst;
  const icoon = { vorm: "📊", hoogste: "🏆", poedeltrend: "⭕", poedel: "⭕", sterk: "💪", werk: "🎯", motor: "⚙️", serie: "🔥", mentaal: "🧘", omstandigheid: "🧭", trend: "📈" };
  const spelZinnen = inz.coach.filter(function(c) {
    return c.soort !== "omstandigheid";
  });
  const omstZinnen = inz.coach.filter(function(c) {
    return c.soort === "omstandigheid";
  });
  const zin = function(c, i, lijst) {
    return /* @__PURE__ */ React.createElement("div", { key: i, style: { display: "flex", gap: 10, alignItems: "flex-start", marginBottom: i < lijst.length - 1 ? 10 : 0 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 18, lineHeight: 1.3, flexShrink: 0 } }, icoon[c.soort]), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 14, color: WIT, lineHeight: 1.45 } }, c.tekst));
  };
  const kopje = function(x) {
    return /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: GOUDL, textTransform: "uppercase", letterSpacing: 1, margin: "4px 0 8px", opacity: 0.85 } }, x);
  };
  const se = inz.series;
  const groepKleur = [ROOD, "#7d8f72", GOUD, GRNT, GOUDL, "#ff9f40"];
  const kleurVan = function(i) {
    return groepKleur[Math.min(i, groepKleur.length - 1)];
  };
  const groepNaam = function(g) {
    return g.van === 0 ? t("Poedels") : t("Series van {n}", { n: g.label.replace("-", "–") });
  };
  const labels = function(l) {
    return l.map(function(x) {
      return t(x);
    }).join(", ");
  };
  const k1 = function(x) {
    return komma(x, 1);
  };
  const blokjes = (function() {
    const N = se.hefboom.beurten, ruw = se.nu.groepen.map(function(g) {
      return g.perPartij * N / Math.max(se.nu.beurtenPP, 1);
    });
    const af = ruw.map(Math.floor);
    let rest = N - af.reduce(function(s, x) {
      return s + x;
    }, 0);
    ruw.map(function(x, i) {
      return { i, r: x - Math.floor(x) };
    }).sort(function(a, b) {
      return b.r - a.r;
    }).forEach(function(x) {
      if (rest > 0) {
        af[x.i]++;
        rest--;
      }
    });
    const lijst = [];
    af.forEach(function(aantal, i) {
      for (let j = 0; j < aantal; j++) lijst.push(i);
    });
    return lijst;
  })();
  const maxGebruik = Math.max(1, ...inz.profiel.map(function(x) {
    return x.gebruik;
  }));
  const maxSerie = Math.max(1, ...inz.seriemakers.map(function(x) {
    return x.gem;
  }));
  const stoppers = inz.seriestoppers.filter(function(x) {
    return x.aantal >= 3;
  }).slice(0, 6);
  const maxStop = Math.max(0.01, ...stoppers.map(function(x) {
    return x.aandeel;
  }));
  const metTafels = inz.dekking.perTafel.filter(function(x) {
    return x.partijen > 0;
  });
  const hoofdTafel = metTafels.slice().sort(function(a, b) {
    return b.bijgehouden - a.bijgehouden;
  })[0];
  const dekkingWaarschuwing = inz.dekking.bijgehouden >= 3 && metTafels.length > 1 && hoofdTafel && hoofdTafel.bijgehouden / inz.dekking.bijgehouden >= 0.75 ? t("Dat zegt dus vooral iets over je spel op de {tafel}.", { tafel: tafelLabel(hoofdTafel.tafel) }) : null;
  const pctKleur = function(p) {
    return p >= inz.refPct + 0.1 ? GRNT : p <= inz.refPct - 0.1 ? ROOD : GOUD;
  };
  return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { background: "linear-gradient(160deg,var(--c-24401f),var(--c-132613))", border: "1px solid " + GOUD, borderRadius: 12, padding: "14px 12px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: GOUD, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 } }, t("Wat je data zegt")), inz.coach.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, color: WITD, lineHeight: 1.5 } }, t("Nog te weinig opmerkingen in deze selectie voor duidelijke conclusies. Vink in een partij na elke beurt aan waardoor je serie eindigde en wat goed ging, dan vult dit zich vanzelf.")) : /* @__PURE__ */ React.createElement(React.Fragment, null, spelZinnen.length > 0 && kopje(t("Je spel")), spelZinnen.map(zin), omstZinnen.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { height: 12 } }), omstZinnen.length > 0 && kopje(t("Omstandigheden")), omstZinnen.map(zin)), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: WITD, opacity: 0.8, marginTop: 12, lineHeight: 1.45, borderTop: "1px solid " + KBDR, paddingTop: 8 } }, "📋 ", t("Technieken en series: {a} van je {b} partijen bijgehouden (minstens {p} van de beurten met een opmerking); alleen die tellen mee.", { a: inz.dekking.bijgehouden, b: inz.dekking.partijen, p: pctTekst(INZICHT_DEKKING) }), inz.dekking.perTafel.length > 1 && " " + t("Per tafel:") + " " + inz.dekking.perTafel.map(function(x) {
    return tafelLabel(x.tafel) + " " + t("{a} van {b}", { a: x.bijgehouden, b: x.partijen });
  }).join(", ") + ".", dekkingWaarschuwing && /* @__PURE__ */ React.createElement("span", { style: { color: GOUDL } }, " ", dekkingWaarschuwing), " ", t("Tafel, avond en fase gaan over al je partijen. Conclusies pas vanaf {n} voorbeelden.", { n: INZICHT_MIN }))), inz.hoogste && (function() {
    const hs = inz.hoogste;
    const oordeelStijl = { beter: ["✅ " + t("Gaat de goede kant op"), GRNT], stabiel: ["➖ " + t("Blijft gelijk"), GOUD], minder: ["⚠️ " + t("Heeft nog wat nodig"), ROOD] };
    const hoogsteOoit = Math.max(1, ...hs.perTafel.map(function(x) {
      return x.record ? x.record.car : 0;
    }));
    return /* @__PURE__ */ React.createElement(
      InzichtKaart,
      {
        titel: t("Je hoogste series"),
        rand: GOUD,
        uitleg: t("Per tafel je record en je hoogste serie per partij. Je laatste partijen (fel) tegenover die ervoor (vaag): gaat het de goede kant op? Grote series = {n} of meer.", { n: hs.grootMin })
      },
      hs.perTafel.map(function(x) {
        const o = x.oordeel ? oordeelStijl[x.oordeel] : null;
        return /* @__PURE__ */ React.createElement("div", { key: x.tafel, style: { background: "rgba(0,0,0,0.2)", borderRadius: 8, padding: "10px", marginBottom: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, gap: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 14, color: WIT, fontWeight: "bold" } }, hs.perTafel.length > 1 ? tafelLabel(x.tafel) : t("Alle partijen")), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: o ? o[1] : WITD, fontWeight: o ? "bold" : "normal", textAlign: "right" } }, o ? o[0] : t("Nog te weinig partijen voor een oordeel"))), x.record && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 30, fontWeight: "bold", color: "#ff9f40", lineHeight: 1 } }, "🏆 ", x.record.car), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: WITD } }, t("record"), " · ", fmtDatum(x.record.datum), " · p", x.record.nr, ", ", t("beurt {b}", { b: x.record.beurt }))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: WITD, marginBottom: 4, lineHeight: 1.4 } }, t("Per partij al je series van {n}+ (geen {n}+? dan je hoogste). Eén vlakje = één partij; scroll naar links voor eerdere partijen, tik voor details.", { n: hs.vanaf })), /* @__PURE__ */ React.createElement("div", { ref: function(el) {
          grafiekRefs.current[x.tafel || "alle"] = el;
        }, style: { overflowX: "auto", WebkitOverflowScrolling: "touch", paddingBottom: 4 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "flex-end", gap: 5, width: "max-content", minWidth: "100%" } }, x.partijen.map(function(p, i) {
          const recent = i >= x.partijen.length - x.aantal;
          const gekozen = staaf && staaf.tafel === x.tafel && staaf.nr === p.nr;
          const staven = p.series.length ? p.series.slice().sort(function(a, b) {
            return a.beurt - b.beurt;
          }) : [{ car: p.max, beurt: p.beurt }];
          const zwak = !gekozen && !recent;
          return /* @__PURE__ */ React.createElement(
            "div",
            {
              key: p.nr,
              onClick: function() {
                setStaaf(gekozen ? null : { tafel: x.tafel, nr: p.nr });
              },
              style: { display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", flexShrink: 0 }
            },
            /* @__PURE__ */ React.createElement("div", { style: {
              display: "flex",
              alignItems: "flex-end",
              gap: 2,
              height: 76,
              padding: "0 3px",
              borderRadius: "4px 4px 0 0",
              background: gekozen ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.05)",
              // Rand binnen het vlakje (altijd 1px, anders transparant): een outline valt buiten en wordt door het scrollvak afgeknipt
              border: "1px solid " + (gekozen ? WIT : "transparent"),
              borderBottom: "none"
            } }, staven.map(function(s) {
              const isRecord = x.record && p.nr === x.record.nr && s.beurt === x.record.beurt;
              return /* @__PURE__ */ React.createElement("div", { key: s.beurt, style: { width: 13, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 9, color: zwak ? WITD : WIT, opacity: zwak ? 0.6 : 1, marginBottom: 1, fontWeight: isRecord ? "bold" : "normal" } }, s.car), /* @__PURE__ */ React.createElement("div", { className: "staaf-groei", style: {
                width: "100%",
                height: Math.max(2, s.car / hoogsteOoit * 58),
                background: beurtKleur(s.car, discipline),
                opacity: zwak ? 0.35 : 1,
                borderRadius: "2px 2px 0 0",
                boxShadow: isRecord ? "0 0 0 1px " + WIT : "none"
              } }));
            })),
            /* @__PURE__ */ React.createElement("div", { style: { fontSize: 8, color: gekozen ? WIT : WITD, opacity: zwak ? 0.6 : 1, marginTop: 2, whiteSpace: "nowrap" } }, "p", p.nr)
          );
        }))), /* @__PURE__ */ React.createElement("div", { style: { height: 1, background: "rgba(255,255,255,0.15)", marginBottom: 8 } }), (function() {
          const p = staaf && staaf.tafel === x.tafel ? x.partijen.find(function(y) {
            return y.nr === staaf.nr;
          }) : null;
          if (!p) return null;
          return /* @__PURE__ */ React.createElement("div", { style: { background: "rgba(255,255,255,0.05)", border: "1px solid " + KBDR, borderRadius: 6, padding: "7px 9px", marginBottom: 8 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: WIT } }, "p", p.nr, " · ", fmtDatum(p.datum), " · ", t("gemiddelde"), " ", komma(p.gem, dec)), /* @__PURE__ */ React.createElement("span", { onClick: function() {
            setStaaf(null);
          }, style: { fontSize: 14, color: WITD, cursor: "pointer", padding: "0 2px" } }, "✕")), (function() {
            const rijen = p.series.length ? p.series : [{ car: p.max, beurt: p.beurt, goed: p.goed, gemist: p.gemist }];
            return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: WITD, marginTop: 2 } }, /* @__PURE__ */ React.createElement("span", { style: { color: ROOD } }, "⭕ ", t("{n} poedels", { n: p.poedels })), " ", t("van de {n} beurten", { n: p.n }), " (", Math.round(p.poedels / Math.max(1, p.n) * 100), "%)"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: WITD, marginTop: 2 } }, p.series.length > 1 ? t("{s} series van {n} of meer in deze partij ({b} beurten):", { s: p.series.length, n: hs.vanaf, b: p.n }) : p.series.length === 1 ? t("1 serie van {n} of meer in deze partij ({b} beurten):", { n: hs.vanaf, b: p.n }) : t("Geen serie van {n} of meer; je hoogste ({b} beurten):", { n: hs.vanaf, b: p.n })), rijen.map(function(s, i) {
              return /* @__PURE__ */ React.createElement("div", { key: i, style: { display: "flex", gap: 8, padding: "4px 0", borderTop: i ? "1px solid rgba(255,255,255,0.06)" : "none" } }, /* @__PURE__ */ React.createElement("strong", { style: { width: 24, fontSize: 16, color: beurtKleur(s.car, discipline), lineHeight: 1.2 } }, s.car), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: WIT } }, t("beurt {b}", { b: s.beurt })), s.goed.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: GRNT, lineHeight: 1.35 } }, "✓ ", labels(s.goed)), s.gemist.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: ROOD, lineHeight: 1.35 } }, "✗ ", t("eindigde door:"), " ", labels(s.gemist)), !s.goed.length && !s.gemist.length && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: WITD, opacity: 0.7 } }, t("geen opmerkingen bijgehouden"))));
            }));
          })());
        })(), x.aantal > 0 && x.voor.partijen > 0 && /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 6, alignItems: "center", fontSize: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { color: WITD, textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 } }, t("{n} ervoor", { n: x.voor.partijen })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("strong", { style: { fontSize: 16, color: WIT } }, k1(x.voor.hoogste)), " ", t("hoogste")), /* @__PURE__ */ React.createElement("div", null, k1(x.voor.groot), " × ", hs.grootMin, "+ ", t("per partij"))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 16, color: o ? o[1] : WITD } }, "→"), /* @__PURE__ */ React.createElement("div", { style: { color: WITD, textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 } }, t("laatste {n}", { n: x.aantal })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("strong", { style: { fontSize: 16, color: o ? o[1] : WIT } }, k1(x.na.hoogste)), " ", t("hoogste")), /* @__PURE__ */ React.createElement("div", { style: { color: x.na.groot > x.voor.groot + 0.1 ? GRNT : x.na.groot < x.voor.groot - 0.1 ? ROOD : WITD } }, k1(x.na.groot), " × ", hs.grootMin, "+ ", t("per partij")))));
      }),
      hs.perAantal.length > 0 && (function() {
        const open = hs.perAantal.find(function(g) {
          return g.car === serieAantal;
        }) || hs.perAantal[0];
        const max = 30;
        return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: GOUDL, textTransform: "uppercase", letterSpacing: 0.5, margin: "4px 0 3px" } }, t("Al je series van {n} of meer", { n: hs.vanaf })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: WITD, opacity: 0.8, marginBottom: 8 } }, t("Tik een aantal aan om te zien wanneer het was.")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 } }, hs.perAantal.map(function(g) {
          const aan = g === open;
          return /* @__PURE__ */ React.createElement(
            "button",
            {
              key: g.car,
              onClick: function() {
                setSerieAantal(g.car);
              },
              style: {
                padding: "5px 10px",
                background: aan ? "var(--c-2d4a1e)" : "rgba(0,0,0,0.2)",
                border: "1px solid " + (aan ? GOUD : KBDR),
                borderRadius: 6,
                cursor: "pointer",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "baseline",
                gap: 4
              }
            },
            /* @__PURE__ */ React.createElement("strong", { style: { fontSize: 16, color: beurtKleur(g.car, discipline) } }, g.car),
            /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, color: aan ? GOUD : WITD } }, "×", g.series.length)
          );
        })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: WIT, marginBottom: 2 } }, /* @__PURE__ */ React.createElement("strong", { style: { color: beurtKleur(open.car, discipline) } }, open.series.length, "×"), " ", t("een serie van"), " ", /* @__PURE__ */ React.createElement("strong", { style: { color: beurtKleur(open.car, discipline) } }, open.car), ":"), open.series.slice(0, max).map(function(b, i) {
          return /* @__PURE__ */ React.createElement("div", { key: i, style: { padding: "7px 0", borderTop: i ? "1px solid rgba(255,255,255,0.06)" : "none" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: WIT } }, tafelLabel(b.tafel), " · ", fmtDatum(b.datum), " · p", b.nr, ", ", t("beurt {b} van {n}", { b: b.beurt, n: b.beurten })), b.goed.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: GRNT, lineHeight: 1.35 } }, "✓ ", labels(b.goed)), b.gemist.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: ROOD, lineHeight: 1.35 } }, "✗ ", t("eindigde door:"), " ", labels(b.gemist)), !b.goed.length && !b.gemist.length && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: WITD, opacity: 0.7 } }, t("geen opmerkingen bijgehouden")));
        }), open.series.length > max && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: WITD, paddingTop: 4 } }, t("en nog {n} keer", { n: open.series.length - max })));
      })()
    );
  })(), inz.poedels && (function() {
    const pd = inz.poedels;
    const oordeelStijl = { beter: ["✅ " + t("Gaat de goede kant op"), GRNT], stabiel: ["➖ " + t("Blijft gelijk"), GOUD], minder: ["⚠️ " + t("Heeft nog wat nodig"), ROOD] };
    const maxPct = Math.max(0.01, ...pd.perTafel.map(function(x) {
      return Math.max(...x.partijen.map(function(p) {
        return p.pct;
      }));
    }));
    const maxReden = Math.max(1, ...pd.redenen.map(function(x) {
      return x.aantal;
    }));
    return /* @__PURE__ */ React.createElement(
      InzichtKaart,
      {
        titel: t("Je poedels"),
        rand: ROOD,
        uitleg: t("Met een poedel maak je in die beurt niets. Per tafel je poedels per partij, in procenten van je beurten (hoogte) en in aantal (getal). Lager is beter.")
      },
      pd.perTafel.map(function(x) {
        const o = x.oordeel ? oordeelStijl[x.oordeel] : null;
        const kleur = function(p) {
          return p.pct <= x.alle.pct - 0.05 ? GRNT : p.pct >= x.alle.pct + 0.05 ? ROOD : GOUD;
        };
        const gekozenP = poedelStaaf && poedelStaaf.tafel === x.tafel ? x.partijen.find(function(y) {
          return y.nr === poedelStaaf.nr;
        }) : null;
        return /* @__PURE__ */ React.createElement("div", { key: x.tafel, style: { background: "rgba(0,0,0,0.2)", borderRadius: 8, padding: "10px", marginBottom: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, gap: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 14, color: WIT, fontWeight: "bold" } }, pd.perTafel.length > 1 ? tafelLabel(x.tafel) : t("Alle partijen")), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: o ? o[1] : WITD, fontWeight: o ? "bold" : "normal", textAlign: "right" } }, o ? o[0] : t("Nog te weinig partijen voor een oordeel"))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 28, fontWeight: "bold", color: ROOD, lineHeight: 1, whiteSpace: "nowrap", flexShrink: 0 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 22 } }, "⭕"), " ", pctTekst(x.alle.pct)), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: WITD, flex: 1, minWidth: 0 } }, t("van je beurten · {a} per partij ({n} partijen)", { a: k1(x.alle.perPartij), n: x.partijen.length }))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: WITD, marginBottom: 8, lineHeight: 1.5 } }, t("Beste partij:"), " ", /* @__PURE__ */ React.createElement("strong", { style: { color: GRNT } }, t("{n} poedels", { n: x.beste.poedels })), " ", t("van {n}", { n: x.beste.n }), " (", pctTekst(x.beste.pct), ") · p", x.beste.nr, ", ", fmtDatum(x.beste.datum), x.langste.langste > 1 && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("br", null), t("Langste reeks:"), " ", /* @__PURE__ */ React.createElement("strong", { style: { color: ROOD } }, t("{n} poedels op rij", { n: x.langste.langste })), " · p", x.langste.nr, ", ", t("beurt {b}", { b: x.langste.langsteVan + "–" + (x.langste.langsteVan + x.langste.langste - 1) }))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: WITD, marginBottom: 4 } }, t("Per partij (scroll naar links voor eerdere, tik voor details):")), /* @__PURE__ */ React.createElement("div", { ref: function(el) {
          grafiekRefs.current["poedel" + (x.tafel || "alle")] = el;
        }, style: { overflowX: "auto", WebkitOverflowScrolling: "touch", paddingBottom: 4 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "flex-end", gap: 4, width: "max-content", minWidth: "100%" } }, x.partijen.map(function(p, i) {
          const recent = i >= x.partijen.length - x.aantal, gekozen = gekozenP === p, zwak = !gekozen && !recent;
          return /* @__PURE__ */ React.createElement(
            "div",
            {
              key: p.nr,
              onClick: function() {
                setPoedelStaaf(gekozen ? null : { tafel: x.tafel, nr: p.nr });
              },
              style: { display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", flexShrink: 0 }
            },
            /* @__PURE__ */ React.createElement("div", { style: {
              width: 21,
              height: 70,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-end",
              padding: "0 2px",
              borderRadius: "4px 4px 0 0",
              background: gekozen ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.05)",
              border: "1px solid " + (gekozen ? WIT : "transparent"),
              borderBottom: "none"
            } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 9, color: zwak ? WITD : WIT, opacity: zwak ? 0.6 : 1, marginBottom: 1 } }, p.poedels), /* @__PURE__ */ React.createElement("div", { className: "staaf-groei", style: { width: "100%", height: Math.max(2, p.pct / maxPct * 50), background: kleur(p), opacity: zwak ? 0.35 : 1, borderRadius: "2px 2px 0 0" } })),
            /* @__PURE__ */ React.createElement("div", { style: { fontSize: 8, color: gekozen ? WIT : WITD, opacity: zwak ? 0.6 : 1, marginTop: 2 } }, "p", p.nr)
          );
        }))), /* @__PURE__ */ React.createElement("div", { style: { height: 1, background: "rgba(255,255,255,0.15)", marginBottom: 8 } }), gekozenP && /* @__PURE__ */ React.createElement("div", { style: { background: "rgba(255,255,255,0.05)", border: "1px solid " + KBDR, borderRadius: 6, padding: "7px 9px", marginBottom: 8 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: WIT } }, "p", gekozenP.nr, " · ", fmtDatum(gekozenP.datum), " · ", t("gemiddelde"), " ", komma(gekozenP.gem, dec)), /* @__PURE__ */ React.createElement("span", { onClick: function() {
          setPoedelStaaf(null);
        }, style: { fontSize: 14, color: WITD, cursor: "pointer", padding: "0 2px" } }, "✕")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: WITD, marginTop: 2 } }, /* @__PURE__ */ React.createElement("strong", { style: { fontSize: 15, color: kleur(gekozenP) } }, t("{n} poedels", { n: gekozenP.poedels })), " ", t("van de {n} beurten", { n: gekozenP.n }), " (", pctTekst(gekozenP.pct), ")", gekozenP.langste > 1 ? " · " + t("langste reeks {n} op rij", { n: gekozenP.langste }) : ""), gekozenP.beurten.length > 0 && (function() {
          const sleutel = x.tafel + "-" + gekozenP.nr;
          const aan = watAls.sleutel === sleutel ? watAls.beurten : [];
          const acq = pd.acquit.find(function(a) {
            return a.tafel === x.tafel;
          });
          const standaard = Math.max(1, Math.round(acq && acq.anderGem ? acq.anderGem : 2));
          const v = watAlsCar || standaard;
          const wissel = function(b) {
            const nieuw = aan.indexOf(b) !== -1 ? aan.filter(function(y) {
              return y !== b;
            }) : aan.concat([b]);
            setWatAls({ sleutel, beurten: nieuw });
          };
          const nieuwGem = (gekozenP.totCar + aan.length * v) / gekozenP.n;
          const knop = function(tekst, klik, uit) {
            return /* @__PURE__ */ React.createElement("button", { onClick: klik, disabled: uit, style: { width: 26, height: 26, borderRadius: 13, border: "1px solid " + GOUD, background: "none", color: GOUD, fontSize: 15, lineHeight: 1, cursor: uit ? "default" : "pointer", opacity: uit ? 0.35 : 1, fontFamily: "inherit", padding: 0 } }, tekst);
          };
          return /* @__PURE__ */ React.createElement("div", { style: { marginTop: 6 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: WITD, marginBottom: 4 } }, t("Poedels in beurt (tik aan: wat als je die wel had gemaakt?"), gekozenP.acquitPoedels.length ? " " + t("A = acquit") : "", "):"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 4 } }, gekozenP.beurten.map(function(b) {
            const isAan = aan.indexOf(b) !== -1, isAcq = gekozenP.acquitPoedels.indexOf(b) !== -1;
            return /* @__PURE__ */ React.createElement("button", { key: b, onClick: function() {
              wissel(b);
            }, style: {
              minWidth: 26,
              fontSize: 12,
              padding: "2px 5px",
              borderRadius: 4,
              cursor: "pointer",
              fontFamily: "inherit",
              border: "1px solid " + (isAan ? GRNT : "transparent"),
              background: isAan ? "rgba(76,175,80,0.25)" : "rgba(224,85,85,0.25)",
              color: WIT
            } }, b, isAcq ? " A" : "", isAan ? " → " + v : "");
          })), aan.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 8, background: "rgba(76,175,80,0.08)", border: "1px solid rgba(76,175,80,0.35)", borderRadius: 6, padding: "7px 9px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: WITD, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("span", null, t("Elke omgezette poedel wordt")), knop("−", function() {
            setWatAlsCar(Math.max(1, v - 1));
          }, v <= 1), /* @__PURE__ */ React.createElement("strong", { style: { fontSize: 16, color: WIT, minWidth: 18, textAlign: "center" } }, v), knop("+", function() {
            setWatAlsCar(Math.min(30, v + 1));
          }, v >= 30), /* @__PURE__ */ React.createElement("span", null, t("caramboles"))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: WIT, marginTop: 6 } }, t("Gemiddelde deze partij:"), " ", komma(gekozenP.gem, dec), " → ", /* @__PURE__ */ React.createElement("strong", { style: { fontSize: 16, color: GRNT } }, komma(nieuwGem, dec)), /* @__PURE__ */ React.createElement("span", { style: { color: GRNT } }, " (+", komma(nieuwGem - gekozenP.gem, dec), ")")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: WITD, marginTop: 2 } }, t(aan.length > 1 ? "{n} poedels minder ({a} → {b}), {c} → {d} caramboles in {e} beurten." : "{n} poedel minder ({a} → {b}), {c} → {d} caramboles in {e} beurten.", { n: aan.length, a: gekozenP.poedels, b: gekozenP.poedels - aan.length, c: gekozenP.totCar, d: gekozenP.totCar + aan.length * v, e: gekozenP.n }), /* @__PURE__ */ React.createElement("span", { onClick: function() {
            setWatAls({ sleutel: null, beurten: [] });
          }, style: { color: GOUD, cursor: "pointer", marginLeft: 6 } }, t("Wissen")))));
        })(), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, lineHeight: 1.4, marginTop: 5, color: gekozenP.redenen.length ? ROOD : WITD, opacity: gekozenP.redenen.length ? 1 : 0.7 } }, gekozenP.redenen.length ? "✗ " + gekozenP.redenen.map(function(r) {
          return t(r.label) + (r.aantal > 1 ? " ×" + r.aantal : "");
        }).join(", ") : t("geen opmerkingen bij deze poedels"))), x.aantal > 0 && x.voor.partijen > 0 && /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 6, alignItems: "center", fontSize: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { color: WITD, textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 } }, t("{n} ervoor", { n: x.voor.partijen })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("strong", { style: { fontSize: 16, color: WIT } }, pctTekst(x.voor.pct)), " ", t("poedels")), /* @__PURE__ */ React.createElement("div", null, k1(x.voor.perPartij), " ", t("per partij"))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 16, color: o ? o[1] : WITD } }, "→"), /* @__PURE__ */ React.createElement("div", { style: { color: WITD, textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 } }, t("laatste {n}", { n: x.aantal })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("strong", { style: { fontSize: 16, color: o ? o[1] : WIT } }, pctTekst(x.na.pct)), " ", t("poedels")), /* @__PURE__ */ React.createElement("div", { style: { color: o ? o[1] : WITD } }, k1(x.na.perPartij), " ", t("per partij")))));
      }),
      pd.acquit.some(function(a) {
        return a.stoten >= 5;
      }) && /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: GOUDL, textTransform: "uppercase", letterSpacing: 0.5, margin: "4px 0 3px" } }, t("Wat als je acquit beter gaat?")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: WITD, opacity: 0.8, marginBottom: 8, lineHeight: 1.4 } }, t("Kies hoe vaak je acquit lukt en hoeveel je er dan van maakt; je ziet meteen je gemiddelde op die tafel. Eén acquit per partij, dus het effect is per partij klein maar telt over een seizoen op.")), pd.acquit.filter(function(a) {
        return a.stoten > 0 && a.stoten < 5;
      }).map(function(a) {
        return /* @__PURE__ */ React.createElement("div", { key: a.tafel, style: { fontSize: 11, color: WITD, opacity: 0.8, marginBottom: 6 } }, t("Op de {tafel} heb je de acquit nog maar {n} keer aangevinkt; vanaf 5 komt die tafel erbij.", { tafel: tafelLabel(a.tafel), n: a.stoten }));
      }), pd.acquit.filter(function(a) {
        return a.stoten >= 5;
      }).map(function(a) {
        const keuze = acqKeuze[a.tafel] || {};
        const kans = keuze.kans != null ? keuze.kans : a.kans;
        const echt = a.gemBijLukken || a.anderGem || 1, v = keuze.car != null ? keuze.car : Math.max(1, Math.round(echt));
        const reken = keuze.car != null ? keuze.car : echt;
        const zet = function(w) {
          setAcqKeuze(Object.assign({}, acqKeuze, { [a.tafel]: Object.assign({ kans: keuze.kans != null ? keuze.kans : null, car: keuze.car != null ? keuze.car : null }, w) }));
        };
        const extra = kans * a.stoten * reken - a.acqCar, nieuw = (a.car + extra) / a.beurten;
        const chip = function(aan, tekst, klik) {
          return /* @__PURE__ */ React.createElement("button", { key: tekst, onClick: klik, style: { padding: "3px 8px", background: aan ? "var(--c-2d4a1e)" : "none", border: "1px solid " + (aan ? GOUD : KBDR), borderRadius: 5, color: aan ? GOUD : WITD, fontSize: 12, cursor: "pointer", fontFamily: "inherit" } }, tekst);
        };
        const knop = function(tekst, klik, uit) {
          return /* @__PURE__ */ React.createElement("button", { onClick: klik, disabled: uit, style: { width: 26, height: 26, borderRadius: 13, border: "1px solid " + GOUD, background: "none", color: GOUD, fontSize: 15, lineHeight: 1, cursor: uit ? "default" : "pointer", opacity: uit ? 0.35 : 1, fontFamily: "inherit", padding: 0 } }, tekst);
        };
        return /* @__PURE__ */ React.createElement("div", { key: a.tafel, style: { background: "rgba(0,0,0,0.2)", borderRadius: 8, padding: "9px 10px", marginBottom: 8 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: WIT, fontWeight: "bold", marginBottom: 4 } }, pd.acquit.length > 1 ? tafelLabel(a.tafel) : t("Acquit")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: WITD, lineHeight: 1.5, marginBottom: 6 } }, t("Nu: lukt in"), " ", /* @__PURE__ */ React.createElement("strong", { style: { color: WIT } }, t("{a} van de {b}", { a: a.gelukt, b: a.stoten })), " (", pctTekst(a.kans), "); ", t("dan maak je er gemiddeld"), " ", /* @__PURE__ */ React.createElement("strong", { style: { color: WIT } }, komma(a.gemBijLukken, 1)), ".", " ", t("Je andere beurten: {p} raak, gemiddeld {g} als je scoort.", { p: pctTekst(a.anderKans), g: komma(a.anderGem, 1) })), a.stoten < 15 && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: GOUDL, lineHeight: 1.4, marginBottom: 6 } }, "⚠️ ", t("Nog maar {n} acquits aangevinkt op deze tafel, dus een ruwe schatting. Vink bij elke partij de acquit aan (Goed of Gemist), dan wordt dit steeds betrouwbaarder.", { n: a.stoten })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 5, alignItems: "center", marginBottom: 6 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, color: WITD, width: 62 } }, t("Lukt in")), chip(keuze.kans == null, t("nu {p}", { p: pctTekst(a.kans) }), function() {
          zet({ kans: null });
        }), [0.5, 0.6, 0.75, 1].filter(function(k) {
          return Math.abs(k - a.kans) > 0.01;
        }).map(function(k) {
          return chip(keuze.kans === k, pctTekst(k), function() {
            zet({ kans: k });
          });
        })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center", marginBottom: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, color: WITD, width: 62 } }, t("Je maakt dan")), knop("−", function() {
          zet({ car: Math.max(1, v - 1) });
        }, v <= 1), /* @__PURE__ */ React.createElement("strong", { style: { fontSize: 16, color: WIT, minWidth: 18, textAlign: "center" } }, keuze.car != null ? v : komma(echt, 1)), knop("+", function() {
          zet({ car: Math.min(30, v + 1) });
        }, v >= 30), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, color: WITD } }, t("caramboles"), keuze.car == null ? " (" + t("nu") + ")" : "")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: WIT } }, t("Gemiddelde:"), " ", komma(a.gem, dec), " → ", /* @__PURE__ */ React.createElement("strong", { style: { fontSize: 16, color: nieuw >= a.gem ? GRNT : ROOD } }, komma(nieuw, dec)), /* @__PURE__ */ React.createElement("span", { style: { color: nieuw >= a.gem ? GRNT : ROOD } }, " (", Math.abs(nieuw - a.gem) < 5e-3 ? "±" : nieuw >= a.gem ? "+" : "−", komma(Math.abs(nieuw - a.gem), dec), ")")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: WITD, marginTop: 2 } }, t("Dat is {v} caramboles per partij ({n} partijen).", { v: (Math.abs(extra) < 0.05 ? "±" : extra >= 0 ? "+" : "−") + komma(Math.abs(extra / Math.max(1, a.partijen)), 1), n: a.partijen })));
      })),
      pd.redenen.length > 0 && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: GOUDL, textTransform: "uppercase", letterSpacing: 0.5, margin: "4px 0 3px" } }, t("Waardoor je poedelt")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: WITD, opacity: 0.8, marginBottom: 8 } }, t("Bij {a} van je {b} poedels heb je aangevinkt wat er misging.", { a: pd.metReden, b: pd.totaal })), pd.redenen.slice(0, 8).map(function(x) {
        return /* @__PURE__ */ React.createElement("div", { key: x.label, style: { display: "flex", alignItems: "center", gap: 8, fontSize: 12, marginBottom: 5 } }, /* @__PURE__ */ React.createElement("span", { style: { width: 110, color: WIT, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, t(x.label)), /* @__PURE__ */ React.createElement("span", { style: { flex: 1, height: 7, background: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden" } }, /* @__PURE__ */ React.createElement("span", { style: { display: "block", width: x.aantal / maxReden * 100 + "%", height: "100%", background: ROOD } })), /* @__PURE__ */ React.createElement("span", { style: { width: 62, textAlign: "right", color: WITD } }, x.aantal, "× (", pctTekst(x.aantal / Math.max(1, pd.metReden)), ")"));
      }))
    );
  })(), !eenvoudig && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
    InzichtKaart,
    {
      titel: t("Poedels en series"),
      uitleg: t("Elke beurt eindigt met een misser. Je gemiddelde gaat alleen omhoog door minder poedels en grotere series. Hier tellen alle partijen mee, ook de geschrapte.")
    },
    /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: WITD, marginBottom: 6 } }, t("Je gemiddelde partij van {n} beurten:", { n: se.hefboom.beurten })),
    /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 3, marginBottom: 6 } }, blokjes.map(function(i, j) {
      return /* @__PURE__ */ React.createElement("div", { key: j, style: { width: 14, height: 14, borderRadius: 3, background: kleurVan(i) } });
    })),
    /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: WITD, display: "flex", flexWrap: "wrap", gap: "2px 10px", marginBottom: 4 } }, se.nu.groepen.map(function(g, i) {
      return /* @__PURE__ */ React.createElement("span", { key: g.label }, /* @__PURE__ */ React.createElement("span", { style: { color: kleurVan(i) } }, "■"), " ", g.van === 0 ? t("poedel") : g.label.replace("-", "–"));
    })),
    (function() {
      const zeldzaam = se.nu.groepen.filter(function(g) {
        return g.van > 0 && g.perPartij > 0 && g.perPartij < 0.5;
      });
      return zeldzaam.length ? /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: WITD, opacity: 0.8, marginBottom: 4 } }, zeldzaam.map(function(g) {
        return t("Series van {n}: gemiddeld {g} per partij (ongeveer 1 op de {x} partijen)", { n: g.label.replace("-", "–"), g: k1(g.perPartij), x: Math.round(1 / g.perPartij) });
      }).join(". "), ".") : null;
    })(),
    /* @__PURE__ */ React.createElement("div", { style: { display: "flex", fontSize: 10, color: WITD, textTransform: "uppercase", letterSpacing: 0.5, margin: "10px 0 2px" } }, /* @__PURE__ */ React.createElement("span", { style: { flex: 1 } }), /* @__PURE__ */ React.createElement("span", { style: { width: 44, textAlign: "right" } }, t("per partij")), /* @__PURE__ */ React.createElement("span", { style: { width: 110, textAlign: "right" } }, t("van je caramboles"))),
    se.nu.groepen.map(function(g, i) {
      return /* @__PURE__ */ React.createElement("div", { key: g.label, style: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, padding: "4px 0", borderTop: i ? "1px solid rgba(255,255,255,0.05)" : "none" } }, /* @__PURE__ */ React.createElement("span", { style: { flex: 1, color: WIT, whiteSpace: "nowrap" } }, /* @__PURE__ */ React.createElement("span", { style: { color: kleurVan(i) } }, "■"), " ", groepNaam(g)), /* @__PURE__ */ React.createElement("span", { style: { width: 36, textAlign: "right", color: WIT, fontWeight: "bold" } }, k1(g.perPartij)), /* @__PURE__ */ React.createElement("span", { style: { width: 66, height: 7, background: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden" } }, /* @__PURE__ */ React.createElement("span", { style: { display: "block", width: g.carAandeel * 100 + "%", height: "100%", background: kleurVan(i) } })), /* @__PURE__ */ React.createElement("span", { style: { width: 34, textAlign: "right", color: g.van === 0 ? ROOD : WITD } }, g.van === 0 ? "0" : pctTekst(g.carAandeel)));
    }),
    (function() {
      const chip = function(aan, tekst, klik, key) {
        return /* @__PURE__ */ React.createElement("button", { key: key || tekst, onClick: klik, style: {
          flex: "0 0 auto",
          padding: "4px 10px",
          background: aan ? "var(--c-2d4a1e)" : "none",
          border: "1px solid " + (aan ? GOUD : KBDR),
          borderRadius: 5,
          color: aan ? GOUD : WITD,
          fontSize: 12,
          cursor: "pointer",
          fontFamily: "inherit",
          whiteSpace: "nowrap"
        } }, tekst);
      };
      const kop = {
        helften: inz.helftLabels ? t("Eerder tegenover nu") + " · " + inz.helftLabels.eerste + " → " + inz.helftLabels.tweede : t("Eerder tegenover nu"),
        laatste10: t("Je laatste partijen tegenover die ervoor"),
        goedslecht: t("Je slechtste tegenover je beste partijen"),
        vanaf: t("Vóór {m} → vanaf {m}", { m: maandTekst(vanaf) })
      }[vgModus];
      const uitleg = {
        helften: null,
        laatste10: t("Per tafel je laatste 10 partijen (bij minder dan 20 partijen de laatste helft) tegenover alles daarvoor."),
        goedslecht: t("Per tafel je slechtste derde tegenover je beste derde partijen (op gemiddelde): waar zit het verschil tussen een goede en een slechte partij?"),
        vanaf: t("Kies vanaf welke maand: alles daarvoor tegenover alles daarna, bijv. sinds de zomerstop of sinds je anders traint.")
      }[vgModus];
      return /* @__PURE__ */ React.createElement("div", { style: { marginTop: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: WITD, marginBottom: 5 } }, t("Vergelijk:")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 } }, [["helften", t("Eerder vs nu")], ["laatste10", t("Recent vs ervoor")], ["goedslecht", t("Goed vs slecht")], ["vanaf", t("Vanaf")]].map(function(x) {
        return chip(vgModus === x[0], x[1], function() {
          setVgModus(x[0]);
        }, x[0]);
      })), vgModus === "vanaf" && maanden.length > 1 && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 } }, maanden.slice(1).map(function(m) {
        return chip(m === vanaf, maandTekst(m), function() {
          setVgVanaf(m);
        }, m);
      })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: GOUDL, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: uitleg ? 3 : 6 } }, kop), uitleg && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: WITD, opacity: 0.8, marginBottom: 6, lineHeight: 1.4 } }, uitleg), vg.vergelijkingen.length === 0 && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: WITD, padding: "6px 0" } }, t("Te weinig partijen om zo te vergelijken (minstens 3 partijen per kant, per tafel).")), vg.vergelijkingen.map(function(v) {
        return /* @__PURE__ */ React.createElement("div", { key: v.tafel || "alle", style: { background: "rgba(0,0,0,0.2)", borderRadius: 8, padding: "8px 10px", marginBottom: 8 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: v.labelA ? 2 : 6 } }, /* @__PURE__ */ React.createElement("span", { style: { color: WIT, fontWeight: "bold" } }, v.tafel ? tafelLabel(v.tafel) : t("Alle partijen")), /* @__PURE__ */ React.createElement("span", { style: { color: WITD } }, t("gemiddelde"), " ", komma(v.e.gem, dec), " → ", /* @__PURE__ */ React.createElement("strong", { style: { color: v.w.gem >= v.e.gem ? GRNT : ROOD } }, komma(v.w.gem, dec)))), v.labelA && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: WITD, textAlign: "right", marginBottom: 6 } }, v.labelA, " → ", v.labelB), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", fontSize: 10, color: WITD, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 } }, /* @__PURE__ */ React.createElement("span", { style: { flex: 1 } }), /* @__PURE__ */ React.createElement("span", { style: { width: 84, textAlign: "right" } }, t("per partij")), /* @__PURE__ */ React.createElement("span", { style: { width: 64, textAlign: "right" } }, t("effect"))), v.e.groepen.map(function(g, i) {
          const w = v.w.groepen[i], eff = v.bijdrage[i];
          const beter = g.van === 0 ? w.perPartij < g.perPartij - 0.2 : eff > 0.02, slechter = g.van === 0 ? w.perPartij > g.perPartij + 0.2 : eff < -0.02;
          return /* @__PURE__ */ React.createElement("div", { key: g.label, style: { display: "flex", fontSize: 12, padding: "2px 0" } }, /* @__PURE__ */ React.createElement("span", { style: { flex: 1, color: WITD } }, /* @__PURE__ */ React.createElement("span", { style: { color: kleurVan(i) } }, "■"), " ", groepNaam(g)), /* @__PURE__ */ React.createElement("span", { style: { width: 84, textAlign: "right", color: WIT } }, k1(g.perPartij), " → ", k1(w.perPartij)), /* @__PURE__ */ React.createElement("span", { style: { width: 64, textAlign: "right", color: beter ? GRNT : slechter ? ROOD : WITD } }, g.van === 0 ? beter ? "▼ " + t("minder") : slechter ? "▲ " + t("meer") : "≈" : Math.abs(eff) < 5e-3 ? "≈" : (eff > 0 ? "+" : "−") + komma(Math.abs(eff), 2)));
        }), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", fontSize: 12, padding: "4px 0 0", marginTop: 2, borderTop: "1px solid rgba(255,255,255,0.08)" } }, /* @__PURE__ */ React.createElement("span", { style: { flex: 1, color: WITD } }, "🔥 ", t("Hoogste serie")), /* @__PURE__ */ React.createElement("span", { style: { width: 84, textAlign: "right", color: WIT } }, k1(v.e.hoogste), " → ", k1(v.w.hoogste)), /* @__PURE__ */ React.createElement("span", { style: { width: 64 } })));
      }), vg.vergelijkingen.length > 0 && vg.teWeinig.filter(Boolean).length > 0 && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: WITD, opacity: 0.8, marginBottom: 6 } }, t("Te weinig partijen voor deze vergelijking op de {tafels}.", { tafels: vg.teWeinig.filter(Boolean).map(tafelLabel).join(", ").replace(/, ([^,]*)$/, " " + t("en") + " $1") })), vg.vergelijkingen.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: WITD, opacity: 0.8 } }, t('"Effect" is hoeveel die groep je gemiddelde omhoog (+) of omlaag (−) bracht; samen is dat precies het verschil. Minder poedels zie je terug als meer series. "Per partij" hangt ook af van hoe lang de partijen waren.')));
    })(),
    /* @__PURE__ */ React.createElement("div", { style: { marginTop: 14, background: "rgba(201,168,76,0.08)", border: "1px solid " + KBDR, borderRadius: 8, padding: "10px 12px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: GOUDL, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 } }, t("Wat levert het op? (partij van {n} beurten)", { n: se.hefboom.beurten })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 13, padding: "3px 0" } }, /* @__PURE__ */ React.createElement("span", { style: { color: WITD } }, t("1 poedel minder (een beurt van {n})", { n: se.hefboom.klein })), /* @__PURE__ */ React.createElement("strong", { style: { color: GRNT } }, "+", komma(se.hefboom.klein / se.hefboom.beurten, 2))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 13, padding: "3px 0" } }, /* @__PURE__ */ React.createElement("span", { style: { color: WITD } }, t("1 serie van {n} in plaats van een poedel", { n: se.hefboom.groot })), /* @__PURE__ */ React.createElement("strong", { style: { color: GRNT } }, "+", komma(se.hefboom.groot / se.hefboom.beurten, 2))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: WIT, marginTop: 4 } }, t("Eén grote serie is evenveel waard als {n} poedels minder.", { n: Math.round(se.hefboom.groot / se.hefboom.klein) }))),
    /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { background: "rgba(0,0,0,0.2)", borderRadius: 8, padding: "8px 6px", textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 18, fontWeight: "bold", color: GOUDL } }, pctTekst(inz.motor.carPct)), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: WITD, lineHeight: 1.3 } }, t("van je caramboles uit {p} van je beurten ({n}+)", { p: pctTekst(inz.motor.beurtPct), n: inz.motor.drempel }))), /* @__PURE__ */ React.createElement("div", { style: { background: "rgba(0,0,0,0.2)", borderRadius: 8, padding: "8px 6px", textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: WITD, lineHeight: 1.3, marginBottom: 3 } }, t("kans op nog een poedel na een poedel")), inz.poedel.perTafel.length === 0 && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 18, fontWeight: "bold", color: WITD } }, "—"), inz.poedel.perTafel.map(function(x) {
      const verschil = x.naPoedel - x.naScore;
      return /* @__PURE__ */ React.createElement("div", { key: x.tafel || "alle", style: { fontSize: 12, color: WITD, lineHeight: 1.4 } }, x.tafel ? tafelLabel(x.tafel) + dubbelePunt() : "", /* @__PURE__ */ React.createElement("strong", { style: { fontSize: 15, color: verschil >= 0.05 ? ROOD : verschil <= -0.03 ? GRNT : GOUDL } }, pctTekst(x.naPoedel)), " ", /* @__PURE__ */ React.createElement("span", { style: { fontSize: 10 } }, "(", t("na score {p}", { p: pctTekst(x.naScore) }), ")"));
    })))
  )), metOpm && inz.profiel.length > 0 && /* @__PURE__ */ React.createElement(
    InzichtKaart,
    {
      titel: t("Je speelprofiel per techniek"),
      uitleg: t("Lengte = hoe vaak de techniek voorkwam, groen = ging goed, rood = serie eindigde erdoor. Een lange rode balk betekent niet dat je er slecht in bent: misschien speel je hem gewoon veel. Kijk naar het percentage; gemiddeld over al je technieken is dat {p}.", { p: pctTekst(inz.refPct) })
    },
    inz.profiel.map(function(x) {
      const weinig = x.gebruik < INZICHT_MIN;
      return /* @__PURE__ */ React.createElement("div", { key: x.label, style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 7, opacity: weinig ? 0.45 : 1 } }, /* @__PURE__ */ React.createElement("div", { style: { width: 92, flexShrink: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: WIT, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, t(x.label)), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: WITD } }, x.gebruik, "× · ", t("{n} goed", { n: x.goed }))), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, height: 14, display: "flex" } }, /* @__PURE__ */ React.createElement("div", { style: { width: x.gebruik / maxGebruik * 100 + "%", display: "flex", borderRadius: 4, overflow: "hidden", minWidth: 4 } }, /* @__PURE__ */ React.createElement("div", { style: { width: x.pct * 100 + "%", background: GRNT } }), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, background: "#b84a4a" } }))), /* @__PURE__ */ React.createElement("div", { style: { width: 40, textAlign: "right", fontSize: 14, fontWeight: "bold", color: weinig ? WITD : pctKleur(x.pct) } }, pctTekst(x.pct)));
    }),
    /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: WITD, marginTop: 6, display: "flex", gap: 12, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("span", { style: { color: GRNT } }, "■"), " ", t("ging goed")), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("span", { style: { color: "#b84a4a" } }, "■"), " ", t("serie eindigde erdoor")), /* @__PURE__ */ React.createElement("span", { style: { opacity: 0.6 } }, t("vaag = minder dan {n}×", { n: INZICHT_MIN }))),
    inz.acquitPartijen > 0 && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: WITD, opacity: 0.8, marginTop: 6 } }, t("Acquit: in je {n} partijen op de 2,30 tot 14 oktober 2026 telt beurt 1 als acquit (caramboles = gemaakt, poedel = gemist). Daarna alleen als je hem zelf aanvinkt.", { n: inz.acquitPartijen }))
  ), metOpm && inz.seriemakers.length > 0 && /* @__PURE__ */ React.createElement(
    InzichtKaart,
    {
      titel: t("Wat levert grote series op"),
      uitleg: t("Gemiddeld aantal caramboles in beurten waarin dit goed ging, tegenover je gemiddelde van {g} per beurt in de bijgehouden partijen.", { g: komma(inz.basisTag, dec) })
    },
    inz.seriemakers.map(function(x) {
      return /* @__PURE__ */ React.createElement("div", { key: x.label, style: { marginBottom: 8 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 3 } }, /* @__PURE__ */ React.createElement("span", { style: { color: WIT } }, t(x.label), " ", /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, color: WITD } }, "(", x.aantal, "×)")), /* @__PURE__ */ React.createElement("span", { style: { color: GOUDL, fontWeight: "bold" } }, komma(x.gem, 1), " car ", /* @__PURE__ */ React.createElement("span", { style: { color: GRNT } }, "· ", komma(x.factor, 1), "×"))), /* @__PURE__ */ React.createElement("div", { style: { height: 8, background: "rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { width: x.gem / maxSerie * 100 + "%", height: "100%", background: "linear-gradient(90deg," + GOUD + "," + GOUDL + ")", borderRadius: 4 } })));
    })
  ), metOpm && stoppers.length > 0 && /* @__PURE__ */ React.createElement(
    InzichtKaart,
    {
      titel: t("Waardoor eindigden je series"),
      uitleg: t("Van de {n} beurten waarbij je aanvinkte waardoor de serie eindigde. Beschrijvend, geen oordeel.", { n: inz.metOorzaak })
    },
    stoppers.map(function(x) {
      return /* @__PURE__ */ React.createElement("div", { key: x.label, style: { marginBottom: 8 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 3 } }, /* @__PURE__ */ React.createElement("span", { style: { color: WIT } }, t(x.label)), /* @__PURE__ */ React.createElement("span", { style: { color: WITD } }, /* @__PURE__ */ React.createElement("strong", { style: { color: "#e08055" } }, pctTekst(x.aandeel)), " · ", t("gem {g} car in die beurt", { g: komma(x.gem, 1) }))), /* @__PURE__ */ React.createElement("div", { style: { height: 8, background: "rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { width: x.aandeel / maxStop * 100 + "%", height: "100%", background: "#b8604a", borderRadius: 4 } })));
    })
  ), !eenvoudig && inz.omstandigheden.length > 0 && /* @__PURE__ */ React.createElement(InzichtKaart, { titel: t("Omstandigheden"), uitleg: t("Gemiddelde per beurt; ▲▼ tegenover het gemiddelde van de partijen die in dat blok meetellen. Partij van de avond: alleen avonden met 2 of meer partijen.") }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 } }, inz.omstandigheden.map(function(o) {
    return /* @__PURE__ */ React.createElement("div", { key: o.titel, style: { background: "rgba(0,0,0,0.2)", borderRadius: 8, padding: "8px 9px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: GOUD, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 } }, t(o.titel)), o.rijen.map(function(r) {
      const k = r.verschil >= 0.05 ? GRNT : r.verschil <= -0.05 ? ROOD : WITD;
      return /* @__PURE__ */ React.createElement("div", { key: r.label, style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: 12, marginBottom: 4 } }, /* @__PURE__ */ React.createElement("span", { style: { color: WITD } }, t(r.label)), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("strong", { style: { color: WIT } }, komma(r.gem, dec)), " ", /* @__PURE__ */ React.createElement("span", { style: { color: k, fontSize: 11 } }, r.verschil >= 0 ? "▲" : "▼", Math.abs(Math.round(r.verschil * 100)), "%")));
    }));
  }))), metOpm && inz.trend.length > 0 && /* @__PURE__ */ React.createElement(
    InzichtKaart,
    {
      titel: t("Werk je je werkpunten weg?"),
      uitleg: t("Hoe vaak een oorzaak je serie beëindigde, per 100 beurten: eerste helft van je bijgehouden partijen tegenover de tweede helft. Ben je anders gaan aanvinken, dan zie je dat hier ook terug.")
    },
    inz.trend.map(function(x) {
      const beter = x.verandering <= -0.3, slechter = x.verandering >= 0.3;
      return /* @__PURE__ */ React.createElement("div", { key: x.label, style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: 13, padding: "5px 0", borderBottom: "1px solid " + KBDR } }, /* @__PURE__ */ React.createElement("span", { style: { color: WIT } }, t(x.label)), /* @__PURE__ */ React.createElement("span", { style: { color: WITD } }, komma(x.voor, 1), " → ", /* @__PURE__ */ React.createElement("strong", { style: { color: WIT } }, komma(x.na, 1)), " ", /* @__PURE__ */ React.createElement("span", { style: { color: beter ? GRNT : slechter ? ROOD : WITD, fontSize: 12 } }, beter ? "▼ " + t("minder") : slechter ? "▲ " + t("vaker") : "≈ " + t("gelijk"))));
    })
  ));
}
