import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../api/axios";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../../components/ui/dialog";
import { Plus, Edit, Trash2, Eye, Package, Search, AlertCircle, BookOpen, Download } from "lucide-react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { ServicePackageForm } from "./ServicePackageForm";
import jsPDF from "jspdf";


const API_BASE_URL = "http://localhost:5001/api";

export default function ManageServices() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewService, setViewService] = useState(null);
  const [message, setMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`${API_BASE_URL}/packages`);
      console.log("Fetched services:", res.data);
      setServices(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch (err) {
      console.error("Error fetching services:", err);
      setMessage({ type: "error", text: `Failed to fetch services: ${err.response?.data?.message || err.message}` });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const showMessage = (msg, type = "success") => {
    setMessage({ type, text: msg });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleToggleActive = async (id, isActive) => {
    setActionLoading(`status-${id}`);
    try {
      const response = await apiClient.put(`${API_BASE_URL}/packages/${id}`, {
        status: isActive ? "inactive" : "active",
      });
      console.log("Status update response:", response.data);
      await fetchServices();
      showMessage(`Service ${isActive ? "deactivated" : "activated"} successfully`);
    } catch (err) {
      console.error("Status update error:", err);
      showMessage(`Failed to update status: ${err.response?.data?.message || err.message}`, "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this service? This action cannot be undone.")) return;
    
    setActionLoading(`delete-${id}`);
    try {
      await apiClient.delete(`${API_BASE_URL}/packages/${id}`);
      await fetchServices();
      showMessage("Service deleted successfully");
    } catch (err) {
      console.error("Delete error:", err);
      showMessage(`Failed to delete service: ${err.response?.data?.message || err.message}`, "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewCatalogue = () => {
    navigate('/services');
  };

  const handleDownloadCatalogue = async () => {
    setDownloadingPDF(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 20;

      
      doc.setFontSize(24);
      doc.setFont(undefined, 'bold');
      doc.text('Service Catalogue', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 20;

      
      for (let i = 0; i < services.length; i++) {
        const service = services[i];
        
        
        if (yPosition > pageHeight - 60) {
          doc.addPage();
          yPosition = 20;
        }

        
        doc.setDrawColor(200, 200, 200);
        doc.setFillColor(250, 250, 250);
        doc.roundedRect(15, yPosition - 5, pageWidth - 30, 50, 3, 3, 'FD');

        
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(220, 38, 38); 
        doc.text(service.pkgName || 'Unnamed Service', 20, yPosition + 5);

        
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(`Category: ${service.category || 'N/A'}`, 20, yPosition + 12);

        
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(34, 197, 94); 
        doc.text(`LKR ${service.price || '0'}`, pageWidth - 20, yPosition + 5, { align: 'right' });
        
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(`${service.duration || '0'} mins`, pageWidth - 20, yPosition + 12, { align: 'right' });

        
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        const description = service.description || 'No description available';
        const splitDescription = doc.splitTextToSize(description, pageWidth - 40);
        doc.text(splitDescription.slice(0, 2), 20, yPosition + 20); 

        
        doc.setFontSize(8);
        if (service.status === 'active') {
          doc.setTextColor(34, 197, 94);
          doc.text('● ACTIVE', 20, yPosition + 38);
        } else {
          doc.setTextColor(239, 68, 68);
          doc.text('● INACTIVE', 20, yPosition + 38);
        }

        yPosition += 60;
      }

     
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Total Services: ${services.length}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

      
      doc.save(`Service-Catalogue-${new Date().toISOString().split('T')[0]}.pdf`);
      showMessage('Service catalogue downloaded successfully!');
    } catch (err) {
      console.error('Error generating PDF:', err);
      showMessage(`Failed to generate PDF: ${err.message}`, 'error');
    } finally {
      setDownloadingPDF(false);
    }
  };

  const handleFormSubmit = async () => {
    try {
      setIsFormOpen(false);
      const wasEditing = selectedService !== null;
      setSelectedService(null);
      await fetchServices();
      showMessage(`Service ${wasEditing ? "updated" : "created"} successfully`);
    } catch (err) {
      console.error("Form submit error:", err);
      showMessage("Operation completed but there was an issue refreshing the list", "error");
    }
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setSelectedService(null);
  };

  const handleViewService = (service) => {
    console.log("Viewing service:", service);
    setViewService(service);
    setIsViewOpen(true);
  };

  const handleEditService = (service) => {
    console.log("Editing service:", service);
    setSelectedService(service);
    setIsFormOpen(true);
  };

  const handleImageError = (e) => {
    console.log("Image load error for:", e.target.src);
    const fallbackDiv = e.target.nextElementSibling;
    if (fallbackDiv) {
      e.target.style.display = 'none';
      fallbackDiv.style.display = 'flex';
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    return `${API_BASE_URL.replace('/api', '')}/${cleanPath}`;
  };

  const filteredServices = services.filter(service =>
    service?.pkgName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service?.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service?.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout userRole="Admin" userName="Admin User">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading services...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="Admin" userName="Admin User">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Service Management</h1>
              <p className="text-gray-600">Manage your service packages and offerings</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg disabled:opacity-50"
                onClick={() => {
                  setSelectedService(null);
                  setIsFormOpen(true);
                }}
                disabled={actionLoading}
              >
                <Plus className="h-5 w-5" /> Add New Service
              </Button>
              <Button
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg"
                onClick={handleViewCatalogue}
              >
                <BookOpen className="h-5 w-5" /> View Catalogue
              </Button>
              <Button
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg disabled:opacity-50"
                onClick={handleDownloadCatalogue}
                disabled={downloadingPDF || services.length === 0}
              >
                <Download className="h-5 w-5" /> 
                {downloadingPDF ? 'Generating...' : 'Download Catalogue'}
              </Button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search services by name, category, or description..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="text-sm text-gray-500 flex items-center">
              {filteredServices.length} of {services.length} services
            </div>
          </div>
        </div>

        
        {message && (
          <div className={`p-4 rounded-lg transition-all duration-500 flex items-start gap-3 ${
            message.type === 'error' 
              ? 'bg-red-50 text-red-800 border border-red-200' 
              : 'bg-green-50 text-green-800 border border-green-200'
          }`}>
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">{message.type === 'error' ? 'Error' : 'Success'}</p>
              <p className="text-sm">{message.text}</p>
            </div>
          </div>
        )}

        {/* Services Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader className="bg-gray-50 border-b border-gray-200">
                <TableRow>
                  <TableHead className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Service
                  </TableHead>
                  <TableHead className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Category
                  </TableHead>
                  <TableHead className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Price & Duration
                  </TableHead>
                  <TableHead className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Status
                  </TableHead>
                  <TableHead className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100">
                {filteredServices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <Package className="h-12 w-12 text-gray-300" />
                        <p className="text-gray-500 text-lg">
                          {searchTerm ? 'No services match your search' : 'No services found'}
                        </p>
                        {!searchTerm && (
                          <Button
                            className="mt-4 bg-red-600 hover:bg-red-700 text-white"
                            onClick={() => {
                              setSelectedService(null);
                              setIsFormOpen(true);
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" /> Add Your First Service
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredServices.map((service) => (
                    <TableRow key={service._id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="px-6 py-4">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 relative">
                            {service.image ? (
                              <>
                                <img
                                  src={getImageUrl(service.image)}
                                  alt={service.pkgName || 'Service'}
                                  className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                  onError={handleImageError}
                                />
                                <div 
                                  className="w-16 h-16 bg-gray-100 rounded-lg border border-gray-200 items-center justify-center hidden"
                                >
                                  <Package className="h-6 w-6 text-gray-400" />
                                </div>
                              </>
                            ) : (
                              <div className="w-16 h-16 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                                <Package className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate mb-1">
                              {service.pkgName || 'Untitled Service'}
                            </h3>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {service.description || 'No description available'}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <Badge className="bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-full">
                          {service.category || 'Uncategorized'}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="font-semibold text-gray-900">
                            LKR {service.price || '0'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {service.duration || '0'} minutes
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            service.status === "active"
                              ? "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                              : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                          }`}
                          onClick={() =>
                            handleToggleActive(service._id, service.status === "active")
                          }
                          disabled={actionLoading === `status-${service._id}`}
                        >
                          {actionLoading === `status-${service._id}` ? (
                            <div className="animate-spin rounded-full h-3 w-3 border border-current border-t-transparent" />
                          ) : (
                            service.status === "active" ? "Active" : "Inactive"
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex justify-center space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="p-2 h-8 w-8 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg disabled:opacity-50"
                            onClick={() => handleViewService(service)}
                            disabled={actionLoading}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="p-2 h-8 w-8 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200 rounded-lg disabled:opacity-50"
                            onClick={() => handleEditService(service)}
                            disabled={actionLoading}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="p-2 h-8 w-8 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-lg disabled:opacity-50"
                            onClick={() => handleDelete(service._id)}
                            disabled={actionLoading}
                          >
                            {actionLoading === `delete-${service._id}` ? (
                              <div className="animate-spin rounded-full h-4 w-4 border border-current border-t-transparent" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Add/Update Service Form Dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-xl">
            <DialogTitle className="text-2xl font-bold mb-6 text-gray-900 border-b border-gray-200 pb-4">
              {selectedService ? "Update Service Package" : "Add New Service Package"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {selectedService 
                ? "Form to update an existing service package with all details including name, category, price, duration, features, and image." 
                : "Form to create a new service package with details including name, category, price, duration, features, and image."
              }
            </DialogDescription>
            <ServicePackageForm
              servicePackage={selectedService}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
            />
          </DialogContent>
        </Dialog>

        {/* View Service Details Dialog */}
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="max-w-2xl bg-white rounded-xl shadow-xl">
            <DialogTitle className="text-2xl font-bold mb-6 text-gray-900 border-b border-gray-200 pb-4">
              Service Details
            </DialogTitle>
            <DialogDescription className="sr-only">
              Detailed view of the selected service package showing all information including name, category, description, price, duration, status, and image.
            </DialogDescription>
            {viewService && (
              <div className="space-y-6">
                <div className="flex items-start space-x-6">
                  {viewService.image ? (
                    <>
                      <img
                        src={getImageUrl(viewService.image)}
                        alt={viewService.pkgName || 'Service'}
                        className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const fallback = e.target.nextElementSibling;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                      <div 
                        className="w-24 h-24 bg-gray-100 rounded-lg border border-gray-200 items-center justify-center hidden"
                      >
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                    </>
                  ) : (
                    <div className="w-24 h-24 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {viewService.pkgName || 'Untitled Service'}
                    </h3>
                    <Badge className="bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-full mb-3">
                      {viewService.category || 'Uncategorized'}
                    </Badge>
                    <p className="text-gray-600">
                      {viewService.description || 'No description available'}
                    </p>
                  </div>
                </div>

                {(viewService.features?.length > 0 || viewService.tags?.length > 0 || viewService.includedServices?.length > 0) && (
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    {viewService.features?.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Features</p>
                        <div className="flex flex-wrap gap-2">
                          {viewService.features.map((feature, index) => (
                            <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {viewService.tags?.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Tags</p>
                        <div className="flex flex-wrap gap-2">
                          {viewService.tags.map((tag, index) => (
                            <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {viewService.includedServices?.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Included Services</p>
                        <div className="flex flex-wrap gap-2">
                          {viewService.includedServices.map((service, index) => (
                            <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {service}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Price</p>
                    <p className="text-lg font-semibold text-gray-900">
                      LKR {viewService.price || '0'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Duration</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {viewService.duration || '0'} minutes
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Status</p>
                    <Badge className={`${
                      viewService.status === "active"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-gray-50 text-gray-700 border border-gray-200"
                    } px-3 py-1 rounded-full`}>
                      {viewService.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  {viewService.createdAt && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Created</p>
                      <p className="text-sm text-gray-900">
                        {new Date(viewService.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <Button
                    variant="ghost"
                    onClick={() => setIsViewOpen(false)}
                    className="px-6 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      setIsViewOpen(false);
                      handleEditService(viewService);
                    }}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                  >
                    Edit Service
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}