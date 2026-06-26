import type { GameInfo, Role, RoleId, Team } from '../types';

/** Donnees statiques portees depuis js/gameData.js (les donnees son restent hors moteur). */

export const GAMES_LIST = [
  {
    id: 'loup-garou',
    name: 'Loup-Garou de Thiercelieux',
    subtitle: 'Le classique des jeux de role en groupe',
    emoji: '\u{1F43A}',
    minPlayers: 4,
    maxPlayers: 25,
    description: '4-25 joueurs - 30-90 min',
  },
] satisfies GameInfo[];

export const ROLES_DATA: Record<RoleId, Role> = {
  // --- VILLAGE -------------------------------------------------------------
  VILLAGEOIS: {
    id: 'VILLAGEOIS', name: 'Villageois', plural: 'Villageois',
    team: 'village', emoji: '\u{1F3E1}',
    color: '#5c9eff', bgColor: 'rgba(92,158,255,0.09)',
    description: "Aucun pouvoir special. Doit identifier les Loups par deduction.",
    nightOrder: null, category: 'Village',
  },
  VOYANTE: {
    id: 'VOYANTE', name: 'Voyante', plural: 'Voyante',
    team: 'village', emoji: '\u{1F441}\u{FE0F}',
    color: '#a78bfa', bgColor: 'rgba(167,139,250,0.09)',
    description: "Chaque nuit, regarde l'identite d'un joueur.",
    nightOrder: 30, category: 'Village',
    nightInstruction: 'La Voyante designe un joueur - revelez-lui son role silencieusement.',
  },
  SORCIERE: {
    id: 'SORCIERE', name: 'Sorciere', plural: 'Sorciere',
    team: 'village', emoji: '\u{1F9D9}',
    color: '#34d399', bgColor: 'rgba(52,211,153,0.09)',
    description: 'Possede une potion de vie et une potion de mort (une fois chacune).',
    nightOrder: 50, category: 'Village',
    nightInstruction: 'Montrez la victime des Loups a la Sorciere. Elle peut utiliser ses potions.',
  },
  CUPIDON: {
    id: 'CUPIDON', name: 'Cupidon', plural: 'Cupidon',
    team: 'village', emoji: '\u{1F498}',
    color: '#f472b6', bgColor: 'rgba(244,114,182,0.09)',
    description: 'La 1ere nuit, designe deux amoureux lies jusqu\'a la mort.',
    nightOrder: 5, firstNightOnly: true, category: 'Village',
    nightInstruction: 'Cupidon designe deux joueurs qui seront amoureux pour toute la partie.',
  },
  CHASSEUR: {
    id: 'CHASSEUR', name: 'Chasseur', plural: 'Chasseur',
    team: 'village', emoji: '\u{1F3F9}',
    color: '#fb923c', bgColor: 'rgba(251,146,60,0.09)',
    description: 'A sa mort, elimine immediatement un joueur de son choix.',
    nightOrder: null, onDeath: true, category: 'Village',
  },
  SALVATEUR: {
    id: 'SALVATEUR', name: 'Salvateur', plural: 'Salvateur',
    team: 'village', emoji: '\u{1F6E1}\u{FE0F}',
    color: '#2dd4bf', bgColor: 'rgba(45,212,191,0.09)',
    description: 'Chaque nuit, protege un joueur des attaques des Loups.',
    nightOrder: 55, category: 'Village',
    nightInstruction: 'Le Salvateur indique silencieusement un joueur a proteger cette nuit.',
  },
  CORBEAU: {
    id: 'CORBEAU', name: 'Corbeau', plural: 'Corbeau',
    team: 'village', emoji: '\u{1F426}\u{200D}\u{2B1B}',
    color: '#9ca3af', bgColor: 'rgba(156,163,175,0.09)',
    description: 'Chaque nuit, peut jeter une malediction sur un joueur (+2 votes).',
    nightOrder: 60, category: 'Village',
    nightInstruction: 'Le Corbeau indique silencieusement un joueur a maudire (+2 votes demain).',
  },
  ANCIEN: {
    id: 'ANCIEN', name: 'Ancien', plural: 'Ancien',
    team: 'village', emoji: '\u{1F474}',
    color: '#c4a882', bgColor: 'rgba(196,168,130,0.09)',
    description: "Survit a la 1ere attaque des Loups (une vie supplementaire). S'il est lynche, tous les roles speciaux du village disparaissent.",
    nightOrder: null, category: 'Village',
  },
  DEMENAGEUR: {
    id: 'DEMENAGEUR', name: 'Demenageur', plural: 'Demenageur',
    team: 'village', emoji: '\u{1F4E6}',
    color: '#94a3b8', bgColor: 'rgba(148,163,184,0.09)',
    description: 'Des la 2eme nuit, echange les roles de 2 joueurs chaque nuit.',
    nightOrder: 6, notBeforeNight: 2, category: 'Village',
    nightInstruction: 'Le Demenageur echange discretement les cartes de deux joueurs.',
  },
  SOEUR_1: {
    id: 'SOEUR_1', name: 'Soeur 1', plural: 'Les Soeurs',
    team: 'village', emoji: '\u{1F469}',
    color: '#f9a8d4', bgColor: 'rgba(249,168,212,0.09)',
    description: "Les deux Soeurs se connaissent des la 1ere nuit et s'entraident jusqu'a la fin.",
    nightOrder: 8, firstNightOnly: true, category: 'Village',
    nightInstruction: "Les deux Soeurs s'eveillent ensemble et se reconnaissent en silence.",
  },
  SOEUR_2: {
    id: 'SOEUR_2', name: 'Soeur 2', plural: 'Les Soeurs',
    team: 'village', emoji: '\u{1F469}',
    color: '#f9a8d4', bgColor: 'rgba(249,168,212,0.09)',
    description: "Les deux Soeurs se connaissent des la 1ere nuit et s'entraident jusqu'a la fin.",
    nightOrder: null, category: 'Village',
  },
  RENARD: {
    id: 'RENARD', name: 'Renard', plural: 'Renard',
    team: 'village', emoji: '\u{1F98A}',
    color: '#f97316', bgColor: 'rgba(249,115,22,0.09)',
    description: 'Chaque nuit, designe 3 joueurs adjacents. Le MJ indique si un Loup est parmi eux.',
    nightOrder: 28, category: 'Village',
    nightInstruction: 'Le Renard designe 3 joueurs. Confirmez si au moins un Loup est parmi eux (sans preciser lequel).',
  },
  MONTREUR_OURS: {
    id: 'MONTREUR_OURS', name: "Montreur d'Ours", plural: "Montreur d'Ours",
    team: 'village', emoji: '\u{1F43B}',
    color: '#a16207', bgColor: 'rgba(161,98,7,0.09)',
    description: "Chaque matin, si l'un de ses voisins directs est un Loup, l'Ours grogne.",
    nightOrder: null, special: 'dawn', category: 'Village',
  },
  JUGE_BEGUE: {
    id: 'JUGE_BEGUE', name: 'Juge Begue', plural: 'Juge Begue',
    team: 'village', emoji: '\u{2696}\u{FE0F}',
    color: '#e2e8f0', bgColor: 'rgba(226,232,240,0.09)',
    description: 'Une fois par partie, peut imposer un second vote dans la meme journee.',
    nightOrder: null, category: 'Village',
  },
  CHIEN_LOUP: {
    id: 'CHIEN_LOUP', name: 'Chien-Loup', plural: 'Chien-Loup',
    team: 'village', emoji: '\u{1F415}',
    color: '#92400e', bgColor: 'rgba(146,64,14,0.09)',
    description: 'La 2eme nuit, choisit secretement son camp : Chien (Village) ou Loup (Loups-Garous).',
    nightOrder: 3, secondNightOnly: true, category: 'Village',
    nightInstruction: 'Le Chien-Loup choisit son camp : Loup ou Chien.',
  },
  VOLEUR: {
    id: 'VOLEUR', name: 'Voleur', plural: 'Voleur',
    team: 'village', emoji: '\u{1F3AD}',
    color: '#7c3aed', bgColor: 'rgba(124,58,237,0.09)',
    description: 'La 1ere nuit, peut voler le role d\'un autre joueur parmi 2 cartes retournees.',
    nightOrder: 2, firstNightOnly: true, category: 'Village',
    nightInstruction: 'Le Voleur retourne 2 cartes non-distribuees. Il peut en prendre une (obligatoire si LG).',
  },
  ENFANT_SAUVAGE: {
    id: 'ENFANT_SAUVAGE', name: 'Enfant Sauvage', plural: 'Enfant Sauvage',
    team: 'village', emoji: '\u{1F9D2}',
    color: '#65a30d', bgColor: 'rgba(101,163,13,0.09)',
    description: "Choisit un modele. Si le modele meurt, l'Enfant Sauvage devient un Loup-Garou.",
    nightOrder: 4, firstNightOnly: true, category: 'Village',
    nightInstruction: "L'Enfant Sauvage designe son modele en silence. Le MJ memorise sans reveler.",
  },
  FOSSOYEUR: {
    id: 'FOSSOYEUR', name: 'Fossoyeur', plural: 'Fossoyeur',
    team: 'solitaire', emoji: '\u{26CF}\u{FE0F}',
    color: '#78716c', bgColor: 'rgba(120,113,108,0.09)',
    description: 'Chaque matin, peut apprendre le role d\'un joueur mort cette nuit. Role independant.',
    nightOrder: 62, category: 'Solitaire',
    nightInstruction: 'Le Fossoyeur designe un joueur mort cette nuit - revelez-lui son role.',
  },
  // --- LOUP-GAROU ----------------------------------------------------------
  LOUP_GAROU: {
    id: 'LOUP_GAROU', name: 'Loup-Garou', plural: 'Loups-Garous',
    team: 'loupgarou', emoji: '\u{1F43A}',
    color: '#ef4444', bgColor: 'rgba(239,68,68,0.09)',
    description: 'Chaque nuit, choisissent ensemble une victime a devorer.',
    nightOrder: 40, category: 'Loup-Garou',
    nightInstruction: 'Les Loups-Garous ouvrent les yeux, se reconnaissent et designent une victime.',
  },
  GRAND_MECHANT_LOUP: {
    id: 'GRAND_MECHANT_LOUP', name: 'Grand Mechant Loup', plural: 'Grand Mechant Loup',
    team: 'loupgarou', emoji: '\u{1F9B7}',
    color: '#dc2626', bgColor: 'rgba(220,38,38,0.09)',
    description: 'Peut devorer une 2eme victime tant qu\'aucun Loup-Garou n\'est mort.',
    nightOrder: 42, category: 'Loup-Garou',
    nightInstruction: 'Le Grand Mechant Loup peut devorer une 2eme victime (si aucun LG mort).',
  },
  LOUP_BLANC: {
    id: 'LOUP_BLANC', name: 'Loup Blanc', plural: 'Loup Blanc',
    team: 'loupblanc', emoji: '\u{1F315}',
    color: '#e2e8f0', bgColor: 'rgba(226,232,240,0.09)',
    description: 'Toutes les 2 nuits, peut eliminer un Loup-Garou. Gagne seul.',
    nightOrder: 45, everyOtherNight: true, category: 'Loup-Garou',
    nightInstruction: 'Le Loup Blanc peut eliminer un Loup-Garou cette nuit (nuits impaires seulement).',
  },
  // --- SOLITAIRE -----------------------------------------------------------
  JOUEUR_FLUTE: {
    id: 'JOUEUR_FLUTE', name: 'Joueur de Flute', plural: 'Joueur de Flute',
    team: 'solitaire', emoji: '\u{1F3B5}',
    color: '#fcd34d', bgColor: 'rgba(252,211,77,0.09)',
    description: 'Des la 2eme nuit, enchante des joueurs (1 si <15 joueurs, 2 si 15+). Gagne seul si tous sont enchantes.',
    nightOrder: 65, notBeforeNight: 2, category: 'Solitaire',
    nightInstruction: 'Le Joueur de Flute enchante des joueurs en les touchant (les yeux fermes).',
  },
  // --- AJOUT : IDIOT (utilise dans ELIMINATE_PLAYER, absent du legacy) ------
  IDIOT: {
    id: 'IDIOT', name: 'Idiot du Village', plural: 'Idiot du Village',
    team: 'village', emoji: '\u{1F921}',
    color: '#fbbf24', bgColor: 'rgba(251,191,36,0.09)',
    description: "S'il est designe par le vote, il est demasque mais survit (il perd alors son droit de vote).",
    nightOrder: null, category: 'Village',
  },
} satisfies Record<RoleId, Role>;

export const NIGHT_ORDER_BASE = [
  'VOLEUR', 'CHIEN_LOUP', 'DEMENAGEUR', 'ENFANT_SAUVAGE', 'CUPIDON', 'SOEUR_1',
  'VOYANTE', 'RENARD', 'LOUP_GAROU', 'GRAND_MECHANT_LOUP', 'LOUP_BLANC',
  'SORCIERE', 'SALVATEUR', 'CORBEAU', 'FOSSOYEUR', 'JOUEUR_FLUTE',
] satisfies RoleId[];

export const TEAM_INFO = {
  village: { label: 'Village', color: '#5c9eff' },
  loupgarou: { label: 'Loup-Garou', color: '#ef4444' },
  loupblanc: { label: 'Solitaire', color: '#e2e8f0' },
  solitaire: { label: 'Solitaire', color: '#fcd34d' },
} satisfies Record<Team, { label: string; color: string }>;

/** Equipe d'un joueur (defaut : village si role inconnu, comme le legacy). */
export function teamOf(role: RoleId): Team {
  return ROLES_DATA[role]?.team ?? 'village';
}
