import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const BAND_COLOR = { healthy: "#16a34a", attention: "#d97706", critical: "#dc2626" };

// Zoomed map centered on a single branch with a pin.
export default function LocationMap({ branch, height = 200 }) {
  const color = BAND_COLOR[branch.band] ?? "#3366ff";
  return (
    <div className="overflow-hidden rounded-xl border border-ink-100 bg-ink-50">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ center: branch.location, scale: 1400 }}
        width={400}
        height={height}
        style={{ width: "100%", height: "auto" }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#e7ebf2"
                stroke="#cfd6e1"
                strokeWidth={0.5}
                style={{ default: { outline: "none" }, hover: { fill: "#e7ebf2", outline: "none" }, pressed: { outline: "none" } }}
              />
            ))
          }
        </Geographies>
        <Marker coordinates={branch.location}>
          <circle r={11} fill={color} fillOpacity={0.2} />
          {/* pin */}
          <g transform="translate(-7, -18)" fill={color}>
            <path d="M7 0C3.13 0 0 3.13 0 7c0 5.25 7 11 7 11s7-5.75 7-11c0-3.87-3.13-7-7-7z" />
            <circle cx="7" cy="7" r="2.6" fill="#fff" />
          </g>
        </Marker>
      </ComposableMap>
    </div>
  );
}
