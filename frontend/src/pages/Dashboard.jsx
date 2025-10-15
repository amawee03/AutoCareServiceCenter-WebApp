// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/axios';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    apiClient.get('/api/auth/profile')
      .then(res => {
        setUser(res.data);
        return apiClient.get('/api/vehicles');
      })
      .then(res => {
        setVehicles(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Auth or vehicles fetch failed:", err);
        navigate('/login', { replace: true });
        setLoading(false);
      });
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await apiClient.post('/api/auth/logout');
    } catch (err) {
      console.error("Logout failed:", err);
    }
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
      // Ensure auth state is cleared to avoid redirect loops
      try { await logout(); } catch (_) {}
      navigate('/login', { replace: true });
    } catch (err) {
      alert("Failed to delete account. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '50px' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-grid">
      {/* Profile Card */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 className="font-medium" style={{ fontSize: '24px' }}>Your Profile</h2>
            <p className="mt-2"><span className="font-medium">Name:</span> {user?.name}</p>
            <p><span className="font-medium">Email:</span> {user?.email}</p>
            <p><span className="font-medium">Phone(s):</span> {user?.phoneNumbers?.join(', ') || 'None'}</p>
            <p><span className="font-medium">Address:</span> {user?.address || 'Not provided'}</p>
            <p><span className="font-medium">Preferred Contact:</span> {user?.preferredContactMethod}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={() => navigate('/profile/edit')}
              className="btn"
              style={{ width: 'auto', padding: '8px 16px', background: '#4b5563' }}
            >
              Edit Profile
            </button>
            <button
              onClick={handleDeleteAccount}
              className="btn"
              style={{ width: 'auto', padding: '8px 16px', background: '#b91c1c' }}
            >
              Delete Account
            </button>
            <button
              onClick={handleLogout}
              className="btn"
              style={{ width: 'auto', padding: '8px 16px' }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Vehicles Card */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 className="font-medium" style={{ fontSize: '24px' }}>Your Vehicles</h2>
          <button
            onClick={() => navigate('/vehicles/new')}
            className="btn"
            style={{ width: 'auto', padding: '8px 16px' }}
          >
            + Add Vehicle
          </button>
        </div>

        {vehicles.length === 0 ? (
          <p className="text-gray-600">No vehicles added yet.</p>
        ) : (
          <div>
            {vehicles.map(vehicle => (
              <div key={vehicle._id} className="vehicle-item">
                <div className="vehicle-info">
                  <p className="font-medium">{vehicle.make} {vehicle.model}</p>
                  <p className="text-gray-600">
                    Year: {vehicle.year} • Plate: {vehicle.licensePlate}
                  </p>
                </div>
                <div className="vehicle-actions">
                  <button
                    onClick={() => handleEditVehicle(vehicle._id)}
                    style={{ marginRight: '8px', color: '#4b5563' }}
                  >
                    Edit
                  </button>
                  <button onClick={() => handleDeleteVehicle(vehicle._id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}