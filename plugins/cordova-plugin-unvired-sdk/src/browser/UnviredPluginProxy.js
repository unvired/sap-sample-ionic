//#region Global Enums

var loginParameters;

// REST Apis endpoints
var restApis = {
    defaultApi: '/API/v2/applications/',
    activate: '/activate/',
    authenticate: '/authenticate',
    // session: '/API/v2/session/',
    session: '/session/',
    execute: '/execute/',
    users: '/API/v2/users/'
};
 //Parse metadata.json and hold it in metadata in localstorage
var metadata = {
    "sMeta": [],
    "fMeta": [],
    "bMeta": [],
    "appMeta": "",
};
var loginType = {
    unvired: "UNVIRED_ID",
    ads: "ADS",
    sap: "SAP",
    custom: "CUSTOM",
    email: "EMAIL"
};
var requestType = {
    RQST: 'RQST',
    PULL: 'PULL',
    PUSH: 'PUSH',
    QUERY: 'QUERY',
    REQ: 'REQ'
};
var loginMode = {
    authActivate: 0,
    authLocal: 1,
    forgotPassword: 2
};

var loginListenerType = {
    auth_activation_required : 0, // Mobile app not yet activated and requires authentication and activation
    app_requires_login :1, // Mobile app requires offline / local login
    auth_activation_success : 2, // Account authenticated and activated on the server
    auth_activation_error : 3, // Acoount authentication or aactivation failed on the server
    login_success : 4, // Mobile app login successful
    login_error : 5, // Mobile app login failure
    app_requires_current_account : 6 // Multiple account found hence app has to set current active account
};

var resultType = {
    success: 0,
    error: 1
};

//#endregion

//#region Login Apis
module.exports.login = function (successCallback, errorCallback, options) {
    console.log("Unvired Plugin Login Options:" + JSON.stringify(options));
    loginParameters = options[0];

    if (loginParameters.url && loginParameters.url.length > 0) {
        loginParameters.url = helper.sanitizeURL(loginParameters.url);
    }

    // TODO - Clear db based on login parameters
    // helper.clearApplicationDb();

    metadataParser.initialize();

    var cbResult = {};

    if(!loginParameters.appName){
        cbResult.message ="Application name not initialized";
        cbResult.type = loginListenerType.auth_activation_required;
        successCallback(cbResult);
        return;
    }

    var hasAppmeta = webDb.reloadAppMeta();
    if(hasAppmeta){
        cbResult.type =loginListenerType.login_success;
        successCallback(cbResult);
        return;
    }

    if (successCallback) {
        cbResult.type =loginListenerType.auth_activation_required;
        successCallback(cbResult);
    }
};

module.exports.logout = function (successCallback, errorCallback, options) {
    helper.clearApplicationDb();
};

module.exports.getListOfFrontEndUsers = function (successCallback, errorCallback, options) {
    if (!helper.validateLoginParameters(loginMode.authActivate, successCallback))
        return;

    restUtil.appMeta = {};
    restUtil.appMeta.appName = loginParameters.appName;
    restUtil.appMeta.url = loginParameters.url;
    restUtil.appMeta.authorization = 'Basic ' + window.btoa(loginParameters.company + "\\" + loginParameters.username + ":" + loginParameters.password);
    var endpoint = restUtil.appMeta.url + restApis.users + loginParameters.username;
    restUtil.performRequest(endpoint, "", function (result) {
        successCallback(result);
    }, restUtil.httpType.get, false);
};

module.exports.authenticateAndActivate = function (successCallback, errorCallback, options) {

    console.log("UnviredPluginProxy:AuthenticateAndActivate(): " + JSON.stringify(options));
    loginParameters = options[0];

    if (loginParameters.url && loginParameters.url.length > 0) {
        loginParameters.url = helper.sanitizeURL(loginParameters.url);
    }

    if (!helper.validateLoginParameters(loginMode.authActivate, successCallback))
        return;

    // For Web sdk choose frontend type as Web and it is auto activate while deployed   
    restUtil.appMeta = {};
    restUtil.appMeta.frontEnd = loginParameters.feUserId;
    restUtil.appMeta.appName = loginParameters.appName;
    restUtil.appMeta.url = loginParameters.url;
    restUtil.appMeta.username = loginParameters.username;
    var endpoint;
    switch (loginParameters.loginType) {
        case loginType.email:
        case loginType.unvired:
            restUtil.appMeta.authorization = 'Basic ' + window.btoa(loginParameters.company + "\\" + loginParameters.username + ":" + loginParameters.password);
            endpoint = restUtil.appMeta.url + restApis.defaultApi + restUtil.appMeta.appName + restApis.session;
            break;
        case loginType.sap:
            restUtil.appMeta.authorization = 'Basic ' + window.btoa(loginParameters.company + "\\" + loginParameters.username);
            endpoint = restUtil.appMeta.url + restApis.session + 'applications/' + restUtil.appMeta.appName;
            restUtil.appMeta.credentials = JSON.stringify([{
                "port": loginParameters.domain,
                "user": loginParameters.username,
                "password": loginParameters.password
            }]);
            break;
        case loginType.ads:
            restUtil.appMeta.authorization = 'Basic ' + window.btoa(loginParameters.company + "\\" + loginParameters.username);
            endpoint = restUtil.appMeta.url + restApis.session + 'applications/' + restUtil.appMeta.appName;
            restUtil.appMeta.credentials = JSON.stringify([{
                "port": loginParameters.port,
                "user": loginParameters.domain + "\\" + loginParameters.username,
                "password": loginParameters.password
            }]);
            break;
    }
    /**
     * Session call. Use authKey for successive calls.
     * Check users for any frontentd of type web to continue else return frontend not found
     */
    restUtil.performRequest(endpoint, "", function (result) {
        if (result.type == resultType.success) {
            restUtil.appMeta.credentials = "";
            webDb.initialize(function () {
                //On activation success save app meta for further calls.   
                delete restUtil.appMeta.authorization;
                webDb.saveAppMeta(restUtil.appMeta);
                localStorage.setItem('token',result.data.token);
                restUtil.appMeta.authorization = 'Bearer:' + result.data.token;
                //Loginlistener callback
                var cbResult = {};
                cbResult.type = 2; //ump.loginListenerType.auth_activation_success;
                cbResult.data = result;
                successCallback(cbResult);
            });

        } else {
            var errText = "";
            if (!helper.isEmpty(result)) {
                errText = helper.isEmpty(result.error) ? "No error description returned from server" : JSON.parse(result.error).error;
            }

            // Loginlistener callback
            var cbResult = {};
            cbResult.type = 3;
            cbResult.error = errText;
            successCallback(cbResult);
        }
    }, restUtil.httpType.post, false, loginParameters.jwtOptions);
};

module.exports.authenticateLocal = function (sucessCallback, errorCallback, options) {

    console.log("UnviredPluginProxy:authenticateLocal(): " + JSON.stringify(options));

    loginParameters = options[0];

    if (loginParameters.url && loginParameters.url.length > 0) {
        loginParameters.url = helper.sanitizeURL(loginParameters.url);
    }

    if (!helper.validateLoginParameters(loginMode.authLocal, sucessCallback))
        return;
    alert("Api not supported on Web!");
};

