# ARCHITECTURE.md — AgileVizion 2

## 1. Objectif

Refonte complète du site agilevizion.com en site de vente vertical moderne.
3 pages : Landing, GRC Cybersécurité, IA Agentique.
Cible : CISO, Compliance Officers, cabinets de recrutement, ESN, Big 4.

---

## 2. Contraintes du BRIEF

| Contrainte | Impact |
|-----------|--------|
| HTML/CSS/JS statique uniquement | Pas de framework, pas de build step |
| GitHub Pages | Pas de server-side, pas de DB |
| Pas de npm | Zéro dépendance installée, CDN uniquement |
| i18n FR/EN existant | Conserver le module `I18n` et les fichiers `lang/` |
| Simulateur existant | Conserver la logique métier `simulator.js` |
| Design NEUF | Abandonner totalement la palette navy/gold |
| Mobile-first | Responsive, animations scroll |

---

## 3. Évaluation des stacks

### Options considérées

| Critère | Poids | **A) Vanilla CSS/JS** | **B) Tailwind CDN** | **C) Bootstrap 5 CDN** |
|---------|-------|-----------------------|---------------------|------------------------|
| Adéquation | 5 | 10 | 8 | 7 |
| Maturité | 5 | 10 | 7 | 9 |
| Écosystème | 3 | 7 | 8 | 9 |
| Performance | 3 | 10 | 6 | 6 |
| Courbe apprentissage | 2 | 8 | 6 | 7 |
| Dispo locale | 5 | 10 | 8 | 8 |
| Compatibilité env | 5 | 10 | 9 | 9 |
| **Score pondéré** | | **268/280** | **218/280** | **222/280** |

### Choix : Option A — Vanilla CSS + Vanilla JS

**Justification :**

1. **Zéro dépendance** = compatible GitHub Pages sans build, chargement instantané (< 50KB CSS total)
2. **CSS custom properties** pour le design system (palette, typo, spacing) — modifiable en un seul fichier
3. **Contrôle total du design** — le brief exige un design premium et original, pas un thème générique
4. **Intersection Observer API** pour les animations scroll — natif, performant, 0 lib
5. **Pas de CDN JS lourd** — Tailwind Play CDN = 300KB+ de JS pour parser les classes, inapproprié pour la prod
6. **Maintenabilité** — CSS standard, compréhensible par tout développeur web

### Alternatives écartées

- **Tailwind CDN** : le CDN Play est explicitement déconseillé pour la production par Tailwind Labs. La version full nécessite un build step (PostCSS), incompatible avec la contrainte "pas de npm/build".
- **Bootstrap 5** : design trop reconnaissable / générique pour un site de conseil premium. Difficulté à créer un design original sans surcharger massivement les styles.

---

## 4. Stack retenue

| Composant | Technologie | Version | Source |
|-----------|------------|---------|--------|
| **Markup** | HTML5 | — | Local |
| **Styles** | CSS3 (custom properties, Grid, Flexbox) | — | Local |
| **Scripts** | JavaScript vanilla (ES5 simulateur, ES6 modules) | — | Local |
| **Fonts** | Inter | variable | Google Fonts CDN |
| **Icônes** | Font Awesome | 6.5.1 | cdnjs CDN |
| **Calendly** | Widget popup | latest | assets.calendly.com |
| **i18n** | Module custom I18n | — | Migré du site v1 |
| **Simulateur** | Logique compliance custom | — | Migré du site v1 |

### Exemption DB

Ce projet est un site vitrine statique sans contenu dynamique utilisateur.
Les données du simulateur (normes, secteurs, profils) sont de la **configuration métier** codée en JS — pas du contenu modifiable par l'utilisateur.
Pas de DB nécessaire.

---

## 5. Architecture

### Pattern : Static Multi-Page Application (MPA)

Chaque page est un fichier HTML autonome avec ses propres balises `<head>` (SEO, structured data).
Les modules JS et CSS sont partagés entre les pages.

### Séparation des responsabilités

```
┌─────────────────────────────────────────────────┐
│                   HTML (3 pages)                 │
│  index.html │ cyber.html │ ia.html              │
├─────────────────────────────────────────────────┤
│                 CSS (8 fichiers)                 │
│  variables │ base │ components │ layout │        │
│  animations │ simulator │ responsive │ cookies   │
├─────────────────────────────────────────────────┤
│                  JS (5 modules)                  │
│  i18n │ simulator │ nav │ animations │ cookies   │
├─────────────────────────────────────────────────┤
│              Données (2 fichiers)                │
│  lang/fr.json │ lang/en.json                     │
├─────────────────────────────────────────────────┤
│               Assets (CDN externes)              │
│  Google Fonts │ Font Awesome │ Calendly          │
└─────────────────────────────────────────────────┘
```

