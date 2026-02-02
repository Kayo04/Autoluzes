'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from '@/lib/translations';
import Navbar from '@/components/Navbar';
import { AlertTriangle, Calendar, User, Car, ArrowLeft, Loader2, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

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
  detectionMethod?: string;
}

export default function ReportDetailsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const t = useTranslations('lights');
  const tCommon = useTranslations('common');

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && params.id) {
      fetchReport();
    }
  }, [status, router, params.id]);

  const fetchReport = async () => {
    try {
      const response = await fetch(`/api/reports/${params.id}`);
      const data = await response.json();

      if (response.ok) {
        setReport(data.report);
        
        // Fetch image if available
        if (data.report.imageId) {
          setImageUrl(`/api/images/${data.report.imageId}`);
        }
      } else {
        console.error('Report not found');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      router.push('/dashboard');
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

  if (!report) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-foreground">Report not found</h1>
          <Link href="/dashboard" className="text-primary hover:underline mt-4 inline-block">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />

      <div className="pt-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <div className="p-3 bg-primary/10 rounded-xl">
              <AlertTriangle className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground">
                Report Details
              </h1>
              <p className="mt-1 text-muted-foreground">
                Complete information about this report
              </p>
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div className="space-y-6">
          {/* Vehicle Information */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Car className="w-5 h-5" />
              Vehicle Information
            </h2>
            <div className="bg-secondary/30 rounded-xl p-4 inline-block">
              <div className="text-sm text-muted-foreground mb-1">License Plate</div>
              <div className="text-3xl font-bold font-mono tracking-wider text-foreground">
                {report.plate}
              </div>
            </div>
          </div>

          {/* Reporter Information */}
          {report.reportedBy && (
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Reported By
              </h2>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-muted-foreground">Name: </span>
                  <span className="font-semibold text-foreground">{report.reportedBy.name}</span>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Email: </span>
                  <span className="font-semibold text-foreground">{report.reportedBy.email}</span>
                </div>
              </div>
            </div>
          )}

          {/* Report Date */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Report Date
            </h2>
            <div className="text-lg font-semibold text-foreground">
              {formatDate(report.createdAt)}
            </div>
          </div>

          {/* Faulty Lights */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Faulty Lights Reported
            </h2>
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {report.selectedLights.map((light) => (
                  <div
                    key={light}
                    className="flex items-center gap-3 px-4 py-3 bg-background rounded-lg"
                  >
                    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                    <span className="font-medium text-foreground">
                      {t(light as any)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Photo Evidence */}
          {imageUrl && (
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Photo Evidence
              </h2>
              <div className="rounded-xl overflow-hidden border-2 border-border">
                <img
                  src={imageUrl}
                  alt="Report evidence"
                  className="w-full h-auto object-contain max-h-96"
                />
              </div>
            </div>
          )}

          {/* Detection Method */}
          {report.detectionMethod && (
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Detection Method</h2>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg">
                <span className="text-sm font-semibold text-foreground uppercase">
                  {report.detectionMethod === 'ai' ? '🤖 AI Detection' : '👤 Manual Selection'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
