// src/components/ProductNew/ProductNew.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../../api/axios';
import { useNavigate } from 'react-router-dom';
import './ProductNew.css';

const ProductNew = (props) => {
  const { _id, productName, category, currentStockQuantity, reorderlevel } = props.inventory;
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const deleteHandler = async () => {
    const confirmed = window.confirm(`Are you sure you want to delete "${productName}"?`);
    
    if (confirmed) {
      try {
        setIsDeleting(true);
        await apiClient.delete(`/inventory/${_id}`);
        alert("Product deleted successfully!");
        
        if (props.onDelete) {
          props.onDelete();
        } else {
          window.location.reload();
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Error deleting product. Please try again.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Function to determine stock status
  const getStockStatus = () => {
    if (currentStockQuantity <= 0) {
      return { status: 'out-of-stock', label: 'Out of Stock', color: 'destructive' };
    } else if (currentStockQuantity <= reorderlevel) {
      return { status: 'low-stock', label: 'Low Stock', color: 'warning' };
    } else if (currentStockQuantity <= reorderlevel * 1.5) {
      return { status: 'medium-stock', label: 'Medium Stock', color: 'accent' };
    }
    return { status: 'good-stock', label: 'In Stock', color: 'success' };
  };

  const stockStatus = getStockStatus();

  return (
    <tr className="product-row">
      <td className="product-cell">
        <div className="product-id">
          #{_id?.slice(-6)?.toUpperCase() || 'N/A'}
        </div>
      </td>
      
      <td className="product-cell">
        <div className="product-name-container">
          <span className="product-name">{productName}</span>
        </div>
      </td>
      
      <td className="product-cell">
        <span className="category-badge">{category}</span>
      </td>
      
      <td className="product-cell">
        <div className={`stock-container ${stockStatus.status}`}>
          <div className="stock-info">
            <span className="stock-number">{currentStockQuantity}</span>
            {currentStockQuantity <= reorderlevel && currentStockQuantity > 0 && (
              <span className="stock-warning" title="Stock is running low!">⚠</span>
            )}
            {currentStockQuantity <= 0 && (
              <span className="stock-critical" title="Out of stock!">!</span>
            )}
          </div>
          <div className={`stock-status ${stockStatus.color}`}>
            {stockStatus.label}
          </div>
        </div>
      </td>
      
      <td className="product-cell">
        <span className="reorder-level">{reorderlevel}</span>
      </td>
      
      <td className="product-cell">
        <div className={`status-badge ${stockStatus.status}`}>
          <div className={`status-indicator ${stockStatus.color}`}></div>
          <span className="status-text">{stockStatus.label}</span>
        </div>
      </td>
      
      <td className="product-cell">
        <div className="action-buttons">
          <Link 
            to={`/products/${_id}`} 
            className="action-button update-button"
            title="Update Product"
          >
            <span className="button-icon">✏</span>
            <span className="button-text">Update</span>
          </Link>
          
          <button 
            onClick={deleteHandler} 
            className={`action-button delete-button ${isDeleting ? 'deleting' : ''}`}
            disabled={isDeleting}
            title="Delete Product"
          >
            <span className="button-icon">
              {isDeleting ? '⏳' : '🗑'}
            </span>
            <span className="button-text">
              {isDeleting ? 'Deleting...' : 'Delete'}
            </span>
          </button>
        </div>
      </td>
    </tr>
  );
};

export default ProductNew;
