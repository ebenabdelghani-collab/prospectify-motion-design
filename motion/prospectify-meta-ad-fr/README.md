# Prospectify — publicité Meta FR (conversion)

**`exports/prospectify_fr_meta_conversion_ad_v1.mp4`** — 1080 × 1920 (9:16) · 30 i/s · H.264 + AAC 48 kHz · **29,50 s** · −14 LUFS.

Objectif : une seule action, *trouver ses 10 premiers prospects gratuitement* sur prospectify.net.
Arc : la frustration (0 client) → le vrai problème (trouver des clients) → la méthode (ville + commerce)
→ ce qu'on obtient (commerces sans site web + score) → ce qu'on en fait (proposer une démo) → l'offre.

## Livrables

| Fichier | Contenu |
| --- | --- |
| `exports/prospectify_fr_meta_conversion_ad_v1.mp4` | la publicité finale |
| `exports/prospectify_fr_meta_conversion_ad_v1.srt` | sous-titres (17 blocs, synchronisés sur la voix) |
| `exports/prospectify_fr_meta_thumbnail.jpg` | miniature (accroche « MAIS 0 CLIENT ? ») ; variante `…_thumbnail_offre.jpg` |
| `exports/script_horodate.md` | script final horodaté, voix + titres à l'écran |
| `exports/qa_report.json`, `exports/qa_contact_sheet.jpg` | contrôle qualité automatique + planche 1 image/s |
| `public/audio/vo.wav` | la voix ElevenLabs (prise originale : `vo_elevenlabs_original.mp3`) |
| `public/audio/mix.wav` | le mix final (voix + musique + effets) |

## Refaire le film

```bash
# node_modules : lien vers ../prospectify-master-ad/node_modules (mêmes versions Remotion 4.0.532).
# Sur une autre machine : rm node_modules && npm install
python3 scripts/build_timeline.py                 # words.json → src/data/timeline.json
/root/venvs/cb/bin/python scripts/build_audio.py  # → public/audio/mix.wav
node scripts/render.mjs exports/prospectify_fr_meta_conversion_ad_v1.mp4
python3 scripts/make_srt.py                       # → .srt + script horodaté
bash scripts/qa.sh                                # → qa_report.json + planche
npx remotion studio src/index.ts                  # aperçu interactif
```

Le Python des étapes audio/QA a besoin de `numpy scipy soundfile faster-whisper` (venv `/root/venvs/cb`).

## Modifier

