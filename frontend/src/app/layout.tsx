import * as React from 'react';
import '@/styles/globals.css';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

export const metadata = {
  title: 'Aegis: RAG Faithfulness Auditor',
  description: 'Open-source sentence-level RAG faithfulness evaluation engine & auditor UI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="light">
      <body className="flex h-screen w-screen overflow-hidden bg-aegis-background text-aegis-text antialiased">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
