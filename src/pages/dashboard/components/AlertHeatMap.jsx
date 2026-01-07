import { Typography } from "@material-tailwind/react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useRef } from "react";

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Alert type colors for markers
const ALERT_COLORS = {
  DROWSINESS: "#dc2626",
  SOMNOLENCIA_PERCLOS: "#dc2626",
  SOMNOLENCIA: "#dc2626",
  MICROSUEÑO: "#dc2626",
  YAWNING: "#f97316",
  BOSTEZO: "#f97316",
  HEAD_TILT: "#eab308",
  CABECEO: "#eab308",
  CABEZA_INCLINADA: "#eab308",
  SOMNOLENCIA_CABECEOS: "#eab308",
  DEFAULT: "#6b7280",
};

// Translation map for alert types (English to Spanish)
const ALERT_TRANSLATIONS = {
  // English to Spanish
  "DROWSINESS": "Somnolencia",
  "YAWNING": "Bostezo",
  "HEAD_TILT": "Cabeceo",
  "HEAD TILT": "Cabeceo",
  "MICROSLEEP": "Microsueño",
  "PERCLOS_HIGH": "PERCLOS Alto",
  "PERCLOS HIGH": "PERCLOS Alto",

  // Already in Spanish (keep as is but format nicely)
  "SOMNOLENCIA_CABECEOS": "Somnolencia por Cabeceos",
  "SOMNOLENCIA CABECEOS": "Somnolencia por Cabeceos",
  "SOMNOLENCIA_PERCLOS": "Somnolencia por PERCLOS",
  "SOMNOLENCIA PERCLOS": "Somnolencia por PERCLOS",
  "SOMNOLENCIA": "Somnolencia",
  "CABECEO": "Cabeceo",
  "BOSTEZO": "Bostezo",
  "MICROSUEÑO": "Microsueño",
  "FATIGA_BOSTEZOS": "Fatiga por Bostezos",
  "FRECUENCIA_CARDIACA_BAJA": "Frecuencia Cardíaca Baja",
  "FRECUENCIA_CARDIACA_ALTA": "Frecuencia Cardíaca Alta",
  "PERCLOS_ALTO": "PERCLOS Alto",
};

/**
 * Translate alert type to Spanish
 * @param {string} alertType - The alert type to translate
 * @returns {string} - Translated alert type
 */
