// src/pages/EditProfile.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function EditProfile() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumbers, setPhoneNumbers] = useState(['']);
  const [address, setAddress] = useState('');
  const [preferredContactMethod, setPreferredContactMethod] = useState('email');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [phoneErrors, setPhoneErrors] = useState({});
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
    apiClient.get('/api/auth/profile')
      .then(res => {
        const user = res.data;
        setName(user.name || '');
        setEmail(user.email || '');
        setPhoneNumbers(user.phoneNumbers && user.phoneNumbers.length ? user.phoneNumbers : ['']);
        setAddress(user.address || '');
        setPreferredContactMethod(user.preferredContactMethod || 'email');
        setLoading(false);
      })
      .catch(() => {
        navigate('/login');
      });
  }, [navigate]);

  // Phone number validation function
  const validatePhoneNumber = (phone) => {
    if (!phone.trim()) {
      return 'Phone number is required';
    }
    
    // Remove all non-digit characters for validation
    const digitsOnly = phone.replace(/\D/g, '');
    
    // Check if it's all zeros
    if (/^0+$/.test(digitsOnly)) {
      return 'Phone number cannot be all zeros';
    }
    
    // Check for minimum length (7 digits minimum for most countries)
    if (digitsOnly.length < 7) {
      return 'Phone number must be at least 7 digits';
    }
    
    // Check for maximum length (15 digits maximum per ITU-T E.164)
    if (digitsOnly.length > 15) {
      return 'Phone number cannot exceed 15 digits';
    }
    
    // Check for common invalid patterns
    if (/^(\d)\1{6,}$/.test(digitsOnly)) {
      return 'Phone number cannot be all the same digit';
    }
    
    // Check for sequential numbers (like 1234567890)
    if (/^(?:0123456789|1234567890|2345678901|3456789012|4567890123|5678901234|6789012345|7890123456|8901234567|9012345678)$/.test(digitsOnly)) {
      return 'Phone number cannot be sequential numbers';
    }
    
    return null; // Valid phone number
  };

  const handlePhoneChange = (index, value) => {
    const updated = [...phoneNumbers];
    updated[index] = value;
    setPhoneNumbers(updated);
    
    // Validate the phone number and update errors
    const error = validatePhoneNumber(value);
    setPhoneErrors(prev => ({
      ...prev,
      [index]: error
    }));
  };

  const addPhone = () => {
    setPhoneNumbers([...phoneNumbers, '']);
  };

  const removePhone = (index) => {
    if (phoneNumbers.length > 1) {
      const updated = phoneNumbers.filter((_, i) => i !== index);
      setPhoneNumbers(updated);
      
      // Remove the error for the deleted phone number and reindex remaining errors
      const updatedErrors = {};
      Object.keys(phoneErrors).forEach(key => {
        const keyIndex = parseInt(key);
        if (keyIndex < index) {
          updatedErrors[keyIndex] = phoneErrors[key];
        } else if (keyIndex > index) {
          updatedErrors[keyIndex - 1] = phoneErrors[key];
        }
        // Skip the deleted index
      });
      setPhoneErrors(updatedErrors);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all phone numbers before submission
    const validationErrors = {};
    let hasErrors = false;
    const validPhones = [];
    
    phoneNumbers.forEach((phone, index) => {
      if (phone.trim()) { // Only validate non-empty phone numbers
        const error = validatePhoneNumber(phone);
        if (error) {
          validationErrors[index] = error;
          hasErrors = true;
        } else {
          validPhones.push(phone.trim());
        }
      }
    });
    
    setPhoneErrors(validationErrors);
    
    if (hasErrors) {
      setError('Please fix the phone number errors before submitting.');
      return;
    }
    
    // Ensure at least one phone number
    if (validPhones.length === 0) {
      setError('Please provide at least one valid phone number.');
      return;
    }
    
    try {
      setError('');
      await apiClient.put('/api/auth/profile', {
        name,
        email,
        phoneNumbers: validPhones,
        address,
        preferredContactMethod
      });
      alert('Profile updated successfully.');
      navigate(getDashboardRoute(), { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to update profile.';
      setError(msg);
      console.error(err);
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
              <h2 className="text-3xl font-extrabold text-white tracking-tight">Edit Your Profile</h2>
              <p className="text-sm text-gray-400 mt-2">Update your personal information</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            {error && (
              <div className="rounded-xl bg-red-900/50 border border-red-500 p-4 mb-6">
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              {/* Name and Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 border border-gray-600 placeholder-gray-500 text-white bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 hover:border-gray-500 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 border border-gray-600 placeholder-gray-500 text-white bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 hover:border-gray-500 text-sm"
                    required
                  />
                </div>
              </div>

              {/* Phone Numbers */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Phone Number(s)
                </label>
                {phoneNumbers.map((phone, index) => (
                  <div key={index} className="mb-3">
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => handlePhoneChange(index, e.target.value)}
                          className={`appearance-none block w-full px-4 py-3 border ${
                            phoneErrors[index] ? 'border-red-500' : 'border-gray-600'
                          } placeholder-gray-500 text-white bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 hover:border-gray-500 text-sm`}
                          placeholder="e.g., +1234567890"
                        />
                        {phoneErrors[index] && (
                          <p className="text-xs text-red-400 mt-1.5">{phoneErrors[index]}</p>
                        )}
                      </div>
                      {phoneNumbers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePhone(index)}
                          className="px-4 py-3 border border-red-500 text-red-400 rounded-xl hover:bg-red-900/30 transition duration-200 text-sm font-medium"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addPhone}
                  className="w-full px-4 py-3 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-700 transition duration-200 text-sm font-medium"
                >
                  + Add Another Phone
                </button>
              </div>

              {/* Address and Contact Method */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Address
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 border border-gray-600 placeholder-gray-500 text-white bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 hover:border-gray-500 text-sm resize-none"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Preferred Contact Method
                  </label>
                  <select
                    value={preferredContactMethod}
                    onChange={(e) => setPreferredContactMethod(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 border border-gray-600 text-white bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 hover:border-gray-500 text-sm"
                  >
                    <option value="email">Email</option>
                    <option value="SMS">SMS</option>
                    <option value="call">Phone Call</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                  type="submit"
                  className="flex-1 px-6 py-3.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200 text-base font-semibold shadow-lg shadow-red-900/50"
                >
                  Save Changes
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