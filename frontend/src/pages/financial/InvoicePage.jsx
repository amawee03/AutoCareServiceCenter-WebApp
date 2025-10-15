import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function InvoicePage() {
  const [customerName, setCustomerName] = useState("");
  const [service, setService] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState(null);
  const [notes, setNotes] = useState("");
  const [image, setImage] = useState(null);

  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate customer name - no numbers allowed
    if (/\d/.test(customerName)) {
      alert("Customer name cannot contain numbers");
      return;
    }

    if (amount <= 0) {
      alert("Amount must be greater than 0");
      return;
    }

    // Validate amount - cannot exceed 8 digits
    const amountDigits = amount.replace(/\D/g, '');
    if (amountDigits.length > 8) {
      alert("Amount cannot exceed 8 digits");
      return;
    }

    if (service === "other" && !notes.trim()) {
      alert("Please provide a description in Notes when 'Other' is selected.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", customerName);
      formData.append("category", service);
      formData.append("amount", amount);
      formData.append("dateReceived", dueDate);
      formData.append("description", notes);
      if (image) {
        formData.append("image", image);
      }

      const response = await fetch("http://localhost:5001/api/finance-income", {
        method: "POST",
        body: formData,
        credentials: 'include', // Send cookies for authentication
      });

      if (!response.ok) {
        throw new Error("Failed to save invoice");
      }

      const result = await response.json();
      console.log("Invoice saved:", result);
      alert("Invoice logged successfully!");

      // Reset form
      setCustomerName("");
      setService("");
      setAmount("");
      setDueDate(null);
      setNotes("");
      setImage(null);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to save invoice. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Log New Invoice</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Customer Name
          </label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-red-500 focus:ring-red-500 text-gray-900"
            placeholder="Enter customer name"
            required
          />
        </div>

        {/* Service Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Service
          </label>
          <select
            value={service}
            onChange={(e) => setService(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-red-500 focus:ring-red-500 text-gray-900"
            required
          >
            <option value="" disabled>
              Select a service
            </option>
            <option value="service-payment">Service Payment</option>
            <option value="inventory-payment">Inventory Payment</option>
            <option value="service-parts-sales">Service Parts Sales</option>
            <option value="washing-detailing-service">
              Washing / Detailing Service Payment
            </option>
            <option value="vehicle-diagnosis">Vehicle Diagnosis</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="1"
            step="0.01"
            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-red-500 focus:ring-red-500 text-gray-900"
            placeholder="Enter amount"
            required
          />
        </div>

        {/* Invoice Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Invoice Date
          </label>
          <DatePicker
            selected={dueDate}
            onChange={(date) => setDueDate(date)}
            maxDate={new Date()} // only today and past dates
            dateFormat="yyyy-MM-dd"
            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-red-500 focus:ring-red-500 text-gray-900"
            placeholderText="Select invoice date"
            required
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes {service === "other" && <span className="text-red-500">*</span>}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows="3"
            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-red-500 focus:ring-red-500 text-gray-900"
            placeholder={
              service === "other"
                ? "Please describe the service"
                : "Enter any notes"
            }
            required={service === "other"} // only required if "Other" is selected
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Attach Invoice Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="block w-full text-sm text-gray-700 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border file:border-gray-300 file:bg-red-50 file:text-red-600 hover:file:bg-red-100"
          />
          {image && (
            <p className="text-sm text-gray-600 mt-2">
              Selected: {image.name}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Invoice"}
          </button>
        </div>
      </form>
    </div>
  );
}