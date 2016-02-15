define([
    "system/logManager",
    "constants"
], function (logManager, constants) {

    "use strict";

    let log = logManager.getLogger("Google Map Controller");

    /*
    <google-map address="some address" key="Apikey" zoom="4">
    </google-map>
    */


    return class MapController {

        constructor(element, config) {
            this.element = element;
            this.config = config;
        }

        start() {
            require([
                "async!https://maps.googleapis.com/maps/api/js?key=" + constants.googleMapsApiKey
            ], () => void this.initializeMap(window.google.maps));
        }

        initializeMap(mapsApi) {

            if (!mapsApi) {
                throw new Error("Unable to load Google Maps API");
            }

            let coordinates = this.config.coordinates;

            if (coordinates) {
                this.renderMap(mapsApi, coordinates);
                return;
            }

            let address = this.config.address;
            let geocoder = new mapsApi.Geocoder();

            log.debug("Geocoding address '{0}'", address);


            geocoder.geocode({
                address: address
            }, (results, status) => {
                if (status !== mapsApi.GeocoderStatus.OK) {
                    log.error("Geocoding failed with code {0}", status);
                    return;
                }

                let location = results[0].geometry.location;


                log.debug("Got geocode result {0}.", location);

                this.renderMap(mapsApi, location);
            });

        }

        renderMap(mapsApi, location) {
            let getType = type => {
                switch (type) {
                    case "road":
                        return mapsApi.MapTypeId.ROADMAP;
                    case "terrain":
                        return mapsApi.MapTypeId.TERRAIN;
                    case "satellite":
                        return mapsApi.MapTypeId.SATTELITE;
                    default:
                        return mapsApi.MapTypeId.ROADMAP;
                }
            };

            let map = new mapsApi.Map(this.element, {
                center: location,
                zoom: this.config.zoom || 16,
                scrollwheel: false,
                zoomControl: false,
                draggable: false,
                navigationControl: false,
                mapTypeControl: false,
                mapTypeId: getType(this.config.type)
            });

            let marker = new mapsApi.Marker({
                map: map,
                position: location,
                animation: mapsApi.Animation.DROP
            });

            if (this.config.info) {
                let infowindow = new mapsApi.InfoWindow({
                    content: this.config.info
                });

                marker.addListener("click", e => infowindow.open(map, marker));

                infowindow.open(map, marker);
            }
        }
    };
});