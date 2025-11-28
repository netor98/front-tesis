export const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function fetchDrivers() {
  const response = await fetch(`${API_BASE}/conductores/?limit=100`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to fetch drivers: ${response.status} ${text}`);
  }
  return response.json();
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
    const text = await response.text();
    throw new Error(`Failed to fetch trips: ${response.status} ${text}`);
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
    const text = await response.text();
    throw new Error(`Failed to fetch active trip: ${response.status} ${text}`);
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
    const text = await response.text();
    throw new Error(`Failed to start trip: ${response.status} ${text}`);
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
    const text = await response.text();
    throw new Error(`Failed to end trip: ${response.status} ${text}`);
  }
  return response.json();
}

export async function fetchRecentAlerts(limit = 20) {
  const response = await fetch(`${API_BASE}/alertas/recientes?limit=${limit}`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to fetch alerts: ${response.status} ${text}`);
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
    const text = await response.text();
    throw new Error(`Failed to fetch trip stats: ${response.status} ${text}`);
  }
  return response.json();
}

export async function fetchVehicles(skip = 0, limit = 100) {
  const response = await fetch(`${API_BASE}/vehiculos/?skip=${skip}&limit=${limit}`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to fetch vehicles: ${response.status} ${text}`);
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
    const text = await response.text();
    throw new Error(`Failed to create vehicle: ${response.status} ${text}`);
  }
  return response.json();
}


