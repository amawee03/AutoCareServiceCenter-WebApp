import React, { useState } from 'react';
import { Car, PlusCircle, X } from 'lucide-react';
// Mock user vehicles data
const userVehicles = [{
  id: 1,
  make: 'Toyota',
  model: 'Camry',
  year: 2020,
  registrationNo: 'KA-01-AB-1234'
}, {
  id: 2,
  make: 'Honda',
  model: 'Civic',
  year: 2019,
  registrationNo: 'KA-02-CD-5678'
}];
export function VehicleSelector({
  selectedVehicle,
  onVehicleSelect,
  onAddNewVehicle
}) {
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    registrationNo: ''
  });
  const handleAddVehicle = e => {
    e.preventDefault();
    // Validate form
    if (!newVehicle.make || !newVehicle.model || !newVehicle.registrationNo) {
      alert('Please fill in all required fields');
      return;
    }
    // Create new vehicle with mock ID
    const vehicle = {
      id: Date.now(),
      ...newVehicle
    };
    // Select the new vehicle
    onVehicleSelect(vehicle);
    // Close modal
    setShowAddVehicleModal(false);
    // Reset form
    setNewVehicle({
      make: '',
      model: '',
      year: new Date().getFullYear(),
      registrationNo: ''
    });
  };
  return <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {userVehicles.map(vehicle => <div key={vehicle.id} className={`
              border rounded-lg p-3 cursor-pointer
              ${selectedVehicle?.id === vehicle.id ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:bg-gray-50'}
            `} onClick={() => onVehicleSelect(vehicle)}>
            <div className="flex items-start">
              <Car size={20} className="text-gray-500 mr-2 mt-0.5" />
              <div>
                <div className="font-medium text-gray-800">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </div>
                <div className="text-sm text-gray-500">
                  {vehicle.registrationNo}
                </div>
              </div>
            </div>
          </div>)}
        <button type="button" className="border border-dashed border-gray-300 rounded-lg p-3 flex items-center justify-center hover:bg-gray-50" onClick={() => setShowAddVehicleModal(true)}>
          <PlusCircle size={20} className="text-red-600 mr-2" />
          <span className="text-gray-700">Add New Vehicle</span>
        </button>
      </div>
      {/* Add New Vehicle Modal */}
      {showAddVehicleModal && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-medium">Add New Vehicle</h3>
              <button onClick={() => setShowAddVehicleModal(false)} className="p-1 rounded-full hover:bg-gray-100">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleAddVehicle} className="p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Make <span className="text-red-600">*</span>
                </label>
                <input type="text" required value={newVehicle.make} onChange={e => setNewVehicle({
              ...newVehicle,
              make: e.target.value
            })} className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-red-500" placeholder="e.g. Toyota, Honda, etc." />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model <span className="text-red-600">*</span>
                </label>
                <input type="text" required value={newVehicle.model} onChange={e => setNewVehicle({
              ...newVehicle,
              model: e.target.value
            })} className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-red-500" placeholder="e.g. Camry, Civic, etc." />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year
                </label>
                <select value={newVehicle.year} onChange={e => setNewVehicle({
              ...newVehicle,
              year: parseInt(e.target.value)
            })} className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-red-500">
                  {Array.from({
                length: 25
              }, (_, i) => new Date().getFullYear() - i).map(year => <option key={year} value={year}>
                      {year}
                    </option>)}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Registration Number <span className="text-red-600">*</span>
                </label>
                <input type="text" required value={newVehicle.registrationNo} onChange={e => setNewVehicle({
              ...newVehicle,
              registrationNo: e.target.value
            })} className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-red-500" placeholder="e.g. KA-01-AB-1234" />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setShowAddVehicleModal(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                  Add Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>}
    </div>;
}