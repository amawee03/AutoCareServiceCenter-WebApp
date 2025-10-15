import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Download, 
  Package, 
  Clock, 
  DollarSign, 
  Loader2,
  AlertCircle,
  CheckCircle,
  FileText
} from 'lucide-react';

const ServiceCatalogue = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get('http://localhost:5001/api/packages');
      setServices(response.data);
    } catch (err) {
      setError('Failed to load service catalogue');
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadCatalogue = () => {
    if (services.length === 0) return;

    const catalogueContent = `
AUTOCARE SERVICE CATALOGUE
===========================

Generated: ${new Date().toLocaleDateString()}

${services.map((service, index) => `
${index + 1}. ${service.pkgName.toUpperCase()}
${'='.repeat(service.pkgName.length + 4)}

Category: ${service.category}
Description: ${service.description}
Duration: ${service.duration} minutes
Price: LKR ${service.price.toLocaleString()}

${service.features && service.features.length > 0 ? `Features:
${service.features.map(feature => `• ${feature}`).join('\n')}` : ''}

${'-'.repeat(50)}
`).join('\n')}

CONTACT INFORMATION
==================
For bookings and inquiries:
• Visit our website
• Call our booking hotline
• Visit our service center

---
AutoCare Service Management System
Generated on ${new Date().toLocaleString()}
    `;

    const blob = new Blob([catalogueContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `autocare-service-catalogue-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const downloadJSONCatalogue = () => {
    if (services.length === 0) return;

    const catalogueData = {
      title: "AutoCare Service Catalogue",
      generated: new Date().toISOString(),
      totalServices: services.length,
      services: services.map(service => ({
        id: service._id,
        name: service.pkgName,
        category: service.category,
        description: service.description,
        duration: service.duration,
        price: service.price,
        features: service.features || [],
        image: service.image
      }))
    };

    const blob = new Blob([JSON.stringify(catalogueData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `autocare-service-catalogue-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-red-600" />
          <p className="text-gray-600">Loading service catalogue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="h-8 w-8 text-red-600" />
              Service Catalogue
            </h1>
            <p className="text-gray-600 mt-2">
              Download our complete service catalogue with detailed information about all available services.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={downloadCatalogue}
              disabled={downloading || services.length === 0}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {downloading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Download TXT
            </Button>
            <Button
              onClick={downloadJSONCatalogue}
              disabled={downloading || services.length === 0}
              variant="outline"
              className="text-blue-600 border-blue-600 hover:bg-blue-50"
            >
              <FileText className="h-4 w-4 mr-2" />
              Download JSON
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Error</span>
            </div>
            <p className="text-red-600 mt-1">{error}</p>
          </div>
        )}

        {services.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Services Available</h3>
            <p className="text-gray-500">Service catalogue is currently empty.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-green-800">Catalogue Summary</h3>
                </div>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{services.length}</div>
                    <div className="text-sm text-green-700">Total Services</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {new Set(services.map(s => s.category)).size}
                    </div>
                    <div className="text-sm text-green-700">Categories</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      LKR {services.reduce((sum, s) => sum + s.price, 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-green-700">Total Value</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {services.reduce((sum, s) => sum + s.duration, 0)}
                    </div>
                    <div className="text-sm text-green-700">Total Minutes</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <Card key={service._id} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{service.pkgName}</h3>
                      <Badge variant="secondary" className="bg-red-100 text-red-800">
                        {service.category}
                      </Badge>
                    </div>

                    {service.image && (
                      <div className="mb-4">
                        <img
                          src={`http://localhost:5001/uploads/${service.image.split('/').pop()}`}
                          alt={service.pkgName}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>
                    )}

                    <p className="text-gray-600 text-sm mb-4">{service.description}</p>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{service.duration} minutes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-semibold text-red-600">
                          LKR {service.price.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {service.features && service.features.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Features:</h4>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {service.features.map((feature, index) => (
                            <li key={index}>• {feature}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Download formats: TXT (human-readable) or JSON (structured data)
          </p>
        </div>
      </div>
    </div>
  );
};

export default ServiceCatalogue;
