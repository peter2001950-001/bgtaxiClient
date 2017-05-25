'use strict';

app.home = kendo.observable({
    onShow: function () {if(localStorage.getItem("user") != undefined || app["user"] != undefined){
     app.mobileApp.navigate('components/callTaxi/view.html');
       }
       if(localStorage.getItem("accessToken")==undefined){
           startWorker();
       }
        document.getElementById("appDrawer").style.display = "none";
        
     },
    afterShow: function () { }
});

var account = (function(){
    function login(){
         while(getFromLocalStorage("accessToken") == undefined){
                    $("#errorMessage").html(languagePack[currentLanguage].pleaseWait);
                }
                if(getFromLocalStorage("accessToken") == "NONE"){
                    $("#errorMessage").html(languagePack[currentLanguage].registerDeviceError);
                    
                }else{
                var tok1 = document.getElementById("home-email").value + ':' + document.getElementById("home-password").value;
                var hash1 = btoa(tok1);
                 $.ajax({
                    url: "http://localhost:35486/Account/LoginExternal?accessToken=" + getFromLocalStorage("accessToken")  + "&basicAuth=" +hash1+ "&requiredRoleId=3",
                    type: "POST",
                    dataType: "json",
                    contentType: "application/json",
                    success: function (status) {
                            saveInLocalStorage("accessToken", status.accessToken);
                        if (status.status == "OK") {
                            saveInLocalStorage("user", "true");
                            var userInfo = status.user.firstName + " " + status.user.lastName + " (Кола №" + status.user.carIN + ")";
                            saveInLocalStorage("userFirstName", status.user.firstName);
                            saveInLocalStorage("userLastName", status.user.lastName);
                            app.mobileApp.navigate('components/callTaxi/view.html');
                        } else if (status.status == "ROLE NOT MATCH"){
                            
                    $("#errorMessage").html(languagePack[currentLanguage].noAccountPermission);
                        }else if (status.status == "NO EMAIL"){
                    $("#errorMessage").html(languagePack[currentLanguage].notActivatedAccount);
                        }else if(status.status == "ERR"){
                    $("#errorMessage").html(languagePack[currentLanguage].noAccountFound);
                        }else{
                            init();
                        }
                    },
                    error: function () {
                        $("#messageBox").html("Error");
                        alert("error comunicating with serveer");
                    }
                });
                }
   

}

return { login: login}
})();

 function startWorker(){
   //localStorage.setItem("accessToken", "83744eae-a0b6-44cc-ac38-a0702d20a623");
    var w = new Worker("device_register.js");
             w.onmessage = function(event) {
           localStorage.setItem("accessToken", event.data);
                app["accessToken"] = event.data
                w.terminate();
                w = undefined;
             }
        };
// START_CUSTOM_CODE_homeModel
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_homeModel