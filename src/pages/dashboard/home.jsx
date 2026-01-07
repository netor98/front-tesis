
import { fetchDashboardStats } from "@/api/client";
import { StatisticsCard } from "@/widgets/cards";
import { StatisticsChart } from "@/widgets/charts";
import {
    ArrowUpIcon,
    BellAlertIcon,
    CheckCircleIcon,
    EllipsisVerticalIcon,
    ExclamationTriangleIcon,
    EyeSlashIcon,
    TruckIcon,
    UserGroupIcon,
} from "@heroicons/react/24/outline";
import { ClockIcon } from "@heroicons/react/24/solid";
import {
    Avatar,
    Card,
    CardBody,
    CardHeader,
    Chip,
    IconButton,
    Menu,
    MenuHandler,
    MenuItem,
    MenuList,
    Spinner,
    Typography
} from "@material-tailwind/react";
import React from "react";

// Helper function to get alert icon and color based on type
const getAlertIconConfig = (tipoAlerta) => {
  const type = tipoAlerta?.toLowerCase() || "";
  if (type.includes("microsueño") || type.includes("microsleep") || type.includes("critico") || type.includes("critical")) {
    return { icon: ExclamationTriangleIcon, color: "text-red-500" };
  }
  if (type.includes("bostezo") || type.includes("yawn") || type.includes("advertencia") || type.includes("warning")) {
    return { icon: BellAlertIcon, color: "text-orange-500" };
  }
  if (type.includes("cabeceo") || type.includes("nod") || type.includes("head")) {
    return { icon: EyeSlashIcon, color: "text-amber-500" };
  }
  return { icon: BellAlertIcon, color: "text-blue-gray-500" };
};

