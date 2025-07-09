#!/bin/bash

# Script de déploiement automatique vers AWS S3
# Usage: ./deploy.sh [bucket-name]

BUCKET_NAME=${1:-"votre-nom-site-web"}
REGION="eu-west-3"

echo "🚀 Déploiement vers AWS S3..."
echo "Bucket: $BUCKET_NAME"
echo "Région: $REGION"

# Vérifier que AWS CLI est installé
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI n'est pas installé. Installez-le d'abord."
    echo "https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

# Vérifier que l'utilisateur est connecté
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ Vous n'êtes pas connecté à AWS. Exécutez 'aws configure' d'abord."
    exit 1
fi

# Créer le bucket s'il n'existe pas
echo "📦 Vérification/création du bucket..."
aws s3api head-bucket --bucket $BUCKET_NAME 2>/dev/null || {
    echo "Création du bucket $BUCKET_NAME..."
    aws s3api create-bucket \
        --bucket $BUCKET_NAME \
        --region $REGION \
        --create-bucket-configuration LocationConstraint=$REGION
}

# Configurer le bucket pour l'hébergement web
echo "🌐 Configuration de l'hébergement web..."
aws s3api put-bucket-website \
    --bucket $BUCKET_NAME \
    --website-configuration '{
        "IndexDocument": {"Suffix": "index.html"},
        "ErrorDocument": {"Key": "index.html"}
    }'

# Configurer les permissions publiques
echo "🔓 Configuration des permissions..."
aws s3api put-public-access-block \
    --bucket $BUCKET_NAME \
    --public-access-block-configuration \
        "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

# Appliquer la politique de bucket
echo "📋 Application de la politique de bucket..."
aws s3api put-bucket-policy \
    --bucket $BUCKET_NAME \
    --policy '{
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "PublicReadGetObject",
                "Effect": "Allow",
                "Principal": "*",
                "Action": "s3:GetObject",
                "Resource": "arn:aws:s3:::'$BUCKET_NAME'/*"
            }
        ]
    }'

# Synchroniser les fichiers
echo "📤 Upload des fichiers..."
aws s3 sync . s3://$BUCKET_NAME \
    --exclude "*.py" \
    --exclude "*.md" \
    --exclude "*.sh" \
    --exclude ".git/*" \
    --exclude "deploy-*.md" \
    --delete

# Afficher l'URL du site
echo "✅ Déploiement terminé !"
echo "🌍 Votre site est disponible sur :"
echo "http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"

# Optionnel : ouvrir le site dans le navigateur
read -p "Voulez-vous ouvrir le site dans votre navigateur ? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    xdg-open "http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com" 2>/dev/null || \
    open "http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com" 2>/dev/null || \
    echo "Impossible d'ouvrir automatiquement le navigateur"
fi 