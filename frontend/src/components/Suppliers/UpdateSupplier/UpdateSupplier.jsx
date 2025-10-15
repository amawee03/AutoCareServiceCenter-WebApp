// src/components/UpdateSupplier/UpdateSupplier.jsx
import React, { useEffect, useState } from 'react';
import apiClient from '../../../api/axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import "./UpdateSupplier.css";

const UpdateSupplier = () => {
    const [inputs, setInputs] = useState({
        supplierId: "",
        supplierName: "",
        email: "",
        phone: "",
    });

    const [errors, setErrors] = useState({});
    const [originalData, setOriginalData] = useState({});

    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        const fetchHandler = async () => {
            try {
                setLoading(true);
                const res = await apiClient.get(`/suppliers/${id}`);
                console.log("Fetched supplier:", res.data.supplier);
                
                const supplierData = res.data.supplier;
                setInputs(supplierData);
                setOriginalData(supplierData); // Store original data for comparison
            } catch (error) {
                console.error("Error fetching supplier:", error);
                alert("Could not load supplier. Please try again.");
                navigate("/inventory/supplier"); // Redirect if supplier not found
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchHandler();
        } else {
            navigate("/inventory/supplier");
        }
    }, [id, navigate]);

    // Input validation
    const validateInputs = () => {
        const newErrors = {};
        
        if (!inputs.supplierId.trim()) {
            newErrors.supplierId = "Supplier ID is required";
        }
        
        if (!inputs.supplierName.trim()) {
            newErrors.supplierName = "Supplier name is required";
        }
        
        // Email validation 
        if (inputs.email && inputs.email.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(inputs.email.trim())) {
                newErrors.email = "Please enter a valid email address";
            }
        }
        
        // Phone validation 
        if (inputs.phone && inputs.phone.trim()) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            if (!phoneRegex.test(inputs.phone.trim().replace(/[\s\-\(\)]/g, ''))) {
                newErrors.phone = "Please enter a valid phone number";
            }
        }
        
        // At least one contact method should be provided
        if ((!inputs.email || !inputs.email.trim()) && (!inputs.phone || !inputs.phone.trim())) {
            newErrors.email = "Please provide at least email or phone number";
            newErrors.phone = "Please provide at least email or phone number";
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const sendRequest = async () => {
        const payload = {
            supplierId: String(inputs.supplierId).trim(),
            supplierName: String(inputs.supplierName).trim(),
            email: inputs.email ? String(inputs.email).trim() : "",
            phone: inputs.phone ? String(inputs.phone).trim() : "",
        };
        const res = await apiClient.put(`/suppliers/${id}`, payload);
        return res.data;
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateInputs()) {
            return;
        }
        
        setUpdating(true);
        console.log("Submitting updated data:", inputs);
        
        try {
            await sendRequest();
            alert("Supplier updated successfully!");
            navigate("/inventory/supplier");
        } catch (error) {
            console.error("Error updating supplier:", error);
            
            if (error.response && error.response.status === 400) {
                alert("Validation error: " + (error.response.data.message || "Please check your inputs"));
            } else {
                alert("Update failed. Please try again.");
            }
        } finally {
            setUpdating(false);
        }
    };

    const handleCancel = () => {
        navigate("/inventory/supplier");
    };

    const handleReset = () => {
        setInputs(originalData);
        setErrors({});
    };

    // Check for changes
    const hasChanges = JSON.stringify(inputs) !== JSON.stringify(originalData);

    // Get changed fields for display
    const getChangedFields = () => {
        const changes = [];
        Object.keys(inputs).forEach(key => {
            if (inputs[key] !== originalData[key]) {
                changes.push({
                    field: key,
                    oldValue: originalData[key] || 'Not set',
                    newValue: inputs[key] || 'Not set'
                });
            }
        });
        return changes;
    };

    const changedFields = getChangedFields();

    if (loading) {
        return (
            <div className="update-container">
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <h3>Loading Supplier</h3>
                    <p>Please wait while we fetch the supplier details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="update-container">
            {/* Header Section */}
            <div className="header-section">
                <div className="header-content">
                    <h1 className="page-title">Update Supplier</h1>
                    <p className="page-subtitle">Modify supplier information and contact details</p>
                    <div className="supplier-info">
                        <span className="supplier-id-label">Supplier ID:</span>
                        <span className="supplier-id-value">{inputs.supplierId || 'Loading...'}</span>
                        {hasChanges && <span className="changes-indicator">Unsaved Changes</span>}
                    </div>
                </div>
                <div className="header-actions">
                    <Link to="/inventory/supplier" className="back-button">
                        ← Back to Suppliers
                    </Link>
                </div>
            </div>

            {/* Form Container */}
            <div className="form-container">
                <form onSubmit={handleSubmit} className="update-form">
                    {/* Supplier Information Section */}
                    <div className="form-section">
                        <h3 className="section-title">Supplier Information</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="supplierId" className="form-label required">Supplier ID</label>
                                <input 
                                    type="text" 
                                    id="supplierId"
                                    name="supplierId" 
                                    onChange={handleChange} 
                                    value={inputs.supplierId || ""}
                                    placeholder="Enter supplier ID"
                                    className={`form-input ${errors.supplierId ? 'error' : ''}`}
                                    required
                                />
                                {errors.supplierId && <span className="error-message">{errors.supplierId}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="supplierName" className="form-label required">Supplier Name</label>
                                <input 
                                    type="text" 
                                    id="supplierName"
                                    name="supplierName" 
                                    onChange={handleChange} 
                                    value={inputs.supplierName || ""}
                                    placeholder="Enter supplier name"
                                    className={`form-input ${errors.supplierName ? 'error' : ''}`}
                                    required
                                />
                                {errors.supplierName && <span className="error-message">{errors.supplierName}</span>}
                            </div>
                        </div>
                    </div>

                    {/* Contact Information Section */}
                    <div className="form-section">
                        <h3 className="section-title">Contact Information</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="email" className="form-label">Email Address</label>
                                <input 
                                    type="email" 
                                    id="email"
                                    name="email" 
                                    onChange={handleChange} 
                                    value={inputs.email || ""}
                                    placeholder="supplier@email.com"
                                    className={`form-input ${errors.email ? 'error' : ''}`}
                                />
                                {errors.email && <span className="error-message">{errors.email}</span>}
                                <div className="field-hint">Used for email communications and notifications</div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="phone" className="form-label">Phone Number</label>
                                <input 
                                    type="tel" 
                                    id="phone"
                                    name="phone" 
                                    onChange={handleChange} 
                                    value={inputs.phone || ""}
                                    placeholder="+1 (555) 123-4567"
                                    className={`form-input ${errors.phone ? 'error' : ''}`}
                                />
                                {errors.phone && <span className="error-message">{errors.phone}</span>}
                                <div className="field-hint">Include country code for international numbers</div>
                            </div>
                        </div>

                        {/* Contact requirement warning */}
                        <div className="warning-alert">
                            <div className="warning-icon">ℹ</div>
                            <div className="warning-content">
                                <strong>Contact Information Required</strong>
                                <span>At least one contact method (email or phone) must be provided for communication purposes.</span>
                            </div>
                        </div>
                    </div>

                    

                    {/* Form Actions */}
                    <div className="form-actions">
                        <button 
                            type="button"
                            onClick={handleCancel}
                            className="cancel-button"
                            disabled={updating}
                        >
                            Cancel
                        </button>
                        

                        <button 
                            type="submit"
                            className="update-button"
                            disabled={updating || !hasChanges}
                        >
                            {updating ? "Updating..." : "Update Supplier"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateSupplier;