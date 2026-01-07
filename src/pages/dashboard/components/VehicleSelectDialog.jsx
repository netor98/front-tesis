import {
  Alert,
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Option,
  Select,
  Typography,
} from "@material-tailwind/react";

export function VehicleSelectDialog({
  open,
  onClose,
  vehicles,
  vehiclesLoading,
  selectedDriver,
  selectedVehicle,
  setSelectedVehicle,
  vehicleSelectionError,
  setVehicleSelectionError,
  onConfirm,
}) {
  return (
    <Dialog open={open} handler={onClose}>
      <DialogHeader>Seleccionar vehículo</DialogHeader>
      <DialogBody>
        {vehiclesLoading ? (
          <Typography className="text-sm text-blue-gray-600">
            Cargando vehículos...
          </Typography>
        ) : vehicles.length === 0 ? (
          <Typography className="text-sm text-blue-gray-600">
            No hay vehículos registrados. Agrega uno para iniciar viajes.
          </Typography>
        ) : (
          <div className="flex flex-col gap-4">
            <Typography variant="small" color="blue-gray">
              Conductor: {selectedDriver?.nombre}
            </Typography>
            <Select
              label="Vehículo asignado"
              value={selectedVehicle}
              onChange={(value) => {
                setSelectedVehicle(value);
                setVehicleSelectionError("");
              }}
            >
              {vehicles.map((vehicle) => (
                <Option key={vehicle.id_vehiculo} value={vehicle.id_vehiculo.toString()}>
                  {vehicle.nombre} {vehicle.placa ? `(${vehicle.placa})` : ""}
                </Option>
              ))}
            </Select>
            {vehicleSelectionError && (
              <Alert color="red" className="text-xs">
                {vehicleSelectionError}
              </Alert>
            )}
          </div>
        )}
      </DialogBody>
      <DialogFooter className="space-x-2">
        <Button variant="text" color="blue-gray" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          variant="gradient"
          color="green"
          onClick={onConfirm}
          disabled={vehicles.length === 0 || vehiclesLoading || !selectedDriver}
        >
          Iniciar
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

export default VehicleSelectDialog;
