import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { Sidebar } from '@/components/layout/sidebar';
import { BottomNav } from '@/components/layout/bottom-nav';
import { MobileHeader } from '@/components/layout/mobile-header';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Soldo — Expense Tracker',
  description: 'Personal expense tracking',
};

// Applied before React hydration to avoid flash of wrong theme
const themeScript = `(function(){
  var t=localStorage.getItem('theme');
  if(t==='dark'||(t===null&&window.matchMedia('(prefers-color-scheme:dark)').matches)){
    document.documentElement.classList.add('dark');
  }
})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full" suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />

        <Sidebar />

        <div className="flex min-h-screen flex-col md:pl-56">
          <MobileHeader />
          <main className="flex-1 pb-16 md:pb-0">
            {children}
          </main>
        </div>

        <BottomNav />
        <Toaster richColors />
      </body>
    </html>
  );
}
