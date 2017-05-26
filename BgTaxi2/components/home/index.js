'use strict';

app.home = kendo.observable({
    onShow: function () {
        if (localStorage.getItem("user") != undefined || app["user"] != undefined) {
            app.mobileApp.navigate('components/callTaxi/view.html');
        }
        if (localStorage.getItem("accessToken") == undefined) {
            startWorker();
        }
        document.getElementById("appDrawer").style.display = "none";

    },
    afterShow: function () { }
});

var account = (function () {
    function login() {
        while (getFromLocalStorage("accessToken") == undefined) {
            $("#errorMessage").html(languagePack[currentLanguage].pleaseWait);
        }
        if (getFromLocalStorage("accessToken") == "NONE") {
            $("#errorMessage").html(languagePack[currentLanguage].registerDeviceError);

        } else {
            var tok1 = document.getElementById("home-email").value + ':' + document.getElementById("home-password").value;
            var hash1 = btoa(tok1);
            $.ajax({
                url: "http://localhost:35486/Account/LoginExternal?accessToken=" + getFromLocalStorage("accessToken") + "&basicAuth=" + hash1 + "&requiredRoleId=3",
                type: "POST",
                dataType: "json",
                contentType: "application/json",
                
                    success: function (status) {
                    saveInLocalStorage("accessToken", status.accessToken);
                    document.getElementById("home-password").value = "";
                    if (status.status == "OK") {
                        saveInLocalStorage("user", "true");
                        saveInLocalStorage("userFirstName", status.user.firstName);
                        saveInLocalStorage("userLastName", status.user.lastName);
                        app.mobileApp.navigate('components/callTaxi/view.html');
                    } else if (status.status == "ERR") {

                        $("#errorMessage").html(languagePack[currentLanguage].alreadyTakenEmail);
                    }
                },
                error: function () {
                    $("#messageBox").html("Error");
                    alert("error comunicating with serveer");
                }
            });
        }


    }

    function signup() {
        while (getFromLocalStorage("accessToken") == undefined) {
            $("#errorMessage").html(languagePack[currentLanguage].pleaseWait);
        }
        if (getFromLocalStorage("accessToken") == "NONE") {
            $("#errorMessage").html(languagePack[currentLanguage].registerDeviceError);

        } else {
            var tok1 = document.getElementById("register-email").value + ':' + document.getElementById("register-password").value;
            var hash1 = btoa(tok1);
            var firstName = document.getElementById("register-first-name").value;
            var lastName = document.getElementById("register-last-name").value;
            var phoneNumber = document.getElementById("register-phone-number").value;
            $.ajax({
                url: "http://localhost:35486/Account/RegisterClientExternal?accessToken=" + getFromLocalStorage("accessToken") + "&basicAuth=" + hash1 + "&firstName=" + firstName + "&lastName=" + lastName + "&telephone=" + phoneNumber,
                type: "POST",
                dataType: "json",
                contentType: "application/json",
                success: function (status) {
                    saveInLocalStorage("accessToken", status.accessToken);
                    document.getElementById("register-password").value = "";
                    if (status.status == "OK") {
                        saveInLocalStorage("user", "true");
                        saveInLocalStorage("userFirstName", firstName);
                        saveInLocalStorage("userLastName", lastName);
                        app.mobileApp.navigate('components/callTaxi/view.html');
                    } else if (status.status == "ERR") {

                        $("#errorMessage").html(languagePack[currentLanguage].unexpectedError);
                    }
                },
                error: function () {
                    $("#messageBox").html("Error");
                    alert("error comunicating with serveer");
                }
            });
        }

    }
    return {
        login: login,
        signup: signup
    }
})();

var views = (function () {
    function signinView() {
        $("#signin-screen").css("display", "inline");
        $("#signup-screen").css("display", "none");
    }
    function signupView() {
        $("#signin-screen").css("display", "none");
        $("#signup-screen").css("display", "inline");
    }

    return {
        signinView: signinView,
        signupView: signupView
    }
})();

function startWorker() {
    //localStorage.setItem("accessToken", "83744eae-a0b6-44cc-ac38-a0702d20a623");
    var w = new Worker("device_register.js");
    w.onmessage = function (event) {
        localStorage.setItem("accessToken", event.data);
        app["accessToken"] = event.data
        w.terminate();
        w = undefined;
    }
};

 $(document).ajaxStart(function(){
        $(".button-group").css("display", "none");
        $("#loading").css("display", "inline");
    });
    $(document).ajaxComplete(function(){
         $(".button-group").css("display", "inline");
        $("#loading").css("display", "none");
    });
// START_CUSTOM_CODE_homeModel
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_homeModel