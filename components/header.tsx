'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Wallet from '@/components/thirdweb/ConnectWallet';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: 'Platforms', href: '/platforms' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'MyMemes', href: '/my-memes' },
    { name: 'GameZone', href: '/gamezone' },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="border-[#FF0B7A] bg-[#0A0A0A] border-b-2 h-[60px] md:h-[70px] shadow-lg sticky top-0 z-50">
      <div className="flex justify-between items-center mx-auto px-3 xs:px-4 py-2 md:py-3 container h-full">
        <Link href="/" className="group">
          <h1 className="group-hover:text-[#FF0B7A] font-bold font-squid text-2xl xs:text-3xl md:text-4xl text-white transition-colors duration-300 ease-in-out">
            N
            <span className="group-hover:text-white font-squid text-[#FF0B7A] transition-colors duration-300 ease-in-out">
              Fun
            </span>
          </h1>
        </Link>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          <Wallet />
          <button
            onClick={toggleMenu}
            className="p-2 text-white hover:text-[#FF0B7A] transition-colors duration-200"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Desktop navigation */}
        <nav className="hidden md:flex space-x-3 lg:space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="group relative text-white hover:text-[#FF0B7A] transition-colors duration-200 ease-in-out"
            >
              <span className="relative z-10 font-ibm text-lg lg:text-2xl">
                {item.name}
              </span>
              <motion.div
                className="bottom-0 left-0 absolute bg-[#FF0B7A] w-0 hover:w-full h-0.5 transition-all duration-200 ease-in-out"
                whileHover={{ width: '100%' }}
              />
            </Link>
          ))}
        </nav>

        {/* Desktop wallet */}
        <div className="hidden md:block">
          <Wallet />
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-[60px] left-0 right-0 bg-[#0A0A0A] border-b-2 border-[#FF0B7A] shadow-lg md:hidden z-40"
        >
          <div className="p-4 flex flex-col space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-white hover:text-[#FF0B7A] transition-colors duration-200 font-ibm text-xl py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </header>
  );
}
