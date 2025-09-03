"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function CommunityPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically save the email to your waitlist
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
    setEmail("");
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-yellow-900" />
      
      {/* Content Container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Coming Soon Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-sm font-medium mb-8">
              <span className="animate-pulse mr-2">🏪</span>
              Coming Soon
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6">
              Community Directory
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
              Find stepper-friendly businesses and services in your area. 
              Your go-to directory for the stepping community.
            </p>

            {/* Business Categories Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                <div className="text-3xl mb-3">👟</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Fashion & Apparel</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Stepper clothing, shoes, and accessories
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                <div className="text-3xl mb-3">💈</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Beauty & Grooming</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Barbershops, salons, and beauty services
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                <div className="text-3xl mb-3">🎵</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Entertainment</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  DJs, venues, photographers, and more
                </p>
              </div>
            </div>

            {/* Additional Categories */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              <span className="px-4 py-2 bg-white dark:bg-gray-800 rounded-full text-sm text-gray-700 dark:text-gray-300 shadow">
                🍴 Food & Catering
              </span>
              <span className="px-4 py-2 bg-white dark:bg-gray-800 rounded-full text-sm text-gray-700 dark:text-gray-300 shadow">
                📸 Photography
              </span>
              <span className="px-4 py-2 bg-white dark:bg-gray-800 rounded-full text-sm text-gray-700 dark:text-gray-300 shadow">
                🏢 Event Venues
              </span>
              <span className="px-4 py-2 bg-white dark:bg-gray-800 rounded-full text-sm text-gray-700 dark:text-gray-300 shadow">
                🚗 Transportation
              </span>
            </div>

            {/* Waitlist Form */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                List Your Business
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Be among the first businesses in our directory!
              </p>
              
              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your business email"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition-colors"
                  >
                    Get Early Access
                  </button>
                </form>
              ) : (
                <div className="py-8 text-center">
                  <div className="text-4xl mb-4">✅</div>
                  <p className="text-green-600 dark:text-green-400 font-medium">
                    Thanks! We'll contact you when the directory launches.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}