angular.module('app.services', [])

  .factory('user', function ($cordovaDevice) {
    var uuid = null;
    return {
      initUUID: function () {
        console.log("in init uuid");
        document.addEventListener("deviceready", function () {
          uuid = $cordovaDevice.getUUID();
          console.log(uuid + " uuid from init");
        }, false);
      },
      getId: function () {
        console.log(uuid + " from getId");
        return uuid;
      }
    }
  })
  .factory('Markers', function ($http, user) {

    var markers = [];

    return {
      getMarkers: function (lat, lng) {

        return $http.get("http://parkingserver-openbigdata.rhcloud.com" +
            "/v1/space/near/lat/" + lat + "/lng/" + lng)
          .then(function (response) {
            markers = response;
            return markers;
          });

      },
      setVehicleLocation: function (lat, lng) {
        return $http.get("http://parkingserver-openbigdata.rhcloud.com" +
            "/v1/park/at/lat/" + lat + "/lng/" + lng + "/for/" + user.getId())
          .then(function (response) {
            markers = response;
            return markers;
          });
      },
      vacateSpace: function(){
        return $http.get("http://parkingserver-openbigdata.rhcloud.com" +
            "/v1/park/vacate/"+ "/for/" + user.getId())
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

    function refreshMap() {
      var options = {timeout: 10000, enableHighAccuracy: true};
      $cordovaGeolocation.getCurrentPosition(options).then(function (position) {

        var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        var mapOptions = {
          center: latLng,
          zoom: 18,
          disableDefaultUI: true, // a way to quickly hide all controls
          mapTypeControl: false,
          scaleControl: true,
          zoomControl: false,
          zoomControlOptions: {
            style: google.maps.ZoomControlStyle.LARGE
          },
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        map = new google.maps.Map(document.getElementById("map"), mapOptions);
        map.setCenter(latLng);
        //Wait until the map is loaded
        google.maps.event.addListenerOnce(map, 'idle', function () {
          addMarkerToMap(latLng, "you");
          //Load the markers
          //loadMarkers(position.coords.latitude, position.coords.longitude);

        });

      }, function (error) {
        alert("Could not get location: " + error);
      });
    }

    function initMap() {
      refreshMap();

    }

    function tagLocation() {
      var options = {timeout: 10000, enableHighAccuracy: true};
      $cordovaGeolocation.getCurrentPosition(options).then(function (position) {
        Markers.setVehicleLocation(position.coords.latitude, position.coords.longitude);
      }, function (error) {
        alert("could not tag location!. Please try again")
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
      },
      updateLocation: function () {
        tagLocation();
      }
    }

  });


/*  .service('BlankService', [function () {

 }]);*/

