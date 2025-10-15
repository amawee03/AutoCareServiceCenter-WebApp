import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import apiClient from "../../api/axios";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  Lock,
  AlertCircle,
  Calendar,
  ArrowLeft,
  CheckCircle,
  Shield,
  Clock,
  User,
  Car,
  Package,
} from "lucide-react";

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();

  const [appointmentData, setAppointmentData] = useState(null);
  const [createdAppointment, setCreatedAppointment] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  });
  const [paymentErrors, setPaymentErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  // ✅ Load appointment data (from location state or sessionStorage)
  useEffect(() => {
    if (location.state?.appointment) {
      setAppointmentData(location.state.appointment);
      sessionStorage.setItem(
        "appointmentData",
        JSON.stringify(location.state.appointment)
      );
    } else {
      const stored = sessionStorage.getItem("appointmentData");
      if (stored) {
        setAppointmentData(JSON.parse(stored));
      } else {
        navigate("/services");
      }
    }
  }, [location.state, navigate]);

  // ✅ Luhn algorithm for card validation
  const luhnCheck = (cardNumber) => {
    const digits = cardNumber.replace(/\D/g, "");
    let sum = 0;
    let isEven = false;

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  };

  // ✅ Detect card type
  const getCardType = (number) => {
    const cleaned = number.replace(/\D/g, "");
    if (/^4/.test(cleaned)) return "Visa";
    if (/^5[1-5]/.test(cleaned)) return "Mastercard";
    if (/^3[47]/.test(cleaned)) return "Amex";
    if (/^6(?:011|5)/.test(cleaned)) return "Discover";
    return null;
  };

  // ✅ Input handler with formatting
  const handleChange = (e) => {
    const { name, value } = e.target;
    let val = value;

    if (name === "cardNumber") {
      val = value.replace(/\D/g, "").slice(0, 16);
    }
    if (name === "cvv") {
      val = value.replace(/\D/g, "").slice(0, 3);
    }
    if (name === "cardholderName") {
      val = value.replace(/[^a-zA-Z\s]/g, "");
    }

    setPaymentForm((prev) => ({ ...prev, [name]: val }));
    if (paymentErrors[name]) {
      setPaymentErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // ✅ Form validation
  const validateForm = () => {
    const errors = {};
    const today = new Date();

    if (!paymentForm.cardholderName.trim()) {
      errors.cardholderName = "Cardholder name is required";
    } else if (paymentForm.cardholderName.trim().length < 3) {
      errors.cardholderName = "Name must be at least 3 characters";
    } else if (!/^[a-zA-Z\s]+$/.test(paymentForm.cardholderName)) {
      errors.cardholderName = "Name can only contain letters";
    }

    if (!paymentForm.cardNumber || paymentForm.cardNumber.length !== 16) {
      errors.cardNumber = "Card number must be exactly 16 digits";
    } else if (!luhnCheck(paymentForm.cardNumber)) {
      errors.cardNumber = "Invalid card number";
    }

    if (!paymentForm.expiryDate) {
      errors.expiryDate = "Expiry date is required";
    } else {
      const selectedDate = new Date(paymentForm.expiryDate);
      if (selectedDate <= today) {
        errors.expiryDate = "Card has expired";
      }
    }

    if (!paymentForm.cvv || paymentForm.cvv.length !== 3) {
      errors.cvv = "CVV must be exactly 3 digits";
    }

    setPaymentErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ✅ Submit handler
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsProcessing(true);
    try {
      const service =
        appointmentData.servicePackage || appointmentData.selectedService;
      if (!service) throw new Error("Service information is missing.");

      // Prepare appointment payload
      const preferredDateTime = new Date(appointmentData.preferredTime);
      const appointmentDate = preferredDateTime.toISOString().split("T")[0];
      const startTime = preferredDateTime.toTimeString().slice(0, 5);

      // Get current user from session
      let customerId = null;
      try {
        const profileRes = await apiClient.get('/api/auth/profile');
        if (profileRes.data && profileRes.data._id) {
          customerId = profileRes.data._id;
        }
      } catch (err) {
        console.log('User not logged in, creating appointment without customerId');
      }

      // Handle vehicle data - can be object or string
      let vehicleData = appointmentData.vehicle;
      if (typeof vehicleData === 'string') {
        vehicleData = vehicleData.trim();
      }
      // If it's an object, keep it as is (already has make, model, licensePlate)

      const appointmentPayload = {
        customerId: customerId, // Link appointment to logged-in user
        customerName: appointmentData.customerName?.trim(),
        vehicle: vehicleData,
        packageId: appointmentData.packageId || service._id,
        appointmentDate,
        startTime,
        duration: appointmentData.duration || service.duration || 60,
        notes: appointmentData.notes?.trim() || "",
        payment: { amount: parseFloat(service.price) || 0, status: "pending" },
      };

      console.log('📤 Creating appointment with payload:', appointmentPayload);

      const appointmentRes = await apiClient.post(
        "/api/appointments",
        appointmentPayload,
        { headers: { "Content-Type": "application/json" }, timeout: 10000 }
      );

      console.log('✅ Appointment created:', appointmentRes.data);

      const newAppointment =
        appointmentRes.data.appointment || appointmentRes.data;
      if (!newAppointment?._id) {
        throw new Error("Invalid appointment response from server");
      }
      setCreatedAppointment(newAppointment);

      // Prepare payment payload
      const paymentPayload = {
        appointmentId: newAppointment._id,
        amount: parseFloat(service.price) || 0,
        method: "card",
        cardDetails: {
          cardHolder: paymentForm.cardholderName.trim(),
          cardNumber: paymentForm.cardNumber,
          expiryDate: paymentForm.expiryDate,
          cvv: paymentForm.cvv,
        },
      };

      console.log('💳 Processing payment with payload:', paymentPayload);

      const paymentRes = await apiClient.post(
        "/api/payment/pay",
        paymentPayload,
        { headers: { "Content-Type": "application/json" }, timeout: 15000 }
      );

      console.log('✅ Payment processed:', paymentRes.data);

      if (!paymentRes.data.success) {
        throw new Error(paymentRes.data.error || "Payment processing failed");
      }

      // Navigate to success page
      navigate("/appointment-success", {
        state: {
          appointment: paymentRes.data.appointment || newAppointment,
          payment: paymentRes.data.payment,
          transactionId:
            paymentRes.data.appointment?.payment?.transactionId ||
            paymentRes.data.payment?.transactionId,
        },
      });

      sessionStorage.removeItem("appointmentData");
      sessionStorage.removeItem("selectedService");
    } catch (err) {
      let errorMessage = "Payment failed. Please try again.";
      if (err.response?.data) {
        errorMessage =
          err.response.data.error ||
          err.response.data.message ||
          errorMessage;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setPaymentErrors({
        general: createdAppointment
          ? `Appointment created but payment failed: ${errorMessage}. Appointment ID: ${createdAppointment._id}`
          : errorMessage,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // ✅ Loading / no appointment state
  if (!appointmentData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-red-50 to-slate-100">
        <div className="text-center bg-white p-12 rounded-3xl shadow-2xl max-w-md">
          <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="h-10 w-10 text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            No Appointment Found
          </h3>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Please book an appointment first to proceed with payment.
          </p>
          <Button
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
            onClick={() => navigate("/services")}
          >
            Browse Services
          </Button>
        </div>
      </div>
    );
  }

  const service = appointmentData.servicePackage || appointmentData.selectedService;
  const serviceName = service?.pkgName || service?.name || "Service";
  const servicePrice = parseFloat(service?.price) || 0;
  const cardType = getCardType(paymentForm.cardNumber);

  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-slate-50 via-red-50 to-slate-100">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left Column - Appointment Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                <div className="bg-red-100 p-3 rounded-xl">
                  <Package className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Booking Summary</h3>
                  <p className="text-sm text-gray-500">Review your details</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <Package className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Service Package</p>
                    <p className="font-semibold text-gray-900">{serviceName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <User className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Customer Name</p>
                    <p className="font-semibold text-gray-900">{appointmentData.customerName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <Car className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Vehicle</p>
                    <p className="font-semibold text-gray-900">
                      {typeof appointmentData.vehicle === 'object' 
                        ? `${appointmentData.vehicle.make || ''} ${appointmentData.vehicle.model || ''} (${appointmentData.vehicle.registration || ''})`.trim() 
                        : appointmentData.vehicle}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <Clock className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Appointment Time</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(appointmentData.preferredTime).toLocaleString('en-US', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">LKR {servicePrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">Tax & Fees</span>
                  <span className="font-semibold">LKR 0</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <span className="text-lg font-bold text-gray-900">Total Amount</span>
                  <span className="text-2xl font-bold text-red-600">
                    LKR {servicePrice.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-2 text-green-700 mb-2">
                  <Shield className="h-5 w-5" />
                  <span className="font-semibold text-sm">Secure Payment</span>
                </div>
                <p className="text-xs text-green-600 leading-relaxed">
                  Your payment is protected with 256-bit SSL encryption and PCI DSS compliance
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Payment Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <Button
                variant="outline"
                className="mb-6 flex items-center gap-2 text-gray-600 hover:text-red-600 hover:bg-red-50 border-gray-300 rounded-xl"
                onClick={() => navigate(-1)}
                disabled={isProcessing}
              >
                <ArrowLeft className="h-4 w-4" /> Back to Appointment
              </Button>

              <div className="flex items-center gap-3 mb-8">
                <div className="bg-gradient-to-br from-red-600 to-red-700 p-3 rounded-xl shadow-lg">
                  <CreditCard className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Payment Details</h2>
                  <p className="text-gray-500">Complete your secure payment</p>
                </div>
              </div>

              {paymentErrors.general && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-xl shadow-sm">
                  <div className="flex items-center gap-2 text-red-700 mb-1">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <span className="font-semibold">Payment Error</span>
                  </div>
                  <p className="text-red-600 text-sm leading-relaxed ml-7">{paymentErrors.general}</p>
                </div>
              )}

              <form onSubmit={handlePaymentSubmit} className="space-y-6">
                {/* Cardholder Name */}
                <div className="relative">
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    Cardholder Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="cardholderName"
                      placeholder="John Doe"
                      value={paymentForm.cardholderName}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('cardholderName')}
                      onBlur={() => setFocusedField(null)}
                      disabled={isProcessing}
                      className={`w-full px-4 py-3 pr-12 rounded-xl border-2 transition-all ${
                        paymentErrors.cardholderName
                          ? "border-red-500 bg-red-50"
                          : focusedField === 'cardholderName'
                          ? "border-red-500 bg-white shadow-lg"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      } focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
                    />
                    {paymentForm.cardholderName && !paymentErrors.cardholderName && (
                      <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                    )}
                  </div>
                  {paymentErrors.cardholderName && (
                    <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" /> {paymentErrors.cardholderName}
                    </p>
                  )}
                </div>

                {/* Card Number */}
                <div className="relative">
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-gray-500" />
                    Card Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={paymentForm.cardNumber.replace(/(.{4})/g, "$1 ").trim()}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('cardNumber')}
                      onBlur={() => setFocusedField(null)}
                      disabled={isProcessing}
                      maxLength="19"
                      className={`w-full px-4 py-3 pr-32 rounded-xl border-2 transition-all ${
                        paymentErrors.cardNumber
                          ? "border-red-500 bg-red-50"
                          : focusedField === 'cardNumber'
                          ? "border-red-500 bg-white shadow-lg"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      } focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                      {cardType && !paymentErrors.cardNumber && (
                        <span className="text-sm font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
                          {cardType}
                        </span>
                      )}
                      {paymentForm.cardNumber.length === 16 && !paymentErrors.cardNumber && luhnCheck(paymentForm.cardNumber) && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  </div>
                  {paymentErrors.cardNumber && (
                    <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" /> {paymentErrors.cardNumber}
                    </p>
                  )}
                </div>

                {/* Expiry + CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      Expiry Date
                    </label>
                    <div className="relative">
                      <input
                        type="month"
                        name="expiryDate"
                        value={paymentForm.expiryDate}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('expiryDate')}
                        onBlur={() => setFocusedField(null)}
                        disabled={isProcessing}
                        min={new Date().toISOString().slice(0, 7)}
                        className={`w-full px-4 py-3 pr-12 rounded-xl border-2 transition-all ${
                          paymentErrors.expiryDate
                            ? "border-red-500 bg-red-50"
                            : focusedField === 'expiryDate'
                            ? "border-red-500 bg-white shadow-lg"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        } focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
                      />
                      {paymentForm.expiryDate && !paymentErrors.expiryDate && (
                        <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                      )}
                    </div>
                    {paymentErrors.expiryDate && (
                      <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" /> {paymentErrors.expiryDate}
                      </p>
                    )}
                  </div>

                  <div className="relative">
                    <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Lock className="h-4 w-4 text-gray-500" />
                      CVV
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        name="cvv"
                        placeholder="123"
                        value={paymentForm.cvv}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('cvv')}
                        onBlur={() => setFocusedField(null)}
                        disabled={isProcessing}
                        maxLength="3"
                        className={`w-full px-4 py-3 pr-12 rounded-xl border-2 transition-all ${
                          paymentErrors.cvv
                            ? "border-red-500 bg-red-50"
                            : focusedField === 'cvv'
                            ? "border-red-500 bg-white shadow-lg"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        } focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
                      />
                      {paymentForm.cvv.length === 3 && !paymentErrors.cvv && (
                        <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                      )}
                    </div>
                    {paymentErrors.cvv && (
                      <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" /> {paymentErrors.cvv}
                      </p>
                    )}
                  </div>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={isProcessing || servicePrice <= 0}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-4 text-lg font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 mt-8"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin h-6 w-6 border-3 border-white border-t-transparent rounded-full"></div>
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <Lock className="h-5 w-5" />
                      Pay LKR {servicePrice.toLocaleString()}
                      <CheckCircle className="h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span>Protected by 256-bit SSL encryption</span>
                </div>
                <div className="flex items-center justify-center gap-4 mt-3">
                  <div className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded">Visa</div>
                  <div className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded">Mastercard</div>
                  <div className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded">Amex</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}