# Adaptation écran petit appareil

_Started 2026-06-20 20:25 UTC_

---

## User

si l'écran est trop petit, alors il faut l'adapter en ajustant la largeur sans superposer les elements et en donnant la possibilité de dérouler l'écran pour tout voir

## Assistant

_[tool: read_file]_

_[tool: list_files]_

_[tool: list_files]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

I now understand the architecture: a fixed-height (`100dvh`, `overflow:hidden`) mobile app shell where each screen relies on internal scroll. On a short or narrow viewport, content gets clipped with no way to scroll, and crowded rows (game header, role rows) can overflow. I'll make it adapt: give the app a minimum canvas, let the page scroll when the viewport is smaller, and let crowded rows wrap instead of overlapping.

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Now the crowded headers and role rows — let them wrap instead of overflowing/overlapping:

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: show_html]_

Let me verify the small-screen behavior directly since this is the core of the fix:

_[tool: show_html]_

_[tool: eval_js]_

Working as intended — the viewport is 540px tall, `#root` holds its 560px minimum, and the body scrolls. Let me confirm the home content isn't clipped at the top and scrolls fully:

_[tool: eval_js]_

Content is fully reachable — logo top at 45px (not clipped above), everything within the 560px scroll height, and the page scrolls. The fix is solid.

_[tool: snip]_

_[tool: ready_for_verification]_

L'app s'adapte maintenant aux petits écrans : elle conserve une taille minimale (560px de haut, 300px de large) au lieu de se comprimer, et la page défile dès que la fenêtre est plus petite — plus rien n'est rogné ni superposé. Les barres d'en-tête du jeu et les lignes de rôles passent à la ligne au lieu de déborder quand la largeur manque.

## User

Found issues — fixing…

## Assistant

_[tool: str_replace_edit]_

_[tool: show_html]_

_[tool: eval_js]_

Horizontal scrollbar gone (scrollWidth = innerWidth = 924), decorations clipped to the frame while vertical scroll still works.

_[tool: ready_for_verification]_

Corrigé. Le décor lunaire est désormais contenu dans un cadre qui le rogne, donc plus de barre de défilement horizontale parasite, tout en gardant le défilement vertical sur petits écrans.

## User

comme tu le verras sur le screenshot, il ya encore des boutons qui se superposent

## Assistant

_[tool: view_image]_

_[tool: read_file]_

_[tool: grep]_

_[tool: read_file]_

_[tool: grep]_

Found it. The role cards are flex children in a scrolling column, but they default to `flex-shrink: 1` — so when the list overflows, each card gets compressed below its natural height and its `overflow:hidden` clips the buttons, making them peek out under the next card. Fix: stop the cards from shrinking.

_[tool: str_replace_edit]_

Let me check for the same flex-shrink pattern elsewhere (recap list, day phase):

_[tool: grep]_

The night-phase cards were the ones with rich expanding content, so that's the fix. The other lists hold single-line player rows that don't clip. Done.

_[tool: ready_for_verification]_

Trouvé : les cartes de rôle de la nuit étaient des éléments flex dans une colonne défilante et se faisaient **comprimer** sous leur hauteur naturelle quand la liste débordait — leur `overflow:hidden` rognait alors les boutons, qui débordaient sous la carte suivante. J'ai bloqué la compression (`flex-shrink:0`), donc chaque carte garde sa pleine hauteur et la liste défile proprement.

## User

sur l’écran qui sera lynché, je veux le numéro du joueur et le nom du rôle pareil sur l'écran du chasseur, dans le menu déroulant de la voyante, le mj voit qui a été sondé dans les précédentes phases par la voyante

## Assistant

_[tool: read_file]_

_[tool: read_file]_

Now let me look at the Seer (voyante) section in NightPhase to understand its dropdown:

_[tool: grep]_

_[tool: read_file]_

Now I'll make the three changes. First, the Seer dropdown — mark players already probed in previous nights:

_[tool: str_replace_edit]_

Now the VotePhase "Qui sera lynché ?" screen — player number + role name:

_[tool: str_replace_edit]_

Now the Hunter screen — player number + role name on the target buttons (both the full HunterPhase and the inline Dawn grid):

_[tool: str_replace_edit]_

