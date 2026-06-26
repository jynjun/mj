/**
 * Types du moteur de jeu Loup-Garou (portage du SPA legacy : js/gameData.js +
 * jsx/AppContext.jsx). Aucune dependance React/DOM. Etat serialisable.
 */

/** Les 22 roles du SPA + IDIOT (utilise dans ELIMINATE_PLAYER mais absent du legacy). */
export type RoleId =
  | 'VILLAGEOIS'
  | 'VOYANTE'
  | 'SORCIERE'
  | 'CUPIDON'
  | 'CHASSEUR'
  | 'SALVATEUR'
  | 'CORBEAU'
  | 'ANCIEN'
  | 'DEMENAGEUR'
  | 'SOEUR_1'
  | 'SOEUR_2'
  | 'RENARD'
  | 'MONTREUR_OURS'
  | 'JUGE_BEGUE'
  | 'CHIEN_LOUP'
  | 'VOLEUR'
  | 'ENFANT_SAUVAGE'
  | 'FOSSOYEUR'
  | 'LOUP_GAROU'
  | 'GRAND_MECHANT_LOUP'
  | 'LOUP_BLANC'
  | 'JOUEUR_FLUTE'
  | 'IDIOT';

export type Team = 'village' | 'loupgarou' | 'loupblanc' | 'solitaire';

export interface Role {
  id: RoleId;
  name: string;
  plural: string;
  team: Team;
  emoji: string;
  color: string;
  bgColor: string;
  description: string;
  /** Position dans l'ordre de nuit ; null = pas appele la nuit. */
  nightOrder: number | null;
  category: string;
  nightInstruction?: string;
  firstNightOnly?: boolean;
  secondNightOnly?: boolean;
  notBeforeNight?: number;
  everyOtherNight?: boolean;
  onDeath?: boolean;
  special?: string;
}

export interface GameInfo {
  id: string;
  name: string;
  subtitle: string;
  emoji: string;
  minPlayers: number;
  maxPlayers: number;
  description: string;
}

export type ClCamp = 'Loup' | 'Village';

export interface Player {
  id: number;
  name: string;
  role: RoleId;
  alive: boolean;
  revealed: boolean;
  protected: boolean;
  cursed: boolean;
  /** id de l'amoureux lie, ou null. */
  lovers: number | null;
  idiotRevealed: boolean;
  enchanted: boolean;
  /** Modele de l'Enfant Sauvage. */
  model: number | null;
  elderLifeUsed: boolean;
  /** Role d'origine du Fossoyeur apres exhumation (garde son tour). */
  diggerRole: RoleId | null;
  /** Role d'origine memorise (Chien-Loup). */
  originRole?: RoleId;
  clCamp?: ClCamp;
}

export type DeathCause = 'wolves' | 'witch' | 'sister' | 'lynch' | 'hunter' | 'lovers';

export type GamePhase = 'night' | 'dawn' | 'day' | 'vote' | 'hunter' | 'victory';

export type Screen = 'home' | 'playerRoleAssign' | 'assign' | 'game';

export type LayoutMode = 'focused' | 'dashboard';

export interface Death {
  id: string;
  playerId: number;
  cause: DeathCause;
  night: number;
  phase: GamePhase;
}

export interface NightAction {
  night: number;
  roleId: RoleId;
  targetIds: number[];
  note: string;
}

export interface PotionInfo {
  night: number;
  targetId: number | null;
}

export interface Victory {
  key: string;
  title: string;
  emoji: string;
  color: string;
  soundEvent: string;
  players: number[];
  reason: string;
}

export interface GameState {
  /** Identite et serialisation (sauvegarde/reprise, sync future). */
  id: string;
  schemaVersion: number;
  updatedAt: number;

