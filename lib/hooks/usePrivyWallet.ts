import { useSolanaWallets } from '@privy-io/react-auth/solana';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useState, useEffect, useMemo } from 'react';
import { createSolanaConnection, findWalletByAddress, fetchBalance } from '@/lib/privy-transactions';
import { useAuth } from '@/context/AuthContext';
import { PublicKey } from '@solana/web3.js';

export type WalletInfo = {
  address: string | null;
  publicKey: PublicKey | null;
  balance: number | null;
  isLoading: boolean;
  isConnected: boolean;
  isEmbedded: boolean;
  hasWallet: boolean;
};

export default function usePrivyWallet() {
  const { ready, user } = usePrivy();
  const { wallets } = useWallets();
  const { wallet: authWalletAddress } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const connection = useMemo(() => createSolanaConnection('devnet'), []);

  // Find the wallet object that matches our auth context wallet address
  const activeWallet = useMemo(() => {
    if (!ready || !authWalletAddress || wallets.length === 0) return null;
    return findWalletByAddress(authWalletAddress, wallets);
  }, [ready, authWalletAddress, wallets]);

  // Create a PublicKey from the address if we have one
  const publicKey = useMemo(() => {
    if (!authWalletAddress) return null;
    try {
      return new PublicKey(authWalletAddress);
    } catch (error) {
      console.error('Invalid wallet address', error);
      return null;
    }
  }, [authWalletAddress]);

  // When we have a wallet address, fetch its balance
  useEffect(() => {
    const getBalance = async () => {
      if (!authWalletAddress || !connection) {
        setBalance(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const bal = await fetchBalance(authWalletAddress, connection);
        setBalance(bal);
      } catch (error) {
        console.error('Error fetching balance:', error);
        setBalance(null);
      } finally {
        setIsLoading(false);
      }
    };

    getBalance();
  }, [authWalletAddress, connection]);

  // Information about our wallet
  const walletInfo: WalletInfo = {
    address: authWalletAddress,
    publicKey: publicKey,
    balance: balance,
    isLoading,
    isConnected: !!authWalletAddress,
    isEmbedded: activeWallet?.walletClientType === 'privy',
    hasWallet: wallets.length > 0
  };

  const { wallets: solanaWallets } = useSolanaWallets();
  // Functions for interacting with the wallet
  const signMessage = async ({ message }: { message: string }) => {
    if (!activeWallet || !authWalletAddress) {
      console.error('No active wallet');
      return null;
    }
    const { signature } = await solanaWallets[0].signMessage(new TextEncoder().encode(message));

    return signature;
  };

  return {
    connection,
    wallet: activeWallet,
    ...walletInfo,
    signMessage,
    userWallet: user?.wallet
  };
}