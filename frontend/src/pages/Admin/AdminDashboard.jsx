import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import StatsCard from '@/components/dashboards/StatsCard';
import AppointmentCard from '@/components/appointments/AppointmnetCard';
import { ServicePackageForm } from './ServicePackageForm';
import {
  CalendarIcon,
  UsersIcon,
  WrenchIcon,
  DollarSignIcon,
  ClipboardCheckIcon,
} from 'lucide-react';
import axios from 'axios';

const AdminDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [packagesCount, setPackagesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [apptsRes, pkgsRes] = await Promise.all([
          axios.get('http://localhost:5001/api/appointments'),
          axios.get('http://localhost:5001/api/packages')
        ]);
        setAppointments(apptsRes.data || []);
        setPackagesCount((pkgsRes.data || []).length);
      } catch (e) {
        
        setAppointments([]);
        setPackagesCount(0);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalAppointments = appointments.length;
    const uniqueCustomers = new Set((appointments || []).map(a => a.customerName)).size;
    
    const monthlyRevenue = (appointments || [])
      .filter(a => a.appointmentDate && new Date(a.appointmentDate) >= startOfMonth)
      .reduce((sum, a) => {
        
        if (a.payment?.status === 'completed') {
          return sum + (a.payment?.amount || 0);
        }
        
        if (a.payment?.status === 'refunded') {
          return sum - (a.payment?.refundAmount || a.payment?.amount || 0);
        }
        return sum;
      }, 0);

    return [
      {
        title: 'Total Appointments',
        value: totalAppointments,
        icon: <CalendarIcon size={24} className="text-blue-600" />,
      },
      {
        title: 'Active Customers',
        value: uniqueCustomers,
        icon: <UsersIcon size={24} className="text-green-600" />,
      },
      {
        title: 'Services Offered',
        value: packagesCount,
        icon: <WrenchIcon size={24} className="text-amber-600" />,
      },
      {
        title: 'Monthly Revenue',
        value: `LKR ${monthlyRevenue.toLocaleString()}`,
        icon: <DollarSignIcon size={24} className="text-red-600" />,
      },
    ];
  }, [appointments, packagesCount]);

  const recentAppointments = useMemo(() => {
    return (appointments || [])
      .slice()
      .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))
      .slice(0, 5)
      .map(a => ({
        id: a._id,
        service: a.packageId?.pkgName || 'Service',
        customer: a.customerName,
        date: new Date(a.appointmentDate).toLocaleDateString(),
        time: `${a.startTime}`,
        status: (a.status || '').replace(/^./, c => c.toUpperCase()),
        vehicle: a.vehicle,
        paymentStatus: (a.payment?.status || '').replace(/^./, c => c.toUpperCase()),
      }));
  }, [appointments]);

  return (
    <DashboardLayout userRole="Admin" userName="Admin User">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
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
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Recent Appointments</h2>
              <a
                href="/admin/my-appointments"
                className="text-sm text-red-600 hover:text-red-800"
              >
                View all
              </a>
            </div>
            <div className="space-y-4">
              {recentAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  // actions={
                  //   <button className="w-full py-2 text-center bg-red-50 text-red-600 rounded hover:bg-red-100">
                  //     View Details
                  //   </button>
                  // }
                />
              ))}
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <a
                href="/admin/manageservices"
                className="block w-full py-2 bg-red-600 text-white text-center rounded hover:bg-red-700 transition duration-200"
              >
               Manage Services
              </a>
              <a
                href="/admin/users"
                className="block w-full py-2 border border-gray-300 text-gray-700 text-center rounded hover:bg-gray-50 transition duration-200"
              >
                Manage Users
              </a>
              <a
                href="/admin/my-appointments"
                className="block w-full py-2 border border-gray-300 text-gray-700 text-center rounded hover:bg-gray-50 transition duration-200"
              >
                Manage Appointments
              </a>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-lg font-semibold mb-4">System Status</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Services</span>
                <span className="flex items-center text-green-600 text-sm">
                  <ClipboardCheckIcon size={16} className="mr-1" /> Active
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Booking System</span>
                <span className="flex items-center text-green-600 text-sm">
                  <ClipboardCheckIcon size={16} className="mr-1" /> Active
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Payment Gateway</span>
                <span className="flex items-center text-green-600 text-sm">
                  <ClipboardCheckIcon size={16} className="mr-1" /> Active
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Notification System
                </span>
                <span className="flex items-center text-green-600 text-sm">
                  <ClipboardCheckIcon size={16} className="mr-1" /> Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;