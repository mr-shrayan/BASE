import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import BaseToolbar from '@/components/BaseToolbar';
import { AuthProvider } from '@/context/AuthContext';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'BASE ERP',
  description: 'Metadata-driven enterprise web application',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F0F0F0] text-gray-900">
        <AuthProvider>
          <BaseToolbar />
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
