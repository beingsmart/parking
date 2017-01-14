angular.module('app.controllers', [])

  .controller('findParkCtrl', function ($scope, $ionicLoading, $ionicPopup, GoogleMaps, user, Markers) {

    $scope.isLoading = false;
    $scope.focusCurrentLocation = function () {
      return GoogleMaps.init();
    };

    $scope.parkVehicle = function () {
      console.log("updating vehicle position");
      GoogleMaps.mapSetClickable(false);
      GoogleMaps.updateLocation();
      var alertPopup = $ionicPopup.alert({
        title: 'Car Status',
        template: 'Its Parked!'
      });
      user.showInterstitialAd(alertPopup, GoogleMaps);
    };


    $scope.vacate = function () {
      GoogleMaps.vacateLocation()
    };

    $scope.navigateToCar = function () {
      GoogleMaps.navigateToDest();
    };

    $scope.parkStatus = function () {
      var parked = user.getStatus();
      console.log("parked value is:" + parked);
      return parked;
    };

    $scope.isMarkerExists = function () {
      return Markers.getFirstMarker().length == 0;
    }
  })

  .controller('locateVacateCtrl', function ($scope, GoogleMaps) {
    $scope.vacate = function () {
      GoogleMaps.vacateLocation()
    };
    $scope.navigateToCar = function () {
      GoogleMaps.navigateToDest();
    };

  });
