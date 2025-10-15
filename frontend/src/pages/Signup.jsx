// src/pages/Signup.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/axios';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumbers, setPhoneNumbers] = useState(['']);
  const [address, setAddress] = useState('');
  const [preferredContactMethod, setPreferredContactMethod] = useState('email');
  const [error, setError] = useState('');
  const [phoneErrors, setPhoneErrors] = useState({});
  const navigate = useNavigate();

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
    
    phoneNumbers.forEach((phone, index) => {
      if (phone.trim()) { // Only validate non-empty phone numbers
        const error = validatePhoneNumber(phone);
        if (error) {
          validationErrors[index] = error;
          hasErrors = true;
        }
      }
    });
    
    setPhoneErrors(validationErrors);
    
    if (hasErrors) {
      setError('Please fix the phone number errors before submitting.');
      return;
    }
    
    try {
      setError('');
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      const res = await apiClient.post('/api/auth/signup', {
        name,
        email,
        password,
        phoneNumbers: phoneNumbers.filter(p => p.trim() !== ''),
        address,
        preferredContactMethod
      });
      
      // User is automatically logged in after signup (session created on backend)
      const userData = res.data.user;
      alert('Account created successfully. Welcome!');
      
      // Navigate based on role
      if (userData.role === 'customer') {
        navigate('/customerDashboard', { replace: true });
      } else if (userData.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/staff/dashboard', { replace: true });
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.response?.data?.message || 'Email already exists or invalid data.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full bg-gray-800 p-8 rounded-xl shadow-2xl">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold text-white">
            Create Your Account
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Join Auto Care and manage your vehicles
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
          {error && (
            <div className="rounded-md bg-red-900/50 border border-red-500 p-3">
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          {/* Two Column Grid for Name and Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1.5">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="off"
                className="appearance-none block w-full px-3 py-2.5 border border-gray-600 placeholder-gray-500 text-white bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                placeholder="Enter your name"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
                className="appearance-none block w-full px-3 py-2.5 border border-gray-600 placeholder-gray-500 text-white bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          {/* Two Column Grid for Passwords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className="appearance-none block w-full px-3 py-2.5 border border-gray-600 placeholder-gray-500 text-white bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                placeholder="Create a password"
                required
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1.5">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className="appearance-none block w-full px-3 py-2.5 border border-gray-600 placeholder-gray-500 text-white bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                placeholder="Re-enter your password"
                required
              />
            </div>
          </div>

          {/* Phone Numbers - Compact */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Phone Number(s)
            </label>
            {phoneNumbers.map((phone, index) => (
              <div key={index} className="mb-2">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      name={`phone-${index}`}
                      value={phone}
                      onChange={(e) => handlePhoneChange(index, e.target.value)}
                      autoComplete="off"
                      className={`appearance-none block w-full px-3 py-2.5 border ${
                        phoneErrors[index] ? 'border-red-500' : 'border-gray-600'
                      } placeholder-gray-500 text-white bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm`}
                      placeholder="e.g., +1234567890"
                    />
                    {phoneErrors[index] && (
                      <p className="text-xs text-red-400 mt-1">{phoneErrors[index]}</p>
                    )}
                  </div>
                  {phoneNumbers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePhone(index)}
                      className="px-3 py-2.5 border border-red-500 text-red-400 rounded-lg hover:bg-red-900/30 transition duration-200 text-sm"
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
              className="w-full px-3 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition duration-200 text-sm"
            >
              + Add Another Phone
            </button>
          </div>

          {/* Two Column Grid for Address and Contact Method */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-1.5">
                Address (Optional)
              </label>
              <textarea
                id="address"
                name="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                autoComplete="off"
                className="appearance-none block w-full px-3 py-2.5 border border-gray-600 placeholder-gray-500 text-white bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                placeholder="Your address"
                rows="2"
              />
            </div>

            {/* Preferred Contact Method */}
            <div>
              <label htmlFor="contactMethod" className="block text-sm font-medium text-gray-300 mb-1.5">
                Preferred Contact
              </label>
              <select
                id="contactMethod"
                value={preferredContactMethod}
                onChange={(e) => setPreferredContactMethod(e.target.value)}
                className="appearance-none block w-full px-3 py-2.5 border border-gray-600 text-white bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              >
                <option value="email">Email</option>
                <option value="SMS">SMS</option>
                <option value="call">Phone Call</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-200"
            >
              Sign Up
            </button>
          </div>

          {/* Login Link */}
          <div className="text-center pt-2">
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-red-400 hover:text-red-300"
              >
                Login here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}