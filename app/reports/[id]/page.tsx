'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from '@/lib/translations';
import Navbar from '@/components/Navbar';
import { AlertTriangle, Calendar, User, Car, ArrowLeft, Loader2, Image as ImageIcon, CheckCircle, MessageSquare } from 'lucide-react';
import Link from 'next/link';

interface Report {
  _id: string;
  plate: string;
  selectedLights: string[];
  createdAt: string;
  reportedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  imageId?: string;
  detectionMethod?: string;
  status: 'pending' | 'acknowledged' | 'resolved';
  ownerResponse?: string;
  vehicle?: {
    owner: string; // ID of the owner
  };
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
  const [acnkowledgeLoading, setAcknowledgeLoading] = useState(false);

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

  const handleStatusUpdate = async (newStatus: 'acknowledged' | 'resolved', message?: string) => {
    setAcknowledgeLoading(true);
    try {
      const res = await fetch(`/api/reports/${params.id}/acknowledge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus, message }),
      });

      if (res.ok) {
        // Refresh report data
        fetchReport();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('An error occurred');
    } finally {
      setAcknowledgeLoading(false);
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

  const isOwner = session?.user && report?.vehicle?.owner === (session.user as any).id;
  // const isReporter = session?.user && report?.reportedBy?._id === (session.user as any).id; // Unused for now

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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
             
             {/* Status Badge */}
             <div className={`px-4 py-2 rounded-full font-medium flex items-center gap-2 self-start md:self-center ${
               report?.status === 'resolved' 
                 ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                 : report?.status === 'acknowledged'
                 ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                 : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
             }`}>
               {report?.status === 'resolved' && <CheckCircle className="w-4 h-4" />}
               {report?.status === 'acknowledged' && <CheckCircle className="w-4 h-4" />}
               {report?.status === 'pending' && <AlertTriangle className="w-4 h-4" />}
               <span className="capitalize">{report?.status || 'Pending'}</span>
             </div>
          </div>
        </div>

        {/* Action Section for Owner */}
        {isOwner && report?.status !== 'resolved' && (
           <div className="bg-card border border-border rounded-2xl p-6 mb-6 shadow-sm ring-1 ring-primary/20">
             <h2 className="text-xl font-bold text-foreground mb-4">Action Required</h2>
             <p className="text-muted-foreground mb-6">
                Please acknowledge this report to let the reporter know you've seen it.
             </p>
             <div className="flex flex-wrap gap-4">
               {report?.status === 'pending' && (
                 <button
                   onClick={() => handleStatusUpdate('acknowledged', 'Thanks, I will fix it!')}
                   disabled={acnkowledgeLoading}
                   className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                 >
                   {acnkowledgeLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                   Mark as Seen
                 </button>
               )}
               <button
                 onClick={() => handleStatusUpdate('resolved', 'Issue resolved, thanks!')}
                 disabled={acnkowledgeLoading}
                 className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors"
               >
                 {acnkowledgeLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                 Mark as Resolved
               </button>
             </div>
           </div>
        )}

        {/* Status Thread / Owner Response */}
        {(report?.status !== 'pending' || report?.ownerResponse) && (
             <div className="bg-secondary/30 border border-border rounded-2xl p-6 mb-6">
               <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                 <MessageSquare className="w-5 h-5" />
                 Report Status
               </h2>
               <div className="flex items-start gap-4">
                 <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    O
                 </div>
                 <div>
                   <div className="font-semibold">{report?.status === 'resolved' ? 'Issue Resolved' : 'Acknowledged'}</div>
                   <div className="text-sm text-muted-foreground mb-2">
                      by <span className="font-medium text-foreground">{isOwner ? 'You' : 'Vehicle Owner'}</span>
                   </div>
                   {report?.ownerResponse && (
                     <div className="bg-card p-3 rounded-lg border border-border text-foreground inline-block">
                       "{report.ownerResponse}"
                     </div>
                   )}
                 </div>
               </div>
             </div>
        )}

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
