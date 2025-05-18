'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { MemeGenerator } from '@/components/meme-generator';
import { motion } from 'framer-motion';
import { Triangle, Circle, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MemePage() {
  const [isMounted, setIsMounted] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const searchParams = useSearchParams();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      const urlParam = searchParams?.get('imageUrl');
      if (urlParam) {
        setImageUrl(decodeURIComponent(urlParam));
      }
    }
  }, [isMounted, searchParams]);

  return (
    <div className="relative min-h-screen w-full text-white overflow-x-hidden">
      {!isMounted && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="z-50 absolute inset-0 flex flex-col justify-center items-center backdrop-blur-sm"
        >
          <motion.div
            animate={{
              rotate: [0, 360],
              transition: {
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'linear',
              },
            }}
            className="flex justify-center items-center space-x-2 xs:space-x-3 md:space-x-4 mb-2 xs:mb-3 md:mb-4"
          >
            <Triangle className="w-6 h-6 xs:w-8 xs:h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-[#FF0B7A]" />
            <Circle className="w-6 h-6 xs:w-8 xs:h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-green-400" />
            <Square className="w-6 h-6 xs:w-8 xs:h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-[#FF0B7A]" />
          </motion.div>
          <p className="text-white text-sm xs:text-base sm:text-lg md:text-xl font-ibm text-center px-4">
            Loading Meme Generator...
          </p>
        </motion.div>
      )}

      <div className="container mx-auto py-4 xs:py-6 sm:py-8 md:py-12 lg:py-16 px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8 max-w-full md:max-w-[90%] lg:max-w-[85%]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex xs:flex-row justify-between items-start xs:items-center mb-4 xs:mb-6 md:mb-8 lg:mb-10 gap-2 xs:gap-4 sm:gap-0"
        >
          <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-[#FF0B7A] font-squid ">
            Create Meme
          </h1>
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="border border-gray-700 xs:border-2 hover:border-pink-500 bg-gray-800/50 backdrop-blur-sm text-white px-2 xs:px-3 sm:px-4 md:px-6 py-1 xs:py-1.5 md:py-2 text-xs xs:text-sm md:text-base lg:text-lg"
          >
            Back
          </Button>
        </motion.div>

        <Suspense
          fallback={
            <div className="flex justify-center items-center h-[30vh] xs:h-[40vh] sm:h-[50vh] md:h-[60vh]">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="rounded-full h-12 w-12 xs:h-16 xs:w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 lg:h-32 lg:w-32 border-t-2 border-b-2 border-pink-500"
              />
            </div>
          }
        >
          <div className="w-full overflow-x-auto md:overflow-x-visible">
            {imageUrl && <MemeGenerator defaultImage={imageUrl} />}
          </div>
        </Suspense>
      </div>
    </div>
  );
}
