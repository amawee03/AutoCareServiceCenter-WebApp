import React from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Clock, Shield, Star, ArrowRight, Calendar, Phone } from "lucide-react";
import heroImage from "../assets/hero-image.jpg";

const HeroSection = () => {
  const features = [
    { icon: Clock, title: "Quick Service", description: "Fast and efficient automotive care" },
    { icon: Shield, title: "Quality Guaranteed", description: "Premium service with warranty" },
    { icon: Star, title: "Expert Technicians", description: "Certified professionals you can trust" }
  ];

  return (
    <section className="relative min-h-[90vh] flex items-center">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/60" />
      </div>

      <div className="relative z-10 max-w-8xl mx-auto px-8 sm:px-12 lg:px-16 xl:px-20 w-full">
        <div className="grid lg:grid-cols-2 gap-16 xl:gap-24 items-center">
          <div className="space-y-12">
            <div className="space-y-8">
              <h1 className="text-6xl lg:text-7xl xl:text-8xl font-bold text-foreground leading-tight">
                Premium <span className="text-primary block">AutoCare</span> Service
              </h1>
              <p className="text-2xl lg:text-3xl text-muted-foreground max-w-2xl leading-relaxed">
                Professional automotive detailing and maintenance services 
                with cutting-edge technology and expert care.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              <Button size="lg" className="bg-gradient-primary text-primary-foreground hover:bg-primary-dark shadow-red text-lg px-8 py-4 h-14">
                <Calendar className="mr-3 h-6 w-6" /> Book Service Now
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
              <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground text-lg px-8 py-4 h-14">
                <Phone className="mr-3 h-6 w-6" /> Call (555) 123-4567
              </Button>
            </div>

            <div className="flex items-center space-x-12 pt-8">
              <div className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-primary">500+</div>
                <div className="text-base lg:text-lg text-muted-foreground">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-primary">5★</div>
                <div className="text-base lg:text-lg text-muted-foreground">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-primary">24/7</div>
                <div className="text-base lg:text-lg text-muted-foreground">Support</div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow duration-300 hover:bg-card-hover">
                  <CardContent className="p-10 flex items-start space-x-8">
                    <div className="bg-primary p-4 rounded-lg">
                      <Icon className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="text-xl lg:text-2xl font-semibold text-foreground mb-3">{feature.title}</h3>
                      <p className="text-lg text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
