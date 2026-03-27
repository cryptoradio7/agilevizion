# BRIEF PROJET — agilevizion-2

## Profil : app

## Objectif
Refonte complète du site agilevizion.com en site de vente vertical moderne.
3 pages : landing page (hero + services + simulateur + pourquoi moi), page Cyber GRC, page IA Agentique.
Service Management supprimé.

## Utilisateurs
CISO, Compliance Officers, cabinets de recrutement, ESN, Big 4

## Type
Web statique (HTML/CSS/JS, GitHub Pages)

## MVP — fonctionnalités prioritaires
1. Emplacements vidéo (placeholders 16:9) sur chaque page
2. Contenu de vente percutant (GRC Cyber + IA Agentique)
3. Simulateur de conformité intégré dans la landing page
4. Photo Emmanuel (photo_sans_fonds.png)
5. Bannière cookies / conformité RGPD

## Contraintes techniques
- HTML/CSS/JS statique uniquement (GitHub Pages)
- Pas de framework CSS/JS imposé — choix libre
- Pas de dépendances npm, pas de build step
- i18n FR/EN existant à conserver (adapter les clés)
- Logique simulateur existante à conserver (adapter le style)

## Design
- Moderne, innovant, design NEUF (abandonner totalement la palette navy/gold actuelle)
- Site vertical, page de vente, scroll moderne
- Rechercher les best practices du marché pour sites de conseil/cyber
- UI/UX soignée, ergonomie premium
- Mobile-first responsive
- Animations subtiles au scroll

## SEO
- Meta tags complets (title, description, og:image, twitter card)
- Sitemap XML
- Structured data (JSON-LD : Organization, Service, FAQPage si applicable)

## RGPD
- Bannière cookies obligatoire
- Pas de tracking analytics pour le MVP (à ajouter plus tard)

## Architecture des pages

### Page 1 : Landing page (`index.html`)
Scroll vertical, sections full-width.

1. **Hero** — Accroche forte + sous-titre + placeholder vidéo + 2 CTA (réserver / email)
2. **2 services en colonnes** — Cyber GRC → `/cyber.html` | IA Agentique → `/ia.html`
3. **Simulateur intégré** — Le simulateur de conformité existant, intégré dans la landing
4. **Pourquoi moi** (condensé) — 3 points forts + photo Emmanuel + certifs clés
5. **CTA final** — "Prêt à échanger ?" + 2 boutons
6. **Footer** — Contact, LinkedIn, mentions légales

### Page 2 : GRC Cybersécurité (`cyber.html`)
Structure "problème → solution" (page de vente verticale) :

1. **Hero** — Accroche choc (amendes, risques) + emplacement vidéo
2. **Le problème** — Pain points prospects : quelles normes, obligatoire vs recommandé, risque financier (chiffres DORA/NIS2/RGPD), risque dirigeants
3. **La solution** — Audit et mise en conformité structurés
4. **L'approche** — 3 étapes : Diagnostic → Audit terrain → Feuille de route
5. **Les livrables** — Grille d'audit, rapport exécutif, feuille de route, PV, modèles, infographie
6. **Normes couvertes** — DORA, NIS 2, RGPD, ISO 27001/27002/27005, CIS, NIST, EBIOS
7. **CTA** — Réserver + email

### Page 3 : IA Agentique (`ia.html`)
Structure "problème → solution → exemple concret" :

1. **Hero** — "Vos équipes perdent du temps sur des tâches que l'IA sait faire" + emplacement vidéo
2. **Le problème** — Chiffres clés : 40% temps sur tâches répétitives (McKinsey 2023), 68% manquent de temps (Microsoft 2024), x3 erreurs sous pression (HBR). Conséquences : délais, erreurs, talents sous-utilisés.
3. **L'employé augmenté** — L'agent IA dédié : Prépare / Produit / Vérifie / Apprend. Le collaborateur reste aux commandes.
4. **Exemple concret : Audit GRC automatisé** — Workflow :
   - Phase 1 Sourcing : l'agent source les normes, constitue le corpus, vérifie selon 7 critères qualité
   - Phase 2 Production : l'agent pré-remplit, le consultant revoit
   - Résultats : x4 plus rapide, 3+ normes en parallèle, 0 oubli
5. **Applicable à tous les métiers** — Consultant GRC, Développeur, Juriste, Comptable, RH, Commercial, Direction
6. **Notre approche** — 3 étapes : Diagnostic (1-2j) → Construction (1-3 sem) → Déploiement (continu)
7. **Résultats** — x2 à x4 plus rapide, -70% temps production documentaire, 0 oubli
8. **CTA** — Réserver + email

## Sources de contenu
- Site actuel : `~/Bureau/APPS/AGILEVIZION/` (contenu GRC cyber, simulateur, pourquoi moi)
- PPTX IA employé augmenté : `~/Bureau/agents-ia/docs/commercial/agent-ia_employe-augmente.pptx`
- PPTX IA GRC cyber : `~/Bureau/agents-ia/docs/commercial/agent-ia_grc-cyber.pptx`

## Assets existants
- Code source actuel : `~/Bureau/APPS/AGILEVIZION/`
- Photo Emmanuel : `/home/egx/Bureau/egx/PHOTOS/photo_sans_fonds.png`
- Logo : `~/Bureau/APPS/AGILEVIZION/images/logo-dark-bg.svg`
- Simulateur JS : `~/Bureau/APPS/AGILEVIZION/js/simulator.js`
- i18n : `~/Bureau/APPS/AGILEVIZION/js/i18n.js` + `~/Bureau/APPS/AGILEVIZION/lang/`

## Fichiers à supprimer (par rapport au site actuel)
- pages_specs/service-management.html
- pages_specs/why-me.html (contenu intégré dans landing)
- pages_specs/simulator.html (intégré dans landing)

## Répertoire
`~/Bureau/APPS/agilevizion-2`

## Déploiement
Local uniquement

## Prochaine étape
Architecture (skill architecte)
