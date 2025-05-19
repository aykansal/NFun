import { motion } from 'framer-motion';

interface PageTitleProps {
  title: string;
  className?: string;
}

export function PageTitle({ title, className = '' }: PageTitleProps) {
  return (
    <motion.h1
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`mb-6 md:mb-12 lg:mb-16 font-bold font-squid text-[#FF0B7A] text-2xl xs:text-3xl md:text-4xl lg:text-5xl text-center ${className}`}
    >
      {title}
    </motion.h1>
  );
} 