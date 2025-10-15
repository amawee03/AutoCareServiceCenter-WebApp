import React, { useState } from 'react';
import Footer from '../components/layouts/FooterSection';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 2000);
  };

  return (
    <div className="bg-gradient-to-br from-black via-gray-900 to-red-900 text-white min-h-screen flex flex-col">
      <main className="flex-1 pt-24">
        <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16 xl:px-20 py-12">
          <h1 className="text-4xl lg:text-5xl font-extrabold text-center mb-12 text-red-600">
            Contact Us
          </h1>

          <div className="grid lg:grid-cols-2 gap-10">
            {/* Contact Info */}
            <div className="bg-black/60 border border-red-700 rounded-3xl p-8 shadow-xl space-y-6">
              <h2 className="text-2xl font-bold mb-4 text-red-600">Get in Touch</h2>
              <p className="text-gray-300 mb-6">
                Have questions or need assistance? Fill out the form or contact us directly using the details below.
              </p>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-red-500">Address</h3>
                  <p className="text-gray-300">123 AutoCare Street, Colombo, Sri Lanka</p>
                </div>
                <div>
                  <h3 className="font-semibold text-red-500">Phone</h3>
                  <p className="text-gray-300">+94 11 234 5678</p>
                </div>
                <div>
                  <h3 className="font-semibold text-red-500">Email</h3>
                  <p className="text-gray-300">support@autocare.com</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-black/60 border border-red-700 rounded-3xl p-8 shadow-2xl space-y-6">
              <h2 className="text-2xl font-bold mb-6 text-red-600">Send Us a Message</h2>

              {submitted && (
                <div className="mb-4 p-3 bg-green-800/40 text-green-300 rounded-lg font-semibold">
                  Your message has been sent successfully!
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Name"
                  required
                  className="bg-black/70 border border-gray-700 text-white placeholder-gray-400 focus:ring-red-500 focus:border-red-500"
                />
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  required
                  className="bg-black/70 border border-gray-700 text-white placeholder-gray-400 focus:ring-red-500 focus:border-red-500"
                />
                <Input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Subject"
                  required
                  className="bg-black/70 border border-gray-700 text-white placeholder-gray-400 focus:ring-red-500 focus:border-red-500"
                />
                <Textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Your Message"
                  rows={5}
                  required
                  className="bg-black/70 border border-gray-700 text-white placeholder-gray-400 focus:ring-red-500 focus:border-red-500"
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full bg-red-600 text-white py-3 rounded-2xl font-semibold shadow-lg transition-all ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-red-700'
                  }`}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContactUs;
