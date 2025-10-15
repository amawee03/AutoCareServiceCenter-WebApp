import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../../../api/axios';
import './AddSupplier.css';

const AddSupplier = () => {
    const navigate = useNavigate();
    const [inputs, setInputs] = useState({
        supplierName: "",
        email: "",
        phone: "",
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Input validation
    const validateInputs = () => {
        const newErrors = {};
        
        if (!inputs.supplierName.trim()) {
            newErrors.supplierName = "Supplier name is required";
        } else if (inputs.supplierName.trim().length < 2) {
            newErrors.supplierName = "Supplier name must be at least 2 characters";
        }
        
        if (!inputs.email.trim()) {
            newErrors.email = "Email is required";
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(inputs.email)) {
                newErrors.email = "Please enter a valid email address";
            }
        }
        
        if (!inputs.phone.trim()) {
            newErrors.phone = "Phone number is required";
        } else {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            if (!phoneRegex.test(inputs.phone.replace(/[-\s()]/g, ''))) {
                newErrors.phone = "Please enter a valid phone number";
            }
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        setInputs((prevState) => ({
            ...prevState,
            [name]: value,
        }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    const sendRequest = async () => {
        const payload = {
            supplierName: String(inputs.supplierName).trim(),
            email: String(inputs.email).trim().toLowerCase(),
            phone: String(inputs.phone).trim(),
        };

        console.log("📤 Sending supplier payload:", payload);

        try {
            const response = await apiClient.post("/suppliers", payload, {
                timeout: 10000,
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateInputs()) {
            return;
        }
        
        setLoading(true);
        
        try {
            console.log("Submitting supplier:", inputs);
            await sendRequest();
            alert("Supplier added successfully!");
            navigate('/inventory/supplier');
        } catch (error) {
            console.error("🚨 Full error object:", error);

            if (error.response) {
                // Server responded with a status code (4xx, 5xx)
                console.error("📡 Response data:", error.response.data);
                console.error("🔢 Status code:", error.response.status);
                console.error("📎 Headers:", error.response.headers);

                const status = error.response.status;
                const message = error.response.data?.message || "Unknown server error";

                if (status === 400) {
                    alert("Validation error: " + message);
                } else if (status === 409) {
                    alert("Supplier or Email already exists. Please use different values.");
                } else if (status === 500) {
                    alert("Server error: Please try again later or contact support.");
                } else if (status === 401 || status === 403) {
                    alert("Authentication required. Please log in again.");
                } else {
                    alert(`Server error (${status}): ${message}`);
                }

            } else if (error.request) {
                // Request was made but no response received (network/CORS/server down)
                console.error("🔌 No response received. Request object:", error.request);
                alert("Network error: Unable to reach server. Check your connection or try again later.");

            } else {
                // Something wrong in setting up the request
                console.error("⚙️ Error setting up request:", error.message);
                alert("Unexpected error: " + error.message);
            }

        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setInputs({
            supplierName: "",
            email: "",
            phone: "",
        });
        setErrors({});
    };

    // Format phone number for display
    const formatPhoneNumber = (phone) => {
        const cleaned = phone.replace(/\D/g, '');
        const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
        if (match) {
            return `(${match[1]}) ${match[2]}-${match[3]}`;
        }
        return phone;
    };

    return (
        <div className="add-supplier-container">
            <div className="header-section">
                <div className="header-content">
                    <h1 className="page-title">Add New Supplier</h1>
                    <p className="page-subtitle">Create a new supplier entry for your system</p>
                </div>
                <Link to="/inventory/supplier" className="back-button">
                    Back to Suppliers
                </Link>
            </div>

            <div className="form-container">
                <form onSubmit={handleSubmit} className="supplier-form">
                    
                    {/* Supplier Information Section */}
                    <div className="form-section">
                        <h3 className="section-title">Supplier Information</h3>
                        <div className="form-grid-single">
                            <div className="form-group">
                                <label htmlFor="supplierName" className="form-label required">Supplier Name</label>
                                <input 
                                    type="text" 
                                    id="supplierName"
                                    name="supplierName" 
                                    onChange={handleChange} 
                                    value={inputs.supplierName}
                                    placeholder="Enter supplier company name"
                                    className={`form-input ${errors.supplierName ? 'error' : ''}`}
                                    required
                                />
                                {errors.supplierName && <span className="error-message">{errors.supplierName}</span>}
                                <div className="field-hint">
                                    Official company or business name of the supplier
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Information Section */}
                    <div className="form-section">
                        <h3 className="section-title">Contact Information</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="email" className="form-label required">Email Address</label>
                                <input 
                                    type="email" 
                                    id="email"
                                    name="email" 
                                    onChange={handleChange} 
                                    value={inputs.email}
                                    placeholder="supplier@company.com"
                                    className={`form-input ${errors.email ? 'error' : ''}`}
                                    required
                                />
                                {errors.email && <span className="error-message">{errors.email}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="phone" className="form-label required">Phone Number</label>
                                <input 
                                    type="tel" 
                                    id="phone"
                                    name="phone" 
                                    onChange={handleChange} 
                                    value={inputs.phone}
                                    placeholder="+1234567890"
                                    className={`form-input ${errors.phone ? 'error' : ''}`}
                                    required
                                />
                                {errors.phone && <span className="error-message">{errors.phone}</span>}
                                <div className="field-hint">
                                    Include country code for international numbers
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Preview Section */}
                    {inputs.supplierName && (
                        <div className="form-section preview-section">
                            <h3 className="section-title">Supplier Preview</h3>
                            <div className="preview-card">
                                <div className="preview-header">
                                    <h4 className="preview-name">{inputs.supplierName}</h4>
                                    <span className="preview-id">ID: Auto-generated</span>
                                </div>
                                <div className="preview-details">
                                    <div className="preview-item">
                                        <span className="preview-label">Email:</span>
                                        <span className="preview-value">{inputs.email || 'Not specified'}</span>
                                    </div>
                                    <div className="preview-item">
                                        <span className="preview-label">Phone:</span>
                                        <span className="preview-value">
                                            {inputs.phone ? formatPhoneNumber(inputs.phone) : 'Not specified'}
                                        </span>
                                    </div>
                                    <div className="preview-item full-width">
                                        <span className="preview-label">Status:</span>
                                        <span className="preview-status active">Active</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="form-actions">
                        <button 
                            type="button" 
                            onClick={handleReset} 
                            className="reset-button" 
                            disabled={loading}
                        >
                            Reset Form
                        </button>
                        <button 
                            type="submit" 
                            className="submit-button" 
                            disabled={loading}
                        >
                            {loading ? "Adding Supplier..." : "Add Supplier"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddSupplier;