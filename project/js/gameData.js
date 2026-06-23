'use strict';

window.GAMES_LIST = [
  {
    id: 'loup-garou',
    name: 'Loup-Garou de Thiercelieux',
    subtitle: 'Le classique des jeux de rôle en groupe',
    emoji: '🐺',
    minPlayers: 4, maxPlayers: 25,
    description: '4–25 joueurs · 30–90 min'
  }
];

window.ROLES_DATA = {
  // ─── VILLAGE ───────────────────────────────────────────────────────
  VILLAGEOIS: {
    id: 'VILLAGEOIS', name: 'Villageois', plural: 'Villageois',
    team: 'village', emoji: '🏡',
    color: '#5c9eff', bgColor: 'rgba(92,158,255,0.09)',
    description: 'Aucun pouvoir spécial. Doit identifier les Loups par déduction.',
    nightOrder: null, category: 'Village'
  },
  VOYANTE: {
    id: 'VOYANTE', name: 'Voyante', plural: 'Voyante',
    team: 'village', emoji: '👁️',
    color: '#a78bfa', bgColor: 'rgba(167,139,250,0.09)',
    description: 'Chaque nuit, regarde l\'identité d\'un joueur.',
    nightOrder: 30, category: 'Village',
    nightInstruction: 'La Voyante désigne un joueur — révélez-lui son rôle silencieusement.'
  },
  SORCIERE: {
    id: 'SORCIERE', name: 'Sorcière', plural: 'Sorcière',
    team: 'village', emoji: '🧙',
    color: '#34d399', bgColor: 'rgba(52,211,153,0.09)',
    description: 'Possède une potion de vie et une potion de mort (une fois chacune).',
    nightOrder: 50, category: 'Village',
    nightInstruction: 'Montrez la victime des Loups à la Sorcière. Elle peut utiliser ses potions.'
  },
  CUPIDON: {
    id: 'CUPIDON', name: 'Cupidon', plural: 'Cupidon',
    team: 'village', emoji: '💘',
    color: '#f472b6', bgColor: 'rgba(244,114,182,0.09)',
    description: 'La 1ère nuit, désigne deux amoureux liés jusqu\'à la mort.',
    nightOrder: 5, firstNightOnly: true, category: 'Village',
    nightInstruction: 'Cupidon désigne deux joueurs qui seront amoureux pour toute la partie.'
  },
  CHASSEUR: {
    id: 'CHASSEUR', name: 'Chasseur', plural: 'Chasseur',
    team: 'village', emoji: '🏹',
    color: '#fb923c', bgColor: 'rgba(251,146,60,0.09)',
    description: 'À sa mort, élimine immédiatement un joueur de son choix.',
    nightOrder: null, onDeath: true, category: 'Village'
  },
  SALVATEUR: {
    id: 'SALVATEUR', name: 'Salvateur', plural: 'Salvateur',
    team: 'village', emoji: '🛡️',
    color: '#2dd4bf', bgColor: 'rgba(45,212,191,0.09)',
    description: 'Chaque nuit, protège un joueur des attaques des Loups.',
    nightOrder: 55, category: 'Village',
    nightInstruction: 'Le Salvateur indique silencieusement un joueur à protéger cette nuit.'
  },
  CORBEAU: {
    id: 'CORBEAU', name: 'Corbeau', plural: 'Corbeau',
    team: 'village', emoji: '🐦‍⬛',
    color: '#9ca3af', bgColor: 'rgba(156,163,175,0.09)',
    description: 'Chaque nuit, peut jeter une malédiction sur un joueur (+2 votes).',
    nightOrder: 60, category: 'Village',
    nightInstruction: 'Le Corbeau indique silencieusement un joueur à maudire (+2 votes demain).'
  },
  ANCIEN: {
    id: 'ANCIEN', name: 'Ancien', plural: 'Ancien',
    team: 'village', emoji: '👴',
    color: '#c4a882', bgColor: 'rgba(196,168,130,0.09)',
    description: 'Survit à la 1ère attaque des Loups (une vie supplémentaire). S\'il est lynché, tous les rôles spéciaux du village disparaissent.',
    nightOrder: null, category: 'Village'
  },
  DEMENAGEUR: {
    id: 'DEMENAGEUR', name: 'Déménageur', plural: 'Déménageur',
    team: 'village', emoji: '📦',
    color: '#94a3b8', bgColor: 'rgba(148,163,184,0.09)',
    description: 'Dès la 2ème nuit, échange les rôles de 2 joueurs chaque nuit.',
    nightOrder: 6, notBeforeNight: 2, category: 'Village',
    nightInstruction: 'Le Déménageur échange discrètement les cartes de deux joueurs.'
  },
  SOEUR_1: {
    id: 'SOEUR_1', name: 'Sœur 1', plural: 'Les Sœurs',
    team: 'village', emoji: '👩',
    color: '#f9a8d4', bgColor: 'rgba(249,168,212,0.09)',
    description: 'Les deux Sœurs se connaissent dès la 1ère nuit et s\'entraident jusqu\'à la fin.',
    nightOrder: 8, firstNightOnly: true, category: 'Village',
    nightInstruction: 'Les deux Sœurs s\'éveillent ensemble et se reconnaissent en silence.'
  },
  SOEUR_2: {
    id: 'SOEUR_2', name: 'Sœur 2', plural: 'Les Sœurs',
    team: 'village', emoji: '👩',
    color: '#f9a8d4', bgColor: 'rgba(249,168,212,0.09)',
    description: 'Les deux Sœurs se connaissent dès la 1ère nuit et s\'entraident jusqu\'à la fin.',
    nightOrder: null, category: 'Village'
  },
  RENARD: {
    id: 'RENARD', name: 'Renard', plural: 'Renard',
    team: 'village', emoji: '🦊',
    color: '#f97316', bgColor: 'rgba(249,115,22,0.09)',
    description: 'Chaque nuit, désigne 3 joueurs adjacents. Le MJ indique si un Loup est parmi eux.',
    nightOrder: 28, category: 'Village',
    nightInstruction: 'Le Renard désigne 3 joueurs. Confirmez si au moins un Loup est parmi eux (sans préciser lequel).'
  },
  MONTREUR_OURS: {
    id: 'MONTREUR_OURS', name: 'Montreur d\'Ours', plural: 'Montreur d\'Ours',
    team: 'village', emoji: '🐻',
    color: '#a16207', bgColor: 'rgba(161,98,7,0.09)',
    description: 'Chaque matin, si l\'un de ses voisins directs est un Loup, l\'Ours grogne.',
    nightOrder: null, special: 'dawn', category: 'Village'
  },
  JUGE_BEGUE: {
    id: 'JUGE_BEGUE', name: 'Juge Bègue', plural: 'Juge Bègue',
    team: 'village', emoji: '⚖️',
    color: '#e2e8f0', bgColor: 'rgba(226,232,240,0.09)',
    description: 'Une fois par partie, peut imposer un second vote dans la même journée.',
    nightOrder: null, category: 'Village'
  },
  CHIEN_LOUP: {
    id: 'CHIEN_LOUP', name: 'Chien-Loup', plural: 'Chien-Loup',
    team: 'village', emoji: '🐕',
    color: '#92400e', bgColor: 'rgba(146,64,14,0.09)',
    description: 'La 2ème nuit, choisit secrètement son camp : Chien (Village) ou Loup (Loups-Garous).',
    nightOrder: 3, secondNightOnly: true, category: 'Village',
    nightInstruction: 'Le Chien-Loup choisit son camp : Loup ou Chien.'
  },
  VOLEUR: {
    id: 'VOLEUR', name: 'Voleur', plural: 'Voleur',
    team: 'village', emoji: '🎭',
    color: '#7c3aed', bgColor: 'rgba(124,58,237,0.09)',
    description: 'La 1ère nuit, peut voler le rôle d\'un autre joueur parmi 2 cartes retournées.',
    nightOrder: 2, firstNightOnly: true, category: 'Village',
    nightInstruction: 'Le Voleur retourne 2 cartes non-distribuées. Il peut en prendre une (obligatoire si LG).'
  },
  ENFANT_SAUVAGE: {
    id: 'ENFANT_SAUVAGE', name: 'Enfant Sauvage', plural: 'Enfant Sauvage',
    team: 'village', emoji: '🧒',
    color: '#65a30d', bgColor: 'rgba(101,163,13,0.09)',
    description: 'Choisit un modèle. Si le modèle meurt, l\'Enfant Sauvage devient un Loup-Garou.',
    nightOrder: 4, firstNightOnly: true, category: 'Village',
    nightInstruction: 'L\'Enfant Sauvage désigne son modèle en silence. Le MJ mémorise sans révéler.'
  },
  FOSSOYEUR: {
    id: 'FOSSOYEUR', name: 'Fossoyeur', plural: 'Fossoyeur',
    team: 'solitaire', emoji: '⛏️',
    color: '#78716c', bgColor: 'rgba(120,113,108,0.09)',
    description: 'Chaque matin, peut apprendre le rôle d\'un joueur mort cette nuit. Rôle indépendant.',
    nightOrder: 62, category: 'Solitaire',
    nightInstruction: 'Le Fossoyeur désigne un joueur mort cette nuit — révélez-lui son rôle.'
  },
  // ─── LOUP-GAROU ────────────────────────────────────────────────────
  LOUP_GAROU: {
    id: 'LOUP_GAROU', name: 'Loup-Garou', plural: 'Loups-Garous',
    team: 'loupgarou', emoji: '🐺',
    color: '#ef4444', bgColor: 'rgba(239,68,68,0.09)',
    description: 'Chaque nuit, choisissent ensemble une victime à dévorer.',
    nightOrder: 40, category: 'Loup-Garou',
    nightInstruction: 'Les Loups-Garous ouvrent les yeux, se reconnaissent et désignent une victime.'
  },
  GRAND_MECHANT_LOUP: {
    id: 'GRAND_MECHANT_LOUP', name: 'Grand Méchant Loup', plural: 'Grand Méchant Loup',
    team: 'loupgarou', emoji: '🦷',
    color: '#dc2626', bgColor: 'rgba(220,38,38,0.09)',
    description: 'Peut dévorer une 2ème victime tant qu\'aucun Loup-Garou n\'est mort.',
    nightOrder: 42, category: 'Loup-Garou',
    nightInstruction: 'Le Grand Méchant Loup peut dévorer une 2ème victime (si aucun LG mort).'
  },
  LOUP_BLANC: {
    id: 'LOUP_BLANC', name: 'Loup Blanc', plural: 'Loup Blanc',
    team: 'loupblanc', emoji: '🌕',
    color: '#e2e8f0', bgColor: 'rgba(226,232,240,0.09)',
    description: 'Toutes les 2 nuits, peut éliminer un Loup-Garou. Gagne seul.',
    nightOrder: 45, everyOtherNight: true, category: 'Loup-Garou',
    nightInstruction: 'Le Loup Blanc peut éliminer un Loup-Garou cette nuit (nuits impaires seulement).'
  },
  // ─── SOLITAIRE ─────────────────────────────────────────────────────
  JOUEUR_FLUTE: {
    id: 'JOUEUR_FLUTE', name: 'Joueur de Flûte', plural: 'Joueur de Flûte',
    team: 'solitaire', emoji: '🎵',
    color: '#fcd34d', bgColor: 'rgba(252,211,77,0.09)',
    description: 'Dès la 2ème nuit, enchante des joueurs (1 si <15 joueurs, 2 si 15+). Gagne seul si tous sont enchantés.',
    nightOrder: 65, notBeforeNight: 2, category: 'Solitaire',
    nightInstruction: 'Le Joueur de Flûte enchante des joueurs en les touchant (les yeux fermés).'
  }
};

