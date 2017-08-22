import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GetPerson } from './get-person';

@NgModule({
  declarations: [
    GetPerson,
  ],
  imports: [
    IonicPageModule.forChild(GetPerson),
  ],
})
export class GetPersonModule {}
