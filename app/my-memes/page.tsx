'use client';

import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Triangle, Circle, Square } from 'lucide-react';
import { buttonVariants, cardVariants } from '@/styles/animations';
import XShareButton from '@/components/XShareBtn';
import MintNft from '@/components/thirdweb/MintNft';
import { Meme } from '@/lib/types';

export default function MyMemesPage() {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);

  const { wallet: activeUserAddress } = useAuth();

  useEffect(() => {
    const fetchMemes = async () => {
      try {
        const response = await axios.get(`/api/profile/${activeUserAddress}`);
        if (!response.data) throw new Error('Failed to fetch memes');
        const data = await response.data.memes;
        setMemes(data);
      } catch (error) {
        console.error('Error fetching memes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMemes();
  }, [activeUserAddress]);

  return (
    <div className="px-3 xs:px-4 md:px-6 lg:px-8 w-full flex-grow overflow-auto text-white">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto container max-w-7xl"
      >
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-6 md:mb-12 lg:mb-16 font-bold font-squid text-[#FF0B7A] text-2xl xs:text-3xl md:text-4xl lg:text-5xl text-center"
        >
          Your Memes
        </motion.h1>

        {loading ? (
          <div className="flex justify-center items-center h-[60vh]">
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="flex justify-center items-center space-x-2 xs:space-x-3 md:space-x-4"
            >
              <Triangle className="w-6 h-6 xs:w-8 xs:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-[#FF0B7A]" />
              <Circle className="w-6 h-6 xs:w-8 xs:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-green-400" />
              <Square className="w-6 h-6 xs:w-8 xs:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-[#FF0B7A]" />
            </motion.div>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
            className="gap-3 xs:gap-4 md:gap-6 lg:gap-8 grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {memes.length === 0 ? (
              <motion.div
                variants={cardVariants}
                className="col-span-full p-4 xs:p-6 md:p-8 lg:p-12 text-center squid-card"
              >
                <h3 className="mb-2 xs:mb-3 md:mb-4 font-bold font-ibm text-[#FF0B7A] text-lg xs:text-xl md:text-2xl">
                  No memes yet!
                </h3>
                <p className="mb-4 xs:mb-6 md:mb-8 text-gray-400 text-xs xs:text-sm md:text-base">
                  Start creating your own memes or save some from the gallery.
                </p>
                <Link href="/platforms">
                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className="px-4 py-2 xs:px-6 xs:py-2 md:px-8 md:py-3 rounded-lg squid-button"
                  >
                    Create Meme
                  </motion.button>
                </Link>
              </motion.div>
            ) : (
              memes?.map((meme, index) => (
                <motion.div
                  key={index}
                  variants={cardVariants}
                  whileHover="hover"
                  className="overflow-hidden squid-card"
                >
                  <div className="p-2 xs:p-3 md:p-4 lg:p-6">
                    <div className="relative rounded-lg overflow-hidden aspect-square">
                      <Image
                        src={meme.cloudinaryUrl}
                        alt={`Meme ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 475px) 100vw, (max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    </div>
                    <div className="flex flex-col xs:flex-row justify-between items-center gap-2 xs:gap-3 mt-2 xs:mt-3 md:mt-4">
                      <div className="w-full xs:w-auto">
                        <XShareButton imageUrl={meme.cloudinaryUrl} />
                      </div>
                      <div className="w-full xs:w-auto">
                        <MintNft
                          name={meme.cloudinaryUrl}
                          description={meme.cloudinaryUrl}
                          image={meme.cloudinaryUrl}
                          minted={meme.minted}
                          memeId={meme.id}
                          isCurrentMinting={false}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