window.NIGHT_ORDER_BASE = [
  'VOLEUR', 'CHIEN_LOUP', 'DEMENAGEUR', 'ENFANT_SAUVAGE', 'CUPIDON', 'SOEUR_1',
  'VOYANTE', 'RENARD', 'LOUP_GAROU', 'GRAND_MECHANT_LOUP', 'LOUP_BLANC',
  'SORCIERE', 'SALVATEUR', 'CORBEAU', 'FOSSOYEUR', 'JOUEUR_FLUTE'
];

window.SOUND_EVENTS_LIST = [
  { id: 'night_start', label: 'Début de la nuit',      category: 'Phase',      icon: '🌙' },
  { id: 'day_start',   label: 'Lever du soleil',        category: 'Phase',      icon: '☀️' },
  { id: 'role_wake',   label: 'Appel d\'un rôle',       category: 'Phase',      icon: '🔔' },
  { id: 'wolf_howl',   label: 'Hurlement des Loups',    category: 'Loup-Garou', icon: '🐺' },
  { id: 'seer_vision', label: 'Vision de la Voyante',   category: 'Rôle',       icon: '👁️' },
  { id: 'witch_brew',  label: 'Sortilège de Sorcière',  category: 'Rôle',       icon: '🧙' },
  { id: 'hunter_shot', label: 'Tir du Chasseur',        category: 'Rôle',       icon: '🏹' },
  { id: 'death_night', label: 'Mort dans la nuit',      category: 'Événement',  icon: '💀' },
  { id: 'death_day',   label: 'Lynchage',               category: 'Événement',  icon: '⚖️' },
  { id: 'timer_end',   label: 'Fin du minuteur',        category: 'Minuteur',   icon: '⏰' },
  { id: 'vote_start',  label: 'Début du vote',          category: 'Événement',  icon: '🗳️' },
  { id: 'win_village', label: 'Victoire Village',       category: 'Fin',        icon: '🏆' },
  { id: 'win_wolves',  label: 'Victoire Loups',         category: 'Fin',        icon: '🐺' }
];

