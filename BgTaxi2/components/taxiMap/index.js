'use strict';

app.taxiMap = kendo.observable({
                                   onShow: function () {
                                       $("#startingSecontaryText").css("display", "block");
                                       $("#finishSecontaryText").css("display", "block");
                                       confirmingRequest.writeAddresses();
                                       $("#carNoText").value(taxiMap.carNo);
                                       taxiMap.setCountDown();
                                   },
                                   afterShow: function () {
                                   },
                               });

var taxiMap = (function() {
    var locationInterval;
    var currentLocationMarker;
    var carMarker;
    var carNo; 
    var durationValue;
    var minutes = 0;
    var stopwatch;
    var seconds = 0;
    
    
    function setLocationInterval() {
        locationInterval = navigator.geolocation.watchPosition(geoSuccess, geoError, {enableHighAccuracy: true });
    }
    function clearLocationInterval() {
        navigator.geolocation.clearWatch(locationInterval);   
    }
    function setCountDown(){
        var stopwatch = setInterval(function(){
            durationValue--;
               if(durationValue%60 >30){
                  minutes =  durationValue/60 + 1;
               }else{
                   minutes = durationValue/60
               }
            if(minutes==1){
                $("#durationText").value(minutes + " минута");
            }else if(minutes> 1){
                 $("#durationText").value(minutes + " минути");
            }else{
                 $("#durationText").value("след по-малко от минута");
            }
        }, 1000);
    }
    function geoSuccess(position) {
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
        
        if (!geoSuccessAtTheBeginning) {
            geoSuccessAtTheBeginning = true;
            setMyLocation();
            console.log("set location");
        }
    }
    function setCarMarker(carLocation){
        try{
            carMarker.setMap(null);
        }catch(e){
              carMarker = new google.maps.Marker({
                                                           position: {lat:  carLocation.lat, lng: carLocation.lng}, 
                                                           map: map,
                                                           icon: {url: "/images/carIcon.png", scaledSize: new google.maps.Size(60, 60), anchor: new google.maps.Point(30, 30) },
                                                           zIndex: 0
                                                       });
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
                                          zoom: 16,
                                          center: uluru,
                                          fullscreenControl: false,
                                          mapTypeControl: false
                                      });  
            var requestLocation = {lat: startingAddress.placeLocation.lat, lng: startingAddress.placeLocation.lng}
            var requestMarker = new google.maps.Marker({
                                                           position: {lat:  requestLocation.lat, lng: requestLocation.lng}, 
                                                           map: map,
                                                           icon: {url: "/images/personIcon.png", scaledSize: new google.maps.Size(60, 60), anchor: new google.maps.Point(30, 30) },
                                                           zIndex: 0
                                                       });
            }
    
          
    }
    function onAddress(){
        $("#taxiMap-firstText").html("ВАШИЯТ АВТОМОБИЛ Е НА АДРЕСА:");
        $("#durationText").value(startingAddress.lastStreetAddress);
        
    }
    function setMyLocation() {
        map.setCenter({lat: Number(getFromLocalStorage("geoLat")), lng: Number(getFromLocalStorage("geoLng"))});
    }
    
    return {
        setLocationInterval: setLocationInterval,
        carLocation: carLocation,
        setMyLocation: setMyLocation,
        carNo: carNo,
        duration: durationValue,
        setCountDown: setCountDown, 
        onAddress: onAddress,
        setCarMarker: setCarMarker
    }
})();