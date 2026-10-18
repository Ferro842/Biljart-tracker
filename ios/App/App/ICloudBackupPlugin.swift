import Foundation
import Capacitor

// Automatische back-up naar de iCloud Drive van de gebruiker (map "Carom Tracker", zichtbaar in de app Bestanden en
// op iPad/Mac). Alleen de eigen iCloud van de gebruiker: niets gaat naar de maker of een server.
// - carom-tracker-backup.json: altijd de nieuwste kopie
// - carom-tracker-JJJJ-MM-DD.json: één kopie per dag, de laatste BEWAAR_DAGEN blijven staan
// Staat iCloud Drive uit (of is er geen Apple ID), dan geeft status() beschikbaar=false en doet bewaar() niets.
// Aangeroepen vanuit js/opslag.js via Capacitor.registerPlugin("ICloudBackup"); geregistreerd in MainViewController.
@objc(ICloudBackupPlugin)
public class ICloudBackupPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "ICloudBackupPlugin"
    public let jsName = "ICloudBackup"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "status", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "bewaar", returnType: CAPPluginReturnPromise)
    ]

    static let containerId = "iCloud.nl.ferrovandam.biljarttracker"
    static let nieuwste = "carom-tracker-backup.json"
    static let bewaarDagen = 7
    private let rij = DispatchQueue(label: "nl.ferrovandam.biljarttracker.icloud")

    // Map Documents in de iCloud-container; die verschijnt in iCloud Drive als "Carom Tracker".
    // url(forUbiquityContainerIdentifier:) kan even duren en mag niet op de hoofdthread.
    private func documentenMap() -> URL? {
        guard FileManager.default.ubiquityIdentityToken != nil,
              let container = FileManager.default.url(forUbiquityContainerIdentifier: ICloudBackupPlugin.containerId) else { return nil }
        let map = container.appendingPathComponent("Documents", isDirectory: true)
        if !FileManager.default.fileExists(atPath: map.path) {
            try? FileManager.default.createDirectory(at: map, withIntermediateDirectories: true)
        }
        return map
    }

    private func isoDatum(_ d: Date?) -> String? {
        guard let d = d else { return nil }
        return ISO8601DateFormatter().string(from: d)
    }

    @objc func status(_ call: CAPPluginCall) {
        rij.async {
            guard let map = self.documentenMap() else {
                call.resolve(["beschikbaar": false])
                return
            }
            let bestand = map.appendingPathComponent(ICloudBackupPlugin.nieuwste)
            let attr = try? FileManager.default.attributesOfItem(atPath: bestand.path)
            var uit: [String: Any] = ["beschikbaar": true]
            if let datum = self.isoDatum(attr?[.modificationDate] as? Date) { uit["laatste"] = datum }
            call.resolve(uit)
        }
    }

    @objc func bewaar(_ call: CAPPluginCall) {
        guard let tekst = call.getString("data"), let gegevens = tekst.data(using: .utf8) else {
            call.reject("Geen data")
            return
        }
        rij.async {
            guard let map = self.documentenMap() else {
                call.resolve(["beschikbaar": false, "ok": false])
                return
            }
            let dag = DateFormatter()
            dag.locale = Locale(identifier: "en_US_POSIX")
            dag.dateFormat = "yyyy-MM-dd"
            let doelen = [
                map.appendingPathComponent(ICloudBackupPlugin.nieuwste),
                map.appendingPathComponent("carom-tracker-\(dag.string(from: Date())).json")
            ]
            var fout: Error?
            for doel in doelen {
                // Via NSFileCoordinator, zodat iCloud het bestand niet halverwege oppakt
                var coordFout: NSError?
                NSFileCoordinator(filePresenter: nil).coordinate(writingItemAt: doel, options: .forReplacing, error: &coordFout) { url in
                    do { try gegevens.write(to: url, options: .atomic) } catch { fout = error }
                }
                if let c = coordFout { fout = c }
            }
            if let f = fout {
                call.reject("iCloud-back-up mislukt: \(f.localizedDescription)")
                return
            }
            self.ruimOp(map)
            call.resolve(["beschikbaar": true, "ok": true, "laatste": self.isoDatum(Date()) ?? ""])
        }
    }

    // Dagkopieën ouder dan de laatste BEWAAR_DAGEN weghalen (de namen sorteren op datum)
    private func ruimOp(_ map: URL) {
        guard let namen = try? FileManager.default.contentsOfDirectory(atPath: map.path) else { return }
        let dagen = namen.filter { $0.hasPrefix("carom-tracker-") && $0 != ICloudBackupPlugin.nieuwste && $0.hasSuffix(".json") }.sorted()
        guard dagen.count > ICloudBackupPlugin.bewaarDagen else { return }
        for naam in dagen.prefix(dagen.count - ICloudBackupPlugin.bewaarDagen) {
            let url = map.appendingPathComponent(naam)
            var coordFout: NSError?
            NSFileCoordinator(filePresenter: nil).coordinate(writingItemAt: url, options: .forDeleting, error: &coordFout) { u in
                try? FileManager.default.removeItem(at: u)
            }
        }
    }
}
