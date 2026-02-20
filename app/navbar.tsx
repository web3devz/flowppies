"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import Image from "next/image";
import {
  ConnectButton
} from '@rainbow-me/rainbowkit';
export default function Navbar() {
  const { address } = useAccount();

  return (
    <nav className="flex justify-between items-center px-6 md:px-12 lg:px-24 py-5 border-4 border-white bg-green-80 m-4">
      {/* Logo Image */}
      <div className="w-14 h-14 relative">
        <Image
          src="/log1.png"
          alt="Logo"
          fill
          className="object-contain"
        />
      </div>

      {/* Nav Links */}
      <ul className="hidden md:flex space-x-40 text-xl font-bold font-pixelify text-[#8B4513]">
        <li>
          <Link href="/" className="hover:text-yellow-300 transition-colors">Home</Link>
        </li>
        <li>
          <Link href="/showcase" className="hover:text-yellow-300 transition-colors">Showcase</Link>
        </li>
        <li>
          <Link href="/battle" className="hover:text-yellow-300 transition-colors">Battles</Link>
        </li>
      </ul>

      {/* Wallet */}
      <div className="ml-4 font-courier-prime">
        <ConnectButton/>
      </div>
    </nav>
  );
}
