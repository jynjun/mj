import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TEAM_INFO } from '@mj/game-engine';
import { roleById, roleIds, SITE_NAME, SITE_URL } from '@/lib/site';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return roleIds().map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const role = roleById(id);
  if (!role) return {};
  const title = `${role.name} - role du Loup-Garou de Thiercelieux`;
  return {
    title,
    description: role.description,
    alternates: { canonical: `${SITE_URL}/roles/${role.id}` },
    openGraph: {
      title,
      description: role.description,
      url: `${SITE_URL}/roles/${role.id}`,
      siteName: SITE_NAME,
      images: [`${SITE_URL}/icon.svg`],
      type: 'article',
    },
  };
}

export default async function RolePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const role = roleById(id);
  if (!role) notFound();

  const team = TEAM_INFO[role.team];
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: role.name,
    description: role.description,
    about: 'Loup-Garou de Thiercelieux',
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-6 p-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Link href="/roles" className="text-sm text-parchment/50 hover:text-parchment">
        ← Tous les roles
      </Link>
      <header className="flex items-center gap-4">
        <span className="text-5xl">{role.emoji}</span>
        <div>
          <h1 className="font-display text-3xl font-bold text-blood-light">{role.name}</h1>
          <p className="font-mono text-sm" style={{ color: team.color }}>
            {team.label}
          </p>
        </div>
      </header>
      <p className="text-lg leading-relaxed text-parchment/85">{role.description}</p>
      {role.nightInstruction && (
        <section className="rounded-md border border-blood/20 bg-surface/60 p-4">
          <h2 className="font-display text-gold-light">Instruction de nuit</h2>
          <p className="mt-1 text-parchment/75">{role.nightInstruction}</p>
        </section>
      )}
    </main>
  );
}