//TODO- Implement Api
module.exports.getAllAccount = function (sucessCallback, errorCallback, options) {
    alert("Api not implemented! ");
};

//TODO- Implement Api
module.exports.switchAccount = function (sucessCallback, errorCallback, options) {
    alert("Api not implemented!");
};

//TODO- Implement Api
module.exports.deleteAccount = function (sucessCallback, errorCallback, options) {
    alert("Api not implemented!");
};

//#endregion

//#region Sync Apis
module.exports.submitInSync = function (successCallback, errorCallback, options) {

    var reqType = options[0].requestType;
    var header = options[0].header;
    var paFunction = options[0].paFunction;
    var customData = options[0].customData;
    var autoSave = options[0].autoSave;

    if (!restUtil.appMeta.url || restUtil.appMeta.url === "") {
        restUtil.appMeta = webDb.getAppMeta();
    }
    var endpoint = restUtil.appMeta.url + restApis.defaultApi + restUtil.appMeta.appName + restApis.execute + paFunction;
    console.log("End Point: " + endpoint);

    var postMessage = "";
    if (header === null || header === "")
        postMessage = customData;
    else {
        postMessage = "Brwoser submit only supports custom data";
    }

    restUtil.performRequest(endpoint, postMessage, function (result) {
        if (result.type == resultType.success) {
            if (autoSave) {
                result = parser.parseServerResponse(JSON.parse(result.data), reqType, header);
                return successCallback(result);
            }
        }
        return successCallback(result);
    }, restUtil.httpType.post, false);
};

module.exports.submitInASync = function (successCallback, errorCallback, options) {
    /**
     * In Web Async call works same as in Sync. Receives response data in callback instead of NotificationListener callback in Mobile.
     * App has to handle async response differently for both
     */
    var header = options[0].header;
    var paFunction = options[0].paFunction;
    var customData = options[0].customData;

    //webDb.appDb.loadDatabase({});

    if (!restUtil.appMeta.url || restUtil.appMeta.url === "") {
        restUtil.appMeta = webDb.getAppMeta();
    }
    var endpoint = restUtil.appMeta.url + restApis.defaultApi + restUtil.appMeta.appName + restApis.execute + paFunction;
    var postMessage = "";
    if (header === null || header === "")
        postMessage = customData;
    else {
        postMessage = "Brwoser submit only supports custom data";
    }

    restUtil.performRequest(endpoint, postMessage, function (result) {
        return successCallback(result);
    }, restUtil.httpType.post, true);
};

module.exports.getMessages = function (successCallback, errorCallback, options) {
    alert("Api not supported on Web!");
};

module.exports.registerNotifListener = function (successCallback, errorCallback, options) {
    alert("'registerNotifListener' - Api not supported on Web! Web supports only sync call");
};

module.exports.unRegisterNotifListener = function (successCallback, errorCallback, options) {
    alert("'unRegisterNotifListener' - Api not supported on Web! Web supports only sync call");
};

module.exports.generateUBJson = function (successCallback, errorCallback, options) {

    var headerName = options[0].headerName;
    var header = options[0].header;
    var itemName = options[0].itemName;
    var items = options[0].items;

    var beName = helper.getBeName(headerName);
    var temp = {};
    var be = {};
    be[headerName] = header;
    be[itemName] = items;
    temp[beName] = [be];
    helper.sendSuccess("", successCallback, temp);
};

module.exports.parseRawUBJson = function (successCallback, errorCallback, options) {

    var json = '';
    json = options[0].json;
    var data = JSON.parse(json);
    var response = {
        infoMessage: [],
        be: []
    };
    var bes = [];
    for (var property in data) {
        if (data.hasOwnProperty(property)) {
            if (property === "InfoMessage") {
                var infoArr = data[property];
                response.infoMessage = infoArr;
            } else {
                var beArr = data[property];
                beArr.forEach(function (beElement) {
                    var be = {
                        header: "",
                        items: []
                    };
                    for (var property in beElement) {
                        if (beElement.hasOwnProperty(property)) {
                            var value = beElement[property];
                            if (value.constructor === Array) {
                                value.forEach(function (item) {
                                    be.items.push(item);
                                });
                            } else if (value.constructor === Object) {
                                be.header = value;
                            }
                        }
                    }
                    bes.push(be);
                });
            }
        }
    }
    response.be = bes;
    successCallback(response);
};

/**
 * Not supported in Web. Returning success callback all the time.
 */
module.exports.lockDataSender = function(sucessCallback, errorCallback, options) {
    return helper.sendSuccess("", sucessCallback, 0);
};

/**
 * Not supported in Web. Returning success callback all the time.
 */
module.exports.unlockDataSender = function(sucessCallback, errorCallback, options) {
    return helper.sendSuccess("", sucessCallback, []);
}

//#endregion

//#region Database Apis

module.exports.select = function (sucessCallback, errorCallback, options) {

    var tableName = options[0].tableName;
    var whereClause = options[0].whereClause || "";
    var resultSet = webDb.select(tableName, whereClause);
    return helper.sendSuccess("", sucessCallback, resultSet);
};

module.exports.insert = function (sucessCallback, errorCallback, options) {

    var tableName = options[0].tableName;
    var isHeader = options[0].isHeader || false;
    var structureObject = options[0].fields;

    if (!isHeader) {
        if (helper.isEmpty(structureObject.FID)) {
            helper.sendError("Invalid FID", sucessCallback);
        }
    }
    webDb.insert(tableName, structureObject, false);
    return helper.sendSuccess("", sucessCallback, "");
};

module.exports.insertOrUpdate = function (sucessCallback, errorCallback, options) {

    var tableName = options[0].tableName;
    var isHeader = options[0].isHeader || false;
    var structureObject = options[0].fields;

    if (!isHeader) {
        if (helper.isEmpty(structureObject.FID)) {
            helper.sendError("Invalid FID", sucessCallback);
        }
    }
    webDb.insert(tableName, structureObject, false);
    return helper.sendSuccess("", sucessCallback, "");
};

module.exports.deleteRecord = function (sucessCallback, errorCallback, options) {

    var tableName = options.tableName;
    var whereClause = options.whereClause;
    var tableCollection = webDb.select(tableName, whereClause);
    if (tableCollection != null && tableCollection.length > 0) {
        tableCollection.forEach(function (element) {
            webDb.deleteCascade(tableName, element);
        });
    }
    helper.sendSuccess("", sucessCallback);
};

module.exports.update = function (sucessCallback, errorCallback, options) {

    var tableName = options[0].tableName;
    var whereClause = options[0].whereClause;
    var updatedObject = options[0].fields;
    webDb.updateStructure(tableName, updatedObject, whereClause);
    helper.sendSuccess("", sucessCallback);
};

// Execute raw query with returned result
module.exports.executeQuery = function (sucessCallback, errorCallback, options) {
    var query = options[0].query;
    var resultSet = webDb.executeQuery(query);
    return helper.sendSuccess("", sucessCallback, resultSet);
};

// Execute raw query without returned result
module.exports.execute = function (sucessCallback, errorCallback, options) {
    var query = options[0].query;
    webDb.executeQuery(query);
    helper.sendSuccess("", sucessCallback);
};

