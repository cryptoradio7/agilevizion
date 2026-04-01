# CLAUDE.md — AgileVizion 2

## Projet

Refonte complète du site agilevizion.com — site de vente vertical moderne.
3 pages : Landing (index.html), GRC Cybersécurité (cyber.html), IA Agentique (ia.html).

## Stack

- **HTML/CSS/JS statique** — zéro build, zéro npm, zéro framework
- **CSS** : vanilla avec custom properties (variables.css), fichiers séparés par responsabilité
- **JS** : vanilla ES5/ES6, modules séparés (i18n, simulator, nav, animations, cookies)
- **Fonts** : Inter (Google Fonts CDN)
- **Icônes** : Font Awesome 6.5 (CDN)
- **Calendly** : widget popup (CDN)
- **Déploiement** : GitHub Pages (local uniquement pour l'instant)

## Structure

```
index.html              # Landing page (hero + services + simulateur + pourquoi moi)
cyber.html              # Page GRC Cybersécurité (page de vente)
ia.html                 # Page IA Agentique (page de vente)
sitemap.xml             # SEO
css/
  variables.css         # Design tokens (couleurs, typo, spacing)
  base.css              # Reset + éléments de base
  components.css        # Composants réutilisables (cards, buttons, tags)
  layout.css            # Navbar, sections, grids, footer
  animations.css        # Animations scroll (Intersection Observer)
  simulator.css         # Styles spécifiques au simulateur
  responsive.css        # Media queries (mobile-first)
  cookies.css           # Bannière cookies
js/
  i18n.js               # Système de traduction FR/EN (migré du site v1)
  simulator.js          # Logique simulateur compliance (migrée du site v1)
  nav.js                # Navigation (scroll, mobile toggle, lang switch)
  animations.js         # Intersection Observer pour animations scroll
  cookies.js            # Bannière cookies RGPD
lang/
  fr.json               # Traductions françaises
  en.json               # Traductions anglaises
images/                 # Assets visuels (logo, photo, etc.)
references/             # Sources de contenu (lecture seule, pas commité)
logs/                   # Logs (pas commité)
```

## Conventions

- **Design tokens** : toutes les valeurs (couleurs, fonts, spacing) dans `css/variables.css`
- **Palette** : Indigo (#4F46E5) primaire, Emerald (#10B981) accent — PAS de navy/gold
- **i18n** : `data-i18n="section.key"` sur les éléments HTML, `data-i18n-html` si HTML interne
- **Animations** : classe `.animate-in` + Intersection Observer → ajoute `.visible`
- **Pas de jQuery**, pas de lodash, pas de libs externes (sauf CDN Font Awesome + Fonts)
- **Commits en français** : "Verbe action : description courte"
- **CSS** : jamais d'inline styles, toujours des classes
- **JS** : ES5 pour le simulateur (compat max), ES6 pour les nouveaux modules

## Commandes

```bash
# Serveur local
python3 -m http.server 8000

# Ouvrir dans le navigateur
xdg-open http://localhost:8000
```

## Migrations depuis le site v1

Le site v1 est dans `~/Bureau/APPS/AGILEVIZION/`. Les fichiers suivants sont migrés et adaptés :
- `js/simulator.js` — logique métier conservée, styles adaptés
- `js/i18n.js` — module conservé tel quel
- `lang/fr.json` et `lang/en.json` — clés adaptées à la nouvelle structure

## Sécurité

- Pas de tokens/secrets dans le code
- .gitignore protège : .env, logs/, references/ (data/blog-posts.json est commité)
