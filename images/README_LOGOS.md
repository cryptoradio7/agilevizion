# Logos AgileVizion

## Formats disponibles

### 1. `logo-horizontal.svg` (Recommandé)
- **Usage** : Carte de visite, en-tête LinkedIn, signature email
- **Format** : SVG vectoriel (qualité infinie)
- **Dimensions** : 500x140px
- **Fond** : Transparent
- **Couleurs** : Agile (blanc) + Vizion (bleu #2563eb)

### 2. `logo-dark-bg.svg`
- **Usage** : Fond sombre (LinkedIn, cartes de visite sombres)
- **Format** : SVG avec fond sombre (#1a202c)
- **Dimensions** : 500x140px

### 3. `logo-light-bg.svg`
- **Usage** : Fond clair (papier, cartes de visite blanches)
- **Format** : SVG avec fond blanc
- **Dimensions** : 500x140px
- **Couleurs** : Agile (noir) + Vizion (bleu)

### 4. `logo-square.svg`
- **Usage** : Photo de profil LinkedIn, favicon, icône
- **Format** : SVG carré 200x200px
- **Fond** : Sombre avec coins arrondis

## Utilisation

### Sur LinkedIn
1. **Photo de profil** : Utilisez `logo-square.svg`
2. **Bannière** : Utilisez `logo-horizontal.svg` ou `logo-dark-bg.svg`

### Sur carte de visite
- **Fond clair** : `logo-light-bg.svg`
- **Fond sombre** : `logo-dark-bg.svg`
- **Fond transparent** : `logo-horizontal.svg`

### Conversion en PNG (si nécessaire)
```bash
# Installer ImageMagick
sudo apt-get install imagemagick

# Convertir en PNG haute résolution
convert -density 300 logo-horizontal.svg -resize 1500x420 logo-horizontal.png
convert -density 300 logo-square.svg -resize 600x600 logo-square.png
```

## Avantages du format SVG
- ✅ Qualité parfaite à toutes les tailles
- ✅ Fichier léger
- ✅ Modifiable avec n'importe quel éditeur de texte
- ✅ Compatible avec tous les navigateurs modernes
- ✅ Parfait pour l'impression professionnelle

## Personnalisation
Les fichiers SVG peuvent être édités pour :
- Changer les couleurs
- Ajuster la taille
- Modifier la police
- Ajouter des éléments graphiques

