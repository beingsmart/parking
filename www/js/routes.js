angular.module('app.routes', [])

  .config(function ($stateProvider, $urlRouterProvider) {

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider


      .state('findPark', {
        url: '/',
        templateUrl: 'templates/findPark.html',
        controller: 'findParkCtrl'
      })

      .state('locateVacate', {
        url: '/locate-vacate',
        templateUrl: 'templates/locateVacate.html',
        controller: 'locateVacateCtrl'
      })

      .state('map', {
        url: '/map',
        templateUrl: 'templates/map.html',
        controller: 'MapCtrl'
      });

    $urlRouterProvider.otherwise('/')


  });
