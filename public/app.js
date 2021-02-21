// Create the script tag, set the appropriate attributes
var script = document.createElement("script");
script.src =
  "https://maps.googleapis.com/maps/api/js?key=AIzaSyBx_il7dKQVfdoUyWTQvi7bQpnjUDOYCew&callback=initMap";
script.async = true;

// Attach your callback function to the `window` object
window.initMap = function () {
  // console.log(getCoordinates().lat);
  var map, infoWindow, curLocMarker;
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 49.246292, lng: -123.116226 },
    zoom: 13,
  });

  infoWindow = new google.maps.InfoWindow();

  // get user's current location coordinate, displays marker at curr location
  // uses built in geolocation
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        var pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        // infoWindow.setPosition(pos);
        // infoWindow.setContent("You are here!");
        // infoWindow.open(map);

        // curLocMarker = new google.maps.Marker({
        //   map: map,
        //   position: pos,
        // });
        new google.maps.Marker({
          map: map,
          position: pos,
        });
        map.setCenter(pos);

        document.getElementById("loc-button").addEventListener("click", () => {
          map.setCenter(pos);
        });
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
  map.data.loadGeoJson("resources/drinking-fountains.json", {
    idPropertyName: "mapid",
  });
  map.data.loadGeoJson("resources/washrooms.json", {
    idPropertyName: "primaryind",
  });

  // load facility markers based on filters

  var fountainSelect = document.getElementById("fountain");
  fountainSelect.onchange = function () {
    console.log("hi0");
    if (fountainSelect.checked) {
      map.data.loadGeoJson("resources/drinking-fountains.json", {
        idPropertyName: "mapid",
      });
    } else if (!fountainSelect.checked) {
      map.data.forEach(function (feature) {
        if (feature.getProperty("mapid") !== undefined) {
          map.data.remove(feature);
        }
      });
    }
  };

  var washroomSelect = document.getElementById("washroom");
  washroomSelect.onchange = function () {
    if (washroomSelect.checked) {
      map.data.loadGeoJson("resources/washrooms.json", {
        idPropertyName: "primaryind",
      });
    } else if (!washroomSelect.checked) {
      map.data.forEach(function (feature) {
        if (feature.getProperty("primaryind") !== undefined) {
          map.data.remove(feature);
        }
      });
    }
  };

  // set pin style for different facility
  map.data.setStyle((feature) => {
    if (feature.getProperty("mapid") !== undefined)
      return {
        icon: {
          url: `images/waterfountain.png`,
          scaledSize: new google.maps.Size(20, 31),
        },
      };
    else if (feature.getProperty("primaryind") !== undefined)
      return {
        icon: {
          url: `images/washroom.png`,
          scaledSize: new google.maps.Size(30, 30),
        },
      };
  });

  // add infowindows
  const spotInfoWindow = new google.maps.InfoWindow();

  // display info window on click
  map.data.addListener("click", (event) => {
    // water fountain
    if (event.feature.getProperty("mapid") !== undefined) {
      var name = event.feature.getProperty("name");
      var pos = name.lastIndexOf(":");
      name = name.slice(pos + 1);

      var location;
      if (event.feature.getProperty("location") !== undefined) {
        location = event.feature.getProperty("location");
      } else {
        location = "";
      }

      var inOperation;
      if (event.feature.getProperty("in_operation") !== undefined) {
        inOperation =
          "In operation: " + event.feature.getProperty("in_operation");
      } else {
        inOperation = "";
      }

      const position = event.feature.getGeometry().get();
      const content = `
          <h2>${name}</h2><p>${location}</p>
          <p><b></b> ${inOperation}</p>
          `;

      spotInfoWindow.setContent(content);
      spotInfoWindow.setPosition(position);
      spotInfoWindow.setOptions({ pixelOffset: new google.maps.Size(0, -30) });
      spotInfoWindow.open(map);

      // washroom
    } else if (event.feature.getProperty("primaryind") !== undefined) {
      var name = event.feature.getProperty("name");
      var location;
      if (event.feature.getProperty("address") !== undefined) {
        location = event.feature.getProperty("address");
      } else {
        location = "";
      }

      const wheelAccess = event.feature.getProperty("wheel_access");
      const summerHours = event.feature.getProperty("summer_hours");
      const winterHours = event.feature.getProperty("winter_hours");
      const position = event.feature.getGeometry().get();

      const content = `
          <h2>${name}</h2><p>${location}</p>
          <p><b></b>Wheelchair access: ${wheelAccess}</p>
          <p><b></b>Summer hours: ${summerHours}</p>
          <p><b></b>Winter hours: ${winterHours}</p>
          `;

      spotInfoWindow.setContent(content);
      spotInfoWindow.setPosition(position);
      spotInfoWindow.setOptions({
        pixelOffset: new google.maps.Size(0, -30),
      });
      spotInfoWindow.open(map);
    }
  });

  // go to address or postal code entered in search bar
  const geocoder = new google.maps.Geocoder();

  document.getElementById("search").addEventListener("click", () => {
    if (!document.getElementById("address").value) {
      alert("Please enter a valid address or postal code");
    } else {
      geocodeAddress(geocoder, map);
    }
  });

  function geocodeAddress(geocoder, resultsMap) {
    const address = document.getElementById("address").value;
    geocoder.geocode({ address: address }, (results, status) => {
      if (status === "OK") {
        resultsMap.setCenter(results[0].geometry.location);
        new google.maps.Marker({
          map: resultsMap,
          position: results[0].geometry.location,
        });
        // curLocMarker.setVisible(false);
      } else {
        alert("Geocode was not successful for the following reason: " + status);
      }
    });
  }
};

// Append the 'script' element to 'head'
document.head.appendChild(script);
