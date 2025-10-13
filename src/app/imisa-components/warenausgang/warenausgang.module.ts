import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WarenausgangPageRoutingModule } from './warenausgang-routing.module';

import { WarenausgangPage } from './warenausgang.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WarenausgangPageRoutingModule
  ],
  declarations: [WarenausgangPage]
})
export class WarenausgangPageModule {}