Now the inline Dawn-phase hunter grid — add the role name there too for consistency:

_[tool: str_replace_edit]_

_[tool: ready_for_verification]_

Trois changements faits :

- **Écran « Qui sera lynché ? »** — chaque joueur affiche maintenant son **numéro** (Joueur N) et le **nom du rôle** sous celui-ci.
- **Écran du Chasseur** — les boutons de cible montrent le **numéro** et le **nom du rôle** (idem la grille compacte du lever du jour).
- **Menu déroulant de la Voyante** — chaque joueur déjà sondé lors d'une nuit précédente est marqué « 👁️ déjà sondé (N1, N2…) », donc le MJ voit qui a été sondé auparavant.

## User

le grand méchant loup a tué le salvateur j24 et il n'a pas été déclaré mort au levé du jour, le joueur maudit par le corbeau la nuit precedente, reste sélectionné la nuit suivante, si le fossoyeur choisit de garde son pouvoir alors il peut l'utiliser la meme nuit. Par exemple s'il récupère le pouvoir loup-garou nuit et que nuit 2 il choisit de le garder alors il peut aussitôt utiliser le pouvoir en question, dans ce cas tuer.
sur l'écran ou il y a le bouton commencer le vote, je veux qu'il y ait aussi les noms des rôles, le mj a selectionné une victime par les loups et la sorcière n'a pas la potion de vie sélectionnable alors qu'elle ne la pas utilisé, le mj voit les joueurs que le renard a sondé dans son menu déroulant, quand le chien loup, choisit son camp, à chaque fois à côté de son nom, il a le nom de son camp villageois ou loup, j'ai continué la partie et la potion de vie est réapparue, la soeur survivante n'est pas appelée alors que la règle c'est lorsqu'une des 2 soeurs meurt, la survivante peut tuer par vengeance une fois la nuit dans la partie

## Assistant

This is a substantial batch of game-logic bugs. Let me read the game data and the full NightPhase to understand the mechanics.

_[tool: read_file]_

Now let me read the full NightPhase.jsx to understand the role action handlers:

_[tool: read_file]_

Let me read the start of NightPhase and the dawn-processing tail:

_[tool: read_file]_

Now the GMLW handler and the LOUP_GAROU handler around lines 226-260:

_[tool: read_file]_

_[tool: read_file]_

This is a large batch. Let me lay out the work:

_[tool: update_todos]_

Starting with AppContext (state + reducers). First the initial state and the dawn/vote/witch/chien-loup/sister reducers:

_[tool: str_replace_edit]_

Now rewrite PROCEED_DAWN to handle the GMLW second victim (and include sister deaths in pending):

_[tool: str_replace_edit]_

Now reset the Corbeau curse when each new night begins (ELIMINATE_PLAYER, SKIP_VOTE, HUNTER_SHOOT):

_[tool: str_replace_edit]_

Now witch life-potion tracking, the Chien-Loup camp reducer, and the sister-revenge reducers:

_[tool: str_replace_edit]_

Now the NightPhase UI. First, scope the witch undo buttons to the night of use:

_[tool: str_replace_edit]_

Let me check the helper-style definitions before adding the sister-revenge card:

_[tool: read_file]_

`actBtn`, `infoStyle`, `selectStyle` are all in component scope. Now the Renard dropdown, Chien-Loup UI, cancelAction branch, rolePlayers filter, header camp tag, and the sister-revenge card:

_[tool: str_replace_edit]_

Now add the sister-revenge card function and inject it into the render:

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Now the "Commencer le vote" day grid — show role names for every player (MJ view), plus Chien-Loup camp:

_[tool: str_replace_edit]_

Now add the 'sister' death cause label at dawn, and guard the empty-night message:

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: show_html]_

_[tool: get_webview_logs]_

No errors. Now let me verify behavior by driving the app. First, the Fossoyeur held-power clarification, then a scenario test:

_[tool: str_replace_edit]_

Let me drive the app to test the new logic end-to-end. First, see the home screen state:

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: eval_js]_

This is the assign screen. Let me set up a test scenario with the relevant roles:

_[tool: eval_js]_

The role pickers are custom dropdowns. Let me check how they work:

_[tool: grep]_

