import React, { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  Calendar,
  Car,
  Clock,
  CheckCircle,
  Wrench,
  User,
  AlertCircle,
  Edit,
  Trash2,
  LogOut,
  Search,
  X,
  FileText,
  Download,
  Printer,
  Loader2,
} from 'lucide-react';
import apiClient from '@/api/axios';

const StatsCard = ({ title, value, icon }) => (
  <div className="bg-white rounded-xl shadow-lg p-10 border-2 border-gray-200 hover:shadow-2xl hover:border-red-300 transition-all duration-300">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600 mb-3">{title}</p>
        <p className="text-4xl font-bold text-gray-900">{value}</p>
      </div>
      <div className="bg-red-600 p-4 rounded-lg">
        {React.cloneElement(icon, { className: 'text-white', size: 32 })}
      </div>
    </div>
  </div>
);

const AppointmentCard = ({ appointment, showProgress = false }) => {
  if (!appointment) return null;

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      'scheduled': 'bg-blue-100 text-blue-800', 
      'check-in': 'bg-indigo-100 text-indigo-800',
      'in-progress': 'bg-purple-100 text-purple-800',
      'issue': 'bg-orange-100 text-orange-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-200">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-800">{appointment.service || 'Service'}</h3>
          <p className="text-sm text-gray-600">{appointment.vehicle || 'Vehicle'}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
          {appointment.status || 'pending'}
        </span>
      </div>
      
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Calendar size={16} />
          <span>{appointment.date || 'Date not set'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={16} />
          <span>{appointment.time || 'Time not set'}</span>
        </div>
      </div>

      {showProgress && appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
        <>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Progress ({appointment.currentStage || 'Scheduled'})</span> 
              <span>{appointment.progress || 0}%</span> 
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-red-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${appointment.progress || 0}%` }}
              ></div>
            </div>
          </div>

          {Array.isArray(appointment.stages) && appointment.stages.length > 0 && (
            <div className="mt-3">
              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
                {appointment.stages.map((stage, idx) => {
                  const isDone = Boolean(stage.completed);
                  const label = (stage.name || '').toString();
                  const time = stage.completedAt ? new Date(stage.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null;
                  return (
                    <div key={`${label}-${idx}`} className="flex items-center">
                      <div className={`w-2 h-2 rounded-full ${isDone ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                      <div className="ml-2 mr-3">
                        <div className={`text-[11px] leading-3 ${isDone ? 'text-gray-800' : 'text-gray-500'}`}>{label}</div>
                        {time && <div className="text-[10px] text-gray-400">{time}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {Array.isArray(appointment.jobNotesList) && appointment.jobNotesList.length > 0 && (
            <div className="mt-3 border-t pt-3">
              <div className="text-xs font-medium text-gray-700 mb-2">Service notes</div>
              <div className="space-y-2">
                {appointment.jobNotesList.slice(0,3).map((n, i) => (
                  <div key={n._id || i} className="text-xs text-gray-700 flex items-start gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      n.type === 'issue' ? 'bg-red-100 text-red-700' :
                      n.type === 'update' ? 'bg-blue-100 text-blue-700' :
                      n.type === 'completion' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {n.type}
                    </span>
                    <span className="flex-1 leading-4">{n.content}</span>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">{n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
;

const VehicleCard = ({ vehicle, onEdit, onDelete }) => (
  <div className="bg-white border-2 border-gray-200 rounded-xl p-8 hover:shadow-xl hover:border-red-200 transition-all duration-300">
    <div className="flex items-start gap-4">
      <div className="bg-red-600 p-3 rounded-lg flex-shrink-0">
        <Car size={24} className="text-white" />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 text-lg">{vehicle.make} {vehicle.model}</h3>
        <p className="text-sm text-gray-600 mt-1">{vehicle.year} • {vehicle.registrationNumber || vehicle.licensePlate}</p>
        <div className="mt-3 flex gap-2">
          <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded font-medium">
            {vehicle.mileage || vehicle.currentMileage || 0} km
          </span>
          <span className="text-xs bg-gray-900 text-white px-3 py-1 rounded font-medium">
            {vehicle.serviceCount || 0} services
          </span>
        </div>
        <div className="mt-4 flex gap-4">
          <button
            onClick={() => onEdit(vehicle.id)}
            className="text-sm text-gray-700 hover:text-gray-900 flex items-center gap-1 font-medium"
          >
            <Edit size={14} />
            Edit
          </button>
          <button
            onClick={() => onDelete(vehicle.id)}
            className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1 font-medium"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
);

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('🔄 Fetching customer dashboard data...');
        console.log('🔍 Current user from context:', user);
        
        const profileRes = await apiClient.get('/api/auth/profile');
        setUser(profileRes.data);
        console.log('✅ Profile fetched:', profileRes.data);
        
        const customerId = profileRes.data._id || 'customer123';
        console.log('👤 Customer ID:', customerId);
        
        console.log('📡 Fetching appointments and vehicles...');
        const [apptsRes, vehiclesRes] = await Promise.all([
          apiClient.get(`/api/appointments/customer/${customerId}/with-progress`),
          apiClient.get(`/api/vehicles`),
        ]);
        
        console.log('✅ Appointments received:', apptsRes.data?.length || 0, 'items');
        console.log('📋 Appointments data:', apptsRes.data);
        console.log('✅ Vehicles received:', vehiclesRes.data?.length || 0, 'items');
        
        setAppointments(apptsRes.data || []);
        setVehicles(vehiclesRes.data || []);
        
        console.log('✅ Dashboard data loaded successfully');
      } catch (e) {
        console.error('❌ Error fetching data:', e);
        console.error('Error details:', e.response?.data);
        if (e.response?.status === 401) {
          console.log('🔒 Unauthorized - redirecting to login');
          navigate('/login', { replace: true });
        } else {
          console.error('⚠️ Failed to fetch dashboard data. Please try refreshing.');
        }
        setAppointments([]);
        setVehicles([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  useEffect(() => {
    if (!user?._id) return;
    const socket = io('http://localhost:5001', { withCredentials: true });
    socket.emit('register', { customerId: user._id });
    socket.on('job:update', (payload) => {
      setAppointments((prev) => prev.map((a) => {
        const isMatch = a._id === payload.bookingId;
        if (!isMatch) return a;
        const nextStatus = ['check-in','in-progress','issue','completed'].includes(payload.status) ? payload.status : a.status;
        return {
          ...a,
          status: nextStatus || a.status,
          jobStatus: payload.status || a.jobStatus,
          currentStage: payload.currentStage ?? a.currentStage,
          progress: typeof payload.progress === 'number' ? payload.progress : a.progress,
          stages: Array.isArray(payload.stages) ? payload.stages : a.stages,
        };
      }));
    });
    return () => {
      socket.close();
    };
  }, [user]);

  const handleLogout = async () => {
    try {
      await apiClient.post('/api/auth/logout');
    } catch (err) {
      console.error("Logout failed:", err);
    }
    await logout();
    navigate('/login', { replace: true });
  };

  const handleDeleteVehicle = async (id) => {
    if (!window.confirm("Delete this vehicle?")) return;
    try {
      await apiClient.delete(`/api/vehicles/${id}`);
      setVehicles(vehicles.filter(v => v._id !== id));
    } catch (err) {
      alert("Failed to delete vehicle.");
    }
  };

  const handleEditVehicle = (id) => {
    navigate(`/vehicles/edit/${id}`);
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("⚠️ Are you sure you want to delete your account? This action cannot be undone. All your vehicles and data will be permanently deleted.")) {
      return;
    }

    try {
      await apiClient.delete('/api/auth/profile');
      alert("Your account has been deleted.");
      try { await logout(); } catch (_) {}
      navigate('/login', { replace: true });
    } catch (err) {
      alert("Failed to delete account. Please try again.");
    }
  };

  const generateCustomerReport = () => {
    setReportLoading(true);
    setReportGenerated(true);
    
    setTimeout(() => {
      setReportLoading(false);
    }, 1500);
  };

  const downloadCustomerReport = () => {
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();
    
    const totalAppointments = appointments.length;
    const upcomingAppointments = appointments.filter(a => {
      const isUpcoming = ['pending', 'confirmed'].includes(a.status?.toLowerCase());
      const isScheduledJob = a.jobStatus === 'scheduled';
      return isUpcoming || isScheduledJob;
    }).length;
    const inProgressJobs = appointments.filter(
      a => ['check-in', 'in-progress', 'issue'].includes(a.status?.toLowerCase()) ||
           ['check-in', 'in-progress', 'issue'].includes(a.jobStatus)
    ).length;
    const completedServices = appointments.filter(
      a => a.status?.toLowerCase() === 'completed' || a.jobStatus === 'completed'
    ).length;

    const reportContent = `
AUTOCARE SERVICE CENTER - CUSTOMER REPORT
=========================================

Report Generated: ${currentDate} at ${currentTime}
Customer ID: ${user?._id || 'N/A'}

CUSTOMER PROFILE INFORMATION
============================
Name: ${user?.name || 'Not provided'}
Email: ${user?.email || 'Not provided'}
Phone Numbers: ${user?.phoneNumbers?.join(', ') || 'None'}
Preferred Contact Method: ${user?.preferredContactMethod || 'Not set'}
Address: ${user?.address || 'Not provided'}

SERVICE STATISTICS SUMMARY
===========================
Total Appointments: ${totalAppointments}
Upcoming Appointments: ${upcomingAppointments}
Services In Progress: ${inProgressJobs}
Completed Services: ${completedServices}

VEHICLE INFORMATION
===================
Total Vehicles: ${vehicles.length}

${vehicles.length > 0 ? vehicles.map((vehicle, index) => `
Vehicle ${index + 1}:
  Make: ${vehicle.make || 'N/A'}
  Model: ${vehicle.model || 'N/A'}
  Year: ${vehicle.year || 'N/A'}
  Registration: ${vehicle.registrationNumber || vehicle.licensePlate || 'N/A'}
  Current Mileage: ${vehicle.currentMileage || 'N/A'}
  Service History Count: ${vehicle.serviceHistory?.length || 0}
`).join('') : 'No vehicles registered'}

APPOINTMENT HISTORY
===================
${appointments.length > 0 ? appointments.map((appointment, index) => `
Appointment ${index + 1}:
  Date: ${appointment.date || 'N/A'}
  Time: ${appointment.time || 'N/A'}
  Service: ${appointment.service?.name || 'N/A'}
  Status: ${appointment.status || 'N/A'}
  Job Status: ${appointment.jobStatus || 'N/A'}
  Vehicle: ${appointment.vehicle ? `${appointment.vehicle.make} ${appointment.vehicle.model}` : 'N/A'}
  Notes: ${appointment.notes || 'No notes'}
`).join('') : 'No appointments found'}

RECENT ACTIVITY SUMMARY
=======================
${inProgressJobs > 0 ? `Currently ${inProgressJobs} service(s) in progress` : 'No services currently in progress'}
${upcomingAppointments > 0 ? `${upcomingAppointments} upcoming appointment(s) scheduled` : 'No upcoming appointments'}
${completedServices > 0 ? `${completedServices} service(s) completed` : 'No completed services'}

---
Report generated on ${new Date().toLocaleString()}
AutoCare Service Management System
For support, contact: support@autocare.com
    `;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customer-report-${user?.name?.replace(/\s+/g, '-') || 'customer'}-${currentDate.replace(/\//g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const printCustomerReport = () => {
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();
    
    const totalAppointments = appointments.length;
    const upcomingAppointments = appointments.filter(a => {
      const isUpcoming = ['pending', 'confirmed'].includes(a.status?.toLowerCase());
      const isScheduledJob = a.jobStatus === 'scheduled';
      return isUpcoming || isScheduledJob;
    }).length;
    const inProgressJobs = appointments.filter(
      a => ['check-in', 'in-progress', 'issue'].includes(a.status?.toLowerCase()) ||
           ['check-in', 'in-progress', 'issue'].includes(a.jobStatus)
    ).length;
    const completedServices = appointments.filter(
      a => a.status?.toLowerCase() === 'completed' || a.jobStatus === 'completed'
    ).length;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Customer Report - ${user?.name || 'Customer'}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            .header { text-align: center; border-bottom: 3px solid #dc2626; padding-bottom: 15px; margin-bottom: 30px; }
            .section { margin-bottom: 25px; page-break-inside: avoid; }
            .section h2 { color: #dc2626; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 15px; }
            .section h3 { color: #374151; border-bottom: 1px solid #d1d5db; padding-bottom: 5px; margin-bottom: 10px; }
            .info-row { margin: 8px 0; }
            .label { font-weight: bold; color: #374151; }
            .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 15px 0; }
            .stat-item { background: #f9fafb; padding: 10px; border-radius: 8px; text-align: center; }
            .stat-number { font-size: 24px; font-weight: bold; color: #dc2626; }
            .stat-label { font-size: 14px; color: #6b7280; }
            .vehicle-item, .appointment-item { background: #f8fafc; padding: 12px; margin: 8px 0; border-radius: 6px; border-left: 4px solid #dc2626; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 20px; }
            @media print { 
              body { margin: 0; }
              .section { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>AUTOCARE SERVICE CENTER</h1>
            <h2>CUSTOMER REPORT</h2>
            <p>Generated: ${currentDate} at ${currentTime}</p>
            <p>Customer ID: ${user?._id || 'N/A'}</p>
          </div>

          <div class="section">
            <h2>CUSTOMER PROFILE INFORMATION</h2>
            <div class="info-row"><span class="label">Name:</span> ${user?.name || 'Not provided'}</div>
            <div class="info-row"><span class="label">Email:</span> ${user?.email || 'Not provided'}</div>
            <div class="info-row"><span class="label">Phone Numbers:</span> ${user?.phoneNumbers?.join(', ') || 'None'}</div>
            <div class="info-row"><span class="label">Preferred Contact Method:</span> ${user?.preferredContactMethod || 'Not set'}</div>
            <div class="info-row"><span class="label">Address:</span> ${user?.address || 'Not provided'}</div>
          </div>

          <div class="section">
            <h2>SERVICE STATISTICS SUMMARY</h2>
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-number">${totalAppointments}</div>
                <div class="stat-label">Total Appointments</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">${upcomingAppointments}</div>
                <div class="stat-label">Upcoming</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">${inProgressJobs}</div>
                <div class="stat-label">In Progress</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">${completedServices}</div>
                <div class="stat-label">Completed</div>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>VEHICLE INFORMATION</h2>
            <h3>Total Vehicles: ${vehicles.length}</h3>
            ${vehicles.length > 0 ? vehicles.map((vehicle, index) => `
              <div class="vehicle-item">
                <h4>Vehicle ${index + 1}</h4>
                <div class="info-row"><span class="label">Make:</span> ${vehicle.make || 'N/A'}</div>
                <div class="info-row"><span class="label">Model:</span> ${vehicle.model || 'N/A'}</div>
                <div class="info-row"><span class="label">Year:</span> ${vehicle.year || 'N/A'}</div>
                <div class="info-row"><span class="label">Registration:</span> ${vehicle.registrationNumber || vehicle.licensePlate || 'N/A'}</div>
                <div class="info-row"><span class="label">Current Mileage:</span> ${vehicle.currentMileage || 'N/A'}</div>
                <div class="info-row"><span class="label">Service History Count:</span> ${vehicle.serviceHistory?.length || 0}</div>
              </div>
            `).join('') : '<p>No vehicles registered</p>'}
          </div>

          <div class="section">
            <h2>APPOINTMENT HISTORY</h2>
            ${appointments.length > 0 ? appointments.map((appointment, index) => `
              <div class="appointment-item">
                <h4>Appointment ${index + 1}</h4>
                <div class="info-row"><span class="label">Date:</span> ${appointment.date || 'N/A'}</div>
                <div class="info-row"><span class="label">Time:</span> ${appointment.time || 'N/A'}</div>
                <div class="info-row"><span class="label">Service:</span> ${appointment.service?.name || 'N/A'}</div>
                <div class="info-row"><span class="label">Status:</span> ${appointment.status || 'N/A'}</div>
                <div class="info-row"><span class="label">Job Status:</span> ${appointment.jobStatus || 'N/A'}</div>
                <div class="info-row"><span class="label">Vehicle:</span> ${appointment.vehicle ? `${appointment.vehicle.make} ${appointment.vehicle.model}` : 'N/A'}</div>
                <div class="info-row"><span class="label">Notes:</span> ${appointment.notes || 'No notes'}</div>
              </div>
            `).join('') : '<p>No appointments found</p>'}
          </div>

          <div class="section">
            <h2>RECENT ACTIVITY SUMMARY</h2>
            <div class="info-row">${inProgressJobs > 0 ? `Currently ${inProgressJobs} service(s) in progress` : 'No services currently in progress'}</div>
            <div class="info-row">${upcomingAppointments > 0 ? `${upcomingAppointments} upcoming appointment(s) scheduled` : 'No upcoming appointments'}</div>
            <div class="info-row">${completedServices > 0 ? `${completedServices} service(s) completed` : 'No completed services'}</div>
          </div>

          <div class="footer">
            <p>Report generated on ${new Date().toLocaleString()}</p>
            <p>AutoCare Service Management System</p>
            <p>For support, contact: support@autocare.com</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const availableFeatures = useMemo(() => [
    {
      id: 'add-vehicle',
      title: 'Add Vehicle',
      description: 'Add a new vehicle to your account',
      keywords: ['add', 'vehicle', 'car', 'new', 'register'],
      action: () => navigate('/vehicles/new'),
      icon: <Car size={16} className="text-red-600" />,
      category: 'Vehicles'
    },
    {
      id: 'edit-profile',
      title: 'Edit Profile',
      description: 'Update your personal information',
      keywords: ['edit', 'profile', 'update', 'personal', 'information', 'account'],
      action: () => navigate('/profile/edit'),
      icon: <User size={16} className="text-red-600" />,
      category: 'Profile'
    },
    {
      id: 'book-service',
      title: 'Book New Service',
      description: 'Schedule a new service appointment',
      keywords: ['book', 'service', 'appointment', 'schedule', 'new', 'booking'],
      action: () => navigate('/services'),
      icon: <Calendar size={16} className="text-red-600" />,
      category: 'Services'
    },
    {
      id: 'view-appointments',
      title: 'View Appointments',
      description: 'See all your scheduled appointments',
      keywords: ['view', 'appointments', 'schedule', 'bookings', 'my'],
      action: () => navigate('/myappointments'),
      icon: <Calendar size={16} className="text-red-600" />,
      category: 'Appointments'
    },
    {
      id: 'view-vehicles',
      title: 'View Vehicles',
      description: 'See all your registered vehicles',
      keywords: ['view', 'vehicles', 'cars', 'my', 'registered'],
      action: () => {
        const vehiclesSection = document.getElementById('vehicles-section');
        if (vehiclesSection) {
          vehiclesSection.scrollIntoView({ behavior: 'smooth' });
        }
      },
      icon: <Car size={16} className="text-red-600" />,
      category: 'Vehicles'
    },
    {
      id: 'delete-account',
      title: 'Delete Account',
      description: 'Permanently delete your account',
      keywords: ['delete', 'account', 'remove', 'close'],
      action: handleDeleteAccount,
      icon: <Trash2 size={16} className="text-red-600" />,
      category: 'Account'
    },
    {
      id: 'generate-report',
      title: 'Generate Report',
      description: 'Download detailed customer report with all your information',
      keywords: ['report', 'download', 'export', 'summary', 'details', 'information'],
      action: generateCustomerReport,
      icon: <FileText size={16} className="text-red-600" />,
      category: 'Reports'
    }
  ], [navigate, handleDeleteAccount]);

  const filteredFeatures = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    return availableFeatures.filter(feature => 
      feature.title.toLowerCase().includes(query) ||
      feature.description.toLowerCase().includes(query) ||
      feature.keywords.some(keyword => keyword.toLowerCase().includes(query))
    );
  }, [searchQuery, availableFeatures]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSearchResults(value.length > 0);
  };

  const handleSearchResultClick = (feature) => {
    feature.action();
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowSearchResults(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSearchResults && !event.target.closest('.search-container')) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSearchResults]);

  const stats = useMemo(() => {
    const totalAppointments = appointments.length;
    const upcomingAppointments = appointments.filter(a => {
      const isUpcoming = ['pending', 'confirmed'].includes(a.status?.toLowerCase());
      const isScheduledJob = a.jobStatus === 'scheduled';
      return isUpcoming || isScheduledJob;
    }).length;
    const inProgressJobs = appointments.filter(
      a => ['check-in', 'in-progress', 'issue'].includes(a.status?.toLowerCase()) ||
           ['check-in', 'in-progress', 'issue'].includes(a.jobStatus)
    ).length;
    const completedServices = appointments.filter(
      a => a.status?.toLowerCase() === 'completed' || a.jobStatus === 'completed'
    ).length;

    return [
      {
        title: 'Total Appointments',
        value: totalAppointments,
        icon: <Calendar size={24} />,
      },
      {
        title: 'Upcoming',
        value: upcomingAppointments,
        icon: <Clock size={24} />,
      },
      {
        title: 'In Progress',
        value: inProgressJobs,
        icon: <Wrench size={24} />,
      },
      {
        title: 'Completed',
        value: completedServices,
        icon: <CheckCircle size={24} />,
      },
    ];
  }, [appointments]);

  const inProgressJobs = useMemo(() => {
    const filtered = appointments.filter(a => {
      const isActivelyWorking = ['check-in', 'in-progress', 'issue'].includes(a.status?.toLowerCase()) ||
                                 ['check-in', 'in-progress', 'issue'].includes(a.jobStatus);
      return isActivelyWorking;
    });
    console.log('🔧 In Progress Jobs:', filtered.length, 'items');
    console.log('In Progress data:', filtered);
    return filtered.slice(0, 3);
  }, [appointments]);

  const upcomingAppointments = useMemo(() => {
    const filtered = appointments.filter(a => {
      const isUpcoming = ['pending', 'confirmed'].includes(a.status?.toLowerCase());
      const isScheduledJob = a.jobStatus === 'scheduled';
      const hasNotStarted = isUpcoming || isScheduledJob;
      
      console.log(`📅 Checking appointment ${a._id}: status=${a.status}, jobStatus=${a.jobStatus}, isUpcoming=${isUpcoming}, isScheduledJob=${isScheduledJob}, hasNotStarted=${hasNotStarted}`);
      return hasNotStarted;
    });
    console.log('📅 Upcoming Appointments:', filtered.length, 'items');
    console.log('Upcoming data:', filtered);
    return filtered
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA - dateB;
      })
      .slice(0, 3);
  }, [appointments]);

  const recentVehicles = useMemo(() => {
    return vehicles.map(v => ({
      id: v._id,
      make: v.make,
      model: v.model,
      year: v.year,
      registrationNumber: v.registrationNumber,
      licensePlate: v.licensePlate,
      mileage: v.currentMileage || 0,
      serviceCount: v.serviceHistory?.length || 0,
    }));
  }, [vehicles]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">If this takes too long, please check your connection</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-black via-gray-900 to-black shadow-2xl border-b-4 border-red-600 mt-[72px]">
        <div className="max-w-7xl mx-auto px-8 py-10">
          <div className="flex items-center">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-white tracking-tight">My Dashboard</h1>
              <p className="text-gray-400 text-lg">Welcome back, <span className="text-red-500 font-semibold">{user?.name || 'User'}</span></p>
            </div>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <div className="w-full px-8 py-6 max-w-[1600px] mx-auto">
        <div className="relative search-container">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search for features (e.g., 'add vehicle', 'edit profile', 'book service')..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-12 pr-12 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none shadow-lg transition-all duration-200"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </div>
          
          {/* Search Results Dropdown */}
          {showSearchResults && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto">
              {filteredFeatures.length > 0 ? (
                <div className="p-2">
                  {filteredFeatures.map((feature) => (
                    <button
                      key={feature.id}
                      onClick={() => handleSearchResultClick(feature)}
                      className="w-full text-left p-4 hover:bg-gray-50 rounded-lg transition-colors group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {feature.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
                              {feature.title}
                            </h3>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                              {feature.category}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <Search size={32} className="mx-auto mb-2 text-gray-300" />
                  <p>No features found matching "{searchQuery}"</p>
                  <p className="text-sm mt-1">Try searching for "vehicle", "profile", "service", or "appointment"</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="w-full px-8 py-12 max-w-[1600px] mx-auto">
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-lg p-10 mb-12 border border-gray-200">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="bg-red-600 p-2 rounded-lg">
                  <User size={20} className="text-white" />
                </div>
                Your Profile
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <span className="font-semibold text-gray-700">Name:</span>
                  <span className="ml-2 text-gray-600">{user?.name}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Email:</span>
                  <span className="ml-2 text-gray-600">{user?.email}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Phone(s):</span>
                  <span className="ml-2 text-gray-600">{user?.phoneNumbers?.join(', ') || 'None'}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Preferred Contact:</span>
                  <span className="ml-2 text-gray-600">{user?.preferredContactMethod || 'Not set'}</span>
                </div>
                <div className="md:col-span-2">
                  <span className="font-semibold text-gray-700">Address:</span>
                  <span className="ml-2 text-gray-600">{user?.address || 'Not provided'}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3 ml-8">
              <button
                onClick={() => navigate('/profile/edit')}
                className="px-6 py-2.5 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Edit Profile
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-6 py-2.5 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {stats.map((stat, index) => (
            <StatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
            />
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column - Jobs & Appointments */}
          <div className="lg:col-span-8 space-y-10">
            {/* Current Jobs Progress */}
            <div className="bg-white rounded-xl shadow-lg p-10 border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                  <Wrench size={20} className="text-red-600" />
                  Current Jobs in Progress
                </h2>
                {/* <Link
                  to="/appointments"
                  className="text-sm font-medium text-red-600 hover:text-red-700"
                >
                  View all →
                </Link> */}
              </div>
              {inProgressJobs.length > 0 ? (
                <div className="space-y-4">
                  {inProgressJobs.map((appointment) => (
                    <AppointmentCard key={appointment._id} appointment={appointment} showProgress={true} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-gray-50 rounded-lg">
                  <Wrench size={48} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500">No jobs in progress</p>
                </div>
              )}
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-white rounded-xl shadow-lg p-10 border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                  <Calendar size={20} className="text-red-600" />
                  Upcoming Appointments
                </h2>
                {/* <Link
                  to="/appointments"
                  className="text-sm font-medium text-red-600 hover:text-red-700"
                >
                  View all →
                </Link> */}
              </div>
              {upcomingAppointments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <AppointmentCard key={appointment._id} appointment={appointment} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-gray-50 rounded-lg">
                  <Calendar size={48} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500">No upcoming appointments</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Quick Actions & Vehicles */}
          <div className="lg:col-span-4 space-y-10">
            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl shadow-2xl p-10 border-2 border-red-600">
              <h2 className="text-xl font-bold mb-6 text-white">Quick Actions</h2>
              <div className="space-y-4">
                <Link
                  to="/services"
                  className="block w-full py-3 bg-red-600 text-white text-center rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Book New Service
                </Link>
                <Link
                  to="/myappointments"
                  className="block w-full py-3 bg-white text-gray-900 text-center rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  View Appointments
                </Link>
                <Link
                  to="/vehicles/new"
                  className="block w-full py-3 bg-white text-gray-900 text-center rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  Add Vehicle
                </Link>
                
                {/* Report Generation Section */}
                <div className="border-t border-gray-700 pt-4 mt-4">
                  <h3 className="text-lg font-semibold mb-3 text-white">Generate Report</h3>
                  <div className="space-y-2">
                    <button
                      onClick={generateCustomerReport}
                      disabled={reportLoading}
                      className="w-full py-2 px-4 bg-blue-600 text-white text-center rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {reportLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <FileText className="h-4 w-4" />
                          Generate Report
                        </>
                      )}
                    </button>
                    
                    {reportGenerated && !reportLoading && (
                      <div className="space-y-2">
                        <button
                          onClick={downloadCustomerReport}
                          className="w-full py-2 px-4 bg-green-600 text-white text-center rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download Report
                        </button>
                        <button
                          onClick={printCustomerReport}
                          className="w-full py-2 px-4 bg-purple-600 text-white text-center rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <Printer className="h-4 w-4" />
                          Print Report
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* My Vehicles */}
            <div id="vehicles-section" className="bg-white rounded-xl shadow-lg p-10 border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                  <Car size={20} className="text-red-600" />
                  My Vehicles
                </h2>
                <Link
                  to="/vehicles/new"
                  className="text-sm font-medium text-red-600 hover:text-red-700"
                >
                  + Add
                </Link>
              </div>
              {recentVehicles.length > 0 ? (
                <div className="space-y-4">
                  {recentVehicles.map((vehicle) => (
                    <VehicleCard 
                      key={vehicle.id} 
                      vehicle={vehicle}
                      onEdit={handleEditVehicle}
                      onDelete={handleDeleteVehicle}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-gray-50 rounded-lg">
                  <Car size={48} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500 mb-3">No vehicles added yet.</p>
                  <Link
                    to="/vehicles/new"
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Add your first vehicle →
                  </Link>
                </div>
              )}
            </div>

            {/* Service Reminder */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl shadow-lg p-8 border-2 border-red-300">
              <div className="flex items-start gap-3">
                <AlertCircle size={24} className="text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Service Reminder</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Regular maintenance keeps your vehicle running smoothly and prevents costly repairs.
                  </p>
                  <Link
                    to="/services"
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Schedule Service →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomerDashboard;