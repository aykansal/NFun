'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  buttonVariants,
  cardVariants,
  containerVariants,
} from '@/styles/animations';

const platforms = [
  {
    id: 1,
    name: 'UnleashNFTs.com',
    logo: '/unleash-logo.svg',
    route: '/platforms/unleash',
    description: 'Unleash your NFTs',
  },
  {
    id: 3,
    name: 'The Buffers',
    logo: 'https://arweave.net/lIZ2tPFGxcSMws5il-H07c--JYmF55C1sEuJC8abMIw',
    route: '/platforms/thebuffers',
    description: 'The Buffers',
  },
  {
    id: 4,
    name: 'OpenSea.io',
    logo: 'https://opensea.io/static/images/logos/opensea-logo.svg',
    route: '/platforms/opensea',
    description: 'OpenSea NFT marketplace',
  },
  // {
  //   id: 2,
  //   name: 'Bazar.arweave.dev',
  //   logo: 'https://pbs.twimg.com/profile_images/1686990003266568192/El3x-VID_400x400.jpg',
  //   route: '/platforms/bazar',
  //   description: 'Bazar NFT marketplace',
  // },
];

export default function PlatformsPage() {
  return (
    <div className="px-3 xs:px-4 sm:px-6 md:px-8 py-4 xs:py-6 md:py-8 w-full flex-grow overflow-auto text-white">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="mx-auto container max-w-7xl"
      >
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6 xs:mb-8 md:mb-12 lg:mb-16 font-bold font-squid text-[#FF0B7A] text-2xl xs:text-3xl md:text-4xl lg:text-5xl text-center"
        >
          Select Platform
        </motion.h1>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="gap-4 xs:gap-6 md:gap-8 grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3"
        >
          {platforms.map((platform) => (
            <motion.div
              key={platform.id}
              variants={cardVariants}
              whileHover="hover"
              className="will-change-transform overflow-hidden squid-card"
            >
              <Link href={platform.route} className="block p-3 xs:p-4 md:p-6">
                <div className="flex flex-col items-center space-y-2 xs:space-y-3 md:space-y-4">
                  <div className="relative w-16 h-16 xs:w-24 xs:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32">
                    <Image
                      src={platform.logo}
                      alt={platform.name}
                      fill
                      sizes="(max-width: 475px) 64px, (max-width: 640px) 96px, (max-width: 768px) 112px, 128px"
                      className="object-contain"
                      priority={platform.id <= 2}
                    />
                  </div>
                  <h2 className="font-bold font-ibm text-[#FF0B7A] text-lg xs:text-xl md:text-2xl">
                    {platform.name}
                  </h2>
                  <p className="text-center text-gray-400 text-xs xs:text-sm md:text-base">
                    {platform.description}
                  </p>
                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className="mt-2 xs:mt-3 md:mt-4 px-4 xs:px-5 md:px-6 py-1.5 xs:py-2 rounded-lg will-change-transform squid-button text-xs xs:text-sm md:text-base"
                  >
                    View NFTs
                  </motion.button>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
