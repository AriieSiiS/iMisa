import { Component } from "@angular/core";
import { Platform } from "@ionic/angular";
import { CommonService } from "./imisa-services/common.service";
import { SplashScreen } from "@awesome-cordova-plugins/splash-screen/ngx";
import { StatusBar } from "@awesome-cordova-plugins/status-bar/ngx";

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
  styleUrls: ["app.component.scss"],
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private commonService: CommonService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform
      .ready()
      .then(async () => {
        console.log("AppComponent: platform.ready() disparado.");

        // PASO CRUCIAL: Asegurarse de que CommonService esté completamente inicializado
        await this.commonService.ensureInitialized();
        console.log(
          "AppComponent: CommonService y plugins inicializados completamente."
        );

        if (this.statusBar) {
          this.statusBar.styleDefault();
          console.log("AppComponent: StatusBar configurado.");
        }
        if (this.splashScreen) {
          this.splashScreen.hide();
          console.log("AppComponent: SplashScreen ocultado.");
        }
      })
      .catch((error) => {
        console.error(
          "AppComponent: Error durante la inicialización de la plataforma o CommonService:",
          error
        );
      });
  }
}
