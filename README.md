# AgileVizion 2

Site de vente vertical pour [agilevizion.com](https://agilevizion.com) — consultant GRC Cybersécurité & IA Agentique basé au Luxembourg.
3 pages statiques (Landing, GRC Cybersécurité, IA Agentique) avec simulateur de conformité réglementaire intégré.

---

## Prérequis

| Outil | Version minimale | Usage |
|-------|-----------------|-------|
| Node.js | 18+ | Jest (tests unitaires) + ESLint |
| npm | 9+ | Gestionnaire de paquets |
| Python 3 | 3.8+ | Serveur de développement local |
| Chromium | récent | Tests E2E Playwright |

> **Aucun framework, aucun bundler.** Le site est 100% statique — HTML/CSS/JS vanilla.

---

## Installation

```bash
git clone https://github.com/cryptoradio7/agilevizion-2.git
cd agilevizion-2
npm install
npx playwright install chromium
```

---

## Lancement

```bash
python3 -m http.server 8000
```

Ouvrir dans le navigateur : [http://localhost:8000](http://localhost:8000)

| URL | Page |
|-----|------|
| `http://localhost:8000/` | Landing page |
| `http://localhost:8000/cyber.html` | GRC Cybersécurité |
| `http://localhost:8000/ia.html` | IA Agentique |

---

## Tests

### Tests unitaires (Jest — jsdom)

```bash
npm run test:unit
```

Teste la logique JS en isolation (simulateur, i18n, navigation, animations, cookies, Calendly).

### Tests E2E (Playwright — Desktop Chrome + iPhone 12)

```bash
npm run test:e2e
```

Playwright démarre automatiquement `python3 -m http.server 8099` sur le port 8099.
Les tests couvrent les 3 pages, le simulateur, le responsive, le SEO, les cookies et le i18n.

### Couverture de code

```bash
npm run test:coverage
```

Rapport généré dans `coverage/` (text + lcov).

### Lint

```bash
npm run lint
```

---

## Structure

```
agilevizion-2/
├── index.html              # Landing page (Hero, Services, Simulateur, Pourquoi moi)
├── cyber.html              # Page GRC Cybersécurité
├── ia.html                 # Page IA Agentique
├── sitemap.xml             # Plan du site (SEO)
│
├── css/
│   ├── variables.css       # Design tokens (palette Indigo/Emerald, typo, spacing)
│   ├── base.css            # Reset CSS + styles de base
│   ├── components.css      # Composants réutilisables (cards, buttons, tags...)
│   ├── layout.css          # Navbar, sections, grids, footer
│   ├── animations.css      # Animations scroll (Intersection Observer)
│   ├── simulator.css       # Styles du simulateur de conformité
│   ├── responsive.css      # Media queries (mobile-first, breakpoints 768/1024/1280px)
│   └── cookies.css         # Bannière cookies RGPD
│
├── js/
│   ├── i18n.js             # Module i18n FR/EN (détection locale, localStorage, events)
│   ├── simulator.js        # Simulateur de conformité (10 normes, 30+ secteurs)
│   ├── nav.js              # Navigation (scroll shadow, menu mobile, liens actifs)
│   ├── animations.js       # Intersection Observer (classe .animate-in → .visible)
│   ├── cookies.js          # Bannière cookies (consentement localStorage, TTL 365j)
│   └── calendly.js         # Chargement lazy du widget Calendly
│
├── lang/
│   ├── fr.json             # Traductions françaises (~417 clés)
│   └── en.json             # Traductions anglaises (~417 clés)
│
├── images/
│   └── photo_emmanuel.png  # Photo du consultant
│
├── tests/
│   ├── unit/               # Tests Jest (16 fichiers — un par module/section)
│   └── e2e/                # Tests Playwright (16 fichiers — desktop + mobile)
│
├── state/
│   └── project_state.json  # État du projet (phases, stories, CI/CD)
│
├── package.json            # npm config + scripts
├── jest.config.js          # Jest (jsdom, tests/unit/**)
├── playwright.config.js    # Playwright (port 8099, Desktop Chrome + iPhone 12)
├── .gitignore
├── CLAUDE.md               # Instructions agent de développement
├── BRIEF.md                # Cahier des charges
├── ARCHITECTURE.md         # Décisions techniques
└── SPECS_FONCTIONNELLES.md # Spécifications détaillées
```

> `references/` et `logs/` ne sont pas committés (protégés par `.gitignore`).

---

## Simulateur de conformité

Le simulateur (`js/simulator.js`) calcule les normes réglementaires applicables selon le profil de l'entreprise.

**10 normes gérées :**

| Norme | Périmètre |
|-------|-----------|
| RGPD (Règlement (UE) 2016/679) | Données personnelles |
| DORA (Règlement (UE) 2022/2554) | Entités financières |
| NIS 2 (Directive (UE) 2022/2555) | Secteurs critiques |
| ISO 27001 | SMSI (Système de Management de la Sécurité de l'Information) |
| ISO 22301 | Continuité d'activité |
| ISO 20000 | Management des services IT |
| PCI-DSS v4.0 | Paiement par carte |
| HDS | Hébergeur de Données de Santé (France) |
| SOC 2 | Service Organization Control (US) |
| CMMC | Cybersecurity Maturity Model Certification (US DoD) |

**3 profils d'entreprise :** Petite structure (<50 emp.), PME (50-249), Grande entreprise (250+).

**11 questions** (dont conditionnelles) couvrant : localisation, secteur (30+ options), taille, données personnelles, entité régulée, services IT/Cloud, activité santé, paiement carte, activité US, certifications, continuité d'activité.

---

## i18n (FR/EN)

Langue détectée dans cet ordre :
1. Paramètre URL `?lang=fr`
2. `localStorage` (`agilevizion_lang`)
3. `navigator.language`
4. Fallback : français

Attributs HTML utilisés : `data-i18n`, `data-i18n-html`, `data-i18n-placeholder`, `data-i18n-title`.

---

## Sécurité

- **CSP** (Content-Security-Policy) sur les 3 pages : whitelist stricte (Calendly, Google Fonts, Font Awesome CDN)
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- Protection XSS via `escapeHtml()` dans le simulateur
- Aucun secret dans le code (`.gitignore` protège `.env`)

---

## CI/CD

Pipeline GitHub Actions dans `.github/workflows/ci.yml` :
- **Lint** : ESLint sur `js/`
- **Tests unitaires** : Jest sur `tests/unit/`
- **Tests E2E** : Playwright (Desktop Chrome) sur `tests/e2e/`
- Déclenchement : push + pull request sur `main`

---

## Déploiement

**Local uniquement** — le site est servi par `python3 -m http.server`.

GitHub Pages peut être activé sur la branche `main` depuis les Settings du dépôt.
Aucun fichier de configuration de déploiement externe (Vercel, Netlify, etc.) n'est présent.

---

## Conventions de développement

- **Commits en français** : `Verbe action : description courte` (ex: `Ajouter : section Trusted By`)
- **CSS** : jamais d'inline styles, toujours des classes
- **JS** : ES5 pour `simulator.js` (compatibilité maximale), ES6 pour les autres modules
- **Design tokens** : toutes les valeurs dans `css/variables.css` — ne jamais coder en dur couleurs/espacements
- **Palette** : Indigo (#4F46E5) primaire, Emerald (#10B981) accent

---

## Contacts

- **Site** : [agilevizion.com](https://agilevizion.com)
- **Email** : emmanuel.genesteix@agilevizion.com
- **Téléphone** : +352.661.78.08.07
- **Localisation** : Luxembourg (interventions Europe)
