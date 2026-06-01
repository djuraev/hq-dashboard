// Countries hosting Sejong Korean Language School branches.
// coords = [lon, lat] for map markers. region for grouping/filters.
export const COUNTRIES = [
  { code: "KR", name: "South Korea", region: "East Asia", coords: [127.0, 37.5] },
  { code: "JP", name: "Japan", region: "East Asia", coords: [139.7, 35.7] },
  { code: "CN", name: "China", region: "East Asia", coords: [116.4, 39.9] },
  { code: "TW", name: "Taiwan", region: "East Asia", coords: [121.5, 25.0] },
  { code: "MN", name: "Mongolia", region: "East Asia", coords: [106.9, 47.9] },
  { code: "VN", name: "Vietnam", region: "Southeast Asia", coords: [105.8, 21.0] },
  { code: "TH", name: "Thailand", region: "Southeast Asia", coords: [100.5, 13.7] },
  { code: "ID", name: "Indonesia", region: "Southeast Asia", coords: [106.8, -6.2] },
  { code: "PH", name: "Philippines", region: "Southeast Asia", coords: [121.0, 14.6] },
  { code: "MY", name: "Malaysia", region: "Southeast Asia", coords: [101.7, 3.1] },
  { code: "SG", name: "Singapore", region: "Southeast Asia", coords: [103.8, 1.35] },
  { code: "IN", name: "India", region: "South Asia", coords: [77.2, 28.6] },
  { code: "UZ", name: "Uzbekistan", region: "Central Asia", coords: [69.2, 41.3] },
  { code: "KZ", name: "Kazakhstan", region: "Central Asia", coords: [71.4, 51.2] },
  { code: "US", name: "United States", region: "North America", coords: [-95.7, 39.8] },
  { code: "CA", name: "Canada", region: "North America", coords: [-79.4, 43.7] },
  { code: "MX", name: "Mexico", region: "North America", coords: [-99.1, 19.4] },
  { code: "BR", name: "Brazil", region: "South America", coords: [-46.6, -23.5] },
  { code: "AR", name: "Argentina", region: "South America", coords: [-58.4, -34.6] },
  { code: "GB", name: "United Kingdom", region: "Europe", coords: [-0.13, 51.5] },
  { code: "DE", name: "Germany", region: "Europe", coords: [13.4, 52.5] },
  { code: "FR", name: "France", region: "Europe", coords: [2.35, 48.85] },
  { code: "RU", name: "Russia", region: "Europe", coords: [37.6, 55.75] },
  { code: "AU", name: "Australia", region: "Oceania", coords: [151.2, -33.9] },
  { code: "EG", name: "Egypt", region: "Middle East & Africa", coords: [31.2, 30.0] },
  { code: "AE", name: "UAE", region: "Middle East & Africa", coords: [55.3, 25.2] },
  { code: "ZA", name: "South Africa", region: "Middle East & Africa", coords: [28.0, -26.2] },
];

export const REGIONS = [...new Set(COUNTRIES.map((c) => c.region))];
