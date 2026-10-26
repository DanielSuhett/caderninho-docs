import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Provider } from '@/components/provider';
import { siteUrl } from '@/lib/shared';
import './global.css';

const inter = localFont({
  src: '../public/fonts/InterVariable.woff2',
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'Guias do Caderninho', template: '%s · Caderninho' },
  description: 'Instale seu Caderninho, acompanhe suas conexões bancárias e consulte suas finanças com IA.',
  openGraph: { siteName: 'Guias do Caderninho', locale: 'pt_BR', type: 'website' },
  twitter: { card: 'summary_large_image' },
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="pt-BR" className={inter.variable} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
