# Journal des modifications

Ce journal suit le format « Keep a Changelog » ; les versions suivent la numérotation sémantique (majeure.mineure.correctif).

## [Non publié]

## [1.0.0] — 2026-11-24

### Ajouté
- Module **Poutre** : calcul de poutres droites en flexion plane par la méthode des déplacements (éléments poutre d'Euler-Bernoulli).
- Liaisons : appui simple, encastrement, rotule intérieure, pente nulle, déplacement imposé, appuis élastiques en translation et en rotation.
- Charges : force, couple, répartie uniforme ou trapézoïdale, poids propre ; catégories G et Q.
- Sections (rectangle, rond, tubes, I soudé, IPE, HEA, quelconque) et matériaux (S235, C24, GL24h, panneaux, aluminium, béton C25/30) avec sources normatives.
- Vérifications ELU / ELS, équilibre affiché, mode « Je calcule d'abord », animation, Annuler / Rétablir, enregistrement .json, compte rendu imprimable.
- Moteur découpé en modules ES (`src/moteur/`), interface séparée (`src/interface/`), construction d'une page autonome `dist/index.html`.
- Tests : 8 exemples du manuel RDM – Flexion (57 valeurs, tolérance 0,1 %), cohérence du moteur embarqué, autonomie de la page ; test d'interface facultatif.
- Publication automatique sur GitHub Pages (tests obligatoires avant déploiement).

### Modifié
- Textes de l'interface passés au tutoiement de l'élève.
