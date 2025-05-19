'use client';

import MintingOverlay from './MintingOverlay';
import { useMinting } from '@/context/MintingContext';

const MintingOverlayWrapper = () => {
  const { isMinting, currentStep } = useMinting();

  return <MintingOverlay isVisible={isMinting} currentStep={currentStep} />;
};

export default MintingOverlayWrapper;
