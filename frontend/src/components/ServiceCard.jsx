import React from 'react';
import { Link } from 'react-router-dom';

export default function ServiceCard({ service }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
      <img
        src={service.image}
        alt={service.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-5">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xl font-bold text-gray-900">{service.name}</h3>
          <span className="text-red-600 font-bold">₹{service.price}</span>
        </div>
        <p className="text-gray-600 mb-4">{service.description}</p>
        <Link
          to={`/package-details/${service.id}`}
          className="block w-full bg-red-600 text-white text-center py-2 rounded hover:bg-red-700 transition duration-200"
        >
          Select Package
        </Link>
      </div>
    </div>
  );
}
