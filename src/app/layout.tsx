import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Providers } from '@/components/providers';
import { AppWrapper } from '@/components/AppWrapper';
import { Inter, Space_Grotesk } from 'next/font/google';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'ProTrack',
  description: 'Visualize and manage your project\'s progress and financials.',
};

const fontBody = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

const fontHeadline = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-headline',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("font-body antialiased bg-background text-foreground", fontBody.variable, fontHeadline.variable)}>
        <Providers>
          <AppWrapper>{children}</AppWrapper>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
