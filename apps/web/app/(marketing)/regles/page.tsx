import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Regles du Loup-Garou de Thiercelieux',
  description:
    'Les regles du Loup-Garou de Thiercelieux : deroulement d\'une partie, phases de nuit et de jour, conditions de victoire. FAQ pour le Maitre du Jeu.',
  alternates: { canonical: `${SITE_URL}/regles` },
};

const FAQ = [
  {
    q: 'Combien de joueurs pour une partie de Loup-Garou ?',
    a: 'De 4 a 25 joueurs. MJ App ajuste automatiquement la composition des roles selon le nombre de participants.',
  },
  {
    q: 'Comment se deroule une partie ?',
    a: "La partie alterne des phases de nuit (les roles agissent dans l'ordre) et de jour (debat puis vote du village), jusqu'a ce qu'un camp remplisse sa condition de victoire.",
  },
  {
    q: 'Quelles sont les conditions de victoire ?',
    a: 'Le Village gagne en eliminant toutes les menaces ; les Loups-Garous en devenant majoritaires ; les roles solitaires (Loup Blanc, Joueur de Flute, Fossoyeur) et les Amoureux ont leurs propres conditions.',
  },
];

export default function ReglesPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-6 p-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h1 className="font-display text-3xl font-bold text-blood-light">Les regles</h1>

      <section className="flex flex-col gap-3 text-parchment/85">
        <h2 className="font-display text-xl text-gold-light">Deroulement</h2>
        <p>
          Une partie de Loup-Garou alterne deux phases. La <strong>nuit</strong>, le Maitre du Jeu
          appelle chaque role a tour de role selon un ordre precis : les Loups-Garous designent une
          victime, les roles du village agissent (Voyante, Sorciere, Salvateur...). Le{' '}
          <strong>jour</strong>, le village debat puis vote pour eliminer un suspect.
        </p>
        <p>
          Le cycle se repete jusqu'a ce qu'un camp atteigne sa condition de victoire. MJ App gere
          l'ordre de nuit, les morts en cascade (amoureux, Enfant Sauvage) et detecte les victoires.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-xl text-gold-light">Questions frequentes</h2>
        {FAQ.map((f) => (
          <div key={f.q} className="rounded-md border border-blood/15 bg-surface/60 p-4">
            <h3 className="font-display font-semibold text-parchment">{f.q}</h3>
            <p className="mt-1 text-parchment/75">{f.a}</p>
          </div>
        ))}
      </section>

      <Link href="/" className="text-center text-sm text-parchment/50 hover:text-parchment">
        ← Accueil
      </Link>
    </main>
  );
}
