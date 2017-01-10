// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('app', ['ionic', 'app.controllers', 'app.routes', 'app.services', 'app.directives', 'ngCordova'])

  .run(function ($ionicPlatform, $cordovaSplashscreen, GoogleMaps, user) {
    $ionicPlatform.ready(function () {
      user.initUUID();
      if (window.cordova && window.cordova.plugins.Keyboard) {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

        // Don't remove this line unless you know what you are doing. It stops the viewport
        // from snapping when text inputs are focused. Ionic handles this internally for
        // a much nicer keyboard experience.
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if (window.StatusBar) {
        StatusBar.styleDefault();
      }
      function onRequestSuccess(success){
        console.log("Successfully requested accuracy: "+success.message);
        GoogleMaps.init();
      }

      function onRequestFailure(error){
        console.error("Accuracy request failed: error code="+error.code+"; error message="+error.message);
        if(error.code !== cordova.plugins.locationAccuracy.ERROR_USER_DISAGREED){
          if(window.confirm("Failed to automatically set Location Mode to 'High Accuracy'. " +
              "Would you like to switch to the Location Settings page and do this manually?")){
            cordova.plugins.diagnostic.switchToLocationSettings();
          }
        }
      }

      cordova.plugins.locationAccuracy.request(onRequestSuccess, onRequestFailure,
        cordova.plugins.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY);
    });
  })

  .service('$cordovaLaunchNavigator', ['$q', function ($q) {
    "use strict";

    var $cordovaLaunchNavigator = {};
    $cordovaLaunchNavigator.navigate = function (destination, options) {
      var q = $q.defer(),
        isRealDevice = ionic.Platform.isWebView();

      if (!isRealDevice) {
        q.reject("launchnavigator will only work on a real mobile device! It is a NATIVE app launcher.");
      } else {
        try {

          var successFn = options.successCallBack || function () {
              },
            errorFn = options.errorCallback || function () {
              },
            _successFn = function () {
              successFn();
              q.resolve();
            },
            _errorFn = function (err) {
              errorFn(err);
              q.reject(err);
            };

          options.successCallBack = _successFn;
          options.errorCallback = _errorFn;

          launchnavigator.navigate(destination, options);
        } catch (e) {
          q.reject("Exception: " + e.message);
        }
      }
      return q.promise;
    };

    return $cordovaLaunchNavigator;
  }]);
