import React, { useState } from 'react';

export default function VehicleSelector({ vehicles = [], onVehicleSelect, onAddVehicle }) {
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
    onVehicleSelect(vehicle);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-bold text-lg mb-3">Select Vehicle</h3>

      {vehicles.length > 0 ? (
        <div className="space-y-2 mb-4">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              onClick={() => handleVehicleSelect(vehicle)}
              className={`p-3 border rounded cursor-pointer transition-colors
                ${selectedVehicle?.id === vehicle.id ? 'border-red-600 bg-red-50' : 'border-gray-200 hover:bg-gray-50'}`}
            >
              <div className="flex justify-between">
                <div className="font-medium">
                  {vehicle.make} {vehicle.model}
                </div>
                <div className="text-gray-500">{vehicle.year}</div>
              </div>
              <div className="text-gray-500 text-sm">
                {vehicle.registrationNumber}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">No vehicles found</div>
      )}

      <button
        onClick={onAddVehicle}
        className="w-full py-2 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
        Add New Vehicle
      </button>
    </div>
  );
}
