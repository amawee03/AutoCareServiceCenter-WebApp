// Helper function to format vehicle display
export const formatVehicle = (vehicle) => {
  if (typeof vehicle === 'object' && vehicle !== null) {
    const parts = [];
    if (vehicle.make) parts.push(vehicle.make);
    if (vehicle.model) parts.push(vehicle.model);
    if (vehicle.registration) parts.push(`(${vehicle.registration})`);
    return parts.join(' ') || 'N/A';
  }
  return vehicle || 'N/A';
};

// Helper function for vehicle search
export const getVehicleSearchString = (vehicle) => {
  if (typeof vehicle === 'object' && vehicle !== null) {
    return `${vehicle.make || ''} ${vehicle.model || ''} ${vehicle.registration || ''} ${vehicle.year || ''} ${vehicle.color || ''}`.toLowerCase();
  }
  return (vehicle || '').toLowerCase();
};
