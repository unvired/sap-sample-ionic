import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { LoginParameters, UnviredCordovaSDK, LoginListenerType, AuthenticateActivateResult, LoginType,
  AuthenticateAndActivateResultType, AuthenticateLocalResult, AuthenticateLocalResultType } from '@ionic-native/unvired-cordova-sdk/ngx';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  isAuthenticationSuccess: LoginListenerType;
  isHasPermissions = false;
  url = 'https://sandbox.unvired.io/UMP/';
  company = '';
  username = '';
  password = '';
  load: HTMLIonLoadingElement;

  constructor(public router: Router,
              public alertCtrl: AlertController,
              private loading: LoadingController,
              private unviredCordovaSdk: UnviredCordovaSDK) {
    this.isAuthenticationSuccess = this.router.getCurrentNavigation().extras.queryParams.isAuthenticationSuccess;
  }

  ngOnInit() {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad Login');
  }

  login() {
    if (!this.isAuthenticationSuccess) {
      if (!this.url || this.url.trim().length === 0) {
        this.showAlert('', 'Enter Url.');
      }

      if (!this.company || this.company.trim().length === 0) {
        this.showAlert('', 'Enter Company.');
        return;
      }
    }

    if (!this.username || this.username.trim().length === 0) {
      this.showAlert('', 'Enter Username.');
      return;
    }

    if (!this.password || this.password.trim().length === 0) {
      this.showAlert('', 'Enter Password.');
      return;
    }

    this.umpLogin();

  }

  async umpLogin() {
    const loginParameters = new LoginParameters();
    loginParameters.url = this.url;
    loginParameters.company = this.company;
    loginParameters.username = this.username;
    loginParameters.password = this.password;
    loginParameters.loginType = LoginType.unvired;
    switch (this.isAuthenticationSuccess) {
      case LoginListenerType.auth_activation_required:
        this.showLaoding();
        // tslint:disable-next-line:max-line-length
        const authenticateActivateResult: AuthenticateActivateResult = await this.unviredCordovaSdk.authenticateAndActivate(loginParameters);
        if (authenticateActivateResult.type === AuthenticateAndActivateResultType.auth_activation_success) {
          this.dismissLoading();
          this.showAlert('', 'Successfully registered');
          this.router.navigate(['home']);
        } else if (authenticateActivateResult.type === AuthenticateAndActivateResultType.auth_activation_error) {
          this.dismissLoading();
          console.log('Error during login:' + authenticateActivateResult.error);
          this.showAlert('Error during login:', authenticateActivateResult.error);
        }
        break;
      case LoginListenerType.app_requires_login:
        this.showLaoding();
        const authenticateLocalResult: AuthenticateLocalResult = await this.unviredCordovaSdk.authenticateLocal(loginParameters);
        if (authenticateLocalResult.type === AuthenticateLocalResultType.login_success) {
          this.dismissLoading();
          this.showAlert('', 'Local Password verified Successfully');
          this.router.navigate(['home']);
        } else if (authenticateLocalResult.type === AuthenticateLocalResultType.login_error) {
          this.dismissLoading();
          this.showAlert('', authenticateLocalResult.error);
          console.log('Error during local login: ' + authenticateLocalResult.error);
        }
        break;
      case LoginListenerType.login_success:
        this.router.navigate(['/home']);
        break;
    }
  }

  async showLaoding() {
    this.load = await this.loading.create({
      message: 'Please wait...',
      spinner: 'circles',
      showBackdrop: true
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
