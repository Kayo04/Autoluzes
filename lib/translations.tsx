'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import ptMessages from '@/messages/pt.json';
import enMessages from '@/messages/en.json';

type Locale = 'pt' | 'en';
type Messages = typeof ptMessages;

interface TranslationContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('pt');
  const [messages, setMessages] = useState<Messages>(ptMessages);

  useEffect(() => {
    // Load locale from localStorage
    const savedLocale = localStorage.getItem('locale') as Locale;
    if (savedLocale && (savedLocale === 'pt' || savedLocale === 'en')) {
      setLocaleState(savedLocale);
      setMessages(savedLocale === 'pt' ? ptMessages : enMessages);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    setMessages(newLocale === 'pt' ? ptMessages : enMessages);
    localStorage.setItem('locale', newLocale);
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = messages;
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  return (
    <TranslationContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslations(namespace?: string) {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslations must be used within TranslationProvider');
  }

  return (key: string) => {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    return context.t(fullKey);
  };
}

export function useLocale() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useLocale must be used within TranslationProvider');
  }
  return { locale: context.locale, setLocale: context.setLocale };
}
