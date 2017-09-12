import { Component, NgZone } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ActionSheetController, Events } from 'ionic-angular';

import { GetPerson } from '../get-person/get-person'
import { AddPerson } from '../add-person/add-person';
import { PersonDetail } from '../person-detail/person-detail';
import { ConatactHeader, PERSON_HEADER } from "../../models/PERSON_HEADER";
import { AppConstant } from "../../constants/appConstant";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  private contactHeaders: ConatactHeader[] = []
  private personHeaders: PERSON_HEADER[] = []
  private searchResultDataSource: PERSON_HEADER[] = []

  constructor(public navCtrl: NavController,
    public actionSheetCtrl: ActionSheetController,
    public events: Events,
    public ngZone: NgZone) {
    this.events.subscribe('didDownloadPerson', () => {
      this.getAllPersonHeaders()
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad HomePage');
    this.getAllPersonHeaders()
  }

  getAllPersonHeaders() {
    console.log("Get All Person Headers from DB.....")
    ump.db.select(AppConstant.TABLE_NAME_PERSON_HEADER, "", (result) => {
      if (result.type === ump.resultType.success) {
        this.ngZone.run(() => {
          this.personHeaders = result.data
          this.sortPersonHeader(this.personHeaders)
          console.log("Person Headers from DB:" + this.personHeaders.length)
        })
      }
      else {
        console.log("FAILURE:" + result.error);
      }
    })
  }

  sortPersonHeader(personHeaders: PERSON_HEADER[]) {
    this.ngZone.run(() => {
      let alphabet: any = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
      this.contactHeaders = []
      for (var letter of alphabet) {
        let letterInLowerCase = letter.toLowerCase;
        let searchLetter = letter as string

        var matches = personHeaders.filter(person => person.FIRST_NAME.startsWith(searchLetter))
        if (matches.length > 0) {
          let contactHeader = new ConatactHeader()
          contactHeader.section = letter
          contactHeader.personHeaders = matches as [PERSON_HEADER]
          this.contactHeaders.push(contactHeader)
        }
      }
    })
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
        },
        {
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

  viewPersonDetail(personHeader: PERSON_HEADER) {
    this.navCtrl.push(PersonDetail, ({ incomingPersonHeader: personHeader }))
  }

  getItems(ev: any) {
    console.log("Filter....")
    // Reset items back to all of the items
    this.sortPersonHeader(this.personHeaders)

    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.searchResultDataSource = this.personHeaders.filter((person) => {
        return ((person.FIRST_NAME.toLowerCase().indexOf(val.toLowerCase()) > -1) || (person.LAST_NAME.toLowerCase().indexOf(val.toLowerCase()) > -1));
      })
      this.sortPersonHeader(this.searchResultDataSource)
    }
  }
}
