import { fetchRecentAlerts } from "@/api/client";
import { ExclamationTriangleIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Typography,
} from "@material-tailwind/react";
import React from "react";

export function Notifications() {
  const [alerts, setAlerts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [dismissedAlerts, setDismissedAlerts] = React.useState(new Set());

  const loadAlerts = React.useCallback(async () => {
    try {
      setError(null);
      const data = await fetchRecentAlerts(50);
      setAlerts(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Error al cargar alertas");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadAlerts();
    // Refresh alerts every 5 seconds
    const interval = setInterval(loadAlerts, 5000);
    return () => clearInterval(interval);
  }, [loadAlerts]);

  const getAlertColor = (tipoAlerta) => {
    switch (tipoAlerta?.toUpperCase()) {
      case "DROWSINESS":
      case "SOMNOLENCIA":
        return "red";
      case "YAWNING":
      case "BOSTEZO":
        return "orange";
      case "HEAD_TILT":
      case "CABEZA_INCLINADA":
        return "yellow";
      default:
        return "blue";
    }
  };

  const getAlertIcon = (tipoAlerta) => {
    return <ExclamationTriangleIcon strokeWidth={2} className="h-6 w-6" />;
  };

  const handleDismiss = (alertaId) => {
    setDismissedAlerts((prev) => new Set([...prev, alertaId]));
  };

  const visibleAlerts = alerts.filter(
    (alert) => !dismissedAlerts.has(alert.id_alerta)
  );

  return (
    <div className="mx-auto my-20 flex max-w-screen-lg flex-col gap-8">
      <Card>
        <CardHeader
          color="transparent"
          floated={false}
          shadow={false}
          className="m-0 p-4 flex items-center justify-between"
        >
          <Typography variant="h5" color="blue-gray">
            Alertas de Somnolencia
          </Typography>
          <Button
            size="sm"
            variant="outlined"
            onClick={loadAlerts}
            disabled={loading}
          >
            {loading ? "Cargando..." : "Actualizar"}
          </Button>
        </CardHeader>
        <CardBody className="flex flex-col gap-4 p-4">
          {error && (
            <Alert color="red" icon={<InformationCircleIcon />}>
              {error}
            </Alert>
          )}
          {loading && alerts.length === 0 ? (
            <Typography className="text-center text-blue-gray-500">
              Cargando alertas...
            </Typography>
          ) : visibleAlerts.length === 0 ? (
            <Alert color="green" icon={<InformationCircleIcon />}>
              No hay alertas recientes. Todo está en orden.
            </Alert>
          ) : (
            visibleAlerts.map((alert) => {
              const color = getAlertColor(alert.tipo_alerta);
              const timestamp = new Date(alert.timestamp).toLocaleString("es-ES");

              return (
                <Alert
                  key={alert.id_alerta}
                  color={color}
                  icon={getAlertIcon(alert.tipo_alerta)}
                  open={!dismissedAlerts.has(alert.id_alerta)}
                  onClose={() => handleDismiss(alert.id_alerta)}
                >
                  <div className="flex flex-col gap-1">
                    <Typography variant="h6" className="font-bold">
                      {alert.tipo_alerta}
                    </Typography>
                    {alert.nivel_somnolencia && (
                      <Typography variant="small" className="font-medium">
                        Nivel: {alert.nivel_somnolencia}
                      </Typography>
                    )}
                    <Typography variant="small" className="text-blue-gray-600">
                      Viaje #{alert.id_viaje} • {timestamp}
                    </Typography>
                  </div>
                </Alert>
              );
            })
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default Notifications;
