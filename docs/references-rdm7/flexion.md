# RDM 7 – Flexion : référence de pilotage (vérifiée à l'écran le 24/11/2026)

Exécutable : `C:\Program Files\rdm7\rdmflex7.exe` — nom dans le menu Démarrer : « Flexion (64 bits) ».
Données utilisateur : dossier `RDM7` des Documents. Fichiers d'étude : `.fle` (sauvegarde auto `$$$.fle`).
Édition des données/résultats : ouvre `$rdmFtemp.txt` dans le Bloc-notes (onglet ajouté au Bloc-notes déjà ouvert).

## Premier lancement
- Boîte « Modifier la configuration » (diagonale écran, couleurs, nom ≥ 5 caractères) → OK → message « Quitter et relancer le programme » → OK (le programme continue).

## Interface
- Menus : Fichier · Unités · Afficher (Zoom F5, Échelle maximale Ctrl+F8, Rafraîchir F9, Données) · Modéliser (Ajouter / Supprimer un nœud, Matériau, Bibliothèque de matériaux, Sections droites, Liaisons, Charges, Paramètres du calcul) · Résultats (grisé tant que pas de calcul) · Optimiser · Outils (Configurer RDM).
- Barre du haut : Nouvelle étude (19,52) · Ouvrir · Enregistrer (100,52) · Imprimer · Éditer (180,52) · … · Déformée (359,52, lance aussi le calcul) · P (pente) · T · Mf · σ sup · σ inf · … · iso-contraintes · … · U = changer les unités courantes.
- Barre verticale gauche : nœuds · … · matériau · rotule · Section (20,249) · Liaisons (20,289) · Charges (20,328).
- Barre d'état : g = 10 m/s², unités m, N, rad, K.

## Créer une poutre
1. Nouvelle étude → « Nombre [2..15] » de nœuds (max 15 nœuds !) → abscisses (choix m / cm / mm), séparateur décimal = point.
2. Matériau : défaut Acier E = 210 000 MPa, ρ = 8000, σe = 250 MPa.
3. Sections droites : palette (rond plein, rond creux, carré plein, carré creux, rectangle plein, rectangle creux, I égales, I inégales, T, U ; 2e ligne : quelconque, bibliothèque, bibliothèque utilisateur). Rectangle plein : Hauteur (suivant y) puis Base (suivant z), en mm. La 1re section s'applique à toute la poutre.
4. Liaisons : palette (encastrement, appui simple, pente nulle, flèche imposée, pente imposée, appui élastique translation, appui élastique rotation, rotule intérieure, supprimer).
5. Charges : palette (force nodale, répartie uniforme, répartie linéaire, ?, poids propre, supprimer). Fy négatif = vers le bas.
6. Calcul : cliquer « Déformée » ; puis T, Mf, contraintes ; Éditer pour la notice texte complète.

## Pièges de pilotage (IMPORTANT)
- Désigner un nœud : `mouse_move` sur le nœud **au niveau de l'axe de la poutre** (pas sur le numéro), petite pause, puis clic.
- Un outil de palette reste actif : **Échap avant de changer d'outil**, sinon le nouvel outil n'est pas pris (on a encastré 2-3-4 au lieu d'appuis simples).
- **Charges : le 1er clic sur le nœud ouvre la boîte de valeur ; après OK, il faut recliquer sur le(s) nœud(s) pour appliquer la charge** (force : nœud ; répartie : origine puis extrémité). Chaque clic supplémentaire AJOUTE une charge identique (cumul).
- L'écran se rafraîchit avec un temps de retard ; vérifier dans Éditer (section « Cas de charge(s) ») plutôt que sur le dessin.
- Champs numériques : un triple-clic ne sélectionne pas ; faire clic + End + BackSpace×n puis taper.
- Enregistrer sous : taper un chemin complet (ex. `C:\Users\Utilisateur\Downloads\nom.fle`).

## Validation
Exemple 1 du manuel (poutre continue 2,8 m, rect. 50×60, E = 200 000 MPa, p = −20 kN/m sur 1-3, P = −5 kN en 5) : réactions F1y 6716,52 N ; M1z 750,52 N·m ; F2y 15133,93 ; F3y 6531,25 ; F4y 1366,07 ; F6y 3252,23 ; M6z −613,02 → identiques au manuel. Mf max 591,77 N·m à 1,093 m ; Mf min −948,96 à 0,70 m ; σ max 31,63 MPa ; flèche min −0,127 mm à 1,029 m. Étude : `Téléchargements\AC-RDM7_Validation_exemple1_flexion.fle`.