  screen: Screen;
  selectedGame: string;
  playerCount: number;
  roleConfig: Partial<Record<RoleId, number>>;
  players: Player[];
  assignIndex: number;
  gamePhase: GamePhase;
  nightCount: number;
  currentRoleIndex: number;
  nightOrder: RoleId[];
  nightVictimId: number | null;
  witchLifePotion: boolean;
  witchDeathPotion: boolean;
  witchDeathInfo: PotionInfo | null;
  witchLifeInfo: PotionInfo | null;
  deaths: Death[];
  pendingDeaths: Death[];
  timerSeconds: number;
  timerRunning: boolean;
  selectedPlayerId: number | null;
  layoutMode: LayoutMode;
  hunterDying: number | null;
  loversSelected: number[];
  nightActions: NightAction[];
  dawnNotes: string[];
  sisterRevengeUsed: boolean;
  sisterRevengeInfo: PotionInfo | null;
  /** Pouvoir du village perdu si l'Ancien est lynche (formalise, cf. legacy non initialise). */
  ancienPowerLost: boolean;
  victory: Victory | null;
}

/** Union discriminee des actions de jeu (le son et l'audio restent hors moteur). */
export type Action =
  | { type: 'SET_SCREEN'; screen: Screen }
  | { type: 'SET_PLAYER_COUNT'; count: number }
  | { type: 'INIT_PLAYERS' }
  | { type: 'SET_PLAYER_NAME'; id: number; name: string }
  | { type: 'SHUFFLE_ROLES' }
  | { type: 'SET_ASSIGN_INDEX'; index: number }
  | { type: 'START_GAME' }
  | { type: 'NEXT_NIGHT_ROLE' }
  | { type: 'SET_NIGHT_VICTIM'; playerId: number }
  | { type: 'CLEAR_NIGHT_VICTIM' }
  | { type: 'PROCEED_DAWN' }
  | { type: 'CONFIRM_DAWN' }
  | { type: 'START_DEBATE'; seconds?: number }
  | { type: 'START_VOTE' }
  | { type: 'ELIMINATE_PLAYER'; playerId: number }
  | { type: 'SKIP_VOTE' }
  | { type: 'HUNTER_SHOOT'; playerId: number }
  | { type: 'PROTECT_PLAYER'; playerId: number }
  | { type: 'CURSE_PLAYER'; playerId: number }
  | { type: 'TOGGLE_LOVERS'; playerId: number }
  | { type: 'CONFIRM_LOVERS'; playerIds?: number[] }
  | { type: 'UNLINK_LOVERS' }
  | { type: 'WITCH_USE_LIFE'; victimId?: number | null }
  | { type: 'WITCH_USE_DEATH'; playerId: number }
  | { type: 'WITCH_UNDO_DEATH' }
  | { type: 'WITCH_UNDO_LIFE'; victimId?: number | null }
  | { type: 'STEAL_ROLE'; playerId: number }
  | { type: 'GRAVEDIGGER_TAKE_ROLE'; playerId: number }
  | { type: 'RECORD_ACTION'; night: number; roleId: RoleId; targetIds?: number[]; note?: string }
  | { type: 'CLEAR_NIGHT_FLAG'; flag: keyof Player; playerIds?: number[] }
  | { type: 'CHARM_PLAYER'; playerId: number }
  | { type: 'DECLARE_WIN'; win?: Victory | null }
  | { type: 'DISMISS_WIN' }
  | { type: 'SET_ENFANT_MODEL'; modelId: number }
  | { type: 'SET_CHIENLOUP_CAMP'; camp: ClCamp | null }
  | { type: 'SISTER_REVENGE'; playerId: number }
  | { type: 'SISTER_REVENGE_UNDO' }
  | { type: 'DEMENAGEUR_SWAP'; playerIds: number[] }
  | { type: 'ASSIGN_PLAYER_ROLE'; playerId: number; roleId: RoleId }
  | { type: 'TOGGLE_REVEAL'; id: number }
  | { type: 'SELECT_PLAYER'; playerId: number | null }
  | { type: 'TIMER_SET'; seconds: number }
  | { type: 'TIMER_TOGGLE' }
  | { type: 'TIMER_TICK' }
  | { type: 'SET_LAYOUT'; mode: LayoutMode }
  | { type: 'BACK_FROM_NIGHT' }
  | { type: 'RESET_GAME' };
