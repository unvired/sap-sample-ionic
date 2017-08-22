import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddPerson } from './add-person';

@NgModule({
  declarations: [
    AddPerson,
  ],
  imports: [
    IonicPageModule.forChild(AddPerson),
  ],
})
export class AddPersonModule {}
