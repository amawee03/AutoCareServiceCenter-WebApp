import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import apiClient from "@/api/axios";
import Layout from "@/components/layouts/Layout";
import { Button } from "@/components/ui/button";
import { Clock, Star, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

const AppointmentBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const service = location.state?.service;
  const { toast, ToastContainer } = useToast();
  const { user } = useAuth();

  const [customerName, setCustomerName] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [vehicles, setVehicles] = useState([]);
  const [loadingUserData, setLoadingUserData] = useState(true);
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [notes, setNotes] = useState("");
  const [availableTimes, setAvailableTimes] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [availabilityCheck, setAvailabilityCheck] = useState({ checking: false, lastChecked: null });

  if (!service) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center text-white">
          <p>No service selected. Please go back and select a service.</p>
        </div>
      </Layout>
    );
  }

  const timeSlots = [
    "08:00", "08:30", "09:00", "09:30",
    "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30",
    "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30"
  ];

  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoadingUserData(true);
        
       
        const profileResponse = await apiClient.get('/api/auth/profile');
        if (profileResponse.data) {
          setCustomerName(profileResponse.data.name || "");
        }
        
        const vehiclesResponse = await apiClient.get('/api/vehicles');
        if (vehiclesResponse.data) {
          setVehicles(vehiclesResponse.data);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        
      } finally {
        setLoadingUserData(false);
      }
    };

    if (user) {
      fetchUserData();
    } else {
      setLoadingUserData(false);
    }
  }, [user]);

  const validate = () => {
    const newErrors = {};
    if (!customerName.trim()) newErrors.customerName = "Name is required";
    if (!vehicle.trim()) newErrors.vehicle = "Vehicle is required";
    if (!preferredDate) newErrors.preferredDate = "Preferred date is required";
    if (!preferredTime) newErrors.preferredTime = "Preferred time is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  useEffect(() => {
    const fetchAvailableTimes = async () => {
      if (!preferredDate) {
        setAvailableTimes([]);
        setPreferredTime("");
        return;
      }

      try {
        setIsLoading(true);

        const response = await axios.get(
          `http://localhost:5001/api/appointments/available-time-slots`,
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
  }, [preferredDate, service._id, preferredTime]);

  // Check instant availability when time is selected
  const handleTimeSelection = async (selectedTime) => {
    if (!preferredDate || !selectedTime) return;

    try {
      setAvailabilityCheck({ checking: true, lastChecked: null });

      const response = await axios.post(
        `http://localhost:5001/api/appointments/check-instant-availability`,
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
        toast({ title: "Slot available", description: `${preferredDate} ${selectedTime} is free.`, variant: "success" });
      } else {
        setPreferredTime("");
        setErrors(prev => ({
          ...prev,
          preferredTime: "This time slot was just booked. Please select another."
        }));
        toast({ title: "Bay fully booked", description: `No bay available at ${selectedTime}. Please pick another time.`, variant: "destructive" });
        try {
          const refetch = await axios.get(
            `http://localhost:5001/api/appointments/available-time-slots`,
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
        preferredTime: "Unable to verify real-time availability. Please confirm manually."
      }));
    } finally {
      setAvailabilityCheck(prev => ({ ...prev, checking: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsLoading(true);

      const appointmentDateTime = new Date(`${preferredDate}T${preferredTime}:00`);

      // If user selected from dropdown, find the full vehicle object
      let vehicleData = vehicle;
      if (user && vehicles.length > 0) {
        const selectedVehicle = vehicles.find(v => v._id === vehicle);
        if (selectedVehicle) {
          // Format vehicle as object for registered users
          vehicleData = {
            make: selectedVehicle.make,
            model: selectedVehicle.model,
            year: selectedVehicle.year,
            licensePlate: selectedVehicle.licensePlate,
            registration: selectedVehicle.licensePlate // For compatibility
          };
        }
      }

      const appointmentData = {
        customerName,
        vehicle: vehicleData,
        packageId: service._id,
        preferredTime: appointmentDateTime.toISOString(),
        duration: service.duration,
        notes,
        servicePackage: service
      };

      navigate("/payment", { state: { appointment: appointmentData, service } });
    } catch (err) {
      console.error("Error during submission:", err);
      setErrors({
        general: "An error occurred. Please try again or contact support."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 flex justify-center items-start py-16 px-4">
        <div className="bg-black/90 p-10 rounded-3xl max-w-3xl w-full shadow-2xl border border-red-700">
          {/* Service Details */}
          <div className="mb-8 p-6 bg-gray-900 rounded-2xl border border-red-700">
            <h2 className="text-2xl font-bold text-white mb-2">{service.pkgName}</h2>
            <p className="text-gray-300 mb-2">{service.description}</p>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-red-500" />
                <span className="text-gray-200">{service.duration} minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-red-500" />
                <span className="text-gray-200">{service.status === "active" ? "Available" : "Unavailable"}</span>
              </div>
            </div>
          </div>

          <h3 className="text-xl font-bold text-white mb-4">Book Appointment</h3>

          {errors.api && <div className="mb-4 p-3 bg-yellow-900/50 border border-yellow-600 rounded-lg text-yellow-300 text-sm">{errors.api}</div>}
          {errors.general && <div className="mb-4 p-3 bg-red-900/50 border border-red-600 rounded-lg text-red-300 text-sm">{errors.general}</div>}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Customer Name */}
            <div>
              <label className="block text-gray-300 mb-2">Your Name</label>
              {user ? (
                <input
                  type="text"
                  value={customerName}
                  readOnly
                  className="w-full px-4 py-3 rounded-2xl bg-gray-800 text-gray-400 border border-gray-700 cursor-not-allowed"
                  placeholder="Loading..."
                />
              ) : (
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-900 text-white border border-gray-700 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter your full name"
                />
              )}
              {errors.customerName && <p className="text-red-500 mt-1 text-sm">{errors.customerName}</p>}
            </div>

            {/* Vehicle */}
            <div>
              <label className="block text-gray-300 mb-2">Vehicle</label>
              {user && vehicles.length > 0 ? (
                <select
                  value={vehicle}
                  onChange={(e) => setVehicle(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-900 text-white border border-gray-700 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">Select your vehicle</option>
                  {vehicles.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.make} {v.model} {v.year ? `(${v.year})` : ''} - {v.licensePlate}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={vehicle}
                  onChange={(e) => setVehicle(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-900 text-white border border-gray-700 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder={loadingUserData ? "Loading vehicles..." : "e.g., Toyota Camry - ABC 1234"}
                  disabled={loadingUserData}
                />
              )}
              {errors.vehicle && <p className="text-red-500 mt-1 text-sm">{errors.vehicle}</p>}
              {user && vehicles.length === 0 && !loadingUserData && (
                <p className="text-yellow-500 mt-1 text-sm">
                  No vehicles registered. <a href="/vehicles/new" className="underline">Add a vehicle</a> first.
                </p>
              )}
            </div>

            {/* Preferred Date */}
            <div>
              <label className="block text-gray-300 mb-2">Preferred Date</label>
              <input
                type="date"
                min={getMinDate()}
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-gray-900 text-white border border-gray-700 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
              {errors.preferredDate && <p className="text-red-500 mt-1 text-sm">{errors.preferredDate}</p>}
            </div>

            {/* Preferred Time */}
            <div>
              <label className="block text-gray-300 mb-2">
                Preferred Time
                {isLoading && <span className="text-yellow-500 ml-2 text-sm">(Loading available times...)</span>}
                {availabilityCheck.checking && <span className="text-blue-500 ml-2 text-sm">(Checking availability...)</span>}
                {availabilityCheck.lastChecked && <span className="text-green-500 ml-2 text-sm">✓ Available</span>}
              </label>
              <select
                value={preferredTime}
                onChange={(e) => handleTimeSelection(e.target.value)}
                disabled={isLoading || !preferredDate}
                className="w-full px-4 py-3 rounded-2xl bg-gray-900 text-white border border-gray-700 focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">
                  {!preferredDate ? "Please select a date first" : "Select a time slot"}
                </option>
                {availableTimes.map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
              {errors.preferredTime && <p className="text-red-500 mt-1 text-sm">{errors.preferredTime}</p>}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-gray-300 mb-2">Additional Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-gray-900 text-white border border-gray-700 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                rows={3}
                placeholder="Any special requests or vehicle issues to note..."
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading || !preferredDate || !preferredTime}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-bold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? <><Loader2 className="h-5 w-5 animate-spin" /> Verifying Availability...</> : "Proceed to Payment"}
            </Button>
            <ToastContainer />
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default AppointmentBooking;
