'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Wallet } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { AuthorDetails } from '@/components/Footer';
import { AnimatePresence } from 'framer-motion';
import { AuthContextType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { usePrivy } from '@privy-io/react-auth';
import Cookies from 'js-cookie';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Login UI component that doesn't use the auth context
const LoginUI = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const { login } = usePrivy();

  const handleSolanaLogin = async () => {
    setIsConnecting(true);
    try {
      // Use login method with Solana wallet options
      login({
        loginMethods: ['wallet'],
      });
    } finally {
      setTimeout(() => setIsConnecting(false), 1000);
    }
  };

  // const handleGoogleLogin = async () => {
  //   try {
  //     await login({
  //       loginMethods: ['google'],
  //     });
  //   } catch (error) {
  //     console.error('Google login error:', error);
  //   }
  // };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-[#FF0B7A] bg-[#0A0A0A] border-b-2 shadow-lg sticky top-0 z-50">
        <div className="flex justify-between items-center mx-auto px-4 py-3 container">
          <Link href="/" className="group">
            <h1 className="group-hover:text-[#FF0B7A] font-bold font-squid text-4xl text-white transition-colors duration-300 ease-in-out">
              N
              <span className="group-hover:text-white font-squid text-[#FF0B7A] transition-colors duration-300 ease-in-out">
                Fun
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
              className={`bg-[#FF0B7A] hover:bg-[#FF0B7A]/80 text-white ${isConnecting ? 'opacity-70' : ''} mb-4 mr-3`}
              onClick={handleSolanaLogin}
              disabled={isConnecting}
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </Button>
            {/* <Button
              variant="outline"
              onClick={handleGoogleLogin}
              className="mb-4"
            >
              Continue with Google
            </Button> */}

            {/* <p className="text-sm text-neutral-500 mt-2">
              No wallet? Sign in with Google to create one automatically
            </p> */}
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
  const [loading, setLoading] = useState(true);
  const [dbRegistered, setDbRegistered] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const {
    user,
    logout,
    authenticated,
    connectWallet,
    ready: isReady,
  } = usePrivy();

  // Register user in the database
  const registerUserInDb = async (walletAddress: string) => {
    try {
      console.log('Registering user in database:', walletAddress);
      const response = await axios.post('/api/checkUser', {
        userWallet: walletAddress,
      });

      console.log('User registration response:', response.data);

      if (response.data.isNewUser) {
        toast.success('Welcome to NFToodle! Your account has been created.');
      } else {
        console.log('Existing user logged in:', response.data.user);
      }

      if (response.data.userExists) {
        setDbRegistered(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error registering user in database:', error);
      toast.error('Failed to register user in database. Please try again.');
      setDbRegistered(false);
      return false;
    }
  };
  async function initializeUser() {
    if (authenticated && user) {
      setLoading(true);
      try {
        // Get the wallet address from the user's linked accounts
        const walletAccounts = user.linkedAccounts.filter(
          (account) => account.type === 'wallet'
        );

        let walletAddress = null;

        if (walletAccounts.length > 0) {
          walletAddress = walletAccounts[0].address;
          console.log('User authenticated with wallet:', walletAddress);
        } else if (user.wallet && user.wallet.address) {
          // For embedded wallets
          walletAddress = user.wallet.address;
          console.log(
            'User authenticated with embedded wallet:',
            walletAddress
          );
        }

        if (walletAddress) {
          // Register user in database
          const registrationSuccess = await registerUserInDb(walletAddress);

          if (registrationSuccess) {
            toast.success('Wallet connected successfully!');
            setDbRegistered(true);
            // Set wallet address cookie for middleware authentication
            Cookies.set('wallet_address', walletAddress, {
              path: '/',
              sameSite: 'strict',
            });
          } else {
            toast.error('Failed to register wallet. Please try again.');
            await logout();
            setDbRegistered(false);
            // Remove wallet address cookie if registration fails
            Cookies.remove('wallet_address', { path: '/' });
          }
        } else {
          toast.error('No wallet found. Please try again with a wallet.');
          await logout();
          setDbRegistered(false);
          // Remove wallet address cookie if no wallet found
          Cookies.remove('wallet_address', { path: '/' });
        }
      } catch (error) {
        console.error('Error initializing user:', error);
        toast.error('Failed to initialize user');
        setDbRegistered(false);
        // Remove wallet address cookie on error
        Cookies.remove('wallet_address', { path: '/' });
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
      setDbRegistered(false);
      // Remove wallet address cookie if not authenticated
      Cookies.remove('wallet_address', { path: '/' });
    }
  }
  // Handle Privy authentication
  useEffect(() => {
    if (!isReady) {
      // Privy is still initializing
      return;
    }

    initializeUser();
  }, [isReady, authenticated, user, logout]);

  const disconnectWallet = async () => {
    try {
      await logout();
      setDbRegistered(false);
      toast.info('Wallet disconnected');
      // Remove wallet address cookie on disconnect
      Cookies.remove('wallet_address', { path: '/' });
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      toast.error('Failed to disconnect wallet');
    }
  };

  // Create a function that returns a Promise for connectWallet to match AuthContextType
  const handleConnectWallet = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        connectWallet();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  };

  useEffect(() => {
    if (user?.wallet?.address) {
      setWalletAddress(user.wallet.address);
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        wallet: walletAddress,
        loading: loading || !isReady,
        connectWallet: handleConnectWallet,
        disconnectWallet,
      }}
    >
      {!isReady ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF0B7A]" />
        </div>
      ) : (!authenticated || !dbRegistered) && !loading ? (
        <LoginUI />
      ) : (
        <AnimatePresence>{children}</AnimatePresence>
      )}
    </AuthContext.Provider>
  );
}
