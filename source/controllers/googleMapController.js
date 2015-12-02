define([
  "system/logManager"
], function (logManager) {

  "use strict";

  var log = logManager.getLogger("Google Map Controller");
  var addressCache = {};

  /*
  <google-map address="some address" key="Apikey" zoom="4">
  </google-map>
  */


  function MapController(element, config) {
    var map = null;
    var marker = null;

    this.start = function () {
      require([
        "async!https://maps.googleapis.com/maps/api/js?key=" + config.key
      ], function () {

        var address = config.address;

        if (addressCache[address]) {

          log.debug("Address geocode cache hit: '{0}'.", address);

          renderMap(addressCache[address]);
          return;
        }

        var geocoder = new google.maps.Geocoder();

        log.debug("Geocoding address '{0}'", address);

        geocoder.geocode({
          address: address
        }, function (results, status) {
          if (status !== google.maps.GeocoderStatus.OK) {
            log.error("Geocoding failed with code {0}", status);
            return;
          }

          var location = results[0].geometry.location;

          addressCache[address] = location;

          log.debug("Got geocode result {0}.", location);

          renderMap(location);
        });
      });
    };

    function renderMap(location) {

      log.debug("Rendering map.");

      map = new google.maps.Map(element, {
        center: location,
        zoom: config.zoom || 16,
        scrollwheel: false,
        zoomControl: false,
        draggable: false,
        navigationControl: false,
        mapTypeControl: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      });

      marker = new google.maps.Marker({
        map: map,
        position: location,
        animation: google.maps.Animation.DROP
      });

      if (config.info) {
        var infowindow = new google.maps.InfoWindow({
          content: config.info
        });

        map.addListener("mouseover", function () {
          infowindow.open(map, marker);
        });

        map.addListener("click", function () {
          infowindow.open(map, marker);
        });
      }
    }
  }

  return MapController;
});