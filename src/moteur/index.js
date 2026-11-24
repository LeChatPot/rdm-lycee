/* =====================================================================
   MoteurRDM — point d'entrée du moteur de calcul de poutres droites
   en flexion plane (logiciel pédagogique RDM Lycée, Terminale STI2D AC).
   ---------------------------------------------------------------------
   Méthode des déplacements, éléments poutre d'Euler-Bernoulli,
   2 ddl par nœud (flèche v, pente θz) ; une rotule intérieure ajoute
   un ddl de pente à droite du nœud.
   Conventions (identiques à RDM 7 – Flexion, IUT du Mans) :
     - axe x = fibre moyenne, y vers le haut ;
     - Fy > 0 vers le haut, Mz > 0 sens trigonométrique ;
     - efforts intérieurs = action de la partie droite sur la partie
       gauche : dTy/dx + py = 0 ; dMfz/dx + Ty = 0 ; Mfz = EIz v'' ;
     - contrainte normale : σxx = −y·Mfz/Iz.
   Unités internes : SI (m, N, Pa, rad, kg/m³).
   Aucune dépendance. Ces modules sont regroupés par scripts/build.mjs
   dans dist/index.html (objet global MoteurRDM) et testés par tests/.
   ===================================================================== */
import { MATERIAUX } from './materiaux.js';
import { PROFILES, section } from './sections.js';
import { calculer, degreHyperstatique } from './calcul.js';

export const version = '1.0.0';
export { MATERIAUX, PROFILES, section, calculer, degreHyperstatique };

const MoteurRDM = { version, MATERIAUX, PROFILES, section, calculer, degreHyperstatique };
export default MoteurRDM;
