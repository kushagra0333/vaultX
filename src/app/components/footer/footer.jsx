"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const pathname = usePathname();

  // Hide footer on these paths
  const noFooterPaths = ["/login", "/signup", "/forgot-password", "/reset-password"];
  if (noFooterPaths.includes(pathname)) return null;

  return (
    <footer className="bg-[#111] text-gray-300 border-t border-neutral-700">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Logo & About */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Image src="/logo.png" alt="VaultX Logo" width={32} height={32} />
            <span className="text-xl font-semibold text-white">VaultX</span>
          </div>
          <p className="text-sm text-gray-400">
            VaultX is your secure file conversion and data storage tool.
            Convert, manage, and protect files with ease.
          </p>
        </div>

        {/* Navigation */}
        <div>
          <h3 className="text-white font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="hover:text-white">Home</Link></li>
            <li><Link href="/about" className="hover:text-white">About</Link></li>
            <li><Link href="/converter" className="hover:text-white">Converter</Link></li>
            <li><Link href="/dashboard" className="hover:text-white">Dashboard</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-white font-semibold mb-3">Contact</h3>
          <ul className="space-y-2 text-sm">
            <li>Email: <a href="mailto:support@vaultx.io" className="hover:text-white">support@vaultx.io</a></li>
            <li>Phone: <span className="text-gray-400">+91 98765 43210</span></li>
            <li>Location: <span className="text-gray-400">Remote / India</span></li>
          </ul>
        </div>

        {/* Social (placeholder) */}
        <div>
          <h3 className="text-white font-semibold mb-3">Follow Us</h3>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white">🌐</a>
            <a href="#" className="hover:text-white">🐦</a>
            <a href="#" className="hover:text-white">📘</a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-[#0d0d0d] text-center py-4 text-sm text-gray-500 border-t border-neutral-800">
        © {new Date().getFullYear()} VaultX. All rights reserved.
      </div>
    </footer>
  );
}