- **Un texte à l'écran** → `HEAD` dans `scripts/build_timeline.py` (lignes, mots en accent, mot de la voix qui le déclenche).
- **Un sous-titre** → `SCRIPT` dans le même fichier (un élément = un bloc de 2 lignes max). Il doit rester fidèle à ce que dit la voix.
- **Les commerces de démo** → `src/data/leads.ts` (noms fictifs A/B/C, scores d'exemple).
- **Une couleur / la typo / les zones** → `src/styles/tokens.ts` (`Z` = bandes titre / visuel / sous-titres).
- **Un timing** → tous les repères viennent des mots de la voix (`at('ville')`, `at('score')`…). Changer la voix =
  remplacer `public/audio/vo.wav`, retranscrire (`frwords.py` → `src/data/words.json`), puis relancer la chaîne : tout se recale.
- **Un effet sonore** → liste `SFX` dans `scripts/build_audio.py` (chaque effet = une action à l'écran).

## Structure

```
src/compositions/MetaAd.tsx      composition (<Sequence> par scène, <Audio>)
src/scenes/Scenes.tsx            HookScene · ProblemScene · SearchAnimation · DemoScene · CTAEndCard
src/components/                  AnimatedText · SubtitleRenderer · CursorAnimation · SearchInterface
                                 LeadCard + LeadScoreHighlight · WebsiteMockup · Basics (logo, fond, icônes)
src/animations/ease.ts           courbes, rampes, ressort amorti (spring), images-clés
src/styles/tokens.ts             couleurs Prospectify, Geist, zones sûres
src/data/                        words.json (Whisper) · timeline.json (généré) · leads.ts
scripts/                         build_timeline · build_audio · sonic (synthèse des effets) · render · stills · make_srt · qa
```

Les effets sonores sont mixés hors ligne en Python (ducking, réverbération, limiteur) plutôt que posés en
`<Audio>` dans Remotion : le résultat est identique à chaque export et la loudness est maîtrisée.

## Choix et honnêteté produit

- **Interface recréée** : l'écran de recherche, les cartes et la démo de site sont des visualisations
  illustratives, marquées « Interface illustrative », « Données d'exemple » et « Démo illustrative ».
  Les commerces (Atelier / Studio / Maison Barbier A·B·C) sont fictifs ; les scores sont des exemples.
- **Aucune promesse** de clients, de revenus, de site construit ou vendu automatiquement : la voix dit
  « je peux ensuite leur proposer une démo de site créée avec l'IA » — c'est l'utilisateur qui la crée.
- **Couleurs** : celles du logo et de prospectify.net (`#09090b`, `#f42562 → #ff3b5f → #ff5a45`), pas la
  palette indigo de secours du brief, puisque la charte officielle existe. Typo unique : Geist (OFL).
- **Logo** : PNG officiel, jamais redessiné.
- **Voix** : ElevenLabs, voix masculine FR conçue pour ce film (`eleven_ttv_v3`), synthétique — aucune
  personne réelle. Un seul appel de design (3 prises du script complet) ; prise retenue : la 3ᵉ,
  la seule transcrite sans erreur et la plus expressive (écart mélodique 337 cents, F0 médiane 119 Hz).
  **Non accélérée.** « Prospectify » a été écrit « Prospektifaille » dans le texte envoyé pour forcer la prononciation.

## Crédits (à reprendre dans le texte de la pub si possible)

- Musique : **« Dream keeper » — zero-project**, CC BY 3.0 — https://www.jamendo.com/track/2193528 (extrait de 34 s).
- Photos : CC0 via Openverse — *Coffee Hot* (Nathan Dumlao, StockSnap), *Barbershop Scissors* (Nick Demou),
  *Man getting haircut barber*, *Free retro barbershop chair* (rawpixel).
- Effets sonores : synthétisés (`scripts/sonic.py`), aucun sample tiers.

## Rapport QA

Contrôles automatiques (`scripts/qa.py`, sur le MP4 exporté) — **9/9 OK** :

| Contrôle | Résultat |
| --- | --- |
| Résolution · i/s · codecs | 1080 × 1920 · 30/1 · H.264 yuv420p + AAC 48 kHz stéréo |
| Durée | 29,50 s (cible 25–30 s) |
| Audio présent | oui |
| Images noires | aucune (blackdetect) |
| Loudness · crête | −14,04 LUFS · −1,40 dBTP |
| Voix = script | 100 % des mots (Whisper sur le **mix final**, musique comprise) |
| « Prospectify » entendu | 2 fois sur 2 |

Contrôles visuels (planche 1 image/s + 20 images de contrôle) :

- Titres dans y 290–470, visuels dans y 500–1080, sous-titres dans y 1100–1240 : rien n'est placé dans
  les 14 % du haut ni les 35 % du bas (interface des Reels), marges latérales ≥ 70 px. Aucun texte sur un visuel.
- Aucun débordement : la taille des titres s'adapte à la ligne la plus longue.
- Orthographe relue sur tous les textes affichés (titres, sous-titres, interface, CTA).
- Les 10 prospects gratuits sont dits, écrits en grand et repris dans les sous-titres ; URL `prospectify.net`.
- Aucune fonctionnalité au-delà de : ville + catégorie → commerces sans site web → score de priorité → sélection.

Limites :

- **Je ne peux pas écouter** : la justesse du ton, le naturel et la prononciation sont évalués par mesure
  (transcription, hauteur, dynamique), pas à l'oreille. À valider à l'écoute avant diffusion.
- La musique est en CC BY 3.0 : l'attribution est requise (voir *Crédits*).
