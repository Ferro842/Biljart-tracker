import UIKit
import Capacitor

// Hoofdscherm van de app: de gewone Capacitor-weergave, plus de eigen plugins van deze app.
class MainViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(ICloudBackupPlugin())
    }
}
