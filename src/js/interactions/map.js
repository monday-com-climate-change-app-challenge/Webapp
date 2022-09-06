import $ from "jquery";

import { retrieve, store } from "../utils/storage";
import { jsonAsText } from "../utils/string";
import { alphabet } from "../utils/array";

import { embedJsonData } from "../export/json";

export const createMap = () => {
  const data = retrieve("data");

  const max = Math.max(...data.map(o => Object.values(o.data)))
  let datset = [...data.map(o => Object.values(o.data))]


  let fillse = []
    datset.forEach((item, i) => {

      if (Object.values(item) > 0)
          fillse.push(Object.values(item))
    });

  const min = Math.min.apply(null,fillse)

function median(numbers) {
    const sorted = Array.from(numbers).sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
        return (sorted[middle - 1] + sorted[middle]) / 2;
    }

    return sorted[middle];
}

const mid = median(fillse)

console.log(mid);

  let mapOptions = {
    mapTypeControl: false,
    rotateControl: false,
    zoom: 11,
  };

  let markers = [];
  let bounds = new google.maps.LatLngBounds();
  let map = new google.maps.Map(document.getElementById("map"), mapOptions);

  let directionsRenderer = new google.maps.DirectionsRenderer({
    preserveViewport: true,
  });
  directionsRenderer.addListener("directions_changed", handleDirectionsChanged);
  directionsRenderer.setMap(map);

  data.forEach((d, i) => {

    let img = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';

    let m = new google.maps.Marker({
      map: map,
      title: d.addressObject.country,
      position: d.latLng,
      icon: img,
    });
    m.addListener("mouseover", () => {
      $("#locationPre").text(JSON.stringify(d.addressObject, null, 2));
      $("#dataPre").text(JSON.stringify(d.data, null, 2));
    });
    m.addListener("mouseout", () => {
      $("#locationPre").text("No location to show.");
      $("#dataPre").text("No data to show.");
    });
    m.addListener("click", () => {
      pushRouteLocation(i);
      renderDirections(directionsRenderer, map);

      const route = retrieve("route");
      if (route.length >= 2) {
        markers
          .filter((m, i) => route.includes(i))
          .forEach((m) => m.setMap(null));
      }
    });

    markers.push(m);
    //console.log(markers)
    bounds.extend(d.latLng);

  });
  map.fitBounds(bounds);

  let resetControl = document.createElement("div");
  createResetControl(resetControl);
  resetControl.index = 1;
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(resetControl);

  return map;
};

const createResetControl = (div) => {
  let resetControl = document.createElement("div");
  resetControl.className = "map-button";
  resetControl.title = "Click to reset route.";
  div.appendChild(resetControl);

  let resetText = document.createElement("div");
  resetText.className = "map-button-text";
  resetText.innerHTML = "Reset Route";
  resetControl.appendChild(resetText);

  resetControl.addEventListener("click", () => {
    store("route", []);
    embedJsonData();
    createMap();

    let $td = $("<td />")
      .attr("colspan", "3")
      .text("No directions to show.");
    let $tr = $("<tr />").append($td);
    $("#locationTableBody").html("");
    $("#locationTableBody").append($tr);
  });
};

const pushRouteLocation = (index) => {
  let route = retrieve("route");
  if (!route) route = [];

  route.push(index);
  store("route", route);
};

export const renderDirections = (directionsRenderer, map) => {
  const route = retrieve("route");
  if (!route || route.length <= 1) return directionsRenderer.setMap(null);

  const data = retrieve("data");
  directionsRenderer.setMap(map);

  let waypoints = [];
  route.forEach((index, i) => {
    if (i !== 0 && i !== route.length - 1) {
      waypoints.push({
        location: data[index].latLng,
        stopover: true,
      });
    }
  });

  let directionsService = new google.maps.DirectionsService();
  directionsService.route(
    {
      origin: data[route[0]].latLng,
      destination: data[route[route.length - 1]].latLng,
      waypoints: waypoints,
      optimizeWaypoints: true,
      travelMode: "DRIVING",
    },
    (results, status) => {
      if (status === "OK") directionsRenderer.setDirections(results);
    }
  );
};

export const handleDirectionsChanged = () => {
  const route = retrieve("route");
  const data = retrieve("data");

  embedJsonData();

  $("#locationTableBody").html("");
  route.forEach((index, i) => {
    let $tr = $("<tr />");

    let $td1 = $("<td />").attr("scope", "row").text(alphabet[i]);
    let $td2 = $("<td />").text(data[index].addressString);
    let $td3 = $("<td />").text(jsonAsText(data[index].data));

    $tr.append($td1);
    $tr.append($td2);
    $tr.append($td3);
    $("#locationTableBody").append($tr);
  });
};
