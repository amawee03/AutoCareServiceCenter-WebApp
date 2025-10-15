import React, { useEffect, useState } from 'react';
import apiClient from '../../../api/axios';
import { Link } from 'react-router-dom';
import OrderNew from '../OrderNew/OrderNew';
import './DisplayOrder.css';

const URL = "/orders";

const fetchOrders = async () => {
  try {
    const response = await apiClient.get(URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

const DisplayOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchOrders();
      setOrders(Array.isArray(data) ? data : data.orders || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const refreshOrders = async () => {
    await loadOrders();
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.productName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === '' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "Pending").length,
    delivered: orders.filter(o => o.status === "Delivered").length,
    cancel: orders.filter(o => o.status === "Cancel").length,
  };

  // Function to generate and print report directly
  const downloadReport = () => {
    // Calculate total quantity and total amount
    const totalQuantity = filteredOrders.reduce((sum, order) => sum + (order.quantityOrdered || 0), 0);
    const totalAmount = filteredOrders.reduce((sum, order) => sum + (order.TotalAmount || ((order.unitPrice || 0) * (order.quantityOrdered || 0))), 0);

    const reportWindow = window.open('', '_blank');
    
    const reportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Purchase Orders Report</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Arial', sans-serif;
            padding: 40px;
            background: white;
          }
          
          .report-header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #333;
            padding-bottom: 20px;
          }
          
          .report-header h1 {
            font-size: 28px;
            color: #333;
            margin-bottom: 10px;
          }
          
          .report-header p {
            color: #666;
            font-size: 14px;
          }
          
          .report-date {
            text-align: right;
            margin-bottom: 20px;
            color: #666;
            font-size: 12px;
          }
          
          .stats-section {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 30px;
          }
          
          .stat-box {
            border: 1px solid #ddd;
            padding: 15px;
            text-align: center;
            border-radius: 5px;
          }
          
          .stat-box h3 {
            font-size: 24px;
            color: #333;
            margin-bottom: 5px;
          }
          
          .stat-box p {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
          }
          
          .orders-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          
          .orders-table th {
            background-color: #333;
            color: white;
            padding: 12px;
            text-align: left;
            font-size: 12px;
            font-weight: 600;
          }
          
          .orders-table td {
            padding: 10px 12px;
            border-bottom: 1px solid #ddd;
            font-size: 11px;
            color: #333;
          }
          
          .orders-table tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          
          .orders-table tfoot td {
            font-weight: bold;
            background-color: #f0f0f0;
            border-top: 2px solid #333;
            padding: 12px;
            font-size: 12px;
          }
          
          .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 3px;
            font-size: 10px;
            font-weight: 600;
          }
          
          .status-pending {
            background-color: #fff3cd;
            color: #856404;
          }
          
          .status-delivered {
            background-color: #d4edda;
            color: #155724;
          }
          
          .status-cancel {
            background-color: #f8d7da;
            color: #721c24;
          }
          
          .approval-section {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
          }
          
          .approval-box {
            width: 45%;
          }
          
          .approval-label {
            font-weight: bold;
            margin-bottom: 5px;
            font-size: 14px;
            color: #333;
          }
          
          .signature-line {
            border-bottom: 1px solid #333;
            height: 40px;
            margin-bottom: 5px;
          }
          
          .signature-text {
            font-size: 12px;
            color: #666;
          }
          
          .date-input {
            border: none;
            border-bottom: 1px solid #333;
            width: 100%;
            padding: 5px 0;
            font-size: 14px;
            margin-top: 5px;
          }
          
          .report-footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            color: #666;
            font-size: 11px;
          }
          
          @media print {
            body {
              padding: 20px;
            }
            
            .orders-table {
              page-break-inside: auto;
            }
            
            .orders-table tr {
              page-break-inside: avoid;
              page-break-after: auto;
            }
            
            .approval-section {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="report-header">
          <h1>Purchase Orders Report</h1>
          <p>Complete overview of all purchase orders</p>
        </div>
        
        <div class="report-date">
          <p>Generated on: ${new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
        </div>
        
        <div class="stats-section">
          <div class="stat-box">
            <h3>${stats.total}</h3>
            <p>Total Orders</p>
          </div>
          <div class="stat-box">
            <h3>${stats.pending}</h3>
            <p>Pending</p>
          </div>
          <div class="stat-box">
            <h3>${stats.delivered}</h3>
            <p>Delivered</p>
          </div>
          <div class="stat-box">
            <h3>${stats.cancel}</h3>
            <p>Cancelled</p>
          </div>
        </div>
        
        <table class="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Supplier</th>
              <th>Product</th>
              <th>Unit Price</th>
              <th>Quantity</th>
              <th>Total Amount</th>
              <th>Order Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${filteredOrders.map(order => `
              <tr>
                <td>#${order._id ? order._id.slice(-6).toUpperCase() : 'N/A'}</td>
                <td>${order.supplierName || 'N/A'}</td>
                <td>${order.productName || 'N/A'}</td>
                <td>${order.unitPrice?.toFixed(2) || '0.00'}</td>
                <td>${order.quantityOrdered || 0}</td>
                <td>${order.TotalAmount?.toFixed(2) || ((order.unitPrice || 0) * (order.quantityOrdered || 0)).toFixed(2)}</td>  
                <td>${order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'N/A'}</td>
                <td>
                  <span class="status-badge status-${order.status?.toLowerCase() || 'pending'}">
                    ${order.status || 'Pending'}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4" style="text-align: right;">TOTAL:</td>
              <td>${totalQuantity}</td>
              <td>${totalAmount.toFixed(2)}</td>
              <td colspan="2"></td>
            </tr>
          </tfoot>
        </table>
        
        <div class="approval-section">
          <div class="approval-box">
            <div class="approval-label">Inventory Manager Signature:</div>
            <div class="signature-line"></div>
            <div class="signature-text">Signature</div>
          </div>
          <div class="approval-box">
            <div class="approval-label">Approved Date:</div>
            <input type="date" class="date-input" value="${new Date().toISOString().split('T')[0]}" />
          </div>
        </div>
        
        <div class="report-footer">
          <p>This report contains ${filteredOrders.length} order(s)</p>
          <p>&copy; ${new Date().getFullYear()} - Purchase Order Management System</p>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          };
        </script>
      </body>
      </html>
    `;
    
    reportWindow.document.write(reportHTML);
    reportWindow.document.close();
  };

  if (loading) return (
    <div className="display-container">
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <h3>Loading Orders</h3>
        <p>Please wait while we fetch your orders...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="display-container">
      <div className="error-state">
        <div className="error-icon">⚠</div>
        <h3>Unable to Load Orders</h3>
        <p>{error}</p>
        <button onClick={refreshOrders} className="retry-button">Try Again</button>
      </div>
    </div>
  );

  return (
    <div className="display-container">
      {/* Header */}
      <div className="header-section">
        <div className="header-content">
          <h1 className="page-title" style={{
  background: 'linear-gradient(90deg, #f97316, #ef4444)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text'
}}>Purchase Orders</h1>
          <p className="page-subtitle">Manage and track your orders efficiently</p>
        </div>
        <div className="header-actions">
          
          <Link to="/inventory/orders/add" className="add-button">Add New Order</Link>

          <button onClick={downloadReport} className="download-button">
            📄 Download Report
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card total-card">
          <div className="stat-header">
            <div className="stat-icon total-icon">📦</div>
            <div className="stat-info">
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Total Orders</div>
            </div>
          </div>
        </div>
        <div className="stat-card in-stock-card">
          <div className="stat-header">
            <div className="stat-icon in-stock-icon">⏳</div>
            <div className="stat-info">
              <div className="stat-number">{stats.pending}</div>
              <div className="stat-label">Pending</div>
            </div>
          </div>
        </div>
        <div className="stat-card low-stock-card">
          <div className="stat-header">
            <div className="stat-icon low-stock-icon">✅</div>
            <div className="stat-info">
              <div className="stat-number">{stats.delivered}</div>
              <div className="stat-label">Delivered</div>
            </div>
          </div>
        </div>
        <div className="stat-card out-stock-card">
          <div className="stat-header">
            <div className="stat-icon out-stock-icon">❌</div>
            <div className="stat-info">
              <div className="stat-number">{stats.cancel}</div>
              <div className="stat-label">Cancelled</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="controls-section">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search supplier or product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <div className="search-icon">🔍</div>
        </div>

        <div className="filters-container">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancel">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      {filteredOrders.length > 0 ? (
        <div className="table-section">
          <div className="table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Supplier</th>
                  <th>Product</th>
                  <th>Unit Price</th>
                  <th>Quantity</th>
                  <th>Total Amount</th>
                  <th>Order Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <OrderNew key={order._id} order={order} onDelete={refreshOrders} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>No Orders Available</h3>
          <p>Your order list is empty. Add your first order to get started.</p>
          <Link to="/inventory/orders/add" className="add-first-button">Add First Order</Link>
        </div>
      )}
    </div>
  );
};

export default DisplayOrder;