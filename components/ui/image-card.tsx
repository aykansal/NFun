'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { SquidCard } from './squid-card';

interface ImageCardProps {
  imageSrc: string;
  imageAlt?: string;
  aspectRatio?: 'square' | '16:9' | 'auto';
  className?: string;
  imageClassName?: string;
  actionBar?: React.ReactNode;
  footer?: React.ReactNode;
  badge?: React.ReactNode;
  animate?: boolean;
  whileHoverEffect?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  imageQuality?: number;
  onClick?: () => void;
  priority?: boolean;
  fill?: boolean;
  coverImage?: boolean;
}

/**
 * ImageCard - A specialized card component for displaying images with optional actions
 */
export function ImageCard({
  imageSrc,
  imageAlt = 'Card image',
  aspectRatio = 'square',
  className,
  imageClassName,
  actionBar,
  footer,
  badge,
  animate = false,
  whileHoverEffect = false,
  padding = 'sm',
  imageQuality = 90,
  onClick,
  priority = false,
  fill = true,
  coverImage = true,
}: ImageCardProps) {
  const aspectRatioClass = {
    'square': 'aspect-square',
    '16:9': 'aspect-video',
    'auto': 'aspect-auto'
  }[aspectRatio];

  return (
    <SquidCard 
      className={className}
      animate={animate} 
      whileHoverEffect={whileHoverEffect}
      padding={padding}
      onClick={onClick}
    >
      <div className="flex flex-col h-full">
        <div className={cn("relative overflow-hidden rounded-lg", aspectRatioClass)}>
          {fill ? (
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              quality={imageQuality}
              className={cn(
                coverImage ? "object-cover" : "object-contain", 
                imageClassName
              )}
              sizes="(max-width: 475px) 100vw, (max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={priority}
            />
          ) : (
            <Image
              src={imageSrc}
              alt={imageAlt}
              width={400}
              height={400}
              quality={imageQuality}
              className={cn(
                coverImage ? "object-cover w-full h-full" : "object-contain w-full h-full",
                imageClassName
              )}
              sizes="(max-width: 475px) 100vw, (max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={priority}
            />
          )}
          
          {badge && (
            <div className="absolute top-2 right-2 z-10">
              {badge}
            </div>
          )}
          
          {actionBar && (
            <div className="absolute top-2 left-2 z-10">
              {actionBar}
            </div>
          )}
        </div>
        
        {footer && (
          <div className="mt-2 xs:mt-3 md:mt-4">
            {footer}
          </div>
        )}
      </div>
    </SquidCard>
  );
} 