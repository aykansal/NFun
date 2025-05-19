'use client';

import axios from 'axios';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Eye } from 'lucide-react';
import { buttonVariants } from '@/styles/animations';
import XShareButton from '@/components/XShareBtn';
import MintNft from '@/components/thirdweb/MintNft';
import { meme as MemeType } from '@prisma/client';
import { ImageCard } from '@/components/ui/image-card';
import { PageTitle } from '@/components/ui/page-title';
import Image from 'next/image';
import Loader from '@/components/loader';

export default function MyMemesPage() {
  const [memes, setMemes] = useState<MemeType[]>([]);
  const [loading, setLoading] = useState(false);

  const { wallet: activeUserAddress } = useAuth();

  const fetchMemes = async () => {
    try {
      setLoading(true);
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

  useEffect(() => {
    fetchMemes();
  }, [activeUserAddress]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto container max-w-7xl"
    >
      <PageTitle title="Your Memes" />
      {loading ? (
        <Loader />
      ) : (
        <>
          {memes.length === 0 ? (
            <div className="flex items-center justify-center">
              <div className="flex flex-col items-center justify-center space-y-6">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 260,
                    damping: 20,
                  }}
                  className="relative"
                >
                  <Image
                    src={
                      'https://media1.tenor.com/m/pOSl2rAkufAAAAAC/anime.gif'
                    }
                    alt="No memes yet!"
                    width={250}
                    height={250}
                    className="rounded-lg squid-filter-neon"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-center space-y-4"
                >
                  <h2 className="text-2xl font-bold text-[#FF0B7A] font-ibm">
                    No Memes Yet!
                  </h2>
                </motion.div>

                <Link href="/platforms">
                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className="px-6 py-3 rounded-lg squid-button text-lg font-ibm flex items-center gap-2 group"
                  >
                    <span>Create your first meme!</span>
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      →
                    </motion.span>
                  </motion.button>
                </Link>
              </div>
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
              {memes?.map((meme, index) => (
                <ImageCard
                  key={index}
                  imageSrc={meme.cloudinaryUrl}
                  imageAlt={`Meme ${index + 1}`}
                  aspectRatio="square"
                  animate={true}
                  whileHoverEffect={true}
                  badge={
                    meme.minted ? (
                      <Link
                        target="_blank"
                        rel="noopener noreferrer"
                        href={`https://explorer.solana.com/address/${meme.nftAddress}?cluster=testnet`}
                      >
                        <Eye className="w-4 h-4 text-[#FF0B7A]" />
                      </Link>
                    ) : null
                  }
                  footer={
                    <div className="flex flex-col xs:flex-row justify-between items-stretch xs:items-center gap-3 p-1 bg-black/5 rounded-lg backdrop-blur-sm">
                      <div className="w-full xs:w-auto flex-1">
                        <XShareButton />
                      </div>
                      <div className="w-full xs:w-auto flex-1">
                        <MintNft
                          name={meme.cloudinaryUrl}
                          description={meme.cloudinaryUrl}
                          image={meme.cloudinaryUrl}
                          minted={meme.minted}
                          memeId={meme.id}
                          isCurrentMinting={false}
                          onMintSuccess={fetchMemes}
                        />
                      </div>
                    </div>
                  }
                />
              ))}
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}
