import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
    locales: ['pt', 'en'],
    defaultLocale: 'pt',
    localePrefix: 'never' // This removes the locale from the URL!
});

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
