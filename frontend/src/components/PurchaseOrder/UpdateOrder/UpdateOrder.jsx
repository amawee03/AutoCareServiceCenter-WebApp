import React, { useEffect, useState } from "react";
import apiClient from '../../../api/axios';
import { useParams, useNavigate, Link } from "react-router-dom";
import "./UpdateOrder.css";

const UpdateOrder = () => {
  const [inputs, setInputs] = useState({
    supplierName: "",
    productName: "",
    unitPrice: "",
    quantityOrdered: "",
    orderDate: "",
    status: "",
    TotalAmount: 0, 
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [errors, setErrors] = useState({});
  const [originalData, setOriginalData] = useState({});

  const navigate = useNavigate();
  const { id } = useParams();

  // Auto-calculate TotalAmount
  useEffect(() => {
    const unitPrice = parseFloat(inputs.unitPrice) || 0;
    const quantity = parseInt(inputs.quantityOrdered) || 0;
    setInputs(prev => ({
      ...prev,
      TotalAmount: unitPrice * quantity
    }));
  }, [inputs.unitPrice, inputs.quantityOrdered]);

  // Fetch order details
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/orders/${id}`);
        const orderData = res.data.order;
        
        // Format date for input field (yyyy-MM-dd)
        if (orderData.orderDate) {
          const date = new Date(orderData.orderDate);
          orderData.orderDate = date.toISOString().split('T')[0];
        }
        
        setInputs(orderData);
        setOriginalData(orderData);
      } catch (error) {
        console.error("Error fetching order:", error);
        alert("Could not load order details.");
        navigate("/inventory/orders");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id, navigate]);

  const validateInputs = () => {
    const newErrors = {};
    if (!inputs.supplierName?.trim()) newErrors.supplierName = "Supplier name is required";
    if (!inputs.productName?.trim()) newErrors.productName = "Product name is required";
    if (!inputs.unitPrice || parseFloat(inputs.unitPrice) <= 0) newErrors.unitPrice = "Valid unit price is required";
    if (!inputs.quantityOrdered || parseInt(inputs.quantityOrdered) <= 0) newErrors.quantityOrdered = "Valid quantity is required";
    if (!inputs.orderDate) newErrors.orderDate = "Order date is required";
    if (!inputs.status) newErrors.status = "Status is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateInputs()) return;

    setUpdating(true);
    try {
      await apiClient.put(`/orders/${id}`, {
        supplierName: inputs.supplierName.trim(),
        productName: inputs.productName.trim(),
        unitPrice: parseFloat(inputs.unitPrice),
        quantityOrdered: parseInt(inputs.quantityOrdered),
        orderDate: inputs.orderDate,
        TotalAmount: inputs.TotalAmount,
        status: inputs.status,
      });
      alert("Order updated successfully!");
      navigate("/inventory/orders");
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Error updating order. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    navigate("/inventory/orders");
  };

  const hasChanges = JSON.stringify(inputs) !== JSON.stringify(originalData);

  if (loading) {
    return (
      <div className="update-container">
        <div className="loading-state">
          <h3>Loading Order...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="update-container">
      <div className="header-section">
        <div className="header-content">
          <h1 className="page-title">Update Purchase Order</h1>
          <p className="page-subtitle">Modify purchase order details</p>
        </div>
        <Link to="/inventory/orders" className="back-button">← Back to Orders</Link>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit} className="update-form">
          {/* Order Information Section */}
          <div className="form-section">
            <h3 className="section-title">Order Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label required">Supplier Name</label>
                <input
                  name="supplierName"
                  value={inputs.supplierName || ""}
                  onChange={handleChange}
                  className={`form-input ${errors.supplierName ? "error" : ""}`}
                />
                {errors.supplierName && <span className="error-message">Supplier name is required</span>}
              </div>

              <div className="form-group">
                <label className="form-label required">Product Name</label>
                <input
                  name="productName"
                  value={inputs.productName || ""}
                  onChange={handleChange}
                  className={`form-input ${errors.productName ? "error" : ""}`}
                />
                {errors.productName && <span className="error-message">{errors.productName}</span>}
              </div>

              <div className="form-group">
                <label className="form-label required">Unit Price</label>
                <input
                  type="number"
                  step="0.01"
                  name="unitPrice"
                  value={inputs.unitPrice || ""}
                  onChange={handleChange}
                  className={`form-input ${errors.unitPrice ? "error" : ""}`}
                />
                {errors.unitPrice && <span className="error-message">{errors.unitPrice}</span>}
              </div>

              <div className="form-group">
                <label className="form-label required">Quantity Ordered</label>
                <input
                  type="number"
                  name="quantityOrdered"
                  value={inputs.quantityOrdered || ""}
                  onChange={handleChange}
                  className={`form-input ${errors.quantityOrdered ? "error" : ""}`}
                />
                {errors.quantityOrdered && <span className="error-message">{errors.quantityOrdered}</span>}
              </div>

              {/* Readonly Total Amount */}
              <div className="form-group">
                <label className="form-label">Total Amount</label>
                <input
                  type="text"
                  value={`Rs. ${inputs.TotalAmount || 0}`}
                  readOnly
                  className="form-input readonly-field"
                />
              </div>
            </div>
          </div>

          {/* Order Details Section */}
          <div className="form-section">
            <h3 className="section-title">Order Details</h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label required">Order Date</label>
                <input
                  type="date"
                  name="orderDate"
                  value={inputs.orderDate || ""}
                  onChange={handleChange}
                  className={`form-input ${errors.orderDate ? "error" : ""}`}
                />
                {errors.orderDate && <span className="error-message">{errors.orderDate}</span>}
              </div>
              <div className="form-group">
                <label className="form-label required">Order Status</label>
                <select
                  name="status"
                  value={inputs.status || ""}
                  onChange={handleChange}
                  className={`form-select ${errors.status ? "error" : ""}`}
                >
                  <option value="">Select Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancel">Cancel</option>
                </select>
                {errors.status && <span className="error-message">{errors.status}</span>}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button type="button" onClick={handleCancel} className="cancel-button" disabled={updating}>Cancel</button>
            <button type="submit" className="update-button" disabled={updating || !hasChanges}>
              {updating ? "Updating..." : "Update Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateOrder;
