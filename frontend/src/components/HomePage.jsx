import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layouts/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Package, Wrench, Car, SprayCan, Star, Calendar } from "lucide-react";
import logoImage from "@/assets/Logo.jpg";
import Footer from '../components/layouts/FooterSection';

const HomePage = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get("http://localhost:5001/api/packages");
        const activeServices = response.data.filter(s => s.status === "active");
        setServices(activeServices.slice(0, 3)); // First 3 services
      } catch (err) {
        console.error("Error fetching services:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const getServiceIcon = (category) => {
    const iconMap = {
      Maintenance: Wrench,
      Exterior: Car,
      "Interior & Detailing": SprayCan,
      Specialized: Star,
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

  const handleViewService = (service) => {
    navigate("/services", { state: { service } });
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-black text-white">
          Loading services...
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 text-white">

        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-red-700 via-red-800 to-black py-28 text-center">
          <img src={logoImage} alt="AutoCare Logo" className="mx-auto mb-6 w-36 h-auto" />
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Expert Automotive Care</h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-3xl mx-auto">
            Premium services for your vehicle in Sri Lanka. Quality guaranteed, satisfaction delivered.
          </p>
          <div className="flex justify-center gap-6 flex-wrap">
            <Button
              onClick={() => navigate("/services")}
              className="bg-red-600 hover:bg-red-700 px-8 py-4 rounded-2xl font-semibold text-lg"
            >
              Explore Services
            </Button>
          </div>
        </div>

        {/* Services Section */}
        <div className="py-24">
          <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16 xl:px-20">
            <h2 className="text-4xl font-bold mb-12 text-center text-white">
              Featured Services
            </h2>
            <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-10">
              {services.map(service => {
                const ServiceIcon = getServiceIcon(service.category);
                const imageUrl = getImageUrl(service.image);

                return (
                  <Card
                    key={service._id}
                    className="group overflow-hidden border border-gray-800 shadow-xl hover:shadow-2xl transition-all cursor-pointer transform hover:-translate-y-3 bg-black rounded-3xl min-h-[520px] flex flex-col"
                    onClick={() => handleViewService(service)}
                  >
                    <div className="relative overflow-hidden h-72">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={service.pkgName}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                          <ServiceIcon className="h-24 w-24 text-red-400" />
                        </div>
                      )}
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
                        <div className="bg-black border-2 border-red-700 rounded-2xl p-6 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="bg-red-600 p-2 rounded-lg">
                              <Clock className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-400">Duration</p>
                              <p className="text-lg font-bold text-white">{service.duration} min</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-400">Price</p>
                            <div className="flex items-baseline gap-1">
                              <span className="text-sm font-medium text-gray-400">LKR</span>
                              <span className="text-3xl font-bold text-red-500">
                                {parseInt(service.price).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <Button
                          onClick={() => handleViewService(service)}
                          className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                        >
                          View Details & Book Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="py-24 bg-black/80 border-t border-red-700">
          <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16 xl:px-20 text-center">
            <h2 className="text-4xl font-bold mb-12 text-white">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-12">
              <div className="bg-black border border-red-700 p-8 rounded-2xl flex flex-col items-center text-center">
                <Package className="h-12 w-12 text-red-500 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Select Service</h3>
                <p className="text-gray-300">Choose the service package that suits your vehicle needs.</p>
              </div>
              <div className="bg-black border border-red-700 p-8 rounded-2xl flex flex-col items-center text-center">
                <Calendar className="h-12 w-12 text-red-500 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Book Appointment</h3>
                <p className="text-gray-300">Pick a convenient date and time for your appointment.</p>
              </div>
              <div className="bg-black border border-red-700 p-8 rounded-2xl flex flex-col items-center text-center">
                <Clock className="h-12 w-12 text-red-500 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Confirm & Pay</h3>
                <p className="text-gray-300">Finalize your booking and proceed to our secure payment system.</p>
              </div>
            </div>
          </div>
        </div>

{/* Footer */}
      <Footer />
      </div>
    </Layout>
    
  );
};

export default HomePage;
