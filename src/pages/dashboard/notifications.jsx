import { fetchDrivers, fetchRecentAlerts, fetchTrips } from "@/api/client";
import {
  BellAlertIcon,
  ExclamationTriangleIcon,
  EyeSlashIcon,
  FunnelIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import {
  Alert,
  Button,
  Menu,
  MenuHandler,
  MenuItem,
  MenuList,
  Spinner,
  Typography,
} from "@material-tailwind/react";
import React from "react";
import { AlertHeatMap } from "./components/AlertHeatMap";

// Minimalist color palette
const COLORS = {
  primary: "#1a1a1a",
  secondary: "#6b7280",
  danger: "#dc2626",
  warning: "#f59e0b",
  muted: "#9ca3af",
};

// Alert type configuration
const ALERT_CONFIG = {
  DROWSINESS: { color: "red", icon: EyeSlashIcon, label: "Somnolencia", priority: 1 },
  SOMNOLENCIA_PERCLOS: { color: "red", icon: EyeSlashIcon, label: "Somnolencia", priority: 1 },
  MICROSUEÑO: { color: "red", icon: EyeSlashIcon, label: "Microsueño", priority: 1 },
  YAWNING: { color: "orange", icon: BellAlertIcon, label: "Bostezo", priority: 2 },
  BOSTEZO: { color: "orange", icon: BellAlertIcon, label: "Bostezo", priority: 2 },
  HEAD_TILT: { color: "amber", icon: ExclamationTriangleIcon, label: "Cabeceo", priority: 2 },
  CABECEO: { color: "amber", icon: ExclamationTriangleIcon, label: "Cabeceo", priority: 2 },
  CABEZA_INCLINADA: { color: "amber", icon: ExclamationTriangleIcon, label: "Cabeza Inclinada", priority: 2 },
  DEFAULT: { color: "gray", icon: InformationCircleIcon, label: "Información", priority: 3 },
};

// Get priority styles
const getPriorityStyles = (priority) => {
  switch (priority) {
    case 1: return { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", icon: "text-red-500" };
    case 2: return { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", icon: "text-amber-500" };
    default: return { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-700", icon: "text-gray-500" };
  }
};

const getAlertConfig = (tipoAlerta) => {
  const key = tipoAlerta?.toUpperCase() || "DEFAULT";
  return ALERT_CONFIG[key] || ALERT_CONFIG.DEFAULT;
};

// Format relative time
const formatRelativeTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Ahora";
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays < 7) return `Hace ${diffDays}d`;
  return date.toLocaleDateString("es-ES");
};

export function Notifications() {
  const [alerts, setAlerts] = React.useState([]);
  const [drivers, setDrivers] = React.useState([]);
  const [trips, setTrips] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [dismissedAlerts, setDismissedAlerts] = React.useState(new Set());
  const [filterType, setFilterType] = React.useState("all");
  const [filterPriority, setFilterPriority] = React.useState("all");
  const [mapMode, setMapMode] = React.useState("heat"); // "heat", "markers", "both"
  const [showMap, setShowMap] = React.useState(true);

  // Date filter states
  const [dateFilterType, setDateFilterType] = React.useState("all"); // "all", "today", "week", "month", "custom"
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");

  const loadData = React.useCallback(async () => {
    try {
      setError(null);
      const [alertsData, driversData, tripsData] = await Promise.all([
        fetchRecentAlerts(500), // Increased to get older alerts that have coordinates
        fetchDrivers(),
        fetchTrips(0, 100),
      ]);
      setAlerts(Array.isArray(alertsData) ? alertsData : []);
      setDrivers(Array.isArray(driversData) ? driversData : []);
      setTrips(Array.isArray(tripsData) ? tripsData : []);
    } catch (e) {
      setError(e.message || "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Get driver info for a trip
  const getDriverForTrip = (tripId) => {
    const trip = trips.find((t) => t.id_viaje === tripId);
    if (!trip) return null;
    return drivers.find((d) => d.id_conductor === trip.id_conductor);
  };

  // Get vehicle info for a trip
  const getVehicleForTrip = (tripId) => {
    const trip = trips.find((t) => t.id_viaje === tripId);
    return trip?.vehiculo || null;
  };

  const handleDismiss = (alertaId) => {
    setDismissedAlerts((prev) => new Set([...prev, alertaId]));
  };

  // Calculate statistics
  const stats = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayAlerts = alerts.filter((a) => new Date(a.timestamp) >= today);
    const criticalAlerts = alerts.filter((a) => {
      const config = getAlertConfig(a.tipo_alerta);
      return config.priority === 1;
    });
    const todayCritical = criticalAlerts.filter((a) => new Date(a.timestamp) >= today);

    // Group by type
    const byType = alerts.reduce((acc, alert) => {
      const type = alert.tipo_alerta || "OTROS";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    return {
      total: alerts.length,
      today: todayAlerts.length,
      critical: criticalAlerts.length,
      todayCritical: todayCritical.length,
      byType,
    };
  }, [alerts]);

  // Filter alerts
  const filteredAlerts = React.useMemo(() => {
    return alerts
      .filter((alert) => !dismissedAlerts.has(alert.id_alerta))
      .filter((alert) => {
        // Type filter
        if (filterType !== "all" && alert.tipo_alerta?.toUpperCase() !== filterType) {
          return false;
        }
        // Priority filter
        if (filterPriority !== "all") {
          const config = getAlertConfig(alert.tipo_alerta);
          if (filterPriority === "critical" && config.priority !== 1) return false;
          if (filterPriority === "warning" && config.priority !== 2) return false;
          if (filterPriority === "info" && config.priority !== 3) return false;
        }
        // Date filter
        const alertDate = new Date(alert.timestamp);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (dateFilterType === "today") {
          return alertDate >= today;
        } else if (dateFilterType === "week") {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return alertDate >= weekAgo;
        } else if (dateFilterType === "month") {
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return alertDate >= monthAgo;
        } else if (dateFilterType === "custom") {
          if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            if (alertDate < start) return false;
          }
          if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            if (alertDate > end) return false;
          }
        }
        return true;
      })
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [alerts, dismissedAlerts, filterType, filterPriority, dateFilterType, startDate, endDate]);

  // Get unique alert types for filter
  const alertTypes = React.useMemo(() => {
    const types = new Set(alerts.map((a) => a.tipo_alerta?.toUpperCase()).filter(Boolean));
    return Array.from(types);
  }, [alerts]);

  return (
    <div className="mx-auto my-8 flex max-w-screen-xl flex-col gap-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="h4" className="font-semibold text-gray-900">
            Alertas
          </Typography>
          <Typography variant="small" className="text-gray-500 mt-1">
            Monitoreo de eventos de somnolencia
          </Typography>
        </div>
        <Button
          variant="text"
          size="sm"
          className="flex items-center gap-2 text-gray-600"
          onClick={loadData}
          disabled={loading}
        >
          {loading ? (
            <Spinner className="h-4 w-4" />
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
          Actualizar
        </Button>
      </div>

      {/* Statistics - Clean grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <Typography variant="small" className="text-gray-500 font-medium">
            Total
          </Typography>
          <Typography variant="h3" className="mt-1 text-gray-900">
            {stats.total}
          </Typography>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <Typography variant="small" className="text-gray-500 font-medium">
            Hoy
          </Typography>
          <Typography variant="h3" className="mt-1 text-gray-900">
            {stats.today}
          </Typography>
        </div>

        <div className="rounded-xl border border-red-100 bg-red-50/50 p-5">
          <Typography variant="small" className="text-red-600 font-medium">
            Críticas
          </Typography>
          <Typography variant="h3" className="mt-1 text-red-700">
            {stats.critical}
          </Typography>
        </div>

        <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-5">
          <Typography variant="small" className="text-amber-600 font-medium">
            Críticas Hoy
          </Typography>
          <Typography variant="h3" className="mt-1 text-amber-700">
            {stats.todayCritical}
          </Typography>
        </div>
      </div>

      {/* Map Section */}
      <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-4">
          <div className="flex items-center justify-between">
            <Typography variant="h6" className="font-medium text-gray-900">
              Mapa de Alertas
            </Typography>
            <div className="flex items-center gap-3">
              <div className="flex rounded-lg bg-gray-100 p-1">
                {["heat", "markers", "both"].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setMapMode(mode)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                      mapMode === mode
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {mode === "heat" ? "Calor" : mode === "markers" ? "Puntos" : "Ambos"}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowMap(!showMap)}
                className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={showMap ? "M19 9l-7 7-7-7" : "M5 15l7-7 7 7"} />
                </svg>
              </button>
            </div>
          </div>

          {/* Date Filter */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <Typography variant="small" className="text-gray-600 font-medium">
                Período:
              </Typography>
            </div>
            <div className="flex rounded-lg bg-gray-100 p-1">
              {[
                { value: "all", label: "Todo" },
                { value: "today", label: "Hoy" },
                { value: "week", label: "7 días" },
                { value: "month", label: "30 días" },
                { value: "custom", label: "Personalizado" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setDateFilterType(option.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    dateFilterType === option.value
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Custom Date Inputs */}
            {dateFilterType === "custom" && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Desde"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Hasta"
                />
                {(startDate || endDate) && (
                  <button
                    onClick={() => { setStartDate(""); setEndDate(""); }}
                    className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Limpiar fechas"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        {showMap && (
          <div className="p-4">
            <AlertHeatMap
              alerts={filteredAlerts}
              trips={trips}
              drivers={drivers}
              height="360px"
              mode={mapMode}
              intensity="medium"
              showLegend={true}
            />
          </div>
        )}
      </div>

      {/* Alerts List */}
      <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Typography variant="h6" className="font-medium text-gray-900">
              Registro
            </Typography>
            <Typography variant="small" className="text-gray-500">
              {filteredAlerts.length} alertas
            </Typography>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Priority Filter - Simple buttons */}
            <div className="flex rounded-lg bg-gray-100 p-1">
              {[
                { value: "all", label: "Todas" },
                { value: "critical", label: "Críticas" },
                { value: "warning", label: "Advertencias" },
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setFilterPriority(filter.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    filterPriority === filter.value
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Type Filter */}
            <Menu>
              <MenuHandler>
                <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <FunnelIcon className="h-3.5 w-3.5" />
                  {filterType === "all" ? "Tipo" : getAlertConfig(filterType).label}
                </button>
              </MenuHandler>
              <MenuList className="min-w-[140px]">
                <MenuItem onClick={() => setFilterType("all")} className="text-sm">
                  Todos
                </MenuItem>
                {alertTypes.map((type) => (
                  <MenuItem key={type} onClick={() => setFilterType(type)} className="text-sm">
                    {getAlertConfig(type).label}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
          </div>
        </div>

        <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
          {error && (
            <div className="p-4">
              <Alert color="red" className="border-0">
                {error}
              </Alert>
            </div>
          )}

          {loading && alerts.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <Spinner className="h-6 w-6 text-gray-400" />
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <BellAlertIcon className="h-10 w-10 mb-3" />
              <Typography variant="small" className="text-gray-500">
                No hay alertas
              </Typography>
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const config = getAlertConfig(alert.tipo_alerta);
              const styles = getPriorityStyles(config.priority);
              const Icon = config.icon;
              const driver = getDriverForTrip(alert.id_viaje);
              const vehicle = getVehicleForTrip(alert.id_viaje);

              return (
                <div
                  key={alert.id_alerta}
                  className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors"
                >
                  <div className={`rounded-lg p-2 ${styles.bg}`}>
                    <Icon className={`h-4 w-4 ${styles.icon}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Typography variant="small" className={`font-semibold ${styles.text}`}>
                        {config.label}
                      </Typography>
                      {alert.nivel_somnolencia && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${styles.bg} ${styles.text}`}>
                          {alert.nivel_somnolencia}
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      {driver && <span>{driver.nombre}</span>}
                      {vehicle && <span>{vehicle.nombre || vehicle.placa}</span>}
                      <span>Viaje #{alert.id_viaje}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Typography variant="small" className="text-gray-400 text-xs whitespace-nowrap">
                      {formatRelativeTime(alert.timestamp)}
                    </Typography>
                    <button
                      onClick={() => handleDismiss(alert.id_alerta)}
                      className="p-1 text-gray-300 hover:text-gray-500 transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Distribution - Simple tags */}
      {Object.keys(stats.byType).length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Typography variant="small" className="text-gray-500 mr-2">
            Por tipo:
          </Typography>
          {Object.entries(stats.byType).map(([type, count]) => {
            const config = getAlertConfig(type);
            const styles = getPriorityStyles(config.priority);
            return (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all hover:opacity-80 ${
                  filterType === type
                    ? `${styles.bg} ${styles.border} ${styles.text}`
                    : "bg-gray-50 border-gray-200 text-gray-600"
                }`}
              >
                {config.label} · {count}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Notifications;
