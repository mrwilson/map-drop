const MapDrop = {
    addPin: function addPin(newPin) {
        let pins = getPins();
        pins.push(newPin);
        localStorage.setItem('map-drop', JSON.stringify(pins));
    },

    getPins: function getPins() {
        return JSON.parse(localStorage.getItem('map-drop')) || [];
    },

    dropPin: function dropPin() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(MapDrop.recordPinDrop);
            document.getElementById('pin-drop').setAttribute('disabled', 'true');
        }
    },

    recordPinDrop: function recordPinDrop(location) {
        document.getElementById('pin-drop').removeAttribute('disabled');

        MapDrop.addPin({
            time:  new Date().toISOString(),
            label: document.getElementById('pin-label').value,
            lat:   location.coords.latitude,
            long:  location.coords.longitude
        });
    },

    downloadPinDrops: function downloadPinDrops() {
        let csvContent = "data:text/csv;charset=utf-8,time,label,lat,long\r\n";

        MapDrop.getPins().forEach(function(drop){
            let row = Object.values(drop).join(",");
            csvContent += row + "\r\n";
        });

        let encodedUri = encodeURI(csvContent);
        let link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "mapdrop.csv");

        document.body.appendChild(link);

        link.click();
    },

    clearPins: function clearPins() {
        if (confirm('Do you want to delete all your pins?')) {
            localStorage.removeItem('map-drop');
        }
    },

    makeMap: function makeMap() {
        navigator.geolocation.getCurrentPosition(function(location) {
            let map = L.map('map')
                .setView([
                    location.coords.latitude,
                    location.coords.longitude
                ], 13);

            let attribution = [
                'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
                '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
                'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
            ];

            L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
                attribution: attribution.join(", "),
                maxZoom: 18,
                id: 'mapbox.streets',
                accessToken: 'pk.eyJ1IjoicHJvYmFibHlmaW5lIiwiYSI6ImNqa2xlb2k0MDF1dnUza216eGtmbGZkMDkifQ.ku-vSD1pnkzHouNHR6s7Og'
            }).addTo(map);

            MapDrop.getPins().forEach(function(pin) {
                L.marker([pin.lat, pin.long]).addTo(map)
            });
        });
    }
};