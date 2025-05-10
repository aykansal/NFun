'use client';

import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';

import { cn } from '@/lib/utils';

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      'relative flex w-full touch-none select-none items-center',
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative bg-secondary rounded-full w-full h-2 overflow-hidden grow">
      <SliderPrimitive.Range className="absolute bg-[#FF0B7A] h-full" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block border-2 border-primary bg-background disabled:opacity-50 rounded-full focus-visible:ring-2 focus-visible:ring-ring ring-offset-background focus-visible:ring-offset-2 w-5 h-5 transition-colors disabled:pointer-events-none focus-visible:outline-none" />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
