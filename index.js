const MapDrop = new function() {
    var lastLocation = {};
    var map = {};
    var mapCenter = {};

    this.addPin = function addPin(newPin) {
        let pins = this.getPins();
        pins.push(newPin);
        localStorage.setItem('map-drop', JSON.stringify(pins));
    };

    this.getPins = function getPins() {
        return JSON.parse(localStorage.getItem('map-drop')) || [];
    };

    this.storeState = function storeState(location) {
        document.getElementById('pin-drop').removeAttribute('disabled');

        map.panTo(new L.LatLng(location.coords.latitude, location.coords.longitude));
        mapCenter.setLatLng(new L.LatLng(location.coords.latitude, location.coords.longitude));
        lastLocation = location;
    };

    this.setWatcher = function setWatcher() {
        if(navigator.geolocation) {
            document.getElementById('pin-drop').setAttribute('disabled', 'true');
            navigator.geolocation.watchPosition(
                this.storeState,
                this.handleGeoError,
                {
                     enableHighAccuracy: true,
                     maximumAge: 0
                }
            );
        }
    };

    this.dropPin = function dropPin() {
        let label = prompt("Add a label?");

        this.recordPinDrop(lastLocation, label);
    };

    this.handleGeoError = function handleGeoError(err) {};

    this.recordPinDrop = function recordPinDrop(location, label) {
        let pin = {
            time:  new Date().toISOString(),
            label: label,
            lat:   location.coords.latitude,
            long:  location.coords.longitude
        }

        this.addPin(pin);
        this.makeMarker(pin).addTo(map)
    };

    this.downloadPinDrops = function downloadPinDrops() {
        let csvContent = "data:text/csv;charset=utf-8,time,label,lat,long\r\n";

        this.getPins().forEach(function(drop){
            let row = Object.values(drop).join(",");
            csvContent += row + "\r\n";
        });

        let encodedUri = encodeURI(csvContent);
        let link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "mapdrop.csv");

        document.body.appendChild(link);

        link.click();
    };

    this.clearPins = function clearPins() {
        if (confirm('Do you want to delete all your pins?')) {
            localStorage.removeItem('map-drop');
        }
    };

    this.makeMarker = function(pin) {
        let marker = L.marker([pin.lat, pin.long]);

        if (pin.label) {
            marker = marker.bindTooltip(pin.label);
        }

        return marker;
    };

    this.makeMap = function makeMap() {
        navigator.geolocation.getCurrentPosition(function(location) {
            map = L.map('map')
                .setView([
                    location.coords.latitude,
                    location.coords.longitude
                ], 19);

            let attribution = [
                'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
                '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
                'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
            ];

            L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
                attribution: attribution.join(", "),
                maxZoom: 19,
                id: 'mapbox.streets',
                accessToken: 'pk.eyJ1IjoicHJvYmFibHlmaW5lIiwiYSI6ImNqa2xlb2k0MDF1dnUza216eGtmbGZkMDkifQ.ku-vSD1pnkzHouNHR6s7Og'
            }).addTo(map);

            mapCenter = L.circle([location.coords.latitude, location.coords.longitude], {
                color: 'red',
                fillColor: '#f03',
                fillOpacity: 0.5,
                radius: 2
            }).addTo(map);

            MapDrop.getPins().forEach(function(pin) {
                MapDrop.makeMarker(pin).addTo(map)
            });
        });
    };
};