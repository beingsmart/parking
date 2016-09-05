angular.module('app.controllers', [])

  .controller('findParkCtrl', function ($scope) {

    $scope.mapCreated = function(map) {
      $scope.map = map;
    };

  });
