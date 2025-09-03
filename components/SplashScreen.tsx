'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const allDanceImages = [
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
  
  // Select 4 random images on component mount
  const selectedImages = useMemo(() => {
    const shuffled = [...allDanceImages].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 4);
  }, []);

  useEffect(() => {
    // Check if splash has been shown in this session
    const hasShownSplash = sessionStorage.getItem('splashShown');
    
    if (hasShownSplash) {
      setIsVisible(false);
      return;
    }

    // Start rotation immediately - 3 seconds per image
    const imageInterval = setInterval(() => {
      setCurrentImageIndex((prev) => {
        const nextIndex = (prev + 1) % selectedImages.length;
        return nextIndex;
      });
    }, 3000); // 3 seconds per image

    return () => {
      clearInterval(imageInterval);
    };
  }, [selectedImages]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] overflow-hidden bg-black"
        >
          {/* Smooth Image Transitions with Crossfade */}
          <div className="absolute inset-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <Image
                  src={selectedImages[currentImageIndex]}
                  alt="Steppers dancing"
                  fill
                  className="object-cover"
                  priority
                  sizes="100vw"
                  quality={85}
                  loading="eager"
                />
                {/* Dark overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Purple brand overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-transparent to-purple-900/30" />

          {/* Fixed Content - Website Name stays prominent throughout */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center px-4">
            
            {/* FIXED BRAND NAME - Always visible, always prominent */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 0.5,
                type: "spring",
                stiffness: 200,
              }}
              className="text-center"
            >
              {/* Main Brand Name - Large and Fixed */}
              <h1 
                className="text-5xl sm:text-7xl md:text-9xl font-bold text-white mb-4 sm:mb-6"
                style={{
                  fontFamily: 'var(--font-playfair, serif)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  textShadow: `
                    0 0 40px rgba(168, 85, 247, 0.8),
                    0 0 80px rgba(168, 85, 247, 0.5),
                    0 4px 12px rgba(0, 0, 0, 0.8)
                  `,
                }}
              >
                Stepper's Life
              </h1>

              {/* Tagline */}
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xl sm:text-3xl md:text-5xl font-light text-yellow-400 px-4"
                style={{
                  fontFamily: 'var(--font-dancing, cursive)',
                  textShadow: '0 0 30px rgba(253, 224, 71, 0.6), 0 2px 8px rgba(0, 0, 0, 0.8)',
                }}
              >
                "Steppin is a way of life"
              </motion.h2>
              
              {/* Click to Enter Button */}
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ 
                  delay: 0.8,
                  duration: 0.3,
                  type: "spring",
                  stiffness: 200,
                }}
                onClick={() => {
                  setIsVisible(false);
                  sessionStorage.setItem('splashShown', 'true');
                }}
                className="mt-8 px-10 py-4 bg-yellow-400 hover:bg-yellow-300 text-black text-lg font-bold rounded-full transition-all shadow-2xl cursor-pointer relative z-20"
                style={{
                  boxShadow: `
                    0 0 40px rgba(253, 224, 71, 0.8),
                    0 10px 25px rgba(0, 0, 0, 0.3)
                  `,
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                }}
              >
                Click to Enter
              </motion.button>
            </motion.div>

            {/* Pulse effect on brand name */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              animate={{
                opacity: [0, 0.3, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <div 
                className="text-5xl sm:text-7xl md:text-9xl font-bold text-white/30 blur-sm"
                style={{
                  fontFamily: 'var(--font-playfair, serif)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Stepper's Life
              </div>
            </motion.div>

            {/* Energy bars at bottom */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute bottom-10 left-0 right-0 flex justify-center space-x-2"
            >
              {selectedImages.map((_, index) => (
                <motion.div
                  key={index}
                  className={`h-1 w-8 ${
                    index === currentImageIndex ? 'bg-yellow-400' : 'bg-white/30'
                  }`}
                  animate={{
                    scaleY: index === currentImageIndex ? [1, 3, 1] : 1,
                  }}
                  transition={{
                    duration: 2,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </motion.div>

            {/* Corner accents */}
            <div className="absolute top-4 sm:top-8 left-4 sm:left-8 text-yellow-400 text-2xl sm:text-3xl opacity-60">✦</div>
            <div className="absolute top-4 sm:top-8 right-4 sm:right-8 text-yellow-400 text-2xl sm:text-3xl opacity-60">✦</div>
            <div className="absolute bottom-4 sm:bottom-8 left-4 sm:left-8 text-yellow-400 text-2xl sm:text-3xl opacity-60">✦</div>
            <div className="absolute bottom-4 sm:bottom-8 right-4 sm:right-8 text-yellow-400 text-2xl sm:text-3xl opacity-60">✦</div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}