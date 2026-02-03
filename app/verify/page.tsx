'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useTranslations } from '@/lib/translations';
import { ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailParam, code: otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Verification failed');
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login?verified=true');
        }, 2000);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md bg-card border border-border rounded-3xl p-8 shadow-xl text-center animate-in fade-in zoom-in duration-300">
        <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Email Verified!</h2>
        <p className="text-muted-foreground mb-6">
          Your account has been successfully verified. Redirecting you to login...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="text-center">
        <div className="mx-auto w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-primary-foreground mb-4 shadow-lg shadow-primary/20">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Verify Email
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter the code sent to <span className="font-semibold text-foreground">{emailParam}</span>
        </p>
      </div>

      <div className="bg-card border border-border rounded-3xl p-8 shadow-xl shadow-black/5 dark:shadow-none">
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl p-4 flex items-center">
              <span className="mr-2">⚠️</span>
              {error}
            </div>
          )}

          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-foreground mb-1.5 ml-1">
              Verification Code
            </label>
            <input
              id="otp"
              name="otp"
              type="text"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
              className="block w-full text-center text-3xl tracking-[1em] font-mono rounded-xl border-border bg-secondary/50 px-4 py-4 text-foreground shadow-sm focus:border-primary focus:ring-primary transition-all hover:bg-secondary placeholder:tracking-normal placeholder:text-base placeholder:font-sans"
              placeholder="000000"
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-full shadow-sm text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? 'Verifying...' : 'Verify Code'}
            {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
          </button>
        </form>

        <div className="mt-8 text-center text-sm">
          <Link href="/register" className="font-medium text-muted-foreground hover:text-foreground transition-colors">
            Wrong email? <span className="underline">Register again</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <Suspense fallback={<div>Loading...</div>}>
          <VerifyContent />
        </Suspense>
      </div>
    </div>
  );
}
