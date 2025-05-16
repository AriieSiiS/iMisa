import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouteReuseStrategy } from "@angular/router";

import { IonicModule, IonicRouteStrategy } from "@ionic/angular";
import { SplashScreen } from "@awesome-cordova-plugins/splash-screen/ngx";
import { StatusBar } from "@awesome-cordova-plugins/status-bar/ngx";

import { AppComponent } from "./app.component";
import { AppRoutingModule } from "./app-routing.module";
import { HttpClientModule } from "@angular/common/http";
import { CommonService } from "./imisa-services/common.service";
import { SQLite } from "@awesome-cordova-plugins/sqlite/ngx";
import { CommonModule, DatePipe } from "@angular/common";
import { BarcodeScanner } from "@awesome-cordova-plugins/barcode-scanner/ngx";
import { NativeStorage } from "@awesome-cordova-plugins/native-storage/ngx";
import { Network } from "@awesome-cordova-plugins/network/ngx";
import { Device } from '@awesome-cordova-plugins/device/ngx';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    CommonModule,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    CommonService,
    DatePipe,
    BarcodeScanner,
    NativeStorage,
    SQLite,
    Network,
    Device,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
