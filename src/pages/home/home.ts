import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ActionSheetController } from 'ionic-angular';

import { GetPerson } from '../get-person/get-person'
import { AddPerson } from '../add-person/add-person';
import { PersonDetail } from '../person-detail/person-detail';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(public navCtrl: NavController, public actionSheetCtrl: ActionSheetController) {

  }

  menuButtonClicked() {
    let actionSheet = this.actionSheetCtrl.create({
      buttons: [
        {
          text: 'Get Person',
          handler: () => {
            console.log('Get Person clicked');
            this.navCtrl.push(GetPerson)
          }
        }, {
          text: 'Settings',
          handler: () => {
            console.log('Settings clicked');
          }
        }, {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    })
    actionSheet.present()
  }

  addButtonClicked() {
    this.navCtrl.push(AddPerson)
  }

  viewPersonDetail() {
    this.navCtrl.push(PersonDetail)
  }
}
