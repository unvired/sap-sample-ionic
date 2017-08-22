import { Component } from '@angular/core';
import { NavParams, NavController } from "ionic-angular";

/**
 * Generated class for the GetPerson page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
  selector: 'page-get-person',
  templateUrl: 'get-person.html',
})
export class GetPerson {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad GetPerson');
  }

}
