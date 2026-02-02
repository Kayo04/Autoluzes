'use client';

import { useState } from 'react';
import { useTranslations } from '@/lib/translations';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import { LogIn, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-primary-foreground mb-4 shadow-lg shadow-primary/20">
              <LogIn className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              {t('loginTitle')}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Welcome back to Autoluzes
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

              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5 ml-1">
                    {t('email')}
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-xl border-border bg-secondary/50 px-4 py-3 text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-all hover:bg-secondary"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5 ml-1">
                    {t('password')}
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-xl border-border bg-secondary/50 px-4 py-3 text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-all hover:bg-secondary"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-full shadow-sm text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? 'Signing in...' : t('loginButton')}
                {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
              </button>
            </form>

            <div className="mt-8 text-center text-sm">
              <span className="text-muted-foreground">{t('noAccount')} </span>
              <Link href="/register" className="font-medium text-primary hover:text-primary/80 transition-colors">
                {t('registerLink')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
