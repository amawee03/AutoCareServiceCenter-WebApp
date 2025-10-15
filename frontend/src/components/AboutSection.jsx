import React from "react";

const AboutSection = () => {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-8 sm:px-12 lg:px-16 xl:px-20 text-center">
        <div className="space-y-8">
          <h2 className="text-5xl lg:text-6xl font-bold text-foreground mb-8">About AutoCare</h2>
          <div className="max-w-4xl mx-auto">
            <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed mb-8">
              At AutoCare, we combine advanced technology and expert technicians 
              to provide high-quality automotive detailing and maintenance. 
              Our mission is to keep your vehicle looking and running like new 
              while delivering unmatched customer satisfaction.
            </p>
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="text-center space-y-3">
                <div className="text-4xl lg:text-5xl font-bold text-primary">10+</div>
                <div className="text-lg font-semibold text-foreground">Years Experience</div>
                <div className="text-muted-foreground">Serving the community</div>
              </div>
              <div className="text-center space-y-3">
                <div className="text-4xl lg:text-5xl font-bold text-primary">500+</div>
                <div className="text-lg font-semibold text-foreground">Happy Customers</div>
                <div className="text-muted-foreground">Trust our expertise</div>
              </div>
              <div className="text-center space-y-3">
                <div className="text-4xl lg:text-5xl font-bold text-primary">24/7</div>
                <div className="text-lg font-semibold text-foreground">Support</div>
                <div className="text-muted-foreground">Always here for you</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
