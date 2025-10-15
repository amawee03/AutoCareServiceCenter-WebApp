import React, { useState, useEffect } from 'react';
import { SearchIcon, FilterIcon, CalendarIcon } from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge';
import apiClient from '../../../api/axios';

export default function AllJobHistory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [jobHistory, setJobHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Set default date range to last 30 days to show more jobs
    const today = new Date();
    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    setStartDate(lastMonth.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchJobHistory();
    }
  }, [startDate, endDate]);

  const fetchJobHistory = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/jobs/history', {
        params: {
          startDate,
          endDate
        }
      });
      setJobHistory(response.data);
    } catch (err) {
      console.error('Error fetching job history:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobHistory.filter(
    (job) =>
      job.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.vehicleReg.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.bookingId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">All Job History</h2>
          <p className="text-sm text-gray-500">Loading job history...</p>
        </div>
        <div className="p-8 text-center text-gray-500">
          Loading job history...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">All Job History</h2>
          <p className="text-sm text-gray-500">Error loading job history</p>
        </div>
        <div className="p-8 text-center text-red-500">
          <p>Error loading job history: {error}</p>
          <button 
            onClick={fetchJobHistory}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">All Job History</h2>
          <p className="text-sm text-gray-500">View all completed jobs by date range</p>
        </div>
        <button
          onClick={fetchJobHistory}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      <div className="p-4 border-b border-gray-200 flex flex-wrap gap-3">
        <div className="relative flex-grow max-w-md">
          <input
            type="text"
            placeholder="Search by customer, vehicle or ID"
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <SearchIcon size={18} className="absolute left-3 top-2.5 text-gray-400" />
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
            />
            <CalendarIcon size={18} className="absolute left-3 top-2.5 text-gray-400" />
          </div>
          <span className="text-gray-500">to</span>
          <div className="relative">
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
            />
            <CalendarIcon size={18} className="absolute left-3 top-2.5 text-gray-400" />
          </div>
        </div>

        <button className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
          <FilterIcon size={16} />
          <span>More Filters</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Booking ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vehicle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Service Package
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Advisor
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <tr key={job._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(job.time).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {job.bookingId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {job.customerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{job.vehicleMake}</div>
                    <div className="text-xs text-gray-400">{job.vehicleReg}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {job.service}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={job.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {job.completedAt ? new Date(job.completedAt).toLocaleTimeString() : '-'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                  {jobHistory.length === 0 ? 
                    'No job history found for the selected date range.' : 
                    'No jobs found matching your search criteria.'
                  }
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-gray-200 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing {filteredJobs.length} of {jobHistory.length} records
        </div>
        <div className="text-sm text-gray-500">
          Date range: {startDate} to {endDate}
        </div>
      </div>
    </div>
  );
}