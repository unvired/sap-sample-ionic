import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GetPersonPage } from './get-person.page';

const routes: Routes = [
  {
    path: '',
    component: GetPersonPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GetPersonPageRoutingModule {}
