#!/bin/bash

# Script pour configurer CloudFront et activer HTTPS
# Usage: ./setup-cloudfront.sh [bucket-name]

BUCKET_NAME=${1:-"votre-nom-site-web"}
REGION="eu-west-3"

echo "🌐 Configuration de CloudFront pour HTTPS..."
echo "Bucket: $BUCKET_NAME"

# Vérifier que AWS CLI est installé
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI n'est pas installé."
    exit 1
fi

# Vérifier que l'utilisateur est connecté
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ Vous n'êtes pas connecté à AWS."
    exit 1
fi

# Obtenir l'URL du bucket S3
BUCKET_URL="$BUCKET_NAME.s3-website-$REGION.amazonaws.com"

echo "📦 URL du bucket S3: $BUCKET_URL"

# Créer la distribution CloudFront
echo "🚀 Création de la distribution CloudFront..."

DISTRIBUTION_CONFIG=$(cat <<EOF
{
    "CallerReference": "$(date +%s)",
    "Origins": {
        "Quantity": 1,
        "Items": [
            {
                "Id": "S3-$BUCKET_NAME",
                "DomainName": "$BUCKET_URL",
                "CustomOriginConfig": {
                    "HTTPPort": 80,
                    "HTTPSPort": 443,
                    "OriginProtocolPolicy": "http-only"
                }
            }
        ]
    },
    "DefaultCacheBehavior": {
        "TargetOriginId": "S3-$BUCKET_NAME",
        "ViewerProtocolPolicy": "redirect-to-https",
        "TrustedSigners": {
            "Enabled": false,
            "Quantity": 0
        },
        "TrustedKeyGroups": {
            "Enabled": false,
            "Quantity": 0
        },
        "ViewerProtocolPolicy": "redirect-to-https",
        "AllowedMethods": {
            "Quantity": 7,
            "Items": ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"],
            "CachedMethods": {
                "Quantity": 2,
                "Items": ["GET", "HEAD"]
            }
        },
        "SmoothStreaming": false,
        "Compress": true,
        "LambdaFunctionAssociations": {
            "Quantity": 0
        },
        "FunctionAssociations": {
            "Quantity": 0
        },
        "FieldLevelEncryptionId": "",
        "CachePolicyId": "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"
    },
    "Comment": "Distribution pour $BUCKET_NAME",
    "Logging": {
        "Enabled": false,
        "IncludeCookies": false,
        "Bucket": "",
        "Prefix": ""
    },
    "PriceClass": "PriceClass_100",
    "Enabled": true
}
EOF
)

# Créer la distribution
DISTRIBUTION_ID=$(aws cloudfront create-distribution \
    --distribution-config "$DISTRIBUTION_CONFIG" \
    --query 'Distribution.Id' \
    --output text)

echo "✅ Distribution CloudFront créée: $DISTRIBUTION_ID"

# Attendre que la distribution soit déployée
echo "⏳ Attente du déploiement (peut prendre 5-15 minutes)..."
while true; do
    STATUS=$(aws cloudfront get-distribution \
        --id $DISTRIBUTION_ID \
        --query 'Distribution.Status' \
        --output text)
    
    if [ "$STATUS" = "Deployed" ]; then
        break
    fi
    
    echo "Status: $STATUS - Attente..."
    sleep 30
done

# Obtenir l'URL CloudFront
CLOUDFRONT_URL=$(aws cloudfront get-distribution \
    --id $DISTRIBUTION_ID \
    --query 'Distribution.DomainName' \
    --output text)

echo "✅ Déploiement terminé !"
echo "🌍 Votre site HTTPS est disponible sur :"
echo "https://$CLOUDFRONT_URL"

# Tester HTTPS
echo "🧪 Test de HTTPS..."
if curl -s -I "https://$CLOUDFRONT_URL" | grep -q "HTTP/2 200\|HTTP/1.1 200"; then
    echo "✅ HTTPS fonctionne correctement !"
else
    echo "⚠️  HTTPS pourrait ne pas être encore actif, attendez quelques minutes"
fi

# Ouvrir le site
read -p "Voulez-vous ouvrir le site dans votre navigateur ? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    xdg-open "https://$CLOUDFRONT_URL" 2>/dev/null || \
    open "https://$CLOUDFRONT_URL" 2>/dev/null || \
    echo "Impossible d'ouvrir automatiquement le navigateur"
fi

echo ""
echo "📝 Informations importantes :"
echo "- Distribution ID: $DISTRIBUTION_ID"
echo "- URL HTTPS: https://$CLOUDFRONT_URL"
echo "- Pour invalider le cache: aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths '/*'" 