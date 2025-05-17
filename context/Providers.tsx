'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId="cmamswybn07r8ju0mjg8sfbd7"
      clientId="client-WY6LJCXadPTusteqMUGCKk1LbKL1MWVFixz4ubiSCTB78"
      config={{
        loginMethods: ['wallet', 'google'],
        appearance: {
          theme: 'light',
          accentColor: '#FF0B7A',
          showWalletLoginFirst: true,
          walletChainType: 'solana-only',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          solana: {
            createOnLogin: 'users-without-wallets',
          },
        },
        solanaClusters: [
          // {
          //   name: 'mainnet-beta',
          //   rpcUrl: 'https://api.mainnet-beta.solana.com',
          // },
          {
            name: 'devnet',
            rpcUrl: 'https://api.devnet.solana.com',
          },
        ],
        externalWallets: {
          solana: {
            connectors: toSolanaWalletConnectors(),
          },
        },
      }}
    >
      <QueryClientProvider client={new QueryClient()}>
        {children}
      </QueryClientProvider>
    </PrivyProvider>
  );
}
