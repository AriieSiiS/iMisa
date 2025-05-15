import { NgModule, Component } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';


const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [{
      path: 'order',
      children: [{
        path: '',
        loadChildren: '../order/order.module#OrderPageModule'
      }]
    },
    {
      path: 'orderhistory',
      children: [{
        path: '',
        loadChildren: '../order-history/order-history.module#OrderHistoryPageModule'
      }]
    },
    {
      path: 'settings',
      children: [{
        path: '',
        loadChildren: '../settings/settings.module#SettingsPageModule'
      },

      ]
    },
    {
      path: 'articals',
      children: [
        {
          path: '',
          loadChildren: '../articals/articals.module#ArticalsPageModule',
        }
        // ,
        // {
        //   path: ':id',
        //   loadChildren: '../artical-list/artical-list.module#ArticalListPageModule',
        // }
      ]
    },
    // {
    //   path: 'articals/:id',
    //   children: [{
    //     path: '',
    //     loadChildren: '../artical-list/artical-list.module#ArticalListPageModule',
    //   }]
    // },
    {
      path: 'edit',
      loadChildren: '../item-edit/item-edit.module#ItemEditPageModule'
    },
    {
      path: '',
      redirectTo: '/tabs/order',
      pathMatch: 'full'
    }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/order',
    pathMatch: 'full'
  }


];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class TabsPageRoutingModule { }
