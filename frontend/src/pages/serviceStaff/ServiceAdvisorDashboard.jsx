import React, { useState, useEffect } from 'react';
import apiClient from '../../api/axios';
import TodaysJobs from './dashboard/TodaysJobs';
import ActiveJobs from './dashboard/ActiveJobs';
import AllJobHistory from './dashboard/AllJobHistory';
import JobDetails from './dashboard/JobDetails';

export default function ServiceAdvisorDashboard() {
  const [viewJob, setViewJob] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await apiClient.get('/api/jobs/stats');
      setDashboardStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewJob = (job) => {
    setViewJob(job);
  };

  const handleBackToDashboard = () => {
    setViewJob(null);
  };

  const handleRefreshAll = async () => {
    await fetchDashboardStats();
    setRefreshKey((k) => k + 1);
  };

  if (viewJob) {
    return <JobDetails job={viewJob} onBack={handleBackToDashboard} />;
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Service Advisor Dashboard
        </h1>
        <button
          onClick={handleRefreshAll}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh All
        </button>
      </div>

      {/* Dashboard Statistics - Modern Version */}
      {dashboardStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Today's Total */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-gray-200 hover:shadow-2xl hover:border-red-300 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-3">Today's Total</p>
                <p className="text-4xl font-bold text-gray-900">{dashboardStats.todaysTotal}</p>
              </div>
              <div className="bg-red-600 p-4 rounded-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Completed Today */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-gray-200 hover:shadow-2xl hover:border-green-300 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-3">Completed Today</p>
                <p className="text-4xl font-bold text-gray-900">{dashboardStats.completedToday}</p>
              </div>
              <div className="bg-green-600 p-4 rounded-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Active Jobs */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-gray-200 hover:shadow-2xl hover:border-yellow-300 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-3">Active Jobs</p>
                <p className="text-4xl font-bold text-gray-900">{dashboardStats.activeJobs}</p>
              </div>
              <div className="bg-yellow-500 p-4 rounded-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Flagged Issues */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-gray-200 hover:shadow-2xl hover:border-red-300 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-3">Flagged Issues</p>
                <p className="text-4xl font-bold text-gray-900">{dashboardStats.flaggedIssues}</p>
              </div>
              <div className="bg-red-600 p-4 rounded-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Today's Jobs Section */}
      <div>
        <TodaysJobs onViewJob={handleViewJob} refreshKey={refreshKey} />
      </div>

      {/* Active Jobs Section */}
      <div>
        <ActiveJobs onViewJob={handleViewJob} refreshKey={refreshKey} />
      </div>

      
    </div>
  );
}