import React from 'react';
import { Link } from 'react-router-dom';

export default function ServiceCard({ service, actions, onBook }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
      {/* Service Image */}
      <img
        src={service.image}
        alt={service.name}
        className="w-full h-48 object-cover"
      />

      {/* Service Details */}
      <div className="p-5">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xl font-bold text-gray-900">{service.name}</h3>
          <span className="text-red-600 font-bold">₹{service.price}</span>
        </div>
        <p className="text-gray-600 mb-4">{service.description}</p>

        {/* Estimated Time (optional) */}
        {service.estimatedTime && (
          <div className="flex items-center text-gray-500 mb-4 text-sm">
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{service.estimatedTime}</span>
          </div>
        )}

        {/* Actions / Buttons */}
        {actions ? (
          <div className="flex space-x-2 mt-4">{actions}</div>
        ) : onBook ? (
          <button
            onClick={onBook}
            className="block w-full bg-red-600 text-white text-center py-2 rounded hover:bg-red-700 transition duration-200"
          >
            Book Now
          </button>
        ) : (
          <Link
            to={`/package-details/${service.id}`}
            className="block w-full bg-red-600 text-white text-center py-2 rounded hover:bg-red-700 transition duration-200"
          >
            Select Package
          </Link>
        )}
      </div>
    </div>
  );
}
