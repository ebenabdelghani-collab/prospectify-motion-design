# Prospectify × Whop — Recherche affiliés (état des lieux vérifié)

_Dernière mise à jour : 2026-10-10. Sources : docs officielles Whop + blogs tiers (marqués comme tels)._

> ⚠️ **Limite de cette session** : elle n'est **pas connectée à ton Chrome**. Je n'ai donc **pas pu entrer dans ton compte Whop Prospectify** ni lire tes réglages réels (commissions actives, listing marketplace, assets). Tout ce qui suit vient de la **documentation publique Whop** et de recherches web. Les points marqués « À VÉRIFIER DANS TON COMPTE » doivent être confirmés par toi dans le dashboard connecté.

---

## 1. Le point le plus important : l'attribution (ton inquiétude était justifiée)

**Question posée :** un visiteur arrive via un lien affilié → s'inscrit aux 10 leads gratuits sur prospectify.net → achète plus tard un abonnement via **votre checkout Stripe existant**. Whop attribue-t-il la vente à l'affilié ?

**Réponse vérifiée (docs développeur Whop) : NON, pas automatiquement.**

- Le tracking affilié de Whop repose sur un **lien Whop** (`?a=<username>`) et un **cookie Whop** (fenêtre d'attribution **30 jours** par défaut). _« Checkout configurations attribute sales automatically when referral cookies are set »_ → l'attribution dépend d'un **checkout Whop**.
- _« There is no dedicated `affiliate.*` webhook in v1, and the public `payment` schema doesn't expose affiliate linkage. »_
- Un **achat via votre propre Stripe sur prospectify.net n'est pas vu par Whop.** Rien dans la doc ne confirme qu'un checkout externe soit attribué.

**Conséquence concrète :** si tu lances des affiliés Whop **avant** de régler l'attribution, les créateurs enverront du trafic, les gens achèteront sur ton Stripe… et **personne ne sera crédité ni payé**. C'est le risque n°1 à régler en premier.

**Les deux voies possibles (à décider) :**
1. **Vendre l'abonnement Prospectify VIA Whop checkout** (au moins pour le trafic affilié). Whop gère alors tracking + commissions récurrentes nativement. ✅ Le plus simple/fiable. ⚠️ Implique un 2ᵉ chemin de paiement → **les abonnés Stripe existants ne doivent pas être touchés** (contrainte respectée : on n'ajoute Whop qu'en parallèle, on ne migre personne).
2. **Garder Stripe + tracking maison** : capter le code affilié au clic et le transmettre au checkout Stripe (`client_reference_id` / `session.metadata` + le stocker dans la **metadata de l'abonnement** pour les renouvellements), puis réconcilier avec Whop. ⚠️ Développement custom, et rien ne garantit que Whop lira cette attribution externe pour payer les commissions — à confirmer avec le support Whop. _(Source du pattern : guides Stripe/Tapfiliate/DEV — pas une confirmation Whop.)_

> **Recommandation : avant toute promo affiliée, trancher ce point et le tester avec un achat réel de bout en bout.** Ne présume pas que Whop suit les ventes Stripe.

---

## 2. Réglages affiliés Whop (docs officielles — à confirmer dans ton compte)

Dashboard → sélectionner le whop → menu **Marketing** → **Affiliates**.

| Réglage | Ce que dit la doc | Statut |
|---|---|---|
| **Taux global** | S'applique à tout utilisateur qui réfère. **Défaut 30 %**, ajustable à n'importe quel %. | Vérifié (doc) |
| **Taux membre** | Pour les membres existants qui réfèrent (ex. 50 % membre vs 30 % global). Si 0 %, ils touchent le global. | Vérifié (doc) |
| **Taux custom (partenariat)** | « Set an affiliate commission for a specific user » via **email du compte Whop**. Choix **Percent/Fixed** et **Recurring (ongoing)** ou **First payment**. Puis **Invite**. | Vérifié (doc) |
| **Commissions récurrentes** | ⚠️ **Disponibles uniquement via un taux custom** (option « Recurring payments »). La doc **ne dit pas** que le taux global/membre est récurrent. | Vérifié (doc) — **nuance clé** |
| **Délai de paiement** | **30 jours** d'attente entre l'achat référé et le paiement de la commission. | Vérifié (doc) |
| **Clawback** | Remboursement dans la fenêtre → commission **reprise automatiquement**. | Vérifié (doc) |

➡️ **Attention à la promesse « 30 % récurrent »** : d'après la doc, le récurrent passe par des **invitations custom par email**, pas par le taux global par défaut. Pour promettre du 30 % récurrent à tes créateurs, prévois soit des invitations custom, soit vérifie dans ton dashboard si le global peut être mis en récurrent.

---

## 3. Marketplace d'affiliés / découverte inbound

- Aucune **liste officielle unique** de critères d'éligibilité au marketplace n'a été trouvée. Les **Earnings Terms** officiels exigent : **18 ans+**, compte Whop **en règle**, et **chaque programme a ses propres conditions**. (Un vieux blog Whop mentionne 13 ans + interdiction de la pub payante — **en contradiction** avec les terms actuels → se fier aux Earnings Terms.)
- **Join libre vs approbation** : sources contradictoires (certains disent « sans approbation », mais l'existence d'un champ « requires application » suggère que certains programmes exigent une candidature). **À VÉRIFIER DANS TON COMPTE** : peux-tu lister Prospectify dans le marketplace public, et veux-tu « join libre » ou « sur candidature » ?
- **Assets promo / guidelines affiliés** : non documentés publiquement. **À VÉRIFIER DANS TON COMPTE**.
- **Reporting** : pas de webhook affilié v1 ; suivi en **pollant `affiliates.overrides.list`** et en comparant `total_referral_earnings_usd`. Un dashboard existe côté UI (à confirmer).

---

## 4. Content Rewards & Bounties (pour plus tard — ne rien activer/financer)

- **Content Rewards** : marketplace de campagnes **pay-per-view**. Tu fixes un payout / 1 000 vues + un budget ; les créateurs postent sur **leurs** comptes ; tu approuves ; Whop paie selon les vues. Deux types : clipping de long-form, et UGC original. Tarifs tiers observés ~0,20–6 $/1 000 vues (≈1 $ en moyenne) — **chiffres de blogs, non officiels**.
- **Bounties** : tu paies des utilisateurs pour des tâches (ex. promo). Moins de détail officiel.
- ⚠️ **Décision founder requise avant tout budget.** Pour l'instant : **ne pas activer de campagne payante, ne pas ajouter de fonds.** Utile potentiellement plus tard pour amorcer du volume de clips une fois l'attribution réglée.

---

## 5. Stratégie la plus rapide et réaliste (recommandation)

**Ordre proposé :**
1. **Régler l'attribution AVANT tout** (section 1). C'est le blocage structurel. Test d'achat réel de bout en bout.
2. **Configurer proprement les commissions** : décider global vs custom-récurrent, et aligner la promesse « 30 % récurrent » avec ce que Whop fait vraiment (section 2).
3. **Onboarding créateur sans friction** : accès produit gratuit pour tester (les **10 leads gratuits sans CB** existent déjà → parfait comme essai), + invitation affilié custom (email) pour garantir le récurrent.
4. **Recrutement outbound ciblé** (voir CSV) en parallèle de l'**inbound Whop** (listing marketplace une fois l'attribution OK).
5. **Content Rewards / Bounties** seulement plus tard, après validation de l'attribution et d'un premier ROI.

**Ne pas faire sans ton accord explicite** (rappel de tes consignes) : publier un produit, changer les prix, activer des offres publiques, modifier les commissions, toucher au paiement, financer une campagne, ou contacter/DM/suivre un créateur.

---

## 6. Ce que je n'ai PAS pu vérifier (à faire depuis ton Chrome connecté)
- [ ] Réglages réels de ton compte Whop Prospectify (commissions actives, récurrent on/off).
- [ ] Si Prospectify **peut** et **est** listé dans le marketplace public, et le mode join (libre/candidature).
- [ ] Les assets promo / guidelines affiliés disponibles.
- [ ] **Le test d'attribution réel** lien affilié → inscription prospectify.net → achat Stripe.
- [ ] Confirmation support Whop : un checkout Stripe externe peut-il être crédité à un affilié Whop ?

---

### Sources
- Whop Docs — Affiliate Program : https://docs.whop.com/manage-your-business/growth-marketing/affiliate-program
- Whop Docs — Affiliates (developer/attribution) : https://docs.whop.com/developer/guides/affiliates
- Whop Docs — Content Rewards : https://docs.whop.com/memberships-and-access/third-party-apps/content-rewards
- Whop Earnings Terms : https://whop.com/earnings-terms/
- Stripe attribution pattern (tiers, non-Whop) : https://dev.to/mihirkanzariya/passing-affiliate-attribution-through-stripe-checkout-so-recurring-commissions-still-work-1km6 · https://tapfiliate.com/blog/how-to-set-up-stripe-affiliate-tracking_ag/
