import { Transaction, Connection, clusterApiUrl } from '@solana/web3.js';
import { useSolanaWallets } from '@privy-io/react-auth';

async function useTransaction() {
  const { ready, wallets } = useSolanaWallets();
  const wallet = wallets[0];
  const {} = useSignMessage();
  if (!ready || !wallet) return;

  const connection = new Connection(clusterApiUrl('devnet'));
  const transaction = new Transaction();

  const txn = await wallet.sendTransaction!(transaction, connection);

  console.log(txn);

  return {
    transaction,
    connection,
  };
}

async function useSignMessage() {}

export { useTransaction };
