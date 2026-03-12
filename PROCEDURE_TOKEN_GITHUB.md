# Procédure : Régénérer un token GitHub avec permission workflow

## Étape 1 : Créer un nouveau token GitHub

1. Allez sur : https://github.com/settings/tokens
2. Cliquez sur **"Generate new token"** → **"Generate new token (classic)"**
3. Donnez un nom au token (ex: "agilevizion-workflow")
4. Sélectionnez la durée d'expiration (recommandé : 90 jours ou "No expiration")
5. **IMPORTANT** : Cochez les permissions suivantes :
   - ✅ **repo** (toutes les sous-permissions)
   - ✅ **workflow** (CRITIQUE - pour modifier les workflows)
6. Cliquez sur **"Generate token"** en bas de la page
7. **COPIEZ LE TOKEN IMMÉDIATEMENT** (vous ne pourrez plus le voir après)

## Étape 2 : Mettre à jour le token dans Git

Une fois le nouveau token copié, exécutez cette commande dans le terminal :

```bash
cd /home/egx/Bureau/APPS/AGILEVIZION
git remote set-url origin https://VOTRE_NOUVEAU_TOKEN@github.com/cryptoradio7/agilevizion.git
```

Remplacez `VOTRE_NOUVEAU_TOKEN` par le token que vous venez de copier.

## Étape 3 : Pousser le workflow

Après avoir mis à jour le token, poussez le workflow :

```bash
git push origin master
```

## Vérification

Pour vérifier que le token fonctionne :
1. Allez sur : https://github.com/cryptoradio7/agilevizion/actions
2. Vous devriez voir le workflow "Pages build and deployment" s'exécuter
3. Le workflow ne devrait plus être annulé automatiquement

## Note importante

Le fichier `.github/workflows/pages.yml` contient la configuration qui empêche l'annulation automatique des workflows avec :
- `cancel-in-progress: false`
- `if: always()` sur le job deploy

Une fois poussé, vous ne devriez plus recevoir de notifications "Run cancelled".



