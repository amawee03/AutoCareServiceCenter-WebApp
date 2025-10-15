import React, { useState } from 'react'

const ServiceAdvisorView = () => {
  const [filter, setFilter] = useState('today')

  // Sample appointments data
  const appointments = [
    {
      id: 1,
      customer: 'John Doe',
      service: 'Premium Detailing',
      vehicle: 'Honda Civic (MH01AB1234)',
      date: 'May 15, 2023',
      time: '10:00 AM',
      status: 'Confirmed',
    },
    {
      id: 2,
      customer: 'Jane Smith',
      service: 'Basic Maintenance',
      vehicle: 'Toyota Fortuner (MH02CD5678)',
      date: 'May 15, 2023',
      time: '11:30 AM',
      status: 'In Progress',
    },
    {
      id: 3,
      customer: 'Robert Johnson',
      service: 'Full Service',
      vehicle: 'Hyundai i20 (MH03EF9012)',
      date: 'May 15, 2023',
      time: '02:00 PM',
      status: 'Pending',
    },
    {
      id: 4,
      customer: 'Emily Brown',
      service: 'Brake Service',
      vehicle: 'Maruti Swift (MH04GH3456)',
      date: 'May 16, 2023',
      time: '09:30 AM',
      status: 'Confirmed',
    },
  ]

  // Filter appointments based on selected filter
  const filteredAppointments = appointments.filter((appointment) => {
    if (filter === 'today') {
      return appointment.date === 'May 15, 2023'
    } else if (filter === 'tomorrow') {
      return appointment.date === 'May 16, 2023'
    }
    return true // 'all' filter
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Service Advisor Dashboard</h1>

      {/* Filter tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setFilter('today')}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                filter === 'today'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setFilter('tomorrow')}
              className={`ml-8 py-2 px-4 border-b-2 font-medium text-sm ${
                filter === 'tomorrow'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tomorrow
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`ml-8 py-2 px-4 border-b-2 font-medium text-sm ${
                filter === 'all'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Appointments
            </button>
          </nav>
        </div>
      </div>

      {/* Appointment list */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAppointments.map((appointment) => (
                <tr key={appointment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      {appointment.customer}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-900">{appointment.service}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-900">{typeof appointment.vehicle === 'object' ? `${appointment.vehicle.make || ''} ${appointment.vehicle.model || ''} (${appointment.vehicle.registration || ''})`.trim() : appointment.vehicle}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-900">{appointment.date}</div>
                    <div className="text-gray-500">{appointment.time}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        appointment.status === 'Confirmed'
                          ? 'bg-green-100 text-green-800'
                          : appointment.status === 'In Progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {appointment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-red-600 hover:text-red-900 mr-3">
                      View
                    </button>
                    <button className="text-indigo-600 hover:text-indigo-900">
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAppointments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No appointments found for the selected period.
          </div>
        )}
      </div>
    </div>
  )
}

export default ServiceAdvisorView
