angular.module('app.controllers', [])

  .controller('findParkCtrl', function ($scope, GoogleMaps, user) {

    $scope.focusCurrentLocation = function () {
      return GoogleMaps.init();
    };

    $scope.parkVehicle = function () {
      console.log("updating vehicle position");
      GoogleMaps.updateLocation()
    };


    $scope.vacate = function () {
      GoogleMaps.vacateLocation()
    };

    $scope.navigateToCar = function () {
      GoogleMaps.navigateToDest();
    };

    $scope.parkStatus = function () {
      var parked = user.getStatus();
      console.log("parked value is:"+parked)
      return parked;
    };
  })

  .controller('locateVacateCtrl', function ($scope, GoogleMaps) {
    $scope.vacate = function () {
        GoogleMaps.vacateLocation()
    };
    $scope.navigateToCar = function () {
      GoogleMaps.navigateToDest();
    };

  });
