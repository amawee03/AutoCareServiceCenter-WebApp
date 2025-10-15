import React, { useState, useEffect, useMemo } from "react";
import apiClient from '../../api/axios';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function FinancialDashboard() {
  const [incomeData, setIncomeData] = useState([]);
  const [expensesData, setExpensesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30'); // days

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [incomeRes, expensesRes] = await Promise.all([
          apiClient.get("/api/finance-income"),
          apiClient.get("/api/finance-expenses"),
        ]);
        setIncomeData(incomeRes.data || []);
        setExpensesData(expensesRes.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculate key metrics
  const metrics = useMemo(() => {
    const totalIncome = incomeData.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const totalExpenses = expensesData.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const netProfit = totalIncome - totalExpenses;
    const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100) : 0;

    // Calculate monthly growth
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentMonthIncome = incomeData.filter(item => {
      const date = new Date(item.dateReceived);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    }).reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const lastMonthIncome = incomeData.filter(item => {
      const date = new Date(item.dateReceived);
      return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
    }).reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const monthlyGrowth = lastMonthIncome > 0 ? (((currentMonthIncome - lastMonthIncome) / lastMonthIncome) * 100) : 0;

    // Get data within time range
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(timeRange));
    
    const recentIncome = incomeData.filter(item => new Date(item.dateReceived) >= daysAgo);
    const recentExpenses = expensesData.filter(item => new Date(item.dateSpent) >= daysAgo);

    return {
      totalIncome,
      totalExpenses,
      netProfit,
      profitMargin,
      monthlyGrowth,
      totalTransactions: incomeData.length + expensesData.length,
      recentIncome: recentIncome.length,
      recentExpenses: recentExpenses.length,
    };
  }, [incomeData, expensesData, timeRange]);

  // Prepare chart data - Daily trends
  const dailyTrends = useMemo(() => {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(timeRange));
    
    const dailyData = {};
    
    // Process income
    incomeData.forEach(item => {
      const date = new Date(item.dateReceived);
      if (date >= daysAgo) {
        const dateStr = date.toLocaleDateString();
        if (!dailyData[dateStr]) {
          dailyData[dateStr] = { date: dateStr, income: 0, expenses: 0 };
        }
        dailyData[dateStr].income += Number(item.amount || 0);
      }
    });

    // Process expenses
    expensesData.forEach(item => {
      const date = new Date(item.dateSpent);
      if (date >= daysAgo) {
        const dateStr = date.toLocaleDateString();
        if (!dailyData[dateStr]) {
          dailyData[dateStr] = { date: dateStr, income: 0, expenses: 0 };
        }
        dailyData[dateStr].expenses += Number(item.amount || 0);
      }
    });

    return Object.values(dailyData).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [incomeData, expensesData, timeRange]);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const breakdown = {};
    
    if (incomeData.length > 0) {
      incomeData.forEach(item => {
        const cat = item.category || 'Other';
        breakdown[cat] = (breakdown[cat] || 0) + Number(item.amount || 0);
      });
    }

    return Object.entries(breakdown).map(([name, value]) => ({ name, value }));
  }, [incomeData]);

  // Expense category breakdown
  const expenseCategoryBreakdown = useMemo(() => {
    const breakdown = {};
    
    expensesData.forEach(item => {
      const cat = item.category || 'Other';
      breakdown[cat] = (breakdown[cat] || 0) + Number(item.amount || 0);
    });

    return Object.entries(breakdown).map(([name, value]) => ({ name, value }));
  }, [expensesData]);

  // Payment mode distribution
  const paymentModeData = useMemo(() => {
    const modes = {};
    
    [...incomeData, ...expensesData].forEach(item => {
      const mode = item.mode || item.modeOfPayment || 'Other';
      modes[mode] = (modes[mode] || 0) + 1;
    });

    return Object.entries(modes).map(([name, value]) => ({ name, value }));
  }, [incomeData, expensesData]);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Dashboard</h1>
          <p className="text-gray-600 mt-1">Real-time overview of your financial performance</p>
        </div>
        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 bg-white text-gray-900 focus:ring-red-500 focus:border-red-500"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="365">Last Year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Income */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-lg border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-200 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
              metrics.monthlyGrowth >= 0 ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
            }`}>
              {metrics.monthlyGrowth >= 0 ? '+' : ''}{metrics.monthlyGrowth.toFixed(1)}%
            </span>
          </div>
          <p className="text-sm font-medium text-green-600 mb-1">Total Income</p>
          <p className="text-3xl font-bold text-green-900">
            LKR {metrics.totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-green-600 mt-2">{incomeData.length} transactions</p>
        </div>

        {/* Total Expenses */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl shadow-lg border border-red-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-200 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-200 text-red-800">
              {expensesData.length} items
            </span>
          </div>
          <p className="text-sm font-medium text-red-600 mb-1">Total Expenses</p>
          <p className="text-3xl font-bold text-red-900">
            LKR {metrics.totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-red-600 mt-2">{expensesData.length} transactions</p>
        </div>

        {/* Net Profit */}
        <div className={`bg-gradient-to-br ${
          metrics.netProfit >= 0 ? 'from-blue-50 to-blue-100 border-blue-200' : 'from-orange-50 to-orange-100 border-orange-200'
        } p-6 rounded-xl shadow-lg border`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${metrics.netProfit >= 0 ? 'bg-blue-200' : 'bg-orange-200'}`}>
              <svg className={`w-6 h-6 ${metrics.netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
              metrics.profitMargin >= 0 ? 'bg-blue-200 text-blue-800' : 'bg-orange-200 text-orange-800'
            }`}>
              {metrics.profitMargin.toFixed(1)}% margin
            </span>
          </div>
          <p className={`text-sm font-medium mb-1 ${metrics.netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
            Net Profit
          </p>
          <p className={`text-3xl font-bold ${metrics.netProfit >= 0 ? 'text-blue-900' : 'text-orange-900'}`}>
            LKR {metrics.netProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <p className={`text-xs mt-2 ${metrics.netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
            {metrics.netProfit >= 0 ? 'Profitable' : 'Loss'}
          </p>
        </div>

        {/* Transactions */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-lg border border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-200 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-200 text-purple-800">
              All time
            </span>
          </div>
          <p className="text-sm font-medium text-purple-600 mb-1">Total Transactions</p>
          <p className="text-3xl font-bold text-purple-900">
            {metrics.totalTransactions}
          </p>
          <p className="text-xs text-purple-600 mt-2">
            {metrics.recentIncome + metrics.recentExpenses} in selected period
          </p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expenses Trend */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Income vs Expenses Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dailyTrends}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" />
              <Area type="monotone" dataKey="expenses" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpenses)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Income by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Categories */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Expense Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={expenseCategoryBreakdown}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Methods */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Methods Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={paymentModeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {paymentModeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity Summary */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-600 font-medium">Highest Income Day</p>
            <p className="text-2xl font-bold text-green-900">
              LKR {Math.max(...dailyTrends.map(d => d.income), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm text-red-600 font-medium">Highest Expense Day</p>
            <p className="text-2xl font-bold text-red-900">
              LKR {Math.max(...dailyTrends.map(d => d.expenses), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-600 font-medium">Average Daily Income</p>
            <p className="text-2xl font-bold text-blue-900">
              LKR {dailyTrends.length > 0 ? (dailyTrends.reduce((sum, d) => sum + d.income, 0) / dailyTrends.length).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}