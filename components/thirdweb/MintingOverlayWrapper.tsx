'use client';

import MintingOverlay from './MintingOverlay';
import { useMinting } from '@/context/MintingContext';

const MintingOverlayWrapper = () => {
  const { isMinting, currentStep } = useMinting();

  // This component just wraps the overlay and provides it with the context values
  return <MintingOverlay isVisible={isMinting} currentStep={currentStep} />;
};

export default MintingOverlayWrapper;