const translateAlertType = (alertType) => {
  if (!alertType) return "Alerta";

  const key = alertType.toUpperCase().trim();

  // Check direct translation
  if (ALERT_TRANSLATIONS[key]) {
    return ALERT_TRANSLATIONS[key];
  }

  // Try with underscores replaced by spaces
  const withSpaces = key.replace(/_/g, " ");
  if (ALERT_TRANSLATIONS[withSpaces]) {
    return ALERT_TRANSLATIONS[withSpaces];
  }

  // Default: capitalize and replace underscores with spaces
  return alertType
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getAlertColor = (tipoAlerta) => {
  const key = tipoAlerta?.toUpperCase() || "DEFAULT";
  return ALERT_COLORS[key] || ALERT_COLORS.DEFAULT;
};

export function AlertHeatMap({
  alerts = [],
  trips = [],
  drivers = [],
  height = "400px",
  mode = "both",
  intensity = "medium",
  showLegend = true,
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const circlesRef = useRef([]);
  const hasInitializedBounds = useRef(false);

  // Process alerts to get coordinates
  const alertPoints = useMemo(() => {
    const points = [];
    let alertsWithCoords = 0;
    let alertsWithoutCoords = 0;

    alerts.forEach((alert) => {
      let lat = alert.latitud || alert.lat || alert.latitude;
      let lng = alert.longitud || alert.lng || alert.longitude;

      // Debug: log first few alerts to see their structure
      if (points.length === 0 && alertsWithoutCoords < 3) {
        console.log("[AlertHeatMap] Sample alert:", {
          id: alert.id_alerta,
          tipo: alert.tipo_alerta,
          latitud: alert.latitud,
          longitud: alert.longitud,
          lat: alert.lat,
          lng: alert.lng,
          id_viaje: alert.id_viaje,
        });
      }

      // Fallback: try to get coordinates from the associated trip's last reading
      if ((!lat || !lng) && alert.id_viaje) {
        const trip = trips.find((t) => t.id_viaje === alert.id_viaje);
        if (trip) {
          // Try various possible coordinate field names from trip
          lat = trip.latitud_actual || trip.lat_origen || trip.latitud || trip.lat;
          lng = trip.longitud_actual || trip.lng_origen || trip.longitud || trip.lng;
        }
      }

      if (lat && lng && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))) {
        alertsWithCoords++;
        const driver = drivers.find((d) => {
          const trip = trips.find((t) => t.id_viaje === alert.id_viaje);
          return trip && d.id_conductor === trip.id_conductor;
        });

        points.push({
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          alert,
          driver,
          color: getAlertColor(alert.tipo_alerta),
        });
      } else {
        alertsWithoutCoords++;
      }
    });

    console.log(`[AlertHeatMap] Total alerts: ${alerts.length}, With coords: ${alertsWithCoords}, Without coords: ${alertsWithoutCoords}`);

    return points;
  }, [alerts, trips, drivers]);

  // Get unique alert types for legend (translated)
  const alertTypesInMap = useMemo(() => {
    const typesMap = new Map();
    alertPoints.forEach((p) => {
      if (p.alert.tipo_alerta) {
        const original = p.alert.tipo_alerta.toUpperCase();
        const translated = translateAlertType(p.alert.tipo_alerta);
        typesMap.set(original, translated);
      }
    });
    return Array.from(typesMap.entries()); // Returns [[original, translated], ...]
  }, [alertPoints]);

  const intensityConfig = {
    low: { radius: 15, opacity: 0.4 },
    medium: { radius: 25, opacity: 0.5 },
    high: { radius: 35, opacity: 0.6 },
  };

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const defaultCenter = [-1.8312, -78.1834];

    mapInstanceRef.current = L.map(mapRef.current).setView(defaultCenter, 8);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapInstanceRef.current);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        hasInitializedBounds.current = false;
      }
    };
  }, []);

  // Update markers and circles when data changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    circlesRef.current.forEach((circle) => circle.remove());
    circlesRef.current = [];

    if (alertPoints.length === 0) return;

    const config = intensityConfig[intensity] || intensityConfig.medium;

    alertPoints.forEach((point) => {
      if (mode === "heat" || mode === "both") {
        const circle = L.circleMarker([point.lat, point.lng], {
          radius: config.radius,
          color: point.color,
          fillColor: point.color,
          fillOpacity: config.opacity,
          weight: 0,
        }).addTo(map);
        circlesRef.current.push(circle);
      }

      if (mode === "markers" || mode === "both") {
        const icon = L.divIcon({
          className: "custom-alert-marker",
          html: `
            <div style="
              width: 24px;
              height: 24px;
              background-color: ${point.color};
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            "></div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker([point.lat, point.lng], { icon }).addTo(map);

        // Translated popup content
        const translatedType = translateAlertType(point.alert.tipo_alerta);
        const popupContent = `
          <div style="min-width: 180px; font-family: system-ui, -apple-system, sans-serif;">
            <div style="font-weight: 600; color: #1a1a1a; margin-bottom: 4px;">
              ${translatedType}
            </div>
            ${point.alert.nivel_somnolencia ? `
              <div style="color: #6b7280; font-size: 13px;">
                Nivel: ${point.alert.nivel_somnolencia}
              </div>
            ` : ""}
            ${point.driver ? `
              <div style="color: #6b7280; font-size: 13px;">
                Conductor: ${point.driver.nombre}
              </div>
            ` : ""}
            <div style="color: #9ca3af; font-size: 12px; margin-top: 4px;">
              ${new Date(point.alert.timestamp).toLocaleString("es-ES")}
            </div>
            <div style="color: #d1d5db; font-size: 11px; margin-top: 2px;">
              Viaje #${point.alert.id_viaje}
            </div>
          </div>
        `;
        marker.bindPopup(popupContent);

        markersRef.current.push(marker);
      }
    });

    if (!hasInitializedBounds.current && alertPoints.length > 0) {
      const bounds = L.latLngBounds(alertPoints.map((p) => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
      hasInitializedBounds.current = true;
    }
  }, [alertPoints, mode, intensity]);

  if (alertPoints.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center bg-gray-50 rounded-lg border border-gray-200"
        style={{ height }}
      >
        <svg
          className="h-12 w-12 text-gray-300 mb-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
          />
        </svg>
        <Typography variant="small" className="text-gray-500">
          No hay alertas con ubicación disponible
        </Typography>
        <Typography variant="small" className="text-gray-400 mt-1">
          {alerts.length > 0
            ? `${alerts.length} alertas sin coordenadas GPS`
            : "Las alertas aparecerán aquí cuando tengan coordenadas"}
        </Typography>
      </div>
    );
  }

  return (
    <div className="relative rounded-lg overflow-hidden" style={{ height }}>
      <div ref={mapRef} style={{ height: "100%", width: "100%" }} />

      {showLegend && alertTypesInMap.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 z-[1000]">
          <Typography variant="small" className="font-medium text-gray-700 mb-2">
            Tipos de Alerta
          </Typography>
          <div className="flex flex-col gap-1.5">
            {alertTypesInMap.map(([original, translated]) => (
              <div key={original} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getAlertColor(original) }}
                />
                <Typography variant="small" className="text-gray-600 text-xs">
                  {translated}
                </Typography>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg px-3 py-2 z-[1000]">
        <Typography variant="small" className="text-gray-600">
          <span className="font-semibold text-gray-900">{alertPoints.length}</span> alertas en mapa
        </Typography>
      </div>
    </div>
  );
}

// Export the translation function for use in other components
export { ALERT_TRANSLATIONS, translateAlertType };

export default AlertHeatMap;
