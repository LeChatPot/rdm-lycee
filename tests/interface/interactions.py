# Tests d'interface (Chrome sans interface) : cas types, outils clic, annuler,
# poutre hypostatique, mode « Je calcule d'abord », compte rendu PDF.
# Prérequis : python3 + playwright (pip install playwright) et Chrome/Chromium.
# Lancement : npm run test:interface  (construit dist/index.html puis le teste)
# Les captures sont écrites dans docs/captures/ (utilisées par le README).
import os, pathlib, shutil, sys
from playwright.sync_api import sync_playwright
racine = pathlib.Path(__file__).resolve().parents[2]
cap = racine / 'docs' / 'captures'
cap.mkdir(parents=True, exist_ok=True)
erreurs = []
echecs = []
def ok(cond, msg):
    print(('OK  ' if cond else 'KO  ') + msg)
    if not cond: echecs.append(msg)
def navigateur(p):
    chrome = os.environ.get('CHROME') or shutil.which('google-chrome') or shutil.which('chromium') or shutil.which('chromium-browser')
    if chrome:
        return p.chromium.launch(executable_path=chrome, args=['--no-sandbox'])
    return p.chromium.launch()  # navigateur fourni par « playwright install chromium »
with sync_playwright() as p:
    nav = navigateur(p)
    page = nav.new_page(viewport={'width': 1500, 'height': 1000})
    page.on('pageerror', lambda e: erreurs.append(str(e)))
    page.goto((racine / 'dist' / 'index.html').as_uri()); page.wait_for_timeout(300)
    page.screenshot(path=str(cap / '01_ecran_principal.png'), full_page=False)
    page.locator('#svgSchema').screenshot(path=str(cap / '02_schema_solive.png'))
    # console
    page.select_option('#selCasType', 'console'); page.wait_for_timeout(200)
    ok('Console' in page.inner_text('#verifs'), 'cas console : vérification de la console')
    page.screenshot(path=str(cap / '03_console.png'), full_page=True)
    # poutre continue
    page.select_option('#selCasType', 'continue'); page.wait_for_timeout(200)
    ok(page.inner_text('#tReactions').count('Appui simple') == 3, 'poutre continue : 3 réactions')
    ok('hyperstatique d\'ordre 1' in page.inner_text('#noteHyper'), 'degré d\'hyperstaticité = 1')
    page.screenshot(path=str(cap / '04_continue.png'), full_page=True)
    # hypostatique : suppression d'appuis
    page.click('#bNouveau'); page.wait_for_timeout(100)
    page.locator('#tAppuis button').first.click(); page.wait_for_timeout(100)
    msg = page.inner_text('#messages')
    ok('peut bouger' in msg, 'message hypostatique : ' + msg.strip()[:90])
    page.locator('#svgSchema').screenshot(path=str(cap / '05_hypostatique.png'))
    # annuler
    page.click('#bAnnuler'); page.wait_for_timeout(100)
    ok(page.inner_text('#messages').strip() == '', 'Annuler rétablit l\'appui supprimé')
    page.click('#bRetablir'); page.wait_for_timeout(100)
    ok('peut bouger' in page.inner_text('#messages'), 'Rétablir refait la suppression')
    page.click('#bAnnuler'); page.wait_for_timeout(100)
    # outil force au clic : x = 1 m sur L = 4 m
    page.click('button[data-outil="force"]')
    ok('Outil actif : Force' in page.inner_text('#etatOutil'), 'état de l\'outil affiché')
    box = page.locator('#svgSchema').bounding_box()
    sx = box['width'] / 1000
    page.mouse.click(box['x'] + (70 + 860 * 0.25) * sx, box['y'] + 160 * sx)
    page.wait_for_timeout(150)
    ok('Force de' in page.inner_text('#etatOutil') and 'désactivé' in page.inner_text('#etatOutil'), 'force ajoutée immédiatement, outil désactivé : ' + page.inner_text('#etatOutil')[:70])
    ok('1,00' in page.inner_html('#tCharges'), 'force visible dans le tableau à x = 1,00 m')
    # répartie en deux clics
    page.click('button[data-outil="repartie"]')
    page.mouse.click(box['x'] + (70 + 860 * 0.5) * sx, box['y'] + 160 * sx)
    ok('FIN' in page.inner_text('#etatOutil'), 'charge répartie : 2e clic demandé explicitement')
    page.mouse.move(box['x'] + (70 + 860 * 0.9) * sx, box['y'] + 160 * sx)
    page.locator('#svgSchema').screenshot(path=str(cap / '06_outil_repartie_en_cours.png'))
    page.mouse.click(box['x'] + (70 + 860 * 0.9) * sx, box['y'] + 160 * sx); page.wait_for_timeout(150)
    ok('2,00 à 3,60' in page.inner_text('#etatOutil'), 'charge répartie ajoutée de 2,00 à 3,60 m')
    # survol d'un diagramme
    b2 = page.locator('#dM').bounding_box()
    page.mouse.move(b2['x'] + b2['width'] * 0.5, b2['y'] + 50)
    ok('x =' in page.inner_text('#lecture'), 'lecture au survol : ' + page.inner_text('#lecture')[:80])
    # mode Je calcule d'abord
    page.select_option('#selCasType', 'solive'); page.wait_for_timeout(150)
    page.check('#cJeCalcule'); page.wait_for_timeout(100)
    ok(page.locator('#zoneResultats').is_hidden(), 'solution masquée en mode « Je calcule d\'abord »')
    ins = page.locator('#tJeCalcule input')
    ins.nth(0).fill('3,1'); ins.nth(1).fill('3,0'); ins.nth(2).fill('3,09')
    page.click('#bComparer'); page.wait_for_timeout(150)
    ok(page.locator('#zoneResultats').is_visible() and '%' in page.inner_text('#tJeCalcule'), 'écarts affichés après comparaison')
    page.locator('#zoneJeCalcule').screenshot(path=str(cap / '07_je_calcule_dabord.png'))
    page.uncheck('#cJeCalcule')
    # animation
    page.click('#bAnimer'); page.wait_for_timeout(500)
    page.locator('#dV').screenshot(path=str(cap / '08_animation_mi_parcours.png'))
    # compte rendu PDF (CSS print)
    page.evaluate("window.print = () => {}")
    page.click('#bImprimer'); page.wait_for_timeout(200)
    page.emulate_media(media='print')
    page.pdf(path=str(cap / '09_compte_rendu.pdf'), format='A4', print_background=True)
    page.screenshot(path=str(cap / '09_compte_rendu_apercu.png'), full_page=True)
    page.emulate_media(media='screen')
    # enregistrement JSON
    with page.expect_download() as dl:
        page.click('#bEnregistrer')
    f = dl.value; f.save_as(str(cap / 'etude_exemple.json'))
    ok(f.suggested_filename.endswith('.json'), 'enregistrement : ' + f.suggested_filename)
    page.click('#bNouveau')
    page.set_input_files('#fichierOuvrir', str(cap / 'etude_exemple.json')); page.wait_for_timeout(300)
    ok(page.input_value('#iTitre').startswith('Solive'), 'réouverture du fichier .json')
    print('erreurs JS :', erreurs)
    nav.close()
if erreurs or echecs:
    print(f'ÉCHEC : {len(echecs)} vérification(s) en échec, {len(erreurs)} erreur(s) JS')
    sys.exit(1)
print('Interface : toutes les vérifications sont conformes.')
