import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GetPersonPageRoutingModule } from './get-person-routing.module';

import { GetPersonPage } from './get-person.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GetPersonPageRoutingModule
  ],
  declarations: [GetPersonPage]
})
export class GetPersonPageModule {}
