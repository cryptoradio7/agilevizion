# Guide de déploiement AWS Amplify (Plus simple)

## Étape 1: Préparer votre projet

AWS Amplify peut déployer directement depuis GitHub. Créez un repository :

```bash
# Initialiser Git si pas déjà fait
git init
git add .
git commit -m "Initial commit"

# Créer un repository sur GitHub et pousser
git remote add origin https://github.com/votre-username/votre-repo.git
git push -u origin main
```

## Étape 2: Déployer avec Amplify

1. Connectez-vous à la console AWS
2. Cherchez "Amplify" dans les services
3. Cliquez "New app" → "Host web app"
4. Choisissez "GitHub" comme source
5. Connectez votre compte GitHub
6. Sélectionnez votre repository
7. Cliquez "Next"

## Étape 3: Configuration du build

Amplify détectera automatiquement que c'est un site statique. Les paramètres par défaut fonctionnent :

- Build settings : `amplify.yml` (créé automatiquement)
- Ou utilisez ces paramètres :
  - Build command : `echo "No build required"`
  - Output directory : `/`

## Étape 4: Déploiement

1. Cliquez "Save and deploy"
2. Amplify va automatiquement :
   - Récupérer votre code
   - Déployer sur CDN global
   - Vous donner une URL HTTPS

## Étape 5: URL de votre site

Votre site sera disponible sur :
`https://main.xxxxxxxxx.amplifyapp.com`

## Avantages d'Amplify

- ✅ Déploiement automatique à chaque push Git
- ✅ HTTPS gratuit
- ✅ CDN global
- ✅ Pas de configuration complexe
- ✅ Interface simple

## Coûts

- Gratuit pour les 12 premiers mois
- Ensuite : ~1-5€/mois selon le trafic 