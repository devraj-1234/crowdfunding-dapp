"use client";

import Link from "next/link";
import WalletConnect from "./WalletConnect";
import { Sparkles } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between p-4 bg-white/95 backdrop-blur-sm shadow-lg rounded-b-3xl">
      <div className="flex items-center space-x-2">
        <Sparkles className="text-yellow-500 animate-pulse" size={24} />
        <Link
          href="/"
          className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
        >
          HeartFund
        </Link>
      </div>
      <div className="relative z-50">
        <WalletConnect />
      </div>
    </nav>
  );
}
