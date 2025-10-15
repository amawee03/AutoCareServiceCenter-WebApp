import React, { useState, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon, SearchIcon, FilterIcon } from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../api/axios';

export default function TodaysJobs({ onViewJob, refreshKey }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expanded, setExpanded] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTodaysJobs();
  }, []);

  useEffect(() => {
    if (refreshKey !== undefined) {
      fetchTodaysJobs();
    }
  }, [refreshKey]);

  // TodaysJobs.js

// ... (imports and component definition)

  const fetchTodaysJobs = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/jobs/todays-jobs');
      const JobProgressData = response.data;
      
      const JobsWithProgress = await Promise.all(
        JobProgressData.map(async (job) => {
          try {
            const progressResponse = await apiClient.get(`/api/jobs/${job.id}`);
            return progressResponse.data;
          } catch (err) {
            console.log(`No job progress found for appointment ${job.id}`);
            return {
              ...job,
              status: 'scheduled',
              currentStage: '-',
              progress: 0
            };
          }
        })
      );
      
      setJobs(JobsWithProgress);
    } catch (err) {
      console.error('Error fetching today\'s jobs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(
    job =>
    (job.customer || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (job.vehicleNo || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (job.id || "").toString().toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center">
            <h2 className="text-lg font-semibold text-gray-800">Today's Jobs</h2>
            <span className="ml-2 bg-gray-200 text-gray-700 rounded-full px-2 py-0.5 text-xs">
              Loading...
            </span>
          </div>
        </div>
        <div className="p-8 text-center text-gray-500">
          Loading today's appointments...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center">
            <h2 className="text-lg font-semibold text-gray-800">Today's Jobs</h2>
            <span className="ml-2 bg-red-200 text-red-700 rounded-full px-2 py-0.5 text-xs">
              Error
            </span>
          </div>
        </div>
        <div className="p-8 text-center text-red-500">
          <p>Error loading appointments: {error}</p>
          <button 
            onClick={fetchTodaysJobs}
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
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center">
          <h2 className="text-lg font-semibold text-gray-800">Today's Jobs</h2>
          <span className="ml-2 bg-gray-200 text-gray-700 rounded-full px-2 py-0.5 text-xs">
            {jobs.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchTodaysJobs}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 rounded hover:bg-gray-100"
          >
            {expanded ? <ChevronUpIcon size={20} /> : <ChevronDownIcon size={20} />}
          </button>
        </div>
      </div>

      {expanded && (
        <>
          {/* Search & Filter */}
          <div className="p-4 border-b border-gray-200 flex flex-wrap gap-2">
            <div className="relative flex-grow max-w-md">
              <input
                type="text"
                placeholder="Search by customer, vehicle or ID"
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <SearchIcon size={18} className="absolute left-3 top-2.5 text-gray-400" />
            </div>
            <button className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
              <FilterIcon size={16} />
              <span>Filter</span>
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Package</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Appointment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredJobs.length > 0 ? (
                  filteredJobs.map(job => (
                    <tr key={job.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{job.id && `JOB-${job.id.slice(-6).toUpperCase()}`}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.customerName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.vehicleReg}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.service}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.time && new Date(job.time).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: true // CRITICAL: This ensures AM/PM is used
  })}</td>
                      <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={job.status} /></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => navigate(`/serviceadvisor/job-details/${job.id}`, { state: { job } })}
                          className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
                        >
                          View / Update
                        </button>
                      </td>
                    </tr>
                  ))
                ) : jobs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <p>No appointments scheduled for today.</p>
                        <button 
                          onClick={fetchTodaysJobs}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        >
                          Refresh
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                      No jobs found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}