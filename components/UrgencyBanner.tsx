'use client';

import { useTranslations } from '@/lib/translations';
import Link from 'next/link';
import { AlertTriangle, Shield, ArrowRight } from 'lucide-react';

export default function UrgencyBanner({ show }: { show: boolean }) {
  const t = useTranslations('urgencyBanner');

  if (!show) return null;

  return (
    <div className="relative overflow-hidden mb-12 rounded-3xl bg-gradient-to-r from-orange-500 to-amber-500 p-8 md:p-10 shadow-lg shadow-orange-500/20">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex-1">
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white/90 text-sm font-medium mb-4">
            <AlertTriangle className="w-4 h-4" />
            <span>{t('notice')}</span>
          </div>
          <h3 className="text-3xl font-bold text-white mb-2 tracking-tight">
            {t('title')}
          </h3>
          <p className="text-white/90 text-lg max-w-xl leading-relaxed">
            {t('message')}
          </p>
        </div>

        <Link
          href="/dashboard"
          className="group flex items-center justify-center px-8 py-4 bg-white text-orange-600 rounded-full font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-xl shadow-black/10 hover:shadow-2xl"
        >
          <Shield className="w-5 h-5 mr-2 group-hover:animate-pulse" />
          <span>{t('cta')}</span>
          <ArrowRight className="w-5 h-5 ml-2 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
        </Link>
      </div>
    </div>
  );
}
