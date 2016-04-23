angular.module('app.services', [])

  .factory('user', function ($cordovaDevice, $http) {
    var uuid = null;
    var isParked = null;

    var adMobId = {
      admob_banner_key: 'ca-app-pub-9314714208259569/5551960939',
      admob_interstitial_key: 'ca-app-pub-9314714208259569/9982160530'
    };

    var adMobPosition = {
      BOTTOM_CENTER: 8
    };

    function determineParkingStatus(uuid) {
      $http.get("http://parkingserver-openbigdata.rhcloud.com" +
          "/v1/park/locate/for/" + uuid)
        .then(function (response) {
          markers = response.data;
          return markers['coordinates'] != null

        }).then(function (status) {
        isParked = status;

      });
    }

    function showBannerAd() {
      try {

        console.log('Show Banner Ad');

        AdMob.createBanner({
          adId: adMobId.admob_banner_key,
          isTesting: false,
          position: AdMob.AD_POSITION.BOTTOM_CENTER,
          autoShow: true
        });


      } catch (e) {
        console.log(e);
      }
    }

    function showInterstitialAd(){
      AdMob.prepareInterstitial({
        adId: adMobId.interstitial,
        isTesting: false,
        autoShow: true
      });
    }

    return {
      initUUID: function () {
        console.log("in init uuid");
        document.addEventListener("deviceready", function () {
          uuid = $cordovaDevice.getUUID();
          determineParkingStatus(uuid);
          showBannerAd();
          console.log(uuid + " uuid from init");
        }, false);
      },
      getId: function () {
        console.log(uuid + " from getId");
        return uuid;
      },
      getStatus: function () {
        return isParked;
      },
      updateStatus: function () {
        determineParkingStatus(uuid)
      },
      showInterstitialAd: function (alertPopup) {
        try {
          console.log('Show Interstitial Ad');
          alertPopup.then(function (res) {
            showInterstitialAd();
          });

        } catch (e) {
          console.log(e);
        }
      }
    }
  })


  .factory('Markers', function ($http, $ionicLoading, user) {

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
            user.updateStatus();
            return markers;
          });
      },
      locateSpace: function () {
        return $http.get("http://parkingserver-openbigdata.rhcloud.com" +
            "/v1/park/locate/for/" + user.getId())
          .then(function (response) {
            markers = response.data;
            if (markers['coordinates'] == null) {
              return null;
            }
            var loca = [];
            loca[0] = markers['coordinates'][1];
            loca[1] = markers['coordinates'][0];
            return loca;
          });
      },
      vacateSpace: function () {
        $ionicLoading.show({template: 'Vacating..'});
        return $http.get("http://parkingserver-openbigdata.rhcloud.com" +
            "/v1/park/vacate/for/" + user.getId())
          .then(function (response) {
            $ionicLoading.hide();
            markers = response.data;
            user.updateStatus();
            return markers;
          });
      }
    }
  })
  .factory('GoogleMaps', function ($cordovaGeolocation, $cordovaLaunchNavigator, $http, $ionicLoading, Markers, user) {

    var apiKey = false;
    var map = null;

    var carIcon = {
      url: "img/car.png", // url
      scaledSize: new google.maps.Size(50, 50), // scaled size
      origin: new google.maps.Point(0, 0), // origin
      anchor: new google.maps.Point(0, 0) // anchor
    };

    var humanIcon = {
      url: "img/human.png", // url
      scaledSize: new google.maps.Size(50, 50), // scaled size
      origin: new google.maps.Point(0, 0), // origin
      anchor: new google.maps.Point(0, 0) // anchor
    };

    function refreshMap() {
      var options = {timeout: 10000, enableHighAccuracy: true};
      $ionicLoading.show({template: 'Fetching your location...'});
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
        google.maps.event.addListenerOnce(map, 'idle', function () {
          Markers.locateSpace().then(function (endLoc) {
            console.log('find coordinates for car:' + endLoc);
            if (endLoc != null) {
              console.log("adding coordinates to map");
              addMarkerToMap(new google.maps.LatLng(endLoc[0], endLoc[1]), "CAR", carIcon);
            }
          });
          addMarkerToMap(latLng, "YOU", humanIcon);
        });
        $ionicLoading.hide()
      }, function (error) {
        alert("Could not get location: " + error);
      });
    }

    function initMap() {
      refreshMap();

    }

    function tagLocation() {
      $ionicLoading.show({template: 'Parking..'});
      var options = {timeout: 10000, enableHighAccuracy: true};
      $cordovaGeolocation.getCurrentPosition(options).then(function (position) {
        Markers.setVehicleLocation(position.coords.latitude, position.coords.longitude);
        $ionicLoading.hide();
      }, function (error) {
        alert("could not tag location!. Please try again")
      });
    }

    function launchNavigatorApp() {
      var options = {timeout: 10000, enableHighAccuracy: true};
      $cordovaGeolocation.getCurrentPosition(options).then(function (position) {
        var startLoc = [position.coords.latitude, position.coords.longitude];
        Markers.locateSpace().then(function (endLoc) {
          $cordovaLaunchNavigator.navigate(endLoc, {
            start: startLoc,
            enableDebug: true
          }).then(function () {
            alert("Navigator launched");
          }, function (err) {
            alert(err);
          });
        });

      }, function (error) {
        alert("could not tag location!. Please try again")
      });

    }

    function addMarkerToMap(markerPos, name, iconURL) {
      var marker = new google.maps.Marker({
        map: map,
        animation: google.maps.Animation.DROP,
        position: markerPos,
        icon: iconURL
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
        refreshMap();
      },
      navigateToDest: function () {
        launchNavigatorApp();
      },
      vacateLocation: function () {
        Markers.vacateSpace();
        refreshMap();
      }
    }

  });