window.TEAM_INFO = {
  village:   { label: 'Village',    color: '#5c9eff' },
  loupgarou: { label: 'Loup-Garou', color: '#ef4444' },
  loupblanc: { label: 'Solitaire',  color: '#e2e8f0' },
  solitaire: { label: 'Solitaire',  color: '#fcd34d' }
};

// ── Détection des conditions de victoire (le MJ valide ensuite manuellement) ──
// Renvoie un tableau de victoires possibles, par ordre de priorité (la 1ère prime).
window.checkWinConditions = function(players) {
  var alive = (players || []).filter(function(p){ return p.alive; });
  if (alive.length === 0) return [];
  function team(p){ var r = window.ROLES_DATA[p.role]; return r ? r.team : 'village'; }
  var wolves     = alive.filter(function(p){ return team(p) === 'loupgarou'; });
  var whiteWolf  = alive.filter(function(p){ return team(p) === 'loupblanc'; });
  var flute      = alive.filter(function(p){ return p.role === 'JOUEUR_FLUTE'; });
  var village    = alive.filter(function(p){ return team(p) === 'village'; });
  var lovers     = alive.filter(function(p){ return p.lovers; });
  var fossoyeurs = alive.filter(function(p){ return p.role === 'FOSSOYEUR'; });
  function ids(arr){ return arr.map(function(p){ return 'J'+p.id; }); }
  var wins = [];

  // 1) Amoureux — seuls survivants tous les deux (prioritaire sur leurs camps)
  if (alive.length === 2 && lovers.length === 2) {
    wins.push({ key:'lovers', title:'Les Amoureux', emoji:'💘', color:'#f472b6', soundEvent:'win_lovers',
      players: lovers.map(function(p){return p.id;}),
      reason:'Les deux amoureux ('+ids(lovers).join(' & ')+') sont les seuls survivants.' });
  }

  // 2) Loup Blanc — seul survivant
  if (alive.length === 1 && whiteWolf.length === 1) {
    wins.push({ key:'loup_blanc', title:'Loup Blanc', emoji:'🌕', color:'#e2e8f0', soundEvent:'win_loup_blanc',
      players:[whiteWolf[0].id],
      reason:'Le Loup Blanc ('+ids(whiteWolf)[0]+') est le dernier survivant.' });
  }

  // 3) Joueur de Flûte — tous les autres survivants sont enchantés
  if (flute.length === 1 && alive.length > 1) {
    var fOthers = alive.filter(function(p){ return p.role !== 'JOUEUR_FLUTE'; });
    if (fOthers.length > 0 && fOthers.every(function(p){ return p.enchanted; })) {
      wins.push({ key:'flute', title:'Joueur de Flûte', emoji:'🎵', color:'#fcd34d', soundEvent:'win_flute',
        players:[flute[0].id],
        reason:'Tous les survivants ('+ids(fOthers).join(', ')+') sont enchantés par la Flûte.' });
    }
  }

  // 4) Fossoyeur — seul, un unique camp restant (Loups OU Village), aucun indépendant
  if (fossoyeurs.length === 1 && whiteWolf.length === 0 && flute.length === 0) {
    var fId = fossoyeurs[0].id;
    var rest = alive.filter(function(p){ return p.id !== fId; });
    if (rest.length > 0) {
      var teams = rest.map(team).filter(function(t,i,a){ return a.indexOf(t) === i; });
      if (teams.length === 1 && (teams[0] === 'loupgarou' || teams[0] === 'village')) {
        wins.push({ key:'fossoyeur', title:'Fossoyeur', emoji:'⛏️', color:'#a8a29e', soundEvent:'win_fossoyeur',
          players:[fId],
          reason:'Le Fossoyeur ('+'J'+fId+') survit avec un seul camp restant ('+(teams[0]==='loupgarou'?'Loups-Garous':'Village')+') et aucun indépendant.' });
      }
    }
  }

  // 5) Loups-Garous — il faut au moins 1 Loup vivant et un SEUL adversaire restant,
  //    qu'il soit Villageois OU indépendant (Loup Blanc, Flûte). Même mécanique
  //    dans les deux cas : un loup face à un unique survivant adverse.
  var foes = alive.filter(function(p){ return team(p) !== 'loupgarou'; });
  if (wolves.length >= 1 && foes.length === 1) {
    var foe = foes[0];
    var foeLabel = team(foe) === 'village'
      ? 'Villageois'
      : (foe.role === 'LOUP_BLANC' ? 'Loup Blanc' : (foe.role === 'JOUEUR_FLUTE' ? 'Joueur de Flûte' : 'indépendant'));
    wins.push({ key:'wolves', title:'Loups-Garous', emoji:'🐺', color:'#ef4444', soundEvent:'win_wolves',
      players: wolves.map(function(p){return p.id;}),
      reason:'Il ne reste plus qu\'un seul adversaire (J'+foe.id+' · '+foeLabel+') face aux Loups-Garous ('+ids(wolves).join(', ')+').' });
  }

  // 6) Village — plus aucun Loup ni indépendant (Loup Blanc, Flûte)
  if (wolves.length === 0 && whiteWolf.length === 0 && flute.length === 0 && village.length > 0 && fossoyeurs.length === 0) {
    wins.push({ key:'village', title:'Village', emoji:'🏆', color:'#5c9eff', soundEvent:'win_village',
      players: village.map(function(p){return p.id;}),
      reason:'Toutes les menaces (Loups, Loup Blanc, Flûte) ont été éliminées.' });
  }

  return wins;
};