// module.exports.dbGetCollection = function (successCallback, errorCallback, options) {
//     var tableName = ''
//     tableName = options['tableName']
//     successCallback(webDb.appDb.getCollection(tableName));
// };
module.exports.createSavePoint = function (successCallback, errorCallback, options) {
    alert("Api not supported on web!.");
};
module.exports.releaseSavePoint = function (successCallback, errorCallback, options) {
    alert("Api not supported on web!.");
};
module.exports.rollbackSavePoint = function (successCallback, errorCallback, options) {
    alert("Api not supported on web!.");
};
module.exports.beginTransaction = function (successCallback, errorCallback, options) {
    alert("Api not supported on web!.");
};
module.exports.endTransaction = function (successCallback, errorCallback, options) {
    alert("Api not supported on web!.");
};

// module.exports.dbReload = function (sucessCallback, errorCallback, options) {
//     webDb.reload();
//     if (!restUtil.appMeta.url || restUtil.appMeta.url === "") {
//         restUtil.appMeta = webDb.getAppMeta();
//     }
//     metadataParser.initialize();
// };

module.exports.exportWebDb = function (successCallback, errorCallback, options) {
    webDb.exportWebDb();
    return helper.sendSuccess("", sucessCallback, "");
};

//#endregion

//#region Proxy Apis

module.exports.launchFile = function (successCallback, errorCallback, options) {
    alert("Api not supported on web!.");
};
module.exports.unzip = function (successCallback, errorCallback, options) {
    alert("Api not supported on web!.");
};
module.exports.launchBase64 = function (successCallback, errorCallback, options) {
    alert("Api not supported on web!.");
};

//#endregion

//#region Attachment Apis

module.exports.getAttachmentFolderPath = function (successCallback, errorCallback, options) {
    console.log("ump.attachment.getAttachmentFolderPath - Api not supported in browser!");
};
module.exports.createAttachmentItem = function (successCallback, errorCallback, options) {
    console.log("ump.attachment.createAttachmentItem - Api not supported in browser!");
};
module.exports.uploadAttachment = function (successCallback, errorCallback, options) {
    alert("ump.attachment.createAttachmentItem - Api not supported yet in browser!");
};
module.exports.downloadAttachment = function (successCallback, errorCallback, options) {
    alert("ump.attachment.downloadAttachment - Api not supported yet in browser!");
};

//#endregion

//#region Settings Apis

module.exports.getInfoMessages = function (successCallback, errorCallback, options) {
    // var headerName = options[0].headerName;
    var lid = options[0].LID;
    var InfoMessages = webDb.select("INFO_MESSAGE", `BE_LID='${lid}'`);
    helper.sendSuccess("", sucessCallback, InfoMessages);
};

module.exports.showSettings = function (successCallback, errorCallback, options) {
    alert("Api not supported on Web!");
};

module.exports.userSettings = function (successCallback, errorCallback, options) {
    var appMeta = webDb.getAppMeta();
    appMeta.USER_ID = appMeta.username;
    if (loginParameters.loginType == loginType.email) {
        appMeta.EMAIL = appMeta.username;
    }
    return helper.sendSuccess("", successCallback, appMeta);
};

module.exports.updateSystemCredentials = function (successCallback, errorCallback, options) {
    alert("Api not supported on web!.");
};

module.exports.getSystemCredentials = function (successCallback, errorCallback, options) {
    alert("Api not supported on web!.");
};

module.exports.getVersionNumbers = function (successCallback, errorCallback, options) {
    alert("Api not implemented on Web!");
};

module.exports.clearData = function (successCallback, errorCallback, options) {
    helper.clearApplicationDb();
};

/**
 * reCreateAppDB - Recreate application database.
 * Helps in updating application database without reauthenticating with server which requires to drop both app and framework database.
 */
module.exports.reCreateAppDB = function (successCallback, errorCallback, options) {
    webDb.reCreateAppDb();
    helper.sendSuccess("", sucessCallback, true);
};
module.exports.pullDb = function (successCallback, errorCallback, options) {
    alert("Api not supported on Web!");
};
module.exports.pushDb = function (successCallback, errorCallback, options) {
    alert("Api not supported on Web!");
};
module.exports.encrypt = function (successCallback, errorCallback, options) {
    alert("Api not supported on Web!");
};
module.exports.getAppMeta = function (successCallback, errorCallback, options) {
    successCallback(webDb.getAppMeta());
};
module.exports.guid = function (successCallback, errorCallback, options) {
    successCallback(helper.guid());
};
module.exports.hasInternet = function (successCallback, errorCallback, options) {
    helper.sendSuccess("", successCallback, true);
};
module.exports.platform = function (successCallback, errorCallback, options) {
    successCallback('browser');
};

//#endregion

//#region Log Apis

module.exports.logError = function (successCallback, errorCallback, options) {
    var sourceClass = options[0].srcClass;
    var method = options[0].srcMethod;
    var message = options[0].message;
    console.log("ERROR | " + sourceClass + " | " + method + " | " + message);
};
module.exports.logDebug = function (successCallback, errorCallback, options) {
    var sourceClass = options[0].srcClass;
    var method = options[0].srcMethod;
    var message = options[0].message;
    console.log("DEBUG | " + sourceClass + " | " + method + " | " + message);
};
module.exports.logInfo = function (successCallback, errorCallback, options) {
    var sourceClass = options[0].srcClass;
    var method = options[0].srcMethod;
    var message = options[0].message;
    console.log("IMPORTANT | " + sourceClass + " | " + method + " | " + message);
};
module.exports.getLogs = function (successCallback, errorCallback, options) {
    console.log("Api not supported on Web!");
};
module.exports.deleteLogs = function (successCallback, errorCallback, options) {
    console.log("Api not supported on Web!");
};
module.exports.sendViaServer = function (successCallback, errorCallback, options) {
    console.log("Api not supported on Web!");
};
module.exports.sendViaEmail = function (successCallback, errorCallback, options) {
    console.log("Api not supported in Web!");
};

//#endregion

//#region Internal modules

