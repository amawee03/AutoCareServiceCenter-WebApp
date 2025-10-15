import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle, Calendar, Clock, User, Car, Phone, Mail, MapPin, ArrowRight, Download, Printer, Home } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const AdminAppointmentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointment, setAppointment] = useState(location.state?.appointment || null);

  useEffect(() => {
    // Get appointment from navigation state
    if (location.state?.appointment) {
      setAppointment(location.state.appointment);
    }
  }, [location.state]);

  const onBookAnother = () => {
    if (user?.role === 'receptionist' || user?.role === 'admin') {
      navigate('/receptionist/book-appointment');
    } else {
      navigate('/services');
    }
  };

  const onViewAppointments = () => {
    navigate('/appointments');
  };

  const onGoToDashboard = () => {
    if (user?.role === 'receptionist') {
      navigate('/receptionist');
    } else if (user?.role === 'admin') {
      navigate('/admin');
    } else if (user?.role === 'customer') {
      navigate('/customer/dashboard');
    } else {
      navigate('/');
    }
  };

  const handleDownloadReceipt = async () => {
    if (!appointment) return;
    try {
      const element = document.getElementById('receipt-section');
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: false,
        scrollX: 0,
        scrollY: 0,
        width: element.scrollWidth,
        height: element.scrollHeight,
        windowWidth: Math.max(document.documentElement.clientWidth, document.documentElement.scrollWidth, document.documentElement.offsetWidth),
        windowHeight: Math.max(document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight),
        backgroundColor: '#ffffff',
        onclone: (doc) => {
          const target = doc.getElementById('receipt-section');
          if (!target) return;
          doc.documentElement && (doc.documentElement.style.backgroundColor = '#ffffff');
          doc.body && (doc.body.style.backgroundColor = '#ffffff');
          const canvas = doc.createElement('canvas');
          const ctx = canvas.getContext && canvas.getContext('2d');
          const normalizeColor = (value) => {
            if (!value) return value;
            if (!/oklch\(/i.test(value)) return value;
            try {
              if (ctx) {
                ctx.fillStyle = value;
                return ctx.fillStyle || value;
              }
            } catch (_) {}
            return '#000000';
          };
          doc.querySelectorAll('style').forEach((styleTag) => {
            try {
              if (styleTag.textContent && /oklch\(/i.test(styleTag.textContent)) {
                styleTag.textContent = styleTag.textContent.replace(/oklch\([^)]*\)/gi, '#000000');
              }
            } catch (_) {}
          });
          const properties = [
            'color', 'backgroundColor', 'background', 'backgroundImage',
            'borderColor', 'borderTopColor', 'borderRightColor',
            'borderBottomColor', 'borderLeftColor', 'outlineColor',
            'textDecorationColor', 'boxShadow', 'textShadow', 'fill', 'stroke'
          ];
          const all = target.querySelectorAll('*');
          all.forEach((el) => {
            const cs = doc.defaultView && doc.defaultView.getComputedStyle
              ? doc.defaultView.getComputedStyle(el)
              : null;
            if (!cs) return;
            properties.forEach((prop) => {
              const val = cs[prop];
              if (!val) return;
              if (/oklch\(/i.test(val)) {
                if (prop === 'background' || prop === 'backgroundImage') {
                  const bgFallback = cs.backgroundColor && cs.backgroundColor !== 'transparent' ? cs.backgroundColor : '#ffffff';
                  el.style.backgroundImage = 'none';
                  el.style.background = 'none';
                  el.style.backgroundColor = normalizeColor(bgFallback);
                } else if (prop === 'boxShadow' || prop === 'textShadow') {
                  el.style[prop] = 'none';
                } else if (prop === 'fill' || prop === 'stroke') {
                  const base = cs.color || '#000000';
                  el.style[prop] = normalizeColor(base);
                } else {
                  el.style[prop] = normalizeColor(val);
                }
              }
            });
            if (/oklch\(/i.test(cs.background)) {
              const bgFallback = cs.backgroundColor && cs.backgroundColor !== 'transparent' ? cs.backgroundColor : '#ffffff';
              el.style.background = 'none';
              el.style.backgroundImage = 'none';
              el.style.backgroundColor = normalizeColor(bgFallback);
            }
          });
        },
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = margin;

      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }

      const total = pdf.getNumberOfPages();
      pdf.setFontSize(9);
      for (let i = 1; i <= total; i++) {
        pdf.setPage(i);
        pdf.text(`Page ${i} of ${total}`, pageWidth - margin, pageHeight - 5, { align: 'right' });
      }

      const filename = `appointment_${appointment._id || appointment.appointmentId || 'receipt'}_${new Date().getTime()}.pdf`;
      pdf.save(filename);
    } catch (error) {
      console.error("Failed to generate receipt:", error);
      alert("Failed to download receipt. Please try again.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Appointment Not Found</h1>
          <p className="text-gray-600 mb-6">The appointment details could not be loaded.</p>
          <button 
            onClick={onViewAppointments}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            View All Appointments
          </button>
        </div>
      </div>
    );
  }

  const appointmentDate = new Date(appointment.preferredTime || appointment.appointmentDate);
  const vehicle = appointment.vehicle;

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-8 sm:px-12 lg:px-16 xl:px-20">

        {/* Receipt Section */}
        <div id="receipt-section" className="pdf-safe">
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Appointment Created!
            </h1>
            <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Walk-in appointment has been successfully registered.
            </p>
            <div className="mt-6 inline-block">
              <span className="px-6 py-3 bg-yellow-100 text-yellow-800 rounded-full font-semibold text-lg">
                Payment Status: Pending
              </span>
            </div>
          </div>

          {/* Appointment Card */}
          <div className="mb-12 border-2 border-green-200 bg-green-50 rounded-xl shadow-lg">
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Appointment Details</h2>
                <p className="text-gray-600">Customer and service information</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Customer Info */}
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <User className="h-6 w-6 text-red-600" />
                      <h3 className="text-xl font-semibold text-gray-900">Customer Information</h3>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
                      <div className="flex items-start gap-3">
                        <User className="h-5 w-5 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600">Name</p>
                          <p className="text-gray-900 font-semibold">{appointment.customerName}</p>
                        </div>
                      </div>
                      {appointment.customerPhone && (
                        <div className="flex items-start gap-3">
                          <Phone className="h-5 w-5 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-600">Phone</p>
                            <p className="text-gray-900 font-semibold">{appointment.customerPhone}</p>
                          </div>
                        </div>
                      )}
                      {appointment.customerEmail && (
                        <div className="flex items-start gap-3">
                          <Mail className="h-5 w-5 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="text-gray-900 font-semibold">{appointment.customerEmail}</p>
                          </div>
                        </div>
                      )}
                      {appointment.customerAddress && (
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-600">Address</p>
                            <p className="text-gray-900 font-semibold">{appointment.customerAddress}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Car className="h-6 w-6 text-red-600" />
                      <h3 className="text-xl font-semibold text-gray-900">Vehicle Details</h3>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Make</p>
                          <p className="text-gray-900 font-semibold">{vehicle?.make || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Model</p>
                          <p className="text-gray-900 font-semibold">{vehicle?.model || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div>
                          <p className="text-sm text-gray-600">Registration</p>
                          <p className="text-gray-900 font-bold text-lg">{vehicle?.registration || 'N/A'}</p>
                        </div>
                        {vehicle?.year && (
                          <div>
                            <p className="text-sm text-gray-600">Year</p>
                            <p className="text-gray-900 font-semibold">{vehicle.year}</p>
                          </div>
                        )}
                      </div>
                      {vehicle?.color && (
                        <div className="pt-2">
                          <p className="text-sm text-gray-600">Color</p>
                          <p className="text-gray-900 font-semibold">{vehicle.color}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Service & Schedule Info */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Service Details</h3>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-4 mb-4">
                        {appointment.servicePackage?.image || appointment.packageId?.image ? (
                          <img
                            src={appointment.servicePackage?.image || appointment.packageId?.image}
                            alt={appointment.servicePackage?.pkgName || appointment.packageId?.pkgName || 'Service'}
                            className="w-20 h-20 object-cover rounded-lg"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/80x80?text=Service'; }}
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Car className="h-10 w-10 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">
                            {appointment.servicePackage?.pkgName || appointment.packageId?.pkgName || 'Service'}
                          </h4>
                          <span className="inline-block mt-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                            {appointment.servicePackage?.category || appointment.packageId?.category || 'General'}
                          </span>
                        </div>
                      </div>
                      {(appointment.servicePackage?.description || appointment.packageId?.description) && (
                        <p className="text-sm text-gray-600 border-t border-gray-200 pt-3">
                          {appointment.servicePackage?.description || appointment.packageId?.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Appointment Schedule</h3>
                    <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-red-600" />
                        <div>
                          <p className="text-sm text-gray-600">Date</p>
                          <p className="font-medium text-gray-900">
                            {appointmentDate.toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-red-600" />
                        <div>
                          <p className="text-sm text-gray-600">Time</p>
                          <p className="font-medium text-gray-900">
                            {appointment.startTime || appointmentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            {appointment.endTime && ` - ${appointment.endTime}`}
                          </p>
                          {appointment.duration && (
                            <p className="text-sm text-gray-600">Duration: {appointment.duration} minutes</p>
                          )}
                        </div>
                      </div>

                      {appointment.bayNumber && (
                        <div className="pt-3 border-t border-gray-200">
                          <p className="text-sm text-gray-600 mb-1">Assigned Bay</p>
                          <div className="inline-block px-4 py-2 bg-red-100 text-red-800 rounded-lg">
                            <span className="font-bold text-xl">Bay {appointment.bayNumber}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Payment Information</h3>
                    <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Service Price</span>
                        <span className="font-semibold text-gray-900">
                          LKR {(appointment.servicePackage?.price || appointment.packageId?.price || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-900 font-semibold">Total Amount</span>
                          <span className="text-2xl font-bold text-red-600">
                            LKR {(appointment.servicePackage?.price || appointment.packageId?.price || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="pt-3">
                        <span className="inline-block px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg font-semibold">
                          Status: Payment Pending
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {appointment.notes && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Special Notes</h3>
                  <p className="text-gray-600 bg-white p-4 rounded-lg border border-gray-200">{appointment.notes}</p>
                </div>
              )}

              {appointment._id && (
                <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                  <p className="text-sm text-gray-600">Appointment ID</p>
                  <p className="text-lg font-mono font-semibold text-gray-900">{appointment._id}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
          <button
            onClick={handleDownloadReceipt}
            className="inline-flex items-center justify-center px-6 py-4 text-base h-14 border-2 border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
          >
            <Download className="h-5 w-5 mr-2" />
            Download Receipt
          </button>
          <button
            onClick={onBookAnother}
            className="inline-flex items-center justify-center px-6 py-4 text-base h-14 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-semibold"
          >
            Book Another Appointment
            <ArrowRight className="h-5 w-5 ml-2" />
          </button>
          <button
            onClick={onViewAppointments}
            className="inline-flex items-center justify-center px-6 py-4 text-base h-14 border-2 border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
          >
            View All Appointments
          </button>
          <button
            onClick={onGoToDashboard}
            className="inline-flex items-center justify-center px-6 py-4 text-base h-14 border-2 border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
          >
            <Home className="h-5 w-5 mr-2" />
            Dashboard
          </button>
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #receipt-section, #receipt-section * {
            visibility: visible;
          }
          #receipt-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminAppointmentSuccess;