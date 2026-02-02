'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from '@/lib/translations';
import Navbar from '@/components/Navbar';
import { AlertTriangle, Send, Calendar, Eye, Loader2 } from 'lucide-react';

interface Report {
  _id: string;
  plate: string;
  selectedLights: string[];
  createdAt: string;
  reportedBy?: {
    name: string;
    email: string;
  };
  imageId?: string;
}

export default function MyReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations('lights');
  const tCommon = useTranslations('common');

  const [receivedReports, setReceivedReports] = useState<Report[]>([]);
  const [sentReports, setSentReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetchReports();
    }
  }, [status, router]);

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/reports');
      const data = await response.json();

      if (response.ok) {
        setReceivedReports(data.received || []);
        setSentReports(data.sent || []);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />

      <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            My Reports
          </h1>
          <p className="mt-2 text-muted-foreground">
            View all reports you've received and sent
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Received Reports */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-red-500/10 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  Received Reports
                </h2>
                <p className="text-sm text-muted-foreground">
                  Reports about your vehicles
                </p>
              </div>
            </div>

            {receivedReports.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-8 text-center">
                <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground">No reports received yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {receivedReports.map((report) => (
                  <div
                    key={report._id}
                    className="bg-card border-2 border-red-500/20 rounded-2xl p-6 hover:border-red-500/40 transition-all cursor-pointer"
                    onClick={() => router.push(`/reports/${report._id}`)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="text-2xl font-bold font-mono tracking-wider text-foreground">
                          {report.plate}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          via {report.reportedBy?.name || 'Anonymous'}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {formatDate(report.createdAt)}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide">
                        Reported Lights
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {report.selectedLights.map((light) => (
                          <span
                            key={light}
                            className="px-3 py-1 bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium"
                          >
                            {t(light as any)}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl transition-all font-medium">
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sent Reports */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-green-500/10 rounded-xl">
                <Send className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  Sent Reports
                </h2>
                <p className="text-sm text-muted-foreground">
                  Reports you've created
                </p>
              </div>
            </div>

            {sentReports.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-8 text-center">
                <Send className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground">No reports sent yet</p>
                <button
                  onClick={() => router.push('/report')}
                  className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all"
                >
                  Create Report
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {sentReports.map((report) => (
                  <div
                    key={report._id}
                    className="bg-card border-2 border-green-500/20 rounded-2xl p-6 hover:border-green-500/40 transition-all cursor-pointer"
                    onClick={() => router.push(`/reports/${report._id}`)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-2xl font-bold font-mono tracking-wider text-foreground">
                        {report.plate}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {formatDate(report.createdAt)}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">
                        Reported Lights
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {report.selectedLights.map((light) => (
                          <span
                            key={light}
                            className="px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-lg text-sm font-medium"
                          >
                            {t(light as any)}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 rounded-xl transition-all font-medium">
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
