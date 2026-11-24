// =====================================================================
// Vérifie que la page autonome produite par le build embarque bien le
// même moteur que src/moteur/ (mêmes résultats), et qu'elle ne dépend
// d'aucune ressource externe (fonctionnement hors ligne).
// =====================================================================
import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { construire, regrouperMoteur } from '../scripts/build.mjs';
import M from '../src/moteur/index.js';

test('le moteur regroupé donne les mêmes résultats que les modules ES', () => {
  const ctx = {};
  vm.createContext(ctx);
  vm.runInContext(regrouperMoteur(), ctx);
  const B = vm.runInContext('MoteurRDM', ctx);
  assert.equal(B.version, M.version);
  // Exemple 2 du manuel RDM – Flexion (poutre continue, charge trapézoïdale)
  const s = M.section({ type: 'I', h: 120, b: 100, tw: 5, tf: 6 });
  const modele = { L: 4.8, E: 200000e6, Iz: s.Iz, A: s.A, vsup: s.vsup, vinf: s.vinf, rho: 0, g: 9.81,
    appuis: [{ type: 'encastrement', x: 0 }, { type: 'appui', x: 1.2 }, { type: 'appui', x: 3.6 }, { type: 'appui', x: 4.8 }],
    charges: [{ type: 'force', x: 4.2, F: -24000 }, { type: 'repartie', x1: 0, x2: 1.2, p1: -20000, p2: -20000 },
      { type: 'repartie', x1: 1.2, x2: 3.6, p1: -20000, p2: 0 }] };
  const a = M.calculer(modele), b = B.calculer(JSON.parse(JSON.stringify(modele)));
  assert.deepEqual(JSON.parse(JSON.stringify(b.reactions)), JSON.parse(JSON.stringify(a.reactions)));
  assert.deepEqual(JSON.parse(JSON.stringify(b.deplacements)), JSON.parse(JSON.stringify(a.deplacements)));
});

test('la page dist/index.html est autonome (aucune ressource externe)', () => {
  const html = construire();
  assert.match(html, /<script id="moteur">/);
  assert.match(html, /<script id="interface">/);
  assert.doesNotMatch(html, /<script[^>]+src=/i, 'script externe interdit');
  assert.doesNotMatch(html, /<link[^>]+rel="stylesheet"/i, 'feuille de style externe interdite');
  assert.doesNotMatch(html, /(src|href)="https?:\/\//i, 'aucune ressource en ligne');
});
