import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { GetPerson } from '../pages/get-person/get-person';
import { AddPerson } from '../pages/add-person/add-person';
import { PersonDetail } from '../pages/person-detail/person-detail';
import { LoginPage } from "../pages/login/login";
import { Device } from "@ionic-native/device";
import { AndroidPermissions } from '@ionic-native/android-permissions';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    GetPerson,
    AddPerson,
    PersonDetail,
    LoginPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    GetPerson,
    AddPerson,
    PersonDetail,
    LoginPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Device,
    AndroidPermissions,
    { provide: ErrorHandler, useClass: IonicErrorHandler }
  ]
})
export class AppModule { }
