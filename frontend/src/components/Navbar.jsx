import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, ChevronDown, X, Menu, Wrench } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
  };

  const getDashboardRoute = () => {
    if (!user || !user.role) return '/customerDashboard';
    
    const role = user.role.toLowerCase().replace(/\s+/g, '_');
    
    const roleRoutes = {
      'admin': '/admin',
      'customer': '/customerDashboard',
      'finance_manager': '/financialmanager',
      'financial_manager': '/financialmanager',
      'inventory_manager': '/inventory/dashboard',
      'service_employee': '/service/today',
      'service_advisor': '/serviceadvisor',
      'receptionist': '/receptionist'
    };
    
    return roleRoutes[role] || '/customerDashboard';
  };

  const handleMyProfile = () => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate(getDashboardRoute());
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-black/95 backdrop-blur-md text-white shadow-2xl z-50 border-b-2 border-red-600/30">
      <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16 xl:px-20 py-5">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 hover:opacity-90 transition-all duration-300">
            <div className="bg-gradient-to-br from-red-600 to-red-700 p-3 rounded-xl shadow-lg">
              <Wrench className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-white">
              Auto<span className="text-red-600">Care</span>
            </h3>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-12">
            <Link 
              to="/" 
              className="text-white hover:text-red-500 transition-colors duration-300 font-semibold text-lg relative group"
            >
              Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link 
              to="/services" 
              className="text-white hover:text-red-500 transition-colors duration-300 font-semibold text-lg relative group"
            >
              Services
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link 
              to="/about" 
              className="text-white hover:text-red-500 transition-colors duration-300 font-semibold text-lg relative group"
            >
              About
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link 
              to="/contact" 
              className="text-white hover:text-red-500 transition-colors duration-300 font-semibold text-lg relative group"
            >
              Contact
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </div>

          {/* Profile / Auth Buttons */}
          <div className="flex items-center space-x-4 relative">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 bg-gradient-to-br from-red-600 to-red-700 px-5 py-3 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <User className="h-5 w-5" />
                  <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-48 bg-black/95 backdrop-blur-md border-2 border-red-600/30 rounded-xl shadow-2xl py-2">
                    <button
                      onClick={handleMyProfile}
                      className="block w-full text-left px-5 py-3 text-white hover:text-red-500 hover:bg-red-600/20 transition-all duration-300 font-medium"
                    >
                      My Dashboard
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-5 py-3 text-white hover:text-red-500 hover:bg-red-600/20 transition-all duration-300 font-medium"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-gradient-to-br from-red-600 to-red-700 px-7 py-3 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:scale-105 font-semibold text-lg shadow-lg"
              >
                Login
              </Link>
            )}

            {/* Mobile Hamburger Menu */}
            <button
              className="md:hidden p-3 rounded-xl bg-gray-800/80 hover:bg-red-600 transition-all duration-300 transform hover:scale-110 shadow-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Links */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-md border-t-2 border-red-600/30">
          <div className="max-w-7xl mx-auto px-8 py-6 space-y-2">
            <Link 
              to="/" 
              onClick={() => setMobileMenuOpen(false)} 
              className="block text-white hover:text-red-500 transition-colors duration-300 py-3 text-lg font-semibold border-b border-gray-800"
            >
              Home
            </Link>
            <Link 
              to="/services" 
              onClick={() => setMobileMenuOpen(false)} 
              className="block text-white hover:text-red-500 transition-colors duration-300 py-3 text-lg font-semibold border-b border-gray-800"
            >
              Services
            </Link>
            <Link 
              to="/about" 
              onClick={() => setMobileMenuOpen(false)} 
              className="block text-white hover:text-red-500 transition-colors duration-300 py-3 text-lg font-semibold border-b border-gray-800"
            >
              About
            </Link>
            <Link 
              to="/contact" 
              onClick={() => setMobileMenuOpen(false)} 
              className="block text-white hover:text-red-500 transition-colors duration-300 py-3 text-lg font-semibold border-b border-gray-800"
            >
              Contact
            </Link>

            {isAuthenticated ? (
              <>
                <button 
                  onClick={handleMyProfile} 
                  className="block text-left w-full text-white hover:text-red-500 transition-colors duration-300 py-3 text-lg font-semibold border-b border-gray-800"
                >
                  My Dashboard
                </button>
                <button 
                  onClick={handleLogout} 
                  className="block text-left w-full text-white hover:text-red-500 transition-colors duration-300 py-3 text-lg font-semibold"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link 
                to="/login" 
                onClick={() => setMobileMenuOpen(false)} 
                className="block text-white hover:text-red-500 transition-colors duration-300 py-3 text-lg font-semibold"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;