// // src/appointments/AppointmentForm.jsx
// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";

// export default function AppointmentForm() {
//   const navigate = useNavigate();
//   const [packages, setPackages] = useState([]);
//   const [form, setForm] = useState({
//     customerName: "",
//     vehicle: "",
//     packageId: "",
//     preferredTime: "",
//     duration: 60,
//     notes: "",
//   });

//   useEffect(() => {
//     axios.get("/api/packages")
//       .then(res => setPackages(res.data || []))
//       .catch(() => setPackages([{ _id: "1", name: "Standard Wash" }]));
//   }, []);

//   function handleChange(e) {
//     const { name, value } = e.target;
//     setForm(prev => ({ ...prev, [name]: value }));
//   }

//   function handleSubmit(e) {
//     e.preventDefault();
//     navigate("/appointments/payment", { state: { form } });
//   }

//   return (
//     <div className="max-w-3xl mx-auto mt-8 p-6 shadow-lg rounded-2xl">
//       <h2 className="text-2xl font-semibold mb-4">Book an Appointment</h2>
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <input name="customerName" placeholder="Customer Name" value={form.customerName} onChange={handleChange} className="w-full border rounded px-3 py-2"/>
//         <input name="vehicle" placeholder="Vehicle" value={form.vehicle} onChange={handleChange} className="w-full border rounded px-3 py-2"/>
//         <select name="packageId" value={form.packageId} onChange={handleChange} className="w-full border rounded px-3 py-2">
//           <option value="">Select Package</option>
//           {packages.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
//         </select>
//         <input type="datetime-local" name="preferredTime" value={form.preferredTime} onChange={handleChange} className="w-full border rounded px-3 py-2"/>
//         <button type="submit" className="bg-primary text-white px-4 py-2 rounded">Proceed to Payment</button>
//       </form>
//     </div>
//   );
// }
