// Gebouwd uit jsx/tabs.jsx door bouw-jsx.js; niet zelf aanpassen.
function LogTab({ lp, alleP, prestatiesMap, niveau, huidigeDiscipline, verwijderPartij, slaNotitieOp }) {
  const kopBlok = useContext(KopContext);
  return /* @__PURE__ */ React.createElement("div", { className: "scrollvak", style: { overflowY: "auto", padding: kopBlok ? "0 14px 12px" : "12px 14px", height: "100%" } }, kopBlok && kopBlok({ rand: 14, onder: 12 }), lp.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { background: KBG, border: "2px solid " + GOUD, borderRadius: 10, padding: "12px 14px", marginBottom: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, textTransform: "uppercase", letterSpacing: 2, color: GOUD, marginBottom: 8 } }, t("Lopende partij")), [].concat(lp).reverse().map(function(b, i) {
    return /* @__PURE__ */ React.createElement(LogRij, { key: b.id, b, nr: lp.length - i, discipline: huidigeDiscipline });
  })), [].concat(alleP).reverse().map(function(p, pi) {
    return /* @__PURE__ */ React.createElement(LogPartijRij, { key: p.id, p, nr: alleP.length - pi, prestatie: prestatiesMap[p.id], gedropt: niveau.gedropteIds && niveau.gedropteIds.has(p.id), discipline: huidigeDiscipline, onVerwijder: verwijderPartij, onNotitie: slaNotitieOp });
  }));
}
function DataTab({ data, alleP, huidigeDiscipline, vervangData, ingebed, onBackup }) {
  const [gekopieerd, setGekopieerd] = useState("");
  const [handmatig, setHandmatig] = useState(null);
  async function exporteerData() {
    if (await maakBackupBestand(data) && onBackup) onBackup();
  }
  function importeerData(e) {
    const bestand = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!bestand) return;
    const reader = new FileReader();
    reader.onload = function() {
      let parsed;
      try {
        parsed = JSON.parse(reader.result);
      } catch (err) {
        parsed = null;
      }
      if (!parsed || !Array.isArray(parsed.partijen)) {
        alert(t("Dit lijkt geen geldige back-up te zijn (geen partijen-lijst gevonden)."));
        return;
      }
      const perDiscipline = {};
      parsed.partijen.forEach(function(p) {
        const d = p.discipline || "libre";
        perDiscipline[d] = (perDiscipline[d] || 0) + 1;
      });
      const overzicht = Object.keys(perDiscipline).map(function(d) {
        return (DISCIPLINES[d] ? DISCIPLINES[d].naam : d) + dubbelePunt() + perDiscipline[d];
      }).join(", ");
      if (!window.confirm(t("Gevonden: {n} partijen ({o}).\n\nDit vervangt ALLE huidige data ({h} partijen). Doorgaan?", { n: parsed.partijen.length, o: overzicht, h: data.partijen.length }))) return;
      migreerTafels(parsed);
      herstelBeurten(parsed);
      migreerAcquit(parsed);
      let maxId = 0;
      parsed.partijen.forEach(function(p) {
        maxId = Math.max(maxId, p.id || 0);
        (p.beurten || []).forEach(function(b) {
          maxId = Math.max(maxId, b.id || 0);
        });
      });
      if (!(parsed.huidigeId > maxId)) parsed.huidigeId = maxId + 1;
      vervangData(parsed);
    };
    reader.readAsText(bestand);
  }
  function bouwTekst() {
    const stA = stat(alleP.flatMap(function(p) {
      return p.beurten;
    }), huidigeDiscipline);
    const r = [t("BILJART DATA") + " — " + (/* @__PURE__ */ new Date()).toLocaleDateString(taalLocale(), { weekday: "long", day: "numeric", month: "long", year: "numeric" }), "========================================"];
    if (stA) r.push(t("TOTAAL: {n} partijen · {c} car · gem {g} · max {m} · {p} poedels", { n: alleP.length, c: stA.totCar, g: decTekst(stA.gemPerBeurt), m: stA.max, p: stA.poedels }));
    var alleOmgekeerd = [].concat(alleP).reverse();
    const dTxt = beurtDrempels(huidigeDiscipline);
    alleOmgekeerd.forEach(function(p, i) {
      const st = stat(p.beurten, huidigeDiscipline);
      r.push("");
      r.push(t("Partij {n}", { n: alleP.length - i }) + " · " + new Date(p.datum).toLocaleDateString(taalLocale(), { weekday: "long", day: "numeric", month: "long" }) + (p.tafel ? " · " + t("Tafel") + " " + tafelVol(p.tafel) : ""));
      if (st) r.push(t("{b} beurten · max {m} · gem {g} · {p}x poedel · {o}x {min}+", { b: st.aantalBeurten, m: st.max, g: decTekst(st.gemPerBeurt), p: st.poedels, o: st.opbouw5, min: dTxt.opbouwMin }));
      p.beurten.forEach(function(b, j) {
        const g = (b.gemist || []).map(function(l) {
          return t(l);
        }).join(", ");
        const gd = (b.goed || []).map(function(l) {
          return t(l);
        }).join(", ");
        var rule = "  " + t("B{n}", { n: j + 1 }) + dubbelePunt() + b.caramboles + " car" + (b.caramboles === 0 ? " [" + t("poedel") + "]" : "") + (b.straf ? " [−" + b.straf + " " + t("straf") + "]" : "");
        if (g) rule += " - " + t("Gemist") + dubbelePunt() + g;
        if (gd) rule += " - " + t("Goed") + dubbelePunt() + gd;
        r.push(rule);
      });
    });
    return r.join("\n");
  }
  function kopieer(tekst, key) {
    var el = document.createElement("textarea");
    el.value = tekst;
    el.setAttribute("readonly", "");
    el.style.position = "absolute";
    el.style.left = "-9999px";
    document.body.appendChild(el);
    el.select();
    var ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (e) {
    }
    document.body.removeChild(el);
    if (ok) {
      setGekopieerd(key);
      setHandmatig(null);
      setTimeout(function() {
        setGekopieerd("");
      }, 2500);
    } else setHandmatig(tekst);
  }
  const dataTekst = bouwTekst();
  const promptPartij = t("Je bent een biljartcoach voor carambole/libre. Analyseer mijn meest recente partij. Geef: Wat ging goed, Grootste rem, Foutpatronen, Trainingsadvies, Focus. Antwoord beknopt.") + "\n\n" + dataTekst;
  const promptTrend = t("Je bent een biljartcoach voor carambole/libre. Analyseer mijn trends over al mijn partijen. Geef: Trend, Vooruitgang, Remmers, Inzicht, Trainingsfocus. Antwoord beknopt.") + "\n\n" + dataTekst;
  return /* @__PURE__ */ React.createElement("div", { className: ingebed ? null : "scrollvak", style: ingebed ? null : { overflowY: "auto", padding: "12px 14px", height: "100%" } }, /* @__PURE__ */ React.createElement("div", { style: { background: KBG, border: "1px solid " + KBDR, borderRadius: 10, padding: "12px 14px", marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, textTransform: "uppercase", letterSpacing: 2, color: GOUD, marginBottom: 6 } }, t("AI Analyse")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: WITD, marginBottom: 10, lineHeight: 1.5 } }, t("Kopieer een kant-en-klare prompt met al je data erin, en plak die in ChatGPT, Claude of een andere AI-chat voor een persoonlijke analyse.")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      style: { flex: 1, padding: 12, background: "none", border: "1px solid " + GOUD, borderRadius: 8, color: GOUD, fontSize: 14, cursor: "pointer", fontFamily: "inherit" },
      onClick: function() {
        kopieer(promptPartij, "aipartij");
      }
    },
    gekopieerd === "aipartij" ? t("Gekopieerd!") : "📋 " + t("Partij-analyse-prompt")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      style: { flex: 1, padding: 12, background: "none", border: "1px solid " + GOUD, borderRadius: 8, color: GOUD, fontSize: 14, cursor: "pointer", fontFamily: "inherit" },
      onClick: function() {
        kopieer(promptTrend, "aitrend");
      }
    },
    gekopieerd === "aitrend" ? t("Gekopieerd!") : "📋 " + t("Trend-analyse-prompt")
  ))), /* @__PURE__ */ React.createElement(
    "button",
    {
      style: { width: "100%", padding: 14, background: "linear-gradient(135deg," + GOUD + "," + GOUDL + ")", border: "none", borderRadius: 10, color: G, fontSize: 15, fontWeight: "bold", cursor: "pointer", fontFamily: "inherit", marginBottom: 12 },
      onClick: function() {
        kopieer(dataTekst, "data");
      }
    },
    gekopieerd === "data" ? t("Gekopieerd!") : t("Kopieer data")
  ), handmatig && /* @__PURE__ */ React.createElement("div", { "data-handmatig-kopieren": "" }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: WITD, marginBottom: 6 } }, t("Kopiëren lukte niet. Selecteer de tekst hieronder en kopieer hem zelf:")), /* @__PURE__ */ React.createElement(
    "textarea",
    {
      readOnly: true,
      value: handmatig,
      onClick: function(e) {
        e.target.select();
      },
      style: { width: "100%", height: 220, background: "var(--c-0d1f0d)", border: "1px solid " + KBDR, borderRadius: 8, color: WITD, fontSize: 13, padding: 8, fontFamily: "monospace", resize: "none" }
    }
  )), /* @__PURE__ */ React.createElement("div", { style: { background: KBG, border: "1px solid " + KBDR, borderRadius: 10, padding: "12px 14px", marginTop: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, textTransform: "uppercase", letterSpacing: 2, color: GOUD, marginBottom: 6 } }, t("Back-up")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: WITD, marginBottom: 10, lineHeight: 1.5 } }, t("Sla al je data op als bestand, of zet een eerder bestand terug.")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      style: { flex: 1, padding: 12, background: "none", border: "1px solid " + GOUD, borderRadius: 8, color: GOUD, fontSize: 14, cursor: "pointer", fontFamily: "inherit" },
      onClick: exporteerData
    },
    "📤 ",
    t("Exporteer data")
  ), /* @__PURE__ */ React.createElement("label", { style: { flex: 1, padding: 12, background: "none", border: "1px solid " + GOUD, borderRadius: 8, color: GOUD, fontSize: 14, cursor: "pointer", fontFamily: "inherit", textAlign: "center", boxSizing: "border-box" } }, "📥 ", t("Importeer data"), /* @__PURE__ */ React.createElement("input", { type: "file", accept: ".json,application/json", onChange: importeerData, style: { display: "none" } }))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: WITD, marginTop: 8 } }, data.laatsteBackup ? t("Laatste back-up: {d}", { d: new Date(data.laatsteBackup).toLocaleDateString(taalLocale(), { day: "numeric", month: "long", year: "numeric" }) }) : t("Je hebt nog geen back-up gemaakt."))));
}
function StatsTab({
  data,
  alleP,
  huidigeDiscipline,
  niveau,
  prestatiesMap,
  seizoenAfsluiten,
  seizoensplitsingOngedaanMaken,
  openArchief,
  verwijderPartij,
  slaNotitieOp,
  vormVenster,
  openVerhaal
}) {
  const kopBlok = useContext(KopContext);
  const spel = useContext(SpelContext);
  const [niveauTafel, setNiveauTafel] = useState("alle");
  const [confSeizoenAfsluiten, setConfSeizoenAfsluiten] = useState(false);
  const vandaagStr = (function() {
    const d = /* @__PURE__ */ new Date();
    return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
  })();
  const [nieuwSeizoenVanaf, setNieuwSeizoenVanaf] = useState(vandaagStr);
  const allB = alleP.flatMap(function(p) {
    return p.beurten;
  });
  const stA = stat(allB, huidigeDiscipline);
  return /* @__PURE__ */ React.createElement("div", { className: "scrollvak", style: { overflowY: "auto", padding: kopBlok ? "0 14px 12px" : "12px 14px", height: "100%" } }, kopBlok && kopBlok({ rand: 14, onder: 12 }), /* @__PURE__ */ React.createElement("div", { style: { background: KBG, border: "1px solid " + KBDR, borderRadius: 10, padding: "12px 14px", marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, textTransform: "uppercase", letterSpacing: 2, color: GOUD, marginBottom: 8 } }, t("Seizoen")), (function() {
    const seizoenen = data.seizoenen || [{ id: 1, naam: "Seizoen 1", startDatum: null, eindDatum: null }];
    const huidig = seizoenen[seizoenen.length - 1];
    const afgesloten = seizoenen.filter(function(s) {
      return s.eindDatum !== null;
    });
    const huidigStats = berekenSeizoenStats(alleP, huidig, huidigeDiscipline, !spel, {});
    return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, color: WIT, marginBottom: 2 } }, seizoenNaam(huidig), " ", /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: WITD } }, "(", huidig.startDatum ? t("sinds {d}", { d: new Date(huidig.startDatum).toLocaleDateString(taalLocale(), { day: "numeric", month: "short", year: "numeric" }) }) : t("sinds het begin"), ")")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: WITD, marginBottom: huidigStats.aantalDrops > 0 ? 2 : 10 } }, t("{n} partijen · gem {g}", { n: huidigStats.aantalPartijen, g: getalTekst(huidigStats.gemiddelde, huidigeDiscipline === "driebanden" ? 3 : 2) }), " · ", huidigStats.niveau.emoji, " ", huidigStats.niveau.naam), huidigStats.aantalDrops > 0 && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: WITD, opacity: 0.8, marginBottom: 10 } }, t("Gemiddelde"), " ", gemUitleg(huidigStats, huidigeDiscipline === "driebanden" ? 3 : 2, t(" van dit seizoen")), ". ", t("Elk seizoen telt zijn eigen badge-punten.")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6 } }, !confSeizoenAfsluiten ? /* @__PURE__ */ React.createElement(
      "button",
      {
        style: { flex: 1, padding: 8, background: "none", border: "1px solid " + GOUD, borderRadius: 6, color: GOUD, cursor: "pointer", fontSize: 13, fontFamily: "inherit" },
        onClick: function() {
          setConfSeizoenAfsluiten(true);
        }
      },
      t("Seizoen afsluiten")
    ) : /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0, background: "var(--c-1a2e10)", border: "1px solid " + GOUD, borderRadius: 6, padding: "7px 8px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: GOUD, marginBottom: 6 } }, t("Huidig seizoen afsluiten en een nieuwe beginnen?")), /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: 12, color: WITD, marginBottom: 8 } }, t("Nieuw seizoen begint op"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "date",
        value: nieuwSeizoenVanaf,
        max: vandaagStr,
        onChange: function(e) {
          setNieuwSeizoenVanaf(e.target.value);
        },
        style: { display: "block", width: "100%", boxSizing: "border-box", marginTop: 4, padding: "8px 10px", borderRadius: 6, border: "1px solid " + KBDR, background: "rgba(0,0,0,0.3)", color: WIT, fontSize: 15, fontFamily: "inherit", colorScheme: "dark", minHeight: 40 }
      }
    ), /* @__PURE__ */ React.createElement("span", { style: { display: "block", marginTop: 4, lineHeight: 1.4 } }, t("Partijen vanaf die dag horen bij het nieuwe seizoen. Kies een eerdere datum om een grens achteraf te leggen."))), (function() {
      const start = huidig.startDatum ? new Date(huidig.startDatum) : null;
      const d = nieuwSeizoenVanaf.split("-").map(function(x) {
        return parseInt(x, 10);
      });
      const gekozen = new Date(d[0], d[1] - 1, d[2], 0, 0, 0);
      return start && gekozen <= start ? /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: ROOD, marginBottom: 6 } }, t("Kies een datum na {d}.", { d: start.toLocaleDateString(taalLocale(), { day: "numeric", month: "short", year: "numeric" }) })) : null;
    })(), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6 } }, /* @__PURE__ */ React.createElement(
      "button",
      {
        style: { flex: 1, padding: 6, background: "var(--c-2d4a1e)", border: "none", borderRadius: 5, color: GOUD, cursor: "pointer", fontFamily: "inherit", fontSize: 13 },
        onClick: function() {
          const d = nieuwSeizoenVanaf.split("-").map(function(x) {
            return parseInt(x, 10);
          });
          const gekozen = new Date(d[0], d[1] - 1, d[2], 0, 0, 0);
          const start = huidig.startDatum ? new Date(huidig.startDatum) : null;
          if (isNaN(gekozen.getTime()) || start && gekozen <= start) return;
          seizoenAfsluiten(nieuwSeizoenVanaf === vandaagStr ? (/* @__PURE__ */ new Date()).toISOString() : gekozen.toISOString());
          setConfSeizoenAfsluiten(false);
          setNieuwSeizoenVanaf(vandaagStr);
        }
      },
      t("Ja, afsluiten")
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        style: { flex: 1, padding: 6, background: "none", border: "1px solid " + KBDR, borderRadius: 5, color: WITD, cursor: "pointer", fontFamily: "inherit", fontSize: 13 },
        onClick: function() {
          setConfSeizoenAfsluiten(false);
        }
      },
      t("Annuleer")
    ))), afgesloten.length > 0 && !confSeizoenAfsluiten && /* @__PURE__ */ React.createElement(
      "button",
      {
        style: { padding: "8px 12px", background: "none", border: "1px solid " + KBDR, borderRadius: 6, color: WITD, cursor: "pointer", fontSize: 13, fontFamily: "inherit" },
        onClick: openArchief
      },
      t("Archief"),
      " (",
      afgesloten.length,
      ")"
    )), !confSeizoenAfsluiten && openVerhaal && /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: function() {
          openVerhaal(huidig);
        },
        style: { marginTop: 8, width: "100%", padding: 9, background: "none", border: "1px solid " + KBDR, borderRadius: 6, color: WIT, cursor: "pointer", fontSize: 14, fontFamily: "inherit" }
      },
      "🎬 ",
      t("Bekijk je seizoen tot nu toe")
    ));
  })()), (function() {
    const dec = huidigeDiscipline === "driebanden" ? 3 : 2;
    const gespeeld = Object.keys(TAFELS).filter(function(k) {
      return alleP.some(function(p) {
        return (p.tafel || "230") === k;
      });
    });
    const tafel = gespeeld.indexOf(niveauTafel) !== -1 ? niveauTafel : "alle";
    const opTafel = tafel === "alle" ? "" : " " + t("op {tafel}", { tafel: tafelLabel(tafel) });
    const info = tafel === "alle" ? niveau : berekenVorm(alleP.filter(function(p) {
      return (p.tafel || "230") === tafel;
    }), spel && data.schrappen !== false, vormVenster);
    const niv = bepaalNiveau(info.effectiefGemiddelde, huidigeDiscipline);
    const chip = function(actief) {
      return { flex: 1, padding: "7px 0", background: actief ? "var(--c-2d4a1e)" : "none", border: "1px solid " + (actief ? GOUD : KBDR), borderRadius: 8, color: actief ? GOUD : WITD, cursor: "pointer", fontFamily: "inherit", fontSize: 13 };
    };
    return /* @__PURE__ */ React.createElement("div", { style: { background: KBG, border: "1px solid " + KBDR, borderRadius: 10, padding: "12px 14px", marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, textTransform: "uppercase", letterSpacing: 2, color: GOUD, marginBottom: 8 } }, t("Je niveau")), gespeeld.length > 1 && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, marginBottom: 10 } }, [["alle", t("Alle tafels")]].concat(gespeeld.map(function(k) {
      return [k, tafelLabel(k)];
    })).map(function(x) {
      return /* @__PURE__ */ React.createElement("button", { key: x[0], onClick: function() {
        setNiveauTafel(x[0]);
      }, style: chip(tafel === x[0]) }, x[1]);
    })), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: tafel === "alle" ? 10 : 6 } }, /* @__PURE__ */ React.createElement("div", { style: { background: "rgba(0,0,0,0.2)", borderRadius: 8, padding: "8px", textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 22, fontWeight: "bold", color: GOUD } }, /* @__PURE__ */ React.createElement(Telop, { waarde: info.effectiefGemiddelde, dec })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: WITD } }, t("vorm"), " · ", info.venster ? t("laatste {n}", { n: info.aantalPartijen }) : !info.aantalDrops ? t("alle partijen = moyenne") : t("alle partijen"), opTafel), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: spel && info.aantalDrops > 0 ? GOUD : WITD, marginTop: 2 } }, !spel ? t("niets geschrapt · spelelement uit") : info.aantalDrops > 0 ? info.aantalDrops === 1 ? t("zonder je slechtste · spelelement aan") : t("zonder je {n} slechtste · spelelement aan", { n: info.aantalDrops }) : t("nog niets geschrapt · spelelement aan")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: niv.huidig.kleur, marginTop: 2 } }, niv.huidig.emoji, " ", niv.huidig.naam, " ", niv.progressPct, "%")), /* @__PURE__ */ React.createElement("div", { style: { background: "rgba(0,0,0,0.2)", borderRadius: 8, padding: "8px", textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 22, fontWeight: "bold", color: WIT } }, /* @__PURE__ */ React.createElement(Telop, { waarde: info.moyenne, dec })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: WITD } }, t("moyenne · alle {n}", { n: info.aantalPartijenTotaal }), opTafel), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: WITD, opacity: 0.7 } }, t("officieel, niets geschrapt")))), tafel !== "alle" && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: GOUDL, marginBottom: 10 } }, t("Alleen je partijen op de {tafel}. Je niveau bovenin de app gaat over alle tafels.", { tafel: tafelLabel(tafel) })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: WITD, opacity: 0.8, lineHeight: 1.45 } }, !niveau.venster && !niveau.aantalDrops ? t("Je klasse is nu gebaseerd op je moyenne: al je partijen, niets geschrapt.") : (niveau.venster ? t("Je vorm is het gemiddelde van je laatste {n} partijen", { n: vormVenster }) : t("Je vorm is het gemiddelde van al je partijen")) + (spel && data.schrappen !== false ? t(", zonder je slechtste partijen die je met badge-punten hebt weggespeeld (hoogstens 1 op de 10)") : "") + t("; je moyenne gaat altijd over al je partijen."), " ", t("Op hoeveel partijen je vorm gebaseerd is (10, 20, 30 of alle) en je doel stel je in bij"), " ", /* @__PURE__ */ React.createElement("b", { style: { color: GOUD } }, t("je klasse rechtsboven")), "."));
  })(), stA && /* @__PURE__ */ React.createElement("div", { style: { background: KBG, border: "1px solid " + KBDR, borderRadius: 10, padding: "12px 14px", marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, textTransform: "uppercase", letterSpacing: 2, color: GOUD, marginBottom: 8 } }, t("Alle {n} partijen", { n: alleP.length })), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 8 } }, [[t("Car."), stA.totCar], [t("Max"), stA.max], [t("Gem. alle partijen"), decTekst(stA.gemPerBeurt)], [t("Beurten"), stA.aantalBeurten], [t("Poedels"), stA.poedels], [t("Partijen"), alleP.length]].map(function(arr) {
    return /* @__PURE__ */ React.createElement("div", { key: arr[0], style: { textAlign: "center", background: "var(--c-1a3019)", borderRadius: 8, padding: "8px 4px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 22, fontWeight: "bold", color: GOUD } }, arr[1]), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: WITD } }, arr[0]));
  })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: GRNT } }, t("Opbouw: {a}/{b} beurten {n}+", { a: stA.opbouw5, b: stA.aantalBeurten, n: beurtDrempels(huidigeDiscipline).opbouwMin }))), /* @__PURE__ */ React.createElement("div", { style: { background: KBG, border: "1px solid " + KBDR, borderRadius: 10, padding: "12px 14px", marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, textTransform: "uppercase", letterSpacing: 2, color: GOUD, marginBottom: 8 } }, t("Per partij")), [].concat(alleP).reverse().map(function(p, i) {
    return /* @__PURE__ */ React.createElement(PartijRij, { key: p.id, p, nr: alleP.length - i, prestatie: prestatiesMap[p.id], gedropt: niveau.gedropteIds && niveau.gedropteIds.has(p.id), discipline: huidigeDiscipline, onVerwijder: verwijderPartij, onNotitie: slaNotitieOp });
  })));
}
function InfoTab({ data, alleP, huidigeDiscipline, niveau, resetAlles, setSpelelement, setWeergave, openUitleg, vervangData, backupGemaakt }) {
  const kopBlok = useContext(KopContext);
  const spel = useContext(SpelContext);
  const eenvoudig = useContext(EenvoudigContext);
  const [confReset, setConfReset] = useState(false);
  const [deelResultaat, setDeelResultaat] = useState("");
  function deelApp() {
    const url = IS_NATIVE ? APP_STORE_URL || WEB_URL : window.location.href;
    const tekst = t("Ik gebruik deze Carom Tracker om mijn carambole-partijen bij te houden — misschien iets voor jou ook?");
    if (navigator.share) {
      navigator.share({ title: "Carom Tracker", text: tekst, url }).catch(function() {
      });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(function() {
        setDeelResultaat(t("Link gekopieerd naar klembord!"));
        setTimeout(function() {
          setDeelResultaat("");
        }, 2500);
      }).catch(function() {
        setDeelResultaat(t("Kopiëren mislukt — kopieer de link handmatig uit de adresbalk."));
      });
    } else {
      setDeelResultaat(t("Kopieer de link handmatig uit de adresbalk."));
    }
  }
  const kop = function(tekst) {
    return /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, textTransform: "uppercase", letterSpacing: 2, color: GOUDL, margin: "18px 2px 8px" } }, tekst);
  };
  return /* @__PURE__ */ React.createElement("div", { className: "scrollvak", style: { overflowY: "auto", padding: kopBlok ? "0 14px 12px" : "12px 14px", height: "100%" } }, kopBlok && kopBlok({ rand: 14, onder: 12 }), /* @__PURE__ */ React.createElement("button", { onClick: openUitleg, style: { width: "100%", padding: "16px", marginBottom: 12, background: "linear-gradient(135deg," + GOUD + "," + GOUDL + ")", border: "none", borderRadius: 12, color: G, fontSize: 17, fontWeight: "bold", cursor: "pointer", fontFamily: "inherit" } }, "ℹ️ ", t("Zo werkt de app")), /* @__PURE__ */ React.createElement("div", { style: { background: KBG, border: "1px solid " + GOUD, borderRadius: 10, padding: "12px 14px", marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, textTransform: "uppercase", letterSpacing: 2, color: GOUD, marginBottom: 8 } }, t("Weergave")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, color: WIT, marginBottom: 6 } }, t("Taal"), TAAL !== "en" ? " · Language" : ""), /* @__PURE__ */ React.createElement("div", { "data-taalkeuze": "", style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 12 } }, TALEN.map(function(x) {
    const actief = TAAL === x.code;
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: x.code,
        onClick: function() {
          if (!actief) setWeergave("taal", x.code);
        },
        style: { padding: "9px 4px", background: actief ? "var(--c-2d4a1e)" : "none", border: "1px solid " + (actief ? GOUD : KBDR), borderRadius: 8, color: actief ? GOUD : WITD, cursor: "pointer", fontFamily: "inherit", fontSize: 14, whiteSpace: "nowrap" }
      },
      x.vlag,
      " ",
      x.naam
    );
  })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, color: WIT, marginBottom: 6 } }, t("Tekstgrootte")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, marginBottom: 12 } }, TEKSTGROOTTES.map(function(x) {
    const actief = (data.tekstgrootte || "normaal") === x[0];
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: x[0],
        onClick: function() {
          setWeergave("tekstgrootte", x[0]);
        },
        style: { flex: 1, padding: "10px 0", background: actief ? "var(--c-2d4a1e)" : "none", border: "1px solid " + (actief ? GOUD : KBDR), borderRadius: 8, color: actief ? GOUD : WITD, cursor: "pointer", fontFamily: "inherit", fontSize: 12 + (x[2] - 1) * 20 }
      },
      t(x[1])
    );
  })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, color: WIT, marginBottom: 4 } }, t("Eenvoudige modus")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: WITD, marginBottom: 8, lineHeight: 1.5 } }, t("Alleen het belangrijkste: per beurt je caramboles invullen en Noteer, zonder de stap met opmerkingen. Wil je bij een beurt toch iets aanvinken, tik dan + opmerking. In Dash alleen het belangrijkste. Badges en punten zet je hieronder los aan of uit.")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6 } }, [[true, t("Aan")], [false, t("Uit")]].map(function(x) {
    const actief = eenvoudig === x[0];
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: x[1],
        onClick: function() {
          if (!actief) setWeergave("eenvoudig", x[0]);
        },
        style: { flex: 1, padding: "10px 0", background: actief ? "var(--c-2d4a1e)" : "none", border: "1px solid " + (actief ? GOUD : KBDR), borderRadius: 8, color: actief ? GOUD : WITD, cursor: "pointer", fontFamily: "inherit", fontSize: 14 }
      },
      x[1]
    );
  }))), /* @__PURE__ */ React.createElement("div", { style: { background: KBG, border: "1px solid " + KBDR, borderRadius: 10, padding: "12px 14px", marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, textTransform: "uppercase", letterSpacing: 2, color: GOUD, marginBottom: 6 } }, t("Animaties en vieringen")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: WITD, marginBottom: 10, lineHeight: 1.5 } }, t("Optellende cijfers, groeiende balken en een korte viering bij een topserie, record, hogere klasse of gehaald doel.")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6 } }, [[true, "✨ " + t("Aan")], [false, t("Uit")]].map(function(x) {
    const actief = data.animaties !== false === x[0];
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: x[1],
        onClick: function() {
          if (!actief) setWeergave("animaties", x[0]);
        },
        style: { flex: 1, padding: "9px 0", background: actief ? "var(--c-2d4a1e)" : "none", border: "1px solid " + (actief ? GOUD : KBDR), borderRadius: 8, color: actief ? GOUD : WITD, cursor: "pointer", fontFamily: "inherit", fontSize: 14 }
      },
      x[1]
    );
  }))), /* @__PURE__ */ React.createElement("div", { "data-vierbal-keuze": "", style: { background: KBG, border: "1px solid " + KBDR, borderRadius: 10, padding: "12px 14px", marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, textTransform: "uppercase", letterSpacing: 2, color: GOUD, marginBottom: 6 } }, t("Vierbal")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: WITD, marginBottom: 10, lineHeight: 1.5 } }, t("Vierbal (twee rode ballen) wordt vooral in Korea en Japan gespeeld. Zet het aan om het als extra discipline bovenin te tonen.")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6 } }, [[true, t("Tonen")], [false, t("Verbergen")]].map(function(x) {
    const actief = vierbalZichtbaar(data, null) === x[0];
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: x[1],
        onClick: function() {
          if (!actief) setWeergave("vierbal", x[0]);
        },
        style: { flex: 1, padding: "9px 0", background: actief ? "var(--c-2d4a1e)" : "none", border: "1px solid " + (actief ? GOUD : KBDR), borderRadius: 8, color: actief ? GOUD : WITD, cursor: "pointer", fontFamily: "inherit", fontSize: 14 }
      },
      x[1]
    );
  }))), /* @__PURE__ */ React.createElement("div", { style: { background: KBG, border: "1px solid " + KBDR, borderRadius: 10, padding: "12px 14px", marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, textTransform: "uppercase", letterSpacing: 2, color: GOUD, marginBottom: 6 } }, t("Spelelement")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: WITD, marginBottom: 10, lineHeight: 1.5 } }, t("Badges, punten en het schrappen van je slechtste partijen uit je vorm (1 per {n} punten, hoogstens 1 op de 10 partijen). Werkt ook in de eenvoudige modus.", { n: PUNTEN_PER_DROP }), " ", spel ? t("Zet je het uit, dan zie je daar niets meer van en is je vorm gewoon het gemiddelde van die partijen.") : t("Staat uit: je vorm is gewoon het gemiddelde van die partijen, niets geschrapt. De punten worden op de achtergrond bijgehouden; zet je het weer aan, dan is alles direct terug.")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6 } }, [[true, "🎖️ " + t("Aan")], [false, t("Uit")]].map(function(x) {
    const actief = spel === x[0];
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: x[1],
        onClick: function() {
          if (!actief) setSpelelement(x[0]);
        },
        style: { flex: 1, padding: "9px 0", background: actief ? "var(--c-2d4a1e)" : "none", border: "1px solid " + (actief ? GOUD : KBDR), borderRadius: 8, color: actief ? GOUD : WITD, cursor: "pointer", fontFamily: "inherit", fontSize: 14 }
      },
      x[1]
    );
  }))), kop(t("Back-up en gegevens")), /* @__PURE__ */ React.createElement(DataTab, { data, alleP, huidigeDiscipline, vervangData, ingebed: true, onBackup: backupGemaakt }), !confReset ? /* @__PURE__ */ React.createElement(
    "button",
    {
      style: { width: "100%", padding: 10, background: "none", border: "1px solid #7a3030", borderRadius: 8, color: "#e06060", cursor: "pointer", fontSize: 14, fontFamily: "inherit" },
      onClick: function() {
        setConfReset(true);
      }
    },
    t("Alle data wissen")
  ) : /* @__PURE__ */ React.createElement("div", { style: { background: "#2a1515", border: "1px solid #7a3030", borderRadius: 8, padding: "12px 14px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, color: "#e06060", marginBottom: 10 } }, t("Weet je het zeker?")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement("button", { style: { flex: 1, padding: 10, background: "#7a3030", border: "none", borderRadius: 6, color: WIT, cursor: "pointer", fontFamily: "inherit", fontSize: 14 }, onClick: function() {
    resetAlles();
    setConfReset(false);
  } }, t("Ja, wis alles")), /* @__PURE__ */ React.createElement("button", { style: { flex: 1, padding: 10, background: "none", border: "1px solid " + KBDR, borderRadius: 6, color: WITD, cursor: "pointer", fontFamily: "inherit", fontSize: 14 }, onClick: function() {
    setConfReset(false);
  } }, t("Annuleer")))), /* @__PURE__ */ React.createElement("div", { style: { background: KBG, border: "1px solid " + KBDR, borderRadius: 10, padding: "12px 14px", marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, textTransform: "uppercase", letterSpacing: 2, color: GOUD, marginBottom: 6 } }, t("Over deze app")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: WITD, marginBottom: 10, lineHeight: 1.5 } }, t("Carom Tracker houdt je carambole-partijen bij (Libre, Driebanden, Bandstoten en Kader) met een niveausysteem op basis van de echte KNBB-klassen, plus badges en mijlpalen om je voortgang leuk te houden. Al je data blijft alleen op dit toestel staan.")), /* @__PURE__ */ React.createElement("button", { onClick: deelApp, style: { width: "100%", padding: 11, background: "linear-gradient(135deg," + GOUD + "," + GOUDL + ")", border: "none", borderRadius: 8, color: G, fontWeight: "bold", cursor: "pointer", fontSize: 14, fontFamily: "inherit", marginBottom: 8 } }, "📤 ", t("Deel deze app")), deelResultaat && /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", fontSize: 12, color: GRNT } }, deelResultaat), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", fontSize: 11, color: WITD, opacity: 0.6, marginTop: 4 } }, t("Versie"), " ", APP_VERSIE, " · ", /* @__PURE__ */ React.createElement("a", { href: WEB_URL + "privacy.html", target: "_blank", rel: "noopener", style: { color: WITD } }, t("Privacybeleid")))));
}
