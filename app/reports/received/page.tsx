'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from '@/lib/translations';
import Navbar from '@/components/Navbar';
import { AlertTriangle, Calendar, Eye, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Report {
  _id: string;
  plate: string;
  selectedLights: string[];
  createdAt: string;
  reporterName?: string;
  reportedBy?: {
    name: string;
    email: string;
  };
  imageId?: string;
}

export default function ReceivedReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations('lights');
  const tCommon = useTranslations('common');

  const [reports, setReports] = useState<Report[]>([]);
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
        setReports(data.reportsReceived || []);
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
      hour: '2-digit',
      minute: '2-digit',
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

      <div className="pt-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500/10 rounded-xl">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground">
                Received Reports
              </h1>
              <p className="mt-1 text-muted-foreground">
                All reports about your vehicles
              </p>
            </div>
          </div>
        </div>

        {/* Reports List */}
        {reports.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center">
            <AlertTriangle className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No reports received</h3>
            <p className="text-muted-foreground">
              You haven't received any reports about your vehicles yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {reports.map((report) => (
              <div
                key={report._id}
                className="bg-card border-2 border-red-500/20 rounded-2xl p-6 hover:border-red-500/40 transition-all cursor-pointer"
                onClick={() => router.push(`/reports/${report._id}`)}
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Left Column: Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="text-3xl font-bold font-mono tracking-wider text-foreground mb-2">
                          {report.plate}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>Reported by</span>
                          <span className="font-semibold text-foreground">
                            {report.reporterName || report.reportedBy?.name || 'Anonymous'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary px-3 py-1.5 rounded-lg">
                        <Calendar className="w-4 h-4" />
                        {formatDate(report.createdAt)}
                      </div>
                    </div>

                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                      <div className="text-sm font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide mb-3">
                        Reported Lights
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {report.selectedLights.map((light) => (
                          <div
                            key={light}
                            className="flex items-center gap-2 px-3 py-2 bg-background rounded-lg"
                          >
                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                            <span className="text-sm font-medium text-foreground">
                              {t(light as any)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Image (if exists) */}
                  {report.imageId && (
                    <div className="w-full md:w-1/3 flex-shrink-0">
                      <div className="rounded-xl overflow-hidden border-2 border-border h-full max-h-64 bg-black/50 flex items-center justify-center">
                        <img
                          src={`/api/images/${report.imageId}`}
                          alt="Report evidence"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
