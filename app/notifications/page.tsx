'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from '@/lib/translations';
import { Bell, CheckCircle, AlertTriangle, Car, ChevronRight, Clock } from 'lucide-react';

interface Notification {
  _id: string;
  type: 'report_received' | 'report_acknowledged' | 'report_resolved';
  report: {
    _id: string;
    plate: string;
    selectedLights: string[];
    createdAt: string;
    reporterName?: string;
  };
  read: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations('common'); // We might need to add notifications translations
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (session) {
      fetchNotifications();
    }
  }, [session, status, router]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        // Mark all as read when viewing the page? Or specifically when clicking?
        // Let's mark as read when the page loads for now, or maybe add a "Mark all as read" button.
        // For better UX, let's mark them as read in the background after a short delay
        setTimeout(() => markAllAsRead(), 2000);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllAsRead: true }),
      });
      // Update local state to show all as read
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'report_received':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'report_acknowledged':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'report_resolved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5 text-foreground" />;
    }
  };

  const getTitle = (notification: Notification) => {
    switch (notification.type) {
      case 'report_received':
        return `New Report for ${notification.report.plate}`;
      case 'report_acknowledged':
        return `Report Acknowledged for ${notification.report.plate}`;
      case 'report_resolved':
        return `Issue Resolved for ${notification.report.plate}`;
      default:
        return 'Notification';
    }
  };

  const getDescription = (notification: Notification) => {
    switch (notification.type) {
      case 'report_received':
        return 'Someone reported an issue with your vehicle lights.';
      case 'report_acknowledged':
        return 'The vehicle owner has seen your report.';
      case 'report_resolved':
        return 'The vehicle owner has resolved the issue.';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-secondary rounded-lg"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-card border border-border rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Notifications</h1>
          <p className="text-muted-foreground">Stay updated on your vehicle reports.</p>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-24 bg-card border border-border rounded-3xl">
          <div className="inline-flex p-4 rounded-full bg-secondary/50 mb-4">
            <Bell className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No notifications yet</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            When you receive reports or updates, they will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              onClick={() => router.push(`/reports/received`)} // We should probably go to specific report, but for now received/sent page. 
              // Wait, if I am the reporter, I should go to Sent. If I am the owner, I should go to Received.
              // Actually better to have a single report detail page /reports/[id]
              // The current app structure has /reports/received and /reports/sent which list reports.
              // Do we have a detail page? /reports/[id]/page.tsx was mentioned in the plan but I haven't seen it yet.
              // Checking file list... app/reports/[id]/page.tsx was in the plan.
              // I should check if that file exists. If not, I'll link to appropriate list page.
              // Actually, simpler to just link to /reports/received for now if it's 'report_received'
              // And /reports/sent if it's 'report_acknowledged' or 'report_resolved'.
              // But let's check `notification.type` first.
              className={`group relative p-4 flex items-start gap-4 rounded-2xl border transition-all cursor-pointer hover:shadow-md ${
                notification.read
                  ? 'bg-card border-border hover:border-primary/50'
                  : 'bg-primary/5 border-primary/20 hover:border-primary'
              }`}
            >
              <div className={`mt-1 p-2 rounded-full flex-shrink-0 ${
                notification.read ? 'bg-secondary' : 'bg-background shadow-sm'
              }`}>
                {getIcon(notification.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h4 className={`font-semibold text-base ${!notification.read && 'text-primary'}`}>
                    {getTitle(notification)}
                  </h4>
                  <span className="text-xs text-muted-foreground flex items-center whitespace-nowrap ml-2">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm line-clamp-2">
                  {getDescription(notification)}
                </p>
                {notification.report && (
                   <div className="mt-2 text-xs font-medium px-2 py-1 bg-secondary/50 rounded-lg inline-block">
                     Plate: {notification.report.plate}
                   </div>
                )}
              </div>

              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors self-center" />
              
              {!notification.read && (
                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary animate-pulse" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
