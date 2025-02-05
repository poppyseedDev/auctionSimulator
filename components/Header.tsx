"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <nav className="flex items-center mx-10 space-x-6 text-sm font-medium">
          <Link
            href="/"
            className={pathname === "/" ? "font-bold" : ""}
          >
            Dutch Auction
          </Link>
          <Link
            href="/dutch-sealed-bid"
            className={pathname === "/dutch-sealed-bid" ? "font-bold" : ""}
          >
            Dutch auctions with sealed bids
          </Link>
          <Link
            href="/sealed-bid"
            className={pathname === "/sealed-bid" ? "font-bold" : ""}
          >
            Sealed bid reverse auction
          </Link>
        </nav>
      </div>
    </header>
  );
} 