import '@/styles/globals.css';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import Header from '@/components/header';
import Footer from '@/components/Footer';
import Background from '@/components/background';
import { Toaster } from '@/components/ui/sonner';
import { layoutMetadata } from '@/lib/constant';
import Providers from '@/context/Providers';
import AuthProvider from '@/context/AuthContext';
import MintingOverlayWrapper from '@/components/thirdweb/MintingOverlayWrapper';
import MainContainer from '@/components/layout/MainContainer';

const squid = localFont({
  src: '../public/fonts/squid.woff',
  variable: '--font-squid',
  preload: true,
  display: 'swap',
  weight: '100 900',
});

const ibm = localFont({
  src: '../public/fonts/IBMPlexMono-Medium.ttf',
  variable: '--font-ibm',
  preload: true,
  display: 'swap',
  weight: '100 900',
});

export const metadata: Metadata = layoutMetadata;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${ibm.variable} ${squid.variable}`}>
      <body className="bg-black">
        <Providers>
          <AuthProvider>
            <div className="min-w-screen min-h-screen h-full w-full relative">
              <Background />
              <div className="relative z-10 flex flex-col h-full w-full">
                <Header />
                <MainContainer>{children}</MainContainer>
                <Footer />
              </div>
              <MintingOverlayWrapper />
              <Toaster position='bottom-center' />
            </div>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
