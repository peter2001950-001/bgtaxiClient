'use strict';

app.callTaxi = kendo.observable({
    onShow: function () {
       
    },
    afterShow: function () { },
    
    });


function clicked() {
    document.getElementById("callTBtn").classList.add("disabled");
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
        $.ajax({
            url: "http://peter200195-001-site1.btempurl.com/request/createNewRequest?lon=" + positionCou.longitude + "&lat=" + positionCou.latitude + "&basicAuth=" + hash,
            type: "POST",
            dataType: "json",
            contentType: "application/json",
            success: function (status) {
                alert(status.status);
                if (status.status == "OK") {
                    var requestId = status.requestId;
                    alertMessage("Заявката беше изпратена успешно! Моля, изчайте нейното приемане", "Изпратена", "warning");
                    var timer = setInterval(function () {
                        $.ajax({
                            url: "http://peter200195-001-site1.btempurl.com/request/requestStatus?requestID=" + requestId + "&basicAuth=" + hash,
                            type: "POST",
                            dataType: "json",
                            contentType: "application/json",
                            success: function (status) {
                                if (status.status == "TAKEN") {
                                    clearInterval(timer);
                                    alertMessage("Заявката беше приета успешно!", "Приета", "success");
                                }
                            },
                            error: function () {
                                alertMessage("Възникна грешка!", "Грешка", "danger");
                            }
                        });
                    }, 10000);
                }
            },
            error: function () {
                $("#messageBox").html("Error");
                alert("error");
            }

        });

    }

    function geoError() {
        alert("error");
        console.log(arguments);
    }
}

function alertMessage(message, strong, typeOf) {
    var element = document.getElementById("messageBox");
    element.className = "alert alert-" + typeOf;
    element.innerHTML = "<strong>" + strong + "</strong> " + message;
}

// START_CUSTOM_CODE_callTaxi
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_callTaxi
