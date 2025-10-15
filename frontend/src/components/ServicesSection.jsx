import React from "react";
import { Card, CardContent } from "./ui/card";
import { Wrench, Car, SprayCan, Star, Clock } from "lucide-react";
import { Link } from 'react-router-dom'
import service1 from "../assets/service1.jpg";
import service2 from "../assets/service2.jpg";
import service3 from "../assets/service3.jpg";

const services = [
  {
    title: "Premium Car Detailing",
    description: "Complete interior & exterior detailing with premium products",
    icon: SprayCan,
    image: service1,
    rating: 4.9,
    duration: "3-4 hours",
    price: "₹2,500",
    features: ["Exterior wash & wax", "Interior deep cleaning", "Engine bay cleaning"],
  },
  {
    title: "Complete Maintenance",
    description: "Comprehensive vehicle maintenance and inspection",
    icon: Wrench,
    image: service2,
    rating: 4.8,
    duration: "2-3 hours",
    price: "₹3,200",
    features: ["Multi-point inspection", "Fluid checks", "Filter change"],
  },
  {
    title: "Oil Change Plus",
    description: "Premium oil change with comprehensive vehicle check",
    icon: Wrench,
    image: service3,
    rating: 4.7,
    duration: "45 minutes",
    price: "₹1,200",
    features: ["Premium oil", "Filter replacement", "Fluid top-up"],
  },
  {
    title: "Tire Service & Alignment",
    description: "Complete tire service with wheel alignment",
    icon: Car,
    image: service3,
    rating: 4.8,
    duration: "1-2 hours",
    price: "₹1,800",
    features: ["Tire rotation", "Wheel alignment", "Pressure check"],
  },
];

const ServicesSection = ({ showHeader = true }) => {
  return (
    <section className="py-20 bg-secondary-light">
      <div className="max-w-8xl mx-auto px-8 sm:px-12 lg:px-16 xl:px-20">
        {showHeader && (
          <div className="text-center mb-14">
            <h2 className="text-5xl font-bold text-foreground mb-4">Choose Your Service Package</h2>
            <p className="text-xl text-muted-foreground">Professional automotive services with expert care for your vehicle</p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 xl:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-10">
          {services.map((service, idx) => {
            const Icon = service.icon;
            return (
              <Card key={idx} className="overflow-hidden border border-border hover:shadow-lg-custom transition-all duration-300 bg-card">
                <div className="relative">
                  <img 
                    src={service.image} 
                    alt={service.title} 
                    className="w-full h-56 object-cover"
                  />
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 text-secondary px-2 py-1 rounded-full shadow-sm">
                    <Star className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold">{service.rating}</span>
                  </div>
                </div>

                <CardContent className="p-7 space-y-5">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-foreground">{service.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                  </div>

                  <div className="flex items-center justify-between bg-primary-muted/40 border border-primary/30 rounded-lg px-4 py-2.5">
                    <div className="flex items-center gap-2 text-foreground">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">{service.duration}</span>
                    </div>
                    <div className="text-2xl font-extrabold text-primary">{service.price}</div>
                  </div>

                  <ul className="space-y-2">
                    {service.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-3 text-foreground">
                        <span className="mt-2 h-2 w-2 rounded-full bg-destructive" />
                        <span className="text-sm">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-1 flex items-center gap-3">
                    <Link to="/services" className="inline-flex items-center bg-primary text-primary-foreground hover:bg-primary-dark px-4 py-2 rounded-md text-sm font-semibold">
                      Book Now
                    </Link>
                    <Link to="/services" className="text-sm font-semibold text-primary hover:underline">
                      View Details
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
