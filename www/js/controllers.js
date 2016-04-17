angular.module('app.controllers', [])

  .controller('findParkCtrl', function ($scope, GoogleMaps) {

    $scope.focusCurrentLocation = function () {
      return GoogleMaps.init();
    };

    $scope.parkVehicle = function () {
      console.log("updating vehicle position");
      GoogleMaps.updateLocation()
    };
  })

  .controller('locateVacateCtrl', function ($scope, GoogleMaps) {
    $scope.vacate = function () {

    };
    $scope.navigateToCar = function () {
      GoogleMaps.navigateToDest();
    };

  });
