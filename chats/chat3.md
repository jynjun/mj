# Le voleur affiche le nouveau rôle

_Started 2026-06-17 01:43 UTC_

---

## User

quand le voleur choisit un joueur et qu'il échange son rôle, son nouveau rôle s'affiche à l'écra

## Assistant

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

Je vois le problème : quand le Voleur vole un rôle, aucun `bigReveal` n'est déclenché. Il faut (1) capturer le rôle volé avant le dispatch, et (2) modifier le rendu du `bigReveal` pour accepter un `roleId` forcé (puisque le state React n'a pas encore été mis à jour au moment du `setBigReveal`).

_[tool: str_replace_edit]_

_[tool: ready_for_verification]_

Je suis là si tu as une question ou une modification à apporter ! 😊

## User

lors de la nuit à côté du nom du rôle, il y a le numéro du joueur. on enleve l'option son pour l'enfant sauvage, les soeurs, le loup blanc, le salvateur. il n'y a pas besoin de suivi de la nuit sur l'ecran nuit.

## Assistant

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: ready_for_verification]_

Je suis là si tu as d'autres modifications ! 👋

## User

je veux le meme visuel que la voyante avec l'ecran pour montrer le role, pour montrer la carte au voleur apres son choix

## Assistant

_[tool: grep]_

Je vais refaire le bloc Voleur pour qu'il suive exactement le même flux que la Voyante : d'abord le vol, puis un bouton "Montrer en grand" qui affiche l'écran de révélation.

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: ready_for_verification]_

N'hésite pas à me dire si tu veux d'autres changements ! 😊

## User

je veux que quand le mj a selectionné le joueur choisi, il y a un bouton Montrer qui apparaît et lorsque je clique dessus, le rôle qu'il a s'affiche en grand

## Assistant

Quand le Voleur choisit sa cible, un bouton "Montrer" s'affiche pour montrer la carte de la cible en grand (avant le vol), et ensuite "Voler la carte" pour finaliser.

_[tool: str_replace_edit]_

_[tool: ready_for_verification]_

Dis-moi ce que tu veux changer ! 😊

## User

pour le fossoyeur, il a le choix de prendre le rôle du mort ou pas, le mj doit entrer le choix qui est fait. il y a un bouton Pris s'il prend le rôle le mj et un bouton montrer qui s'active juste à côté pour montrer la carte au fossoyeur. Faire attention si un rôle protège le mort et que finalement il ne meurt pas la nuit alors le fossoyeur ne peux pas prendre de role.

## Assistant

_[tool: grep]_

_[tool: grep]_

_[tool: read_file]_

_[tool: grep]_

_[tool: read_file]_

Maintenant j'ajoute l'action reducer pour que le Fossoyeur prenne le rôle, puis je réécris la section nuit du Fossoyeur.

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: ready_for_verification]_

C'est en place pour le Fossoyeur :

- **Montrer** affiche la carte du mort en grand.
- **Pris** : le MJ l'active si le Fossoyeur prend le rôle — le Fossoyeur devient ce rôle.
- Si la victime est **protégée** (Salvateur), un message indique qu'elle ne mourra pas et le Fossoyeur ne peut rien exhumer.

## User

l'ancien a une vie supplémentaire contre les loups. donc s'il est attaqué la nuit il survivra 1 fois.
le rôle du déménageur est d'échanger 2 numéros par nuit à partir de la 2eme nuit 
Quand je sélectionne le joueur choisi par le un joueur si je clique sur annuler, ça reset totalement le choix. s'il y a des roles qui interagissent, ils se mettent à jour.
A chaque interaction du mj avec l'application dans les etapes de jour ou de nuit, tout se met à jour tout de suite dans les interactions , les roles, les vivants, les morts, le recapitulatifs. Il faut une mise à jour constante de entre les differentes parties

## Assistant

_[tool: grep]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: grep]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

Je structure le travail :

_[tool: update_todos]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Maintenant NightPhase (Déménageur + cancel) et nettoyage de DayPhase :

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: ready_for_verification]_

Tout est en place :

- **Ancien** : survit à la 1ère attaque des Loups (vie supplémentaire) — une note l'indique à l'aube ; la 2ème attaque le tue. La potion de mort de la Sorcière le tue normalement.
- **Déménageur** : agit dès la nuit 2, sélectionne 2 joueurs et échange leurs rôles. Les autres rôles et le récap se mettent à jour immédiatement après l'échange.
- **Annuler** : réinitialise complètement l'action (le Déménageur ré-échange pour revenir à l'état initial), et tous les rôles qui dépendent du choix se réactualisent.
- L'ancienne action de jour du Déménageur (voler un mort) a été retirée.

## User

pour le demenageur c'est seulement le numero qui change pas le role

## Assistant

Ah, juste le **numéro** qui change, le rôle reste avec le joueur. Je corrige : le Déménageur échange les numéros (et tout le statut reste attaché à la personne/au rôle).

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: ready_for_verification]_

Corrigé : le Déménageur échange seulement les **numéros** des deux joueurs — chacun conserve son rôle et son statut (amoureux, enchanté, etc.). Quand les Loups visent un numéro, c'est la personne qui s'y trouve désormais qui est touchée.

## User

pour le role du fossoyeur il y a le bouton pris et un autre refusé dans le cas le joueur refuse le rôle du mort. 
A l'ecran lever du jour Mettre le bouton son à côté du Montreur d'ours. 
Si l'ancien est tué par le village au vote. tous les villageois perdent leur pouvoir.

