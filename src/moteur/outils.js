/* =====================================================================
   Outils communs (tolérances, pondération des charges)
   Module du moteur RDM Lycée (calcul de poutres en flexion plane).
   Unités internes : SI (m, N, Pa, rad, kg/m³).
   ===================================================================== */

/* ------------------------------------------------------------------
   4. OUTILS
   ------------------------------------------------------------------ */
export const TOL_X = 1e-7; // tolérance de confusion de deux abscisses (m)

export function arrondirX(x) { return Math.round(x * 1e7) / 1e7; }

export function charge(l, f) {
  // facteur de pondération d'une charge selon sa catégorie
  if (!f) return 1;
  var c = l.cat || '';
  if (c === 'G') return f.G;
  if (c === 'Q') return f.Q;
  return (f.N === undefined) ? 1 : f.N;
}

