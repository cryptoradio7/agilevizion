# Migration vers AWS Amplify (HTTPS gratuit)

## Pourquoi migrer vers Amplify ?

✅ **HTTPS gratuit**  
✅ **Déploiement automatique**  
✅ **Interface simple**  
✅ **CDN global**  
✅ **Pas de configuration complexe**

## Étape 1: Préparer votre code

```bash
# Si pas déjà fait, initialisez Git
git init
git add .
git commit -m "Initial commit"

# Créez un repository GitHub
# Poussez votre code
git remote add origin https://github.com/votre-username/votre-repo.git
git push -u origin main
```

## Étape 2: Déployer avec Amplify

1. **Console AWS** → **Amplify**
2. **"New app"** → **"Host web app"**
3. **"GitHub"** → Connectez votre compte
4. **Sélectionnez votre repository**
5. **"Next"** → **"Save and deploy"**

## Étape 3: Configuration automatique

Amplify va :
- ✅ Détecter automatiquement que c'est un site statique
- ✅ Configurer HTTPS automatiquement
- ✅ Déployer sur CDN global
- ✅ Vous donner une URL HTTPS

## Étape 4: Votre site HTTPS

Votre site sera disponible sur :
`https://main.xxxxxxxxx.amplifyapp.com`

## Avantages vs S3 + CloudFront

| Fonctionnalité | S3 + CloudFront | Amplify |
|---|---|---|
| HTTPS | ❌ Configuration complexe | ✅ Automatique |
| Déploiement | ❌ Manuel | ✅ Automatique |
| Interface | ❌ Complexe | ✅ Simple |
| Coût | ❌ ~3-5€/mois | ✅ Gratuit 12 mois |
| Maintenance | ❌ Élevée | ✅ Minimale |

## Migration recommandée

Si vous voulez HTTPS facilement, **migrez vers Amplify** ! 