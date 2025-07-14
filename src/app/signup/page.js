"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/header/header";
import Link from "next/link";

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !username || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");
      localStorage.setItem("vault_token", data.token);
      router.push("/vault");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-[#1e1e1e] p-8 rounded-xl border border-neutral-800 shadow-lg">
          <h1 className="text-2xl font-bold mb-6 text-center">Create VaultX Account</h1>
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 text-red-400 rounded-md text-sm">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium mb-1">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 bg-[#252525] border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                  minLength={3}
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-[#252525] border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-[#252525] border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-[#252525] border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                  minLength={6}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                  isLoading
                    ? "bg-neutral-700 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500"
                }`}
              >
                {isLoading ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <p className="text-sm text-neutral-400">
                We&apos;ve sent a 6-digit OTP to {email}. Please check your inbox.
              </p>
              <div>
                <label htmlFor="otp" className="block text-sm font-medium mb-1">
                  Enter OTP
                </label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-2 bg-[#252525] border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                  maxLength={6}
                  pattern="\d{6}"
                  inputMode="numeric"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                  isLoading
                    ? "bg-neutral-700 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500"
                }`}
              >
                {isLoading ? "Verifying..." : "Verify & Sign up"}
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full py-2 px-4 text-neutral-400 hover:text-white text-sm"
              >
                Back to previous step
              </button>
            </form>
          )}

          <div className="mt-4 text-center text-sm text-neutral-400">
            Already have an account?{" "}
            <Link href="/login" className="text-purple-400 hover:underline">
              Login
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}