### Structure des fichiers

```
agilevizion-2/
├── index.html              # Landing page
├── cyber.html              # Page GRC Cybersécurité
├── ia.html                 # Page IA Agentique
├── sitemap.xml             # SEO
├── BRIEF.md                # Brief projet
├── CLAUDE.md               # Instructions Claude Code
├── ARCHITECTURE.md         # Ce fichier
├── .gitignore
│
├── css/
│   ├── variables.css       # Design tokens (couleurs, typo, spacing, shadows)
│   ├── base.css            # Reset CSS + éléments de base (body, a, h1-h6)
│   ├── components.css      # Composants UI (buttons, cards, tags, KPI boxes)
│   ├── layout.css          # Navbar, sections, grids (CSS Grid), footer
│   ├── animations.css      # Transitions scroll (.animate-in → .visible)
│   ├── simulator.css       # Styles du simulateur de conformité
│   ├── responsive.css      # Media queries (1024px, 768px, 480px)
│   └── cookies.css         # Bannière cookies RGPD
│
├── js/
│   ├── i18n.js             # Module i18n (FR/EN) — migré de v1
│   ├── simulator.js        # Logique simulateur compliance — migré de v1
│   ├── nav.js              # Navigation (scroll shadow, mobile toggle, lang)
│   ├── animations.js       # Intersection Observer → animations scroll
│   └── cookies.js          # Bannière cookies (localStorage)
│
├── lang/
│   ├── fr.json             # Traductions françaises (toutes les clés)
│   └── en.json             # Traductions anglaises
│
├── images/                 # Logo, photo Emmanuel, assets visuels
├── references/             # Sources (lecture seule, pas commité)
└── logs/                   # Logs (pas commité)
```

---

## 6. Design System

### Palette — Abandon du navy/gold

| Token | Valeur | Usage |
|-------|--------|-------|
| `--color-primary` | `#4F46E5` (Indigo) | Titres, CTA, liens, accents |
| `--color-primary-light` | `#6366F1` | Hover, bordures actives |
| `--color-primary-dark` | `#3730A3` | Fond CTA dark |
| `--color-accent` | `#10B981` (Emerald) | Succès, obligatoire, badges |
| `--color-danger` | `#EF4444` | Alertes, sanctions |
| `--color-gray-900` | `#111827` | Texte principal |
| `--color-gray-600` | `#4B5563` | Texte secondaire |
| `--color-gray-50` | `#F9FAFB` | Fond alternatif |

### Typographie

- **Font** : Inter (Google Fonts) — moderne, excellente lisibilité écran
- **Tailles** : système de `--font-size-xs` (0.75rem) à `--font-size-6xl` (3.75rem)
- **Poids** : 300 (light) à 800 (extrabold)

### Spacing

Système de tokens : `--space-1` (0.25rem) à `--space-24` (6rem).
Espacement cohérent via variables CSS, pas de valeurs magiques.

### Composants

| Composant | Fichier | Usage |
|-----------|---------|-------|
| `.btn` | components.css | Boutons (primary, outline, lg, sm) |
| `.service-card` | components.css | Cartes services (landing) |
| `.kpi-card` | components.css | Chiffres clés (sanctions, KPI) |
| `.step-card` | components.css | Étapes numérotées (approche) |
| `.problem-card` | components.css | Pain points (fond rouge clair) |
| `.deliverable-card` | components.css | Livrables (icône + texte) |
| `.why-card` | components.css | Arguments "pourquoi moi" |
| `.tag` | components.css | Tags inline (normes, résultats) |
| `.framework-group` | components.css | Groupes de frameworks |
| `.job-card` | components.css | Métiers IA agentique |

---

## 7. Decisions d'architecture

### 7.1. CSS séparé en 8 fichiers (pas 1 méga-fichier)

**Pourquoi** : chaque fichier a une responsabilité claire. Le développeur sait où chercher.
Le navigateur met en cache chaque fichier indépendamment.
HTTP/2 (GitHub Pages) gère bien les requêtes parallèles.

### 7.2. Pas de CSS-in-JS, pas de modules CSS

**Pourquoi** : contrainte "pas de build". CSS natif avec custom properties offre le même niveau de theming sans tooling.

### 7.3. Intersection Observer (pas AOS, pas ScrollReveal)

**Pourquoi** : API native, 0 dépendance, 0 KB de JS externe. Même résultat visuel.
Fallback gracieux avec `prefers-reduced-motion`.

### 7.4. Simulateur JS en ES5

**Pourquoi** : code migré du site v1, fonctionne tel quel. Pas de raison de refactorer en ES6 à ce stade — la logique métier est stable et testée.

### 7.5. i18n côté client (pas de SSR/SSG)

