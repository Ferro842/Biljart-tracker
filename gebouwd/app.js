// Gebouwd uit jsx/app.jsx door bouw-jsx.js; niet zelf aanpassen.
const APP_VERSIE = "2026-10-23.1";
function BiljartTracker() {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("spelen");
  const [car, setCar] = useState(0);
  const [straf, setStraf] = useState(0);
  const [inp, setInp] = useState("0");
  const [beurtNr, setBeurtNr] = useState(1);
  const [sel, setSel] = useState(/* @__PURE__ */ new Set());
  const [andersGemist, setAndersGemist] = useState("");
  const [andersGoed, setAndersGoed] = useState("");
  const [fase, setFase] = useState("setup");
  const [lp, setLp] = useState([]);
  const [doel, setDoel] = useState(25);
  const [doelType, setDoelType] = useState("beurten");
  const [tafelKeuze, setTafel] = useState("210");
  const [confPartij, setConfPartij] = useState(false);
  const [seizoenArchiefOpen, setSeizoenArchiefOpen] = useState(false);
  const [onboardingStap, setOnboardingStap] = useState(0);
  const [, setIcloudTik] = useState(0);
  useEffect(function() {
    const f = function() {
      setIcloudTik(function(x) {
        return x + 1;
      });
    };
    ICLOUD.luisteraars.push(f);
    return function() {
      ICLOUD.luisteraars = ICLOUD.luisteraars.filter(function(g) {
        return g !== f;
      });
    };
  }, []);
  const [kaderKiezerOpen, setKaderKiezerOpen] = useState(false);
  const inputRef = useRef(null);
  const [toastGroep, setToastGroep] = useState(null);
  const [niveauOpen, setNiveauOpen] = useState(false);
  const [uitlegOpen, setUitlegOpen] = useState(false);
  const [briefjeOpen, setBriefjeOpen] = useState(false);
  const [verhaalSeizoen, setVerhaalSeizoen] = useState(null);
  const [doelOpen, setDoelOpen] = useState(false);
  const [menuTijdensSpel, setMenuTijdensSpel] = useState(false);
  const [partijSamenvatting, setPartijSamenvatting] = useState(null);
  const [niveauUpInfo, setNiveauUpInfo] = useState(null);
  const tijdsvensterMaanden = null;
  const huidigeDiscplineVoorLading = data && data.huidigeDiscipline || "libre";
  const tafel = vasteTafel(huidigeDiscplineVoorLading) || tafelKeuze;
  const eenvoudig = !!(data && data.eenvoudig);
  const tekstgrootte = data && data.tekstgrootte || "normaal";
  zetTaal(taalVoorData(data));
  const spelAan = !(data && data.spelelement === false);
  const schrappenAan = !(data && data.schrappen === false);
  const schrapt = spelAan && schrappenAan;
  const vormVenster = data && data.vormVenster || 20;
  const alleP = useMemo(function() {
    if (!data) return [];
    return data.partijen.filter(function(p) {
      return (p.discipline || "libre") === huidigeDiscplineVoorLading;
    });
  }, [data, huidigeDiscplineVoorLading]);
  const prestatiesMap = useMemo(function() {
    const arr = berekenPrestaties(alleP, tijdsvensterMaanden, huidigeDiscplineVoorLading);
    const m = {};
    arr.forEach(function(r) {
      m[r.id] = r;
    });
    return m;
  }, [alleP, tijdsvensterMaanden]);
  const huidigeRecords = useMemo(function() {
    return berekenLopendeRecords(alleP, tijdsvensterMaanden);
  }, [alleP, tijdsvensterMaanden]);
  const niveau = useMemo(function() {
    const opties = vormOpties(vormVenster);
    const info = berekenVorm(alleP, schrapt, vormVenster);
    const voorspelling = berekenVoorspelling(alleP, huidigeDiscplineVoorLading, !schrapt, opties);
    return Object.assign({}, bepaalNiveau(info.effectiefGemiddelde, huidigeDiscplineVoorLading), info, { voorspelling, schrapt });
  }, [alleP, huidigeDiscplineVoorLading, schrapt, vormVenster]);
  const mijnDoel = useMemo(function() {
    const d = data && data.doelen && data.doelen[huidigeDiscplineVoorLading];
    if (!d) return null;
    const nuGehaald = niveau.effectiefGemiddelde >= d.waarde;
    const live = { gehaald: nuGehaald, eerder: !nuGehaald && d.gehaald ? { op: d.gehaaldOp, venster: d.gehaaldVenster } : null };
    if (!d.gezet) return Object.assign({}, d, live);
    const grens = new Date(d.gezet).getTime();
    const voor = alleP.filter(function(p) {
      return new Date(p.datum).getTime() < grens;
    });
    if (!voor.length) return Object.assign({}, d, live);
    const info = berekenVorm(voor, schrapt, vormVenster);
    return Object.assign({}, d, live, { start: info.effectiefGemiddelde });
  }, [data, alleP, huidigeDiscplineVoorLading, schrapt, vormVenster, niveau]);
  useEffect(function() {
    if (!data) return;
    if (data.laatstGezienNiveauIndex === void 0) {
      const nd = Object.assign({}, data, { laatstGezienNiveauIndex: niveau.index });
      setData(nd);
      slaOp(nd);
      return;
    }
    if (niveau.index > data.laatstGezienNiveauIndex) {
      const niveaus = (DISCIPLINES[huidigeDiscplineVoorLading] || DISCIPLINES.libre).niveaus;
      setNiveauUpInfo({ van: niveaus[data.laatstGezienNiveauIndex], naar: niveau.huidig });
      const nd = Object.assign({}, data, { laatstGezienNiveauIndex: niveau.index });
      setData(nd);
      slaOp(nd);
    }
  }, [niveau.index]);
  useEffect(function() {
    laadData().then(function(d) {
      setData(d);
      const lo = d.lopendePartij;
      if (lo && Array.isArray(lo.beurten) && lo.beurten.length > 0) {
        setLp(lo.beurten);
        setBeurtNr(lo.beurten.length + 1);
        if (lo.tafel) setTafel(lo.tafel);
        if (lo.doel) setDoel(lo.doel);
        if (lo.doelType) setDoelType(lo.doelType);
      }
    });
  }, []);
  useEffect(function() {
    if (!data) return;
    const lopend = lp.length > 0 ? { beurten: lp, tafel, doel, doelType } : null;
    if (JSON.stringify(data.lopendePartij || null) === JSON.stringify(lopend)) return;
    const nd = Object.assign({}, data);
    if (lopend) nd.lopendePartij = lopend;
    else delete nd.lopendePartij;
    setData(nd);
    slaOp(nd);
  }, [data, lp, tafel, doel, doelType]);
  const themaDiscipline = kaderKiezerOpen ? "kader" : huidigeDiscplineVoorLading;
  React.useLayoutEffect(function() {
    zetThema(themaDiscipline);
  }, [themaDiscipline]);
  const animatiesAan = !(data && data.animaties === false);
  useEffect(function() {
    document.documentElement.classList.toggle("rustig", !animatiesAan);
  }, [animatiesAan]);
  useEffect(function() {
    setMenuTijdensSpel(false);
  }, [tab, fase]);
  useEffect(function() {
    vraagBlijvendeOpslag();
  }, []);
  if (!data) return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: GOUD, fontSize: 18, background: G } }, "Laden...");
  const huidigeDiscipline = huidigeDiscplineVoorLading;
  const stL = stat(lp, huidigeDiscipline);
  const totCarLp = lp.reduce(function(a, b) {
    return a + b.caramboles - (b.straf || 0);
  }, 0);
  const voortgang = doelType === "beurten" ? lp.length : totCarLp;
  const progPct = Math.min(100, Math.round(voortgang / doel * 100));
  function toggle(key) {
    setSel(function(prev) {
      const n = new Set(prev);
      n.has(key) ? n.delete(key) : n.add(key);
      return n;
    });
  }
  function toonToast(items) {
    if (items && items.length) setToastGroep(items);
  }
  function checkLiveBadges(lpVoor, car2) {
    const dLive = beurtDrempels(huidigeDiscipline);
    const items = [];
    if (car2 >= dLive.opbouwMin && car2 <= dLive.opbouwMax) items.push({ emoji: "🎯", label: "Opbouw", punten: 10, categorie: "Beurt-pieken" });
    else if (car2 >= dLive.sterkMin && car2 <= dLive.sterkMax) items.push({ emoji: "🔥", label: "Sterke serie", punten: 20, categorie: "Beurt-pieken" });
    else if (car2 >= dLive.topMin) items.push({ emoji: "💫", label: "Topserie", punten: 35, categorie: "Beurt-pieken" });
    const maxInPartijVoor = lpVoor.length ? Math.max.apply(null, lpVoor.map(function(x) {
      return x.caramboles;
    })) : 0;
    if (car2 > huidigeRecords.allTimeMaxBeurt && huidigeRecords.allTimeMaxBeurt > 0 && car2 > maxInPartijVoor) {
      items.push({ emoji: "🏆", label: "Nieuw record beurt!", punten: 50, categorie: "Beurt-pieken" });
    }
    if (lpVoor.length > 0 && lpVoor[lpVoor.length - 1].caramboles === 0 && car2 >= dLive.opbouwMin) {
      items.push({ emoji: "💪", label: "Sterk herstel na poedel", punten: 15, categorie: "Mentaliteit" });
    }
    let vorigeStreak = 0;
    for (let i = lpVoor.length - 1; i >= 0; i--) {
      if (lpVoor[i].caramboles > 0) vorigeStreak++;
      else break;
    }
    const nieuweStreak = car2 > 0 ? vorigeStreak + 1 : 0;
    if (nieuweStreak === 5) items.push({ emoji: "⛓️", label: "Reeks zonder poedel", punten: 15, categorie: "Consistentie" });
    if (nieuweStreak === 8) items.push({ emoji: "⛓️", label: "Lange reeks zonder poedel", punten: 25, categorie: "Consistentie" });
    return items;
  }
  function noteer() {
    const gemist = Array.from(sel).filter(function(k) {
      return k.startsWith("G__");
    }).map(function(k) {
      return k.replace("G__", "");
    });
    const goed = Array.from(sel).filter(function(k) {
      return k.startsWith("P__");
    }).map(function(k) {
      return k.replace("P__", "");
    });
    if (andersGemist.trim()) gemist.push(andersGemist.trim());
    if (andersGoed.trim()) goed.push(andersGoed.trim());
    const b = { id: data.huidigeId, caramboles: car, gemist, goed, tijd: (/* @__PURE__ */ new Date()).toISOString() };
    if (straf > 0 && huidigeDiscipline === "vierbal") b.straf = straf;
    const nd = Object.assign({}, data, { huidigeId: data.huidigeId + 1 });
    setData(nd);
    slaOp(nd);
    if (spelAan) toonToast(checkLiveBadges(lp, car));
    const dV = beurtDrempels(huidigeDiscipline), recordVoor = Math.max(huidigeRecords.allTimeMaxBeurt || 0, lp.reduce(function(m, x) {
      return Math.max(m, x.caramboles);
    }, 0));
    if (car > recordVoor && recordVoor > 0) vier({ tekst: "🏆 " + t("Record: serie van {n}!", { n: car }), sub: t("Je hoogste serie ooit") });
    else if (car >= dV.topMin) vier({ tekst: "🔥 " + t("Serie van {n}!", { n: car }) });
    setLp(function(p) {
      return p.concat([b]);
    });
    setCar(0);
    setStraf(0);
    setInp("0");
    setBeurtNr(function(n) {
      return n + 1;
    });
    setSel(/* @__PURE__ */ new Set());
    setAndersGemist("");
    setAndersGoed("");
    setFase("invoer");
  }
  function bewaarPartij(p, opties) {
    const pos = data.partijen.findIndex(function(x) {
      return new Date(x.datum) > new Date(p.datum);
    });
    const nieuwePartijen = pos === -1 ? data.partijen.concat([p]) : data.partijen.slice(0, pos).concat([p], data.partijen.slice(pos));
    const disc = p.discipline || "libre";
    const nieuweAlleP = nieuwePartijen.filter(function(x) {
      return (x.discipline || "libre") === disc;
    });
    const resultaten = berekenPrestaties(nieuweAlleP, tijdsvensterMaanden, disc);
    const prestatie = resultaten.find(function(r) {
      return r.id === p.id;
    });
    const infoVoor = berekenVorm(alleP, schrapt, vormVenster);
    const infoNa = berekenVorm(nieuweAlleP, schrapt, vormVenster);
    const nieuweDrop = spelAan && infoNa.aantalDrops > infoVoor.aantalDrops ? infoNa.gedroptePartijen[infoNa.gedroptePartijen.length - 1] : null;
    const niveauVoor = bepaalNiveau(infoVoor.effectiefGemiddelde, disc);
    const niveauNa = bepaalNiveau(infoNa.effectiefGemiddelde, disc);
    const niveauOmhoog = niveauNa.index > niveauVoor.index ? { van: niveauVoor.huidig, naar: niveauNa.huidig } : null;
    const nd = Object.assign({}, data, { partijen: nieuwePartijen, huidigeId: Math.max(data.huidigeId, p.id) + 1, laatstGezienNiveauIndex: niveauNa.index });
    const doelNu = data.doelen && data.doelen[disc];
    const doelGehaald = doelNu && !doelNu.gehaald && infoNa.effectiefGemiddelde >= doelNu.waarde;
    if (doelGehaald) nd.doelen = Object.assign({}, data.doelen, { [disc]: Object.assign({}, doelNu, { gehaald: true, gehaaldOp: (/* @__PURE__ */ new Date()).toISOString(), gehaaldVenster: vormVenster }) });
    const besteOoit = prestatie && prestatie.badges && prestatie.badges.some(function(b) {
      return b.label === "Nieuw beste gemiddelde ooit";
    });
    if (doelGehaald) vier({ tekst: "🎯 " + t("Doel gehaald!"), sub: t("Je vorm is nu {v}", { v: getalTekst(infoNa.effectiefGemiddelde, disc === "driebanden" ? 3 : 2) }) });
    else if (niveauOmhoog) vier({ tekst: "🎉 " + niveauOmhoog.naar.naam + "!", sub: t("Je bent een klasse omhoog") });
    else if (besteOoit) vier({ tekst: "👑 " + t("Beste partij ooit!") });
    if (opties && opties.lopendeWeg) delete nd.lopendePartij;
    const beurtRecord = prestatie && prestatie.badges && prestatie.badges.some(function(b) {
      return b.label === "Nieuw record beurt";
    });
    if (beoordelingMoment(nd, doelGehaald || niveauOmhoog || besteOoit || beurtRecord)) {
      nd.beoordelingGevraagd = (nd.beoordelingGevraagd || []).concat([(/* @__PURE__ */ new Date()).toISOString()]);
      setTimeout(vraagBeoordeling, 4e3);
    }
    setData(nd);
    slaOp(nd);
    setPartijSamenvatting({ partij: p, st: stat(p.beurten, disc), prestatie, infoNa, nieuweDrop, niveauOmhoog });
  }
  function sluit() {
    if (!lp.length) {
      setConfPartij(false);
      return;
    }
    const st = stat(lp, huidigeDiscipline);
    const p = Object.assign({ id: data.huidigeId, datum: (/* @__PURE__ */ new Date()).toISOString(), tafel, doel, doelType, discipline: huidigeDiscipline, beurten: lp }, st);
    bewaarPartij(p, { lopendeWeg: true });
    setLp([]);
    setBeurtNr(1);
    setCar(0);
    setStraf(0);
    setInp("0");
    setSel(/* @__PURE__ */ new Set());
    setConfPartij(false);
    setFase("setup");
  }
  function bewaarBriefje(inv) {
    let id = data.huidigeId;
    const beurten = inv.beurten.map(function(b) {
      const o = typeof b === "object" && b !== null ? b : { car: b };
      return { id: id++, caramboles: Math.max(0, parseInt(o.car, 10) || 0), gemist: o.gemist || [], goed: o.goed || [], tijd: inv.datum };
    });
    const st = stat(beurten, huidigeDiscipline);
    const p = Object.assign({ id, datum: inv.datum, tafel: inv.tafel, doel: inv.doel, doelType: inv.doelType, discipline: huidigeDiscipline, beurten, bron: "briefje" }, st);
    bewaarPartij(p);
    setBriefjeOpen(false);
  }
  function resetAlles() {
    const overigeDisciplines = data.partijen.filter(function(p) {
      return (p.discipline || "libre") !== huidigeDiscipline;
    });
    const nd = Object.assign({}, data, { partijen: overigeDisciplines });
    setData(nd);
    slaOp(nd);
    setLp([]);
    setBeurtNr(1);
    setCar(0);
    setStraf(0);
    setInp("0");
    setSel(/* @__PURE__ */ new Set());
    setFase("setup");
  }
  function vervangData(nd) {
    setData(nd);
    slaOp(nd);
  }
  function verwijderPartij(id) {
    const nd = Object.assign({}, data, { partijen: data.partijen.filter(function(p) {
      return p.id !== id;
    }) });
    setData(nd);
    slaOp(nd);
  }
  function slaOpmerkingenOp(id, beurten) {
    const nd = Object.assign({}, data, { partijen: data.partijen.map(function(p) {
      if (p.id !== id) return p;
      return Object.assign({}, p, { beurten: p.beurten.map(function(b, i) {
        const n = beurten[i];
        return n ? Object.assign({}, b, { gemist: n.gemist.slice(), goed: n.goed.slice() }) : b;
      }) });
    }) });
    setData(nd);
    slaOp(nd);
  }
  function slaNotitieOp(id, tekst) {
    const nd = Object.assign({}, data, { partijen: data.partijen.map(function(p) {
      return p.id === id ? Object.assign({}, p, { notitie: tekst }) : p;
    }) });
    setData(nd);
    slaOp(nd);
  }
  function wisselDiscipline(d) {
    const nd = Object.assign({}, data, { huidigeDiscipline: d });
    setData(nd);
    slaOp(nd);
  }
  function setSpelelement(aan) {
    const info = berekenVorm(alleP, aan && schrappenAan, vormVenster);
    const idx = bepaalNiveau(info.effectiefGemiddelde, huidigeDiscipline).index;
    const nd = Object.assign({}, data, { spelelement: aan, laatstGezienNiveauIndex: idx });
    setData(nd);
    slaOp(nd);
  }
  function setSchrappen(aan) {
    const info = berekenVorm(alleP, spelAan && aan, vormVenster);
    const idx = bepaalNiveau(info.effectiefGemiddelde, huidigeDiscipline).index;
    const nd = Object.assign({}, data, { schrappen: aan, laatstGezienNiveauIndex: idx });
    setData(nd);
    slaOp(nd);
  }
  function setVormVenster(v) {
    const info = berekenVorm(alleP, schrapt, v);
    const idx = bepaalNiveau(info.effectiefGemiddelde, huidigeDiscipline).index;
    const nd = Object.assign({}, data, { vormVenster: v, laatstGezienNiveauIndex: idx });
    setData(nd);
    slaOp(nd);
  }
  function setWeergave(veld, waarde) {
    const extra = {};
    extra[veld] = waarde;
    const nd = Object.assign({}, data, extra);
    setData(nd);
    slaOp(nd);
  }
  const backupHerinnering = data ? backupNodig(data) : null;
  function backupGemaakt() {
    const nd = Object.assign({}, data, { laatsteBackup: (/* @__PURE__ */ new Date()).toISOString(), laatsteBackupAantal: (data.partijen || []).length });
    delete nd.backupLaterTot;
    setData(nd);
    slaOp(nd);
  }
  async function maakBackupNu() {
    if (await maakBackupBestand(data)) backupGemaakt();
  }
  function backupLater() {
    const nd = Object.assign({}, data, { backupLaterTot: new Date(Date.now() + 7 * 864e5).toISOString() });
    setData(nd);
    slaOp(nd);
  }
  const weergaveTip = !!(data && data.onboardingGezien && !data.weergaveTipGezien);
  function zieWeergaveTip(bekijken) {
    const nd = Object.assign({}, data, { weergaveTipGezien: true });
    setData(nd);
    slaOp(nd);
    if (bekijken) setTab("info");
  }
  function zetMijnDoel(doel2) {
    const doelen = Object.assign({}, data.doelen || {});
    if (doel2) doelen[huidigeDiscipline] = doel2;
    else delete doelen[huidigeDiscipline];
    const nd = Object.assign({}, data, { doelen });
    setData(nd);
    slaOp(nd);
    setDoelOpen(false);
  }
  function sluitOnboarding() {
    const nd = Object.assign({}, data, { onboardingGezien: true, weergaveTipGezien: true });
    setData(nd);
    slaOp(nd);
  }
  function seizoenAfsluiten(vanaf) {
    const huidigeSeizoenen = data.seizoenen || [{ id: 1, naam: "Seizoen 1", startDatum: null, eindDatum: null }];
    const nu = vanaf || (/* @__PURE__ */ new Date()).toISOString();
    const bijgewerkt = huidigeSeizoenen.map(function(s) {
      return s.eindDatum === null ? Object.assign({}, s, { eindDatum: nu }) : s;
    });
    const nieuwId = Math.max.apply(null, huidigeSeizoenen.map(function(s) {
      return s.id;
    })) + 1;
    bijgewerkt.push({ id: nieuwId, naam: "Seizoen " + nieuwId, startDatum: nu, eindDatum: null });
    const nd = Object.assign({}, data, { seizoenen: bijgewerkt });
    setData(nd);
    slaOp(nd);
    setVerhaalSeizoen(bijgewerkt[bijgewerkt.length - 2]);
  }
  function seizoensplitsingOngedaanMaken() {
    const huidigeSeizoenen = data.seizoenen || [{ id: 1, naam: "Seizoen 1", startDatum: null, eindDatum: null }];
    if (huidigeSeizoenen.length < 2) return;
    const zonderLaatste = huidigeSeizoenen.slice(0, -1);
    const bijgewerkt = zonderLaatste.map(function(s, i) {
      return i === zonderLaatste.length - 1 ? Object.assign({}, s, { eindDatum: null }) : s;
    });
    const nd = Object.assign({}, data, { seizoenen: bijgewerkt });
    setData(nd);
    slaOp(nd);
  }
  const spel = { alleP, andersGemist, andersGoed, beurtNr, car, straf, setStraf, doel, doelType, huidigeDiscipline, huidigeRecords, inp, inputRef, lp, niveau, noteer, eenvoudig, progPct, sel, setAndersGemist, setAndersGoed, setBeurtNr, setCar, setConfPartij, setDoel, setDoelType, setFase, setInp, setLp, setNiveauOpen, setSel, setTafel, setUitlegOpen, setBriefjeOpen, stL, weergaveTip, zieWeergaveTip, backupHerinnering, maakBackupNu, backupLater, tafel, tijdsvensterMaanden, toggle, totCarLp };
  const segmentTekst = function(naam) {
    return /* @__PURE__ */ React.createElement("span", { className: "seg-tekst", "data-tekst": naam }, naam);
  };
  const groot = tekstgrootte !== "normaal";
  const vijfKnoppen = hoofdDisciplines(data, huidigeDiscipline).length > HOOFDDISCIPLINES.length;
  const segment = function(actief) {
    return {
      flex: groot ? 1 : "1 1 auto",
      padding: groot ? "6px 4px" : vijfKnoppen ? "8px 2px" : "8px 6px",
      border: "none",
      borderRadius: 9,
      cursor: "pointer",
      fontFamily: "inherit",
      fontSize: groot ? 13 : vijfKnoppen ? 12 : 13.5,
      letterSpacing: 0.2,
      whiteSpace: "nowrap",
      background: actief ? "linear-gradient(180deg,var(--c-2d4a1e),var(--c-1e3a1e))" : "transparent",
      color: actief ? GOUD : WITD,
      fontWeight: actief ? "bold" : "normal",
      boxShadow: actief ? "inset 0 0 0 1px " + GOUD + ", 0 2px 6px rgba(0,0,0,0.35)" : "none",
      transition: "background 160ms ease, color 160ms ease, box-shadow 160ms ease"
    };
  };
  const inSpel = tab === "spelen" && fase !== "setup";
  const kopBlok = function(opties) {
    const o = opties || {}, zij = o.rand ? { marginLeft: -o.rand, marginRight: -o.rand } : null;
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { "data-kop": "", style: Object.assign({ flexShrink: 0, marginBottom: -(o.gap || 0) }, zij) }, /* @__PURE__ */ React.createElement("div", { style: { background: "linear-gradient(135deg,var(--c-0d1f0d),var(--c-1a2e1a))", borderBottom: "2px solid " + GOUD, padding: "9px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement(Logo, { maat: 44 }), /* @__PURE__ */ React.createElement("div", { style: { minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 16, fontWeight: "bold", color: GOUD, letterSpacing: 1 } }, "Carom Tracker"), tekstgrootte === "normaal" && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: WITD, letterSpacing: 2, textTransform: "uppercase" } }, t("Carambole - Series")))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, flexShrink: 0 } }, !(tekstgrootte !== "normaal" && fase !== "setup" && lp.length > 0) && /* @__PURE__ */ React.createElement("button", { onClick: function() {
      setNiveauOpen(true);
    }, style: { display: "flex", alignItems: "center", gap: 4, background: "rgba(0,0,0,0.25)", border: "1px solid " + niveau.huidig.kleur, borderRadius: 20, padding: "4px 10px 4px 6px", cursor: "pointer", fontFamily: "inherit" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 14 } }, niveau.huidig.emoji), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, fontWeight: "bold", color: niveau.huidig.kleur } }, niveau.huidig.naam)), fase !== "setup" && lp.length > 0 && /* @__PURE__ */ React.createElement(
      "button",
      {
        style: { background: "none", border: "1px solid " + KBDR, borderRadius: 8, color: WITD, padding: "5px 10px", fontSize: 13, cursor: "pointer", fontFamily: "inherit" },
        onClick: function() {
          setConfPartij(true);
        }
      },
      t("Afsluiten")
    ))), /* @__PURE__ */ React.createElement("div", { style: { padding: groot ? "6px 10px 7px" : "9px 12px 10px", background: "var(--c-152015)", borderBottom: "1px solid " + KBDR } }, /* @__PURE__ */ React.createElement("div", { style: Object.assign(
      { gap: 3, padding: 3, background: "rgba(0,0,0,0.28)", border: "1px solid " + KBDR, borderRadius: 12 },
      groot ? { display: "grid", gridTemplateColumns: "1fr 1fr" } : { display: "flex" }
    ) }, hoofdDisciplines(data, huidigeDiscipline).map(function(d) {
      const actief = huidigeDiscipline === d && !kaderKiezerOpen;
      return /* @__PURE__ */ React.createElement("button", { key: d, className: "seg-knop", onClick: function() {
        wisselDiscipline(d);
      }, style: segment(actief) }, segmentTekst(kortNaam(d)));
    }), (function() {
      const kaderGekozen = KADER_VARIANTEN.indexOf(huidigeDiscipline) !== -1;
      return /* @__PURE__ */ React.createElement("button", { className: "seg-knop", onClick: function() {
        setKaderKiezerOpen(true);
      }, style: segment(kaderGekozen || kaderKiezerOpen) }, segmentTekst(kaderGekozen ? kortNaam(huidigeDiscipline) : t("Kader")));
    })()))), /* @__PURE__ */ React.createElement("div", { "data-tabbalk": "", style: Object.assign({ position: "sticky", top: 0, zIndex: 4, flexShrink: 0, marginBottom: o.onder || 0 }, zij) }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", borderBottom: "1px solid " + KBDR, background: "var(--c-152015)", flexShrink: 0 } }, [["spelen", t("Spelen")], ["stats", t("Stats")], ["dash", t("Dash")], ["log", t("Log")], ["info", t("Info")]].map(function(arr) {
      return /* @__PURE__ */ React.createElement(
        "button",
        {
          key: arr[0],
          style: { flex: 1, padding: "11px 0", background: tab === arr[0] ? "var(--c-1c2c1c)" : "none", border: "none", color: tab === arr[0] ? GOUD : WITD, fontSize: 14, cursor: "pointer", fontFamily: "inherit", borderBottom: tab === arr[0] ? "2px solid " + GOUD : "2px solid transparent" },
          onClick: function() {
            setTab(arr[0]);
          }
        },
        arr[1]
      );
    })), o.extra));
  };
  return /* @__PURE__ */ React.createElement(OpmerkingenContext.Provider, { value: slaOpmerkingenOp }, /* @__PURE__ */ React.createElement(KopContext.Provider, { value: inSpel ? null : kopBlok }, /* @__PURE__ */ React.createElement(SpelContext.Provider, { value: spelAan }, /* @__PURE__ */ React.createElement(EenvoudigContext.Provider, { value: eenvoudig }, /* @__PURE__ */ React.createElement("div", { className: "app", style: tekstZoom(tekstgrootte) !== 1 ? { zoom: tekstZoom(tekstgrootte), "--zoom": tekstZoom(tekstgrootte), height: "calc(100vh / " + tekstZoom(tekstgrootte) + ")" } : null }, inSpel && menuTijdensSpel && kopBlok(), inSpel && fase === "invoer" && /* @__PURE__ */ React.createElement("div", { "data-spelbalk": "", style: { display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", background: "var(--c-152015)", borderBottom: "1px solid " + KBDR, flexShrink: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, /* @__PURE__ */ React.createElement("span", { style: { color: GOUD, fontWeight: "bold" } }, DISCIPLINES[huidigeDiscipline].naam), /* @__PURE__ */ React.createElement("span", { style: { color: WITD } }, " · ", tafelLabel(tafel))), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: function() {
        setMenuTijdensSpel(function(v) {
          return !v;
        });
      },
      style: { background: "none", border: "1px solid " + KBDR, borderRadius: 8, color: WITD, padding: "5px 10px", fontSize: 13, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }
    },
    menuTijdensSpel ? "✕ " + t("Menu") : "☰ " + t("Menu")
  ), lp.length > 0 && /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: function() {
        setConfPartij(true);
      },
      style: { background: "none", border: "1px solid " + GOUD, borderRadius: 8, color: GOUD, padding: "5px 10px", fontSize: 13, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }
    },
    t("Afsluiten")
  )), !data.onboardingGezien && /* @__PURE__ */ React.createElement(
    WelkomstFlow,
    {
      stap: onboardingStap,
      setStap: setOnboardingStap,
      discipline: huidigeDiscipline,
      wisselDiscipline,
      onKlaar: sluitOnboarding,
      tekstgrootte,
      eenvoudig,
      setWeergave
    }
  ), /* @__PURE__ */ React.createElement(VieringLaag, { aan: data.animaties !== false }), verhaalSeizoen && /* @__PURE__ */ React.createElement(SeizoenVerhaal, { seizoen: verhaalSeizoen, alleP, discipline: huidigeDiscipline, onClose: function() {
    setVerhaalSeizoen(null);
  } }), doelOpen && /* @__PURE__ */ React.createElement(
    DoelInstellen,
    {
      doel: (data.doelen || {})[huidigeDiscipline] || null,
      vorm: niveau.effectiefGemiddelde,
      discipline: huidigeDiscipline,
      onOpslaan: zetMijnDoel,
      onVerwijder: function() {
        zetMijnDoel(null);
      },
      onClose: function() {
        setDoelOpen(false);
      }
    }
  ), briefjeOpen && /* @__PURE__ */ React.createElement(BriefjeImport, { discipline: huidigeDiscipline, tafelStandaard: tafel, onOpslaan: bewaarBriefje, onClose: function() {
    setBriefjeOpen(false);
  } }), uitlegOpen && /* @__PURE__ */ React.createElement(UitlegVenster, { eenvoudig, onClose: function() {
    setUitlegOpen(false);
  } }), niveauOpen && /* @__PURE__ */ React.createElement(
    NiveauOverzicht,
    {
      niveau,
      discipline: huidigeDiscipline,
      onClose: function() {
        setNiveauOpen(false);
      },
      mijnDoel,
      openDoel: function() {
        setDoelOpen(true);
      },
      vormVenster,
      setVormVenster,
      schrappen: spelAan ? schrappenAan : null,
      setSchrappen
    }
  ), seizoenArchiefOpen && /* @__PURE__ */ React.createElement(
    SeizoenArchief,
    {
      seizoenen: data.seizoenen || [{ id: 1, naam: "Seizoen 1", startDatum: null, eindDatum: null }],
      alleP,
      discipline: huidigeDiscipline,
      onClose: function() {
        setSeizoenArchiefOpen(false);
      },
      onOngedaan: function() {
        seizoensplitsingOngedaanMaken();
        setSeizoenArchiefOpen(false);
      },
      onVerhaal: function(s) {
        setSeizoenArchiefOpen(false);
        setVerhaalSeizoen(s);
      }
    }
  ), partijSamenvatting && /* @__PURE__ */ React.createElement(PartijSamenvatting, { partij: partijSamenvatting.partij, st: partijSamenvatting.st, prestatie: partijSamenvatting.prestatie, infoNa: partijSamenvatting.infoNa, nieuweDrop: partijSamenvatting.nieuweDrop, niveauOmhoog: partijSamenvatting.niveauOmhoog, discipline: huidigeDiscipline, onClose: function() {
    setPartijSamenvatting(null);
  } }), niveauUpInfo && /* @__PURE__ */ React.createElement(
    "div",
    {
      onClick: function() {
        setNiveauUpInfo(null);
      },
      style: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.85)", zIndex: 210, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, cursor: "pointer" }
    },
    /* @__PURE__ */ React.createElement("div", { style: { background: "linear-gradient(160deg,var(--c-2a4a1e),var(--c-0d1f0d))", border: "3px solid " + niveauUpInfo.naar.kleur, borderRadius: 22, padding: "28px 22px", maxWidth: 360, width: "100%", textAlign: "center", boxShadow: "0 0 60px " + niveauUpInfo.naar.kleur + "66, 0 10px 44px rgba(0,0,0,0.7)", animation: "badgePopIn 0.5s cubic-bezier(0.34,1.56,0.64,1)" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, color: WITD, textTransform: "uppercase", letterSpacing: 3, marginBottom: 10 } }, t("Niveau omhoog!")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", opacity: 0.5 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 30 } }, niveauUpInfo.van.emoji), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: WITD } }, niveauUpInfo.van.naam)), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 22, color: niveauUpInfo.naar.kleur } }, "→"), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { width: 64, height: 64, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%," + niveauUpInfo.naar.kleur + "ee," + niveauUpInfo.naar.kleur + "55)", border: "3px solid " + niveauUpInfo.naar.kleur, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, boxShadow: "0 0 22px " + niveauUpInfo.naar.kleur + "aa", margin: "0 auto 6px" } }, niveauUpInfo.naar.emoji), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, fontWeight: "bold", color: niveauUpInfo.naar.kleur } }, niveauUpInfo.naar.naam))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: WITD, opacity: 0.85 } }, t("Je vorm heeft de {d}-drempel gehaald", { d: getalTekst(niveauUpInfo.naar.gemDrempel, 1) })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: WITD, marginTop: 16, opacity: 0.7 } }, t("Tik om te sluiten")))
  ), toastGroep && /* @__PURE__ */ React.createElement(
    "div",
    {
      onClick: function() {
        setToastGroep(null);
      },
      style: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.75)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, cursor: "pointer" }
    },
    /* @__PURE__ */ React.createElement("div", { style: { background: "linear-gradient(160deg,var(--c-1e3a1e),var(--c-0d1f0d))", border: "2px solid " + GOUD, borderRadius: 20, padding: "24px 20px 18px", maxWidth: 360, width: "100%", textAlign: "center", boxShadow: "0 10px 44px rgba(0,0,0,0.6)", animation: "badgePopIn 0.4s cubic-bezier(0.34,1.56,0.64,1)" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, color: WITD, textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 } }, t("Prestatie behaald!")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 36, fontWeight: "bold", color: GOUD, marginBottom: 18, textShadow: "0 0 20px rgba(201,168,76,0.5)" } }, "+", toastGroep.reduce(function(a, b) {
      return a + b.punten;
    }, 0), "pt"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" } }, toastGroep.map(function(b, i) {
      const kleur = categorieKleur(b.categorie);
      return /* @__PURE__ */ React.createElement("div", { key: i, style: { display: "flex", flexDirection: "column", alignItems: "center", width: 88 } }, /* @__PURE__ */ React.createElement("div", { style: { width: 66, height: 66, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%," + kleur + "dd," + kleur + "44)", border: "3px solid " + kleur, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, boxShadow: "0 0 18px " + kleur + "99", marginBottom: 6 } }, b.emoji), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: WIT, fontWeight: "bold", lineHeight: 1.25 } }, badgeLabel(b.label)), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, color: kleur, fontWeight: "bold" } }, "+", b.punten));
    })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: WITD, marginTop: 20, opacity: 0.7 } }, t("Tik om te sluiten")))
  ), confPartij && /* @__PURE__ */ React.createElement("div", { style: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 } }, /* @__PURE__ */ React.createElement("div", { style: { background: "var(--c-1a2e1a)", border: "2px solid " + GOUD, borderRadius: 14, padding: 24, maxWidth: 320, width: "100%" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, color: WIT, marginBottom: 6, textAlign: "center" } }, t("Partij opslaan?")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, color: WITD, marginBottom: 18, textAlign: "center" } }, t("{n} beurten - {c} car", { n: lp.length, c: totCarLp }), stL ? " - " + t("gem") + " " + decTekst(stL.gemPerBeurt) : ""), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10 } }, /* @__PURE__ */ React.createElement("button", { style: { flex: 1, padding: 14, background: GRNT, border: "none", borderRadius: 8, color: WIT, cursor: "pointer", fontFamily: "inherit", fontSize: 14 }, onClick: sluit }, t("Opslaan")), /* @__PURE__ */ React.createElement("button", { style: { flex: 1, padding: 14, background: "none", border: "1px solid " + KBDR, borderRadius: 8, color: WITD, cursor: "pointer", fontFamily: "inherit", fontSize: 14 }, onClick: function() {
    setConfPartij(false);
  } }, t("Annuleer"))))), kaderKiezerOpen && /* @__PURE__ */ React.createElement("div", { onClick: function() {
    setKaderKiezerOpen(false);
  }, style: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.75)", zIndex: 220, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, cursor: "pointer" } }, /* @__PURE__ */ React.createElement("div", { "data-kaderkiezer": "", onClick: function(e) {
    e.stopPropagation();
  }, style: { background: "linear-gradient(160deg,var(--c-1e3a1e),var(--c-0d1f0d))", border: "2px solid " + GOUD, borderRadius: 16, padding: "18px 16px", maxWidth: 340, width: "100%", maxHeight: "calc(85vh / var(--zoom,1))", overflowY: "auto" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 16, fontWeight: "bold", color: GOUD, marginBottom: 4, textAlign: "center" } }, t("Kies je kader-variant")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: WITD, textAlign: "center", marginBottom: 14 } }, t("Elke variant heeft zijn eigen gemiddelde en niveau, los van de andere")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, KADER_VARIANTEN.map(function(k) {
    const actief = huidigeDiscipline === k;
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: k,
        onClick: function() {
          wisselDiscipline(k);
          setKaderKiezerOpen(false);
        },
        style: { padding: "12px 10px", background: actief ? "var(--c-2d4a1e)" : "none", border: "1px solid " + (actief ? GOUD : KBDR), borderRadius: 10, color: actief ? GOUD : WIT, cursor: "pointer", fontFamily: "inherit", fontSize: 15, textAlign: "left" }
      },
      DISCIPLINES[k].naam
    );
  })), /* @__PURE__ */ React.createElement("div", { onClick: function() {
    setKaderKiezerOpen(false);
  }, style: { textAlign: "center", marginTop: 14, fontSize: 12, color: WITD, opacity: 0.7, cursor: "pointer" } }, t("Tik om te sluiten")))), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" } }, tab === "spelen" && /* @__PURE__ */ React.createElement("div", { style: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" } }, fase === "setup" && /* @__PURE__ */ React.createElement(SetupScherm, { spel }), fase === "invoer" && /* @__PURE__ */ React.createElement(InvoerScherm, { spel }), fase === "gemist" && /* @__PURE__ */ React.createElement(GemistScherm, { spel }), fase === "goed" && /* @__PURE__ */ React.createElement(GoedScherm, { spel })), tab === "stats" && /* @__PURE__ */ React.createElement(
    StatsTab,
    {
      data,
      alleP,
      huidigeDiscipline,
      niveau,
      prestatiesMap,
      seizoenAfsluiten,
      seizoensplitsingOngedaanMaken,
      openArchief: function() {
        setSeizoenArchiefOpen(true);
      },
      verwijderPartij,
      slaNotitieOp,
      openVerhaal: function(s) {
        setVerhaalSeizoen(s);
      },
      vormVenster,
      setVormVenster
    }
  ), tab === "info" && /* @__PURE__ */ React.createElement(
    InfoTab,
    {
      data,
      alleP,
      huidigeDiscipline,
      niveau,
      resetAlles,
      setSpelelement,
      setWeergave,
      openUitleg: function() {
        setUitlegOpen(true);
      },
      vervangData,
      backupGemaakt
    }
  ), tab === "log" && /* @__PURE__ */ React.createElement(LogTab, { lp, alleP, prestatiesMap, niveau, huidigeDiscipline, verwijderPartij, slaNotitieOp }), tab === "dash" && /* @__PURE__ */ React.createElement(Dashboard, { key: huidigeDiscipline, partijen: alleP, niveau, tijdsvensterMaanden, discipline: huidigeDiscipline })))))));
}
ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(BiljartTracker, null));
