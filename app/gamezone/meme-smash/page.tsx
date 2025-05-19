'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Loader2 } from '@/components/loader';
import { PageTitle } from '@/components/ui/page-title';

interface Meme {
  id: number;
  cloudinaryUrl: string;
  originalImage: string;
  userWallet: string;
  createdAt: string;
  minted: boolean;
  txnhash: string | null;
  votes: number;
}

const MemeSmash = () => {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [currentPairIndexes, setCurrentPairIndexes] = useState([0, 1]);
  const [sessionScore, setSessionScore] = useState(0);
  const [selectedMemeIndexInPair, setSelectedMemeIndexInPair] = useState<
    number | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    const fetchMemes = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/memes?limit=20&sort=random');
        if (!response.ok) {
          throw new Error(`Failed to fetch memes: ${response.statusText}`);
        }
        const data = await response.json();
        if (!data.memes || data.memes.length < 2) {
          setMemes([]);
          throw new Error('Not enough memes available to play.');
        }
        setMemes(data.memes);
        setCurrentPairIndexes([0, 1]);
        setAnimationKey((prev) => prev + 1);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load memes');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMemes();
  }, []);

  const handleVote = async (indexInPair: number) => {
    if (selectedMemeIndexInPair !== null) return;

    setSelectedMemeIndexInPair(indexInPair);
    setSessionScore((prev) => prev + 1);

    const votedMemeId = memes[currentPairIndexes[indexInPair]].id;

    try {
      const res = await fetch(`/api/memes/id/${votedMemeId}/vote`, {
        method: 'POST',
      });
      if (!res.ok) {
        console.error('Failed to record vote:', await res.text());
      }
    } catch (apiError) {
      console.error('API call failed during vote:', apiError);
    }

    setTimeout(() => {
      setSelectedMemeIndexInPair(null);
      setCurrentPairIndexes((prevPair) => {
        let nextFirstIndex = prevPair[0] + 2;
        let nextSecondIndex = prevPair[1] + 2;

        if (nextSecondIndex >= memes.length) {
          const shuffled = [...memes].sort(() => Math.random() - 0.5);
          setMemes(shuffled);
          nextFirstIndex = 0;
          nextSecondIndex = 1;
        }
        setAnimationKey((prev) => prev + 1);
        return [nextFirstIndex, nextSecondIndex];
      });
    }, 1000);
  };

  if (isLoading) {
    return <Loader2 />;
  }

  if (error) {
    return (
      <div className="text-white p-4 sm:p-8 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 p-8 rounded-lg shadow-xl"
        >
          <h2 className="text-3xl font-bold text-[#FF0B7A] mb-4 font-squid">
            Oops! Meme-ergency!
          </h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <motion.button
            onClick={() => window.location.reload()}
            className="px-6 py-3 text-lg rounded-lg bg-gradient-to-r from-[#FF0B7A] to-[#ff57a3] hover:from-[#FF0B7A]/90 hover:to-[#ff57a3]/90 transition-all duration-300 font-semibold"
            whileHover={{
              scale: 1.05,
              textShadow: '0 0 8px rgb(255,11,122)',
              boxShadow: '0 0 15px rgb(255,11,122)',
            }}
            whileTap={{ scale: 0.95 }}
          >
            Try Again
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (
    memes.length < 2 ||
    !memes[currentPairIndexes[0]] ||
    !memes[currentPairIndexes[1]]
  ) {
    return (
      <div className="text-white p-4 sm:p-8 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 p-8 rounded-lg shadow-xl"
        >
          <h2 className="text-3xl font-bold text-[#FF0B7A] mb-4 font-squid">
            Fresh Memes Incoming!
          </h2>
          <p className="text-gray-300">
            We&apos;re fetching more memes. Please check back shortly.
          </p>
        </motion.div>
      </div>
    );
  }

  const meme1 = memes[currentPairIndexes[0]];
  const meme2 = memes[currentPairIndexes[1]];

  return (
    <div className="text-white flex flex-col items-center">
      <header className="w-full flex items-center justify-center mb-6 md:mb-8 lg:mb-10">
        <div className="flex flex-col justify-between gap-4 items-start w-full h-full">
          <PageTitle className="mb-0 md:mb-0 lg:mb-0" title="Meme Smash" />
          <p className="text-gray-400 text-lg">Choose the G.O.A.T Meme!</p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur-md p-4 sm:p-6 rounded-xl shadow-2xl w-full max-w-xs text-center"
        >
          <p className="text-xl text-gray-300">Session Score:</p>
          <motion.div
            key={sessionScore}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="text-4xl font-bold text-[#FF0B7A] mt-1"
          >
            {sessionScore}
          </motion.div>
        </motion.div>
      </header>

      <AnimatePresence mode="wait">
        <motion.div
          key={animationKey}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 w-full max-w-4xl"
        >
          {[meme1, meme2].map((meme, indexInPair) => (
            <motion.div
              key={meme.id}
              className={`relative aspect-[4/5] sm:aspect-square cursor-pointer group overflow-hidden rounded-xl border-2 
                ${selectedMemeIndexInPair === indexInPair ? 'border-[#FF0B7A] shadow-lg shadow-[#FF0B7A]/40' : 'border-gray-700 hover:border-[#FF0B7A]/50'}
                ${selectedMemeIndexInPair !== null && selectedMemeIndexInPair !== indexInPair ? 'opacity-40 grayscale' : ''}
              `}
              onClick={() => handleVote(indexInPair)}
              layout
              whileHover={
                selectedMemeIndexInPair === null ? { scale: 1.02, y: 0 } : {}
              }
              whileTap={selectedMemeIndexInPair === null ? { scale: 0.98 } : {}}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{
                opacity: 1,
                scale: selectedMemeIndexInPair === indexInPair ? 1.05 : 1,
                transition: {
                  duration: 0.25,
                  type: 'tween',
                  delay: indexInPair * 0.05,
                },
              }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Image
                src={meme.cloudinaryUrl}
                alt={`Meme by ${meme.userWallet.substring(0, 6)}...`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                priority={true}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-3 sm:p-4 flex flex-col justify-end">
                <motion.h3
                  className="text-base sm:text-lg font-semibold text-white mb-1 truncate"
                  title={`Meme #${meme.id} - Votes: ${meme.votes}`}
                >
                  #{meme.id}
                </motion.h3>
                <motion.h3
                  className="text-base sm:text-lg font-semibold text-white mb-1 truncate"
                  title={`Meme #${meme.id} - Votes: ${meme.votes}`}
                >
                  Meme by {meme.userWallet.substring(0, 4)}...
                  {meme.userWallet.substring(meme.userWallet.length - 4)}
                </motion.h3>
              </div>
              {selectedMemeIndexInPair === indexInPair && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center bg-[#FF0B7A]/60"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg
                    className="w-12 h-12 sm:w-16 sm:w-16 text-white"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                </motion.div>
              )}
              <motion.div
                className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm rounded-full bg-[#FF0B7A]/70 backdrop-blur-sm text-white font-semibold shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                whileHover={{
                  scale: 1.05,
                  backgroundColor: 'rgba(255,11,122,0.9)',
                }}
              >
                Vote!
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default MemeSmash;
