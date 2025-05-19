'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SquidCardProps {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  animate?: boolean;
  whileHoverEffect?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  as?: 'div' | 'article' | 'section';
}

const paddingVariants = {
  none: '',
  sm: 'p-2 xs:p-3',
  md: 'p-3 xs:p-4 sm:p-6',
  lg: 'p-4 xs:p-6 sm:p-8',
  xl: 'p-6 xs:p-8 sm:p-10'
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  hover: { scale: 1.03, transition: { duration: 0.2 } }
};

/**
 * SquidCard - A reusable card component with Squid Game styling
 * 
 * @param children - Content to render inside the card
 * @param className - Additional classes to apply
 * @param onClick - Optional click handler
 * @param animate - Whether to animate the card with framer-motion
 * @param whileHoverEffect - Whether to apply hover effect with framer-motion
 * @param padding - Padding size: 'none', 'sm', 'md', 'lg', 'xl'
 * @param as - HTML element to render as
 */
export function SquidCard({
  children,
  className,
  onClick,
  animate = false,
  whileHoverEffect = false,
  padding = 'md',
  as = 'div'
}: SquidCardProps) {
  const Component = as;
  const paddingClass = paddingVariants[padding];
  
  // Use motion.div if animation is enabled, otherwise use regular component
  if (animate) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        whileHover={whileHoverEffect ? "hover" : undefined}
        className={cn("squid-card", paddingClass, className)}
        onClick={onClick}
      >
        {children}
      </motion.div>
    );
  }
  
  return (
    <Component
      className={cn("squid-card", paddingClass, className)}
      onClick={onClick}
    >
      {children}
    </Component>
  );
} 