import React, { useState } from 'react';
import axios from 'axios';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { 
  FileText, 
  Download, 
  Calendar, 
  BarChart3, 
  Loader2,
  AlertCircle,
  CheckCircle,
  Printer
} from 'lucide-react';

const ReportGenerator = ({ appointment }) => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');

  // Helper function to format vehicle data
  const formatVehicle = (vehicle) => {
    if (!vehicle) return 'Not specified';
    
    if (typeof vehicle === 'object') {
      return `${vehicle.make || ''} ${vehicle.model || ''} (${vehicle.registration || vehicle.licensePlate || ''})`.trim();
    }
    
    return vehicle;
  };

  const generateReport = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get(`http://localhost:5001/api/appointments/reports/${appointment._id}`);
      
      if (response.data.success) {
        // Format the vehicle data in the report
        const formattedReport = {
          ...response.data.report,
          vehicle: formatVehicle(response.data.report.vehicle)
        };
        setReport(formattedReport);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!report) return;

    const reportContent = `
AUTOCARE SERVICE REPORT
=======================

Appointment ID: ${report.appointmentId}
Generated: ${new Date().toLocaleDateString()}

CUSTOMER INFORMATION
--------------------
Name: ${report.customerName}
Vehicle: ${report.vehicle}

SERVICE DETAILS
---------------
Service: ${report.service.name}
Category: ${report.service.category}
Description: ${report.service.description}
Duration: ${report.service.duration} minutes
Price: LKR ${report.service.price.toLocaleString()}

SCHEDULE INFORMATION
-------------------
Date: ${report.schedule.date}
Time: ${report.schedule.time}
Service Bay: Bay ${report.schedule.bayNumber}

PAYMENT INFORMATION
------------------
Amount: LKR ${report.payment.amount.toLocaleString()}
Status: ${report.payment.status.toUpperCase()}
Transaction ID: ${report.payment.transactionId}
Payment Method: ${report.payment.paymentMethod}

APPOINTMENT STATUS
-----------------
Status: ${report.status.toUpperCase()}

NOTES
-----
 ${report.notes || 'No additional notes'}

 ${report.refund ? `
