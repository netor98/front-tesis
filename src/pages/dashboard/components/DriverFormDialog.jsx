import {
    Button,
    Dialog,
    DialogBody,
    DialogFooter,
    DialogHeader,
    Input,
    Switch,
    Typography,
} from "@material-tailwind/react";
import React from "react";

export function DriverFormDialog({
  open,
  onClose,
  onSubmit,
  driver = null, // null for create, driver object for edit
  loading = false,
  error = "",
  successMessage = "",
}) {
  const isEditMode = driver !== null;
  const [nombre, setNombre] = React.useState("");
  const [condicionMedica, setCondicionMedica] = React.useState("");
  const [horarioRiesgo, setHorarioRiesgo] = React.useState("");
  const [activo, setActivo] = React.useState(true);

  // Reset form when dialog opens or driver changes
  React.useEffect(() => {
    if (open) {
      if (driver) {
        setNombre(driver.nombre || "");
        setCondicionMedica(driver.condicion_medica || "");
        setHorarioRiesgo(driver.horario_riesgo || "");
        setActivo(driver.activo !== undefined ? driver.activo : true);
      } else {
        setNombre("");
        setCondicionMedica("");
        setHorarioRiesgo("");
        setActivo(true);
      }
    }
  }, [open, driver]);

  const handleSubmit = () => {
    if (!nombre.trim()) return;
    onSubmit({
      nombre: nombre.trim(),
      condicion_medica: condicionMedica.trim() || null,
      horario_riesgo: horarioRiesgo.trim() || null,
      activo,
    });
  };

  return (
    <Dialog open={open} handler={onClose} size="sm">
      <DialogHeader>
        {isEditMode ? "Editar Conductor" : "Nuevo Conductor"}
      </DialogHeader>
      <DialogBody className="flex flex-col gap-4">
        <div>
          <Typography variant="small" color="blue-gray" className="mb-1 font-medium">
            Nombre *
          </Typography>
          <Input
            label="Nombre del conductor"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            disabled={loading}
          />
        </div>
        <div>
          <Typography variant="small" color="blue-gray" className="mb-1 font-medium">
            Condición Médica
          </Typography>
          <Input
            label="Ej: diabetes, hipertensión"
            value={condicionMedica}
            onChange={(e) => setCondicionMedica(e.target.value)}
            disabled={loading}
          />
        </div>
        <div>
          <Typography variant="small" color="blue-gray" className="mb-1 font-medium">
            Horario de Riesgo
          </Typography>
          <Input
            label="Ej: nocturno, madrugada"
            value={horarioRiesgo}
            onChange={(e) => setHorarioRiesgo(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="flex items-center gap-3">
          <Switch
            id="driver-active"
            checked={activo}
            onChange={() => setActivo(!activo)}
            disabled={loading}
            color="green"
          />
          <Typography variant="small" color="blue-gray" className="font-medium">
            Conductor Activo
          </Typography>
        </div>
        {error && (
          <Typography color="red" className="text-sm">
            {error}
          </Typography>
        )}
        {successMessage && (
          <Typography color="green" className="text-sm">
            {successMessage}
          </Typography>
        )}
      </DialogBody>
      <DialogFooter className="gap-2">
        <Button variant="text" color="gray" onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          color="green"
          onClick={handleSubmit}
          disabled={loading || !nombre.trim()}
        >
          {loading ? "Guardando..." : isEditMode ? "Actualizar" : "Crear"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

export default DriverFormDialog;
