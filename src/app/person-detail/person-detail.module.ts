import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PersonDetailPageRoutingModule } from './person-detail-routing.module';

import { PersonDetailPage } from './person-detail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PersonDetailPageRoutingModule
  ],
  declarations: [PersonDetailPage]
})
export class PersonDetailPageModule {}
