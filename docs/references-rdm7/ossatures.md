# RDM 7 – Ossatures : référence opérationnelle (pilotage pas à pas + TP STI2D AC)

Sources : manuel d'utilisation RDM-Ossatures (Y. Debard, IUT du Mans, 2011), manuel d'exercices (2011), `install_rdm7.pdf` (RDM 7.04, 64 bits, 2018), `rdm.ini` livré, `bibli.dat`.
Légende : **[DOC]** = écrit dans la doc ; **[INI]** = lu dans rdm.ini ; **[À VÉRIFIER]** = non visible dans la doc (le manuel n'a aucune capture d'écran de l'interface, seulement des schémas géométriques) → contrôler à l'écran à la 1re séance et compléter ce fichier.

---

## 0. Fichiers, lancement, installation

| Élément | Détail |
|---|---|
| Exécutables | `rdmoss7.exe` (Ossatures), `rdmmef7.exe` (Éléments finis), `rdmflex7.exe` (Flexion – poutre droite seule), `rdmrosette.exe` (rosettes) ; DLL `rdmmessFR7.dll` (messages FR) |
| Installation | lancer `INSTALL.exe` → nom d'utilisateur (5 à 80 caractères) → répertoire → **dimension de l'écran obligatoire** (diagonale en pouces, ou en cm, ou largeur en mm) → Installer |
| Dossier de données | par défaut `Documents\RDM7` de l'utilisateur ; bibliothèque utilisateur (`profiles.bib`, `materiaux.bib`) dans `Documents\RDM7\BIBLI` |
| Extension des données | **`.por`** (fichier texte, unités SI internes m-kg-s-rad) ; sauvegarde de secours automatique `$$$.por` |
| Fichier de compte rendu | **`.res`** (créé à chaque calcul : déroulement + infos) |
| Éditeur texte utilisé | `notepad` (clé `edit=` de rdm.ini) [INI] |

## 1. Souris, clavier, écran (valable pour tous les modules)

- **Zoom** : molette, ou touches **+** / **−** [DOC install]. Menu **Afficher** : **Zoom** (désigner 2 coins d'une fenêtre), **Zoom plus** / **Zoom moins** (facteur = « coefficient de loupe », 2 par défaut [INI]), **Centrer** (cliquer le nouveau centre), **Échelle maximale** (= tout afficher ; à faire après création des nœuds), **Mise au net** (redessiner), **Repère** (point de vue 3D par angles θ, φ).
- **Translation de la vue** : déplacer la souris molette enfoncée, ou flèches du clavier.
- **Rotation 3D (ossature spatiale)** : déplacer la souris en maintenant **Ctrl**.
- **Bouton droit sur une entité** (nœud, poutre, charge…) = **afficher ses attributs** → c'est LA méthode documentée pour lire un déplacement nodal, un effort normal, une réaction, etc. après calcul.
- **Quitter une procédure en cours** (« procédure modale ») : **Échap**, ou bouton droit, ou cliquer dans la zone des menus.
- **Désigner** = cliquer l'entité dans la zone graphique (bouton gauche).
- **Supprimer le poids propre / un gradient thermique** d'un cas de charges : cliquer l'**icône correspondante en bas de l'écran** [DOC install].

## 2. Arborescence des menus (reconstituée à partir de la doc)

```
Fichier      : Nouvelle étude | Ouvrir | Enregistrer | Bibliothèque (ossatures paramétrées)
               | Importer > .igs | Exporter (WMF/EMF) | Imprimer
               | Éditer > Résultats / Fichier RES / Analyse modale | Caractéristiques (section)
Afficher     : Zoom | Zoom plus | Zoom moins | Centrer | Échelle maximale | Mise au net | Repère
Modéliser    : Noeuds/Poutres | Transformer | Orienter une poutre | Sections droites
               | Calculer section droite | Matériau(x) | Liaisons extérieures/Symétries
               | Relaxations | Cas de charges (Ajouter un cas, Combinaisons) | Masses
               | Changement de repère (nodal) | Unités | Compacter les données
Calculer     : Paramètres | Analyse statique | Analyse dynamique (modes propres)
Résultats    : Paramètres | Déformée | Efforts (diagrammes) | Poutre | Contraintes sur section
               | Valeur en un point | Flambement | (après modal) Déformée modale / animée, énergies
Outils       : Configurer RDM | Ressources disponibles | Dimension des tables | Options
```
[À VÉRIFIER] : dans RDM 6/7 les rubriques de **Modéliser** apparaissent aussi comme **boutons d'une barre de menus verticale** (« Noeuds », « Poutres », « Sections droites », « Matériaux », « Liaisons », « Relaxations », « Cas de charges », « Calculer », « Résultats ») – c'est ainsi que les exercices officiels enchaînent les étapes. Chaque sous-commande géométrique est une **icône pictogramme** (pas de texte) : identifier par l'infobulle ou par le dessin (le pictogramme reproduit le schéma de la commande).

## 3. Démarrer une étude

1. **Fichier → Nouvelle étude**.
2. Choisir le **type d'ossature** :
   - **Ossature plane** : plan {O;xy}, charges dans le plan + couples selon z ; 3 ddl/nœud (u, v, θz) ; efforts N, TY, MfZ. → *cas de 95 % des TP STI2D (portiques, poutres, treillis, fermes).*
   - **Ossature plancher** (grillage) : charges ⟂ au plan xy ; 3 ddl (w, θx, θy) ; efforts TZ… en pratique TY, Mt, MfZ dans le repère local (Y ⟂ au plan). → solivage de plancher, grille de poutres.
   - **Ossature spatiale** : 6 ddl (u v w θx θy θz) ; 6 efforts (N TY TZ Mt MfY MfZ).
3. **Unité de longueur** demandée dès la création (ex. m) [DOC exercices] ; puis saisie des **coordonnées des premiers nœuds** (support des constructions).
4. Variante : **Fichier → Bibliothèque** = ossature paramétrée (type → numéro → dimensions) (§ 5).
5. Variante : **Fichier → Importer → .igs** (définir d'abord le type ; nom sans extension ; unité du dessin m/mm ; précision).

### Unités utilisateur
- **Modéliser → Unités** (commande « Unités ») : longueur (m, cm, mm…), force (N, daN, kN), contrainte (Pa, MPa…), angle (radian, degré), température (K, °C).
- **Valeurs par défaut Ossatures [INI]** : force **N**, longueur **m**, contrainte **MPa**, angle **radian**, température **kelvin**.
- Le matériau est toujours saisi en **MPa, kg/m³, K⁻¹** (dialogue matériau) ; les sections « quelconques » sont saisies en **cm² / cm⁴** dans les exemples (aire 16 cm², IZ 135 cm⁴) [À VÉRIFIER : l'unité est affichée dans le dialogue].
- **Piège** : une charge répartie s'exprime en (unité de force)/(unité de longueur courante) : N/m si m, N/mm si mm. Passer en **daN** ou **kN** avant la saisie si l'énoncé l'est.
- **Piège angles** : par défaut en radians → passer en degrés pour lire θ en ° (les exemples donnent θ en °).

## 4. Géométrie : nœuds et poutres

**Modéliser → Noeuds/Poutres** (icônes) :

| Commande | Saisie |
|---|---|
| Nœud par coordonnées cartésiennes | entrer (x, y[, z]) |
| Nœud par coordonnées polaires (plane/plancher) | (r, θ) — l'exemple 7 l'utilise **avec un nœud de référence** : désigner le nœud de réf. puis (θ, r) |
| Nœud par coordonnées sphériques (spatiale) | (r, θ, φ) |
| Nœud milieu | désigner 2 nœuds |
| Nœud sur poutre | désigner la poutre, le nœud de référence, entrer la distance D |
| Nœuds équidistants | désigner 2 nœuds, entrer le nombre de nœuds à créer |
| Projeter un nœud sur une droite | désigner nœud puis poutre (la poutre est coupée en 2 si le point est dessus) |
| Déplacer un nœud | désigner, entrer nouvelles coordonnées |
| Poutre définie par 2 nœuds | désigner origine puis extrémité (**l'ordre fixe l'axe local X**) |
| Poutres par une série de nœuds | désigner les nœuds successifs (polyligne) |
| Poutre parallèle à x, y ou z | désigner l'origine, entrer L (signée) |
| Prolonger une poutre | poutre, extrémité, longueur |
| **Discrétiser une poutre** | désigner, entrer le nombre d'éléments (indispensable pour poutres courbes, flambement, modes propres) |
| Détruire une poutre / poutres dans une fenêtre / un groupe | désigner |
| Ajouter / détruire un ressort | raideur + masse, puis nœuds origine et extrémité |

**Transformations** : **Modéliser → Transformer** : translation (2 nœuds / composantes / parallèle à un axe), rotation (axe par 2 nœuds ou parallèle à un axe + angle), symétrie (plan par 3 nœuds en spatial ; par 2 nœuds en plan ; plan ∥ {xy}/{xz}/{yz} par un nœud). S'applique à une poutre, une fenêtre ou un groupe ; déplacer ou dupliquer.

**Règles de modélisation** :
- Un nœud est obligatoire à : jonction de poutres, extrémité, changement de section, **point d'application d'une charge ponctuelle nodale**, appui, début/fin de charge répartie (sinon utiliser « charge ponctuelle sur poutre » qui ne nécessite pas de nœud).
- Une suite 1-2-…-8 n'est pas une poutre unique : créer chaque tronçon, sinon message **« La structure est en plusieurs morceaux »**.
- **Compacter les données** (Modéliser) : supprime doublons et nœuds isolés **et renumérote les nœuds** ; c'est fait automatiquement au lancement du calcul → **piège** : les numéros affichés après calcul peuvent différer de ceux de l'énoncé ; repérer les nœuds à l'écran plutôt que par numéro.

### Orientation (repère local) d'une poutre
- X : de l'origine vers l'extrémité ; Y, Z : axes centraux principaux de la section.
- Sections droites paramétrées : par défaut **Y vertical vers le haut, Z de droite à gauche**. Pour un IPE/HEA, **Z = axe fort** (Izz ≈ 8 à 10 × Iyy). En **ossature plane**, la flexion se fait autour de **Z** → c'est **IZ** qui compte : un IPE est donc automatiquement « debout » (inertie forte). Pour le mettre « à plat » : **Sections droites → Échanger Y et Z**.
- Spatial : **Modéliser → Orienter une poutre** → angle φ, ou un nœud / un point du plan {O;XR}, ou raccourcis φ = 90°, 45°, 180° → désigner la poutre. Par défaut OH ∥ {xy} (spatial) ou ∥ {xz} (plane) ; si X ∥ z, OH ∥ x.

## 5. Bibliothèque d'ossatures paramétrées (Fichier → Bibliothèque)

Choisir le type (plane / plancher / spatiale), le **numéro**, puis les dimensions. En spatial, une ossature plane est posée dans le plan {yz}.

| N° | Forme (paramètres) | Usage TP AC |
|---|---|---|
| 1 | potence (H, L) | console, potence |
| 2 | **portique simple** (H, L) | **portique hangar / ossature** |
| 3, 4 | portique à jambe inclinée / à traverse inclinée (H1, H2, L, D) | appentis, toiture monopente |
| 5, 6 | poutre continue sur poteaux (D, L, H) | |
| 7 | **cadre fermé** (L, H) | |
| 8–16 | triangles, V, Y, chevalets, croix (L, H, L1, L2, H1, H2, D) | |
| 30 | arc de cercle (R, angle de départ A0, ouverture A, N éléments) | arcs, anneaux (Ex.3, 6, E7) |
| 31, 32 | arc + droite (R, L, N) | |
| 50 | **grille rectangulaire** L×H (N × M travées) — plancher (D6) ou treillis | |
| 51–53 | treillis à membrures non parallèles (L, HO, HE, N) — 52/53 : Pratt/Warren | poutre treillis |
| 54, 55 | pylônes plans (Linf, Lsup, H, N) | |
| 56–59 | **treillis trapézoïdal / à membrure courbe** (L, H, HC, HO, N) | passerelles |
| treillis en arc (L, Y2, L1=L3, L2, N) | | |
| 100–102 | tours spatiales (H, Lx, Ly, N) | |
| 103, 104 | poutres treillis spatiales (Ly, Lx, zO, zE, N) | |
| 105 | tronc de pyramide (H, xC, yC, base, sommet, N) | |
| 120, 121 | grille circulaire (Rint, Rext, angle, N, M) | |
| 122, 123 | cylindre ; 124, 125 tronc de cône ; 126, 127 coupole ; 128 tronc de pyramide | |
| **200, 201, 202** | **portique à deux versants** (L, D faîtage, H1, H2[, H3]) — 201 avec entrait | **bâtiment à 2 pentes** |
| **203** | **portique + ferme triangulée** (L, D, H1, H2, N, M) | |
| **204** | portique + poutre treillis monopente (L, N, H1–H4) | |
| **205** | portique + ferme à membrure inférieure brisée (L, D, H1–H6, N, M) | |
| **206** | ferme à angle α sur poteaux (L, H, α, N) | |

(N = nombre de tronçons ; figures p. 20-27 du manuel, pdf p. 26-33.)

## 6. Sections droites

**Modéliser → Sections droites**. Les poutres sont regroupées par **groupe de section** (1 couleur + 1 type de trait par groupe).
- **Créer un 2e groupe** : choisir une couleur (palette) et/ou un type de trait, puis boutons **Poutre** (désigner 1 poutre), **Groupe** (désigner 1 poutre d'un groupe) ou **Fenêtre** (2 coins). Ensuite définir la section de chaque groupe en désignant une poutre du groupe.
- Types de section (choisir le type puis, s'il y a plusieurs groupes, désigner une poutre du groupe) :
  - **Section quelconque** : nom, désignation (facultatifs) + caractéristiques (A, IZ, IY, J…). En plan, A et IZ suffisent (Bernoulli) ; contraintes non tracées sans dimensions.
  - **Section paramétrée** : forme + dimensions (tableau ci-dessous).
  - **Section variable** : dimensions à l'origine et à l'extrémité (poutre à inertie variable – E9, S13, F3, D2).
  - **Bibliothèque de profilés** (du logiciel ou de l'utilisateur) : choisir la famille (IPE, HEA…) puis la ligne dans la table. Caractéristiques complètes (J, k, Iω…) déjà calculées.
  - **Fichier IGES** / **fichier .geo** (dessiné dans RDM-Éléments finis) / **fichier .gse** (texte : points + segments/arcs/cercles, unités m/cm/mm) : sections de forme libre.
- **Modifier** (bouton) : nouveaux attributs d'un groupe. **Échanger Y et Z** : rotation de ±90° de la section.
- **Calculer section droite** (Modéliser) : maillage de la section (triangles à 3 ou 6 nœuds + nombre d'éléments) → calcule J, kY, kZ, centre de cisaillement, Iω, modules plastiques. Inutile pour un profilé de bibliothèque. Lire les valeurs : **Fichier → Caractéristiques**.

### Formes paramétrées utiles (n° de forme : dimensions, dans l'ordre de saisie)
| Forme | Dimensions |
|---|---|
| 1 rond plein / 2 rond creux | diamètre ext. ; épaisseur |
| 3 carré plein / 4 carré creux | côté ; épaisseur |
| **5 rectangle plein** / 7 rectangle creux | côté ∥ Y (hauteur) ; côté ∥ Z (largeur) ; épaisseur — *section bois b×h : forme 5 avec h en 1er* |
| 6 caisson bi-symétrique ; 46 mono-symétrique | côtés ∥Y, ∥Z ; épaisseurs |
| 8 I à semelles égales | hauteur ; largeur semelles ; ép. âme ; ép. semelles |
| 9 I semelles inégales | h ; b sup ; b inf ; tw ; tf sup ; tf inf |
| 10 / 13 cornière égale / inégale ; 11 T ; 12 U ; 14 Z | longueurs + épaisseurs |
| 15/16 hexagone, 34/21 octogone ; 17/18 triangle ; 22 double I ; 23 caisson (7 dim.) ; 32 arc ; 35, 33, 38–40 arbres | |
| 101 IPN (h, b, tw, tf à b/4, r, r1) ; **102 IPE/HE (h, b, tw, tf, r)** ; 103 UPN ; 104 UAP/UPE ; 105/106 cornières arrondies ; 107 Té ; 108 demi-HE/IPE ; **109 carré creux arrondi** ; **110 rectangle creux arrondi** ; 80 panne Z | |

## 7. Matériaux

**Modéliser → Matériau(x)**. **Par défaut : acier** [DOC] = E 210000 MPa, ν 0,3, ρ 7800 kg/m³, α 13·10⁻⁶ K⁻¹, Re 250 MPa [INI].
- Groupes par couleur : choisir la couleur courante puis bouton **Élément**/Poutre (1 poutre), groupe ou fenêtre.
- **Définir** / **Modifier** : désigner une poutre du groupe, entrer Nom, **Module de Young (MPa)**, coefficient de Poisson, masse volumique (kg/m³), coefficient de dilatation (K⁻¹, saisie type `18E-6`), limite élastique. G = E/[2(1+ν)] est calculé.
- **Bibliothèque** ou **Bibliothèque de l'utilisateur** : désigner une poutre du groupe → choisir un matériau (liste § annexe).
- **Piège AC** : **aucun bois ni béton dans la bibliothèque** → les saisir à la main. Valeurs usuelles (hors doc RDM, d'après les Eurocodes / NF EN 338 & 14080 – à confirmer en cours) : bois C24 E0,mean = 11000 MPa, ρ ≈ 420 kg/m³ ; lamellé-collé GL24h E = 11500 MPa ; béton C25/30 Ecm ≈ 31000 MPa, ρ = 2500 kg/m³, ν = 0,2.

## 8. Liaisons extérieures (appuis)

**Modéliser → Liaisons extérieures/Symétries** : choisir le type, entrer le paramètre éventuel, désigner le(s) nœud(s).
| Type | Effet |
|---|---|
| Degré de liberté supprimé | u=0, v=0, w=0, θx=0, θy=0 ou θz=0 au choix → **appui simple** = v=0 seul (appui rouleau horizontal) |
| **Rotule** (articulation) | u = v = w = 0 |
| **Encastrement** | tous ddl nuls |
| Déplacement imposé | u=d… ou θ=φ (tassement d'appui ; génère un « cas 0 ») |
| Appui élastique | F = −k·u (raideur k par ddl) |
| Appui incliné | d'abord **Changement de repère nodal** au nœud (direction par 2 nœuds, composantes, ou angle / x), puis la liaison dans ce repère (E13) |
| Symétrie / plan ∥ {xz}, {xy}, {yz} | impose les ddl de symétrie aux nœuds du plan (permet de ne modéliser qu'une moitié/un quart) |

- Correspondance TP : appui simple (rouleau) = **v = 0** ; articulation fixe = **Rotule** ; encastrement = **Encastrement**.
- **Piège** : liaisons insuffisantes = mécanisme → pivot nul/négatif à la factorisation → calcul impossible. Un treillis tout rotule-rotule reste calculable (ex. 2, E1).

## 9. Liaisons intérieures (relaxations)

Par défaut **toutes les poutres sont encastrées entre elles (rigide)**. **Modéliser → Relaxations** → type de poutre → désigner la poutre → (si dissymétrique) désigner le nœud rotule/pivot.
Types : **Rigide–Rigide**, **Rigide–Rotule**, **Rotule–Rotule** (barre de treillis), Rigide–Pivot d'axe Y, Rigide–Pivot d'axe Z, Pivot Z–Pivot Z, Pivot Y–Pivot Y. En plan, « rotule » = Mf nul à l'extrémité. Codes dans le .por : RIRI, RORI, RIRO, RORO, PYRI, RIPY, PYPY, PZPZ.
- **Treillis** : toutes les barres en Rotule–Rotule et charges aux nœuds uniquement.
- **Portique à 3 articulations** : une seule poutre Rigide–Rotule côté faîtage (pas les deux, sinon mécanisme local inutile mais tolérée).

## 10. Cas de charges

Menu **Cas de charges** : **Ajouter un cas de charges** ; plusieurs cas possibles ; **désigner le cas actif** avant d'ajouter des charges. Détruire un cas : désigner le cas → détruire toutes ses charges → Modéliser → Compacter.
Ajouter une charge (désigner le type) :
| Type | Saisie (ordre) | Code .por |
|---|---|---|
| **Charge nodale** (force ou couple) | composantes **repère global** (Fx,Fy[,Fz] ; Mx,My,Mz) → désigner le nœud | FNOD / CNOD |
| **Charge ponctuelle sur poutre** (force/couple en travée) | désigner la poutre → repère (local/global), **distance à l'origine de la poutre**, composantes | FTRA/FTRL, CTRA/CTRL |
| **Force uniformément répartie** | repère (local/global) + composantes par unité de longueur → désigner la poutre | FUNI / FUNL |
| Force linéairement répartie (trapèze/triangle) | désigner la poutre → repère → valeurs origine et extrémité | FLIN / FLIL |
| Force linéaire sur une partie de poutre | poutre → repère → distances début/fin → valeurs | FPAR / FPAL |
| **Force verticale répartie par longueur projetée** (neige sur rampant !) | q par mètre projeté horizontal → poutre | FVER |
| Couple réparti (uniforme / linéaire) sur une partie | poutre → repère → distances → valeurs | |
| **Poids propre** | (g défini dans Calculer → Paramètres, **10 m/s² par défaut** [INI]) | POIDS |
| Variation de température uniforme (structure) | ΔT | TEMP |
| Variation de température d'une poutre | ΔT → poutre | THPO |

- **Conventions** : y vers le haut → **une charge de gravité est négative** (ex. (0, −10000) N). « Repère global » conseillé pour les charges verticales sur poutres inclinées ; « local » pour vent ⟂ au rampant.
- **Combinaisons** : Cas de charges → **Combinaisons** → action (créer/modifier) → (désigner la combinaison) → entrer n° de cas et coefficients, ex. (cas 1 × 1,35) + (cas 2 × 1,5). → ELU/ELS en TP.
- Déplacements imposés non nuls : à définir dans **Liaisons**, pas dans les charges.
- **Masses** (pour modes propres uniquement) : Modéliser → **Masses** : masses ponctuelles/nodales (kg), réparties (kg/m) ; la masse propre est toujours comptée.

## 11. Calcul

- **Calculer → Paramètres** : taille des blocs (12000 [INI]), **accélération de la pesanteur** (10 [INI]), **modèle de poutre : Bernoulli (défaut [INI cisaillement=0]) ou Timoshenko** (cisaillement transverse). En STI2D : Bernoulli.
- **Calculer → Analyse statique** → le logiciel demande d'**enregistrer les données** (nom du .por) puis lance le calcul (« Enregistrer les données et lancer le calcul »). Compactage + renumérotation automatiques.
- **Calculer → Analyse dynamique** (modes propres) : nombre de modes, nombre d'éléments (maillage), méthode (itération inverse / **itération sur sous-espace**), précision (|ωi−1−ωi|/ωi), énergies élémentaires oui/non ; **décalage spectral** (en Hz) si modes rigides (structure libre).

## 12. Résultats (statique)

| Besoin | Commande |
|---|---|
| Déformée | **Afficher la déformée** ; amplification réglée par **Résultats → Paramètres** (déplacement max représenté par un vecteur de longueur donnée) |
| Diagrammes N, TY, TZ, Mt, MfY, **MfZ**, σ sur toute la structure | **Représenter les efforts sur la structure** → choisir la grandeur (effort normal, effort tranchant sur Y, moment fléchissant…). σ de flexion tracée seulement si la section a des dimensions (2 courbes σmin(X), σmax(X)) |
| Courbes dans une poutre (efforts, déplacements, flèche) | **Résultats → Poutre** → désigner la poutre → grandeur. Lecture d'une valeur : **Valeur en un point** (entrer l'abscisse) |
| **Flèche / déplacement d'un nœud, réaction d'appui, effort dans une barre** | **bouton droit sur le nœud / l'appui / la poutre** |
| Contraintes dans une section (σ, τ, Von Mises, Tresca) | **Contraintes sur section** (Résultats) → désigner la poutre → grandeur → abscisse de la section (commande **Abscisse de la section** du menu Modéliser de cette fenêtre) |
| Listing complet (déplacements, réactions, efforts aux extrémités, max) | **Fichier → Éditer → Résultats** (ouvre le texte dans Notepad : copier dans la notice) ; **Fichier → Éditer → Fichier RES** ; **Éditer les efforts dans les poutres** |
| Flambement | voir § 13 |
| Enveloppes | **non documentées** dans le manuel 2011 [À VÉRIFIER] ; utiliser les combinaisons et comparer les cas |

Remarque : « Éditer les résultats » donne aussi le moment fléchissant maximal et sa position (cf. E2 : 18301 daN·m à X = 2,66 m).

## 13. Flambement eulérien (linéaire)

Après une analyse statique : **Résultats → Flambement** → nombre de modes, **nombre d'éléments** (maillage de l'ossature), hypothèse **petites rotations** ou **rotations modérées**, précision → afficher un mode. Le résultat est le **coefficient de charge critique λC** : charge critique = λC × charges appliquées (si λC < 1 la structure flambe sous la charge). Discrétiser : 1 élément par barre donne une erreur notable (F1 : 3 él. → 24,8 ; 10 él. → 18,53).

## 14. Modes propres

Résultats disponibles : Éditer le fichier .RES, Éditer les résultats, **Fichier → Éditer → Analyse modale** (fréquences Hz, pulsations, masses généralisées, facteurs de participation, masses effectives %), **Afficher la déformée modale**, **déformée animée**, énergie de déformation / cinétique par unité de longueur. Matrices de masse consistantes.

## 15. Sortie : notice de calcul, impression, sauvegarde

- **Fichier → Enregistrer** (nom sans extension → `.por`) ; **Fichier → Ouvrir** (nom sans extension).
- **Fichier → Exporter** : dessin courant en **WMF** ou **EMF** (nom sans extension) → insérable dans Word.
- **Fichier → Imprimer** : entrer la dimension du dessin.
- Texte : **Fichier → Éditer → Résultats** ou **Fichier RES** → Notepad → copier/coller dans la notice.
- Contrôle à l'écran : **Fichier → Éditer → Données** [À VÉRIFIER dans Ossatures ; existe dans EF].
- Alternative fiable pour une capture : copie d'écran Windows (Win+Maj+S).

## 16. Configuration / utilitaires

**Outils → Configurer RDM** : nom, **dimension de l'écran (obligatoire)**, couleur du fond, des boutons, coefficient de loupe… ; **Ressources disponibles** ; **Dimension des tables** (max 2000 nœuds / 2000 poutres [INI]) ; **Options** (affiche certains menus cachés).

## 17. Format .por (pour générer un modèle par script si besoin)

Fichier texte entre `$DEBUT DU FICHIER` et `$FIN DU FICHIER`, **unités SI** (m, N, Pa, rad) : `$VERSION`, `$SI`, `$DATE`, `$HEURE`, `$NOM`, `$OSSATURE` (PLANE/SPATIALE/PLANCHER), `$NOEUDS` (n° x y z ; terminé par nœud 0), `$POUTRES` (n°, type RIRI…, nœud O, nœud E, vecteur axe R, groupe section, groupe matériau ; terminé par 0), `$MATERIAUX` (NOM *, MODULE, POISSON, MASSE VOLUMIQUE, DILATATION, LIMITE ELASTIQUE, ///), `$SECTIONS` (TYPE QUELCONQUE/PARAMETREE/VARIABLE/BIBLIOTHEQUE/GEOMETRIE, FORME, DIMENSIONS, AIRE, IYY, IZZ, TORSION…), `$LIAISONS` (SUP ddl / IMP ddl val / ELA ddl k / ROTULE / ENCASTREMENT + n° nœud), `$SYMETRIE`, `$GPESANTEUR`, `$CAS DE CHARGES` (FNOD, CNOD, FUNI, FUNL, FLIN, FLIL, FTRA, FTRL, CTRA, CTRL, FPAR, FPAL, FVER, POIDS, TEMP, THPO ; //// fin), `$CISAILLEMENT TRANSVERSAL`, `$MASSES`, `$MODES`. Le plus sûr reste de créer un modèle à l'écran, l'enregistrer et l'ouvrir pour copier la syntaxe exacte.

## 18. Pièges récapitulés (pour élèves et pour le pilotage)

1. Unités : vérifier force/longueur **avant** de saisir ; défaut N et m ; EF par défaut en **cm** (autre module).
2. Signe des charges (y vers le haut).
3. Nœuds manquants aux points de charge/appui → utiliser charge sur poutre ou créer le nœud.
4. Renumérotation après compactage.
5. IPE en plan : IZ = inertie forte (OK) ; profil à plat → Échanger Y et Z.
6. Bois/béton absents de la bibliothèque.
7. Treillis : relaxations Rotule–Rotule + charges nodales seulement.
8. Flambement/modes/poutres courbes : discrétiser.
9. Bernoulli par défaut ; Timoshenko seulement si demandé.
10. Le poids propre n'est compté que si on l'ajoute au cas de charges (g = 10 m/s²).

---

## 19. Exercices officiels (exeoss) — cas de validation

Coordonnées notées (x ; y), en m sauf mention, virgule décimale ; ★ = transposable directement en TP STI2D AC. Figures : manuel d'exercices, page pdf = page imprimée + 4.

### Chapitre 1 – Exemples (procédure détaillée fournie)
- **Ex.1 ★ Portique plan** (Giet). Nœuds (0 ; 0) (0 ; 1) (0 ; 2) (2 ; 2) ; poutres 1-2, 2-3, 3-4 ; section quelconque A = 16 cm², IZ = 135 cm⁴ ; E = 200000 MPa ; encastré en 1, rotule en 4 ; P = (10000, 0) N au nœud 2 ; Bernoulli. **Réf.** u2 = 2,2144 mm, v2 = −0,0017 mm, θ2z = −0,0388° ; u3 = 0,0245 mm, θ3z = 0,1510° ; θ4z = −0,0754° ; R1x = −6077,4 N, R1y = 533,4 N, M1z = 3221,6 N·m ; R4x = −3922,6 N, R4y = −533,4 N. Démontre : saisie de base complète.
- **Ex.2 ★ Treillis à 3 barres + température.** Nœuds 1(0 ; −0,8), 2(−0,6 ; 0), 3(0 ; 0), 4(0,6 ; 0) ; barres Rotule–Rotule ; carré plein 10 mm ; 1-2 et 1-4 acier (E 200000, α 11e-6), 1-3 laiton (E 100000, α 18e-6) → 2 groupes matériau (couleur + bouton Élément + Définir) ; rotules 2, 3, 4 ; P = (0, −10000) N au nœud 1 + ΔT = 50 K. **Réf.** v1 = −0,96 mm ; Δ1-2 = Δ1-4 = 0,768 mm, Δ1-3 = 0,960 mm ; N1-2 = N1-4 = 4370 N, N1-3 = 3008 N. Lecture : bouton droit.
- **Ex.3 Anneau plan** (bibliothèque n° 31, R = L = 50 mm, 20 éléments, carré 10 mm, ¼ modélisé avec symétries x=0 (nœud 1) et y=0 (nœud 3), p = −10 N/mm, Timoshenko). **Réf.** v1 = −0,330 mm (EF −0,32977), u3 = 0,1333 mm ; M1z = −18983 N·mm ; F3y = 500 N ; M3z = −18567 N·mm ; Mfz2 = 6483 N·mm ; σa,b = ±113,9 MPa.
- **Ex.4 Plancher** (Weaver-Gere). Ossature plancher, 5 poutres, encastrées en 1, 3, 5, 6 ; section quelconque A = 100 cm², J = 2·10⁵ cm⁴, IZ = 10⁵ cm⁴ ; E 200000, ν 0,25 ; nœud 2 : Fz = 50 kN + My = 100 kN·m ; poutre 1-2 : Fz = −150 kN à 3 m ; poutre 5-4 : −75 kN/m. **Réf.** w2 = −1,2182 mm ; w4 = −2,0993 mm ; F1z = 93,528 kN, M1y = −163,092 kN·m ; F5z = 214,940 kN ; F6z = 57,080 kN. (Géométrie sur la figure, L = 2 m.) Démontre : type plancher.
- **Ex.5 Ossature spatiale.** Nœuds 1(0,0,0) 2(0,0,4) 3(0,8,4) 4(0,11,4) 5(3,8,4) 6(3,8,0) ; E 100000, ν 0,2987 ; rectangles pleins 600×300 (1-2, 2-3, 3-4), 500×300 (3-5), 800×300 (5-6) → groupes de sections ; **orientation poutre 1-2 : 90°** ; encastré 1 et 6 ; F = (0,0,−1000) daN au nœud 4 ; Timoshenko. **Réf.** moments d'extrémité (daN·m) ex. 3-4 : MfZo = −3000 ; 5-6 : MfYo = −3581, MfYe = −3632.
- **Ex.6 Modes propres d'un anneau** (bibliothèque 30, R = 0,1 m, 0–360°, 60 éléments + patte verticale 0,0275 m discrétisée en 6 ; E 72000, ρ 2700 ; anneau 5×10 mm, patte 3×10 ; encastré en 1). **Réf.** f = 28,8 / 189,3 / 268,8 / 641 / 682 / 1063 Hz.
- **Ex.7 ★ Ossature plane à barres articulées.** Nœuds 1(0 ; 0), 2(1,5 ; 0), 3 = polaire depuis 1 (60°, 1,5 m), 4 = polaire depuis 2 (60°, 1,5 m) ; 5 barres Rotule–Rotule ; **bibliothèque carré creux 100×5** ; E 200000 ; rotules 1 et 2, appui u = 0 en 4 ; nœud 3 : (1000, −2000) daN ; milieu 1-2 : (0, 2000) daN ; milieu 2-4 : (0, −2000) daN ; 3-4 : charge triangulaire (0 → −4000 daN/m en 4). **Réf.** u3 = 0,02632 mm, v3 = −0,07895 mm, v4 = −0,15789 mm ; R1 = (699, 211) daN, R2 = (699, 4789) daN, R4x = −2398 daN ; poutre 3-4 : N = −667 daN, TY3 = −1000, TY4 = 2000 daN. Démontre : barres articulées chargées en travée (flexion locale).

### Chapitre 2 – Analyse statique
- **E1 ★ Treillis plan (9 barres)** (Frey). Nœuds 1(0 ; 0) rotule, 2(2 ; 0), 3(4 ; 0), 4(6 ; 0) appui simple, 5(2 ; −1,4), 6(4 ; −2) ; barres 1-2, 2-3, 3-4, 1-5, 5-6, 6-4, 2-5, 5-3, 6-3 ; carré creux 70×5 (bibli.) ; E 210000 ; Q = −1800 daN en 1, P = −3600 daN en 2 et 3. **Réf.** R1y = 5400, R4y = 3600 daN ; N12 = N23 = −5143 ; N34 = −3600 ; N15 = 6278 ; N56 = 3758 ; N64 = 5091 ; N25 = −3600 ; N53 = 1883 ; N63 = −4680 daN.
- **E2 ★ Portique 3 poutres HEA 600** (Jalil). Nœuds 1(0 ; 0) appui simple, 2(4 ; 4), 3(10 ; 4), 4(14 ; 2) articulation ; poutres soudées ; P_A = −2000 daN au milieu de 1-2 ; P_C = (−1000, 0) au milieu de 3-4 ; P_B = −2000 daN au milieu de 2-3 et q = −1000 daN/m sur 2-B (charge partielle) ; Bernoulli. **Réf.** R1 = (0 ; 4679) daN, R4 = (1000 ; 2321) daN ; Mf max = 18301 daN·m sur 2-3 à X = 2,66 m.
- **E3 ★ Portique à 3 articulations HEA 600.** Nœuds 1(−3 ; 0) rotule, 2(−3 ; 5), 3(0 ; 5), 4(3 ; 5), 5(3 ; 0) rotule ; rotule intérieure en 3 ; P = (4000, 0) daN en 2 ; q1 = (1000, 0) daN/m sur 1-2 ; q2 = (0, −5000) daN/m sur 2-3 et 3-4. **Réf.** R1 = (−1250 ; 9583), R5 = (−7750 ; 20417) daN ; Mf max en 4 = 38750 daN·m.
- **E4 ★ Portique 2 versants à 3 articulations HEA 600, E 210000.** Nœuds 1(−3 ; 0), 2(−3 ; 4,5), 3(0 ; 6), 4(3 ; 4,5), 5(3 ; 0) ; rotules 1, 5 et intérieure en 3 ; nœud 2 : F = (2000, −5000) daN + C = −3000 daN·m ; 2-3 et 3-4 : q = −1000 daN/m **projeté** (FVER). **Réf.** R1 = (−250 ; 6000), R5 = (−1750 ; 5000) daN.
- **E5 Cadre contreventé 6 barres articulées** (L = 1,25 m ; poutres de sections différentes ; charges nodales, en travée, couple, répartie). **Réf.** R3 = (−2890 ; −5667) N, R4 = (−2110 ; 7667) N ; N1-4 = −2683, N3-2 = 3150 N.
- **E6 ★ Poutre bi-encastrée 1 m** (AFNOR). A = 10⁻³ m², IZ = 1,7·10⁻⁸ m⁴, E = 2,1·10¹¹ Pa ; p = −24000 N/m ; à x = 0,3 : P = (30000, 0) N + C = −3000 N·m ; à x = 0,7 : Q = (10000, −20000) N. **Réf.** RAx = −24000 N ; v(0,5) = −4,90·10⁻² m ; TY(0,5) = −540 N ; MfZ(0,5) = 2800 N·m.
- **E7 Poutre courbe** (bibli. 30, R 60 mm, 270°, carré 30 mm, P = 6000 N, Timoshenko). **Réf.** v2 = 0,8474 mm (Bernoulli 0,8336) ; 20 éléments → 0,8426.
- **E8 Trois barres articulées (charge ⟂ à une barre inclinée).** 1(−4L ; 0), 2(0 ; 0), 4(0 ; 3L), 3(4L ; 3L), L = 10 cm, a = 10 mm, q = 8 N/mm. **Réf.** u4 = 6·10⁻³ mm, v4 = −8·10⁻³ mm ; N1-4 = 0, N2-4 = −1600 N, N4-3 = −1200 N.
- **E9 Poutre conique sous poids propre** (L 1,2 m, D 50 mm, ρ 8000, g 10). **Réf.** v2 = −0,11059 mm (Bernoulli) ; θ2 = −0,0079206°.
- **E10 Treillis spatial 9 barres** (nœuds listés dans le manuel). **Réf.** nœud 6 : (0,41121 ; 1,34562 ; 2,10171) mm ; réaction 2 : (−6 ; 204 ; −122,4) kN.
- **E11 ★ Portique, traverse chauffée.** 1(0 ; 0), 2(0 ; 0,3), 3(1 ; 0,3), 4(1 ; 0) encastrés en 1, 4 ; 2-3 Rotule–Rotule ; rond creux 80×5 ; E 210000, α 13e-6 ; ΔT = 50 K sur 2-3. **Réf.** N = −6071,3 N ; allongement δ = 0,62546 mm.
- **E12 Treillis, barre chauffée** (L 0,5, carré creux 40×5, α 12,5e-6, ΔT 30 K). **Réf.** N = −12636 N ; N23 = N34 = 7296 N ; v1 = −0,09026 mm ; δ13 = 0,14237 mm.
- **E13 ★ Appui incliné.** 1(0 ; 0) rotule, 2(0 ; 0,3), 3(0,6 ; 0,3) appui incliné 45° ; rond creux 30×5 ; q = −1000 N/m sur 2-3. **Réf.** R1 = (200 ; 400) N, R3 = (−200 ; 200) N ; Mf2 = −60 N·m ; u3 = −0,27009 mm. Démontre : changement de repère nodal.

### Chapitre 3 – Sections (Calculer section droite ; lecture Fichier → Caractéristiques)
- **S1/S3/S4/S9** : U, Z, cornière… paramétrées ; convergence J, Iω, YC, kY, kZ selon maillage (TR3 vs TR6) et comparaison formules parois minces (écart croît avec t). Ex. S1 (L = H = 100, t = 20) : J = 68,34 cm⁴, kY = 0,6158.
- **S2** torsion d'un carré a = 100 mm : J = 7899,5 cm⁴, θ = 0,016457 rad, τmax = 124,75 MPa.
- **S5 UPN 400** : J = 80,65 cm⁴ ; **S6 IPN 500** : J ≈ 374 cm⁴ ; **S7 HEM 320** : J = 1510 cm⁴ ; **S8 cornière 70×50×7** : J = 1,367 cm⁴.
- **S10 ★ Flexion déviée** console 1 m, carré 2a×a (a = 100 mm), F = (P, 0, 3P), P = −10 kN : σ = ±75 MPa à l'encastrement (Contraintes sur section + Abscisse de la section).
- **S11 Flexion-torsion** (équerre carré 40 mm, P = −3000 N) : w2 = −2,944 mm, w3 = −13,126 mm (Timoshenko) ; au point M : σ = 140,63 MPa, τ = −90,07 MPa, **σVM = 210,03 MPa** ; τmax = 92,89 MPa.
- **S12** demi-IPE 500, TY 100 kN : τG = 55,28 MPa. **S13 ★** poutre conique D 100→50 mm, P = −10 kN : σmax = ±120,72 MPa à x = 0,5 m (Résultats → Poutre). **S14** cornière 100×60×9 : σT = 43,65 / σC = −51,02 MPa. **S15–S17** parois minces ouvertes/fermées, caissons : J, τ moyens (ex. S16 τA = 14,29 MPa). **S18** IPN 180 équerre flexion-torsion. **S19** carré variable : σ1 = 4/1 MPa, σ2 = 16/4 MPa (Valeur en un point).

### Chapitre 4 – Flambement (Résultats → Flambement)
- **F1** cadre 3 poutres 100×20 : λC = 18,53 (10 éléments). **F2** λC = 1,223. **F3** poteau conique : λC = 5,1218.
- **F4** déversement console 100×6 (petites / rotations modérées) : λC = 12,21 ; 32,57 ; 5,734 ; 11,467. **F5/F6** lame équerre (λ selon signe de P/M).
- **F7** mât sous poids propre H 4 m, Ø 30 : λC = 17,662.
- **F8 ★ Euler 4 cas** poutre 1,2 m, rectangle 20×100, E 200000, P = −1000 N : λ1 (encastré-libre) = 22,846 ; λ2 (rotule-rotule) = 91,385 ; λ3 (encastré-rotule) = 186,95 ; λ4 (bi-encastré, θ bloquée) = 365,54. **Idéal TP « longueur de flambement ».**
- **F9** cadre articulé : λC = 13,166 (nœud 2 libre) ; 38,110 (bloqué).

### Chapitre 5 – Modes propres (Calculer → Analyse dynamique)
- D1 treillis : 171,4 / 290,5 Hz… ; D2 poutre variable : 56,55 Hz ; **D3** bi-encastrée carré 10 mm, L 1 m : 53,34 / 147,02 / 288,22 Hz ; D4 portique : 8,8 Hz ; D5 spatial : 11,8 Hz ; D6 plancher (bibli. 50, L 0,8, H 0,4, N = M = 4) : 96 / 165 Hz ; D7 poutre libre (décalage 20 Hz) : 74,08 Hz ; D8 console + masses : 12,78 / 8,39 / 10,39 / 7,59 Hz.

---

## Annexe – contenu de bibli.dat (bibliothèque livrée)

**Matériaux** (E MPa, ν, ρ kg/m³, α 10⁻⁶/K, λ W/m·K, Re MPa) : Fer 210000/0,285/7850/12,5/71,1/200 ; Acier 45 SCD 6 220000/…/1450 ; Acier inox 203000/0,29/7850 ; Fonte 100000/7100 ; Titane 110000/4500 ; TA6V 105000/4400 ; **Aluminium 67500/0,34/2700/24/209/30** ; AU4G 74000/2800 ; AU2GN 73000 ; Zicral 72000 ; Cuivre 100000/8930 ; Laiton UZ40 92000/8400 ; Bronze 106000 ; Bronze au béryllium 130000 ; Béryllium 294000 ; Magnésium 45000 ; Plomb 16700 ; Plexiglas 2900/1800 ; **Verre 60000/0,25/2600**. Aucun bois, béton, maçonnerie.

**Familles de profilés** (n° de forme ; gamme) :
- IPN (101) 80 → 600 ; **IPE (102) 80 → 600** ; IPE-A 80–600 ; IPE-R, IPE-O 180–600
- **HEA, HEB, HEM, HEA-A (102) 100 → 1000**
- UPN (103) 80–400 ; UPN-A 240–300 ; UAP (104) 80–300 ; UAP-A 250–300 ; UPE (104) 80–400 ; petits fers U (103) 30–70
- Demi-poutrelles IPE/IPE-A/IPE-O/IPE-R/HEA/HEA-A/HEB/HEM (108) 180/200 → 600/800
- **Carrés creux (109)** 83 réf., 22×2,3 → 350×12 ; **Rectangles creux (110)** 80 réf., 50×25×2,6 → 400×300×12 ; **Ronds creux (2)** 58 réf., Ø21,3×2,3 → Ø406,4×8
- Cornières ailes égales (105) 20×3 → 200×24 (93 réf.) ; inégales (106) 30×20×3 → 200×100×14 (55 réf.) ; Tés (107) 25 → 80

**Extrait utile IPE / HEA** (axe fort = Z ; A cm², Iy faible, Iz fort en cm⁴, Wel,z = Iz/v en cm³) :

| Profil | A | Iy | Iz | Wel,z | | Profil | A | Iy | Iz | Wel,z |
|---|---|---|---|---|---|---|---|---|---|---|
| IPE 100 | 10,3 | 15,9 | 171 | 34,2 | | HEA 100 | 21,2 | 134 | 349 | 72,8 |
| IPE 120 | 13,2 | 27,7 | 318 | 53,0 | | HEA 120 | 25,3 | 231 | 606 | 106 |
| IPE 140 | 16,4 | 44,9 | 541 | 77,3 | | HEA 140 | 31,4 | 389 | 1033 | 155 |
| IPE 160 | 20,1 | 68,3 | 869 | 109 | | HEA 160 | 38,8 | 616 | 1673 | 220 |
| IPE 180 | 24,0 | 101 | 1317 | 146 | | HEA 180 | 45,3 | 925 | 2510 | 294 |
| IPE 200 | 28,5 | 142 | 1943 | 194 | | HEA 200 | 53,8 | 1336 | 3692 | 389 |
| IPE 220 | 33,4 | 205 | 2772 | 252 | | HEA 220 | 64,3 | 1955 | 5410 | 515 |
| IPE 240 | 39,1 | 284 | 3892 | 324 | | HEA 240 | 76,8 | 2769 | 7763 | 675 |
| IPE 270 | 46,0 | 420 | 5790 | 429 | | HEA 260 | 86,8 | 3668 | 10455 | 836 |
| IPE 300 | 53,8 | 604 | 8356 | 557 | | HEA 300 | 112,5 | 6310 | 18264 | 1260 |
| IPE 360 | 72,7 | 1044 | 16266 | 904 | | HEA 400 | 159,0 | 8564 | 45069 | 2311 |
| IPE 400 | 84,5 | 1318 | 23128 | 1156 | | HEA 600 | 226,5 | 11271 | 141208 | 4787 |

Bibliothèque utilisateur : fichiers `.SEC` (dimensions) → `.PRO` (caractéristiques calculées) → liste dans `PROFILES.BIB` ; matériaux dans `MATERIAUX.BIB` (lignes : E ν ρ α λ C Re *Nom). Permet d'ajouter du bois (ex. `11000 0.3 420 5 0.13 0.6 24 *Bois C24`) [format DOC, valeurs indicatives].
