import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { LoginParameters, UnviredCordovaSDK, LoginType, LoginResult, LoginListenerType } from '@ionic-native/unvired-cordova-sdk/ngx';
import { Router } from '@angular/router';
import { AppConstant } from 'src/constants/appConstant';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  isAuthenticationSuccess: LoginListenerType;
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private unviredCordovaSdk: UnviredCordovaSDK,
    private router: Router
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.umpLogin();
    });
  }

  async umpLogin() {
    const loginParameters: LoginParameters = new LoginParameters();
    loginParameters.appName = AppConstant.APPLICATION_NAME;
    loginParameters.metadataPath = '../assets/metadata.json';
    loginParameters.loginType = LoginType.unvired;
    let loginResult: LoginResult;
    try {
      loginResult = await this.unviredCordovaSdk.login(loginParameters);
      console.log('Result: ' + JSON.stringify(loginResult));
      this.router.navigate(['login'], {queryParams: { isAuthenticationSuccess: loginResult.type }});
    } catch (error) {
      console.log('Error on login ' + JSON.stringify(error));
      this.unviredCordovaSdk.logError('AppComponent', 'Initialize', 'Error during login: ' + error);
    }
  }
}
