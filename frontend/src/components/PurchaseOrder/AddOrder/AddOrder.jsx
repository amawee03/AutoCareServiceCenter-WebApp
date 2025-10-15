// src/components/AddOrder/AddOrder.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../../../api/axios';
import './AddOrder.css';

const AddOrder = () => {
    const navigate = useNavigate();
    const [inputs, setInputs] = useState({
        supplierName: "",
        productName: "",
        unitPrice: "",
        quantityOrdered: "",
        orderDate: "",
        TotalAmount: 0,  
        status: "Pending",
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    //  Auto-calculate TotalAmount whenever unitPrice or quantity changes
    useEffect(() => {
        const unitPrice = parseFloat(inputs.unitPrice) || 0;
        const quantity = parseInt(inputs.quantityOrdered) || 0;
        setInputs(prev => ({
            ...prev,
            TotalAmount: unitPrice * quantity
        }));
    }, [inputs.unitPrice, inputs.quantityOrdered]);

    // Input validation
    const validateInputs = () => {
        const newErrors = {};

        if (!inputs.supplierName.trim()) newErrors.supplierName = "Supplier name is required";
        if (!inputs.productName.trim()) newErrors.productName = "Product name is required";
        if (!inputs.unitPrice || parseFloat(inputs.unitPrice) <= 0) newErrors.unitPrice = "Valid unit price is required";
        if (!inputs.quantityOrdered || parseInt(inputs.quantityOrdered) <= 0) newErrors.quantityOrdered = "Valid quantity is required";
        if (!inputs.orderDate) {
            newErrors.orderDate = "Order date is required";
        } else {
            const selectedDate = new Date(inputs.orderDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate < today) newErrors.orderDate = "Order date cannot be in the past";
        }
        if (!inputs.status) newErrors.status = "Please select a status";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInputs(prevState => ({ ...prevState, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateInputs()) return;
        
        setLoading(true);
        try {
            await sendRequest();
            alert("Purchase order added successfully!");
            navigate('/inventory/orders');
        } catch (error) {
            console.error("Error adding order:", error);
            alert("Error adding purchase order. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const sendRequest = async () => {
        const response = await apiClient.post("/orders", {
            supplierName: inputs.supplierName.trim(),
            productName: inputs.productName.trim(),
            unitPrice: parseFloat(inputs.unitPrice),
            quantityOrdered: parseInt(inputs.quantityOrdered),
            orderDate: inputs.orderDate,
            TotalAmount: inputs.TotalAmount,
            status: inputs.status,
        });
        return response.data;
    };

    const handleReset = () => {
        setInputs({
            supplierName: "",
            productName: "",
            unitPrice: "",
            quantityOrdered: "",
            orderDate: "",
            TotalAmount: 0,
            status: "Pending",
        });
        setErrors({});
    };

    const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    return (
        <div className="add-order-container">
            <div className="header-section">
                <div className="header-content">
                    <h1 className="page-title">Add New Purchase Order</h1>
                    <p className="page-subtitle">Create a new purchase order for your suppliers</p>
                </div>
                <Link to="/inventory/orders" className="back-button">Back to Orders</Link>
            </div>

            <div className="form-container">
                <form onSubmit={handleSubmit} className="order-form">
                    {/* Order Information Section */}
                    <div className="form-section">
                        <h3 className="section-title">Order Information</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="supplierName" className="form-label required">Supplier Name</label>
                                <input 
                                    type="text" id="supplierName" name="supplierName"
                                    onChange={handleChange} value={inputs.supplierName}
                                    placeholder="Enter supplier name"
                                    className={`form-input ${errors.supplierName ? 'error' : ''}`} required
                                />
                                {errors.supplierName && <span className="error-message">{errors.supplierName}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="productName" className="form-label required">Product Name</label>
                                <input 
                                    type="text" id="productName" name="productName"
                                    onChange={handleChange} value={inputs.productName}
                                    placeholder="Enter product name"
                                    className={`form-input ${errors.productName ? 'error' : ''}`} required
                                />
                                {errors.productName && <span className="error-message">{errors.productName}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="unitPrice" className="form-label required">Unit Price</label>
                                <input 
                                    type="number" id="unitPrice" name="unitPrice"
                                    onChange={handleChange} value={inputs.unitPrice}
                                    placeholder="Enter unit price" min="1"
                                    className={`form-input ${errors.unitPrice ? 'error' : ''}`} required
                                />
                                {errors.unitPrice && <span className="error-message">{errors.unitPrice}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="quantityOrdered" className="form-label required">Quantity Ordered</label>
                                <input 
                                    type="number" id="quantityOrdered" name="quantityOrdered"
                                    onChange={handleChange} value={inputs.quantityOrdered}
                                    placeholder="Enter quantity" min="1"
                                    className={`form-input ${errors.quantityOrdered ? 'error' : ''}`} required
                                />
                                {errors.quantityOrdered && <span className="error-message">{errors.quantityOrdered}</span>}
                            </div>
                        </div>
                    </div>

                    {/* Date and Status Section */}
                    <div className="form-section">
                        <h3 className="section-title">Order Details</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="orderDate" className="form-label required">Order Date</label>
                                <input 
                                    type="date" id="orderDate" name="orderDate"
                                    onChange={handleChange} value={inputs.orderDate}
                                    min={getTodayDate()}
                                    className={`form-input ${errors.orderDate ? 'error' : ''}`} required
                                />
                                {errors.orderDate && <span className="error-message">{errors.orderDate}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="status" className="form-label required">Order Status</label>
                                <select 
                                    id="status" name="status" onChange={handleChange} value={inputs.status}
                                    className={`form-select ${errors.status ? 'error' : ''}`} required
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Cancel">Cancel</option>
                                </select>
                                {errors.status && <span className="error-message">{errors.status}</span>}
                            </div>
                        </div>
                    </div>

                    {/* ✅ Total Amount Display */}
                    <div className="form-section">
                        <h3 className="section-title">Total Amount</h3>
                        <div className="preview-card">
                            <h4 className="preview-name">Total Price: LKR{inputs.TotalAmount.toFixed(2)}</h4>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={handleReset} className="reset-button" disabled={loading}>Reset Form</button>
                        <button type="submit" className="submit-button" disabled={loading}>
                            {loading ? "Creating Order..." : "Create Purchase Order"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddOrder;
