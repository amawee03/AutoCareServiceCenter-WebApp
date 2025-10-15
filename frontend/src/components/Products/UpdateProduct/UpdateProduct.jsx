// src/components/UpdateProduct/UpdateProduct.jsx
import React, { useEffect, useState } from 'react';
import apiClient from '../../../api/axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import "./UpdateProduct.css";

const UpdateProduct = () => {
    const [inputs, setInputs] = useState({
        productName: "",
        category: "",
        currentStockQuantity: "",
        reorderlevel: "",
    });
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [errors, setErrors] = useState({});
    const [originalData, setOriginalData] = useState({});

    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        const fetchHandler = async () => {
            try {
                setLoading(true);
                const res = await apiClient.get(`/inventory/${id}`);
                const productData = res.data.product;
                setInputs(productData);
                setOriginalData(productData);
            } catch (error) {
                console.error("Error fetching product:", error);
                alert("Could not load product. Please try again.");
                navigate("/inventory/products");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchHandler();
        else navigate("/inventory/products");
    }, [id, navigate]);

    // Validate form fields
    const validateInputs = () => {
        const newErrors = {};
        if (!inputs.productName.trim()) newErrors.productName = "Product name is required";
        if (!inputs.category) newErrors.category = "Please select a category";
        if (!inputs.currentStockQuantity || parseInt(inputs.currentStockQuantity) < 0)
            newErrors.currentStockQuantity = "Valid stock quantity is required";
        if (!inputs.reorderlevel || parseInt(inputs.reorderlevel) < 0)
            newErrors.reorderlevel = "Valid reorder level is required";

        if (inputs.currentStockQuantity && inputs.reorderlevel) {
            if (parseInt(inputs.reorderlevel) > parseInt(inputs.currentStockQuantity)) {
                newErrors.reorderlevel = "Reorder level cannot be higher than current stock";
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Send PUT request
    const sendRequest = async () => {
        const response = await apiClient.put(`/inventory/${id}`, {
            productName: String(inputs.productName).trim(),
            category: String(inputs.category),
            currentStockQuantity: parseInt(inputs.currentStockQuantity),
            reorderlevel: parseInt(inputs.reorderlevel),
        });
        return response.data;
    };

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setInputs(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    };

    // Submit handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateInputs()) return;
        setUpdating(true);
        try {
            await sendRequest();
            alert("Product updated successfully!");
            navigate("/inventory/products");
        } catch (error) {
            console.error("Error updating product:", error);
            alert("Update failed. Please try again.");
        } finally {
            setUpdating(false);
        }
    };

    const handleCancel = () => navigate("/inventory/products");
    const hasChanges = JSON.stringify(inputs) !== JSON.stringify(originalData);
    const isLowStock = inputs.currentStockQuantity && inputs.reorderlevel &&
        parseInt(inputs.currentStockQuantity) <= parseInt(inputs.reorderlevel);

    if (loading) {
        return (
            <div className="update-container">
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <h3>Loading Product Details</h3>
                    <p>Please wait while we fetch the product information...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="update-container">
            <div className="header-section">
                <div className="header-content">
                    <h1 className="page-title">Update Product</h1>
                    <p className="page-subtitle">Modify product information and stock levels</p>
                    <div className="product-info">
                        <span className="product-id-label">Product ID:</span>
                        <span className="product-id-value">#{id?.slice(-8)?.toUpperCase()}</span>
                        {hasChanges && <span className="changes-indicator">• Unsaved Changes</span>}
                    </div>
                </div>
                <div className="header-actions">
                    <Link to="/inventory/products" className="back-button">Back to Products</Link>
                </div>
            </div>

            <div className="form-container">
                <form onSubmit={handleSubmit} className="update-form">
                    {/* Product Information */}
                    <div className="form-section">
                        <h3 className="section-title">Product Information</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label required">Product Name</label>
                                <input
                                    type="text"
                                    name="productName"
                                    onChange={handleChange}
                                    value={inputs.productName || ""}
                                    placeholder="Enter product name"
                                    className={`form-input ${errors.productName ? 'error' : ''}`}
                                    required
                                />
                                {errors.productName && <span className="error-message">{errors.productName}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label required">Category</label>
                                <select
                                    name="category"
                                    onChange={handleChange}
                                    value={inputs.category || ""}
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

                    {/* Stock Management */}
                    <div className="form-section">
                        <h3 className="section-title">Stock Management</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label required">Current Stock Quantity</label>
                                <input
                                    type="number"
                                    name="currentStockQuantity"
                                    onChange={handleChange}
                                    value={inputs.currentStockQuantity || ""}
                                    placeholder="Enter quantity"
                                    min="0"
                                    className={`form-input ${errors.currentStockQuantity ? 'error' : ''}`}
                                    required
                                />
                                {errors.currentStockQuantity && <span className="error-message">{errors.currentStockQuantity}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label required">Reorder Level</label>
                                <input
                                    type="number"
                                    name="reorderlevel"
                                    onChange={handleChange}
                                    value={inputs.reorderlevel || ""}
                                    placeholder="Minimum stock level"
                                    min="0"
                                    className={`form-input ${errors.reorderlevel ? 'error' : ''}`}
                                    required
                                />
                                {errors.reorderlevel && <span className="error-message">{errors.reorderlevel}</span>}
                                <div className="field-hint">Stock level at which you want to reorder</div>
                            </div>
                        </div>
                        {isLowStock && (
                            <div className="warning-alert">
                                <div className="warning-icon">⚠</div>
                                <div className="warning-content">
                                    <strong>Low Stock Warning:</strong> Current stock is at or below reorder level!
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={handleCancel} className="cancel-button" disabled={updating}>Cancel</button>
                        <button type="submit" className="update-button" disabled={updating || !hasChanges}>
                            {updating ? "Updating..." : "Update Product"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateProduct;
