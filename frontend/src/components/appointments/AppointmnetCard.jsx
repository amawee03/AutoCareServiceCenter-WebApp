import React from 'react';

const formatVehicle = (vehicle) => {
  if (typeof vehicle === 'object' && vehicle !== null) {
    const parts = [];
    if (vehicle.make) parts.push(vehicle.make);
    if (vehicle.model) parts.push(vehicle.model);
    if (vehicle.registration) parts.push(`(${vehicle.registration})`);
    return parts.join(' ') || 'N/A';
  }
  return vehicle || 'N/A';
};

const AppointmentCard = ({
  appointment,
  actions,
  detailed = false,
}) => {
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'in progress':
        return 'bg-amber-100 text-amber-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status) => {
    if (!status) return '';
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'partially paid':
        return 'bg-amber-100 text-amber-800';
      case 'unpaid':
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-lg text-gray-900">
            {appointment.service}
          </h3>
          <p className="text-gray-600 text-sm">{appointment.customer}</p>
        </div>
        <div className="flex flex-col gap-1 items-end">
          <span
            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
              appointment.status
            )}`}
          >
            Service: {appointment.status}
          </span>
          {appointment.paymentStatus && (
            <span
              className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(
                appointment.paymentStatus
              )}`}
            >
              Payment: {appointment.paymentStatus}
            </span>
          )}
        </div>
      </div>

      <div className="mb-3">
        <div className="flex items-center text-sm text-gray-600 mb-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span>{appointment.date} at {appointment.time}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <svg
            className="h-4 w-4 mr-1 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <span>{formatVehicle(appointment.vehicle)}</span>
        </div>
      </div>

      {detailed && appointment.notes && (
        <div className="border-t border-gray-100 pt-3 mt-3">
          <p className="text-sm text-gray-600">
            <strong>Notes:</strong> {appointment.notes}
          </p>
        </div>
      )}

      {actions && <div className="mt-4 flex space-x-2">{actions}</div>}
    </div>
  );
};

export default AppointmentCard;
