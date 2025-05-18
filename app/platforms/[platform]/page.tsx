'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
// import usePagination from '@/hooks/usePagination';
import { Triangle, Circle, Square } from 'lucide-react';
// import { verifyValidImages } from '@/lib/verify';
import Image from 'next/image';
import axios from 'axios';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// const itemVariants = {
//   hidden: { opacity: 0, y: 20 },
//   visible: {
//     opacity: 1,
//     y: 0,
//     transition: {
//       type: 'spring',
//       stiffness: 100,
//     },
//   },
// };

const cardVariants = {
  initial: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
  hover: { scale: 1.05 },
};

const buttonVariants = {
  initial: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
};

export default function PlatformPage() {
  const router = useRouter();
  // @ts-expect-error ignore
  const { platform } = useParams();
  const [nfts, setNfts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [, setTotal] = useState(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        const response = await axios.get(
          `/api/nfts/${platform}?page=${currentPage}&limit=12`
        );
        if (!response.data) throw new Error('Failed to fetch NFTs');
        const data = await response.data;
        setNfts(data.urls);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      } catch (error) {
        console.log(`err in fetching from platform ${platform}: `, error);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, [platform, currentPage]);

  const handleNftClick = (imageUrl: string) => {
    const encodedUrl = encodeURIComponent(imageUrl);
    router.push(`/create/meme?imageUrl=${encodedUrl}`);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    setLoading(true);
  };

  const platformTitle =
    platform?.toString().charAt(0).toUpperCase() +
    platform?.toString().slice(1);

  return (
    <div className="relative min-h-[90vh] text-white overflow-hidden">
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
            className="flex justify-center items-center space-x-2 xs:space-x-3 md:space-x-4 mb-3 xs:mb-4"
          >
            <Triangle className="w-8 h-8 xs:w-10 xs:h-10 md:w-12 md:h-12 text-[#FF0B7A]" />
            <Circle className="w-8 h-8 xs:w-10 xs:h-10 md:w-12 md:h-12 text-green-400" />
            <Square className="w-8 h-8 xs:w-10 xs:h-10 md:w-12 md:h-12 text-[#FF0B7A]" />
          </motion.div>
          <p className="font-ibm text-white text-base xs:text-lg md:text-xl">
            Loading...
          </p>
        </motion.div>
      )}

      <div className="mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-8 xs:py-12 md:py-16 lg:py-20 container">
        <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center mb-6 xs:mb-8 md:mb-12 lg:mb-16 gap-4 xs:gap-0">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-bold font-ibm text-[#FF0B7A] text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
          >
            {platformTitle} NFTs
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="border border-gray-700 xs:border-2 hover:border-pink-500 bg-gray-800/50 backdrop-blur-sm px-3 xs:px-4 md:px-6 py-1 xs:py-1.5 md:py-2 text-xs xs:text-sm md:text-lg text-white"
            >
              Back to Platforms
            </Button>
          </motion.div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="gap-3 xs:gap-4 md:gap-6 lg:gap-8 grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
        >
          <AnimatePresence mode="wait">
            {loading
              ? Array.from({ length: 12 }).map((_, i) => (
                  <Card
                    key={`skeleton-${i}`}
                    className="border border-gray-700 xs:border-2 bg-gray-800/50 backdrop-blur-sm p-2 xs:p-3 md:p-4 aspect-square"
                  >
                    <Skeleton className="bg-gray-700/50 w-full h-full" />
                  </Card>
                ))
              : nfts.map((nft, index) => (
                  <motion.div
                    key={`${nft}-${index}`}
                    variants={cardVariants}
                    initial="initial"
                    animate="visible"
                    whileHover="hover"
                    className="p-2 xs:p-3 md:p-4 cursor-pointer squid-card"
                    onClick={() => handleNftClick(nft)}
                  >
                    <div className="relative rounded-lg overflow-hidden aspect-square">
                      <Image
                        src={nft}
                        alt="NFT"
                        fill
                        sizes="(max-width: 475px) 100vw, (max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover"
                        priority={index < 4}
                      />
                    </div>
                  </motion.div>
                ))}
          </AnimatePresence>
        </motion.div>

        {!loading && totalPages > 1 && (
          <div className="flex flex-col xs:flex-row justify-center items-center gap-2 xs:gap-3 md:gap-4 mt-6 xs:mt-8">
            <motion.button
              variants={buttonVariants}
              initial="initial"
              animate="visible"
              whileHover="hover"
              whileTap="tap"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-full xs:w-auto disabled:opacity-50 px-3 xs:px-4 md:px-6 py-1.5 xs:py-2 rounded-lg disabled:cursor-not-allowed squid-button text-xs xs:text-sm md:text-base"
            >
              Previous
            </motion.button>
            <span className="flex items-center justify-center py-2 xs:px-4 md:px-6 font-ibm text-sm xs:text-base md:text-lg">
              Page {currentPage} of {totalPages}
            </span>
            <motion.button
              variants={buttonVariants}
              initial="initial"
              animate="visible"
              whileHover="hover"
              whileTap="tap"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="w-full xs:w-auto disabled:opacity-50 px-3 xs:px-4 md:px-6 py-1.5 xs:py-2 rounded-lg disabled:cursor-not-allowed squid-button text-xs xs:text-sm md:text-base"
            >
              Next
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}