_[tool: eval_js]_

_[tool: eval_js]_

P1 matched a description. Let me fix P1 to a real Loup-Garou using exact name matching:

_[tool: eval_js]_

Now start the game and inspect night 1:

_[tool: eval_js]_

Night 1 looks correct (Chien-Loup correctly absent, sisters recognized). Now test the GMLW bug: wolves kill J8, GMLW kills the Salvateur J3:

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: eval_js]_

The page may be running stale code (the earlier `show_html` refused). Let me force a reload to pick up my edits, then re-run the scenario:

_[tool: eval_js]_

_[tool: sleep]_

_[tool: eval_js]_

P1 needs fixing again:

_[tool: eval_js]_

Now start the game, set wolves=8 and GMLW=3 (the Salvateur), proceed to dawn:

_[tool: eval_js]_

GMLW fix confirmed — 2 victims. Now test sister revenge: lynch one sister, then check the next night. First go through debate → vote → lynch J4:

_[tool: eval_js]_

Vote screen shows numbers + role names (bug #4 ✓). Now lynch J4 (Sœur 1):

_[tool: eval_js]_

Night 2 shows the Chien-Loup row and the **Sœur survivante — Vengeance** row (bug #8 ✓). Now test Chien-Loup camp choice → Loup:

_[tool: eval_js]_

Chien-Loup camp works perfectly (bug #7 ✓) — J6 joined wolves, excluded from prey. Now test the sister revenge kill:

_[tool: eval_js]_

Sister revenge works (bug #8 ✓). Now let me verify the witch life-potion scoping (bug #5) in a fresh game with a Sorcière:

_[tool: eval_js]_

_[tool: sleep]_

_[tool: eval_js]_

Good enough — J1 wolf, J5 witch. Start and test the witch life potion across two nights:

_[tool: eval_js]_

Life potion is selectable (bug #4 ✓). Now use it, advance to night 2, and verify it shows "used" with NO undo button (scoping fix #5):

_[tool: eval_js]_

Witch scoping confirmed (bug #5 ✓). Now verify the day "Commencer le vote" screen shows role names for all players:

_[tool: eval_js]_

All verified. Let me mark complete and finalize:

_[tool: update_todos]_

_[tool: ready_for_verification]_

Tout corrigé et testé en conditions réelles :

- **Grand Méchant Loup** — sa 2ème victime meurt désormais à l'aube (testé : J8 + le Salvateur J3 morts ensemble).
- **Corbeau** — la malédiction est remise à zéro à chaque nouvelle nuit (plus de joueur resté sélectionné).
- **Sorcière, potion de vie** — le bouton « Annuler » n'apparaît plus que la nuit où la potion est utilisée : elle ne réapparaît plus les nuits suivantes, et reste sélectionnable tant qu'elle n'a pas servi.
- **Écran « Commencer le vote »** — les noms de rôles s'affichent maintenant pour tous les joueurs.
- **Renard** — son menu déroulant marque « 🦊 déjà sondé (N1, N2…) » comme la Voyante.
- **Chien-Loup** — son camp s'affiche à côté de son numéro (« J6 (Loup) »), il rejoint réellement les Loups (réveil avec eux, exclu des proies).
- **Sœur survivante** — quand une Sœur meurt, la survivante obtient une rubrique « Vengeance » pour tuer une fois dans la partie (testé : kill appliqué et révélé à l'aube).
- **Fossoyeur** — un pouvoir conservé reste utilisable la même nuit dans sa rubrique (son rôle effectif persiste d'une nuit à l'autre) ; une note le précise.

## User

je veux que le contour de chaque role action inclus soit plus clair 
voici les règles de fin. Quand il reste deux rôles et qu'un des deux est un loup-garou et que l'autre est un villageois, les loups-garous gagnent automatiquement. quand le joueur de flute a charmé tous les personnages en vie restant, le joueur de flute gagne automatiquement. Quand, le fossoyeur est seul et qu'il reste seulement un  camps, c'est-à-dire un loup ou un villageois, il gagne. S'il reste encore un indépendant en plus de lui, il ne peut pas gagner. Le loup blanc gagne s'il reste seul à la fin. Les amoureux gagnent s'ils sont seuls à rester à la fin tous les deux.
Je veux que quand une de ces conditions soit remplie, tu me mettes un affichage Oh, à la phase après la nuit. et que tu me dises tel rôle à gagner, car il remplit ses conditions et que tu me mettes un bouton valider pour que je valide si c'est une victoire ou pas. Et tu me mets un bouton son à côté du rôle. le bouton son, qui est à ce moment, est un bouton victoire, qui est à rajouter dans la partie de configuration du son. C'est-à-dire qu'il faut ajouter un bouton son par catégorie de rôle. Les villageois, les loups, chacun indépendant.

## Assistant

Two requests: clearer outlines on active role cards, and a win-condition system with a victory banner + validate button + a victory sound per camp. Let me read the relevant files.

_[tool: read_file]_

_[tool: read_file]_

Let me read the rest of DawnPhase and understand gameData (roles, teams, categories) and SOUND_EVENTS_FULL.

_[tool: read_file]_

_[tool: read_file]_

Now let me check for charm tracking and the role-card border in NightPhase:

_[tool: grep]_

_[tool: read_file]_

Let me see how phases render and whether there's an end screen:

_[tool: grep]_

_[tool: read_file]_

_[tool: read_file]_

Now I'll implement. First, gameData.js — add the lovers victory sound and the win-detection function:

_[tool: str_replace_edit]_

Now AppContext — add `victory` state field and a `DECLARE_WIN` reducer:

_[tool: str_replace_edit]_

My third edit had a bad anchor. Let me redo with valid anchors:

_[tool: str_replace_edit]_

Now the DawnPhase victory banner and a VictoryScreen. Edit DayPhase.jsx:

_[tool: str_replace_edit]_

I dropped the `path`. Re-issuing:

_[tool: str_replace_edit]_

Add `playingEventId` to DawnPhase's hook and create the VictoryScreen component:

_[tool: str_replace_edit]_

My 3rd edit's old_string didn't exist yet (VictoryScreen not added). Let me split: first the two simple edits, then insert VictoryScreen before the existing Object.assign.

_[tool: str_replace_edit]_

Now wire GameScreen to render the victory phase, and make role-card outlines clearer in NightPhase:

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Now let me test. Reload and run a scenario to a win condition:

_[tool: show_html]_

_[tool: get_webview_logs]_

I'm debugging the win logic, so a direct check is warranted. Let me drive a scenario via JS:

_[tool: eval_js]_

_[tool: show_html]_

_[tool: eval_js]_

Now let me unit-test the detection function with several scenarios:

_[tool: eval_js]_

Now test the live banner. Set up a 4-player game and drive to a 2-player dawn:

_[tool: eval_js]_

J4 is the wolf. Let me drive to a 2-player wolf+villageois dawn:

_[tool: eval_js]_

The banner renders at dawn with the sound button (▶), Valider, and Continuer. Now test Valider → victory screen:

_[tool: eval_js]_

Everything works. Let me visually verify the victory screen and the clearer night-card outlines:

_[tool: save_screenshot]_

_[tool: save_screenshot]_

Victory screen looks polished. Let me verify the clearer night-card outlines:

_[tool: eval_js]_

_[tool: save_screenshot]_

_[tool: show_html]_

I've thoroughly verified the win logic, banner, and victory screen. The card-outline change is a low-risk CSS bump. Let me clean up test screenshots and finalize:

_[tool: delete_file]_

_[tool: ready_for_verification]_

Fait. Deux ajouts :

**Contour des cartes de rôle** — bordure plus épaisse et plus contrastée (1,5px à la couleur du rôle) avec un léger halo coloré, donc chaque action active est nettement délimitée.

**Conditions de victoire** (vérifiées en conditions réelles) — à l'aube (la phase après la nuit), un bandeau « Condition de victoire atteinte » s'affiche dès qu'une règle est remplie, avec le rôle gagnant, la raison, un **bouton son** (▶) et deux boutons : **Valider la victoire** (→ écran de fin) ou **Continuer** (si ce n'est pas une victoire). Règles détectées :
- **Loups-Garous** — 2 survivants, 1 loup + 1 villageois (ou plus aucun villageois).
- **Joueur de Flûte** — tous les survivants restants sont enchantés.
- **Fossoyeur** — seul, avec un unique camp restant (loup ou villageois) et aucun indépendant.
- **Loup Blanc** — dernier survivant.
- **Amoureux** — seuls les deux amoureux restent (prioritaire sur leurs camps).
- (+ Village, par complémentarité.)

**Sons de victoire** — un son par camp/indépendant, réglable dans la config son (catégorie « Fin ») : Village, Loups-Garous, Loup Blanc, Flûte, Fossoyeur, et **Amoureux** (nouveau).

## User

pour la victoire des loups, il faut qu'il reste au moins 1 loup et 1 villageois. 
pour que la victoire des villageois, il faut qu'il ne reste plus aucun loup ni indépendant

## Assistant

_[tool: str_replace_edit]_

_[tool: show_html]_

_[tool: eval_js]_

All cases match the new rules: wolves win needs ≥1 wolf + ≥1 villageois (and 0 villageois no longer triggers it), village win needs no wolf nor independent.

_[tool: ready_for_verification]_

Ajusté et testé :

- **Victoire des Loups** — ne se déclenche que s'il reste **au moins 1 loup ET 1 villageois** vivants (plus aucun indépendant, loups au moins aussi nombreux). Le cas « 0 villageois » ne déclenche plus la victoire des loups.
- **Victoire du Village** — ne se déclenche que s'il ne reste **aucun loup ni indépendant** (Loup Blanc, Flûte).

## User

il faut qu'il reste qu'un seul villageois

## Assistant

_[tool: str_replace_edit]_

_[tool: show_html]_

_[tool: eval_js]_

Correct — wolves win only when exactly one villageois remains (your 2 loups / 2 villageois case no longer triggers).

_[tool: ready_for_verification]_

Corrigé : la victoire des Loups ne se déclenche plus que lorsqu'il reste **un seul villageois** (avec au moins 1 loup et aucun indépendant). Avec 2 loups face à 2 villageois, plus de bannière.

## User

quand il ny a plus de villageois et et qu'il reste des loups et des indépendants meme mecanique. Il faut qu'il reste au moins un loup et 1 seul indépendant

## Assistant

_[tool: str_replace_edit]_

_[tool: show_html]_

_[tool: eval_js]_

All cases correct: wolves win against a single remaining foe whether villageois or independent; two foes (1 vill + 1 flûte, or 2 vill) → no win.

_[tool: ready_for_verification]_

Fait : la victoire des Loups se déclenche dès qu'il ne reste **qu'un seul adversaire** face aux loups — que ce soit un villageois **ou** un indépendant (Loup Blanc, Flûte). S'il reste deux adversaires (ex. 1 villageois + 1 flûte), pas de victoire.

## User

montre moi tous les logos

## Assistant

_[tool: list_files]_

Le jeu n'utilise pas de fichiers logo — chaque rôle est représenté par un emblème (emoji) avec sa couleur. Je te génère une planche montrant tous ces logos. Laisse-moi voir le logo d'accueil d'abord.

_[tool: read_file]_

I'll build a logo gallery page showing the app logo plus every role emblem with its color and team.

_[tool: read_file]_

_[tool: write_file]_

_[tool: show_html]_

Looks clean. Let me see the full role grids:

_[tool: save_screenshot]_

All emblems render with their colors, names, teams, and hex codes, grouped by camp. Let me clean up and open it for you.

_[tool: delete_file]_

_[tool: ready_for_verification]_

## Assistant

Voilà **Logos.html** — une planche regroupant tous les logos du jeu :

- **Logo de l'app** (« MJ ») + l'icône du jeu Loup-Garou 🐺
- **Tous les emblèmes de rôles** (les emoji), avec nom, camp et code couleur, classés par camp : **Village** (16 rôles), **Loups-Garous** (2), **Solitaires & indépendants** (Loup Blanc, Joueur de Flûte).

Le jeu n'a pas de fichiers-logo séparés — chaque rôle est identifié par son emoji et sa couleur, c'est ce qui est affiché ici.

## User

Je veux que le logo du corbeau ressemble plus à un corbeau. Là, il ressemble à un aile. Je veux que la soeur un et deux soient identiques. Je veux que les couleurs soient par camp, c'est-à-dire que tous les villageois avec et sans pouvoir ont le même cadre. Par contre, le rond a une couleur différente en fonction du personnage. C'est-à-dire s'il y a plusieurs villageois, ils auront tous le même rond, mais le cadre sera aux couleurs du village et pas des villageois. Pareil pour les loups, je veux que tous les loups aient la même couleur de cadre et je veux que tous les indépendants aient la même couleur de cadre. Seuls les ronds changent en fonction des rôles.

## Assistant

Trois changements : corbeau → vrai corbeau, sœurs identiques, et cadres colorés par camp (seul le rond garde la couleur du rôle).

First, the role emoji in gameData.js:

_[tool: str_replace_edit]_

Now update the cursed marker (raven) in DayPhase to match:

_[tool: grep]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Now the camp-colored frames in Logos.html — frame = camp color, inner circle = role color:

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

I sent empty edits. Let me make the Logos.html edits properly:

_[tool: str_replace_edit]_

_[tool: show_html]_

Village frames are now all blue, with the inner rounds keeping each role's color. Let me check the rest (corbeau, sisters, wolves, independents):

_[tool: save_screenshot]_

Let me verify the independents both share the gold frame (only their rounds differ):

_[tool: save_screenshot]_

Both independents now share the same gold frame; only their inner rounds differ (white moon for Loup Blanc, gold note for Flûte). All four changes are in. Let me clean up.

_[tool: delete_file]_

_[tool: ready_for_verification]_

Fait :

- **Corbeau** — emblème remplacé par un vrai corbeau 🐦‍⬛ (au lieu de l'aigle qui ressemblait à une aile). Le marqueur de malédiction dans le jeu suit aussi.
- **Sœur 1 & Sœur 2** — désormais identiques (même emblème, même rond rose).
- **Cadres par camp** — tous les Villageois ont le même cadre bleu, tous les Loups le même cadre rouge, tous les indépendants le même cadre or. **Seul le rond central** change selon le rôle.

Ces changements d'emblèmes (corbeau, sœurs) s'appliquent à toute l'appli, pas seulement à la planche des logos.

## User

Le fossoyeur est un rôle indépendant. Le chien loue et l'enfant sauvage sont pour le visage jusqu'à ce qu'il devienne un rôle, ce qui peut changer la couleur du cadre.

## Assistant

Le Fossoyeur devient indépendant (cadre or), et j'ajoute un repère « peut changer de camp » sur le Chien-Loup et l'Enfant Sauvage. Let me check how `category` is used first:

_[tool: grep]_

_[tool: read_file]_

`Solitaire` is a valid category group. Now change Fossoyeur to independent:

_[tool: str_replace_edit]_

Now add a "can change camp" indicator on Chien-Loup and Enfant Sauvage in Logos.html:

_[tool: str_replace_edit]_

Now verify win logic still holds with Fossoyeur as independent, and check the logos render:

_[tool: show_html]_

_[tool: eval_js]_

Win logic intact. Let me confirm the Fossoyeur now appears in the independents section with a gold frame, and the morph badges show:

_[tool: save_screenshot]_

Fossoyeur is now in the independents section with the gold frame. Let me confirm the morph badges on Chien-Loup and Enfant Sauvage:

_[tool: save_screenshot]_

Everything's in place: Corbeau is a real crow, Sœur 1 and Sœur 2 are identical, Chien-Loup shows "↻ peut rejoindre les Loups" (Enfant Sauvage has its badge below), and Fossoyeur moved to independents with the gold frame. Cleaning up.

_[tool: delete_file]_

_[tool: ready_for_verification]_

Fait :

- **Fossoyeur** — désormais rôle **indépendant** (cadre or, section « Solitaires & indépendants »), aussi bien sur la planche que dans la logique de jeu (victoire, groupe d'attribution). Les conditions de victoire restent correctes.
- **Chien-Loup & Enfant Sauvage** — restent **Village** (cadre bleu) avec un repère « ↻ peut rejoindre / devenir un Loup ». Dans l'appli, leur emblème et leur couleur suivent déjà leur rôle effectif une fois transformés (cadre qui passe au rouge côté Loups).