// _roleConfig kept for backward compat but ignored — roles come from players
window.computeNightOrder = function(_roleConfig, nightCount, players) {
  var order = window.NIGHT_ORDER_BASE.filter(function(roleId) {
    var role = window.ROLES_DATA[roleId];
    if (!role) return false;
    if (role.firstNightOnly && nightCount > 1) return false;
    if (role.secondNightOnly && nightCount !== 2) return false;
    if (role.notBeforeNight && nightCount < role.notBeforeNight) return false;
    if (role.everyOtherNight && nightCount % 2 === 0) return false;
    if (players) {
      var hasAlive = players.some(function(p) {
        if (!p.alive) return false;
        if (p.role === roleId) return true;
        // Le Fossoyeur garde son tour d'exhumation même après avoir adopté un rôle
        if (roleId === 'FOSSOYEUR' && p.diggerRole !== null && p.diggerRole !== undefined) return true;
        return false;
      });
      if (!hasAlive) return false;
    }
    return true;
  });
  // Le Déménageur passe toujours en avant-dernier dans l'ordre de la nuit
  var di = order.indexOf('DEMENAGEUR');
  if (di !== -1 && order.length >= 2) {
    order.splice(di, 1);
    order.splice(order.length - 1, 0, 'DEMENAGEUR');
  }
  return order;
};

