import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import ServicesPage from './pages/ServicesPage';
import AboutPage from './pages/AboutPage';
import AccountPage from './pages/AccountPage';
import AdminDashboard from './pages/Admin/AdminDashboard';
import ContactUsPage from './pages/ContactUsPage';
import { ServicePackageForm } from './pages/Admin/ServicePackageForm';
import ManageServices from './pages/Admin/ManageServices';
import ManageUsers from './pages/Admin/ManageUsers';
import AppointmentBooking from './pages/appointments/AppointmentBooking';
import Payment from './pages/appointments/Payment';
import CalendarPage from './pages/appointments/CalendarPage';
import AppointmentSuccess from './components/AppointmentSuccess';
import AppointmentManagement from './components/AppointmentManagement';
import ServiceCatalogue from './components/ServiceCatalogue';
import AppointmentOverview from './pages/appointments/appointmentsOverview';
import DashboardLayout from './components/layouts/DashboardLayout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import AddVehicle from './pages/AddVehicle';
import EditVehicle from './pages/EditVehicle';
import EditProfile from './pages/EditProfile';
import StaffDashboard from './pages/StaffDashboard';
import './App.css';
import InventoryDashboard from './pages/inventory/InventoryDashboard';
import DisplayProduct from './components/Products/DisplayProduct/DisplayProduct';
import AddProduct from './components/Products/AddProduct/AddProduct';
import UpdateProduct from './components/Products/UpdateProduct/UpdateProduct';
import DisplaySupplier from './components/Suppliers/DisplaySupplier/DisplaySupplier';
import AddSupplier from './components/Suppliers/AddSupplier/AddSupplier';
import UpdateSupplier from './components/Suppliers/UpdateSupplier/UpdateSupplier';
import AddOrder from './components/PurchaseOrder/AddOrder/AddOrder';
import DisplayOrder from './components/PurchaseOrder/DisplayOrder/DisplayOrder';
import UpdateOrder from './components/PurchaseOrder/UpdateOrder/UpdateOrder';
import FinancialDashboard from './pages/financial/FinancialDashboard';
import InvoicePage from './pages/financial/InvoicePage';
import ReportsPage from './pages/financial/ReportsPage';
import ArchivesPage from './pages/financial/ArchivesPage';
import FinanceExpensePage from './pages/financial/FinanceExpensePage';
import TodaysJobs from './pages/serviceStaff/dashboard/TodaysJobs';
import ActiveJobs from './pages/serviceStaff/dashboard/ActiveJobs';
import AllJobHistory from './pages/serviceStaff/dashboard/AllJobHistory';
import JobDetails from './pages/serviceStaff/dashboard/JobDetails';
import JobHistory from './pages/serviceStaff/dashboard/JobHistory';
import ServiceAdvisorDashboard from './pages/serviceStaff/ServiceAdvisorDashboard';
import CustomerDashboard from './pages/Customer/CustomerDashboard';
import ReceptionistDashboard from './pages/Receptionist/receptionistDashboard';
import ReceptionistAppointmentBooking from './pages/Receptionist/receptionistAptBooking';
import AdminAppointmentSuccess from './pages/Receptionist/AdminAppointmentSuccess';
import ReceptionistCalendar from './pages/Receptionist/ReceptionistCalender';
import CustomerAppointments from './pages/Customer/CustomerViewAppoiments';
// Wrapper component to handle authentication state
const AppContent = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show loading state while checking auth
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen">
      <Routes>
        {/* Public routes */}
        {/* <Route path="/customerDashboard" element={<><Navbar /><CustomerDashboard /></>} /> */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/customerDashboard" replace /> : <Login />} />
        <Route path="/signup" element={isAuthenticated ? <Navigate to="/customerDashboard" replace /> : <Signup />} />
        
        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/customerDashboard" element={<><Navbar /><CustomerDashboard /></>} />
          <Route path="/vehicles/new" element={<AddVehicle />} />
          <Route path="/vehicles/edit/:id" element={<EditVehicle />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/myappointments" element={<><Navbar /><CustomerAppointments/></>} />
          
          {/* Staff routes */}
          <Route element={<ProtectedRoute allowedRoles={['receptionist', 'finance_manager', 'inventory_manager', 'admin']} />}>
            <Route path="/staff/dashboard" element={<StaffDashboard />} />
          </Route>
          
          {/* Admin routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin','receptionist']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/manageservices" element={<ManageServices />} />
            <Route path="/admin/servicepackage" element={<ServicePackageForm />} />
            <Route path="/admin/users" element={
              <DashboardLayout userRole="Admin" userName="Admin User">
                <ManageUsers />
              </DashboardLayout>
            } />
            {/* <Route path="/admin/my-appointments" element={<AppointmentManagement />} /> */}
            <Route path="/admin/my-appointments" element={
              <DashboardLayout userRole="Admin" userName="Admin User">
                <AppointmentManagement />
              </DashboardLayout>
            } />
            <Route path="/admin/appointments/calendar" element={<CalendarPage />} />
          </Route>
          
          {/* Inventory Manager routes */}
          <Route element={<ProtectedRoute allowedRoles={['inventory_manager', 'admin']} />}>
            <Route path="/inventory/dashboard" element={
              <DashboardLayout userRole="Inventory Manager" userName="Inventory Manager">
                <InventoryDashboard />
              </DashboardLayout>
            } />
            <Route path="/inventory" element={
              <DashboardLayout userRole="Inventory Manager" userName="Inventory Manager">
                <InventoryDashboard />
              </DashboardLayout>
            } />
            <Route path="/inventory/products" element={
              <DashboardLayout userRole="Inventory Manager" userName="Inventory Manager">
                <DisplayProduct />
              </DashboardLayout>
            } />
            <Route path="/products/addproduct" element={
              <DashboardLayout userRole="Inventory Manager" userName="Inventory Manager">
                <AddProduct />
              </DashboardLayout>
            } />
            <Route path="/products/:id" element={
              <DashboardLayout userRole="Inventory Manager" userName="Inventory Manager">
                <UpdateProduct />
              </DashboardLayout>
            } />
            <Route path="/inventory/supplier" element={
              <DashboardLayout userRole="Inventory Manager" userName="Inventory Manager">
                <DisplaySupplier />
              </DashboardLayout>
            } />
            <Route path="/inventory/supplier/add" element={
              <DashboardLayout userRole="Inventory Manager" userName="Inventory Manager">
                <AddSupplier />
              </DashboardLayout>
            } />
            <Route path="/inventory/supplier/:id" element={
              <DashboardLayout userRole="Inventory Manager" userName="Inventory Manager">
                <UpdateSupplier />
              </DashboardLayout>
            } />
            <Route path="/inventory/orders" element={
              <DashboardLayout userRole="Inventory Manager" userName="Inventory Manager">
                <DisplayOrder />
              </DashboardLayout>
            } />
            <Route path="/inventory/orders/add" element={
              <DashboardLayout userRole="Inventory Manager" userName="Inventory Manager">
                <AddOrder />
              </DashboardLayout>
            } />
            <Route path="/inventory/orders/:id" element={
              <DashboardLayout userRole="Inventory Manager" userName="Inventory Manager">
                <UpdateOrder />
              </DashboardLayout>
            } />
          </Route>
          
          {/* Finance Manager routes */}
          <Route element={<ProtectedRoute allowedRoles={['finance_manager', 'admin']} />}>
            <Route path="/financial" element={
              <DashboardLayout userRole="Financial Manager" userName="Finance Manager">
                <FinancialDashboard />
              </DashboardLayout>
            } />
            <Route path="/financial/invoices" element={
              <DashboardLayout userRole="Financial Manager" userName="Finance Manager">
                <InvoicePage />
              </DashboardLayout>
            } />
            <Route path="/financial/expenses" element={
              <DashboardLayout userRole="Financial Manager" userName="Finance Manager">
                <FinanceExpensePage />
              </DashboardLayout>
            } />
            <Route path="/financial/reports" element={
              <DashboardLayout userRole="Financial Manager" userName="Finance Manager">
                <ReportsPage />
              </DashboardLayout>
            } />
            <Route path="/financial/archives" element={
              <DashboardLayout userRole="Financial Manager" userName="Finance Manager">
                <ArchivesPage />
              </DashboardLayout>
            } />
            <Route path="/financialmanager" element={
              <DashboardLayout userRole="Financial Manager" userName="Finance Manager">
                <FinancialDashboard />
              </DashboardLayout>
            } />
          </Route>
          
          {/* Receptionist routes */}
          <Route element={<ProtectedRoute allowedRoles={['receptionist', 'admin']} />}>
            <Route path="/receptionist" element={<ReceptionistDashboard />} />
            <Route path="/receptionist/book-appointment" element={<ReceptionistAppointmentBooking />} />
            <Route path="/receptionist/appointment-success" element={<AdminAppointmentSuccess />} />
            <Route path="/receptionist/calendar" element={<ReceptionistCalendar />} />
            <Route path="/receptionist/appointments" element={
              <DashboardLayout userRole="Receptionist" userName="Receptionist">
                <AppointmentManagement />
              </DashboardLayout>
            } />
            <Route path="/receptionist/customers" element={
              <DashboardLayout userRole="Receptionist" userName="Receptionist">
                <ManageUsers filterRole="customer" />
              </DashboardLayout>
            } />
            <Route path="/receptionist/services" element={<ServicesPage />} />
          </Route>
          
          {/* Service Staff routes */}
          <Route element={<ProtectedRoute allowedRoles={['receptionist', 'service_advisor', 'admin']} />}>
            <Route path="/serviceadvisor" element={
              <DashboardLayout userRole="Service Advisor" userName="Service Advisor">
                <ServiceAdvisorDashboard />
              </DashboardLayout>
            } />
            <Route path="/service/advisor" element={
              <DashboardLayout userRole="Service Advisor" userName="Service Advisor">
                <ServiceAdvisorDashboard />
              </DashboardLayout>
            } />
            <Route path="/service/today" element={
              <DashboardLayout userRole="Service Advisor" userName="Service Advisor">
                <TodaysJobs />
              </DashboardLayout>
            } />
            <Route path="/service/active" element={
              <DashboardLayout userRole="Service Advisor" userName="Service Advisor">
                <ActiveJobs />
              </DashboardLayout>
            } />
            <Route path="/service/history" element={
              <DashboardLayout userRole="Service Advisor" userName="Service Advisor">
                <AllJobHistory />
              </DashboardLayout>
            } />
            <Route path="/service/job/:id" element={
              <DashboardLayout userRole="Service Advisor" userName="Service Advisor">
                <JobDetails />
              </DashboardLayout>
            } />
            <Route path="/service/history/:id" element={
              <DashboardLayout userRole="Service Advisor" userName="Service Advisor">
                <JobHistory />
              </DashboardLayout>
            } />
            <Route path="/serviceadvisor/services" element={<ServicesPage />} />
            <Route path="/serviceadvisor/vehicle-history" element={
              <DashboardLayout userRole="Service Advisor" userName="Service Advisor">
                <JobHistory />
              </DashboardLayout>
            } />
            <Route path="/serviceadvisor/all-job-history" element={
              <DashboardLayout userRole="Service Advisor" userName="Service Advisor">
                <AllJobHistory />
              </DashboardLayout>
            } />
            <Route path="/serviceadvisor/job-details/:id" element={
              <DashboardLayout userRole="Service Advisor" userName="Service Advisor">
                <JobDetails />
              </DashboardLayout>
            } />
          </Route>
        </Route>
        
        {/* Public pages with Navbar */}
        <Route path="/" element={<><Navbar /><HomePage /></>} />
        <Route path="/services" element={<><Navbar /><ServicesPage /></>} />
        <Route path="/contact" element={<><Navbar /><ContactUsPage /></>} />
        <Route path="/about" element={<><Navbar /><AboutPage /></>} />
        <Route 
          path="/account" 
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" state={{ from: location }} replace />
            ) : (
              <><Navbar /><AccountPage /></>
            )
          } 
        />
        <Route 
          path="/appointments" 
          element={
            isAuthenticated ? (
              <AppointmentBooking />
            ) : (
              <Navigate to="/login" state={{ from: '/appointments' }} replace />
            )
          } 
        />
        <Route 
          path="/payment" 
          element={
            isAuthenticated ? (
              <Payment />
            ) : (
              <Navigate to="/login" state={{ from: '/payment' }} replace />
            )
          } 
        />
        <Route 
          path="/appointment-success" 
          element={
            isAuthenticated ? (
              <AppointmentSuccess />
            ) : (
              <Navigate to="/login" state={{ from: '/appointment-success' }} replace />
            )
          } 
        />

        {/* 404 route */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </div>
  );
};

// Main App component wrapped with AuthProvider
const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;