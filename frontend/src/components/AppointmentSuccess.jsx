import React from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CheckCircle, Calendar, Clock, CreditCard, ArrowRight, Download } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const AppointmentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { appointment, transactionId } = location.state || {};

  const handleBookAnother = () => navigate('/services');
  const handleGoHome = () => navigate('/');

  const handleDownloadReceipt = async () => {
    if (!appointment) return;
    try {
      const element = document.getElementById('receipt-section');
      if (!element) return;

		// Capture full element size and avoid blank render issues
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
				// Ensure root backgrounds are safe to avoid inherited OKLCH
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
				const stripIfContainsOklch = (cssText, fallback) => {
					if (!cssText) return cssText;
					if (/oklch\(/i.test(cssText)) return fallback;
					return cssText;
				};
				// Replace any OKLCH occurrences inside inline <style> tags in the cloned doc
				doc.querySelectorAll('style').forEach((styleTag) => {
					try {
						if (styleTag.textContent && /oklch\(/i.test(styleTag.textContent)) {
							styleTag.textContent = styleTag.textContent.replace(/oklch\([^)]*\)/gi, '#000000');
						}
					} catch (_) {}
				});
        //git clone https://github.com/amawee03/AutoCare.git
        //git remote add origin https://github.com/amawee03/AutoCare.git
				const properties = [
					'color',
					'backgroundColor',
					'background',
					'backgroundImage',
					'borderColor',
					'borderTopColor',
					'borderRightColor',
					'borderBottomColor',
					'borderLeftColor',
					'outlineColor',
					'textDecorationColor',
					'boxShadow',
					'textShadow',
					'fill',
					'stroke'
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
					// If the shorthand background contains oklch inside gradients, force to bg color
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
		const margin = 10; // mm
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

		// Footer page numbers
		const total = pdf.getNumberOfPages();
		pdf.setFontSize(9);
		for (let i = 1; i <= total; i++) {
			pdf.setPage(i);
			pdf.text(`Page ${i} of ${total}`, pageWidth - margin, pageHeight - 5, { align: 'right' });
		}

		pdf.save(`appointment_${appointment._id || 'receipt'}.pdf`);
    } catch (error) {
      console.error("Failed to generate receipt:", error);
      alert("Failed to download receipt. Please try again.");
    }
  };

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Appointment Not Found</h1>
          <p className="text-gray-600 mb-6">The appointment details could not be loaded.</p>
          <Button onClick={handleGoHome}>Go Home</Button>
        </div>
      </div>
    );
  }

  const appointmentDate = new Date(appointment.appointmentDate);

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
              Appointment Confirmed!
            </h1>
            <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Your appointment has been successfully booked and payment processed.
            </p>
          </div>

          {/* Appointment Card */}
          <Card className="mb-12 border-green-200 bg-green-50">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Appointment Details</h2>
                <p className="text-gray-600">Your appointment is confirmed and ready</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Service Info */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Service Details</h3>
                    <div className="flex items-center gap-4">
                      <img
                        src={appointment.packageId?.image
                          ? `/uploads/${appointment.packageId.image.split('/').pop()}`
                          : 'https://via.placeholder.com/80x80?text=No+Image'}
                        alt={appointment.packageId?.pkgName || 'Service'}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          {appointment.packageId?.pkgName || 'Service'}
                        </h4>
                        <Badge variant="secondary" className="mt-1">
                          {appointment.packageId?.category || 'General'}
                        </Badge>
                        <p className="text-sm text-gray-600 mt-2">
                          {appointment.packageId?.description || 'Service description'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Customer Information</h3>
                    <div className="space-y-2">
                      <p className="text-gray-900"><strong>Name:</strong> {appointment.customerName}</p>
                      <p className="text-gray-900"><strong>Vehicle:</strong> {typeof appointment.vehicle === 'object' ? `${appointment.vehicle.make || ''} ${appointment.vehicle.model || ''} (${appointment.vehicle.registration || ''})`.trim() : appointment.vehicle}</p>
                      <p className="text-gray-900">
                        <strong>Bay Number:</strong> <span className="text-red-600 font-semibold">Bay {appointment.bayNumber}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Appointment Schedule & Payment */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Appointment Schedule</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-red-600" />
                        <div>
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
                          <p className="font-medium text-gray-900">{appointment.startTime} - {appointment.endTime}</p>
                          <p className="text-sm text-gray-600">Duration: {appointment.duration} minutes</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Payment Information</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-red-600" />
                        <div>
                          <p className="font-medium text-gray-900">
                            Transaction ID: {transactionId || appointment.payment?.transactionId}
                          </p>
                          <p className="text-sm text-gray-600">
                            Amount: LKR {appointment.payment?.amount?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Payment Completed
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {appointment.notes && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Special Notes</h3>
                  <p className="text-gray-600">{appointment.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={handleDownloadReceipt} variant="outline" size="lg" className="px-8 py-4 text-lg h-14">
            <Download className="h-5 w-5 mr-2" />
            Download Receipt
          </Button>
          <Button onClick={handleBookAnother} size="lg" className="px-8 py-4 text-lg h-14 bg-red-600 hover:bg-red-700 text-white">
            Book Another Service
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
          <Button onClick={handleGoHome} variant="outline" size="lg" className="px-8 py-4 text-lg h-14">
            Go to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentSuccess;
