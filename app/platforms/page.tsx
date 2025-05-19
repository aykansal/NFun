'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { platforms } from '@/lib/constant';
import { SquidCard } from '@/components/ui/squid-card';
import { PageTitle } from '@/components/ui/page-title';
import { buttonVariants, containerVariants } from '@/styles/animations';

export default function PlatformsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto container max-w-7xl"
    >
      <PageTitle title="Select Platform" className="text-center py-4" />
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="gap-4 xs:gap-6 md:gap-8 grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3"
      >
        {platforms.map((platform) => (
          <SquidCard
            key={platform.id}
            animate={true}
            whileHoverEffect={true}
            padding="sm"
          >
            <Link href={platform.route} className="block p-0">
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
          </SquidCard>
        ))}
      </motion.div>
    </motion.div>
  );
}
