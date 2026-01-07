import {
  createDriver,
  createVehicle,
  deleteDriver,
  endTrip,
  fetchActiveTripByDriver,
  fetchDrivers,
  fetchTripStats,
  fetchTripsByDriver,
  fetchVehicles,
  startTrip,
  updateDriver,
} from "@/api/client";
import React from "react";
import {
  DriverDeleteDialog,
  DriverFormDialog,
  DriversTable,
  ErrorAlert,
  StatsDialog,
  SuccessAlert,
  VehicleFormDialog,
  VehicleSelectDialog,
  VehiclesTable,
} from "./components";

export function Tables() {
  // Drivers state
  const [drivers, setDrivers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [successMessage, setSuccessMessage] = React.useState("");
  const [activeTrips, setActiveTrips] = React.useState({});
  const [processingTrip, setProcessingTrip] = React.useState(null);

  // Driver form dialog state (create/edit)
  const [driverFormOpen, setDriverFormOpen] = React.useState(false);
  const [editingDriver, setEditingDriver] = React.useState(null);
  const [driverFormLoading, setDriverFormLoading] = React.useState(false);
  const [driverFormError, setDriverFormError] = React.useState("");
  const [driverFormSuccess, setDriverFormSuccess] = React.useState("");

  // Driver delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deletingDriver, setDeletingDriver] = React.useState(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState("");

  // Stats dialog state
  const [statsOpen, setStatsOpen] = React.useState(false);
  const [statsDriver, setStatsDriver] = React.useState(null);
  const [statsData, setStatsData] = React.useState([]);
  const [statsLoading, setStatsLoading] = React.useState(false);
  const [statsError, setStatsError] = React.useState("");

  // Vehicles state
  const [vehicles, setVehicles] = React.useState([]);
  const [vehiclesLoading, setVehiclesLoading] = React.useState(true);
  const [vehicleError, setVehicleError] = React.useState("");

  // Vehicle selection dialog state
  const [vehicleDialogOpen, setVehicleDialogOpen] = React.useState(false);
  const [selectedDriver, setSelectedDriver] = React.useState(null);
  const [selectedVehicle, setSelectedVehicle] = React.useState("");
  const [vehicleSelectionError, setVehicleSelectionError] = React.useState("");

  // Vehicle form dialog state
  const [vehicleFormOpen, setVehicleFormOpen] = React.useState(false);
  const [newVehicleName, setNewVehicleName] = React.useState("");
  const [newVehiclePlate, setNewVehiclePlate] = React.useState("");
  const [creatingVehicle, setCreatingVehicle] = React.useState(false);
  const [vehicleSuccessMessage, setVehicleSuccessMessage] = React.useState("");

  // Data loading functions
  const loadDriversAndTrips = React.useCallback(async () => {
    let isMounted = true;
    setLoading(true);
    setError("");
    try {
      const driversData = await fetchDrivers();
      if (!isMounted) return;
      setDrivers(Array.isArray(driversData) ? driversData : []);

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

  // Auto-dismiss error and success messages after 5 seconds
  React.useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  React.useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Trip handlers
  const handleEndTrip = async (tripId, conductorId) => {
    setProcessingTrip(conductorId);
    try {
      await endTrip(tripId);
      await loadDriversAndTrips();
      setError("");
      setSuccessMessage("Viaje finalizado correctamente");
    } catch (e) {
      setError(e.message || "Error al finalizar viaje");
    } finally {
      setProcessingTrip(null);
    }
  };

  // Vehicle selection dialog handlers
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
    setVehicleSelectionError("");
    try {
      await startTrip(selectedDriver.id_conductor, vehicleId);
      closeVehicleDialog();
      await loadDriversAndTrips();
      setError("");
      setSuccessMessage("Viaje iniciado correctamente");
    } catch (e) {
      // Show error in the dialog, not in the table
      setVehicleSelectionError(e.message || "Error al iniciar viaje");
    } finally {
      setProcessingTrip(null);
    }
  };

  // Driver form dialog handlers (Create/Edit)
  const handleOpenDriverForm = (driver = null) => {
    setEditingDriver(driver);
    setDriverFormError("");
    setDriverFormSuccess("");
    setDriverFormOpen(true);
  };

  const handleCloseDriverForm = () => {
    setDriverFormOpen(false);
    setEditingDriver(null);
    setDriverFormError("");
    setDriverFormSuccess("");
  };

  const handleSubmitDriver = async (driverData) => {
    setDriverFormLoading(true);
    setDriverFormError("");
    try {
      if (editingDriver) {
        // Update existing driver
        await updateDriver(editingDriver.id_conductor, driverData);
        setDriverFormSuccess("Conductor actualizado correctamente");
      } else {
        // Create new driver
        await createDriver(driverData);
        setDriverFormSuccess("Conductor creado correctamente");
      }
      await loadDriversAndTrips();
      setTimeout(() => {
        handleCloseDriverForm();
      }, 1000);
    } catch (e) {
      setDriverFormError(e.message || "Error al guardar conductor");
    } finally {
      setDriverFormLoading(false);
    }
  };

  // Driver delete dialog handlers
  const handleOpenDeleteDialog = (driver) => {
    setDeletingDriver(driver);
    setDeleteError("");
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeletingDriver(null);
    setDeleteError("");
  };

  const handleConfirmDelete = async () => {
    if (!deletingDriver) return;
    setDeleteLoading(true);
    setDeleteError("");
    try {
      await deleteDriver(deletingDriver.id_conductor);
      await loadDriversAndTrips();
      handleCloseDeleteDialog();
    } catch (e) {
      setDeleteError(e.message || "Error al eliminar conductor");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Vehicle form dialog handlers
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

  // Stats dialog handlers
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

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      {/* Global Error/Success Notifications */}
      <ErrorAlert message={error} onClose={() => setError("")} />
      <SuccessAlert message={successMessage} onClose={() => setSuccessMessage("")} />

      {/* Driver Form Dialog (Create/Edit) */}
      <DriverFormDialog
        open={driverFormOpen}
        onClose={handleCloseDriverForm}
        onSubmit={handleSubmitDriver}
        driver={editingDriver}
        loading={driverFormLoading}
        error={driverFormError}
        successMessage={driverFormSuccess}
      />

      {/* Driver Delete Confirmation Dialog */}
      <DriverDeleteDialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        driver={deletingDriver}
        loading={deleteLoading}
        error={deleteError}
      />

      {/* Vehicle Selection Dialog */}
      <VehicleSelectDialog
        open={vehicleDialogOpen}
        onClose={closeVehicleDialog}
        vehicles={vehicles}
        vehiclesLoading={vehiclesLoading}
        selectedDriver={selectedDriver}
        selectedVehicle={selectedVehicle}
        setSelectedVehicle={setSelectedVehicle}
        vehicleSelectionError={vehicleSelectionError}
        setVehicleSelectionError={setVehicleSelectionError}
        onConfirm={confirmStartTrip}
      />

      {/* Vehicle Form Dialog */}
      <VehicleFormDialog
        open={vehicleFormOpen}
        onClose={handleCloseVehicleForm}
        vehicleName={newVehicleName}
        setVehicleName={setNewVehicleName}
        vehiclePlate={newVehiclePlate}
        setVehiclePlate={setNewVehiclePlate}
        successMessage={vehicleSuccessMessage}
        error={vehicleError}
        creating={creatingVehicle}
        onCreate={handleCreateVehicle}
      />

      {/* Stats Dialog */}
      <StatsDialog
        open={statsOpen}
        onClose={handleCloseStats}
        driver={statsDriver}
        statsData={statsData}
        loading={statsLoading}
        error={statsError}
      />

      {/* Drivers Table */}
      <DriversTable
        drivers={drivers}
        loading={loading}
        error={error}
        activeTrips={activeTrips}
        processingTrip={processingTrip}
        vehicles={vehicles}
        onStartTrip={openVehicleDialog}
        onEndTrip={handleEndTrip}
        onViewStats={handleOpenStats}
        onEditDriver={handleOpenDriverForm}
        onDeleteDriver={handleOpenDeleteDialog}
        onAddDriver={() => handleOpenDriverForm(null)}
      />

      {/* Vehicles Table */}
      <VehiclesTable
        vehicles={vehicles}
        loading={vehiclesLoading}
        onAddVehicle={handleOpenVehicleForm}
      />
    </div>
  );
}

export default Tables;
