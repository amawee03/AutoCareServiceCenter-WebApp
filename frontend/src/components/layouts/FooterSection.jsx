import React from 'react';
import {
  FacebookIcon,
  TwitterIcon,
  InstagramIcon,
  LinkedinIcon,
  MapPin,
  Phone,
  Mail,
  Wrench,
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-black via-gray-900 to-black text-white border-t border-red-900/50">
      <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16 xl:px-20 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-red-600 to-red-700 p-3 rounded-xl">
                <Wrench className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">
                Auto<span className="text-red-600">Care</span>
              </h3>
            </div>
            <p className="text-gray-400 text-base leading-relaxed">
              Professional automotive services for all your vehicle needs. Quality guaranteed, satisfaction delivered.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="bg-gray-800 hover:bg-red-600 p-3 rounded-lg transition-all duration-300 transform hover:scale-110"
                aria-label="Facebook"
              >
                <FacebookIcon size={20} />
              </a>
              <a 
                href="#" 
                className="bg-gray-800 hover:bg-red-600 p-3 rounded-lg transition-all duration-300 transform hover:scale-110"
                aria-label="Twitter"
              >
                <TwitterIcon size={20} />
              </a>
              <a 
                href="#" 
                className="bg-gray-800 hover:bg-red-600 p-3 rounded-lg transition-all duration-300 transform hover:scale-110"
                aria-label="Instagram"
              >
                <InstagramIcon size={20} />
              </a>
              <a 
                href="#" 
                className="bg-gray-800 hover:bg-red-600 p-3 rounded-lg transition-all duration-300 transform hover:scale-110"
                aria-label="LinkedIn"
              >
                <LinkedinIcon size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-xl font-bold text-white border-b border-red-900/50 pb-3">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <a 
                  href="/" 
                  className="text-gray-400 hover:text-red-500 transition-colors duration-300 flex items-center group"
                >
                  <span className="w-0 group-hover:w-2 h-0.5 bg-red-500 mr-0 group-hover:mr-2 transition-all duration-300"></span>
                  Home
                </a>
              </li>
              <li>
                <a 
                  href="/services" 
                  className="text-gray-400 hover:text-red-500 transition-colors duration-300 flex items-center group"
                >
                  <span className="w-0 group-hover:w-2 h-0.5 bg-red-500 mr-0 group-hover:mr-2 transition-all duration-300"></span>
                  Services
                </a>
              </li>
              <li>
                <a 
                  href="/about" 
                  className="text-gray-400 hover:text-red-500 transition-colors duration-300 flex items-center group"
                >
                  <span className="w-0 group-hover:w-2 h-0.5 bg-red-500 mr-0 group-hover:mr-2 transition-all duration-300"></span>
                  About Us
                </a>
              </li>
              <li>
                <a 
                  href="/appointments" 
                  className="text-gray-400 hover:text-red-500 transition-colors duration-300 flex items-center group"
                >
                  <span className="w-0 group-hover:w-2 h-0.5 bg-red-500 mr-0 group-hover:mr-2 transition-all duration-300"></span>
                  Book Appointment
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-6">
            <h4 className="text-xl font-bold text-white border-b border-red-900/50 pb-3">Our Services</h4>
            <ul className="space-y-3">
              <li className="text-gray-400 hover:text-red-500 transition-colors duration-300 cursor-pointer">
                Oil Change & Maintenance
              </li>
              <li className="text-gray-400 hover:text-red-500 transition-colors duration-300 cursor-pointer">
                Engine Diagnostics
              </li>
              <li className="text-gray-400 hover:text-red-500 transition-colors duration-300 cursor-pointer">
                Paint & Body Work
              </li>
              <li className="text-gray-400 hover:text-red-500 transition-colors duration-300 cursor-pointer">
                Interior Detailing
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h4 className="text-xl font-bold text-white border-b border-red-900/50 pb-3">Contact Us</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 group">
                <MapPin className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
                <div className="text-gray-400 group-hover:text-white transition-colors duration-300">
                  <p>123 Service road</p>
                  <p>Colombo, Sri Lanka</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 group">
                <Mail className="h-5 w-5 text-red-500 flex-shrink-0" />
                <a 
                  href="mailto:info@autocare.lk" 
                  className="text-gray-400 group-hover:text-white transition-colors duration-300"
                >
                  info@autocare.lk
                </a>
              </div>
              <div className="flex items-center space-x-3 group">
                <Phone className="h-5 w-5 text-red-500 flex-shrink-0" />
                <a 
                  href="tel:+94112345678" 
                  className="text-gray-400 group-hover:text-white transition-colors duration-300"
                >
                  +94 11 234 5678
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-red-900/50 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} AutoCare Service Center. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-red-500 transition-colors duration-300">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-red-500 transition-colors duration-300">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-red-500 transition-colors duration-300">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;