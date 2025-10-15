import React, { useState, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { ProgressBar } from '../ui/ProgressBar';
import apiClient from '../../../api/axios';

export default function ActiveJobs({ onViewJob, refreshKey }) {
  const [expanded, setExpanded] = useState(true);
  const [activeJobs, setActiveJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchActiveJobs();
  }, []);

  useEffect(() => {
    if (refreshKey !== undefined) {
      fetchActiveJobs();
    }
  }, [refreshKey]);

  const fetchActiveJobs = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/jobs/active');
      setActiveJobs(response.data);
    } catch (err) {
      console.error('Error fetching active jobs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center">
            <h2 className="text-lg font-semibold text-gray-800">Active Jobs</h2>
            <span className="ml-2 bg-gray-200 text-gray-700 rounded-full px-2 py-0.5 text-xs">
              Loading...
            </span>
          </div>
        </div>
        <div className="p-8 text-center text-gray-500">
          Loading active jobs...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center">
            <h2 className="text-lg font-semibold text-gray-800">Active Jobs</h2>
            <span className="ml-2 bg-red-200 text-red-700 rounded-full px-2 py-0.5 text-xs">
              Error
            </span>
          </div>
        </div>
        <div className="p-8 text-center text-red-500">
          <p>Error loading active jobs: {error}</p>
          <button 
            onClick={fetchActiveJobs}
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
        <div className="flex items-center">
          <h2 className="text-lg font-semibold text-gray-800">Active Jobs</h2>
          <span className="ml-2 bg-gray-200 text-gray-700 rounded-full px-2 py-0.5 text-xs">
            {activeJobs.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchActiveJobs}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {activeJobs.length > 0 ? (
            activeJobs.map((job) => (
              <div
                key={job._id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">{job.customerName}</h3>
                    <p className="text-sm text-gray-500">
                      {job.vehicleMake} - {job.vehicleReg}
                    </p>
                  </div>
                  <span className="text-xs font-medium bg-gray-100 rounded-md px-2 py-1">
                    {job.id && `JOB-${job.id.slice(-6).toUpperCase()}`}
                  </span>
                </div>

                <div className="mb-3">
                  <div className="text-sm text-gray-500 mb-1">Current Stage</div>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-800">{job.currentStage || 'Check-in'}</span>
                    <span className="mx-2 text-gray-300">|</span>
                    <span className="text-sm text-gray-500">{job.service}</span>
                  </div>
                </div>

                <ProgressBar progress={job.progress || 0} />

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => onViewJob(job)}
                    className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
                  >
                    View / Update
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-gray-500">
              <p>No active jobs at the moment.</p>
              <button 
                onClick={fetchActiveJobs}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                Refresh
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}