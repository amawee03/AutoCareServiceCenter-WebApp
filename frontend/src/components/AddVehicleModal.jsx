import React, { useState } from 'react';

export default function AddVehicleModal({ isOpen, onClose, onSave }) {
  const [vehicleData, setVehicleData] = useState({
    make: '',
    model: '',
    year: '',
    registrationNumber: '',
    color: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVehicleData({
      ...vehicleData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(vehicleData);
    setVehicleData({
      make: '',
      model: '',
      year: '',
      registrationNumber: '',
      color: '',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center px-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full">
        <div className="flex justify-between items-center border-b border-gray-700 p-6">
          <div>
            <h3 className="text-2xl font-extrabold text-white">Add New Vehicle</h3>
            <p className="text-sm text-gray-400 mt-1">Enter your vehicle details below</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition duration-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Make</label>
              <input
                type="text"
                name="make"
                value={vehicleData.make}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-2.5 border border-gray-600 placeholder-gray-500 text-white bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                placeholder="e.g., Toyota"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Model</label>
              <input
                type="text"
                name="model"
                value={vehicleData.model}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-2.5 border border-gray-600 placeholder-gray-500 text-white bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                placeholder="e.g., Camry"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Year</label>
              <input
                type="number"
                name="year"
                value={vehicleData.year}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-2.5 border border-gray-600 placeholder-gray-500 text-white bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                placeholder="e.g., 2020"
                required
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Color</label>
              <input
                type="text"
                name="color"
                value={vehicleData.color}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-2.5 border border-gray-600 placeholder-gray-500 text-white bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                placeholder="e.g., Silver"
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Registration Number</label>
            <input
              type="text"
              name="registrationNumber"
              value={vehicleData.registrationNumber}
              onChange={handleChange}
              className="appearance-none block w-full px-3 py-2.5 border border-gray-600 placeholder-gray-500 text-white bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              placeholder="e.g., ABC-1234"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition duration-200 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-200 text-sm font-medium"
            >
              Save Vehicle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}