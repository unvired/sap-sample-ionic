import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PersonDetail } from './person-detail';

@NgModule({
  declarations: [
    PersonDetail,
  ],
  imports: [
    IonicPageModule.forChild(PersonDetail),
  ],
})
export class PersonDetailModule {}
