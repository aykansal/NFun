'use client';
import React from 'react';
import { Button } from '../ui/button';
import { useAuth } from '@/contexts/AuthContext';

export default function ConnectWallet() {
  const { wallet, loading, connectWallet, disconnectWallet } = useAuth();

  return (
    <div>
      {!wallet && (
        <Button
          className={`button connect-button`}
          onClick={connectWallet}
          disabled={loading}
        >
          {loading ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      )}
      {wallet && (
          <div className="flex items-center gap-3">
            <div 
            onClick={disconnectWallet}
            className="w-8 h-8 cursor-pointer rounded-full bg-[#FF0B7A] flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 1h6l2 2H5l2-2z"/>
              </svg>
            </div>
            <div>
              <p className="text-sm text-neutral-400">Connected Wallet</p>
              <p className="font-mono text-white">
                {`${wallet.slice(0, 6)}...${wallet.slice(-4)}`}
              </p>
            </div>
          </div>
      )}
    </div>
  );
}