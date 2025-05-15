import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ArticalsPage } from './articals.page';
import {ComponentsModule} from '../components.modules'

const routes: Routes = [
  {
    path: '',
    component: ArticalsPage
  }
  ,
  {
    path: 'artical-list',
    loadChildren: '../artical-list/artical-list.module#ArticalListPageModule'
  }
];

@NgModule({ 
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ArticalsPage]
})
export class ArticalsPageModule {}
