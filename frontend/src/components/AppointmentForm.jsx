// import React, { useState } from 'react';
// import { Card, CardContent } from './ui/card';
// import { Button } from './ui/button';
// import { Input } from './ui/input';
// import { Textarea } from './ui/textarea';
// import { Label } from './ui/label';
// import { Badge } from './ui/badge';
// import { Clock, Calendar, User, Mail, Phone, FileText, ArrowLeft } from 'lucide-react';
// import { useNavigate, useLocation } from 'react-router-dom';

// const AppointmentForm = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { selectedService, selectedDate, selectedSlot } = location.state || {};
  
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     phone: '',
//     notes: ''
//   });
//   const [loading, setLoading] = useState(false);
//   const [errors, setErrors] = useState({});

//   // Redirect if no appointment data
//   React.useEffect(() => {
//     if (!selectedService || !selectedDate || !selectedSlot) {
//       navigate('/appointment');
//     }
//   }, [selectedService, selectedDate, selectedSlot, navigate]);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
    
//     // Clear error when user starts typing
//     if (errors[name]) {
//       setErrors(prev => ({
//         ...prev,
//         [name]: ''
//       }));
//     }
//   };

//   const validateForm = () => {
//     const newErrors = {};
    
//     if (!formData.name.trim()) {
//       newErrors.name = 'Name is required';
//     }
    
//     if (!formData.email.trim()) {
//       newErrors.email = 'Email is required';
//     } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
//       newErrors.email = 'Please enter a valid email address';
//     }
    
//     if (!formData.phone.trim()) {
//       newErrors.phone = 'Phone number is required';
//     } else if (!/^(\+94|0)[0-9]{9}$/.test(formData.phone.replace(/\s/g, ''))) {
//       newErrors.phone = 'Please enter a valid Sri Lankan phone number (e.g., +94 77 123 4567 or 077 123 4567)';
//     }
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
    
//     if (!validateForm()) {
//       return;
//     }

//     setLoading(true);
    
//     // Navigate to payment page with all data
//     navigate('/appointment/payment', {
//       state: {
//         selectedService,
//         selectedDate,
//         selectedSlot,
//         customerDetails: formData
//       }
//     });
//   };

//   const handleBack = () => {
//     navigate('/appointment/calendar', {
//       state: { selectedService }
//     });
//   };

//   if (!selectedService || !selectedDate || !selectedSlot) {
//     return null;
//   }

//   const appointmentDate = new Date(selectedDate);

//   return (
//     <div className="min-h-screen bg-background py-16">
//       <div className="max-w-4xl mx-auto px-8 sm:px-12 lg:px-16 xl:px-20">
//         {/* Header */}
//         <div className="text-center mb-12">
//           <h1 className="text-5xl lg:text-6xl font-bold text-foreground mb-6">
//             Appointment Details
//           </h1>
//           <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
//             Please provide your contact information and any special notes
//           </p>
//         </div>

//         <div className="grid lg:grid-cols-2 gap-12">
//           {/* Appointment Summary */}
//           <Card className="h-fit">
//             <CardContent className="p-6">
//               <h2 className="text-2xl font-semibold text-foreground mb-6">Appointment Summary</h2>
              
//               {/* Service Details */}
//               <div className="mb-6">
//                 <div className="flex items-center gap-4 mb-4">
//                   <img
//                     src={selectedService.image ? `/uploads/${selectedService.image.split('/').pop()}` : 'https://via.placeholder.com/80x80?text=No+Image'}
//                     alt={selectedService.pkgName}
//                     className="w-20 h-20 object-cover rounded-lg"
//                   />
//                   <div>
//                     <h3 className="text-xl font-semibold text-foreground">{selectedService.pkgName}</h3>
//                     <Badge variant="secondary" className="mt-1">{selectedService.category}</Badge>
//                   </div>
//                 </div>
//                 <p className="text-muted-foreground text-sm">{selectedService.description}</p>
//               </div>

//               {/* Date & Time */}
//               <div className="space-y-4">
//                 <div className="flex items-center gap-3">
//                   <Calendar className="h-5 w-5 text-primary" />
//                   <div>
//                     <p className="font-medium text-foreground">
//                       {appointmentDate.toLocaleDateString('en-US', { 
//                         weekday: 'long', 
//                         year: 'numeric', 
//                         month: 'long', 
//                         day: 'numeric' 
//                       })}
//                     </p>
//                   </div>
//                 </div>
                