**Pourquoi** : contrainte GitHub Pages (pas de server-side). Le module I18n charge `fr.json` ou `en.json` au DOMContentLoaded et traduit le DOM.
Impact SEO mitigé par les structured data JSON-LD et les meta tags en français par défaut.

### 7.6. Calendly en CDN popup (pas embed)

**Pourquoi** : le popup ne charge les ressources Calendly que quand l'utilisateur clique.
L'embed iframe chargerait ~500KB au chargement initial.

---

## 8. Environnement détecté

| Élément | Valeur |
|---------|--------|
| OS | Linux 6.17.0 (Ubuntu) |
| Display server | **Wayland** (avec XWayland fallback) |
| Python | 3.12.3 |
| Node | 24.14.0 |
| Git | 2.43.0 |
| GitHub CLI | 2.45.0 |

### Impact Wayland

Aucun impact pour un site web statique. Le serveur local (`python3 -m http.server`) fonctionne indépendamment du display server. Le navigateur fonctionne nativement sous Wayland.

---

## 9. Performance

### Budget cible

| Ressource | Taille estimée | Source |
|-----------|---------------|--------|
| HTML (3 pages) | ~15 KB chacune | Local |
| CSS (8 fichiers) | ~25 KB total | Local |
| JS (5 modules) | ~35 KB total | Local |
| Inter font | ~100 KB (woff2, subset) | Google CDN (cache long) |
| Font Awesome | ~85 KB (CSS + woff2, subset) | cdnjs CDN (cache long) |
| **Total premier chargement** | **~260 KB** | |

### Optimisations

- `font-display: swap` (géré par Google Fonts)
- `loading="lazy"` sur les images
- Pas de JS bloquant dans le `<head>` — tous les scripts en fin de `<body>`
- Calendly chargé en `async`
- CSS critique inline possible ultérieurement si besoin

---

## 10. SEO

| Élément | Implémenté |
|---------|-----------|
| `<title>` unique par page | Oui |
| `<meta description>` | Oui |
| Open Graph (og:title, og:description, og:type) | Oui |
| Twitter Card | Oui |
| JSON-LD (Organization, Service) | Oui |
| sitemap.xml | Oui |
| Sémantique HTML5 (section, nav, footer) | Oui |

---

## 11. RGPD

- **Bannière cookies** : affichée si pas encore acceptée (localStorage)
- **Pas de tracking** pour le MVP (Google Analytics absent)
- **Calendly** : chargé uniquement au clic (pas de cookies tiers au chargement)
- **Pas de données personnelles stockées** côté serveur (site statique)

---

## 12. Migrations depuis le site v1

### Fichiers à migrer (lors du développement)

| Fichier source (v1) | Destination (v2) | Adaptation requise |
|---------------------|------------------|-------------------|
| `~/Bureau/APPS/AGILEVIZION/js/simulator.js` | `js/simulator.js` | Styles CSS adaptés, DOM compatible |
| `~/Bureau/APPS/AGILEVIZION/js/i18n.js` | `js/i18n.js` | Suppression du `isInSubfolder()` (plus de sous-dossiers) |
| `~/Bureau/APPS/AGILEVIZION/lang/fr.json` | `lang/fr.json` | Nouvelles clés (landing, ia), suppression clés ITSM |
| `~/Bureau/APPS/AGILEVIZION/lang/en.json` | `lang/en.json` | Idem |
| `~/Bureau/APPS/AGILEVIZION/images/logo-dark-bg.svg` | `images/logo.svg` | Copie directe |
| `photo_sans_fonds.png` | `images/photo_emmanuel.png` | Copie + optimisation |

### Fichiers supprimés par rapport au site v1

- `pages_specs/service-management.html` → Service Management supprimé
- `pages_specs/why-me.html` → Contenu intégré dans la landing
- `pages_specs/simulator.html` → Simulateur intégré dans la landing
- `js/loader.js` → Plus de header/footer dynamiques (tout est dans chaque HTML)
- `js/version.js` → Pas de cache busting nécessaire (GitHub Pages gère)
- `pages_gen/` → Supprimé (header/footer inline)

---

## 13. Prochaines étapes (pour le développeur)

1. **Migrer i18n.js** — adapter le `getBasePath()` (plus de sous-dossiers)
2. **Migrer simulator.js** — intégrer le HTML du formulaire dans `index.html`
3. **Créer les fichiers lang/** — adapter les clés JSON aux nouvelles sections
4. **Copier les assets** — logo, photo Emmanuel
5. **Intégrer le contenu de vente** — textes percutants pour cyber.html et ia.html
6. **Tester responsive** — vérifier les 3 breakpoints (1024, 768, 480)
7. **Optimiser images** — WebP si possible, compression
8. **Configurer GitHub Pages** — quand prêt pour le déploiement
