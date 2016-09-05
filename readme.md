#Smart Saver: Parking App(Name not yet finalized)

See [blog.md --My personal blog](blog.md) to know about product idea and its maturity

##Frameworks:
- Ionic: For hybrid app development. 
- Dropwizard: Web services-
- Google Maps API: Parking and car finder
- Openshift: Cloud server deployment

###Developer tools:
- WebStorm: IDE for javascript
- Groc: [literate programming tool](https://github.com/nevir/groc)
- gulp
- bower
As it has become tedious to understand, maintain, configure the same development environment on multiple machines
using cordova, In the below section, cordova, I am gonna update all the plugins needed for the app. 

It is mandatory to update this doc for every developer involved in this app development (excluding the default plugins). 

Just like package dependency management(using maven) plugin dependency management, can be done using cordova prepare. 

pom.xml is analogous to [config.xml](config.xml)

http://www.gajotres.net/using-google-admob-in-your-android-ionic-application/


###Cordova:
cordova-plugin-geolocation

plugin.google.maps aka cordova-plugin-googlemaps


cordova plugin add plugin-name --save (to save plugin to config.xml

set ANDROID_HOME="C:\Program Files\Android"

set adb="C:\Program Files\Android\android-sdk\platform-tools\adb"

From here, there will be daily updates on work
`Date: 20-01-2016`
no major development
`Date: 21-01-2016`
Installed ngCordova, a wrapper on cordova.js to better use it with angularjs
Using this blog by [joshmorony](http://www.joshmorony.com/integrating-google-maps-with-an-ionic-application/).. integrating googlemaps with the app

http://stackoverflow.com/questions/27768730/ionic-get-users-phone-number

`Update on 20-02-2016`
* MongoDB as store for parking spaces. 
* Basic webservice to return parking spaces near the user location
*Integration with the app to get parking spaces near you -- very basic


https://github.com/israelidanny/ion-google-place