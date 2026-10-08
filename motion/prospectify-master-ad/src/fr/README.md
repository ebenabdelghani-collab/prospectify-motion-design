# Publicité française — `ProspectifyFR`

1080 × 1920 · 30 fps · 1350 images (45,00 s) · H.264 + AAC.

## Rendre

```bash
python3 scripts/fr/build_timeline.py          # words.json → timeline.json (repères + sous-titres)
/root/venvs/cb/bin/python scripts/fr/build_audio.py   # voix + musique + design sonore → public/fr/audio/fr-mix.wav
COMP=ProspectifyFR AUDIO=public/fr/audio/fr-mix.wav CONC=4 \
  node scripts/final/render.mjs 1 renders/prospectify_fr_ad_final.mp4 16 medium
```

## Pièces

| Fichier | Rôle |
| --- | --- |
| `src/fr/Fr.tsx` | la composition : accroche, chuchotement, chaos, déclic, produit, prompt, offre |
| `src/fr/words.json` | horodatage mot à mot de la prise, mesuré par Whisper (`faster-whisper`, FR) |
| `src/fr/timeline.json` | repères d'images + blocs de sous-titres, générés |
| `public/fr/audio/vo.wav` | la voix, prise unique ElevenLabs (`eleven_ttv_v3`, voix conçue FR femme), accélérée à 1,085×, silences resserrés ; la phrase chuchotée est greffée depuis la prise précédente de la même voix (chuchotement réellement non voisé) |
| `public/fr/audio/fr-mix.wav` | le mix final, −14 LUFS, −1,35 dBTP |

L'interface Prospectify (`src/versus/app.tsx`), le téléphone (`src/versus/devices.tsx`), le site
mobile (`src/versus/site.tsx`), le logo PNG officiel et les photos CC0 sont réutilisés tels quels :
rien n'est redessiné ni inventé.

## Script validé (inchangé)

> Tu crées des sites avec l'IA ? Mais trouver quelqu'un à qui les vendre ? Ça, c'est une autre histoire.
> *(chuchoté)* Et si t'en as encore jamais vendu… écoute bien.
> Google Maps. Les avis. Les sites. Instagram. Les contacts. Les messages. Et tu recommences… pour chaque entreprise. Tu passes plus de temps à chercher qu'à construire.
> C'est exactement cette partie que Prospectify simplifie.
> Tu identifies des entreprises, tu comprends pourquoi elles peuvent être intéressantes, tu retrouves les contacts disponibles et tu prépares ton message.
> Et attends… Il prépare même ce que tu pourrais construire pour chaque entreprise. Avec un prompt adapté, prêt à copier dans Lovable.
> Moins de recherche. Plus de prospection. Plus de création. Teste Prospectify : 10 prospects gratuits. Sans carte bancaire.

Les sous-titres affichent ce script ; ils sont alignés sur la prise par `difflib` (les écarts de
transcription sont tous des homophones : « il trouve » / « ils trouvent », « teste » / « test »,
« sans carte » / « cent cartes »).

## Crédits

- Musique : *Dream keeper* — CC BY, via Openverse (`renders/_music/dreamkeeper.wav`).
- Carte : © les contributeurs OpenStreetMap, ODbL.
- Photos : CC0 via Openverse (`public/final/photos/CREDITS.json`).
- Voix : ElevenLabs, voix synthétique conçue pour ce film — aucune personne réelle.
