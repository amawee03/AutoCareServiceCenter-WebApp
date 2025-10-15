import React, { useState } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import StatsCard from '@/components/dashboards/StatsCard';
import AppointmentCard from '@/components/appointments/AppointmnetCard';
import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  AlertTriangleIcon,
} from 'lucide-react';

export default function ServiceEmployeeDashboard() {
  const [statusFilter, setStatusFilter] = useState('all');

  // Sample data
  const stats = [
    {
      title: "Today's Appointments",
      value: 5,
      icon: <CalendarIcon size={24} className="text-blue-600" />,
    },
    {
      title: 'Completed Today',
      value: 2,
      icon: <CheckCircleIcon size={24} className="text-green-600" />,
    },
    {
      title: 'In Progress',
      value: 2,
      icon: <ClockIcon size={24} className="text-amber-600" />,
    },
    {
      title: 'Pending',
      value: 1,
      icon: <AlertTriangleIcon size={24} className="text-red-600" />,
    },
  ];

  const appointments = [
    {
      id: 1,
      service: 'Premium Detailing',
      customer: 'John Doe',
      date: 'May 15, 2023',
      time: '10:00 AM',
      status: 'In Progress',
      vehicle: 'Honda Civic (MH01AB1234)',
    },
    {
      id: 2,
      service: 'Basic Maintenance',
      customer: 'Jane Smith',
      date: 'May 15, 2023',
      time: '11:30 AM',
      status: 'In Progress',
      vehicle: 'Toyota Fortuner (MH02CD5678)',
    },
    {
      id: 3,
      service: 'Full Service',
      customer: 'Robert Johnson',
      date: 'May 15, 2023',
      time: '02:00 PM',
      status: 'Pending',
      vehicle: 'Hyundai i20 (MH03EF9012)',
    },
    {
      id: 4,
      service: 'Brake Service',
      customer: 'Emily Brown',
      date: 'May 15, 2023',
      time: '09:30 AM',
      status: 'Completed',
      vehicle: 'Maruti Swift (MH04GH3456)',
    },
    {
      id: 5,
      service: 'Express Wash & Wax',
      customer: 'Michael Wilson',
      date: 'May 15, 2023',
      time: '12:00 PM',
      status: 'Completed',
      vehicle: 'Kia Seltos (MH05IJ7890)',
    },
  ];

  const filteredAppointments =
    statusFilter === 'all'
      ? appointments
      : appointments.filter(
          (appointment) =>
            appointment.status.toLowerCase() === statusFilter.toLowerCase()
        );

  return (
    <DashboardLayout userRole="Service Employee" userName="Service Tech">
      <h1 className="text-2xl font-bold mb-6">Service Employee Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
          />
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h2 className="text-lg font-semibold">Today's Appointments</h2>
            <div className="mt-3 sm:mt-0">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  detailed
                  actions={
                    appointment.status !== 'Completed' ? (
                      <div className="flex w-full space-x-2">
                        {appointment.status === 'Pending' && (
                          <button className="flex-1 py-2 text-center bg-blue-50 text-blue-600 rounded hover:bg-blue-100">
                            Start Service
                          </button>
                        )}
                        {appointment.status === 'In Progress' && (
                          <button className="flex-1 py-2 text-center bg-green-50 text-green-600 rounded hover:bg-green-100">
                            Complete Service
                          </button>
                        )}
                        <button className="flex-1 py-2 text-center bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                          Add Notes
                        </button>
                      </div>
                    ) : (
                      <button className="w-full py-2 text-center bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                        View Details
                      </button>
                    )
                  }
                />
              ))
            ) : (
              <div className="col-span-2 text-center py-8 text-gray-500">
                No appointments found matching the selected status.
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
