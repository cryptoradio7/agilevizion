# Configuration du workflow GitHub Pages

## Problème
Les workflows GitHub Pages sont annulés automatiquement quand plusieurs commits sont faits rapidement.

## Solution
Un fichier de workflow a été créé dans `.github/workflows/pages.yml` avec la configuration suivante :
- `cancel-in-progress: false` - Empêche l'annulation automatique des workflows en cours
- `if: always()` sur le job deploy - Empêche l'annulation du job de déploiement

## Action requise

Votre token GitHub n'a pas la permission `workflow`. Pour que le workflow fonctionne :

1. Allez sur https://github.com/settings/tokens
2. Créez un nouveau token ou modifiez le token existant
3. Cochez la permission **`workflow`**
4. Mettez à jour votre token dans `.git/config` ou utilisez-le pour push

OU

1. Allez sur https://github.com/cryptoradio7/agilevizion/settings/pages
2. Vérifiez que "Source" est configuré sur "GitHub Actions"
3. Créez manuellement le fichier `.github/workflows/pages.yml` sur GitHub avec le contenu suivant :

```yaml
name: Pages build and deployment

on:
  push:
    branches:
      - master
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

# Empêche l'annulation automatique des workflows en cours
concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Pages
        uses: actions/configure-pages@v4
      - name: Build with Jekyll
        uses: actions/jekyll-build-pages@v1
        with:
          source: ./
          destination: ./_site
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    # Empêche l'annulation du job deploy
    if: always()
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

Une fois le workflow créé, les déploiements ne seront plus annulés automatiquement.



