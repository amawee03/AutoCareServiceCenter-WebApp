import React, { useState } from "react";
import { Link } from "react-router-dom";
import apiClient from '../../../api/axios';
import "./OrderNew.css";

const OrderNew = ({ order, onDelete }) => {
  const { _id, supplierName, productName, unitPrice, quantityOrdered, TotalAmount, orderDate, status } = order;
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteHandler = async () => {
    if (window.confirm(`Delete order for "${supplierName}" - ${productName}?`)) {
      try {
        setIsDeleting(true);
        await apiClient.delete(`/orders/${_id}`);
        if (onDelete) onDelete();
      } catch (err) {
        alert("Error deleting order!");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const getStatusClass = () => {
    if (status === "Delivered") return "status-delivered";
    if (status === "Pending") return "status-pending";
    if (status === "Cancel") return "status-cancel";
    return "";
  };

  // Format numbers to 2 decimal places
  const formatCurrency = (value) => {
    return value !== undefined && value !== null && !isNaN(value)
      ? `Rs. ${parseFloat(value).toFixed(2)}`
      : "N/A";
  };

  return (
    <tr className="order-row">
      {/* Order ID */}
      <td className="order-cell order-id">
        #{_id?.slice(-6)?.toUpperCase() || "N/A"}
      </td>

      {/* Supplier Name */}
      <td className="order-cell">{supplierName}</td>

      {/* Product Name */}
      <td className="order-cell">{productName || "N/A"}</td>

     
      <td className="order-cell">{formatCurrency(unitPrice)}</td>

      
      <td className="order-cell">{quantityOrdered}</td>

   
      <td className="order-cell">{formatCurrency(TotalAmount)}</td>

      
      <td className="order-cell">
        {orderDate ? new Date(orderDate).toLocaleDateString() : "N/A"}
      </td>

      
      <td className="order-cell">
        <span className={`status-badge ${getStatusClass()}`}>{status}</span>
      </td>

    
      <td className="order-cell">
        <div className="order-actions">
          
          <Link to={`/inventory/orders/${_id}`} className="action-button update-button">

            <span className="button-icon">✏</span>
            <span className="button-text">Update</span>
          </Link>
          <button
            onClick={deleteHandler}
            className={`action-button delete-button ${isDeleting ? "deleting" : ""}`}
            disabled={isDeleting}
          >
            <span className="button-icon">{isDeleting ? "⏳" : "🗑"}</span>
            <span className="button-text">
              {isDeleting ? "Deleting..." : "Delete"}
            </span>
          </button>
        </div>
      </td>
    </tr>
  );
};

export default OrderNew;
