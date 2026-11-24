// =====================================================================
// Validation du moteur (src/moteur/) sur les exemples 1 à 8 du manuel
// « RDM – Flexion » (Y. Debard, IUT du Mans, §6 — solutions analytiques).
// Tolérance : 0,1 % (écart relatif). Lancement : npm test
// Règle du projet : ces tests doivent rester verts à chaque commit.
// =====================================================================
import { test } from 'node:test';
import assert from 'node:assert/strict';
import M from '../src/moteur/index.js';

const TOL = 1e-3; // 0,1 %
const DEG = 180 / Math.PI;
let ecarts = [];   // écarts relevés dans l'exemple en cours

function verifier(ex, libelle, calcule, attendu, unite = '') {
  const ecart = Math.abs(calcule - attendu) / Math.abs(attendu);
  const ok = ecart <= TOL;
  const ligne = `${ok ? 'OK ' : 'KO '} ${libelle.padEnd(34)} calculé ${fmt(calcule).padStart(13)}  manuel ${fmt(attendu).padStart(13)} ${unite.padEnd(6)} écart ${(ecart * 100).toFixed(4)} %`;
  ecarts.push({ ok, ligne });
}
function fmt(v) { return Number(v.toPrecision(7)).toString(); }
function modele(sec, E, L, appuis, charges, extra = {}) {
  return { L, E, Iz: sec.Iz, A: sec.A, vsup: sec.vsup, vinf: sec.vinf, rho: 0, g: 9.81, appuis, charges, ...extra };
}
const R = (r, x) => r.reactions.find(q => Math.abs(q.x - x) < 1e-9);
const D = (r, x) => r.deplacements.find(q => Math.abs(q.x - x) < 1e-9);

/** Exécute un exemple, affiche le détail (diagnostic) et échoue si une valeur sort de la tolérance. */
function exemple(titre, corps) {
  test(titre, (t) => {
    ecarts = [];
    corps();
    for (const e of ecarts) t.diagnostic(e.ligne);
    const ko = ecarts.filter(e => !e.ok).map(e => e.ligne);
    assert.ok(ecarts.length > 0, 'aucune valeur vérifiée');
    assert.deepEqual(ko, [], 'valeurs hors tolérance 0,1 % :\n' + ko.join('\n'));
  });
}

// ---------------------------------------------------------------- Ex. 1
exemple('Exemple 1 — poutre continue, rectangle 50 × 60, 2 encastrements + 3 appuis', () => {
  const s = M.section({ type: 'rect', b: 50, h: 60 });
  const L = 0.7;
  const r = M.calculer(modele(s, 200000e6, 2.8, [
    { type: 'encastrement', x: 0 }, { type: 'appui', x: 0.7 }, { type: 'appui', x: 1.4 },
    { type: 'appui', x: 2.1 }, { type: 'encastrement', x: 2.8 }],
    [{ type: 'repartie', x1: 0, x2: 1.4, p1: -20000, p2: -20000 }, { type: 'force', x: 2.45, F: -5000 }]));
  verifier(1, 'θ2z', D(r, 0.7).th * DEG, -0.007369, '°');
  verifier(1, 'θ3z', D(r, 1.4).th * DEG, 0.029477, '°');
  verifier(1, 'θ4z', D(r, 2.1).th * DEG, -0.019555, '°');
  verifier(1, 'θ5z', D(r, 2.45).th * DEG, 0.004889, '°');
  verifier(1, 'v5', D(r, 2.45).v * 1e3, -0.079487, 'mm');
  verifier(1, 'F1y', R(r, 0).Fy, 6716.52, 'N');
  verifier(1, 'M1z', R(r, 0).Mz, 750.52, 'N·m');
  verifier(1, 'F2y', R(r, 0.7).Fy, 15133.93, 'N');
  verifier(1, 'F3y', R(r, 1.4).Fy, 6531.25, 'N');
  verifier(1, 'F4y', R(r, 2.1).Fy, 1366.07, 'N');
  verifier(1, 'F6y', R(r, 2.8).Fy, 3252.23, 'N');
  verifier(1, 'M6z', R(r, 2.8).Mz, -613.02, 'N·m');
  verifier(1, 'v(1,05 m) (entre deux nœuds)', r.valeurEn(1.05).v * 1e3, -0.125743, 'mm');
  verifier(1, 'v(1,75 m) (entre deux nœuds)', r.valeurEn(1.75).v * 1e3, 0.074879, 'mm');
  // valeurs relevées dans RDM 7 (fiche flexion.md, 24/11/2026), arrondies à 4 chiffres
  verifier(1, 'Mf max (RDM 7)', r.extrema.Mf.max, 591.77, 'N·m');
  verifier(1, 'Mf min (RDM 7)', r.extrema.Mf.min, -948.96, 'N·m');
  verifier(1, 'σ max (RDM 7)', r.extrema.sAbs / 1e6, 31.63, 'MPa');
  ecarts.push({ ok: true, ligne: `      (Mf max à x = ${r.extrema.Mf.xmax.toFixed(3)} m, flèche min ${(r.extrema.v.min * 1e3).toFixed(4)} mm à ${r.extrema.v.xmin.toFixed(3)} m ; RDM 7 : 1,093 m ; −0,127 mm à 1,029 m)` });
  ecarts.push({ ok: true, ligne: `      (équilibre : ΣF = ${r.equilibre.sommeF.toExponential(2)} N ; ΣM = ${r.equilibre.sommeM.toExponential(2)} N·m)` });
});

