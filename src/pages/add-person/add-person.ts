import { Component } from '@angular/core';
import { NavController, NavParams } from "ionic-angular";
import { AlertController, LoadingController, Events } from 'ionic-angular';
import { PERSON_HEADER } from "../../models/PERSON_HEADER";
import { E_MAIL } from "../../models/E_MAIL";
import { AppConstant } from "../../constants/appConstant";

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
  personHeader: PERSON_HEADER = new PERSON_HEADER()
  emailIds: E_MAIL[] = []

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    private Loading: LoadingController,
    private events: Events) {
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
            let email = new E_MAIL(this.personHeader)
            email.E_ADDR = data.email
            this.emailIds.push(email)
          }
        }
      ]
    });
    prompt.present();
  }

  createButtonClicked() {

    if (this.personHeader.FIRST_NAME == undefined || this.personHeader.FIRST_NAME.length == 0 || this.personHeader.FIRST_NAME == "") {
      this.showAlert("", "Enter First name.")
      return
    }

    if (this.personHeader.LAST_NAME == undefined || this.personHeader.LAST_NAME.length == 0 || this.personHeader.LAST_NAME == "") {
      this.showAlert("", "Last name is mandatory.")
      return
    }

    if (this.personHeader.SEX == undefined || this.personHeader.SEX.length == 0 || this.personHeader.SEX == "") {
      this.showAlert("", "Please specify gender.")
      return
    }

    this.personHeader.PERSNUMBER = 0
    this.personHeader.MANDT = "800"

    if (this.emailIds.length > 0) {
      for (var i = 0; i < this.emailIds.length; i++) {
        let mail = this.emailIds[i]
        mail.MANDT = "800"
        mail.SEQNO_E_MAIL = i
        mail.PERSNUMBER = this.personHeader.PERSNUMBER
      }
    }

    this.savePersonHeaderToDB()

  }

  updateHeaders() {
    let query = "DELETE FROM " + AppConstant.TABLE_NAME_PERSON_HEADER + " WHERE PERSNUMBER = '0'"
      ump.db.executeStatement(query, result => {
      if (result.type === ump.resultType.success) {
        let query = "DELETE FROM " + AppConstant.TABLE_NAME_E_MAIL + " WHERE PERSNUMBER = '0'"
       
        ump.db.executeStatement(query, result => {
          this.updatePersonHeader()
        })
      }
    })
  }

  savePersonHeaderToDB() {
    ump.db.insert(AppConstant.TABLE_NAME_PERSON_HEADER, this.personHeader, true, (result: ump.callbackResult) => {
      if (result.type === ump.resultType.success) {
        console.log("Added Person Header Successfully to DB :" + JSON.stringify(result))
        if (this.emailIds.length > 0) {
          this.saveEmailToDB()
        }
        else {
          this.sendDataToServer()
        }
      }
      else {
        console.log("Error while inserting Person Header to DB: " + JSON.stringify(result));
      }
    })
  }

  saveEmailToDB() {
    var count = this.emailIds.length
    for (var email of this.emailIds) {
      ump.db.insert(AppConstant.TABLE_NAME_E_MAIL, email, false, (result: ump.callbackResult) => {
        if (result.type === ump.resultType.success) {
          console.log("Added Email to DB" + JSON.stringify(result))
          count = count - 1
          if (count == 0) {
             this.sendDataToServer()
          }
        }
        else {
          console.log("Error while inserting Email to DB")
          count = count - 1
          if (count == 0) {
             this.sendDataToServer()
          }
        }
      })
    }
  }

  sendDataToServer() {
    console.log("Sending data to server.....")
    var that = this
    let loading = this.Loading.create({
      content: "Please wait.",
      dismissOnPageChange: true,
    });

    var inputHeader: any = {}

    inputHeader["PERSON_HEADER"] = this.personHeader
    
    loading.present()
    ump.sync.submitInSync(ump.sync.requestType.RQST, inputHeader, null, AppConstant.PA_CREATE_PERSON, false, function (result) {
      loading.dismiss()
     
      if (result.type === ump.resultType.success) {
        let infoMessage = result.message
        let tokens = infoMessage.split("person number=")
        let perNumber = tokens[1].split(")")[0]
        that.personHeader.PERSNUMBER = Number(perNumber)

        if (that.emailIds.length > 0) {
          for (var mail of that.emailIds) {
            mail.PERSNUMBER = that.personHeader.PERSNUMBER
          }
        }

        // Pending :- Update the values in DB 
        that.updateHeaders()
        that.showAlert("", infoMessage)
      }
      else {
        if (result.message.length > 0) {
          that.showAlert("", result.message)
        }
        else if (result.error.length > 0) {
          that.showAlert("Error", result.error)
        }
      }
    })
  }

  updatePersonHeader() {
    ump.db.insert(AppConstant.TABLE_NAME_PERSON_HEADER, this.personHeader, true, (result: ump.callbackResult) => {
      if (result.type === ump.resultType.success) {
        console.log("Updated Person Header" + JSON.stringify(result))

        if (this.emailIds.length > 0) {
          this.updateEmails()
        }
        else {
          this.events.publish('didDownloadPerson')
          this.navCtrl.pop()
        }
      }
      else {
        console.log("Error while updating Person Header" + JSON.stringify(result))
      }
    })
  }

  updateEmails() {
    let count = this.emailIds.length
    for (var mail of this.emailIds) {

      ump.db.insert(AppConstant.TABLE_NAME_E_MAIL, mail, false, (result: ump.callbackResult) => {
        if (result.type === ump.resultType.success) {
          console.log("Updated E_MAIL" + JSON.stringify(result))
          count = count - 1
          if (count == 0) {
            this.events.publish('didDownloadPerson')
            this.navCtrl.pop()
          }
        }
        else {
          console.log("Error while updating E_MAIL" + JSON.stringify(result))
          count = count - 1
          if (count == 0) {
            this.events.publish('didDownloadPerson')
            this.navCtrl.pop()
          }
        }
      })
    }
  }

  showAlert(title: string, message: string) {
    let alert = this.alertCtrl.create({
      title: title,
      subTitle: message,
      buttons: [{
        text: 'Ok'
      }],
    });
    alert.present();
  }
}

