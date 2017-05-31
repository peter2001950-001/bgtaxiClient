'use strict';

app.callTaxi = kendo.observable({
                                    onShow: function () {
                                        
                                        $(".my-location-btn").css("bottom", document.getElementsByClassName("address-form")[0].offsetHeight + 10 + "px");
                                        setMap();
                                       setLocationInterval();
                                    },
                                    afterShow: function () {
                                    },
                                });

var currentLocationMarker;
var marker;
var resized = false;
var map;
var locationInterval;
var noGPS = true;

function setLocationInterval(){

    showError(languagePack[currentLanguage].searchingGPS);
    locationInterval = setInterval(function(){
        
        navigator.geolocation.getCurrentPosition(geoSuccess, geoError, {enableHighAccuracy: true, timeout: 15000 });
    }, 3000);
    
}

function geoSuccess(position) {
    if(noGPS){
        showError(languagePack[currentLanguage].foundGPS, "success");
        noGPS = false;
    }
    console.log(position);
    localStorage.setItem("geoLat", position.coords.latitude);
    localStorage.setItem("geoLng", position.coords.longitude);
   
    try{
        currentLocationMarker.setMap(null);
    }catch(e){
        
    }
    currentLocationMarker = new google.maps.Marker({
          position: {lat:  position.coords.latitude, lng: position.coords.longitude}, 
          map: map,
          icon: {url: "http://bgtaxi.net/blueDot1.png", scaledSize: new google.maps.Size(60, 60), anchor: new google.maps.Point(30, 30) },
        zIndex: 100
      });
        
    console.log(map);
        
    
}
function geoError() {
    if(!noGPS){
        
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
                           $("#startingAddressStreet").html(status.street_number);
                           $("#startingAddressNumber").val(status.street_address);
                       } 
                   },
                   error: function (erorr) {
                   }
               });
    }
}

function showError(message, type){
    switch(type){
        case "success":
        $(".error-message").css("background-color", "rgba(0,252,6,0.7)");
        $(".error-message").css("color", "black");
        $(".error-message").css("display", "block");
        setTimeout(function(){
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
        setTimeout(function(){
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

function startingAddressFocused(){
     if (!resized) {
        resized = true;
    }
    $('#startingAddressStreetInput').val($('#startingAddressStreet').html());
    $(".address-form").css("top", "0");
    $("#startingAddressNumber").css("display", "none");
    $("#starting-submit").css("display", "none");
    $(".places-div").css("display", "block");
    $("#map .centerMarker").css("z-index", "0");
}
function startingAddressFocusOut(){
   /* $('#startingAddressStreet').html($('#startingAddressStreetInput').val());
    $(".address-form").css("top", "");
    $("#startingAddressNumber").css("display", "block");
    $("#starting-submit").css("display", "block");
    $(".places-div").css("display", "none");
    $("#map .centerMarker").css("z-index", "1");
    
    
    $('#startingAddressStreetInput').val("");*/
}

function setMyLocation(){
    map.setCenter({lat: Number(getFromLocalStorage("geoLat")), lng: Number(getFromLocalStorage("geoLng"))});
}


// START_CUSTOM_CODE_callTaxi
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_callTaxi
