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
  const [loopCount, setLoopCount] = useState(0);

  useEffect(() => {
    // Check if splash has been shown in this session
    const hasShownSplash = sessionStorage.getItem('splashShown');
    
    if (hasShownSplash) {
      setIsVisible(false);
      return;
    }

    // Rapid montage - 0.5 second cuts
    const imageInterval = setInterval(() => {
      setCurrentImageIndex((prev) => {
        const nextIndex = (prev + 1) % danceImages.length;
        // Track when we complete a full loop
        if (nextIndex === 0) {
          setLoopCount((count) => count + 1);
        }
        return nextIndex;
      });
    }, 500); // 0.5 second rapid cuts

    // After 2-3 loops (approximately 9-13.5 seconds for 9 images)
    const timer = setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem('splashShown', 'true');
    }, 9000); // 2 full loops = 9 seconds (9 images × 0.5s × 2)

    return () => {
      clearTimeout(timer);
      clearInterval(imageInterval);
    };
  }, []);

  // Stop after 2 loops
  useEffect(() => {
    if (loopCount >= 2) {
      setTimeout(() => {
        setIsVisible(false);
        sessionStorage.setItem('splashShown', 'true');
      }, 500);
    }
  }, [loopCount]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] overflow-hidden bg-black"
        >
          {/* Rapid Montage Background - No transitions, just cuts */}
          <div className="absolute inset-0">
            <div className="absolute inset-0">
              <Image
                key={currentImageIndex}
                src={danceImages[currentImageIndex]}
                alt="Steppers dancing"
                fill
                className="object-cover"
                priority
              />
              {/* Dark overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
            </div>
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
                className="text-7xl md:text-9xl font-bold text-white mb-6"
                style={{
                  fontFamily: 'var(--font-playfair, serif)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  textShadow: `
                    0 0 40px rgba(168, 85, 247, 0.8),
                    0 0 80px rgba(168, 85, 247, 0.5),
                    0 4px 12px rgba(0, 0, 0, 0.8)
                  `,
                }}
              >
                SteppersLife
              </h1>

              {/* Tagline */}
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl md:text-5xl font-light text-yellow-400"
                style={{
                  fontFamily: 'var(--font-dancing, cursive)',
                  textShadow: '0 0 30px rgba(253, 224, 71, 0.6), 0 2px 8px rgba(0, 0, 0, 0.8)',
                }}
              >
                "Steppin is a way of life"
              </motion.h2>
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
                className="text-7xl md:text-9xl font-bold text-white/30 blur-sm"
                style={{
                  fontFamily: 'var(--font-playfair, serif)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                SteppersLife
              </div>
            </motion.div>

            {/* Energy bars at bottom */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute bottom-10 left-0 right-0 flex justify-center space-x-2"
            >
              {danceImages.map((_, index) => (
                <motion.div
                  key={index}
                  className={`h-1 w-8 ${
                    index === currentImageIndex ? 'bg-yellow-400' : 'bg-white/30'
                  }`}
                  animate={{
                    scaleY: index === currentImageIndex ? [1, 3, 1] : 1,
                  }}
                  transition={{
                    duration: 0.5,
                  }}
                />
              ))}
            </motion.div>

            {/* Corner accents */}
            <div className="absolute top-8 left-8 text-yellow-400 text-3xl opacity-60">✦</div>
            <div className="absolute top-8 right-8 text-yellow-400 text-3xl opacity-60">✦</div>
            <div className="absolute bottom-8 left-8 text-yellow-400 text-3xl opacity-60">✦</div>
            <div className="absolute bottom-8 right-8 text-yellow-400 text-3xl opacity-60">✦</div>

            {/* Rapid flash effect on image change */}
            <AnimatePresence>
              {currentImageIndex % 3 === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.3 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  className="absolute inset-0 bg-white pointer-events-none"
                />
              )}
            </AnimatePresence>
          </div>

          {/* Loop counter (subtle) */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/40 text-xs">
            {loopCount > 0 && `Loop ${loopCount + 1}/2`}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}