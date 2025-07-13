// app/change-password/page.jsx
"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/header/header';

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('vault_token')}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Password change failed');

      setSuccess('Password changed successfully');
      setTimeout(() => router.push('/profile'), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-[#1e1e1e] p-8 rounded-xl border border-neutral-800 shadow-lg">
          <h1 className="text-2xl font-bold mb-6">Change Password</h1>
          
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 text-red-400 rounded-md text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-500/10 text-green-400 rounded-md text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 bg-[#252525] border border-neutral-700 rounded-md"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 bg-[#252525] border border-neutral-700 rounded-md"
                required
                minLength={6}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 bg-[#252525] border border-neutral-700 rounded-md"
                required
                minLength={6}
              />
            </div>
            
            <button
              type="submit"
              className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 rounded-md"
            >
              Change Password
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}