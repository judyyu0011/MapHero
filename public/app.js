// Create the script tag, set the appropriate attributes
var script = document.createElement("script");
script.src =
  "https://maps.googleapis.com/maps/api/js?key=AIzaSyBx_il7dKQVfdoUyWTQvi7bQpnjUDOYCew&callback=initMap";
script.async = true;

// Attach your callback function to the `window` object
window.initMap = function () {
  // console.log(getCoordinates().lat);
  var map, infoWindow;
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 49.246292, lng: -123.116226 },
    zoom: 13,
  });

  infoWindow = new google.maps.InfoWindow();

  // get user's current location coordinate, displays info window
  // uses built in geolocation
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        var pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        infoWindow.setPosition(pos);
        infoWindow.setContent("Current location");
        infoWindow.open(map);
        map.setCenter(pos);
      },
      function () {
        handleLocationError(true, infoWindow, map.getCenter());
      }
    );
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }

  function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(
      browserHasGeolocation
        ? "Error: The Geolocation service failed."
        : "Error: Your browser doesn't support geolocation."
    );
    infoWindow.open(map);
  }

  // loads facility pins onto map
  map.data.loadGeoJson("drinking-fountains.json", { idPropertyName: "mapid" });


  // add infowindow for water fountains
  const spotInfoWindow = new google.maps.InfoWindow();

  map.data.addListener("click", (event) => {
    var name = event.feature.getProperty("name");
    var pos = name.lastIndexOf(':');
    name = name.slice(pos+1);

    var location;
    if (event.feature.getProperty("location") !== undefined) {
      location = 'Location: ' + event.feature.getProperty("location");
    } else {
      location = "";
    }

    var inOperation;
    if (event.feature.getProperty("in_operation") !== undefined) {
      inOperation = "In operation: " + event.feature.getProperty("in_operation");
    } else {
      inOperation = "";
    }

    const position = event.feature.getGeometry().get();
    const content = `
      <h2>${name}</h2><p>${location}</p>
      <p><b></b> ${inOperation}<br/>
      `;

    spotInfoWindow.setContent(content);
    spotInfoWindow.setPosition(position);
    spotInfoWindow.setOptions({ pixelOffset: new google.maps.Size(0, -30) });
    spotInfoWindow.open(map);
  });
};

// Append the 'script' element to 'head'
document.head.appendChild(script);
