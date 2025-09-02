'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const danceImages = [
  '/splash-images/243284255_377446473924733_3064788508478518395_n.jpeg',
  '/splash-images/243294586_377452517257462_7403046608082765410_n.jpeg',
  '/splash-images/243297088_377446013924779_4445726028711370051_n.jpeg',
  '/splash-images/243299767_377447357257978_6010530704813502290_n.jpeg',
  '/splash-images/243320470_377446220591425_2440530223689945849_n.jpeg',
  '/splash-images/Royce.jpeg',
  '/splash-images/doc.jpeg',
  '/splash-images/wlsc33.jpeg',
  '/splash-images/wlsc7.jpeg',
];

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    // Check if splash has been shown in this session
    const hasShownSplash = sessionStorage.getItem('splashShown');
    
    if (hasShownSplash) {
      setIsVisible(false);
      return;
    }

    // Cycle through images
    const imageInterval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % danceImages.length);
    }, 1500); // Change image every 1.5 seconds

    // Show splash for 8 seconds to see more images
    const timer = setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem('splashShown', 'true');
    }, 8000);

    return () => {
      clearTimeout(timer);
      clearInterval(imageInterval);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 z-[9999] overflow-hidden"
        >
          {/* Dynamic Background Images */}
          <div className="absolute inset-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentImageIndex}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0"
              >
                <Image
                  src={danceImages[currentImageIndex]}
                  alt="Steppers dancing"
                  fill
                  className="object-cover"
                  priority
                />
                {/* Dark overlay for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Animated purple overlay with pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-purple-800/30 to-purple-900/40">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='0.5' opacity='0.1'%3E%3Ccircle cx='50' cy='50' r='40'/%3E%3Ccircle cx='50' cy='50' r='30'/%3E%3Ccircle cx='50' cy='50' r='20'/%3E%3Ccircle cx='50' cy='50' r='10'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '200px 200px',
            }} />
          </div>

          {/* Content Container */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center px-4">
            {/* Top Section - Brand Name with Animation */}
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 20,
                duration: 1
              }}
              className="text-center mb-8"
            >
              {/* Elegant Brand Name */}
              <motion.h1
                animate={{
                  textShadow: [
                    "0 0 20px rgba(168, 85, 247, 0.5)",
                    "0 0 40px rgba(168, 85, 247, 0.8)",
                    "0 0 20px rgba(168, 85, 247, 0.5)",
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-6xl md:text-8xl font-bold text-white mb-4 tracking-wider uppercase"
                style={{
                  fontFamily: 'var(--font-playfair, serif)',
                }}
              >
                SteppersLife
              </motion.h1>

              {/* Animated Tagline */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  delay: 0.5, 
                  type: "spring",
                  stiffness: 200,
                  damping: 15
                }}
                className="relative"
              >
                {/* Decorative lines */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                  className="absolute left-0 top-1/2 h-[1px] bg-gradient-to-r from-transparent via-yellow-400 to-transparent -translate-y-1/2"
                />
                
                <h2 className="text-2xl md:text-4xl font-light text-yellow-400 px-8 py-4 relative"
                    style={{
                      fontFamily: 'var(--font-dancing, cursive)',
                      textShadow: '0 0 30px rgba(253, 224, 71, 0.5)',
                    }}>
                  "Steppin is a way of life"
                </h2>
              </motion.div>
            </motion.div>

            {/* Dancing Animation Elements */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="flex items-center justify-center space-x-8 mb-8"
            >
              {/* Left Dancer Silhouette */}
              <motion.div
                animate={{
                  rotate: [-5, 5, -5],
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-white/60"
              >
                <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="5" r="2" />
                  <path d="M12 7v6l-3 2 3 5" />
                  <path d="M12 13l3 5" />
                  <path d="M8 10l4 3" />
                  <path d="M16 10l-4 3" />
                </svg>
              </motion.div>

              {/* Center Heart */}
              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-red-500"
              >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </motion.div>

              {/* Right Dancer Silhouette */}
              <motion.div
                animate={{
                  rotate: [5, -5, 5],
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
                className="text-white/60"
                style={{ transform: 'scaleX(-1)' }}
              >
                <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="5" r="2" />
                  <path d="M12 7v6l-3 2 3 5" />
                  <path d="M12 13l3 5" />
                  <path d="M8 10l4 3" />
                  <path d="M16 10l-4 3" />
                </svg>
              </motion.div>
            </motion.div>

            {/* Loading Bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="w-64 h-1 bg-white/20 rounded-full overflow-hidden"
            >
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="h-full w-1/3 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"
              />
            </motion.div>

            {/* Bottom Text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              className="mt-8 text-sm text-white/80 text-center"
              style={{
                letterSpacing: '0.2em',
                textTransform: 'uppercase'
              }}
            >
              Dance • Connect • Celebrate
            </motion.p>

            {/* Floating Music Notes */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    x: `${Math.random() * 100}%`,
                    y: '110%'
                  }}
                  animate={{
                    y: '-10%',
                    x: `${Math.random() * 100 - 50}%`,
                  }}
                  transition={{
                    duration: 8 + Math.random() * 4,
                    repeat: Infinity,
                    delay: i * 1.5,
                    ease: "linear"
                  }}
                  className="absolute text-4xl"
                  style={{
                    color: i % 2 === 0 ? 'rgba(253, 224, 71, 0.3)' : 'rgba(168, 85, 247, 0.3)',
                  }}
                >
                  {i % 3 === 0 ? '♪' : i % 3 === 1 ? '♫' : '♬'}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Corner Accents */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute top-4 left-4 text-yellow-400 text-2xl"
          >
            ✦
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            className="absolute top-4 right-4 text-yellow-400 text-2xl"
          >
            ✦
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9 }}
            className="absolute bottom-4 left-4 text-yellow-400 text-2xl"
          >
            ✦
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.1 }}
            className="absolute bottom-4 right-4 text-yellow-400 text-2xl"
          >
            ✦
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}