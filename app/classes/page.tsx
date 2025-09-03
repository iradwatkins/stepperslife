"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function ClassesPage() {
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
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900" />
      
      {/* Content Container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Coming Soon Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium mb-8">
              <span className="animate-pulse mr-2">🚀</span>
              Coming Soon
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6">
              Dance Classes
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
              Soon instructors will be able to list their dance classes here. 
              Find the perfect class to improve your stepping skills.
            </p>

            {/* Features Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Find Classes</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Search for classes by location, level, and style
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                <div className="text-3xl mb-3">👩‍🏫</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Expert Instructors</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Learn from experienced stepping instructors
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                <div className="text-3xl mb-3">📅</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Book Online</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Easy online booking and payment
                </p>
              </div>
            </div>

            {/* Waitlist Form */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Join the Waitlist
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Be the first to know when classes launch!
              </p>
              
              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Notify Me
                  </button>
                </form>
              ) : (
                <div className="py-8 text-center">
                  <div className="text-4xl mb-4">✅</div>
                  <p className="text-green-600 dark:text-green-400 font-medium">
                    Thanks! We'll notify you when classes are available.
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