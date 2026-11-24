/* =====================================================================
   Matériaux — caractéristiques mécaniques (sources normatives citées)
   Module du moteur RDM Lycée (calcul de poutres en flexion plane).
   Unités internes : SI (m, N, Pa, rad, kg/m³).
   ===================================================================== */

/* ------------------------------------------------------------------
   1. MATÉRIAUX
   E, rho : valeurs moyennes (calcul des déplacements).
   fk : résistance caractéristique en flexion (Pa).
   kmod, gammaM : coefficients pour la résistance de calcul
                  fd = kmod·fk/γM (kmod = 1 pour les matériaux non bois).
   ------------------------------------------------------------------ */
export const MATERIAUX = {
  S235: {
    nom: 'Acier S235', E: 210000e6, rho: 7850, fk: 235e6, kmod: 1, gammaM: 1.0,
    nomResistance: 'fy', indicatif: false,
    // E = 210 000 MPa : NF EN 1993-1-1 §3.2.6 ; fy = 235 MPa (t ≤ 40 mm) :
    // NF EN 1993-1-1 tableau 3.1 ; γM0 = 1,0 : NF EN 1993-1-1/NA ;
    // ρ = 7850 kg/m³ : NF EN 1991-1-1 annexe A.
    source: 'NF EN 1993-1-1 (§3.2.6, tab. 3.1, γM0 = 1,0) ; ρ : NF EN 1991-1-1 annexe A'
  },
  C24: {
    nom: 'Bois massif C24', E: 11000e6, rho: 420, fk: 24e6, kmod: 0.8, gammaM: 1.3,
    nomResistance: 'fm,k', indicatif: false,
    // E0,mean = 11 000 MPa, fm,k = 24 MPa, ρmean = 420 kg/m³ : NF EN 338:2016 tab. 1 ;
    // kmod = 0,8 (classe de service 1 ou 2, charge de moyenne durée) : NF EN 1995-1-1 tab. 3.1 ;
    // γM = 1,3 (bois massif) : NF EN 1995-1-1 tab. 2.3.
    source: 'NF EN 338 (tab. 1) ; kmod et γM : NF EN 1995-1-1 (tab. 3.1 et 2.3)'
  },
  GL24h: {
    nom: 'Lamellé-collé GL24h', E: 11500e6, rho: 420, fk: 24e6, kmod: 0.8, gammaM: 1.25,
    nomResistance: 'fm,g,k', indicatif: false,
    // E0,g,mean = 11 500 MPa, fm,g,k = 24 MPa, ρg,mean = 420 kg/m³ : NF EN 14080:2013 tab. 5 ;
    // γM = 1,25 (lamellé-collé) : NF EN 1995-1-1 tab. 2.3.
    source: 'NF EN 14080 (tab. 5) ; kmod et γM : NF EN 1995-1-1'
  },
  PP: {
    nom: 'Panneau de particules P5 (16 mm)', E: 2900e6, rho: 650, fk: 12.5e6, kmod: 0.65, gammaM: 1.3,
    nomResistance: 'fm,k', indicatif: true,
    // VALEUR INDICATIVE : panneau P4/P5 épaisseur 13–20 mm, flexion à plat,
    // d'après NF EN 12369-1 (tab. 3) ; ρ ≈ 650 kg/m³ (fiches fabricants) ;
    // kmod = 0,65 (P5, classe 1, moyenne durée) : NF EN 1995-1-1 tab. 3.1.
    source: 'NF EN 12369-1 / NF EN 312 — valeur indicative'
  },
  MDF: {
    nom: 'Panneau MDF (16 mm)', E: 2500e6, rho: 750, fk: 18e6, kmod: 0.6, gammaM: 1.3,
    nomResistance: 'fm,k', indicatif: true,
    // VALEUR INDICATIVE : MDF type LA/HLS épaisseur 12–19 mm, d'après
    // NF EN 12369-1 et NF EN 622-5 ; ρ ≈ 750 kg/m³ (fiches fabricants) ;
    // kmod = 0,6 (MDF.LA, classe 1, moyenne durée) : NF EN 1995-1-1 tab. 3.1.
    source: 'NF EN 622-5 / NF EN 12369-1 — valeur indicative'
  },
  ALU: {
    nom: 'Aluminium EN AW-6060 T6', E: 70000e6, rho: 2700, fk: 140e6, kmod: 1, gammaM: 1.1,
    nomResistance: 'f0', indicatif: true,
    // E = 70 000 MPa, ρ = 2700 kg/m³ : NF EN 1999-1-1 §3.2.5 ;
    // f0 = 140 MPa (profilé filé 6060 T6, t ≤ 15 mm) : NF EN 1999-1-1 tab. 3.2b
    // (valeur indicative, dépend de l'alliage et de l'état) ; γM1 = 1,1.
    source: 'NF EN 1999-1-1 (§3.2.5, tab. 3.2b) — f0 indicative'
  },
  C25: {
    nom: 'Béton C25/30 (non armé)', E: 31000e6, rho: 2500, fk: 1.8e6, kmod: 1, gammaM: 1.5,
    nomResistance: 'fctk,0,05', indicatif: false,
    // Ecm = 31 000 MPa, fck = 25 MPa, fctm = 2,6 MPa, fctk,0,05 = 1,8 MPa :
    // NF EN 1992-1-1 tab. 3.1 ; γC = 1,5 : NF EN 1992-1-1 tab. 2.1N ;
    // ρ = 2500 kg/m³ (béton armé) : NF EN 1991-1-1 annexe A.
    // Le béton non armé est limité par sa résistance en TRACTION :
    // la vérification compare σ à fctd = fctk,0,05/γC = 1,2 MPa.
    source: 'NF EN 1992-1-1 (tab. 3.1 et 2.1N) ; ρ : NF EN 1991-1-1 annexe A'
  }
};

