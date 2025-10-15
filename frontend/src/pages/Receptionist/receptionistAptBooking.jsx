import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Clock, Star, Loader2, User, Car, Phone, Mail } from "lucide-react";

const AdminAppointmentBooking = () => {
  const navigate = useNavigate();
  // Customer Details
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  // Vehicle Details
  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleYear, setVehicleYear] = useState("");
  const [vehicleRegistration, setVehicleRegistration] = useState("");
  const [vehicleColor, setVehicleColor] = useState("");

  // Appointment Details
  const [selectedService, setSelectedService] = useState("");
  const [services, setServices] = useState([]);
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [availableTimes, setAvailableTimes] = useState([]);
  const [notes, setNotes] = useState("");

  // UI States
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availabilityCheck, setAvailabilityCheck] = useState({ 
    checking: false, 
    lastChecked: null 
  });
  const [toast, setToast] = useState(null);

  const timeSlots = [
    "08:00", "08:30", "09:00", "09:30",
    "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30",
    "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30"
  ];

  // Fetch available services on component mount
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await apiClient.get("/api/packages");
        setServices(response.data.filter(pkg => pkg.status === "active"));
      } catch (err) {
        console.error("Error fetching services:", err);
        showToast("Failed to load services", "destructive");
      }
    };
    fetchServices();
  }, []);

  const showToast = (title, variant = "success") => {
    setToast({ title, variant });
    setTimeout(() => setToast(null), 3000);
  };

  const validate = () => {
    const newErrors = {};
    
    // Customer validation
    if (!customerName.trim()) newErrors.customerName = "Customer name is required";
    if (!customerPhone.trim()) newErrors.customerPhone = "Phone number is required";
    if (customerEmail && !/\S+@\S+\.\S+/.test(customerEmail)) {
      newErrors.customerEmail = "Invalid email format";
    }

    // Vehicle validation
    if (!vehicleMake.trim()) newErrors.vehicleMake = "Vehicle make is required";
    if (!vehicleModel.trim()) newErrors.vehicleModel = "Vehicle model is required";
    if (!vehicleRegistration.trim()) newErrors.vehicleRegistration = "Registration number is required";

    // Appointment validation
    if (!selectedService) newErrors.selectedService = "Please select a service";
    if (!preferredDate) newErrors.preferredDate = "Preferred date is required";
    if (!preferredTime) newErrors.preferredTime = "Preferred time is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Fetch available times when date or service changes
  useEffect(() => {
    const fetchAvailableTimes = async () => {
      if (!preferredDate || !selectedService) {
        setAvailableTimes([]);
        setPreferredTime("");
        return;
      }

      const service = services.find(s => s._id === selectedService);
      if (!service) return;

      try {
        setIsLoading(true);

        const response = await apiClient.get(
          `/api/appointments/available-time-slots`,
          {
            params: {
              packageId: service._id,
              date: preferredDate,
              duration: service.duration
            }
          }
        );

        const availableSlots = response.data?.availableSlots || [];
        setAvailableTimes(availableSlots);

        if (preferredTime && !availableSlots.includes(preferredTime)) {
          setPreferredTime("");
          setErrors(prev => ({
            ...prev,
            preferredTime: "Previously selected time is no longer available"
          }));
        }
      } catch (err) {
        console.error("Error fetching availability:", err);
        setAvailableTimes(timeSlots);
        setErrors(prev => ({
          ...prev,
          api: "Unable to load real-time availability. Showing all time slots."
        }));
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailableTimes();
  }, [preferredDate, selectedService]);

  // Check instant availability when time is selected
  const handleTimeSelection = async (selectedTime) => {
    if (!preferredDate || !selectedTime || !selectedService) return;

    const service = services.find(s => s._id === selectedService);
    if (!service) return;

    try {
      setAvailabilityCheck({ checking: true, lastChecked: null });

      const response = await apiClient.post(
        `/api/appointments/check-instant-availability`,
        {
          packageId: service._id,
          appointmentDate: preferredDate,
          startTime: selectedTime,
          duration: service.duration
        }
      );

      if (response.data.available) {
        setPreferredTime(selectedTime);
        setErrors(prev => ({ ...prev, preferredTime: "", api: "" }));
        setAvailabilityCheck({ checking: false, lastChecked: new Date() });
        showToast(`${preferredDate} ${selectedTime} is available`, "success");
      } else {
        setPreferredTime("");
        setErrors(prev => ({
          ...prev,
          preferredTime: "This time slot was just booked. Please select another."
        }));
        showToast("Slot unavailable, please pick another time", "destructive");
        
        // Refresh available times
        try {
          const refetch = await apiClient.get(
            `/api/appointments/available-time-slots`,
            {
              params: {
                packageId: service._id,
                date: preferredDate,
                duration: service.duration
              }
            }
          );
          setAvailableTimes(refetch.data?.availableSlots || []);
        } catch (_) {}
      }
    } catch (err) {
      console.error("Error checking instant availability:", err);
      setPreferredTime(selectedTime);
      setErrors(prev => ({
        ...prev,
        preferredTime: "Unable to verify real-time availability."
      }));
    } finally {
      setAvailabilityCheck(prev => ({ ...prev, checking: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const service = services.find(s => s._id === selectedService);
    if (!service) return;

    try {
      setIsSubmitting(true);

      const appointmentDateTime = new Date(`${preferredDate}T${preferredTime}:00`);

      const appointmentData = {
        // Customer details
        customerName,
        customerEmail: customerEmail || undefined,
        customerPhone,
        customerAddress: customerAddress || undefined,
        
        // Vehicle details
        vehicle: {
          make: vehicleMake,
          model: vehicleModel,
          year: vehicleYear || undefined,
          registration: vehicleRegistration,
          color: vehicleColor || undefined
        },
        
        // Appointment details
        packageId: service._id,
        preferredTime: appointmentDateTime.toISOString(),
        duration: service.duration,
        notes,
        servicePackage: service,
        
        // Admin booking specific
        paymentStatus: "pending",
        bookingType: "admin",
        isWalkIn: true
      };

      // Submit appointment to backend
      const response = await apiClient.post(
        "/api/appointments/admin-booking",
        appointmentData
      );

      if (response.data.success) {
        showToast("Appointment booked successfully!", "success");
        
        // Navigate to success page with appointment data
        setTimeout(() => {
          navigate("/receptionist/appointment-success", {
            state: { appointment: response.data.appointment }
          });
        }, 1000);
      }
    } catch (err) {
      console.error("Error booking appointment:", err);
      setErrors({
        general: err.response?.data?.error || "Failed to book appointment. Please try again."
      });
      showToast("Booking failed", "destructive");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const selectedServiceData = services.find(s => s._id === selectedService);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-black/90 p-8 rounded-3xl shadow-2xl border border-red-700">
          <h1 className="text-3xl font-bold text-white mb-2">Book Appointment (Admin)</h1>
          <p className="text-gray-400 mb-8">Register walk-in customer and create appointment</p>

          {toast && (
            <div className={`mb-6 p-4 rounded-xl ${
              toast.variant === "destructive" 
                ? "bg-red-900/50 border border-red-600 text-red-300" 
                : "bg-green-900/50 border border-green-600 text-green-300"
            }`}>
              {toast.title}
            </div>
          )}

          {errors.api && (
            <div className="mb-6 p-4 bg-yellow-900/50 border border-yellow-600 rounded-xl text-yellow-300">
              {errors.api}
            </div>
          )}

          {errors.general && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-600 rounded-xl text-red-300">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Customer Details Section */}
            <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-red-500" />
                <h2 className="text-xl font-bold text-white">Customer Details</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="John Doe"
                  />
                  {errors.customerName && (
                    <p className="text-red-400 mt-1 text-sm">{errors.customerName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="+94 71 234 5678"
                  />
                  {errors.customerPhone && (
                    <p className="text-red-400 mt-1 text-sm">{errors.customerPhone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Email (Optional)</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="john@example.com"
                  />
                  {errors.customerEmail && (
                    <p className="text-red-400 mt-1 text-sm">{errors.customerEmail}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Address (Optional)</label>
                  <input
                    type="text"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="123 Main St, Colombo"
                  />
                </div>
              </div>
            </div>

            {/* Vehicle Details Section */}
            <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <Car className="h-5 w-5 text-red-500" />
                <h2 className="text-xl font-bold text-white">Vehicle Details</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">Make *</label>
                  <input
                    type="text"
                    value={vehicleMake}
                    onChange={(e) => setVehicleMake(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Toyota"
                  />
                  {errors.vehicleMake && (
                    <p className="text-red-400 mt-1 text-sm">{errors.vehicleMake}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Model *</label>
                  <input
                    type="text"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Camry"
                  />
                  {errors.vehicleModel && (
                    <p className="text-red-400 mt-1 text-sm">{errors.vehicleModel}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Registration Number *</label>
                  <input
                    type="text"
                    value={vehicleRegistration}
                    onChange={(e) => setVehicleRegistration(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="ABC-1234"
                  />
                  {errors.vehicleRegistration && (
                    <p className="text-red-400 mt-1 text-sm">{errors.vehicleRegistration}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Year (Optional)</label>
                  <input
                    type="number"
                    value={vehicleYear}
                    onChange={(e) => setVehicleYear(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="2020"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Color (Optional)</label>
                  <input
                    type="text"
                    value={vehicleColor}
                    onChange={(e) => setVehicleColor(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Silver"
                  />
                </div>
              </div>
            </div>

            {/* Appointment Details Section */}
            <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">Appointment Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2">Select Service *</label>
                  <select
                    value={selectedService}
                    onChange={(e) => {
                      setSelectedService(e.target.value);
                      setPreferredTime("");
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">Choose a service package</option>
                    {services.map((service) => (
                      <option key={service._id} value={service._id}>
                        {service.pkgName} - ${service.price} ({service.duration} min)
                      </option>
                    ))}
                  </select>
                  {errors.selectedService && (
                    <p className="text-red-400 mt-1 text-sm">{errors.selectedService}</p>
                  )}
                </div>

                {selectedServiceData && (
                  <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                    <h3 className="font-semibold text-white mb-2">{selectedServiceData.pkgName}</h3>
                    <p className="text-gray-400 text-sm mb-3">{selectedServiceData.description}</p>
                    <div className="flex gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-red-500" />
                        <span className="text-gray-300">{selectedServiceData.duration} minutes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-red-500 font-bold">${selectedServiceData.price}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 mb-2">Date *</label>
                    <input
                      type="date"
                      min={getMinDate()}
                      value={preferredDate}
                      onChange={(e) => {
                        setPreferredDate(e.target.value);
                        setPreferredTime("");
                      }}
                      className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                    {errors.preferredDate && (
                      <p className="text-red-400 mt-1 text-sm">{errors.preferredDate}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2">
                      Time *
                      {isLoading && <span className="text-yellow-400 ml-2 text-sm">(Loading...)</span>}
                      {availabilityCheck.checking && <span className="text-blue-400 ml-2 text-sm">(Checking...)</span>}
                      {availabilityCheck.lastChecked && <span className="text-green-400 ml-2 text-sm">✓ Available</span>}
                    </label>
                    <select
                      value={preferredTime}
                      onChange={(e) => handleTimeSelection(e.target.value)}
                      disabled={isLoading || !preferredDate || !selectedService}
                      className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {!preferredDate ? "Select date first" : !selectedService ? "Select service first" : "Choose time"}
                      </option>
                      {availableTimes.map((time) => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                    {errors.preferredTime && (
                      <p className="text-red-400 mt-1 text-sm">{errors.preferredTime}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Notes (Optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    rows={3}
                    placeholder="Special requests, vehicle issues, or other notes..."
                  />
                </div>
              </div>
            </div>

            {/* Payment Status Info */}
            <div className="bg-yellow-900/20 border border-yellow-600 p-4 rounded-xl">
              <p className="text-yellow-300 text-sm">
                <strong>Note:</strong> Payment status will be marked as "Pending". Customer can pay at the service center.
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting || isLoading || !preferredDate || !preferredTime || !selectedService}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Booking Appointment...
                </>
              ) : (
                "Create Appointment"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminAppointmentBooking;