'use strict';

app.callTaxi = kendo.observable({
                                    onShow: function () {
                                        navigator.geolocation.getCurrentPosition(geoSuccess, geoError, {enableHighAccuracy: true, timeout: 30000 });
                                    },
                                    afterShow: function () {
                                    },
                                });

var marker;
var resized = false;

function geoSuccess(position) {
    localStorage.setItem("geoLat", position.coords.latitude);
    localStorage.setItem("geoLng", position.coords.longitude);
    setMap();
}
function geoError() {
    console.log("Unable to find location service");
}
function setMap() {
    var uluru ;
    if (getFromLocalStorage("geoLat") != undefined) {
        var lat = getFromLocalStorage("geoLat");
        var lng = getFromLocalStorage("geoLng");
        
        getAddress(lat, lng);
        uluru = {lat: Number(lat) , lng: Number(lng)};
        console.log(uluru);
        var map = new google.maps.Map(document.getElementById('map'), {
                                          zoom: 17,
                                          center: uluru
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
                try{
                     marker.setMap(null);
                }catch(e){
                    
                }
                $("#startingAddressStreet").blur();
                $("#startingAddressNumber").blur();
                localStorage.setItem("mapLat", map.getCenter().lat());
                localStorage.setItem("mapLng", map.getCenter().lng());
            
                marker = new google.maps.Marker({
                                                    position: {lat:  map.getCenter().lat(), lng: map.getCenter().lng()}, 
                                                    map: map,
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
                           $("#startingAddressStreet").val(status.address);
                       } 
                   },
                   error: function (erorr) {
                   }
               });
    }
}

function onFocus() {
    if (!resized) {
        resized = true;/*
        var lat = getFromLocalStorage("geoLat");
        var lng = getFromLocalStorage("geoLng");
        var center = new google.maps.LatLng(Number(lat), Number(lng));
        // using global variable:
        map.panTo(center);*/
    }
}
$(document).click(function(e) {

  // check that your clicked
  // element has no id=info

  if( e.target.id != 'startingAddressStreet' && e.target.id != "startingAddressNumber") {
      console.log(e.target);
    $("#startingAddressStreet").blur();
            $("#startingAddressNumber").blur();
            $(".centerMarker").css("display", "block");
            resized = false;
            marker.setMap(null);
  }
});
// START_CUSTOM_CODE_callTaxi
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_callTaxi
