'use client';

import { motion } from 'framer-motion';
import { buttonVariants } from '@/styles/animations';
import { SquidCard } from '@/components/ui/squid-card';
import { PageTitle } from '@/components/ui/page-title';
import { games } from '@/lib/constant';
import Link from 'next/link';

export default function Gamezone() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto container max-w-7xl"
    >
      <PageTitle title="Game Zone" className="text-center py-4" />

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
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {games?.map((game) => (
          <SquidCard
            key={game.id}
            animate={!game.comingSoon}
            whileHoverEffect={true}
            padding="lg"
            className="overflow-hidden"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className="flex justify-center mb-6"
              >
                <game.icon className="w-16 h-16 text-[#FF0B7A] text-green-400" />
              </motion.div>
              <h2 className="text-2xl font-bold text-[#FF0B7A] mb-4 font-ibm">
                {game.title}
              </h2>
              <p className="text-gray-400 mb-8">{game.description}</p>
              <Link href={game.comingSoon ? '' : game.route}>
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  disabled={game.comingSoon}
                  className="squid-button px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {game.comingSoon ? 'Coming Soon' : 'Play Now'}
                </motion.button>
              </Link>
            </div>
          </SquidCard>
        ))}
      </motion.div>
    </motion.div>
  );
}
