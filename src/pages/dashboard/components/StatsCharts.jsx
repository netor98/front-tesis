import { Card, CardBody, Typography } from "@material-tailwind/react";
import Chart from "react-apexcharts";

const CHART_COLORS = {
  alerts: "#f7803c",
  headNods: "#2e0d23",
  yawns: "#f54828",
};

export function AlertsBarChart({ statsData }) {
  return (
    <Card className="border border-blue-gray-100 shadow-sm">
      <CardBody>
        <Typography variant="h6" color="blue-gray" className="mb-2">
          Alertas por Viaje
        </Typography>
        <Chart
          type="bar"
          height={240}
          series={[
            {
              name: "Alertas",
              data: statsData.map(({ stats }) => stats?.total_alertas || 0),
            },
            {
              name: "Cabeceos",
              data: statsData.map(({ stats }) => stats?.total_cabeceos || 0),
            },
            {
              name: "Bostezos",
              data: statsData.map(({ stats }) => stats?.total_bostezos || 0),
            },
          ]}
          options={{
            chart: { toolbar: { show: false } },
            colors: [CHART_COLORS.alerts, CHART_COLORS.headNods, CHART_COLORS.yawns],
            plotOptions: {
              bar: { columnWidth: "60%", borderRadius: 4 },
            },
            xaxis: {
              categories: statsData.map(({ trip }) => `#${trip.id_viaje}`),
              labels: { style: { colors: "#616161", fontSize: "11px" } },
            },
            yaxis: {
              labels: { style: { colors: "#616161", fontSize: "11px" } },
            },
            grid: { borderColor: "#e7e7e7", strokeDashArray: 3 },
            legend: { position: "top", fontSize: "12px" },
            dataLabels: { enabled: false },
          }}
        />
      </CardBody>
    </Card>
  );
}

export function HeartRateChart({ statsData }) {
  return (
    <Card className="border border-blue-gray-100 shadow-sm">
      <CardBody>
        <Typography variant="h6" color="blue-gray" className="mb-2">
          Frecuencia Cardíaca Promedio
        </Typography>
        <Chart
          type="line"
          height={240}
          series={[
            {
              name: "FC Promedio",
              data: statsData.map(({ stats }) =>
                stats?.frecuencia_cardiaca_promedio
                  ? Number(stats.frecuencia_cardiaca_promedio).toFixed(1)
                  : 0
              ),
            },
          ]}
          options={{
            chart: { toolbar: { show: false } },
            colors: [CHART_COLORS.yawns],
            stroke: { curve: "smooth", width: 3 },
            markers: {
              size: 5,
              colors: [CHART_COLORS.headNods],
              strokeColors: "#fff",
              strokeWidth: 2,
            },
            xaxis: {
              categories: statsData.map(({ trip }) => `#${trip.id_viaje}`),
              labels: { style: { colors: "#616161", fontSize: "11px" } },
            },
            yaxis: {
              labels: {
                style: { colors: "#616161", fontSize: "11px" },
                formatter: (val) => `${val} bpm`,
              },
            },
            grid: { borderColor: "#e7e7e7", strokeDashArray: 3 },
            dataLabels: { enabled: false },
          }}
        />
      </CardBody>
    </Card>
  );
}

export function DurationChart({ statsData }) {
  return (
    <Card className="border border-blue-gray-100 shadow-sm">
      <CardBody>
        <Typography variant="h6" color="blue-gray" className="mb-2">
          Duración de Viajes (min)
        </Typography>
        <Chart
          type="area"
          height={240}
          series={[
            {
              name: "Duración",
              data: statsData.map(({ stats }) =>
                stats?.duracion_minutos
                  ? Number(stats.duracion_minutos).toFixed(1)
                  : 0
              ),
            },
          ]}
          options={{
            chart: { toolbar: { show: false } },
            colors: [CHART_COLORS.headNods],
            fill: {
              type: "gradient",
              gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.3 },
            },
            stroke: { curve: "smooth", width: 2 },
            xaxis: {
              categories: statsData.map(({ trip }) => `#${trip.id_viaje}`),
              labels: { style: { colors: "#616161", fontSize: "11px" } },
            },
            yaxis: {
              labels: {
                style: { colors: "#616161", fontSize: "11px" },
                formatter: (val) => `${val} min`,
              },
            },
            grid: { borderColor: "#e7e7e7", strokeDashArray: 3 },
            dataLabels: { enabled: false },
          }}
        />
      </CardBody>
    </Card>
  );
}

export function EventsDonutChart({ statsData }) {
  const totalAlerts = statsData.reduce((acc, { stats }) => acc + (stats?.total_alertas || 0), 0);
  const totalHeadNods = statsData.reduce((acc, { stats }) => acc + (stats?.total_cabeceos || 0), 0);
  const totalYawns = statsData.reduce((acc, { stats }) => acc + (stats?.total_bostezos || 0), 0);

  return (
    <Card className="border border-blue-gray-100 shadow-sm">
      <CardBody>
        <Typography variant="h6" color="blue-gray" className="mb-2">
          Resumen Total de Eventos
        </Typography>
        <Chart
          type="donut"
          height={240}
          series={[totalAlerts, totalHeadNods, totalYawns]}
          options={{
            labels: ["Alertas", "Cabeceos", "Bostezos"],
            colors: [CHART_COLORS.alerts, CHART_COLORS.headNods, CHART_COLORS.yawns],
            legend: { position: "bottom", fontSize: "12px" },
            plotOptions: {
              pie: {
                donut: {
                  size: "60%",
                  labels: {
                    show: true,
                    total: {
                      show: true,
                      label: "Total Eventos",
                      fontSize: "12px",
                      color: "#616161",
                    },
                  },
                },
              },
            },
            dataLabels: {
              enabled: true,
              formatter: (val) => `${val.toFixed(0)}%`,
            },
          }}
        />
      </CardBody>
    </Card>
  );
}

export function StatsSummaryCards({ statsData }) {
  const totalAlerts = statsData.reduce((acc, { stats }) => acc + (stats?.total_alertas || 0), 0);
  const totalHeadNods = statsData.reduce((acc, { stats }) => acc + (stats?.total_cabeceos || 0), 0);
  const totalYawns = statsData.reduce((acc, { stats }) => acc + (stats?.total_bostezos || 0), 0);

  const cards = [
    { value: totalAlerts, label: "Alertas Totales", bgColor: "bg-red-50", borderColor: "border-red-100" },
    { value: totalHeadNods, label: "Cabeceos Totales", bgColor: "bg-orange-50", borderColor: "border-orange-100" },
    { value: totalYawns, label: "Bostezos Totales", bgColor: "bg-blue-50", borderColor: "border-blue-100" },
    { value: statsData.length, label: "Viajes Completados", bgColor: "bg-green-50", borderColor: "border-green-100" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
      {cards.map(({ value, label, bgColor, borderColor }) => (
        <Card key={label} className={`${bgColor} border ${borderColor}`}>
          <CardBody className="p-4 text-center">
            <Typography variant="h4">{value}</Typography>
            <Typography variant="small" color="blue-gray">
              {label}
            </Typography>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
