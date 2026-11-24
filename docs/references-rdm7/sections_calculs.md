# RDM 7 – Sections droites et méthodes de calcul (synthèse de sections.pdf et calculs.pdf)

Y. Debard, IUT du Mans (2011). Ce que le logiciel calcule et avec quelles formules.

## 1. Caractéristiques d'une section (module « Calculer section droite » d'Ossatures, module Section droite d'EF)

Repère {O;yz} quelconque, puis repère central principal {G;YZ}.

| Grandeur | Définition / formule | Remarque |
|---|---|---|
| Aire | A = ∫ dA | |
| Moments statiques | My = ∫ z dA ; Mz = ∫ y dA | |
| Centre de gravité | yG = Mz/A ; zG = My/A | indépendant du repère |
| Moments quadratiques | Iy = ∫ z² dA ; Iz = ∫ y² dA ; Iyz = ∫ yz dA | Iyz = 0 si un axe est de symétrie |
| Huygens | Iy' = Iy − zG²A ; Iz' = Iz − yG²A ; Iy'z' = Iyz − yG zG A | translation vers G |
| Rotation α | Iy''(α) = (Iy'+Iz')/2 + (Iy'−Iz')/2 cos2α − Iy'z' sin2α ; Iz'' symétrique ; Iy''z'' = (Iy'−Iz')/2 sin2α + Iy'z' cos2α | |
| Axes principaux | tan 2α0 = 2Iy'z' / (Iz' − Iy') ; IY,Z = (Iy'+Iz')/2 ± ½√[(Iy'−Iz')² + 4Iy'z'²] | cornières, Z : RDM calcule l'angle α |
| Moment polaire | Ip = IY + IZ | |
| Rayons de giration | iY = √(IY/A), iZ = √(IZ/A), iO = √(IO/A) | élancement en flambement |
| Constante de torsion de Saint-Venant | J = ∫ (Y ∂ω/∂Z − Z ∂ω/∂Y + Y² + Z²) dA | = Ip pour un rond plein ou creux ; ≪ Ip pour un profil ouvert |
| Centre de cisaillement (torsion) C | YC = −(1/IY)∫ Z ω dA ; ZC = (1/IZ)∫ Y ω dA | point fixe en torsion pure ; ≠ G pour U, cornière, Z |
| Moment d'inertie de rotation | Ir = (YC² + ZC²) A + Ip | |
| Constante de gauchissement | Iω = ∫ ω² dA | déversement, torsion non uniforme |
| Constantes de stabilité | βY = ∫ Y(Y²+Z²) dA ; βZ ; βω = ∫ ω(Y²+Z²) dA ; Yβ = βY/(2IZ) − YC ; Zβ = βZ/(2IY) − ZC | flambement flexion-torsion |
| Modules plastiques | Wpl,Y = ∫ |Z − Zp| dA ; Wpl,Z = ∫ |Y − Yp| dA (axes plastiques = partage en 2 aires égales) | |
| Coefficients d'aire cisaillée | kY = (1/(IZ A)) ∫ g Y dA ; kZ = (1/(IY A)) ∫ h Z dA ; aires cisaillées AY = kY A, AZ = kZ A | utilisés par le modèle de Timoshenko ; certains auteurs utilisent 1/k (rectangle : k = 5/6) |
| Énergie de cisaillement | TY²/(2GAkY) + TZ²/(2GAkZ) par unité de longueur | |

**Méthodes numériques** :
- A, My, Mz, Iy, Iz, Iyz : **intégration sur le contour** (formule de Green) ; contributions exactes pour cercles et arcs (segment circulaire), quadrature de Gauss pour segments et éléments quadratiques.
- βY, βZ : contour discrétisé en éléments quadratiques + Gauss.
- Fonctions de gauchissement ω (torsion), g et h (efforts tranchants TY, TZ) : équations de Laplace/Poisson (∇²ω = 0 ; ∇²g = −(A/IZ) Y ; ∇²h = −(A/IY) Z) avec conditions de Neumann sur le contour, résolues par **éléments finis sur un maillage de Delaunay de la section** (TR3 ou TR6) → J, C, Iω, k dépendent du maillage (TR6 et ≥ 400 éléments : écart < 1 %).
- Wpl : évalués sur le maillage.
- Profilés de la bibliothèque : valeurs déjà calculées (maillages ~1000–2500 éléments, contrôle sur IY, IZ des catalogues OTUA à < 0,1 %).

## 2. Contraintes dans une section (Résultats → Contraintes sur section)

