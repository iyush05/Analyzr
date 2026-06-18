'use client';

import './globals.css';
import { usePathname } from 'next/navigation';
import { Inter, Calistoga, JetBrains_Mono } from 'next/font/google';
import Sidebar from '@/components/Sidebar';
import { AuthProvider } from '@/context/AuthContext';
import { SiteProvider } from '@/context/SiteContext';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const calistoga = Calistoga({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-calistoga',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/' || pathname === '/login' || pathname === '/signup';

  return (
    <html lang="en" className={`${inter.variable} ${calistoga.variable} ${jetbrainsMono.variable}`}>
      <head>
        <title>Analyzr — User Analytics Dashboard</title>
        <meta name="description" content="Track user sessions, page views, clicks, and visualize interaction patterns with heatmaps." />
        <link rel="icon" href="/favicon.png" type="image/png" />
      </head>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-accent selection:text-white">
        <AuthProvider>
          <SiteProvider>
            <div className="flex min-h-screen relative z-10">
              {!isAuthPage && <Sidebar />}
              <main 
                className={`flex-1 transition-all duration-300 ease-out ${isAuthPage ? 'w-full' : 'md:ml-[260px]'}`}
              >
                {children}
              </main>
            </div>
          </SiteProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
