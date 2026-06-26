import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'MJ App - assistant Maitre du Jeu Loup-Garou',
  description:
    'Assistant Maitre du Jeu pour le Loup-Garou de Thiercelieux (4 a 25 joueurs, 22 roles).',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
