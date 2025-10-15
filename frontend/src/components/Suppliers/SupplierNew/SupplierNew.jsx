// src/components/SupplierNew/SupplierNew.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../../api/axios';
import './SupplierNew.css';

const SupplierNew = (props) => {
  const { _id, supplierId, supplierName, email, phone } = props.supplier;
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteHandler = async () => {
    const confirmed = window.confirm(`Are you sure you want to delete supplier "${supplierName}"?`);
    
    if (confirmed) {
      try {
        setIsDeleting(true);
        await apiClient.delete(`/suppliers/${_id}`);
        alert("Supplier deleted successfully!");
        
        // Refresh parent or page
        if (props.onDelete) {
          props.onDelete();
        } else {
          window.location.reload();
        }
      } catch (error) {
        console.error("Error deleting supplier:", error);
        alert("Error deleting supplier. Please try again.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const getSupplierStatus = () => {
    if (!email && !phone) return { text: 'Missing Info', class: 'incomplete' };
    if (!email || !phone) return { text: 'Partial Info', class: 'partial' };
    return { text: 'Complete', class: 'complete' };
  };

  const supplierStatus = getSupplierStatus();

  return (
    <tr className="supplier-row">
      {/* Supplier ID */}
      <td className="supplier-cell">{supplierId || 'N/A'}</td>

      {/* Supplier Name */}
      <td className="supplier-cell">{supplierName || 'Unknown Supplier'}</td>

      {/* Email */}
      <td className="supplier-cell">
        {email ? (
          <a href={`mailto:${email}`} className="email-link">
            📧 {email}
          </a>
        ) : (
          <span className="missing-text">❌ No email</span>
        )}
      </td>

      {/* Phone */}
      <td className="supplier-cell">
        {phone ? (
          <a href={`tel:${phone}`} className="phone-link">
            📞 {phone}
          </a>
        ) : (
          <span className="missing-text">❌ No phone</span>
        )}
      </td>

      {/* Actions */}
      <td className="supplier-cell">
        <div className="action-buttons">
          <Link
            to={`/inventory/supplier/${_id}`}  // Route
            className="action-button update-button"
          >
            ✏ Update
          </Link>
          
          <button
            onClick={deleteHandler}
            className={`action-button delete-button ${isDeleting ? 'deleting' : ''}`}
            disabled={isDeleting}
          >
            {isDeleting ? '⏳ Deleting...' : '🗑 Delete'}
          </button>
        </div>
      </td>
    </tr>
  );
};

export default SupplierNew;
