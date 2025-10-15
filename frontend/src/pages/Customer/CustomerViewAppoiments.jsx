import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ReportGenerator from '@/components/ReportGenerator';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar, 
  Clock, 
  Car, 
  User, 
  Package, 
  Edit3, 
  Trash2, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  FileText,
  Download
} from 'lucide-react';

const CustomerAppointments = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast, ToastContainer } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  
  // Reschedule state
  const [rescheduleModal, setRescheduleModal] = useState({ open: false, appointment: null });
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [availableTimes, setAvailableTimes] = useState([]);
  
  // Cancel state
  const [cancelModal, setCancelModal] = useState({ open: false, appointment: null });
  const [cancelReason, setCancelReason] = useState('');
  
  // Report state
  const [reportModal, setReportModal] = useState({ open: false, appointment: null });

  useEffect(() => {
    // Fetch appointments when user is available
    if (user && user._id) {
      fetchCustomerAppointments(user._id);
    }
  }, [user]);

  const fetchCustomerAppointments = async (custId) => {
    try {
      setLoading(true);
      // Fetch only appointments for this specific customer
      const response = await apiClient.get(`/api/appointments/customer/${custId}`);
      setAppointments(response.data);
    } catch (err) {
      setError('Failed to fetch your appointments');
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSorted = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const withinDateRange = (appt) => {
      if (!dateRange.start && !dateRange.end) return true;
      const d = new Date(appt.appointmentDate);
      const afterStart = dateRange.start ? d >= new Date(dateRange.start) : true;
      const beforeEnd = dateRange.end ? d <= new Date(dateRange.end) : true;
      return afterStart && beforeEnd;
    };

    const byStatus = (appt) => {
      if (statusFilter === 'all') return true;
      return (appt.status || '').toLowerCase() === statusFilter.toLowerCase();
    };

    const byQuery = (appt) => {
      if (!normalizedQuery) return true;
      const vehicleString = typeof appt.vehicle === 'object' 
        ? `${appt.vehicle.make || ''} ${appt.vehicle.model || ''} (${appt.vehicle.registration || ''})`.trim()
        : appt.vehicle || '';
      
      const haystack = [
        vehicleString,
        appt.packageId?.pkgName,
        appt.bayNumber && `bay ${appt.bayNumber}`
      ]
        .filter(Boolean)
        .join(' ')  
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    };

    const now = new Date();
    const appts = (appointments || [])
      .filter(a => withinDateRange(a) && byStatus(a) && byQuery(a))
      .map(a => ({
        ...a,
        _distanceMs: Math.abs(new Date(a.appointmentDate) - now),
      }))
      .sort((a, b) => a._distanceMs - b._distanceMs || (a.startTime || '').localeCompare(b.startTime || ''));

    return appts;
  }, [appointments, searchQuery, statusFilter, dateRange]);

  const timeSlots = [
    "08:00", "08:30", "09:00", "09:30",
    "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30",
    "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30"
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-600 text-white';
      case 'pending': return 'bg-yellow-500 text-white';
      case 'cancelled': return 'bg-red-600 text-white';
      case 'completed': return 'bg-green-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-600 text-white';
      case 'pending': return 'bg-yellow-500 text-white';
      case 'refunded': return 'bg-purple-600 text-white';
      case 'failed': return 'bg-red-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const handleReschedule = (appointment) => {
    setRescheduleModal({ open: true, appointment });
    
    const appointmentDate = appointment.appointmentDate instanceof Date 
      ? appointment.appointmentDate 
      : new Date(appointment.appointmentDate);
    
    const dateString = appointmentDate.toISOString().split('T')[0];
    setNewDate(dateString);
    setNewTime(appointment.startTime);
    setNewNotes(appointment.notes || '');
    fetchAvailableTimes(dateString, appointment.packageId._id);
  };

  const fetchAvailableTimes = async (date, packageId) => {
    try {
      const response = await apiClient.get('/api/appointments/available-time-slots', {
        params: { packageId, date }
      });
      setAvailableTimes(response.data.availableSlots || []);
    } catch (err) {
      console.error('Error fetching available times:', err);
      setAvailableTimes([]);
    }
  };

  const handleDateChange = (date) => {
    setNewDate(date);
    if (rescheduleModal.appointment) {
      fetchAvailableTimes(date, rescheduleModal.appointment.packageId._id);
    }
  };

  const confirmReschedule = async () => {
    if (!newDate || !newTime) {
      setError('Please select both date and time');
      return;
    }

    try {
      setActionLoading({ ...actionLoading, reschedule: true });
      
      const response = await apiClient.put(
        `/api/appointments/${rescheduleModal.appointment._id}/reschedule`,
        {
          appointmentDate: newDate,
          startTime: newTime,
          notes: newNotes
        }
      );

      if (response.data.success) {
        await fetchCustomerAppointments(user._id);
        setRescheduleModal({ open: false, appointment: null });
        setError('');
        toast({ 
          title: 'Appointment rescheduled', 
          description: 'Your appointment has been updated successfully', 
          variant: 'success' 
        });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reschedule appointment');
      toast({ 
        title: 'Reschedule failed', 
        description: err.response?.data?.error || 'Unable to reschedule appointment', 
        variant: 'destructive' 
      });
    } finally {
      setActionLoading({ ...actionLoading, reschedule: false });
    }
  };

  const handleCancel = (appointment) => {
    setCancelModal({ open: true, appointment });
    setCancelReason('');
  };
  
  const confirmCancel = async () => {
    try {
      setActionLoading({ ...actionLoading, cancel: true });
      
      const response = await apiClient.delete(
        `/api/appointments/${cancelModal.appointment._id}/cancel`,
        {
          data: {
            refundReason: cancelReason || 'Cancelled by customer',
            refundMethod: 'original_payment_method'
          }
        }
      );

      if (response.data.success) {
        await fetchCustomerAppointments(user._id);
        setCancelModal({ open: false, appointment: null });
        setError('');
        toast({ 
          title: 'Appointment cancelled', 
          description: `Refund of LKR ${response.data.refund.amount.toLocaleString()} will be processed`, 
          variant: 'success' 
        });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to cancel appointment');
      toast({ 
        title: 'Cancellation failed', 
        description: err.response?.data?.error || 'Unable to cancel appointment', 
        variant: 'destructive' 
      });
    } finally {
      setActionLoading({ ...actionLoading, cancel: false });
    }
  };

  const handleDownloadReport = (appointment) => {
    // Create a safe copy of the appointment with all object properties properly formatted
    const safeAppointment = {
      ...appointment,
      vehicle: typeof appointment.vehicle === 'object' 
        ? `${appointment.vehicle.make || ''} ${appointment.vehicle.model || ''} (${appointment.vehicle.registration || ''})`.trim()
        : appointment.vehicle,
      // Ensure any nested objects are also properly formatted
      customerName: typeof appointment.customerName === 'object' 
        ? `${appointment.customerName.firstName || ''} ${appointment.customerName.lastName || ''}`.trim()
        : appointment.customerName,
      // Format packageId to ensure it's not causing issues
      packageId: typeof appointment.packageId === 'object' 
        ? { ...appointment.packageId }
        : appointment.packageId
    };
    
    setReportModal({ open: true, appointment: safeAppointment });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="w-full px-8 max-w-[1600px] mx-auto">
          <div className="flex justify-between items-center mb-10">
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
              <div className="bg-red-600 p-3 rounded-lg">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              My Appointments
            </h1>
            <Button
              onClick={() => navigate('/services')}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Book New Appointment
            </Button>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-10 mb-10 border-2 border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Search by vehicle, service, bay"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 bg-white focus:ring-red-500 focus:border-red-500 font-medium"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 font-medium"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Start date"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="End date"
              />
            </div>
            <p className="text-sm text-gray-600 mt-4 font-medium">📅 Sorted by nearest appointment date/time first</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Error</span>
              </div>
              <p className="text-red-600 mt-1">{error}</p>
            </div>
          )}

          {filteredAndSorted.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-20 w-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-3">No Appointments Found</h3>
              <p className="text-gray-600 mb-6 text-lg">
                {appointments.length === 0 
                  ? "You haven't booked any appointments yet." 
                  : "Try changing your search or filters."}
              </p>
              <Button
                onClick={() => navigate('/services')}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
              >
                Book Your First Appointment
              </Button>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredAndSorted.map((appointment) => (
                <Card key={appointment._id} className="shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 hover:border-red-300 rounded-xl">
                  <CardContent className="p-8">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Package className="h-5 w-5 text-red-600" />
                          <span className="font-semibold text-lg">
                            {appointment.packageId?.pkgName || 'Service'}
                          </span>
                        </div>
                        <Badge className={`${getStatusColor(appointment.status)} px-4 py-1.5 text-sm font-semibold`}>
                          Service: {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleDownloadReport(appointment)}
                          variant="outline"
                          size="sm"
                          className="text-white bg-green-600 border-green-600 hover:bg-green-700 font-medium transition-colors"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          View Report
                        </Button>
                        {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                          <>
                            <Button
                              onClick={() => handleReschedule(appointment)}
                              variant="outline"
                              size="sm"
                              className="text-blue-600 border-blue-600 hover:bg-blue-50 font-medium transition-colors"
                            >
                              <Edit3 className="h-4 w-4 mr-1" />
                              Reschedule
                            </Button>
                            <Button
                              onClick={() => handleCancel(appointment)}
                              variant="outline"
                              size="sm"
                              disabled={actionLoading[`cancel-${appointment._id}`]}
                              className="text-red-600 border-red-600 hover:bg-red-50 font-medium transition-colors"
                            >
                              {actionLoading[`cancel-${appointment._id}`] ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                              ) : (
                                <XCircle className="h-4 w-4 mr-1" />
                              )}
                              Cancel
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">Vehicle</p>
                          <p className="font-medium">{typeof appointment.vehicle === 'object' ? `${appointment.vehicle.make || ''} ${appointment.vehicle.model || ''} (${appointment.vehicle.registration || ''})`.trim() : appointment.vehicle}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">Date & Time</p>
                          <p className="font-medium">
                            {(() => {
                              const appointmentDate = appointment.appointmentDate instanceof Date 
                                ? appointment.appointmentDate 
                                : new Date(appointment.appointmentDate);
                              return appointmentDate.toLocaleDateString();
                            })()}
                          </p>
                          <p className="text-sm text-gray-600">
                            {appointment.startTime} - {appointment.endTime}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 bg-red-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-red-600">{appointment.bayNumber}</span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Service Bay</p>
                          <p className="font-medium">Bay {appointment.bayNumber}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-500">Payment Status</p>
                          <Badge className={getPaymentStatusColor(appointment.payment?.status)}>
                            {appointment.payment?.status?.charAt(0).toUpperCase() + appointment.payment?.status?.slice(1)}
                          </Badge>
                          {appointment.payment?.status === 'refunded' && (
                            <p className="text-xs text-purple-600 mt-1">
                              Refund: LKR {appointment.payment?.refundAmount?.toLocaleString()}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Amount Paid</p>
                          <p className="font-semibold text-lg text-red-600">
                            LKR {appointment.payment?.amount?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {appointment.notes && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-500">Notes</p>
                        <p className="text-gray-700">{appointment.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Reschedule Modal */}
          {rescheduleModal.open && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                <h3 className="text-xl font-bold mb-4">Reschedule Appointment</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Date</label>
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => handleDateChange(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Time</label>
                    <select
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="">Select time</option>
                      {timeSlots.map(time => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                    {availableTimes.length > 0 && (
                      <p className="text-xs text-green-600 mt-1">
                        {availableTimes.length} slots available
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes (Optional)</label>
                    <textarea
                      value={newNotes}
                      onChange={(e) => setNewNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      rows="3"
                      placeholder="Any special requests or information..."
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={() => setRescheduleModal({ open: false, appointment: null })}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmReschedule}
                    disabled={actionLoading.reschedule || !newDate || !newTime}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    {actionLoading.reschedule ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Confirm Reschedule
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Cancel Modal */}
          {cancelModal.open && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                <h3 className="text-xl font-bold mb-4 text-red-600">Cancel Appointment</h3>
                
                <div className="mb-4">
                  <p className="text-gray-700 mb-2">
                    Are you sure you want to cancel this appointment?
                  </p>
                  <p className="text-sm text-gray-500">
                    A full refund of <strong>LKR {cancelModal.appointment?.payment?.amount?.toLocaleString()}</strong> will be processed to your original payment method.
                  </p>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for cancellation (Optional)
                  </label>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    rows="3"
                    placeholder="Help us improve by letting us know why you're cancelling..."
                  />
                </div>
                
                <div className="flex gap-3">
                  <Button
                    onClick={() => setCancelModal({ open: false, appointment: null })}
                    variant="outline"
                    className="flex-1"
                  >
                    Keep Appointment
                  </Button>
                  <Button
                    onClick={confirmCancel}
                    disabled={actionLoading.cancel}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    {actionLoading.cancel ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Cancel & Refund
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Report Modal */}
          {reportModal.open && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold">Generate Appointment Report</h3>
                  <Button
                    onClick={() => setReportModal({ open: false, appointment: null })}
                    variant="outline"
                    size="sm"
                  >
                    Close
                  </Button>
                </div>
                
                <ReportGenerator appointment={reportModal.appointment} />
              </div>
            </div>
          )}
        </div>
      </div>
      
      <ToastContainer />
    </div>
  );
};

export default CustomerAppointments;