import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PERSON_HEADER } from 'src/models/PERSON_HEADER';
import { E_MAIL } from 'src/models/E_MAIL';
import { NavController, AlertController, LoadingController, Platform } from '@ionic/angular';
import { UnviredCordovaSDK, ResultType, RequestType, SyncResult } from '@ionic-native/unvired-cordova-sdk/ngx';
import { AppConstant } from 'src/constants/appConstant';
import { EventService } from '../event.service';

@Component({
  selector: 'app-add-person',
  templateUrl: './add-person.page.html',
  styleUrls: ['./add-person.page.scss'],
})
export class AddPersonPage implements OnInit {
  personHeader: PERSON_HEADER = new PERSON_HEADER();
  emailIds: E_MAIL[] = [];
  load: HTMLIonLoadingElement;
  lid: '';

  constructor(private platform: Platform,
              public navCtrl: NavController,
              public alertCtrl: AlertController,
              private loading: LoadingController,
              private unviredCordovaSdk: UnviredCordovaSDK,
              private router: Router,
              private events: EventService
              ) { }

  ngOnInit() {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AddPerson');
  }

  async addEmailButtonClicked() {
    const prompt = await this.alertCtrl.create();
    prompt.title = 'Error';
    prompt.message = 'Please input your email';
    prompt.inputs = [{
      name: 'email',
      placeholder: 'Email'
    }];
    prompt.buttons = [{
        text: 'Cancel',
        handler: data => {
          console.log('Cancel clicked');
        }
      },
      {
        text: 'Confirm',
        handler: data => {
          const email = new E_MAIL(this.personHeader);
          email.E_ADDR = data.email;
          this.emailIds.push(email);
        }
      }];
    prompt.present();
  }

  createButtonClicked() {
    if (this.personHeader.FIRST_NAME === undefined || this.personHeader.FIRST_NAME.length === 0 || this.personHeader.FIRST_NAME === '') {
      this.showAlert('', 'Enter First name.');
      return;
    }

    if (this.personHeader.LAST_NAME === undefined || this.personHeader.LAST_NAME.length === 0 || this.personHeader.LAST_NAME === '') {
      this.showAlert('', 'Last name is mandatory.');
      return;
    }

    if (this.personHeader.SEX === undefined || this.personHeader.SEX.length === 0 || this.personHeader.SEX === '') {
      this.showAlert('', 'Please specify gender.');
      return;
    }
    this.personHeader.PERSNUMBER = 0;
    this.personHeader.MANDT = '800';

    if (this.emailIds.length > 0) {
      for (let i = 0; i < this.emailIds.length; i++) {
        const mail = this.emailIds[i];
        mail.MANDT = '800';
        mail.SEQNO_E_MAIL = i;
        mail.PERSNUMBER = this.personHeader.PERSNUMBER;
      }
    }
    this.savePersonHeaderToDB();
  }

  async updateHeaders() {
    const result = await this.unviredCordovaSdk.dbDelete(AppConstant.TABLE_NAME_PERSON_HEADER, 'PERSNUMBER = "' + 0 + '"');
    console.log('Deleted record ###### ' + JSON.stringify(result));
    if (result.type === ResultType.success) {
      const rslt = await this.unviredCordovaSdk.dbDelete(AppConstant.TABLE_NAME_E_MAIL, 'PERSNUMBER = "' + 0 + '"');
      console.log('Delete record of table email ' + JSON.stringify(rslt));
      this.updatePersonHeader();
    }
  }

  async savePersonHeaderToDB() {
    const insertRst = await this.unviredCordovaSdk.dbInsert(AppConstant.TABLE_NAME_PERSON_HEADER, this.personHeader, true);
    if (insertRst.type === ResultType.success) {
      console.log('Added Person Header Successfully to DB :' + JSON.stringify(insertRst));
      if (this.emailIds.length > 0) {
        this.saveEmailToDB();
      } else {
        this.sendDataToServer();
      }
    } else {
      console.log('Error while inserting Person Header to DB: ' + JSON.stringify(insertRst));
    }
  }

