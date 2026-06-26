import Link from 'next/link';
import type { Metadata } from 'next';
import { rolesByTeam, SITE_URL } from '@/lib/site';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Les 22 roles du Loup-Garou de Thiercelieux',
  description:
    'Guide complet des roles du Loup-Garou : Village, Loups-Garous et solitaires. Pouvoirs, camps et ordre de reveil de chaque carte.',
  alternates: { canonical: `${SITE_URL}/roles` },
};

export default function RolesPage() {
  const groups = rolesByTeam();
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-8 p-8">
      <header className="text-center">
        <h1 className="font-display text-3xl font-bold text-blood-light">Les roles</h1>
        <p className="mt-2 text-parchment/70">22 roles pour des parties de 4 a 25 joueurs.</p>
      </header>

      {groups.map((g) => (
        <section key={g.team} className="flex flex-col gap-3">
          <h2 className="font-display text-xl text-gold-light">{g.label}</h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {g.roles.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/roles/${r.id}`}
                  className="flex items-start gap-3 rounded-md border border-blood/15 bg-surface/60 p-3 transition-colors hover:border-blood/40"
                >
                  <span className="text-2xl">{r.emoji}</span>
                  <span>
                    <span className="block font-display font-semibold text-parchment">{r.name}</span>
                    <span className="block text-sm text-parchment/60">{r.description}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <Link href="/" className="text-center text-sm text-parchment/50 hover:text-parchment">
        ← Accueil
      </Link>
    </main>
  );
}