//                 <div className="flex items-center gap-3">
//                   <Clock className="h-5 w-5 text-primary" />
//                   <div>
//                     <p className="font-medium text-foreground">
//                       {selectedSlot.startTime} - {selectedSlot.endTime}
//                     </p>
//                     <p className="text-sm text-muted-foreground">Duration: {selectedService.duration}</p>
//                   </div>
//                 </div>
//               </div>

//               {/* Price */}
//               <div className="mt-6 pt-6 border-t border-border">
//                 <div className="flex items-center justify-between">
//                   <span className="text-lg font-medium text-foreground">Service Fee</span>
//                   <span className="text-2xl font-bold text-primary">LKR {selectedService.price.toLocaleString()}</span>
//                 </div>
//                 <div className="flex items-center justify-between mt-2">
//                   <span className="text-sm text-muted-foreground">Processing Fee</span>
//                   <span className="text-sm text-muted-foreground">LKR 0</span>
//                 </div>
//                 <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
//                   <span className="text-xl font-semibold text-foreground">Total</span>
//                   <span className="text-3xl font-bold text-primary">LKR {selectedService.price.toLocaleString()}</span>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Customer Details Form */}
//           <Card>
//             <CardContent className="p-6">
//               <h2 className="text-2xl font-semibold text-foreground mb-6">Your Information</h2>
              
//               <form onSubmit={handleSubmit} className="space-y-6">
//                 {/* Name */}
//                 <div className="space-y-2">
//                   <Label htmlFor="name" className="text-base font-medium">
//                     <User className="inline h-4 w-4 mr-2" />
//                     Full Name *
//                   </Label>
//                   <Input
//                     id="name"
//                     name="name"
//                     value={formData.name}
//                     onChange={handleInputChange}
//                     placeholder="Enter your full name"
//                     className={`h-12 text-base ${errors.name ? 'border-destructive' : ''}`}
//                   />
//                   {errors.name && (
//                     <p className="text-sm text-destructive">{errors.name}</p>
//                   )}
//                 </div>

//                 {/* Email */}
//                 <div className="space-y-2">
//                   <Label htmlFor="email" className="text-base font-medium">
//                     <Mail className="inline h-4 w-4 mr-2" />
//                     Email Address *
//                   </Label>
//                   <Input
//                     id="email"
//                     name="email"
//                     type="email"
//                     value={formData.email}
//                     onChange={handleInputChange}
//                     placeholder="Enter your email address"
//                     className={`h-12 text-base ${errors.email ? 'border-destructive' : ''}`}
//                   />
//                   {errors.email && (
//                     <p className="text-sm text-destructive">{errors.email}</p>
//                   )}
//                 </div>

//                 {/* Phone */}
//                 <div className="space-y-2">
//                   <Label htmlFor="phone" className="text-base font-medium">
//                     <Phone className="inline h-4 w-4 mr-2" />
//                     Phone Number *
//                   </Label>
//                   <Input
//                     id="phone"
//                     name="phone"
//                     type="tel"
//                     value={formData.phone}
//                     onChange={handleInputChange}
//                     placeholder="+94 77 123 4567 or 077 123 4567"
//                     className={`h-12 text-base ${errors.phone ? 'border-destructive' : ''}`}
//                   />
//                   {errors.phone && (
//                     <p className="text-sm text-destructive">{errors.phone}</p>
//                   )}
//                 </div>

//                 {/* Notes */}
//                 <div className="space-y-2">
//                   <Label htmlFor="notes" className="text-base font-medium">
//                     <FileText className="inline h-4 w-4 mr-2" />
//                     Special Notes (Optional)
//                   </Label>
//                   <Textarea
//                     id="notes"
//                     name="notes"
//                     value={formData.notes}
//                     onChange={handleInputChange}
//                     placeholder="Any special instructions or notes for your appointment..."
//                     rows={4}
//                     className="text-base"
//                   />
//                 </div>

