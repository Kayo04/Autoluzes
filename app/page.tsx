'use client';

import { useTranslations } from '@/lib/translations';
import Link from 'next/link';
import { Car, Shield, Users, Bell, ArrowRight, CheckCircle2 } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function HomePage() {
  const t = useTranslations('hero');

  return (
    <div className="min-h-screen bg-background selection:bg-primary/30 selection:text-primary-foreground">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
          {/* Abstract Background Shapes */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-primary/20 to-transparent -z-10 blur-3xl rounded-[100%] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="inline-flex items-center space-x-2 bg-secondary/50 backdrop-blur-sm px-4 py-2 rounded-full mb-8 border border-border animate-in fade-in slide-in-from-bottom-4 duration-700">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-medium text-muted-foreground">{t('subtitle').split('.')[0] || 'Join the community'}</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-foreground mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both">
              {t('title')}
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 fill-mode-both">
              {t('subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 fill-mode-both">
              <Link
                href="/register"
                className="group relative h-14 px-8 flex items-center justify-center bg-foreground text-background font-semibold rounded-full text-lg transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-foreground/20 dark:shadow-none dark:bg-primary dark:text-primary-foreground"
              >
                <span>{t('cta')}</span>
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/report"
                className="h-14 px-8 flex items-center justify-center bg-secondary text-foreground font-semibold rounded-full text-lg transition-all hover:bg-secondary/80"
              >
                {t('reportCta')}
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-secondary/30 border-y border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-12">
              <FeatureCard 
                icon={<Shield className="w-8 h-8" />}
                title="Community Safety"
                description="Help fellow drivers stay safe by alerting them about faulty lights before it becomes a hazard."
                delay={0}
              />
              <FeatureCard 
                icon={<Bell className="w-8 h-8" />}
                title="Instant Notifications"
                description="Get notified immediately when someone reports an issue with your vehicle's lights."
                delay={100}
              />
              <FeatureCard 
                icon={<Users className="w-8 h-8" />}
                title="Neighborly Care"
                description="Not about fines or snitching - it's about looking out for each other on the road."
                delay={200}
              />
            </div>
          </div>
        </section>

        {/* Trust/Social Proof Section */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-card border border-border rounded-3xl p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              
              <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">Why join Autoluzes?</h2>
                  <div className="space-y-4">
                    {[
                      'Free forever for all drivers',
                      'Anonymous reporting system',
                      'Real-time alerts via email',
                      'Contribute to safer roads'
                    ].map((item, i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 text-green-600 dark:text-green-400 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <span className="text-lg text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <div className="aspect-square rounded-2xl bg-gradient-to-tr from-zinc-100 to-zinc-200 dark:from-zinc-900 dark:to-zinc-800 flex items-center justify-center p-8">
                    <Car className="w-32 h-32 text-muted-foreground/30" />
                  </div>
                  {/* Floating badge */}
                  <div className="absolute -bottom-6 -left-6 bg-card border border-border p-6 rounded-2xl shadow-xl max-w-xs">
                    <div className="flex items-center space-x-3 mb-2">
                       <span className="flex h-3 w-3 rounded-full bg-green-500" />
                       <span className="font-semibold text-sm">Live Activity</span>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      "Just received an alert about my brake light. Fixed it immediately. Thanks!"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode; title: string; description: string; delay: number }) {
  return (
    <div 
      className="group p-8 rounded-3xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="w-16 h-16 rounded-2xl bg-secondary text-foreground flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}
