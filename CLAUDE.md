# Instructions pour Claude Code — projet RDM Lycée

Tout se fait **en français** : code commenté en français, noms de variables en français quand c'est naturel, documentation, messages d'interface, messages de commit.

## Objectif pédagogique

Logiciel de résistance des matériaux pour la **Terminale STI2D AC** (lycée La Salle, Troyes), puis pour les collègues (autres établissements, BTS). Il doit faire comprendre la mécanique, pas seulement donner des résultats : afficher l'équilibre, les hypothèses, les unités, les vérifications.

Trajectoire : module **Poutre (flexion)** aujourd'hui, puis modules **Ossatures 2D** et **Éléments finis plans** inspirés de RDM 7 (Y. Debard, IUT du Mans). Voir `ROADMAP.md`.

Références utiles : `docs/references-rdm7/` (fiches de pilotage et de vérification RDM 7 : flexion, ossatures, éléments finis, sections).

## Règles NON négociables

1. **Justesse du calcul avant tout.**
   - Tout changement du moteur (`src/moteur/`) doit garder `npm test` vert. Jamais de tolérance relâchée pour faire passer un test.
   - Chaque nouvelle fonction de calcul arrive avec **son test** dans `tests/`, de préférence tiré d'un **exemple chiffré des manuels RDM 7** (Flexion, Ossatures, Éléments finis) ou d'une **formule de RDM classique** (ex. flèche 5pL⁴/384EI) dont la source est citée dans le test. Tolérance 0,1 % sauf justification écrite.
   - Le moteur reste sans dépendance, en modules ES, sans accès au DOM.
2. **Données matériaux et profilés uniquement de sources officielles**, citées en commentaire à côté de la valeur (norme + tableau/article) : NF EN 10365, NF EN 338, NF EN 14080, NF EN 1990, NF EN 1991-1-1, NF EN 1992-1-1, NF EN 1993-1-1/NA, NF EN 1995-1-1, NF EN 1999-1-1… Une valeur non normative (fiche fabricant, valeur moyenne) est marquée `indicatif: true` et signalée à l'écran. Pas de valeur « de mémoire ».
3. **Interface sobre, style institutionnel** : bleu ardoise (`--accent:#3e5c76`), fond clair, typographie simple. **Pas d'emojis, pas de dégradés, pas de cartes tape-à-l'œil**, pas d'animations gratuites.
4. **Tout en français, tutoiement de l'élève** (« Choisis un outil », « Ajoute un appui »). Jamais de vouvoiement dans l'interface.
5. **Page autonome hors ligne** : `npm run build` produit un seul fichier `dist/index.html`, sans ressource externe (ni CDN, ni police en ligne, ni bibliothèque). Doit fonctionner sur les PC du lycée (navigateur récent, parfois sans droits d'installation), sur tablette (tactile, écran étroit) et sur Chromebook. Le test `tests/build.test.mjs` vérifie l'autonomie.

## Défauts de RDM 7 à ne JAMAIS reproduire

- Charge appliquée au 2e clic sans retour visible : chaque clic doit produire un effet visible immédiatement, et l'outil doit dire ce qu'il attend (« 1) clique sur le DÉBUT… 2) clique sur la FIN… »).
- Outil qui reste actif sans le dire : l'état de l'outil est toujours affiché ; par défaut l'outil se désactive après usage (option « garder l'outil »).
- Affichage en retard sur les données : les résultats et schémas se mettent à jour à chaque modification.
- Pas d'annulation : Annuler / Rétablir doivent couvrir toute modification.
- Limite du nombre de nœuds : aucune limite arbitraire, nœuds créés automatiquement.
- Pas de bois ni de béton : les matériaux du bâtiment (bois massif, lamellé-collé, panneaux, béton) sont des citoyens de première classe.
- Pas de vérifications ELU / ELS : les vérifications réglementaires sont affichées avec leurs hypothèses.

## Manière de travailler

- **Petites étapes** : une fonctionnalité ou une correction par commit.
- **`npm test` avant chaque commit** (et `npm run build` si l'interface change ; `npm run test:interface` si l'environnement le permet).
- **Messages de commit en français**, à l'infinitif ou au présent (« Ajoute la section en T », « Corrige le signe de θ à la rotule »).
- **`CHANGELOG.md` tenu à jour** à chaque modification visible (rubrique « Non publié » puis version).
- Ne pas modifier `dist/` à la main : il est généré.
- Avant une nouvelle grande fonctionnalité, relire `ROADMAP.md` et cocher le critère de validation correspondant une fois atteint.
- Ne jamais ajouter de dépendance npm sans nécessité absolue ; le projet doit rester compréhensible par un enseignant.
