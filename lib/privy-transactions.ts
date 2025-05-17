import { Connection, Transaction, PublicKey } from '@solana/web3.js';
import { toast } from 'sonner';

// Types for the different wallet types we support
type Provider = {
  // @ts-expect-error ignore
  request: (request: { method: string; params }) => Promise;
};

type ExternalWallet = {
  address: string;
  walletClientType: 'privy' | 'external';
  getEthereumProvider: () => Promise<Provider>;
};

type EmbeddedWallet = {
  address: string;
  walletClientType: 'privy';
  chainId: string;
  getEthereumProvider: () => Promise<Provider>;
  sendTransaction: (transaction: Transaction) => Promise<string>;
};

type GenericWallet = ExternalWallet | EmbeddedWallet;

/**
 * Sends a transaction using Privy's wallet interfaces
 * Works with both embedded and external wallets
 */
export async function sendTransaction(
  wallet: GenericWallet,
  transaction: Transaction,
  connection: Connection
): Promise<string> {
  try {
    // For embedded wallets (e.g., created via Google login)
    if ('sendTransaction' in wallet) {
      // Use the embedded wallet's sendTransaction method directly
      const txSignature = await wallet.sendTransaction(transaction);
      // Confirm transaction if needed
      await connection.confirmTransaction(txSignature);
      return txSignature;
    }
    // For external wallets (e.g., Phantom)
    else {
      // Get the provider from the external wallet
      const provider = await wallet.getEthereumProvider();

      // Serialize the transaction to send it to the wallet
      const serializedTransaction = transaction.serialize({
        requireAllSignatures: false,
      }).toString('base64');

      // Send using the external wallet's signAndSendTransaction method
      const result = await provider.request({
        method: 'signAndSendTransaction',
        params: {
          message: serializedTransaction,
        },
      });

      // Confirm transaction if needed
      if (result && result.signature) {
        await connection.confirmTransaction(result.signature);
      }

      return result.signature;
    }
  } catch (error) {
    console.error('Transaction failed:', error);
    toast.error('Transaction failed. Please try again.');
    throw error;
  }
}

/**
 * Fetches balance for a wallet address
 */
export async function fetchBalance(
  walletAddress: string,
  connection: Connection
): Promise<number> {
  try {
    const balance = await connection.getBalance(new PublicKey(walletAddress));
    return balance / 1_000_000_000; // Convert lamports to SOL
  } catch (error) {
    console.error('Error fetching balance:', error);
    return 0;
  }
}

/**
 * Helper to find wallet from wallets array by address
 */
export function findWalletByAddress(
  address: string,
  wallets: GenericWallet[]
): GenericWallet | undefined {
  return wallets.find(wallet => wallet.address.toLowerCase() === address.toLowerCase());
}

export function createSolanaConnection(
  network: 'devnet' | 'mainnet-beta' = 'devnet'
): Connection {
  const endpoint = network === 'devnet'
    ? 'https://api.devnet.solana.com'
    : 'https://api.mainnet-beta.solana.com';

  return new Connection(endpoint, 'confirmed');
} 