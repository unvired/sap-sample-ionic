import { Component } from '@angular/core';
import { NavController, NavParams } from "ionic-angular";
import { AlertController } from 'ionic-angular';

/**
 * Generated class for the AddPerson page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
  selector: 'page-add-person',
  templateUrl: 'add-person.html',
})
export class AddPerson {

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AddPerson');
  }

  addEmailButtonClicked() {
    let prompt = this.alertCtrl.create({
      title: 'Email',
      message: "Please input your email:",
      inputs: [
        {
          name: 'email',
          placeholder: 'Email'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Confirm',
          handler: data => {
            console.log('Conform clicked');
          }
        }
      ]
    });
    prompt.present();
  }
}