// Format relative time
const formatRelativeTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Hace un momento";
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? "s" : ""}`;
  return `Hace ${diffDays} día${diffDays > 1 ? "s" : ""}`;
};

export function Home() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [stats, setStats] = React.useState(null);

  React.useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError("");
        const dashboardStats = await fetchDashboardStats();
        setStats(dashboardStats);
      } catch (e) {
        setError(e.message || "Error al cargar datos del dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
    // Refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) {
    return (
      <div className="mt-12 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Spinner className="h-12 w-12 mx-auto mb-4" />
          <Typography color="blue-gray">Cargando dashboard...</Typography>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="mt-12 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Typography color="red" className="mb-2">{error}</Typography>
          <Typography color="blue-gray" variant="small">
            Verifica que el servidor backend esté ejecutándose
          </Typography>
        </div>
      </div>
    );
  }

  // Build statistics cards from real data
  const drowsinessStatsData = [
    {
      color: "blue",
      icon: UserGroupIcon,
      title: "Conductores Activos",
      value: stats?.activeDrivers?.toString() || "0",
      footer: {
        color: "text-blue-500",
        value: `${stats?.totalDrivers || 0}`,
        label: "conductores registrados",
      },
    },
    {
      color: "green",
      icon: TruckIcon,
      title: "Viajes Activos",
      value: stats?.activeTrips?.toString() || "0",
      footer: {
        color: "text-green-500",
        value: `${stats?.completedTrips || 0}`,
        label: "viajes completados",
      },
    },
    {
      color: "red",
      icon: EyeSlashIcon,
      title: "Alertas del Sistema",
      value: stats?.totalAlerts?.toString() || "0",
      footer: {
        color: stats?.todayAlerts > 0 ? "text-red-500" : "text-green-500",
        value: `${stats?.todayAlerts || 0}`,
        label: "alertas hoy",
      },
    },
    {
      color: "orange",
      icon: BellAlertIcon,
      title: "Vehículos Activos",
      value: stats?.activeVehicles?.toString() || "0",
      footer: {
        color: "text-blue-500",
        value: `${stats?.totalVehicles || 0}`,
        label: "vehículos registrados",
      },
    },
  ];

  // Build chart data from real alerts
  const alertsByType = stats?.alertsByType || {};
  const alertLabels = Object.keys(alertsByType);
  const alertValues = Object.values(alertsByType);

  const drowsinessChartsData = [
    {
      color: "white",
      title: "Alertas por Tipo",
      description: "Distribución de alertas en el sistema",
      footer: "Datos en tiempo real",
      chart: {
        type: "bar",
        height: 220,
        series: [
          {
            name: "Alertas",
            data: alertValues.length > 0 ? alertValues : [0],
          },
        ],
        options: {
          colors: ["#ef4444"],
          plotOptions: {
            bar: { columnWidth: "50%", borderRadius: 4 },
          },
          xaxis: {
            categories: alertLabels.length > 0 ? alertLabels : ["Sin alertas"],
          },
        },
      },
    },
    {
      color: "white",
      title: "Estado de Conductores",
      description: "Conductores activos vs inactivos",
      footer: "Datos en tiempo real",
      chart: {
        type: "pie",
        height: 220,
        series: [stats?.activeDrivers || 0, (stats?.totalDrivers || 0) - (stats?.activeDrivers || 0)],
        options: {
          labels: ["Activos", "Inactivos"],
          colors: ["#22c55e", "#94a3b8"],
        },
      },
    },
    {
      color: "white",
      title: "Estado de Viajes",
      description: "Viajes activos vs completados",
      footer: "Datos en tiempo real",
      chart: {
        type: "pie",
        height: 220,
        series: [stats?.activeTrips || 0, stats?.completedTrips || 0],
        options: {
          labels: ["En curso", "Completados"],
          colors: ["#3b82f6", "#22c55e"],
        },
      },
    },
  ];

  // Build driver status table from real active trips
  const activeTripsWithDrivers = (stats?.trips || []).map((trip) => {
    const driver = stats?.drivers?.find((d) => d.id_conductor === trip.id_conductor);
    const vehicle = trip.vehiculo;
    return {
      id: trip.id_viaje,
      name: driver?.nombre || `Conductor ${trip.id_conductor}`,
      vehicleId: vehicle?.nombre || vehicle?.placa || "Sin vehículo",
      status: "En viaje",
      condicionMedica: driver?.condicion_medica,
      startTime: trip.fecha_inicio,
    };
  });

  // Build alert log from real recent alerts
  const alertLogData = (stats?.recentAlerts || []).map((alert) => {
    const { icon, color } = getAlertIconConfig(alert.tipo_alerta);
    return {
      icon,
      color,
      title: alert.tipo_alerta || "Alerta",
      description: `Viaje #${alert.id_viaje} - ${formatRelativeTime(alert.timestamp)}`,
      nivel: alert.nivel_somnolencia,
    };
  });

  return (
    <div className="mt-12">
      {/* 1. TOP CARDS - STATISTICS */}
      <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4">
        {drowsinessStatsData.map(({ icon, title, footer, ...rest }) => (
          <StatisticsCard
            key={title}
            {...rest}
            title={title}
            icon={React.createElement(icon, {
              className: "w-6 h-6 text-white",
            })}
            footer={
              <Typography className="font-normal text-blue-gray-600">
                <strong className={footer.color}>{footer.value}</strong>
                &nbsp;{footer.label}
              </Typography>
            }
          />
        ))}
      </div>

      {/* 2. MIDDLE CHARTS - TRENDS */}
      <div className="mb-6 grid grid-cols-1 gap-y-12 gap-x-6 md:grid-cols-2 xl:grid-cols-3">
        {drowsinessChartsData.map((props) => (
          <StatisticsChart
            key={props.title}
            {...props}
            footer={
              <Typography
                variant="small"
                className="flex items-center font-normal text-blue-gray-600"
              >
                <ClockIcon strokeWidth={2} className="h-4 w-4 text-blue-gray-400" />
                &nbsp;{props.footer}
              </Typography>
            }
          />
        ))}
      </div>

      {/* 3. BOTTOM SECTION - DRIVER TABLE & ALERTS */}
      <div className="mb-4 grid grid-cols-1 gap-6 xl:grid-cols-3">

        {/* DRIVER STATUS TABLE - Active Trips */}
        <Card className="overflow-hidden xl:col-span-2 border border-blue-gray-100 shadow-sm">
          <CardHeader
            floated={false}
            shadow={false}
            color="transparent"
            className="m-0 flex items-center justify-between p-6"
          >
            <div>
              <Typography variant="h6" color="blue-gray" className="mb-1">
                Viajes en Curso
              </Typography>
              <Typography
                variant="small"
                className="flex items-center gap-1 font-normal text-blue-gray-600"
              >
                <CheckCircleIcon strokeWidth={3} className="h-4 w-4 text-green-500" />
                <strong>{activeTripsWithDrivers.length} viajes</strong> activos actualmente
              </Typography>
            </div>
            <Menu placement="left-start">
              <MenuHandler>
                <IconButton size="sm" variant="text" color="blue-gray">
                  <EllipsisVerticalIcon
                    strokeWidth={3}
                    fill="currenColor"
                    className="h-6 w-6"
                  />
                </IconButton>
              </MenuHandler>
              <MenuList>
                <MenuItem>Ver todos los viajes</MenuItem>
                <MenuItem>Exportar reporte</MenuItem>
              </MenuList>
            </Menu>
          </CardHeader>
          <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
            <table className="w-full min-w-[640px] table-auto">
              <thead>
                <tr>
                  {["Conductor", "Vehículo", "Estado", "Inicio del Viaje"].map(
                    (el) => (
                      <th
                        key={el}
                        className="border-b border-blue-gray-50 py-3 px-6 text-left"
                      >
                        <Typography
                          variant="small"
                          className="text-[11px] font-bold uppercase text-blue-gray-400"
                        >
                          {el}
                        </Typography>
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {activeTripsWithDrivers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center">
                      <Typography color="blue-gray" className="text-sm">
                        No hay viajes activos en este momento
                      </Typography>
                    </td>
                  </tr>
                ) : (
                  activeTripsWithDrivers.map(
                    ({ id, name, vehicleId, status, condicionMedica, startTime }, key) => {
                      const className = `py-3 px-5 ${
                        key === activeTripsWithDrivers.length - 1
                          ? ""
                          : "border-b border-blue-gray-50"
                      }`;

                      return (
                        <tr key={id}>
                          <td className={className}>
                            <div className="flex items-center gap-4">
                              <Avatar
                                src={`/img/team-${(key % 4) + 1}.jpeg`}
                                alt={name}
                                size="sm"
                              />
                              <div>
                                <Typography
                                  variant="small"
                                  color="blue-gray"
                                  className="font-bold"
                                >
                                  {name}
                                </Typography>
                                {condicionMedica && (
                                  <Typography
                                    variant="small"
                                    className="text-xs text-blue-gray-400"
                                  >
                                    {condicionMedica}
                                  </Typography>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className={className}>
                            <Typography
                              variant="small"
                              className="text-xs font-medium text-blue-gray-600"
                            >
                              {vehicleId}
                            </Typography>
                          </td>
                          <td className={className}>
                            <Chip
                              variant="ghost"
                              size="sm"
                              value={status}
                              color="green"
                              className="w-fit"
                            />
                          </td>
                          <td className={className}>
                            <Typography
                              variant="small"
                              className="text-xs font-medium text-blue-gray-600"
                            >
                              {new Date(startTime).toLocaleString("es-ES", {
                                dateStyle: "short",
                                timeStyle: "short",
                              })}
                            </Typography>
                          </td>
                        </tr>
                      );
                    }
                  )
                )}
              </tbody>
            </table>
          </CardBody>
        </Card>

        {/* RECENT ALERTS */}
        <Card className="border border-blue-gray-100 shadow-sm">
          <CardHeader
            floated={false}
            shadow={false}
            color="transparent"
            className="m-0 p-6"
          >
            <Typography variant="h6" color="blue-gray" className="mb-2">
              Alertas Recientes
            </Typography>
            <Typography
              variant="small"
              className="flex items-center gap-1 font-normal text-blue-gray-600"
            >
              {stats?.todayAlerts > 0 ? (
                <>
                  <ArrowUpIcon
                    strokeWidth={3}
                    className="h-3.5 w-3.5 text-red-500"
                  />
                  <strong>{stats?.todayAlerts} alertas</strong> hoy
                </>
              ) : (
                <>
                  <CheckCircleIcon
                    strokeWidth={3}
                    className="h-3.5 w-3.5 text-green-500"
                  />
                  <strong>Sin alertas</strong> hoy
                </>
              )}
            </Typography>
          </CardHeader>
          <CardBody className="pt-0">
            {alertLogData.length === 0 ? (
              <Typography color="blue-gray" className="text-sm text-center py-4">
                No hay alertas recientes
              </Typography>
            ) : (
              alertLogData.map(
                ({ icon, color, title, description, nivel }, key) => (
                  <div key={`${title}-${key}`} className="flex items-start gap-4 py-3">
                    <div
                      className={`relative p-1 after:absolute after:-bottom-6 after:left-2/4 after:w-0.5 after:-translate-x-2/4 after:bg-blue-gray-50 after:content-[''] ${
                        key === alertLogData.length - 1
                          ? "after:h-0"
                          : "after:h-4/6"
                      }`}
                    >
                      {React.createElement(icon, {
                        className: `!w-5 !h-5 ${color}`,
                      })}
                    </div>
                    <div>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="block font-medium"
                      >
                        {title}
                        {nivel && (
                          <Chip
                            size="sm"
                            variant="ghost"
                            value={nivel}
                            color={nivel === "alto" ? "red" : nivel === "medio" ? "amber" : "blue"}
                            className="ml-2 inline-block"
                          />
                        )}
                      </Typography>
                      <Typography
                        as="span"
                        variant="small"
                        className="text-xs font-medium text-blue-gray-500"
                      >
                        {description}
                      </Typography>
                    </div>
                  </div>
                )
              )
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default Home;
