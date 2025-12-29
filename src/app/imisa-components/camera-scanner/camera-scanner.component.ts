import { Component, OnInit, OnDestroy } from "@angular/core";
import { BarcodeScanner } from "@awesome-cordova-plugins/barcode-scanner/ngx";
import { CommonService } from "../../imisa-services/common.service";
import { Router } from "@angular/router";
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
      if (!this.isWeb) {
        this.barcodeScanner
          .scan({
            showFlipCameraButton: true,
            showTorchButton: true,
            prompt: "Escanear código QR o código de barras",
            resultDisplayDuration: 0,
            formats: "QR_CODE,DATA_MATRIX,EAN_8,EAN_13,CODE_39,CODE_93,CODE_128,UPC_A,UPC_E,ITF,CODABAR,PDF_417,AZTEC",
            orientation: "portrait",
          })
          .then(async (res) => {
            if (!res.cancelled) {
              this.addOrder(res.text);
            }
          })
          .catch((err) => {
            //this.commonService.showErrorMessage("Error " + err);
          });
      } else {
        this.commonService.showErrorMessage(
          "The camera scanning feature is not available on this device."
        );
      }
    } else {
      this.commonService.showErrorMessage(
        "The camera scanning feature is not available on this device."
      );
    }
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
