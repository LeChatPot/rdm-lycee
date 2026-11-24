/* =====================================================================
   Calcul — méthode des déplacements (Euler-Bernoulli)
   Module du moteur RDM Lycée (calcul de poutres en flexion plane).
   Unités internes : SI (m, N, Pa, rad, kg/m³).
   ===================================================================== */

import { TOL_X, arrondirX, charge } from './outils.js';

/* ------------------------------------------------------------------
   5. CALCUL
   modele = {
     L, E, Iz, A, rho, g, vsup, vinf,
     appuis : [{ type, x, valeur }]
       type : 'encastrement' | 'appui' | 'pente_nulle' | 'deplacement'
            | 'rotation' | 'ressort_v' | 'ressort_r' | 'rotule'
       valeur : déplacement (m), rotation (rad), raideur (N/m ou N·m/rad)
     charges : [{ type, cat, ... }]
       'force' {x, F} (N) ; 'couple' {x, M} (N·m)
       'repartie' {x1, x2, p1, p2} (N/m, linéaire de p1 à p2)
       'poids_propre' {}
       cat : 'G' | 'Q' | '' (non classée)
   }
   facteurs = { G, Q, N } (pondérations ; défaut 1)
   ------------------------------------------------------------------ */
export function calculer(modele, facteurs) {
  var L = +modele.L;
  var E = +modele.E, Iz = +modele.Iz, EI = E * Iz;
  var g = (modele.g === undefined) ? 9.81 : +modele.g;
  var res = { ok: false, erreurs: [], avertissements: [] };

  if (!(L > 0)) { res.erreurs.push('La longueur de la poutre doit être positive.'); return res; }
  if (!(EI > 0)) { res.erreurs.push('Le module d\'Young et le moment quadratique doivent être positifs.'); return res; }

  var appuis = (modele.appuis || []).filter(function (a) { return a && a.type; });
  var charges = (modele.charges || []).filter(function (c) { return c && c.type; });

  // ---- 5.1 nœuds créés automatiquement -------------------------------
  var xs = [0, L];
  function ajouterX(x, quoi) {
    if (!(x >= -TOL_X && x <= L + TOL_X)) {
      res.avertissements.push(quoi + ' à x = ' + x + ' m est hors de la poutre : ignoré.');
      return false;
    }
    xs.push(Math.min(Math.max(x, 0), L));
    return true;
  }
  appuis = appuis.filter(function (a) { return ajouterX(+a.x, 'Appui'); });
  charges = charges.filter(function (c) {
    if (c.type === 'force' || c.type === 'couple') return ajouterX(+c.x, 'Charge');
    if (c.type === 'repartie') {
      var x1 = Math.min(+c.x1, +c.x2), x2 = Math.max(+c.x1, +c.x2);
      if (!(x2 - x1 > TOL_X)) { res.avertissements.push('Charge répartie de longueur nulle : ignorée.'); return false; }
      var ok1 = ajouterX(Math.max(0, x1), 'Charge répartie'), ok2 = ajouterX(Math.min(L, x2), 'Charge répartie');
      return ok1 && ok2;
    }
    return true;
  });
  xs = xs.map(arrondirX).sort(function (a, b) { return a - b; });
  var noeuds = [];
  xs.forEach(function (x) { if (!noeuds.length || x - noeuds[noeuds.length - 1] > TOL_X) noeuds.push(x); });
  var nn = noeuds.length;
  function indiceNoeud(x) {
    x = arrondirX(x);
    for (var i = 0; i < nn; i++) if (Math.abs(noeuds[i] - x) <= TOL_X) return i;
    return -1;
  }

  // ---- 5.2 liaisons par nœud ----------------------------------------
  var lia = [];
  for (var i = 0; i < nn; i++) lia.push({ v: null, th: null, kv: 0, kth: 0, rotule: false, types: [] });
  appuis.forEach(function (a) {
    var n = indiceNoeud(+a.x), l = lia[n], val = +(a.valeur || 0);
    l.types.push(a.type);
    switch (a.type) {
      case 'encastrement': l.v = 0; l.th = 0; break;
      case 'appui': l.v = (l.v === null) ? 0 : l.v; break;
      case 'pente_nulle': l.th = 0; break;
      case 'deplacement': l.v = val; break;
      case 'rotation': l.th = val; break;
      case 'ressort_v': l.kv += val; break;
      case 'ressort_r': l.kth += val; break;
      case 'rotule':
        if (n === 0 || n === nn - 1) res.avertissements.push('Une rotule à l\'extrémité de la poutre n\'a pas d\'effet : ignorée.');
        else l.rotule = true;
        break;
      default: res.avertissements.push('Type de liaison inconnu : ' + a.type);
    }
  });

  // ---- 5.3 numérotation des ddl --------------------------------------
  // nœud i : v_i, θ gauche (θL_i), θ droite (θR_i = θL_i sauf rotule)
  var dV = [], dTL = [], dTR = [], nd = 0;
  for (i = 0; i < nn; i++) {
    dV.push(nd++); dTL.push(nd++);
    dTR.push(lia[i].rotule ? nd++ : dTL[i]);
  }

  // ---- 5.4 assemblage ------------------------------------------------
  var K = []; for (i = 0; i < nd; i++) { K.push(new Float64Array(nd)); }
  var F = new Float64Array(nd);
  var qElem = []; // charge répartie sur chaque élément : q(s) = a + b·s
  var poidsLin = 0;
  charges.forEach(function (c) { if (c.type === 'poids_propre') poidsLin += -(+modele.rho) * g * (+modele.A) * charge(c, facteurs); });

  var elems = [];
  for (var e = 0; e < nn - 1; e++) {
    var xa = noeuds[e], xb = noeuds[e + 1], h = xb - xa;
    var qa = poidsLin, qb = poidsLin;
    charges.forEach(function (c) {
      if (c.type !== 'repartie') return;
      var x1 = Math.min(+c.x1, +c.x2), x2 = Math.max(+c.x1, +c.x2);
      var p1 = (+c.x1 <= +c.x2) ? +c.p1 : +c.p2, p2 = (+c.x1 <= +c.x2) ? +c.p2 : +c.p1;
      if (xa >= x1 - TOL_X && xb <= x2 + TOL_X) {
        var f = charge(c, facteurs);
        qa += f * (p1 + (p2 - p1) * (xa - x1) / (x2 - x1));
        qb += f * (p1 + (p2 - p1) * (xb - x1) / (x2 - x1));
      }
    });
    var dof = [dV[e], dTR[e], dV[e + 1], dTL[e + 1]];
    var c1 = EI / (h * h * h);
    var ke = [
      [12 * c1, 6 * h * c1, -12 * c1, 6 * h * c1],
      [6 * h * c1, 4 * h * h * c1, -6 * h * c1, 2 * h * h * c1],
      [-12 * c1, -6 * h * c1, 12 * c1, -6 * h * c1],
      [6 * h * c1, 2 * h * h * c1, -6 * h * c1, 4 * h * h * c1]
    ];
    // forces nodales équivalentes pour q linéaire de qa à qb
    var fe = [h * (7 * qa + 3 * qb) / 20, h * h * (3 * qa + 2 * qb) / 60,
              h * (3 * qa + 7 * qb) / 20, -h * h * (2 * qa + 3 * qb) / 60];
    for (var r = 0; r < 4; r++) {
      F[dof[r]] += fe[r];
      for (var s2 = 0; s2 < 4; s2++) K[dof[r]][dof[s2]] += ke[r][s2];
    }
    elems.push({ i: e, x0: xa, h: h, dof: dof, ke: ke, fe: fe, a: qa, b: (qb - qa) / h });
  }
  charges.forEach(function (c) {
    var n;
    if (c.type === 'force') { n = indiceNoeud(+c.x); F[dV[n]] += charge(c, facteurs) * (+c.F); }
    if (c.type === 'couple') { n = indiceNoeud(+c.x); F[dTL[n]] += charge(c, facteurs) * (+c.M); }
  });

  // ---- 5.5 conditions aux limites ------------------------------------
  var impose = new Array(nd).fill(null);
  var Kres = []; for (i = 0; i < nd; i++) Kres.push(Float64Array.from(K[i])); // K sans ressorts
  for (i = 0; i < nn; i++) {
    var l = lia[i];
    if (l.v !== null) impose[dV[i]] = l.v;
    if (l.th !== null) { impose[dTL[i]] = l.th; impose[dTR[i]] = l.th; }
    if (l.kv) K[dV[i]][dV[i]] += l.kv;
    if (l.kth) { K[dTR[i]][dTR[i]] += l.kth; if (dTR[i] !== dTL[i]) K[dTL[i]][dTL[i]] += 0; }
  }
  var libres = [], U = new Float64Array(nd);
  for (i = 0; i < nd; i++) { if (impose[i] === null) libres.push(i); else U[i] = impose[i]; }
  var nl = libres.length;
  var A = [], bvec = new Float64Array(nl);
  for (i = 0; i < nl; i++) {
    var row = new Float64Array(nl), di = libres[i];
    for (var j = 0; j < nl; j++) row[j] = K[di][libres[j]];
    A.push(row);
    var s = F[di];
    for (j = 0; j < nd; j++) if (impose[j] !== null && impose[j] !== 0) s -= K[di][j] * impose[j];
    bvec[i] = s;
  }

  // ---- 5.6 résolution (Gauss sans permutation, matrice symétrique
  //          définie positive si la poutre est bien tenue) -------------
  var diagMax = 0;
  for (i = 0; i < nl; i++) diagMax = Math.max(diagMax, Math.abs(A[i][i]));
  var BW = 3; // demi-largeur de bande (nœuds voisins, + rotule)
  for (var k = 0; k < nl; k++) {
    var piv = A[k][k];
    if (!(piv > 1e-9 * diagMax)) {
      res.erreurs.push(messageMecanisme(lia, appuis, noeuds));
      res.hypostatique = true;
      return res;
    }
    var lim = Math.min(nl, k + BW + 2);
    for (i = k + 1; i < lim; i++) {
      var m = A[i][k] / piv;
      if (m === 0) continue;
      for (j = k; j < lim; j++) A[i][j] -= m * A[k][j];
      bvec[i] -= m * bvec[k];
    }
  }
  var x = new Float64Array(nl);
  for (i = nl - 1; i >= 0; i--) {
    var t = bvec[i], lim2 = Math.min(nl, i + BW + 2);
    for (j = i + 1; j < lim2; j++) t -= A[i][j] * x[j];
    x[i] = t / A[i][i];
  }
  for (i = 0; i < nl; i++) U[libres[i]] = x[i];

  // ---- 5.7 réactions : R = K·U − F (K sans ressort) ------------------
  var R = new Float64Array(nd);
  for (i = 0; i < nd; i++) {
    var sum = -F[i];
    for (j = 0; j < nd; j++) sum += Kres[i][j] * U[j];
    R[i] = sum;
  }
  var reactions = [];
  for (i = 0; i < nn; i++) {
    var li = lia[i];
    var porteV = li.v !== null || li.kv !== 0;
    var porteT = li.th !== null || li.kth !== 0;
    if (!porteV && !porteT) continue;
    var Mz = 0;
    if (porteT) { Mz = R[dTL[i]]; if (dTR[i] !== dTL[i]) Mz += R[dTR[i]]; }
    reactions.push({
      noeud: i, x: noeuds[i], types: li.types.slice(),
      Fy: porteV ? R[dV[i]] : 0, Mz: Mz, porteV: porteV, porteT: porteT
    });
  }

  // ---- 5.8 efforts intérieurs et déformée sur chaque élément ----------
  // Ty(s) = −(Fy0 + a s + b s²/2)
  // Mf(s) = −M0 + Fy0 s + a s²/2 + b s³/6
  // EIθ(s) = EIθ0 + (−M0 s + Fy0 s²/2 + a s³/6 + b s⁴/24)
  // EIv(s) = EIv0 + EIθ0 s + (−M0 s²/2 + Fy0 s³/6 + a s⁴/24 + b s⁵/120)
  elems.forEach(function (el) {
    var u = el.dof.map(function (d) { return U[d]; });
    var fint = [];
    for (var r = 0; r < 4; r++) {
      var t = -el.fe[r];
      for (var c = 0; c < 4; c++) t += el.ke[r][c] * u[c];
      fint.push(t);
    }
    el.Fy0 = fint[0]; el.M0 = fint[1]; el.v0 = u[0]; el.th0 = u[1];
    el.EI = EI;
  });

  function evalElem(el, s) {
    var a = el.a, b = el.b, s2 = s * s, s3 = s2 * s;
    return {
      T: -(el.Fy0 + a * s + b * s2 / 2),
      Mf: -el.M0 + el.Fy0 * s + a * s2 / 2 + b * s3 / 6,
      th: el.th0 + (-el.M0 * s + el.Fy0 * s2 / 2 + a * s3 / 6 + b * s2 * s2 / 24) / el.EI,
      v: el.v0 + el.th0 * s + (-el.M0 * s2 / 2 + el.Fy0 * s3 / 6 + a * s2 * s2 / 24 + b * s2 * s3 / 120) / el.EI
    };
  }

  var vsup = (modele.vsup !== undefined) ? +modele.vsup : 0;
  var vinf = (modele.vinf !== undefined) ? +modele.vinf : 0;
  function contraintes(Mf) { return { sSup: -vsup * Mf / Iz, sInf: vinf * Mf / Iz }; }

  // valeur en une abscisse ; cote : 'g' (limite à gauche) ou 'd' (à droite)
  function valeurEn(xq, cote) {
    xq = Math.min(Math.max(xq, 0), L);
    var idx = -1;
    for (var k2 = 0; k2 < elems.length; k2++) {
      var el = elems[k2];
      var dedans = (cote === 'g') ? (xq > el.x0 + TOL_X && xq <= el.x0 + el.h + TOL_X)
                                  : (xq >= el.x0 - TOL_X && xq < el.x0 + el.h - TOL_X);
      if (dedans) { idx = k2; break; }
    }
    if (idx < 0) idx = (xq <= TOL_X) ? 0 : elems.length - 1;
    var elx = elems[idx];
    var s = Math.min(Math.max(xq - elx.x0, 0), elx.h);
    var o = evalElem(elx, s);
    var c2 = contraintes(o.Mf);
    o.sSup = c2.sSup; o.sInf = c2.sInf; o.x = xq;
    return o;
  }

  // ---- 5.9 échantillonnage fin (≥ 200 points par élément) ------------
  var NP = (modele.pointsParElement && modele.pointsParElement >= 200) ? modele.pointsParElement : 200;
  var ech = { x: [], T: [], Mf: [], v: [], th: [], sSup: [], sInf: [] };
  elems.forEach(function (el) {
    for (var p = 0; p <= NP; p++) {
      var s = (p === NP) ? el.h : el.h * p / NP;
      var o = evalElem(el, s), c3 = contraintes(o.Mf);
      ech.x.push(p === NP ? noeuds[el.i + 1] : el.x0 + s);
      ech.T.push(o.T); ech.Mf.push(o.Mf); ech.v.push(o.v); ech.th.push(o.th);
      ech.sSup.push(c3.sSup); ech.sInf.push(c3.sInf);
    }
  });

  // ---- 5.10 extrema (affinés par dichotomie sur la dérivée) ----------
  function affiner(el, s0, s1, nomF, derivee) {
    // recherche du zéro de la dérivée entre s0 et s1 (changement de signe)
    var f0 = derivee(el, s0), f1 = derivee(el, s1);
    if (f0 === 0) return s0; if (f1 === 0) return s1;
    if (f0 * f1 > 0) return null;
    for (var it = 0; it < 80; it++) {
      var sm = (s0 + s1) / 2, fm = derivee(el, sm);
      if (fm * f0 <= 0) { s1 = sm; f1 = fm; } else { s0 = sm; f0 = fm; }
    }
    return (s0 + s1) / 2;
  }
  var derivees = {
    Mf: function (el, s) { return -evalElem(el, s).T; },
    v: function (el, s) { return evalElem(el, s).th; },
    th: function (el, s) { return evalElem(el, s).Mf; },
    T: function (el, s) { return -(el.a + el.b * s); }
  };
  function extrema(nomF) {
    var best = { max: -Infinity, xmax: 0, min: Infinity, xmin: 0 };
    function prendre(val, xv) {
      if (val > best.max + 1e-12 * Math.abs(val)) { best.max = val; best.xmax = xv; }
      if (val < best.min - 1e-12 * Math.abs(val)) { best.min = val; best.xmin = xv; }
    }
    elems.forEach(function (el) {
      var npts = 400, prev = null;
      for (var p = 0; p <= npts; p++) {
        var s = el.h * p / npts;
        prendre(evalElem(el, s)[nomF], el.x0 + s);
        if (p > 0) {
          var sr = affiner(el, el.h * (p - 1) / npts, s, nomF, derivees[nomF]);
          if (sr !== null) prendre(evalElem(el, sr)[nomF], el.x0 + sr);
        }
      }
    });
    return best;
  }
  var ext = { T: extrema('T'), Mf: extrema('Mf'), v: extrema('v'), th: extrema('th') };
  var cMax = contraintes(ext.Mf.max), cMin = contraintes(ext.Mf.min);
  ext.sSup = { max: Math.max(cMax.sSup, cMin.sSup), min: Math.min(cMax.sSup, cMin.sSup) };
  ext.sInf = { max: Math.max(cMax.sInf, cMin.sInf), min: Math.min(cMax.sInf, cMin.sInf) };
  ext.sAbs = Math.max(Math.abs(ext.Mf.max), Math.abs(ext.Mf.min)) * Math.max(vsup, vinf) / Iz;
  ext.MfAbs = Math.abs(ext.Mf.max) >= Math.abs(ext.Mf.min)
    ? { val: ext.Mf.max, x: ext.Mf.xmax } : { val: ext.Mf.min, x: ext.Mf.xmin };
  ext.vAbs = Math.abs(ext.v.max) >= Math.abs(ext.v.min)
    ? { val: ext.v.max, x: ext.v.xmax } : { val: ext.v.min, x: ext.v.xmin };

  // ---- 5.11 équilibre global (contrôle) -------------------------------
  var sF = 0, sM = 0, totalCharges = 0, momentCharges = 0;
  elems.forEach(function (el) {
    var Q = el.a * el.h + el.b * el.h * el.h / 2;             // résultante
    var Mq = el.a * el.h * el.h / 2 + el.b * Math.pow(el.h, 3) / 3; // moment / x0
    totalCharges += Q; momentCharges += Q * el.x0 + Mq;
  });
  charges.forEach(function (c) {
    var f = charge(c, facteurs);
    if (c.type === 'force') { totalCharges += f * c.F; momentCharges += f * c.F * c.x; }
    if (c.type === 'couple') { momentCharges += f * c.M; }
  });
  var sRF = 0, sRM = 0;
  reactions.forEach(function (rr) { sRF += rr.Fy; sRM += rr.Fy * rr.x + rr.Mz; });
  sF = sRF + totalCharges; sM = sRM + momentCharges;

  res.ok = true;
  res.L = L; res.EI = EI; res.noeuds = noeuds; res.nbElements = elems.length;
  res.deplacements = noeuds.map(function (xn, n) {
    return { x: xn, v: U[dV[n]], th: U[dTL[n]], thDroite: U[dTR[n]], rotule: dTR[n] !== dTL[n] };
  });
  res.reactions = reactions;
  res.elements = elems.map(function (el) { return { x0: el.x0, h: el.h, q0: el.a, dq: el.b, Fy0: el.Fy0, M0: el.M0 }; });
  res.valeurEn = valeurEn;
  res.echantillons = ech;
  res.extrema = ext;
  res.equilibre = {
    sommeReactionsF: sRF, sommeChargesF: totalCharges, sommeF: sF,
    sommeReactionsM: sRM, sommeChargesM: momentCharges, sommeM: sM
  };
  return res;
}

