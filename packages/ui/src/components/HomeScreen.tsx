'use client';

import { useState } from 'react';
import { GAMES_LIST } from '@mj/game-engine';
import { useGame } from '../game';
import { useSound } from '../sound';

export function HomeScreen() {
  const { dispatch } = useGame();
  const sound = useSound();
  const [inputVal, setInputVal] = useState('');

  const count = parseInt(inputVal, 10);
  const valid = !isNaN(count) && count >= 4 && count <= 25;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputVal(e.target.value);
    const v = parseInt(e.target.value, 10);
    if (!isNaN(v) && v >= 1) dispatch({ type: 'SET_PLAYER_COUNT', count: v });
  }

  function handleLaunch() {
    if (!valid) return;
    dispatch({ type: 'INIT_PLAYERS' });
    dispatch({ type: 'SET_SCREEN', screen: 'playerRoleAssign' });
  }

  return (
    <div style={{ width: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', position: 'relative' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 'clamp(64px,16vw,104px)', fontWeight: 900, letterSpacing: '0.22em', color: 'var(--text)', lineHeight: 1, textShadow: '0 0 100px rgba(196,30,58,0.5)' }}>MJ</div>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: '11px', letterSpacing: '0.5em', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '10px' }}>Maitre du Jeu</div>
      </div>

      <div style={{ width: '100%', maxWidth: '460px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {GAMES_LIST.map((game) => (
          <div key={game.id} style={{ background: 'rgba(196,30,58,0.1)', border: '1px solid rgba(196,30,58,0.42)', borderRadius: '12px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '32px', lineHeight: 1 }}>{game.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '3px' }}>{game.name}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: "'Crimson Text',serif" }}>{game.description}</div>
            </div>
            <span style={{ color: 'var(--red)', fontSize: '16px' }}>✓</span>
          </div>
        ))}

        <div style={{ background: 'rgba(10,4,16,0.9)', border: '1px solid ' + (valid ? 'rgba(196,30,58,0.42)' : 'rgba(180,30,60,0.18)'), borderRadius: '12px', padding: '18px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', transition: 'border-color 0.2s' }}>
          <span style={{ fontFamily: "'Cinzel',serif", fontSize: '11px', letterSpacing: '0.18em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Nombre de joueurs</span>
          <input type="number" min={4} max={25} value={inputVal} onChange={handleChange} placeholder="-" autoFocus
            style={{ width: '120px', background: 'transparent', border: 'none', borderBottom: '2px solid ' + (valid ? 'rgba(196,30,58,0.7)' : 'rgba(180,30,60,0.3)'), outline: 'none', fontFamily: "'Cinzel',serif", fontSize: '48px', fontWeight: 700, color: valid ? 'var(--text)' : 'var(--text-muted)', lineHeight: 1, textAlign: 'center', padding: '4px 0' }} />
          {inputVal !== '' && !valid && (
            <div style={{ fontFamily: "'Crimson Text',serif", fontSize: '13px', color: 'rgba(239,68,68,0.7)', fontStyle: 'italic' }}>Entre 4 et 25 joueurs</div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => sound.setShowModal(true)} title="Configuration des sons"
            style={{ flexShrink: 0, padding: '12px 15px', background: 'rgba(10,4,16,0.9)', border: '1px solid rgba(180,30,60,0.22)', borderRadius: '10px', cursor: 'pointer', fontSize: '20px', display: 'flex', alignItems: 'center', color: sound.enabled ? 'var(--text)' : 'var(--text-muted)' }}>
            {sound.enabled ? '🔊' : '🔇'}
          </button>
          <button disabled={!valid} onClick={handleLaunch}
            style={{ flex: 1, padding: '13px 20px', background: valid ? 'var(--red)' : 'rgba(60,20,28,0.5)', border: '1px solid ' + (valid ? 'transparent' : 'rgba(180,30,60,0.14)'), borderRadius: '10px', cursor: valid ? 'pointer' : 'not-allowed', fontFamily: "'Cinzel',serif", fontSize: '13px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: valid ? '#fff' : 'var(--text-dim)', boxShadow: valid ? '0 0 30px rgba(196,30,58,0.25)' : 'none' }}>
            {valid ? 'Lancer la partie →' : 'Entrez le nombre de joueurs'}
          </button>
        </div>
      </div>
    </div>
  );
}
