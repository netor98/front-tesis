import {
  PencilIcon
} from "@heroicons/react/24/outline";
import {
  Button,
  Card,
  CardBody,
  Chip,
  IconButton,
  Tooltip,
  Typography,
} from "@material-tailwind/react";

export function DriversTable({
  drivers,
  loading,
  error,
  activeTrips,
  processingTrip,
  vehicles,
  onStartTrip,
  onEndTrip,
  onViewStats,
  onEditDriver,
  onDeleteDriver,
  onAddDriver,
}) {
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold">Conductores registrados</h3>
        <Button color="green" onClick={onAddDriver}>
          + Nuevo Conductor
        </Button>
      </div>
      <Card>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          {loading && (
            <div className="p-6">
              <Typography className="text-sm text-blue-gray-600">
                Cargando conductores...
              </Typography>
            </div>
          )}
          {error && !loading && (
            <div className="p-6">
              <Typography className="text-sm text-red-600">{error}</Typography>
            </div>
          )}
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {["Nombre", "Condición Médica", "Horario Riesgo", "Estado", "Vehículo", "Viaje Activo", "Acciones"].map(
                  (el) => (
                    <th
                      key={el}
                      className="border-b border-blue-gray-50 py-3 px-5 text-left"
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
              {drivers.map(
                ({ id_conductor, nombre, condicion_medica, horario_riesgo, activo }, key) => {
                  const className = `py-3 px-5 ${
                    key === drivers.length - 1 ? "" : "border-b border-blue-gray-50"
                  }`;
                  const activeTrip = activeTrips[id_conductor];
                  const isProcessing = processingTrip === id_conductor;

                  return (
                    <tr key={id_conductor}>
                      <td className={className}>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-semibold"
                        >
                          {nombre}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-normal text-blue-gray-500">
                          {condicion_medica || "—"}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-normal text-blue-gray-500">
                          {horario_riesgo || "—"}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Chip
                          variant="gradient"
                          color={activo ? "green" : "blue-gray"}
                          value={activo ? "activo" : "inactivo"}
                          className="py-0.5 px-2 text-[11px] font-medium w-fit"
                        />
                      </td>
                      <td className={className}>
                        {activeTrip && activeTrip.vehiculo ? (
                          <Typography className="text-xs font-semibold text-blue-gray-600">
                            {activeTrip.vehiculo.nombre}
                          </Typography>
                        ) : (
                          <Typography className="text-xs font-semibold text-blue-gray-400">
                            —
                          </Typography>
                        )}
                      </td>
                      <td className={className}>
                        {activeTrip ? (
                          <Chip
                            variant="gradient"
                            color="green"
                            value={`Viaje #${activeTrip.id_viaje} activo`}
                            className="py-0.5 px-2 text-[11px] font-medium w-fit"
                          />
                        ) : (
                          <Typography className="text-xs font-semibold text-blue-gray-400">
                            Sin viaje activo
                          </Typography>
                        )}
                      </td>
                      <td className={className}>
                        <div className="flex gap-2 items-center">
                          {activeTrip ? (
                            <Button
                              size="sm"
                              color="red"
                              variant="outlined"
                              onClick={() =>
                                onEndTrip(activeTrip.id_viaje, id_conductor)
                              }
                              disabled={isProcessing}
                              className="text-xs"
                            >
                              {isProcessing ? "..." : "Finalizar"}
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              color="green"
                              onClick={() => onStartTrip({ id_conductor, nombre })}
                              disabled={
                                isProcessing || !activo || vehicles.length === 0
                              }
                              className="text-xs"
                            >
                              {isProcessing ? "..." : "Iniciar"}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="text"
                            onClick={() => onViewStats({ id_conductor, nombre })}
                            className="text-xs"
                          >
                            Stats
                          </Button>
                          <Tooltip content="Editar conductor">
                            <IconButton
                              variant="text"
                              color="blue-gray"
                              onClick={() =>
                                onEditDriver({ id_conductor, nombre, condicion_medica, horario_riesgo, activo })
                              }
                            >
                              <PencilIcon className="h-4 w-4" />
                            </IconButton>
                          </Tooltip>
                          {/* <Tooltip content="Eliminar conductor">
                            <IconButton
                              variant="text"
                              color="red"
                              onClick={() =>
                                onDeleteDriver({ id_conductor, nombre, condicion_medica, horario_riesgo, activo })
                              }
                              disabled={!!activeTrip}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </IconButton>
                          </Tooltip> */}
                        </div>
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </>
  );
}

export default DriversTable;
