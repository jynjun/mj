import type { Action, Death, GameState, Player, RoleId } from './types';
import type { EngineDeps } from './rng';
import { defaultDeps, shuffle } from './rng';
import { ROLES_DATA } from './data/roles';
import { computeNightOrder } from './rules/nightOrder';
import { cascadeDeaths } from './rules/cascade';
import { getRandomRolePool } from './rules/rolePool';
import { makeInitialState } from './state';

/**
 * Reducer pur du moteur (portage de gameReducer, jsx/AppContext.jsx). Les actions
 * de son et l'audio restent hors moteur. L'aleatoire, le temps et les identifiants
 * sont injectes via `deps` (cf. rng.ts) pour des snapshots de tests stables.
 */
function reduce(state: GameState, action: Action, deps: EngineDeps): GameState {
  switch (action.type) {
    case 'SET_SCREEN':
      return { ...state, screen: action.screen };

    case 'SET_PLAYER_COUNT': {
      const c = Math.max(4, Math.min(25, action.count));
      return { ...state, playerCount: c, roleConfig: {} };
    }

    case 'INIT_PLAYERS': {
      const pool = shuffle(getRandomRolePool(state.playerCount), deps.rng);
      const ps: Player[] = Array.from({ length: state.playerCount }, (_, i) => ({
        id: i + 1,
        name: 'Joueur ' + (i + 1),
        role: pool[i] ?? 'VILLAGEOIS',
        alive: true,
        revealed: false,
        protected: false,
        cursed: false,
        lovers: null,
        idiotRevealed: false,
        enchanted: false,
        model: null,
        elderLifeUsed: false,
        diggerRole: null,
      }));
      return { ...state, players: ps };
    }

    case 'SET_PLAYER_NAME':
      return {
        ...state,
        players: state.players.map((p) => (p.id === action.id ? { ...p, name: action.name } : p)),
      };

    case 'SHUFFLE_ROLES': {
      let pool2: RoleId[] = [];
      (Object.entries(state.roleConfig) as [RoleId, number][]).forEach(([rid, cnt]) => {
        for (let i = 0; i < cnt; i++) pool2.push(rid);
      });
      while (pool2.length < state.players.length) pool2.push('VILLAGEOIS');
      pool2 = shuffle(pool2, deps.rng).slice(0, state.players.length);
      return {
        ...state,
        players: state.players.map((p, i) => ({ ...p, role: pool2[i] ?? 'VILLAGEOIS', revealed: false })),
        assignIndex: 0,
      };
    }

    case 'SET_ASSIGN_INDEX':
      return { ...state, assignIndex: action.index };

    case 'START_GAME': {
      const order = computeNightOrder(1, state.players);
      const cleanPls = state.players.map((p) => ({ ...p, revealed: false }));
      return {
        ...state,
        screen: 'game', gamePhase: 'night', nightCount: 1, currentRoleIndex: 0,
        nightOrder: order, nightVictimId: null, witchLifePotion: true, witchDeathPotion: true,
        witchDeathInfo: null, deaths: [], pendingDeaths: [], players: cleanPls,
        timerRunning: false, timerSeconds: 0, hunterDying: null, loversSelected: [],
        nightActions: [], dawnNotes: [], witchLifeInfo: null, sisterRevengeUsed: false,
        sisterRevengeInfo: null, victory: null,
      };
    }

    case 'NEXT_NIGHT_ROLE': {
      const next = state.currentRoleIndex + 1;
      if (next >= state.nightOrder.length) {
        return { ...state, gamePhase: 'dawn', selectedPlayerId: null };
      }
      return { ...state, currentRoleIndex: next, selectedPlayerId: null };
    }

    case 'SET_NIGHT_VICTIM':
      return { ...state, nightVictimId: action.playerId, selectedPlayerId: action.playerId };

    case 'CLEAR_NIGHT_VICTIM':
      return { ...state, nightVictimId: null, selectedPlayerId: null };

    case 'PROCEED_DAWN': {
      // Toutes les victimes "de type Loup" : proie des Loups + 2eme proie du Grand Mechant Loup
      const wolfVictimIds: number[] = [];
      if (state.nightVictimId !== null && state.nightVictimId !== undefined) {
        wolfVictimIds.push(state.nightVictimId);
      }
      const gmlRec = state.nightActions.find(
        (a) => a.night === state.nightCount && a.roleId === 'GRAND_MECHANT_LOUP',
      );
      if (gmlRec && gmlRec.targetIds.length > 0) {
        const gid = gmlRec.targetIds[0]!;
        if (wolfVictimIds.indexOf(gid) === -1) wolfVictimIds.push(gid);
      }
      const elderSavedIds: number[] = [];
      const wolfDeaths: Death[] = [];
      wolfVictimIds.forEach((vid) => {
        const vic = state.players.find((p) => p.id === vid);
        if (!vic || !vic.alive || vic.protected) return;
        if (vic.role === 'ANCIEN' && !vic.elderLifeUsed && elderSavedIds.indexOf(vic.id) === -1) {
          elderSavedIds.push(vic.id); // L'Ancien survit a sa 1ere attaque des Loups
        } else {
          wolfDeaths.push({ id: deps.nextId(), playerId: vid, cause: 'wolves', night: state.nightCount, phase: 'night' });
        }
      });
      // Morts deja appliquees cette nuit par d'autres pouvoirs (Sorciere, Soeur survivante)
      const otherNightDeaths = state.deaths.filter(
        (d) => (d.cause === 'witch' || d.cause === 'sister') && d.night === state.nightCount,
      );
      const basePending = otherNightDeaths.concat(wolfDeaths);
      const updPl = state.players.map((p) => {
        if (wolfDeaths.some((d) => d.playerId === p.id)) return { ...p, alive: false, protected: false };
        if (elderSavedIds.indexOf(p.id) > -1) return { ...p, elderLifeUsed: true, protected: false };
        return { ...p, protected: false };
      });
      const deadIds = basePending.map((d) => d.playerId);
      const casc = cascadeDeaths(updPl, deadIds, state.nightCount, 'night', deps);
      const allPending = basePending.concat(casc.extra);
      const newDeaths = wolfDeaths.concat(casc.extra);
      let hunterId: number | null = null;
      allPending.forEach((d) => {
        const pl = casc.players.find((p) => p.id === d.playerId);
        if (pl && pl.role === 'CHASSEUR') hunterId = pl.id;
      });
      return {
        ...state,
        gamePhase: 'dawn', players: casc.players, deaths: state.deaths.concat(newDeaths),
        pendingDeaths: allPending, nightVictimId: null, selectedPlayerId: null, hunterDying: hunterId,
        dawnNotes: casc.notes.concat(
          elderSavedIds.map(
            (id) => "\u{1F474} L'Ancien (J" + id + ') a survecu a l\'attaque des Loups grace a sa vie supplementaire.',
          ),
        ),
      };
    }

    case 'CONFIRM_DAWN':
      return { ...state, gamePhase: 'day', pendingDeaths: [], dawnNotes: [] };

    case 'START_DEBATE': {
      const secs = action.seconds || 0;
      return { ...state, gamePhase: 'day', pendingDeaths: [], dawnNotes: [], timerSeconds: secs, timerRunning: secs > 0 };
    }

    case 'START_VOTE':
      return { ...state, gamePhase: 'vote' };

    case 'ELIMINATE_PLAYER': {
      const tgt = state.players.find((p) => p.id === action.playerId);
      if (!tgt) return state;
      if (tgt.role === 'IDIOT' && !tgt.idiotRevealed) {
        return {
          ...state,
          players: state.players.map((p) =>
            p.id === action.playerId ? { ...p, idiotRevealed: true, revealed: true } : p,
          ),
        };
      }
      const dr: Death = { id: deps.nextId(), playerId: action.playerId, cause: 'lynch', night: state.nightCount, phase: 'day' };
      let newPls = state.players.map((p) => (p.id === action.playerId ? { ...p, alive: false, revealed: true } : p));
      // Ancien lynche par le village -> tous les villageois perdent leur pouvoir
      const ancienLynched = tgt.role === 'ANCIEN';
      if (ancienLynched) {
        newPls = newPls.map((p) => {
          const rdp = ROLES_DATA[p.role];
          if (p.id === action.playerId) return p;
          if (rdp && rdp.team === 'village' && p.role !== 'VILLAGEOIS') return { ...p, role: 'VILLAGEOIS' };
          return p;
        });
      }
      if (tgt.role === 'CHASSEUR') {
        return { ...state, players: newPls, deaths: state.deaths.concat([dr]), gamePhase: 'hunter', hunterDying: action.playerId };
      }
      const cascL = cascadeDeaths(newPls, [action.playerId], state.nightCount, 'day', deps);
      const no = computeNightOrder(state.nightCount + 1, cascL.players);
      return {
        ...state,
        players: cascL.players.map((p) => (p.cursed ? { ...p, cursed: false } : p)),
        deaths: state.deaths.concat([dr]).concat(cascL.extra),
        gamePhase: 'night', nightCount: state.nightCount + 1, currentRoleIndex: 0, nightOrder: no,
        nightVictimId: null, selectedPlayerId: null, timerRunning: false, timerSeconds: 0, hunterDying: null,
        ancienPowerLost: ancienLynched ? true : state.ancienPowerLost,
      };
    }

    case 'SKIP_VOTE': {
      const so = computeNightOrder(state.nightCount + 1, state.players);
      return {
        ...state,
        players: state.players.map((p) => (p.cursed ? { ...p, cursed: false } : p)),
        gamePhase: 'night', nightCount: state.nightCount + 1, currentRoleIndex: 0, nightOrder: so,
        timerRunning: false, timerSeconds: 0,
      };
    }

    case 'HUNTER_SHOOT': {
      const hd: Death = { id: deps.nextId(), playerId: action.playerId, cause: 'hunter', night: state.nightCount, phase: state.gamePhase };
      const hPls = state.players.map((p) => (p.id === action.playerId ? { ...p, alive: false, revealed: true } : p));
      const cascH = cascadeDeaths(hPls, [action.playerId], state.nightCount, state.gamePhase, deps);
      const hOrder = computeNightOrder(state.nightCount + 1, cascH.players);
      return {
        ...state,
        players: cascH.players.map((p) => (p.cursed ? { ...p, cursed: false } : p)),
        deaths: state.deaths.concat([hd]).concat(cascH.extra),
        gamePhase: 'night', nightCount: state.nightCount + 1, currentRoleIndex: 0, nightOrder: hOrder,
        nightVictimId: null, selectedPlayerId: null, timerRunning: false, timerSeconds: 0, hunterDying: null,
      };
    }

    case 'PROTECT_PLAYER':
      return {
        ...state,
        players: state.players.map((p) => (p.id === action.playerId ? { ...p, protected: true } : p)),
        selectedPlayerId: action.playerId,
      };

    case 'CURSE_PLAYER':
      return {
        ...state,
        players: state.players.map((p) => (p.id === action.playerId ? { ...p, cursed: true } : p)),
        selectedPlayerId: action.playerId,
      };

    case 'TOGGLE_LOVERS': {
      const already = state.loversSelected.includes(action.playerId);
      const nl = already
        ? state.loversSelected.filter((id) => id !== action.playerId)
        : state.loversSelected.concat([action.playerId]).slice(-2);
      return { ...state, loversSelected: nl };
    }

    case 'CONFIRM_LOVERS': {
      const l = action.playerIds || state.loversSelected;
      if (!l || l.length !== 2) return state;
      return {
        ...state,
        players: state.players.map((p) => {
          if (p.id === l[0]) return { ...p, lovers: l[1]! };
          if (p.id === l[1]) return { ...p, lovers: l[0]! };
          return p;
        }),
        loversSelected: [],
      };
    }

    case 'UNLINK_LOVERS':
      return {
        ...state,
        players: state.players.map((p) =>
          p.lovers !== null && p.lovers !== undefined ? { ...p, lovers: null } : p,
        ),
        loversSelected: [],
      };

    case 'WITCH_USE_LIFE':
      return {
        ...state,
        witchLifePotion: false,
        witchLifeInfo: { night: state.nightCount, targetId: action.victimId !== undefined ? action.victimId : state.nightVictimId },
        nightVictimId: null, selectedPlayerId: null,
      };

    case 'WITCH_USE_DEATH': {
      const wd: Death = { id: deps.nextId(), playerId: action.playerId, cause: 'witch', night: state.nightCount, phase: 'night' };
      return {
        ...state,
        witchDeathPotion: false,
        witchDeathInfo: { night: state.nightCount, targetId: action.playerId },
        deaths: state.deaths.concat([wd]),
        players: state.players.map((p) => (p.id === action.playerId ? { ...p, alive: false } : p)),
        selectedPlayerId: null,
      };
    }

    case 'WITCH_UNDO_DEATH': {
      const wDeaths = state.deaths.filter((d) => d.cause === 'witch' && d.night === state.nightCount);
      const revIds = wDeaths.map((d) => d.playerId);
      return {
        ...state,
        witchDeathPotion: true,
        witchDeathInfo: null,
        deaths: state.deaths.filter((d) => !(d.cause === 'witch' && d.night === state.nightCount)),
        players: state.players.map((p) => (revIds.indexOf(p.id) > -1 ? { ...p, alive: true, revealed: false } : p)),
      };
    }

    case 'WITCH_UNDO_LIFE':
      return {
        ...state,
        witchLifePotion: true,
        witchLifeInfo: null,
        nightVictimId: action.victimId !== null && action.victimId !== undefined ? action.victimId : state.nightVictimId,
      };

    case 'STEAL_ROLE': {
      // Le Voleur prend le role de la cible ; la cible devient Villageois
      const thief = state.players.find((p) => p.role === 'VOLEUR' && p.alive);
      const stealTarget = state.players.find((p) => p.id === action.playerId);
      if (!thief || !stealTarget) return state;
      const stolenRole = stealTarget.role;
      const afterSteal = state.players.map((p) => {
        if (p.id === thief.id) return { ...p, role: stolenRole };
        if (p.id === stealTarget.id) return { ...p, role: 'VILLAGEOIS' as RoleId };
        return p;
      });
      const afterOrder = computeNightOrder(state.nightCount, afterSteal);
      return { ...state, players: afterSteal, nightOrder: afterOrder };
    }

    case 'GRAVEDIGGER_TAKE_ROLE': {
      // Le Fossoyeur prend le role d'un mort de la nuit, garde son tour (diggerRole).
      const digger = state.players.find(
        (p) => p.alive && (p.role === 'FOSSOYEUR' || (p.diggerRole !== null && p.diggerRole !== undefined)),
      );
      const corpse = state.players.find((p) => p.id === action.playerId);
      if (!digger || !corpse) return state;
      const takenRole = corpse.role;
      const afterTake = state.players.map((p) =>
        p.id === digger.id ? { ...p, role: takenRole, diggerRole: takenRole } : p,
      );
      const takeOrder = computeNightOrder(state.nightCount, afterTake);
      return { ...state, players: afterTake, nightOrder: takeOrder };
    }

    case 'RECORD_ACTION': {
      const others = state.nightActions.filter(
        (a) => !(a.night === action.night && a.roleId === action.roleId),
      );
      const hasTargets = action.targetIds && action.targetIds.length > 0;
      if (!hasTargets && !action.note) {
        return { ...state, nightActions: others };
      }
      const rec = {
        night: action.night, roleId: action.roleId,
        targetIds: action.targetIds || [], note: action.note || '',
      };
      return { ...state, nightActions: others.concat([rec]) };
    }

    case 'CLEAR_NIGHT_FLAG': {
      const ids = action.playerIds || [];
      return {
        ...state,
        players: state.players.map((p) =>
          ids.indexOf(p.id) === -1 ? p : ({ ...p, [action.flag]: false } as Player),
        ),
      };
    }

    case 'CHARM_PLAYER':
      return {
        ...state,
        players: state.players.map((p) => (p.id === action.playerId ? { ...p, enchanted: true } : p)),
      };

    case 'DECLARE_WIN':
      return { ...state, gamePhase: 'victory', victory: action.win || null };

    case 'DISMISS_WIN':
      return { ...state, victory: null };

    case 'SET_ENFANT_MODEL':
      return {
        ...state,
        players: state.players.map((p) => (p.role === 'ENFANT_SAUVAGE' ? { ...p, model: action.modelId } : p)),
      };

    case 'SET_CHIENLOUP_CAMP': {
      const clCamp = action.camp; // 'Loup' | 'Village' | null (annulation)
      return {
        ...state,
        players: state.players.map((p) => {
          if (!(p.role === 'CHIEN_LOUP' || p.originRole === 'CHIEN_LOUP')) return p;
          if (!clCamp) return { ...p, originRole: undefined, clCamp: undefined, role: 'CHIEN_LOUP' as RoleId };
          return {
            ...p,
            originRole: 'CHIEN_LOUP' as RoleId,
            clCamp,
            role: (clCamp === 'Loup' ? 'LOUP_GAROU' : 'VILLAGEOIS') as RoleId,
          };
        }),
      };
    }

    case 'SISTER_REVENGE': {
      const srd: Death = { id: deps.nextId(), playerId: action.playerId, cause: 'sister', night: state.nightCount, phase: 'night' };
      return {
        ...state,
        sisterRevengeUsed: true,
        sisterRevengeInfo: { night: state.nightCount, targetId: action.playerId },
        deaths: state.deaths.concat([srd]),
        players: state.players.map((p) => (p.id === action.playerId ? { ...p, alive: false } : p)),
      };
    }

    case 'SISTER_REVENGE_UNDO': {
      const srt = state.sisterRevengeInfo ? state.sisterRevengeInfo.targetId : null;
      return {
        ...state,
        sisterRevengeUsed: false,
        sisterRevengeInfo: null,
        deaths: state.deaths.filter((d) => !(d.cause === 'sister' && d.night === state.nightCount)),
        players: state.players.map((p) => (srt !== null && p.id === srt ? { ...p, alive: true, revealed: false } : p)),
      };
    }

    case 'DEMENAGEUR_SWAP': {
      // Echange uniquement les NUMEROS de 2 joueurs ; chacun garde role et statut
      const ids = action.playerIds || [];
      if (ids.length !== 2) return state;
      const a = ids[0]!;
      const b = ids[1]!;
      const pa = state.players.find((p) => p.id === a);
      const pb = state.players.find((p) => p.id === b);
      if (!pa || !pb) return state;
      const swapped = state.players.map((p) => {
        const np: Player = { ...p };
        if (p.id === a) { np.id = b; np.name = pb.name; }
        else if (p.id === b) { np.id = a; np.name = pa.name; }
        if (np.lovers === a) np.lovers = b;
        else if (np.lovers === b) np.lovers = a;
        return np;
      });
      return { ...state, players: swapped };
    }

    case 'ASSIGN_PLAYER_ROLE':
      return {
        ...state,
        players: state.players.map((p) => (p.id === action.playerId ? { ...p, role: action.roleId } : p)),
      };

    case 'TOGGLE_REVEAL':
      return {
        ...state,
        players: state.players.map((p) => (p.id === action.id ? { ...p, revealed: !p.revealed } : p)),
      };

    case 'SELECT_PLAYER':
      return { ...state, selectedPlayerId: action.playerId };

    case 'TIMER_SET':
      return { ...state, timerSeconds: action.seconds, timerRunning: false };

    case 'TIMER_TOGGLE':
      return { ...state, timerRunning: !state.timerRunning };

    case 'TIMER_TICK':
      if (!state.timerRunning || state.timerSeconds <= 0) return { ...state, timerRunning: false };
      return { ...state, timerSeconds: state.timerSeconds - 1 };

    case 'SET_LAYOUT':
      return { ...state, layoutMode: action.mode };

    case 'BACK_FROM_NIGHT':
      if (state.nightCount === 1) return { ...state, screen: 'playerRoleAssign' };
      return { ...state, gamePhase: 'day', nightVictimId: null, selectedPlayerId: null };

    case 'RESET_GAME':
      return makeInitialState(deps);

    default:
      return state;
  }
}

/**
 * Reducer public. Estampille `updatedAt` a chaque transition effective (utile
 * pour la sauvegarde-reprise et la sync future). `deps` est optionnel : par
 * defaut, aleatoire systeme + horloge reelle.
 */
export function gameReducer(state: GameState, action: Action, deps: EngineDeps = defaultDeps): GameState {
  const next = reduce(state, action, deps);
  return next === state ? state : { ...next, updatedAt: deps.now() };
}