function messageMecanisme(lia, appuis, noeuds) {
  var nbV = 0, nbT = 0, rot = 0;
  lia.forEach(function (l) {
    if (l.v !== null || l.kv) nbV++;
    if (l.th !== null || l.kth) nbT++;
    if (l.rotule) rot++;
  });
  if (appuis.filter(function (a) { return a.type !== 'rotule'; }).length === 0)
    return 'La poutre peut bouger : elle n\'a aucun appui. Ajoute un appui ou un encastrement.';
  if (nbV === 0)
    return 'La poutre peut bouger : rien n\'empêche sa descente. Ajoute un appui simple ou un encastrement.';
  if (nbV === 1 && nbT === 0)
    return 'La poutre peut bouger : elle peut tourner autour de son unique appui. Ajoute un appui ou un encastrement.';
  if (rot > 0)
    return 'La poutre peut bouger : la rotule crée un mécanisme (un tronçon n\'est pas tenu). Ajoute un appui sur ce tronçon ou supprime la rotule.';
  return 'La poutre peut bouger (mécanisme) : ajoute un appui.';
}

/* ------------------------------------------------------------------
   6. DEGRÉ D'HYPERSTATICITÉ (information pédagogique)
   h = (nombre d'inconnues de liaison) − 2 équations − rotules
   ------------------------------------------------------------------ */
export function degreHyperstatique(modele) {
  var inc = 0, rot = 0;
  var parX = {};
  (modele.appuis || []).forEach(function (a) {
    var k = arrondirX(+a.x);
    parX[k] = parX[k] || { v: false, th: false };
    if (a.type === 'encastrement') { parX[k].v = true; parX[k].th = true; }
    else if (a.type === 'appui' || a.type === 'deplacement' || a.type === 'ressort_v') parX[k].v = true;
    else if (a.type === 'pente_nulle' || a.type === 'rotation' || a.type === 'ressort_r') parX[k].th = true;
    else if (a.type === 'rotule' && k > 0 && k < modele.L) rot++;
  });
  Object.keys(parX).forEach(function (k) { if (parX[k].v) inc++; if (parX[k].th) inc++; });
  return inc - 2 - rot;
}

