import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ArticalListPage } from './artical-list.page';
import {ComponentsModule} from '../components.modules'

const routes: Routes = [
  {
    path: '',
    component: ArticalListPage
  }
  // ,
  // {
  //   path: 'edit-artical',
  //   loadChildren: '../articals-list-edit/articals-list-edit.module#ArticalsListEditPageModule'
  // },
  ,{
    path: 'edit-artical',
    loadChildren: '../item-edit/item-edit.module#ItemEditPageModule'
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ArticalListPage]
})
export class ArticalListPageModule {}
