import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InventoryTransferPageRoutingModule } from './inventory-transfer-routing.module';

import { InventoryTransferPage } from './inventory-transfer.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InventoryTransferPageRoutingModule
  ],
  declarations: [InventoryTransferPage]
})
export class InventoryTransferPageModule {}