  async saveEmailToDB() {
    let count = this.emailIds.length;
    for (const email of this.emailIds) {
      const insertRst = await this.unviredCordovaSdk.dbUpdate(AppConstant.TABLE_NAME_E_MAIL, email, 'LID = "' + email.Lid + '"');
      if (insertRst.type === ResultType.success) {
        console.log('Added Email to DB' + JSON.stringify(insertRst));
        count = count - 1;
        if (count === 0) {
          this.sendDataToServer();
        }
      } else {
        console.log('Error while inserting Email to DB');
        count = count - 1;
        if (count === 0) {
          this.sendDataToServer();
        }
      }
    }
  }

  async sendDataToServer() {
    console.log('Sending data to server.....');

    const inputHeader = { PERSON_HEADER: this.personHeader};
    const inputHeader1 = { PERSON: [{ PERSON_HEADER: this.personHeader}]};
    this.showLaoding();
    let syncRst: SyncResult;
    if (this.platform.is('ios') || this.platform.is('android')) {
      syncRst = await this.unviredCordovaSdk.syncForeground(RequestType.RQST, inputHeader, '', AppConstant.PA_CREATE_PERSON, true);
    } else {
      syncRst = await this.unviredCordovaSdk.syncForeground(RequestType.RQST, '', inputHeader1, AppConstant.PA_CREATE_PERSON, true);
    }
    console.log('Response from server:' + JSON.stringify(syncRst));
    const dbData = await this.unviredCordovaSdk.dbSelect(AppConstant.TABLE_NAME_PERSON_HEADER, '');
    console.log('Data from person table /// ' + JSON.stringify(dbData));
    if (syncRst.type === ResultType.success) {
      this.dismissLoading();
      let infoMessage = syncRst.message;
      if (infoMessage === undefined || infoMessage.length === 0) {
        const data = syncRst.data;
        infoMessage = data.InfoMessage[0].message;
      }
      const tokens = infoMessage.split('person number=');
      const perNumber = tokens[1].split(')')[0];
      this.personHeader.PERSNUMBER = Number(perNumber);

      // tslint:disable-next-line:max-line-length
      const dbData1 = await this.unviredCordovaSdk.dbSelect(AppConstant.TABLE_NAME_PERSON_HEADER, `PERSNUMBER = '${this.personHeader.PERSNUMBER}'`);
      console.log('Data from person table /// ' + JSON.stringify(dbData1));

      if (this.emailIds.length > 0) {
        for (const mail of this.emailIds) {
          mail.PERSNUMBER = this.personHeader.PERSNUMBER;
        }
      }
       // Pending :- Update the values in DB
      this.updateHeaders();
      this.showAlert('', infoMessage);
    } else {
      this.dismissLoading();
      if (syncRst.message.length > 0) {
        this.showAlert('', syncRst.message);
      } else if (syncRst.error.length > 0) {
        this.showAlert('Error', syncRst.error);
      }
    }
  }

  async updatePersonHeader() {
    const insertRst = await this.unviredCordovaSdk.dbInsert(AppConstant.TABLE_NAME_PERSON_HEADER, this.personHeader, true);
    console.log('####### update data ######## ' + JSON.stringify(insertRst));
    if (insertRst.type === ResultType.success) {
      console.log('Updated Person Header' + JSON.stringify(insertRst));

      if (this.emailIds.length > 0) {
        this.updateEmails();
      } else {
        this.navCtrl.pop();
      }
    } else {
      console.log('Error while updating Person Header' + JSON.stringify(insertRst));
    }
  }

  async updateEmails() {
    let count = this.emailIds.length;
    for (const mail of this.emailIds) {
      const insertedData = await this.unviredCordovaSdk.dbUpdate(AppConstant.TABLE_NAME_E_MAIL, mail, 'LID = "' + mail.Lid + '"');
      const fetch = await this.unviredCordovaSdk.dbSelect(AppConstant.TABLE_NAME_E_MAIL, '');
      console.log('fetch >>>> ' + JSON.stringify(fetch));
      if (insertedData.type === ResultType.success) {
        console.log('Updated E_MAIL' + JSON.stringify(insertedData));
        count = count - 1;
        if (count === 0) {
          // this.events.publish('didDownloadPerson', '');
          this.events.sub.next('');
          this.navCtrl.pop();
        }
      } else {
        console.log('Error while updating E_MAIL' + JSON.stringify(insertedData));
        count = count - 1;
        if (count === 0) {
          // this.events.publish('didDownloadPerson', '');
          this.events.sub.next('');
          this.navCtrl.pop();
        }
      }
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
}
