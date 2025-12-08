# AgileVizion Website - Structure Refactorisée

## 📁 Structure des fichiers

```
agilevizion/
├── index.html              # Page GRC Cybersécurité (page principale)
├── service-management.html # Page Service Management IT
├── why-me.html             # Page Pourquoi moi
├── simulator.html          # Page Simulateur (à compléter)
├── CNAME                   # Configuration domaine
│
├── css/
│   ├── common.css          # Styles de base (navbar, footer, composants)
│   ├── themes.css          # Couleurs par page (theme-grc, theme-service, theme-whyme)
│   └── responsive.css      # Styles mobile/tablette
│
├── js/
│   ├── i18n.js             # Gestion multilingue (FR/EN)
│   └── components.js       # Header et Footer dynamiques
│
├── lang/
│   ├── en.json             # Traductions anglais
│   └── fr.json             # Traductions français
│
├── images/
│   └── top.jpg             # Photo profil
│
└── social_proof/
    ├── Diploma.pdf
    └── Employment_certificates.pdf
```

## 🌍 Gestion des Langues

### Avant (ancienne structure)
- Fichiers dupliqués : `FR/index.html`, `EN/index.html`, etc.
- Contenu hardcodé dans chaque fichier
- Maintenance difficile (modifier texte = modifier 2 fichiers)

### Après (nouvelle structure)
- **1 seul fichier HTML par page**
- Contenu dans des fichiers JSON (`lang/en.json`, `lang/fr.json`)
- Changement de langue sans rechargement de page

### Comment ça marche

1. **Détection automatique** : La langue est détectée depuis :
   - Paramètre URL (`?lang=fr`)
   - localStorage (préférence sauvegardée)
   - Langue du navigateur

2. **Attributs data-i18n** : 
   ```html
   <h1 data-i18n="grc.hero_h1">Fallback text</h1>
   <p data-i18n="grc.banner_text" data-i18n-html>HTML content</p>
   ```

3. **Changement de langue** :
   ```javascript
   I18n.switchLanguage('fr'); // Bascule en français
   I18n.switchLanguage('en'); // Bascule en anglais
   ```

## 🎨 Gestion des Couleurs (Thèmes)

Chaque page utilise une classe CSS de thème :

| Page | Classe | Couleur principale |
|------|--------|-------------------|
| GRC Cybersécurité | `theme-grc` | Rouge (#c0392b) |
| Service Management | `theme-service` | Vert (#27ae60) |
| Pourquoi moi | `theme-whyme` | Violet (#667eea) |

### Variables CSS disponibles
```css
--primary-color      /* Couleur principale */
--primary-dark       /* Couleur plus foncée */
--hero-gradient      /* Dégradé pour le hero */
--navbar-active-bg   /* Fond menu actif */
```

## 📱 Responsive

Le fichier `css/responsive.css` gère les breakpoints :
- **Tablette** : max-width 900px
- **Mobile** : max-width 768px
- **Petit mobile** : max-width 480px

## 🔧 Composants Réutilisables

### Header (Navbar)
Généré automatiquement par `js/components.js`
- Logo cliquable
- Menu de navigation
- Sélecteur de langue (FR/EN)

### Footer
Généré automatiquement par `js/components.js`
- Informations de contact
- Liens sociaux (LinkedIn)
- Copyright

### Configuration
Dans `js/components.js` :
```javascript
CONFIG: {
    email: 'emmanuel.genesteix@agilevizion.com',
    phone: '+352.661.78.08.07',
    linkedin: 'https://www.linkedin.com/in/genesteix-emmanuel/',
    calendly: 'https://calendly.com/emmanuel-genesteix-agilevizion/...'
}
```

## ✏️ Comment modifier

### Ajouter/modifier une traduction
1. Éditer `lang/en.json` et `lang/fr.json`
2. Ajouter l'attribut `data-i18n="clé"` dans le HTML

### Ajouter une nouvelle page
1. Créer le fichier HTML
2. Ajouter les classes de thème appropriées
3. Inclure les scripts i18n.js et components.js
4. Ajouter les traductions dans les fichiers JSON
5. Ajouter au menu dans `js/components.js` (MENU_ITEMS)

### Modifier les couleurs d'une page
1. Éditer `css/themes.css`
2. Modifier les variables du thème concerné

## 📋 Checklist déploiement

- [ ] Vérifier que tous les liens fonctionnent
- [ ] Tester le changement de langue
- [ ] Vérifier le responsive sur mobile
- [ ] Vérifier que Calendly fonctionne
- [ ] Vérifier les PDFs (diplômes, certificats)
- [ ] Mettre à jour le CNAME si nécessaire

## 🚀 Prochaines étapes

1. **Simulateur** : Intégrer le contenu de `FR_simulator.html` / `EN_simulator.html`
2. **SEO** : Ajouter meta descriptions, og:tags
3. **Performance** : Minifier CSS/JS pour production
