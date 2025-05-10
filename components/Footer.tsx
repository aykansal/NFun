import { Circle, Square, Triangle } from 'lucide-react';
import Link from 'next/link';

export const AuthorDetails = ({ className }: { className?: string }) => {
  return (
    <div className={`text-gray-400 text-sm ${className}`}>
      <span className="font-ibm">{'Made with 💖 by '}</span>
      <Link
        href="https://x.com/aykansal"
        className="text-[#FF0B7A] hover:underline font-squid"
      >
        Aykansal
      </Link>
    </div>
  );
};

export default function Footer() {
  return (
    <footer className="h-[10vh] mt-auto text-center w-full flex flex-col gap-y-3 p-3 py-4">
      <div>
        <p className="mb-4 text-green-400 text-lg">
          Join the game, share the laughter!
        </p>
        <div className="flex justify-center items-center space-x-8">
          <Triangle className="w-6 h-6 text-[#FF0B7A] animate-bounce" />
          <Circle className="w-6 h-6 text-purple-500 animate-pulse" />
          <Square className="w-6 h-6 text-green-500 animate-spin" />
        </div>
      </div>
      <AuthorDetails className='z-20' />
    </footer>
  );
}