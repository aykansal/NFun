import { Loader2 } from 'lucide-react';

interface WalletLoadingStateProps {
  message?: string;
  subMessage?: string;
  showProgress?: boolean;
  progress?: number; // 0-100
}

export function WalletLoadingState({ 
  message = "Setting Up Your Wallet", 
  subMessage = "Please wait while we configure your wallet...",
  showProgress = true,
  progress = 50
}: WalletLoadingStateProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#0A0A0A] border-2 border-[#FF0B7A] rounded-lg p-6 flex flex-col items-center gap-4 max-w-sm w-full mx-4">
        <Loader2 className="w-8 h-8 text-[#FF0B7A] animate-spin" />
        <div className="text-center">
          <h3 className="text-white font-squid text-xl mb-2">{message}</h3>
          <p className="text-gray-400 font-ibm">{subMessage}</p>
        </div>
        {showProgress && (
          <div className="w-full bg-gray-800 rounded-full h-1.5 mt-2">
            <div 
              className="bg-[#FF0B7A] h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
} 