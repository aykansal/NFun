import React from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { buttonVariants } from '@/styles/animations';

const XShareButton = () => {
  const shareOnTwitter = () => {
    try {
      const tweetContent = encodeURIComponent(
        `🦑 Just created this epic Squid Game meme on NFToodle! Join the game at https://NFToodle.vercel.app\n\n` +
          `#SquidGame #NFToodle #NFTs` +
          `built by @aykansal`
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
      className="flex justify-center items-center gap-1.5 xs:gap-2 squid-button px-3 py-2 xs:px-4 xs:py-2.5 rounded-lg w-full transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span className="font-squid text-white text-sm xs:text-base">Share</span>
      <Image
        src="/x.svg"
        alt="X"
        width={16}
        height={16}
        className="brightness-0 invert xs:w-[18px] xs:h-[18px] md:w-[20px] md:h-[20px] transition-transform duration-300 group-hover:rotate-12"
      />
    </motion.button>
  );
};

export default XShareButton;
