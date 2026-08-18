import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// L'app de jeu (/play) n'a pas vocation a etre indexee (cf. plan : robots noindex).
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AppLayout({ children }: { children: ReactNode }) {
  return children;
}
