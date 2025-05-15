import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: 'tabs', loadChildren: './imisa-components/tabs/tabs.module#TabsPageModule' },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)},
  { path: '', loadChildren: './imisa-components/tabs/tabs.module#TabsPageModule' },
  // { path: 'articals', loadChildren: './imisa-components/articals/articals.module#ArticalsPageModule' },
  // { path: 'artical-list', loadChildren: './imisa-components/artical-list/artical-list.module#ArticalListPageModule' },
  { path: 'item-edit', loadChildren: './imisa-components/item-edit/item-edit.module#ItemEditPageModule' },
  { path: 'app-settings', loadChildren: './imisa-components/app-settings/app-settings.module#AppSettingsPageModule' },
  // { path: 'articals-list-edit', loadChildren: './imisa-components/articals-list/articals-list.module#ArticalsListPageModule' },
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes,{onSameUrlNavigation: 'reload'})
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
