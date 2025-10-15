// src/components/DisplayProduct/DisplayProduct.jsx
import React, { useEffect, useState } from 'react';
import apiClient from '../../../api/axios';
import { Link } from 'react-router-dom';
import ProductNew from '../ProductNew/ProductNew';
import './DisplayProduct.css';

const URL = "/inventory";

const fetchHandler = async () => {
  try {
    const response = await apiClient.get(URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching inventory:", error);
    throw error;
  }
};

const DisplayProduct = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    const loadInventory = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchHandler();
        setInventory(data.inventory || []);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadInventory();
  }, []);

  // Function to refresh data after product operations
  const refreshInventory = async () => {
    try {
      const data = await fetchHandler();
      setInventory(data.inventory || []);
    } catch (err) {
      console.error("Error refreshing inventory:", err);
    }
  };

  // Filter and search logic
  const filteredInventory = inventory.filter(product => {
    const matchesSearch = product.productName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === '' || product.category === filterCategory;

    const getProductStatus = (product) => {
      if (product.currentStockQuantity <= 0) return 'out-of-stock';
      if (product.currentStockQuantity <= product.reorderlevel) return 'low-stock';
      return 'in-stock';
    };

    const matchesStatus = filterStatus === '' || getProductStatus(product) === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Get unique categories for filter
  const categories = [...new Set(inventory.map(product => product.category))].filter(Boolean);

  // Statistics
  const stats = {
    total: inventory.length,
    inStock: inventory.filter(p => p.currentStockQuantity > p.reorderlevel).length,
    lowStock: inventory.filter(p => p.currentStockQuantity <= p.reorderlevel && p.currentStockQuantity > 0).length,
    outOfStock: inventory.filter(p => p.currentStockQuantity <= 0).length,
  };

  if (loading) {
    return (
      <div className="display-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <h3>Loading Products</h3>
          <p>Please wait while we fetch your inventory...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="display-container">
        <div className="error-state">
          <div className="error-icon">⚠</div>
          <h3>Unable to Load Products</h3>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="retry-button"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="display-container">
      {/* Header Section */}
      <div className="header-section">
        <div className="header-content">
          {/* <h1 className="page-title">Product Inventory</h1> */}
          <h1 className="page-title" style={{
  background: 'linear-gradient(90deg, #f97316, #ef4444)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text'
}}>Product Inventory</h1>
          <p className="page-subtitle">Manage and monitor your product stock levels</p>
        </div>
        <div className="header-actions">
          <Link to="/products/addproduct" className="add-button">
      

            Add New Product
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card total-card">
          <div className="stat-header">
            <div className="stat-icon total-icon">📦</div>
            <div className="stat-info">
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Total Products</div>
            </div>
          </div>
        </div>
        
        <div className="stat-card in-stock-card">
          <div className="stat-header">
            <div className="stat-icon in-stock-icon">✅</div>
            <div className="stat-info">
              <div className="stat-number">{stats.inStock}</div>
              <div className="stat-label">In Stock</div>
            </div>
          </div>
        </div>
        
        <div className="stat-card low-stock-card">
          <div className="stat-header">
            <div className="stat-icon low-stock-icon">⚠️</div>
            <div className="stat-info">
              <div className="stat-number">{stats.lowStock}</div>
              <div className="stat-label">Low Stock</div>
            </div>
          </div>
        </div>
        
        <div className="stat-card out-stock-card">
          <div className="stat-header">
            <div className="stat-icon out-stock-icon">❌</div>
            <div className="stat-info">
              <div className="stat-number">{stats.outOfStock}</div>
              <div className="stat-label">Out of Stock</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="controls-section">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <div className="search-icon">🔍</div>
        </div>
        
        <div className="filters-container">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="in-stock">In Stock</option>
            <option value="low-stock">Low Stock</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>
        </div>
        
        <div className="results-count">
          Showing {filteredInventory.length} of {inventory.length} products
        </div>
      </div>

      {/* Products Table */}
      {filteredInventory && filteredInventory.length > 0 ? (
        <div className="table-section">
          <div className="table-container">
            <table className="products-table">
              <thead>
                <tr>
                  <th>Product ID</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Stock Quantity</th>
                  <th>Reorder Level</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((product, i) => (
                  <ProductNew 
                    key={product._id || i} 
                    inventory={product} 
                    onUpdate={refreshInventory}
                    onDelete={refreshInventory}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : searchTerm || filterCategory || filterStatus ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No Products Found</h3>
          <p>No products match your current search and filter criteria.</p>
          <button 
            onClick={() => {
              setSearchTerm('');
              setFilterCategory('');
              setFilterStatus('');
            }}
            className="clear-filters-button"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>No Products in Inventory</h3>
          <p>Your inventory is empty. Start by adding your first product.</p>
          <Link to="/inventory/products/add" className="add-first-button">
            Add First Product
          </Link>
        </div>
      )}
    </div>
  );
};

export default DisplayProduct;
