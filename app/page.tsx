'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { buttonVariants } from '@/styles/animations';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      duration: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
};

export default function LandingPage() {
 
  return (
    <div className="relative h-full w-full flex justify-center items-center overflow-hidden">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-center space-y-8 relative z-10 max-w-4xl mx-auto"
      >
        <motion.div variants={itemVariants} className="space-y-4 ">
          <motion.h1
            className="text-5xl md:text-7xl font-bold font-squid text-white"
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.2 },
            }}
          >
            <motion.span
              className="text-[#FF0B7A] inline-block"
              whileHover={{
                rotate: [0, -5, 5, 0],
                transition: { duration: 0.3 },
              }}
            >
              Game
            </motion.span>{' '}
            On,{' '}
            <motion.span
              className="text-[#FF0B7A] inline-block"
              whileHover={{
                rotate: [0, 5, -5, 0],
                transition: { duration: 0.3 },
              }}
            >
              Meme
            </motion.span>{' '}
            On
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-xl text-gray-300 max-w-2xl mx-auto"
          >
            Create, trade, and showcase unique NFTs with our next-gen platform
          </motion.p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8"
        >
          <Link href="/platforms">
            <motion.button
              variants={buttonVariants}
              whileHover={{
                scale: 1.05,
                textShadow: '0 0 8px rgb(255,11,122)',
                boxShadow: '0 0 8px rgb(255,11,122)',
              }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 text-xl rounded-lg bg-gradient-to-r from-[#FF0B7A] to-[#FF0B7A]/80 hover:from-[#FF0B7A]/90 hover:to-[#FF0B7A]/70 transition-all duration-300"
            >
              Start Creating
            </motion.button>
          </Link>

          <Link href="/gallery">
            <motion.button
              variants={buttonVariants}
              whileHover={{
                scale: 1.05,
                textShadow: '0 0 8px rgb(255,11,122)',
                boxShadow: '0 0 8px rgb(255,11,122)',
              }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 text-xl rounded-lg border-2 border-[#FF0B7A] hover:bg-[#FF0B7A]/10 transition-all duration-300"
            >
              View Gallery
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

// 'use client';

// import Link from 'next/link';
// import { motion, useAnimation } from 'framer-motion';
// import { useEffect, useState } from 'react';
// import { buttonVariants } from '@/styles/animations';

// const containerVariants = {
//   hidden: { opacity: 0 },
//   visible: {
//     opacity: 1,
//     transition: {
//       staggerChildren: 0.2,
//       duration: 0.3,
//     },
//   },
// };

// const itemVariants = {
//   hidden: { opacity: 0, y: 20 },
//   visible: {
//     opacity: 1,
//     y: 0,
//     transition: {
//       duration: 0.3,
//     },
//   },
// };

// export default function LandingPage() {
//   const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
//   const backgroundControls = useAnimation();

//   useEffect(() => {
//     const handleMouseMove = (e: MouseEvent) => {
//       const { clientX, clientY } = e;
//       const moveX = clientX - window.innerWidth / 2;
//       const moveY = clientY - window.innerHeight / 2;
//       const boundedMoveX = Math.min(
//         Math.max(moveX, -window.innerWidth / 2),
//         window.innerWidth / 2
//       );
//       const boundedMoveY = Math.min(
//         Math.max(moveY, -window.innerHeight / 2),
//         window.innerHeight / 2
//       );
//       const offsetFactor = 0.01;

//       setMousePosition({ x: boundedMoveX, y: boundedMoveY });
//       backgroundControls.start({
//         x: boundedMoveX * offsetFactor,
//         y: boundedMoveY * offsetFactor,
//         transition: { type: 'spring', stiffness: 150, damping: 15 },
//       });
//     };

//     window.addEventListener('mousemove', handleMouseMove);
//     return () => window.removeEventListener('mousemove', handleMouseMove);
//   }, [backgroundControls]);

//   return (
//     <div className="h-full w-full flex justify-center items-center">
//       {/* Interactive glow effect following cursor */}
//       <motion.div
//         className="absolute w-52 h-52 rounded-full pointer-events-none"
//         animate={{
//           opacity: 0.2,
//         }}
//         style={{
//           background:
//             'radial-gradient(circle, rgba(255,11,122,0.15) 80%,rgba(255,11,122,0) 70%)',
//           left: `calc(50% + ${mousePosition.x}px)`,
//           top: `calc(50% + ${mousePosition.y}px)`,
//           transform: 'translate(-50%, -50%)',
//         }}
//       />

//       <motion.div
//         variants={containerVariants}
//         initial="hidden"
//         animate="visible"
//         className="text-center space-y-8 relative z-10 max-w-4xl mx-auto"
//       >
//         <motion.div variants={itemVariants} className="space-y-4 ">
//           <motion.h1
//             className="text-5xl md:text-7xl font-bold font-squid text-white"
//             whileHover={{
//               scale: 1.05,
//               transition: { duration: 0.2 },
//             }}
//           >
//             <motion.span
//               className="text-[#FF0B7A] inline-block"
//               whileHover={{
//                 rotate: [0, -5, 5, 0],
//                 transition: { duration: 0.3 },
//               }}
//             >
//               Game
//             </motion.span>{' '}
//             On,{' '}
//             <motion.span
//               className="text-[#FF0B7A] inline-block"
//               whileHover={{
//                 rotate: [0, 5, -5, 0],
//                 transition: { duration: 0.3 },
//               }}
//             >
//               Meme
//             </motion.span>{' '}
//             On
//           </motion.h1>

//           <motion.p
//             variants={itemVariants}
//             className="text-xl text-gray-300 max-w-2xl mx-auto"
//           >
//             Create, trade, and showcase unique NFTs with our next-gen platform
//           </motion.p>
//         </motion.div>

//         <motion.div
//           variants={itemVariants}
//           className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8"
//         >
//           <Link href="/platforms">
//             <motion.button
//               variants={buttonVariants}
//               whileHover={{
//                 scale: 1.05,
//                 textShadow: '0 0 8px rgb(255,11,122)',
//                 boxShadow: '0 0 8px rgb(255,11,122)',
//               }}
//               whileTap={{ scale: 0.95 }}
//               className="px-8 py-3 text-xl rounded-lg bg-gradient-to-r from-[#FF0B7A] to-[#FF0B7A]/80 hover:from-[#FF0B7A]/90 hover:to-[#FF0B7A]/70 transition-all duration-300"
//             >
//               Start Creating
//             </motion.button>
//           </Link>

//           <Link href="/gallery">
//             <motion.button
//               variants={buttonVariants}
//               whileHover={{
//                 scale: 1.05,
//                 textShadow: '0 0 8px rgb(255,11,122)',
//                 boxShadow: '0 0 8px rgb(255,11,122)',
//               }}
//               whileTap={{ scale: 0.95 }}
//               className="px-8 py-3 text-xl rounded-lg border-2 border-[#FF0B7A] hover:bg-[#FF0B7A]/10 transition-all duration-300"
//             >
//               View Gallery
//             </motion.button>
//           </Link>
//         </motion.div>
//       </motion.div>
//     </div>
//   );
// }
