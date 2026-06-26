import Link from 'next/link';
import type { Metadata } from 'next';
import { GAMES_LIST } from '@mj/game-engine';
import { SITE_NAME, SITE_URL } from '@/lib/site';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'MJ App - assistant Maitre du Jeu pour le Loup-Garou de Thiercelieux',
  description:
    'Animez vos parties de Loup-Garou de Thiercelieux : 22 roles, ordre de nuit automatique, gestion des morts et des victoires. Gratuit, installable, fonctionne hors-ligne.',
  alternates: { canonical: SITE_URL },
};

export default function HomePage() {
  const game = GAMES_LIST[0]!;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: SITE_NAME,
    applicationCategory: 'GameApplication',
    operatingSystem: 'Web, Windows, macOS, Linux',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    description: metadata.description,
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col items-center justify-center gap-6 p-8 text-center">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <span className="text-6xl">{game.emoji}</span>
      <h1 className="font-display text-4xl font-bold tracking-wide text-blood-light">MJ App</h1>
      <p className="text-lg text-parchment/80">Assistant Maitre du Jeu pour le {game.name}.</p>
      <p className="font-mono text-sm text-parchment/50">{game.description}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/play"
          className="rounded-md border border-blood/50 bg-blood/10 px-6 py-3 font-display font-semibold text-blood-light transition-colors hover:bg-blood/20"
        >
          Lancer une partie
        </Link>
        <Link
          href="/roles"
          className="rounded-md border border-parchment/25 px-6 py-3 font-display text-parchment/80 transition-colors hover:bg-parchment/10"
        >
          Les roles
        </Link>
        <Link
          href="/regles"
          className="rounded-md border border-parchment/25 px-6 py-3 font-display text-parchment/80 transition-colors hover:bg-parchment/10"
        >
          Les regles
        </Link>
      </div>
    </main>
  );
}
