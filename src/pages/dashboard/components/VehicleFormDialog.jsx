import {
    Alert,
    Button,
    Dialog,
    DialogBody,
    DialogFooter,
    DialogHeader,
    Input,
} from "@material-tailwind/react";

export function VehicleFormDialog({
  open,
  onClose,
  vehicleName,
  setVehicleName,
  vehiclePlate,
  setVehiclePlate,
  successMessage,
  error,
  creating,
  onCreate,
}) {
  return (
    <Dialog open={open} handler={onClose}>
      <DialogHeader>Agregar vehículo</DialogHeader>
      <DialogBody>
        <div className="flex flex-col gap-4">
          <Input
            label="Nombre del vehículo"
            value={vehicleName}
            onChange={(e) => setVehicleName(e.target.value)}
          />
          <Input
            label="Placa (opcional)"
            value={vehiclePlate}
            onChange={(e) => setVehiclePlate(e.target.value)}
          />
          {successMessage && (
            <Alert color="green" className="text-xs">
              {successMessage}
            </Alert>
          )}
          {error && (
            <Alert color="red" className="text-xs">
              {error}
            </Alert>
          )}
        </div>
      </DialogBody>
      <DialogFooter className="space-x-2">
        <Button variant="text" color="blue-gray" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          variant="gradient"
          color="green"
          onClick={onCreate}
          disabled={creating}
        >
          {creating ? "Guardando..." : "Guardar"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

export default VehicleFormDialog;
