// frontend/src/pages/financial/ReportsPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import apiClient from '../../api/axios';
import { DatePicker } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import jsPDF from "jspdf";


const COMPANY_INFO = {
  name: "AUTO CARE SERVICE CENTER", 
  address: "12 Kaduwela Road, Colombo", 
  city: "Colombo, Sri Lanka", 
  phone: "+94 703412566", 
  email: "autocare.services.lk@gmail.com", 
  logoPath: "/images/logo.jpg" 
};

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("income");
  const [incomeData, setIncomeData] = useState([]);
  const [expensesData, setExpensesData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter UI state
  const [filterType, setFilterType] = useState("all");
  const [globalSearch, setGlobalSearch] = useState("");
  const [nameSearch, setNameSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);

  // Edit modal state
  const [editingRecord, setEditingRecord] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    category: "",
    amount: "",
    mode: "",
    modeOfPayment: "", 
    description: "",
    dateReceived: "", 
    dateSpent: "", 
    image: null,
    imagePreview: ""
  });

  
  const incomeCategories = [
    "service-payment",
    "inventory-payment", 
    "service-parts-sales",
    "washing-detailing-service",
    "vehicle-diagnosis",
    "other"
  ]; 

  const expenseCategories = [
    "inventory",
    "salary", 
    "utility bills",
    "equipment maintenance",
    "administration costs",
    "rent",
    "sundry",
    "staff amenities",
    "other"
  ];

  const incomeModes = ["cash", "card", "bankTransfer", "other"];
  const expenseModes = ["cash", "card", "bank-transfer", "other"];

  // Fetch data for both income & expenses
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [incomeRes, expensesRes] = await Promise.all([
          apiClient.get("/api/finance-income"),
          apiClient.get("/api/finance-expenses"),
        ]);
        setIncomeData(incomeRes.data || []);
        setExpensesData(expensesRes.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Derived list of categories for dropdown
  const categories = useMemo(() => {
    const set = new Set();
    const source = activeTab === "income" ? incomeData : expensesData;
    source.forEach((i) => {
      if (i.category) set.add(i.category);
    });
    return Array.from(set);
  }, [activeTab, incomeData, expensesData]);

  // Apply filters
  const filteredData = useMemo(() => {
    const source = activeTab === "income" ? incomeData : expensesData;
    if (!source) return [];

    const lowerGlobal = globalSearch.trim().toLowerCase();

    return source.filter((item) => {
      const name = (item.name || "").toLowerCase();
      const cat = (item.category || "").toLowerCase();
      const desc = (item.description || "").toLowerCase();
      const amount = Number(item.amount || 0);
      const itemDate = item.dateReceived || item.dateSpent ? new Date(item.dateReceived || item.dateSpent) : null;

      if (filterType === "all") {
        if (!lowerGlobal) return true;
        return (
          name.includes(lowerGlobal) ||
          cat.includes(lowerGlobal) ||
          desc.includes(lowerGlobal) ||
          String(amount).includes(lowerGlobal)
        );
      }

      if (filterType === "name") {
        return name.includes(nameSearch.trim().toLowerCase());
      }

      if (filterType === "category") {
        if (!categorySearch) return true;
        return cat === categorySearch.toLowerCase();
      }

      if (filterType === "amount") {
        const min = minAmount === "" ? -Infinity : Number(minAmount);
        const max = maxAmount === "" ? Infinity : Number(maxAmount);
        if (Number.isNaN(min) || Number.isNaN(max)) return false;
        return amount >= min && amount <= max;
      }

      if (filterType === "date") {
        if (!dateFrom && !dateTo) return true;
        if (!itemDate) return false;
        const start = dateFrom ? new Date(dateFrom).setHours(0, 0, 0, 0) : -Infinity;
        const end = dateTo ? new Date(dateTo).setHours(23, 59, 59, 999) : Infinity;
        const d = itemDate.getTime();
        return d >= start && d <= end;
      }

      return true;
    });
  }, [
    activeTab,
    incomeData,
    expensesData,
    filterType,
    globalSearch,
    nameSearch,
    categorySearch,
    minAmount,
    maxAmount,
    dateFrom,
    dateTo,
  ]);

  // Delete record
  const handleDelete = async (id, type) => {
    const deletePin = prompt("Enter PIN for deletion:");
    if (!deletePin) return;

    const deleteReason = prompt("Enter reason to confirm deletion:");
    if (!deleteReason) return;

    try {
      const url =
        type === "income"
          ? `/api/finance-income/${id}`
          : `/api/finance-expenses/${id}`;

      const res = await apiClient.delete(url, { data: { deleteReason, deletePin } });
      alert(res.data.message);

      if (type === "income") {
        setIncomeData((prev) => prev.filter((i) => i._id !== id));
      } else {
        setExpensesData((prev) => prev.filter((i) => i._id !== id));
      }
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Deletion failed. Check console.");
    }
  };

  // Open edit modal
  const handleEdit = (record) => {
    setEditingRecord(record);
    const recordDate = record.dateReceived || record.dateSpent;
    setEditForm({
      name: record.name || "",
      category: record.category || "",
      amount: record.amount || "",
      mode: record.mode || "", // for income
      modeOfPayment: record.modeOfPayment || "", // for expenses
      description: record.description || "",
      dateReceived: activeTab === "income" ? (recordDate ? new Date(recordDate).toISOString().split('T')[0] : "") : "",
      dateSpent: activeTab === "expenses" ? (recordDate ? new Date(recordDate).toISOString().split('T')[0] : "") : "",
      image: null,
      imagePreview: record.image || ""
    });
  };

  // Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditForm(prev => ({
        ...prev,
        image: file
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditForm(prev => ({
          ...prev,
          imagePreview: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Save edit
  const handleSaveEdit = async () => {
    try {
      const url =
        activeTab === "income"
          ? `/api/finance-income/${editingRecord._id}`
          : `/api/finance-expenses/${editingRecord._id}`;

      // Prepare form data for potential image upload
      const formData = new FormData();
      formData.append('name', editForm.name);
      formData.append('category', editForm.category);
      formData.append('amount', editForm.amount);
      formData.append('description', editForm.description);
      
      // Add mode field based on tab
      if (activeTab === "income") {
        formData.append('mode', editForm.mode);
      } else {
        formData.append('modeOfPayment', editForm.modeOfPayment);
      }
      
      // Add appropriate date field
      if (activeTab === "income" && editForm.dateReceived) {
        formData.append('dateReceived', editForm.dateReceived);
      }
      if (activeTab === "expenses" && editForm.dateSpent) {
        formData.append('dateSpent', editForm.dateSpent);
      }
      
      // Add image if selected
      if (editForm.image) {
        formData.append('image', editForm.image);
      }

      const res = await apiClient.put(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (activeTab === "income") {
        setIncomeData((prev) =>
          prev.map((i) => (i._id === editingRecord._id ? { ...i, ...res.data } : i))
        );
      } else {
        setExpensesData((prev) =>
          prev.map((i) => (i._id === editingRecord._id ? res.data : i))
        );
      }

      setEditingRecord(null);
      alert("Updated successfully.");
    } catch (err) {
      console.error("Update failed:", err);
      alert("Update failed. Check console.");
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setFilterType("all");
    setGlobalSearch("");
    setNameSearch("");
    setCategorySearch("");
    setMinAmount("");
    setMaxAmount("");
    setDateFrom(null);
    setDateTo(null);
  };

  // Normalize display date
  const getDisplayDate = (record) => {
    const date = record.dateReceived || record.dateSpent;
    return date ? new Date(date).toLocaleDateString() : "-";
  };

  // Get display mode based on tab
  const getDisplayMode = (record) => {
    return record.mode || record.modeOfPayment || "-";
  };

  // Calculate totals
  const totalIncome = useMemo(() => {
    return incomeData.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }, [incomeData]);

  const totalExpenses = useMemo(() => {
    return expensesData.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }, [expensesData]);

  const filteredTotal = useMemo(() => {
    return filteredData.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }, [filteredData]);

  const netProfit = totalIncome - totalExpenses;

  // Generate invoice PDF
  const generateInvoicePDF = async (record) => {
    try {
      const doc = new jsPDF();
      
      // Add logo
      try {
        const logoImg = new Image();
        logoImg.crossOrigin = 'anonymous';
        logoImg.onload = function() {
          // Company Header
          doc.addImage(logoImg, 'JPEG', 20, 20, 40, 20);
          generatePDFContent(doc, record);
        };
        logoImg.onerror = function() {
          // If logo fails to load, continue without it
          generatePDFContent(doc, record);
        };
        logoImg.src = COMPANY_INFO.logoPath;
      } catch (error) {
        // If logo loading fails, continue without logo
        generatePDFContent(doc, record);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate invoice PDF');
    }
  };

  const generatePDFContent = (doc, record) => {
    // Generate invoice number (you can customize this logic)
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    const invoiceDate = new Date().toLocaleDateString();
    const serviceDate = new Date(record.dateReceived).toLocaleDateString();

    // Company Info (right side of header)
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text(COMPANY_INFO.name, 120, 30);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(COMPANY_INFO.address, 120, 38);
    doc.text(COMPANY_INFO.city, 120, 44);
    doc.text(`Phone: ${COMPANY_INFO.phone}`, 120, 50);
    doc.text(`Email: ${COMPANY_INFO.email}`, 120, 56);

    // Invoice Title
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('INVOICE', 20, 80);

    // Invoice Details
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`Invoice Number: ${invoiceNumber}`, 20, 95);
    doc.text(`Invoice Date: ${invoiceDate}`, 20, 105);
    doc.text(`Service Date: ${serviceDate}`, 20, 115);

    // Bill To Section
    doc.setFont(undefined, 'bold');
    doc.text('BILL TO:', 20, 135);
    doc.setFont(undefined, 'normal');
    doc.text(record.name, 20, 145);

    // Service Details Table Header
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    
    // Table background
    doc.setFillColor(240, 240, 240);
    doc.rect(20, 165, 170, 10, 'F');
    
    doc.text('Description', 25, 172);
    doc.text('Category', 90, 172);
    doc.text('Amount (LKR)', 150, 172);

    // Table content
    doc.setFont(undefined, 'normal');
    doc.text(record.description || record.category || 'Service Provided', 25, 185);
    doc.text(record.category || '-', 90, 185);
    doc.text(Number(record.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 }), 150, 185);

    // Total Section
    doc.line(130, 200, 190, 200); // Line above total
    doc.setFont(undefined, 'bold');
    doc.setFontSize(12);
    doc.text('TOTAL: LKR ' + Number(record.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 }), 130, 215);

    // Payment Details
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('Payment Method: ' + (record.mode || 'Not specified'), 20, 240);

    // Footer
    doc.setFontSize(9);
    doc.text('Thank you for your business!', 20, 270);
    doc.text('This is a computer-generated invoice.', 20, 278);

    // Save the PDF
    doc.save(`Invoice-${invoiceNumber}.pdf`);
  };

  return (
    <div className="max-w-6xl mx-auto bg-white p-8 rounded-2xl shadow">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Financial Reports</h2>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "income" ? "text-red-600 border-b-2 border-red-600" : "text-gray-500"
          }`}
          onClick={() => setActiveTab("income")}
        >
          Income
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "expenses" ? "text-red-600 border-b-2 border-red-600" : "text-gray-500"
          }`}
          onClick={() => setActiveTab("expenses")}
        >
          Expenses
        </button>
      </div>

      {/* Financial Summary Cards */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Income Card */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 mb-1">Total Income</p>
              <p className="text-2xl font-bold text-green-800">
                LKR {totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-3 bg-green-200 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Expenses Card */}
        <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600 mb-1">Total Expenses</p>
              <p className="text-2xl font-bold text-red-800">
                LKR {totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-3 bg-red-200 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </div>
          </div>
        </div>

        {/* Net Profit Card */}
        <div className={`bg-gradient-to-r ${
          netProfit >= 0 ? 'from-blue-50 to-blue-100 border-blue-200' : 'from-orange-50 to-orange-100 border-orange-200'
        } border rounded-xl p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium mb-1 ${
                netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'
              }`}>Net Profit</p>
              <p className={`text-2xl font-bold ${
                netProfit >= 0 ? 'text-blue-800' : 'text-orange-800'
              }`}>
                LKR {netProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${
              netProfit >= 0 ? 'bg-blue-200' : 'bg-orange-200'
            }`}>
              <svg className={`w-6 h-6 ${
                netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                  netProfit >= 0 ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                } />
              </svg>
            </div>
          </div>
        </div>

        {/* Current View Total Card */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                {activeTab === "income" ? "Filtered Income" : "Filtered Expenses"}
              </p>
              <p className="text-2xl font-bold text-gray-800">
                LKR {filteredTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {filteredData.length} record{filteredData.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="p-3 bg-gray-200 rounded-lg">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by</label>
          <div className="flex gap-2 flex-wrap">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 bg-white text-black focus:ring-red-500 focus:border-red-500"
            >
              <option value="all">All (global)</option>
              <option value="name">Name</option>
              <option value="category">Category / Type</option>
              <option value="amount">Amount range</option>
              <option value="date">Date range</option>
            </select>

            {filterType === "all" && (
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Search name, category, notes or amount..."
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 bg-white text-black placeholder-gray-400 focus:ring-red-500 focus:border-red-500"
              />
            )}

            {filterType === "name" && (
              <input
                type="text"
                value={nameSearch}
                onChange={(e) => setNameSearch(e.target.value)}
                placeholder="Search by name/vendor..."
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 bg-white text-black placeholder-gray-400 focus:ring-red-500 focus:border-red-500"
              />
            )}

            {filterType === "category" && (
              <select
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 bg-white text-black focus:ring-red-500 focus:border-red-500"
              >
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}

            {filterType === "amount" && (
              <>
                <input
                  type="number"
                  min="0"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  placeholder="Min amount"
                  className="w-32 rounded-lg border border-gray-300 px-3 py-2 bg-white text-black placeholder-gray-400 focus:ring-red-500 focus:border-red-500"
                />
                <input
                  type="number"
                  min="0"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  placeholder="Max amount"
                  className="w-32 rounded-lg border border-gray-300 px-3 py-2 bg-white text-black placeholder-gray-400 focus:ring-red-500 focus:border-red-500"
                />
              </>
            )}

            {filterType === "date" && (
              <>
                <DatePicker
                  selected={dateFrom}
                  onChange={(date) => setDateFrom(date)}
                  maxDate={new Date()}
                  placeholderText="From"
                  className="rounded-lg border border-gray-300 px-3 py-2 bg-white text-black focus:ring-red-500 focus:border-red-500"
                />
                <DatePicker
                  selected={dateTo}
                  onChange={(date) => setDateTo(date)}
                  maxDate={new Date()}
                  placeholderText="To"
                  className="rounded-lg border border-gray-300 px-3 py-2 bg-white text-black focus:ring-red-500 focus:border-red-500"
                />
              </>
            )}
          </div>
        </div>

        <div className="flex items-end gap-2">
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Apply
          </button>
          <button
            onClick={clearFilters}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
            <p className="text-gray-600 font-medium">Loading data...</p>
          </div>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.5-.935-6.072-2.456M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No records found</h3>
          <p className="text-gray-500">
            No {activeTab} records match your current filters
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200 min-w-[1000px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name / Vendor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount (LKR)
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mode
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((item, index) => (
                  <tr key={item._id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className={`h-10 w-10 rounded-full ${activeTab === 'income' ? 'bg-green-200' : 'bg-red-200'} flex items-center justify-center`}>
                            <svg className={`h-5 w-5 ${activeTab === 'income' ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={activeTab === 'income' ? "M12 6v6m0 0v6m0-6h6m-6 0H6" : "M20 12H4"} />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {getDisplayDate(item)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.dateReceived || item.dateSpent ? new Date(item.dateReceived || item.dateSpent).toLocaleDateString('en-US', { weekday: 'short' }) : '—'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        {item.category || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className={`text-sm font-bold ${
                        activeTab === "income" ? "text-green-600" : "text-red-600"
                      }`}>
                        LKR {Number(item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getDisplayMode(item) || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="max-w-xs truncate">
                        {item.description || "—"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt="Receipt" 
                          className="w-12 h-12 object-cover rounded-lg cursor-pointer hover:scale-110 transition-transform mx-auto border border-gray-200"
                          onClick={() => window.open(item.image, '_blank')}
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        {activeTab === "income" && (
                          <button
                            onClick={() => generateInvoicePDF(item)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                          >
                            Invoice
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(item)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item._id, activeTab)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Enhanced Edit Modal */}
      {editingRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Edit {activeTab === "income" ? "Income" : "Expense"} Record
            </h3>
            
            <div className="space-y-4">
              {/* Date Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {activeTab === "income" ? "Date Received" : "Date Spent"}
                </label>
                <input
                  type="date"
                  value={activeTab === "income" ? editForm.dateReceived : editForm.dateSpent}
                  onChange={(e) => setEditForm({ 
                    ...editForm, 
                    [activeTab === "income" ? "dateReceived" : "dateSpent"]: e.target.value 
                  })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white text-black focus:ring-red-500 focus:border-red-500"
                />
              </div>

              {/* Name / Vendor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name / Vendor
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Enter name or vendor"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white text-black placeholder-gray-400 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white text-black focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">Select Category</option>
                  {(activeTab === "income" ? incomeCategories : expenseCategories).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (LKR)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editForm.amount}
                  onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                  placeholder="Enter amount"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white text-black placeholder-gray-400 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              {/* Payment Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Mode
                </label>
                <select
                  value={activeTab === "income" ? editForm.mode : editForm.modeOfPayment}
                  onChange={(e) => setEditForm({ 
                    ...editForm, 
                    [activeTab === "income" ? "mode" : "modeOfPayment"]: e.target.value 
                  })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white text-black focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">Select Payment Mode</option>
                  {(activeTab === "income" ? incomeModes : expenseModes).map((mode) => (
                    <option key={mode} value={mode}>
                      {mode === "bankTransfer" ? "Bank Transfer" : 
                       mode === "bank-transfer" ? "Bank Transfer" :
                       mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description/Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description / Notes
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Additional notes or description"
                  rows="3"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white text-black placeholder-gray-400 focus:ring-red-500 focus:border-red-500 resize-vertical"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Receipt / Image
                </label>
                
                {/* Current Image Preview */}
                {editForm.imagePreview && (
                  <div className="mb-3">
                    <img
                      src={editForm.imagePreview}
                      alt="Receipt preview"
                      className="w-full h-32 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => window.open(editForm.imagePreview, '_blank')}
                      title="Click to open image in new tab"
                    />
                  </div>
                )}
                
                {/* File Input */}
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-red-500 hover:bg-red-50 transition-colors"
                  >
                    <div className="text-center">
                      <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="text-sm text-gray-600">
                        {editForm.image ? 'Change Image' : 'Upload New Image'}
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setEditingRecord(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}