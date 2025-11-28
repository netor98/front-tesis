import {
  createVehicle,
  endTrip,
  fetchActiveTripByDriver,
  fetchDrivers,
  fetchTripStats,
  fetchTripsByDriver,
  fetchVehicles,
  startTrip,
} from "@/api/client";
import {
  Alert,
  Button,
  Card,
  CardBody,
  Chip,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Input,
  Option,
  Select,
  Typography,
} from "@material-tailwind/react";
import React from "react";

export function Tables() {
  const [drivers, setDrivers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [activeTrips, setActiveTrips] = React.useState({});
  const [processingTrip, setProcessingTrip] = React.useState(null);
  const [statsOpen, setStatsOpen] = React.useState(false);
  const [statsDriver, setStatsDriver] = React.useState(null);
  const [statsData, setStatsData] = React.useState([]);
  const [statsLoading, setStatsLoading] = React.useState(false);
  const [statsError, setStatsError] = React.useState("");
  const [vehicles, setVehicles] = React.useState([]);
  const [vehiclesLoading, setVehiclesLoading] = React.useState(true);
  const [vehicleError, setVehicleError] = React.useState("");
  const [vehicleDialogOpen, setVehicleDialogOpen] = React.useState(false);
  const [selectedDriver, setSelectedDriver] = React.useState(null);
  const [selectedVehicle, setSelectedVehicle] = React.useState("");
  const [vehicleSelectionError, setVehicleSelectionError] = React.useState("");
  const [vehicleFormOpen, setVehicleFormOpen] = React.useState(false);
  const [newVehicleName, setNewVehicleName] = React.useState("");
  const [newVehiclePlate, setNewVehiclePlate] = React.useState("");
  const [creatingVehicle, setCreatingVehicle] = React.useState(false);
  const [vehicleSuccessMessage, setVehicleSuccessMessage] = React.useState("");

  const loadDriversAndTrips = React.useCallback(async () => {
    let isMounted = true;
    setLoading(true);
    setError("");
    try {
      const driversData = await fetchDrivers();
      if (!isMounted) return;
      setDrivers(Array.isArray(driversData) ? driversData : []);

      // Load active trips for each driver
      const tripsMap = {};
      for (const driver of driversData) {
        try {
          const activeTrip = await fetchActiveTripByDriver(driver.id_conductor);
          if (activeTrip) {
            tripsMap[driver.id_conductor] = activeTrip;
          }
        } catch (e) {
          // Driver might not have active trip, continue
        }
      }
      if (!isMounted) return;
      setActiveTrips(tripsMap);
    } catch (e) {
      if (!isMounted) return;
      setError(e.message || "Error al cargar conductores");
    } finally {
      if (!isMounted) return;
      setLoading(false);
    }
    return () => {
      isMounted = false;
    };
  }, []);

  const loadVehicles = React.useCallback(async () => {
    let isMounted = true;
    setVehiclesLoading(true);
    setVehicleError("");
    try {
      const data = await fetchVehicles();
      if (!isMounted) return;
      setVehicles(Array.isArray(data) ? data : []);
    } catch (e) {
      if (!isMounted) return;
      setVehicleError(e.message || "Error al cargar vehículos");
    } finally {
      if (!isMounted) return;
      setVehiclesLoading(false);
    }
    return () => {
      isMounted = false;
    };
  }, []);

  React.useEffect(() => {
    loadDriversAndTrips();
  }, [loadDriversAndTrips]);

  React.useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  const handleStartTrip = async (conductorId) => {
    setProcessingTrip(conductorId);
    try {
      const newTrip = await startTrip(conductorId);
      await loadDriversAndTrips();
      setError("");
    } catch (e) {
      setError(e.message || "Error al iniciar viaje");
    } finally {
      setProcessingTrip(null);
    }
  };

  const handleEndTrip = async (tripId, conductorId) => {
    setProcessingTrip(conductorId);
    try {
      await endTrip(tripId);
      await loadDriversAndTrips();
      setError("");
    } catch (e) {
      setError(e.message || "Error al finalizar viaje");
    } finally {
      setProcessingTrip(null);
    }
  };

  const openVehicleDialog = (driver) => {
    setSelectedDriver(driver);
    setSelectedVehicle(vehicles[0]?.id_vehiculo?.toString() || "");
    setVehicleSelectionError("");
    setVehicleDialogOpen(true);
  };

  const closeVehicleDialog = () => {
    setVehicleDialogOpen(false);
    setSelectedDriver(null);
    setSelectedVehicle("");
    setVehicleSelectionError("");
  };

  const confirmStartTrip = async () => {
    if (!selectedDriver) return;
    if (!selectedVehicle) {
      setVehicleSelectionError("Selecciona un vehículo");
      return;
    }
    const vehicleId = Number(selectedVehicle);
    setProcessingTrip(selectedDriver.id_conductor);
    try {
      await startTrip(selectedDriver.id_conductor, vehicleId);
      closeVehicleDialog();
      await loadDriversAndTrips();
      setError("");
    } catch (e) {
      setError(e.message || "Error al iniciar viaje");
    } finally {
      setProcessingTrip(null);
    }
  };

  const handleCreateVehicle = async () => {
    if (!newVehicleName.trim()) {
      setVehicleError("Ingresa un nombre de vehículo");
      return;
    }
    setCreatingVehicle(true);
    setVehicleError("");
    try {
      const vehiculo = await createVehicle({
        nombre: newVehicleName.trim(),
        placa: newVehiclePlate.trim() || undefined,
      });
      setVehicleSuccessMessage(`Vehículo creado. Token: ${vehiculo.token_dispositivo}`);
      setNewVehicleName("");
      setNewVehiclePlate("");
      await loadVehicles();
    } catch (e) {
      setVehicleError(e.message || "Error al crear vehículo");
    } finally {
      setCreatingVehicle(false);
    }
  };

  const handleOpenVehicleForm = () => {
    setVehicleFormOpen(true);
    setVehicleError("");
    setVehicleSuccessMessage("");
  };

  const handleCloseVehicleForm = () => {
    setVehicleFormOpen(false);
    setNewVehicleName("");
    setNewVehiclePlate("");
    setVehicleError("");
    setVehicleSuccessMessage("");
  };

  const handleOpenStats = async (driver) => {
    setStatsDriver(driver);
    setStatsOpen(true);
    setStatsLoading(true);
    setStatsError("");
    try {
      const trips = await fetchTripsByDriver(driver.id_conductor, { limit: 10 });
      const finishedTrips = trips
        .filter((trip) => trip.fecha_fin)
        .sort(
          (a, b) =>
            new Date(b.fecha_inicio).getTime() - new Date(a.fecha_inicio).getTime()
        );

      if (finishedTrips.length === 0) {
        setStatsData([]);
      } else {
        const statsPromises = finishedTrips.map(async (trip) => {
          try {
            const stats = await fetchTripStats(trip.id_viaje);
            return { trip, stats };
          } catch (e) {
            return {
              trip,
              stats: null,
              error: e.message || "Error al obtener estadísticas del viaje",
            };
          }
        });

        const resolvedStats = await Promise.all(statsPromises);
        setStatsData(resolvedStats);
      }
    } catch (e) {
      setStatsError(e.message || "Error al cargar historial de viajes");
    } finally {
      setStatsLoading(false);
    }
  };

  const handleCloseStats = () => {
    setStatsOpen(false);
    setStatsDriver(null);
    setStatsData([]);
    setStatsLoading(false);
    setStatsError("");
  };

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

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Dialog open={vehicleDialogOpen} handler={closeVehicleDialog}>
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
          <Button variant="text" color="blue-gray" onClick={closeVehicleDialog}>
            Cancelar
          </Button>
          <Button
            variant="gradient"
            color="green"
            onClick={confirmStartTrip}
            disabled={vehicles.length === 0 || vehiclesLoading || !selectedDriver}
          >
            Iniciar
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={vehicleFormOpen} handler={handleCloseVehicleForm}>
        <DialogHeader>Agregar vehículo</DialogHeader>
        <DialogBody>
          <div className="flex flex-col gap-4">
            <Input
              label="Nombre del vehículo"
              value={newVehicleName}
              onChange={(e) => setNewVehicleName(e.target.value)}
            />
            <Input
              label="Placa (opcional)"
              value={newVehiclePlate}
              onChange={(e) => setNewVehiclePlate(e.target.value)}
            />
            {vehicleSuccessMessage && (
              <Alert color="green" className="text-xs">
                {vehicleSuccessMessage}
              </Alert>
            )}
            {vehicleError && (
              <Alert color="red" className="text-xs">
                {vehicleError}
              </Alert>
            )}
          </div>
        </DialogBody>
        <DialogFooter className="space-x-2">
          <Button variant="text" color="blue-gray" onClick={handleCloseVehicleForm}>
            Cancelar
          </Button>
          <Button
            variant="gradient"
            color="green"
            onClick={handleCreateVehicle}
            disabled={creatingVehicle}
          >
            {creatingVehicle ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={statsOpen} handler={handleCloseStats} size="xl">
        <DialogHeader>
          Historial de viajes {statsDriver ? `- ${statsDriver.nombre}` : ""}
        </DialogHeader>
        <DialogBody className="max-h-[32rem] overflow-y-auto">
          {statsLoading ? (
            <Typography className="text-sm text-blue-gray-600">
              Cargando historial de viajes...
            </Typography>
          ) : statsError ? (
            <Typography className="text-sm text-red-600">{statsError}</Typography>
          ) : statsData.length === 0 ? (
            <Typography className="text-sm text-blue-gray-600">
              No hay viajes finalizados para este conductor.
            </Typography>
          ) : (
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
                        <Typography className="text-xs text-blue-gray-600">
                          {stats ? stats.total_alertas : "—"}
                        </Typography>
                      </td>
                      <td className="py-3 px-4">
                        <Typography className="text-xs text-blue-gray-600">
                          {stats ? stats.total_cabeceos : "—"}
                        </Typography>
                      </td>
                      <td className="py-3 px-4">
                        <Typography className="text-xs text-blue-gray-600">
                          {stats ? stats.total_bostezos : "—"}
                        </Typography>
                      </td>
                      <td className="py-3 px-4">
                        {tripError ? (
                          <Typography className="text-[11px] text-red-500">
                            {tripError}
                          </Typography>
                        ) : (
                          <Typography className="text-xs text-blue-gray-600">
                            {stats
                              ? formatNumber(stats.frecuencia_cardiaca_promedio)
                              : "—"}
                          </Typography>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={handleCloseStats}
            className="mr-1"
          >
            <span>Cerrar</span>
          </Button>
        </DialogFooter>
      </Dialog>
      <h3 className="text-2xl font-bold ">Conductores registrados</h3>
      <Card>
        {/* <CardHeader variant="gradient" color="gray" className="mb-8 p-6"> */}
        {/*   <Typography variant="h6" color="white"> */}
        {/*     Authors Table */}
        {/*   </Typography> */}
        {/* </CardHeader> */}
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
                {["Nombre", "Estado", "Vehículo", "Viaje Activo", "Acciones"].map(
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
                ({ id_conductor, nombre, condicion_medica, activo }, key) => {
                  const className = `py-3 px-5 ${key === drivers.length - 1 ? "" : "border-b border-blue-gray-50"}`;
                  const activeTrip = activeTrips[id_conductor];
                  const isProcessing = processingTrip === id_conductor;

                  return (
                    <tr key={id_conductor}>
                      <td className={className}>
                        <div className="flex items-center gap-4">
                          <div>
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-semibold"
                            >
                              {nombre}
                            </Typography>
                            <Typography className="text-xs font-normal text-blue-gray-500">
                              {condicion_medica || "Sin condición registrada"}
                            </Typography>
                          </div>
                        </div>
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
                        <div className="flex gap-2">
                          {activeTrip ? (
                            <Button
                              size="sm"
                              color="red"
                              variant="outlined"
                              onClick={() => handleEndTrip(activeTrip.id_viaje, id_conductor)}
                              disabled={isProcessing}
                              className="text-xs"
                            >
                              {isProcessing ? "Procesando..." : "Finalizar Viaje"}
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              color="green"
                              onClick={() => openVehicleDialog({ id_conductor, nombre })}
                              disabled={isProcessing || !activo || vehicles.length === 0}
                              className="text-xs"
                            >
                              {isProcessing ? "Procesando..." : "Iniciar Viaje"}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="text"
                            onClick={() =>
                              handleOpenStats({
                                id_conductor,
                                nombre,
                              })
                            }
                            className="text-xs"
                          >
                            Estadísticas
                          </Button>
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
            <Button size="sm" color="blue" onClick={handleOpenVehicleForm}>
              Agregar vehículo
            </Button>
          </div>
          {vehiclesLoading ? (
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
                    {["Nombre", "Placa", "Token dispositivo", "Estado"].map((header) => (
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
                  {vehicles.map(
                    ({ id_vehiculo, nombre, placa, token_dispositivo, activo }, idx) => {
                      const className = `py-3 px-4 ${
                        idx === vehicles.length - 1 ? "" : "border-b border-blue-gray-50"
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
    </div>
  );
}

export default Tables;
