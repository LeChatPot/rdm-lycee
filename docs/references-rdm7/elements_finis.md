# RDM 7 – Éléments finis : référence opérationnelle

Sources : manuel d'utilisation RDM-Éléments finis (Y. Debard, 2011), manuel d'exercices (2017), `rdm.ini`, `install_rdm7.pdf`.
**[DOC]** écrit dans la doc ; **[INI]** lu dans rdm.ini ; **[À VÉRIFIER]** non visible dans la doc (aucune capture d'interface dans les manuels).

---

## 0. Organisation du logiciel (`rdmmef7.exe`)

4 modules, enchaînés dans cet ordre :

| Module | Rôle | Fichier |
|---|---|---|
| **Dessin et maillage** (« Géométrie et maillage », « Dessin-Maillage ») | dessin 2D du contour, maillage | **`.geo`** (secours `$$$.geo`) |
| **Élasticité/Thermique** (« Thermoélasticité ») | contraintes planes, déformations planes, axisymétrique ; thermique plan/axisymétrique, stationnaire ou transitoire | **`.cal`** (secours `$$$.cal`) |
| **Section droite** | caractéristiques d'une section + contraintes sous un effort | `.cal` |
| **Flexion des plaques** | plaques en flexion (Kirchhoff ou Reissner-Mindlin) | **`.pla`** (secours `$$$.pla`) |

Enchaînement type (exercices officiels) : *Lancer le module Dessin et maillage* → dessiner → **Mailler** → **Fichier → Élasticité/Thermique** (ou **Fichier → Flexion des plaques**, **Fichier → Section droite**) → choisir le **type de problème** → matériau, épaisseur, liaisons, charges → **Calculer → Analyse statique** (« Enregistrer les données et lancer le calcul ») → **Résultats**.
[À VÉRIFIER] : au démarrage de rdmmef7.exe, l'écran d'accueil propose le choix du module (Dessin-maillage, Élasticité/Thermique, Plaques, Section) ; un `.cal`/`.pla` existant s'ouvre directement par Fichier → Ouvrir.

## 1. Commandes utilitaires (identiques à Ossatures)

- **Outils → Configurer RDM** (dimension écran en mm obligatoire, curseur petit/grand, fond, boutons, coefficient de loupe), **Ressources disponibles**, **Dimension des tables**, **Outils → Options** (fait apparaître le menu caché **Mailler par blocs**).
- Échap / bouton droit / clic dans la zone des menus = quitter une procédure modale.
- **Bouton droit sur une entité** = ses attributs (point, segment, arc, élément, charge… ; après calcul : valeurs au nœud).
- **Afficher** : Zoom, Zoom plus/moins, Centrer, **Échelle maximale** (revient au cadre de travail), Mise au net, **Points** (afficher les points), Qualité (Distorsion / Nœud milieu / Jacobien), **Maillage frontière** (localiser une erreur de maillage).
- Molette ou +/− = zoom ; molette enfoncée ou flèches = translation.
- **Fichier → Exporter** (WMF/EMF), **Fichier → Imprimer**.

## 2. Unités

- **Défaut Éléments finis : longueur en cm**, force N, contrainte MPa, angle radian, température kelvin [INI]. → **Premier réflexe : « Modifier les unités courantes » → Longueur : mm** (fait systématiquement dans les exercices officiels).
- Matériau : E en MPa, ρ en kg/m³, α en K⁻¹, conductivité W/(m·K), capacité thermique massique J/(kg·K).
- Températures saisies en °C dans les exercices (ex. Ti = 100 °C) ; rayonnement calculé en K en interne.

## 3. Module Dessin et maillage

Repère : x (ou r) horizontal vers la droite, y (ou z) vertical vers le haut ; **en axisymétrique l'axe de révolution est l'axe vertical z (x = r ≥ 0)**. Un point créé s'accroche aux entités existantes (prioritaire sur le calage).

### 3.1 Fichier
- **Nouvelle étude** → **cadre de travail** : coordonnées de O, longueur L, hauteur H (modifiable : Modéliser → Modifier le cadre de travail, 2 coins) → **ébauche oui/non**. L'ébauche = tracer des droites horizontales/verticales support ; terminer par **Fin ébauche** : les intersections deviennent des points et les droites sont coupées en segments (seuls ceux dans le cadre sont gardés).
- **Bibliothèque** : numéro de structure paramétrée + paramètres (+ option « créer les sous-domaines » pour le maillage par blocs, + unités).
- **Ouvrir** / **Enregistrer** (.geo) ; **Importer** → .igs ou .igs (UNIX) (nom sans extension, unité m/mm, précision).
- **Surface** : périmètre, aire, centre de gravité, moments quadratiques / x, y et principaux → **utile en TP pour vérifier une section** (Iz d'un profil dessiné).

### 3.2 Modéliser (outils)
Mesurer (2 points → D, dx, dy, angle) ; Inventaire ; **Calage** (on/off, tolérance 15°) ; Modifier le cadre de travail ; **Modifier le trait courant** (couleur + type : **plein, pointillé**, mixte, plein fort) ; **Attribuer le trait courant à une entité** ; **Compacter les données** (supprime doublons/points isolés, projette un point proche d'une ligne et coupe la ligne) ; **Transformer** (translation 2 points / composantes / horizontale / verticale ; rotation autour d'un point ou de coordonnées + angle ; symétrie / droite par 2 points, verticale, horizontale ; déplacer ou copier une entité ou une fenêtre) ; **Points à mailler** ; **Paramètres** (maillage) ; **Modifier la taille des éléments**.

### 3.3 Entités de dessin (sous-menus de Modéliser, chacun avec des icônes)
- **Points** : par clic (numérisation) ; cartésiennes (x, y) ; polaires (R, α) [les exercices utilisent aussi « polaires depuis un point O » : (O, 60°, 10 mm)] ; intersection 2 segments / 2 arcs / segment-arc ; **discrétiser un segment ou un arc** (n entités égales) ; point milieu ; projeté sur courbe ; **point sur segment** (segment, extrémité de réf., distance D) ; centre d'arc/cercle.
- **Droites** (construction) : verticale (x = d), horizontale (y = d), par 2 points, parallèle à distance d, parallèle passant par un point, point + inclinaison, demi-droite, perpendiculaire, bissectrices, tangentes à un arc.
- **Segments** : 2 points ; horizontal (origine + L) ; vertical (origine + L) ; **polyligne** (cliquer les sommets, terminer en cliquant dans la zone des menus) ; **rectangle** (2 coins).
- **Arcs** : 3 points ; 2 segments + rayon ; demi-cercle ; quart de cercle ; 2 extrémités + rayon ; centre + origine + point ; centre + origine + angle.
- **Cercles** : diamètre ; centre + point ; **centre + rayon** ; 3 points.
- **Raccordements** (congés) : arc tangent à 2 segments (+ rayon) ; segment tangent à un arc ; segment tangent à 2 arcs ; arc tangent à 2 arcs ; arc tangent arc + segment. La position du clic fixe le point de tangence.

### 3.4 Règles géométriques pour mailler
- **Contour extérieur : fermé, en trait continu (plein)**, fait de segments, arcs, cercles.
- **Lignes intérieures en trait pointillé** : supports de charges/liaisons ; si elles ferment des **sous-domaines**, permettent matériaux/épaisseurs différents (ex. mur multicouche TS L8).
- **Points à mailler** (Modéliser → Points à mailler) : deviennent des nœuds (point de charge, de mesure, d'appui ponctuel). Les angles du contour (> 15°) sont toujours des nœuds ; un cercle contient toujours un nœud.
- « Ligne frontière » = ensemble des courbes entre deux nœuds.

### 3.5 Maillage automatique : menu **Mailler (Delaunay)**
1. **Paramètres** / **Nombre d'éléments** : nombre approximatif d'éléments (**800 par défaut** [INI]), itérations de lissage (3), qualité minimale du jacobien (**0,7 conseillé**). Stockés dans `rdmdat.ini` (dossier temp).
2. **Modifier (localement) la taille des éléments** : entrer un **coefficient**, désigner un point à mailler. **Coefficient > 1 = maillage plus fin** autour du point (ex. 5 autour d'un trou ou d'une charge), < 1 = plus grossier (ex. 0,5 loin des zones d'intérêt).
3. **Discrétiser le domaine** : choisir l'élément (icônes) : **triangle à 3 nœuds**, **triangle à 6 nœuds à bords droits**, **triangle à 6 nœuds à bords curvilignes** (pour trous/arcs). Recommandé : T6 (curvilignes s'il y a des arcs).
4. Bouton droit sur un élément = caractéristiques ; Afficher → Qualité.
- Messages d'erreur : « Deux nœuds sont confondus » (tolérance = plus grande longueur/900 ; discontinuités trop proches ou discrétisation trop forte) ; « Point extérieur au domaine » (souvent un point à mailler) ; « Deux segments frontière se coupent » (créer le point d'intersection des lignes intérieures, ajouter des points à mailler) ; « La frontière n'est pas assez discrétisée » (trou trop petit : au moins 3 tronçons → ajouter des points à mailler) ; « Point sur segment frontière ». Afficher → Maillage frontière pour localiser.

### 3.6 Maillage par blocs : menu **Mailler par blocs** (activer via Outils → Options si caché)
- Contour fermé en trait continu ; découper en **sous-domaines** triangle (3 arêtes, même nombre de nœuds) ou quadrangle (arêtes opposées de même discrétisation) tracés **en pointillé** ; angles < 180°, éviter les formes déformées.
- **Mailler → Lignes frontières** : entrer le nombre d'éléments par arête (défaut 1), désigner les lignes.
- **Mailler → Domaine** : type d'élément T3, T6 (droit/curviligne), Q4, Q8, Q9 (dans un quadrangle → quadrangles, dans un triangle → triangles).
- **Les plaques n'acceptent que T3 et Q4.** Élasticité/thermique/section : les 5 types.
- Critères qualité : distorsion (=1 pour triangle équilatéral/carré), nœud milieu (=0 idéal), jacobien (=1 idéal ; doit rester > 0).

### 3.7 Bibliothèque de structures planes (Fichier → Bibliothèque)
| N° | Forme | Paramètres |
|---|---|---|
| **1** | **rectangle plein** (2 : variante découpée en sous-domaines) | O (x, y), L, H |
| **10** | **quart de plaque avec quart de trou** en O (11 : demi ; 12–13 : plaque à encoche ; 14 : plaque percée entière) | O, L, H, R |
| 20–23 | quart / demi / ¾ / **couronne** entière | O, Rint, Rext |
| 30, 31 | pièce avec entaille (½ / entière) | L, H, d, h |
| 40–43 | quart de disque / demi / ¾ / disque | O, R |
| 50–53 | **profils en L / U / cadre** (50 = L : plaque en équerre ; 53 = cadre creux) | O, L, H, a, b |
| 60, 61 | plaque à entaille en V | L, H, a, b, h |
| 70–73, 80–83 | plaques avec congés/trous | O, L, H, E, R (+ a, b) |
| 95 | came | L, R1, R2, R3 |
| 100 | dent de crémaillère | module |
| 110, 111 ; 120–123 | pièces diverses | L, H, R ; O, L, H, D, E1–E3 |

## 4. Module Élasticité/Thermique (« Thermoélasticité »)

Hypothèses : petits déplacements, matériaux homogènes isotropes, élastiques linéaires.
**Type de problème** (choisi en entrant par Fichier → Élasticité/Thermique) : **Contraintes planes** (pièce mince chargée dans son plan : plaque, gousset, poutre-cloison, voile) ; **Déformations planes** (section courante d'un ouvrage long : mur, barrage, tunnel) ; **Élasticité axisymétrique / problème de révolution** (axe z) ; **Thermique – problème plan** ; **Analyse thermique – problème axisymétrique**.

- **Fichier** : Ouvrir / Enregistrer (.cal, nom sans extension) ; **Données** (éditer les données) ; **Éditer → Résultats** ; **Éditer → Fichier RES**.
- **Matériaux** (Modéliser → Matériaux) : **acier par défaut** (E 210000 MPa, ν 0,3, ρ 7800, α 13e-6, λ 50 W/m·K, c 450 J/kg·K [INI]). Groupes par couleur : choisir la couleur → bouton **Élément** (1 élément) ou **Domaine** (tous les éléments d'un sous-domaine). **Modifier** : désigner un élément du groupe → Nom, E (MPa), ν, ρ (kg/m³), α (K⁻¹), conductivité (W/(m·K)), capacité thermique massique (J/(kg·K)). **Bibliothèque** / **bibliothèque de l'utilisateur** (pas de béton, bois, isolants : les saisir).
- **Épaisseurs** (problème plan) : groupes par couleur (Élément / Domaine) → **Définir** → désigner un élément → épaisseur. **Indispensable en contraintes planes et en thermique plan** (ex. 10 mm ; mur : 1000 mm pour 1 m de longueur).
- **Changement de repère** nodal (direction par 2 nœuds, composantes ou angle) → appui incliné.
- **Liaisons/Symétries** : types **Appui simple** (u = 0 ou v = 0, au choix), **Rotule** (u = v = 0), **Déplacement imposé non nul** (u = d ou v = d), **Appui simple élastique** (F = −K·u). Procédure : type → paramètre → **désigner un nœud OU une ligne** (liaison répartie sur toute la ligne). **Symétrie** / plan x = A (u = 0) ou y = A (v = 0) : type → désigner un nœud du plan. En révolution, bloquer un nœud = bloquer le cercle correspondant.
- **Cas de charges** : Ajouter un cas ; détruire (désigner, détruire les charges, Compacter) ; types :
  | Charge | Saisie |
  |---|---|
  | Charge nodale (plan) | composantes de la force → nœud |
  | Charge circonférentielle (révolution) | force par unité de longueur → nœud |
  | **Charge uniformément répartie le long d'une ligne** (plan) | composantes par unité de longueur → ligne |
  | Charge surfacique (révolution) | force par unité de surface → ligne |
  | **Poids propre** | (g = 10 m/s², Calculer → Paramètres) |
  | **Pression** | valeur ; **positive = de l'extérieur vers l'intérieur de la pièce** (une traction = pression négative, cf. ELA1 : −10 MPa) → ligne |
  | **Gradient thermique** | température initiale (de référence) ; les températures proviennent du menu **Charges thermiques** |
  | Forces d'inertie (révolution) | vitesse de rotation (tr/min) |
  **Annuler une charge** : menu Charges → Annuler → type → entité. **Combinaisons** : (cas 1 × 1,33) + (cas 3 × 1)…
- **Calculer** : **Paramètres** (blocs, pesanteur), **Analyse statique**, **Analyse dynamique** (nb de modes, itération inverse / sous-espace, précision, énergies, décalage spectral).

### 4.1 Thermique (dans le même module)
Menu **Charges thermiques** (stationnaire) : **température imposée** (point ou ligne/surface), **densité de flux imposée** (W/m²), **convection** (h en W/(m²·K) + température du fluide Tf ; loi φ = h (Tf − T)), **rayonnement** en milieu infini (émissivité ε, T∞ ; σ = 5,67·10⁻⁸), **source ponctuelle** (W), **source volumique** (W/m³). Convention : chaleur reçue par le solide > 0. Paramètres du calcul modifiables.
**Transitoire** : menu **Charges thermiques transitoires** : charges, paramètres, **durée du chargement**, **nombre de pas de temps**, α (0,667 dans les exercices) ; condition initiale = température uniforme imposée en un point.
Résultat utile bâtiment : commande **Flux entrant** (W) → flux surfacique = Φ / surface (TS L7, **TS L8 mur brique/plâtre/isolant**).
Couplage : calcul thermique, puis cas de charges « gradient thermique » (T réf.) pour les contraintes thermiques (ELA4, ELA5, ELA7).

## 5. Module Flexion des plaques

Hypothèses : petits déplacements, isotrope, linéaire ; **cisaillement transverse pris en compte (Reissner-Mindlin : DST triangle, Q4γ/MITC4 quadrangle) ou négligé (Kirchhoff : DKT, DKQ)**. Éléments : **T3 et Q4 uniquement**.
- **Modéliser → Cisaillement transversal** (on/off) ou **Calculer → Paramètres → modèle de Kirchhoff / Reissner-Mindlin** ; défaut : **non pris en compte = Kirchhoff** [INI].
- Matériau, Épaisseur : comme § 4.
- **Liaisons et symétries** : **Appui simple** (w = 0, θx = 0, θy = 0 au choix – un « encastrement » de bord = w + θx + θy bloqués ; appui simple de bord = w seul), déplacement imposé, appui élastique ; sur un nœud ou une ligne. Symétrie x = A ⇒ θy = 0 ; y = A ⇒ θx = 0.
- **Charges** : nodale (Fz, Mx, My) → nœud ; **répartie le long d'une ligne** (fz, mx, my) → ligne ; **surfacique** (force/unité de surface) → un élément, un sous-domaine ou toute la structure ; **poids propre**.
- Résultats : flèche w, moments Mxx, Myy (en N·mm/mm = N), Mxy, efforts tranchants… ; modes propres (Calculer → Analyse dynamique).
- Usage AC : dalle/plancher BA encastré ou appuyé (comparaison poutre/plaque PLA4).

## 6. Module Section droite
Dessiner la section (trait continu), mailler (T6 conseillé), **Fichier → Section droite → Calculer → Analyse statique** : centre de gravité, aires, I, J (torsion de Saint-Venant), centre de cisaillement, coefficients d'aire cisaillée ; contraintes sous un effort (ex. Mx) : τmax, Von Mises (formules : `sections_calculs.md`). Une section `.geo` est réutilisable dans RDM-Ossatures (section « Fichier .geo »).

## 7. Résultats (menu Résultats)

| Besoin | Commande |
|---|---|
| Déformée | **Déformée** (amplifiée : déplacement max = vecteur de longueur L donnée) |
| Déplacements nodaux | **Résultats → Déplacements** ; ou bouton droit sur un nœud |
| **Cartographie couleur** (σxx, σyy, σxy, contraintes principales, **Von Mises**, Tresca, déplacements, températures, flux) | **Résultats → Isovaleurs** (domaines colorés) → choisir la grandeur ; **Isolignes** = courbes de niveau [liste exacte des grandeurs : À VÉRIFIER à l'écran ; Von Mises/Tresca définis dans la doc Sections] ; palette en gris possible (clé `isovaleurs=gris`) |
| Directions principales | **Faces principales** ; puis **bouton droit sur un point** pour lire σ (méthode ELA1) |
| Cercles de Mohr | **Cercles de Mohr** → désigner un nœud |
| Réactions | **Actions de liaison** |
| Graphe le long d'une droite | **Coupe suivant droite** → désigner 2 points (concentration de contrainte, profil de température) |
| Graphe le long d'un bord | **Coupe suivant ligne frontière** → 2 nœuds sur la frontière extérieure + 1 nœud de la ligne |
| Listing | **Fichier → Éditer → Résultats** ; **Éditer → Fichier RES** ; Fichier → Données |
| Thermique | températures (isovaleurs), **Flux entrant** |

## 8. Pièges
1. **Longueur par défaut en cm** → passer en mm.
2. Contour non fermé / en pointillé → maillage impossible ; lignes intérieures doivent être en **pointillé**.
3. Oublier l'**épaisseur** (contraintes planes, thermique plan).
4. Signe de la **pression** (positive = vers l'intérieur de la pièce).
5. Coefficient de taille : >1 densifie.
6. Plaques : T3/Q4 seulement ; Kirchhoff par défaut.
7. Axisymétrique : la pièce doit être à x ≥ 0 (axe = axe vertical).
8. Ne pas oublier les **symétries** quand on modélise ¼ ou ½ de pièce, et diviser la charge en conséquence (PLA1 : ¼ de la force au centre).
9. Une charge ou un appui ponctuel exige un **point à mailler**.
10. Concentration de contrainte sous charge/appui ponctuel : valeurs locales non physiques (singularité) → lire à distance.

---

## 9. Exercices officiels (exemef) — cas de validation

### Élasticité
- **ELA 1 ★ Plaque percée en traction.** Plaque 2L × 2L, L = 400 mm, trou R = 20 mm, t = 10 mm, E 210000, ν 0,27, σ = 10 MPa. Étapes : unités mm → Bibliothèque **structure 10** (xO = yO = 0, L = H = 400, R = 20, sans sous-domaines) → Mailler (Delaunay) ~400 éléments → taille locale C : 0,5 ; A et B : 5 → T6 curvilignes → Élasticité/Thermique, **contraintes planes** → matériau, épaisseur 10 → symétries x = 0 et y = 0 → **pression −10 MPa** sur x = L → calcul. **Réf.** σxx(A) = 3σ = 30 MPa (EF 29,97) ; σyy(B) = −σ = −10 MPa (EF −10,08). Lecture : zoom sur le trou → Faces principales → bouton droit en A et B ; coupe le long de AA'. **TP « concentration de contraintes / percement d'une âme ».**
- **ELA 2 ★ Plaque verticale sous pesanteur** (Timoshenko-Goodier). Structure 1 (L 1000, H 3000), épaisseur 100 mm ; points A (milieu haut), B (milieu bas), M (centre) → points à mailler ; ~200 T6 ; contraintes planes ; E 200000, ν 0,3, ρ 7800 ; A : u = v = 0 ; B : u = 0 ; poids propre + pression −0,234 MPa en haut. **Réf.** v(B) = −1,7550·10⁻³ mm ; σyy(M) = 0,117 MPa ; σyy(A) = 0,234 MPa (exact). Démontre : poids propre, appuis isostatiques.
- **ELA 3 Disque tournant** (axisymétrique, Ri 10, Re 100, ép. 20 ; structure 1 xO = 10, L 90, H 10 ; w = 0 sur AB ; 3000 tr/min). **Réf.** σθθ(A) = 6,36 MPa (EF 6,43) ; u(B) = 7,054·10⁻⁴ mm ; σrr max 2,57 MPa.
- **ELA 4 Tube épais sous gradient thermique** (axisym., Ri 20, Re 80, H 20 ; E 100000, α 1e-5 ; T 100/0 °C ; Tréf 0). **Réf.** σθθ(Ri) = −100,86 MPa (EF −103,75) ; σθθ(Re) = 42,00 MPa ; ur(Re) = 30,60·10⁻³ mm.
- **ELA 5 Sphère épaisse** (structure 20, Ri 100, Re 200 ; cas 1 p = 100 MPa : u(Ri) = 0,0400 mm, σθθ(Ri) = 71,43 MPa ; cas 2 gradient 100/0 °C : σθθ(Ri) = −244,9 MPa).
- **ELA 6 Cylindre sous pression** (Ri 100, Re 200 ; pi = 100 : u(Ri) = 0,0885 mm, σθθ(Ri) = 150 MPa ; pe = 100 : σθθ(Ri) = −240 MPa).
- **ELA 7 Poutre sous gradient thermique** (L 300, H 30, t 10, TBC 50 / TAD 30 °C, T0 40) : vM = −0,3900 mm ; M bloqué : FyM = 203,17 N (EF 203,0), σxx(B) = −40,63 MPa.

### Flexion des plaques
- **PLA 1 ★ Plaque circulaire encastrée** (R 1 m, t 10 mm, E 200000, ν 0,3 ; ¼ de plaque : structure 40, ~400 T3, taille ×5 en O ; Kirchhoff). Cas 1 : P = −5000 N au centre (saisir −1250 N sur le quart) : **w(O) = −5,431 mm** (DKT −5,440). Cas 2 : q = −0,001 MPa : **w(O) = −0,8531 mm**, Mxx(A) = 125 N, Mxx(O) = −81,25 N. Effet Mindlin : w/wK = 1 + 4,57 (t/R)².
- **PLA 2 Plaque carrée encastrée sur un côté, modes** (L 1 m, t 10, ρ 8000 ; maillage par blocs 10 × 10 Q4 ; DKQ ; sous-espace, 6 modes) : ω1 = 52,84 rad/s, ω2 = 128,99, ω3 = 324,25.
- **PLA 3 Plaque carrée libre, modes** (décalage 10 Hz, 3 modes rigides) : f1 = 32,90 Hz, f2 = 48,26 Hz.
- **PLA 4 ★ Plaque ou poutre** (bande 4L × d, L = 100, d = 30, t = 10 ; encastrée x = 0, appui simple x = 3L ; point à mailler en B ; ~600 T3) : wB = −0,6500 mm (EF −0,6369) sous p = −10 N/mm ; +0,0750 sous couple ; +0,0375 sous q = −0,1 N/mm². Montre l'écart plaque/poutre.

### Section droite
- **SEC 1 Triangle équilatéral** c = 10 mm (nouvelle étude, cadre 20 × 20 ; points O(0,0), A(10,0), B polaire (O, 60°, 10) ; segments ; ~200 T6 ; Fichier → Section droite ; Mx = 1000 N·mm). **Réf.** xG = 5 mm, yG = 2,887 mm ; J = 216,506 mm⁴ ; τmax = 20,00 MPa (EF 19,99).

### Thermique stationnaire
- **TS L1 Températures imposées** (structure 50, L = H = 800, a = b = 400 ; λ = 1 ; ép. 1 ; TAF 10 °C, TDE 0 °C ; ~400 T6) : TC = 6,667 °C ; TB = 9,009 ; TG = 5,495.
- **TS L2 ★ Paroi cylindrique bicouche + convection** (ébauche cadre 300 × 20, horizontales y = 0, 20, verticales x = 100, 250, 300 → Fin ébauche → segment intérieur en pointillé ; axisym. ; λ1 = 100, λ2 = 50 (2 groupes matériau par couleur/domaine) ; hi 120/Tfi 100 °C ; he 50/Tfe 20 °C) : Ti = 59,052 ; Tm = 54,550 ; Te = 52,758 °C ; φri = 4913,72 W/m². **Modèle de la procédure multicouche.**
- **TS L3** facteur de forme cylindres excentrés : Φ = 29451 W (EF 29383), K = 5,89 m.
- **TS L4** 3 couches + source volumique : TA = 31,648 ; TB = 41,539 ; Tmax 43,713 °C.
- **TS L5** cylindre + source + convection : TO = 30,020, TE = 30,000 °C.
- **TS L6** rectangle + source + T imposées : Tmax = 34,50 °C à x = 70 mm ; φO = −14000 W/m².
- **TS L7** paroi à ailettes (axisym., 1000 T6) : Tmin ailettes 490 K ; Flux entrant 562,57 W.
- **TS L8 ★★ Mur brique / plâtre / isolant** (λ = 0,72 / 0,22 / 0,026 ; he 25 W/m²K, Tf −10 °C ; hi 10, Tf 20 °C ; plan, épaisseur 1000 mm, ~1000 T6) : **Flux entrant 4,43 W → 17,72 W/m² (réf. 17,5)**. *Directement réutilisable en TSTI2D AC (thermique de paroi, pont thermique).* Géométrie (figure p. 37, pdf p. 41, mm) : tranche de mur de hauteur 250 : isolant 30 mm côté intérieur (x 0→30), puis cadre de « plâtre » d'épaisseur 20 (côtés verticaux) et 15 (haut/bas) entourant une brique 160 × 220 ; largeur totale 30 + 20 + 160 + 20 = 230 mm ; 3 sous-domaines → lignes intérieures en pointillé + 3 groupes matériau ; convection côté isolant (intérieur) et côté plâtre opposé (extérieur). Flux surfacique = Φ / (0,25 m × 1 m).
- **TS NL1–NL3** convection + rayonnement : NL1 T1 = 66,288 °C, T2 = 482,880 °C ; NL2 T1 = 180,854, T2 = 247,752 ; NL3 T1 = 119,664, T2 = 156,326.

### Thermique transitoire (durée, nb de pas, α = 0,667)
- **TT L1** choc thermique plaque 50 × 2 (Te 100, T0 20 ; 60 s / 60 pas) : T centre 66,92 °C à 20 s, 96,51 °C à 60 s.
- **TT L2** plaque + convection (26 min 40 s / 120 pas) : T centre 272,29 °C à 1600 s.
- **TT L3** sphère + convection (400 s / 120) : centre 803,79 °C à 400 s.
- **TT L4** milieu semi-infini (120 s / 120) : face 1 : 61,70 °C à 120 s.
- **TT NL1** rayonnement + source (2000 s / 100) : 536,29 °C ; **TT NL2** convection + rayonnement (1000 s) : 199,34 °C.
