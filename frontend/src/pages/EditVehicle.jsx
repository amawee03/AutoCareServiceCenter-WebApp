// src/pages/EditVehicle.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function EditVehicle() {
  const { id } = useParams();
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  // Get dashboard route based on user role
  const getDashboardRoute = () => {
    const roleRoutes = {
      admin: '/admin',
      customer: '/customerDashboard',
      receptionist: '/receptionist',
      finance_manager: '/financial',
      service_advisor: '/serviceadvisor',
      service_employee: '/customerDashboard',
      inventory_manager: '/inventory/dashboard',
    };
    const normalizedRole = user?.role?.toLowerCase().replace(/\s+/g, '_');
    return roleRoutes[normalizedRole] || '/customerDashboard';
  };

  useEffect(() => {
    apiClient.get(`/api/vehicles/${id}`)
      .then(res => {
        const v = res.data;
        setMake(v.make);
        setModel(v.model);
        setYear(v.year);
        setLicensePlate(v.licensePlate);
        setLoading(false);
      })
      .catch(() => {
        navigate('/');
      });
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await apiClient.put(`/api/vehicles/${id}`, {
        make,
        model,
        year: parseInt(year),
        licensePlate
      });
      alert(`Vehicle updated successfully: ${make} ${model} (${licensePlate}). Redirecting to your dashboard...`);
      navigate(getDashboardRoute(), { replace: true });
    } catch (err) {
      setError('Failed to update vehicle. License plate may be duplicate.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-600 border-t-red-600 mb-4"></div>
          <p className="text-gray-300 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
          {/* Header with gradient accent */}
          <div className="relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600"></div>
            <div className="p-8 pt-9 border-b border-gray-700">
              <h2 className="text-3xl font-extrabold text-white tracking-tight">Edit Vehicle</h2>
              <p className="text-sm text-gray-400 mt-2">Update your vehicle information below</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            {error && (
              <div className="rounded-xl bg-red-900/50 border border-red-500 p-4 mb-6">
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              {/* Make and Model */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Make
                  </label>
                  <input
                    type="text"
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 border border-gray-600 placeholder-gray-500 text-white bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 hover:border-gray-500 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Model
                  </label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 border border-gray-600 placeholder-gray-500 text-white bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 hover:border-gray-500 text-sm"
                    required
                  />
                </div>
              </div>

              {/* Year and License Plate */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Year
                  </label>
                  <input
                    type="number"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 border border-gray-600 placeholder-gray-500 text-white bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 hover:border-gray-500 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    License Plate
                  </label>
                  <input
                    type="text"
                    value={licensePlate}
                    onChange={(e) => setLicensePlate(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 border border-gray-600 placeholder-gray-500 text-white bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 hover:border-gray-500 text-sm"
                    required
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                  type="submit"
                  className="flex-1 px-6 py-3.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200 text-base font-semibold shadow-lg shadow-red-900/50"
                >
                  Update Vehicle
                </button>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex-1 px-6 py-3.5 bg-gray-700 text-white rounded-xl hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200 text-base font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}