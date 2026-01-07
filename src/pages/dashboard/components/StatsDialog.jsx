import {
  Button,
  Chip,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Tab,
  TabPanel,
  Tabs,
  TabsBody,
  TabsHeader,
  Typography,
} from "@material-tailwind/react";
import {
  AlertsBarChart,
  DurationChart,
  EventsDonutChart,
  HeartRateChart,
  StatsSummaryCards,
} from "./StatsCharts";

const formatDate = (value) => {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("es-ES");
  } catch (e) {
    return value;
  }
};

const formatNumber = (value, digits = 2) => {
  if (value === null || value === undefined) return "—";
  return Number(value).toFixed(digits);
};

function StatsTable({ statsData }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] table-auto">
        <thead>
          <tr>
            {[
              "Viaje",
              "Vehículo",
              "Inicio",
              "Fin",
              "Duración (min)",
              "Lecturas",
              "Alertas",
              "Cabeceos",
              "Bostezos",
              "FC Promedio",
            ].map((header) => (
              <th
                key={header}
                className="border-b border-blue-gray-50 py-3 px-4 text-left"
              >
                <Typography
                  variant="small"
                  className="text-[11px] font-bold uppercase text-blue-gray-400"
                >
                  {header}
                </Typography>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {statsData.map(({ trip, stats, error: tripError }) => (
            <tr key={trip.id_viaje} className="border-b border-blue-gray-50">
              <td className="py-3 px-4">
                <Typography className="text-xs font-semibold text-blue-gray-700">
                  #{trip.id_viaje}
                </Typography>
              </td>
              <td className="py-3 px-4">
                <Typography className="text-xs text-blue-gray-600">
                  {trip.vehiculo?.nombre || "—"}
                </Typography>
              </td>
              <td className="py-3 px-4">
                <Typography className="text-xs text-blue-gray-600">
                  {formatDate(trip.fecha_inicio)}
                </Typography>
              </td>
              <td className="py-3 px-4">
                <Typography className="text-xs text-blue-gray-600">
                  {formatDate(trip.fecha_fin)}
                </Typography>
              </td>
              <td className="py-3 px-4">
                <Typography className="text-xs text-blue-gray-600">
                  {stats ? formatNumber(stats.duracion_minutos) : "—"}
                </Typography>
              </td>
              <td className="py-3 px-4">
                <Typography className="text-xs text-blue-gray-600">
                  {stats ? stats.total_lecturas : "—"}
                </Typography>
              </td>
              <td className="py-3 px-4">
                <Chip
                  size="sm"
                  variant="ghost"
                  color={stats?.total_alertas > 0 ? "red" : "green"}
                  value={stats ? stats.total_alertas : "—"}
                  className="text-xs"
                />
              </td>
              <td className="py-3 px-4">
                <Chip
                  size="sm"
                  variant="ghost"
                  color={stats?.total_cabeceos > 0 ? "orange" : "green"}
                  value={stats ? stats.total_cabeceos : "—"}
                  className="text-xs"
                />
              </td>
              <td className="py-3 px-4">
                <Chip
                  size="sm"
                  variant="ghost"
                  color={stats?.total_bostezos > 0 ? "blue" : "green"}
                  value={stats ? stats.total_bostezos : "—"}
                  className="text-xs"
                />
              </td>
              <td className="py-3 px-4">
                {tripError ? (
                  <Typography className="text-[11px] text-red-500">
                    {tripError}
                  </Typography>
                ) : (
                  <Typography className="text-xs text-blue-gray-600">
                    {stats ? formatNumber(stats.frecuencia_cardiaca_promedio) : "—"}
                  </Typography>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StatsDialog({
  open,
  onClose,
  driver,
  statsData,
  loading,
  error,
}) {
  return (
    <Dialog open={open} handler={onClose} size="xl">
      <DialogHeader>
        Historial de viajes {driver ? `- ${driver.nombre}` : ""}
      </DialogHeader>
      <DialogBody className="max-h-[36rem] overflow-y-auto">
        {loading ? (
          <Typography className="text-sm text-blue-gray-600">
            Cargando historial de viajes...
          </Typography>
        ) : error ? (
          <Typography className="text-sm text-red-600">{error}</Typography>
        ) : statsData.length === 0 ? (
          <Typography className="text-sm text-blue-gray-600">
            No hay viajes finalizados para este conductor.
          </Typography>
        ) : (
          <Tabs value="charts">
            <TabsHeader>
              <Tab value="charts"> Gráficos</Tab>
              <Tab value="table">Tabla</Tab>
            </TabsHeader>
            <TabsBody>
              <TabPanel value="charts" className="p-0 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AlertsBarChart statsData={statsData} />
                  <HeartRateChart statsData={statsData} />
                  <DurationChart statsData={statsData} />
                  <EventsDonutChart statsData={statsData} />
                </div>
                <StatsSummaryCards statsData={statsData} />
              </TabPanel>
              <TabPanel value="table" className="p-0 pt-4">
                <StatsTable statsData={statsData} />
              </TabPanel>
            </TabsBody>
          </Tabs>
        )}
      </DialogBody>
      <DialogFooter>
        <Button variant="text" color="red" onClick={onClose} className="mr-1">
          <span>Cerrar</span>
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

export default StatsDialog;
