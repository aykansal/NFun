'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'next/navigation';
import { MemeGenerator } from '@/components/meme-generator';

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

        <div className="w-full overflow-x-auto md:overflow-x-visible">
          {imageUrl && <MemeGenerator defaultImage={imageUrl} />}
        </div>
      </div>
    </div>
  );
}
