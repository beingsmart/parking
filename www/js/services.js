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
          "/v1/park/locate/for/" + uuid+ "?rnd="+new Date().getTime())
        .then(function (response) {
          return response.data['coordinates'] != null
        }).then(function (status) {
          isParked = status;
          console.log("parking status determined: "+isParked);

      });
    }

    function showBannerAd() {
      try {

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

    function showInterstitialAd() {
      AdMob.prepareInterstitial({
        adId: adMobId.interstitial,
        isTesting: false,
        autoShow: true
      });
    }

    return {
      initUUID: function () {
        document.addEventListener("deviceready", function () {
          uuid = $cordovaDevice.getUUID();
          determineParkingStatus(uuid);
          //showBannerAd();
        }, false);
      },
      getId: function () {
        return uuid;
      },
      getStatus: function () {
        return isParked;
      },
      updateStatus: function () {
        determineParkingStatus(uuid)
      },
      showInterstitialAd: function (alertPopup, GoogleMaps) {
        try {
          alertPopup.then(function (res) {
            GoogleMaps.mapSetClickable(true);
            showInterstitialAd();
          });

        } catch (e) {
          console.log(e);
        }
      }
    }
  })


  .factory('Markers', function ($http, $ionicLoading, user) {

    return {
      getMarkers: function (lat, lng) {

        return $http.get("http://parkingserver-openbigdata.rhcloud.com" +
            "/v1/space/near/lat/" + lat + "/lng/" + lng+"?rnd="+new Date().getTime())
          .then(function (response) {
            var markers = response;
            return markers;
          });

      },
      setVehicleLocation: function (lat, lng) {
        return $http.get("http://parkingserver-openbigdata.rhcloud.com" +
            "/v1/park/at/lat/" + lat + "/lng/" + lng + "/for/" + user.getId()+"?rnd="+new Date().getTime())
          .then(function (response) {
            var markers = response;
            user.updateStatus();
            return markers;
          });
      },
      locateSpace: function () {
        return $http.get("http://parkingserver-openbigdata.rhcloud.com" +
            "/v1/park/locate/for/" + user.getId()+"?rnd="+new Date().getTime())
          .then(function (response) {
            var markers = response.data;
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
            "/v1/park/vacate/for/" + user.getId()+"?rnd="+new Date().getTime())
          .then(function (response) {
            $ionicLoading.hide();
            var markers = response.data;
            user.updateStatus();
            return markers;
          });
      }
    }
  })
  .factory('GoogleMaps', function ($cordovaGeolocation, $cordovaLaunchNavigator, $http, $ionicLoading, Markers, user) {

    var apiKey = false;
    var map = null;
    var parkPos = null;
    var currentLocEvent=plugin.google.maps.event.MAP_LONG_CLICK;

    var carIcon = {
      url: "www/img/car.png"
    };

    var spotIcon = {
      url: "www/img/spot.png"
    };

    function setClickableProperty(boolValue) {
      map.setClickable(boolValue);
    }
    function setMap() {
      plugin.google.maps.Map.isAvailable(function(isAvailable1, message) {
        if(isAvailable1){
          var options = {timeout: 10000, enableHighAccuracy: true};
         $ionicLoading.show({template: 'Fetching your location...'});
          $cordovaGeolocation.getCurrentPosition(options).then(function (position) {

            var you_lat = position.coords.latitude;
            var you_lon = position.coords.longitude;
            var latLng = new plugin.google.maps.LatLng(you_lat, you_lon);
            var mapOptions = {
              'backgroundColor': 'white',
              'mapType': plugin.google.maps.MapTypeId.ROADMAP,
              'controls': {
                'compass': true,
                'myLocationButton': true,
                'indoorPicker': true,
                'zoom': true
              },
              'gestures': {
                'scroll': true,
                'tilt': true,
                'rotate': true,
                'zoom': true
              },
              'camera': {
                'latLng': latLng,
                'tilt': 30,
                'zoom': 16,
                'bearing': 50
              }
            };

            map = plugin.google.maps.Map.getMap(document.getElementById("map_canvas"), mapOptions);
            $ionicLoading.hide();
            map.on(plugin.google.maps.event.MAP_READY, function () {
              refreshMap(latLng);
            });
            map.on(currentLocEvent, function(currentLoc) {
              refreshMap(currentLoc);
            });
          }, function (error) {
            alert("Could not get location: " + error);
          });
        }
        else {
          console.log('google map plugin not available;')
        }
      });
    }

    function initMap() {
      setMap();

    }

    function refreshMap(currentLoc){
      map.setCenter(currentLoc);
      console.log("setting center");
      Markers.locateSpace().then(function (endLoc) {
        if (endLoc != null) {
          addMarkerToMap(new plugin.google.maps.LatLng(endLoc[0], endLoc[1]), "CAR", carIcon['url']);
        } else{
          console.log("loading markers");
          loadMarkers(currentLoc.lat, currentLoc.lng);
        }
      });
      //addMarkerToMap(latLng, "YOU", humanIcon);
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
          launchnavigator.isAppAvailable(launchnavigator.APP.GOOGLE_MAPS, function (isAvailable) {
            var defApp;
            if(isAvailable) {
              defApp = launchnavigator.APP.GOOGLE_MAPS;
            } else {
              console.warn("GoogleMaps Not available");
              defApp = launchnavigator.APP.USER_SELECT;
            }
            $cordovaLaunchNavigator.navigate(endLoc, {
              start: startLoc,
              enableDebug: true,
              app: defApp
            }).then(function () {
              alert("Navigator launched");
            }, function (err) {
              alert(err);
            });
          });
        });

      }, function (error) {
        alert("could not tag location!. Please try again")
      });

    }

    function addMarkerToMap(markerPos, name, iconURL) {
      map.addMarker({
        'position': markerPos,
        'title': name,
        'icon':{
          'url': iconURL
        }
      }, function (marker) {
        if(name=="CAR"){
          parkPos = marker;
        }
        marker.showInfoWindow();
      });

      // var infoWindowContent = "<h4>" + name + "</h4>";
      //
      // addInfoWindow(marker, infoWindowContent);
    }

    function loadMarkers(lat, lng) {

      //Get all of the markers from our Markers factory
      Markers.getMarkers(lat, lng).then(function (markers) {
        var records = markers.data;

        for (var i = 0; i < records.length; i++) {

          var record = records[i];
          var markerPos = new plugin.google.maps.LatLng(record.lat, record.lng);

          // Add the markerto the map
          addMarkerToMap(markerPos, record.name, spotIcon['url']);

        }
        console.log("loaded markers count:"+records.length);

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
        setMap();
      },
      navigateToDest: function () {
        launchNavigatorApp();
      },
      vacateLocation: function () {
        Markers.vacateSpace();
        parkPos.remove();
        console.log(parkPos);
        parkPos = null;
        map.clear();
        setMap();
      },
      mapSetClickable: function (boolValue) {
        setClickableProperty(boolValue);
    }
    }

  });
