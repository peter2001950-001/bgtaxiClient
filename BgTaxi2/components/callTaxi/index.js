'use strict';

app.callTaxi = kendo.observable({
    onShow: function() {  document.getElementById("appDrawer").style.visibility = "visible";
    document.getElementById("progressBar").style.visibility = "hidden";},
    afterShow: function() {},
    callTaxi: function(){
        clicked();
var rememberKey = 'bgTaxiAuth_authData_homeView',
              auth = "";
               if (localStorage) {
                       auth = localStorage.getItem(rememberKey);
                    } else {
                        auth = app[rememberKey];
                    }
               var userAndPass = JSON.parse(auth);
                var tok = userAndPass.email + ':' + userAndPass.password;
                 var hash = btoa(tok);
               navigator.geolocation.getCurrentPosition(geoSuccess, geoError);

            function geoSuccess(position) {
              
                var positionCou = position.coords;
                var data = {
                    longitude: positionCou.longitude,
                    latitude: positionCou.latitude,
                    hash: hash
                }
                console.log(data);
                var worker = new Worker("components/callTaxi/communication.js");
                worker.postMessage(data);
                worker.onmessage  = function(data){
                   document.getElementById("messageBox").innerText = data.data
                    console.log(data.data);
                }

            }

            function geoError() {
            alert("error");
                console.log(arguments);
            }
    }
    
});

// START_CUSTOM_CODE_callTaxi
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_callTaxi
