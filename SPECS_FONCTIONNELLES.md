# SPECS FONCTIONNELLES — AgileVizion 2

**Projet :** Refonte site agilevizion.com
**Date :** 2026-03-27
**Auteur :** Business Analyst
**Version :** 1.0

---

## Table des matières

1. [Synthèse du besoin](#1-synthèse-du-besoin)
2. [Utilisateurs cibles](#2-utilisateurs-cibles)
3. [Inventaire des features](#3-inventaire-des-features)
4. [User Stories](#4-user-stories)
5. [Estimation de complexité](#5-estimation-de-complexité)
6. [Annexes](#6-annexes)

---

## 1. Synthèse du besoin

Refonte complète du site agilevizion.com en site de vente vertical moderne.

| Élément | Détail |
|---------|--------|
| **Pages** | 3 : Landing (`index.html`), GRC Cyber (`cyber.html`), IA Agentique (`ia.html`) |
| **Stack** | HTML/CSS/JS statique, GitHub Pages, zéro build |
| **Design** | Neuf (Indigo #4F46E5 / Emerald #10B981), mobile-first, animations scroll |
| **Migrations** | Simulateur compliance + i18n FR/EN depuis site v1 |
| **Supprimé** | Service Management (ITSM), pages séparées Why Me et Simulator |

---

## 2. Utilisateurs cibles

| Persona | Contexte | Besoin principal |
|---------|----------|-----------------|
| **CISO / RSSI** | Responsable sécurité, cherche un prestataire GRC | Comprendre l'offre, évaluer la crédibilité, voir les normes couvertes |
| **Compliance Officer** | Doit se conformer à DORA/NIS2/RGPD | Diagnostic rapide (simulateur), livrables concrets |
| **Cabinet de recrutement** | Cherche un profil GRC/IA pour mission | Voir les compétences, certifications, expérience |
| **ESN / Big 4** | Cherche un sous-traitant spécialisé | Évaluer l'expertise, voir l'approche méthodologique |
| **Dirigeant PME/ETI** | Découvre les obligations réglementaires | Comprendre les risques, estimer l'urgence (simulateur) |

---

## 3. Inventaire des features

### MVP (demandé explicitement dans le BRIEF)

| # | Feature | Page(s) |
|---|---------|---------|
| F01 | Hero avec accroche + placeholders vidéo 16:9 | Toutes |
| F02 | 2 services en colonnes (Cyber + IA) avec liens | Landing |
| F03 | Simulateur de conformité intégré | Landing |
| F04 | Section "Pourquoi moi" avec photo Emmanuel | Landing |
| F05 | CTA final (Calendly + email) | Toutes |
| F06 | Footer (contact, LinkedIn, mentions légales) | Toutes |
| F07 | Page GRC Cyber — structure problème→solution | cyber.html |
| F08 | Page IA Agentique — structure problème→solution→exemple | ia.html |
| F09 | Bannière cookies RGPD | Toutes |
| F10 | i18n FR/EN | Toutes |
| F11 | Responsive mobile-first | Toutes |
| F12 | Animations scroll (Intersection Observer) | Toutes |
| F13 | SEO (meta, OG, JSON-LD, sitemap) | Toutes |
| F14 | Navbar sticky + navigation entre pages | Toutes |

### Features détectées (issues de l'analyse du site v1)

| # | Feature | Justification |
|---|---------|---------------|
| F15 | Génération rapport PDF depuis le simulateur | Existe dans v1, fonctionnalité clé de lead gen |
| F16 | Questions conditionnelles dans le simulateur | Existe dans v1, logique métier à conserver |
| F17 | Badges normes avec statut (obligatoire/recommandé) | Existe dans v1, différenciateur |
| F18 | Intégration Calendly popup (pas embed) | Existe dans v1, décision architecture |

### Suggestions du BA (basées sur la recherche marché)

| # | Feature | Justification | Priorité |
|---|---------|---------------|----------|
| F19 | Section "Trusted by" — logos clients/partenaires | +42% conversion (Baymard Institute). Même 3-4 logos suffisent. | Haute |
| F20 | Badges certifications visibles (ISO 27001, ITIL, etc.) | +48% conversion enterprise combiné avec signaux de confiance. Déjà dans v1. | Haute |
| F21 | FAQ avec accordéons | Lève les objections, SEO bonus (FAQ structured data). Standard sur tous les sites cyber consultants. | Haute |
| F22 | Score visuel simulateur (gauge/indicateurs) | Les outils Cisco, KnowBe4, Kelser utilisent tous un scoring visuel. Le texte seul ne suffit pas. | Moyenne |
| F23 | Section résultats chiffrés / KPI | Crédibilité ("x4 plus rapide", "-70% production doc"). Chiffres déjà dans le BRIEF. | Haute |
| F24 | Accessibilité (a11y) de base | `prefers-reduced-motion`, contraste AA, focus visible, aria-labels. Standard professionnel. | Moyenne |
| F25 | Section dark (contraste) pour schémas techniques | Pattern hybrid clair/sombre utilisé par Vanta, Drata, CrowdStrike. Rompt la monotonie visuelle. | Basse |
| F26 | Bouton "Retour en haut" (scroll-to-top) | Pages longues en scroll vertical, UX standard | Basse |

---

## 4. User Stories

---

### Story #1 — Navbar sticky avec navigation

**En tant que** visiteur
**Je veux** une barre de navigation fixe en haut de l'écran
**Pour** naviguer facilement entre les 3 pages et changer de langue à tout moment

**Critères d'acceptation :**
- [ ] La navbar est fixée en haut (position sticky/fixed) et reste visible au scroll
- [ ] Contient : logo "AgileVizion" (lien vers index.html), liens Cyber/IA, switch FR/EN
- [ ] La navbar ajoute une ombre subtile quand l'utilisateur scrolle (scroll > 50px)
- [ ] Le lien de la page courante est visuellement distingué (couleur/bordure active)
- [ ] Sur mobile : menu hamburger, les liens apparaissent dans un panneau au clic
- [ ] Le switch FR/EN indique la langue active et change la langue sans rechargement de page
- [ ] La navbar a un z-index suffisant pour rester au-dessus de tout contenu

**Edge cases :**
- Si JS désactivé → la navbar reste visible avec les liens fonctionnels (navigation HTML classique)
- Si le menu mobile est ouvert et l'utilisateur clique un lien → le menu se ferme
- Si l'utilisateur change de langue → la page est traduite dynamiquement, l'URL est mise à jour (?lang=fr)
- Si le menu mobile est ouvert et l'utilisateur redimensionne au-dessus du breakpoint → le menu se ferme, les liens s'affichent en horizontal

**Complexité :** M
**Dépendances :** —

---

### Story #2 — Hero Landing Page

**En tant que** visiteur arrivant sur le site
**Je veux** voir immédiatement ce qu'AgileVizion propose et comment le contacter
**Pour** décider en moins de 10 secondes si c'est pertinent pour moi

**Critères d'acceptation :**
- [ ] Titre (h1) avec accroche forte (ex: "Conformité cyber & IA agentique — un consultant, des résultats")
- [ ] Sous-titre explicatif (1-2 phrases max)
- [ ] Placeholder vidéo au ratio 16:9 avec overlay play button
- [ ] 2 boutons CTA côte à côte : "Réserver un appel" (Calendly) et "M'envoyer un email" (mailto)
- [ ] Le hero occupe au minimum 80vh sur desktop
- [ ] Le texte est lisible et bien contrasté (ratio AA minimum)
- [ ] Responsive : sur mobile, les CTA passent en pleine largeur empilés verticalement

**Edge cases :**
- Si Calendly CDN ne charge pas → le bouton "Réserver un appel" ouvre un lien direct vers la page Calendly (fallback)
- Si le placeholder vidéo n'a pas de source → afficher un fond gradient stylisé avec le logo

**Assets visuels :** Placeholder vidéo 16:9 (pas de vidéo réelle pour le MVP)

**Complexité :** M
**Dépendances :** Story #1 (navbar), Story #10 (i18n)

---

### Story #3 — Section 2 services (Landing)

**En tant que** visiteur
**Je veux** voir les 2 domaines d'expertise d'AgileVizion côte à côte
**Pour** choisir rapidement le service qui me concerne

**Critères d'acceptation :**
- [ ] 2 cartes côte à côte : "GRC Cybersécurité" et "IA Agentique"
- [ ] Chaque carte contient : icône, titre, description courte (2-3 lignes), bouton "En savoir plus"
- [ ] Le bouton "En savoir plus" pointe vers cyber.html et ia.html respectivement
- [ ] Hover : effet visuel subtil (scale, shadow ou border)
- [ ] Responsive : sur mobile, les cartes s'empilent verticalement (1 colonne)
- [ ] Chaque carte est dans la classe `.animate-in` (apparition au scroll)

**Edge cases :**
- Si le visiteur est sur un écran très large (>1440px) → les cartes ne dépassent pas une largeur max (max-width)

**Complexité :** S
**Dépendances :** Story #12 (animations scroll)

---

### Story #4 — Simulateur de conformité intégré (Landing)

**En tant que** CISO ou dirigeant
**Je veux** répondre à quelques questions pour savoir quelles normes s'appliquent à mon entreprise
**Pour** connaître mes obligations réglementaires sans consultation préalable

**Critères d'acceptation :**
- [ ] Le simulateur est intégré directement dans la landing page (pas une page séparée)
- [ ] Phase 1 — Diagnostic rapide : 6 questions obligatoires affichées séquentiellement
  - Q1 : Localisation (UE / Clients UE / Hors UE)
  - Q2 : Secteur d'activité (20+ options, regroupées par catégorie NIS2, Finance, Autre)
  - Q3 : Taille (Petite / Moyenne / Grande)
  - Q4 : Données personnelles (Oui/Non)
  - Q5 : Licence financière (Oui/Non)
  - Q6 : Services IT/Cloud (Oui/Non)
- [ ] Phase 2 — Questions conditionnelles : apparaissent selon les réponses de phase 1
  - Q7 : Prestataire TIC pour entités régulées (si services IT + licence financière)
  - Q8 : Hébergement données de santé (si secteur santé)
  - Q9 : Traitement cartes de paiement (si applicable)
  - Q10 : Activité aux USA (Oui/Non) → sous-questions Q10a (certifs US), Q10b (contrats DoD)
  - Q11 : Continuité d'activité (si NIS2/DORA applicable)
- [ ] Bouton "Analyser mon profil" activé uniquement quand les 6 questions obligatoires sont répondues
- [ ] Affichage du profil détecté (Startup 🚀 / PME 🏢 / ETI 🏛️) avec sous-titre
- [ ] Résultats affichés en 2 catégories : Obligatoire (rouge/indigo) et Recommandé (vert/emerald)
- [ ] Chaque norme affiche : nom complet, statut, pourquoi applicable, sanctions, deadline, référence officielle
- [ ] Les 10 normes couvertes : RGPD, DORA, NIS 2, PCI-DSS, HDS, ISO 27001, ISO 20000, SOC 2, ISO 22301, CMMC
- [ ] La logique métier du simulateur v1 est conservée intégralement (algorithme de calcul)

**Edge cases :**
- Si l'utilisateur change une réponse après analyse → les résultats se réinitialisent, bouton "Analyser" réapparaît
- Si localisation "Hors UE" → DORA et NIS2 ne s'appliquent pas, sauf si note d'extraterritorialité NIS2 applicable
- Si NIS2/DORA applicable + pas de plan de continuité → afficher un avertissement spécifique
- Si aucune norme obligatoire détectée → afficher un message positif ("Bonne nouvelle") + recommandations
- Si l'utilisateur ne répond pas aux questions conditionnelles → le calcul utilise les valeurs par défaut

**Assets visuels :** Migré de `~/Bureau/APPS/AGILEVIZION/js/simulator.js`

**Complexité :** XL
**Dépendances :** Story #10 (i18n — toutes les questions/réponses sont traduites)

---

### Story #5 — Génération de rapport PDF (Simulateur)

**En tant que** utilisateur ayant complété le simulateur
**Je veux** télécharger un rapport PDF personnalisé avec mes résultats
**Pour** le partager avec ma direction ou mon équipe compliance

**Critères d'acceptation :**
- [ ] Bouton "Télécharger le rapport" apparaît après l'affichage des résultats
- [ ] Formulaire pré-téléchargement : nom de l'entreprise + email (champs obligatoires)
- [ ] Le rapport contient : en-tête (entreprise, date), profil détecté, normes obligatoires avec détails, normes recommandées, section "Prochaines étapes" avec CTA audit
- [ ] Le rapport est généré côté client (HTML imprimable → window.print)
- [ ] Le rapport s'ouvre dans une nouvelle fenêtre avec styles dédiés (impression)
- [ ] Le rapport inclut le branding AgileVizion (logo, couleurs, coordonnées)

**Edge cases :**
- Si le navigateur bloque les popups → afficher un message d'erreur avec instruction "Autorisez les popups"
- Si l'email est invalide → validation côté client avant génération
- Si les résultats changent entre le calcul et le clic "Télécharger" → régénérer le rapport avec les résultats à jour
- Si impression annulée → la fenêtre reste ouverte, l'utilisateur peut réessayer

**Complexité :** L
**Dépendances :** Story #4 (simulateur)

---

### Story #6 — Section "Pourquoi moi" (Landing)

**En tant que** visiteur
**Je veux** comprendre qui est le consultant et pourquoi lui faire confiance
**Pour** évaluer sa crédibilité avant de le contacter

**Critères d'acceptation :**
- [ ] 3 points forts affichés en colonnes (icône + titre + description courte)
- [ ] Photo d'Emmanuel (`photo_sans_fonds.png`) intégrée, format portrait
- [ ] Liste des certifications clés : ISO 27001, ITIL V4, Prince2, AgilePM, SAFe (avec badges/icônes)
- [ ] Expérience résumée : 20+ ans, triple compétence (Informatique + Droit + MBA)
- [ ] Responsive : sur mobile, les 3 points passent en colonne unique, la photo se repositionne au-dessus ou en dessous
- [ ] La section est dans `.animate-in` (apparition au scroll)

**Edge cases :**
- Si la photo ne charge pas → afficher un placeholder avec les initiales "EG" sur fond indigo
- Si la section est trop longue sur mobile → les certifications s'affichent en tags horizontaux scrollables

**Assets visuels :** `/home/egx/Bureau/egx/PHOTOS/photo_sans_fonds.png`

**Complexité :** M
**Dépendances :** Story #12 (animations)

---

### Story #7 — CTA final + Footer (Landing & toutes pages)

**En tant que** visiteur ayant scrollé jusqu'en bas
**Je veux** un dernier appel à l'action clair et les informations de contact
**Pour** passer à l'action (réserver ou envoyer un email)

**Critères d'acceptation :**
- [ ] Section CTA : titre "Prêt à échanger ?", 2 boutons (Calendly + email), fond contrasté (dark ou indigo)
- [ ] Footer : email (emmanuel@agilevizion.com), téléphone (+352.661.78.08.07), localisation (Luxembourg), lien LinkedIn, copyright
- [ ] Le bouton Calendly ouvre le widget popup Calendly (pas de redirection)
- [ ] Le bouton email ouvre le client mail natif (mailto:)
- [ ] Le footer est identique sur les 3 pages
- [ ] Le footer contient un lien "Mentions légales" (peut pointer vers une ancre ou section simple pour le MVP)

**Edge cases :**
- Si Calendly CDN ne charge pas → le bouton redirige vers l'URL Calendly directe
- Si le visiteur est sur mobile → les boutons CTA sont en pleine largeur

**Complexité :** S
**Dépendances :** Story #18 (Calendly popup)

---

### Story #8 — Page GRC Cybersécurité (cyber.html)

**En tant que** CISO ou Compliance Officer
**Je veux** comprendre l'offre GRC Cybersécurité en détail
**Pour** évaluer si cette prestation répond à mon besoin de conformité

**Critères d'acceptation :**
- [ ] **Hero** : accroche choc sur les risques (amendes, sanctions dirigeants) + placeholder vidéo 16:9 + CTA
- [ ] **Section "Le problème"** : 4 pain points en cards
  - Quelles normes s'appliquent à moi ?
  - Qu'est-ce qui est obligatoire vs recommandé ?
  - Quel est le risque financier ? (chiffres DORA: 2% CA, NIS2: €10M, RGPD: 4% CA)
  - Quel est le risque pour les dirigeants ? (responsabilité personnelle)
- [ ] **Section "La solution"** : audit et mise en conformité structurés, texte clair
- [ ] **Section "L'approche"** : 3 étapes numérotées
  - Étape 1 : Diagnostic initial (évaluation périmètre)
  - Étape 2 : Audit terrain (contrôles, entretiens, preuves)
  - Étape 3 : Feuille de route (plan d'action priorisé)
- [ ] **Section "Les livrables"** : 6 cards avec icônes
  - Grille d'audit complète
  - Rapport exécutif
  - Feuille de route priorisée
  - PV de conformité
  - Modèles de politiques
  - Infographie de synthèse
- [ ] **Section "Normes couvertes"** : groupées en 3 catégories
  - Réglementations EU : DORA, NIS 2, RGPD (avec badges "highlight" pour DORA/NIS2)
  - Standards ISO : ISO 27001, 27002, 27005
  - Frameworks Cyber : CIS Controls v8, NIST 800-53, NIST 800-37, EBIOS RM
- [ ] **CTA final** : "Réserver un diagnostic" + email
- [ ] Chaque section utilise `.animate-in` pour les animations au scroll
- [ ] Structure "problème → solution" verticale, page de vente

**Edge cases :**
- Si le visiteur arrive directement sur cyber.html (pas via la landing) → la page doit être compréhensible seule, sans contexte de la landing
- Si le visiteur ne connaît pas les acronymes → chaque sigle est développé à la première occurrence (DORA = Digital Operational Resilience Act, etc.)

**Complexité :** L
**Dépendances :** Story #1 (navbar), Story #7 (CTA/footer), Story #10 (i18n), Story #12 (animations)

---

### Story #9 — Page IA Agentique (ia.html)

**En tant que** dirigeant ou manager
**Je veux** comprendre comment l'IA agentique peut augmenter la productivité de mes équipes
**Pour** évaluer le ROI d'un projet d'IA agentique dans mon organisation

**Critères d'acceptation :**
- [ ] **Hero** : accroche "Vos équipes perdent du temps sur des tâches que l'IA sait faire" + placeholder vidéo 16:9 + CTA
- [ ] **Section "Le problème"** : 3 chiffres clés en KPI cards
  - 40% du temps sur tâches répétitives (McKinsey 2023)
  - 68% manquent de temps pour le travail stratégique (Microsoft 2024)
  - x3 erreurs sous pression (HBR)
  - Conséquences listées : délais, erreurs, talents sous-utilisés
- [ ] **Section "L'employé augmenté"** : concept agent IA dédié
  - 4 verbes : Prépare / Produit / Vérifie / Apprend
  - Message clé : "Le collaborateur reste aux commandes"
- [ ] **Section "Exemple concret : Audit GRC automatisé"** : workflow en 2 phases
  - Phase 1 Sourcing : l'agent source les normes, constitue le corpus, vérifie selon 7 critères qualité
  - Phase 2 Production : l'agent pré-remplit, le consultant revoit
  - Résultats : x4 plus rapide, 3+ normes en parallèle, 0 oubli
- [ ] **Section "Applicable à tous les métiers"** : 7 cards métiers
  - Consultant GRC, Développeur, Juriste, Comptable, RH, Commercial, Direction
  - Chaque card : titre métier + 2-3 exemples concrets de tâches automatisables
- [ ] **Section "Notre approche"** : 3 étapes numérotées
  - Diagnostic (1-2 jours) : identifier les tâches automatisables
  - Construction (1-3 semaines) : développer les agents IA
  - Déploiement (continu) : former, ajuster, optimiser
- [ ] **Section "Résultats"** : KPI boxes
  - x2 à x4 plus rapide
  - -70% temps production documentaire
  - 0 oubli
- [ ] **CTA final** : "Réserver un diagnostic IA" + email
- [ ] Sources citées pour chaque chiffre (McKinsey, Microsoft, HBR) en petite police sous les KPI

**Edge cases :**
- Si le visiteur ne connaît pas le concept d'IA agentique → la page doit être auto-explicative, jargon minimal
- Si les sources des chiffres changent → les références doivent être facilement modifiables (dans les fichiers de traduction)
- Si le visiteur est un profil technique (Dev) → la section "Applicable à tous les métiers" montre que ça le concerne aussi

**Complexité :** L
**Dépendances :** Story #1 (navbar), Story #7 (CTA/footer), Story #10 (i18n), Story #12 (animations)

---

### Story #10 — Système i18n FR/EN

**En tant que** visiteur anglophone
**Je veux** consulter le site en anglais
**Pour** comprendre les services proposés dans ma langue

**Critères d'acceptation :**
- [ ] Le module I18n est migré depuis le site v1 (`~/Bureau/APPS/AGILEVIZION/js/i18n.js`)
- [ ] Détection de langue : paramètre URL (?lang=fr) → localStorage → langue navigateur → FR par défaut
- [ ] Changement de langue sans rechargement de page (traduction dynamique du DOM)
- [ ] Tous les textes visibles sont traduits via `data-i18n="section.clé"` (textContent) ou `data-i18n-html` (innerHTML)
- [ ] Les placeholders des inputs du simulateur sont traduits via `data-i18n-placeholder`
- [ ] Les fichiers `lang/fr.json` et `lang/en.json` contiennent TOUTES les clés pour les 3 pages
- [ ] L'URL est mise à jour lors du changement de langue (?lang=xx)
- [ ] L'événement `languageChanged` est dispatché pour mettre à jour les composants dynamiques
- [ ] La langue choisie est persistée dans localStorage

**Edge cases :**
- Si une clé de traduction est manquante → afficher la clé EN par défaut (pas d'erreur visible)
- Si le fichier JSON ne charge pas → afficher le contenu HTML par défaut (texte en dur dans le HTML = français)
- Si le navigateur est en allemand/autre langue non supportée → fallback vers FR
- Si l'utilisateur change de page → la langue choisie est conservée (via localStorage + URL param)

**Complexité :** L
**Dépendances :** — (module fondation, pas de dépendance)

---

### Story #11 — Responsive mobile-first

**En tant que** visiteur sur smartphone ou tablette
**Je veux** une expérience de navigation fluide et lisible
**Pour** consulter le site sans frustration sur tout type d'écran

**Critères d'acceptation :**
- [ ] Approche mobile-first : styles de base = mobile, media queries pour tablette (768px) et desktop (1024px)
- [ ] Breakpoints : 480px (petit mobile), 768px (tablette), 1024px (desktop)
- [ ] Les grilles passent de 1 colonne (mobile) à 2 (tablette) à 3+ (desktop)
- [ ] Les boutons CTA sont pleine largeur sur mobile
- [ ] Les images utilisent `max-width: 100%` et `loading="lazy"`
- [ ] Le placeholder vidéo maintient son ratio 16:9 à toutes les tailles
- [ ] Le simulateur est utilisable sur mobile (questions lisibles, boutons accessibles)
- [ ] Le texte est lisible sans zoom (font-size minimum 16px sur mobile pour éviter le zoom auto iOS)
- [ ] Les tap targets font au minimum 44x44px (accessibilité tactile)

**Edge cases :**
- Si l'écran est en orientation paysage sur mobile → le hero ne doit pas prendre tout l'écran (max-height)
- Si le viewport est très étroit (<320px) → dégradation gracieuse, pas de coupure de texte
- Si la navbar est trop longue sur tablette → passer au menu hamburger

**Complexité :** L
**Dépendances :** Toutes les stories UI (1-9)

---

### Story #12 — Animations scroll (Intersection Observer)

**En tant que** visiteur
**Je veux** que les sections apparaissent progressivement en scrollant
**Pour** une expérience de navigation moderne et engageante

**Critères d'acceptation :**
- [ ] Les éléments avec la classe `.animate-in` sont invisibles par défaut (opacity 0, translateY léger)
- [ ] Quand ils entrent dans le viewport (threshold: 0.1), la classe `.visible` est ajoutée
- [ ] Transition douce (opacity 0→1, translateY 20px→0, durée ~0.6s, ease-out)
- [ ] L'animation ne se déclenche qu'une fois (pas de re-animation au re-scroll)
- [ ] Pas de librairie externe : utilisation de l'API Intersection Observer native
- [ ] Si `prefers-reduced-motion: reduce` → les animations sont désactivées (éléments visibles par défaut)
- [ ] Le module est dans `js/animations.js`

**Edge cases :**
- Si le navigateur ne supporte pas IntersectionObserver (très ancien) → les éléments sont visibles par défaut (pas de JS = tout visible)
- Si l'utilisateur scrolle très vite → les éléments apparaissent sans attente excessive
- Si la page est chargée déjà scrollée (ancrage #section) → les éléments au-dessus du viewport doivent être visibles immédiatement

**Complexité :** S
**Dépendances :** —

---

### Story #13 — SEO (meta, OG, JSON-LD, sitemap)

**En tant que** moteur de recherche
**Je veux** comprendre le contenu et la structure du site
**Pour** l'indexer correctement et l'afficher dans les résultats de recherche

**Critères d'acceptation :**
- [ ] Chaque page a un `<title>` unique et descriptif (max 60 caractères)
- [ ] Chaque page a une `<meta name="description">` unique (max 160 caractères)
- [ ] Open Graph : `og:title`, `og:description`, `og:type` (website), `og:url`, `og:image`
- [ ] Twitter Card : `twitter:card` (summary_large_image), `twitter:title`, `twitter:description`
- [ ] JSON-LD sur chaque page :
  - `Organization` : nom, url, logo, contactPoint, sameAs (LinkedIn)
  - `Service` : type de service, provider, areaServed
  - `FAQPage` si FAQ présente
- [ ] `sitemap.xml` à la racine avec les 3 URLs
- [ ] Balises sémantiques HTML5 : `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`, `<article>`
- [ ] Attributs `lang="fr"` sur la balise `<html>` (mis à jour par i18n)
- [ ] Pas de contenu dupliqué entre les pages

**Edge cases :**
- Si la langue est changée en EN → les meta tags ne sont PAS mis à jour dynamiquement (indexation FR par défaut, acceptable pour le MVP)
- Si `og:image` n'est pas fournie → utiliser le logo AgileVizion

**Complexité :** M
**Dépendances :** —

---

### Story #14 — Bannière cookies RGPD

**En tant que** visiteur
**Je veux** être informé de l'utilisation de cookies
**Pour** donner ou refuser mon consentement conformément au RGPD

**Critères d'acceptation :**
- [ ] La bannière apparaît au premier chargement si le consentement n'a pas encore été donné
- [ ] Texte : "Ce site utilise des cookies essentiels pour son fonctionnement." + lien vers mentions légales
- [ ] 2 boutons : "Accepter" (primary) et "Refuser" (secondary)
- [ ] Le choix est sauvegardé dans localStorage (clé `cookie_consent`)
- [ ] Si accepté ou refusé → la bannière ne réapparaît plus
- [ ] La bannière est positionnée en bas de l'écran, semi-transparente, z-index élevé
- [ ] Pas de tracking analytics pour le MVP (la bannière prépare l'ajout futur)
- [ ] Le module est dans `js/cookies.js`, les styles dans `css/cookies.css`

**Edge cases :**
- Si localStorage n'est pas disponible (navigation privée sur certains navigateurs) → la bannière apparaît à chaque visite
- Si le consentement date de plus de 12 mois → re-demander (vider le localStorage après 365 jours)
- Si le visiteur change de page → l'état de consentement est conservé (même localStorage)

**Complexité :** S
**Dépendances :** —

---

### Story #15 — Design system (CSS custom properties)

**En tant que** développeur
**Je veux** un système de design tokens centralisé
**Pour** garantir la cohérence visuelle et faciliter les évolutions de style

**Critères d'acceptation :**
- [ ] Toutes les couleurs, tailles de police, espacements et ombres sont définis dans `css/variables.css`
- [ ] Palette principale : Indigo (#4F46E5) primaire, Emerald (#10B981) accent, grille de gris (#111827 → #F9FAFB)
- [ ] Typographie : Inter (Google Fonts), échelle de tailles (xs à 6xl), poids (300 à 800)
- [ ] Spacing : tokens de --space-1 (0.25rem) à --space-24 (6rem)
- [ ] Les 8 fichiers CSS utilisent exclusivement des variables (jamais de valeur en dur)
- [ ] Le fichier `css/base.css` contient le reset CSS et les styles de base (body, headings, links)
- [ ] Le fichier `css/components.css` contient les composants réutilisables (btn, card, tag, kpi-card)
- [ ] Le fichier `css/layout.css` contient la grille, les sections, la navbar, le footer

**Edge cases :**
- Si un navigateur ne supporte pas les custom properties CSS (IE11) → dégradation acceptable (le site est lisible mais sans la palette exacte). IE11 est hors scope.

**Complexité :** M
**Dépendances :** —

---

### Story #16 — Intégration Calendly popup

**En tant que** visiteur convaincu
**Je veux** réserver un créneau directement depuis le site
**Pour** planifier un appel sans quitter la page

**Critères d'acceptation :**
- [ ] Le widget Calendly est chargé en CDN async (pas au chargement initial)
- [ ] Au clic sur "Réserver un appel", le popup Calendly s'ouvre
- [ ] Le popup se ferme avec le X ou en cliquant en dehors
- [ ] Le script Calendly n'est chargé qu'au premier clic (lazy loading)
- [ ] L'URL Calendly est configurable (pas en dur dans le JS)

**Edge cases :**
- Si le CDN Calendly est en panne → le bouton redirige vers l'URL Calendly directe (target="_blank")
- Si le navigateur bloque les scripts tiers → afficher un lien direct vers la page Calendly
- Si l'utilisateur est sur mobile → le popup s'adapte en plein écran

**Complexité :** S
**Dépendances :** —

---

### Story #17 — Section "Trusted by" / Logos partenaires (Landing)

**En tant que** visiteur
**Je veux** voir que d'autres organisations font confiance à AgileVizion
**Pour** me rassurer sur la crédibilité du consultant

> **Suggestion du BA** : Les études montrent que les logos clients augmentent la conversion de +42% (Baymard Institute). Même 3-4 logos suffisent. C'est un standard sur tous les sites de consulting cyber (Vanta, Drata, CrowdStrike).

**Critères d'acceptation :**
- [ ] Section positionnée entre le hero et les services (ou juste après les services)
- [ ] Affichage de 3 à 6 logos clients/partenaires en ligne horizontale
- [ ] Les logos sont en niveaux de gris par défaut, couleur au hover
- [ ] Si moins de 3 logos disponibles → texte alternatif "Consultant certifié, missions réalisées au Luxembourg et en Europe"
- [ ] Responsive : les logos s'adaptent (wrap ou scroll horizontal sur mobile)

**Edge cases :**
- Si aucun logo client n'est disponible (confidentialité) → remplacer par des badges certifications ou une mention "20+ missions réalisées"
- Si les logos sont de tailles différentes → normaliser la hauteur (40-50px)

**Complexité :** S
**Dépendances :** Story #2 (hero — positionnement relatif)

---

### Story #18 — Badges certifications

**En tant que** visiteur technique (CISO, recruteur)
**Je veux** voir les certifications professionnelles du consultant
**Pour** valider ses compétences formellement reconnues

> **Suggestion du BA** : Les badges de certification augmentent la conversion de +48% en contexte enterprise (Baymard). Déjà présents dans le site v1, à intégrer de manière plus visible.

**Critères d'acceptation :**
- [ ] Affichage dans la section "Pourquoi moi" et/ou en footer
- [ ] Certifications affichées : ISO 27001, ITIL V4, Prince2, AgilePM, SAFe, PMP (si applicable)
- [ ] Format : badges visuels (icône + nom) en ligne horizontale
- [ ] Responsive : wrap sur plusieurs lignes si nécessaire

**Edge cases :**
- Si trop de certifications pour une ligne → afficher les 4-5 principales, lien "voir toutes" au survol ou en section dédiée

**Complexité :** S
**Dépendances :** Story #6 (pourquoi moi)

---

### Story #19 — FAQ avec accordéons

**En tant que** visiteur hésitant
**Je veux** trouver des réponses à mes questions fréquentes
**Pour** lever mes dernières objections avant de prendre contact

> **Suggestion du BA** : La FAQ lève les objections, réduit le taux de rebond, et génère du contenu SEO supplémentaire (FAQPage structured data). Standard sur tous les sites de services B2B.

**Critères d'acceptation :**
- [ ] Section FAQ sur la landing page (avant le CTA final)
- [ ] 5-8 questions/réponses en format accordéon (cliquer pour déplier)
- [ ] Questions suggérées :
  - "Quelles normes sont couvertes par votre audit ?"
  - "Combien de temps dure une mission d'audit ?"
  - "Travaillez-vous avec des PME ou seulement des grands groupes ?"
  - "Quelle est la différence entre un audit et une certification ?"
  - "Comment se passe le premier échange ?"
  - "Travaillez-vous à distance ou sur site ?"
- [ ] Animation d'ouverture/fermeture fluide (max-height transition ou détails/summary natif)
- [ ] Une seule question ouverte à la fois (les autres se ferment)
- [ ] JSON-LD `FAQPage` généré pour le SEO
- [ ] Tous les textes sont dans les fichiers de traduction (i18n)

**Edge cases :**
- Si JS désactivé → utiliser `<details>/<summary>` natif HTML (fonctionne sans JS)
- Si le visiteur clique rapidement sur plusieurs questions → pas de bug d'animation

**Complexité :** M
**Dépendances :** Story #10 (i18n), Story #13 (SEO JSON-LD)

---

### Story #20 — Score visuel du simulateur

**En tant que** utilisateur ayant complété le simulateur
**Je veux** voir un indicateur visuel de mon niveau de conformité
**Pour** comprendre d'un coup d'œil l'ampleur de mes obligations

> **Suggestion du BA** : Les outils de Cisco, KnowBe4, et Kelser utilisent tous un scoring visuel (gauge, radar chart). Le texte seul ne suffit pas à créer un impact.

**Critères d'acceptation :**
- [ ] Après l'analyse, affichage d'un indicateur visuel en haut des résultats
- [ ] Indicateur : compteur du nombre de normes obligatoires vs recommandées (ex: "4 normes obligatoires, 2 recommandées")
- [ ] Barre de progression visuelle ou indicateur graphique CSS pur (pas de librairie chart)
- [ ] Code couleur : rouge/indigo pour obligatoire, vert/emerald pour recommandé
- [ ] L'indicateur se met à jour si les résultats changent

**Edge cases :**
- Si 0 norme obligatoire → indicateur tout vert, message positif
- Si 5+ normes obligatoires → indicateur tout rouge, message d'urgence

**Complexité :** M
**Dépendances :** Story #4 (simulateur)

---

### Story #21 — Section résultats chiffrés / KPI (IA page)

**En tant que** visiteur de la page IA
**Je veux** voir des résultats concrets et chiffrés
**Pour** évaluer le ROI potentiel d'un projet IA agentique

> **Suggestion du BA** : Les chiffres sont déjà dans le BRIEF. Les afficher en KPI boxes (pattern McKinsey) augmente l'impact visuel et la crédibilité.

**Critères d'acceptation :**
- [ ] 3 KPI boxes en ligne : "x2 à x4 plus rapide", "-70% production doc", "0 oubli"
- [ ] Chaque KPI : chiffre en grand (font-size-4xl+), label descriptif en dessous, barre accent latérale colorée
- [ ] Animation de comptage au scroll (optionnel — si implémenté, douce et rapide)
- [ ] Sources citées en petite police grise sous les KPI
- [ ] Responsive : KPI boxes s'empilent sur mobile

**Edge cases :**
- Si `prefers-reduced-motion` → pas d'animation de comptage, chiffres affichés directement

**Complexité :** S
**Dépendances :** Story #12 (animations)

---

### Story #22 — Accessibilité (a11y) de base

**En tant que** visiteur en situation de handicap
**Je veux** naviguer sur le site avec un lecteur d'écran ou au clavier
**Pour** accéder aux mêmes informations que tout le monde

> **Suggestion du BA** : L'accessibilité de base (WCAG 2.1 niveau AA) est un standard professionnel et un signal de qualité. Pour un site de consulting cyber/compliance, c'est attendu.

**Critères d'acceptation :**
- [ ] Tous les éléments interactifs sont accessibles au clavier (tabulation, Enter/Space)
- [ ] Focus visible sur tous les éléments interactifs (outline ou ring)
- [ ] Contraste texte/fond respecte WCAG AA (ratio 4.5:1 minimum)
- [ ] Les images ont des attributs `alt` descriptifs
- [ ] Les icônes décoratives ont `aria-hidden="true"`
- [ ] Les landmarks ARIA sont présents (`role="navigation"`, `role="main"`, etc.) ou sémantique HTML5 utilisée
- [ ] `prefers-reduced-motion` respecté (Story #12)
- [ ] Le simulateur est navigable au clavier (tabulation entre questions, sélection avec Enter)

**Edge cases :**
- Si un élément est généré dynamiquement (résultats simulateur) → utiliser `aria-live="polite"` pour annoncer les changements
- Si le menu mobile est fermé → les liens à l'intérieur ne sont pas tabulables (`tabindex="-1"` ou `display: none`)

**Complexité :** M
**Dépendances :** Toutes les stories UI

---

### Story #23 — Bouton "Retour en haut"

**En tant que** visiteur
**Je veux** un bouton pour remonter en haut de la page rapidement
**Pour** naviguer facilement sur ces longues pages verticales

> **Suggestion du BA** : Pattern UX standard pour les pages de vente longues en scroll vertical. Petit effort, grande amélioration UX.

**Critères d'acceptation :**
- [ ] Bouton flottant en bas à droite, apparaît quand scroll > 500px
- [ ] Au clic, scroll smooth vers le haut de la page
- [ ] Icône flèche vers le haut (Font Awesome)
- [ ] Disparaît quand l'utilisateur est en haut de la page
- [ ] Responsive : taille adaptée sur mobile (pas trop gros, pas trop petit)

**Edge cases :**
- Si `prefers-reduced-motion` → scroll instantané (pas de smooth)
- Si le bouton chevauche un CTA en bas de page → ajuster le positionnement (bottom suffisant)

**Complexité :** S
**Dépendances :** —

---

### Story #24 — Section dark (contraste visuel)

**En tant que** visiteur
**Je veux** une variation visuelle dans le défilement de la page
**Pour** que le site ne soit pas monotone et que certaines sections aient plus d'impact

> **Suggestion du BA** : Le pattern "hybrid clair/sombre" est utilisé par Vanta, Drata, CrowdStrike. Rompt la monotonie, donne du poids aux sections clés.

**Critères d'acceptation :**
- [ ] Au moins 1 section par page utilise un fond sombre (dark navy #111827 ou indigo dark #3730A3)
- [ ] Texte blanc/clair sur fond sombre, contraste AA respecté
- [ ] Utilisé pour les sections à fort impact : section "Le problème" (cyber), section "Résultats" (IA), CTA final (toutes pages)
- [ ] Transition douce entre section claire et sombre (pas de coupure brutale)

**Edge cases :**
- Si impression de la page → les fonds sombres ne doivent pas gaspiller l'encre (media query `print` : fond blanc)

**Complexité :** S
**Dépendances :** Story #15 (design system)

---

## 5. Estimation de complexité

| Story | Titre | Complexité | Priorité | Phase |
|-------|-------|-----------|----------|-------|
| #15 | Design system (CSS tokens) | M | P0 | MVP |
| #1 | Navbar sticky | M | P0 | MVP |
| #10 | Système i18n FR/EN | L | P0 | MVP |
| #12 | Animations scroll | S | P0 | MVP |
| #2 | Hero Landing | M | P0 | MVP |
| #3 | Section 2 services | S | P0 | MVP |
| #4 | Simulateur de conformité | XL | P0 | MVP |
| #6 | Section "Pourquoi moi" | M | P0 | MVP |
| #7 | CTA final + Footer | S | P0 | MVP |
| #8 | Page GRC Cyber | L | P0 | MVP |
| #9 | Page IA Agentique | L | P0 | MVP |
| #14 | Bannière cookies RGPD | S | P0 | MVP |
| #13 | SEO (meta, OG, JSON-LD) | M | P0 | MVP |
| #16 | Intégration Calendly | S | P0 | MVP |
| #11 | Responsive mobile-first | L | P0 | MVP |
| #5 | Rapport PDF simulateur | L | P1 | MVP |
| #17 | Section "Trusted by" | S | P1 | MVP+ |
| #18 | Badges certifications | S | P1 | MVP+ |
| #19 | FAQ avec accordéons | M | P1 | MVP+ |
| #20 | Score visuel simulateur | M | P2 | V2 |
| #21 | KPI boxes résultats | S | P1 | MVP+ |
| #22 | Accessibilité a11y | M | P1 | MVP+ |
| #23 | Bouton retour en haut | S | P2 | V2 |
| #24 | Section dark contraste | S | P1 | MVP+ |

### Ordre d'implémentation recommandé

**Sprint 1 — Fondations :**
1. Story #15 — Design system (tout le reste en dépend)
2. Story #10 — i18n (fondation traduction)
3. Story #12 — Animations scroll (utilitaire réutilisable)
4. Story #1 — Navbar (squelette navigation)
5. Story #14 — Cookies (indépendant)

**Sprint 2 — Landing page :**
6. Story #2 — Hero Landing
7. Story #3 — Services (2 colonnes)
8. Story #4 — Simulateur (le plus complexe)
9. Story #6 — Pourquoi moi
10. Story #7 — CTA + Footer
11. Story #16 — Calendly

**Sprint 3 — Pages secondaires :**
12. Story #8 — Page GRC Cyber
13. Story #9 — Page IA Agentique
14. Story #13 — SEO
15. Story #11 — Responsive (polish final)
16. Story #5 — Rapport PDF

**Sprint 4 — Améliorations :**
17. Story #17 — Trusted by
18. Story #18 — Badges certifications
19. Story #19 — FAQ
20. Story #21 — KPI boxes
21. Story #22 — Accessibilité
22. Story #24 — Sections dark
23. Story #20 — Score visuel
24. Story #23 — Retour en haut

---

## 6. Annexes

### A. Normes couvertes par le simulateur

| Norme | Nom complet | Type | Sanctions |
|-------|-------------|------|-----------|
| RGPD | Règlement Général sur la Protection des Données | Réglementation EU | 4% CA ou €20M |
| DORA | Digital Operational Resilience Act | Réglementation EU | Sanctions superviseur |
| NIS 2 | Network and Information Security Directive 2 | Directive EU | 2% CA ou €10M |
| PCI-DSS | Payment Card Industry Data Security Standard | Standard industrie | Amendes acquéreur |
| HDS | Hébergement de Données de Santé | Réglementation FR | Pénal |
| ISO 27001 | Systèmes de management de la sécurité de l'information | Standard ISO | Perte certification |
| ISO 20000 | Systèmes de management des services IT | Standard ISO | Perte certification |
| SOC 2 | Service Organization Control 2 | Standard AICPA | Perte clients US |
| ISO 22301 | Systèmes de management de la continuité d'activité | Standard ISO | Perte certification |
| CMMC | Cybersecurity Maturity Model Certification | Standard US DoD | Perte contrats DoD |

### B. Profils détectés par le simulateur

| Profil | Icône | Critère |
|--------|-------|---------|
| Startup | 🚀 | Petite entreprise |
| PME | 🏢 | Entreprise moyenne |
| ETI | 🏛️ | Grande entreprise |

### C. Assets à migrer depuis v1

| Source | Destination | Action |
|--------|------------|--------|
| `~/Bureau/APPS/AGILEVIZION/js/simulator.js` | `js/simulator.js` | Migrer logique, adapter DOM/styles |
| `~/Bureau/APPS/AGILEVIZION/js/i18n.js` | `js/i18n.js` | Migrer, supprimer `isInSubfolder()` |
| `~/Bureau/APPS/AGILEVIZION/lang/fr.json` | `lang/fr.json` | Adapter clés (supprimer ITSM, ajouter IA) |
| `~/Bureau/APPS/AGILEVIZION/lang/en.json` | `lang/en.json` | Idem |
| `~/Bureau/APPS/AGILEVIZION/images/logo-dark-bg.svg` | `images/logo.svg` | Copie directe |
| `photo_sans_fonds.png` | `images/photo_emmanuel.png` | Copie + optimisation |

### D. Sources de la recherche marché

| Sujet | Source | Insight clé |
|-------|--------|-------------|
| Logos clients | Baymard Institute | +42% conversion |
| Certifications | Baymard / Brimar | +48% conversion enterprise |
| Simulateurs compliance | Cisco, KnowBe4, Kelser | Scoring visuel + rapport PDF = standard |
| Pages de vente | Userpilot, Conversion Sciences | Structure Problème→Solution→Preuve→CTA |
| Copie simplifiée | Unbounce / Genesys Growth | Lisibilité niveau collège = +56% conversion |
| IA landing pages | BCG | +20% conversion avec IA dans marketing |

### E. Clés de traduction à créer (nouvelles sections v2)

Clés à ajouter dans `lang/fr.json` et `lang/en.json` par rapport à v1 :

```
landing.hero_h1, landing.hero_subtitle, landing.hero_cta_book, landing.hero_cta_email
landing.services_title, landing.service_cyber_title, landing.service_cyber_desc
landing.service_ia_title, landing.service_ia_desc, landing.service_cta
landing.why_title, landing.why_point1_title, landing.why_point1_desc (x3)
landing.why_photo_alt, landing.why_certs_title
landing.faq_title, landing.faq_q1, landing.faq_a1 (x6-8)
landing.cta_title, landing.cta_book, landing.cta_email

ia.hero_h1, ia.hero_subtitle
ia.problem_title, ia.problem_kpi1_value, ia.problem_kpi1_label, ia.problem_kpi1_source (x3)
ia.problem_consequences
ia.augmented_title, ia.augmented_prepare, ia.augmented_produce, ia.augmented_verify, ia.augmented_learn
ia.augmented_message
ia.example_title, ia.example_phase1_title, ia.example_phase1_desc
ia.example_phase2_title, ia.example_phase2_desc
ia.example_results
ia.jobs_title, ia.job_grc, ia.job_dev, ia.job_legal, ia.job_accounting, ia.job_hr, ia.job_sales, ia.job_direction (x7 titre+desc)
ia.approach_title, ia.approach_step1_title, ia.approach_step1_desc (x3)
ia.results_title, ia.result1_value, ia.result1_label (x3)
ia.cta_title

cookies.text, cookies.accept, cookies.refuse, cookies.link

common.footer_legal, common.trusted_by, common.back_to_top
```

Clés à supprimer (ITSM supprimé) :
```
itsm.* (toutes les clés du namespace itsm)
nav.itsm
```
