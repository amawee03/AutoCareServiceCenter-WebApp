import React from 'react';
import heroImage from '@/assets/hero-image.jpg';
import Footer from '../components/layouts/FooterSection';

export default function AboutPage() {
  return (
    <div className="bg-gradient-to-br from-black via-gray-900 to-red-900 text-white min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center py-24">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-8 sm:px-12 lg:px-16 xl:px-20 text-center">
          <h1 className="text-6xl lg:text-7xl font-bold mb-6">
            About <span className="text-red-600">AutoCare</span>
          </h1>
          <p className="text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Precision detailing and maintenance powered by experts and technology.
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-28">
        <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16 xl:px-20 grid lg:grid-cols-2 gap-20 items-start">
          {/* Text Content */}
          <div className="space-y-10">
            <h2 className="text-5xl lg:text-6xl font-bold text-white">Our Story</h2>
            <p className="text-xl lg:text-2xl text-gray-300 leading-relaxed max-w-2xl">
              For over a decade, AutoCare has delivered premium automotive services with a single goal:
              keep your vehicle looking and running like new. Our certified technicians combine
              modern tools with meticulous craftsmanship to achieve showroom results.
            </p>

            <ul className="grid sm:grid-cols-2 gap-5 text-gray-300 max-w-3xl">
              <li className="flex items-start gap-4">
                <span className="mt-2 h-2 w-2 rounded-full bg-red-600" /> Ceramic Coating & Paint Correction
              </li>
              <li className="flex items-start gap-4">
                <span className="mt-2 h-2 w-2 rounded-full bg-red-600" /> Engine Diagnostics & Maintenance
              </li>
              <li className="flex items-start gap-4">
                <span className="mt-2 h-2 w-2 rounded-full bg-red-600" /> Interior Deep Cleaning
              </li>
              <li className="flex items-start gap-4">
                <span className="mt-2 h-2 w-2 rounded-full bg-red-600" /> Body Repair & Refinishing
              </li>
            </ul>

            <div className="pt-6">
              <a
                href="/services"
                className="inline-block bg-red-600 hover:bg-red-700 text-white px-10 py-4 rounded-2xl text-lg font-semibold transition-all"
              >
                Explore Services
              </a>
            </div>
          </div>

          {/* Images & Stats */}
          <div className="relative space-y-8">
            <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-xl border border-gray-700">
              <img src={heroImage} alt="AutoCare workshop" className="w-full h-full object-cover" />
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-black/60 border border-red-700 rounded-2xl p-6 text-center">
                <div className="text-4xl font-bold text-red-600">10+</div>
                <div className="text-gray-300 mt-2">Years</div>
              </div>
              <div className="bg-black/60 border border-red-700 rounded-2xl p-6 text-center">
                <div className="text-4xl font-bold text-red-600">500+</div>
                <div className="text-gray-300 mt-2">Happy Clients</div>
              </div>
              <div className="bg-black/60 border border-red-700 rounded-2xl p-6 text-center">
                <div className="text-4xl font-bold text-red-600">24/7</div>
                <div className="text-gray-300 mt-2">Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Spacer */}
      <div className="h-10 sm:h-16 lg:h-24" />

      {/* Footer */}
      <Footer />
    </div>
  );
}
