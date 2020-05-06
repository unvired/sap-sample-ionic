import { Component, NgZone, OnInit } from '@angular/core';
import { ConatactHeader, PERSON_HEADER } from 'src/models/PERSON_HEADER';
import { ActionSheetController } from '@ionic/angular';
import { AppConstant } from 'src/constants/appConstant';
import { UnviredCordovaSDK, ResultType } from '@ionic-native/unvired-cordova-sdk/ngx';
import { Router } from '@angular/router';
import { EventService } from '../event.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  contactHeaders: ConatactHeader[] = [];
  private personHeaders: PERSON_HEADER[] = [];
  private searchResultDataSource: PERSON_HEADER[] = [];

  constructor(public actionSheetCtrl: ActionSheetController,
              private unviredCordovaSdk: UnviredCordovaSDK,
              private router: Router,
              public events: EventService,
              public ngZone: NgZone) {
    this.events.getSubject().subscribe((data) => {
      this.getAllPersonHeaders();
    });
  }

  ngOnInit() {
    // console.log('ngOnInit HomePage');
    // this.getAllPersonHeaders();
  }

  async getAllPersonHeaders() {
    console.log('Get All Person Headers from DB.....');
    const res = await this.unviredCordovaSdk.dbSelect(AppConstant.TABLE_NAME_PERSON_HEADER, '');
    if (res.type === ResultType.success) {
      this.ngZone.run(() => {
        this.personHeaders = res.data;
        this.sortPersonHeader(this.personHeaders);
        console.log('Person Headers from DB: ' + this.personHeaders.length);
      });
    } else {
      console.log('Failure: ' + res.error);
    }
  }

  sortPersonHeader(personHeaders: PERSON_HEADER[]) {
    this.ngZone.run(() => {
      const alphabet: any = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      this.contactHeaders = [];
      for (const letter of alphabet) {
        const letterInLowerCase = letter.toLowerCase;
        const searchLetter = letter as string;

        const matches = personHeaders.filter(person => {
          return person.FIRST_NAME.toLowerCase().startsWith(searchLetter.toLowerCase());
        });
        if (matches.length > 0) {
          const contactHeader = new ConatactHeader();
          contactHeader.section = letter;
          contactHeader.personHeaders = matches as [PERSON_HEADER];
          this.contactHeaders.push(contactHeader);
        }
      }
    });
  }

  async menuButtonClicked() {
    const actionSheet = await this.actionSheetCtrl.create({
      buttons: [
        {
          text: 'Get Person',
          handler: () => {
            console.log('Get Person clicked');
            this.router.navigate(['get-person']);
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
    });
    actionSheet.present();
  }

  addButtonClicked() {
    this.router.navigate(['add-person']);
  }

  viewPersonDetail(personHeader: PERSON_HEADER) {
    this.router.navigate(['person-detail'], {queryParams: { incomingPersonHeader: personHeader }});
  }

  getItems(ev: any) {
    console.log('Filter....');
    // Reset items back to all of the items
    this.sortPersonHeader(this.personHeaders);

    // set val to the value of the searchbar
    const val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() !== '') {
      this.searchResultDataSource = this.personHeaders.filter((person) => {
        // tslint:disable-next-line:max-line-length
        return ((person.FIRST_NAME.toLowerCase().indexOf(val.toLowerCase()) > -1) || (person.LAST_NAME.toLowerCase().indexOf(val.toLowerCase()) > -1));
      });
      this.sortPersonHeader(this.searchResultDataSource);
    }
  }
}
