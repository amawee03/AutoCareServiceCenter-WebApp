// DashboardInventory.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaBox, FaTruck, FaUsers } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import "./DashboardInventory.css";

const DashboardInventory = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("http://localhost:5001/api/dashboard/summary");
        setStats(res.data);
      } catch (err) {
        console.error("Error loading summary:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!stats) return <p>Error loading summary</p>;

  const handleCardClick = (path) => {
    navigate(path);
  };

  // Prepare data for charts
  const barData = [
    { name: "Suppliers", value: stats.suppliers?.total || 0 },
    { name: "Products", value: stats.products?.total || 0 },
    { name: "Orders", value: stats.orders?.total || 0 },
  ];

  const pieData = [
    { name: "Pending", value: stats.orders?.pending || 0 },
    { name: "Delivered", value: stats.orders?.delivered || 0 },
    { name: "Cancelled", value: stats.orders?.cancel || 0 },
  ];

  const COLORS = ["#FF4D4F", "#00C49F", "#FFBB28"];

  return (
    <div className="inventory-summary">
      <h2 className="summary-title">Inventory Dashboard</h2>

      {/* Summary Cards */}
      <div className="summary-grid">
        <div
          className="summary-card card-red"
          onClick={() => handleCardClick("/inventory/supplier")}
        >
          <FaUsers className="summary-icon" />
          <div className="summary-content">
            <h3>{stats.suppliers?.total || 0}</h3>
            <p>Total Suppliers</p>
          </div>
        </div>

        <div
          className="summary-card card-black"
          onClick={() => handleCardClick("/inventory/products")}
        >
          <FaBox className="summary-icon" />
          <div className="summary-content">
            <h3>{stats.products?.total || 0}</h3>
            <p>Total Products</p>
          </div>
        </div>

        <div
          className="summary-card card-gold"
          onClick={() => handleCardClick("/inventory/orders")}
        >
          <FaTruck className="summary-icon" />
          <div className="summary-content">
            <h3>{stats.orders?.total || 0}</h3>
            <p>Total Orders</p>
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="chart-container">
        <h3>Overall Inventory Overview</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={barData}
            margin={{ top: 15, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#0f0a38ff" barSize={25} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart */}
      <div className="chart-container">
        <h3>Order Status Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              dataKey="value"
              label
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardInventory;
