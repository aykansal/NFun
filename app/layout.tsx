import '@/styles/globals.css';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import Header from '@/components/header';
import Footer from '@/components/Footer';
import Background from '@/components/background';
import { Toaster } from '@/components/ui/sonner';
import dynamic from 'next/dynamic';

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

export const metadata: Metadata = {
  title: 'NFun - Turn NFTs into Viral Memes Instantly',
  description:
    'Create and mint viral NFT memes in seconds with NFun! Customize styles, add captions, and share your Squid Game-inspired creations.',
  keywords: [
    'NFT memes',
    'meme generator',
    'NFun',
    'viral memes',
    'Squid Game memes',
    'NFT creator',
    'meme minting',
    'X memes',
  ],
  openGraph: {
    title: 'NFun - Instant Viral NFT Memes',
    description:
      'Transform NFTs into memes with captions and Squid Game-inspired styles. Mint or share in seconds with NFun. Follow @NFToodleHQ on X!',
    url: 'https://NFun.ayverse.me',
    siteName: 'NFun',
    images: [
      {
        url: 'https://pbs.twimg.com/profile_images/1903891969476059136/ovNOfG-d_400x400.jpg',
        width: 400,
        height: 400,
        alt: 'NFun Viral NFT Meme Creator',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NFun - Create Viral NFT Memes',
    description:
      'Turn NFTs into memes in seconds with NFun! Customize, mint, or share with our Squid Game-themed generator. Follow @NFToodleHQ on X!',
    images: [
      'https://pbs.twimg.com/profile_images/1903891969476059136/ovNOfG-d_400x400.jpg',
    ],
    site: '@NFToodleHQ',
  },
  alternates: {
    canonical: 'https://NFun.ayverse.me',
  },
  robots: {
    index: true,
    follow: true,
  },
};

const AuthProviderNoSSR = dynamic(
  () => import('@/contexts/AuthContext'),
  {
    ssr: false,
  }
);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${ibm.variable} ${squid.variable}`}>
      <body className="flex flex-col bg-[#0A0A0A] text-white">
          <AuthProviderNoSSR>
            <div className="min-h-screen h-full w-full relative">
              <Background />
              <div className="relative z-10 flex flex-col min-h-screen 2xl:mb-10">
                <Header />
                <main className="min-h-[calc(100vh-70px-10vh)] flex flex-col">
                  {children}
                </main>
                <Footer />
              </div>
              <Toaster />
            </div>
          </AuthProviderNoSSR>
      </body>
    </html>
  );
}
