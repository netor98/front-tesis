import {
    Button,
    Dialog,
    DialogBody,
    DialogFooter,
    DialogHeader,
    Typography,
} from "@material-tailwind/react";

export function DriverDeleteDialog({
  open,
  onClose,
  onConfirm,
  driver,
  loading = false,
  error = "",
}) {
  return (
    <Dialog open={open} handler={onClose} size="sm">
      <DialogHeader>Eliminar Conductor</DialogHeader>
      <DialogBody>
        <Typography color="blue-gray">
          ¿Estás seguro de que deseas eliminar al conductor{" "}
          <span className="font-semibold">{driver?.nombre}</span>?
        </Typography>
        <Typography color="blue-gray" className="mt-2 text-sm">
          Esta acción no se puede deshacer. Si el conductor tiene viajes
          asociados, estos también podrían verse afectados.
        </Typography>
        {error && (
          <Typography color="red" className="mt-2 text-sm">
            {error}
          </Typography>
        )}
      </DialogBody>
      <DialogFooter className="gap-2">
        <Button variant="text" color="gray" onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button color="red" onClick={onConfirm} disabled={loading}>
          {loading ? "Eliminando..." : "Eliminar"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

export default DriverDeleteDialog;
