import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Providers } from '@/components/providers';
import { AppWrapper } from '@/components/AppWrapper';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'ProTrack',
  description: 'Visualize and manage your project\'s progress and financials.',
};

const fontBody = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("font-body antialiased bg-background text-foreground", fontBody.variable)}>
        <Providers>
          <AppWrapper>{children}</AppWrapper>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
