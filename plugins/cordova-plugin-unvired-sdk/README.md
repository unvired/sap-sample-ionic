# unvired-cordova-plugin

This contains source code for Unvired Cordova Plugin.

# Uglify UnviredPluginProxy.js
$ gulp

# Setup
After adding the plugin, include the following dependencies in index.html
```
  <script src="assets/js/codemirror.js"></script>
  <script src="assets/js/sql.js"></script>
  <script src="assets/js/kernel.js"></script>
  <script src="assets/js/winstore-jscompat.js"></script>
  <script src="assets/js/jquery-3.2.1.js"></script>
```

# Adding a new method.

Any new method should have the implementation in www/kernel.js file. Accordingly, all the native cores should have an implementation for this method.

# Exposing the new method to ionic apps.

This plugin is repackaged as ionic native plugin.
https://ionicframework.com/docs/native/unvired-cordova-sdk

The source code of the ionic native plugin is located here:
https://github.com/ionic-team/ionic-native/tree/master/src/%40ionic-native/plugins/unvired-cordova-sdk

 The source contains a single file, index.ts which contains declarations of all the functions available in www/kernel.js file of this repo. To expose newly added methods in kernel.js, you will have to fork https://github.com/ionic-team/ionic-native repo to your GitHub repo, make changes and submit a pull request.

Once the Pull request is approved, the new method should be available publicly for all the users.

# Update instructions
If you want to update to the latest version of this plugin, you need to uninstall and re-install the plugin/

```
$ cordova plugin rm cordova-plugin-unvired-sdk
$ cordova plugin add https://github.com/unvired/cordova-plugin-unvired-sdk
```

