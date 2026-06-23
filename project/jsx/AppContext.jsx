// AppContext.jsx — State management
const { createContext, useContext, useReducer, useEffect, useRef, useCallback, useState: useStAC } = React;
const GameCtx = createContext(null);

function loadLS(key, def) {
  try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch(e) { return def; }
}

function makeInitial() {
  return {
    screen: 'home', selectedGame: 'loup-garou', playerCount: 0, roleConfig: {},
    players: [], assignIndex: 0, gamePhase: 'night', nightCount: 1,
    currentRoleIndex: 0, nightOrder: [], nightVictimId: null,
    witchLifePotion: true, witchDeathPotion: true, witchDeathInfo: null, witchLifeInfo: null, deaths: [], pendingDeaths: [],
    timerSeconds: 0, timerRunning: false, soundEnabled: true,
    soundLibrary: loadLS('mj_sound_library', {}),
    soundProfiles: loadLS('mj_sound_profiles', []),
    soundProfile: loadLS('mj_sound_profile', ''),
    showSoundModal: false, selectedPlayerId: null, layoutMode: 'focused',
    hunterDying: null, loversSelected: [], nightActions: [], dawnNotes: [],
    sisterRevengeUsed: false, sisterRevengeInfo: null, victory: null
  };
}

function shuffleArr(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

// Cascade des répercussions de mort : amoureux + transformation Enfant Sauvage.
// deadIds = ids fraîchement morts (déjà marqués alive:false dans `players`).
function cascadeDeaths(players, deadIds, night, phase) {
  var pls = players;
  var extra = [];   // { playerId, cause }
  var notes = [];   // strings pour le récap
  var queue = deadIds.slice();
  while (queue.length) {
    var did = queue.shift();
    var dead = pls.find(function(p) { return p.id === did; });
    if (!dead) continue;
    // Amoureux : l'autre meurt de chagrin
    if (dead.lovers !== null && dead.lovers !== undefined) {
      var lover = pls.find(function(p) { return p.id === dead.lovers; });
      if (lover && lover.alive) {
        pls = pls.map(function(p) { return p.id === lover.id ? Object.assign({}, p, { alive: false, revealed: true }) : p; });
        extra.push({ id: Date.now() + Math.random(), playerId: lover.id, cause: 'lovers', night: night, phase: phase });
        notes.push('💘 J' + lover.id + ' meurt de chagrin (amoureux de J' + did + ')');
        queue.push(lover.id);
      }
    }
    // Enfant Sauvage : si son modèle meurt, il bascule Loup-Garou
    pls.forEach(function(p) {
      if (p.role === 'ENFANT_SAUVAGE' && p.alive && p.model === did) {
        pls = pls.map(function(q) { return q.id === p.id ? Object.assign({}, q, { role: 'LOUP_GAROU' }) : q; });
        notes.push('🧒 L\'Enfant Sauvage (J' + p.id + ') devient Loup-Garou — son modèle J' + did + ' est mort');
      }
    });
  }
  return { players: pls, extra: extra, notes: notes };
}

function gameReducer(state, action) {
  switch (action.type) {

    case 'SET_SCREEN':
      return Object.assign({}, state, { screen: action.screen });

    case 'SET_PLAYER_COUNT': {
      var c = Math.max(4, Math.min(25, action.count));
      return Object.assign({}, state, { playerCount: c, roleConfig: {} });
    }

    case 'INIT_PLAYERS': {
      var pool = window.getRandomRolePool ? window.getRandomRolePool(state.playerCount) : [];
      for (var _i = pool.length - 1; _i > 0; _i--) {
        var _j = Math.floor(Math.random() * (_i + 1));
        var _t = pool[_i]; pool[_i] = pool[_j]; pool[_j] = _t;
      }
      var ps = Array.from({ length: state.playerCount }, function(_, i) {
        return { id: i+1, name: 'Joueur '+(i+1), role: pool[i] || 'VILLAGEOIS',
          alive: true, revealed: false, protected: false, cursed: false, lovers: null, idiotRevealed: false,
          enchanted: false, model: null, elderLifeUsed: false, diggerRole: null };
      });
      return Object.assign({}, state, { players: ps });
    }

    case 'SET_PLAYER_NAME':
      return Object.assign({}, state, {
        players: state.players.map(function(p) { return p.id === action.id ? Object.assign({}, p, { name: action.name }) : p; })
      });

    case 'SHUFFLE_ROLES': {
      var pool2 = [];
      Object.entries(state.roleConfig).forEach(function(entry) {
        var rid = entry[0], cnt = entry[1];
        for (var i = 0; i < cnt; i++) pool2.push(rid);
      });
      while (pool2.length < state.players.length) pool2.push('VILLAGEOIS');
      pool2 = shuffleArr(pool2).slice(0, state.players.length);
      return Object.assign({}, state, {
        players: state.players.map(function(p, i) { return Object.assign({}, p, { role: pool2[i], revealed: false }); }),
        assignIndex: 0
      });
    }

    case 'SET_ASSIGN_INDEX':
      return Object.assign({}, state, { assignIndex: action.index });

    case 'START_GAME': {
      var order = window.computeNightOrder(state.roleConfig, 1, state.players);
      var cleanPls = state.players.map(function(p) { return Object.assign({}, p, { revealed: false }); });
      return Object.assign({}, state, {
        screen: 'game', gamePhase: 'night', nightCount: 1, currentRoleIndex: 0,
        nightOrder: order, nightVictimId: null, witchLifePotion: true, witchDeathPotion: true, witchDeathInfo: null,
        deaths: [], pendingDeaths: [], players: cleanPls, timerRunning: false, timerSeconds: 0,
        hunterDying: null, loversSelected: [], nightActions: [], dawnNotes: [],
        witchLifeInfo: null, sisterRevengeUsed: false, sisterRevengeInfo: null, victory: null
      });
    }

    case 'NEXT_NIGHT_ROLE': {
      var next = state.currentRoleIndex + 1;
      if (next >= state.nightOrder.length) return Object.assign({}, state, { gamePhase: 'dawn', selectedPlayerId: null });
      return Object.assign({}, state, { currentRoleIndex: next, selectedPlayerId: null });
    }

    case 'SET_NIGHT_VICTIM':
      return Object.assign({}, state, { nightVictimId: action.playerId, selectedPlayerId: action.playerId });

    case 'CLEAR_NIGHT_VICTIM':
      return Object.assign({}, state, { nightVictimId: null, selectedPlayerId: null });

    case 'PROCEED_DAWN': {
      // Toutes les victimes "de type Loup" cette nuit : proie des Loups + 2ème proie du Grand Méchant Loup
      var wolfVictimIds = [];
      if (state.nightVictimId !== null && state.nightVictimId !== undefined) wolfVictimIds.push(state.nightVictimId);
      var gmlRec = state.nightActions.find(function(a) { return a.night === state.nightCount && a.roleId === 'GRAND_MECHANT_LOUP'; });
      if (gmlRec && gmlRec.targetIds.length > 0) {
        var gid = gmlRec.targetIds[0];
        if (wolfVictimIds.indexOf(gid) === -1) wolfVictimIds.push(gid);
      }
      var elderSavedIds = [];
      var wolfDeaths = [];
      wolfVictimIds.forEach(function(vid) {
        var vic = state.players.find(function(p) { return p.id === vid; });
        if (!vic || !vic.alive || vic.protected) return;
        if (vic.role === 'ANCIEN' && !vic.elderLifeUsed && elderSavedIds.indexOf(vic.id) === -1) {
          elderSavedIds.push(vic.id); // L'Ancien survit à sa 1ère attaque des Loups
        } else {
          wolfDeaths.push({ id: Date.now() + Math.random(), playerId: vid, cause: 'wolves', night: state.nightCount, phase: 'night' });
        }
      });
      // Morts déjà appliquées cette nuit par d'autres pouvoirs (Sorcière, Sœur survivante)
      var otherNightDeaths = state.deaths.filter(function(d) { return (d.cause === 'witch' || d.cause === 'sister') && d.night === state.nightCount; });
      var basePending = otherNightDeaths.concat(wolfDeaths);
      var updPl = state.players.map(function(p) {
        if (wolfDeaths.some(function(d) { return d.playerId === p.id; })) return Object.assign({}, p, { alive: false, protected: false });
        if (elderSavedIds.indexOf(p.id) > -1) return Object.assign({}, p, { elderLifeUsed: true, protected: false });
        return Object.assign({}, p, { protected: false });
      });
      var deadIds = basePending.map(function(d) { return d.playerId; });
      var casc = cascadeDeaths(updPl, deadIds, state.nightCount, 'night');
      var allPending = basePending.concat(casc.extra);
      var newDeaths = wolfDeaths.concat(casc.extra);
      var hunterId = null;
      allPending.forEach(function(d) {
        var pl = casc.players.find(function(p) { return p.id === d.playerId; });
        if (pl && pl.role === 'CHASSEUR') hunterId = pl.id;
      });
      return Object.assign({}, state, {
        gamePhase: 'dawn', players: casc.players, deaths: state.deaths.concat(newDeaths),
        pendingDeaths: allPending, nightVictimId: null, selectedPlayerId: null,
        hunterDying: hunterId,
        dawnNotes: casc.notes.concat(elderSavedIds.map(function(id) { return '👴 L\'Ancien (J'+id+') a survécu à l\'attaque des Loups grâce à sa vie supplémentaire.'; }))
      });
    }

    case 'CONFIRM_DAWN':
      return Object.assign({}, state, { gamePhase: 'day', pendingDeaths: [], dawnNotes: [] });

    case 'START_DEBATE': {
      var secs = action.seconds || 0;
      return Object.assign({}, state, {
        gamePhase: 'day', pendingDeaths: [], dawnNotes: [],
        timerSeconds: secs, timerRunning: secs > 0
      });
    }

    case 'START_VOTE':
      return Object.assign({}, state, { gamePhase: 'vote' });

    case 'ELIMINATE_PLAYER': {
      var tgt = state.players.find(function(p) { return p.id === action.playerId; });
      if (!tgt) return state;
      if (tgt.role === 'IDIOT' && !tgt.idiotRevealed) {
        return Object.assign({}, state, {
          players: state.players.map(function(p) { return p.id === action.playerId ? Object.assign({}, p, { idiotRevealed: true, revealed: true }) : p; })
        });
      }
      var dr = { id: Date.now() + Math.random(), playerId: action.playerId, cause: 'lynch', night: state.nightCount, phase: 'day' };
      var newPls = state.players.map(function(p) { return p.id === action.playerId ? Object.assign({}, p, { alive: false, revealed: true }) : p; });
      // Ancien lynché par le village → tous les villageois perdent leur pouvoir
      var ancienLynched = tgt.role === 'ANCIEN';
      if (ancienLynched) {
        newPls = newPls.map(function(p) {
          var rdp = window.ROLES_DATA[p.role];
          if (p.id === action.playerId) return p;
          if (rdp && rdp.team === 'village' && p.role !== 'VILLAGEOIS') {
            return Object.assign({}, p, { role: 'VILLAGEOIS' });
          }
          return p;
        });
      }
      if (tgt.role === 'CHASSEUR') {
        return Object.assign({}, state, { players: newPls, deaths: state.deaths.concat([dr]), gamePhase: 'hunter', hunterDying: action.playerId });
      }
      var cascL = cascadeDeaths(newPls, [action.playerId], state.nightCount, 'day');
      var no = window.computeNightOrder(state.roleConfig, state.nightCount + 1, cascL.players);
      return Object.assign({}, state, {
        players: cascL.players.map(function(p) { return p.cursed ? Object.assign({}, p, { cursed: false }) : p; }), deaths: state.deaths.concat([dr]).concat(cascL.extra), gamePhase: 'night',
        nightCount: state.nightCount + 1, currentRoleIndex: 0, nightOrder: no,
        nightVictimId: null, selectedPlayerId: null, timerRunning: false, timerSeconds: 0, hunterDying: null,
        ancienPowerLost: ancienLynched ? true : state.ancienPowerLost
      });
    }

    case 'SKIP_VOTE': {
      var so = window.computeNightOrder(state.roleConfig, state.nightCount + 1, state.players);
      return Object.assign({}, state, {
        players: state.players.map(function(p) { return p.cursed ? Object.assign({}, p, { cursed: false }) : p; }),
        gamePhase: 'night', nightCount: state.nightCount + 1, currentRoleIndex: 0, nightOrder: so,
        timerRunning: false, timerSeconds: 0
      });
    }

    case 'HUNTER_SHOOT': {
      var hd = { id: Date.now() + Math.random(), playerId: action.playerId, cause: 'hunter', night: state.nightCount, phase: state.gamePhase };
      var hPls = state.players.map(function(p) { return p.id === action.playerId ? Object.assign({}, p, { alive: false, revealed: true }) : p; });
      var cascH = cascadeDeaths(hPls, [action.playerId], state.nightCount, state.gamePhase);
      var hOrder = window.computeNightOrder(state.roleConfig, state.nightCount + 1, cascH.players);
      return Object.assign({}, state, {
        players: cascH.players.map(function(p) { return p.cursed ? Object.assign({}, p, { cursed: false }) : p; }), deaths: state.deaths.concat([hd]).concat(cascH.extra), gamePhase: 'night',
        nightCount: state.nightCount + 1, currentRoleIndex: 0, nightOrder: hOrder,
        nightVictimId: null, selectedPlayerId: null, timerRunning: false, timerSeconds: 0, hunterDying: null
      });
    }

    case 'PROTECT_PLAYER':
      return Object.assign({}, state, {
        players: state.players.map(function(p) { return p.id === action.playerId ? Object.assign({}, p, { protected: true }) : p; }),
        selectedPlayerId: action.playerId
      });

    case 'CURSE_PLAYER':
      return Object.assign({}, state, {
        players: state.players.map(function(p) { return p.id === action.playerId ? Object.assign({}, p, { cursed: true }) : p; }),
        selectedPlayerId: action.playerId
      });

    case 'TOGGLE_LOVERS': {
      var already = state.loversSelected.includes(action.playerId);
      var nl = already
        ? state.loversSelected.filter(function(id) { return id !== action.playerId; })
        : state.loversSelected.concat([action.playerId]).slice(-2);
      return Object.assign({}, state, { loversSelected: nl });
    }

    case 'CONFIRM_LOVERS': {
      var l = action.playerIds || state.loversSelected;
      if (!l || l.length !== 2) return state;
      return Object.assign({}, state, {
        players: state.players.map(function(p) {
          if (p.id === l[0]) return Object.assign({}, p, { lovers: l[1] });
          if (p.id === l[1]) return Object.assign({}, p, { lovers: l[0] });
          return p;
        }),
        loversSelected: []
      });
    }

    case 'UNLINK_LOVERS': {
      return Object.assign({}, state, {
        players: state.players.map(function(p) {
          return (p.lovers !== null && p.lovers !== undefined) ? Object.assign({}, p, { lovers: null }) : p;
        }),
        loversSelected: []
      });
    }

    case 'WITCH_USE_LIFE':
      return Object.assign({}, state, { witchLifePotion: false, witchLifeInfo: { night: state.nightCount, targetId: action.victimId !== undefined ? action.victimId : state.nightVictimId }, nightVictimId: null, selectedPlayerId: null });

    case 'WITCH_USE_DEATH': {
      var wd = { id: Date.now() + Math.random(), playerId: action.playerId, cause: 'witch', night: state.nightCount, phase: 'night' };
      return Object.assign({}, state, {
        witchDeathPotion: false,
        witchDeathInfo: { night: state.nightCount, targetId: action.playerId },
        deaths: state.deaths.concat([wd]),
        players: state.players.map(function(p) { return p.id === action.playerId ? Object.assign({}, p, { alive: false }) : p; }),
        selectedPlayerId: null
      });
    }

    case 'WITCH_UNDO_DEATH': {
      // Annule la potion de mort : ressuscite la/les victime(s) de la Sorcière cette nuit, restaure la potion.
      var wDeaths = state.deaths.filter(function(d) { return d.cause === 'witch' && d.night === state.nightCount; });
      var revIds = wDeaths.map(function(d) { return d.playerId; });
      return Object.assign({}, state, {
        witchDeathPotion: true,
        witchDeathInfo: null,
        deaths: state.deaths.filter(function(d) { return !(d.cause === 'witch' && d.night === state.nightCount); }),
        players: state.players.map(function(p) { return revIds.indexOf(p.id) > -1 ? Object.assign({}, p, { alive: true, revealed: false }) : p; })
      });
    }

    case 'WITCH_UNDO_LIFE':
      // Annule la potion de vie : restaure la potion et remet la victime des Loups.
      return Object.assign({}, state, {
        witchLifePotion: true,
        witchLifeInfo: null,
        nightVictimId: (action.victimId !== null && action.victimId !== undefined) ? action.victimId : state.nightVictimId
      });

    case 'STEAL_ROLE': {
      // Le Voleur prend le rôle de la cible ; la cible devient Villageois
      var thief = state.players.find(function(p) { return p.role === 'VOLEUR' && p.alive; });
      var stealTarget = state.players.find(function(p) { return p.id === action.playerId; });
      if (!thief || !stealTarget) return state;
      var stolenRole = stealTarget.role;
      var afterSteal = state.players.map(function(p) {
        if (p.id === thief.id) return Object.assign({}, p, { role: stolenRole });
        if (p.id === stealTarget.id) return Object.assign({}, p, { role: 'VILLAGEOIS' });
        return p;
      });
      // Recalculer l'ordre de nuit (le Voleur peut devenir Loup, etc.)
      var afterOrder = window.computeNightOrder(state.roleConfig, state.nightCount, afterSteal);
      return Object.assign({}, state, { players: afterSteal, nightOrder: afterOrder });
    }

    case 'GRAVEDIGGER_TAKE_ROLE': {
      // Le Fossoyeur prend (ou échange contre) le rôle d'un joueur mort cette nuit.
      // Il garde son identité de Fossoyeur (diggerRole) pour pouvoir ré-exhumer les nuits suivantes.
      var digger = state.players.find(function(p) {
        return p.alive && (p.role === 'FOSSOYEUR' || (p.diggerRole !== null && p.diggerRole !== undefined));
      });
      var corpse = state.players.find(function(p) { return p.id === action.playerId; });
      if (!digger || !corpse) return state;
      var takenRole = corpse.role;
      var afterTake = state.players.map(function(p) {
        return p.id === digger.id ? Object.assign({}, p, { role: takenRole, diggerRole: takenRole }) : p;
      });
      var takeOrder = window.computeNightOrder(state.roleConfig, state.nightCount, afterTake);
      return Object.assign({}, state, { players: afterTake, nightOrder: takeOrder });
    }

    case 'RECORD_ACTION': {
      var others = state.nightActions.filter(function(a) {
        return !(a.night === action.night && a.roleId === action.roleId);
      });
      var hasTargets = action.targetIds && action.targetIds.length > 0;
      if (!hasTargets && !action.note) {
        return Object.assign({}, state, { nightActions: others });
      }
      var rec = {
        night: action.night, roleId: action.roleId,
        targetIds: action.targetIds || [], note: action.note || ''
      };
      return Object.assign({}, state, { nightActions: others.concat([rec]) });
    }

    case 'CLEAR_NIGHT_FLAG': {
      var ids = action.playerIds || [];
      return Object.assign({}, state, {
        players: state.players.map(function(p) {
          if (ids.indexOf(p.id) === -1) return p;
          var u = {}; u[action.flag] = false; return Object.assign({}, p, u);
        })
      });
    }

    case 'CHARM_PLAYER':
      return Object.assign({}, state, {
        players: state.players.map(function(p) { return p.id === action.playerId ? Object.assign({}, p, { enchanted: true }) : p; })
      });

    case 'DECLARE_WIN':
      // Le MJ valide une victoire détectée → écran de fin.
      return Object.assign({}, state, { gamePhase: 'victory', victory: action.win || null });

    case 'DISMISS_WIN':
      // Le MJ décide que ce n'est pas une victoire → la partie continue.
      return Object.assign({}, state, { victory: null });

    case 'SET_ENFANT_MODEL':
      return Object.assign({}, state, {
        players: state.players.map(function(p) { return p.role === 'ENFANT_SAUVAGE' ? Object.assign({}, p, { model: action.modelId }) : p; })
      });

    case 'SET_CHIENLOUP_CAMP': {
      // Le Chien-Loup choisit son camp (nuit 2). On bascule son rôle effectif
      // (Loup-Garou ou Villageois) pour la suite tout en gardant son identité d'origine.
      var clCamp = action.camp; // 'Loup' | 'Village' | null (annulation)
      return Object.assign({}, state, {
        players: state.players.map(function(p) {
          if (!(p.role === 'CHIEN_LOUP' || p.originRole === 'CHIEN_LOUP')) return p;
          if (!clCamp) return Object.assign({}, p, { originRole: undefined, clCamp: undefined, role: 'CHIEN_LOUP' });
          return Object.assign({}, p, { originRole: 'CHIEN_LOUP', clCamp: clCamp, role: clCamp === 'Loup' ? 'LOUP_GAROU' : 'VILLAGEOIS' });
        })
      });
    }

    case 'SISTER_REVENGE': {
      // La Sœur survivante tue une fois par partie (vengeance). Appliqué immédiatement, révélé à l'aube.
      var srd = { id: Date.now() + Math.random(), playerId: action.playerId, cause: 'sister', night: state.nightCount, phase: 'night' };
      return Object.assign({}, state, {
        sisterRevengeUsed: true,
        sisterRevengeInfo: { night: state.nightCount, targetId: action.playerId },
        deaths: state.deaths.concat([srd]),
        players: state.players.map(function(p) { return p.id === action.playerId ? Object.assign({}, p, { alive: false }) : p; })
      });
    }

    case 'SISTER_REVENGE_UNDO': {
      var srt = state.sisterRevengeInfo ? state.sisterRevengeInfo.targetId : null;
      return Object.assign({}, state, {
        sisterRevengeUsed: false,
        sisterRevengeInfo: null,
        deaths: state.deaths.filter(function(d) { return !(d.cause === 'sister' && d.night === state.nightCount); }),
        players: state.players.map(function(p) { return (srt !== null && p.id === srt) ? Object.assign({}, p, { alive: true, revealed: false }) : p; })
      });
    }

    case 'DEMENAGEUR_SWAP': {
      // Le Déménageur échange uniquement les NUMÉROS de 2 joueurs ; chacun garde son rôle et son statut
      var ids = action.playerIds || [];
      if (ids.length !== 2) return state;
      var a = ids[0], b = ids[1];
      var pa = state.players.find(function(p) { return p.id === a; });
      var pb = state.players.find(function(p) { return p.id === b; });
      if (!pa || !pb) return state;
      var swapped = state.players.map(function(p) {
        var np = Object.assign({}, p);
        if (p.id === a) { np.id = b; np.name = pb.name; }
        else if (p.id === b) { np.id = a; np.name = pa.name; }
        if (np.lovers === a) np.lovers = b;
        else if (np.lovers === b) np.lovers = a;
        return np;
      });
      return Object.assign({}, state, { players: swapped });
    }

    case 'ASSIGN_PLAYER_ROLE':
      return Object.assign({}, state, {
        players: state.players.map(function(p) { return p.id === action.playerId ? Object.assign({}, p, { role: action.roleId }) : p; })
      });

    case 'TOGGLE_REVEAL':
      return Object.assign({}, state, {
        players: state.players.map(function(p) { return p.id === action.id ? Object.assign({}, p, { revealed: !p.revealed }) : p; })
      });

    case 'SELECT_PLAYER':
      return Object.assign({}, state, { selectedPlayerId: action.playerId });

    case 'TIMER_SET':
      return Object.assign({}, state, { timerSeconds: action.seconds, timerRunning: false });

    case 'TIMER_TOGGLE':
      return Object.assign({}, state, { timerRunning: !state.timerRunning });

    case 'TIMER_TICK':
      if (!state.timerRunning || state.timerSeconds <= 0) return Object.assign({}, state, { timerRunning: false });
      return Object.assign({}, state, { timerSeconds: state.timerSeconds - 1 });

    // ── Sound ──────────────────────────────────────────────────────────
    case 'TOGGLE_SOUND':
      return Object.assign({}, state, { soundEnabled: !state.soundEnabled });

    case 'ADD_SOUND': {
      var lib = Object.assign({}, state.soundLibrary);
      lib[action.id] = { name: action.name, dataURL: action.dataURL };
      return Object.assign({}, state, { soundLibrary: lib });
    }

    case 'DELETE_SOUND': {
      var lib2 = Object.assign({}, state.soundLibrary);
      delete lib2[action.id];
      var updProfs = state.soundProfiles.map(function(p) {
        var a = Object.assign({}, p.assignments);
        Object.keys(a).forEach(function(k) { if (a[k] === action.id) delete a[k]; });
        return Object.assign({}, p, { assignments: a });
      });
      return Object.assign({}, state, { soundLibrary: lib2, soundProfiles: updProfs });
    }

    case 'RENAME_SOUND': {
      var lib3 = Object.assign({}, state.soundLibrary);
      if (lib3[action.id]) lib3[action.id] = Object.assign({}, lib3[action.id], { name: action.name });
      return Object.assign({}, state, { soundLibrary: lib3 });
    }

    case 'CREATE_PROFILE': {
      var newP = { id: 'p_' + Date.now(), name: action.name || 'Nouveau profil', assignments: {} };
      return Object.assign({}, state, {
        soundProfiles: state.soundProfiles.concat([newP]),
        soundProfile: newP.id
      });
    }

    case 'DELETE_PROFILE': {
      var rem = state.soundProfiles.filter(function(p) { return p.id !== action.id; });
      return Object.assign({}, state, { soundProfiles: rem, soundProfile: rem.length > 0 ? rem[0].id : '' });
    }

    case 'RENAME_PROFILE':
      return Object.assign({}, state, {
        soundProfiles: state.soundProfiles.map(function(p) {
          return p.id === action.id ? Object.assign({}, p, { name: action.name }) : p;
        })
      });

    case 'SET_PROFILE_SOUND':
      return Object.assign({}, state, {
        soundProfiles: state.soundProfiles.map(function(p) {
          if (p.id !== state.soundProfile) return p;
          var a = Object.assign({}, p.assignments);
          if (action.soundId) a[action.eventId] = action.soundId;
          else delete a[action.eventId];
          return Object.assign({}, p, { assignments: a });
        })
      });

    case 'SELECT_PROFILE':
      return Object.assign({}, state, { soundProfile: action.id });

    // ── UI ──────────────────────────────────────────────────────────────
    case 'TOGGLE_SOUND_MODAL':
      return Object.assign({}, state, { showSoundModal: !state.showSoundModal });

    case 'CLOSE_SOUND_MODAL':
      return Object.assign({}, state, { showSoundModal: false });

    case 'SET_LAYOUT':
      return Object.assign({}, state, { layoutMode: action.mode });

    case 'BACK_FROM_NIGHT':
      if (state.nightCount === 1) {
        return Object.assign({}, state, { screen: 'playerRoleAssign' });
      }
      return Object.assign({}, state, { gamePhase: 'day', nightVictimId: null, selectedPlayerId: null });

    case 'RESET_GAME':
      return makeInitial();

    default: return state;
  }
}

function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, null, makeInitial);
  const audioRef = useRef({});
  const currentSoundRef = useRef(null);
  const currentSoundEventRef = useRef(null);
  const [playingEventId, setPlayingEventId] = useStAC(null);

  // Timer
  useEffect(function() {
    if (!state.timerRunning) return;
    var id = setInterval(function() { dispatch({ type: 'TIMER_TICK' }); }, 1000);
    return function() { clearInterval(id); };
  }, [state.timerRunning]);

  // Persist sound config to localStorage
  useEffect(function() {
    try {
      localStorage.setItem('mj_sound_library', JSON.stringify(state.soundLibrary));
      localStorage.setItem('mj_sound_profiles', JSON.stringify(state.soundProfiles));
      localStorage.setItem('mj_sound_profile', state.soundProfile);
    } catch(e) {}
  }, [state.soundLibrary, state.soundProfiles, state.soundProfile]);

  const playSound = useCallback(function(eventId, overrideSoundId) {
    // Toggle: si le même son est en cours, on le stoppe
    if (currentSoundEventRef.current === eventId && currentSoundRef.current) {
      currentSoundRef.current.pause();
      currentSoundRef.current.currentTime = 0;
      currentSoundRef.current = null;
      currentSoundEventRef.current = null;
      setPlayingEventId(null);
      return;
    }
    // Stopper tout son en cours avant d'en lancer un nouveau
    if (currentSoundRef.current) {
      currentSoundRef.current.pause();
      currentSoundRef.current = null;
      currentSoundEventRef.current = null;
      setPlayingEventId(null);
    }
    if (!state.soundEnabled) return;
    var soundId = overrideSoundId;
    if (!soundId) {
      var profile = state.soundProfiles.find(function(p) { return p.id === state.soundProfile; });
      if (!profile) return;
      soundId = profile.assignments[eventId];
    }
    if (!soundId) return;
    var sound = state.soundLibrary[soundId];
    if (!sound || !sound.dataURL) return;
    try {
      var audio = new Audio(sound.dataURL);
      currentSoundRef.current = audio;
      currentSoundEventRef.current = eventId;
      setPlayingEventId(eventId);
      audio.onended = function() {
        currentSoundRef.current = null;
        currentSoundEventRef.current = null;
        setPlayingEventId(null);
      };
      audio.play().catch(function() {
        currentSoundRef.current = null;
        currentSoundEventRef.current = null;
        setPlayingEventId(null);
      });
    } catch(e) {
      currentSoundRef.current = null;
      currentSoundEventRef.current = null;
      setPlayingEventId(null);
    }
  }, [state.soundEnabled, state.soundProfiles, state.soundProfile, state.soundLibrary]);

  return React.createElement(GameCtx.Provider, { value: { state, dispatch, playSound, playingEventId } }, children);
}

function useGame() { return useContext(GameCtx); }
Object.assign(window, { GameProvider, useGame });