// ---------------------------------------------------------------- Ex. 2
exemple('Exemple 2 — poutre continue, I 120 × 100 × 5 × 6, charge trapézoïdale', () => {
  const s = M.section({ type: 'I', h: 120, b: 100, tw: 5, tf: 6 });
  const r = M.calculer(modele(s, 200000e6, 4.8, [
    { type: 'encastrement', x: 0 }, { type: 'appui', x: 1.2 }, { type: 'appui', x: 3.6 }, { type: 'appui', x: 4.8 }],
    [{ type: 'force', x: 4.2, F: -24000 },
     { type: 'repartie', x1: 0, x2: 1.2, p1: -20000, p2: -20000 },
     { type: 'repartie', x1: 1.2, x2: 3.6, p1: -20000, p2: 0 }]));
  verifier(2, 'θ2z', D(r, 1.2).th * DEG, -0.040806, '°');
  verifier(2, 'θ3z', D(r, 3.6).th * DEG, -0.016065, '°');
  verifier(2, 'θ4z', D(r, 4.2).th * DEG, -0.015463, '°');
  verifier(2, 'v4', D(r, 4.2).v * 1e3, -0.489987, 'mm');
  verifier(2, 'θ5z', D(r, 4.8).th * DEG, 0.077917, '°');
  verifier(2, 'F1y', R(r, 0).Fy, 9372.41, 'N');
  verifier(2, 'M1z', R(r, 0).Mz, 1348.97, 'N·m');
  verifier(2, 'F2y', R(r, 1.2).Fy, 30512.07, 'N');
  verifier(2, 'F3y', R(r, 3.6).Fy, 24098.28, 'N');
  verifier(2, 'F5y', R(r, 4.8).Fy, 8017.24, 'N');
  verifier(2, 'Mfz2', r.valeurEn(1.2).Mf, -4502.07, 'N·m');
  verifier(2, 'Mfz3', r.valeurEn(3.6).Mf, -4779.31, 'N·m');
  verifier(2, 'Mfz4', r.valeurEn(4.2).Mf, 4810.34, 'N·m');
});

// ---------------------------------------------------------------- Ex. 3
exemple('Exemple 3 — rotule intérieure, tube Ø 40 × 5, charges triangulaires', () => {
  const s = M.section({ type: 'rond_creux', D: 40, t: 5 });
  const L = 0.4, p = -6000;
  const r = M.calculer(modele(s, 210000e6, 3 * L, [
    { type: 'encastrement', x: 0 }, { type: 'rotule', x: 2 * L }, { type: 'encastrement', x: 3 * L }],
    [{ type: 'repartie', x1: 0, x2: 2 * L, p1: p, p2: 0 }, { type: 'repartie', x1: 2 * L, x2: 3 * L, p1: 0, p2: 2 * p }]));
  verifier(3, 'v2', D(r, 0.8).v * 1e3, -1.009137, 'mm');
  verifier(3, 'θ2z (tronçon 1-2)', D(r, 0.8).th * DEG, -0.027103, '°');
  verifier(3, 'θ2z (tronçon 2-3)', D(r, 0.8).thDroite * DEG, 0.196495, '°');
  verifier(3, 'F1y', R(r, 0).Fy, 2026.67, 'N');
  verifier(3, 'M1z', R(r, 0).Mz, 341.33, 'N·m');
  verifier(3, 'F3y', R(r, 1.2).Fy, 2773.33, 'N');
  verifier(3, 'M3z', R(r, 1.2).Mz, -469.33, 'N·m');
  verifier(3, 'Ty2', r.valeurEn(0.8).T, 373.33, 'N');
  ecarts.push({ ok: true, ligne: `      (Mf à la rotule : ${r.valeurEn(0.8).Mf.toExponential(2)} N·m — doit être nul)` });
});