//                 {/* Action Buttons */}
//                 <div className="flex gap-4 pt-6">
//                   <Button
//                     type="button"
//                     variant="outline"
//                     onClick={handleBack}
//                     className="flex-1 h-12 text-base"
//                   >
//                     <ArrowLeft className="h-4 w-4 mr-2" />
//                     Back to Calendar
//                   </Button>
//                   <Button
//                     type="submit"
//                     disabled={loading}
//                     className="flex-1 h-12 text-base bg-primary hover:bg-primary-dark"
//                   >
//                     {loading ? 'Processing...' : 'Continue to Payment'}
//                   </Button>
//                 </div>
//               </form>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AppointmentForm;



import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const BookingForm = ({ onSubmit, buttonText = "Book Service" }) => {
  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    email: "",
    vehicleMake: "",
    vehicleModel: "",
    vehicleYear: "",
    licensePlate: "",
    serviceType: "interior",
    bookingDate: new Date(),
    notes: "",
  });

  const [errors, setErrors] = useState({});

  // ✅ Handle field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // ✅ Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = "Customer name is required";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }
    if (!formData.vehicleMake.trim()) {
      newErrors.vehicleMake = "Vehicle make is required";
    }
    if (!formData.vehicleModel.trim()) {
      newErrors.vehicleModel = "Vehicle model is required";
    }
    if (!formData.licensePlate.trim()) {
      newErrors.licensePlate = "License plate is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-xl shadow-lg max-w-3xl mx-auto"
    >
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Vehicle Detailing Booking
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Customer Name
          </label>
          <input
            type="text"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            className={`w-full bg-white border ${
              errors.customerName ? "border-red-500" : "border-gray-300"
            } rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500`}
          />
          {errors.customerName && (
            <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`w-full bg-white border ${
              errors.phone ? "border-red-500" : "border-gray-300"
            } rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500`}
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email (optional)
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* Vehicle Make */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Vehicle Make
          </label>
          <input
            type="text"
            name="vehicleMake"
            value={formData.vehicleMake}
            onChange={handleChange}
            className={`w-full bg-white border ${
              errors.vehicleMake ? "border-red-500" : "border-gray-300"
            } rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500`}
          />
          {errors.vehicleMake && (
            <p className="text-red-500 text-sm mt-1">{errors.vehicleMake}</p>
          )}
        </div>

        {/* Vehicle Model */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Vehicle Model
          </label>
          <input
            type="text"
            name="vehicleModel"
            value={formData.vehicleModel}
            onChange={handleChange}
            className={`w-full bg-white border ${
              errors.vehicleModel ? "border-red-500" : "border-gray-300"
            } rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500`}
          />
          {errors.vehicleModel && (
            <p className="text-red-500 text-sm mt-1">{errors.vehicleModel}</p>
          )}
        </div>

        {/* Vehicle Year */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Vehicle Year
          </label>
          <input
            type="number"
            name="vehicleYear"
            value={formData.vehicleYear}
            onChange={handleChange}
            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* License Plate */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            License Plate
          </label>
          <input
            type="text"
            name="licensePlate"
            value={formData.licensePlate}
            onChange={handleChange}
            className={`w-full bg-white border ${
              errors.licensePlate ? "border-red-500" : "border-gray-300"
            } rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500`}
          />
          {errors.licensePlate && (
            <p className="text-red-500 text-sm mt-1">{errors.licensePlate}</p>
          )}
        </div>

        {/* Service Type */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Service Type
          </label>
          <select
            name="serviceType"
            value={formData.serviceType}
            onChange={handleChange}
            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="interior">Interior Detailing</option>
            <option value="exterior">Exterior Detailing</option>
            <option value="full">Full Service</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Booking Date */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Booking Date
          </label>
          <DatePicker
            selected={formData.bookingDate}
            onChange={(date) => setFormData({ ...formData, bookingDate: date })}
            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            dateFormat="dd/MM/yyyy"
            maxDate={new Date()} // ✅ disable future dates
            showPopperArrow={false}
          />
        </div>

        {/* Notes */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Any special instructions?"
          ></textarea>
        </div>
      </div>

      <div className="mt-6">
        <button
          type="submit"
          className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200"
        >
          {buttonText}
        </button>
      </div>
    </form>
  );
};

export default BookingForm;
