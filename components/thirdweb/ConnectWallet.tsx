'use client';
import React from 'react';
import { Button } from '../ui/button';
import { useAuth } from '@/context/AuthContext';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { Wallet } from 'lucide-react';

export default function ConnectWallet() {
  const { wallet, loading, connectWallet, disconnectWallet } = useAuth();
  const { ready: privyReady } = usePrivy();
  const { wallets } = useWallets();

  const displayAddress = wallet
    ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}`
    : '';

  // Get wallet balance when available
  const [balance, setBalance] = React.useState<string | null>(null);

  React.useEffect(() => {
    const getBalance = async () => {
      if (!wallet || !privyReady || wallets.length === 0) return;

      try {
        const embeddedWallet = wallets.find(
          (w) => w.address?.toLowerCase() === wallet?.toLowerCase()
        );

        if (embeddedWallet) {
          const provider = await embeddedWallet.getEthereumProvider();
          const bal = await provider.request({
            method: 'getBalance',
            params: [wallet, 'latest'],
          });

          if (bal) {
            // Convert to SOL and format
            const solBalance = parseInt(bal) / 1000000000;
            setBalance(solBalance.toFixed(4));
          }
        }
      } catch (error) {
        console.error('Error fetching wallet balance:', error);
      }
    };

    getBalance();
  }, [wallet, privyReady, wallets]);

  return (
    <div>
      {!wallet && (
        <Button
          className={`button connect-button text-xs xs:text-sm`}
          onClick={connectWallet}
          disabled={loading}
          size="sm"
        >
          {loading ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      )}
      {wallet && (
        <div className="flex items-center gap-1 xs:gap-3">
          <div
            onClick={disconnectWallet}
            className="w-6 h-6 xs:w-8 xs:h-8 cursor-pointer rounded-full bg-[#FF0B7A] flex items-center justify-center"
          >
            <Wallet className="h-3 w-3 xs:h-5 xs:w-5 text-white" />
          </div>
          <div>
            <p className="text-xs xs:text-sm text-neutral-400">Connected Wallet</p>
            <div className="flex flex-col">
              <p className="font-mono text-xs xs:text-sm text-white">{displayAddress}</p>
              {balance && (
                <p className="text-[10px] xs:text-xs text-[#FF0B7A]">{balance} SOL</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