var helper = /** @class */ (function () {
    function helper() {}
    helper.getBeName = function (name) {
        var sMetas = metadata.sMeta.filter(function (e) {
            return e.name === name;
        });
        return sMetas[0].beName;
    };
    helper.getBeHeaderName = function (beName) {
        var headerName = "";
        metadata.sMeta.forEach(function (e) {
            if (e.beName === beName && e.isheader === true) {
                headerName = e.name;
            }
        });
        return headerName;
    };
    helper.getBeChildrenNames = function (structureName) {
        var sMetas = metadata.sMeta.filter(function (e) {
            return e.name === structureName;
        });
        sMetas = metadata.sMeta.filter(function (e) {
            return (e.beName === sMetas[0].beName && e.isheader === false);
        });
        return sMetas;
    };
    helper.getBeTableNames = function (beName) {
        var sMetas = metadata.sMeta.filter(function (e) {
            return e.beName === beName;
        });
        return sMetas;
    };
    helper.getStructureFields = function (structureName) {
        var beName = helper.getBeName(structureName);
        var sFieldMeta = metadata.fMeta.filter(f => f.beName == beName && f.sName == structureName);
        var fwFields = ["LID", "FID", "TIMESTAMP", "OBJECT_STATUS", "SYNC_STATUS"]
        var mandatory = [true, false, false, false, false];
        var sqlTypes = ["TEXT", "TEXT", "INTEGER", "INTEGER", "INTEGER"];

        for (var i = 0; i < fwFields.length; i++) {
            let fMeta = {};
            fMeta.beName = beName;
            fMeta.sName = structureName;
            fMeta.name = fwFields[i];
            fMeta.isGid = false;
            fMeta.isMandatory = mandatory[i];
            fMeta.sqlType = sqlTypes[i];
            sFieldMeta.push(fMeta);
        }

        return sFieldMeta;
    };

    helper.isEmpty = function (value) {
        if (value == undefined || value === null || value === "")
            return true;
        return false;
    };
    helper.copyProperty = function (src, dest) {
        for (var k in src)
            dest[k] = src[k];
        return dest;
    };
    helper.validateLoginParameters = function (mode, callback) {

        if (helper.isEmpty(loginParameters.appName)) {
            helper.sendError("Please provide Application Name!", callback);
            return false;
        }

        if (helper.isEmpty(loginParameters.loginType)) {
            helper.sendError("Incorrect Login Type!", callback);
            return false;
        }
        if (loginParameters.loginType === loginType.sap || loginParameters.loginType === loginType.ads) {
            if (!loginParameters.domain) {
                helper.sendError("Please provide Domain!", callback);
                return false;
            }
        }
        if (helper.isEmpty(mode)) {
            helper.sendError("Please set Login Mode!", callback);
            return false;
        }
        var err = undefined;
        switch (mode) {
            case loginMode.authActivate:
                if (helper.isEmpty(loginParameters.url))
                    err = "Please provide Url!";
                else if (helper.isEmpty(loginParameters.company))
                    err = "Please provide Company Name!";
                else if (helper.isEmpty(loginParameters.username))
                    err = "Please provide User Id!";
                else if (helper.isEmpty(loginParameters.password))
                    err = "Please provide Password!";
                if (err) {
                    helper.sendError(err, callback);
                    return false;
                }
                break;
            case loginMode.authLocal:
                if (helper.isEmpty(loginParameters.username))
                    err = "Please provide User Id!";
                else if (helper.isEmpty(loginParameters.password))
                    err = "Please provide Password!";
                if (err) {
                    helper.sendError(err, callback);
                    return false;
                }
                break;
            case loginMode.forgotPassword:
                break;
        }
        return true;
    };
    helper.guid = function () {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1).toUpperCase();
        }
        return s4() + s4() + '-' + s4() + '-' + s4()
    };
    helper.clearApplicationDb = function () {
        localStorage.removeItem(loginParameters.appName);
        localStorage.removeItem('token');
        webDb.appDb = null;
        webDb.fwDb = null;
    };
    helper.sendError = function (msg, callback) {
        var cbResult = {};
        cbResult.type = resultType.error;
        cbResult.error = msg;
        callback(cbResult);
    };
    helper.sendSuccess = function (msg, callback, data) {
        var cbResult = {};
        cbResult.type = resultType.success;
        cbResult.error = msg;
        cbResult.data = data;
        callback(cbResult);
    };
    helper.sanitizeURL = function (url) {
        if (!url) {
            return ''
        }
        if (url.endsWith('UMP/')) {
            return url.replace('UMP/', 'UMP');
        }
        if (url.endsWith('?local')) {
            return url.replace('?local', '');
        }
        return url;
    };

    helper.currentDateTime = function () {
        var date = new Date();
        var aaaa = date.getFullYear();
        var gg = date.getDate();
        var mm = (date.getMonth() + 1);

        if (gg < 10)
            gg = "0" + gg;

        if (mm < 10)
            mm = "0" + mm;

        var cur_day = aaaa + "-" + mm + "-" + gg;
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();

        if (hours < 10)
            hours = "0" + hours;
        if (minutes < 10)
            minutes = "0" + minutes;
        if (seconds < 10)
            seconds = "0" + seconds;
        return cur_day + " " + hours + ":" + minutes + ":" + seconds;
    };

    return helper;
}());

var restUtil = /** @class */ (function () {
    function restUtil() {}
    /**
     * Rest Api call
     * TODO : Remove JQuery dependency for ajax call
     */
    restUtil.performRequest = function (endpoint, msg, callback, httpType, isAsync, jwtOption) {
        var headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': restUtil.appMeta.authorization
        };
        var postData = {
            frontendUser: restUtil.appMeta.frontEnd,
            messageFormat: 'standard',
            inputMessage: JSON.stringify(msg),
            externalReference: helper.guid(),
            queuedExecute: isAsync,
            jwtOptions: JSON.stringify(jwtOption),
            /**
             * Parameters require for sending SAP port name/ password in initial auth call
             * Clear this on success callback. Henceforth use authkey for subcsequent calls
             */
            credentials: restUtil.appMeta.credentials
        };
        var methodType = httpType ? httpType : "POST";
        $.ajax({
            type: methodType,
            url: endpoint,
            data: postData,
            success: function (res, textStatus, request) {
                var refreshToken = request.getResponseHeader('jwttoken');
                if(refreshToken){
                    localStorage.setItem('token',refreshToken);
                }
                restUtil.hanldeRestApiCallback(true, res, callback);
            },
            error: function (res) {
                restUtil.hanldeRestApiCallback(false, res, callback);
            },
            headers: headers,
            dataType: 'json'
        });
    };
    restUtil.hanldeRestApiCallback = function (isSuccess, result, callback) {
        var cbResult = {};
        if (isSuccess) {
            cbResult.type = resultType.success;
            cbResult.message = (result && result.message) ? result.message : "";
            cbResult.data = result;
        } else {
            cbResult.type = resultType.error;
            cbResult.error = (result && result.responseText) ? result.responseText : "";
            cbResult.message = (result && result.message) ? result.message : "";
        }
        cbResult.code = result.status;
        callback(cbResult);
    };

    restUtil.appMeta = {};
    restUtil.httpType = {
        get: "GET",
        post: "POST",
        del: "DELETE"
    };
    return restUtil;
}());

