import { Component, OnInit } from '@angular/core';
import { PERSON_HEADER } from 'src/models/PERSON_HEADER';
import { E_MAIL } from 'src/models/E_MAIL';
import { NavController, AlertController, LoadingController, Platform } from '@ionic/angular';
import { AppConstant } from 'src/constants/appConstant';
import { EventService } from '../event.service';
import { UnviredCordovaSDK, ResultType, RequestType, SyncResult } from '@ionic-native/unvired-cordova-sdk/ngx';
import { Router } from '@angular/router';

@Component({
  selector: 'app-get-person',
  templateUrl: './get-person.page.html',
  styleUrls: ['./get-person.page.scss'],
})
export class GetPersonPage implements OnInit {

  personNumber: number;
  personHeader = new PERSON_HEADER();
  private emails: E_MAIL[] = [];
  didGetPerson = false;
  load: HTMLIonLoadingElement;

  constructor(public navCtrl: NavController,
              public alertCtrl: AlertController,
              private loading: LoadingController,
              private router: Router,
              private unviredCordovaSdk: UnviredCordovaSDK,
              private platform: Platform,
              public events: EventService) {
  }

  ngOnInit() {
  }

  ionViewDidLoad() {

  }

  async back() {
    console.log('ionViewDidLoad GetPerson');
    if (this.didGetPerson) {
      const alert = await this.alertCtrl.create({
        header: '',
        subHeader: 'Do you want to save results?',
        buttons: [{
          text: 'Yes',
          handler: async () => {
            // tslint:disable-next-line:max-line-length
            const rst = await this.unviredCordovaSdk.dbDelete(AppConstant.TABLE_NAME_PERSON_HEADER, `PERSNUMBER = '${this.personHeader.PERSNUMBER}'`);
            if (rst.type === ResultType.success) {
            // tslint:disable-next-line:max-line-length
              const rst1 = await this.unviredCordovaSdk.dbDelete(AppConstant.TABLE_NAME_E_MAIL, `PERSNUMBER = '${this.personHeader.PERSNUMBER}'`);
              console.log('Deleted!!!!' + rst1);
              this.saveHeadersToDB();
            }
          }
        }, {
          text: 'No',
          handler: () => {
            this.navCtrl.pop();
          }
        }]
      });
      alert.present();
    } else {
      this.navCtrl.pop();
    }
  }

  ionViewWillLeave() {

  }

