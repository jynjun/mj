'use client';

import { useRef, useState } from 'react';
import { SOUND_EVENTS } from '@mj/sound-config';
import type { SoundEvent } from '@mj/sound-config';
import { useSound } from '../sound';

export function SoundConfigModal() {
  const sound = useSound();
  const [tab, setTab] = useState<'library' | 'assign'>('library');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const libraryList = Object.keys(sound.library).map((id) => ({ id, ...sound.library[id] }));

  const cats: string[] = [];
  const bycat: Record<string, SoundEvent[]> = {};
  SOUND_EVENTS.forEach((e) => {
    if (!bycat[e.category]) { bycat[e.category] = []; cats.push(e.category); }
    bycat[e.category].push(e);
  });

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    for (const file of files) await sound.addSound(file);
    e.target.value = '';
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) sound.setShowModal(false); }}>
      <div style={{ background: 'rgba(8,3,14,0.99)', border: '1px solid rgba(180,30,60,0.3)', borderRadius: '16px', width: '100%', maxWidth: '460px', maxHeight: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '13px 16px', borderBottom: '1px solid rgba(180,30,60,0.15)', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <div style={{ flex: 1, fontFamily: "'Cinzel',serif", fontSize: '15px', fontWeight: 600, color: 'var(--text)' }}>Reglages des sons</div>
          <button onClick={sound.toggle} title={sound.enabled ? 'Desactiver les sons' : 'Activer les sons'}
            style={{ width: '38px', height: '22px', borderRadius: '11px', background: sound.enabled ? 'var(--red)' : 'rgba(70,45,55,0.6)', border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0 }}>
            <div style={{ position: 'absolute', top: '3px', left: sound.enabled ? '18px' : '3px', width: '16px', height: '16px', borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
          </button>
          <button onClick={() => sound.setShowModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '20px', padding: '2px', lineHeight: 1 }}>×</button>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid rgba(180,30,60,0.12)', flexShrink: 0 }}>
          {([{ id: 'library', label: 'Bibliotheque' }, { id: 'assign', label: 'Assignations' }] as const).map((t) => {
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ flex: 1, padding: '10px', background: active ? 'rgba(196,30,58,0.1)' : 'transparent', border: 'none', borderBottom: '2px solid ' + (active ? 'var(--red)' : 'transparent'), cursor: 'pointer', fontFamily: "'Cinzel',serif", fontSize: '11px', letterSpacing: '0.12em', color: active ? 'var(--text)' : 'var(--text-muted)', textTransform: 'uppercase' }}>
                {t.label}
              </button>
            );
          })}
        </div>

        {tab === 'library' && (
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(180,30,60,0.08)', flexShrink: 0 }}>
              <input type="file" ref={fileInputRef} accept="audio/*" multiple onChange={handleImport} style={{ display: 'none' }} />
              <button onClick={() => fileInputRef.current?.click()}
                style={{ width: '100%', padding: '10px', background: 'rgba(212,160,23,0.09)', border: '1px dashed rgba(212,160,23,0.4)', borderRadius: '9px', cursor: 'pointer', fontFamily: "'Cinzel',serif", fontSize: '12px', color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>＋</span> Importer des sons
              </button>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)', fontFamily: "'Crimson Text',serif", textAlign: 'center', marginTop: '6px', fontStyle: 'italic' }}>MP3, WAV, OGG, AAC - stockes en IndexedDB (gros fichiers acceptes)</div>
            </div>

            {libraryList.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', gap: '12px' }}>
                <div style={{ fontSize: '36px', opacity: 0.3 }}>🔈</div>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: '13px', color: 'var(--text-dim)', textAlign: 'center', lineHeight: 1.6 }}>Aucun son dans la bibliotheque.<br />Importez vos fichiers audio.</div>
              </div>
            ) : (
              <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {libraryList.map((s) => (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 12px', background: 'rgba(10,4,18,0.7)', border: '1px solid rgba(180,30,60,0.12)', borderRadius: '8px' }}>
                    <span style={{ fontSize: '16px', flexShrink: 0 }}>🔊</span>
                    <span style={{ flex: 1, fontFamily: "'Crimson Text',serif", fontSize: '14px', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
                    <button onClick={() => sound.playSound('lib_' + s.id, s.id)} title="Tester"
                      style={{ padding: '3px 7px', background: 'transparent', border: '1px solid rgba(180,30,60,0.22)', borderRadius: '5px', cursor: 'pointer', fontSize: '10px', color: 'var(--text-muted)', flexShrink: 0 }}>▶</button>
                    <button onClick={() => { void sound.deleteSound(s.id); }} title="Supprimer"
                      style={{ padding: '3px 7px', background: 'transparent', border: '1px solid rgba(180,30,60,0.18)', borderRadius: '5px', cursor: 'pointer', fontSize: '10px', color: 'rgba(239,68,68,0.5)', flexShrink: 0 }}>🗑️</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'assign' && (
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            {libraryList.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 20px', gap: '10px' }}>
                <div style={{ fontSize: '28px', opacity: 0.3 }}>🔈</div>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: '12px', color: 'var(--text-dim)', textAlign: 'center', lineHeight: 1.6 }}>Importez d'abord des sons<br />dans la Bibliotheque.</div>
              </div>
            ) : (
              <div style={{ padding: '4px 0' }}>
                {cats.map((cat) => (
                  <div key={cat}>
                    <div style={{ padding: '8px 16px 4px', fontFamily: "'Cinzel',serif", fontSize: '9px', letterSpacing: '0.3em', color: 'var(--text-dim)', textTransform: 'uppercase', background: 'rgba(4,1,8,0.5)' }}>{cat}</div>
                    {bycat[cat].map((evt) => {
                      const currentAssign = sound.assignments[evt.id] || '';
                      return (
                        <div key={evt.id} style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '8px 14px', borderBottom: '1px solid rgba(180,30,60,0.05)' }}>
                          <span style={{ fontSize: '15px', width: '18px', textAlign: 'center', flexShrink: 0, lineHeight: 1 }}>{evt.icon}</span>
                          <span style={{ flex: 1, fontFamily: "'Crimson Text',serif", fontSize: '14px', color: 'var(--text)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{evt.label}</span>
                          <select value={currentAssign} onChange={(e) => sound.setAssignment(evt.id, e.target.value)}
                            style={{ background: 'rgba(12,5,20,0.95)', border: '1px solid rgba(180,30,60,0.25)', borderRadius: '6px', color: currentAssign ? 'var(--text)' : 'var(--text-dim)', fontFamily: "'Cinzel',serif", fontSize: '10px', padding: '4px 6px', cursor: 'pointer', outline: 'none', maxWidth: '120px', flexShrink: 0 }}>
                            <option value="">- Aucun -</option>
                            {libraryList.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                          </select>
                          <button onClick={() => { if (currentAssign) sound.playSound('assign_' + evt.id, currentAssign); }} disabled={!currentAssign}
                            style={{ padding: '3px 7px', background: 'transparent', border: '1px solid rgba(180,30,60,0.2)', borderRadius: '5px', cursor: currentAssign ? 'pointer' : 'not-allowed', fontSize: '10px', color: currentAssign ? 'var(--text-muted)' : 'var(--text-dim)', opacity: currentAssign ? 1 : 0.4, flexShrink: 0 }}>▶</button>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(180,30,60,0.12)', flexShrink: 0 }}>
          <button onClick={() => sound.setShowModal(false)}
            style={{ width: '100%', padding: '11px', background: 'rgba(196,30,58,0.12)', border: '1px solid rgba(196,30,58,0.32)', borderRadius: '9px', cursor: 'pointer', fontFamily: "'Cinzel',serif", fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text)' }}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
