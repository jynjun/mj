import type { Player, Victory } from '../types';
import { teamOf } from '../data/roles';

/**
 * Detection des conditions de victoire (le MJ valide ensuite manuellement).
 * Renvoie un tableau de victoires possibles, par ordre de priorite (la 1ere prime).
 * Portage fidele de window.checkWinConditions (js/gameData.js).
 */
export function checkWinConditions(players: Player[]): Victory[] {
  const alive = (players || []).filter((p) => p.alive);
  if (alive.length === 0) return [];

  const wolves = alive.filter((p) => teamOf(p.role) === 'loupgarou');
  const whiteWolf = alive.filter((p) => teamOf(p.role) === 'loupblanc');
  const flute = alive.filter((p) => p.role === 'JOUEUR_FLUTE');
  const village = alive.filter((p) => teamOf(p.role) === 'village');
  const lovers = alive.filter((p) => p.lovers !== null && p.lovers !== undefined);
  const fossoyeurs = alive.filter((p) => p.role === 'FOSSOYEUR');
  const ids = (arr: Player[]): string[] => arr.map((p) => 'J' + p.id);
  const wins: Victory[] = [];

  // 1) Amoureux - seuls survivants tous les deux (prioritaire sur leurs camps)
  if (alive.length === 2 && lovers.length === 2) {
    wins.push({
      key: 'lovers', title: 'Les Amoureux', emoji: '\u{1F498}', color: '#f472b6',
      soundEvent: 'win_lovers',
      players: lovers.map((p) => p.id),
      reason: 'Les deux amoureux (' + ids(lovers).join(' & ') + ') sont les seuls survivants.',
    });
  }

  // 2) Loup Blanc - seul survivant
  if (alive.length === 1 && whiteWolf.length === 1) {
    wins.push({
      key: 'loup_blanc', title: 'Loup Blanc', emoji: '\u{1F315}', color: '#e2e8f0',
      soundEvent: 'win_loup_blanc',
      players: [whiteWolf[0]!.id],
      reason: 'Le Loup Blanc (' + ids(whiteWolf)[0] + ') est le dernier survivant.',
    });
  }

  // 3) Joueur de Flute - tous les autres survivants sont enchantes
  if (flute.length === 1 && alive.length > 1) {
    const fOthers = alive.filter((p) => p.role !== 'JOUEUR_FLUTE');
    if (fOthers.length > 0 && fOthers.every((p) => p.enchanted)) {
      wins.push({
        key: 'flute', title: 'Joueur de Flute', emoji: '\u{1F3B5}', color: '#fcd34d',
        soundEvent: 'win_flute',
        players: [flute[0]!.id],
        reason: 'Tous les survivants (' + ids(fOthers).join(', ') + ') sont enchantes par la Flute.',
      });
    }
  }

  // 4) Fossoyeur - seul, un unique camp restant (Loups OU Village), aucun independant
  if (fossoyeurs.length === 1 && whiteWolf.length === 0 && flute.length === 0) {
    const fId = fossoyeurs[0]!.id;
    const rest = alive.filter((p) => p.id !== fId);
    if (rest.length > 0) {
      const teams = rest.map((p) => teamOf(p.role)).filter((t, i, a) => a.indexOf(t) === i);
      if (teams.length === 1 && (teams[0] === 'loupgarou' || teams[0] === 'village')) {
        wins.push({
          key: 'fossoyeur', title: 'Fossoyeur', emoji: '\u{26CF}\u{FE0F}', color: '#a8a29e',
          soundEvent: 'win_fossoyeur',
          players: [fId],
          reason: 'Le Fossoyeur (J' + fId + ') survit avec un seul camp restant (' +
            (teams[0] === 'loupgarou' ? 'Loups-Garous' : 'Village') + ') et aucun independant.',
        });
      }
    }
  }

  // 5) Loups-Garous - au moins 1 Loup vivant et un SEUL adversaire restant
  const foes = alive.filter((p) => teamOf(p.role) !== 'loupgarou');
  if (wolves.length >= 1 && foes.length === 1) {
    const foe = foes[0]!;
    const foeLabel = teamOf(foe.role) === 'village'
      ? 'Villageois'
      : foe.role === 'LOUP_BLANC' ? 'Loup Blanc'
        : foe.role === 'JOUEUR_FLUTE' ? 'Joueur de Flute' : 'independant';
    wins.push({
      key: 'wolves', title: 'Loups-Garous', emoji: '\u{1F43A}', color: '#ef4444',
      soundEvent: 'win_wolves',
      players: wolves.map((p) => p.id),
      reason: "Il ne reste plus qu'un seul adversaire (J" + foe.id + ' - ' + foeLabel +
        ') face aux Loups-Garous (' + ids(wolves).join(', ') + ').',
    });
  }

  // 6) Village - plus aucun Loup ni independant (Loup Blanc, Flute)
  if (
    wolves.length === 0 && whiteWolf.length === 0 && flute.length === 0 &&
    village.length > 0 && fossoyeurs.length === 0
  ) {
    wins.push({
      key: 'village', title: 'Village', emoji: '\u{1F3C6}', color: '#5c9eff',
      soundEvent: 'win_village',
      players: village.map((p) => p.id),
      reason: 'Toutes les menaces (Loups, Loup Blanc, Flute) ont ete eliminees.',
    });
  }

  return wins;
}
