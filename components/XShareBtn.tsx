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
      className="flex justify-center items-center gap-1 xs:gap-2 squid-button px-2 py-1.5 xs:px-3 xs:py-2 rounded-lg w-full transform transition-all duration-300"
    >
      <span className="font-squid text-white">Share</span>
      <Image
        src="/x.svg"
        alt="X"
        width={14}
        height={14}
        className="brightness-0 invert xs:w-[16px] xs:h-[16px] md:w-[18px] md:h-[18px] lg:w-[20px] lg:h-[20px]"
      />
    </motion.button>
  );
};

export default XShareButton;
