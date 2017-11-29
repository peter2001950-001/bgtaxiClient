'use strict';

app.taxiMap = kendo.observable({
                                   onShow: function () {
                                      taxiMap.setMap();
                                       $("#carNoText").val(taxiMap.carNo);
                                       taxiMap.setCountDown();
                                       taxiMap.setLocationInterval();
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
    var map;
    var bounds;
      var requestMarker
    var first = true;
    
    function setLocationInterval() {
        locationInterval = navigator.geolocation.watchPosition(geoSuccess, geoError, {enableHighAccuracy: true });
    }
    function clearLocationInterval() {
        navigator.geolocation.clearWatch(locationInterval);   
    }
    function setCountDown(){
        console.log(durationValue);
        var stopwatch = setInterval(function(){
            durationValue--;
            console.log(durationValue);
            console.log(minutes);
              minutes = Math.round(durationValue/60);
            if(minutes==1){
                $("#durationText").val(minutes + " минута");
            }else if(minutes> 1){
                 $("#durationText").val(minutes + " минути");
            }else{
                 $("#durationText").val("след по-малко от минута");
            }
        }, 1000);
    }
    function geoSuccess(position) {
       
        localStorage.setItem("geoLat", position.coords.latitude);
        localStorage.setItem("geoLng", position.coords.longitude);
   
        try {
            currentLocationMarker.setMap(null);
        }catch (e) {
        }
        if(map!=undefined){
        currentLocationMarker = new google.maps.Marker({
                                                           position: {lat:  position.coords.latitude, lng: position.coords.longitude}, 
                                                           map: map,
                                                           icon: {url: "http://bgtaxi.net/blueDot1.png", scaledSize: new google.maps.Size(60, 60), anchor: new google.maps.Point(30, 30) },
                                                           zIndex: 0
                                                       });
            }else{
                  console.log("Map undefined 2");
            }
        
        if (!geoSuccessAtTheBeginning) {
            geoSuccessAtTheBeginning = true;
            setMyLocation();
            console.log("set location");
        }
    }
    function setCarMarker(carLocation){
        console.log(carLocation);
        try{
            carMarker.setMap(null);
            bounds = new google.maps.LatLngBounds();
        }catch(e){}
        
            if(map!=undefined){  
            carMarker = new google.maps.Marker({
                                                           position: {lat:  carLocation.lat, lng: carLocation.lng}, 
                                                           map: map,
                                                           icon: {url: "/images/carIcon.png", scaledSize: new google.maps.Size(45, 60), anchor: new google.maps.Point(60, 45) },
                                                           zIndex: 0
                                                       });
                if(first){
                     bounds.extend(carMarker.getPosition());
                bounds.extend(requestMarker.getPosition());
                map.fitBounds(bounds);
                    first  = false;
                }
              
                }else{
                    console.log("Map undefined 1");
                }
        
    }
    function geoError() {
        i
            showError(languagePack[currentLanguage].noGPS, "error");
            currentLocationMarker.setMap(null);
        
    }
    function setMap() {
        var requestLocation = {lat:  Number(localStorage.getItem("startingAddressLat")), lng:  Number(localStorage.getItem("startingAddressLng"))}
         
            map = new google.maps.Map(document.getElementById('map1'), {
                                          zoom: 16,
                                          center: requestLocation,
                                          fullscreenControl: false,
                                          mapTypeControl: false
                                      });  
           console.log("map Initialised - ");
        console.log(map);
            requestMarker = new google.maps.Marker({
                                                           position: {lat:  requestLocation.lat, lng: requestLocation.lng}, 
                                                           map: map,
                                                           icon: {url: "/images/personIcon.png", scaledSize: new google.maps.Size(45, 60), anchor: new google.maps.Point(30, 30) },
                                                           zIndex: 0
                                                       });
         
            bounds =  new google.maps.LatLngBounds();
       
          
    }
    function onAddress(){
        $("#taxiMap-firstText").html("ВАШИЯТ АВТОМОБИЛ Е НА АДРЕСА:");
        $("#durationText").value(startingAddress.lastStreetAddress);
        
    }
    function setMyLocation() {
        map.setCenter({lat: Number(getFromLocalStorage("geoLat")), lng: Number(getFromLocalStorage("geoLng"))});
    }
    function setDurationValue(value){
        durationValue = Number(value);
    }
    
    return {
        setLocationInterval: setLocationInterval,
        setMyLocation: setMyLocation,
        carNo: carNo,
        setCountDown: setCountDown, 
        onAddress: onAddress,
        setCarMarker: setCarMarker,
        setMap: setMap,
        setDurationValue: setDurationValue
    }
})();