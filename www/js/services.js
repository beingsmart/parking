angular.module('app.services', [])

  .factory('Markers', function ($http) {

    var markers = [];

    return {
      getMarkers: function (lat, lng) {

        return $http.get("http://parkingserver-openbigdata.rhcloud.com" +
            "/v1/space/near/lat/" + lat + "/lng/" + lng)
          .then(function (response) {
            markers = response;
            return markers;
          });

      }
    }
  })
  .factory('GoogleMaps', function ($cordovaGeolocation, Markers) {

    var apiKey = false;
    var map = null;

    function initMap() {

      var options = {timeout: 10000, enableHighAccuracy: true};

      $cordovaGeolocation.getCurrentPosition(options).then(function (position) {

        var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        var mapOptions = {
          center: latLng,
          zoom: 15,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        map = new google.maps.Map(document.getElementById("map"), mapOptions);
        //Wait until the map is loaded
        google.maps.event.addListenerOnce(map, 'idle', function () {
          addMarkerToMap(latLng, "you");
          //Load the markers
          loadMarkers(position.coords.latitude, position.coords.longitude);

        });

      }, function (error) {
        alert("Could not get location: " + error);
      });

    }

    function addMarkerToMap(markerPos, name) {
      var marker = new google.maps.Marker({
        map: map,
        animation: google.maps.Animation.DROP,
        position: markerPos
      });

      var infoWindowContent = "<h4>" + name + "</h4>";

      addInfoWindow(marker, infoWindowContent);
      //return {marker:marker, infoWindowContent:infoWindowContent};
    }

    function loadMarkers(lat, lng) {

      //Get all of the markers from our Markers factory
      Markers.getMarkers(lat, lng).then(function (markers) {

        console.log("Markers: ", markers);

        var records = markers.data;

        for (var i = 0; i < records.length; i++) {

          var record = records[i];
          var markerPos = new google.maps.LatLng(record.lat, record.lng);

          // Add the markerto the map
          addMarkerToMap(markerPos, record.name);

        }

      });

    }

    function addInfoWindow(marker, message) {

      var infoWindow = new google.maps.InfoWindow({
        content: message
      });

      google.maps.event.addListener(marker, 'click', function () {
        infoWindow.open(map, marker);
      });

    }

    return {
      init: function () {
        initMap();
      }
    }

  });


/*  .service('BlankService', [function () {

 }]);*/

