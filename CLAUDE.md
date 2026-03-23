# CLAUDE.md — AgileVizion

## Projet

Site vitrine GRC Cybersécurité pour Emmanuel Genesteix (AgileVizion).
Stack : HTML/CSS/JS statique, déployé via GitHub Pages (GitHub Actions).

- Repo : https://github.com/cryptoradio7/agilevizion
- Branche unique : `main` (master supprimé)
- Domaine : agilevizion.com
- Déploiement : workflow `.github/workflows/pages.yml` (build_type: workflow)

## Structure

```
index.html          # Page principale (GRC)
css/                # Styles
js/
  i18n.js           # Système de traduction (FR/EN)
  loader.js         # Chargement header/footer depuis pages_gen/
  version.js        # Cache busting automatique
lang/
  fr.json           # Traductions françaises
  en.json           # Traductions anglaises
pages_gen/          # Header/footer générés (partagés)
pages_specs/        # Pages spécifiques (sous-dossiers)
images/             # Assets visuels
social_proof/       # Preuves sociales
```

## Conventions

- Langue par défaut : anglais dans le HTML, français chargé via i18n.js
- Clés de traduction : `data-i18n="section.key"` dans le HTML
- Cache busting : automatique via `js/version.js` (timestamp + hash)
- Commits en français, style : "Verbe action : description courte"

## Git & Déploiement

- Push sur `main` declenche automatiquement le workflow GitHub Pages
- Delai de deploiement : 2-5 minutes apres push
- Le workflow copie tout dans `_site/` sauf `.git`, `node_modules`, `.github`
- `.nojekyll` est ajoute automatiquement par le workflow

## Preferences utilisateur

- Communication en francais
- Aller droit au but, pas de bavardage
- Ne pas demander confirmation sauf pour les operations destructives
- Commit et push quand demande explicitement
- Profil INTP : conceptualiser avant d'agir, expliquer le "pourquoi"

## Securite

- Ne JAMAIS mettre de tokens/mots de passe dans le code ou les commits
- URL remote sans token (credentials via git credential helper)
- .gitignore protege : .env, credentials, cles privees, settings.local.json

## Automatisation (a developper)

- Skills custom : a creer dans `.claude/skills/` selon les besoins
- Hooks : a configurer pour linting, validation pre-commit
- MCP : a connecter selon les services utilises
- Loop : monitoring deploiement avec `/loop`