var parser = /** @class */ (function () {
    function parser() {}
    parser.parseServerResponse = function (data, reqype, header) {
        var cbResult = {};
        cbResult.type = resultType.success;
        cbResult.data = data;
        cbResult.message = "";

        //Save InfoMessages and return Failure response if any Failure Infomessage
        if (data.hasOwnProperty("InfoMessage")) {
            var infoArr = data.InfoMessage;
            infoArr.forEach(function (infoMessage) {
               // infoMessage.beName = beName;
               if(helper.isEmpty(header)){
                 infoMessage.beLid = header.LID;
               }
                webDb.insert("INFO_MESSAGE", infoMessage);
                cbResult.message = cbResult.message + " " + infoMessage.message;
                if (infoMessage.category === "FAILURE") {
                    cbResult.type = resultType.error;
                }
            });
        }

        for (var property in data) {
            if (property === "InfoMessage") {
                continue;
            } else {
                var beArr = data[property];
                //Clear BE for PULL request.Pull will always be Insert
                if (reqype == requestType.PULL) {
                    var children = helper.getBeTableNames(property);
                    if ((children != null) && (children.length > 0)) {
                        for (var i = 0; i < children.length; i++) {
                            webDb.execute(`DELETE FROM ${children[i].name}`);
                        }
                    }
                }

                beArr.forEach(function (element) {
                    parser.handleEachBE(element, reqype, property);
                });
            }
        }

        return cbResult;
    };
    parser.handleEachBE = function (be, reqType, beName) {

        var headerLid = "";
        var isActionDelete = false;

        for (var property in be) {

            if (be.hasOwnProperty(property)) {
                var value = be[property];
                //Item
                if (value.constructor === Array) {
                    value.forEach(function (item) {
                        item["FID"] = headerLid;
                        var structureInDB = (reqType === requestType.PULL) ? null : webDb.getBasedOnGid(property, item);
                        if (structureInDB == null) {
                            item.FID = headerLid;
                            webDb.insert(property, item);
                        } else {
                            item = helper.copyProperty(item, structureInDB);
                            webDb.updateStructure(property, item);
                        }
                    });

                    //Header    
                } else if (value.constructor === Object) {

                    value["LID"] = helper.guid();
                    headerLid = value.LID;

                    //Handle action delete
                    if (isActionDelete) {
                        webDb.deleteRecordStructure(property, value);
                        continue;
                    }
                    var structureInDB = (reqType === requestType.PULL) ? null : webDb.getBasedOnGid(property, value);

                    //Browser does not support reconciliation so delete BE if exists and copy over existing header field values
                    // Otherwise items not present in server will remain on client db
                    if (reqType === requestType.RQST) {

                        if (structureInDB && (structureInDB != null)) {
                            var children = helper.getBeChildrenNames(property);
                            if ((children != null) && (children.length > 0)) {
                                for (var i = 0; i < children.length; i++) {
                                    webDb.deleteRecord(children[i]["name"], `LID='${structureInDB.LID}'`)
                                }
                            }
                        }
                    }
                    if (structureInDB == null) {
                        value.LID = helper.guid();
                        webDb.insert(property, value);
                    } else {
                        value = helper.copyProperty(value, structureInDB);
                        webDb.updateStructure(property, value);
                    }

                    headerLid = value.LID;

                } else { //Handle Action D - Delete Header and children
                    isActionDelete = "D" == value;
                }
            }
        }
    };
    return parser;
}());

// metadataParser - parse metadata.json, create BusinessEntityMeta, StructureMeta and FieldMeta and save.
var metadataParser = /** @class */ (function () {
    function metadataParser() {}
    metadataParser.initialize = function () {
        if (loginParameters.metadataPath.length > 0) {
            metadataParser.loadJSON(metadataParser.parse);
        } else if (loginParameters.metadataJSON.length > 0) {
            metadataParser.parse(loginParameters.metadataJSON);
        } else {
            console.log("ERROR: " + "metadataJSON is empty. Set the JSON to loginParameters.metadataJSON")
        }
    };
    metadataParser.loadJSON = function (callback) {
        var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
        var metadataPath = helper.isEmpty(loginParameters.metadataPath) ? "metadata.json" : loginParameters.metadataPath;
        xobj.open('GET', metadataPath, true);
        xobj.onreadystatechange = function () {
            if (xobj.readyState == 4 && xobj.status == 200) {
                callback(xobj.responseText);
            }
        };
        xobj.send(null);
    };
    metadataParser.parse = function (json) {
        if (helper.isEmpty(json))
            return;
        var data = JSON.parse(json);
        for (var property in data) {
            if (data.hasOwnProperty(property)) {
                var value = data[property];
                if (value.constructor === Object) {
                    metadataParser.parseEachBE(value, property);
                }
            }
        }
    };
    metadataParser.parseEachBE = function (be, name) {
        var beMeta = {};
        beMeta.attachment = helper.isEmpty(be.attachments) ? false : be.attachments;
        beMeta.onConflict = helper.isEmpty(be.onConflict) ? conflictRule.SERVER_WINS : be.onConflict;
        beMeta.save = helper.isEmpty(be.save) ? true : be.save;
        beMeta.name = name;
        metadata.bMeta.push(beMeta);
        for (var property in be) {
            if (be.hasOwnProperty(property)) {
                var value = be[property];
                if (value.constructor === Object) {
                    var sMeta = {};
                    sMeta.beName = beMeta.name;
                    sMeta.isheader = ((property.indexOf("_HEADER") > -1) || (property.indexOf("_HDR") > -1)) ? true : false;
                    sMeta.name = property;
                    metadata.sMeta.push(sMeta);
                    var fields = value.field;
                    if (fields != null && fields.length > 0) {
                        fields.forEach(function (f) {
                            var fMeta = {};
                            fMeta.beName = beMeta.name;
                            fMeta.sName = sMeta.name;
                            fMeta.name = f.name;
                            fMeta.isGid = f.isGid;
                            fMeta.isMandatory = f.mandatory;
                            fMeta.sqlType = f.sqlType;
                            metadata.fMeta.push(fMeta);
                        });
                    }
                }
            }
        }
    };
    return metadataParser;
}());

//#endregion

//#region WebDb Module

var webDb = /** @class */ (function () {
    function webDb() {}

    webDb.initialize = function (callback) {
        var initSqlJs = window.initSqlJs;
        config = {
            locateFile: filename => "/assets/js/sql-wasm.wasm"
        };
        initSqlJs(config).then(function (SQL) {

            // var db;
            // var request = window.indexedDB.open(loginParameters.appName|| 'UNVIRED_DB');
            // request.onupgradeneeded = function(event) {
            //     db = event.target.result;
            //     db.createObjectStore('appData', { keyPath: 'id' });
            // };
            // request.onerror = function (event) {
            //     console.log('The database is opened failed');
            //     callback();
            // };
            // request.onsuccess = function (event) {
            //     db = request.result;
            //     if (!db.objectStoreNames.contains('appData')) {
            //        return;
            //     }
            //     var transaction = db.transaction(['appData']);
            //     var objectStore = transaction.objectStore('appData');
            //     var dataRequest = objectStore.get(1);
            
            //     dataRequest.onerror = function(event) {
            //     console.log('Unable to read appData indexDb table');
            //         callback();
            //     };
            //     dataRequest.onsuccess = function( event) {
            //     if (dataRequest.result) {
            //         var arrayBuffer;
            //         var fileReader = new FileReader();
            //         fileReader.onload = function(event) {
            //             arrayBuffer = event.target.result;
            //             if (arrayBuffer.byteLength > 0) {
            //                 webDb.appDb = new SQL.Database(arrayBuffer);

            //                 var dbDeleteRequest = window.indexedDB.deleteDatabase(loginParameters.appName|| 'UNVIRED_DB');
            //                 dbDeleteRequest.onsuccess = function(e){
            //                     console.log("WebDb successfully deleted");
            //                 };
            //                 dbDeleteRequest.onerror = function(e){
            //                     console.log("Error deleting WebDb");
            //                 };
            //                 dbDeleteRequest.onblocked = function(e){
            //                     console.log("Deleting WebDb Blocked");
            //                 };
            //                 callback();
            //             }
            //         };
            //         fileReader.readAsArrayBuffer(dataRequest.result.data);
            //     } else {
            //         console.log('Error while populatig web db');
            //         callback();
            //      }
            //     };
            // };

            if (webDb.appDb == null) {
                webDb.appDb = new SQL.Database();
            }
            webDb.createApplicationTables();
            webDb.createInfoMessageTable();
            callback();
        });
    };
    webDb.insert = function (name, structure) {

        if (helper.isEmpty(structure.LID)) {
            structure.LID = helper.guid();
        }
        if (helper.isEmpty(structure.TIMESTAMP)) {
            structure.TIMESTAMP = helper.currentDateTime();
        }
        var columnIndex = 0;
        var columnNames = [];
        var columnValues = [];
        var sFieldMeta = helper.getStructureFields(name);
        sFieldMeta.forEach(function (fMeta) {
            if (structure.hasOwnProperty(fMeta.name)) {
                columnNames[columnIndex] = fMeta.name;
                columnValues[columnIndex] = structure[fMeta.name];
                columnIndex++;
            }
        });
        var query = webDb.prepareInsertBindQuery(name, columnNames);
        webDb.executeBindQuery(query, columnValues);
    };
    webDb.insertOrUpdateBasedOnGid = function (tableName, structure) {
        var columnIndex = 0;
        var columnNames = [];
        var columnValues = [];
        var sFieldMeta = helper.getStructureFields(name);
        sFieldMeta.forEach(function (fMeta) {
            if (structure.hasOwnProperty(fMeta.name)) {
                columnNames[columnIndex] = fMeta.name;
                columnValues[columnIndex] = structure[fMeta.name];
                columnIndex++;
            }
        });
        var query = webDb.prepareReplaceBindQuery(name, columnNames);
        webDb.executeBindQuery(query, columnValues);
    };
    webDb.select = function (tableName, whereClause, orderByFields) {
        whereClause = whereClause;
        var query = webDb.prepareSelectQuery(tableName, whereClause, orderByFields);
        return webDb.executeQuery(query);
    };
    webDb.updateStructure = function (tableName, structure, whereClause) {
        var columnIndex = 0;
        var columnNames = [];
        var columnValues = [];
        var sFieldMeta = helper.getStructureFields(tableName);
        sFieldMeta.forEach(function (fMeta) {
            if (structure.hasOwnProperty(fMeta.name)) {
                columnNames[columnIndex] = fMeta.name;
                columnValues[columnIndex] = structure[fMeta.name];
                columnIndex++;
            }
        });
        whereClause = helper.isEmpty(whereClause) ? `LID = '${structure.LID}'` : whereClause;
        var query = webDb.prepareReplaceBindQuery(tableName, columnNames);
        webDb.executeBindQuery(query, columnValues);
        webDb.update(tableName, columnNames, columnValues, whereClause);
    };
    webDb.update = function (tableName, columnNames, columnValues, whereClause) {
        var query = webDb.prepareUpdateBindQuery(tableName, columnNames, whereClause);
        webDb.executeBindQuery(query, columnValues);
    };
    webDb.deleteRecordStructure = function (tableName, structure) {
        var structureInDB = webDb.getBasedOnGid(tableName, structure);
        if (structureInDB && (structureInDB != null)) {
            webDb.deleteRecord(tableName, structureInDB.LID);
        }
    };
    webDb.deleteRecord = function (tableName, whereClause) {
        var query = webDb.prepareDeleteQuery(tableName, whereClause);
        webDb.execute(query);
    };
    webDb.saveAppMeta = function (appMeta) {
        metadata.appMeta = appMeta;
        localStorage.setItem(loginParameters.appName,JSON.stringify(appMeta));
        // webDb.insert("appMeta", appMeta, true);
    };
    webDb.getAppMeta = function () {
        metadata.appMeta.authorization = 'Bearer:' + localStorage.getItem('token');
        return metadata.appMeta;
    };
    webDb.reloadAppMeta = function() {
        var appMeta = localStorage.getItem(loginParameters.appName);
        if(appMeta){
            metadata.appMeta = JSON.parse(appMeta);
            var token = localStorage.getItem('token');
            if(!token) return false;
            restUtil.appMeta.authorization = 'Bearer:' +token;
            webDb.initialize(function(){            
            });
            return true;
        }
        return false;
    };
    // Considering structure name is unique.(Not handling same structure across multiple BusinessEntity)
    webDb.getBasedOnGid = function (tableName, structure) {
        if (helper.isEmpty(tableName))
            return null;
        var sMeta = metadata.sMeta.find(function (e) {
            return e.name === tableName;
        });

        if (sMeta == null || sMeta.length <= 0) return null;

        var sBeMeta = metadata.bMeta.find(b => b.name === sMeta.beName);
        if (!sBeMeta.save) return;

        var gidColumns = metadata.fMeta.filter(function (e) {
            return e.sName === tableName && e.isGid === true;
        });
        if (gidColumns == null || gidColumns.length <= 0)
            return null;
        var gidValues = [];
        var columnIndex = 0;
        gidColumns.forEach(function (gid) {
            gidColumns[columnIndex] = gid.name;
            gidValues[columnIndex] = helper.isEmpty(structure[gid.name]) ? null : structure[gid.name];
            columnIndex++;
        });

        var whereClauseForDuplicate = "";
        for (var i = 0; i < gidColumns.length; i++) {
            if (i == gidColumns.length - 1)
                whereClauseForDuplicate = whereClauseForDuplicate + " " + gidColumns[i] + " = " + "'" + gidValues[i].toString().replace(/'/g, "''") + "'";
            else
                whereClauseForDuplicate = whereClauseForDuplicate + " " + gidColumns[i] + " = " + "'" + gidValues[i].toString().replace(/'/g, "''") + "'" + " AND ";
        }

        var duplicateDataStructures = webDb.select(tableName, whereClauseForDuplicate);
        if (duplicateDataStructures != null && duplicateDataStructures.length > 0) {
            return duplicateDataStructures[0];
        }
        return null;
    };
    //TODO
    webDb.reCreateAppDb = function () {
        alert("Api - webDb.reCreateAppDb is not yet implemented!");
    };
    webDb.createApplicationTables = function () {

        var foreignKeysForItemStructure = ["FID"];
        var parentsForForeignKeysInHeaderStructure = ["LID"];

        metadata.sMeta.forEach(function (s) {
            if(s.beName.indexOf("INFO_MESSAGE") != -1) return;
            var sFieldMeta = metadata.fMeta.filter(f => f.beName == s.beName && f.sName == s.name);
            var sBeMeta = metadata.bMeta.find(b => b.name === s.beName);
            // Do not create table if BE Save property is false
            if (!sBeMeta.save) return;

            var columnIndex = 0;
            var columnNames = [];
            var columnTypes = [];
            var mandatoryFields = [];
            var primaryKeys = ["LID"];
            var uniqueKeys = [];

            if (s.isheader) {
                columnNames[0] = "LID";
                columnTypes[0] = "TEXT";
                mandatoryFields[0] = true;

                columnNames[1] = "TIMESTAMP";
                columnTypes[1] = "INTEGER";
                mandatoryFields[1] = false;

                columnNames[2] = "OBJECT_STATUS";
                columnTypes[2] = "INTEGER";
                mandatoryFields[2] = false;

                columnNames[3] = "SYNC_STATUS";
                columnTypes[3] = "INTEGER";
                mandatoryFields[3] = false;

                columnIndex = 4;
            } else {

                if (s.name.toLowerCase().endsWith("_attachment")) {
                    return;
                }

                columnNames[0] = "LID";
                columnTypes[0] = "TEXT";
                mandatoryFields[0] = true;

                columnNames[1] = "FID";
                columnTypes[1] = "TEXT";
                mandatoryFields[1] = false;

                columnNames[2] = "TIMESTAMP";
                columnTypes[2] = "INTEGER";
                mandatoryFields[2] = false;

                columnNames[3] = "OBJECT_STATUS";
                columnTypes[3] = "INTEGER";
                mandatoryFields[3] = false;

                columnNames[4] = "SYNC_STATUS";
                columnTypes[4] = "INTEGER";
                mandatoryFields[4] = false;

                columnIndex = 5;
            }

            sFieldMeta.forEach(function (fMeta) {
                columnNames[columnIndex] = fMeta.name;
                columnTypes[columnIndex] = fMeta.sqlType;
                if (fMeta.isGid) {
                    uniqueKeys.push(fMeta.name);
                }
                mandatoryFields[columnIndex] = fMeta.isMandatory;
                columnIndex++;
            });

            if (s.isheader) {
                webDb.createTable(s.name, columnNames, columnTypes, primaryKeys, uniqueKeys, mandatoryFields, null, null, null);

                // If BE support attachment then create BEName_Attachement tabel and add StructureMeta and FieldMeta entry to metadata
                if (sBeMeta.attachment) {
                    webDb.createAttachmentTable(sBeMeta.name, s.name);
                }
            } else {
                var headerName = helper.getBeHeaderName(s.beName);
                webDb.createTable(s.name, columnNames, columnTypes, primaryKeys, uniqueKeys, mandatoryFields, foreignKeysForItemStructure, headerName, parentsForForeignKeysInHeaderStructure);
            }
        });
    };
    webDb.createTable = function (tableName, columnNames, columnTypes, primaryKeys, uniqueKeys, mandatoryFields, foreignKeys, foreignKeyTableName, foreignKeyTableKeys) {
        var query = webDb.prepareCreateQuery(tableName, columnNames, columnTypes, primaryKeys, uniqueKeys, mandatoryFields, foreignKeys, foreignKeyTableName, foreignKeyTableKeys);
        webDb.execute(query);
    };
    webDb.createAttachmentTable = function (beName, headerName) {
        var attchPrimaryKeys = ["LID"];
        var foreignKeysForItemStructure = ["FID"];
        var attchUniqueKeys = ["UID"];
        var parentsForForeignKeysInHeaderStructure = ["LID"];
        var attchColumnNames = [
            "LID", "FID", "TIMESTAMP", "OBJECT_STATUS", "SYNC_STATUS", "UID", "MIME_TYPE", "FILE_NAME", "DESCRIPTION",
            "URL", "EXTERNAL_URL", "URL_REQUIRES_AUTH", "LOCAL_PATH", "NO_CACHE", "AUTO_DOWNLOAD", "ATTACHMENT_STATUS",
            "CUSTOM_FIELD_1", "CUSTOM_FIELD_2", "TAG1", "TAG2", "TAG3", "TAG4", "TAG5", "DATA"
        ];
        var attchColumnTypes = [
            "TEXT", "TEXT", "INTEGER", "INTEGER", "INTEGER", "TEXT", "TEXT", "TEXT", "TEXT", "TEXT", "TEXT", "TEXT",
            "TEXT", "TEXT", "TEXT", "INTEGER", "TEXT", "TEXT", "TEXT", "TEXT", "TEXT", "TEXT", "TEXT", "TEXT"
        ];
        var attchMandatoryFields = [
            true, true, false, false, false, false, false, false, false, false, false, false,
            false, false, false, false, false, false, false, false, false, false, false, false
        ];

        webDb.createTable(`${beName}_ATTACHMENT`, attchColumnNames, attchColumnTypes, attchPrimaryKeys, attchUniqueKeys, attchMandatoryFields, foreignKeysForItemStructure, headerName, parentsForForeignKeysInHeaderStructure);

        var attchSMeta = {
            "beName": beName,
            "isheader": false,
            "name": `${beName}_ATTACHMENT`
        };
        metadata.sMeta.push(attchSMeta);

        attchColumnNames.forEach(function (cName) {
            let fMeta = {
                "beName": beName,
                "sName": `${beName}_ATTACHMENT`,
                "name": cName,
                "isGid": attchUniqueKeys.indexOf(cName) !== -1,
                "isMandatory": attchMandatoryFields[attchColumnNames.indexOf(cName)],
                "sqlType": attchColumnTypes[attchColumnNames.indexOf(cName)]
            };
            metadata.fMeta.push(fMeta);
        });
    };
    webDb.createInfoMessageTable = function () {
        var primaryKeys = ["LID"];
        var uniqueKeys = ["LID"];
        var columnNames = ["LID", "TIMESTAMP", "TYPE", "SUB_TYPE", "CATEGORY", "MESSAGE", "BE_NAME", "BE_LID", "MESSAGE_BLOB"];
        var columnTypes = ["TEXT", "INTEGER", "TEXT", "TEXT", "TEXT", "TEXT", "TEXT", "TEXT", "BLOB"];
        webDb.createTable("INFO_MESSAGE", columnNames, columnTypes, primaryKeys, uniqueKeys);

        var attchSMeta = {
            "beName": "INFO_MESSAGE",
            "isheader": true,
            "name": "INFO_MESSAGE"
        };
        metadata.sMeta.push(attchSMeta);

        columnNames.forEach(function (cName) {
            let fMeta = {
                "beName": "INFO_MESSAGE",
                "sName": "INFO_MESSAGE",
                "name": cName,
                "isGid": uniqueKeys.indexOf(cName) !== -1,
                "isMandatory": false,
                "sqlType": columnTypes[columnNames.indexOf(cName)]
            };
            metadata.fMeta.push(fMeta);
        });

    };
    // Execute query without return result
    webDb.execute = function (query) {
        webDb.appDb.run(query);
    };
    //Execute query and return results
    webDb.executeQuery = function (query) {
        var stmt = webDb.appDb.prepare(query);
        var rows = [];
        while (stmt.step()) {
            var row = stmt.getAsObject();
            rows.push(row);
        }
        return rows;
    };
    //Execute bind query without return result
    webDb.executeBindQuery = function (query, value) {
        webDb.appDb.run(query, value);
    };
    webDb.prepareCreateQuery = function (tableName, tableColumnNames, tableColumnTypes, primaryKeys, uniqueKeys, mandatoryFields, foreignKeys, foreignKeyTableName, foreignKeyTableKeys) {
        var query = "";
        var primaryKey = "";
        var uniqueKey = "";
        var foreignKey = "";
        var foreignKeyTableKey = "";

        if (primaryKeys != null) {
            for (var i = 0; i < primaryKeys.length; i++) {
                if (i == 0) {
                    primaryKey += primaryKeys[i];
                } else {
                    primaryKey += ", " + primaryKeys[i];
                }
            }
        }

        if (uniqueKeys != null) {
            for (var i = 0; i < uniqueKeys.length; i++) {
                if (i == 0) {
                    uniqueKey += uniqueKeys[i];
                } else {
                    uniqueKey += ", " + uniqueKeys[i];
                }
            }
        }

        if (foreignKeyTableName != null) {

            for (var i = 0; i < foreignKeys.length; i++) {
                if (i == 0) {
                    foreignKey += foreignKeys[i];
                } else {
                    foreignKey += ", " + foreignKeys[i];
                }
            }

            for (var i = 0; i < foreignKeyTableKeys.length; i++) {
                if (i == 0) {
                    foreignKeyTableKey += foreignKeyTableKeys[i];
                } else {
                    foreignKeyTableKey += ", " + foreignKeyTableKeys[i];
                }
            }
        }

        var noOfColumns = 0;

        if (tableColumnNames != null)
            noOfColumns = tableColumnNames.length;

        query = "CREATE TABLE '" + tableName + "' (";

        for (var i = 0; i < noOfColumns; i++) {

            if (i == 0)
                query += "'" + tableColumnNames[i] + "' ";
            else
                query += ", '" + tableColumnNames[i] + "' ";

            if (tableColumnTypes != null) {
                try {
                    query += tableColumnTypes[i];
                } catch (error) {
                    console.error(`Error occured in preparing create query. ${error}`);
                }
            }

            if (mandatoryFields != null) {
                var isMandatory = mandatoryFields[i];
                if (isMandatory) {
                    query += " NOT NULL";
                }
            }
        }

        if (!helper.isEmpty(primaryKey)) {
            query += ", " + "PRIMARY KEY(" + primaryKey + ")";
        }

        if (!helper.isEmpty(uniqueKey)) {
            query += ", " + "UNIQUE(" + uniqueKey + ")";
        }

        if (!helper.isEmpty(foreignKeyTableName)) {
            query += ", FOREIGN KEY(" + foreignKey + ") REFERENCES " + foreignKeyTableName + "(" + foreignKeyTableKey + ")" + "ON UPDATE CASCADE ON DELETE CASCADE";
        }

        query = query + ")";

        return query;
    };
    webDb.prepareInsertBindQuery = function (tableName, tableColumnNames) {
        var query = "";
        var noOfColumns = tableColumnNames.length;

        query = "INSERT INTO " + tableName + " (";

        for (let i = 0; i < noOfColumns; i++) {
            var key = tableColumnNames[i];
            query = query + key + ",";
        }

        query = query.slice(0, -1);
        query += ')';
        query = query + " VALUES (";

        var value = "";
        for (var i = 0; i < noOfColumns; i++) {
            value = (value == "") ? value + "?" : value + ", " + "?";
        }
        query = query + value + ")";
        return query;
    };
    webDb.prepareSelectQuery = function (tableName, whereClause, orderByFields) {
        var query = "SELECT * FROM " + tableName + " ";
        if (!helper.isEmpty(whereClause))
            query = query + "WHERE " + whereClause;

        if (orderByFields && orderByFields != null && orderByFields.length > 0) {
            query = query + " ORDER BY ";
            for (var i = 0; i < orderByFields.length; i++) {
                if (i == orderByFields.length - 1)
                    query = query + orderByFields[i];
                else
                    query = query + orderByFields[i] + ", ";
            }
            query = query + " COLLATE NOCASE ASC ";
        }
        return query;
    };
    webDb.prepareReplaceBindQuery = function (tableName, tableColumnNames) {
        var noOfColumns = tableColumnNames.length;
        var query = "REPLACE INTO " + tableName + " (";
        for (let i = 0; i < noOfColumns; i++) {
            var key = tableColumnNames[i];
            query = query + key + ",";
        }
        query = query.slice(0, -1);
        query += ')';
        query = query + " VALUES (";

        var value = "";

        for (let i = 0; i < noOfColumns; i++) {
            value = (value == "") ? value + "?" : value + ", " + "?";
        }
        query = query + value + ")";
        return query;
    };
    webDb.prepareDeleteQuery = function (tableName, whereClause) {
        var query = "DELETE FROM " + tableName + " ";
        if (!helper.isEmpty(whereClause))
            query = query + "WHERE " + whereClause;
        return query;
    };
    webDb.prepareUpdateBindQuery = function (tableName, tableColumnNames, whereClause) {
        var query = "";
        var noOfColumns = tableColumnNames.length;
        query = "UPDATE " + tableName + " SET ";
        for (var i = 0; i < noOfColumns; i++) {
            query = (i == 0) ? query + tableColumnNames[i] + " = ? " : query + " , " + tableColumnNames[i] + " = ? ";
        }
        if (!helper.isEmpty(whereClause))
            query = query + " WHERE " + whereClause;
        return query;
    };
    webDb.exportWebDb = function () {
        //Download sqlite db
        var arraybuff = webDb.appDb.export();
        var blob = new Blob([arraybuff]);
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.href = window.URL.createObjectURL(blob);
        a.download = "sql.db";
        a.onclick = function () {
            setTimeout(function () {
                window.URL.revokeObjectURL(a.href);
            }, 1500);
        };
        a.click();
    };

    webDb.saveWebDb = function () {

        var arraybuff = webDb.appDb.export();
        var blob = new Blob([arraybuff]);
        // Create/open database
        var db;
        var request = window.indexedDB.open(loginParameters.appName|| 'UNVIRED_DB');
        request.onupgradeneeded = function(event) {
            db = event.target.result;
            var objectStore = db.createObjectStore('appData', { keyPath: 'id' });
        }
        request.onerror = function (event) {
            console.log('The database is opened failed');
        };
        request.onsuccess = function (event) {
        db = request.result;
        if (!db.objectStoreNames.contains('appData')) {
            objectStore = db.createObjectStore('appData', { keyPath: 'id' });
        }
        var transRequest = db.transaction(['appData'], 'readwrite').objectStore('appData').add({ id: 1, data: blob });

        transRequest.onsuccess = function (event) {
            console.log('The data has been written successfully');
        };
        transRequest.onerror = function (event) {
            console.log('The data has been written failed');
        }  
    }
    };

    webDb.populateWebDb = function() {

        var db;
        var request = window.indexedDB.open(loginParameters.appName|| 'UNVIRED_DB');
        request.onupgradeneeded = function(event) {
            db = event.target.result;
            db.createObjectStore('appData', { keyPath: 'id' });
        };
        request.onerror = function (event) {
            console.log('The database is opened failed');
        };
        request.onsuccess = function (event) {
            db = request.result;
            if (!db.objectStoreNames.contains('appData')) {
               return;
            }
            var transaction = db.transaction(['appData']);
            var objectStore = transaction.objectStore('appData');
            var dataRequest = objectStore.get(1);
        
            dataRequest.onerror = function(event) {
            console.log('Unable to read appData indexDb table');
            };
            dataRequest.onsuccess = function( event) {
            if (dataRequest.result) {
                
            } else {
                console.log('Error while populatig web db');
            }
            };
        };
    }
    
    webDb.appDb = null;
    return webDb;
}());

//#endregion

//#region exported modules
require('cordova/exec/proxy').add('LoginPlugin', module.exports);
require('cordova/exec/proxy').add('LoggerPlugin', module.exports);
require('cordova/exec/proxy').add('SyncEnginePlugin', module.exports);
require('cordova/exec/proxy').add('AttachmentPlugin', module.exports);
require('cordova/exec/proxy').add('SettingsPlugin', module.exports);
require('cordova/exec/proxy').add('DatabasePlugin', module.exports);
//#endregion
