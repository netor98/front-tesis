import {
    Button,
    Card,
    CardBody,
    Chip,
    Typography,
} from "@material-tailwind/react";

export function VehiclesTable({
  vehicles,
  loading,
  onAddVehicle,
}) {
  return (
    <Card>
      <CardBody className="px-0 pt-0 pb-2">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <Typography variant="h6" color="blue-gray">
              Vehículos registrados
            </Typography>
            <Typography variant="small" color="blue-gray">
              Usa el token para configurar la Raspberry asociada
            </Typography>
          </div>
          <Button size="sm" color="blue" onClick={onAddVehicle}>
            Agregar vehículo
          </Button>
        </div>
        {loading ? (
          <Typography className="px-6 pb-4 text-sm text-blue-gray-600">
            Cargando vehículos...
          </Typography>
        ) : vehicles.length === 0 ? (
          <Typography className="px-6 pb-4 text-sm text-blue-gray-600">
            No hay vehículos registrados.
          </Typography>
        ) : (
          <div className="overflow-x-auto px-6 pb-4">
            <table className="w-full min-w-[640px] table-auto">
              <thead>
                <tr>
                  {["Nombre", "Placa", "Token dispositivo", "Estado"].map(
                    (header) => (
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
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {vehicles.map(
                  ({ id_vehiculo, nombre, placa, token_dispositivo, activo }, idx) => {
                    const className = `py-3 px-4 ${
                      idx === vehicles.length - 1
                        ? ""
                        : "border-b border-blue-gray-50"
                    }`;
                    return (
                      <tr key={id_vehiculo}>
                        <td className={className}>
                          <Typography className="text-xs font-semibold text-blue-gray-700">
                            {nombre}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Typography className="text-xs text-blue-gray-600">
                            {placa || "—"}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Typography className="text-xs font-mono text-blue-gray-600">
                            {token_dispositivo}
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
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

export default VehiclesTable;
