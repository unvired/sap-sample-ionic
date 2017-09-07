import { Component, ViewChild } from '@angular/core';
import { NavParams, NavController, AlertController, LoadingController, Navbar, Events } from "ionic-angular";
import { PERSON_HEADER } from "../../models/PERSON_HEADER";
import { AppConstant } from "../../constants/appConstant";
import { E_MAIL } from "../../models/E_MAIL";

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
  @ViewChild(Navbar) navBar: Navbar;
  private personNumber: number;
  private personHeader = new PERSON_HEADER()
  private emails: E_MAIL[] = []
  didGetPerson: boolean = false

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    private Loading: LoadingController,
    public events: Events) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad GetPerson');

    this.navBar.backButtonClick = (e: UIEvent) => {
      var that = this
      if (this.didGetPerson) {
        let alert = this.alertCtrl.create({
          title: "",
          subTitle: "Do you want to save results?",
          buttons: [{
            text: 'Yes',
            handler: () => {
              // Save value into DB
              ump.db.insert(AppConstant.TABLE_NAME_PERSON_HEADER, this.personHeader, false, (result: ump.callbackResult) => {
                if (result.type === ump.resultType.success) {
                  console.log("Added Person Successfully :" + JSON.stringify(result))

                  if (that.emails.length == 0) {
                    this.events.publish('didDownloadPerson', "")
                    this.navCtrl.pop()
                  }

                  for (var i = 0; i < that.emails.length; i++) {
                    let mail = that.emails[i]
                    mail.Fid = that.personHeader.Lid
                    ump.db.insert(AppConstant.TABLE_NAME_E_MAIL, mail, false, (result: ump.callbackResult) => {
                      if (result.type === ump.resultType.success) {
                        console.log("Added E_MAIL Successfully :" + JSON.stringify(result))
                        i = i - 1;
                        if (i == 0) {
                          this.events.publish('didDownloadPerson', "")
                          this.navCtrl.pop()
                        }
                      } else {
                        console.log("Failure: " + JSON.stringify(result));
                        i = i - 1;
                        if (i == 0) {
                          this.navCtrl.pop()
                        }
                      }
                    })
                  }

                } else {
                  console.log("Failure: " + JSON.stringify(result));
                  this.navCtrl.pop()
                }
              });
            }
          }, {
            text: 'No',
            handler: () => {
              this.navCtrl.pop();
            }
          }
          ],
        });
        alert.present();
      }
      else {
        this.navCtrl.pop()
      }
    }
  }

  ionViewWillLeave() {

  }

  getPerson() {
    this.didGetPerson = false
    let perNumber = String(this.personNumber)

    if (perNumber == "undefined" || perNumber.length == 0) {
      this.showAlert("", "Please provide Person Number")
      return
    }

    let personHeader = new PERSON_HEADER()
    personHeader.PERSNUMBER = this.personNumber
    var that = this
    let loading = this.Loading.create({
      content: "Please wait.",
      dismissOnPageChange: true,
    });

    var inputHeader = {}
    inputHeader["PERSON_HEADER"] = personHeader
    loading.present()

    ump.sync.submitInSync(ump.sync.requestType.PULL, inputHeader, null, AppConstant.PA_GET_PERSON, true, function (result) {
      loading.dismiss()
      console.log("Response from server: " + JSON.stringify(result))
      if (result.type === ump.resultType.success) {
        that.showAlert("", "Person Downloaded.")
        let jsonObj = result.data
        let personObj = jsonObj.PERSON[0]

        that.personHeader.CATEGORY1 = personObj.PERSON_HEADER.CATEGORY1
        that.personHeader.CRENAM = personObj.PERSON_HEADER.CRENAM
        that.personHeader.PERSNUMBER = personObj.PERSON_HEADER.PERSNUMBER
        that.personHeader.SEX = personObj.PERSON_HEADER.SEX
        that.personHeader.MANDT = personObj.PERSON_HEADER.MANDT
        that.personHeader.BIRTHDAY = personObj.PERSON_HEADER.BIRTHDAY
        that.personHeader.LAST_NAME = personObj.PERSON_HEADER.LAST_NAME
        that.personHeader.HEIGHT = personObj.PERSON_HEADER.HEIGHT
        that.personHeader.FIRST_NAME = personObj.PERSON_HEADER.FIRST_NAME
        that.personHeader.PROFESSION = personObj.PERSON_HEADER.PROFESSION
        that.personHeader.CATEGORY2 = personObj.PERSON_HEADER.CATEGORY2
        that.personHeader.CHGDAT = personObj.PERSON_HEADER.CHGDAT
        that.personHeader.CREDAT = personObj.PERSON_HEADER.CREDAT
        that.personHeader.CHGTIM = personObj.PERSON_HEADER.CHGTIM
        that.personHeader.CRETIM = personObj.PERSON_HEADER.CRETIM
        that.personHeader.WEIGHT = personObj.PERSON_HEADER.WEIGHT
        that.personHeader.CHGNAM = personObj.PERSON_HEADER.CHGNAM

        that.emails = personObj.E_MAIL
        that.didGetPerson = true

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
