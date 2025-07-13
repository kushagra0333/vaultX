// app/profile/page.jsx
"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/header/header';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('vault_token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser(payload);
      setEmail(payload.email);
      setUsername(payload.username || '');
    } catch (err) {
      router.push('/login');
    }
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('vault_token')}`
        },
        body: JSON.stringify({ email, username })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      
      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
    
    try {
      const res = await fetch('/api/auth/delete', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('vault_token')}`
        }
      });
      
      if (!res.ok) throw new Error('Account deletion failed');
      
      localStorage.removeItem('vault_token');
      router.push('/');
    } catch (err) {
      setError(err.message);
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto bg-[#1e1e1e] p-8 rounded-xl border border-neutral-800 shadow-lg">
          <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>
          
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

          <form onSubmit={handleUpdate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-[#252525] border border-neutral-700 rounded-md"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 bg-[#252525] border border-neutral-700 rounded-md"
                minLength={3}
              />
            </div>
            
            <div className="flex justify-between pt-4">
              <button
                type="submit"
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-md"
              >
                Update Profile
              </button>
              
              <Link href="/change-password" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-md">
                Change Password
              </Link>
              
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-md"
              >
                Delete Account
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}