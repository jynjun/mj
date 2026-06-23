// NightPhase.jsx — Liste verticale : rôle + son manuel + action, sélection + suivi
const { useState: useStNP } = React;

function NightPhase() {
  const { state, dispatch, playSound, playingEventId } = useGame();
  const [thiefTarget, setThiefTarget] = useStNP('');
  const [witchDeath, setWitchDeath]   = useStNP('');
  const [bigReveal, setBigReveal]     = useStNP(null);

  var alive = state.players.filter(function(p) { return p.alive; });
  var night = state.nightCount;
  var victimPlayer = state.nightVictimId
    ? state.players.find(function(p) { return p.id === state.nightVictimId; })
    : null;

  function roleName(rid) { var rd = window.ROLES_DATA[rid]; return rd ? rd.name : ''; }
  function isWolfRole(rid) { var rd = window.ROLES_DATA[rid]; return rd && (rd.team === 'loupgarou' || rd.team === 'loupblanc'); }
  function pById(id) { return state.players.find(function(p) { return p.id === id; }); }
  function optLabel(p, reveal) { return 'J' + p.id + (reveal ? ' — ' + roleName(p.role) : ''); }

  function record(roleId, targetIds, note) {
    dispatch({ type: 'RECORD_ACTION', night: night, roleId: roleId, targetIds: targetIds || [], note: note || '' });
  }
  function getRec(roleId) { return state.nightActions.find(function(a) { return a.night === night && a.roleId === roleId; }); }
  function recTargets(roleId) { var r = getRec(roleId); return r ? r.targetIds : []; }

  /* Annule l'action saisie par le MJ pour ce rôle */
  function cancelAction(roleId) {
    var t = recTargets(roleId);
    if (roleId === 'LOUP_GAROU' || roleId === 'LOUP_BLANC') dispatch({ type:'CLEAR_NIGHT_VICTIM' });
    else if (roleId === 'SALVATEUR') dispatch({ type:'CLEAR_NIGHT_FLAG', flag:'protected', playerIds:t });
    else if (roleId === 'CORBEAU') dispatch({ type:'CLEAR_NIGHT_FLAG', flag:'cursed', playerIds:t });
    else if (roleId === 'JOUEUR_FLUTE') dispatch({ type:'CLEAR_NIGHT_FLAG', flag:'enchanted', playerIds:t });
    else if (roleId === 'ENFANT_SAUVAGE') dispatch({ type:'SET_ENFANT_MODEL', modelId:null });
    else if (roleId === 'CHIEN_LOUP') dispatch({ type:'SET_CHIENLOUP_CAMP', camp:null });
    else if (roleId === 'DEMENAGEUR') { var dr = getRec('DEMENAGEUR'); if (dr && dr.note === 'SWAPPED' && t.length === 2) dispatch({ type:'DEMENAGEUR_SWAP', playerIds:[t[0], t[1]] }); }
    else if (roleId === 'SORCIERE') {
      if (!state.witchDeathPotion) dispatch({ type:'WITCH_UNDO_DEATH' });
      if (!state.witchLifePotion) dispatch({ type:'WITCH_UNDO_LIFE', victimId: recTargets('LOUP_GAROU')[0] || recTargets('LOUP_BLANC')[0] || null });
    }
    record(roleId, []);
    setBigReveal(null);
  }

  /* ── Styles ── */
  var selectStyle = {
    width:'100%', padding:'10px 12px', borderRadius:'8px',
    background:'rgba(22,11,30,0.95)', border:'1px solid rgba(180,30,60,0.32)',
    color:'var(--text)', fontFamily:"'Crimson Text',serif", fontSize:'15px',
    cursor:'pointer', WebkitAppearance:'menulist', appearance:'menulist'
  };
  var soundPickerStyle = {
    flexShrink:0, maxWidth:'110px', padding:'5px 6px', borderRadius:'7px',
    background:'rgba(22,11,30,0.9)', border:'1px solid rgba(180,30,60,0.28)',
    color:'var(--text-muted)', fontFamily:"'Crimson Text',serif", fontSize:'12px',
    cursor:'pointer', WebkitAppearance:'menulist', appearance:'menulist'
  };
  var actBtn = {
    padding:'9px 14px', borderRadius:'8px', cursor:'pointer',
    fontFamily:"'Cinzel',serif", fontSize:'12px', fontWeight:600, letterSpacing:'0.05em',
    border:'none', transition:'all 0.18s'
  };
  var infoStyle  = { fontSize:'14px', color:'var(--text-muted)', fontFamily:"'Crimson Text',serif", fontStyle:'italic', lineHeight:1.5 };
  var labelStyle = { fontFamily:"'Cinzel',serif", fontSize:'11px', color:'var(--text-muted)', letterSpacing:'0.06em', marginBottom:'5px' };

  function PlayerSelect(props) {
    var list = props.list || alive;
    return (
      <select value={props.value === null || props.value === undefined ? '' : props.value}
        onChange={props.onChange} style={Object.assign({}, selectStyle, props.style || {})}>
        <option value="">— {props.placeholder || 'Choisir un joueur'} —</option>
        {list.map(function(p) {
          return <option key={p.id} value={p.id}>{optLabel(p, props.reveal)}</option>;
        })}
      </select>
    );
  }

  /* Menu de son manuel — joue immédiatement le son choisi dans la bibliothèque */
  function SoundPicker(props) {
    var ids = Object.keys(state.soundLibrary);
    if (ids.length === 0) {
      return <span style={{ flexShrink:0, fontFamily:"'Crimson Text',serif", fontSize:'11px', color:'var(--text-dim)', fontStyle:'italic', maxWidth:'90px', textAlign:'right' }}>aucun son chargé</span>;
    }
    return (
      <select value="" title="Jouer un son manuellement"
        onChange={function(e) { if (e.target.value) playSound('role_' + props.roleId, e.target.value); e.target.value = ''; }}
        style={soundPickerStyle}>
        <option value="">♪ Son…</option>
        {ids.map(function(id) { return <option key={id} value={id}>{state.soundLibrary[id].name}</option>; })}
      </select>
    );
  }

  function MultiPick(props) {
    var roleId = props.roleId, n = props.count;
    var current = recTargets(roleId);
    function setAt(idx, val) {
      var next = current.slice();
      if (val === '') next.splice(idx, 1);
      else next[idx] = parseInt(val, 10);
      next = next.filter(function(v, i, arr) { return arr.indexOf(v) === i; });
      record(roleId, next);
      if (props.onPick) props.onPick(next, val);
    }
    var slots = [];
    for (var k = 0; k < n; k++) {
      (function(idx) {
        var val = current[idx] !== undefined ? current[idx] : '';
        var taken = current.filter(function(v, i) { return i !== idx; });
        var list = alive.filter(function(p) { return taken.indexOf(p.id) === -1; });
        slots.push(
          <PlayerSelect key={idx} value={val} list={list} reveal={props.reveal}
            placeholder={(props.labels && props.labels[idx]) || ('Joueur ' + (idx + 1))}
            onChange={function(e) { setAt(idx, e.target.value); }} />
        );
      })(k);
    }
    return <div style={{ display:'grid', gridTemplateColumns: n > 1 ? '1fr 1fr' : '1fr', gap:'8px' }}>{slots}</div>;
  }

  var ACTION_LABEL = {
    VOLEUR:'Vole une carte', LOUP_GAROU:'Désigne une victime', GRAND_MECHANT_LOUP:'2ème victime',
    LOUP_BLANC:'Élimine un Loup', VOYANTE:'Sonde un joueur', SORCIERE:'Potions',
    CUPIDON:'Lie 2 amoureux', SALVATEUR:'Protège un joueur', CORBEAU:'Maudit un joueur',
    JOUEUR_FLUTE:'Enchante', FOSSOYEUR:'Exhume un mort', RENARD:'Sonde 1 + voisins',
    DEMENAGEUR:'Échange 2 joueurs',
    SOEUR_1:'Reconnaissance', CHIEN_LOUP:'Loup ou Chien', ENFANT_SAUVAGE:'Choisit un modèle',
    MONTREUR_OURS:'Grognement à l\'aube'
  };

  function actionControls(roleId) {

    /* DÉMÉNAGEUR — échange les rôles de 2 joueurs (dès la nuit 2) */
    if (roleId === 'DEMENAGEUR') {
      var demP = alive.find(function(p) { return p.role === 'DEMENAGEUR'; });
      var dPicks = recTargets('DEMENAGEUR');
      var dRec = getRec('DEMENAGEUR');
      if (dRec && dRec.note === 'SWAPPED' && dPicks.length === 2) {
        return <div style={infoStyle}>📦 Numéros échangés cette nuit : <strong style={{ color:'var(--text)' }}>J{dPicks[0]} ⇄ J{dPicks[1]}</strong> (chacun garde son rôle)</div>;
      }
      var swapList = alive.filter(function(p) { return !demP || p.id !== demP.id; });
      var dSet = function(idx, val) {
        var next = dPicks.slice();
        if (val === '') next.splice(idx, 1); else next[idx] = parseInt(val, 10);
        next = next.filter(function(v, i, arr) { return arr.indexOf(v) === i; });
        record('DEMENAGEUR', next);
      };
      var dslots = [];
      for (var di = 0; di < 2; di++) {
        (function(idx) {
          var val = dPicks[idx] !== undefined ? dPicks[idx] : '';
          var taken = dPicks.filter(function(v, i) { return i !== idx; });
          var list = swapList.filter(function(p) { return taken.indexOf(p.id) === -1; });
          dslots.push(<PlayerSelect key={idx} value={val} list={list} placeholder={idx === 0 ? '1er joueur' : '2ème joueur'} onChange={function(e) { dSet(idx, e.target.value); }} />);
        })(di);
      }
      return (
        <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>{dslots}</div>
          {dPicks.length === 2 && (
            <button onClick={function() { dispatch({ type:'DEMENAGEUR_SWAP', playerIds:[dPicks[0], dPicks[1]] }); record('DEMENAGEUR', [dPicks[0], dPicks[1]], 'SWAPPED'); playSound('role_DEMENAGEUR'); }}
              style={Object.assign({}, actBtn, { alignSelf:'flex-start', background:'rgba(148,163,184,0.18)', border:'1px solid rgba(148,163,184,0.5)', color:'#cbd5e1' })}>
              📦 Échanger J{dPicks[0]} ⇄ J{dPicks[1]}
            </button>
          )}
        </div>
      );
    }

    /* VOLEUR */
    if (roleId === 'VOLEUR') {
      var thief = alive.find(function(p) { return p.role === 'VOLEUR'; });
      var vRec = getRec('VOLEUR');
      /* Après le vol — affiche le rôle volé + bouton révélation (comme la Voyante) */
      if (vRec && vRec.targetIds.length > 0 && vRec.note) {
        var stolenRoleId = vRec.note;
        var srd = window.ROLES_DATA[stolenRoleId];
        return (
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'11px', padding:'10px 13px', borderRadius:'9px', background:'rgba(124,58,237,0.12)', border:'1px solid rgba(124,58,237,0.4)' }}>
              <span style={{ fontSize:'26px', lineHeight:1 }}>{srd && srd.emoji}</span>
              <div>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:'14px', fontWeight:700, color:'var(--text)' }}>Joueur {vRec.targetIds[0]}</div>
                <div style={{ fontFamily:"'Crimson Text',serif", fontSize:'13px', color:srd && srd.color }}>{srd && srd.name}</div>
              </div>
            </div>
            <button onClick={function() { setBigReveal({ playerId: vRec.targetIds[0], roleId: stolenRoleId, title: 'Le Voleur devient…' }); }}
              style={Object.assign({}, actBtn, { alignSelf:'flex-start', background:'rgba(124,58,237,0.16)', border:'1px solid rgba(124,58,237,0.5)', color:'#c4b5fd' })}>
              🎭 Montrer la carte au Voleur
            </button>
          </div>
        );
      }
      /* Avant le vol — sélection + bouton */
      var stealList = alive.filter(function(p) { return !thief || p.id !== thief.id; });
      return (
        <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
          <PlayerSelect value={thiefTarget} list={stealList} reveal placeholder="Joueur à voler"
            onChange={function(e) { setThiefTarget(e.target.value); }} />
          {thiefTarget && (
            <div style={{ display:'flex', gap:'8px' }}>
              <button onClick={function() {
                var id = parseInt(thiefTarget, 10);
                var tp = state.players.find(function(p) { return p.id === id; });
                setBigReveal({ playerId: id, title: 'Carte du Joueur ' + id });
              }}
                style={Object.assign({}, actBtn, { background:'rgba(167,139,250,0.16)', border:'1px solid rgba(167,139,250,0.5)', color:'#c4b5fd' })}>
                👁️ Montrer
              </button>
              <button
                onClick={function() {
                  var id = parseInt(thiefTarget, 10);
                  var targetP = state.players.find(function(p) { return p.id === id; });
                  var stolenRole = targetP ? targetP.role : null;
                  record('VOLEUR', [id], stolenRole || '');
                  dispatch({ type:'STEAL_ROLE', playerId:id });
                  playSound('role_VOLEUR');
                  setThiefTarget('');
                }}
                style={Object.assign({}, actBtn, { background:'rgba(124,58,237,0.18)', border:'1px solid rgba(124,58,237,0.5)', color:'#c4b5fd' })}>
                🎭 Voler la carte
              </button>
            </div>
          )}
        </div>
      );
    }

    /* LOUPS-GAROUS — uniquement des non-Loups (villageois) */
    if (roleId === 'LOUP_GAROU') {
      var preyList = alive.filter(function(p) { return !isWolfRole(p.role); });
      return (
        <PlayerSelect value={state.nightVictimId || ''} list={preyList} reveal placeholder="Victime des Loups"
          onChange={function(e) {
            var v = e.target.value;
            if (v) { var id = parseInt(v, 10); dispatch({ type:'SET_NIGHT_VICTIM', playerId:id }); record('LOUP_GAROU', [id]); playSound('wolf_howl'); }
            else { dispatch({ type:'CLEAR_NIGHT_VICTIM' }); record('LOUP_GAROU', []); }
          }} />
      );
    }

    /* GRAND MÉCHANT LOUP — 2ème proie non-Loup */
    if (roleId === 'GRAND_MECHANT_LOUP') {
      var gmlList = alive.filter(function(p) { return p.id !== state.nightVictimId && !isWolfRole(p.role); });
      return (
        <PlayerSelect value={recTargets('GRAND_MECHANT_LOUP')[0] || ''} list={gmlList} reveal
          placeholder="2ème victime (si aucun LG mort)"
          onChange={function(e) { var v = e.target.value; record('GRAND_MECHANT_LOUP', v ? [parseInt(v,10)] : []); }} />
      );
    }

    /* LOUP BLANC */
    if (roleId === 'LOUP_BLANC') {
      var lgList = alive.filter(function(p) { return p.role==='LOUP_GAROU'||p.role==='GRAND_MECHANT_LOUP'; });
      if (lgList.length === 0) return <div style={infoStyle}>Aucun Loup-Garou vivant à éliminer.</div>;
      return (
        <PlayerSelect value={state.nightVictimId || ''} list={lgList} placeholder="Loup à éliminer"
          onChange={function(e) { var v = e.target.value; if (v) { var id=parseInt(v,10); dispatch({type:'SET_NIGHT_VICTIM',playerId:id}); record('LOUP_BLANC',[id]); } }} />
      );
    }

    /* VOYANTE — menu avec rôles ; 1 sonde par tour ; révélation plein écran */
    if (roleId === 'VOYANTE') {
      var vSel = recTargets('VOYANTE')[0];
      if (vSel) {
        var vp = pById(vSel);
        var vrd = vp ? window.ROLES_DATA[vp.role] : null;
        return (
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'11px', padding:'10px 13px', borderRadius:'9px', background:'rgba(167,139,250,0.12)', border:'1px solid rgba(167,139,250,0.4)' }}>
              <span style={{ fontSize:'26px', lineHeight:1 }}>{vrd && vrd.emoji}</span>
              <div>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:'14px', fontWeight:700, color:'var(--text)' }}>Joueur {vSel}</div>
                <div style={{ fontFamily:"'Crimson Text',serif", fontSize:'13px', color:vrd && vrd.color }}>{vrd && vrd.name}</div>
              </div>
            </div>
            <button onClick={function() { setBigReveal({ playerId:vSel, title:'Vision de la Voyante' }); }}
              style={Object.assign({}, actBtn, { alignSelf:'flex-start', background:'rgba(167,139,250,0.16)', border:'1px solid rgba(167,139,250,0.5)', color:'#c4b5fd' })}>
              👁️ Montrer en grand à la Voyante
            </button>
          </div>
        );
      }
      var seerProbes = state.nightActions.filter(function(a) { return a.roleId === 'VOYANTE'; });
      var probedNights = {};
      seerProbes.forEach(function(a) {
        a.targetIds.forEach(function(id) { if (!probedNights[id]) probedNights[id] = []; if (probedNights[id].indexOf(a.night) === -1) probedNights[id].push(a.night); });
      });
      return (
        <select value="" style={selectStyle}
          onChange={function(e) {
            var v = e.target.value;
            if (v) { var id = parseInt(v, 10); record('VOYANTE', [id]); playSound('seer_vision'); setBigReveal({ playerId:id, title:'Vision de la Voyante' }); }
          }}>
          <option value="">— Joueur à sonder —</option>
          {alive.map(function(p) {
            var pn = probedNights[p.id];
            var mark = pn && pn.length ? '  · 👁️ déjà sondé (N' + pn.sort(function(a,b){return a-b;}).join(', N') + ')' : '';
            return <option key={p.id} value={p.id}>{'J' + p.id + ' — ' + roleName(p.role) + mark}</option>;
          })}
        </select>
      );
    }

    /* SORCIÈRE */
    if (roleId === 'SORCIERE') {
      var wolfVictimId = recTargets('LOUP_GAROU')[0] || recTargets('LOUP_BLANC')[0] || null;
      var undoBtn = Object.assign({}, actBtn, { alignSelf:'flex-start', padding:'6px 11px', fontSize:'11px', background:'transparent', border:'1px solid rgba(239,68,68,0.4)', color:'rgba(239,68,68,0.85)' });
      function undoWitchDeath() {
        dispatch({ type:'WITCH_UNDO_DEATH' });
        if (!state.witchLifePotion && wolfVictimId !== null) record('SORCIERE', [wolfVictimId], 'Sauve J'+wolfVictimId);
        else record('SORCIERE', []);
      }
      function undoWitchLife() {
        dispatch({ type:'WITCH_UNDO_LIFE', victimId: wolfVictimId });
        if (!state.witchDeathPotion) { var dr = getRec('SORCIERE'); record('SORCIERE', dr ? dr.targetIds : [], dr ? dr.note : ''); }
        else record('SORCIERE', []);
      }
      return (
        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          <div>
            <div style={labelStyle}>💊 Potion de vie</div>
            {state.witchLifePotion
              ? victimPlayer
                ? <button onClick={function() { record('SORCIERE', [victimPlayer.id], 'Sauve J'+victimPlayer.id); dispatch({type:'WITCH_USE_LIFE'}); playSound('witch_brew'); }}
                    style={Object.assign({}, actBtn, { alignSelf:'flex-start', background:'rgba(52,211,153,0.14)', border:'1px solid rgba(52,211,153,0.45)', color:'#34d399' })}>
                    Sauver J{victimPlayer.id}
                  </button>
                : <div style={infoStyle}>Aucune victime à sauver cette nuit.</div>
              : <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                  <div style={infoStyle}>✓ Potion de vie utilisée{state.witchLifeInfo && state.witchLifeInfo.targetId!==null && state.witchLifeInfo.targetId!==undefined?' (J'+state.witchLifeInfo.targetId+' sauvé·e, nuit '+state.witchLifeInfo.night+')':''}.</div>
                  {state.witchLifeInfo && state.witchLifeInfo.night === night && (
                    <button onClick={undoWitchLife} style={undoBtn}>↺ Annuler le sauvetage</button>
                  )}
                </div>}
          </div>
          <div>
            <div style={labelStyle}>☠️ Potion de mort</div>
            {state.witchDeathPotion
              ? <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                  <PlayerSelect value={witchDeath} reveal placeholder="Cible de la potion de mort"
                    onChange={function(e) { setWitchDeath(e.target.value); }} />
                  {witchDeath && (
                    <button onClick={function() { var id=parseInt(witchDeath,10); record('SORCIERE', recTargets('SORCIERE').concat([id]), 'Empoisonne J'+id); dispatch({type:'WITCH_USE_DEATH',playerId:id}); playSound('witch_brew'); setWitchDeath(''); }}
                      style={Object.assign({}, actBtn, { alignSelf:'flex-start', background:'rgba(239,68,68,0.14)', border:'1px solid rgba(239,68,68,0.45)', color:'#ef4444' })}>
                      Empoisonner J{witchDeath}
                    </button>
                  )}
                </div>
              : <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                  <div style={infoStyle}>{state.witchDeathInfo
                    ? '✓ Potion de mort déjà utilisée — nuit '+state.witchDeathInfo.night+', sur J'+state.witchDeathInfo.targetId+' (une seule fois par partie).'
                    : '✓ Potion de mort utilisée.'}</div>
                  {state.witchDeathInfo && state.witchDeathInfo.night === night && (
                    <button onClick={undoWitchDeath} style={undoBtn}>↺ Annuler / réactiver la potion</button>
                  )}
                </div>}
          </div>
        </div>
      );
    }

    /* CUPIDON */
    if (roleId === 'CUPIDON') {
      var lovers = state.players.filter(function(p) { return p.lovers !== null && p.lovers !== undefined; });
      if (lovers.length === 2) {
        return (
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            <div style={infoStyle}>❤️ Amoureux liés : <strong style={{ color:'#f472b6', fontStyle:'normal' }}>J{lovers[0].id} &amp; J{lovers[1].id}</strong> — si l'un meurt, l'autre meurt aussitôt.</div>
            <button onClick={function() { dispatch({ type:'UNLINK_LOVERS' }); record('CUPIDON', []); }}
              style={Object.assign({}, actBtn, { alignSelf:'flex-start', background:'rgba(180,30,60,0.12)', border:'1px solid rgba(180,30,60,0.4)', color:'var(--text-muted)' })}>
              ↺ Modifier les amoureux
            </button>
          </div>
        );
      }
      return (
        <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
          <MultiPick roleId="CUPIDON" count={2} labels={['Amoureux 1','Amoureux 2']}
            onPick={function(next) { if (next.length === 2) dispatch({ type:'CONFIRM_LOVERS', playerIds:[next[0], next[1]] }); }} />
          <div style={Object.assign({}, infoStyle, { fontSize:'12px' })}>Le lien est créé dès que les deux amoureux sont choisis.</div>
        </div>
      );
    }

    /* SALVATEUR */
    if (roleId === 'SALVATEUR') {
      var prot = alive.find(function(p) { return p.protected; });
      return (
        <PlayerSelect value={prot ? prot.id : ''} placeholder="Joueur à protéger"
          onChange={function(e) { var v = e.target.value; if (v) { var id=parseInt(v,10); dispatch({type:'PROTECT_PLAYER',playerId:id}); record('SALVATEUR',[id]); } }} />
      );
    }

    /* CORBEAU */
    if (roleId === 'CORBEAU') {
      var curs = alive.find(function(p) { return p.cursed; });
      return (
        <PlayerSelect value={curs ? curs.id : ''} placeholder="Joueur à maudire"
          onChange={function(e) { var v = e.target.value; if (v) { var id=parseInt(v,10); dispatch({type:'CURSE_PLAYER',playerId:id}); record('CORBEAU',[id]); } }} />
      );
    }

    /* JOUEUR DE FLÛTE — 1 (<15) ou 2 (15+) par nuit, dès la nuit 2 */
    if (roleId === 'JOUEUR_FLUTE') {
      var fcount = state.players.length > 15 ? 2 : 1;
      var picks = recTargets('JOUEUR_FLUTE');
      var enchantedList = state.players.filter(function(p) { return p.enchanted; });
      function fSet(idx, val) {
        var next = picks.slice();
        if (val === '') next.splice(idx, 1);
        else next[idx] = parseInt(val, 10);
        next = next.filter(function(v, i, arr) { return arr.indexOf(v) === i; });
        record('JOUEUR_FLUTE', next);
        if (val !== '') dispatch({ type:'CHARM_PLAYER', playerId: parseInt(val, 10) });
      }
      var slots = [];
      for (var k = 0; k < fcount; k++) {
        (function(idx) {
          var val = picks[idx] !== undefined ? picks[idx] : '';
          var taken = picks.filter(function(v, i) { return i !== idx; });
          slots.push(
            <select key={idx} value={val} style={selectStyle}
              onChange={function(e) { fSet(idx, e.target.value); }}>
              <option value="">— Enchanté {idx + 1} —</option>
              {alive.map(function(p) {
                var priorEnch = p.enchanted && picks.indexOf(p.id) === -1;
                var disabled = (taken.indexOf(p.id) !== -1) || priorEnch;
                return <option key={p.id} value={p.id} disabled={disabled}>{'J' + p.id + (p.enchanted ? ' ✓ déjà enchanté' : '')}</option>;
              })}
            </select>
          );
        })(k);
      }
      return (
        <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
          <div style={{ display:'grid', gridTemplateColumns: fcount > 1 ? '1fr 1fr' : '1fr', gap:'8px' }}>{slots}</div>
          {enchantedList.length > 0 && (
            <div style={{ fontSize:'13px', color:'#fcd34d', fontFamily:"'Crimson Text',serif" }}>
              🎵 Enchantés ({enchantedList.length}/{state.players.length}) : {enchantedList.map(function(p){ return 'J'+p.id; }).join(', ')}
            </div>
          )}
        </div>
      );
    }

    /* FOSSOYEUR — apprend le rôle d'un mort de la nuit, peut le prendre */
    if (roleId === 'FOSSOYEUR') {
      var nightDeaths = state.deaths.filter(function(d) { return d.night === night; });
      var lastId = state.nightVictimId || (nightDeaths.length ? nightDeaths[nightDeaths.length - 1].playerId : null);
      var digger = state.players.find(function(p) {
        return p.alive && (p.role === 'FOSSOYEUR' || (p.diggerRole !== null && p.diggerRole !== undefined));
      });
      var heldRole = digger && digger.diggerRole ? window.ROLES_DATA[digger.diggerRole] : null;
      var lp = lastId ? pById(lastId) : null;
      // Le Fossoyeur ne peut pas s'exhumer lui-même
      var corpseIsDigger = digger && lp && lp.id === digger.id;
      var lrd = lp ? window.ROLES_DATA[lp.role] : null;
      var fRec = getRec('FOSSOYEUR');
      var fTaken = fRec && fRec.note === 'PRIS';
      var fRefused = fRec && (fRec.note === 'REFUSE' || fRec.note === 'GARDE');

      // Bandeau du pouvoir actuellement détenu (acquis une nuit précédente)
      var heldBanner = heldRole ? (
        <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'9px 12px', borderRadius:'9px', background:'rgba(167,139,250,0.1)', border:'1px solid rgba(167,139,250,0.3)' }}>
          <span style={{ fontSize:'20px' }}>{heldRole.emoji}</span>
          <span style={{ fontFamily:"'Crimson Text',serif", fontSize:'14px', color:'var(--text)' }}>Pouvoir actuel : <strong style={{ color:heldRole.color }}>{heldRole.name}</strong> <span style={{ color:'var(--text-muted)' }}>— il agit avec ce pouvoir dans la rubrique « {heldRole.plural || heldRole.name} » de cette nuit.</span></span>
        </div>
      ) : null;

      // Pas de nouveau mort cette nuit : il conserve simplement son pouvoir
      if (!lastId || corpseIsDigger) {
        return (
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            {heldBanner}
            <div style={infoStyle}>{heldRole
              ? 'Aucun nouveau mort à exhumer cette nuit — le Fossoyeur conserve le pouvoir du ' + heldRole.name + '.'
              : 'Aucun mort cette nuit pour l\u2019instant — d\u00e9signez d\u2019abord la victime des Loups.'}</div>
          </div>
        );
      }
      // Victime protégée par le Salvateur → rien à exhumer
      if (lp && lp.protected) {
        return (
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            {heldBanner}
            <div style={infoStyle}>🛡️ Joueur {lastId} est protégé cette nuit — il ne mourra pas, le Fossoyeur ne peut rien exhumer.</div>
          </div>
        );
      }
      var takeLabel = heldRole ? (fTaken ? '✓ Nouveau rôle pris' : '⛏️ Prendre J' + lastId) : (fTaken ? '✓ Rôle pris' : '⛏️ Pris');
      return (
        <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
          {heldBanner}
          <div style={infoStyle}>Mort de la nuit : <strong style={{ color:'var(--text)' }}>Joueur {lastId}</strong>{heldRole ? ' — il peut échanger son pouvoir contre celui-ci.' : ''}</div>
          <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
            <button onClick={function() { setBigReveal({ playerId:lastId, title:'Exhumation du Fossoyeur' }); }}
              style={Object.assign({}, actBtn, { background:'rgba(167,139,250,0.16)', border:'1px solid rgba(167,139,250,0.5)', color:'#c4b5fd' })}>
              👁️ Montrer
            </button>
            <button onClick={function() {
                record('FOSSOYEUR', [lastId], 'PRIS');
                dispatch({ type:'GRAVEDIGGER_TAKE_ROLE', playerId:lastId });
                playSound('role_FOSSOYEUR');
              }}
              style={Object.assign({}, actBtn, { background:fTaken?'rgba(52,211,153,0.18)':'rgba(120,113,108,0.18)', border:'1px solid '+(fTaken?'rgba(52,211,153,0.5)':'rgba(120,113,108,0.5)'), color:fTaken?'#34d399':'#c9beb4' })}>
              {takeLabel}
            </button>
            <button onClick={function() { record('FOSSOYEUR', [lastId], heldRole ? 'GARDE' : 'REFUSE'); }}
              style={Object.assign({}, actBtn, { background:fRefused?'rgba(239,68,68,0.16)':'rgba(120,113,108,0.18)', border:'1px solid '+(fRefused?'rgba(239,68,68,0.5)':'rgba(120,113,108,0.5)'), color:fRefused?'#f87171':'#c9beb4' })}>
              {heldRole ? (fRefused ? '✓ Pouvoir gardé' : '↺ Garder ' + heldRole.name) : (fRefused ? '✓ Refusé' : '✕ Refusé')}
            </button>
          </div>
          {fTaken && lrd && (
            <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'9px 12px', borderRadius:'9px', background:'rgba(52,211,153,0.1)', border:'1px solid rgba(52,211,153,0.32)' }}>
              <span style={{ fontSize:'22px' }}>{lrd.emoji}</span>
              <span style={{ fontFamily:"'Crimson Text',serif", fontSize:'14px', color:'var(--text)' }}>Le Fossoyeur devient <strong style={{ color:lrd.color }}>{lrd.name}</strong></span>
            </div>
          )}
          {fRefused && (
            <div style={infoStyle}>{heldRole ? 'Le Fossoyeur garde le pouvoir du ' + heldRole.name + '.' : 'Le Fossoyeur a refusé le rôle — il reste Fossoyeur.'}</div>
          )}
        </div>
      );
    }

    /* RENARD — 1 joueur, voisins gauche/droite scannés automatiquement */
    if (roleId === 'RENARD') {
      var chosenId = recTargets('RENARD')[0];
      var resultLine = null;
      if (chosenId) {
        var order = state.players.slice().sort(function(a, b) { return a.id - b.id; });
        var n = order.length;
        var idx = order.findIndex(function(p) { return p.id === chosenId; });
        if (idx !== -1) {
          var left = order[(idx - 1 + n) % n], right = order[(idx + 1) % n];
          var trio = [left, order[idx], right];
          var wolf = trio.some(function(p) { return isWolfRole(p.role); });
          resultLine = (
            <div style={{ fontSize:'14px', fontFamily:"'Crimson Text',serif", color: wolf ? '#ef4444' : '#34d399' }}>
              🦊 Scan : J{left.id} · <strong>J{order[idx].id}</strong> · J{right.id} → {wolf ? 'un Loup est présent' : 'aucun Loup'}
            </div>
          );
        }
      }
      var foxProbed = {};
      state.nightActions.filter(function(a) { return a.roleId === 'RENARD'; }).forEach(function(a) {
        a.targetIds.forEach(function(id) { if (!foxProbed[id]) foxProbed[id] = []; if (foxProbed[id].indexOf(a.night) === -1) foxProbed[id].push(a.night); });
      });
      return (
        <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
          <select value={chosenId || ''} style={selectStyle}
            onChange={function(e) {
              var v = e.target.value;
              if (!v) { record('RENARD', []); return; }
              var id = parseInt(v, 10);
              var ord = state.players.slice().sort(function(a, b) { return a.id - b.id; });
              var i = ord.findIndex(function(p) { return p.id === id; });
              var nn = ord.length;
              var note = 'J' + ord[(i-1+nn)%nn].id + ' · J' + id + ' · J' + ord[(i+1)%nn].id;
              record('RENARD', [id], note);
            }}>
            <option value="">— Joueur central à sonder —</option>
            {alive.map(function(p) {
              var pn = foxProbed[p.id];
              var mark = pn && pn.length ? '  · 🦊 déjà sondé (N' + pn.sort(function(a,b){return a-b;}).join(', N') + ')' : '';
              return <option key={p.id} value={p.id}>{'J' + p.id + mark}</option>;
            })}
          </select>
          {resultLine}
        </div>
      );
    }

    /* ENFANT SAUVAGE — modèle parmi Montreur d'Ours / Renard / Loups (rôle caché) */
    if (roleId === 'ENFANT_SAUVAGE') {
      var modelCandidates = alive.filter(function(p) {
        return ['MONTREUR_OURS','RENARD','LOUP_GAROU','GRAND_MECHANT_LOUP'].indexOf(p.role) !== -1
          && p.role !== 'ENFANT_SAUVAGE';
      });
      var curModel = recTargets('ENFANT_SAUVAGE')[0];
      return (
        <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
          <PlayerSelect value={curModel || ''} list={modelCandidates} reveal placeholder="Modèle de l'Enfant Sauvage"
            onChange={function(e) {
              var v = e.target.value;
              record('ENFANT_SAUVAGE', v ? [parseInt(v,10)] : []);
              dispatch({ type:'SET_ENFANT_MODEL', modelId: v ? parseInt(v,10) : null });
            }} />
          <div style={infoStyle}>À la mort du modèle, l'Enfant Sauvage devient Loup-Garou.</div>
        </div>
      );
    }

    /* CHIEN-LOUP — choix de camp (nuit 2) — bascule le rôle effectif + affiche le camp */
    if (roleId === 'CHIEN_LOUP') {
      var clPlayer = state.players.find(function(p) { return p.role === 'CHIEN_LOUP' || p.originRole === 'CHIEN_LOUP'; });
      var clCamp = clPlayer ? clPlayer.clCamp : null;
      return (
        <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
          <select value={clCamp || ''} style={selectStyle}
            onChange={function(e) {
              var v = e.target.value;
              dispatch({ type:'SET_CHIENLOUP_CAMP', camp: v || null });
              record('CHIEN_LOUP', [], v === 'Loup' ? 'Loup (Loups-Garous)' : v === 'Village' ? 'Chien (Village)' : '');
            }}>
            <option value="">— Choisir son camp —</option>
            <option value="Village">🏡 Chien — rejoint le Village</option>
            <option value="Loup">🐺 Loup — rejoint les Loups</option>
          </select>
          {clCamp && clPlayer && (
            <div style={{ display:'flex', alignItems:'center', gap:'9px', padding:'9px 12px', borderRadius:'9px',
              background: clCamp==='Loup' ? 'rgba(239,68,68,0.12)' : 'rgba(92,158,255,0.12)',
              border:'1px solid '+(clCamp==='Loup' ? 'rgba(239,68,68,0.4)' : 'rgba(92,158,255,0.4)') }}>
              <span style={{ fontSize:'18px' }}>{clCamp==='Loup' ? '🐺' : '🏡'}</span>
              <span style={{ fontFamily:"'Crimson Text',serif", fontSize:'14px', color:'var(--text)' }}>
                Chien-Loup <strong>J{clPlayer.id}</strong> → camp <strong style={{ color: clCamp==='Loup' ? '#ef4444' : '#5c9eff' }}>{clCamp==='Loup' ? 'Loup' : 'Villageois'}</strong>
              </span>
            </div>
          )}
        </div>
      );
    }

    /* SŒURS */
    if (roleId === 'SOEUR_1') {
      var sisters = state.players.filter(function(p) { return (p.role==='SOEUR_1'||p.role==='SOEUR_2') && p.alive; });
      return (
        <div style={infoStyle}>
          Les Sœurs se reconnaissent : {sisters.map(function(p){ return 'J'+p.id; }).join(' & ') || '—'}
        </div>
      );
    }

    var role = window.ROLES_DATA[roleId];
    return <div style={infoStyle}>{role.nightInstruction || role.description}</div>;
  }

  var NO_SOUND_ROLES = ['ENFANT_SAUVAGE','SOEUR_1','SOEUR_2','LOUP_BLANC','SALVATEUR'];

  /* ── Ligne rôle ── */
  function renderRow(roleId) {
    var role = window.ROLES_DATA[roleId];
    if (!role) return null;
    var rolePlaying = playingEventId === ('role_' + roleId);
    var rec = getRec(roleId);
    var done = rec && (rec.targetIds.length > 0 || rec.note);
    var rolePlayers = state.players.filter(function(p) {
      if (!p.alive) return false;
      if (p.role === roleId) return true;
      // Le Fossoyeur reste affiché sous son rôle même après avoir adopté un pouvoir
      if (roleId === 'FOSSOYEUR' && p.diggerRole !== null && p.diggerRole !== undefined) return true;
      // Le Chien-Loup reste affiché sous sa rubrique même après avoir choisi son camp
      if (roleId === 'CHIEN_LOUP' && p.originRole === 'CHIEN_LOUP') return true;
      return false;
    });
    var noSound = NO_SOUND_ROLES.indexOf(roleId) !== -1;
    return (
      <div key={roleId} style={{ flexShrink:0, background:'rgba(8,3,14,0.96)', border:'1.5px solid '+(role.color+(done?'aa':'88')), borderRadius:'13px', overflow:'hidden', transition:'border-color 0.2s', boxShadow: done ? '0 4px 18px rgba(0,0,0,0.55), 0 0 0 1px '+role.color+'55, inset 0 0 22px rgba(52,211,153,0.12)' : '0 4px 18px rgba(0,0,0,0.55), 0 0 0 1px '+role.color+'3a, inset 0 0 22px '+role.color+'12' }}>
        <div style={{ display:'flex', alignItems:'center', flexWrap:'wrap', gap:'10px', rowGap:'8px', padding:'12px 13px', background:role.bgColor, borderBottom:'1.5px solid '+(role.color+'7a') }}>
          <span style={{ fontSize:'24px', lineHeight:1, flexShrink:0 }}>{role.emoji}</span>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:'15px', fontWeight:700, color:role.color }}>{role.plural || role.name}</div>
            {rolePlayers.length > 0 && (
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'11px', color:role.color, opacity:0.7, marginTop:'2px' }}>
                {rolePlayers.map(function(p){ return 'J'+p.id + (p.clCamp ? ' ('+(p.clCamp==='Loup'?'Loup':'Village')+')' : ''); }).join(' · ')}
              </div>
            )}
          </div>
          {done && <span style={{ fontSize:'14px', flexShrink:0 }}>✓</span>}
          {done && (
            <button onClick={function() { cancelAction(roleId); }}
              style={{ flexShrink:0, padding:'4px 9px', background:'transparent', border:'1px solid rgba(239,68,68,0.4)', borderRadius:'7px', cursor:'pointer', fontFamily:"'Cinzel',serif", fontSize:'10px', color:'#ef4444', letterSpacing:'0.04em' }}>
              Annuler
            </button>
          )}
          <span style={{ fontFamily:"'Cinzel',serif", fontSize:'10px', fontWeight:600, letterSpacing:'0.04em', color:role.color, background:role.color+'1e', border:'1px solid '+(role.color+'44'), padding:'4px 8px', borderRadius:'7px', flexShrink:0, textAlign:'center' }}>
            {ACTION_LABEL[roleId] || 'Information'}
          </span>
          {!noSound && <SoundPicker roleId={roleId} />}
          {!noSound && (
            <button onClick={function() { playSound('role_'+roleId); }}
              style={{ flexShrink:0, width:'34px', height:'32px', background:rolePlaying?role.color+'26':'transparent', border:'1px solid '+(rolePlaying?role.color+'66':'rgba(180,30,60,0.28)'), borderRadius:'7px', cursor:'pointer', fontSize:'12px', color:rolePlaying?role.color:'var(--text-muted)', transition:'all 0.18s' }}>
              {rolePlaying ? '■' : '▶'}
            </button>
          )}
        </div>
        <div style={{ padding:'14px 13px', background:'rgba(3,1,7,0.55)' }}>{actionControls(roleId)}</div>
      </div>
    );
  }

  /* — Sœur survivante : vengeance (1× par partie) quand une des deux Sœurs est morte — */
  function renderSisterRevenge() {
    var sisters = state.players.filter(function(p) { return p.role === 'SOEUR_1' || p.role === 'SOEUR_2'; });
    if (sisters.length < 2) return null;
    var aliveS = sisters.filter(function(p) { return p.alive; });
    var deadS = sisters.filter(function(p) { return !p.alive; });
    if (deadS.length === 0 || aliveS.length === 0) return null; // deux vivantes ou deux mortes → pas de vengeance
    var info = state.sisterRevengeInfo;
    var usedThisNight = info && info.night === night;
    if (state.sisterRevengeUsed && !usedThisNight) return null; // déjà utilisée une nuit précédente
    var clr = '#f9a8d4';
    var targets = state.players.filter(function(p) { return p.alive && aliveS.indexOf(p) === -1; });
    return (
      <div style={{ flexShrink:0, background:'rgba(8,3,14,0.96)', border:'1px solid rgba(249,168,212,0.45)', borderRadius:'13px', overflow:'hidden', boxShadow: usedThisNight ? '0 3px 16px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(52,211,153,0.32)' : '0 3px 16px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(249,168,212,0.18)' }}>
        <div style={{ display:'flex', alignItems:'center', flexWrap:'wrap', gap:'10px', rowGap:'8px', padding:'12px 13px', background:'rgba(249,168,212,0.09)', borderBottom:'1px solid rgba(249,168,212,0.45)' }}>
          <span style={{ fontSize:'24px', lineHeight:1, flexShrink:0 }}>👩‍❤️‍👧</span>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:'15px', fontWeight:700, color:clr }}>Sœur survivante — Vengeance</div>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'11px', color:clr, opacity:0.75, marginTop:'2px' }}>
              survivante {aliveS.map(function(p){return 'J'+p.id;}).join(' · ')} · sœur perdue {deadS.map(function(p){return 'J'+p.id;}).join(' · ')}
            </div>
          </div>
          {usedThisNight && <span style={{ fontSize:'14px', flexShrink:0 }}>✓</span>}
          <span style={{ fontFamily:"'Cinzel',serif", fontSize:'10px', fontWeight:600, letterSpacing:'0.04em', color:clr, background:clr+'1e', border:'1px solid '+(clr+'44'), padding:'4px 8px', borderRadius:'7px', flexShrink:0, textAlign:'center' }}>1× par partie</span>
        </div>
        <div style={{ padding:'14px 13px', background:'rgba(3,1,7,0.55)' }}>
          {usedThisNight ? (
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              <div style={infoStyle}>☠️ La Sœur survivante élimine <strong style={{ color:'var(--text)', fontStyle:'normal' }}>J{info.targetId}</strong> par vengeance — révélé à l'aube.</div>
              <button onClick={function() { dispatch({ type:'SISTER_REVENGE_UNDO' }); }}
                style={Object.assign({}, actBtn, { alignSelf:'flex-start', padding:'6px 11px', fontSize:'11px', background:'transparent', border:'1px solid rgba(239,68,68,0.4)', color:'rgba(239,68,68,0.85)' })}>↺ Annuler la vengeance</button>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              <div style={infoStyle}>Une Sœur est morte — la survivante peut tuer <strong style={{ color:'var(--text)', fontStyle:'normal' }}>une seule fois dans la partie</strong> par vengeance.</div>
              <select value="" style={selectStyle}
                onChange={function(e) { var v = e.target.value; if (v) { dispatch({ type:'SISTER_REVENGE', playerId: parseInt(v,10) }); playSound('death_night'); } }}>
                <option value="">— Cible de la vengeance —</option>
                {targets.map(function(p) { return <option key={p.id} value={p.id}>{'J' + p.id + ' — ' + roleName(p.role)}</option>; })}
              </select>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* —─ Suivi ─— */
  var tonight = state.nightActions.filter(function(a) { return a.night === night; });
  function recapText(a) {
    if (a.targetIds.length > 0) {
      var reveal = (a.roleId === 'VOYANTE' || a.roleId === 'FOSSOYEUR' || a.roleId === 'VOLEUR');
      var ids = a.targetIds.map(function(id) {
        var p = pById(id); if (!p) return 'J?';
        return 'J' + id + (reveal ? ' (' + roleName(p.role) + ')' : '');
      }).join(', ');
      return ids + (a.note ? ' — ' + a.note : '');
    }
    return a.note || '—';
  }

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
      {/* Révélation plein écran (Voyante / Fossoyeur) */}
      {bigReveal && (function() {
        var bp = pById(bigReveal.playerId);
        var brd = bigReveal.roleId ? window.ROLES_DATA[bigReveal.roleId] : (bp ? window.ROLES_DATA[bp.role] : null);
        if (!brd) return null;
        return (
          <div onClick={function() { setBigReveal(null); }}
            style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(2,1,6,0.97)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px', cursor:'pointer' }}>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:'12px', letterSpacing:'0.3em', color:'var(--text-muted)', textTransform:'uppercase', marginBottom:'22px', textAlign:'center' }}>
              {bigReveal.title || 'Rôle révélé'} · Joueur {bigReveal.playerId}
            </div>
            <div style={{ fontSize:'124px', lineHeight:1, marginBottom:'18px' }}>{brd.emoji}</div>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:'42px', fontWeight:700, color:brd.color, marginBottom:'14px', textAlign:'center' }}>{brd.name}</div>
            <div style={{ fontFamily:"'Crimson Text',serif", fontSize:'18px', color:'var(--text-muted)', fontStyle:'italic', textAlign:'center', maxWidth:'500px', lineHeight:1.55 }}>
              {brd.nightInstruction || brd.description}
            </div>
            <button style={{ marginTop:'38px', padding:'12px 32px', background:'rgba(180,30,60,0.18)', border:'1px solid rgba(180,30,60,0.5)', borderRadius:'10px', cursor:'pointer', fontFamily:"'Cinzel',serif", fontSize:'12px', fontWeight:600, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--text)' }}>
              Fermer
            </button>
          </div>
        );
      })()}
      <div style={{ flex:1, overflowY:'auto', padding:'12px 10px', display:'flex', flexDirection:'column', gap:'15px' }}>
        {state.nightOrder.map(renderRow)}
        {renderSisterRevenge()}
        {state.nightOrder.length === 0 && !renderSisterRevenge() && (
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-dim)', fontFamily:"'Crimson Text',serif", fontSize:'15px', fontStyle:'italic' }}>
            Aucun rôle actif cette nuit.
          </div>
        )}


      </div>

      <div style={{ padding:'10px 14px 14px', borderTop:'1px solid rgba(180,30,60,0.12)', flexShrink:0 }}>
        <button onClick={function() { dispatch({ type:'PROCEED_DAWN' }); playSound('death_night'); }}
          style={{ width:'100%', padding:'13px', background:'rgba(212,160,23,0.16)', border:'1px solid rgba(212,160,23,0.5)', borderRadius:'9px', cursor:'pointer', fontFamily:"'Cinzel',serif", fontSize:'13px', fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--gold)', transition:'all 0.2s' }}>
          ☀️ Lever du jour
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { NightPhase });
