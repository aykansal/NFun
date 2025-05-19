'use client';
import Image from 'next/image';
import { motion } from 'framer-motion';

const loadingMessages = [
  'Loading your awesome memes...',
  'Preparing the fun...',
  'Almost there...',
  'Getting everything ready...',
  'Loading the good stuff...',
  'Just a moment...',
  'Loading the fun...',
  'Preparing the magic...',
];

export default function Loading() {
  const randomMessage =
    loadingMessages[Math.floor(Math.random() * loadingMessages.length)];

  return (
    <div className="h-full flex flex-col justify-center items-center space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center"
      >
        <p className="text-xl font-medium text-[#FF0B7A] mb-2">
          {randomMessage}
        </p>
        <div className="flex justify-center">
          <Image
            src={'https://media.tenor.com/Sy3vKl_rbMYAAAAi/laby-eating.gif'}
            height={150}
            width={150}
            alt="loading-gif"
            className="rounded-lg"
          />
        </div>
      </motion.div>
    </div>
  );
}

// import { Circle, Square, Triangle } from 'lucide-react';
// export default function Loading() {
//   return (
//     <div className="min-h-[66vh] flex justify-center items-center space-x-4">
//       <Square className="w-12 h-12 text-[#FF0B7A] animate-spin" />
//       <Circle className="w-12 h-12 text-[#45D62E] animate-pulse" />
//       <Triangle className="w-12 h-12 text-[#FF0B7A] animate-bounce" />
//     </div>
//   );
// }