  async getPerson() {
    this.didGetPerson = false;
    const perNumber = String(this.personNumber);

    if (perNumber === 'undefined' || perNumber.length === 0) {
      this.showAlert('', 'Please provide Person Number');
      return;
    }

    const personHeader = new PERSON_HEADER();
    personHeader.PERSNUMBER = this.personNumber;
    personHeader.MANDT = '800';
    let syncRst: SyncResult;
    const inputHeader = { PERSON_HEADER : personHeader };
    const inputHeader1 = { PERSON: [{ PERSON_HEADER : personHeader }]};
    this.showLaoding();
    const insertRst = await this.unviredCordovaSdk.dbInsert(AppConstant.TABLE_NAME_PERSON_HEADER, personHeader, true);
    console.log('Inserted header to db ' + JSON.stringify(insertRst));
    if (this.platform.is('ios') || this.platform.is('android')) {
      // tslint:disable-next-line:max-line-length
      syncRst = await this.unviredCordovaSdk.syncBackground(RequestType.PULL, inputHeader, '', AppConstant.PA_GET_PERSON, 'PERSON', personHeader.Lid, true);
    } else {
      syncRst = await this.unviredCordovaSdk.syncForeground(RequestType.PULL, '', inputHeader1, AppConstant.PA_GET_PERSON, true);
    }
    console.log('Response from server: ' + JSON.stringify(syncRst));
    if (syncRst.type === ResultType.success) {
      this.dismissLoading();
      if (syncRst.data.length !== 0) {
        const jsonObj = syncRst.data;
        const personObj = jsonObj.PERSON[0];
        this.personHeader = personObj;
        // this.personHeader.CATEGORY1 = personObj.PERSON_HEADER.CATEGORY1;
        // this.personHeader.CRENAM = personObj.PERSON_HEADER.CRENAM;
        // this.personHeader.PERSNUMBER = personObj.PERSON_HEADER.PERSNUMBER;
        // this.personHeader.SEX = personObj.PERSON_HEADER.SEX;
        // this.personHeader.MANDT = personObj.PERSON_HEADER.MANDT;
        // this.personHeader.BIRTHDAY = personObj.PERSON_HEADER.BIRTHDAY;
        // this.personHeader.LAST_NAME = personObj.PERSON_HEADER.LAST_NAME;
        // this.personHeader.HEIGHT = personObj.PERSON_HEADER.HEIGHT;
        // this.personHeader.FIRST_NAME = personObj.PERSON_HEADER.FIRST_NAME;
        // this.personHeader.PROFESSION = personObj.PERSON_HEADER.PROFESSION;
        // this.personHeader.CATEGORY2 = personObj.PERSON_HEADER.CATEGORY2;
        // this.personHeader.CHGDAT = personObj.PERSON_HEADER.CHGDAT;
        // this.personHeader.CREDAT = personObj.PERSON_HEADER.CREDAT;
        // this.personHeader.CHGTIM = personObj.PERSON_HEADER.CHGTIM;
        // this.personHeader.CRETIM = personObj.PERSON_HEADER.CRETIM;
        // this.personHeader.WEIGHT = personObj.PERSON_HEADER.WEIGHT;
        // this.personHeader.CHGNAM = personObj.PERSON_HEADER.CHGNAM;

        if (personObj.E_MAIL) {
          this.emails = personObj.E_MAIL;
        }
        this.didGetPerson = true;
      } else {
        // tslint:disable-next-line:max-line-length
        const fetchData = await this.unviredCordovaSdk.dbSelect(AppConstant.TABLE_NAME_PERSON_HEADER, `PERSNUMBER = '${personHeader.PERSNUMBER}'`);
        console.log('Data fetched for particular person number ' + JSON.stringify(fetchData));
        const fetchData1 = await this.unviredCordovaSdk.dbSelect(AppConstant.TABLE_NAME_E_MAIL, '');
        console.log('Data fetched for particular person number ' + JSON.stringify(fetchData1));
        if (fetchData.data[0].length !== 0) {
          this.personHeader = fetchData.data[0];
          if (fetchData.data[0].E_MAIL) {
            this.emails = fetchData.data[0].E_MAIL;
          }
          this.didGetPerson = true;
        }
      }
      this.showAlert('', 'Person Downloaded.');
    } else {
      this.dismissLoading();
      if (syncRst.message.length > 0) {
        this.showAlert('', syncRst.message);
      } else if (syncRst.error.length > 0) {
        this.showAlert('Error', syncRst.error);
      }
    }
  }

  async showAlert(title: string, message: string) {
    const alert = await this.alertCtrl.create({
      header: title,
      subHeader: message,
      buttons: [{
        text: 'Ok'
      }],
    });
    alert.present();
  }

  async saveHeadersToDB() {
    const insertRst = await this.unviredCordovaSdk.dbInsert(AppConstant.TABLE_NAME_PERSON_HEADER, this.personHeader, true);
    if (insertRst.type === ResultType.success) {
      console.log('Added Person Successfully :' + JSON.stringify(insertRst));

      if (this.emails.length === 0) {
        this.events.sub.next('');
        this.navCtrl.pop();
      }

      for (let i = 0; i < this.emails.length; i++) {
        const mail = this.emails[i];
        mail.Fid = this.personHeader.Lid;
        const result = await this.unviredCordovaSdk.dbInsert(AppConstant.TABLE_NAME_E_MAIL, mail, true);
        if (result.type === ResultType.success) {
          console.log('Added E_MAIL Successfully :' + JSON.stringify(result));
          i = i - 1;
          if (i === 0) {
            this.events.sub.next('');
            this.navCtrl.pop();
          }
        } else {
          console.log('Failure: ' + JSON.stringify(result));
          i = i - 1;
          if (i === 0) {
            this.navCtrl.pop();
          }
        }
      }
    } else {
      console.log('Failure: ' + JSON.stringify(insertRst));
      this.navCtrl.pop();
    }
  }

  async showLaoding() {
    this.load = await this.loading.create({
      message: 'Please wait...',
      spinner: 'circles'
    });
    await this.load.present();
  }

  async dismissLoading() {
    setTimeout(() => {
      this.load.dismiss();
    }, 2000);
  }
}
