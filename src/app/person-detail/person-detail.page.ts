import { Component, OnInit } from '@angular/core';
import { PERSON_HEADER } from 'src/models/PERSON_HEADER';
import { E_MAIL } from 'src/models/E_MAIL';
import { NavController } from '@ionic/angular';
import { AppConstant } from 'src/constants/appConstant';
import { UnviredCordovaSDK, ResultType } from '@ionic-native/unvired-cordova-sdk/ngx';
import { Router } from '@angular/router';

@Component({
  selector: 'app-person-detail',
  templateUrl: './person-detail.page.html',
  styleUrls: ['./person-detail.page.scss'],
})
export class PersonDetailPage implements OnInit {

  personHeader = {} as PERSON_HEADER;
  emails: E_MAIL[] = [];

  constructor(public navCtrl: NavController,
              private unviredCordovaSdk: UnviredCordovaSDK,
              private router: Router) {
    this.personHeader = this.router.getCurrentNavigation().extras.queryParams.incomingPersonHeader;
  }

  ngOnInit() {
    console.log('ionViewDidLoad PersonDetail');
    this.getEmail();
    this.setupData();
  }

  ionViewDidLoad() {
  }

  async getEmail() {
    const dbRst = await this.unviredCordovaSdk.dbSelect(AppConstant.TABLE_NAME_E_MAIL, `PERSNUMBER = '${this.personHeader.PERSNUMBER}'`);
    if (dbRst.type === ResultType.success) {
      this.emails = dbRst.data;
    } else {
      console.log('FAILURE:' + dbRst.error);
    }
  }

  setupData() {
    if (this.personHeader.PROFESSION === undefined || this.personHeader.PROFESSION === '') {
      this.personHeader.PROFESSION = 'Profession';
    }

    if (this.personHeader.BIRTHDAY === undefined || this.personHeader.BIRTHDAY === '') {
      this.personHeader.BIRTHDAY = 'Birthday';
    }

    const height = String(this.personHeader.HEIGHT);
    if (height === undefined || height === '') {
      this.personHeader.HEIGHT = 0;
    }

    const weight = String(this.personHeader.WEIGHT);
    if (weight === '' || weight === undefined) {
      this.personHeader.WEIGHT = 0;
    }
  }
}
