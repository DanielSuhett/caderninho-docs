'use client';
import SearchDialog from '@/components/search';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { type ReactNode } from 'react';
import { translations } from '@/lib/translations';

export function Provider({ children }: { children: ReactNode }) {
  return <RootProvider
    search={{ SearchDialog }}
    i18n={{ translations }}
    theme={{ defaultTheme: 'dark', enableSystem: false, attribute: ['class', 'data-mode'], storageKey: 'caderninho-theme' }}
  >{children}</RootProvider>;
}
