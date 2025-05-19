'use client';

import axios from 'axios';
import Link from 'next/link';
import { toast } from 'sonner';
import { Meme } from '@/lib/types';
import { motion } from 'framer-motion';
// import { Card } from '@/components/ui/card';
// import { Skeleton } from '@/components/ui/skeleton';
import { buttonVariants } from '@/styles/animations';
import Loader, { Loader2 } from '@/components/loader';
import { PageTitle } from '@/components/ui/page-title';
import { ImageCard } from '@/components/ui/image-card';
import { useState, useEffect, useCallback } from 'react';

const ITEMS_PER_PAGE = 9;

export default function GalleryPage() {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchMemes = useCallback(
    async (isLoadMore = false) => {
      if (isLoadMore) {
        setLoadingMore(true);
      }
      setInitialLoad(true);
      try {
        const response = await axios
          .get(`/api/memes?page=${currentPage}&limit=${ITEMS_PER_PAGE}`)
          .then((res) => res.data);
        if (!response.memes) {
          throw new Error('Failed to fetch memes');
        }

        setMemes((prev) => [...prev, ...response.memes]);
        setHasMore(response.pagination.hasMore);

        if (!isLoadMore) {
          toast.success('Meme gallery loaded successfully');
        } else {
          toast.success(`Loaded ${response.memes.length} more memes`);
        }
      } catch (error) {
        toast.error('Error fetching memes. Please try again.');
        console.error('Error fetching memes:', error);
      } finally {
        setLoading(false);
        setInitialLoad(false);
        setLoadingMore(false);
      }
    },
    [currentPage]
  );

  useEffect(() => {
    fetchMemes(currentPage > 1);
  }, [fetchMemes, currentPage]);

  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  // Skeleton loader for initial page load
  // const renderSkeletons = () => {
  //   return Array(ITEMS_PER_PAGE)
  //     .fill(0)
  //     .map((_, index) => (
  //       <Card
  //         key={`skeleton-${index}`}
  //         className="border border-gray-700 xs:border-2 bg-gray-800/50 backdrop-blur-sm p-2 xs:p-3 md:p-4 aspect-square"
  //       >
  //         <Skeleton className="bg-gray-700/50 w-full h-full" />
  //       </Card>
  //     ));
  // };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto container max-w-7xl pb-12"
    >
      <PageTitle title="Meme Gallery" />

      {initialLoad ? (
        <div className="flex items-center justify-center">
          <Loader />
          {/* <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {renderSkeletons()}
          </motion.div> */}
        </div>
      ) : (
        <>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                  duration: 0.3,
                },
              },
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {memes.length === 0 && !loading ? (
              <div className="col-span-3 flex flex-col gap-3 items-center justify-center p-12 text-center">
                <Loader2 />
                <h3 className="text-xl font-medium text-gray-300 mb-2">
                  No memes found
                </h3>
                <p className="text-gray-400 max-w-md">
                  Yo! Fam, still no memes? Be the first to drop
                </p>
                <Link href="/platforms">
                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className="px-6 py-3 rounded-lg squid-button text-lg font-ibm flex items-center gap-2 group"
                  >
                    <span>Create Meme</span>
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      →
                    </motion.span>
                  </motion.button>
                </Link>
              </div>
            ) : (
              memes?.map((meme, index) => (
                <ImageCard
                  key={meme.id || index}
                  imageSrc={meme.cloudinaryUrl}
                  imageAlt={`Meme ${index + 1}`}
                  aspectRatio="square"
                  animate={true}
                  whileHoverEffect={true}
                  priority={index < 6}
                  footer={
                    <div className="flex justify-between items-center">
                      <p className="text-gray-400 font-ibm">
                        By {meme.user.username || 'Anonymous'}
                      </p>
                    </div>
                  }
                />
              ))
            )}
          </motion.div>

          {(hasMore || memes.length !== 0) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-12 text-center"
            >
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className={`squid-button px-8 py-3 rounded-lg will-change-transform ${
                  loadingMore ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {loadingMore ? 'Loading...' : 'Load More'}
              </motion.button>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}
