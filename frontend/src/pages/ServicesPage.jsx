import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Footer from '../components/layouts/FooterSection';

import {
  Wrench,
  Car,
  SprayCan,
  Star,
  Clock,
  Package,
  X,
  Search,
  Filter,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  Calendar,
  DollarSign,
  Download,
} from "lucide-react";

import Layout from "@/components/layouts/Layout";

const ServicesPage = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [error, setError] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const categories = [
    "All",
    "Maintenance",
    "Exterior",
    "Interior & Detailing",
    "Specialized",
    "Engine & Mechanical",
  ];

  const fetchServices = async () => {
    try {
      const response = await axios.get("http://localhost:5001/api/packages");
      const activeServices = response.data.filter(
        (service) => service.status === "active"
      );
      setServices(activeServices);
      setError(null);
    } catch (err) {
      console.error("Error fetching services:", err);
      setError("Failed to load services. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const getServiceIcon = (category) => {
    const iconMap = {
      "Maintenance": Wrench,
      "Exterior": Car,
      "Interior & Detailing": SprayCan,
      "Specialized": Star,
      "Engine & Mechanical": Wrench,
    };
    return iconMap[category] || Package;
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    const cleanPath = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;
    return `http://localhost:5001/${cleanPath}`;
  };

  const handleServiceClick = (service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleImageError = (e) => {
    e.target.style.display = "none";
    e.target.nextSibling.style.display = "flex";
  };

  const handleBookService = (service) => {
    localStorage.setItem("selectedService", JSON.stringify(service)); 
    navigate("/appointments", { state: { service } });
  };

  const handleDownloadCatalogue = () => {
    setIsGeneratingPDF(true);
    
    // Calculate statistics
    const stats = {
      total: services.length,
      maintenance: services.filter(s => s.category === "Maintenance").length,
      exterior: services.filter(s => s.category === "Exterior").length,
      interior: services.filter(s => s.category === "Interior & Detailing").length,
      specialized: services.filter(s => s.category === "Specialized").length,
      engine: services.filter(s => s.category === "Engine & Mechanical").length,
    };
    
    // Calculate total price
    const totalPrice = services.reduce((sum, service) => sum + (parseInt(service.price) || 0), 0);
    
    // Create a new window for the report
    const reportWindow = window.open('', '_blank');
    
    // Generate the HTML for the report
    const reportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>AutoCare Services Catalogue</title>
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
            color: #333;
          }
          
          .report-header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #dc2626;
            padding-bottom: 20px;
          }
          
          .report-header h1 {
            font-size: 28px;
            color: #dc2626;
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
          
          .contact-info {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-bottom: 30px;
            color: #666;
            font-size: 12px;
          }
          
          .contact-item {
            display: flex;
            align-items: center;
            gap: 5px;
          }
          
          .stats-section {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
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
            color: #dc2626;
            margin-bottom: 5px;
          }
          
          .stat-box p {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
          }
          
          .services-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            border: 2px solid #333;
            page-break-inside: auto;
          }
          
          .services-table th {
            background-color: #dc2626;
            color: white;
            padding: 12px;
            text-align: left;
            font-size: 12px;
            font-weight: 600;
            border: 1px solid #333;
          }
          
          .services-table td {
            padding: 10px 12px;
            border: 1px solid #333;
            font-size: 11px;
            color: #333;
            vertical-align: top;
          }
          
          .services-table tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          
          .services-table tfoot td {
            font-weight: bold;
            background-color: #f0f0f0;
            border: 1px solid #333;
            padding: 12px;
            font-size: 12px;
          }
          
          .category-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 3px;
            font-size: 10px;
            font-weight: 600;
            background-color: #f3f4f6;
            color: #374151;
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
            
            .services-table {
              page-break-inside: auto;
              border: 2px solid #333 !important;
            }
            
            .services-table th, .services-table td {
              border: 1px solid #333 !important;
            }
            
            .services-table tr {
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
          <h1>AutoCare Services Catalogue</h1>
          <p>Professional automotive care services in Sri Lanka</p>
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
        
        <div class="contact-info">
          <div class="contact-item">
            <span>📍</span>
            <span>Colombo, Sri Lanka</span>
          </div>
          <div class="contact-item">
            <span>📞</span>
            <span>+94 11 234 5678</span>
          </div>
          <div class="contact-item">
            <span>✉️</span>
            <span>info@autocare.lk</span>
          </div>
        </div>
        
        <div class="stats-section">
          <div class="stat-box">
            <h3>${stats.total}</h3>
            <p>Total Services</p>
          </div>
          <div class="stat-box">
            <h3>${stats.maintenance + stats.engine}</h3>
            <p>Technical Services</p>
          </div>
          <div class="stat-box">
            <h3>${stats.exterior + stats.interior + stats.specialized}</h3>
            <p>Care Services</p>
          </div>
        </div>
        
        <table class="services-table">
          <thead>
            <tr>
              <th style="width: 20%;">Service Name</th>
              <th style="width: 15%;">Category</th>
              <th style="width: 40%;">Description</th>
              <th style="width: 15%;">Price (LKR)</th>
              <th style="width: 10%;">Duration (min)</th>
            </tr>
          </thead>
          <tbody>
            ${services.map(service => `
              <tr>
                <td style="width: 20%;">${service.pkgName || 'N/A'}</td>
                <td style="width: 15%;"><span class="category-badge">${service.category || 'N/A'}</span></td>
                <td style="width: 40%;">${service.description ? service.description.substring(0, 100) + (service.description.length > 100 ? '...' : '') : 'N/A'}</td>
                <td style="width: 15%;">${parseInt(service.price || 0).toLocaleString()}</td>
                <td style="width: 10%;">${service.duration || 'N/A'}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="text-align: right; width: 75%;">TOTAL:</td>
              <td style="width: 15%;">${totalPrice.toLocaleString()}</td>
              <td style="width: 10%;">-</td>
            </tr>
          </tfoot>
        </table>
        
        <div class="approval-section">
          <div class="approval-box">
            <div class="approval-label">Service Manager Signature:</div>
            <div class="signature-line"></div>
            <div class="signature-text">Signature</div>
          </div>
          <div class="approval-box">
            <div class="approval-label">Approved Date:</div>
            <input type="date" class="date-input" value="${new Date().toISOString().split('T')[0]}" />
          </div>
        </div>
        
        <div class="report-footer">
          <p>This catalogue contains ${services.length} service(s)</p>
          <p>&copy; ${new Date().getFullYear()} - AutoCare Service Management System</p>
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
    
    setIsGeneratingPDF(false);
  };

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.pkgName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.tags?.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesCategory =
      selectedCategory === "All" || service.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 flex justify-center items-center">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-300 border-t-red-600 mx-auto mb-6"></div>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Loading Premium Services
            </h3>
            <p className="text-gray-300">
              Preparing our best automotive care options for you...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 pt-24 pb-10">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-red-700 via-red-800 to-black text-white py-24 overflow-hidden">
          <div className="absolute inset-0 bg-black/40"></div>

          <div className="relative max-w-7xl mx-auto px-8 sm:px-12 lg:px-16 xl:px-20 text-center">
            <h1 className="text-6xl font-bold mb-6 text-white">
              Expert Automotive Care
            </h1>
            <p className="text-xl text-gray-200 mb-12 max-w-3xl mx-auto leading-relaxed">
              Professional automotive services with expert care for your vehicle
              in Sri Lanka. Quality guaranteed, satisfaction delivered.
            </p>

            <div className="flex flex-wrap justify-center items-center gap-8 text-gray-200">
              <div className="flex items-center bg-black/30 rounded-lg px-4 py-2">
                <MapPin className="h-5 w-5 mr-2 text-red-400" />
                <span className="font-medium">Colombo, Sri Lanka</span>
              </div>
              <div className="flex items-center bg-black/30 rounded-lg px-4 py-2">
                <Phone className="h-5 w-5 mr-2 text-red-400" />
                <span className="font-medium">+94 11 234 5678</span>
              </div>
              <div className="flex items-center bg-black/30 rounded-lg px-4 py-2">
                <Mail className="h-5 w-5 mr-2 text-red-400" />
                <span className="font-medium">info@autocare.lk</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-black/80 backdrop-blur-sm shadow-xl border-b border-red-700 py-8 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16 xl:px-20">
            <div className="flex flex-col lg:flex-row gap-6 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search for services..."
                  className="w-full pl-12 pr-4 py-4 border border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all shadow-sm bg-black/90 text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center bg-black/60 rounded-xl p-1 border border-gray-700">
                  <Filter className="h-5 w-5 text-gray-400 mx-3" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-3 border-0 rounded-lg focus:ring-2 focus:ring-red-500 transition-colors bg-transparent font-medium text-white"
                  >
                    {categories.map((category) => (
                      <option
                        key={category}
                        value={category}
                        className="bg-black text-white"
                      >
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  onClick={handleDownloadCatalogue}
                  disabled={isGeneratingPDF || services.length === 0}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 border border-red-500"
                >
                  {isGeneratingPDF ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      <span>Download Catalogue</span>
                    </>
                  )}
                </Button>

                <div className="bg-red-900 border border-red-700 text-white px-4 py-3 rounded-xl font-medium">
                  {filteredServices.length} service
                  {filteredServices.length !== 1 ? "s" : ""} available
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="py-24">
          <div className="max-w-8xl mx-auto px-8 sm:px-12 lg:px-16 xl:px-24">
            {filteredServices.length === 0 ? (
              <div className="text-center py-24">
                <div className="bg-black/60 rounded-3xl shadow-2xl p-16 max-w-lg mx-auto">
                  <Package className="h-24 w-24 text-gray-500 mx-auto mb-8" />
                  <h3 className="text-3xl font-bold text-white mb-6">
                    No Services Found
                  </h3>
                  <p className="text-gray-400 mb-8 text-lg leading-relaxed">
                    Try adjusting your search criteria or filters
                  </p>
                  <Button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("All");
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-10 py-4 rounded-2xl text-lg font-semibold"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid lg:grid-cols-2 xl:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-10">
                {filteredServices.map((service) => {
                  const ServiceIcon = getServiceIcon(service.category);
                  const imageUrl = getImageUrl(service.image);

                  return (
                    <Card
                      key={service._id}
                      className="group overflow-hidden border border-gray-800 shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-3 bg-black rounded-3xl min-h-[520px] flex flex-col"
                      onClick={() => handleServiceClick(service)}
                    >
                      <div className="relative overflow-hidden">
                        {imageUrl ? (
                          <>
                            <img
                              src={imageUrl}
                              alt={service.pkgName}
                              className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-110"
                              onError={handleImageError}
                            />
                            <div className="w-full h-72 bg-gradient-to-br from-gray-800 to-black items-center justify-center hidden">
                              <ServiceIcon className="h-24 w-24 text-red-400" />
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-72 bg-gradient-to-br from-gray-800 to-black flex items-center justify-center">
                            <ServiceIcon className="h-24 w-24 text-red-400" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute top-6 right-6">
                          <Badge className="bg-red-600 text-white px-4 py-2 shadow-lg text-sm font-semibold">
                            {service.category}
                          </Badge>
                        </div>
                      </div>

                      <CardContent className="p-8 space-y-6 flex-1 flex flex-col">
                        <div className="space-y-4 flex-1">
                          <h3 className="text-2xl font-bold text-white group-hover:text-red-500 transition-colors leading-tight">
                            {service.pkgName}
                          </h3>
                          <p className="text-base text-gray-300 leading-relaxed line-clamp-3">
                            {service.description}
                          </p>
                        </div>

                        <div className="space-y-4">
                          <div className="bg-black border-2 border-red-700 rounded-2xl p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="bg-red-600 p-2 rounded-lg">
                                  <Clock className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-400">
                                    Duration
                                  </p>
                                  <p className="text-lg font-bold text-white">
                                    {service.duration} min
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-gray-400">
                                  Price
                                </p>
                                <div className="flex items-baseline gap-1">
                                  <span className="text-sm font-medium text-gray-400">
                                    LKR
                                  </span>
                                  <span className="text-3xl font-bold text-red-500">
                                    {parseInt(service.price).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <Button className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                            View Details & Book Now
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-black text-white rounded-2xl border border-red-700 shadow-2xl">
            <DialogDescription className="sr-only">
              Detailed view of the selected service package
            </DialogDescription>
            {selectedService && (
              <div className="space-y-8">
                <div className="relative">
                  {selectedService.image ? (
                    <>
                      <img
                        src={getImageUrl(selectedService.image)}
                        alt={selectedService.pkgName}
                        className="w-full h-64 object-cover rounded-xl"
                        onError={handleImageError}
                      />
                      <div className="w-full h-64 bg-gradient-to-br from-gray-800 to-black items-center justify-center rounded-xl hidden">
                        <Package className="h-16 w-16 text-red-400" />
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-64 bg-gradient-to-br from-gray-800 to-black flex items-center justify-center rounded-xl">
                      <Package className="h-16 w-16 text-red-400" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-red-600 text-white px-4 py-2 text-sm font-semibold">
                      {selectedService.category}
                    </Badge>
                  </div>
                </div>

                <div>
                  <DialogTitle className="text-3xl font-bold text-white mb-4">
                    {selectedService.pkgName}
                  </DialogTitle>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    {selectedService.description}
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-black border border-red-700 p-6 rounded-xl">
                    <DollarSign className="h-8 w-8 text-red-500 mb-3" />
                    <h4 className="font-semibold text-white mb-1">Price</h4>
                    <p className="text-2xl font-bold text-red-500">
                      LKR {parseInt(selectedService.price).toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-black border border-red-700 p-6 rounded-xl">
                    <Clock className="h-8 w-8 text-red-500 mb-3" />
                    <h4 className="font-semibold text-white mb-1">Duration</h4>
                    <p className="text-2xl font-bold text-red-500">
                      {selectedService.duration} minutes
                    </p>
                  </div>

                  <div className="bg-black border border-red-700 p-6 rounded-xl">
                    <Star className="h-8 w-8 text-red-500 mb-3" />
                    <h4 className="font-semibold text-white mb-1">Status</h4>
                    <p className="text-2xl font-bold text-red-500">
                      {selectedService.status === "active"
                        ? "Available"
                        : "Unavailable"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 pt-6 border-t border-gray-700">
                  <Button
                    onClick={() => setIsModalOpen(false)}
                    variant="outline"
                    className="flex-1 py-3 rounded-xl border-2 border-gray-600 hover:bg-gray-800 text-white"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => handleBookService(selectedService)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center"
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    Book This Service
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
      {/* Footer */}
      <Footer />
    </Layout>
  );
};

export default ServicesPage;