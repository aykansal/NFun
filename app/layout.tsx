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
      <body className="flex flex-col bg-[#0A0A0A] text-white">
        <Providers>
          <AuthProvider>
            <div className="min-h-screen h-full w-full relative">
              <Background />
              <div className="relative z-10 flex flex-col min-h-screen">
                <Header />
                <main className="min-h-[calc(100vh-70px-10vh)] flex flex-col ">
                  {children}
                </main>
                <Footer />
              </div>
              <Toaster />
            </div>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
