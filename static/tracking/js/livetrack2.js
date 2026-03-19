let map = null;
let userMarker = null;
let destMarker = null;
let routeLine = null;
let destinationCoords = null;
let watchId = null;

let notifiedInitial = false;
let notified5km = false;
let notified3km = false;
let notifiedReached = false;

const ORS_API_KEY =
  "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjYzM2E0NzIyOTIzMjRkMjI5MWE3Y2UyMDI5NGMyMmEzIiwiaCI6Im11cm11cjY0In0=";

let lastRouteTime = 0;
const ROUTE_INTERVAL = 10000; // 10 sec

// ---------------- MAP INIT ----------------
function initMapWithCurrentLocation() {
  if (!navigator.geolocation) {
    alert("Geolocation not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;

      map = L.map("map").setView([latitude, longitude], 15);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(map);

      userMarker = L.marker([latitude, longitude])
        .addTo(map)
        .bindPopup("You are here")
        .openPopup();

      startWatchPosition();
    },
    (err) => alert(err.message),
    { enableHighAccuracy: true }
  );
}

// ---------------- DESTINATION ----------------
async function getDestinationCoords(place) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    place
  )}`;

  const res = await fetch(url);
  const data = await res.json();
  if (!data.length) return null;

  return { lat: +data[0].lat, lng: +data[0].lon };
}

// ---------------- ROUTE ----------------
async function getRoute(start, end) {
  const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_API_KEY}&start=${start.lng},${start.lat}&end=${end.lng},${end.lat}`;

  const res = await fetch(url);
  const data = await res.json();
  if (!data.features?.length) return null;

  return {
    coords: data.features[0].geometry.coordinates.map((c) => [c[1], c[0]]),
    distance:
      data.features[0].properties.segments[0].distance / 1000,
    duration:
      data.features[0].properties.segments[0].duration / 60,
  };
}

// ---------------- START TRACKING ----------------
async function startTracking() {
  notifiedInitial = false;
  notified5km = false;
  notified3km = false;
  notifiedReached = false;

  const destName = document.getElementById("destination").value.trim();
  if (!destName) return alert("Enter destination");

  destinationCoords = await getDestinationCoords(destName);
  if (!destinationCoords) return alert("Destination not found");

  if (destMarker) map.removeLayer(destMarker);

  destMarker = L.marker([
    destinationCoords.lat,
    destinationCoords.lng,
  ])
    .addTo(map)
    .bindPopup("Destination")
    .openPopup();

  lastRouteTime = 0;

  // 🔑 Force first route draw (PC FIX)
  setTimeout(() => {
    updateRouteOnce();
  }, 1000);
}

// ---------------- LIVE LOCATION ----------------
function startWatchPosition() {
  watchId = navigator.geolocation.watchPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;

      userMarker.setLatLng([latitude, longitude]);

      // 🔑 PC + Mobile safe map movement
      map.setView(
        [latitude, longitude],
        map.getZoom(),
        { animate: false }
      );

      if (!destinationCoords || notifiedReached) return;

      const now = Date.now();
      if (now - lastRouteTime >= ROUTE_INTERVAL) {
        lastRouteTime = now;
        updateRouteOnce();
      }
    },
    (err) => console.error(err),
    { enableHighAccuracy: true }
  );
}

// ---------------- ROUTE UPDATE ----------------
async function updateRouteOnce() {
  if (!destinationCoords || !userMarker) return;

  const pos = userMarker.getLatLng();

  const route = await getRoute(
    { lat: pos.lat, lng: pos.lng },
    destinationCoords
  );

  if (!route) return;

  if (routeLine) map.removeLayer(routeLine);

  routeLine = L.polyline(route.coords, {
    color: "blue",
    weight: 4,
  }).addTo(map);

  document.getElementById(
    "distance"
  ).innerText = `Remaining Distance: ${route.distance.toFixed(2)} km`;

  document.getElementById(
    "eta"
  ).innerText = `ETA: ${Math.round(route.duration)} minutes`;

  // ✅ Initial distance alert
  if (!notifiedInitial) {
    alert(`📍 Total distance is ${route.distance.toFixed(2)} km`);
    notifiedInitial = true;
  }

  handleMilestones(route.distance);
}

// ---------------- ALERT LOGIC ----------------
function handleMilestones(distance) {
  const alertBox = document.getElementById("alert");
  const distText = distance.toFixed(2);

  if (distance <= 0.2 && !notifiedReached) {
    alertBox.innerText = "✅ You have reached your destination";
    notifiedReached = true;
    return;
  }

  if (distance <= 3 && !notified3km) {
    alertBox.innerText = `🚨 You are ${distText} km away from destination`;
    notified3km = true;
    return;
  }

  if (distance <= 5 && !notified5km) {
    alertBox.innerText = `🚨 You are ${distText} km away from destination`;
    notified5km = true;
  }
}

// ---------------- LOAD ----------------
window.onload = initMapWithCurrentLocation;