window.AVAILABLE_SOUNDS = [
  { id: 'aucun',     name: 'Aucun' },
  { id: 'gong',      name: 'Gong grave' },
  { id: 'cloche',    name: 'Cloche' },
  { id: 'tintement', name: 'Tintement' },
  { id: 'hurlement', name: 'Hurlement' },
  { id: 'flute',     name: 'Flûte' },
  { id: 'tambour',   name: 'Tambour' },
  { id: 'mort',      name: 'Ton funèbre' },
  { id: 'sorciere',  name: 'Sortilège' },
  { id: 'chasse',    name: 'Coup de feu' },
  { id: 'mystere',   name: 'Mystère' },
  { id: 'fanfare',   name: 'Fanfare' },
];

window.SOUND_EVENTS_FULL = [
  { id: 'night_start', label: 'Début de la nuit',  category: 'Phase',      icon: '🌙', defaultSound: 'gong' },
  { id: 'day_start',   label: 'Lever du soleil',   category: 'Phase',      icon: '☀️', defaultSound: 'cloche' },
  { id: 'death_night', label: 'Mort dans la nuit', category: 'Événement',  icon: '💀', defaultSound: 'mort' },
  { id: 'death_day',       label: 'Vote',                    category: 'Événement',  icon: '⚖️', defaultSound: 'mort' },
  { id: 'hunter_shot',     label: 'Tir du Chasseur',         category: 'Événement',  icon: '🏹', defaultSound: 'chasse' },
  { id: 'timer_end',       label: 'Fin du minuteur',         category: 'Minuteur',   icon: '⏰', defaultSound: 'tintement' },
  { id: 'win_village',     label: 'Victoire Village',        category: 'Fin',        icon: '🏆', defaultSound: 'fanfare' },
  { id: 'win_wolves',      label: 'Victoire Loups-Garous',   category: 'Fin',        icon: '🐺', defaultSound: 'hurlement' },
  { id: 'win_loup_blanc',  label: 'Victoire Loup Blanc',     category: 'Fin',        icon: '🌕', defaultSound: 'mystere' },
  { id: 'win_flute',       label: 'Victoire Joueur de Flûte',category: 'Fin',        icon: '🎵', defaultSound: 'mystere' },
  { id: 'win_fossoyeur',   label: 'Victoire Fossoyeur',      category: 'Fin',        icon: '⛏️', defaultSound: 'mystere' },
  { id: 'win_lovers',      label: 'Victoire Amoureux',       category: 'Fin',        icon: '💘', defaultSound: 'fanfare' },
];
Object.values(window.ROLES_DATA).forEach(function(r) {
  if (r.nightOrder !== null || r.onDeath) {
    var dflt = (r.team === 'loupgarou' || r.team === 'loupblanc') ? 'hurlement'
             : r.team === 'solitaire' ? 'mystere'
             : r.id === 'SORCIERE' ? 'sorciere'
             : r.id === 'CHASSEUR' ? 'chasse'
             : r.id === 'VOYANTE'  ? 'flute'
             : 'tintement';
    window.SOUND_EVENTS_FULL.push({ id: 'role_'+r.id, label: r.name, category: 'Réveil des rôles', icon: r.emoji, defaultSound: dflt });
  }
});

