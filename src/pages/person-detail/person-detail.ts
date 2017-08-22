import { Component } from '@angular/core';
import { NavController, NavParams } from "ionic-angular";

/**
 * Generated class for the PersonDetail page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
  selector: 'page-person-detail',
  templateUrl: 'person-detail.html',
})
export class PersonDetail {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PersonDetail');
  }

}
