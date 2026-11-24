/* Interface de RDM Lycée — module Poutre (flexion). Utilise l'objet global MoteurRDM. */
'use strict';
const M = MoteurRDM;
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const NS = 'http://www.w3.org/2000/svg';
const DEG = 180 / Math.PI;

/* ================= utilitaires ================= */
function num(v, def) {
  if (typeof v === 'number') return isFinite(v) ? v : def;
  const t = String(v === undefined || v === null ? '' : v).trim().replace(/\s/g, '').replace(',', '.').replace('−', '-');
  if (t === '') return def;
  const n = Number(t);
  return isFinite(n) ? n : def;
}
function fr(v, d) {
  if (v === undefined || v === null || !isFinite(v)) return '—';
  if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0;
  return v.toFixed(d).replace('.', ',').replace('-', '−');
}
function frS(v, n = 4) { // chiffres significatifs
  if (!isFinite(v)) return '—';
  if (v === 0) return '0';
  const d = Math.max(0, n - 1 - Math.floor(Math.log10(Math.abs(v))));
  return fr(v, Math.min(d, 6));
}
function frX(x) { return fr(x, Math.abs(x * 100 - Math.round(x * 100)) < 1e-6 ? 2 : 3); }
function el(tag, attrs, parent) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}
function txt(parent, x, y, s, attrs = {}) {
  const t = el('text', Object.assign({ x, y, 'font-size': 12, fill: '#1f2933' }, attrs), parent);
  t.textContent = s; return t;
}
function echapper(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
let compteurId = 1;
const nouvelId = () => 'i' + (compteurId++) + '_' + Math.random().toString(36).slice(2, 6);

const NOMS_APPUIS = {
  appui: 'Appui simple', encastrement: 'Encastrement', rotule: 'Rotule', pente_nulle: 'Pente nulle',
  deplacement: 'Déplacement imposé', ressort_v: 'Appui élastique (transl.)', ressort_r: 'Appui élastique (rot.)'
};
const UNITES_APPUIS = { deplacement: 'mm', ressort_v: 'kN/m', ressort_r: 'kN·m/rad' };
const NOMS_CHARGES = { force: 'Force', couple: 'Couple', uniforme: 'Répartie unif.', lineaire: 'Répartie lin.' };

/* ================= état de l'étude ================= */
function etatVide() {
  return {
    format: 'poutre-sti2d', version: 1,
    titre: 'Nouvelle étude', auteur: '',
    L: 4,
    materiau: Object.assign({ code: 'S235' }, matUI('S235')),
    g: 9.81,
    section: { type: 'rect', b: 75, h: 200, nom: 'IPE 160' },
    appuis: [{ id: nouvelId(), type: 'appui', x: 0, valeur: 0 }, { id: nouvelId(), type: 'appui', x: 4, valeur: 0 }],
    charges: [{ id: nouvelId(), type: 'uniforme', cat: 'Q', x1: 0, x2: 4, p1: -1, p2: -1 }],
    poidsPropre: false,
    limiteFleche: 300,
    cas: 'ELU'
  };
}
function matUI(code) {
  const m = M.MATERIAUX[code];
  return { E: m.E / 1e6, rho: m.rho, fk: m.fk / 1e6, kmod: m.kmod, gammaM: m.gammaM };
}

const CAS_TYPES = {
  solive: () => ({
    format: 'poutre-sti2d', version: 1, titre: 'Solive de plancher bois sur 2 appuis', auteur: '',
    L: 4, materiau: Object.assign({ code: 'C24' }, matUI('C24')), g: 9.81,
    section: { type: 'rect', b: 75, h: 200, nom: 'IPE 160' },
    appuis: [{ id: nouvelId(), type: 'appui', x: 0, valeur: 0 }, { id: nouvelId(), type: 'appui', x: 4, valeur: 0 }],
    charges: [
      // entraxe des solives 0,50 m : G plancher + plafond 0,50 kN/m² ; Q habitation 1,5 kN/m² (NF EN 1991-1-1, cat. A)
      { id: nouvelId(), type: 'uniforme', cat: 'G', x1: 0, x2: 4, p1: -0.25, p2: -0.25 },
      { id: nouvelId(), type: 'uniforme', cat: 'Q', x1: 0, x2: 4, p1: -0.75, p2: -0.75 }],
    poidsPropre: true, limiteFleche: 300, cas: 'ELU'
  }),
  console: () => ({
    format: 'poutre-sti2d', version: 1, titre: 'Console de balcon (porte-à-faux)', auteur: '',
    L: 1.5, materiau: Object.assign({ code: 'S235' }, matUI('S235')), g: 9.81,
    section: { type: 'IPE', nom: 'IPE 160', b: 75, h: 200 },
    appuis: [{ id: nouvelId(), type: 'encastrement', x: 0, valeur: 0 }],
    charges: [
      // largeur reprise 0,80 m : platelage + revêtement 1,0 kN/m² ; balcon Q = 3,5 kN/m² (NF EN 1991-1-1/NA) ; garde-corps 0,5 kN
      { id: nouvelId(), type: 'uniforme', cat: 'G', x1: 0, x2: 1.5, p1: -0.8, p2: -0.8 },
      { id: nouvelId(), type: 'uniforme', cat: 'Q', x1: 0, x2: 1.5, p1: -2.8, p2: -2.8 },
      { id: nouvelId(), type: 'force', cat: 'G', x: 1.5, F: -0.5 }],
    poidsPropre: true, limiteFleche: 300, cas: 'ELU'
  }),
  continue: () => ({
    format: 'poutre-sti2d', version: 1, titre: 'Poutre continue sur 3 appuis', auteur: '',
    L: 9, materiau: Object.assign({ code: 'GL24h' }, matUI('GL24h')), g: 9.81,
    section: { type: 'rect', b: 140, h: 360, nom: 'IPE 160' },
    appuis: [{ id: nouvelId(), type: 'appui', x: 0, valeur: 0 }, { id: nouvelId(), type: 'appui', x: 4.5, valeur: 0 }, { id: nouvelId(), type: 'appui', x: 9, valeur: 0 }],
    charges: [
      { id: nouvelId(), type: 'uniforme', cat: 'G', x1: 0, x2: 9, p1: -3, p2: -3 },
      { id: nouvelId(), type: 'uniforme', cat: 'Q', x1: 0, x2: 9, p1: -4, p2: -4 }],
    poidsPropre: true, limiteFleche: 300, cas: 'ELU'
  })
};

let etat = etatVide();
let historique = [], posHist = -1;
let resultats = null;          // { ELS, ELU, sec, erreur }
let solutionVisible = false;

function engager() { // enregistre l'état dans l'historique (annuler / rétablir)
  const s = JSON.stringify(etat);
  if (historique[posHist] === s) return;
  historique = historique.slice(0, posHist + 1);
  historique.push(s);
  if (historique.length > 200) historique.shift();
  posHist = historique.length - 1;
  majBoutonsHist();
}
function majBoutonsHist() {
  $('#bAnnuler').disabled = posHist <= 0;
  $('#bRetablir').disabled = posHist >= historique.length - 1;
}
function annuler() { if (posHist > 0) { posHist--; etat = JSON.parse(historique[posHist]); toutAfficher(); majBoutonsHist(); } }
function retablir() { if (posHist < historique.length - 1) { posHist++; etat = JSON.parse(historique[posHist]); toutAfficher(); majBoutonsHist(); } }
function modifie() { engager(); solutionVisible = false; recalculer(); }

/* ================= formulaires ================= */
function initSelects() {
  const sm = $('#selMat');
  for (const k in M.MATERIAUX) { const o = document.createElement('option'); o.value = k; o.textContent = M.MATERIAUX[k].nom; sm.appendChild(o); }
  const o = document.createElement('option'); o.value = 'perso'; o.textContent = 'Personnalisé'; sm.appendChild(o);
}

function afficherFormulaires() {
  $('#iTitre').value = etat.titre || '';
  $('#iAuteur').value = etat.auteur || '';
  $('#iL').value = fr(etat.L, 3).replace(/,?0+$/, '').replace(/,$/, '');
  $('#selMat').value = etat.materiau.code;
  $('#iE').value = String(etat.materiau.E).replace('.', ',');
  $('#iRho').value = String(etat.materiau.rho).replace('.', ',');
  $('#iFk').value = String(etat.materiau.fk).replace('.', ',');
  $('#iKmod').value = String(etat.materiau.kmod).replace('.', ',');
  $('#iGam').value = String(etat.materiau.gammaM).replace('.', ',');
  $('#iG').value = String(etat.g).replace('.', ',');
  $('#cPP').checked = !!etat.poidsPropre;
  $('#selFleche').value = String(etat.limiteFleche);
  $('#selCas').value = etat.cas || 'ELU';
  const perso = etat.materiau.code === 'perso';
  ['#iE', '#iRho', '#iFk', '#iKmod', '#iGam'].forEach(s => { $(s).readOnly = !perso; $(s).style.background = perso ? '#fff' : '#f2f4f6'; });
  const mm = M.MATERIAUX[etat.materiau.code];
  $('#lFk').textContent = 'Résistance ' + (mm ? mm.nomResistance : 'fk');
  $('#noteMat').textContent = mm ? ('Source : ' + mm.source + '.' + (mm.indicatif ? ' Valeurs indicatives.' : '')) :
    'Matériau personnalisé : saisis E, ρ, la résistance caractéristique et les coefficients.';
  $('#selSec').value = (etat.section.type === 'profil') ? (etat.section.nom || 'IPE 160').split(' ')[0] : etat.section.type;
  afficherChampsSection();
  afficherTableAppuis();
  afficherTableCharges();
}

const CHAMPS_SEC = {
  rect: [['b', 'Base b (largeur)'], ['h', 'Hauteur h']],
  rond: [['D', 'Diamètre D']],
  rond_creux: [['D', 'Diamètre ext. D'], ['t', 'Épaisseur t']],
  rect_creux: [['b', 'Base b'], ['h', 'Hauteur h'], ['t', 'Épaisseur t']],
  quelconque: [['A', 'Aire A', 'cm²'], ['Iz', 'Moment quadr. Iz', 'cm⁴'], ['vsup', 'v fibre sup.'], ['vinf', 'v fibre inf.']]
};
const DEFAUTS_SEC = { b: 75, h: 200, D: 60, t: 4, A: 10, Iz: 100, vsup: 50, vinf: 50 };

function afficherChampsSection() {
  const z = $('#champsSec'); z.innerHTML = '';
  const t = $('#selSec').value;
  if (t === 'IPE' || t === 'HEA') {
    const d = document.createElement('div'); d.className = 'ligne';
    d.innerHTML = '<label for="sProfil">Profilé</label><select id="sProfil"></select><span class="note">NF EN 10365 / OTUA</span>';
    z.appendChild(d);
    const sel = d.querySelector('select');
    Object.keys(M.PROFILES).filter(n => n.startsWith(t)).forEach(n => { const o = document.createElement('option'); o.value = n; o.textContent = n; sel.appendChild(o); });
    if (etat.section.nom && etat.section.nom.startsWith(t)) sel.value = etat.section.nom; else sel.value = t === 'IPE' ? 'IPE 160' : 'HEA 160';
    etat.section.nom = sel.value;
    sel.addEventListener('change', () => { etat.section.nom = sel.value; modifie(); });
    return;
  }
  (CHAMPS_SEC[t] || []).forEach(([k, lab, u]) => {
    const d = document.createElement('div'); d.className = 'ligne';
    if (etat.section[k] === undefined) etat.section[k] = DEFAUTS_SEC[k];
    d.innerHTML = `<label for="s_${k}">${lab}</label><input type="text" id="s_${k}" inputmode="decimal" value="${String(etat.section[k]).replace('.', ',')}"><span class="unite">${u || 'mm'}</span>`;
    z.appendChild(d);
    d.querySelector('input').addEventListener('change', e => { etat.section[k] = num(e.target.value, etat.section[k]); e.target.value = String(etat.section[k]).replace('.', ','); modifie(); });
  });
  if (t === 'rect') z.insertAdjacentHTML('beforeend', '<p class="note">h est mesurée dans le sens de la charge (verticale).</p>');
}

function defSectionMoteur() {
  const s = etat.section;
  if (s.type === 'IPE' || s.type === 'HEA') return { type: 'profil', nom: s.nom };
  return Object.assign({}, s);
}

function optionsType(liste, val) {
  return Object.keys(liste).map(k => `<option value="${k}" ${k === val ? 'selected' : ''}>${liste[k]}</option>`).join('');
}

function afficherTableAppuis() {
  etat.appuis.sort((a, b) => a.x - b.x);
  const tb = $('#tAppuis'); tb.innerHTML = '';
  if (!etat.appuis.length) tb.innerHTML = '<tr><td colspan="4" class="note">Aucun appui.</td></tr>';
  etat.appuis.forEach(a => {
    const tr = document.createElement('tr');
    const aVal = UNITES_APPUIS[a.type];
    tr.innerHTML = `<td><select data-k="type">${optionsType(NOMS_APPUIS, a.type)}</select></td>
      <td><input type="text" data-k="x" value="${frX(a.x)}"></td>
      <td>${aVal ? `<input type="text" data-k="valeur" value="${String(a.valeur).replace('.', ',')}"> <span class="unite">${aVal}</span>` : ''}</td>
      <td><button class="petit" title="Supprimer">Suppr.</button></td>`;
    tr.querySelectorAll('[data-k]').forEach(inp => inp.addEventListener('change', () => {
      const k = inp.dataset.k;
      if (k === 'type') { a.type = inp.value; afficherTableAppuis(); }
      else a[k] = num(inp.value, a[k]);
      modifie();
    }));
    tr.querySelector('button').addEventListener('click', () => { etat.appuis = etat.appuis.filter(b => b !== a); afficherTableAppuis(); modifie(); });
    tb.appendChild(tr);
  });
}

function posCharge(c) { return (c.type === 'force' || c.type === 'couple') ? c.x : Math.min(c.x1, c.x2); }
function afficherTableCharges() {
  etat.charges.sort((a, b) => posCharge(a) - posCharge(b));
  const tb = $('#tCharges'); tb.innerHTML = '';
  if (!etat.charges.length) tb.innerHTML = '<tr><td colspan="5" class="note">Aucune charge saisie.</td></tr>';
  etat.charges.forEach(c => {
    const tr = document.createElement('tr');
    let pos, val;
    if (c.type === 'force' || c.type === 'couple') {
      pos = `<input type="text" data-k="x" value="${frX(c.x)}">`;
      val = c.type === 'force' ? `<input type="text" data-k="F" value="${String(c.F).replace('.', ',')}"> <span class="unite">kN</span>`
                               : `<input type="text" data-k="M" value="${String(c.M).replace('.', ',')}"> <span class="unite">kN·m</span>`;
    } else {
      pos = `<input type="text" data-k="x1" value="${frX(c.x1)}" style="width:44px">→<input type="text" data-k="x2" value="${frX(c.x2)}" style="width:44px">`;
      val = c.type === 'uniforme' ? `<input type="text" data-k="p1" value="${String(c.p1).replace('.', ',')}"> <span class="unite">kN/m</span>`
        : `<input type="text" data-k="p1" value="${String(c.p1).replace('.', ',')}" style="width:44px">→<input type="text" data-k="p2" value="${String(c.p2).replace('.', ',')}" style="width:44px"> <span class="unite">kN/m</span>`;
    }
    tr.innerHTML = `<td>${NOMS_CHARGES[c.type]}</td>
      <td><select data-k="cat"><option value="G" ${c.cat === 'G' ? 'selected' : ''}>G</option><option value="Q" ${c.cat === 'Q' ? 'selected' : ''}>Q</option><option value="" ${!c.cat ? 'selected' : ''}>—</option></select></td>
      <td>${pos}</td><td>${val}</td><td><button class="petit" title="Supprimer">Suppr.</button></td>`;
    tr.querySelectorAll('[data-k]').forEach(inp => inp.addEventListener('change', () => {
      const k = inp.dataset.k;
      if (k === 'cat') c.cat = inp.value; else c[k] = num(inp.value, c[k]);
      if (c.type === 'uniforme' && k === 'p1') c.p2 = c.p1;
      modifie();
    }));
    tr.querySelector('button').addEventListener('click', () => { etat.charges = etat.charges.filter(b => b !== c); afficherTableCharges(); modifie(); });
    tb.appendChild(tr);
  });
}

function majFormAjoutAppui() {
  const t = $('#aType').value, u = UNITES_APPUIS[t];
  $('#aValLigne').classList.toggle('cache', !u);
  $('#aValU').textContent = u || '';
  $('#aValLab').textContent = t === 'deplacement' ? 'Déplacement v' : 'Raideur k';
}
function majFormAjoutCharge() {
  const t = $('#cType').value;
  const reparti = t === 'uniforme' || t === 'lineaire';
  $('#cLX').classList.toggle('cache', reparti);
  $('#cLX12').classList.toggle('cache', !reparti);
  $('#cLV2').classList.toggle('cache', t !== 'lineaire');
  $('#cV1U').textContent = t === 'force' ? 'kN' : t === 'couple' ? 'kN·m' : 'kN/m';
  $('#cV1Lab').textContent = t === 'lineaire' ? 'Intensité en x1' : 'Intensité';
  if (reparti && num($('#cX2').value, 0) === 0) $('#cX2').value = frX(etat.L);
}

/* ================= calcul ================= */
function modeleSI(sec) {
  const m = etat.materiau;
  const appuis = etat.appuis.map(a => {
    let v = num(a.valeur, 0);
    if (a.type === 'deplacement') v = v / 1000;
    if (a.type === 'ressort_v' || a.type === 'ressort_r') v = v * 1000;
    return { type: a.type, x: num(a.x, 0), valeur: v };
  });
  const charges = etat.charges.map(c => {
    if (c.type === 'force') return { type: 'force', cat: c.cat, x: c.x, F: c.F * 1000 };
    if (c.type === 'couple') return { type: 'couple', cat: c.cat, x: c.x, M: c.M * 1000 };
    const p2 = c.type === 'uniforme' ? c.p1 : c.p2;
    return { type: 'repartie', cat: c.cat, x1: c.x1, x2: c.x2, p1: c.p1 * 1000, p2: p2 * 1000 };
  });
  if (etat.poidsPropre) charges.push({ type: 'poids_propre', cat: 'G' });
  return { L: etat.L, E: m.E * 1e6, rho: m.rho, g: etat.g, A: sec.A, Iz: sec.Iz, vsup: sec.vsup, vinf: sec.vinf, appuis, charges };
}

function recalculer() {
  resultats = { erreur: null };
  try {
    resultats.sec = M.section(defSectionMoteur());
  } catch (e) { resultats.erreur = e.message; }
  if (!resultats.erreur) {
    const mod = modeleSI(resultats.sec);
    resultats.modele = mod;
    resultats.ELS = M.calculer(mod, { G: 1, Q: 1, N: 1 });
    resultats.ELU = M.calculer(mod, { G: 1.35, Q: 1.5, N: 1 });
    resultats.hyper = M.degreHyperstatique(mod);
  }
  afficherCaracSection();
  dessinerSchema();
  afficherResultats();
}

/* ================= section : caractéristiques et croquis ================= */
function afficherCaracSection() {
  const tb = $('#caracSec'), sv = $('#svgSec');
  tb.innerHTML = ''; sv.innerHTML = '';
  if (resultats.erreur) { tb.innerHTML = `<tr><td class="res-ko">${echapper(resultats.erreur)}</td></tr>`; return; }
  const s = resultats.sec;
  const lignes = [
    ['A', frS(s.A * 1e4, 4) + ' cm²'],
    ['Iz', frS(s.Iz * 1e8, 4) + ' cm⁴'],
    ['Wel,z', frS(s.Wel * 1e6, 4) + ' cm³'],
    ['v sup. / inf.', fr(s.vsup * 1e3, 1) + ' / ' + fr(s.vinf * 1e3, 1) + ' mm'],
    ['Poids linéique', frS(etat.materiau.rho * s.A * etat.g / 1000, 3) + ' kN/m']
  ];
  tb.innerHTML = lignes.map(l => `<tr><td>${l[0]}</td><td class="num">${l[1]}</td></tr>`).join('');
  $('#ppVal').textContent = '(' + frS(etat.materiau.rho * s.A * etat.g / 1000, 3) + ' kN/m)';
  // croquis
  const S = etat.section, st = { fill: '#e3eaf0', stroke: '#3e5c76', 'stroke-width': 1.5 };
  const cx = 60, cy = 60, R = 46;
  if (S.type === 'rect' || S.type === 'rect_creux') {
    const k = 2 * R / Math.max(S.b, S.h), w = S.b * k, h = S.h * k;
    el('rect', Object.assign({ x: cx - w / 2, y: cy - h / 2, width: w, height: h }, st), sv);
    if (S.type === 'rect_creux') { const t = S.t * k; el('rect', { x: cx - w / 2 + t, y: cy - h / 2 + t, width: Math.max(w - 2 * t, 0), height: Math.max(h - 2 * t, 0), fill: '#fff', stroke: '#3e5c76' }, sv); }
  } else if (S.type === 'rond' || S.type === 'rond_creux') {
    el('circle', Object.assign({ cx, cy, r: R }, st), sv);
    if (S.type === 'rond_creux') el('circle', { cx, cy, r: Math.max(R * (1 - 2 * S.t / S.D), 0), fill: '#fff', stroke: '#3e5c76' }, sv);
  } else if (S.type === 'IPE' || S.type === 'HEA') {
    const p = resultats.sec.profil, k = 2 * R / Math.max(p.h, p.b);
    const h = p.h * k, b = p.b * k, tw = Math.max(p.tw * k, 1.5), tf = Math.max(p.tf * k, 1.5);
    const d = `M${cx - b / 2},${cy - h / 2} h${b} v${tf} h${-(b - tw) / 2} v${h - 2 * tf} h${(b - tw) / 2} v${tf} h${-b} v${-tf} h${(b - tw) / 2} v${-(h - 2 * tf)} h${-(b - tw) / 2} z`;
    el('path', Object.assign({ d }, st), sv);
  } else {
    txt(sv, 60, 64, 'A, Iz', { 'text-anchor': 'middle', fill: '#5f6b76' });
  }
  el('line', { x1: 4, y1: cy, x2: 116, y2: cy, stroke: '#5f6b76', 'stroke-dasharray': '4 3', 'stroke-width': .8 }, sv);
  txt(sv, 108, cy - 4, 'z', { 'font-size': 10, fill: '#5f6b76' });
  el('line', { x1: cx, y1: 116, x2: cx, y2: 4, stroke: '#5f6b76', 'stroke-dasharray': '4 3', 'stroke-width': .8 }, sv);
  txt(sv, cx + 4, 12, 'y', { 'font-size': 10, fill: '#5f6b76' });
}

/* ================= schéma de la poutre ================= */
const X0 = 70, X1 = 930;
const xPix = x => X0 + (x / etat.L) * (X1 - X0);
const xMetre = px => (px - X0) / (X1 - X0) * etat.L;
const YP = 160; // ordonnée de la poutre sur le schéma

function couleurCharge(c) { return c.cat === 'Q' ? '#3e5c76' : '#1f2933'; }

function dessinerSchema() {
  const sv = $('#svgSchema'); sv.innerHTML = '';
  el('rect', { x: 0, y: 0, width: 1000, height: 290, fill: '#fff' }, sv);
  // charges réparties (dessous) puis poutre
  const rep = etat.charges.filter(c => c.type === 'uniforme' || c.type === 'lineaire');
  let pmax = 0; rep.forEach(c => { pmax = Math.max(pmax, Math.abs(c.p1), Math.abs(c.type === 'lineaire' ? c.p2 : c.p1)); });
  // empilement des charges réparties qui se recouvrent
  const niveaux = [];
  rep.forEach(c => {
    const a = Math.min(c.x1, c.x2), b = Math.max(c.x1, c.x2);
    let n = 0; while (niveaux[n] && niveaux[n].some(([u, v]) => a < v - 1e-9 && b > u + 1e-9)) n++;
    (niveaux[n] = niveaux[n] || []).push([a, b]);
    dessinerRepartie(sv, c, pmax, n);
  });
  // poutre
  el('line', { x1: X0, y1: YP, x2: X1, y2: YP, stroke: '#2c4459', 'stroke-width': 6, 'stroke-linecap': 'butt' }, sv);
  // nœuds de calcul
  const res = resultats && resultats.ELS && resultats.ELS.ok ? resultats.ELS : null;
  const noeuds = res ? res.noeuds : [0, etat.L];
  noeuds.forEach(x => el('circle', { cx: xPix(x), cy: YP, r: 2.2, fill: '#fff', stroke: '#2c4459' }, sv));
  // appuis
  etat.appuis.forEach(a => dessinerAppui(sv, a));
  // forces et couples
  etat.charges.forEach(c => {
    if (c.type === 'force') dessinerForce(sv, c);
    if (c.type === 'couple') dessinerCouple(sv, c);
  });
  if (etat.poidsPropre) txt(sv, X1, 14, 'Poids propre pris en compte (G)', { 'text-anchor': 'end', fill: '#5f6b76', 'font-size': 11 });
  // cotation : abscisses des nœuds
  const yc = 258;
  el('line', { x1: X0, y1: yc, x2: X1, y2: yc, stroke: '#5f6b76', 'stroke-width': 1 }, sv);
  let dernier = -1e9;
  noeuds.forEach(x => {
    const px = xPix(x);
    el('line', { x1: px, y1: yc - 5, x2: px, y2: yc + 5, stroke: '#5f6b76' }, sv);
    if (px - dernier > 34 || x === etat.L) { txt(sv, px, yc + 18, frX(x), { 'text-anchor': 'middle', 'font-size': 11, fill: '#5f6b76' }); dernier = px; }
  });
  txt(sv, X1 + 24, yc + 4, 'x (m)', { 'font-size': 11, fill: '#5f6b76' });
  // repère
  el('line', { x1: 22, y1: 100, x2: 52, y2: 100, stroke: '#5f6b76', 'marker-end': 'url(#flG)' }, sv);
  el('line', { x1: 22, y1: 100, x2: 22, y2: 70, stroke: '#5f6b76' }, sv);
  txt(sv, 54, 104, 'x', { 'font-size': 11, fill: '#5f6b76' }); txt(sv, 18, 66, 'y', { 'font-size': 11, fill: '#5f6b76' });
  // calque d'interaction
  const guide = el('line', { id: 'guideSchema', x1: 0, y1: 20, x2: 0, y2: 245, stroke: '#3e5c76', 'stroke-dasharray': '3 3', visibility: 'hidden' }, sv);
  const fant = el('text', { id: 'txtSchema', x: 0, y: 34, 'font-size': 12, fill: '#3e5c76', 'text-anchor': 'middle', visibility: 'hidden' }, sv);
  if (outil && outil.type === 'repartie' && outil.x1 !== undefined) {
    el('rect', { id: 'apercuRep', x: xPix(outil.x1), y: YP - 50, width: 0, height: 46, fill: '#e3eaf0', stroke: '#3e5c76', 'stroke-dasharray': '4 3' }, sv);
    el('line', { x1: xPix(outil.x1), y1: YP - 60, x2: xPix(outil.x1), y2: YP, stroke: '#3e5c76', 'stroke-width': 2 }, sv);
  }
  // marqueurs de flèche (définitions)
  const defs = el('defs', {}, sv);
  ['#1f2933', '#3e5c76', '#5f6b76'].forEach((c, i) => {
    const m = el('marker', { id: ['flN', 'flA', 'flG'][i], viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, defs);
    el('path', { d: 'M0,0 L10,5 L0,10 z', fill: c }, m);
  });
}

function hachures(sv, x1, y1, x2, y2, vers) {
  el('line', { x1, y1, x2, y2, stroke: '#2c4459', 'stroke-width': 2 }, sv);
  const horiz = y1 === y2, n = Math.floor((horiz ? Math.abs(x2 - x1) : Math.abs(y2 - y1)) / 7);
  for (let i = 0; i <= n; i++) {
    if (horiz) { const x = Math.min(x1, x2) + i * 7; el('line', { x1: x, y1, x2: x - 6, y2: y1 + 7 * vers, stroke: '#2c4459', 'stroke-width': .8 }, sv); }
    else { const y = Math.min(y1, y2) + i * 7; el('line', { x1, y1: y, x2: x1 + 7 * vers, y2: y + 6, stroke: '#2c4459', 'stroke-width': .8 }, sv); }
  }
}

function dessinerAppui(sv, a) {
  const px = xPix(a.x), g = el('g', {}, sv);
  const st = { fill: '#fff', stroke: '#2c4459', 'stroke-width': 1.6 };
  switch (a.type) {
    case 'appui':
      el('path', Object.assign({ d: `M${px},${YP + 3} l-11,20 h22 z` }, st), g);
      hachures(g, px - 16, YP + 24, px + 16, YP + 24, 1); break;
    case 'deplacement':
      el('path', Object.assign({ d: `M${px},${YP + 3} l-11,20 h22 z` }, st), g);
      hachures(g, px - 16, YP + 24, px + 16, YP + 24, 1);
      txt(g, px + 18, YP + 22, 'v = ' + String(a.valeur).replace('.', ',') + ' mm', { 'font-size': 11, fill: '#2c4459' }); break;
    case 'encastrement': {
      const bord = a.x <= 1e-9 ? -1 : (a.x >= etat.L - 1e-9 ? 1 : 0);
      if (bord !== 0) hachures(g, px + 3 * bord, YP - 26, px + 3 * bord, YP + 26, bord);
      else { el('rect', { x: px - 10, y: YP + 3, width: 20, height: 18, fill: '#e3eaf0', stroke: '#2c4459' }, g); hachures(g, px - 16, YP + 22, px + 16, YP + 22, 1); }
      break;
    }
    case 'rotule':
      el('circle', { cx: px, cy: YP, r: 6, fill: '#fff', stroke: '#2c4459', 'stroke-width': 2 }, g); break;
    case 'pente_nulle':
      el('rect', { x: px - 4, y: YP - 16, width: 8, height: 32, fill: '#fff', stroke: '#2c4459', 'stroke-width': 1.5 }, g);
      txt(g, px, YP - 22, 'θ = 0', { 'text-anchor': 'middle', 'font-size': 11, fill: '#2c4459' }); break;
    case 'ressort_v': {
      let d = `M${px},${YP + 3} v5`;
      for (let i = 0; i < 5; i++) d += ` l${i % 2 ? -8 : 8},3 l${i % 2 ? 8 : -8},0`;
      d += ` l0,3 v6`;
      el('path', { d: `M${px},${YP + 3} v5 l7,3 l-14,4 l14,4 l-14,4 l14,4 l-7,3 v5`, fill: 'none', stroke: '#2c4459', 'stroke-width': 1.5 }, g);
      hachures(g, px - 14, YP + 36, px + 14, YP + 36, 1);
      txt(g, px + 12, YP + 22, 'k', { 'font-size': 11, fill: '#2c4459' }); break;
    }
    case 'ressort_r':
      el('path', { d: `M${px},${YP} m-12,0 a12,12 0 1,0 12,-12 a8,8 0 1,1 -8,8`, fill: 'none', stroke: '#2c4459', 'stroke-width': 1.5 }, g);
      txt(g, px + 14, YP - 14, 'kθ', { 'font-size': 11, fill: '#2c4459' }); break;
  }
}

function dessinerForce(sv, c) {
  const px = xPix(c.x), col = couleurCharge(c), bas = c.F <= 0;
  const y1 = bas ? YP - 62 : YP - 6, y2 = bas ? YP - 6 : YP - 62;
  el('line', { x1: px, y1, x2: px, y2, stroke: col, 'stroke-width': 2.2, 'marker-end': `url(#${c.cat === 'Q' ? 'flA' : 'flN'})` }, sv);
  txt(sv, px > 860 ? px - 5 : px + 5, YP - 66, frS(Math.abs(c.F), 3) + ' kN' + (c.cat ? ' (' + c.cat + ')' : ''), { fill: col, 'font-size': 12, 'text-anchor': px > 860 ? 'end' : 'start' });
}
function dessinerCouple(sv, c) {
  const px = xPix(c.x), col = couleurCharge(c), r = 18;
  const trigo = c.M >= 0;
  el('path', { d: trigo ? `M${px + r},${YP + 4} A${r},${r} 0 1,0 ${px - 4},${YP + r}` : `M${px - r},${YP + 4} A${r},${r} 0 1,1 ${px + 4},${YP + r}`, fill: 'none', stroke: col, 'stroke-width': 2, 'marker-end': `url(#${c.cat === 'Q' ? 'flA' : 'flN'})` }, sv);
  txt(sv, px > 860 ? px - 22 : px + 22, YP - 22, frS(Math.abs(c.M), 3) + ' kN·m' + (c.cat ? ' (' + c.cat + ')' : ''), { fill: col, 'font-size': 12 });
}
function dessinerRepartie(sv, c, pmax, niveau) {
  const col = couleurCharge(c);
  const p1 = c.p1, p2 = c.type === 'lineaire' ? c.p2 : c.p1;
  const xa = xPix(Math.min(c.x1, c.x2)), xb = xPix(Math.max(c.x1, c.x2));
  const pa = c.x1 <= c.x2 ? p1 : p2, pb = c.x1 <= c.x2 ? p2 : p1;
  const H = 40, base = YP - 6 - niveau * 4;
  const ha = pmax ? H * Math.abs(pa) / pmax : 0, hb = pmax ? H * Math.abs(pb) / pmax : 0;
  const decal = niveau * (H + 18);
  const yA = base - decal - ha, yB = base - decal - hb, yBase = base - decal;
  el('path', { d: `M${xa},${yBase} L${xa},${yA} L${xb},${yB} L${xb},${yBase} z`, fill: c.cat === 'Q' ? '#e3eaf0' : '#eceef0', stroke: col, 'stroke-width': 1.2, 'stroke-dasharray': c.cat === 'Q' ? '5 3' : '' }, sv);
  const n = Math.max(2, Math.round((xb - xa) / 28));
  for (let i = 0; i <= n; i++) {
    const x = xa + (xb - xa) * i / n, h = ha + (hb - ha) * i / n;
    if (h < 4) continue;
    const p = pa + (pb - pa) * i / n;
    const yt = yBase - h;
    if (p <= 0) el('line', { x1: x, y1: yt, x2: x, y2: yBase, stroke: col, 'stroke-width': 1, 'marker-end': `url(#${c.cat === 'Q' ? 'flA' : 'flN'})` }, sv);
    else el('line', { x1: x, y1: yBase, x2: x, y2: yt, stroke: col, 'stroke-width': 1, 'marker-end': `url(#${c.cat === 'Q' ? 'flA' : 'flN'})` }, sv);
  }
  const lib = c.type === 'lineaire' ? frS(Math.abs(pa), 3) + ' → ' + frS(Math.abs(pb), 3) + ' kN/m' : frS(Math.abs(pa), 3) + ' kN/m';
  txt(sv, (xa + xb) / 2, Math.min(yA, yB) - 4, lib + (c.cat ? ' (' + c.cat + ')' : ''), { 'text-anchor': 'middle', fill: col, 'font-size': 12 });
}

/* ================= outils « clic » ================= */
let outil = null;
const NOMS_OUTILS = { appui: 'Appui simple', encastrement: 'Encastrement', rotule: 'Rotule', force: 'Force ponctuelle', repartie: 'Charge répartie uniforme' };

function activerOutil(t) {
  if (outil && outil.type === t) { desactiverOutil('Outil arrêté.'); return; }
  outil = { type: t };
  $$('.outil').forEach(b => b.classList.toggle('actif', b.dataset.outil === t));
  majEtatOutil();
  dessinerSchema();
}
function desactiverOutil(msg) {
  outil = null;
  $$('.outil').forEach(b => b.classList.remove('actif'));
  const z = $('#etatOutil'); z.classList.remove('actif');
  z.textContent = msg || 'Aucun outil actif.';
  dessinerSchema();
}
function majEtatOutil() {
  const z = $('#etatOutil');
  if (!outil) return;
  z.classList.add('actif');
  const v = num($('#oVal').value, -5), cat = $('#oCat').value;
  let s = 'Outil actif : ' + NOMS_OUTILS[outil.type];
  if (outil.type === 'force') s += ' (' + frS(v, 3) + ' kN, ' + cat + ')';
  if (outil.type === 'repartie') s += ' (' + frS(v, 3) + ' kN/m, ' + cat + ')';
  if (outil.type === 'repartie') s += outil.x1 === undefined ? ' — 1) clique sur le DÉBUT de la charge.' : ' — 2) clique sur la FIN de la charge (début : x = ' + frX(outil.x1) + ' m).';
  else s += ' — clique sur la poutre à l\'endroit voulu.';
  s += ' Échap pour arrêter.';
  z.textContent = s;
}
function xDepuisEvenement(ev, sv) {
  const pt = sv.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY;
  const p = pt.matrixTransform(sv.getScreenCTM().inverse());
  return p;
}
function accrocher(x) {
  const pas = num($('#oPas').value, 0.05);
  // accrochage prioritaire aux nœuds existants (à moins de 8 px)
  const res = resultats && resultats.ELS && resultats.ELS.ok ? resultats.ELS.noeuds : [0, etat.L];
  for (const n of res) if (Math.abs(xPix(n) - xPix(x)) < 8) return n;
  x = Math.round(x / pas) * pas;
  return Math.min(Math.max(Math.round(x * 1e6) / 1e6, 0), etat.L);
}
function clicSchema(ev) {
  if (!outil) return;
  const p = xDepuisEvenement(ev, $('#svgSchema'));
  if (p.x < X0 - 20 || p.x > X1 + 20) return;
  const x = accrocher(xMetre(p.x));
  const v = num($('#oVal').value, -5), cat = $('#oCat').value;
  let msg = '';
  switch (outil.type) {
    case 'appui': case 'encastrement': case 'rotule':
      etat.appuis.push({ id: nouvelId(), type: outil.type, x, valeur: 0 });
      msg = NOMS_OUTILS[outil.type] + ' ajouté à x = ' + frX(x) + ' m.'; afficherTableAppuis(); break;
    case 'force':
      etat.charges.push({ id: nouvelId(), type: 'force', cat, x, F: v });
      msg = 'Force de ' + frS(v, 3) + ' kN ajoutée à x = ' + frX(x) + ' m.'; afficherTableCharges(); break;
    case 'repartie':
      if (outil.x1 === undefined) { outil.x1 = x; majEtatOutil(); dessinerSchema(); return; }
      if (Math.abs(x - outil.x1) < 1e-9) return;
      etat.charges.push({ id: nouvelId(), type: 'uniforme', cat, x1: Math.min(outil.x1, x), x2: Math.max(outil.x1, x), p1: v, p2: v });
      msg = 'Charge répartie de ' + frS(v, 3) + ' kN/m ajoutée de x = ' + frX(Math.min(outil.x1, x)) + ' à ' + frX(Math.max(outil.x1, x)) + ' m.';
      afficherTableCharges(); break;
  }
  if ($('#oGarder').checked) { const t = outil.type; outil = { type: t }; modifie(); majEtatOutil(); $('#etatOutil').textContent = msg + ' ' + $('#etatOutil').textContent; }
  else { modifie(); desactiverOutil(msg + ' Outil désactivé (coche « garder l\'outil » pour enchaîner).'); }
}
function survolSchema(ev) {
  const sv = $('#svgSchema');
  const p = xDepuisEvenement(ev, sv);
  const g = $('#guideSchema'), t = $('#txtSchema');
  if (!g) return;
  if (p.x < X0 - 20 || p.x > X1 + 20) { g.setAttribute('visibility', 'hidden'); t.setAttribute('visibility', 'hidden'); return; }
  const x = outil ? accrocher(xMetre(p.x)) : Math.min(Math.max(xMetre(p.x), 0), etat.L);
  const px = xPix(x);
  g.setAttribute('x1', px); g.setAttribute('x2', px); g.setAttribute('visibility', 'visible');
  t.setAttribute('x', Math.min(Math.max(px, 40), 960)); t.textContent = 'x = ' + frX(x) + ' m'; t.setAttribute('visibility', 'visible');
  const ap = $('#apercuRep');
  if (ap && outil && outil.x1 !== undefined) { const a = Math.min(xPix(outil.x1), px), b = Math.max(xPix(outil.x1), px); ap.setAttribute('x', a); ap.setAttribute('width', b - a); }
  guides(x);
}

/* ================= résultats ================= */
function resCourant() { return resultats && resultats[etat.cas || 'ELU']; }
function nomCas(c) { return c === 'ELS' ? 'ELS (G + Q)' : 'ELU (1,35 G + 1,5 Q)'; }

function afficherResultats() {
  const mz = $('#messages'); mz.innerHTML = '';
  const zr = $('#zoneResultats');
  const r = resCourant();
  const nH = resultats.hyper;
  $('#noteHyper').textContent = (nH === undefined) ? '' : (nH < 0 ? 'Liaisons insuffisantes : la poutre est un mécanisme.' :
    nH === 0 ? 'Poutre isostatique (h = 0) : réactions calculables par la statique seule.' :
    'Poutre hyperstatique d\'ordre ' + nH + ' : la statique seule ne suffit pas.');
  if (resultats.erreur || !r || !r.ok) {
    const msgs = resultats.erreur ? [resultats.erreur] : r.erreurs;
    mz.innerHTML = msgs.map(m => `<div class="message">${echapper(m)}</div>`).join('');
    zr.classList.add('cache'); $('#zoneJeCalcule').classList.add('cache');
    $('#verifs').innerHTML = '<p class="note">Pas de vérification possible tant que la poutre n\'est pas correctement tenue.</p>';
    return;
  }
  const av = [...new Set([...(resultats.ELS.avertissements || [])])];
  if (etat.charges.some(c => !c.cat)) av.push('Certaines charges ne sont pas classées G ou Q : elles sont prises avec le coefficient 1 à l\'ELU comme à l\'ELS.');
  mz.innerHTML = av.map(m => `<div class="message alerte">${echapper(m)}</div>`).join('');

  // mode « Je calcule d'abord »
  const jc = $('#cJeCalcule').checked;
  $('#zoneJeCalcule').classList.toggle('cache', !jc);
  zr.classList.toggle('cache', jc && !solutionVisible);
  if (jc) construireJeCalcule(r);

  // réactions
  $('#tReactions').innerHTML = r.reactions.map((q, i) => `<tr><td>${i + 1}. ${q.types.map(t => NOMS_APPUIS[t] || t).join(' + ')}</td>
     <td class="num">${frX(q.x)}</td><td class="num">${q.porteV ? fr(q.Fy / 1000, 3) : '—'}</td><td class="num">${q.porteT ? fr(q.Mz / 1000, 3) : '—'}</td></tr>`).join('');
  const eq = r.equilibre;
  const tolF = 1e-6 * Math.max(1, Math.abs(eq.sommeChargesF)), tolM = 1e-6 * Math.max(1, Math.abs(eq.sommeChargesM));
  const okF = Math.abs(eq.sommeF) < tolF, okM = Math.abs(eq.sommeM) < tolM;
  $('#equilibre').innerHTML = `<table>
     <tr><td>Σ Fy = Σ réactions + Σ charges</td><td class="num">${fr(eq.sommeReactionsF / 1000, 3)} + (${fr(eq.sommeChargesF / 1000, 3)}) = <b>${fr(eq.sommeF / 1000, 3)}</b> kN</td><td>${voyant(okF)}</td></tr>
     <tr><td>Σ Mz/O (x = 0) = Σ réactions + Σ charges</td><td class="num">${fr(eq.sommeReactionsM / 1000, 3)} + (${fr(eq.sommeChargesM / 1000, 3)}) = <b>${fr(eq.sommeM / 1000, 3)}</b> kN·m</td><td>${voyant(okM)}</td></tr></table>
     <p class="note">Le principe fondamental de la statique est vérifié si les deux sommes sont nulles. Cas : ${nomCas(etat.cas)}.</p>`;

  // extrema
  const e = r.extrema;
  $('#tExtrema').innerHTML = [
    ['Effort tranchant max', fr(e.T.max / 1000, 3) + ' kN', e.T.xmax],
    ['Effort tranchant min', fr(e.T.min / 1000, 3) + ' kN', e.T.xmin],
    ['Moment fléchissant max', fr(e.Mf.max / 1000, 3) + ' kN·m', e.Mf.xmax],
    ['Moment fléchissant min', fr(e.Mf.min / 1000, 3) + ' kN·m', e.Mf.xmin],
    ['Flèche min (vers le bas)', fr(e.v.min * 1000, 3) + ' mm', e.v.xmin],
    ['Flèche max (vers le haut)', fr(e.v.max * 1000, 3) + ' mm', e.v.xmax],
    ['Pente max', fr(e.th.max * DEG, 4) + ' °', e.th.xmax],
    ['Pente min', fr(e.th.min * DEG, 4) + ' °', e.th.xmin],
    ['Contrainte normale max |σ|', fr(e.sAbs / 1e6, 2) + ' MPa', e.MfAbs.x]
  ].map(l => `<tr><td>${l[0]}</td><td class="num"><b>${l[1]}</b></td><td class="num note">x = ${frX(l[2])} m</td></tr>`).join('') +
    `<tr><td colspan="3" class="note">Cas affiché : ${nomCas(etat.cas)} · ${r.noeuds.length} nœuds, ${r.nbElements} éléments (créés automatiquement).</td></tr>`;

  dessinerDiagrammes();
  afficherVerifs();
}

function voyant(ok) { return `<span class="voyant ${ok ? 'ok' : 'ko'}"></span>`; }

/* ---------- diagrammes ---------- */
function cadreDiagramme(sv, H, ymin, ymax, unite) {
  sv.innerHTML = '';
  el('rect', { x: 0, y: 0, width: 1000, height: H, fill: '#fff' }, sv);
  const haut = 22, bas = H - 26;
  if (ymax - ymin < 1e-12) { ymax += 1; ymin -= 1; }
  const marge = (ymax - ymin) * 0.08; ymax += marge; ymin -= marge;
  const Y = v => haut + (ymax - v) / (ymax - ymin) * (bas - haut);
  // appuis (traits verticaux)
  etat.appuis.forEach(a => el('line', { x1: xPix(a.x), y1: haut - 6, x2: xPix(a.x), y2: bas + 4, stroke: '#cfd6de', 'stroke-dasharray': '2 3' }, sv));
  // graduations x
  const pasX = etat.L <= 2 ? 0.25 : etat.L <= 5 ? 0.5 : etat.L <= 12 ? 1 : 2;
  for (let x = 0; x <= etat.L + 1e-9; x += pasX) {
    el('line', { x1: xPix(x), y1: bas + 6, x2: xPix(x), y2: bas + 10, stroke: '#5f6b76' }, sv);
    txt(sv, xPix(x), bas + 21, frX(Math.round(x * 1000) / 1000), { 'text-anchor': 'middle', 'font-size': 10, fill: '#5f6b76' });
  }
  el('line', { x1: X0, y1: bas + 6, x2: X1, y2: bas + 6, stroke: '#5f6b76' }, sv);
  txt(sv, X1 + 24, bas + 21, 'x (m)', { 'font-size': 10, fill: '#5f6b76' });
  // axe zéro
  const y0 = Y(0);
  el('line', { x1: X0, y1: y0, x2: X1, y2: y0, stroke: '#1f2933', 'stroke-width': 1 }, sv);
  txt(sv, X0 - 6, y0 + 4, '0', { 'text-anchor': 'end', 'font-size': 10, fill: '#5f6b76' });
  txt(sv, 8, 14, unite, { 'font-size': 11, fill: '#5f6b76' });
  return { Y, y0, haut, bas };
}
function tracerCourbe(sv, xs, ys, Y, opts = {}) {
  let d = '', dz = '';
  for (let i = 0; i < xs.length; i++) {
    const px = xPix(xs[i]).toFixed(2), py = Y(ys[i]).toFixed(2);
    d += (i ? 'L' : 'M') + px + ',' + py;
  }
  if (opts.remplir) {
    const y0 = Y(0).toFixed(2);
    el('path', { d: `M${xPix(xs[0])},${y0}` + d.replace(/^M/, 'L') + `L${xPix(xs[xs.length - 1])},${y0}z`, fill: '#e3eaf0', stroke: 'none' }, sv);
  }
  el('path', { d, fill: 'none', stroke: opts.couleur || '#3e5c76', 'stroke-width': opts.epaisseur || 2, 'stroke-dasharray': opts.tirets || '' }, sv);
}
function etiquette(sv, x, val, Y, texte, dessous) {
  const px = xPix(x), py = Y(val);
  el('circle', { cx: px, cy: py, r: 3, fill: '#2c4459' }, sv);
  const ancre = px > 850 ? 'end' : px < 150 ? 'start' : 'middle';
  const Hsv = +sv.getAttribute('viewBox').split(' ')[3];
  if (dessous && py + 15 > Hsv - 30) dessous = false;
  else if (!dessous && py - 7 < 26) dessous = true;
  txt(sv, px + (ancre === 'end' ? -8 : ancre === 'start' ? 8 : 0), py + (dessous ? 15 : -7), texte, { 'text-anchor': ancre, 'font-size': 11.5, fill: '#2c4459', 'font-weight': 600 });
}
function ajouterGuide(sv, H) {
  el('line', { class: 'guide', x1: 0, y1: 10, x2: 0, y2: H - 20, stroke: '#3e5c76', 'stroke-dasharray': '3 3', visibility: 'hidden' }, sv);
}

let amplitude = 1; // pour l'animation
function dessinerDiagrammes() {
  const r = resCourant(); if (!r || !r.ok) return;
  const e = r.echantillons, ex = r.extrema;
  // T
  {
    const sv = $('#dT'), ys = e.T.map(v => v / 1000);
    const c = cadreDiagramme(sv, 190, Math.min(0, ...ys), Math.max(0, ...ys), 'Ty (kN)');
    tracerCourbe(sv, e.x, ys, c.Y, { remplir: true });
    if (Math.abs(ex.T.max) > 1e-9) etiquette(sv, ex.T.xmax, ex.T.max / 1000, c.Y, fr(ex.T.max / 1000, 2) + ' kN', false);
    if (Math.abs(ex.T.min) > 1e-9) etiquette(sv, ex.T.xmin, ex.T.min / 1000, c.Y, fr(ex.T.min / 1000, 2) + ' kN', true);
    ajouterGuide(sv, 190);
  }
  // Mf
  {
    const sv = $('#dM'), ys = e.Mf.map(v => v / 1000);
    const c = cadreDiagramme(sv, 190, Math.min(0, ...ys), Math.max(0, ...ys), 'Mfz (kN·m)');
    tracerCourbe(sv, e.x, ys, c.Y, { remplir: true });
    if (ex.Mf.max > 1e-9) etiquette(sv, ex.Mf.xmax, ex.Mf.max / 1000, c.Y, fr(ex.Mf.max / 1000, 2) + ' kN·m à ' + frX(ex.Mf.xmax) + ' m', false);
    if (ex.Mf.min < -1e-9) etiquette(sv, ex.Mf.xmin, ex.Mf.min / 1000, c.Y, fr(ex.Mf.min / 1000, 2) + ' kN·m à ' + frX(ex.Mf.xmin) + ' m', true);
    ajouterGuide(sv, 190);
  }
  dessinerDeformee();
  // θ
  {
    const sv = $('#dTh'), ys = e.th.map(v => v * DEG);
    const c = cadreDiagramme(sv, 170, Math.min(0, ...ys), Math.max(0, ...ys), 'θz (°)');
    tracerCourbe(sv, e.x, ys, c.Y, { remplir: true });
    ajouterGuide(sv, 170);
  }
  // σ
  {
    const sv = $('#dS'), y1 = e.sSup.map(v => v / 1e6), y2 = e.sInf.map(v => v / 1e6);
    const c = cadreDiagramme(sv, 190, Math.min(0, ...y1, ...y2), Math.max(0, ...y1, ...y2), 'σ (MPa)');
    tracerCourbe(sv, e.x, y1, c.Y, {});
    tracerCourbe(sv, e.x, y2, c.Y, { tirets: '6 4', couleur: '#1f2933', epaisseur: 1.5 });
    ajouterGuide(sv, 190);
  }
}

function dessinerDeformee() {
  const r = resCourant(); if (!r || !r.ok) return;
  const sv = $('#dV'), H = 210, e = r.echantillons;
  sv.innerHTML = '';
  el('rect', { x: 0, y: 0, width: 1000, height: H, fill: '#fff' }, sv);
  const vmax = Math.max(Math.abs(r.extrema.v.max), Math.abs(r.extrema.v.min));
  const curseur = num($('#rAmp').value, 50) / 100;           // 0 … 1
  const pixMax = 10 + 70 * curseur;                          // déplacement maxi affiché (px)
  const k = vmax > 0 ? pixMax / vmax : 0;                    // px par mètre de déplacement
  const echGeo = (X1 - X0) / etat.L;                         // px par mètre de longueur
  const ampli = vmax > 0 ? k / echGeo : 0;
  $('#ampVal').textContent = vmax > 0 ? 'déplacements × ' + frS(ampli, 3) : '';
  const yb = 95;
  // poutre non déformée
  el('line', { x1: X0, y1: yb, x2: X1, y2: yb, stroke: '#9aa5b1', 'stroke-width': 2, 'stroke-dasharray': '6 4' }, sv);
  etat.appuis.forEach(a => {
    const px = xPix(a.x);
    if (a.type === 'appui' || a.type === 'deplacement') el('path', { d: `M${px},${yb + 3} l-8,14 h16 z`, fill: '#fff', stroke: '#9aa5b1' }, sv);
    if (a.type === 'encastrement') el('rect', { x: px - 3, y: yb - 14, width: 6, height: 28, fill: '#9aa5b1' }, sv);
  });
  // déformée
  let d = '';
  for (let i = 0; i < e.x.length; i++) d += (i ? 'L' : 'M') + xPix(e.x[i]).toFixed(2) + ',' + (yb - e.v[i] * k * amplitude).toFixed(2);
  el('path', { d, fill: 'none', stroke: '#3e5c76', 'stroke-width': 3 }, sv);
  if (amplitude >= 0.999) {
    const ex = r.extrema.v;
    if (ex.min < -1e-12) etiquette(sv, ex.xmin, 0, v => yb - ex.min * k, fr(ex.min * 1000, 3) + ' mm à ' + frX(ex.xmin) + ' m', true);
    if (ex.max > 1e-12) etiquette(sv, ex.xmax, 0, v => yb - ex.max * k, '+' + fr(ex.max * 1000, 3) + ' mm à ' + frX(ex.xmax) + ' m', false);
  }
  txt(sv, 8, 14, 'v (mm) — déformée amplifiée, poutre initiale en tirets', { 'font-size': 11, fill: '#5f6b76' });
  ajouterGuide(sv, H);
}

function animer() {
  const t0 = performance.now(), duree = 1600;
  $('#bAnimer').disabled = true;
  function pas(t) {
    const u = Math.min(1, (t - t0) / duree);
    amplitude = 1 - Math.pow(1 - u, 3);
    dessinerDeformee();
    if (u < 1) requestAnimationFrame(pas); else { amplitude = 1; dessinerDeformee(); $('#bAnimer').disabled = false; }
  }
  amplitude = 0; requestAnimationFrame(pas);
}

/* ---------- lecture en un point, guides synchronisés ---------- */
function guides(x) {
  const px = xPix(x);
  $$('line.guide').forEach(g => { g.setAttribute('x1', px); g.setAttribute('x2', px); g.setAttribute('visibility', 'visible'); });
  lireValeur(x);
}
function lireValeur(x) {
  const r = resCourant(); if (!r || !r.ok) return;
  x = Math.min(Math.max(x, 0), etat.L);
  const g = r.valeurEn(x, 'g'), d = r.valeurEn(x, 'd');
  const saut = (a, b, f, n) => Math.abs(a - b) > 1e-6 * (Math.abs(a) + Math.abs(b) + 1e-9) ? `${fr(f(a), n)} | ${fr(f(b), n)}` : fr(f(b), n);
  $('#lecture').innerHTML = `x = <b>${fr(x, 3)} m</b> &nbsp;·&nbsp; Ty = <b>${saut(g.T, d.T, v => v / 1000, 3)}</b> kN &nbsp;·&nbsp; Mfz = <b>${saut(g.Mf, d.Mf, v => v / 1000, 3)}</b> kN·m &nbsp;·&nbsp; v = <b>${fr(d.v * 1000, 3)}</b> mm &nbsp;·&nbsp; θz = <b>${saut(g.th, d.th, v => v * DEG, 4)}</b> ° &nbsp;·&nbsp; σ sup / inf = <b>${fr(d.sSup / 1e6, 2)}</b> / <b>${fr(d.sInf / 1e6, 2)}</b> MPa <span class="note">(${nomCas(etat.cas)}${Math.abs(g.T - d.T) > 1e-6 ? ' ; à gauche | à droite' : ''})</span>`;
}
function survolDiagramme(ev) {
  const sv = ev.currentTarget, p = xDepuisEvenement(ev, sv);
  if (p.x < X0 || p.x > X1) return;
  guides(xMetre(p.x));
}

/* ---------- vérifications ---------- */
function travees(r) {
  const pts = [...new Set(etat.appuis.filter(a => ['appui', 'encastrement', 'deplacement'].includes(a.type)).map(a => Math.round(a.x * 1e6) / 1e6))].sort((a, b) => a - b);
  const t = [];
  if (!pts.length) return [{ a: 0, b: etat.L, lref: etat.L, nom: 'Poutre entière', console: false }];
  if (pts[0] > 1e-9) t.push({ a: 0, b: pts[0], lref: 2 * pts[0], nom: 'Console gauche', console: true });
  for (let i = 0; i + 1 < pts.length; i++) t.push({ a: pts[i], b: pts[i + 1], lref: pts[i + 1] - pts[i], nom: 'Travée ' + (i + 1), console: false });
  if (pts[pts.length - 1] < etat.L - 1e-9) t.push({ a: pts[pts.length - 1], b: etat.L, lref: 2 * (etat.L - pts[pts.length - 1]), nom: 'Console droite', console: true });
  return t;
}
function afficherVerifs() {
  const z = $('#verifs');
  const rS = resultats.ELS, rU = resultats.ELU;
  if (!rS.ok || !rU.ok) { z.innerHTML = ''; return; }
  const n = etat.limiteFleche;
  const lignesF = travees(rS).map(t => {
    let vm = 0, xm = t.a;
    const e = rS.echantillons;
    for (let i = 0; i < e.x.length; i++) if (e.x[i] >= t.a - 1e-9 && e.x[i] <= t.b + 1e-9 && Math.abs(e.v[i]) > vm) { vm = Math.abs(e.v[i]); xm = e.x[i]; }
    const lim = t.lref / n, ok = vm <= lim * (1 + 1e-9);
    return { t, vm, xm, lim, ok };
  });
  const m = etat.materiau, fd = m.kmod * m.fk / m.gammaM;
  const sig = rU.extrema.sAbs / 1e6, okS = sig <= fd * (1 + 1e-9);
  const okF = lignesF.every(l => l.ok);
  const sansCat = !etat.charges.some(c => c.cat === 'G' || c.cat === 'Q') && !etat.poidsPropre;
  const mm = M.MATERIAUX[m.code];
  z.innerHTML = (sansCat ? '<div class="message info">Indique la catégorie des charges (G permanente ou Q exploitation) pour des combinaisons ELS/ELU représentatives.</div>' : '') +
    `<h3>${voyant(okF)}Flèche — ELS caractéristique : G + Q — limite ℓ / ${n}</h3>
    <table><thead><tr><th>Zone</th><th class="num">ℓ de référence (m)</th><th class="num">|v| max (mm)</th><th class="num">Limite ℓ/${n} (mm)</th><th class="num">Taux</th><th>Résultat</th></tr></thead><tbody>
    ${lignesF.map(l => `<tr><td>${l.t.nom} (${frX(l.t.a)} → ${frX(l.t.b)} m)${l.t.console ? ' <span class="note">ℓ = 2 × porte-à-faux</span>' : ''}</td><td class="num">${fr(l.t.lref, 2)}</td><td class="num">${fr(l.vm * 1000, 2)}</td><td class="num">${fr(l.lim * 1000, 2)}</td><td class="num">${fr(100 * l.vm / l.lim, 0)} %</td><td class="${l.ok ? 'res-ok' : 'res-ko'}">${voyant(l.ok)}${l.ok ? 'Vérifié' : 'Non vérifié'}</td></tr>`).join('')}
    </tbody></table>
    <p class="note">Flèche instantanée (module moyen E). Pour le bois, le fluage (kdef) augmente la flèche finale : non pris en compte en v1.</p>
    <h3>${voyant(okS)}Contrainte normale — ELU : 1,35 G + 1,5 Q</h3>
    <table><tbody>
      <tr><td>|Mf| max (ELU)</td><td class="num">${fr(Math.abs(rU.extrema.MfAbs.val) / 1000, 3)} kN·m à x = ${frX(rU.extrema.MfAbs.x)} m</td></tr>
      <tr><td>σ max = |Mf| max · v / Iz</td><td class="num"><b>${fr(sig, 2)} MPa</b></td></tr>
      <tr><td>Résistance de calcul f<sub>d</sub> = kmod · ${mm ? mm.nomResistance : 'fk'} / γM = ${fr(m.kmod, 2)} × ${fr(m.fk, 1)} / ${fr(m.gammaM, 2)}</td><td class="num"><b>${fr(fd, 2)} MPa</b></td></tr>
      <tr><td>Taux de travail σ / f<sub>d</sub></td><td class="num">${fr(100 * sig / fd, 0)} %</td></tr>
      <tr><td>Résultat</td><td class="num ${okS ? 'res-ok' : 'res-ko'}">${voyant(okS)}${okS ? 'Vérifié' : 'Non vérifié'}</td></tr>
    </tbody></table>
    ${m.code === 'C25' ? '<p class="note">Béton non armé : la traction limite la résistance (fctd = fctk,0,05 / γC). Une poutre en béton armé nécessite le calcul des armatures, non traité en v1.</p>' : ''}
    ${mm && mm.indicatif ? '<p class="note">Valeurs du matériau indicatives : à confirmer avec la fiche technique du fabricant.</p>' : ''}`;
}

/* ---------- mode « Je calcule d'abord » ---------- */
let saisiesEleve = {};
function grandeursAComparer(r) {
  const g = [];
  r.reactions.forEach((q, i) => {
    if (q.porteV) g.push({ cle: 'F' + i + '@' + q.x, nom: `Réaction Fy à x = ${frX(q.x)} m`, unite: 'kN', sol: q.Fy / 1000 });
    if (q.porteT) g.push({ cle: 'M' + i + '@' + q.x, nom: `Moment Mz à x = ${frX(q.x)} m`, unite: 'kN·m', sol: q.Mz / 1000 });
  });
  g.push({ cle: 'Mfmax', nom: 'Mf maximal en valeur absolue |Mf|max', unite: 'kN·m', sol: Math.abs(r.extrema.MfAbs.val) / 1000 });
  g.push({ cle: 'fmax', nom: 'Flèche maximale |v|max (facultatif)', unite: 'mm', sol: Math.abs(r.extrema.vAbs.val) * 1000, facultatif: true });
  return g;
}
function construireJeCalcule(r) {
  $('#jcCas').textContent = nomCas(etat.cas);
  const tb = $('#tJeCalcule');
  const g = grandeursAComparer(r);
  tb.innerHTML = g.map(q => {
    const v = saisiesEleve[q.cle];
    let sol = '<span class="note">masquée</span>', ec = '';
    if (solutionVisible) {
      sol = fr(q.sol, 3) + ' ' + q.unite;
      if (v !== undefined && v !== '') {
        const n = num(v, NaN);
        if (isFinite(n)) {
          const e = Math.abs(q.sol) > 1e-9 ? 100 * (n - q.sol) / Math.abs(q.sol) : (Math.abs(n) < 1e-6 ? 0 : Infinity);
          const cl = Math.abs(e) <= 2 ? 'res-ok' : 'res-ko';
          ec = `<span class="${cl}">${isFinite(e) ? (e >= 0 ? '+' : '') + fr(e, 1) + ' %' : '—'}</span>`;
        }
      } else ec = '<span class="note">non saisi</span>';
    }
    return `<tr><td>${q.nom}</td><td class="num"><input type="text" data-cle="${q.cle}" value="${v === undefined ? '' : echapper(v)}" style="width:80px"> <span class="unite">${q.unite}</span></td><td class="num">${sol}</td><td class="num">${ec}</td></tr>`;
  }).join('') + '<tr><td colspan="4" class="note">Écart affiché en vert si |écart| ≤ 2 %. Respecte les signes : Fy &gt; 0 vers le haut, Mz &gt; 0 sens trigonométrique.</td></tr>';
  tb.querySelectorAll('input').forEach(i => i.addEventListener('input', () => { saisiesEleve[i.dataset.cle] = i.value; }));
}

/* ================= compte rendu imprimable ================= */
function imprimer() {
  if (!resultats || !resultats.ELS || !resultats.ELS.ok) { alert('Le calcul n\'est pas possible : corrige d\'abord la modélisation.'); return; }
  const r = resCourant(), m = etat.materiau, s = resultats.sec;
  const det = document.querySelector('details'); const ouvert = det.open; det.open = true;
  const svgs = ['#svgSchema', '#dT', '#dM', '#dV'].map(id => $(id).outerHTML.replace(/ id="(svgSchema|dT|dM|dV|guideSchema|txtSchema|apercuRep)"/g, '').replace(/fl([NAG])/g, 'flR$1'));
  det.open = ouvert;
  const date = new Date().toLocaleDateString('fr-FR');
  const lignesAppuis = etat.appuis.map(a => `<tr><td>${NOMS_APPUIS[a.type]}</td><td class="num">${frX(a.x)}</td><td>${UNITES_APPUIS[a.type] ? String(a.valeur).replace('.', ',') + ' ' + UNITES_APPUIS[a.type] : ''}</td></tr>`).join('');
  const lignesCharges = etat.charges.map(c => {
    const pos = (c.type === 'force' || c.type === 'couple') ? 'x = ' + frX(c.x) + ' m' : 'de ' + frX(c.x1) + ' à ' + frX(c.x2) + ' m';
    const val = c.type === 'force' ? fr(c.F, 3) + ' kN' : c.type === 'couple' ? fr(c.M, 3) + ' kN·m' : c.type === 'uniforme' ? fr(c.p1, 3) + ' kN/m' : fr(c.p1, 3) + ' → ' + fr(c.p2, 3) + ' kN/m';
    return `<tr><td>${NOMS_CHARGES[c.type]}</td><td>${c.cat || '—'}</td><td>${pos}</td><td class="num">${val}</td></tr>`;
  }).join('') + (etat.poidsPropre ? `<tr><td>Poids propre</td><td>G</td><td>toute la poutre</td><td class="num">${fr(-m.rho * s.A * etat.g / 1000, 3)} kN/m</td></tr>` : '');
  $('#rapport').innerHTML = `
    <h1>Compte rendu de calcul — ${echapper(etat.titre || 'Poutre')}</h1>
    <p>${etat.auteur ? 'Élève / classe : <b>' + echapper(etat.auteur) + '</b> · ' : ''}Date : ${date} · Logiciel « Poutre » v1 (méthode des déplacements, éléments poutre de Bernoulli)</p>
    <div class="groupe"><h2>1. Hypothèses et données</h2>
    <table><tbody>
      <tr><td>Longueur</td><td>L = ${fr(etat.L, 3)} m</td></tr>
      <tr><td>Matériau</td><td>${M.MATERIAUX[m.code] ? M.MATERIAUX[m.code].nom : 'Personnalisé'} : E = ${fr(m.E, 0)} MPa ; ρ = ${fr(m.rho, 0)} kg/m³ ; résistance caractéristique ${fr(m.fk, 1)} MPa ; kmod = ${fr(m.kmod, 2)} ; γM = ${fr(m.gammaM, 2)}</td></tr>
      <tr><td>Section</td><td>${echapper(s.description)} : A = ${frS(s.A * 1e4, 4)} cm² ; Iz = ${frS(s.Iz * 1e8, 4)} cm⁴ ; Wel,z = ${frS(s.Wel * 1e6, 4)} cm³</td></tr>
      <tr><td>Pesanteur</td><td>g = ${fr(etat.g, 2)} m/s²</td></tr>
    </tbody></table>
    <table style="margin-top:6px"><thead><tr><th>Liaison</th><th class="num">x (m)</th><th>Valeur</th></tr></thead><tbody>${lignesAppuis}</tbody></table>
    <table style="margin-top:6px"><thead><tr><th>Charge</th><th>Cat.</th><th>Position</th><th class="num">Valeur</th></tr></thead><tbody>${lignesCharges}</tbody></table>
    <p class="note">${$('#noteHyper').textContent}</p></div>
    <div class="groupe"><h2>2. Schéma mécanique</h2>${svgs[0]}</div>
    <div class="groupe"><h2>3. Actions de liaison et équilibre — ${nomCas(etat.cas)}</h2>
      <table><thead><tr><th>Appui</th><th class="num">x (m)</th><th class="num">Fy (kN)</th><th class="num">Mz (kN·m)</th></tr></thead><tbody>${$('#tReactions').innerHTML}</tbody></table>
      ${$('#equilibre').innerHTML}</div>
    <div class="groupe"><h2>4. Valeurs extrêmes — ${nomCas(etat.cas)}</h2><table><tbody>${$('#tExtrema').innerHTML}</tbody></table></div>
    <div class="groupe"><h2>5. Effort tranchant Ty (kN)</h2>${svgs[1]}</div>
    <div class="groupe"><h2>6. Moment fléchissant Mfz (kN·m)</h2>${svgs[2]}</div>
    <div class="groupe"><h2>7. Déformée (amplifiée)</h2>${svgs[3]}</div>
    <div class="groupe"><h2>8. Vérifications</h2>${$('#verifs').innerHTML}</div>
    <p class="note">Vérifications pédagogiques : elles ne remplacent pas une note de calcul réglementaire.</p>`;
  window.print();
}

/* ================= fichiers ================= */
function enregistrer() {
  const nom = (etat.titre || 'etude').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9_-]+/g, '_').replace(/^_|_$/g, '') || 'etude';
  const blob = new Blob([JSON.stringify(etat, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = nom + '.json';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
function ouvrirFichier(f) {
  const lect = new FileReader();
  lect.onload = () => {
    try {
      const o = JSON.parse(lect.result);
      if (o.format !== 'poutre-sti2d') throw new Error('ce fichier n\'est pas une étude « Poutre ».');
      chargerEtat(o);
    } catch (e) { alert('Impossible d\'ouvrir le fichier : ' + e.message); }
  };
  lect.readAsText(f);
}
function chargerEtat(o) {
  const base = etatVide();
  etat = Object.assign(base, o);
  etat.materiau = Object.assign(base.materiau, o.materiau || {});
  etat.section = Object.assign(base.section, o.section || {});
  etat.appuis = (o.appuis || []).map(a => Object.assign({ id: nouvelId(), valeur: 0 }, a));
  etat.charges = (o.charges || []).map(c => Object.assign({ id: nouvelId(), cat: '' }, c));
  saisiesEleve = {}; solutionVisible = false;
  toutAfficher(); engager();
}
function toutAfficher() { afficherFormulaires(); recalculer(); }

/* ================= événements ================= */
function brancher() {
  $('#bNouveau').onclick = () => { chargerEtat(etatVide()); desactiverOutil('Nouvelle étude : poutre de 4 m sur deux appuis.'); };
  $('#selCasType').onchange = e => { const k = e.target.value; if (k) { chargerEtat(CAS_TYPES[k]()); e.target.value = ''; } };
  $('#bOuvrir').onclick = () => $('#fichierOuvrir').click();
  $('#fichierOuvrir').onchange = e => { if (e.target.files[0]) ouvrirFichier(e.target.files[0]); e.target.value = ''; };
  $('#bEnregistrer').onclick = enregistrer;
  $('#bAnnuler').onclick = annuler; $('#bRetablir').onclick = retablir;
  $('#bImprimer').onclick = imprimer;

  $('#iTitre').onchange = e => { etat.titre = e.target.value; engager(); };
  $('#iAuteur').onchange = e => { etat.auteur = e.target.value; engager(); };
  $('#iL').onchange = e => {
    const L = num(e.target.value, etat.L);
    if (L > 0) etat.L = L; e.target.value = String(etat.L).replace('.', ',');
    modifie(); afficherTableAppuis(); afficherTableCharges();
  };
  $('#selMat').onchange = e => {
    const c = e.target.value;
    etat.materiau = c === 'perso' ? Object.assign({}, etat.materiau, { code: 'perso' }) : Object.assign({ code: c }, matUI(c));
    afficherFormulaires(); modifie();
  };
  [['#iE', 'E'], ['#iRho', 'rho'], ['#iFk', 'fk'], ['#iKmod', 'kmod'], ['#iGam', 'gammaM']].forEach(([s, k]) =>
    $(s).onchange = e => { etat.materiau[k] = num(e.target.value, etat.materiau[k]); modifie(); });
  $('#iG').onchange = e => { etat.g = num(e.target.value, etat.g); modifie(); };
  $('#selSec').onchange = e => {
    const t = e.target.value;
    etat.section.type = t;
    if (t === 'IPE' || t === 'HEA') etat.section.nom = t + ' 160';
    afficherChampsSection(); modifie();
  };
  $('#aType').onchange = majFormAjoutAppui;
  $('#bAjAppui').onclick = () => {
    const t = $('#aType').value, x = num($('#aX').value, NaN);
    if (!(x >= 0 && x <= etat.L)) { alert('L\'abscisse doit être comprise entre 0 et L = ' + frX(etat.L) + ' m.'); return; }
    etat.appuis.push({ id: nouvelId(), type: t, x, valeur: num($('#aVal').value, 0) });
    afficherTableAppuis(); modifie();
  };
  $('#cType').onchange = majFormAjoutCharge;
  $('#bAjCharge').onclick = () => {
    const t = $('#cType').value, cat = $('#cCat').value, v1 = num($('#cV1').value, NaN);
    if (!isFinite(v1)) { alert('Intensité invalide.'); return; }
    if (t === 'force' || t === 'couple') {
      const x = num($('#cX').value, NaN);
      if (!(x >= 0 && x <= etat.L)) { alert('L\'abscisse doit être comprise entre 0 et L = ' + frX(etat.L) + ' m.'); return; }
      etat.charges.push(t === 'force' ? { id: nouvelId(), type: t, cat, x, F: v1 } : { id: nouvelId(), type: t, cat, x, M: v1 });
    } else {
      const x1 = num($('#cX1').value, NaN), x2 = num($('#cX2').value, NaN);
      if (!(x1 >= 0 && x2 <= etat.L && x2 > x1)) { alert('Il faut 0 ≤ x1 < x2 ≤ L = ' + frX(etat.L) + ' m.'); return; }
      const v2 = t === 'lineaire' ? num($('#cV2').value, v1) : v1;
      etat.charges.push({ id: nouvelId(), type: t, cat, x1, x2, p1: v1, p2: v2 });
    }
    afficherTableCharges(); modifie();
  };
  $('#cPP').onchange = e => { etat.poidsPropre = e.target.checked; modifie(); };
  $('#selFleche').onchange = e => { etat.limiteFleche = +e.target.value; engager(); afficherVerifs(); };
  $('#selCas').onchange = e => { etat.cas = e.target.value; engager(); afficherResultats(); };
  $('#cJeCalcule').onchange = () => { solutionVisible = false; afficherResultats(); };
  $('#bComparer').onclick = () => { solutionVisible = true; afficherResultats(); };
  $('#bMasquer').onclick = () => { solutionVisible = false; afficherResultats(); };

  $$('.outil').forEach(b => b.onclick = () => activerOutil(b.dataset.outil));
  ['#oVal', '#oCat'].forEach(s => $(s).addEventListener('change', majEtatOutil));
  const sch = $('#svgSchema');
  sch.addEventListener('click', clicSchema);
  sch.addEventListener('mousemove', survolSchema);
  sch.style.cursor = 'crosshair';
  ['#dT', '#dM', '#dV', '#dTh', '#dS'].forEach(s => $(s).addEventListener('mousemove', survolDiagramme));
  $('#rAmp').oninput = () => dessinerDeformee();
  $('#bAnimer').onclick = animer;
  $('#bXlec').onclick = () => { const x = num($('#iXlec').value, NaN); if (isFinite(x)) guides(x); };
  $('#iXlec').addEventListener('keydown', e => { if (e.key === 'Enter') $('#bXlec').click(); });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && outil) desactiverOutil('Outil arrêté (Échap).');
    const champ = /INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName);
    if ((e.ctrlKey || e.metaKey) && !champ && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? retablir() : annuler(); }
    if ((e.ctrlKey || e.metaKey) && !champ && e.key.toLowerCase() === 'y') { e.preventDefault(); retablir(); }
  });
}

/* ================= démarrage ================= */
initSelects();
brancher();
majFormAjoutAppui();
majFormAjoutCharge();
chargerEtat(CAS_TYPES.solive());