window.SOUND_PROFILES = [
  { id: 'défaut',     name: 'Défaut' },
  { id: 'intense',    name: 'Intense' },
  { id: 'discret',    name: 'Discret' },
  { id: 'silencieux', name: 'Silencieux' },
];

window.getProfileAssignments = function(profileId) {
  var a = {};
  window.SOUND_EVENTS_FULL.forEach(function(e) {
    if (profileId === 'silencieux') { a[e.id] = 'aucun'; }
    else if (profileId === 'intense') { a[e.id] = e.defaultSound === 'tintement' ? 'cloche' : e.defaultSound === 'aucun' ? 'aucun' : e.defaultSound; }
    else if (profileId === 'discret') { a[e.id] = e.category === 'Phase' ? e.defaultSound : e.category === 'Fin' ? e.defaultSound : 'tintement'; }
    else { a[e.id] = e.defaultSound; }
  });
  return a;
};

window.getRandomRolePool = function(count) {
  count = Math.max(4, Math.min(25, count));
  var wolves = Math.max(1, Math.floor(count / 4));
  var pool = [];
  for (var i = 0; i < wolves; i++) pool.push('LOUP_GAROU');
  pool.push('VOYANTE', 'SORCIERE', 'CHASSEUR');
  if (count >= 10) pool.push('CUPIDON');
  if (count >= 12) pool.push('SALVATEUR');
  if (count >= 15) pool.push('CORBEAU');
  if (count >= 18) pool.push('RENARD');
  // Règle : si Enfant Sauvage, il faut au moins Montreur d'Ours ou Renard
  if (count >= 14) {
    pool.push('ENFANT_SAUVAGE');
    var hasGuard = pool.indexOf('RENARD') !== -1 || pool.indexOf('MONTREUR_OURS') !== -1;
    if (!hasGuard) pool.push('MONTREUR_OURS');
  }
  while (pool.length < count) pool.push('VILLAGEOIS');
  return pool.slice(0, count);
};
