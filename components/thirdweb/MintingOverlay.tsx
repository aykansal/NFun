'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MintingOverlayProps {
  isVisible: boolean;
  currentStep: 'preparing' | 'uploading' | 'minting' | 'confirming';
}

const steps = {
  preparing: {
    title: 'Preparing Your NFT',
    description: 'Getting your meme ready for the blockchain...',
  },
  uploading: {
    title: 'Uploading to IPFS',
    description: 'Storing your meme permanently on decentralized storage...',
  },
  minting: {
    title: 'Minting NFT',
    description: 'Creating your unique token on the blockchain...',
  },
  confirming: {
    title: 'Confirming Transaction',
    description: 'Waiting for the blockchain to confirm your NFT...',
  },
};

const MintingOverlay: React.FC<MintingOverlayProps> = ({
  isVisible,
  currentStep,
}) => {
  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center"
        >
          <motion.div
            className="squid-card p-6 md:p-8 max-w-md w-full mx-4 flex flex-col items-center text-center"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 500 }}
          >
            <div className="mb-4 relative w-40 h-40">
              {/* Animation based on current step */}
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="absolute inset-0 flex justify-center items-center"
              >
                <div className="relative w-32 h-32">
                  <div className="absolute inset-0 rounded-full border-4 border-[#FF0B7A] opacity-20"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-[#FF0B7A] border-t-transparent animate-spin"></div>
                </div>
              </motion.div>
            </div>

            <motion.h2
              key={`title-${currentStep}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-xl md:text-2xl font-bold text-[#FF0B7A] mb-2"
            >
              {steps[currentStep].title}
            </motion.h2>

            <motion.p
              key={`desc-${currentStep}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-gray-300 mb-6"
            >
              {steps[currentStep].description}
            </motion.p>

            <div className="flex justify-center space-x-2">
              {Object.keys(steps).map((step, index) => (
                <motion.div
                  id={index.toString()}
                  key={step}
                  className={`h-2 w-2 rounded-full ${
                    currentStep === step ? 'bg-[#FF0B7A]' : 'bg-gray-600'
                  }`}
                  animate={{
                    scale: currentStep === step ? [1, 1.2, 1] : 1,
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: currentStep === step ? Infinity : 0,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>

            <p className="text-xs text-gray-500 mt-6">
              Please don&apos;t close this window
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MintingOverlay;
