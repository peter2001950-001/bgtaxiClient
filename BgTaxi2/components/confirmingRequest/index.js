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
    var case2 = false;
    function writeAddresses() {
      
        
        if (localStorage.getItem("startingAddressSecondaryText") == "") {
            $("#startingMainText").css("margin", "4vh 0");
            $("#startingSecontaryText").css("display", "none");
        }
        if (localStorage.getItem("finishAddressSecondaryText") == "") {
            $("#finishMainText").css("margin", "4vh 0");
            $("#finishSecontaryText").css("display", "none");
        }
        $("#startingMainText").html(localStorage.getItem("startingAddressMainText"));
        $("#startingSecontaryText").html(localStorage.getItem("startingAddressSecondaryText"));
        
        $("#finishMainText").html(localStorage.getItem("finishAddressMainText"));
        $("#finishSecontaryText").html(localStorage.getItem("finishAddressSecondaryText"));
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
                                                "startingAddressMainText": localStorage.getItem("startingAddressMainText"),
                                                "startingAddressSecondaryText": localStorage.getItem("startingAddressSecondaryText"),
                                                "startingAddressLocationLat": localStorage.getItem("startingAddressLat"),
                                                "startingAddressLocationLng":localStorage.getItem("startingAddressLng"),
                                                "finishAddressMainText": localStorage.getItem("finishAddressMainText"),
                                                "finishAddressSecondaryText": localStorage.getItem("finishAddressSecondaryText"),
                                                "finishAddressLocationLat": localStorage.getItem("finishAddressLat"),
                                                "finishAddressLocationLng":localStorage.getItem("finishAddressLng")
                            
                                            }),
                       success: function (status) {
                           saveInLocalStorage("accessToken", status.accessToken);
                           if (status.status == "OK") {
                               $("#SendRequestLoading").css("display", "block");
                                $("#loader").css("display", "block");
                               purchaseMode = false;
                                  localStorage.setItem("activeRequest", true);
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
                                 
                                   $("#purchaseBtn").prop("disable", true);
                                   break;
                               case 1:
                               app.mobileApp.navigate("components/taxiMap/view.html");
                                   if(firstTime){
                                       
                                       firstTime = false;
                                       console.log(status.duration);
                                       taxiMap.carNo = status.carNo;
                                   } 
                               taxiMap.setDurationValue(status.duration);
                                   taxiMap.setCarMarker({lat: status.carLat, lng: status.carLng});
                                   break;
                               case 2:
                               
                                   $("#loadingText").html("Не е намерена кола в района.");
                                   $("#loader").css("display", "none");
                                   $("#purchaseBtn").prop("disable", false);
                                   $("purchaseBtn").removeClass("form-btn");
                                   $("purchaseBtn").addClass("cancel-btn");
                                   $("purchaseBtn").html("ПОВТОРЕН ОПИТ");
                               case2 = true;
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
                                   localStorage.setItem("activeRequest", false);
                                   if(!case2){
                                       app.mobileApp.navigate("components/callTaxi/view.html");
                                   }
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