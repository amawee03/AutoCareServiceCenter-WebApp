import React, { useEffect, useState } from "react";
import apiClient from '../../api/axios';

export default function ArchivesPage() {
  const [activeTab, setActiveTab] = useState("income"); // "income" or "expense"
  const [archives, setArchives] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [id, setId] = useState(null);

  useEffect(() => {
    const fetchArchives = async () => {
      setLoading(true);
      try {
        const res =
          activeTab === "income"
            ? await apiClient.get(`/api/finance-income/archives`)
            : await apiClient.get(`/api/finance-expenses/archives`);
        setArchives(res.data);
      } catch (err) {
        console.error("Error fetching archives:", err);
        setArchives([]);
      } finally {
        setLoading(false);
      }
    };
    fetchArchives();
  }, [activeTab]);

  const filteredArchives = archives.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      (a.category && a.category.toLowerCase().includes(search.toLowerCase())) ||
      (a.deleteReason && a.deleteReason.toLowerCase().includes(search.toLowerCase()))
  );

  const isIncome = activeTab === "income";

  return (
    <div className="max-w-7xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
      {/* Header Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Archived Records</h2>
        <p className="text-gray-600">View and search deleted financial records</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8">
        {["income", "expense"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
              activeTab === tab
                ? "border-red-500 text-red-600 bg-red-50"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tab === "income" ? "Income Archives" : "Expense Archives"}
          </button>
        ))}
      </div>

      {/* Search Bar with Icon */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder={`Search ${activeTab} archives by name, category, or deletion reason...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
          />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Archives</p>
              <p className="text-2xl font-bold text-gray-800">{archives.length}</p>
            </div>
            <div className="p-3 bg-gray-200 rounded-lg">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h8a2 2 0 002-2V8m-9 4h4m-4 4h4m-4-8h4m-4-4h4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 mb-1">Search Results</p>
              <p className="text-2xl font-bold text-blue-800">{filteredArchives.length}</p>
            </div>
            <div className="p-3 bg-blue-200 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
              </svg>
            </div>
          </div>
        </div>

        <div className={`bg-gradient-to-r ${
          isIncome ? 'from-green-50 to-green-100 border-green-200' : 'from-red-50 to-red-100 border-red-200'
        } border rounded-xl p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium mb-1 ${
                isIncome ? 'text-green-600' : 'text-red-600'
              }`}>Archive Type</p>
              <p className={`text-2xl font-bold ${
                isIncome ? 'text-green-800' : 'text-red-800'
              }`}>{isIncome ? 'Income' : 'Expenses'}</p>
            </div>
            <div className={`p-3 rounded-lg ${
              isIncome ? 'bg-green-200' : 'bg-red-200'
            }`}>
              <svg className={`w-6 h-6 ${
                isIncome ? 'text-green-600' : 'text-red-600'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                  isIncome ? "M12 6v6m0 0v6m0-6h6m-6 0H6" : "M20 12H4"
                } />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
            <p className="text-gray-600 font-medium">Loading archives...</p>
          </div>
        </div>
      ) : filteredArchives.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.5-.935-6.072-2.456M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No archived records found</h3>
          <p className="text-gray-500">
            {search ? "Try adjusting your search terms" : `No ${activeTab} records have been archived yet`}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name / Vendor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {isIncome ? "Service" : "Category"}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mode
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount (LKR)
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deletion Reason
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deleted At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredArchives.map((a, index) => (
                  <tr key={a._id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v6m4-6v6m1-10V7a3 3 0 00-3-3H9a3 3 0 00-3 3v8a2 2 0 002 2h8a2 2 0 002-2V7a3 3 0 00-3-3z" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {new Date(a.dateSpent || a.dateReceived).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(a.dateSpent || a.dateReceived).toLocaleDateString('en-US', { weekday: 'short' })}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{a.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        {a.category || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {a.modeOfPayment || a.mode || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className={`text-sm font-bold ${
                        isIncome ? "text-green-600" : "text-red-600"
                      }`}>
                        LKR {Number(a.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                        {a.deleteReason}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="text-sm text-gray-900">
                        {new Date(a.deletedAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(a.deletedAt).toLocaleTimeString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}