import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  UserIcon,
  WrenchIcon,
  CalendarIcon,
  ClipboardIcon,
  ClipboardCheck,
  SettingsIcon,
  DollarSignIcon,
  PackageIcon,
  LogOutIcon,
  MenuIcon,
  XIcon,
  ClockIcon,
  HistoryIcon,
  ChevronDownIcon,
  UserCircleIcon,
} from 'lucide-react';

const SidebarItem = ({ to, icon, label, active }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
      active ? 'bg-red-600 text-white' : 'text-gray-700 hover:bg-gray-100'
    }`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </Link>
);

const DashboardLayout = ({ children, userRole, userName }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const handleProfileClick = () => {
    navigate('/profile/edit');
    setProfileDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getMenuItems = () => {
    const roleSpecificItems = {
      admin: [
        {
          to: '/admin',
          icon: <ClipboardIcon size={20} />,
          label: 'Dashboard',
        },
        {
          to: '/admin/manageservices',
          icon: <WrenchIcon size={20} />,
          label: 'Services',
        },
        {
          to: '/admin/users',
          icon: <UserIcon size={20} />,
          label: 'Users',
        },
         {
          to: '/admin/my-appointments',
          icon: <ClipboardCheck size={20} />,
          label: 'Appointments',
        },
        {
          to: '/admin/appointments/calendar',
          icon: <CalendarIcon size={20} />,
          label: 'Calendar',
        },
        
      ],
      user: [
        {
          to: '/customerDashboard',
          icon: <ClipboardIcon size={20} />,
          label: 'Dashboard',
        },
        {
          to: '/services',
          icon: <WrenchIcon size={20} />,
          label: 'Services',
        },
        {
          to: '/appointments',
          icon: <CalendarIcon size={20} />,
          label: 'My Appointments',
        },
      ],
      'financial-manager': [
        {
          to: '/financialmanager',
          icon: <ClipboardIcon size={20} />,
          label: 'Dashboard',
        },
        {
          to: '/financial/invoices',
          icon: <DollarSignIcon size={20} />,
          label: 'Invoices',
        },
        {
          to: '/financial/expenses',
          icon: <DollarSignIcon size={20} />,
          label: 'Expenses',
        },
        {
          to: '/financial/reports',
          icon: <ClipboardIcon size={20} />,
          label: 'Reports',
        },
        {
          to: '/financial/archives',
          icon: <DollarSignIcon size={20} />,
          label: 'Archives',
        },
      ],
      'inventory-manager': [
        {
          to: '/inventory/dashboard',
          icon: <ClipboardIcon size={20} />,
          label: 'Dashboard',
        },
        {
          to: '/inventory/supplier',
          icon: <PackageIcon size={20} />,
          label: 'Suppliers',
        },
        {
          to: '/inventory/products',
          icon: <WrenchIcon size={20} />,
          label: 'Products',
        },
        {
          to: '/inventory/orders',
          icon: <WrenchIcon size={20} />,
          label: 'Orders',
        },
      ],
      'service-employee': [
        {
          to: '/customerDashboard',
          icon: <ClipboardIcon size={20} />,
          label: 'Dashboard',
        },
        {
          to: '/service-employee/appointments',
          icon: <CalendarIcon size={20} />,
          label: 'Appointments',
        },
      ],
      'service-advisor': [
        {
          to: '/serviceadvisor',
          icon: <ClipboardIcon size={20} />,
          label: 'Jobs',
         
        },
        {
          to: '/serviceadvisor/services',
          icon: <WrenchIcon size={20} />,
          label: 'Services',
         
        },
        {
          to: '/serviceadvisor/vehicle-history',
          icon: <ClockIcon size={20} />,
          label: 'Vehicle History',
           
        },
        {
          to: '/serviceadvisor/all-job-history',
          icon: <HistoryIcon size={20} />,
          label: 'All Job History',
         
        },
      ],
      receptionist: [
        {
          to: '/receptionist',
          icon: <ClipboardIcon size={20} />,
          label: 'Dashboard',
        },
        {
          to: '/receptionist/calendar',
          icon: <CalendarIcon size={20} />,
          label: 'Calendar',
        },
        {
          to: '/receptionist/appointments',
          icon: <ClipboardCheck size={20} />,
          label: 'All Appointments',
        },
        {
          to: '/receptionist/customers',
          icon: <UserIcon size={20} />,
          label: 'Customers',
        },
        {
          to: '/receptionist/services',
          icon: <WrenchIcon size={20} />,
          label: 'Service Catalogue',
        },
      ],
    };

    // Convert role to key format (e.g., "Financial Manager" -> "financial-manager")
    const roleKey = userRole.toLowerCase().replace(/\s+/g, '-');
    return roleSpecificItems[roleKey] || [];
  };

  const menuItems = getMenuItems();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex justify-between items-center px-4 py-3">
          <div className="flex items-center">
            <button onClick={toggleMobileMenu} className="md:hidden mr-4">
              {mobileMenuOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
            </button>
            <Link to="/" className="text-2xl font-bold text-red-600">
              AutoCare
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700 hidden sm:inline-block">
              Welcome, {userName}
            </span>
            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-2 py-1 transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-red-600 flex items-center justify-center text-white font-semibold">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <ChevronDownIcon size={16} className="text-gray-600 hidden sm:block" />
              </button>

              {/* Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-900">{userName}</p>
                    <p className="text-xs text-gray-500">{userRole}</p>
                  </div>
                  <button
                    onClick={handleProfileClick}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <UserCircleIcon size={18} />
                    <span>Edit Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOutIcon size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar - Desktop */}
        <aside className="hidden md:block w-64 border-r border-gray-200 bg-white">
          <div className="p-4">
            <div className="mb-6">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {userRole}
              </p>
              <p className="text-sm font-medium text-gray-900">{userName}</p>
            </div>
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <SidebarItem
                  key={item.to}
                  to={item.to}
                  icon={item.icon}
                  label={item.label}
                  active={location.pathname === item.to}
                />
              ))}
              <div className="pt-4 mt-4 border-t border-gray-200 space-y-1">
                <button 
                  onClick={() => navigate('/profile/edit')}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg w-full"
                >
                  <UserCircleIcon size={20} />
                  <span className="font-medium">Edit Profile</span>
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg w-full"
                >
                  <LogOutIcon size={20} />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </nav>
          </div>
        </aside>

        {/* Mobile Sidebar */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div
              className="fixed inset-0 bg-gray-600 bg-opacity-75"
              onClick={toggleMobileMenu}
            ></div>
            <div className="relative flex flex-col w-72 max-w-xs bg-white h-full">
              <div className="p-4">
                <div className="mb-6">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {userRole}
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {userName}
                  </p>
                </div>
                <nav className="space-y-1">
                  {menuItems.map((item) => (
                    <SidebarItem
                      key={item.to}
                      to={item.to}
                      icon={item.icon}
                      label={item.label}
                      active={location.pathname === item.to}
                    />
                  ))}
                  <div className="pt-4 mt-4 border-t border-gray-200 space-y-1">
                    <button 
                      onClick={() => {
                        navigate('/profile/edit');
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg w-full"
                    >
                      <UserCircleIcon size={20} />
                      <span className="font-medium">Edit Profile</span>
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg w-full"
                    >
                      <LogOutIcon size={20} />
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;