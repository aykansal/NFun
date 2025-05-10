import React from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { buttonVariants } from '@/styles/animations';

const XShareButton = ({ imageUrl }: { imageUrl: string }) => {
  const shareOnTwitter = () => {
    try {
      const tweetContent = encodeURIComponent(
        `🦑 Just created this epic Squid Game meme on NFun! Join the game at https://NFun.ayverse.me\n\n` +
          `🎮 Check out my creation:\n${imageUrl}\n\n` +
          `#SquidGame #NFun #NFTs` +
          `credits: @aykansal & @satyanshmittal`
      );
      const twitterUrl = `https://twitter.com/intent/tweet?text=${tweetContent}`;
      window.open(twitterUrl, '_blank');
      toast.success('Opening X to share your meme! Let the games begin! 🦑');
    } catch (error) {
      console.error('Error sharing to X:', error);
      toast.error('Game Over: Failed to share on X. Try again!');
    }
  };

  return (
    <motion.button
      variants={buttonVariants}
      whileHover="hover"
      whileTap="tap"
      onClick={shareOnTwitter}
      className="flex justify-center items-center gap-2 squid-button px-4 py-2 rounded-lg w-full sm:w-auto transform transition-all duration-300"
    >
      <span className="font-squid text-white">Share</span>
      <Image
        src="/x.svg"
        alt="X"
        width={20}
        height={20}
        className="brightness-0 invert" // Makes the X logo white
      />
    </motion.button>
  );
};

export default XShareButton;
