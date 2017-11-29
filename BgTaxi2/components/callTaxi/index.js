'use strict';

app.callTaxi = kendo.observable({
                                    onShow: function () {
                                        document.addEventListener("backbutton", backFunction); 
                                        $(".my-location-btn").css("bottom", document.getElementsByClassName("address-form")[0].offsetHeight + 10 + "px");
                                        startingAddress.setMap();
                                        startingAddress.setLocationInterval();
                                        loaded();
                                        staringAddressView = true;
                                       
                                    },
                                    afterShow: function () {
                                    },
                                });


var myScroll;
var isInSearchingMode = false;
var geoSuccessAtTheBeginning = false;
var gotoViewName = "finishAddress";
var backFunction = function() {
    if(isInSearchingMode){
        startingAddressFocusOut();
    }
}
function loaded() {
    if($("#wrapper").length == 0){
        $("#wrapper1").attr("id", "wrapper");
    }
    try {
        myScroll.destroy();
    }catch (e) {
    }
    myScroll = new iScroll('wrapper', {hScrollbar: false, hideScrollbar: false});
    console.log("loaded");
}

document.addEventListener('touchmove', function (e) {
    e.preventDefault();
}, false);

document.addEventListener('DOMContentLoaded', loaded, false);

var startingAddress = (function() {
    var currentLocationMarker;
    var marker;
    var resized = false;
    var map;
    var locationInterval;
    var noGPS = true;
    var searchBtnIsClicked = false;
    var lastStreetAddress= "";
    var lastStreetNumber = "";
    var isStreetNumberShown = false;
    var address;
    var placeLocation; 
    
    function setLocationInterval() {
        
        showError(languagePack[currentLanguage].searchingGPS);
        locationInterval = navigator.geolocation.watchPosition(geoSuccess, geoError, {enableHighAccuracy: true });
    }
    function clearLocationInterval(){
        navigator.geolocation.clearWatch(locationInterval);
    }

    function geoSuccess(position) {
        console.log("starting");
        if (noGPS) {
            showError(languagePack[currentLanguage].foundGPS, "success");
            noGPS = false;
        }
        console.log(position);
        localStorage.setItem("geoLat", position.coords.latitude);
        localStorage.setItem("geoLng", position.coords.longitude);
   
        try {
            currentLocationMarker.setMap(null);
        }catch (e) {
        }
        currentLocationMarker = new google.maps.Marker({
                                                           position: {lat:  position.coords.latitude, lng: position.coords.longitude}, 
                                                           map: map,
                                                           icon: {url: "http://bgtaxi.net/blueDot1.png", scaledSize: new google.maps.Size(60, 60), anchor: new google.maps.Point(30, 30) },
                                                           zIndex: 0
                                                       });
        
        if(!geoSuccessAtTheBeginning){
            geoSuccessAtTheBeginning = true;
           setMyLocation();
            console.log("set location");
        }
    }
    function geoError() {
        if (!noGPS) {
            showError(languagePack[currentLanguage].noGPS, "error");
            noGPS = true;
            currentLocationMarker.setMap(null);
        }
    }
    function setMap() {
        var uluru ;
        if (getFromLocalStorage("geoLat") != undefined) {
            var lat = getFromLocalStorage("geoLat");
            var lng = getFromLocalStorage("geoLng");
        
            getAddress(lat, lng);
            uluru = {lat: Number(lat) , lng: Number(lng)};
            console.log(uluru);
            map = new google.maps.Map(document.getElementById('map'), {
                                          zoom: 17,
                                          center: uluru,
                                          fullscreenControl: false,
                                          mapTypeControl: false
                                      });  
    
            $('<div/>').addClass('centerMarker').appendTo(map.getDiv());
    
            google.maps.event.addListener(map, "dragstart", function() {
                $("#startingAddressStreet").blur();
                $("#startingAddressNumber").blur();
                
                $(".address-form").slideUp(200);
                $(".my-location-btn").fadeOut(200);
                $(".centerMarker").css("display", "block");
                resized = false;
                marker.setMap(null);
            });
            google.maps.event.addListener(map, "zoom_changed", function() {
                marker.setMap(null);
                if (!resized) {
                    $(".centerMarker").css("display", "block");
                }
                resized = false;
            });
            google.maps.event.addListener(map, "center_changed", function() {
                if (!resized) {
                    try {
                        marker.setMap(null);
                    }catch (e) {
                    }
                    $("#startingAddressStreet").blur();
                    $("#startingAddressNumber").blur();
                    localStorage.setItem("mapLat", map.getCenter().lat());
                    localStorage.setItem("mapLng", map.getCenter().lng());
            
                    marker = new google.maps.Marker({
                                                        position: {lat:  map.getCenter().lat(), lng: map.getCenter().lng()}, 
                                                        map: map,
                                                        zIndex: 99,
                                                        icon: "http://maps.gstatic.com/mapfiles/markers2/marker.png"
                                                    });
                    $(".centerMarker").css("display", "none");
                    
                    $(".address-form").slideDown(200);
                    $(".my-location-btn").fadeIn(200);
                    getAddress(map.getCenter().lat(), map.getCenter().lng());
                }
            });
        }else {
            navigator.geolocation.getCurrentPosition(geoSuccess, geoError, {enableHighAccuracy: true, timeout: 30000 });
        }
    
        function getAddress(lat, lng) {
            $.ajax({
                       url: "http://bgtaxi.net/request/GetAddress?accessToken=" + getFromLocalStorage("accessToken") + "&lat=" + lat + "&lng=" + lng,
                       type: "POST",
                       dataType: "json",
                       contentType: "application/json",
                       success: function (status) {
                           saveInLocalStorage("accessToken", status.accessToken);
                   
                           if (status.status == "OK") {
                               $("#startingAddressStreet").val(status.street_number + " " + status.street_address);
                               lastStreetAddress = status.street_number + " " + status.street_address;
                                placeLocation = {lat: lat, lng: lng}
                               lastStreetNumber = "";
                               isStreetNumberShown = false;
                               $("#startingAddressNumber").css("display", "none");
                               $("#startingAddressNumber").attr("disabled", false);
                           }else if(status.status =="INVALID ACCESSTOKEN"){
                               localStorage.removeItem("accessToken");
                               localStorage.removeItem("userFirstName");
                               
                               localStorage.removeItem("user");
                               localStorage.removeItem("userLastName");
                               app.mobileApp.navigate('components/home/view.html');
                           } 
                       },
                       error: function (erorr) {
                       }
                   });
        }
    }

    function showError(message, type) {
        switch (type) {
            case "success":
                $(".error-message").css("background-color", "rgba(0,252,6,0.7)");
                $(".error-message").css("color", "black");
                $(".error-message").css("display", "block");
                setTimeout(function() {
                    $(".error-message").css("display", "none");
                }, 5000);
                break;
            case "error":
                $(".error-message").css("background-color", "rgba(255,0,12,0.7)");
                $(".error-message").css("color", "white");
                $(".error-message").css("display", "block");
                break;
            case "warning":
                $(".error-message").css("background-color", "rgba(252,225,0,0.7)");
                $(".error-message").css("color", "black");
                $(".error-message").css("display", "block");
                setTimeout(function() {
                    $(".error-message").css("display", "none");
                }, 5000);
                break;
            default: 
                $(".error-message").css("background-color", "rgba(91,91,91,0.7)");
                $(".error-message").css("color", "white");
                $(".error-message").css("display", "block");
        }
        $(".error-message").html(message);
    }

    function startingAddressFocused() {
        if (!resized) {
            resized = true;
        }
        if(isStreetNumberShown){
            lastStreetNumber = $("#startingAddressNumber").val();
        }
        isInSearchingMode = true
        searchBtnIsClicked = true;
         $(".search-submit-btn").css("display", "block");
        $("#startingAddressStreet").css("width", "80%");
         $(".nav_backBtn").css("display","block");
          $(".nav_searchBtn").css("display","none");
        $("#nav-app-drawer").css("display", "none");
        $("#starting-title").html("ТЪРСЕНЕ");
        $("#starting-subtitle").css("display", "none");
        $('#startingAddressStreet').css("text-align", "left");
        $(".address-form").css("top", "0");
        $("#startingAddressNumber").css("display", "none");
        $("#starting-submit").css("display", "none");
        $(".places-div").css("display", "block");
        $("#map .centerMarker").css("z-index", "0");
    }
    function startingAddressFocusOut() {
            isInSearchingMode=false;
        $(".search-submit-btn").css("display", "none");
        $("#startingAddressStreet").css("width", "100%");

         $(".nav_searchBtn").css("display","block");
         $(".nav_backBtn").css("display","none");
        $("#nav-app-drawer").css("display", "inline");
        $("#starting-title").html("НАЧАЛЕН АДРЕС");
        $("#starting-subtitle").css("display", "block");
        searchBtnIsClicked = false;
        $(".address-form").css("top", "");
        $("#startingAddressStreet").val(lastStreetAddress)
        $("#startingAddressNumber").val(lastStreetNumber)
        $('#startingAddressStreet').css("text-align", "center");
        $("#starting-submit").css("display", "block");
        $(".places-div").css("display", "none");
        $("#map .centerMarker").css("z-index", "1");
        if(isStreetNumberShown){
            $("#startingAddressNumber").css("display", "block");
            $("#startingAddressNumber").val(lastStreetNumber);
        }
        $('#startingAddressStreet').blur();
    }

    function setMyLocation() {
        resized = false;
        map.setCenter({lat: Number(getFromLocalStorage("geoLat")), lng: Number(getFromLocalStorage("geoLng"))});
    }

    function ShowSearchResults(places) {
        $('#startingAddressStreet').blur();
        $("#starting-address-places-list").empty();
        for (var i in places) {
            $("#starting-address-places-list").append("<li " + (i % 2 == 0? "" : "class='odd' ") + "onclick='startingAddress.liClicked(" + i + ")'><span class='places-main-text'>" + places[i].MainText + "</span><span class='places-secondary-text'>" + places[i].Address + "</span><span hidden>" + places[i].PlaceId + "</span><span hidden>" + places[i].Type + "</span><span hidden>" + places[i].Location.Latitude + "</span><span hidden>" + places[i].Location.Longitude + "</span></li>");
        }
        loaded();
    }

    function startingAddressKeyPressed(event) {
        var code = event.keyCode || event.which;
        console.log("keypressed");
        if (code == 13) {
            SearchPlace();
        }        
    };
    function startingAddressNumberKeyPressed(event) {
        var code = event.keyCode || event.which;
        console.log("keypressed");
        if (code == 13) {
            $('#startingAddressNumber').blur();
        }        
    };

    function SearchPlace() {
        var lat = getFromLocalStorage("geoLat");
        var lng = getFromLocalStorage("geoLng");
        var typesString = "";
        if ($('input#streets-checkbox').is(':checked')) {
            typesString+= "address|";
        }
        if ($('input#restaurants-checkbox').is(':checked')) {
            typesString+= "restaurant|bar|";
        }
        if ($('input#shops-checkbox').is(':checked')) {
            typesString+= "store|pharmacy|bakery|";
        }
        if ($('input#hotels-checkbox').is(':checked')) {
            typesString+= "lodging|establishment|";
        }
        var query = $("#startingAddressStreet").val();
        $.ajax({
                   url: "http://bgtaxi.net/request/AutoSuggest?accessToken=" + getFromLocalStorage("accessToken") + "&lat=" + lat + "&lng=" + lng + "&types=" + typesString + "&query=" + query,
                   type: "POST",
                   dataType: "json",
                   contentType: "application/json",
                   success: function (status) {
                       saveInLocalStorage("accessToken", status.accessToken);
                   
                       if (status.status == "OK") {
                           ShowSearchResults(status.places);
                       } else if(status.status =="INVALID ACCESSTOKEN"){
                               localStorage.removeItem("accessToken");
                               localStorage.removeItem("userFirstName");
                               
                               localStorage.removeItem("user");
                               localStorage.removeItem("userLastName");
                               app.mobileApp.navigate('components/home/view.html');
                           } 
                   },
                   error: function (erorr) {
                   }
               });
    }
    
    function liClicked(item) {
        var element = document.getElementById("starting-address-places-list").childNodes[item];
        $("#startingAddressStreet").val(element.childNodes[0].innerHTML);
        if (element.childNodes[3].innerHTML == "street_address") {
            $("#startingAddressNumber").css("display", "none");
            map.setCenter({lat: Number(element.childNodes[4].innerHTML), lng: Number(element.childNodes[5].innerHTML)});
            placeLocation = {lat: Number(element.childNodes[4].innerHTML), lng: Number(element.childNodes[5].innerHTML)}
            isStreetNumberShown= true;  lastStreetNumber = "";
        } else if (element.childNodes[3].innerHTML == "route") {
            $("#startingAddressNumber").val("");
            $("#startingAddressNumber").css("display", "block");
            $("#startingAddressNumber").attr("disabled", false);
            $("#startingAddressNumber").focus();
           lastStreetNumber = "";
            isStreetNumberShown = true;
            console.log("2");
        }else {
            $("#startingAddressNumber").css("display", "block");
            $("#startingAddressNumber").attr("disabled", true);
            $("#startingAddressNumber").val(element.childNodes[1].innerHTML);
            lastStreetNumber = element.childNodes[1].innerHTML;
            isStreetNumberShown = false;
            map.setCenter({lat: Number(element.childNodes[4].innerHTML), lng: Number(element.childNodes[5].innerHTML)});
            placeLocation = {lat: Number(element.childNodes[4].innerHTML), lng: Number(element.childNodes[5].innerHTML)}
            console.log("3");
        }
        lastStreetAddress=element.childNodes[0].innerHTML;
        
        startingAddressFocusOut();
    }
    
   
    
    
    function submit(){
         $("#wrapper").attr("id", "wrapper1");
        app.mobileApp.navigate('components/'+ gotoViewName+'/view.html');
        clearLocationInterval();
        console.log(address);
        localStorage.setItem("startingAddressLat", placeLocation.lat);
        localStorage.setItem("startingAddressLng", placeLocation.lng);
    }
    function getChosenAddress(){
        return {
            mainText: $("#startingAddressStreet").val(),
            secondaryText: $("#startingAddressNumber").val(),
            location: placeLocation
        };
    }
    function gotoView(view){
        gotoViewName = view;
    }
    
    return {
        setLocationInterval: setLocationInterval,
        setMap: setMap,
        startingAddressFocused: startingAddressFocused,
        startingAddressFocusOut: startingAddressFocusOut,
        setMyLocation: setMyLocation,
        startingAddressKeyPressed: startingAddressKeyPressed,
        startingAddressNumberKeyPressed: startingAddressNumberKeyPressed,
        SearchPlace: SearchPlace,
        liClicked: liClicked,
        submit: submit,
        searchBtnClicked: searchBtnClicked,
        getChosenAddress: getChosenAddress,
        gotoView: gotoView
        }
    
    })();
    // START_CUSTOM_CODE_callTaxi
    // Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes
    // END_CUSTOM_CODE_callTaxi
