import '@/styles/globals.css';
import type { Metadata } from 'next';
import { QueryProvider } from '@/providers/QueryProvider';

export const metadata: Metadata = {
  title: 'Nawy Mars — Habitat Listings',
  description: 'Browse Martian habitats — Nawy Mars Expansion.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <main>{children}</main>
        </QueryProvider>
      </body>
    </html>
  );
}
