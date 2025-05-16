import { Component, OnInit, OnDestroy } from "@angular/core";
import { BarcodeScanner } from "@awesome-cordova-plugins/barcode-scanner/ngx";
import { CommonService } from "../../imisa-services/common.service";
import { Router, ActivatedRoute } from "@angular/router";
import { OrderCommonService } from "../../imisa-services/order-common.service";
import { Platform } from "@ionic/angular";
import { BrowserMultiFormatReader } from "@zxing/browser";

@Component({
  selector: "app-camera-scanner",
  templateUrl: "./camera-scanner.component.html",
  styleUrls: ["./camera-scanner.component.scss"],
  standalone: false,
})
export class CameraScannerComponent implements OnInit, OnDestroy {
  codeReader: BrowserMultiFormatReader | null = null;
  isWeb: boolean = false;

  constructor(
    private barcodeScanner: BarcodeScanner,
    private orderCommonService: OrderCommonService,
    public commonService: CommonService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private platform: Platform
  ) {
    this.isWeb = !this.platform.is("cordova");
  }

  ngOnInit() {}

  ngOnDestroy(): void {
    this.codeReader = null;
  }

  async scanBarcode() {
    if (this.commonService.canUseCameraScanning) {
      console.log("isWeb:", this.isWeb);
      if (this.isWeb) {
        this.scanBarcodeWeb();
      } else {
        this.barcodeScanner
          .scan()
          .then(async (res) => {
            this.addOrder(res.text);
          })
          .catch((err) => {
            //this.commonService.showErrorMessage("Error escaneando: " + err);
          });
      }
    } else {
      this.commonService.showErrorMessage(
        "The camera scanning feature is not available on this device."
      );
    }
  }

  scanBarcodeWeb() {
    if (!this.codeReader) {
      this.codeReader = new BrowserMultiFormatReader();
    }

    this.codeReader.decodeFromVideoDevice(
      null,
      "video-preview",
      async (result: any, error: any, controls: any) => {
        //console.log("[ZXing Callback] result:", result);
        //console.log("[ZXing Callback] error:", error);

        if (result) {
          controls.stop();
          this.codeReader = null;

          // Log del código leído
          console.log("[ZXing Callback] Código detectado:", result.getText());

          // Mostrar toast de éxito
          this.commonService.showMessage(
            "Success! Code scanned: " + result.getText()
          );

          await this.addOrder(result.getText());
        }

        // Opcional: solo muestra errores importantes, ignora "no se encontró"
        if (
          error &&
          error.message &&
          !error.message.includes("No barcode found")
        ) {
          //console.error("[ZXing Callback] Error importante:", error);
          // this.commonService.showErrorMessage("Error escaneando: " + error);
        }
      }
    );
  }

  async addOrder(barcode) {
    console.log(barcode);
    var result = await this.orderCommonService.addOrder(barcode);
    if (result) {
      if (this.commonService.currentPresentedPage == "order") {
        this.router
          .navigateByUrl("tabs/settings", { skipLocationChange: true })
          .then(() => {
            this.router.navigate(["tabs"]);
          });
      }
    }
  }
}
