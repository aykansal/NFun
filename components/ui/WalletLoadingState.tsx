import { Loader2 } from 'lucide-react';

interface WalletLoadingStateProps {
  currentStep: 'connecting' | 'generating' | 'finalizing';
}

export function WalletLoadingState({ currentStep }: WalletLoadingStateProps) {
  const getStepMessage = () => {
    switch (currentStep) {
      case 'connecting':
        return 'Connecting to your wallet...';
      case 'generating':
        return 'Generating your smart wallet...';
      case 'finalizing':
        return 'Finalizing setup...';
      default:
        return 'Processing...';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#0A0A0A] border-2 border-[#FF0B7A] rounded-lg p-6 flex flex-col items-center gap-4 max-w-sm w-full mx-4">
        <Loader2 className="w-8 h-8 text-[#FF0B7A] animate-spin" />
        <div className="text-center">
          <h3 className="text-white font-squid text-xl mb-2">Setting Up Your Wallet</h3>
          <p className="text-gray-400 font-ibm">{getStepMessage()}</p>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-1.5 mt-2">
          <div 
            className="bg-[#FF0B7A] h-1.5 rounded-full transition-all duration-500"
            style={{ 
              width: currentStep === 'connecting' ? '33%' : 
                     currentStep === 'generating' ? '66%' : '100%' 
            }}
          />
        </div>
      </div>
    </div>
  );
} 