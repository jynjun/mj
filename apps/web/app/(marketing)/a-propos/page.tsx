import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/site';
import { APP_VERSION } from '@/lib/version';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'A propos de MJ App',
  description:
    'MJ App : assistant Maitre du Jeu pour le Loup-Garou de Thiercelieux. Gratuit, open source, disponible sur le web et en application desktop.',
  alternates: { canonical: `${SITE_URL}/a-propos` },
};

export default function AProposPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-6 p-8">
      <h1 className="font-display text-3xl font-bold text-blood-light">A propos</h1>
      <p className="text-parchment/85">
        MJ App est un assistant Maitre du Jeu pour le Loup-Garou de Thiercelieux. Il fonctionne dans
        le navigateur (installable en PWA, jouable hors-ligne) et en application desktop
        (Windows, macOS, Linux).
      </p>
      <p className="font-mono text-sm text-parchment/60">Version {APP_VERSION}</p>
      <Link href="/" className="text-sm text-parchment/50 hover:text-parchment">
        ← Accueil
      </Link>
    </main>
  );
}
