// src/components/AddProduct/AddProduct.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../../../api/axios';
import './AddProduct.css';

const AddProduct = () => {
    const navigate = useNavigate();
    const [inputs, setInputs] = useState({
        productName: "",
        category: "",
        currentStockQuantity: "",
        reorderlevel: "",
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Input validation
    const validateInputs = () => {
        const newErrors = {};
        
        if (!inputs.productName.trim()) {
            newErrors.productName = "Product name is required";
        }
        
        if (!inputs.category) {
            newErrors.category = "Please select a category";
        }
        
        if (!inputs.currentStockQuantity || parseInt(inputs.currentStockQuantity) < 0) {
            newErrors.currentStockQuantity = "Valid stock quantity is required";
        }
        
        if (!inputs.reorderlevel || parseInt(inputs.reorderlevel) < 0) {
            newErrors.reorderlevel = "Valid reorder level is required";
        }
        
        if (inputs.currentStockQuantity && inputs.reorderlevel) {
            if (parseInt(inputs.reorderlevel) > parseInt(inputs.currentStockQuantity)) {
                newErrors.reorderlevel = "Reorder level cannot be higher than current stock";
            }
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInputs(prev => ({
            ...prev,
            [name]: value,
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateInputs()) return;

        setLoading(true);
        try {
            await sendRequest();
            alert("Product added successfully!");
            navigate('/inventory/products');
        } catch (error) {
            console.error("Error adding product:", error);
            alert("Error adding product. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const sendRequest = async () => {
        const response = await apiClient.post("/inventory", {
            productName: inputs.productName.trim(),
            category: inputs.category,
            currentStockQuantity: parseInt(inputs.currentStockQuantity),
            reorderlevel: parseInt(inputs.reorderlevel),
        });
        return response.data;
    };

    const handleReset = () => {
        setInputs({
            productName: "",
            category: "",
            currentStockQuantity: "",
            reorderlevel: "",
        });
        setErrors({});
    };

    const isLowStock = inputs.currentStockQuantity && inputs.reorderlevel &&
        parseInt(inputs.currentStockQuantity) <= parseInt(inputs.reorderlevel);

    return (
        <div className="add-product-container">
            <div className="header-section">
                <div className="header-content">
                    <h1 className="page-title">Add New Product</h1>
                    <p className="page-subtitle">Create a new product entry for your inventory</p>
                </div>
                <Link to="/inventory/products" className="back-button">Back to Products</Link>
            </div>

            <div className="form-container">
                <form onSubmit={handleSubmit} className="product-form">

                    {/* Product Information Section */}
                    <div className="form-section">
                        <h3 className="section-title">Product Information</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="productName" className="form-label required">Product Name</label>
                                <input 
                                    type="text"
                                    id="productName"
                                    name="productName"
                                    onChange={handleChange}
                                    value={inputs.productName}
                                    placeholder="Enter product name"
                                    className={`form-input ${errors.productName ? 'error' : ''}`}
                                    required
                                />
                                {errors.productName && <span className="error-message">{errors.productName}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="category" className="form-label required">Category</label>
                                <select 
                                    id="category"
                                    name="category"
                                    onChange={handleChange}
                                    value={inputs.category}
                                    className={`form-select ${errors.category ? 'error' : ''}`}
                                    required
                                >
                                    <option value="">Select Category</option>
                                    <option value="Cleaning Chemicals">Cleaning Chemicals</option>
                                    <option value="Equipment & Machinery">Equipment & Machinery</option>
                                    <option value="Accessories & Tools">Accessories & Tools</option>
                                    <option value="Consumables & Supplies">Consumables & Supplies</option>
                                    <option value="Water Treatment & Safety">Water Treatment & Safety</option>
                                    <option value="Spare Parts & Maintenance">Spare Parts & Maintenance</option>
                                    <option value="Other">Other</option>

                                </select>
                                {errors.category && <span className="error-message">{errors.category}</span>}
                            </div>
                        </div>
                    </div>

                    {/* Stock Management Section */}
                    <div className="form-section">
                        <h3 className="section-title">Stock Management</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="currentStockQuantity" className="form-label required">Current Stock Quantity</label>
                                <input 
                                    type="number"
                                    id="currentStockQuantity"
                                    name="currentStockQuantity"
                                    onChange={handleChange}
                                    value={inputs.currentStockQuantity}
                                    placeholder="Enter quantity"
                                    min="0"
                                    className={`form-input ${errors.currentStockQuantity ? 'error' : ''}`}
                                    required
                                />
                                {errors.currentStockQuantity && <span className="error-message">{errors.currentStockQuantity}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="reorderlevel" className="form-label required">Reorder Level</label>
                                <input 
                                    type="number"
                                    id="reorderlevel"
                                    name="reorderlevel"
                                    onChange={handleChange}
                                    value={inputs.reorderlevel}
                                    placeholder="Minimum stock level"
                                    min="0"
                                    className={`form-input ${errors.reorderlevel ? 'error' : ''}`}
                                    required
                                />
                                {errors.reorderlevel && <span className="error-message">{errors.reorderlevel}</span>}
                                <div className="field-hint">Stock level at which you want to be notified to reorder</div>
                            </div>
                        </div>

                        {isLowStock && (
                            <div className="warning-alert">
                                <div className="warning-icon">⚠</div>
                                <div className="warning-content">
                                    <strong>Low Stock Warning:</strong>
                                    <span>Current stock is at or below the reorder level!</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Preview Section */}
                    {inputs.productName && (
                        <div className="form-section preview-section">
                            <h3 className="section-title">Product Preview</h3>
                            <div className="preview-card">
                                <div className="preview-header">
                                    <h4 className="preview-name">{inputs.productName}</h4>
                                    {inputs.category && <span className="preview-category">{inputs.category}</span>}
                                </div>
                                <div className="preview-details">
                                    <div className="preview-item">
                                        <span className="preview-label">Stock Quantity:</span>
                                        <span className="preview-value">{inputs.currentStockQuantity || '0'}</span>
                                    </div>
                                    <div className="preview-item">
                                        <span className="preview-label">Reorder Level:</span>
                                        <span className="preview-value">{inputs.reorderlevel || '0'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="form-actions">
                        <button type="button" onClick={handleReset} className="reset-button" disabled={loading}>Reset Form</button>
                        <button type="submit" className="submit-button" disabled={loading}>
                            {loading ? "Adding Product..." : "Add Product"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProduct;
