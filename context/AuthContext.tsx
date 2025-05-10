'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Wallet } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { AuthorDetails } from '@/components/Footer';
import { AnimatePresence } from 'framer-motion';
import { createSigpassWallet } from '@/components/lazorkit/lib/sigpass';
import { AuthContextType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { WalletLoadingState } from '@/components/ui/WalletLoadingState';
import { WalletCreationStep } from '@/components/lazorkit/lib/sigpass';

// Create wallet context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Login UI component that doesn't use the auth context
const LoginUI = ({ onConnect }: { onConnect: () => Promise<void> }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  
  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await onConnect();
    } finally {
      setIsConnecting(false);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-[#FF0B7A] bg-[#0A0A0A] border-b-2 shadow-lg sticky top-0 z-50">
        <div className="flex justify-between items-center mx-auto px-4 py-3 container">
          <Link href="/" className="group">
            <h1 className="group-hover:text-[#FF0B7A] font-bold font-squid text-4xl text-white transition-colors duration-300 ease-in-out">
              NFT
              <span className="group-hover:text-white font-squid text-[#FF0B7A] transition-colors duration-300 ease-in-out">
                oodle
              </span>
            </h1>
          </Link>
        </div>
      </header>

      <div className="flex-grow flex flex-col justify-center items-center text-neutral-300 px-4 bg-[#0A0A0A]">
        <div className="max-w-3xl w-full flex flex-col justify-center items-center text-center py-12">
          <div className="relative w-24 h-24 mb-6">
            <Wallet className="w-full h-full text-[#FF0B7A]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Connect Your Wallet to Join the Fun!
            </h2>
            <p className="text-lg text-neutral-400 mb-6">
              Your wallet seems to be taking a coffee break ☕️
            </p>
            <Button
              className={`button connect-button ${isConnecting ? 'opacity-70' : ''}`}
              onClick={handleConnect}
              disabled={isConnecting}
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </Button>
          </div>
        </div>
      </div>

      <footer className="bg-[#0A0A0A] py-4">
        <div className="container mx-auto">
          <AuthorDetails className="text-center" />
        </div>
      </footer>
    </div>
  );
};

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [wallet, setWallet] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [walletCreationStep, setWalletCreationStep] = useState<WalletCreationStep | null>(null);

  useEffect(() => {
    const handleWalletCreationStep = (event: CustomEvent<{ step: WalletCreationStep }>) => {
      setWalletCreationStep(event.detail.step);
    };

    window.addEventListener('walletCreationStep', handleWalletCreationStep as EventListener);
    return () => {
      window.removeEventListener('walletCreationStep', handleWalletCreationStep as EventListener);
    };
  }, []);

  // Register user in the database
  const registerUserInDb = async (walletAddress: string) => {
    try {
      console.log('Registering user in database:', walletAddress);
      const response = await axios.post('/api/checkUser', {
        userWallet: walletAddress,
      });
      
      console.log('User registration response:', response.data);
      
      if (response.data.isNewUser) {
        toast.success('Welcome to NFun! Your account has been created.');
      } else {
        console.log('Existing user logged in:', response.data.user);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error registering user in database:', error);
      toast.error('Failed to register user in database');
      return null;
    }
  };

  // Initialize wallet state from localStorage on component mount
  useEffect(() => {
    const initializeWallet = async () => {
      const storedWallet = localStorage.getItem('SMART_WALLET_PUBKEY');
      if (storedWallet) {
        setWallet(storedWallet);
        console.log('Wallet restored from localStorage:', storedWallet.slice(0, 10));
        toast.success('Wallet connected successfully!');
        
        // Register/fetch the user in the database
        await registerUserInDb(storedWallet);
      }
      setLoading(false);
    };
    
    initializeWallet();
  }, []);

  async function connectWallet() {
    setLoading(true);
    try {
      const popup = window.open(
        'https://w3s.link/ipfs/bafybeibvvxqef5arqj4uy22zwl3hcyvrthyfrjzoeuzyfcbizjur4yt6by/?action=connect',
        'WalletAction',
        'width=600,height=400'
      );
      
      new Promise((resolve, reject) => {
        const handleMessage = (event: MessageEvent) => {
          if (event.data.type === 'WALLET_CONNECTED') {
            const { credentialId, publickey } = event.data.data;
            console.log('Credential ID:', credentialId);
            console.log('Public Key:', publickey);

            // Emit connecting step
            window.dispatchEvent(new CustomEvent('walletCreationStep', { 
              detail: { step: 'connecting' } 
            }));

            // Handle the promise with .then() to log the actual value
            createSigpassWallet(publickey)
              .then(async (smartWalletPubkey) => {
                localStorage.removeItem('SMART_WALLET_PUBKEY');
                console.log('Smart Wallet Pubkey:', smartWalletPubkey);
                localStorage.setItem('SMART_WALLET_PUBKEY', smartWalletPubkey);
                
                // Register user in database
                await registerUserInDb(smartWalletPubkey);
                
                setWallet(smartWalletPubkey);
                toast.success('Wallet connected successfully!');
                setWalletCreationStep(null); // Clear loading state
              })
              .catch((error) => {
                console.error('Error creating smart wallet:', error);
                toast.error('Failed to create smart wallet');
                setWalletCreationStep(null); // Clear loading state
              });

            localStorage.setItem('CREDENTIAL_ID', credentialId);
            localStorage.setItem('PUBLIC_KEY', publickey);

            window.removeEventListener('message', handleMessage);
            resolve({ credentialId, publickey });
          } else if (event.data.type === 'WALLET_DISCONNECTED') {
            console.log('Wallet disconnected');
            window.removeEventListener('message', handleMessage);
            reject(new Error('Wallet disconnected'));
            setWalletCreationStep(null); // Clear loading state
            if (popup) {
              popup.close();
            }
          } else if (event.data.type === 'WALLET_ERROR') {
            window.removeEventListener('message', handleMessage);
            reject(new Error(event.data.error));
            toast.error(`Connection error: ${event.data.error}`);
            setWalletCreationStep(null); // Clear loading state
            if (popup) {
              popup.close();
            }
          }
        };

        window.addEventListener('message', handleMessage);

        const checkPopupClosed = setInterval(() => {
          if (popup && popup.closed) {
            clearInterval(checkPopupClosed);
            window.removeEventListener('message', handleMessage);
            reject(new Error('Popup closed unexpectedly'));
            setWalletCreationStep(null); // Clear loading state
          }
        }, 500);

        setTimeout(() => {
          clearInterval(checkPopupClosed);
          window.removeEventListener('message', handleMessage);
          reject(new Error('Connection timeout'));
          setWalletCreationStep(null); // Clear loading state
        }, 60000);
      });
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet');
      setWalletCreationStep(null); // Clear loading state
    } finally {
      setLoading(false);
    }
  }

  const disconnectWallet = () => {
    localStorage.removeItem('CREDENTIAL_ID');
    localStorage.removeItem('PUBLIC_KEY');
    localStorage.removeItem('SMART_WALLET_PUBKEY');
    setWallet(null);
    toast.info('Wallet disconnected');
    console.log('Wallet disconnected');
  };

  // Always return the context provider, but conditionally render children or login UI
  return (
    <AuthContext.Provider value={{ wallet, loading, connectWallet, disconnectWallet }}>
      {!wallet && !loading ? (
        <LoginUI onConnect={connectWallet} />
      ) : (
        <AnimatePresence>{children}</AnimatePresence>
      )}
      {walletCreationStep && <WalletLoadingState currentStep={walletCreationStep} />}
    </AuthContext.Provider>
  );
}
