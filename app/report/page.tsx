'use client';

import { useState } from 'react';
import { useTranslations } from '@/lib/translations';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import LightSelector from '@/components/LightSelector';
import PlateInput from '@/components/PlateInput';
import { LightType } from '@/models/Report';
import { AlertTriangle, Camera, Send, ChevronRight } from 'lucide-react';

export default function ReportPage() {
  const t = useTranslations('report');
  const tCommon = useTranslations('common');
  const { data: session, status } = useSession();
  const router = useRouter();

  const [plate, setPlate] = useState('');
  const [selectedLights, setSelectedLights] = useState<LightType[]>([]);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [detectionMethod, setDetectionMethod] = useState<'manual' | 'ai'>('manual');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Redirect if not authenticated
  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const handleLightToggle = (light: LightType) => {
    setSelectedLights((prev) =>
      prev.includes(light) ? prev.filter((l) => l !== light) : [...prev, light]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (selectedLights.length === 0) {
      setError('Please select at least one light');
      return;
    }

    setLoading(true);

    try {
      let imageId: string | undefined;

      // Upload image to GridFS if present
      if (uploadedImage) {
        const formData = new FormData();
        formData.append('image', uploadedImage);

        const uploadResponse = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image');
        }

        const uploadData = await uploadResponse.json();
        imageId = uploadData.imageId;
      }

      // Submit report with image ID
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plate,
          selectedLights,
          imageId,
          detectionMethod,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t('error'));
      } else {
        setSuccess(t('success'));
        setPlate('');
        setSelectedLights([]);
        setUploadedImage(null);
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      }
    } catch (err) {
      setError(t('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />

      <div className="pt-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
           <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl text-primary mb-4 shadow-lg shadow-primary/20">
              <AlertTriangle className="w-8 h-8" />
            </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">{t('title')}</h1>
          <p className="mt-2 text-muted-foreground">Make reports easier and help safer roads</p>
        </div>

        <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          <form onSubmit={handleSubmit} className="space-y-8">
             {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-4 flex items-center animate-shake">
                  <span className="mr-2">⚠️</span>
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 rounded-xl p-4 flex items-center animate-in fade-in slide-in-from-top-2">
                  <span className="mr-2">🎉</span>
                  {success}
                </div>
              )}

            {/* Plate Input */}
            <div className="space-y-3">
              <label htmlFor="plate" className="block text-sm font-bold text-foreground uppercase tracking-wide">
                {t('plateLabel')}
              </label>
              <div className="relative">
                <PlateInput
                  id="plate"
                  value={plate}
                  onChange={setPlate}
                  placeholder={t('platePlaceholder')}
                  required
                  className="w-full pl-14 pr-14 py-4 bg-card border-2 border-border rounded-2xl text-foreground text-lg font-mono font-bold tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted-foreground placeholder:font-normal placeholder:tracking-normal"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 text-white rounded text-[10px] font-bold">
                    P
                </div>
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold">
                    EU
                </div>
              </div>
            </div>

            {/* Light Selection */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">{t('selectLights')}</h2>
              
              <LightSelector 
                selectedLights={selectedLights}
                onLightsChange={setSelectedLights}
                onImageUpload={setUploadedImage}
                onDetectionMethodChange={setDetectionMethod}
              />
              {selectedLights.length > 0 ? (
                <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                  <p className="text-primary font-medium flex items-center">
                    <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2 font-bold">{selectedLights.length}</span>
                    lights selected
                  </p>
                  <button type="button" onClick={() => setSelectedLights([])} className="text-xs text-muted-foreground hover:text-foreground underline">
                    Clear all
                  </button>
                </div>
              ) : (
                 <div className="mt-6 p-4 bg-secondary/30 border border-dashed border-border rounded-2xl text-center">
                     <p className="text-muted-foreground text-sm">Tap on the lights in the diagrams above to verify them.</p>
                 </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || selectedLights.length === 0}
              className="group w-full h-16 bg-foreground text-background font-bold text-lg rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-foreground/90 active:scale-[0.99] shadow-xl hover:shadow-2xl flex items-center justify-center space-x-2 dark:bg-primary dark:text-primary-foreground"
            >
              {loading ? (
                 <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-current"></div>
              ) : (
                <>
                    <span>{t('submitButton')}</span>
                    <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
