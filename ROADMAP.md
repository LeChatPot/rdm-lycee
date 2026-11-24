# Feuille de route — RDM Lycée

Chaque étape n'est considérée comme terminée que lorsque **tous ses critères de validation** sont atteints et que `npm test` est vert. Les références « RDM 7 » renvoient aux manuels de Y. Debard (IUT du Mans).

## v1.0 — Poutre en flexion (faite)

- [x] Moteur par la méthode des déplacements, 8 exemples du manuel RDM – Flexion validés à 0,1 %.
- [x] Interface autonome hors ligne, Annuler / Rétablir, outils explicites, mode « Je calcule d'abord », compte rendu imprimable.

## v1.1 — Compléments de la poutre

- [ ] **Sections variables par tronçon** (Iz et A différents d'un tronçon à l'autre).
  Critère : poutre console à deux tronçons d'inerties différentes — flèche en bout égale à la formule analytique (intégration par tronçons) à 0,1 % ; cas équivalent du manuel RDM – Flexion si disponible.
- [ ] **Sections en T et en U** (paramétrées, centre de gravité et vsup ≠ vinf).
  Critère : A, Iz, v de l'exemple 7 (section en T) retrouvés à 0,1 % ; un profilé UPN comparé à NF EN 10365 (A, Iy) à 0,5 %.
- [ ] **Flèche finale du bois avec kdef** (wfin = winst·(1 + kdef), selon NF EN 1995-1-1 §2.3.2.2 et tab. 3.2 ; classes de service 1 à 3).
  Critère : solive C24 calculée à la main (formule 5pL⁴/384EI puis ×(1 + kdef)) retrouvée à 0,1 % ; valeurs kdef citées avec leur tableau.
- [ ] **Vérification au cisaillement** (contrainte de cisaillement maximale : τ = 1,5 T/A pour le rectangle, T/Aâme pour les I ; comparaison à fv,d pour le bois avec kcr, à fy/√3 pour l'acier).
  Critère : deux cas analytiques (rectangle bois, IPE) à 0,1 % ; sources NF EN 1995-1-1 §6.1.7 et NF EN 1993-1-1 §6.2.6 citées.

## v1.2 — Aide au dimensionnement

- [ ] **Optimisation automatique de section** (équivalent du menu « Optimiser » de RDM 7) : plus petite section d'une famille (IPE, HEA, rectangle bois de hauteur variable…) vérifiant contrainte et/ou flèche limite.
  Critère : exemple 8 du manuel (D = 32,00 mm pour σ, D = 107,49 mm pour la flèche) retrouvé ; pour une famille de profilés, le résultat est le premier profilé conforme et le précédent est non conforme (test).
- [ ] **Cas de charges alternés** (charge d'exploitation placée travée par travée pour obtenir les moments maximaux sur poutre continue).
  Critère : poutre continue à 2 ou 3 travées égales — moments sur appui et en travée conformes aux coefficients des tables classiques de RDM à 0,1 % ; enveloppe des diagrammes affichée.

## v2 — Module Ossatures 2D

- [ ] **Portiques plans** (nœuds, barres, liaisons, charges nodales et réparties), méthode des déplacements à 3 ddl par nœud.
  Critère : au moins 3 exemples chiffrés du manuel RDM – Ossatures (fiche `docs/references-rdm7/ossatures.md`) retrouvés à 0,1 % (déplacements et réactions).
- [ ] **Treillis** (barres articulées) avec efforts normaux affichés (traction / compression).
  Critère : un treillis isostatique comparé à la méthode des nœuds (calcul manuel) et un exemple du manuel RDM – Ossatures, à 0,1 %.
- [ ] **Flambement** (charge critique d'Euler, longueurs de flambement, puis vérification simplifiée).
  Critère : poutre bi-articulée Fcr = π²EI/L² à 0,1 % ; mode de flambement d'un exemple du manuel RDM – Ossatures retrouvé à 0,5 %.
- [ ] Ergonomie identique au module Poutre (Annuler, outils explicites, tutoiement).
  Critère : test d'interface dédié vert.

## v3 — Mode professeur

- [ ] **TP verrouillé partagé par lien** : l'enseignant prépare une étude, fixe les données non modifiables et les questions, et obtient un lien (données encodées dans l'adresse, sans serveur).
  Critère : un lien ouvert dans un autre navigateur restitue exactement l'étude ; les champs verrouillés ne sont pas modifiables ; test d'interface.
- [ ] **Export du compte rendu au gabarit La Salle** (en-tête, cartouche, sources).
  Critère : PDF produit conforme au gabarit (vérification visuelle par l'enseignant) et contenant les résultats chiffrés et la source de chaque donnée.
- [ ] **Intégration Moodle par code résultat** : l'élève obtient un code de contrôle (dépendant de ses résultats) à saisir dans un test Moodle.
  Critère : le code est reproductible, change si un résultat change, et ne se devine pas sans faire le calcul (test).
- [ ] **Puis LTI 1.3** (lancement depuis Moodle et retour de note).
  Critère : lancement et retour de note validés sur une plateforme Moodle de test ; aucune donnée personnelle stockée hors Moodle.

## v4 — Éléments finis plans simplifiés

- [ ] Plaques en contraintes planes (éléments triangulaires à 3 nœuds puis quadrangles), maillage automatique simple, iso-contraintes de von Mises.
  Critère : au moins 2 exemples du manuel RDM – Éléments finis (fiche `docs/references-rdm7/elements_finis.md`) retrouvés à 1 % ; convergence vérifiée en raffinant le maillage (test).
- [ ] Lecture pédagogique des résultats (zones les plus sollicitées, comparaison avec la théorie des poutres).
  Critère : sur une poutre élancée maillée, contrainte en fibre extrême égale à Mf·v/Iz à 2 %.
