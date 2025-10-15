// src/components/DisplaySupplier/DisplaySupplier.jsx
import React, { useEffect, useState } from 'react';
import apiClient from '../../../api/axios';
import { Link } from 'react-router-dom';
import SupplierNew from '../SupplierNew/SupplierNew';
import './DisplaySupplier.css';

const URL = "/suppliers";

const fetchHandler = async () => {
  try {
    const response = await apiClient.get(URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    throw error;
  }
};

const DisplaySupplier = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchHandler();
        setSuppliers(data.suppliers || []);
      } catch (err) {
        console.error("Error fetching suppliers:", err);
        setError("Failed to load suppliers. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadSuppliers();
  }, []);

  // Function to refresh data after supplier operations
  const refreshSuppliers = async () => {
    try {
      const data = await fetchHandler();
      setSuppliers(data.suppliers || []);
    } catch (err) {
      console.error("Error refreshing suppliers:", err);
    }
  };

  // Filter and search logic
  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.supplierId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Statistics
  const stats = {
    total: suppliers.length,
    active: suppliers.filter(s => s.email && s.phone).length,
    inactive: suppliers.filter(s => !s.email || !s.phone).length,
  };

  if (loading) {
    return (
      <div className="display-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <h3>Loading Suppliers</h3>
          <p>Please wait while we fetch your suppliers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="display-container">
        <div className="error-state">
          <div className="error-icon">⚠</div>
          <h3>Unable to Load Suppliers</h3>
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
          <h1 className="page-title" style={{
  background: 'linear-gradient(90deg, #f97316, #ef4444)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text'
}}>Supplier Management</h1>
          <p className="page-subtitle">Manage and monitor your supplier information</p>
        </div>
        <div className="header-actions">
          <Link to="/inventory/supplier/add" className="add-button">
            Add New Supplier
          </Link>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon total-icon">👥</div>
            <div className="stat-info">
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Total Suppliers</div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon active-icon">✅</div>
            <div className="stat-info">
              <div className="stat-number">{stats.active}</div>
              <div className="stat-label">Active Suppliers</div>
            </div>
          </div>
        </div>

        
      </div>

      {/* Controls Section */}
      <div className="controls-section">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search suppliers by name, email, phone, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <div className="search-icon">🔍</div>
        </div>
        
        <div className="results-count">
          Showing {filteredSuppliers.length} of {suppliers.length} suppliers
        </div>
      </div>

      {/* Suppliers Table */}
      {filteredSuppliers && filteredSuppliers.length > 0 ? (
        <div className="table-section">
          <div className="table-container">
            <table className="suppliers-table">
              <thead>
                <tr>
                  <th>Supplier ID</th>
                  <th>Supplier Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSuppliers.map((supplier, i) => (
                  <SupplierNew 
                    key={supplier._id || i}
                    supplier={supplier}
                    onUpdate={refreshSuppliers}
                    onDelete={refreshSuppliers}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : searchTerm ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No Suppliers Found</h3>
          <p>No suppliers match your current search criteria.</p>
          <button 
            onClick={() => setSearchTerm('')}
            className="clear-filters-button"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>No Suppliers in Database</h3>
          <p>Your supplier database is empty. Start by adding your first supplier.</p>
          <Link to="/inventory/supplier" className="add-first-button">
            Add First Supplier
          </Link>
        </div>
      )}
    </div>
  );
};

export default DisplaySupplier;