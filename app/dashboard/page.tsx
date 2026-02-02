'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from '@/lib/translations';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import UrgencyBanner from '@/components/UrgencyBanner';
import PlateInput from '@/components/PlateInput';
import { Car, Plus, Trash2, AlertTriangle, Send, Calendar, Clock } from 'lucide-react';

interface Vehicle {
  _id: string;
  plate: string;
  make?: string;
  model?: string;
  country: string;
}

interface Report {
  _id: string;
  reporterName: string;
  plate: string;
  selectedLights: string[];
  createdAt: string;
  vehicle?: any;
}

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const tVehicle = useTranslations('vehicle');
  const tLights = useTranslations('lights');
  const tCommon = useTranslations('common');
  const { data: session, status } = useSession();
  const router = useRouter();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [reportsReceived, setReportsReceived] = useState<Report[]>([]);
  const [reportsSent, setReportsSent] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [newVehicle, setNewVehicle] = useState({ plate: '', make: '', model: '', country: 'PT' });

  // Redirect if not authenticated
  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      // Fetch vehicles
      const vehiclesRes = await fetch('/api/vehicles');
      const vehiclesData = await vehiclesRes.json();
      setVehicles(vehiclesData.vehicles || []);

      // Fetch reports
      const reportsRes = await fetch('/api/reports');
      const reportsData = await reportsRes.json();
      setReportsReceived(reportsData.reportsReceived || []);
      setReportsSent(reportsData.reportsSent || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVehicle),
      });

      if (response.ok) {
        setNewVehicle({ plate: '', make: '', model: '', country: 'PT' });
        setShowAddVehicle(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error adding vehicle:', error);
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;

    try {
      const response = await fetch(`/api/vehicles?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting vehicle:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      
      <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>

        <UrgencyBanner show={vehicles.length === 0} />

        {/* My Vehicles Section */}
        <section className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <h2 className="text-2xl font-bold flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-xl text-primary">
                <Car className="w-6 h-6" />
              </div>
              <span>{tVehicle('myVehicles')}</span>
            </h2>
            <button
              onClick={() => setShowAddVehicle(!showAddVehicle)}
              className="group flex items-center space-x-2 bg-foreground text-background hover:bg-foreground/90 dark:bg-primary dark:text-primary-foreground font-semibold px-5 py-2.5 rounded-full transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              <span>{tVehicle('addButton')}</span>
            </button>
          </div>

          {showAddVehicle && (
            <div className="bg-secondary/30 border border-border rounded-2xl p-6 mb-8 animate-in fade-in zoom-in-95 duration-200">
              <form onSubmit={handleAddVehicle} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="plate" className="block text-sm font-medium text-muted-foreground mb-2">
                      {tVehicle('plate')}
                    </label>
                    <PlateInput
                      id="plate"
                      value={newVehicle.plate}
                      onChange={(value) => setNewVehicle({ ...newVehicle, plate: value })}
                      placeholder="AA-00-AA"
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-muted-foreground/50"
                    />
                  </div>
                  <div>
                    <label htmlFor="make" className="block text-sm font-medium text-muted-foreground mb-2">
                      {tVehicle('make')}
                    </label>
                    <input
                      id="make"
                      type="text"
                      value={newVehicle.make}
                      onChange={(e) => setNewVehicle({ ...newVehicle, make: e.target.value })}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-muted-foreground/50"
                      placeholder={tVehicle('makePlaceholder')}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2.5 rounded-full transition-colors shadow-lg shadow-green-600/20"
                  >
                    {tVehicle('addButton')}
                  </button>
                </div>
              </form>
            </div>
          )}

          {vehicles.length === 0 ? (
            <div className="text-center py-12 bg-secondary/20 rounded-2xl border border-dashed border-border">
              <div className="mx-auto w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4 text-muted-foreground">
                <Car className="w-8 h-8" />
              </div>
              <p className="text-muted-foreground font-medium">{tVehicle('noVehicles')}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((vehicle) => (
                <div key={vehicle._id} className="group relative bg-background border border-border p-6 rounded-2xl hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5">
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleDeleteVehicle(vehicle._id)}
                      className="text-muted-foreground hover:text-destructive p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center text-muted-foreground">
                      <Car className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-mono text-xl font-bold tracking-wider">{vehicle.plate}</p>
                      <p className="text-sm text-muted-foreground uppercase tracking-wide text-[10px] font-bold bg-secondary px-2 py-0.5 rounded-md inline-block mt-1">
                        {vehicle.country}
                      </p>
                    </div>
                  </div>
                  
                  {vehicle.make && (
                    <div className="pt-4 border-t border-border">
                      <p className="text-sm font-medium text-muted-foreground">
                        {vehicle.make} <span className="text-foreground">{vehicle.model}</span>
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Reports Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Reports Received */}
          <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm h-full animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center space-x-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-xl text-red-600 dark:text-red-400">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <span>{t('reportsReceived')}</span>
              </h2>
              {reportsReceived.length > 0 && (
                <button
                  onClick={() => router.push('/reports/received')}
                  className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl font-semibold transition-all text-sm"
                >
                  View All
                </button>
              )}
            </div>

            {reportsReceived.length === 0 ? (
              <div className="text-center py-12 bg-secondary/20 rounded-2xl border border-dashed border-border h-[300px] flex flex-col justify-center items-center">
                 <div className="mx-auto w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-4 text-muted-foreground opacity-50">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                <p className="text-muted-foreground">{t('noReportsReceived')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reportsReceived.map((report) => (
                  <div key={report._id} className="bg-secondary/30 p-5 rounded-2xl border border-border hover:border-red-200 dark:hover:border-red-900/50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-foreground flex items-center space-x-2">
                          <span className="font-mono bg-background px-2 py-1 rounded-md border border-border text-xs">{report.plate}</span>
                          <span className="text-sm text-muted-foreground">via {report.reporterName}</span>
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap bg-background px-2 py-1 rounded-full border border-border flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-3 border border-red-100 dark:border-red-900/20">
                      <p className="text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wider mb-2">{t('lightsReported')}</p>
                      <ul className="space-y-1">
                        {report.selectedLights.map((light) => (
                          <li key={light} className="flex items-center text-sm text-foreground">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2" />
                            {tLights(light as any)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reports Sent */}
          <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm h-full animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-xl text-green-600 dark:text-green-400">
                  <Send className="w-6 h-6" />
                </div>
                <span>{t('reportsSent')}</span>
              </h2>
              {reportsSent.length > 0 && (
                <button
                  onClick={() => router.push('/reports/sent')}
                  className="px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 rounded-xl font-semibold transition-all text-sm"
                >
                  View All
                </button>
              )}
            </div>

            {reportsSent.length === 0 ? (
               <div className="text-center py-12 bg-secondary/20 rounded-2xl border border-dashed border-border h-[300px] flex flex-col justify-center items-center">
                 <div className="mx-auto w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-4 text-muted-foreground opacity-50">
                    <Send className="w-6 h-6" />
                  </div>
                <p className="text-muted-foreground">{t('noReportsSent')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reportsSent.map((report) => (
                  <div key={report._id} className="bg-secondary/30 p-5 rounded-2xl border border-border hover:border-green-200 dark:hover:border-green-900/50 transition-colors">
                     <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-foreground flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">Reported </span>
                          <span className="font-mono bg-background px-2 py-1 rounded-md border border-border text-xs">{report.plate}</span>
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap bg-background px-2 py-1 rounded-full border border-border flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/10 rounded-xl p-3 border border-green-100 dark:border-green-900/20">
                      <p className="text-green-600 dark:text-green-400 text-xs font-bold uppercase tracking-wider mb-2">{t('lightsReported')}</p>
                       <ul className="space-y-1">
                        {report.selectedLights.map((light) => (
                          <li key={light} className="flex items-center text-sm text-foreground">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2" />
                            {tLights(light as any)}
                          </li>
                        ))}
                      </ul>
                    </div>
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