REFUND INFORMATION
-----------------
Refund Amount: LKR ${report.refund.amount.toLocaleString()}
Reason: ${report.refund.reason}
Refund Date: ${new Date(report.refund.date).toLocaleDateString()}
` : ''}

---
Report generated on ${new Date().toLocaleString()}
AutoCare Service Management System
    `;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `appointment-report-${report.appointmentId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const printReport = () => {
    if (!report) return;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Appointment Report - ${report.appointmentId}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #dc2626; padding-bottom: 10px; margin-bottom: 20px; }
            .section { margin-bottom: 20px; }
            .section h3 { color: #dc2626; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; }
            .info-row { margin: 5px 0; }
            .label { font-weight: bold; }
            .status { padding: 4px 8px; border-radius: 4px; font-weight: bold; }
            .status.completed { background-color: #dcfce7; color: #166534; }
            .status.confirmed { background-color: #dbeafe; color: #1e40af; }
            .status.cancelled { background-color: #fecaca; color: #991b1b; }
            .status.pending { background-color: #fef3c7; color: #92400e; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>AUTOCARE SERVICE REPORT</h1>
            <p>Appointment ID: ${report.appointmentId}</p>
            <p>Generated: ${new Date().toLocaleDateString()}</p>
          </div>

          <div class="section">
            <h3>CUSTOMER INFORMATION</h3>
            <div class="info-row"><span class="label">Name:</span> ${report.customerName}</div>
            <div class="info-row"><span class="label">Vehicle:</span> ${report.vehicle}</div>
          </div>

          <div class="section">
            <h3>SERVICE DETAILS</h3>
            <div class="info-row"><span class="label">Service:</span> ${report.service.name}</div>
            <div class="info-row"><span class="label">Category:</span> ${report.service.category}</div>
            <div class="info-row"><span class="label">Description:</span> ${report.service.description}</div>
            <div class="info-row"><span class="label">Duration:</span> ${report.service.duration} minutes</div>
            <div class="info-row"><span class="label">Price:</span> LKR ${report.service.price.toLocaleString()}</div>
          </div>

          <div class="section">
            <h3>SCHEDULE INFORMATION</h3>
            <div class="info-row"><span class="label">Date:</span> ${report.schedule.date}</div>
            <div class="info-row"><span class="label">Time:</span> ${report.schedule.time}</div>
            <div class="info-row"><span class="label">Service Bay:</span> Bay ${report.schedule.bayNumber}</div>
          </div>

          <div class="section">
            <h3>PAYMENT INFORMATION</h3>
            <div class="info-row"><span class="label">Amount:</span> LKR ${report.payment.amount.toLocaleString()}</div>
            <div class="info-row"><span class="label">Status:</span> <span class="status ${report.payment.status}">${report.payment.status.toUpperCase()}</span></div>
            <div class="info-row"><span class="label">Transaction ID:</span> ${report.payment.transactionId}</div>
            <div class="info-row"><span class="label">Payment Method:</span> ${report.payment.paymentMethod}</div>
          </div>

          <div class="section">
            <h3>APPOINTMENT STATUS</h3>
            <div class="info-row"><span class="label">Status:</span> <span class="status ${report.status}">${report.status.toUpperCase()}</span></div>
          </div>

          ${report.notes ? `
          <div class="section">
            <h3>NOTES</h3>
            <p>${report.notes}</p>
          </div>
          ` : ''}

          ${report.refund ? `
          <div class="section">
            <h3>REFUND INFORMATION</h3>
            <div class="info-row"><span class="label">Refund Amount:</span> LKR ${report.refund.amount.toLocaleString()}</div>
            <div class="info-row"><span class="label">Reason:</span> ${report.refund.reason}</div>
            <div class="info-row"><span class="label">Refund Date:</span> ${new Date(report.refund.date).toLocaleDateString()}</div>
          </div>
          ` : ''}

          <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #6b7280;">
            <p>Report generated on ${new Date().toLocaleString()}</p>
            <p>AutoCare Service Management System</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Button
          onClick={generateReport}
          disabled={loading}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <FileText className="h-4 w-4 mr-2" />
          )}
          Generate Report
        </Button>

        {report && (
          <>
            <Button
              onClick={downloadReport}
              variant="outline"
              className="text-green-600 border-green-600 hover:bg-green-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button
              onClick={printReport}
              variant="outline"
              className="text-blue-600 border-blue-600 hover:bg-blue-50"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Error</span>
          </div>
          <p className="text-red-600 mt-1">{error}</p>
        </div>
      )}

      {report && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-green-800">Report Generated Successfully</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Customer Information</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Name:</span> {report.customerName}</p>
                  <p><span className="font-medium">Vehicle:</span> {report.vehicle}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Service Details</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Service:</span> {report.service.name}</p>
                  <p><span className="font-medium">Duration:</span> {report.service.duration} minutes</p>
                  <p><span className="font-medium">Price:</span> LKR {report.service.price.toLocaleString()}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Schedule</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Date:</span> {report.schedule.date}</p>
                  <p><span className="font-medium">Time:</span> {report.schedule.time}</p>
                  <p><span className="font-medium">Bay:</span> Bay {report.schedule.bayNumber}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Payment & Status</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Amount:</span> LKR {report.payment.amount.toLocaleString()}</p>
                  <p><span className="font-medium">Status:</span> 
                    <Badge className={`ml-2 ${report.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                      report.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                      'bg-yellow-100 text-yellow-800'}`}>
                      {report.status.toUpperCase()}
                    </Badge>
                  </p>
                  <p><span className="font-medium">Payment:</span> 
                    <Badge className={`ml-2 ${report.payment.status === 'completed' ? 'bg-green-100 text-green-800' : 
                      report.payment.status === 'refunded' ? 'bg-purple-100 text-purple-800' : 
                      'bg-yellow-100 text-yellow-800'}`}>
                      {report.payment.status.toUpperCase()}
                    </Badge>
                  </p>
                </div>
              </div>
            </div>

            {report.notes && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                <p className="text-sm text-gray-700">{report.notes}</p>
              </div>
            )}

            {report.refund && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Refund Information</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Refund Amount:</span> LKR {report.refund.amount.toLocaleString()}</p>
                  <p><span className="font-medium">Reason:</span> {report.refund.reason}</p>
                  <p><span className="font-medium">Refund Date:</span> {new Date(report.refund.date).toLocaleDateString()}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReportGenerator;