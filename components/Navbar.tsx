'use client';

import { useTranslations, useLocale } from '@/lib/translations';
import { useTheme } from '@/lib/theme';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { Car, LogOut, LayoutDashboard, AlertTriangle, Globe, Moon, Sun, Menu, X, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const t = useTranslations('nav');
  const { locale, setLocale } = useLocale();
  const { theme, toggleTheme, mounted } = useTheme();
  const { data: session } = useSession();
  const pathname = usePathname();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  const toggleLanguage = (newLocale: 'pt' | 'en') => {
    setLocale(newLocale);
    setShowLangMenu(false);
  };

  return (
    <>
      <nav 
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b ${
          scrolled 
            ? 'bg-background/80 backdrop-blur-md border-border py-4' 
            : 'bg-transparent border-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="bg-primary hover:bg-primary/90 transition-colors p-2.5 rounded-xl text-primary-foreground shadow-lg shadow-primary/20">
                <Car className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 group-hover:from-primary group-hover:to-primary/70 transition-all">
                Autoluzes
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {session ? (
                <>
                  <NavLink href="/dashboard" active={pathname === '/dashboard'} icon={<LayoutDashboard className="w-4 h-4" />}>
                    {t('dashboard')}
                  </NavLink>
                  <NavLink href="/report" active={pathname === '/report'} icon={<AlertTriangle className="w-4 h-4" />}>
                    {t('report')}
                  </NavLink>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t('logout')}</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-5 py-2.5 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                  >
                    {t('login')}
                  </Link>
                  <Link
                    href="/register"
                    className="px-6 py-2.5 rounded-full text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all hover:scale-105 active:scale-95"
                  >
                    {t('register')}
                  </Link>
                </>
              )}

              <div className="w-px h-6 bg-border mx-2" />

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                aria-label="Toggle theme"
              >
                {!mounted ? (
                  <div className="w-5 h-5" /> // Placeholder to avoid hydration mismatch
                ) : theme === 'dark' ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              {/* Language Switcher */}
              <div className="relative">
                <button
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className="p-2.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-all flex items-center space-x-1"
                >
                  <Globe className="w-5 h-5" />
                  <span className="sr-only">Change Language</span>
                </button>
                
                {showLangMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowLangMenu(false)}
                    />
                    <div className="absolute right-0 mt-3 w-40 bg-popover border border-border rounded-2xl shadow-xl overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200">
                      <div className="p-1">
                        <button
                          onClick={() => toggleLanguage('pt')}
                          className={`w-full px-4 py-2.5 text-left text-sm rounded-xl transition-all flex items-center space-x-2 ${
                            locale === 'pt'
                              ? 'bg-secondary text-foreground font-medium'
                              : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                          }`}
                        >
                          <span>🇵🇹</span>
                          <span>Português</span>
                        </button>
                        <button
                          onClick={() => toggleLanguage('en')}
                          className={`w-full px-4 py-2.5 text-left text-sm rounded-xl transition-all flex items-center space-x-2 ${
                            locale === 'en'
                              ? 'bg-secondary text-foreground font-medium'
                              : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                          }`}
                        >
                          <span>🇬🇧</span>
                          <span>English</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-background/95 backdrop-blur-sm md:hidden animate-in slide-in-from-top-10 duration-200 pt-24 px-6">
          <div className="flex flex-col space-y-4">
            {session ? (
              <>
                <MobileLink href="/dashboard" active={pathname === '/dashboard'} onClick={() => setMobileMenuOpen(false)}>
                  {t('dashboard')}
                </MobileLink>
                <MobileLink href="/report" active={pathname === '/report'} onClick={() => setMobileMenuOpen(false)}>
                  {t('report')}
                </MobileLink>
                <button
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-between w-full px-4 py-4 text-lg font-medium text-muted-foreground border-b border-border"
                >
                  <span>{t('logout')}</span>
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <MobileLink href="/login" onClick={() => setMobileMenuOpen(false)}>
                  {t('login')}
                </MobileLink>
                <MobileLink href="/register" onClick={() => setMobileMenuOpen(false)} isPrimary>
                  {t('register')}
                </MobileLink>
              </>
            )}
            
            <div className="pt-6 grid grid-cols-2 gap-4">
              <button
                onClick={toggleTheme}
                className="flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-secondary text-secondary-foreground"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
              <button
                onClick={() => {
                  toggleLanguage(locale === 'pt' ? 'en' : 'pt');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-secondary text-secondary-foreground"
              >
                <Globe className="w-5 h-5" />
                <span>{locale.toUpperCase()}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function NavLink({ href, children, active, icon }: { href: string; children: React.ReactNode; active?: boolean; icon?: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`flex items-center space-x-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
        active
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
      }`}
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}

function MobileLink({ href, children, active, onClick, isPrimary }: { href: string; children: React.ReactNode; active?: boolean; onClick?: () => void; isPrimary?: boolean }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center justify-between w-full px-4 py-4 text-lg font-medium border-b border-border transition-all ${
        isPrimary 
          ? 'text-primary font-bold' 
          : active 
            ? 'text-foreground' 
            : 'text-muted-foreground'
      }`}
    >
      {children}
      {isPrimary && <span className="w-2 h-2 rounded-full bg-primary" />}
    </Link>
  );
}
