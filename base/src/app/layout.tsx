import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { GuiProvider } from '@/context/GuiContext';
import MenuBar from '@/components/gui/MenuBar';
import StandardToolbar from '@/components/gui/StandardToolbar';
import TitleBar from '@/components/gui/TitleBar';
import StatusBar from '@/components/gui/StatusBar';

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
      <body className="min-h-full flex flex-col text-gray-900 bg-white">
        <AuthProvider>
          <GuiProvider>
            <div className="flex flex-col h-screen overflow-hidden">
              <MenuBar />
              <StandardToolbar />
              <TitleBar />
              <div className="flex-1 overflow-auto bg-[#F4F5F7] pb-6">
                {children}
              </div>
              <StatusBar />
            </div>
          </GuiProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
