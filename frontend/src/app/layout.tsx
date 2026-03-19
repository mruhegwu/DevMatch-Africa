import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DevMatch Africa — AI-Powered Developer Portfolios',
  description:
    'Convert your GitHub profile into a verified developer portfolio and get matched to paid tasks across Africa.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
