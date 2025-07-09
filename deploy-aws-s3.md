# Guide de déploiement AWS S3 pour votre site

## Étape 1: Préparer les fichiers

Votre site est déjà prêt ! Vous avez :
- `index.html` - Page principale
- `styles.css` - Styles CSS
- `script.js` - JavaScript
- `lang.js` - Fichier de langues

## Étape 2: Créer un bucket S3

1. Connectez-vous à la console AWS
2. Allez dans S3
3. Cliquez "Create bucket"
4. Nom du bucket : `votre-nom-site-web` (doit être unique globalement)
5. Région : choisissez la plus proche (ex: eu-west-3 pour Paris)
6. Décochez "Block all public access" (important !)
7. Cliquez "Create bucket"

## Étape 3: Configurer le bucket pour l'hébergement web

1. Sélectionnez votre bucket
2. Onglet "Properties"
3. Descendez à "Static website hosting"
4. Cliquez "Edit"
5. Sélectionnez "Enable"
6. Index document : `index.html`
7. Error document : `index.html`
8. Cliquez "Save changes"

## Étape 4: Configurer les permissions

1. Onglet "Permissions"
2. Cliquez "Edit" sur "Block public access"
3. Décochez toutes les cases
4. Cliquez "Save changes"
5. Cliquez "Edit" sur "Bucket policy"
6. Ajoutez cette politique :

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::votre-nom-site-web/*"
        }
    ]
}
```

## Étape 5: Uploader les fichiers

1. Onglet "Objects"
2. Cliquez "Upload"
3. Ajoutez tous vos fichiers :
   - `index.html`
   - `styles.css`
   - `script.js`
   - `lang.js`
4. Cliquez "Upload"

## Étape 6: Accéder à votre site

1. Onglet "Properties"
2. Section "Static website hosting"
3. Copiez l'URL (format : `http://votre-nom-site-web.s3-website-eu-west-3.amazonaws.com`)

## Étape 7: Configurer un nom de domaine (optionnel)

Pour un nom de domaine personnalisé :
1. Achetez un domaine sur Route 53 ou ailleurs
2. Configurez CloudFront pour HTTPS
3. Pointez votre domaine vers le bucket S3

## Coûts estimés

- S3 : ~0.50€/mois pour 1GB de stockage
- Transfert de données : ~0.09€/GB
- Total : moins de 1€/mois pour un site personnel 