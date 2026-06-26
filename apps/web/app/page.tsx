import { ENGINE_NAME, SCHEMA_VERSION } from '@mj/game-engine';

export default function HomePage() {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
      <h1>MJ App</h1>
      <p>Assistant Maitre du Jeu Loup-Garou de Thiercelieux.</p>
      <p>
        Scaffold monorepo (phase 0). Moteur : <code>{ENGINE_NAME}</code> (schema v
        {SCHEMA_VERSION}).
      </p>
    </main>
  );
}
