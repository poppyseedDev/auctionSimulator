'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <nav className="flex items-center mx-10 space-x-6 text-sm font-medium">
          <Link href="/" className={pathname === '/' ? 'font-bold' : ''}>
            Home
          </Link>
        </nav>
        <Link href="/settings" className="flex items-center space-x-2 mr-6">
          <Settings className="h-5 w-5" />
          <span className="text-sm font-medium">Settings</span>
        </Link>
      </div>
    </header>
  );
}
