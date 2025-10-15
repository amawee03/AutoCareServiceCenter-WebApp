import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Clock, Star, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ServiceSelection = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch('/api/admin/services');
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setServices(data);
      } catch (error) {
        console.error("Failed to fetch services:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const handleServiceSelect = (service) => {
    setSelectedService(service);
  };

  const handleContinue = () => {
    if (selectedService) {
      navigate('/appointment/calendar', { 
        state: { 
          selectedService: selectedService 
        } 
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16 xl:px-20">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Select Your Service
          </h1>
          <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Choose from our professional automotive service packages
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid lg:grid-cols-3 xl:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-8 mb-12">
          {services.map((service, idx) => (
            <Card 
              key={service._id || idx} 
              className={`overflow-hidden border-2 transition-all duration-300 cursor-pointer hover:shadow-lg-custom ${
                selectedService?._id === service._id 
                  ? 'border-primary shadow-lg-custom bg-primary-muted/20' 
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => handleServiceSelect(service)}
            >
              <div className="relative">
                <img
                  src={service.image ? `/uploads/${service.image.split('/').pop()}` : 'https://via.placeholder.com/400x250?text=No+Image'}
                  alt={service.pkgName}
                  className="w-full h-56 object-cover"
                />
                {selectedService?._id === service._id && (
                  <div className="absolute top-3 right-3 bg-primary text-primary-foreground p-2 rounded-full">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                )}
                <div className="absolute top-3 left-3 flex items-center gap-1 bg-white/90 text-secondary px-2 py-1 rounded-full shadow-sm">
                  <Star className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">{service.rating || '4.8'}</span>
                </div>
              </div>

              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-foreground">{service.pkgName}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                    {service.description}
                  </p>
                </div>

                <div className="flex items-center justify-between bg-primary-muted/40 border border-primary/30 rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2 text-foreground">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{service.duration} minutes</span>
                  </div>
                  <div className="text-2xl font-extrabold text-primary">LKR {service.price.toLocaleString()}</div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Features:</p>
                  <ul className="space-y-1">
                    {service.features && service.features.slice(0, 3).map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                    {service.features && service.features.length > 3 && (
                      <li className="text-sm text-primary font-medium">
                        +{service.features.length - 3} more features
                      </li>
                    )}
                  </ul>
                </div>

                <Badge variant="secondary" className="w-fit">
                  {service.category}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Continue Button */}
        {selectedService && (
          <div className="text-center">
            <div className="bg-card border border-border rounded-xl p-6 mb-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-semibold text-foreground mb-4">Selected Service</h3>
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <p className="text-lg font-medium text-foreground">{selectedService.pkgName}</p>
                  <p className="text-sm text-muted-foreground">{selectedService.duration} • {selectedService.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">LKR {selectedService.price.toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary-dark text-primary-foreground px-12 py-4 text-xl h-16"
              onClick={handleContinue}
            >
              Continue to Calendar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceSelection;
