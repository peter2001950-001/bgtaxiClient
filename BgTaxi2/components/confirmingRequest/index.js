'use strict';

app.confirmingRequest = kendo.observable({
                                             onShow: function () {
                                                 $("#startingSecontaryText").css("display", "block");
                                                 $("#finishSecontaryText").css("display", "block");
                                                 confirmingRequest.writeAddresses();
                                             },
                                             afterShow: function () {
                                             },
                                         });

var confirmingRequest = (function() {
    var pullInterval;
    var purchaseMode = true;
    var firstTime = true;
    function writeAddresses() {
        console.log(startingAddress.address);
        if (startingAddress.getChosenAddress().secondaryText == "") {
            $("#startingMainText").css("margin", "4vh 0");
            $("#startingSecontaryText").css("display", "none");
        }
        if (finishAddress.getChosenAddress().secondaryText == "") {
            $("#finishMainText").css("margin", "4vh 0");
            $("#finishSecontaryText").css("display", "none");
        }
        $("#startingMainText").html(startingAddress.getChosenAddress().mainText);
        $("#startingSecontaryText").html(startingAddress.getChosenAddress().secondaryText);
        
        $("#finishMainText").html(finishAddress.getChosenAddress().mainText);
        $("#finishSecontaryText").html(finishAddress.getChosenAddress().secondaryText);
    }
    function sendRequest() {
        if (purchaseMode) {
            $("#purchaseBtn").removeClass("form-btn");
            $("#purchaseBtn").addClass("cancel-btn");
            $("#purchaseBtn").html("ОТКАЖИ");
          
            $.ajax({
                       url: "http://bgtaxi.net/request/SendRequest",
                       type: "POST",
                       dataType: "json",
                       contentType: "application/json",
                       data: JSON.stringify({
                                                "accessToken": getFromLocalStorage("accessToken"),
                                                "startingAddressMainText": startingAddress.getChosenAddress().mainText,
                                                "startingAddressSecondaryText": startingAddress.getChosenAddress().secondaryText,
                                                "startingAddressLocationLat": startingAddress.getChosenAddress().location.lat,
                                                "startingAddressLocationLng": startingAddress.getChosenAddress().location.lng,
                                                "finishAddressMainText": finishAddress.getChosenAddress().mainText,
                                                "finishAddressSecondaryText": finishAddress.getChosenAddress().secondaryText,
                                                "finishAddressLocationLat": finishAddress.getChosenAddress().location.lat,
                                                "finishAddressLocationLng": finishAddress.getChosenAddress().location.lng
                            
                                            }),
                       success: function (status) {
                           saveInLocalStorage("accessToken", status.accessToken);
                           if (status.status == "OK") {
                               $("#SendRequestLoading").css("display", "block");
                                $("#loader").css("display", "block");
                               purchaseMode = false;
                              
                               startPull();
                           }else {
                               $("#purchaseBtn").addClass("form-btn");
                               $("#purchaseBtn").removeClass("cancel-btn");
                               $("#purchaseBtn").html("ПОРЪЧАЙ");
                           }
                       },
                       error: function (erorr) {
                           $("#purchaseBtn").addClass("form-btn");
                           $("#purchaseBtn").removeClass("cancel-btn");
                           $("#purchaseBtn").html("ПОРЪЧАЙ");
                       }
                   });
        }else {
            $("#purchaseBtn").addClass("form-btn");
            $("#purchaseBtn").removeClass("cancel-btn");
            $("#purchaseBtn").html("ПОРЪЧАЙ");
            $("#SendRequestLoading").css("display", "none");
            $.ajax({
                       url: "http://bgtaxi.net/request/cancelRequest",
                       type: "POST",
                       dataType: "json",
                       contentType: "application/json",
                       data: JSON.stringify({
                                                "accessToken": getFromLocalStorage("accessToken"),
                            
                            
                                            }),
                       success: function (status) {
                           saveInLocalStorage("accessToken", status.accessToken);
                           if (status.status == "OK") {
                               
                               $("#purchaseBtn").prop("disable", false);
                               purchaseMode = true;
                               stopPull();
                           }else {
                               $("#purchaseBtn").removeClass("form-btn");
                               $("#purchaseBtn").addClass("cancel-btn");
                               $("#purchaseBtn").html("ОТКАЖИ");
                           $("#SendRequestLoading").css("display", "block");
                           }
                       },
                       error: function (erorr) {
                           $("#purchaseBtn").removeClass("form-btn");
                           $("#purchaseBtn").addClass("cancel-btn");
                           $("#purchaseBtn").html("ОТКАЖИ");
                           $("#SendRequestLoading").css("display", "block");
                       }
                   });
        }
    }
    function startPull() {
        pullInterval = setInterval(pull, 1800);
    }
    function pull() {
        ;
        $.ajax({
                   url: "http://bgtaxi.net/request/clientPull",
                   type: "POST",
                   dataType: "json",
                   contentType: "application/json",
                   data: JSON.stringify({
                                            "accessToken": getFromLocalStorage("accessToken"),
                            
                                        }),
                   success: function (status) {
                       saveInLocalStorage("accessToken", status.accessToken);
                       console.log(status);
                       if (status.status == "OK") {
                           switch (status.code) {
                               case 0:
                                   $("#loadingText").html("Намерена е кола! Моля, изчакайте за отговор ...");
                                   $("#loader").css("display", "none");
                                   $("#purchaseBtn").prop("disable", true);
                                   break;
                               case 1:
                                   if(firstTime){
                                       app.mobileApp.navigate("components/taxiMap/view.html");
                                       firstTime = false;
                                       taxiMap.setDurationValue(status.duration);
                                       console.log(status.duration);
                                       taxiMap.carNo = status.carNo;
                                   }
                                   taxiMap.setCarMarker({lat: status.carLat, lng: status.carLng});
                                   break;
                               case 2:
                                   $("#loadingText").html("Не е намерена кола в района.");
                                   $("#loader").css("display", "none");
                                   $("#purchaseBtn").prop("disable", false);
                                   $("purchaseBtn").removeClass("form-btn");
                                   $("purchaseBtn").addClass("cancel-btn");
                                   $("purchaseBtn").html("ПОВТОРЕН ОПИТ");
                                   purchaseMode = true;
                                   stopPull();
                                   break;
                               case 3:
                                   $("#loadingText").html("Търсене на подходяща кола. Моля, изчакайте ...");
                                   $("#purchaseBtn").prop("disable", false);
                                   break;
                               case 4:
                                 
                                   break;
                               case 5:
                                   stopPull();
                                   $("#loader").css("display", "none");
                                   $("#purchaseBtn").addClass("form-btn");
                                   $("#purchaseBtn").removeClass("cancel-btn");
                                   $("#purchaseBtn").html("ПОРЪЧАЙ");
                                   break;
                           }
                       }
                   },
                   error: function (erorr) {
                       $("#messageBox").html("Error");
                       alert("error: " + erorr);
                   },
                    global: false
               });
    }
    function stopPull() {
        clearInterval(pullInterval);
    }
    function startingItemClicked() {
        startingAddress.gotoView("confirmingRequest");
        app.mobileApp.navigate('components/callTaxi/view.html');
    }
    
    return {
        writeAddresses: writeAddresses,
        startingItemClicked: startingItemClicked,
        sendRequest: sendRequest,
        startPull: startPull
    }
})()