// ---------------------------------------------------------------- Ex. 4
exemple('Exemple 4 — appui simple élastique, IPE 100, charge linéaire p → 2p', () => {
  const s = M.section({ type: 'profil', nom: 'IPE 100' });
  const L = 1.2, p = -10000;
  const r = M.calculer(modele(s, 200000e6, 2 * L, [
    { type: 'encastrement', x: 0 }, { type: 'ressort_v', x: L, valeur: 11000e3 }, { type: 'encastrement', x: 2 * L }],
    [{ type: 'repartie', x1: 0, x2: 2 * L, p1: p, p2: 2 * p }]));
  verifier(4, 'v2', D(r, L).v * 1e3, -1.1428, 'mm');
  verifier(4, 'θ2z', D(r, L).th * DEG, -0.012061, '°');
  verifier(4, 'F2y = −k·v2', R(r, L).Fy / 1e3, 12.571, 'kN');
});

// ---------------------------------------------------------------- Ex. 5
exemple("Exemple 5 — déplacement d'appui, rectangle 10 × 1, d = −1 mm", () => {
  const s = M.section({ type: 'rect', b: 10, h: 1 });
  const L = 0.1;
  const r = M.calculer(modele(s, 100000e6, L, [
    { type: 'encastrement', x: 0 }, { type: 'appui', x: L / 2 }, { type: 'deplacement', x: L, valeur: -1e-3 }], []));
  verifier(5, 'F3y', R(r, L).Fy, -1.142857, 'N');
  verifier(5, '|σxx| max (section 2)', Math.abs(r.valeurEn(L / 2).sSup) / 1e6, 34.2857, 'MPa');
  verifier(5, '|σxx| max (toute la poutre)', r.extrema.sAbs / 1e6, 34.2857, 'MPa');
});

// ---------------------------------------------------------------- Ex. 6
exemple('Exemple 6 — appui élastique en rotation, HEA 100, charge uniforme', () => {
  const s = M.section({ type: 'profil', nom: 'HEA 100' });
  const L = 0.9, p = -15000, k = 50000 * DEG; // 50 kN·m/° → N·m/rad
  const r = M.calculer(modele(s, 200000e6, L, [
    { type: 'appui', x: 0 }, { type: 'ressort_r', x: 0, valeur: k }, { type: 'appui', x: L }],
    [{ type: 'repartie', x1: 0, x2: L, p1: p, p2: p }]));
  verifier(6, 'θ1z', D(r, 0).th * DEG, -0.016757, '°');
  verifier(6, 'θ2z', D(r, L).th * DEG, 0.027067, '°');
  verifier(6, 'F1y', R(r, 0).Fy / 1e3, 7.681, 'kN');
  verifier(6, 'M1z = −k·θ1z', R(r, 0).Mz / 1e3, 0.838, 'kN·m');
  verifier(6, 'F2y', R(r, L).Fy / 1e3, 5.819, 'kN');
});

// ---------------------------------------------------------------- Ex. 7
exemple('Exemple 7 — console en T (section quelconque), contraintes', () => {
  const t = 10; // mm
  const s = M.section({ type: 'quelconque', A: 19, Iz: 500 / 3 * t ** 4 / 1e4, vsup: 3 * t, vinf: 7 * t });
  const r = M.calculer(modele(s, 200000e6, 1, [{ type: 'encastrement', x: 0 }],
    [{ type: 'repartie', x1: 0, x2: 1, p1: -10000, p2: -10000 }]));
  verifier(7, 'Iz', s.Iz * 1e8, 166.67, 'cm⁴');
  verifier(7, 'σ fibre sup. (x = 0)', r.valeurEn(0).sSup / 1e6, 90, 'MPa');
  verifier(7, 'σ fibre inf. (x = 0)', r.valeurEn(0).sInf / 1e6, -210, 'MPa');
  verifier(7, 'v2', D(r, 1).v * 1e3, -3.75, 'mm');
  verifier(7, 'θ2z', D(r, 1).th, -5e-3, 'rad');
});

// ---------------------------------------------------------------- Ex. 8
exemple('Exemple 8 — poids propre, rond plein, encastré-appuyé (dimensionnement)', () => {
  const base = { E: 200000e6, rho: 8000, g: 10 };
  const cas = D => {
    const s = M.section({ type: 'rond', D });
    return M.calculer({ L: 10, E: base.E, Iz: s.Iz, A: s.A, vsup: s.vsup, vinf: s.vinf, rho: base.rho, g: base.g,
      appuis: [{ type: 'encastrement', x: 0 }, { type: 'appui', x: 10 }], charges: [{ type: 'poids_propre', cat: 'G' }] });
  };
  const r1 = cas(32.00);
  verifier(8, 'D = 32,00 mm → σmax = σE', r1.extrema.sAbs / 1e6, 250, 'MPa');
  const r2 = cas(107.49);
  verifier(8, 'D = 107,49 mm → |v|max = d', Math.abs(r2.extrema.v.min), 0.03, 'm');
  verifier(8, 'position de |v|max', r2.extrema.v.xmin, 5.7846, 'm');
});
