'use client';

import { useTranslations, useLocale } from '@/lib/translations';
import { useTheme } from '@/lib/theme';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { Car, LogOut, LayoutDashboard, AlertTriangle, Languages, Moon, Sun, Menu, X, Bell, CheckCircle, Clock, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Interface for Notification
interface Notification {
  _id: string;
  type: 'report_received' | 'report_acknowledged' | 'report_resolved';
  report: {
    _id: string;
    plate: string;
  };
  read: boolean;
  createdAt: string;
}

export default function Navbar() {
  const t = useTranslations('nav');
  const tNotifications = useTranslations('notifications');
  const { locale, setLocale } = useLocale();
  const { theme, toggleTheme, mounted } = useTheme();
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter(); // Added router
  
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false); // New state for dropdown
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]); // Store notifications

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (session) {
      try {
        const res = await fetch('/api/notifications');
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications || []);
          setUnreadNotifications(data.unreadCount || 0);
        }
      } catch (error) {
        console.error('Failed to fetch notifications', error);
      }
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [session]);

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if not already
    if (!notification.read) {
        try {
            await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notificationIds: [notification._id] }),
            });
            // Update local state
            setNotifications(prev => prev.map(n => n._id === notification._id ? { ...n, read: true } : n));
            setUnreadNotifications(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read', error);
        }
    }
    
    setShowNotifications(false);
    // Navigate to report details
    router.push(`/reports/${notification.report._id}`);
  };

  const markAllAsRead = async () => {
      try {
          await fetch('/api/notifications', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ markAllAsRead: true }),
          });
          setNotifications(prev => prev.map(n => ({ ...n, read: true })));
          setUnreadNotifications(0);
      } catch (error) {
          console.error('Failed to mark all as read', error);
      }
  };

  const getNotificationIcon = (type: string) => {
      switch (type) {
        case 'report_received': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
        case 'report_acknowledged': return <CheckCircle className="w-4 h-4 text-blue-500" />;
        case 'report_resolved': return <CheckCircle className="w-4 h-4 text-green-500" />;
        default: return <Bell className="w-4 h-4" />;
      }
  };

  const getNotificationText = (notification: Notification) => {
    switch (notification.type) {
        case 'report_received': return tNotifications('newReport' as any, { plate: notification.report.plate });
        case 'report_acknowledged': return tNotifications('reportAcknowledged' as any, { plate: notification.report.plate });
        case 'report_resolved': return tNotifications('reportResolved' as any, { plate: notification.report.plate });
        default: return tNotifications('default');
    }
  };

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
                  
                  {/* Notification Dropdown */}
                  <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`relative p-2.5 rounded-full transition-all ${
                        showNotifications
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                        }`}
                    >
                        <Bell className="w-5 h-5" />
                        {unreadNotifications > 0 && (
                        <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background" />
                        )}
                    </button>

                    {showNotifications && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
                            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-popover border border-border rounded-2xl shadow-xl overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200">
                                <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
                                    <h3 className="font-semibold">{tNotifications('title')}</h3>
                                    {unreadNotifications > 0 && (
                                        <button 
                                            onClick={markAllAsRead}
                                            className="text-xs text-primary hover:underline font-medium"
                                        >
                                            {tNotifications('markAllRead')}
                                        </button>
                                    )}
                                </div>
                                <div className="max-h-[60vh] overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="p-8 text-center text-muted-foreground">
                                            <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                            <p className="text-sm">{tNotifications('noNotifications')}</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-border">
                                            {notifications.map((notification) => (
                                                <button
                                                    key={notification._id}
                                                    onClick={() => handleNotificationClick(notification)}
                                                    className={`w-full text-left p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors ${
                                                        !notification.read ? 'bg-primary/5' : ''
                                                    }`}
                                                >
                                                    <div className={`mt-1 p-1.5 rounded-full flex-shrink-0 ${
                                                        !notification.read ? 'bg-background shadow-sm' : 'bg-secondary'
                                                    }`}>
                                                        {getNotificationIcon(notification.type)}
                                                    </div>
                                                    <div className="flex-1 min-w-0 space-y-1">
                                                        <p className={`text-sm ${!notification.read ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                                                            {getNotificationText(notification)}
                                                        </p>
                                                        <div className="flex items-center text-xs text-muted-foreground">
                                                            <Clock className="w-3 h-3 mr-1" />
                                                            {new Date(notification.createdAt).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                    {!notification.read && (
                                                        <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="p-2 border-t border-border bg-muted/30 text-center">
                                    <Link 
                                        href="/notifications" 
                                        className="text-xs text-muted-foreground hover:text-primary transition-colors inline-flex items-center"
                                        onClick={() => setShowNotifications(false)}
                                    >
                                        {tNotifications('viewAll')}
                                        <ChevronRight className="w-3 h-3 ml-0.5" />
                                    </Link>
                                </div>
                            </div>
                        </>
                    )}
                  </div>

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
                  <Languages className="w-5 h-5" />
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
              className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors relative"
            >
              {unreadNotifications > 0 && !mobileMenuOpen && (
                 <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
              )}
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
                <MobileLink href="/notifications" active={pathname === '/notifications'} onClick={() => setMobileMenuOpen(false)}>
                  <div className="flex justify-between items-center w-full">
                    <span>Notifications</span>
                    {unreadNotifications > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {unreadNotifications}
                      </span>
                    )}
                  </div>
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
                <Languages className="w-5 h-5" />
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
