"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    affair: "",
    comment: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // TODO: Implement actual contact form submission
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
    
    alert("Thank you for your message! We'll get back to you soon.");
    
    // Reset form
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      affair: "",
      comment: ""
    });
    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header Section */}
      <div className="text-center py-16 px-4">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
          CONTACT
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          "BUY MOMENTS - NOT THINGS"
        </p>
      </div>

      {/* Contact Form */}
      <div className="max-w-2xl mx-auto px-4 pb-16">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Contact information
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Message Section */}
            <div className="space-y-6 pt-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Message
              </h3>

              {/* Affair/Subject */}
              <div>
                <label htmlFor="affair" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Affair
                </label>
                <select
                  id="affair"
                  name="affair"
                  required
                  value={formData.affair}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select a topic</option>
                  <option value="event-inquiry">Event Inquiry</option>
                  <option value="ticket-support">Ticket Support</option>
                  <option value="refund-request">Refund Request</option>
                  <option value="technical-issue">Technical Issue</option>
                  <option value="partnership">Partnership Opportunity</option>
                  <option value="general">General Question</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Comment */}
              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Comment
                </label>
                <textarea
                  id="comment"
                  name="comment"
                  rows={6}
                  required
                  value={formData.comment}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:bg-gray-700 dark:text-white resize-none"
                  placeholder="Please describe your inquiry in detail..."
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gray-800 dark:bg-gray-700 text-white py-3 px-6 rounded-lg hover:bg-gray-900 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Send message</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Additional Contact Info */}
        <div className="mt-8 text-center space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Direct Contact
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              info@stepperslife.com
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Office Location
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Santo Domingo, Dominican Republic
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              We are Carbon-Neutral 🌱
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}