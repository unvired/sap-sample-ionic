cordova.define("cordova-unvired-kernel.KernelProxy", function (require, exports, module) {
    //******************************************************************** LoginPluginProxy  *****************************************************************

    module.exports = {
        loginListener: null,

        login: function (successCallback, errorCallback, param) {
            //param[0] = parameters and param[1] is login listener callback
            Unvired.Cordova.WinRT.Plugins.LoginPlugin.setLoginParameters(JSON.stringify(param[0]));
            loginListener = param[1];

            var ev = new Unvired.Cordova.WinRT.Plugins.LoginPlugin();
            ev.addEventListener("logineventhandler", function (e) {
                loginListener(JSON.parse(e));
            });
            ev.login();
        },

        logout: function (successCallback, errorCallback, param) {
            var ev = new Unvired.Cordova.WinRT.Plugins.LoginPlugin();
            ev.addEventListener("logineventhandler", function (e) {
                loginListener(JSON.parse(e));
            });
            ev.Logout();
        },

        authenticateAndActivate: function (successCallback, errorCallback, param) {
            Unvired.Cordova.WinRT.Plugins.LoginPlugin.setLoginParameters(JSON.stringify(param[0]));
            var ev = new Unvired.Cordova.WinRT.Plugins.LoginPlugin();
            ev.addEventListener("logineventhandler", function (e) {
                loginListener(JSON.parse(e));
            });
            ev.authenticateAndActivate();
        },

        authenticateLocal: function (successCallback, errorCallback, param) {
            Unvired.Cordova.WinRT.Plugins.LoginPlugin.setLoginParameters(JSON.stringify(param[0]));
            var ev = new Unvired.Cordova.WinRT.Plugins.LoginPlugin();
            ev.addEventListener("logineventhandler", function (e) {
                loginListener(JSON.parse(e));
            });
            ev.authenticateLocal();
        },

        authenticate: function (successCallback, errorCallback, param) { },
    };

    require("cordova/exec/proxy").add("LoginPlugin", module.exports);

    //********************************************************************** DatabasePluginProxy ********************************************************************//

    module.exports = {
        insert: function (successCallback, errorCallback, param) {
            var ev = new Unvired.Cordova.WinRT.Plugins.DatabasePlugin();
            ev.insert(JSON.stringify(param)).then(function (result) {
                successCallback(JSON.parse(result));
            });
        },

        insertOrUpdate: function (successCallback, errorCallback, param) {
            var ev = new Unvired.Cordova.WinRT.Plugins.DatabasePlugin();
            ev.insertOrUpdate(JSON.stringify(param)).then(function (result) {
                successCallback(JSON.parse(result));
            });
        },

        select: function (successCallback, errorCallback, param) {
            var ev = new Unvired.Cordova.WinRT.Plugins.DatabasePlugin();
            ev.select(JSON.stringify(param)).then(function (result) {
                successCallback(JSON.parse(result));
            });
        },

        update: function (successCallback, errorCallback, param) {
            var ev = new Unvired.Cordova.WinRT.Plugins.DatabasePlugin();
            ev.update(JSON.stringify(param)).then(function (result) {
                successCallback(JSON.parse(result));
            });
        },

        deleteRecord: function (successCallback, errorCallback, param) {
            var ev = new Unvired.Cordova.WinRT.Plugins.DatabasePlugin();
            ev.delete(JSON.stringify(param)).then(function (result) {
                successCallback(JSON.parse(result));
            });
        },

        executeQuery: function (successCallback, errorCallback, param) {
            var ev = new Unvired.Cordova.WinRT.Plugins.DatabasePlugin();
            ev.executeQuery(JSON.stringify(param)).then(function (result) {
                successCallback(JSON.parse(result));
            });
        },

        createSavePoint: function (successCallback, errorCallback, param) {
            var ev = new Unvired.Cordova.WinRT.Plugins.DatabasePlugin();
            var result = ev.createSavePoint();
            successCallback(JSON.parse(result));
        },

        releaseSavePoint: function (successCallback, errorCallback, param) {
            var ev = new Unvired.Cordova.WinRT.Plugins.DatabasePlugin();
            var result = ev.releaseSavePoint(param);
            successCallback(JSON.parse(result));
        },

        rollbackToSavePoint: function (successCallback, errorCallback, param) {
            var ev = new Unvired.Cordova.WinRT.Plugins.DatabasePlugin();
            var result = ev.rollBackToSavePoint(param);
            successCallback(JSON.parse(result));
        },

        beginTransaction: function (successCallback, errorCallback, param) {
            var ev = new Unvired.Cordova.WinRT.Plugins.DatabasePlugin();
            var result = ev.beginTransaction(param);
            successCallback(JSON.parse(result));
        },

        endTransaction: function (successCallback, errorCallback, param) {
            var ev = new Unvired.Cordova.WinRT.Plugins.DatabasePlugin();
            var result = ev.endTransaction(param);
            successCallback(JSON.parse(result));
        }
    };

    require("cordova/exec/proxy").add("DatabasePlugin", module.exports);

    //********************************************************************** SyncEnginePluginProxy ****************************************************************//

    module.exports = {
        notificationListener: null,

        submitInSync: function (successCallback, errorCallback, param) {
            var ev = new Unvired.Cordova.WinRT.Plugins.SyncEnginePlugin();
            ev.addEventListener("synceventhandler", function (e) {
                if ((typeof notificationListener != 'undefined') && (notificationListener != null))
                    notificationListener(JSON.parse(e));
            });
            ev.submitDataInSyncMode(JSON.stringify(param)).then(function (result) {
                successCallback(JSON.parse(result));
            })
        },

        submitInASync: function (successCallback, errorCallback, param) {
            var ev = new Unvired.Cordova.WinRT.Plugins.SyncEnginePlugin();
            ev.addEventListener("synceventhandler", function (e) {
                if ((typeof notificationListener != 'undefined') && (notificationListener != null))
                    notificationListener(JSON.parse(e));
            });
            ev.submitDataInASyncMode(JSON.stringify(param)).then(function (result) {
                successCallback(JSON.parse(result));
            });
        },

        getMessages: function (successCallback, errorCallback, param) {
            var ev = new Unvired.Cordova.WinRT.Plugins.SyncEnginePlugin();
            ev.addEventListener("synceventhandler", function (e) {
                if ((typeof notificationListener != 'undefined') && (notificationListener != null))
                    notificationListener(JSON.parse(e));
            });
            var result = ev.getMessages(JSON.stringify(param));
            successCallback(JSON.parse(result));
        },

        registerNotifListener: function (successCallback, errorCallback, param) {
           notificationListener = param[0];
            var ev = new Unvired.Cordova.WinRT.Plugins.SyncEnginePlugin();
            ev.addEventListener("synceventhandler", function (e) {
                if ((typeof notificationListener != 'undefined') && (notificationListener != null))
                    notificationListener(JSON.parse(e));
            });
            ev.registerNotificationListener();
            successCallback();
        },

        unRegisterNotifListener: function (successCallback, errorCallback, param) {
            notificationListener = null;
        },

        isInOutBox: function (successCallback, errorCallback, param) {
            var ev = new Unvired.Cordova.WinRT.Plugins.SyncEnginePlugin();
            var result = ev.isInOutbox(param[0]);
            successCallback(JSON.parse(result));
        },

        outBoxItemCount: function (successCallback, errorCallback, param) {
            var ev = new Unvired.Cordova.WinRT.Plugins.SyncEnginePlugin();
            var result = ev.outBoxItemCount();
            successCallback(JSON.parse(result));
        },

        isInSentItem: function (successCallback, errorCallback, param) {
            var ev = new Unvired.Cordova.WinRT.Plugins.SyncEnginePlugin();
            var result = ev.isInSentItem(param[0]);
            successCallback(JSON.parse(result));
        },

        sentItemCount: function (successCallback, errorCallback, param) {
            var ev = new Unvired.Cordova.WinRT.Plugins.SyncEnginePlugin();
            var result = ev.sentItemCount();
            successCallback(JSON.parse(result));
        },

        inBoxItemCount: function (successCallback, errorCallback, param) {
            var ev = new Unvired.Cordova.WinRT.Plugins.SyncEnginePlugin();
            var result = ev.inBoxItemCount();
            successCallback(JSON.parse(result));
        },

        deleteOutBoxEntry: function (successCallback, errorCallback, param) {
            var ev = new Unvired.Cordova.WinRT.Plugins.SyncEnginePlugin();
            var result = ev.deleteOutBoxEntry(param);
            successCallback(JSON.parse(result));
        },

        lockDataSender: function (successCallback, errorCallback, param) {
            var ev = new Unvired.Cordova.WinRT.Plugins.SyncEnginePlugin();
            var result = ev.lockDataSender(param).then(function (result) {
                successCallback(JSON.parse(result));
            });
        },

        unlockDataSender: function (successCallback, errorCallback, param) {
            var ev = new Unvired.Cordova.WinRT.Plugins.SyncEnginePlugin();
            ev.unlockDataSender(param);
            successCallback();
        },

        resetApplicationSyncData: function (successCallback, errorCallback, param) {
            var ev = new Unvired.Cordova.WinRT.Plugins.SyncEnginePlugin();
            var result = ev.resetApplicationSyncData();
            successCallback(JSON.parse(result));
        }
    };

    require("cordova/exec/proxy").add("SyncEnginePlugin", module.exports);

    //********************************************************************** SettingsPluginProxy ****************************************************************//

    module.exports = {
        getInfoMessages: function (successCallback, errorCallback, param) {
            var ev = new Unvired.Cordova.WinRT.Plugins.SettingsPlugin();
            var result = ev.getInfoMessages(JSON.stringify(param));
            successCallback(JSON.parse(result));
        },

        userSettings: function (successCallback, errorCallback, param) {
            var ev = new Unvired.Cordova.WinRT.Plugins.SettingsPlugin();
            var result = ev.getUserSettings(JSON.stringify(param));
            successCallback(JSON.parse(result));
        },

        updateSystemCredentials: function (successCallback, errorCallback, param) {
            var ev = new Unvired.Cordova.WinRT.Plugins.SettingsPlugin();
            var result = ev.updateSystemCredentials(JSON.stringify(param));
            successCallback(JSON.parse(result));
        },

        getSystemCredentials: function (successCallback, errorCallback, param) {
            var ev = new Unvired.Cordova.WinRT.Plugins.SettingsPlugin();
            var result = ev.getSystemCredentials(JSON.stringify(param));
            successCallback(JSON.parse(result));
        },

        getVersionNumbers: function (successCallback, errorCallback, param) {
            var ev = new Unvired.Cordova.WinRT.Plugins.SettingsPlugin();
            var result = ev.getVersionNumber(JSON.stringify(param));
            successCallback(JSON.parse(result));
        },

        clearData: function (successCallback, errorCallback, param) {
            var ev = new Unvired.Cordova.WinRT.Plugins.SettingsPlugin();
            var result = ev.clearData(JSON.stringify(param));
            successCallback(JSON.parse(result));
        },

        encrypt: function (successCallback, errorCallback, param) {
            var ev = new Unvired.Cordova.WinRT.Plugins.SettingsPlugin();
            var result = ev.encrypt(JSON.stringify(param));
            successCallback(JSON.parse(result));
        }
    };

    require("cordova/exec/proxy").add("SettingsPlugin", module.exports);

    //********************************************************************** LoggerPluginProxy ****************************************************************//

    module.exports = {
        logError: function (successCallback, errorCallback, param) {
            new Unvired.Cordova.WinRT.Plugins.LoggerPlugin().error(JSON.stringify(param));
        },

        logDebug: function (successCallback, errorCallback, param) {
            new Unvired.Cordova.WinRT.Plugins.LoggerPlugin().debug(JSON.stringify(param));
        },

        logImportant: function (successCallback, errorCallback, param) {
            new Unvired.Cordova.WinRT.Plugins.LoggerPlugin().important(JSON.stringify(param));
        },

        getLogs: function (successCallback, errorCallback, param) {
            var ev = new Unvired.Cordova.WinRT.Plugins.LoggerPlugin();
            var result = ev.getLogs();
            successCallback(JSON.parse(result));
        },

        deleteLogs: function (successCallback, errorCallback, param) {
            new Unvired.Cordova.WinRT.Plugins.LoggerPlugin().clearLogs();
        },

        sendViaServer: function (successCallback, errorCallback, param) {
            var ev = new Unvired.Cordova.WinRT.Plugins.LoggerPlugin();
            var result = ev.sendViaServer();
            successCallback(JSON.parse(result));
        },

        sendViaEmail: function (successCallback, errorCallback, param) {
            var ev = new Unvired.Cordova.WinRT.Plugins.LoggerPlugin();
            var result = ev.sendViaEmail().then(function (result) {
                successCallback(JSON.parse(result));
            });
        }
    };

    require("cordova/exec/proxy").add("LoggerPlugin", module.exports);

    //********************************************************************** AttachmentPluginProxy ****************************************************************//

    module.exports = {
        getAttachmentFolderPath: function (successCallback, errorCallback, param) {
            var ev = new Unvired.Cordova.WinRT.Plugins.AttachmentPlugin()
            var result = ev.getAttachmentFolderPath();
            successCallback(JSON.parse(result));
        },

        createAttachmentItem: function (successCallback, errorCallback, param) {
            var ev = new Unvired.Cordova.WinRT.Plugins.AttachmentPlugin()
            ev.createAttachmentItem(JSON.stringify(param)).then(function (result) {
                ;
                successCallback(JSON.parse(result));
            })
        },

        uploadAttachment: function (successCallback, errorCallback, param) {
            var ev = new Unvired.Cordova.WinRT.Plugins.AttachmentPlugin()
            var result = ev.uploadAttachment(JSON.stringify(param));
            successCallback(JSON.parse(result));
        },

        downloadAttachment: function (successCallback, errorCallback, param) {
            var ev = new Unvired.Cordova.WinRT.Plugins.AttachmentPlugin()
            ev.downloadAttachment(JSON.stringify(param)).then(function (result) {
                ;
                successCallback(JSON.parse(result));
            })
        },
    };

    require("cordova/exec/proxy").add("AttachmentPlugin", module.exports);

    //********************************************************************** ProxyPluginProxy ****************************************************************//

    module.exports = {
        launchFile: function (successCallback, errorCallback, param) {
            var ev = new Unvired.Cordova.WinRT.Plugins.ProxyPlugin()
            ev.launchFile(param[0]).then(function (result) {
                successCallback(JSON.parse(result));
            });
        },

        launchBase64: function (successCallback, errorCallback, param) {
            var ev = new Unvired.Cordova.WinRT.Plugins.ProxyPlugin()
            ev.launchBase64AsFile(JSON.stringify(param[0])).then(function (result) {
                successCallback(JSON.parse(result));
            });
        },

        unzip: function (successCallback, errorCallback, param) {
            var ev = new Unvired.Cordova.WinRT.Plugins.ProxyPlugin()
            ev.unzip(JSON.stringify(param[0])).then(function (result) {
                successCallback(JSON.parse(result));
            });
        }
    };

    require("cordova/exec/proxy").add("ProxyPlugin", module.exports);
});