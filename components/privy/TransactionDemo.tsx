'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { WalletLoadingState } from '@/components/ui/WalletLoadingState';
import usePrivyWallet from '@/hooks/usePrivyWallet';
import { Transaction, SystemProgram } from '@solana/web3.js';
import { sendTransaction } from '@/lib/privy-transactions';
import { toast } from 'sonner';

export default function TransactionDemo() {
  const { wallet, publicKey, balance, connection, address, isConnected, isLoading } = usePrivyWallet();
  const [isTransacting, setIsTransacting] = useState(false);
  const [txSignature, setTxSignature] = useState<string | null>(null);

  const handleTestTransaction = async () => {
    if (!wallet || !publicKey || !connection) {
      toast.error('Wallet not connected');
      return;
    }
    
    try {
      setIsTransacting(true);
      setTxSignature(null);
      
      // Create a simple SOL transfer transaction
      // In a real app, this would be your NFT minting logic
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: publicKey, // sending to self for demo
          lamports: 100, // tiny amount (0.0000001 SOL)
        })
      );
      
      // Get a recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;
      
      // Send the transaction using our Privy adapter
      const signature = await sendTransaction(wallet, transaction, connection);
      
      setTxSignature(signature);
      toast.success('Transaction successful!');
    } catch (error) {
      console.error('Transaction failed:', error);
      toast.error('Transaction failed. Please try again.');
    } finally {
      setIsTransacting(false);
    }
  };
  
  if (isLoading) {
    return <div className="p-4">Loading wallet info...</div>;
  }
  
  return (
    <div className="p-4 border border-[#FF0B7A] rounded-lg bg-black/30 backdrop-blur-sm">
      <h2 className="text-xl font-bold mb-4">Privy Wallet Transactions</h2>
      
      {isConnected ? (
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-400">Wallet Address</p>
            <p className="font-mono text-sm">{address}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-400">Balance</p>
            <p className="font-mono">{balance !== null ? `${balance.toFixed(4)} SOL` : 'Loading...'}</p>
          </div>
          
          <div className="pt-4">
            <Button onClick={handleTestTransaction} disabled={isTransacting}>
              {isTransacting ? 'Processing...' : 'Test Transaction'}
            </Button>
          </div>
          
          {txSignature && (
            <div className="mt-4">
              <p className="text-sm text-gray-400">Transaction Signature</p>
              <p className="font-mono text-xs break-all">{txSignature}</p>
              <a 
                href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#FF0B7A] text-sm underline mt-1 block"
              >
                View on Solana Explorer
              </a>
            </div>
          )}
        </div>
      ) : (
        <p>Wallet not connected. Please connect your wallet first.</p>
      )}
      
      {isTransacting && (
        <WalletLoadingState 
          message="Processing Transaction" 
          subMessage="Please confirm the transaction in your wallet..."
          progress={50} 
        />
      )}
    </div>
  );
} 