import L from "leaflet";

/** CSS pin markers — avoids broken default PNG paths under Vite. */
export const userLocationIcon = L.divIcon({
  className: "map-marker map-marker-user",
  html: '<span aria-hidden="true"></span>',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

export const fireDetectionIcon = L.divIcon({
  className: "map-marker map-marker-fire",
  html: '<span aria-hidden="true"></span>',
  iconSize: [24, 32],
  iconAnchor: [12, 28],
  popupAnchor: [0, -24]
});

export const confirmedFireIcon = L.divIcon({
  className: "map-marker map-marker-confirmed",
  html: '<span aria-hidden="true"></span>',
  iconSize: [26, 34],
  iconAnchor: [13, 30],
  popupAnchor: [0, -26]
});

export const shelterIcon = L.divIcon({
  className: "map-marker map-marker-shelter",
  html: '<span aria-hidden="true"></span>',
  iconSize: [24, 32],
  iconAnchor: [12, 28],
  popupAnchor: [0, -24]
});
