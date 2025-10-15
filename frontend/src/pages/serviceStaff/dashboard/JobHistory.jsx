import React, { useState, useEffect, useRef } from 'react';
import { SearchIcon, FilterIcon, ClockIcon, CheckIcon, DownloadIcon } from 'lucide-react';
import apiClient from '../../../api/axios';
import jsPDF from 'jspdf';

// Service stages definition
const serviceStages = [
  { id: 'check-in', label: 'Check-in' },
  { id: 'wash', label: 'Wash' },
  { id: 'interior', label: 'Interior' },
  { id: 'polishing', label: 'Polishing' },
  { id: 'inspection', label: 'Inspection' },
  { id: 'completed', label: 'Completed' },
];

// Build timeline from job stages
const buildTimeline = (job) => {
  if (!job || !job.stages) return [];
  
  return job.stages
    .filter(stage => stage.completed)
    .map(stage => ({
      stage: stage.name.toLowerCase().replace(/\s+/g, '-'),
      timestamp: stage.completedAt ? new Date(stage.completedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A',
      user: stage.completedBy || 'Service Advisor',
      notes: stage.notes || `${stage.name} completed`
    }));
};

export default function JobHistory() {
  // State for the search input field
  const [inputReg, setInputReg] = useState(''); 
  // State for the registration currently being viewed (triggers data fetch)
  const [activeReg, setActiveReg] = useState(''); 
  
  // State for filtering the already-fetched results
  const [searchTerm, setSearchTerm] = useState('');
  
  // Data and UI states
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  // Ref for the printable report
  const reportRef = useRef(null);

  // --- Dynamic Data Fetching Effect ---
  // Reruns whenever activeReg changes
  useEffect(() => {
    // Only fetch if a valid registration is set
    if (!activeReg) {
        setHistoryData([]);
        setSelectedRecord(null);
        setLoading(false);
        return;
    }

    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch data from the backend using the activeReg state
        const response = await apiClient.get(`/api/jobs/history?vehicleReg=${activeReg}`);
        
        setHistoryData(response.data);
        // Automatically select the newest record
        setSelectedRecord(response.data.length > 0 ? response.data[0] : null);

      } catch (err) {
        console.error("Error fetching job history:", err);
        setError("Failed to load history. Please ensure the backend is running and the Reg ID is correct.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [activeReg]);

  // --- Handler to trigger DB Lookup ---
  const handleRegLookup = (e) => {
    e.preventDefault();
    const cleanReg = inputReg.toUpperCase().trim();
    if (cleanReg) {
        // This updates activeReg, which immediately triggers the useEffect hook to fetch new data.
        setActiveReg(cleanReg); 
        // Clear internal search when starting a new vehicle lookup
        setSearchTerm(''); 
    }
  };
  
  // --- Client-Side Filtering (Filters the historyData based on searchTerm) ---
  const filteredHistory = historyData.filter(
    record =>
      record.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.id && record.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (record.bookingId && record.bookingId.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // --- PDF Generation Function (Pure jsPDF - No html2canvas) ---
  const handleDownloadPDF = () => {
    if (!selectedRecord) return;
    
    setIsGeneratingPDF(true);
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      let yPos = 20;
      
      // Header
      pdf.setFillColor(220, 38, 38); // Red
      pdf.rect(0, 0, pageWidth, 30, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.setFont(undefined, 'bold');
      pdf.text('Vehicle Service Report', 15, 15);
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'normal');
      pdf.text(`Job ID: ${(selectedRecord.bookingId || selectedRecord.id)?.slice(-6).toUpperCase()}`, 15, 23);
      
      yPos = 40;
      pdf.setTextColor(0, 0, 0);
      
      // Two Column Layout
      const col1X = 15;
      const col2X = 110;
      const colWidth = 85;
      
      // Left Column - Service Details
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('Service Details', col1X, yPos);
      pdf.setDrawColor(200, 200, 200);
      pdf.line(col1X, yPos + 2, col1X + colWidth, yPos + 2);
      
      yPos += 10;
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      
      // Service Date
      pdf.setTextColor(100, 100, 100);
      pdf.text('SERVICE DATE', col1X, yPos);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont(undefined, 'bold');
      pdf.text(new Date(selectedRecord.time).toLocaleDateString('en-US', { 
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' 
      }), col1X, yPos + 5);
      
      yPos += 12;
      pdf.setFont(undefined, 'normal');
      
      // Service Package
      pdf.setTextColor(100, 100, 100);
      pdf.text('SERVICE PACKAGE', col1X, yPos);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont(undefined, 'bold');
      pdf.text(selectedRecord.service, col1X, yPos + 5);
      
      yPos += 12;
      pdf.setFont(undefined, 'normal');
      
      // Customer Name
      pdf.setTextColor(100, 100, 100);
      pdf.text('CUSTOMER NAME', col1X, yPos);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont(undefined, 'bold');
      pdf.text(selectedRecord.customerName, col1X, yPos + 5);
      
      yPos += 12;
      pdf.setFont(undefined, 'normal');
      
      // Vehicle Make
      pdf.setTextColor(100, 100, 100);
      pdf.text('VEHICLE MAKE', col1X, yPos);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont(undefined, 'bold');
      pdf.text(selectedRecord.vehicleMake, col1X, yPos + 5);
      
      yPos += 12;
      pdf.setFont(undefined, 'normal');
      
      // Status
      pdf.setTextColor(100, 100, 100);
      pdf.text('STATUS', col1X, yPos);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont(undefined, 'bold');
      const statusText = selectedRecord.status.toUpperCase();
      const statusColor = selectedRecord.status === 'completed' ? [34, 197, 94] : 
                         selectedRecord.status === 'in-progress' ? [59, 130, 246] : [234, 179, 8];
      pdf.setFillColor(...statusColor);
      pdf.setTextColor(255, 255, 255);
      pdf.rect(col1X, yPos + 2, 30, 6, 'F');
      pdf.text(statusText, col1X + 2, yPos + 6);
      
      // Right Column - Timeline
      yPos = 40;
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('Service Stages Timeline', col2X, yPos);
      pdf.line(col2X, yPos + 2, col2X + colWidth, yPos + 2);
      
      yPos += 10;
      pdf.setFontSize(9);
      
      // Timeline stages
      const timeline = buildTimeline(selectedRecord);
      if (timeline.length > 0) {
        timeline.forEach((event, index) => {
          const isCompleted = event.stage === 'completed';
          const circleColor = isCompleted ? [34, 197, 94] : [220, 38, 38];
          
          // Circle
          pdf.setFillColor(...circleColor);
          pdf.circle(col2X + 2, yPos - 1, 2, 'F');
          
          // Stage name
          pdf.setFont(undefined, 'bold');
          pdf.setTextColor(0, 0, 0);
          const stageName = serviceStages.find(s => s.id === event.stage)?.label || event.stage;
          pdf.text(stageName, col2X + 6, yPos);
          
          // Time and user
          pdf.setFont(undefined, 'normal');
          pdf.setTextColor(100, 100, 100);
          pdf.setFontSize(8);
          pdf.text(`${event.timestamp} • ${event.user}`, col2X + 6, yPos + 3);
          
          // Notes
          if (event.notes && event.notes !== `${stageName} completed`) {
            pdf.setFontSize(7);
            const splitNotes = pdf.splitTextToSize(event.notes, colWidth - 10);
            pdf.text(splitNotes, col2X + 6, yPos + 6);
            yPos += splitNotes.length * 3;
          }
          
          yPos += 10;
          pdf.setFontSize(9);
          
          // Draw line between stages
          if (index < timeline.length - 1) {
            pdf.setDrawColor(200, 200, 200);
            pdf.line(col2X + 2, yPos - 8, col2X + 2, yPos - 2);
          }
        });
      } else {
        pdf.setTextColor(150, 150, 150);
        pdf.text('No stage timeline available', col2X + 6, yPos);
      }
      
      // Bottom - General Notes
      if (selectedRecord.generalNotes) {
        yPos = Math.max(yPos, 150);
        pdf.setDrawColor(200, 200, 200);
        pdf.line(15, yPos, pageWidth - 15, yPos);
        
        yPos += 8;
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'bold');
        pdf.setTextColor(0, 0, 0);
        pdf.text('General Notes', 15, yPos);
        
        yPos += 6;
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        const splitNotes = pdf.splitTextToSize(selectedRecord.generalNotes, pageWidth - 30);
        pdf.text(splitNotes, 15, yPos);
      }
      
      // Left Column - Handover Details (render under left column content area)
      // Render only if handover exists
      let handoverY = 40; // start near top of left column area
      if (selectedRecord.handover && (selectedRecord.handover.name || selectedRecord.handover.nic || selectedRecord.handover.phone)) {
        // Position after left column blocks (~ after status)
        // Compute an approximate position below previous left items
        handoverY = 40 + 12 + 12 + 12 + 12 + 12 + 10; // align roughly after status
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'bold');
        pdf.text('Handover Details', col1X, handoverY);
        pdf.setDrawColor(200, 200, 200);
        pdf.line(col1X, handoverY + 2, col1X + colWidth, handoverY + 2);

        handoverY += 8;
        pdf.setFontSize(9);
        pdf.setFont(undefined, 'normal');
        pdf.setTextColor(100, 100, 100);
        pdf.text('NAME', col1X, handoverY);
        pdf.setTextColor(0, 0, 0);
        pdf.setFont(undefined, 'bold');
        pdf.text(String(selectedRecord.handover.name || 'N/A'), col1X, handoverY + 5);

        handoverY += 12;
        pdf.setFont(undefined, 'normal');
        pdf.setTextColor(100, 100, 100);
        pdf.text('NIC', col1X, handoverY);
        pdf.setTextColor(0, 0, 0);
        pdf.setFont(undefined, 'bold');
        pdf.text(String(selectedRecord.handover.nic || 'N/A'), col1X, handoverY + 5);

        handoverY += 12;
        pdf.setFont(undefined, 'normal');
        pdf.setTextColor(100, 100, 100);
        pdf.text('PHONE', col1X, handoverY);
        pdf.setTextColor(0, 0, 0);
        pdf.setFont(undefined, 'bold');
        pdf.text(String(selectedRecord.handover.phone || 'N/A'), col1X, handoverY + 5);
      }
      
      // Footer
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text(`Generated on ${new Date().toLocaleString()}`, 15, pdf.internal.pageSize.getHeight() - 10);
      pdf.text(`Vehicle: ${activeReg}`, pageWidth - 50, pdf.internal.pageSize.getHeight() - 10);
      
      // Save PDF
      const fileName = `Service_Report_${activeReg}_${selectedRecord.id?.slice(-6) || 'REPORT'}.pdf`;
      pdf.save(fileName);
      
      console.log('✅ PDF generated successfully:', fileName);
      
    } catch (error) {
      console.error('❌ Error generating PDF:', error);
      alert('Failed to generate PDF. Error: ' + error.message);
    } finally {
      setIsGeneratingPDF(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Vehicle Service History</h2>
        <p className="text-sm text-gray-500">
            Vehicle Registration: <span className="font-medium text-gray-800">{activeReg || 'N/A'}</span>
        </p>
      </div>

      <div className="p-4 border-b border-gray-200 flex flex-wrap gap-2">
        {/* Main Reg ID Lookup Form */}
        <form onSubmit={handleRegLookup} className="relative flex-grow max-w-md">
            <input
                type="text"
                placeholder="Enter Vehicle Registration ID (e.g., ABC 123)"
                className="w-full pl-4 pr-16 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                value={inputReg}
                onChange={e => setInputReg(e.target.value)}
                required
            />
            <button type="submit" className="absolute right-0 top-0 bottom-0 px-4 text-white bg-red-600 rounded-r-md hover:bg-red-700">
                <SearchIcon size={18} />
            </button>
        </form>
        
        {/* Secondary Filter for Results */}
        <div className="relative flex-grow max-w-xs">
            <input
                type="text"
                placeholder="Filter results (Service/ID)"
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                disabled={!activeReg}
            />
            <FilterIcon size={18} className="absolute left-3 top-2.5 text-gray-400" />
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Service History Timeline (Left Side) */}
          <div className="space-y-4">
            <h3 className="text-md font-medium text-gray-800">Service Timeline</h3>
            
            {loading && <div className="text-center py-10 text-gray-500">Loading history...</div>}
            {error && <div className="text-center py-10 text-red-600 border border-red-300 rounded-md p-4">{error}</div>}
            {!activeReg && !loading && <div className="text-center py-10 text-gray-500">Enter a Registration ID above to lookup history.</div>}


            {!loading && !error && activeReg && (
                <div className="relative border-l border-gray-200 ml-3">
                {filteredHistory.length > 0 ? (
                    filteredHistory.map(record => (
                    <div
                        key={record._id}
                        className={`mb-6 ml-6 cursor-pointer ${selectedRecord?._id === record._id ? 'bg-gray-50 rounded-lg p-2 -m-2' : ''}`}
                        onClick={() => setSelectedRecord(record)}
                    >
                        <span className="absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 ring-4 ring-white bg-red-600 text-white">
                        <ClockIcon size={14} />
                        </span>
                        <div className="ml-2">
                            <time className="block text-xs font-medium text-red-600">
                                {new Date(record.time).toLocaleDateString()}
                            </time>
                            <h4 className="text-sm font-medium">{record.service}</h4>
                            <p className="text-xs text-gray-500">
                                Job ID: {
                                    (record.bookingId || record.id)
                                        ? (record.bookingId || record.id).slice(-6).toUpperCase()
                                        : 'N/A' // Fallback if neither ID exists
                                }
                            </p>
                        </div>
                    </div>
                    ))
                ) : (
                    <div className="ml-6 py-4">
                    <p className="text-gray-500 text-sm">No past service records found for vehicle {activeReg}.</p>
                    </div>
                )}
                </div>
            )}
          </div>

          {/* Selected Record Details (Right Side) */}
          <div className="border rounded-lg shadow-lg overflow-hidden">
            {selectedRecord ? (
              <div>
                {/* Header with Download Button */}
                <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold">Vehicle Service Report</h3>
                    <p className="text-sm text-red-100">Job ID: {(selectedRecord.bookingId || selectedRecord.id)?.slice(-6).toUpperCase()}</p>
                  </div>
                  <button
                    onClick={handleDownloadPDF}
                    disabled={isGeneratingPDF}
                    className="flex items-center gap-2 bg-white text-red-600 px-4 py-2 rounded-md hover:bg-red-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <DownloadIcon size={18} />
                    {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
                  </button>
                </div>
                
                {/* PDF Content Wrapper - Using inline styles for PDF compatibility */}
                <div ref={reportRef} style={{ backgroundColor: '#ffffff' }}>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                  {/* Left Column - Service Details */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-800 mb-4 pb-2 border-b">Service Details</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Service Date</div>
                        <div className="font-medium text-gray-900">{new Date(selectedRecord.time).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Service Package</div>
                        <div className="font-medium text-gray-900">{selectedRecord.service}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Customer Name</div>
                        <div className="font-medium text-gray-900">{selectedRecord.customerName}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Vehicle Make</div>
                        <div className="font-medium text-gray-900">{selectedRecord.vehicleMake}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Status</div>
                        <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          selectedRecord.status === 'completed' ? 'bg-green-100 text-green-800' :
                          selectedRecord.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                          selectedRecord.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedRecord.status.toUpperCase()}
                        </div>
                      </div>
                      {selectedRecord.handover && (selectedRecord.handover.name || selectedRecord.handover.nic || selectedRecord.handover.phone) && (
                        <div className="pt-3 mt-3 border-t">
                          <div className="text-sm font-semibold text-gray-800 mb-2">Handover Details</div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            <div>
                              <div className="text-xs text-gray-500 uppercase tracking-wide">Name</div>
                              <div className="font-medium text-gray-900">{selectedRecord.handover.name || 'N/A'}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 uppercase tracking-wide">NIC</div>
                              <div className="font-medium text-gray-900">{selectedRecord.handover.nic || 'N/A'}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 uppercase tracking-wide">Phone</div>
                              <div className="font-medium text-gray-900">{selectedRecord.handover.phone || 'N/A'}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column - Service Stages Timeline */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-800 mb-4 pb-2 border-b">Service Stages Timeline</h4>
                    <div className="relative max-h-[300px] overflow-y-auto pr-2">
                      {buildTimeline(selectedRecord).length > 0 ? (
                        <div className="border-l-2 border-gray-200 ml-3">
                          {buildTimeline(selectedRecord).map((event, index) => {
                            const isCompleted = event.stage === 'completed';
                            const bgColor = isCompleted ? 'bg-green-600' : 'bg-red-600';
                            const Icon = isCompleted ? CheckIcon : ClockIcon;
                            
                            return (
                              <div key={index} className="mb-4 ml-6 relative">
                                <span className={`absolute flex items-center justify-center w-6 h-6 rounded-full -left-9 ring-4 ring-white ${bgColor} text-white`}>
                                  <Icon size={12} />
                                </span>
                                <div>
                                  <h5 className="text-sm font-semibold text-gray-900">{serviceStages.find(s => s.id === event.stage)?.label || event.stage}</h5>
                                  <time className="block text-xs text-gray-500">{event.timestamp} • {event.user}</time>
                                  {event.notes && <p className="text-xs text-gray-600 mt-1 bg-gray-50 p-2 rounded">{event.notes}</p>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-400">
                          <ClockIcon size={32} className="mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No stage timeline available</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Row - General Notes */}
                {selectedRecord.generalNotes && (
                  <div className="border-t bg-gray-50 p-6">
                    <h4 className="text-md font-semibold text-gray-800 mb-3">General Notes</h4>
                    <div className="text-sm text-gray-700 bg-white p-4 rounded border border-gray-200">
                      {selectedRecord.generalNotes}
                    </div>
                  </div>
                )}
                
                </div>
                {/* End PDF Content Wrapper */}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-96 text-center p-8">
                <ClockIcon size={64} className="text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">No Service Selected</h3>
                <p className="text-gray-500">Select a service record from the timeline to view the detailed report.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}