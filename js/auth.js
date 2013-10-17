var auth = ( function () {

    var tokenServiceUrl = '/tokenservice/';
    var appId = 'Styrerommet';
    var appSecret = 'dummy';
    var requiredRoles = ['Club Owner', 'WhydahUserAdmin', 'client'];

    function authenticate() {

        var loc = window.location.search;

        var cookieTokenId = readCookie('tokenid');

        if ( cookieTokenId !== null && cookieTokenId.length > 5) {
            console.log('has cookie');
            console.log(cookieTokenId);
        } else if (loc.indexOf('userticket=') > 0) {
            var ticketid = loc.substring(loc.indexOf("=") + 1);
            var userToken = getUsertoken(ticketid, 'ticket');
            if( hasRequiredRole(userToken) ) {
                persistAuthentication(userToken);
            } else {
                logout();
            }
        } else if (loc.indexOf('usertokenid=') > 0) {
            var usertokenid = loc.substring(loc.indexOf("=") + 1);
            var userToken = getUsertoken(usertokenid, 'token');
            if( hasRequiredRole(userToken) ) {
                persistAuthentication(userToken);
            } else {
                logout();
                console.log('Does not have required role.')
            }
        } else {
            logout();
            return;
        }

    }

    function getUsertoken(id, type) {

        var appTokenXml = logonApplication();
        var myAppTokenId = getTokenIdFromAppToken(appTokenXml);

        var url = tokenServiceUrl + "iam/" + myAppTokenId + "/getusertokenby"+type+"id";

        var req = new XMLHttpRequest();
        req.open("POST", url, false);
        req.setRequestHeader('Content-type','application/x-www-form-urlencoded');
        req.send(
            'apptoken=' + escape(appTokenXml) + 
            '&usertokenid=' + id + 
            '&ticketid=' + id
            );

        return req.responseText;

    }

    function logonApplication() {

        var url = tokenServiceUrl + "logon/";

        var appCred = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>"
            + "<applicationcredential>"
                + "<params>"
                    + "<applicationID>" + appId + "</applicationID>"
                    + "<applicationSecret>" + appSecret + "</applicationSecret>"
                + "</params>"
            + "</applicationcredential>";
        appCred = escape(appCred);

        var req = new XMLHttpRequest();
        req.open("POST", url, false);
        req.setRequestHeader('Content-type','application/x-www-form-urlencoded');
        req.send("applicationcredential=" + appCred);

        return req.responseText;

    }

    function getTokenIdFromAppToken(appTokenXML) {
        //THIS DOESNT WORK BECAUSE SERVICE DOESNT RETURN VALID XML
        //Assume only one element named applicationtoken
        //var node = appTokenXML.getElementsByTagName("applicationtoken")[0];
        //var appTokenId = node.childNodes[0].nodeValue;   //Yes, this is the appTokenId
        var appTokenId = appTokenXML.split('applicationtoken>')[1];
        appTokenId = appTokenId.substring(0,appTokenId.length-2);
        console.log("appTokenId=" + appTokenId);
        return appTokenId;
    }

    function hasRequiredRole(usertoken) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(usertoken,'text/xml');
        var userRoles = [];
        var userRoleElements = doc.getElementsByTagName("role");
        for( var i = 0; i < userRoleElements.length; i++) {
            userRoles.push( userRoleElements[i].getAttribute("name") );
        }
        return getIntersect(userRoles, requiredRoles).length > 0;
    }

    function getIntersect(arr1, arr2) {
        var r = [], o = {}, l = arr2.length, i, v;
        for (i = 0; i < l; i++) {
            o[arr2[i]] = true;
        }
        l = arr1.length;
        for (i = 0; i < l; i++) {
            v = arr1[i];
            if (v in o) {
                r.push(v);
            }
        }
        return r;
    }

    function isAuthenticated() {
        var cookieTokenId = readCookie('tokenid');
        // var userToken = getUsertoken(usertokenid, 'token');
        if ( cookieTokenId !== null && cookieTokenId.length > 5) {
            return true;
        }
        return false;
    }

    function persistAuthentication(usertoken) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(usertoken,'text/xml');
        tokenid = doc.documentElement.getAttribute("id");
        createCookie('tokenid', tokenid, 7);
        createCookie('usertoken', usertoken.replace(/(\r\n|\n|\r)/gm," "), 7);
    }

    function getUserName() {
        var usertoken = readCookie('usertoken');
        var parser = new DOMParser();
        var doc = parser.parseFromString(usertoken,'text/xml');
        var userid = doc.getElementsByTagName("firstname")[0].childNodes[0].nodeValue;
        return userid;
    }

    function createCookie(name,value,days) {
        if (days) {
            var date = new Date();
            date.setTime(date.getTime()+(days*24*60*60*1000));
            var expires = "; expires="+date.toGMTString();
        } else {
            var expires = "";
        } 
        document.cookie = name+"="+value+expires+"; path=/";
    }

    function readCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
        return null;
    }

    function eraseCookie(name) {
        createCookie(name,"",-1);
    }

    function logout() {
        eraseCookie('usertoken');
        eraseCookie('tokenid');
    }

    return {
        authenticate: authenticate,
        isAuthenticated: isAuthenticated,
        getUserName: getUserName,
        logout: logout
    };

}());