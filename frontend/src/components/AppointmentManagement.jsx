import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/api/axios';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import ReportGenerator from './ReportGenerator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
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
  Home
} from 'lucide-react';

// Helper function to format vehicle display
const formatVehicle = (vehicle) => {
  if (typeof vehicle === 'object' && vehicle !== null) {
    return `${vehicle.make || ''} ${vehicle.model || ''} (${vehicle.registration || ''})`.trim();
  }
  return vehicle || 'N/A';
};

// Helper function for vehicle search
const getVehicleSearchString = (vehicle) => {
  if (typeof vehicle === 'object' && vehicle !== null) {
    return `${vehicle.make || ''} ${vehicle.model || ''} ${vehicle.registration || ''} ${vehicle.year || ''} ${vehicle.color || ''}`.toLowerCase();
  }
  return (vehicle || '').toLowerCase();
};

const AppointmentManagement = () => {
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
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/appointments');
      setAppointments(response.data);
    } catch (err) {
      setError('Failed to fetch appointments');
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
      const haystack = [
        appt.customerName,
        getVehicleSearchString(appt.vehicle),
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
        // Compute distance to now for nearest-first sorting
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
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'refunded': return 'bg-purple-100 text-purple-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
        await fetchAppointments();
        setRescheduleModal({ open: false, appointment: null });
        setError('');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reschedule appointment');
    } finally {
      setActionLoading({ ...actionLoading, reschedule: false });
    }
  };

  const handleCancel = (appointment) => {
    setCancelModal({ open: true, appointment });
    setCancelReason('');
  };

  const handleGenerateReport = (appointment) => {
    setReportModal({ open: true, appointment });
  };

  const handleMarkAsPaid = async (appointment) => {
    try {
      setActionLoading(prev => ({ ...prev, [`payment-${appointment._id}`]: true }));
      
      await apiClient.put(`/api/appointments/${appointment._id}/payment`, {
        paymentStatus: 'completed',
        paymentMethod: 'cash' // Default for walk-in payments
      });
      
      await fetchAppointments();
      toast({ 
        title: 'Payment Updated', 
        description: 'Payment status marked as completed', 
        variant: 'success' 
      });
    } catch (err) {
      console.error('Error updating payment:', err);
      toast({ 
        title: 'Update Failed', 
        description: err.response?.data?.error || 'Failed to update payment status', 
        variant: 'destructive' 
      });
    } finally {
      setActionLoading(prev => ({ ...prev, [`payment-${appointment._id}`]: false }));
    }
  };

  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      setActionLoading(prev => ({ ...prev, [`status-${appointmentId}`]: true }));
      await apiClient.put(`/api/appointments/${appointmentId}`, { status });
      await fetchAppointments();
      toast({ title: 'Status updated', description: `Appointment set to ${status}`, variant: 'success' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update status');
      toast({ title: 'Update failed', description: 'Unable to update status', variant: 'destructive' });
    } finally {
      setActionLoading(prev => ({ ...prev, [`status-${appointmentId}`]: false }));
    }
  };

  const deleteAppointment = async (appointmentId) => {
    try {
      setActionLoading(prev => ({ ...prev, [`delete-${appointmentId}`]: true }));
      await apiClient.delete(`/api/appointments/${appointmentId}`);
      await fetchAppointments();
      toast({ title: 'Appointment removed', variant: 'success' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete appointment');
      toast({ title: 'Delete failed', description: 'Unable to remove appointment', variant: 'destructive' });
    } finally {
      setActionLoading(prev => ({ ...prev, [`delete-${appointmentId}`]: false }));
    }
  };

  const handleQuickStatus = async (appointment, target) => {
    if (target === 'delete') {
      if (!confirm('Are you sure you want to permanently delete this appointment?')) {
        return;
      }
      await deleteAppointment(appointment._id);
      return;
    }
    if (target === 'cancelled') {
      // Process cancellation (refund) and keep the record; do not delete immediately
      try {
        setActionLoading(prev => ({ ...prev, [`cancel-${appointment._id}`]: true }));
        await apiClient.delete(`/api/appointments/${appointment._id}/cancel`, {
          data: { refundReason: 'Cancelled by admin', refundMethod: 'original_payment_method' }
        });
        await fetchAppointments();
        toast({ title: 'Appointment cancelled', description: 'Record retained for 48 hours', variant: 'success' });
      } catch (err) {
        toast({ title: 'Cancellation failed', description: err.response?.data?.error || 'Unable to cancel appointment', variant: 'destructive' });
      } finally {
        setActionLoading(prev => ({ ...prev, [`cancel-${appointment._id}`]: false }));
      }
    }
  };

  const [confirmModal, setConfirmModal] = useState({ open: false, appointment: null, target: null });
  const openConfirm = (appointment, target) => setConfirmModal({ open: true, appointment, target });
  const closeConfirm = () => setConfirmModal({ open: false, appointment: null, target: null });
  const confirmAction = async () => {
    if (!confirmModal.open || !confirmModal.appointment) return;
    const { appointment, target } = confirmModal;
    await handleQuickStatus(appointment, target);
    closeConfirm();
  };

  const confirmCancel = async () => {
    try {
      setActionLoading({ ...actionLoading, cancel: true });
      
      const response = await apiClient.delete(
        `/api/appointments/${cancelModal.appointment._id}/cancel`,
        {
          data: {
            refundReason: cancelReason,
            refundMethod: 'original_payment_method'
          }
        }
      );

      if (response.data.success) {
        await fetchAppointments();
        setCancelModal({ open: false, appointment: null });
        setError('');
        alert(`Appointment cancelled successfully. Refund of LKR ${response.data.refund.amount} will be processed.`);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to cancel appointment');
    } finally {
      setActionLoading({ ...actionLoading, cancel: false });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-red-600" />
          <p className="text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="h-8 w-8 text-red-600" />
              Manage Appointments
            </h1>
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  if (user?.role === 'receptionist') {
                    navigate('/receptionist');
                  } else if (user?.role === 'admin') {
                    navigate('/admin');
                  } else {
                    navigate('/');
                  }
                }}
                variant="outline"
                className="border-gray-300 hover:bg-gray-50"
              >
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <Button
                onClick={() => {
                  if (user?.role === 'receptionist' || user?.role === 'admin') {
                    navigate('/receptionist/book-appointment');
                  } else {
                    navigate('/services');
                  }
                }}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Book New Appointment
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Search by customer, vehicle, service, bay"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 bg-gray-50 focus:ring-red-500 focus:border-red-500"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="all">All Status</option>
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
            <p className="text-xs text-gray-500 mt-2">Sorted by nearest appointment date/time first</p>
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
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Appointments Found</h3>
              <p className="text-gray-500 mb-4">
                {appointments.length === 0 
                  ? "No appointments have been booked yet." 
                  : "Try changing your search or filters."}
              </p>
              <Button
                onClick={() => navigate('/services')}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Book Your First Appointment
              </Button>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredAndSorted.map((appointment) => (
                <Card key={appointment._id} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Package className="h-5 w-5 text-red-600" />
                          <span className="font-semibold text-lg">
                            {appointment.packageId?.pkgName || 'Service'}
                          </span>
                        </div>
                        <Badge className={getStatusColor(appointment.status)}>
                          Service: {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </Badge>
                        {appointment.payment && (
                          <Badge className={getPaymentStatusColor(appointment.payment.status)}>
                            Payment: {appointment.payment.status.charAt(0).toUpperCase() + appointment.payment.status.slice(1)}
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          onClick={() => handleGenerateReport(appointment)}
                          variant="outline"
                          size="sm"
                          className="text-green-600 border-green-600 hover:bg-green-50"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Report
                        </Button>
                        {appointment.payment?.status === 'pending' && (
                          <Button
                            onClick={() => handleMarkAsPaid(appointment)}
                            variant="outline"
                            size="sm"
                            disabled={actionLoading[`payment-${appointment._id}`]}
                            className="text-purple-600 border-purple-600 hover:bg-purple-50"
                          >
                            {actionLoading[`payment-${appointment._id}`] ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-1" />
                            ) : (
                              <CheckCircle className="h-4 w-4 mr-1" />
                            )}
                            Mark as Paid
                          </Button>
                        )}
                        {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                          <>
                            <Button
                              onClick={() => handleReschedule(appointment)}
                              variant="outline"
                              size="sm"
                              className="text-blue-600 border-blue-600 hover:bg-blue-50"
                            >
                              <Edit3 className="h-4 w-4 mr-1" />
                              Reschedule
                            </Button>
                            <Button
                              onClick={() => handleCancel(appointment)}
                              variant="outline"
                              size="sm"
                              disabled={actionLoading[`cancel-${appointment._id}`]}
                              className="text-red-600 border-red-600 hover:bg-red-50"
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
                        <User className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">Customer</p>
                          <p className="font-medium">{appointment.customerName}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">Vehicle</p>
                          <p className="font-medium">{formatVehicle(appointment.vehicle)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">Date</p>
                          <p className="font-medium">
                            {new Date(appointment.appointmentDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">Time</p>
                          <p className="font-medium">{appointment.startTime} - {appointment.endTime}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">Bay</p>
                          <p className="font-medium">Bay {appointment.bayNumber}</p>
                        </div>
                      </div>
                      
                      {appointment.payment && (
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-500">Amount</p>
                            <p className="font-medium">LKR {appointment.payment.amount}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {appointment.notes && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-500">Notes</p>
                        <p className="text-sm text-gray-700">{appointment.notes}</p>
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
                    <label className="block text-sm font-medium mb-2">New Date</label>
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => handleDateChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">New Time</label>
                    <select
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Select time</option>
                      {availableTimes.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
                    <textarea
                      value={newNotes}
                      onChange={(e) => setNewNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      rows={3}
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={confirmReschedule}
                    disabled={actionLoading.reschedule}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    {actionLoading.reschedule ? 'Rescheduling...' : 'Confirm'}
                  </Button>
                  <Button
                    onClick={() => setRescheduleModal({ open: false, appointment: null })}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Cancel Modal */}
          {cancelModal.open && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                <h3 className="text-xl font-bold mb-4">Cancel Appointment</h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Cancellation Reason</label>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={3}
                    placeholder="Please provide a reason for cancellation..."
                  />
                </div>
                
                <div className="flex gap-3">
                  <Button
                    onClick={confirmCancel}
                    disabled={actionLoading.cancel}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    {actionLoading.cancel ? 'Cancelling...' : 'Confirm Cancellation'}
                  </Button>
                  <Button
                    onClick={() => setCancelModal({ open: false, appointment: null })}
                    variant="outline"
                    className="flex-1"
                  >
                    Keep Appointment
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
      <ToastContainer />
    </div>
  );
};

export default AppointmentManagement;
