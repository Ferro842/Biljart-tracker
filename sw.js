// Service worker van Carom Tracker: maakt de app installeerbaar (samen met manifest.json) en laat de
// website ook zonder internet openen.
// Strategie "eerst het netwerk": elk bestand wordt eerst van de server gehaald (dus altijd de nieuwste
// versie) en in de cache bewaard. Alleen als dat mislukt, of langer duurt dan NETWERK_WACHT_MS terwijl er
// een kopie is, komt het bestand uit de cache. Kan het opslaan niet, dan werkt alles gewoon via internet.
// Je partijen staan los hiervan in de opslag van de app; de cache bevat alleen de app-bestanden.
// In de iOS-app (Capacitor) wordt deze service worker niet gebruikt; die heeft alle bestanden al.

var CACHE = "biljart-tracker-v1";
var NETWERK_WACHT_MS = 4000;
// Bij de eerste keer alvast bewaren, zodat de app daarna meteen offline werkt. Paden zonder ?v=; bij het
// opzoeken wordt ?v= genegeerd als de exacte versie er (nog) niet in staat.
var VOORAF = [
  "./", "index.html", "manifest.json", "icon192.png", "icon512.png", "icon180.png", "logo.png",
  "css/app.css",
  "vendor/react.production.min.js", "vendor/react-dom.production.min.js", "vendor/babel.min.js",
  "js/constanten.js", "js/taal.js", "js/taal-en.js", "js/taal-fr.js", "js/taal-de.js", "js/taal-es.js", "js/taal-tr.js", "js/taal-ko.js", "js/berekeningen.js", "js/opslag.js",
  "jsx/onderdelen.jsx", "jsx/wauw.jsx", "jsx/vensters.jsx", "jsx/partijrij.jsx", "jsx/inzicht.jsx", "jsx/dashboard.jsx",
  "jsx/tabs.jsx", "jsx/spelen.jsx"
];

self.addEventListener("install", function(event) {
  self.skipWaiting();
  // Elk bestand los, zodat één ontbrekend bestand de installatie nooit laat mislukken
  event.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return Promise.all(VOORAF.map(function(pad) {
        return cache.add(new Request(pad, { cache: "reload" })).catch(function() {});
      }));
    }).catch(function() {})
  );
});

self.addEventListener("activate", function(event) {
  // Oude caches (andere naam) opruimen
  event.waitUntil(
    caches.keys().then(function(namen) {
      return Promise.all(namen.filter(function(n) { return n !== CACHE; }).map(function(n) { return caches.delete(n); }));
    }).catch(function() {}).then(function() { return self.clients.claim(); })
  );
});

// Kopie uit de cache: eerst exact (met ?v=), anders zonder query, en voor een pagina desnoods index.html
function uitCache(request) {
  return caches.open(CACHE).then(function(cache) {
    return cache.match(request).then(function(r) {
      if (r) return r;
      return cache.match(request, { ignoreSearch: true }).then(function(r2) {
        if (r2) return r2;
        if (request.mode === "navigate") {
          return cache.match("index.html", { ignoreSearch: true }).then(function(r3) {
            return r3 || cache.match("./");
          });
        }
        return undefined;
      });
    });
  }).catch(function() { return undefined; });
}

self.addEventListener("fetch", function(event) {
  var request = event.request;
  // Alleen gewone GET-verzoeken naar onze eigen site; al het andere gaat ongemoeid naar het netwerk
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(new Promise(function(resolve, reject) {
    var klaar = false;
    function geef(r) { if (!klaar && r) { klaar = true; resolve(r); return true; } return false; }

    var netwerk = fetch(request).then(function(antwoord) {
      // Alleen goede antwoorden bewaren (geen foutpagina's)
      if (antwoord && antwoord.ok && antwoord.type === "basic") {
        var kopie = antwoord.clone();
        caches.open(CACHE).then(function(cache) { return cache.put(request, kopie); }).catch(function() {});
      }
      return antwoord;
    });

    // Traag netwerk: na NETWERK_WACHT_MS de kopie gebruiken als die er is
    var wachter = setTimeout(function() {
      uitCache(request).then(function(r) { geef(r); });
    }, NETWERK_WACHT_MS);

    netwerk.then(function(antwoord) {
      clearTimeout(wachter);
      if (!geef(antwoord)) return;
    }).catch(function(fout) {
      // Geen verbinding: de kopie uit de cache, en anders de fout doorgeven
      clearTimeout(wachter);
      uitCache(request).then(function(r) {
        if (!geef(r) && !klaar) { klaar = true; reject(fout); }
      });
    });
  }));
});