Force intérieure [N, TY, TZ, Mt, MfY, MfZ] dans {G;XYZ}. Tenseur au point M(Y,Z) : seules σXX, σXY, σXZ non nulles.
- **Contrainte normale** : σXX = N/A + Z·MfY/IY − Y·MfZ/IZ  (en plan : σ = N/A − Y·MfZ/IZ ; valeur extrême ±MfZ·v/IZ = ±MfZ/Wel).
- **Cisaillement** : σXY = (Mt/J)(∂ω/∂Y − Z) + (TY/A)∂g/∂Y + (TZ/A)∂h/∂Y ; σXZ = (Mt/J)(∂ω/∂Z + Y) + (TY/A)∂g/∂Z + (TZ/A)∂h/∂Z ; τ² = σXY² + σXZ².
- **Principales** : σ1,2 = σXX/2 ± ½√(σXX² + 4τ²), σ3 = 0 (σ2 ≤ 0 ≤ σ1).
- **Von Mises** : σVM = √(σXX² + 3τ²).  **Tresca** : σT = √(σXX² + 4τ²).
- Comparaison à la théorie élémentaire : τG = TY·MZ/(IZ·tw) (S12, écart < 1 %).

## 3. Lois de comportement poutre (manuel Ossatures § 1.5)
N = EA ∂u/∂X ; TY = GAkY(∂v/∂X − θZ) ; TZ = GAkZ(∂w/∂X + θY) ; Mt = GJ ∂θX/∂X ; MfY = EIY ∂θY/∂X ; MfZ = EIZ ∂θZ/∂X ; G = E/[2(1+ν)].
Bernoulli : θZ = ∂v/∂X (cisaillement négligé). Rigidités : EA (membrane), EI (flexion), GJ (torsion).
Flambement : charge d'Euler PC = π²EI/L² ; RDM résout [K0]{U} = −λ[Kσ]{U} → λC (plus petite valeur propre positive) ; charge critique = λC × chargement. Vibrations : [K]{U} = ω²[M]{U}, f = ω/2π.

## 4. Méthodes de calcul (calculs.pdf, commun à tous les modules)

Étapes : vérification des données → tables nœuds/éléments → **partition des ddl** (L inconnus, P imposés non nuls, S nuls ; lignes/colonnes S jamais assemblées) → place mémoire → **segmentation en blocs** → matrices élémentaires et assemblage (rigidité ; masse en dynamique ; rigidité géométrique en flambement ; forces en statique) → factorisation → résolution → fichier neutre ; à la fin, fichier **.res** (déroulement).

- **Stockage** : matrices symétriques stockées en **profil (ligne de ciel)**, colonne par colonne, en **blocs sur disque** (taille = paramètre « dimension des blocs », 12000 réels par défaut, Calculer → Paramètres). La place dépend de la numérotation des nœuds (d'où renumérotation/compactage).
- **Statique** : [KLL]{UL} = {FL} − [KLP]{UP} ; **méthode de Gauss**, décomposition de Crout [K] = [L][D][L]ᵀ puis 3 résolutions (triangulaire inf., diagonale, triangulaire sup.). **Si les liaisons sont suffisantes, tous les pivots sont > 0** — sinon la structure est un mécanisme (message d'erreur). Déplacements imposés non nuls → « cas de charges 0 » automatique.
- **Valeurs propres** [K]{u} = λ[M]{u} (masse consistante) :
  - *itération inverse* : bonne pour la plus petite valeur propre (quotient de Rayleigh) ;
  - *itération sur sous-espace* : m plus petites valeurs propres, sous-espace q = min(m + 8, 2m), vecteurs de départ aléatoires orthonormalisés (Gram-Schmidt), problème réduit par Choleski + Jacobi ; les premiers modes convergent plus vite ;
  - critère d'arrêt : |λi−1 − λi|/|λi| < précision ;
  - nombre de modes ≤ rang de [MLL] (ddl sans masse ne génèrent pas de mode) ;
  - **décalage spectral** δ = 2πf : ([K] + δ²[M]){U} = (ω² + δ²)[M]{U} → indispensable pour une structure libre (modes rigides à fréquence nulle).
- **Édition modale** (Résultats → Fichier → Éditer → Analyse modale) : pour chaque mode fi (Hz), ωi, raideur et masse généralisées (ki = mi ωi²), masse totale MT ; par direction x, y, z : facteur de participation Pd,i, **masse modale effective** Md,i = Pd,i² mi, % de MT, somme cumulée.

## 5. Ce qu'il faut retenir pour un TP STI2D
- Une section de bibliothèque fournit A, Iy, Iz, J, Wpl, k → aucun calcul de section nécessaire.
- Pour une section bois/béton rectangulaire : forme paramétrée 5 (h, b) ; Iz = bh³/12 recalculé par le logiciel.
- Vérification de contrainte : σmax = |MfZ|max · v / IZ (lisible dans « Contraintes sur section » ou en traçant σ dans « Poutre ») à comparer à fy, fm,k… ; Von Mises seulement en cas de cisaillement/torsion significatifs.
- Le module Surface du dessin EF (Fichier → Surface) calcule A, G, I d'un contour quelconque : utile pour vérifier un calcul d'inertie fait à la main.
