/* =====================================================================
   Profilés du commerce et caractéristiques des sections droites
   Module du moteur RDM Lycée (calcul de poutres en flexion plane).
   Unités internes : SI (m, N, Pa, rad, kg/m³).
   ===================================================================== */

/* ------------------------------------------------------------------
   2. PROFILÉS DU COMMERCE
   Dimensions h, b, tw, tf, r (mm) ; A (cm²) ; Iz (cm⁴, axe fort ; noté
   Iy dans les catalogues Eurocode) ; masse (kg/m).
   Source : NF EN 10365 / OTUA « Produits sidérurgiques », reprises dans
   la bibliothèque de RDM 7 (bibli.dat, Y. Debard, contrôle < 0,1 %).
   ------------------------------------------------------------------ */
export const PROFILES = {
  'IPE 80':  [80, 46, 3.8, 5.2, 5, 7.643, 80.14],
  'IPE 100': [100, 55, 4.1, 5.7, 7, 10.32, 171.0],
  'IPE 120': [120, 64, 4.4, 6.3, 7, 13.21, 317.8],
  'IPE 140': [140, 73, 4.7, 6.9, 7, 16.43, 541.2],
  'IPE 160': [160, 82, 5.0, 7.4, 9, 20.09, 869.3],
  'IPE 180': [180, 91, 5.3, 8.0, 9, 23.95, 1317],
  'IPE 200': [200, 100, 5.6, 8.5, 12, 28.48, 1943],
  'IPE 220': [220, 110, 5.9, 9.2, 12, 33.37, 2772],
  'IPE 240': [240, 120, 6.2, 9.8, 15, 39.12, 3892],
  'IPE 270': [270, 135, 6.6, 10.2, 15, 45.95, 5790],
  'IPE 300': [300, 150, 7.1, 10.7, 15, 53.81, 8356],
  'HEA 100': [96, 100, 5.0, 8.0, 12, 21.24, 349.2],
  'HEA 120': [114, 120, 5.0, 8.0, 12, 25.34, 606.2],
  'HEA 140': [133, 140, 5.5, 8.5, 12, 31.42, 1033],
  'HEA 160': [152, 160, 6.0, 9.0, 15, 38.77, 1673],
  'HEA 180': [171, 180, 6.0, 9.5, 15, 45.25, 2510],
  'HEA 200': [190, 200, 6.5, 10.0, 18, 53.83, 3692],
  'HEA 220': [210, 220, 7.0, 11.0, 18, 64.34, 5410],
  'HEA 240': [230, 240, 7.5, 12.0, 21, 76.84, 7763],
  'HEA 260': [250, 260, 7.5, 12.5, 24, 86.82, 10450],
  'HEA 280': [270, 280, 8.0, 13.0, 24, 97.26, 13670],
  'HEA 300': [290, 300, 8.5, 14.0, 27, 112.5, 18260]
};

/* ------------------------------------------------------------------
   3. SECTIONS DROITES
   def = { type, ...dimensions en mm }  →  caractéristiques SI
   { A (m²), Iz (m⁴), vsup, vinf (m, distances aux fibres extrêmes),
     h (m), Wel (m³), description }
   ------------------------------------------------------------------ */
export function section(def) {
  var mm = 1e-3, s = {};
  var t = def.type;
  if (t === 'rect') {
    var b = def.b, h = def.h;
    s.A = b * h; s.Iz = b * h * h * h / 12; s.h = h;
    s.description = 'Rectangle ' + b + ' × ' + h + ' mm (b × h)';
  } else if (t === 'rond') {
    var D = def.D;
    s.A = Math.PI * D * D / 4; s.Iz = Math.PI * Math.pow(D, 4) / 64; s.h = D;
    s.description = 'Rond plein Ø ' + D + ' mm';
  } else if (t === 'rond_creux') {
    var De = def.D, d = def.D - 2 * def.t;
    if (d < 0) throw new Error('Rond creux : l\'épaisseur doit être inférieure au rayon.');
    s.A = Math.PI * (De * De - d * d) / 4;
    s.Iz = Math.PI * (Math.pow(De, 4) - Math.pow(d, 4)) / 64; s.h = De;
    s.description = 'Tube rond Ø ' + De + ' × ' + def.t + ' mm';
  } else if (t === 'rect_creux') {
    var B = def.b, H = def.h, e = def.t;
    if (2 * e >= Math.min(B, H)) throw new Error('Tube rectangulaire : épaisseur trop grande.');
    s.A = B * H - (B - 2 * e) * (H - 2 * e);
    s.Iz = (B * H * H * H - (B - 2 * e) * Math.pow(H - 2 * e, 3)) / 12; s.h = H;
    s.description = 'Tube rectangulaire ' + B + ' × ' + H + ' × ' + e + ' mm (angles vifs)';
  } else if (t === 'I') {
    // I à ailes égales sans congés (paramétré comme dans RDM)
    var Hi = def.h, Bi = def.b, tw = def.tw, tf = def.tf;
    s.A = 2 * Bi * tf + (Hi - 2 * tf) * tw;
    s.Iz = (Bi * Math.pow(Hi, 3) - (Bi - tw) * Math.pow(Hi - 2 * tf, 3)) / 12; s.h = Hi;
    s.description = 'I soudé ' + Hi + ' × ' + Bi + ' (tw ' + tw + ', tf ' + tf + ') mm';
  } else if (t === 'profil') {
    var p = PROFILES[def.nom];
    if (!p) throw new Error('Profilé inconnu : ' + def.nom);
    s.A = p[5] * 100; s.Iz = p[6] * 1e4; s.h = p[0];
    s.description = def.nom + ' (h = ' + p[0] + ' mm, b = ' + p[1] + ' mm)';
    s.profil = { h: p[0], b: p[1], tw: p[2], tf: p[3], r: p[4] };
  } else if (t === 'quelconque') {
    // A en cm², Iz en cm⁴, vsup et vinf en mm
    s.A = def.A * 100; s.Iz = def.Iz * 1e4;
    s.vsup = def.vsup; s.vinf = def.vinf; s.h = def.vsup + def.vinf;
    s.description = 'Section quelconque (A = ' + def.A + ' cm², Iz = ' + def.Iz + ' cm⁴)';
  } else {
    throw new Error('Type de section inconnu : ' + t);
  }
  if (s.vsup === undefined) { s.vsup = s.h / 2; s.vinf = s.h / 2; }
  if (!(s.A > 0) || !(s.Iz > 0)) throw new Error('Section : dimensions invalides.');
  // passage en SI
  var r = {
    A: s.A * mm * mm, Iz: s.Iz * Math.pow(mm, 4), h: s.h * mm,
    vsup: s.vsup * mm, vinf: s.vinf * mm, description: s.description, profil: s.profil
  };
  r.Wel = r.Iz / Math.max(r.vsup, r.vinf);
  return r;
}

