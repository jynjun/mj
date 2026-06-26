import Link from 'next/link';
import { GAMES_LIST } from '@mj/game-engine';

export default function HomePage() {
  const game = GAMES_LIST[0]!;
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col items-center justify-center gap-6 p-8 text-center">
      <span className="text-6xl">{game.emoji}</span>
      <h1 className="font-display text-4xl font-bold tracking-wide text-blood-light">MJ App</h1>
      <p className="text-lg text-parchment/80">
        Assistant Maitre du Jeu pour le {game.name}.
      </p>
      <p className="font-mono text-sm text-parchment/50">{game.description}</p>
      <Link
        href="/play"
        className="rounded-md border border-blood/50 bg-blood/10 px-6 py-3 font-display font-semibold text-blood-light transition-colors hover:bg-blood/20"
      >
        Lancer une partie
      </Link>
    </main>
  );
}
