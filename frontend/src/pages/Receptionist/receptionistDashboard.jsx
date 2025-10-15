import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import StatsCard from '@/components/dashboards/StatsCard';
import AppointmentCard from '@/components/appointments/AppointmnetCard';
import {
  CalendarIcon,
  UsersIcon,
  ClockIcon,
  CheckCircleIcon,
  PhoneIcon,
  BellIcon,
  UserCheckIcon,
  AlertCircleIcon,
  PlusCircle,
} from 'lucide-react';
import apiClient from '../../api/axios';

const ReceptionistDashboard = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const apptsRes = await apiClient.get('/api/appointments');
        const appointmentsData = apptsRes.data || [];
        setAppointments(appointmentsData);
        
        // Get unique customers from appointments
        const uniqueCustomers = [...new Set(appointmentsData.map(a => a.customerId).filter(Boolean))];
        setCustomers(uniqueCustomers);
      } catch (e) {
        console.error('Error fetching data:', e);
        setAppointments([]);
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAppointments = appointments.filter(a => {
      const apptDate = new Date(a.appointmentDate);
      return apptDate >= today && apptDate < tomorrow;
    }).length;

    const upcomingAppointments = appointments.filter(a => {
      const apptDate = new Date(a.appointmentDate);
      return apptDate >= today && ['pending', 'confirmed'].includes(a.status?.toLowerCase());
    }).length;

    const completedToday = appointments.filter(a => {
      const apptDate = new Date(a.appointmentDate);
      return apptDate >= today && apptDate < tomorrow && a.status?.toLowerCase() === 'completed';
    }).length;

    const totalCustomers = customers.length;

    return [
      {
        title: "Today's Appointments",
        value: todayAppointments,
        icon: <CalendarIcon size={24} className="text-blue-600" />,
      },
      {
        title: 'Upcoming',
        value: upcomingAppointments,
        icon: <ClockIcon size={24} className="text-amber-600" />,
      },
      {
        title: 'Completed Today',
        value: completedToday,
        icon: <CheckCircleIcon size={24} className="text-green-600" />,
      },
      {
        title: 'Total Customers',
        value: totalCustomers,
        icon: <UsersIcon size={24} className="text-purple-600" />,
      },
    ];
  }, [appointments, customers]);

  const todayAppointments = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return (appointments || [])
      .filter(a => {
        const apptDate = new Date(a.appointmentDate);
        return apptDate >= today && apptDate < tomorrow;
      })
      .sort((a, b) => {
        const timeA = a.startTime || '';
        const timeB = b.startTime || '';
        return timeA.localeCompare(timeB);
      })
      .slice(0, 5)
      .map(a => ({
        id: a._id,
        service: a.packageId?.pkgName || 'Service',
        customer: a.customerName,
        date: new Date(a.appointmentDate).toLocaleDateString(),
        time: a.startTime,
        status: (a.status || '').replace(/^./, c => c.toUpperCase()),
        vehicle: `${a.vehicle?.make || ''} ${a.vehicle?.model || ''}`.trim() || 'Vehicle',
        paymentStatus: (a.payment?.status || '').replace(/^./, c => c.toUpperCase()),
        phone: a.customerPhone || 'N/A',
      }));
  }, [appointments]);

  const upcomingAppointments = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return (appointments || [])
      .filter(a => {
        const apptDate = new Date(a.appointmentDate);
        return apptDate >= today && ['pending', 'confirmed'].includes(a.status?.toLowerCase());
      })
      .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
      .slice(0, 5)
      .map(a => ({
        id: a._id,
        service: a.packageId?.pkgName || 'Service',
        customer: a.customerName,
        date: new Date(a.appointmentDate).toLocaleDateString(),
        time: a.startTime,
        status: (a.status || '').replace(/^./, c => c.toUpperCase()),
        vehicle: `${a.vehicle?.make || ''} ${a.vehicle?.model || ''}`.trim() || 'Vehicle',
        phone: a.customerPhone || 'N/A',
      }));
  }, [appointments]);

  const pendingConfirmations = useMemo(() => {
    return appointments.filter(a => a.status?.toLowerCase() === 'pending').length;
  }, [appointments]);

  return (
    <DashboardLayout userRole="Receptionist" userName="Receptionist User">
      <h1 className="text-2xl font-bold mb-6">Receptionist Dashboard</h1>
      
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

      {pendingConfirmations > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircleIcon size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-900">Pending Confirmations</h3>
            <p className="text-sm text-amber-800">
              You have {pendingConfirmations} appointment{pendingConfirmations !== 1 ? 's' : ''} waiting for confirmation.
            </p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Today's Appointments</h2>
              <button
                onClick={() => navigate('/receptionist/calendar')}
                className="text-sm text-red-600 hover:text-red-800"
              >
                View Calendar
              </button>
            </div>
            <div className="space-y-4">
              {todayAppointments.length > 0 ? (
                todayAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    actions={
                      <div className="flex gap-2">
                        {/* <button className="flex-1 py-2 text-center bg-red-50 text-red-600 rounded hover:bg-red-100">
                          View Details
                        </button> */}
                        {appointment.status.toLowerCase() === 'pending' && (
                          <button className="flex-1 py-2 text-center bg-green-50 text-green-600 rounded hover:bg-green-100">
                            Confirm
                          </button>
                        )}
                      </div>
                    }
                  />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CalendarIcon size={48} className="mx-auto mb-2 text-gray-300" />
                  <p>No appointments scheduled for today</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Upcoming Appointments</h2>
              <button
                onClick={() => navigate('/receptionist/appointments')}
                className="text-sm text-red-600 hover:text-red-800"
              >
                View all
              </button>
            </div>
            <div className="space-y-4">
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    // actions={
                    //   <button className="w-full py-2 text-center bg-red-50 text-red-600 rounded hover:bg-red-100">
                    //     View Details
                    //   </button>
                    // }
                  />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ClockIcon size={48} className="mx-auto mb-2 text-gray-300" />
                  <p>No upcoming appointments</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/receptionist/book-appointment')}
                className="block w-full py-2 bg-red-600 text-white text-center rounded hover:bg-red-700 transition duration-200"
              >
                Book Appointment
              </button>
              <button
                onClick={() => navigate('/receptionist/calendar')}
                className="block w-full py-2 border border-gray-300 text-gray-700 text-center rounded hover:bg-gray-50 transition duration-200"
              >
                View Calendar
              </button>
              <button
                onClick={() => navigate('/receptionist/services')}
                className="block w-full py-2 border border-gray-300 text-gray-700 text-center rounded hover:bg-gray-50 transition duration-200"
              >
                Service Catalogue
              </button>
              <button
                onClick={() => navigate('/receptionist/appointments')}
                className="block w-full py-2 border border-gray-300 text-gray-700 text-center rounded hover:bg-gray-50 transition duration-200"
              >
                All Appointments
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-lg font-semibold mb-4">Quick Stats</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <UserCheckIcon size={16} className="text-green-600" />
                  <span className="text-sm text-gray-600">Confirmed Today</span>
                </div>
                <span className="font-semibold text-gray-800">
                  {appointments.filter(a => {
                    const now = new Date();
                    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    const tomorrow = new Date(today);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    const apptDate = new Date(a.appointmentDate);
                    return apptDate >= today && apptDate < tomorrow && a.status?.toLowerCase() === 'confirmed';
                  }).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <ClockIcon size={16} className="text-amber-600" />
                  <span className="text-sm text-gray-600">Pending</span>
                </div>
                <span className="font-semibold text-gray-800">
                  {pendingConfirmations}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <PhoneIcon size={16} className="text-blue-600" />
                  <span className="text-sm text-gray-600">Call-backs</span>
                </div>
                <span className="font-semibold text-gray-800">0</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <BellIcon size={16} className="text-purple-600" />
                  <span className="text-sm text-gray-600">Reminders Sent</span>
                </div>
                <span className="font-semibold text-gray-800">
                  {appointments.filter(a => {
                    const now = new Date();
                    const tomorrow = new Date(now);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    const dayAfter = new Date(tomorrow);
                    dayAfter.setDate(dayAfter.getDate() + 1);
                    const apptDate = new Date(a.appointmentDate);
                    return apptDate >= tomorrow && apptDate < dayAfter;
                  }).length}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-md p-6 mt-6 border border-blue-100">
            <div className="flex items-start gap-3">
              <PhoneIcon size={24} className="text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Customer Support</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Need help? Contact the support team for assistance.
                </p>
                <a
                  href="tel:+1234567890"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Call Support →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReceptionistDashboard;