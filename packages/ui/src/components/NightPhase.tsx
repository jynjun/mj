'use client';

import { useState } from 'react';
import type { CSSProperties } from 'react';
import { ROLES_DATA } from '@mj/game-engine';
import type { Player, RoleId } from '@mj/game-engine';
import { useGame } from '../game';
import { useSound } from '../sound';

interface BigReveal {
  playerId: number;
  roleId?: RoleId;
  title?: string;
}

export function NightPhase() {
  const { state, dispatch } = useGame();
  const { playSound, playingEventId, library } = useSound();
  const [thiefTarget, setThiefTarget] = useState('');
  const [witchDeath, setWitchDeath] = useState('');
  const [bigReveal, setBigReveal] = useState<BigReveal | null>(null);

  const alive = state.players.filter((p) => p.alive);
  const night = state.nightCount;
  const victimPlayer = state.nightVictimId ? state.players.find((p) => p.id === state.nightVictimId) : null;

  const roleName = (rid: RoleId) => { const rd = ROLES_DATA[rid]; return rd ? rd.name : ''; };
  const isWolfRole = (rid: RoleId) => { const rd = ROLES_DATA[rid]; return !!rd && (rd.team === 'loupgarou' || rd.team === 'loupblanc'); };
  const pById = (id: number) => state.players.find((p) => p.id === id);
  const optLabel = (p: Player, reveal?: boolean) => 'J' + p.id + (reveal ? ' - ' + roleName(p.role) : '');

  const record = (roleId: RoleId, targetIds?: number[], note?: string) =>
    dispatch({ type: 'RECORD_ACTION', night, roleId, targetIds: targetIds || [], note: note || '' });
  const getRec = (roleId: RoleId) => state.nightActions.find((a) => a.night === night && a.roleId === roleId);
  const recTargets = (roleId: RoleId) => { const r = getRec(roleId); return r ? r.targetIds : []; };

  function cancelAction(roleId: RoleId) {
    const t = recTargets(roleId);
    if (roleId === 'LOUP_GAROU' || roleId === 'LOUP_BLANC') dispatch({ type: 'CLEAR_NIGHT_VICTIM' });
    else if (roleId === 'SALVATEUR') dispatch({ type: 'CLEAR_NIGHT_FLAG', flag: 'protected', playerIds: t });
    else if (roleId === 'CORBEAU') dispatch({ type: 'CLEAR_NIGHT_FLAG', flag: 'cursed', playerIds: t });
    else if (roleId === 'JOUEUR_FLUTE') dispatch({ type: 'CLEAR_NIGHT_FLAG', flag: 'enchanted', playerIds: t });
    else if (roleId === 'ENFANT_SAUVAGE') dispatch({ type: 'SET_ENFANT_MODEL', modelId: null as unknown as number });
    else if (roleId === 'CHIEN_LOUP') dispatch({ type: 'SET_CHIENLOUP_CAMP', camp: null });
    else if (roleId === 'DEMENAGEUR') { const dr = getRec('DEMENAGEUR'); if (dr && dr.note === 'SWAPPED' && t.length === 2) dispatch({ type: 'DEMENAGEUR_SWAP', playerIds: [t[0], t[1]] }); }
    else if (roleId === 'SORCIERE') {
      if (!state.witchDeathPotion) dispatch({ type: 'WITCH_UNDO_DEATH' });
      if (!state.witchLifePotion) dispatch({ type: 'WITCH_UNDO_LIFE', victimId: recTargets('LOUP_GAROU')[0] || recTargets('LOUP_BLANC')[0] || null });
    }
    record(roleId, []);
    setBigReveal(null);
  }

  const selectStyle: CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: '8px', background: 'rgba(22,11,30,0.95)', border: '1px solid rgba(180,30,60,0.32)', color: 'var(--text)', fontFamily: "'Crimson Text',serif", fontSize: '15px', cursor: 'pointer', appearance: 'menulist' };
  const soundPickerStyle: CSSProperties = { flexShrink: 0, maxWidth: '110px', padding: '5px 6px', borderRadius: '7px', background: 'rgba(22,11,30,0.9)', border: '1px solid rgba(180,30,60,0.28)', color: 'var(--text-muted)', fontFamily: "'Crimson Text',serif", fontSize: '12px', cursor: 'pointer', appearance: 'menulist' };
  const actBtn: CSSProperties = { padding: '9px 14px', borderRadius: '8px', cursor: 'pointer', fontFamily: "'Cinzel',serif", fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em', border: 'none' };
  const infoStyle: CSSProperties = { fontSize: '14px', color: 'var(--text-muted)', fontFamily: "'Crimson Text',serif", fontStyle: 'italic', lineHeight: 1.5 };
  const labelStyle: CSSProperties = { fontFamily: "'Cinzel',serif", fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.06em', marginBottom: '5px' };

  function PlayerSelect(props: { value: number | string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; list?: Player[]; reveal?: boolean; placeholder?: string; style?: CSSProperties }) {
    const list = props.list || alive;
    return (
      <select value={props.value === null || props.value === undefined ? '' : props.value} onChange={props.onChange} style={{ ...selectStyle, ...(props.style || {}) }}>
        <option value="">- {props.placeholder || 'Choisir un joueur'} -</option>
        {list.map((p) => <option key={p.id} value={p.id}>{optLabel(p, props.reveal)}</option>)}
      </select>
    );
  }

  function SoundPicker(props: { roleId: RoleId }) {
    const ids = Object.keys(library);
    if (ids.length === 0) {
      return <span style={{ flexShrink: 0, fontFamily: "'Crimson Text',serif", fontSize: '11px', color: 'var(--text-dim)', fontStyle: 'italic', maxWidth: '90px', textAlign: 'right' }}>aucun son charge</span>;
    }
    return (
      <select value="" title="Jouer un son manuellement"
        onChange={(e) => { if (e.target.value) playSound('role_' + props.roleId, e.target.value); e.target.value = ''; }}
        style={soundPickerStyle}>
        <option value="">♪ Son…</option>
        {ids.map((id) => <option key={id} value={id}>{library[id].name}</option>)}
      </select>
    );
  }

  function MultiPick(props: { roleId: RoleId; count: number; reveal?: boolean; labels?: string[]; onPick?: (next: number[], val: string) => void }) {
    const roleId = props.roleId;
    const n = props.count;
    const current = recTargets(roleId);
    function setAt(idx: number, val: string) {
      let next = current.slice();
      if (val === '') next.splice(idx, 1);
      else next[idx] = parseInt(val, 10);
      next = next.filter((v, i, arr) => arr.indexOf(v) === i);
      record(roleId, next);
      if (props.onPick) props.onPick(next, val);
    }
    const slots = [];
    for (let k = 0; k < n; k++) {
      const idx = k;
      const val = current[idx] !== undefined ? current[idx] : '';
      const taken = current.filter((v, i) => i !== idx);
      const list = alive.filter((p) => taken.indexOf(p.id) === -1);
      slots.push(
        <PlayerSelect key={idx} value={val} list={list} reveal={props.reveal}
          placeholder={(props.labels && props.labels[idx]) || ('Joueur ' + (idx + 1))}
          onChange={(e) => setAt(idx, e.target.value)} />,
      );
    }
    return <div style={{ display: 'grid', gridTemplateColumns: n > 1 ? '1fr 1fr' : '1fr', gap: '8px' }}>{slots}</div>;
  }

  const ACTION_LABEL: Record<string, string> = {
    VOLEUR: 'Vole une carte', LOUP_GAROU: 'Designe une victime', GRAND_MECHANT_LOUP: '2eme victime',
    LOUP_BLANC: 'Elimine un Loup', VOYANTE: 'Sonde un joueur', SORCIERE: 'Potions',
    CUPIDON: 'Lie 2 amoureux', SALVATEUR: 'Protege un joueur', CORBEAU: 'Maudit un joueur',
    JOUEUR_FLUTE: 'Enchante', FOSSOYEUR: 'Exhume un mort', RENARD: 'Sonde 1 + voisins',
    DEMENAGEUR: 'Echange 2 joueurs', SOEUR_1: 'Reconnaissance', CHIEN_LOUP: 'Loup ou Chien',
    ENFANT_SAUVAGE: 'Choisit un modele', MONTREUR_OURS: "Grognement a l'aube",
  };

  function actionControls(roleId: RoleId) {
    if (roleId === 'DEMENAGEUR') {
      const demP = alive.find((p) => p.role === 'DEMENAGEUR');
      const dPicks = recTargets('DEMENAGEUR');
      const dRec = getRec('DEMENAGEUR');
      if (dRec && dRec.note === 'SWAPPED' && dPicks.length === 2) {
        return <div style={infoStyle}>📦 Numeros echanges cette nuit : <strong style={{ color: 'var(--text)' }}>J{dPicks[0]} ⇄ J{dPicks[1]}</strong> (chacun garde son role)</div>;
      }
      const swapList = alive.filter((p) => !demP || p.id !== demP.id);
      const dSet = (idx: number, val: string) => {
        let next = dPicks.slice();
        if (val === '') next.splice(idx, 1); else next[idx] = parseInt(val, 10);
        next = next.filter((v, i, arr) => arr.indexOf(v) === i);
        record('DEMENAGEUR', next);
      };
      const dslots = [];
      for (let di = 0; di < 2; di++) {
        const idx = di;
        const val = dPicks[idx] !== undefined ? dPicks[idx] : '';
        const taken = dPicks.filter((v, i) => i !== idx);
        const list = swapList.filter((p) => taken.indexOf(p.id) === -1);
        dslots.push(<PlayerSelect key={idx} value={val} list={list} placeholder={idx === 0 ? '1er joueur' : '2eme joueur'} onChange={(e) => dSet(idx, e.target.value)} />);
      }
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>{dslots}</div>
          {dPicks.length === 2 && (
            <button onClick={() => { dispatch({ type: 'DEMENAGEUR_SWAP', playerIds: [dPicks[0], dPicks[1]] }); record('DEMENAGEUR', [dPicks[0], dPicks[1]], 'SWAPPED'); playSound('role_DEMENAGEUR'); }}
              style={{ ...actBtn, alignSelf: 'flex-start', background: 'rgba(148,163,184,0.18)', border: '1px solid rgba(148,163,184,0.5)', color: '#cbd5e1' }}>
              📦 Echanger J{dPicks[0]} ⇄ J{dPicks[1]}
            </button>
          )}
        </div>
      );
    }

    if (roleId === 'VOLEUR') {
      const thief = alive.find((p) => p.role === 'VOLEUR');
      const vRec = getRec('VOLEUR');
      if (vRec && vRec.targetIds.length > 0 && vRec.note) {
        const stolenRoleId = vRec.note as RoleId;
        const srd = ROLES_DATA[stolenRoleId];
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '11px', padding: '10px 13px', borderRadius: '9px', background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.4)' }}>
              <span style={{ fontSize: '26px', lineHeight: 1 }}>{srd && srd.emoji}</span>
              <div>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>Joueur {vRec.targetIds[0]}</div>
                <div style={{ fontFamily: "'Crimson Text',serif", fontSize: '13px', color: srd && srd.color }}>{srd && srd.name}</div>
              </div>
            </div>
            <button onClick={() => setBigReveal({ playerId: vRec.targetIds[0], roleId: stolenRoleId, title: 'Le Voleur devient…' })}
              style={{ ...actBtn, alignSelf: 'flex-start', background: 'rgba(124,58,237,0.16)', border: '1px solid rgba(124,58,237,0.5)', color: '#c4b5fd' }}>
              🎭 Montrer la carte au Voleur
            </button>
          </div>
        );
      }
      const stealList = alive.filter((p) => !thief || p.id !== thief.id);
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <PlayerSelect value={thiefTarget} list={stealList} reveal placeholder="Joueur a voler" onChange={(e) => setThiefTarget(e.target.value)} />
          {thiefTarget && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => { const id = parseInt(thiefTarget, 10); setBigReveal({ playerId: id, title: 'Carte du Joueur ' + id }); }}
                style={{ ...actBtn, background: 'rgba(167,139,250,0.16)', border: '1px solid rgba(167,139,250,0.5)', color: '#c4b5fd' }}>
                👁️ Montrer
              </button>
              <button onClick={() => {
                const id = parseInt(thiefTarget, 10);
                const targetP = state.players.find((p) => p.id === id);
                const stolenRole = targetP ? targetP.role : null;
                record('VOLEUR', [id], stolenRole || '');
                dispatch({ type: 'STEAL_ROLE', playerId: id });
                playSound('role_VOLEUR');
                setThiefTarget('');
              }}
                style={{ ...actBtn, background: 'rgba(124,58,237,0.18)', border: '1px solid rgba(124,58,237,0.5)', color: '#c4b5fd' }}>
                🎭 Voler la carte
              </button>
            </div>
          )}
        </div>
      );
    }

    if (roleId === 'LOUP_GAROU') {
      const preyList = alive.filter((p) => !isWolfRole(p.role));
      return (
        <PlayerSelect value={state.nightVictimId || ''} list={preyList} reveal placeholder="Victime des Loups"
          onChange={(e) => {
            const v = e.target.value;
            if (v) { const id = parseInt(v, 10); dispatch({ type: 'SET_NIGHT_VICTIM', playerId: id }); record('LOUP_GAROU', [id]); playSound('wolf_howl'); }
            else { dispatch({ type: 'CLEAR_NIGHT_VICTIM' }); record('LOUP_GAROU', []); }
          }} />
      );
    }

    if (roleId === 'GRAND_MECHANT_LOUP') {
      const gmlList = alive.filter((p) => p.id !== state.nightVictimId && !isWolfRole(p.role));
      return (
        <PlayerSelect value={recTargets('GRAND_MECHANT_LOUP')[0] || ''} list={gmlList} reveal placeholder="2eme victime (si aucun LG mort)"
          onChange={(e) => { const v = e.target.value; record('GRAND_MECHANT_LOUP', v ? [parseInt(v, 10)] : []); }} />
      );
    }

    if (roleId === 'LOUP_BLANC') {
      const lgList = alive.filter((p) => p.role === 'LOUP_GAROU' || p.role === 'GRAND_MECHANT_LOUP');
      if (lgList.length === 0) return <div style={infoStyle}>Aucun Loup-Garou vivant a eliminer.</div>;
      return (
        <PlayerSelect value={state.nightVictimId || ''} list={lgList} placeholder="Loup a eliminer"
          onChange={(e) => { const v = e.target.value; if (v) { const id = parseInt(v, 10); dispatch({ type: 'SET_NIGHT_VICTIM', playerId: id }); record('LOUP_BLANC', [id]); } }} />
      );
    }

    if (roleId === 'VOYANTE') {
      const vSel = recTargets('VOYANTE')[0];
      if (vSel) {
        const vp = pById(vSel);
        const vrd = vp ? ROLES_DATA[vp.role] : null;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '11px', padding: '10px 13px', borderRadius: '9px', background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.4)' }}>
              <span style={{ fontSize: '26px', lineHeight: 1 }}>{vrd && vrd.emoji}</span>
              <div>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>Joueur {vSel}</div>
                <div style={{ fontFamily: "'Crimson Text',serif", fontSize: '13px', color: vrd ? vrd.color : undefined }}>{vrd && vrd.name}</div>
              </div>
            </div>
            <button onClick={() => setBigReveal({ playerId: vSel, title: 'Vision de la Voyante' })}
              style={{ ...actBtn, alignSelf: 'flex-start', background: 'rgba(167,139,250,0.16)', border: '1px solid rgba(167,139,250,0.5)', color: '#c4b5fd' }}>
              👁️ Montrer en grand a la Voyante
            </button>
          </div>
        );
      }
      const probedNights: Record<number, number[]> = {};
      state.nightActions.filter((a) => a.roleId === 'VOYANTE').forEach((a) => {
        a.targetIds.forEach((id) => { if (!probedNights[id]) probedNights[id] = []; if (probedNights[id].indexOf(a.night) === -1) probedNights[id].push(a.night); });
      });
      return (
        <select value="" style={selectStyle}
          onChange={(e) => { const v = e.target.value; if (v) { const id = parseInt(v, 10); record('VOYANTE', [id]); playSound('seer_vision'); setBigReveal({ playerId: id, title: 'Vision de la Voyante' }); } }}>
          <option value="">- Joueur a sonder -</option>
          {alive.map((p) => {
            const pn = probedNights[p.id];
            const mark = pn && pn.length ? '  · 👁️ deja sonde (N' + pn.sort((a, b) => a - b).join(', N') + ')' : '';
            return <option key={p.id} value={p.id}>{'J' + p.id + ' - ' + roleName(p.role) + mark}</option>;
          })}
        </select>
      );
    }

    if (roleId === 'SORCIERE') {
      const wolfVictimId = recTargets('LOUP_GAROU')[0] || recTargets('LOUP_BLANC')[0] || null;
      const undoBtn: CSSProperties = { ...actBtn, alignSelf: 'flex-start', padding: '6px 11px', fontSize: '11px', background: 'transparent', border: '1px solid rgba(239,68,68,0.4)', color: 'rgba(239,68,68,0.85)' };
      const undoWitchDeath = () => {
        dispatch({ type: 'WITCH_UNDO_DEATH' });
        if (!state.witchLifePotion && wolfVictimId !== null) record('SORCIERE', [wolfVictimId], 'Sauve J' + wolfVictimId);
        else record('SORCIERE', []);
      };
      const undoWitchLife = () => {
        dispatch({ type: 'WITCH_UNDO_LIFE', victimId: wolfVictimId });
        if (!state.witchDeathPotion) { const dr = getRec('SORCIERE'); record('SORCIERE', dr ? dr.targetIds : [], dr ? dr.note : ''); }
        else record('SORCIERE', []);
      };
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <div style={labelStyle}>💊 Potion de vie</div>
            {state.witchLifePotion
              ? victimPlayer
                ? <button onClick={() => { record('SORCIERE', [victimPlayer.id], 'Sauve J' + victimPlayer.id); dispatch({ type: 'WITCH_USE_LIFE' }); playSound('witch_brew'); }}
                    style={{ ...actBtn, alignSelf: 'flex-start', background: 'rgba(52,211,153,0.14)', border: '1px solid rgba(52,211,153,0.45)', color: '#34d399' }}>
                    Sauver J{victimPlayer.id}
                  </button>
                : <div style={infoStyle}>Aucune victime a sauver cette nuit.</div>
              : <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={infoStyle}>✓ Potion de vie utilisee{state.witchLifeInfo && state.witchLifeInfo.targetId !== null && state.witchLifeInfo.targetId !== undefined ? ' (J' + state.witchLifeInfo.targetId + ' sauve, nuit ' + state.witchLifeInfo.night + ')' : ''}.</div>
                  {state.witchLifeInfo && state.witchLifeInfo.night === night && (<button onClick={undoWitchLife} style={undoBtn}>↺ Annuler le sauvetage</button>)}
                </div>}
          </div>
          <div>
            <div style={labelStyle}>☠️ Potion de mort</div>
            {state.witchDeathPotion
              ? <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <PlayerSelect value={witchDeath} reveal placeholder="Cible de la potion de mort" onChange={(e) => setWitchDeath(e.target.value)} />
                  {witchDeath && (
                    <button onClick={() => { const id = parseInt(witchDeath, 10); record('SORCIERE', recTargets('SORCIERE').concat([id]), 'Empoisonne J' + id); dispatch({ type: 'WITCH_USE_DEATH', playerId: id }); playSound('witch_brew'); setWitchDeath(''); }}
                      style={{ ...actBtn, alignSelf: 'flex-start', background: 'rgba(239,68,68,0.14)', border: '1px solid rgba(239,68,68,0.45)', color: '#ef4444' }}>
                      Empoisonner J{witchDeath}
                    </button>
                  )}
                </div>
              : <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={infoStyle}>{state.witchDeathInfo ? '✓ Potion de mort deja utilisee - nuit ' + state.witchDeathInfo.night + ', sur J' + state.witchDeathInfo.targetId + ' (une seule fois par partie).' : '✓ Potion de mort utilisee.'}</div>
                  {state.witchDeathInfo && state.witchDeathInfo.night === night && (<button onClick={undoWitchDeath} style={undoBtn}>↺ Annuler / reactiver la potion</button>)}
                </div>}
          </div>
        </div>
      );
    }

    if (roleId === 'CUPIDON') {
      const lovers = state.players.filter((p) => p.lovers !== null && p.lovers !== undefined);
      if (lovers.length === 2) {
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={infoStyle}>❤️ Amoureux lies : <strong style={{ color: '#f472b6', fontStyle: 'normal' }}>J{lovers[0].id} &amp; J{lovers[1].id}</strong> - si l'un meurt, l'autre meurt aussitot.</div>
            <button onClick={() => { dispatch({ type: 'UNLINK_LOVERS' }); record('CUPIDON', []); }}
              style={{ ...actBtn, alignSelf: 'flex-start', background: 'rgba(180,30,60,0.12)', border: '1px solid rgba(180,30,60,0.4)', color: 'var(--text-muted)' }}>
              ↺ Modifier les amoureux
            </button>
          </div>
        );
      }
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <MultiPick roleId="CUPIDON" count={2} labels={['Amoureux 1', 'Amoureux 2']}
            onPick={(next) => { if (next.length === 2) dispatch({ type: 'CONFIRM_LOVERS', playerIds: [next[0], next[1]] }); }} />
          <div style={{ ...infoStyle, fontSize: '12px' }}>Le lien est cree des que les deux amoureux sont choisis.</div>
        </div>
      );
    }

    if (roleId === 'SALVATEUR') {
      const prot = alive.find((p) => p.protected);
      return (
        <PlayerSelect value={prot ? prot.id : ''} placeholder="Joueur a proteger"
          onChange={(e) => { const v = e.target.value; if (v) { const id = parseInt(v, 10); dispatch({ type: 'PROTECT_PLAYER', playerId: id }); record('SALVATEUR', [id]); } }} />
      );
    }

    if (roleId === 'CORBEAU') {
      const curs = alive.find((p) => p.cursed);
      return (
        <PlayerSelect value={curs ? curs.id : ''} placeholder="Joueur a maudire"
          onChange={(e) => { const v = e.target.value; if (v) { const id = parseInt(v, 10); dispatch({ type: 'CURSE_PLAYER', playerId: id }); record('CORBEAU', [id]); } }} />
      );
    }

    if (roleId === 'JOUEUR_FLUTE') {
      const fcount = state.players.length > 15 ? 2 : 1;
      const picks = recTargets('JOUEUR_FLUTE');
      const enchantedList = state.players.filter((p) => p.enchanted);
      const fSet = (idx: number, val: string) => {
        let next = picks.slice();
        if (val === '') next.splice(idx, 1); else next[idx] = parseInt(val, 10);
        next = next.filter((v, i, arr) => arr.indexOf(v) === i);
        record('JOUEUR_FLUTE', next);
        if (val !== '') dispatch({ type: 'CHARM_PLAYER', playerId: parseInt(val, 10) });
      };
      const slots = [];
      for (let k = 0; k < fcount; k++) {
        const idx = k;
        const val = picks[idx] !== undefined ? picks[idx] : '';
        const taken = picks.filter((v, i) => i !== idx);
        slots.push(
          <select key={idx} value={val} style={selectStyle} onChange={(e) => fSet(idx, e.target.value)}>
            <option value="">- Enchante {idx + 1} -</option>
            {alive.map((p) => {
              const priorEnch = p.enchanted && picks.indexOf(p.id) === -1;
              const disabled = (taken.indexOf(p.id) !== -1) || priorEnch;
              return <option key={p.id} value={p.id} disabled={disabled}>{'J' + p.id + (p.enchanted ? ' ✓ deja enchante' : '')}</option>;
            })}
          </select>,
        );
      }
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: fcount > 1 ? '1fr 1fr' : '1fr', gap: '8px' }}>{slots}</div>
          {enchantedList.length > 0 && (
            <div style={{ fontSize: '13px', color: '#fcd34d', fontFamily: "'Crimson Text',serif" }}>
              🎵 Enchantes ({enchantedList.length}/{state.players.length}) : {enchantedList.map((p) => 'J' + p.id).join(', ')}
            </div>
          )}
        </div>
      );
    }

    if (roleId === 'FOSSOYEUR') {
      const nightDeaths = state.deaths.filter((d) => d.night === night);
      const lastId = state.nightVictimId || (nightDeaths.length ? nightDeaths[nightDeaths.length - 1].playerId : null);
      const digger = state.players.find((p) => p.alive && (p.role === 'FOSSOYEUR' || (p.diggerRole !== null && p.diggerRole !== undefined)));
      const heldRole = digger && digger.diggerRole ? ROLES_DATA[digger.diggerRole] : null;
      const lp = lastId ? pById(lastId) : null;
      const corpseIsDigger = digger && lp && lp.id === digger.id;
      const lrd = lp ? ROLES_DATA[lp.role] : null;
      const fRec = getRec('FOSSOYEUR');
      const fTaken = fRec && fRec.note === 'PRIS';
      const fRefused = fRec && (fRec.note === 'REFUSE' || fRec.note === 'GARDE');

      const heldBanner = heldRole ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '9px', background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.3)' }}>
          <span style={{ fontSize: '20px' }}>{heldRole.emoji}</span>
          <span style={{ fontFamily: "'Crimson Text',serif", fontSize: '14px', color: 'var(--text)' }}>Pouvoir actuel : <strong style={{ color: heldRole.color }}>{heldRole.name}</strong> <span style={{ color: 'var(--text-muted)' }}>- il agit avec ce pouvoir dans la rubrique « {heldRole.plural || heldRole.name} » de cette nuit.</span></span>
        </div>
      ) : null;

      if (!lastId || corpseIsDigger) {
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {heldBanner}
            <div style={infoStyle}>{heldRole ? 'Aucun nouveau mort a exhumer cette nuit - le Fossoyeur conserve le pouvoir du ' + heldRole.name + '.' : "Aucun mort cette nuit pour l'instant - designez d'abord la victime des Loups."}</div>
          </div>
        );
      }
      if (lp && lp.protected) {
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {heldBanner}
            <div style={infoStyle}>🛡️ Joueur {lastId} est protege cette nuit - il ne mourra pas, le Fossoyeur ne peut rien exhumer.</div>
          </div>
        );
      }
      const takeLabel = heldRole ? (fTaken ? '✓ Nouveau role pris' : '⛏️ Prendre J' + lastId) : (fTaken ? '✓ Role pris' : '⛏️ Pris');
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {heldBanner}
          <div style={infoStyle}>Mort de la nuit : <strong style={{ color: 'var(--text)' }}>Joueur {lastId}</strong>{heldRole ? ' - il peut echanger son pouvoir contre celui-ci.' : ''}</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={() => setBigReveal({ playerId: lastId, title: 'Exhumation du Fossoyeur' })}
              style={{ ...actBtn, background: 'rgba(167,139,250,0.16)', border: '1px solid rgba(167,139,250,0.5)', color: '#c4b5fd' }}>
              👁️ Montrer
            </button>
            <button onClick={() => { record('FOSSOYEUR', [lastId], 'PRIS'); dispatch({ type: 'GRAVEDIGGER_TAKE_ROLE', playerId: lastId }); playSound('role_FOSSOYEUR'); }}
              style={{ ...actBtn, background: fTaken ? 'rgba(52,211,153,0.18)' : 'rgba(120,113,108,0.18)', border: '1px solid ' + (fTaken ? 'rgba(52,211,153,0.5)' : 'rgba(120,113,108,0.5)'), color: fTaken ? '#34d399' : '#c9beb4' }}>
              {takeLabel}
            </button>
            <button onClick={() => record('FOSSOYEUR', [lastId], heldRole ? 'GARDE' : 'REFUSE')}
              style={{ ...actBtn, background: fRefused ? 'rgba(239,68,68,0.16)' : 'rgba(120,113,108,0.18)', border: '1px solid ' + (fRefused ? 'rgba(239,68,68,0.5)' : 'rgba(120,113,108,0.5)'), color: fRefused ? '#f87171' : '#c9beb4' }}>
              {heldRole ? (fRefused ? '✓ Pouvoir garde' : '↺ Garder ' + heldRole.name) : (fRefused ? '✓ Refuse' : '✕ Refuse')}
            </button>
          </div>
          {fTaken && lrd && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '9px', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.32)' }}>
              <span style={{ fontSize: '22px' }}>{lrd.emoji}</span>
              <span style={{ fontFamily: "'Crimson Text',serif", fontSize: '14px', color: 'var(--text)' }}>Le Fossoyeur devient <strong style={{ color: lrd.color }}>{lrd.name}</strong></span>
            </div>
          )}
          {fRefused && (<div style={infoStyle}>{heldRole ? 'Le Fossoyeur garde le pouvoir du ' + heldRole.name + '.' : 'Le Fossoyeur a refuse le role - il reste Fossoyeur.'}</div>)}
        </div>
      );
    }

    if (roleId === 'RENARD') {
      const chosenId = recTargets('RENARD')[0];
      let resultLine = null;
      if (chosenId) {
        const order = state.players.slice().sort((a, b) => a.id - b.id);
        const n = order.length;
        const idx = order.findIndex((p) => p.id === chosenId);
        if (idx !== -1) {
          const left = order[(idx - 1 + n) % n];
          const right = order[(idx + 1) % n];
          const trio = [left, order[idx], right];
          const wolf = trio.some((p) => isWolfRole(p.role));
          resultLine = (
            <div style={{ fontSize: '14px', fontFamily: "'Crimson Text',serif", color: wolf ? '#ef4444' : '#34d399' }}>
              🦊 Scan : J{left.id} · <strong>J{order[idx].id}</strong> · J{right.id} → {wolf ? 'un Loup est present' : 'aucun Loup'}
            </div>
          );
        }
      }
      const foxProbed: Record<number, number[]> = {};
      state.nightActions.filter((a) => a.roleId === 'RENARD').forEach((a) => {
        a.targetIds.forEach((id) => { if (!foxProbed[id]) foxProbed[id] = []; if (foxProbed[id].indexOf(a.night) === -1) foxProbed[id].push(a.night); });
      });
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <select value={chosenId || ''} style={selectStyle}
            onChange={(e) => {
              const v = e.target.value;
              if (!v) { record('RENARD', []); return; }
              const id = parseInt(v, 10);
              const ord = state.players.slice().sort((a, b) => a.id - b.id);
              const i = ord.findIndex((p) => p.id === id);
              const nn = ord.length;
              const note = 'J' + ord[(i - 1 + nn) % nn].id + ' · J' + id + ' · J' + ord[(i + 1) % nn].id;
              record('RENARD', [id], note);
            }}>
            <option value="">- Joueur central a sonder -</option>
            {alive.map((p) => {
              const pn = foxProbed[p.id];
              const mark = pn && pn.length ? '  · 🦊 deja sonde (N' + pn.sort((a, b) => a - b).join(', N') + ')' : '';
              return <option key={p.id} value={p.id}>{'J' + p.id + mark}</option>;
            })}
          </select>
          {resultLine}
        </div>
      );
    }

    if (roleId === 'ENFANT_SAUVAGE') {
      const modelCandidates = alive.filter((p) => ['MONTREUR_OURS', 'RENARD', 'LOUP_GAROU', 'GRAND_MECHANT_LOUP'].indexOf(p.role) !== -1 && p.role !== 'ENFANT_SAUVAGE');
      const curModel = recTargets('ENFANT_SAUVAGE')[0];
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <PlayerSelect value={curModel || ''} list={modelCandidates} reveal placeholder="Modele de l'Enfant Sauvage"
            onChange={(e) => { const v = e.target.value; record('ENFANT_SAUVAGE', v ? [parseInt(v, 10)] : []); dispatch({ type: 'SET_ENFANT_MODEL', modelId: v ? parseInt(v, 10) : (null as unknown as number) }); }} />
          <div style={infoStyle}>A la mort du modele, l'Enfant Sauvage devient Loup-Garou.</div>
        </div>
      );
    }

    if (roleId === 'CHIEN_LOUP') {
      const clPlayer = state.players.find((p) => p.role === 'CHIEN_LOUP' || p.originRole === 'CHIEN_LOUP');
      const clCamp = clPlayer ? clPlayer.clCamp : null;
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <select value={clCamp || ''} style={selectStyle}
            onChange={(e) => { const v = e.target.value as 'Loup' | 'Village' | ''; dispatch({ type: 'SET_CHIENLOUP_CAMP', camp: v || null }); record('CHIEN_LOUP', [], v === 'Loup' ? 'Loup (Loups-Garous)' : v === 'Village' ? 'Chien (Village)' : ''); }}>
            <option value="">- Choisir son camp -</option>
            <option value="Village">🏡 Chien - rejoint le Village</option>
            <option value="Loup">🐺 Loup - rejoint les Loups</option>
          </select>
          {clCamp && clPlayer && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '9px 12px', borderRadius: '9px', background: clCamp === 'Loup' ? 'rgba(239,68,68,0.12)' : 'rgba(92,158,255,0.12)', border: '1px solid ' + (clCamp === 'Loup' ? 'rgba(239,68,68,0.4)' : 'rgba(92,158,255,0.4)') }}>
              <span style={{ fontSize: '18px' }}>{clCamp === 'Loup' ? '🐺' : '🏡'}</span>
              <span style={{ fontFamily: "'Crimson Text',serif", fontSize: '14px', color: 'var(--text)' }}>
                Chien-Loup <strong>J{clPlayer.id}</strong> → camp <strong style={{ color: clCamp === 'Loup' ? '#ef4444' : '#5c9eff' }}>{clCamp === 'Loup' ? 'Loup' : 'Villageois'}</strong>
              </span>
            </div>
          )}
        </div>
      );
    }

    if (roleId === 'SOEUR_1') {
      const sisters = state.players.filter((p) => (p.role === 'SOEUR_1' || p.role === 'SOEUR_2') && p.alive);
      return <div style={infoStyle}>Les Soeurs se reconnaissent : {sisters.map((p) => 'J' + p.id).join(' & ') || '-'}</div>;
    }

    const role = ROLES_DATA[roleId];
    return <div style={infoStyle}>{role.nightInstruction || role.description}</div>;
  }

  const NO_SOUND_ROLES = ['ENFANT_SAUVAGE', 'SOEUR_1', 'SOEUR_2', 'LOUP_BLANC', 'SALVATEUR'];

  function renderRow(roleId: RoleId) {
    const role = ROLES_DATA[roleId];
    if (!role) return null;
    const rolePlaying = playingEventId === ('role_' + roleId);
    const rec = getRec(roleId);
    const done = rec && (rec.targetIds.length > 0 || rec.note);
    const rolePlayers = state.players.filter((p) => {
      if (!p.alive) return false;
      if (p.role === roleId) return true;
      if (roleId === 'FOSSOYEUR' && p.diggerRole !== null && p.diggerRole !== undefined) return true;
      if (roleId === 'CHIEN_LOUP' && p.originRole === 'CHIEN_LOUP') return true;
      return false;
    });
    const noSound = NO_SOUND_ROLES.indexOf(roleId) !== -1;
    return (
      <div key={roleId} style={{ flexShrink: 0, background: 'rgba(8,3,14,0.96)', border: '1.5px solid ' + (role.color + (done ? 'aa' : '88')), borderRadius: '13px', overflow: 'hidden', boxShadow: done ? '0 4px 18px rgba(0,0,0,0.55), 0 0 0 1px ' + role.color + '55, inset 0 0 22px rgba(52,211,153,0.12)' : '0 4px 18px rgba(0,0,0,0.55), 0 0 0 1px ' + role.color + '3a, inset 0 0 22px ' + role.color + '12' }}>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px', rowGap: '8px', padding: '12px 13px', background: role.bgColor, borderBottom: '1.5px solid ' + (role.color + '7a') }}>
          <span style={{ fontSize: '24px', lineHeight: 1, flexShrink: 0 }}>{role.emoji}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: '15px', fontWeight: 700, color: role.color }}>{role.plural || role.name}</div>
            {rolePlayers.length > 0 && (
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', color: role.color, opacity: 0.7, marginTop: '2px' }}>
                {rolePlayers.map((p) => 'J' + p.id + (p.clCamp ? ' (' + (p.clCamp === 'Loup' ? 'Loup' : 'Village') + ')' : '')).join(' · ')}
              </div>
            )}
          </div>
          {done && <span style={{ fontSize: '14px', flexShrink: 0 }}>✓</span>}
          {done && (
            <button onClick={() => cancelAction(roleId)}
              style={{ flexShrink: 0, padding: '4px 9px', background: 'transparent', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '7px', cursor: 'pointer', fontFamily: "'Cinzel',serif", fontSize: '10px', color: '#ef4444', letterSpacing: '0.04em' }}>
              Annuler
            </button>
          )}
          <span style={{ fontFamily: "'Cinzel',serif", fontSize: '10px', fontWeight: 600, letterSpacing: '0.04em', color: role.color, background: role.color + '1e', border: '1px solid ' + (role.color + '44'), padding: '4px 8px', borderRadius: '7px', flexShrink: 0, textAlign: 'center' }}>
            {ACTION_LABEL[roleId] || 'Information'}
          </span>
          {!noSound && <SoundPicker roleId={roleId} />}
          {!noSound && (
            <button onClick={() => playSound('role_' + roleId)}
              style={{ flexShrink: 0, width: '34px', height: '32px', background: rolePlaying ? role.color + '26' : 'transparent', border: '1px solid ' + (rolePlaying ? role.color + '66' : 'rgba(180,30,60,0.28)'), borderRadius: '7px', cursor: 'pointer', fontSize: '12px', color: rolePlaying ? role.color : 'var(--text-muted)' }}>
              {rolePlaying ? '■' : '▶'}
            </button>
          )}
        </div>
        <div style={{ padding: '14px 13px', background: 'rgba(3,1,7,0.55)' }}>{actionControls(roleId)}</div>
      </div>
    );
  }

  function renderSisterRevenge() {
    const sisters = state.players.filter((p) => p.role === 'SOEUR_1' || p.role === 'SOEUR_2');
    if (sisters.length < 2) return null;
    const aliveS = sisters.filter((p) => p.alive);
    const deadS = sisters.filter((p) => !p.alive);
    if (deadS.length === 0 || aliveS.length === 0) return null;
    const info = state.sisterRevengeInfo;
    const usedThisNight = info && info.night === night;
    if (state.sisterRevengeUsed && !usedThisNight) return null;
    const clr = '#f9a8d4';
    const targets = state.players.filter((p) => p.alive && aliveS.indexOf(p) === -1);
    return (
      <div style={{ flexShrink: 0, background: 'rgba(8,3,14,0.96)', border: '1px solid rgba(249,168,212,0.45)', borderRadius: '13px', overflow: 'hidden', boxShadow: usedThisNight ? '0 3px 16px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(52,211,153,0.32)' : '0 3px 16px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(249,168,212,0.18)' }}>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px', rowGap: '8px', padding: '12px 13px', background: 'rgba(249,168,212,0.09)', borderBottom: '1px solid rgba(249,168,212,0.45)' }}>
          <span style={{ fontSize: '24px', lineHeight: 1, flexShrink: 0 }}>👩‍❤️‍👧</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: '15px', fontWeight: 700, color: clr }}>Soeur survivante - Vengeance</div>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', color: clr, opacity: 0.75, marginTop: '2px' }}>
              survivante {aliveS.map((p) => 'J' + p.id).join(' · ')} · soeur perdue {deadS.map((p) => 'J' + p.id).join(' · ')}
            </div>
          </div>
          {usedThisNight && <span style={{ fontSize: '14px', flexShrink: 0 }}>✓</span>}
          <span style={{ fontFamily: "'Cinzel',serif", fontSize: '10px', fontWeight: 600, letterSpacing: '0.04em', color: clr, background: clr + '1e', border: '1px solid ' + (clr + '44'), padding: '4px 8px', borderRadius: '7px', flexShrink: 0, textAlign: 'center' }}>1× par partie</span>
        </div>
        <div style={{ padding: '14px 13px', background: 'rgba(3,1,7,0.55)' }}>
          {usedThisNight && info ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={infoStyle}>☠️ La Soeur survivante elimine <strong style={{ color: 'var(--text)', fontStyle: 'normal' }}>J{info.targetId}</strong> par vengeance - revele a l'aube.</div>
              <button onClick={() => dispatch({ type: 'SISTER_REVENGE_UNDO' })}
                style={{ ...actBtn, alignSelf: 'flex-start', padding: '6px 11px', fontSize: '11px', background: 'transparent', border: '1px solid rgba(239,68,68,0.4)', color: 'rgba(239,68,68,0.85)' }}>↺ Annuler la vengeance</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={infoStyle}>Une Soeur est morte - la survivante peut tuer <strong style={{ color: 'var(--text)', fontStyle: 'normal' }}>une seule fois dans la partie</strong> par vengeance.</div>
              <select value="" style={selectStyle}
                onChange={(e) => { const v = e.target.value; if (v) { dispatch({ type: 'SISTER_REVENGE', playerId: parseInt(v, 10) }); playSound('death_night'); } }}>
                <option value="">- Cible de la vengeance -</option>
                {targets.map((p) => <option key={p.id} value={p.id}>{'J' + p.id + ' - ' + roleName(p.role)}</option>)}
              </select>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {bigReveal && (() => {
        const bp = pById(bigReveal.playerId);
        const brd = bigReveal.roleId ? ROLES_DATA[bigReveal.roleId] : (bp ? ROLES_DATA[bp.role] : null);
        if (!brd) return null;
        return (
          <div onClick={() => setBigReveal(null)}
            style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(2,1,6,0.97)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', cursor: 'pointer' }}>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: '12px', letterSpacing: '0.3em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '22px', textAlign: 'center' }}>
              {bigReveal.title || 'Role revele'} · Joueur {bigReveal.playerId}
            </div>
            <div style={{ fontSize: '124px', lineHeight: 1, marginBottom: '18px' }}>{brd.emoji}</div>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: '42px', fontWeight: 700, color: brd.color, marginBottom: '14px', textAlign: 'center' }}>{brd.name}</div>
            <div style={{ fontFamily: "'Crimson Text',serif", fontSize: '18px', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', maxWidth: '500px', lineHeight: 1.55 }}>
              {brd.nightInstruction || brd.description}
            </div>
            <button style={{ marginTop: '38px', padding: '12px 32px', background: 'rgba(180,30,60,0.18)', border: '1px solid rgba(180,30,60,0.5)', borderRadius: '10px', cursor: 'pointer', fontFamily: "'Cinzel',serif", fontSize: '12px', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text)' }}>
              Fermer
            </button>
          </div>
        );
      })()}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {state.nightOrder.map(renderRow)}
        {renderSisterRevenge()}
        {state.nightOrder.length === 0 && !renderSisterRevenge() && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontFamily: "'Crimson Text',serif", fontSize: '15px', fontStyle: 'italic' }}>
            Aucun role actif cette nuit.
          </div>
        )}
      </div>

      <div style={{ padding: '10px 14px 14px', borderTop: '1px solid rgba(180,30,60,0.12)', flexShrink: 0 }}>
        <button onClick={() => { dispatch({ type: 'PROCEED_DAWN' }); playSound('death_night'); }}
          style={{ width: '100%', padding: '13px', background: 'rgba(212,160,23,0.16)', border: '1px solid rgba(212,160,23,0.5)', borderRadius: '9px', cursor: 'pointer', fontFamily: "'Cinzel',serif", fontSize: '13px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)' }}>
          ☀️ Lever du jour
        </button>
      </div>
    </div>
  );
}
