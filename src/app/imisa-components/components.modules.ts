import { NgModule, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";

import { CameraScannerComponent } from "./camera-scanner/camera-scanner.component";
import { IonicModule } from "@ionic/angular";

@NgModule({
  imports: [IonicModule, CommonModule],
  declarations: [CameraScannerComponent],
  exports: [CameraScannerComponent],
})
export class ComponentsModule {}
