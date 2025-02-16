'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import type React from 'react'; // Added import for React

export default function Header() {
  const _pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <nav className="flex items-center mx-10 space-x-6 text-sm font-medium">
          <div className="flex items-center gap-4">
            <span className="font-semibold">Token Auction</span>
            <span className="text-sm text-muted-foreground">Welcome, {user.name}</span>
          </div>
        </nav>
        <div className="flex items-center mx-10 space-x-6 text-sm font-medium">
          <Button
            variant="ghost"
            onClick={() => {
              logout();
              router.push('/');
            }}
          >
            Logout
          </Button>
          <Link href="/settings" className="flex items-center space-x-2 mr-6">
            <Settings className="h-5 w-5" />
            <span className="text-sm font-medium">Settings</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
