import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Calendar as CalendarIcon, CarFront, User, Package } from "lucide-react";
import { format } from "date-fns";
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/layouts/DashboardLayout';

export default function StaffCalendar() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const bays = [1, 2, 3]; // Adjust based on your setup

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5001/api/appointments/calendar");
      setAppointments(res.data);
    } catch (err) {
      console.error("Error fetching appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderAppointmentsForBay = (bayNumber) => {
    const bayAppointments = appointments
      .filter(a => a.bayNumber === bayNumber)
      .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));

    if (bayAppointments.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No bookings
        </div>
      );
    }

    return bayAppointments.map(a => (
      <div key={a._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-3 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-2">
          <User className="h-4 w-4 text-gray-500" />
          <p className="font-semibold text-gray-900">{a.customerName}</p>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <CarFront className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-gray-700">{typeof a.vehicle === 'object' ? `${a.vehicle.make || ''} ${a.vehicle.model || ''} (${a.vehicle.registration || ''})`.trim() : a.vehicle}</span>
          </div>
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-red-600" />
            <span>{a.packageId?.pkgName || "Service"}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-gray-500" />
            <span>
              {format(new Date(a.appointmentDate), "dd MMM yyyy")} at {a.startTime}
            </span>
          </div>
          <div className="text-gray-600 flex items-center gap-1">
            <span className="font-medium">Duration:</span> {a.duration} mins
          </div>
          {a.notes && (
            <div className="pt-2 mt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500 italic">{a.notes}</p>
            </div>
          )}
        </div>
      </div>
    ));
  };

  return (
    <DashboardLayout userRole="Receptionist" userName="Receptionist">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Staff Calendar</h1>
              <p className="text-gray-600">View and manage service bay appointments</p>
            </div>
            <Button
              onClick={() => navigate('/services')}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Book New Appointment
            </Button>
          </div>
        </div>

        {/* Calendar Content */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-red-600" />
            Service Bay Schedule
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading appointments...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bays.map(bay => (
                <div key={bay} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
                    <CarFront className="h-5 w-5 text-red-600" />
                    Bay {bay}
                  </h3>
                  {renderAppointmentsForBay(bay)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}