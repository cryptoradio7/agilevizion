# 🚀 HTTPS en 5 minutes avec AWS Amplify

## Étape 1 : Créer un repository GitHub (2 min)

1. **Allez sur GitHub.com**
2. **Créez un nouveau repository** (ex: `mon-site-web`)
3. **Ne cochez PAS** "Add a README file"
4. Cliquez **"Create repository"**

## Étape 2 : Uploader vos fichiers (1 min)

```bash
# Dans votre dossier PAGE_VENTE
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/VOTRE_USERNAME/mon-site-web.git
git push -u origin main
```

## Étape 3 : Déployer avec Amplify (2 min)

1. **Console AWS** → **Amplify**
2. **"New app"** → **"Host web app"**
3. **"GitHub"** → Connectez votre compte
4. **Sélectionnez votre repository**
5. **"Next"** → **"Save and deploy"**

## Étape 4 : Votre site HTTPS est prêt !

Votre site sera disponible sur :
`https://main.xxxxxxxxx.amplifyapp.com`

✅ **HTTPS automatique**  
✅ **Pas de configuration**  
✅ **Gratuit 12 mois**  
✅ **CDN global**

## Alternative : Si vous voulez garder S3

Si vous préférez garder S3, dites-moi votre URL S3 et je vous guide pour CloudFront. 