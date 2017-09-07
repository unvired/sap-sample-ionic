import { Component } from '@angular/core';
import { NavController, NavParams } from "ionic-angular";
import { PERSON_HEADER } from "../../models/PERSON_HEADER";
import { E_MAIL } from "../../models/E_MAIL";
import { AppConstant } from "../../constants/appConstant";

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
  personHeader = <PERSON_HEADER>{}
  emails: E_MAIL[] = []

  constructor(public navCtrl: NavController,
    public navParams: NavParams) {
    this.personHeader = this.navParams.get("incomingPersonHeader")
    this.getEmail()
    this.setupData()
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PersonDetail');
  }

  getEmail() {
    ump.db.select(AppConstant.TABLE_NAME_E_MAIL, { 'PERSNUMBER': this.personHeader.PERSNUMBER }, (result) => {
      if (result.type === ump.resultType.success) {
        this.emails = result.data
      }
      else {
        console.log("FAILURE:" + result.error);
      }
    })
  }

  setupData() {
    if (this.personHeader.PROFESSION.length == 0 || this.personHeader.PROFESSION == undefined || this.personHeader.PROFESSION == "") {
      this.personHeader.PROFESSION = "Profession"
    }

    if (this.personHeader.BIRTHDAY.length == 0 || this.personHeader.BIRTHDAY == undefined || this.personHeader.BIRTHDAY == "") {
      this.personHeader.BIRTHDAY = "Birthday"
    }

    let height = String(this.personHeader.HEIGHT)
    if (height.length == 0 || height == "undefined") {
      this.personHeader.HEIGHT = 0
    }

    let weight = String(this.personHeader.WEIGHT)
    if (weight.length == 0 || weight == "undefined") {
      this.personHeader.WEIGHT = 0
    }
  }
}
