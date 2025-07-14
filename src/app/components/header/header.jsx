"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export default function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const pathname = usePathname();

  // Define paths where header should be hidden
  const noHeaderPaths = ['/login', '/signup', '/forgot-password', '/reset-password'];

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem('vault_token') : null;
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser(payload);
      } catch {
        setUser(null);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('vault_token');
    window.location.href = '/login';
  };

  // Don’t render the header on excluded paths
  if (noHeaderPaths.includes(pathname)) return null;

  return (
    <header className="sticky top-0 z-50 bg-[#121212] border-b border-neutral-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo + Title */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="VaultX Logo"
            width={32}
            height={32}
            className="object-contain"
          />
          <h1 className="text-xl font-semibold text-white tracking-wide">VaultX</h1>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className={`text-neutral-300 hover:text-white transition ${
              pathname === "/" ? "text-white font-medium" : ""
            }`}
          >
            Home
          </Link>
          <Link
            href="/about"
            className={`text-neutral-300 hover:text-white transition ${
              pathname === "/about" ? "text-white font-medium" : ""
            }`}
          >
            About
          </Link>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 text-white hover:text-gray-300 transition focus:outline-none"
              >
                <span>{user.username || user.email}</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#1e1e1e] rounded-md shadow-lg border border-neutral-700 z-50">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-white hover:bg-[#252525] transition"
                  >
                    My Profile
                  </Link>
                  <Link
                    href="/change-password"
                    className="block px-4 py-2 text-sm text-white hover:bg-[#252525] transition"
                  >
                    Change Password
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="text-neutral-300 hover:text-white transition"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-4 py-1.5 rounded-md border border-white text-white hover:bg-white hover:text-black transition"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
