"use client";
import Link from "next/link";

const VaultLoginBar = () => {
  return (
    <div className="bg-white text-black shadow-md px-4 py-2 flex justify-between items-center rounded-none w-full">
      <p className="text-sm sm:text-base font-medium">
        Login to access your vault and safely sort data
      </p>
      <Link
        href="/login"
        className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-md transition-colors"
      >
        Login
      </Link>
    </div>
  );
};

export default VaultLoginBar;
