// =====================================================================
// Construction de dist/index.html : un seul fichier autonome, hors ligne.
//  1. regroupe les modules ES de src/moteur/ dans une fonction qui
//     définit l'objet global MoteurRDM (aucune dépendance externe) ;
//  2. insère dans src/interface/index.html la feuille de style, le moteur
//     regroupé et le script d'interface.
// dist/ est servable tel quel par GitHub Pages.
// Usage : node scripts/build.mjs   (ou npm run build)
// =====================================================================
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const racine = join(dirname(fileURLToPath(import.meta.url)), '..');
const lire = (...p) => readFileSync(join(racine, ...p), 'utf8');

// Ordre des modules : chaque module ne dépend que des précédents.
const MODULES = ['outils.js', 'materiaux.js', 'sections.js', 'calcul.js', 'index.js'];

/** Regroupe les modules du moteur en un script classique (objet global MoteurRDM). */
export function regrouperMoteur() {
  const corps = MODULES.map(nom => {
    const code = lire('src', 'moteur', nom)
      .replace(/^import[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, '')   // imports internes
      .replace(/^export\s+\{[^}]*\};?\s*$/gm, '')                      // réexportations
      .replace(/^export\s+default\s+\w+;?\s*$/gm, '')                  // export par défaut
      .replace(/^export\s+(const|let|var|function|class)\s/gm, '$1 ');  // export nommé
    if (/^\s*(import|export)\s/m.test(code)) throw new Error(`Syntaxe import/export non gérée dans ${nom}`);
    return `// ---- src/moteur/${nom}\n${code}`;
  }).join('\n');
  return `var MoteurRDM = (function () {\n'use strict';\n${corps}\nreturn MoteurRDM;\n})();\n`;
}

/** Produit le HTML autonome complet. */
export function construire() {
  let html = lire('src', 'interface', 'index.html');
  const css = lire('src', 'interface', 'style.css');
  const app = lire('src', 'interface', 'app.js');
  const moteur = regrouperMoteur();
  for (const [nom, code] of [['moteur', moteur], ['interface', app]]) {
    if (/<\/script/i.test(code)) throw new Error(`« </script » interdit dans le code ${nom}`);
  }
  const remplacer = (motif, par) => {
    if (!motif.test(html)) throw new Error('Marqueur absent de index.html : ' + motif);
    html = html.replace(motif, () => par);
  };
  remplacer(/<link rel="stylesheet" href="style\.css">/, `<style>\n${css}</style>`);
  remplacer(/<script id="moteur" src="moteur\.bundle\.js"><\/script>/, `<script id="moteur">\n${moteur}</script>`);
  remplacer(/<script id="interface" src="app\.js"><\/script>/, `<script id="interface">\n${app}</script>`);
  return html;
}

// Exécution directe : écrit dist/index.html
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const html = construire();
  mkdirSync(join(racine, 'dist'), { recursive: true });
  writeFileSync(join(racine, 'dist', 'index.html'), html);
  writeFileSync(join(racine, 'dist', '.nojekyll'), '');
  console.log(`dist/index.html généré (${(html.length / 1024).toFixed(0)} Ko, autonome, hors ligne)`);
}
