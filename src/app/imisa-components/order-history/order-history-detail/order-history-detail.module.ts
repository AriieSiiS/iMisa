import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OrderHistoryDetailPageRoutingModule } from './order-history-detail-routing.module';

import { OrderHistoryDetailPage } from './order-history-detail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OrderHistoryDetailPageRoutingModule
  ],
  declarations: [OrderHistoryDetailPage]
})
export class OrderHistoryDetailPageModule {}
