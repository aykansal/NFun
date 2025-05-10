'use client';

import Link from 'next/link';
import { motion, useAnimation } from 'framer-motion';
import { Hexagon, Hash, DollarSign, Box } from 'lucide-react';
import { buttonVariants } from '@/styles/animations';
import { useEffect, useState } from 'react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      duration: 0.3
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3
    }
  }
};

const floatingVariants = {
  initial: { y: 0, opacity: 0 },
  float: {
    y: [-10, 10, -10],
    opacity: [0.3, 0.5, 0.3],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export default function LandingPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const backgroundControls = useAnimation();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const moveX = clientX - window.innerWidth / 2;
      const moveY = clientY - window.innerHeight / 2;
      const boundedMoveX = Math.min(Math.max(moveX, -window.innerWidth / 2), window.innerWidth / 2);
      const boundedMoveY = Math.min(Math.max(moveY, -window.innerHeight / 2), window.innerHeight / 2);
      const offsetFactor = 0.01;

      setMousePosition({ x: boundedMoveX, y: boundedMoveY });
      backgroundControls.start({
        x: boundedMoveX * offsetFactor,
        y: boundedMoveY * offsetFactor,
        transition: { type: "spring", stiffness: 150, damping: 15 }
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [backgroundControls]);

  return (
    <div className="relative flex flex-col justify-center items-center p-8 w-full flex-grow overflow-auto overflow-hidden">
      {/* Interactive glow effect following cursor */}
      <motion.div
        className="absolute w-96 h-96 rounded-full pointer-events-none"
        animate={{
          opacity: 0.2
        }}
        style={{
          background: 'radial-gradient(circle, rgba(255,11,122,0.15) 0%,rgba(255,11,122,0) 70%)',
          left: `calc(50% + ${mousePosition.x * 0.5}px)`,
          top: `calc(50% + ${mousePosition.y * 0.5}px)`,
          transform: 'translate(-50%, -50%)',
          maxWidth: '100vw',
          maxHeight: '100vh'
        }}
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-center space-y-8 relative z-10 max-w-4xl mx-auto"
      >
        <motion.div variants={itemVariants} className="space-y-4">
          <motion.h1 
            className="text-5xl md:text-7xl font-bold font-squid text-white"
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.2 }
            }}
          >
            <motion.span 
              className="text-[#FF0B7A] inline-block"
              whileHover={{
                rotate: [0, -5, 5, 0],
                transition: { duration: 0.3 }
              }}
            >
              Game
            </motion.span>{' '}
            On,{' '}
            <motion.span 
              className="text-[#FF0B7A] inline-block"
              whileHover={{
                rotate: [0, 5, -5, 0],
                transition: { duration: 0.3 }
              }}
            >
              Meme
            </motion.span>{' '}
            On
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-xl text-gray-300 max-w-2xl mx-auto"
          >
            Create, trade, and showcase unique NFTs with our next-gen platform
          </motion.p>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8"
        >
          <Link href="/platforms">
            <motion.button
              variants={buttonVariants}
              whileHover={{
                scale: 1.05,
                textShadow: "0 0 8px rgb(255,11,122)",
                boxShadow: "0 0 8px rgb(255,11,122)"
              }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 text-xl rounded-lg bg-gradient-to-r from-[#FF0B7A] to-[#FF0B7A]/80 hover:from-[#FF0B7A]/90 hover:to-[#FF0B7A]/70 transition-all duration-300"
            >
              Start Creating
            </motion.button>
          </Link>

          <Link href="/gallery">
            <motion.button
              variants={buttonVariants}
              whileHover={{
                scale: 1.05,
                textShadow: "0 0 8px rgb(255,11,122)",
                boxShadow: "0 0 8px rgb(255,11,122)"
              }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 text-xl rounded-lg border-2 border-[#FF0B7A] hover:bg-[#FF0B7A]/10 transition-all duration-300"
            >
              View Gallery
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>

      {/* Floating Elements with Mouse Interaction */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ maxWidth: "100%" }}>
        {[
          { Icon: Hexagon, position: "top-20 right-1/5", size: "w-16 h-16" },
          { Icon: Hash, position: "bottom-32 left-1/6", size: "w-12 h-12" },
          { Icon: Box, position: "top-40 left-1/4", size: "w-20 h-20" },
          { Icon: DollarSign, position: "bottom-40 right-1/4", size: "w-14 h-14" }
        ].map((item, index) => (
          <motion.div
            key={index}
            initial="initial"
            animate="float"
            variants={floatingVariants}
            className={`absolute ${item.position}`}
          >
            <item.Icon className={`${item.size} text-[#FF0B7A]/30`} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}