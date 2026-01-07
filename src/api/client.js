export const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

// Helper function to parse error responses from the backend
async function parseErrorResponse(response) {
  try {
    const text = await response.text();
    // Try to parse as JSON to extract the detail message
    try {
      const json = JSON.parse(text);
      if (json.detail) {
        return json.detail;
      }
      return text;
    } catch {
      return text;
    }
  } catch {
    return `Error ${response.status}`;
  }
}

export async function fetchDrivers() {
  const response = await fetch(`${API_BASE}/conductores/?limit=100`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response);
    throw new Error(errorMessage);
  }
  return response.json();
}

export async function fetchDriver(driverId) {
  const response = await fetch(`${API_BASE}/conductores/${driverId}`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response);
    throw new Error(errorMessage);
  }
  return response.json();
}

export async function createDriver({ nombre, condicion_medica, horario_riesgo, activo = true }) {
  const response = await fetch(`${API_BASE}/conductores/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre, condicion_medica, horario_riesgo, activo }),
  });
  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response);
    throw new Error(errorMessage);
  }
  return response.json();
}

export async function updateDriver(driverId, { nombre, condicion_medica, horario_riesgo, activo }) {
  const payload = {};
  if (nombre !== undefined) payload.nombre = nombre;
  if (condicion_medica !== undefined) payload.condicion_medica = condicion_medica;
  if (horario_riesgo !== undefined) payload.horario_riesgo = horario_riesgo;
  if (activo !== undefined) payload.activo = activo;

  const response = await fetch(`${API_BASE}/conductores/${driverId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response);
    throw new Error(errorMessage);
  }
  return response.json();
}

export async function deleteDriver(driverId) {
  const response = await fetch(`${API_BASE}/conductores/${driverId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response);
    throw new Error(errorMessage);
  }
  return true;
}

export async function fetchTrips(skip = 0, limit = 100, conductorId = null) {
  const url = new URL(`${API_BASE}/viajes/`);
  url.searchParams.append("skip", skip);
  url.searchParams.append("limit", limit);
  if (conductorId) {
    url.searchParams.append("conductor_id", conductorId);
  }
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response);
    throw new Error(errorMessage);
  }
  return response.json();
}

export async function fetchActiveTrips() {
  const trips = await fetchTrips(0, 100);
  return trips.filter(trip => trip.fecha_fin === null);
}

export async function fetchActiveTripByDriver(conductorId) {
  const response = await fetch(`${API_BASE}/viajes/conductor/${conductorId}/activo`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    if (response.status === 404) {
      return null; // No active trip
    }
    const errorMessage = await parseErrorResponse(response);
    throw new Error(errorMessage);
  }
  return response.json();
}

export async function startTrip(conductorId, vehiculoId) {
  const payload = { id_conductor: conductorId };
  if (vehiculoId) {
    payload.id_vehiculo = vehiculoId;
  }
  const response = await fetch(`${API_BASE}/viajes/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response);
    throw new Error(errorMessage);
  }
  return response.json();
}

export async function endTrip(tripId) {
  const response = await fetch(`${API_BASE}/viajes/${tripId}/finalizar`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fecha_fin: new Date().toISOString() }),
  });
  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response);
    throw new Error(errorMessage);
  }
  return response.json();
}

export async function fetchRecentAlerts(limit = 20) {
  const response = await fetch(`${API_BASE}/alertas/recientes?limit=${limit}`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response);
    throw new Error(errorMessage);
  }
  return response.json();
}

export async function fetchTripsByDriver(conductorId, { skip = 0, limit = 20 } = {}) {
  if (!conductorId) {
    throw new Error("conductorId is required to fetch trips by driver");
  }
  const trips = await fetchTrips(skip, limit, conductorId);
  return Array.isArray(trips) ? trips : [];
}

export async function fetchTripStats(tripId) {
  const response = await fetch(`${API_BASE}/viajes/${tripId}/estadisticas`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response);
    throw new Error(errorMessage);
  }
  return response.json();
}

export async function fetchVehicles(skip = 0, limit = 100) {
  const response = await fetch(`${API_BASE}/vehiculos/?skip=${skip}&limit=${limit}`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response);
    throw new Error(errorMessage);
  }
  return response.json();
}

export async function createVehicle({ nombre, placa }) {
  const response = await fetch(`${API_BASE}/vehiculos/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre, placa }),
  });
  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response);
    throw new Error(errorMessage);
  }
  return response.json();
}

// Dashboard statistics functions
export async function fetchDashboardStats() {
  try {
    const [drivers, vehicles, trips, alerts] = await Promise.all([
      fetchDrivers(),
      fetchVehicles(),
      fetchTrips(0, 1000),
      fetchRecentAlerts(100),
    ]);

    const activeTrips = trips.filter(trip => trip.fecha_fin === null);
    const completedTrips = trips.filter(trip => trip.fecha_fin !== null);

    // Calculate today's alerts
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayAlerts = alerts.filter(alert => {
      const alertDate = new Date(alert.timestamp);
      return alertDate >= today;
    });

    // Group alerts by type
    const alertsByType = alerts.reduce((acc, alert) => {
      acc[alert.tipo_alerta] = (acc[alert.tipo_alerta] || 0) + 1;
      return acc;
    }, {});

    return {
      totalDrivers: drivers.length,
      activeDrivers: drivers.filter(d => d.activo).length,
      totalVehicles: vehicles.length,
      activeVehicles: vehicles.filter(v => v.activo).length,
      totalTrips: trips.length,
      activeTrips: activeTrips.length,
      completedTrips: completedTrips.length,
      totalAlerts: alerts.length,
      todayAlerts: todayAlerts.length,
      alertsByType,
      recentAlerts: alerts.slice(0, 10),
      drivers,
      vehicles,
      trips: activeTrips,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
}

export async function fetchAlertsByTrip(tripId) {
  const response = await fetch(`${API_BASE}/alertas/?viaje_id=${tripId}`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response);
    throw new Error(errorMessage);
  }
  return response.json();
}

export async function fetchTripDetails(tripId) {
  const response = await fetch(`${API_BASE}/viajes/${tripId}`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response);
    throw new Error(errorMessage);
  }
  return response.json();
}
