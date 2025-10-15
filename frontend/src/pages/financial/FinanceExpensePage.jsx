import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function FinanceExpensePage() {
  const [expenseName, setExpenseName] = useState("");
  const [dateSpent, setDateSpent] = useState(null);
  const [amount, setAmount] = useState("");
  const [modeOfPayment, setModeOfPayment] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const categories = [
    "inventory",
    "salary",
    "utility bills",
    "equipment maintenance",
    "administration costs",
    "rent",
    "sundry",
    "staff amenities",
    "other",
  ];

  const paymentModes = ["cash", "card", "bank-transfer", "other"];

  const handleAmountChange = (e) => {
    const value = e.target.value;
    const regex = /^\d{0,10}(\.\d{0,2})?$/;
    if (regex.test(value)) setAmount(value);
  };

  const handleImageUpload = (e) => setImage(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!expenseName || !dateSpent || !amount || !category || !modeOfPayment) {
      alert("Please fill all required fields.");
      return;
    }

   
    if (/\d/.test(expenseName)) {
      alert("Expense name cannot contain numbers");
      return;
    }

    if (Number(amount) <= 0) {
      alert("Amount must be greater than 0.");
      return;
    }

    if (category === "other" && !description.trim()) {
      alert("Description is required for 'Other' category.");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", expenseName);
      formData.append("dateSpent", dateSpent.toISOString());
      formData.append("amount", Number(amount));
      formData.append("category", category);
      formData.append("modeOfPayment", modeOfPayment.toLowerCase());
      formData.append("description", description);
      if (image) formData.append("image", image);

      const response = await fetch("http://localhost:5001/api/finance-expenses", {
        method: "POST",
        body: formData,
        credentials: 'include', 
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to save expense");
      }

      const result = await response.json();
      alert("Expense logged successfully!");

      // Reset form
      setExpenseName("");
      setDateSpent(null);
      setAmount("");
      setModeOfPayment("");
      setCategory("");
      setDescription("");
      setImage(null);
    } catch (error) {
      console.error("Error:", error);
      alert(error.message || "Failed to save expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Log New Expense</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Expense Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Expense Name</label>
          <input
            type="text"
            value={expenseName}
            onChange={(e) => setExpenseName(e.target.value)}
            placeholder="Enter expense name"
            required
            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-red-500 focus:ring-red-500 text-gray-900"
          />
        </div>
        

        {/* Expense Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Expense Date</label>
          <DatePicker
            selected={dateSpent}
            onChange={(date) => setDateSpent(date)}
            maxDate={new Date()}
            dateFormat="yyyy-MM-dd"
            placeholderText="Select expense date"
            required
            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-red-500 focus:ring-red-500 text-gray-900"
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
          <input
            type="text"
            value={amount}
            onChange={handleAmountChange}
            placeholder="Enter amount (e.g., 1200.50)"
            required
            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-red-500 focus:ring-red-500 text-gray-900"
          />
        </div>

        {/* Mode of Payment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mode of Payment</label>
          <select
            value={modeOfPayment}
            onChange={(e) => setModeOfPayment(e.target.value)}
            required
            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-red-500 focus:ring-red-500 text-gray-900"
          >
            <option value="" disabled>Select payment mode</option>
            {paymentModes.map((mode) => (
              <option key={mode} value={mode}>{mode}</option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-red-500 focus:ring-red-500 text-gray-900"
          >
            <option value="" disabled>Select category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description {category === "other" && <span className="text-red-500">*</span>}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter description"
            required={category === "other"}
            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-red-500 focus:ring-red-500 text-gray-900"
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Attach Receipt Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="block w-full text-sm text-gray-700 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border file:border-gray-300 file:bg-red-50 file:text-red-600 hover:file:bg-red-100"
          />
          {image && <p className="text-sm text-gray-600 mt-2">Selected: {image.name}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Expense"}
        </button>
      </form>
    </div>
  );
}