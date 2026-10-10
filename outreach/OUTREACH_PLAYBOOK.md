# Prospectify — Playbook recrutement créateurs (outbound + Whop inbound)

_Objet : te permettre de qualifier vite + lancer un outreach propre, même avant que je pilote ton Chrome. Aucune donnée inventée : les cases « à vérifier » se remplissent en regardant le profil réel._

---

## A. Qualifier un créateur en ~5 minutes (à faire sur profil réel)

Pour chaque lead du CSV, ouvre le profil connecté et note :

1. **Taille** — abonnés dans la fourchette cible **2 000–50 000** ? (hors fourchette = déprioriser)
2. **Activité récente** — a posté dans les **30 derniers jours** ? Rythme régulier ?
3. **Vues constantes** — les vues récentes sont-elles stables (pas une seule vidéo virale isolée) ?
4. **Audience US** — bio/langue/commentaires/tag de lieu suggèrent une audience **américaine** ? (sinon disqualifié, marché = US only)
5. **Intention commerciale des commentaires** — des gens demandent « comment tu fais / quel outil / tu formes ? » = audience acheteuse. Que des emojis = faible.
6. **Fit Prospectify** — son audience **construit/vend des sites** ou **cherche des clients** ? (cœur de cible) ou juste « curieux d'IA » ? (fit faible)
7. **Contact pro public** — email en bio / page contact / « business inquiries » ? Note la **source**. (Pas d'email trouvé = DM only, ne pas deviner.)

➡️ Reporte ces 7 points dans les colonnes du CSV + mets à jour le `qualification_score`.

## B. Grille de score /100 (transparente)

| Critère | Points | Comment noter |
|---|---|---|
| Fit audience (vend des sites / cherche clients) | 30 | 30 = exactement l'ICP ; 15 = adjacent ; 0 = hors-sujet |
| Audience US | 20 | 20 = clairement US ; 10 = mixte ; 0 = non-US / inconnu |
| Taille dans la fourchette 2–50k | 15 | 15 = oui ; 7 = un peu au-dessus ; 0 = très hors range |
| Activité + régularité (30 j) | 15 | 15 = actif régulier ; 0 = inactif |
| Vues constantes | 10 | 10 = stable ; 0 = un seul pic |
| Intention commerciale des commentaires | 10 | 10 = questions d'achat ; 0 = aucune |
| **Bonus** : déjà affilié d'outils (ex. ref Lovable) | +5 | signal d'adoption affilié |

**Seuils** : ≥75 = contacter en priorité · 55–74 = garder, vérifier · <55 = déprioriser.
⚠️ Tout critère non vérifiable reste **à 0 et flaggé**, jamais rempli au jugé.

---

## C. Variantes de messages (tonalité founder, US English naturel)

> Règles : référencer un post **réel et vérifié**, une seule idée, un seul CTA, zéro jargon « mass outreach ». Ne jamais promettre un paiement Whop « opérationnel » tant que non vérifié. Ne jamais citer de chiffres inventés (users, revenus, résultats).

### DM Instagram — V1 (direct, Priorité A : vend des sites IA)
> Hey [prénom] — your video on [sujet exact, ex. selling Lovable sites to local businesses] is spot on. We built Prospectify for exactly that: it finds the local businesses worth pitching and preps the outreach + the AI build-prompt. "You build the site, Prospectify finds the client." Want free access to try it? If it's a fit, we're setting up a creator affiliate deal too.

### DM Instagram — V2 (soft, curiosité)
> Hey [prénom], quick one — your audience is basically who we built Prospectify for. It does the client-finding half (local businesses worth pitching + ready-to-send outreach). Mind if I send you a free login to poke at it? No ask attached.

### DM Instagram — V3 (valeur d'abord, créateur)
> Hey [prénom] — love how practical your [content type] is. I'd love to just give you free access to Prospectify to see if it's useful for your audience (it finds local-biz leads + preps outreach). If you end up liking it, we have an affiliate program in the works. Either way, no pressure.

### Email (quand email pro public dispo)
> **Objet :** Free access to Prospectify for [channel/brand]
>
> Hi [prénom],
>
> I'm [founder] from Prospectify. I came across your [specific video/post — titre réel] and it lines up exactly with what we do: Prospectify finds the local businesses worth pitching, then preps the personalized outreach (WhatsApp/email/phone script) and the AI build-prompt for a premium site. Short version: "You build the website, Prospectify finds the client."
>
> I'd like to give you free access to test it — the product already includes 10 free leads, no credit card. If it's genuinely useful for your audience, we're launching a creator affiliate program (proposed 30% recurring on referred paid subscriptions).
>
> Open to a quick look?
>
> [founder], Prospectify — [lien]

*(Ces textes sont des brouillons. Rien n'est envoyé sans ton accord explicite.)*

---

## D. Séquence d'outreach (manuelle, approuvée par toi)

1. **J0** — suivre le créateur + liker/commenter sincèrement 1 post récent (chaleur, pas de pitch).
2. **J1–2** — DM V1/V2 selon le profil. **1 relance max** à **J+5** si pas de réponse (V3, angle « free access »).
3. **Email** en parallèle **seulement** si email pro public trouvé (source notée).
4. **Réponse positive** → envoyer accès gratuit + (si fit) invitation affilié custom Whop par email (pour garantir le récurrent, cf. doc Whop §2).
5. **Mettre à jour `contact_status`** à chaque étape (not_contacted → dm_sent → replied → onboarded → affiliate_live).

**Garde-fous** : pas d'automatisation / messagerie de masse, pas de scraping, max 1 relance, tout passe par ta validation.

---

## E. Test d'attribution Whop (à faire AVANT toute promo) — protocole

Objectif : prouver si une vente Stripe sur prospectify.net est créditée à un affilié Whop. (Doc : l'attribution Whop dépend d'un checkout/cookie Whop ; un Stripe externe n'est a priori pas suivi.)

1. Dans Whop, créer un **affilié de test** (ton propre 2ᵉ compte) → récupérer le lien `?a=...`.
2. Naviguer **privé** : cliquer le lien affilié → arriver sur prospectify.net → **s'inscrire aux 10 leads gratuits**.
3. **Acheter un abonnement** via le checkout **Stripe** existant.
4. Dans Whop → programme affilié → vérifier si la commission **apparaît** pour l'affilié de test.
   - **Apparaît** ✅ → l'attribution externe fonctionne (documenter comment).
   - **N'apparaît pas** ❌ (attendu) → il faut : soit vendre le plan **via Whop checkout** pour le trafic affilié, soit passer le code affilié dans la **metadata Stripe** + réconciliation (dev custom), puis **confirmer avec le support Whop** qu'ils peuvent créditer.
5. **Ne rien changer** aux abonnés Stripe existants pendant ce test.

---

## F. Ce qui débloque la suite (de ton côté)
- **Relier Chrome / session locale** → je qualifie les profils + ouvre ton Whop sans rien inventer.
- Décider : plan vendu **via Whop** (tracking natif) vs **Stripe + tracking maison**.
- Valider les messages avant tout envoi.
