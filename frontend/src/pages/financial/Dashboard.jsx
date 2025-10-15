import React from "react";

export default function Dashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Financial Dashboard</h1>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-500">Total Revenue</p>
          <h2 className="text-xl font-bold">LKR 3,25,780</h2>
          <span className="text-green-600">+8%</span>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-500">Pending Payments</p>
          <h2 className="text-xl font-bold">LKR 42,500</h2>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-500">Invoices Generated</p>
          <h2 className="text-xl font-bold">145</h2>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-500">Monthly Growth</p>
          <h2 className="text-xl font-bold">12%</h2>
          <span className="text-green-600">+3%</span>
        </div>
      </div>
    </div>
  );
}