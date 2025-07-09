#!/bin/bash

# Script de diagnostic et correction HTTPS
# Usage: ./fix-https-quick.sh [distribution-id] [domain]

DISTRIBUTION_ID=${1:-""}
DOMAIN=${2:-""}

echo "🔍 Diagnostic HTTPS AWS"
echo "========================"

# Vérifier AWS CLI
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI non installé"
    exit 1
fi

# Vérifier la connexion AWS
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ Non connecté à AWS"
    exit 1
fi

echo "✅ AWS CLI configuré"

# Si pas de distribution ID fourni, lister les distributions
if [ -z "$DISTRIBUTION_ID" ]; then
    echo "📋 Distributions CloudFront disponibles :"
    aws cloudfront list-distributions --query 'DistributionList.Items[?Status==`Deployed`].[Id,DomainName,Comment]' --output table
    
    echo ""
    read -p "Entrez l'ID de votre distribution : " DISTRIBUTION_ID
fi

if [ -z "$DISTRIBUTION_ID" ]; then
    echo "❌ Aucune distribution sélectionnée"
    exit 1
fi

echo "🔍 Vérification de la distribution $DISTRIBUTION_ID..."

# Vérifier le statut de la distribution
STATUS=$(aws cloudfront get-distribution --id $DISTRIBUTION_ID --query 'Distribution.Status' --output text 2>/dev/null)

if [ $? -ne 0 ]; then
    echo "❌ Distribution $DISTRIBUTION_ID non trouvée"
    exit 1
fi

echo "📊 Statut de la distribution : $STATUS"

if [ "$STATUS" != "Deployed" ]; then
    echo "⏳ Distribution en cours de déploiement, attendez..."
    echo "⏱️  Cela peut prendre 5-15 minutes"
    exit 1
fi

# Obtenir l'URL de la distribution
DOMAIN_NAME=$(aws cloudfront get-distribution --id $DISTRIBUTION_ID --query 'Distribution.DomainName' --output text)

echo "🌐 URL CloudFront : $DOMAIN_NAME"

# Vérifier la configuration HTTPS
echo "🔒 Vérification de la configuration HTTPS..."

PROTOCOL_POLICY=$(aws cloudfront get-distribution --id $DISTRIBUTION_ID --query 'Distribution.DistributionConfig.DefaultCacheBehavior.ViewerProtocolPolicy' --output text)

echo "📋 Protocole configuré : $PROTOCOL_POLICY"

if [ "$PROTOCOL_POLICY" != "redirect-to-https" ]; then
    echo "⚠️  Le protocole n'est pas configuré pour rediriger vers HTTPS"
    echo "🔧 Correction en cours..."
    
    # Obtenir la configuration complète
    aws cloudfront get-distribution-config --id $DISTRIBUTION_ID --query 'DistributionConfig' > /tmp/dist-config.json
    
    # Modifier le protocole
    sed -i 's/"ViewerProtocolPolicy": "allow-all"/"ViewerProtocolPolicy": "redirect-to-https"/g' /tmp/dist-config.json
    
    # Mettre à jour la distribution
    ETAG=$(aws cloudfront get-distribution-config --id $DISTRIBUTION_ID --query 'ETag' --output text)
    
    aws cloudfront update-distribution \
        --id $DISTRIBUTION_ID \
        --distribution-config file:///tmp/dist-config.json \
        --if-match $ETAG
    
    echo "✅ Configuration HTTPS mise à jour"
    echo "⏳ Attendez 5-10 minutes pour que les changements se propagent"
else
    echo "✅ Configuration HTTPS correcte"
fi

# Tester HTTPS
echo "🧪 Test de HTTPS..."
HTTPS_TEST=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN_NAME" 2>/dev/null)

if [ "$HTTPS_TEST" = "200" ]; then
    echo "✅ HTTPS fonctionne !"
else
    echo "❌ HTTPS ne fonctionne pas (Code: $HTTPS_TEST)"
fi

# Invalider le cache
echo "🗑️  Invalidation du cache CloudFront..."
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Cache invalidé"
else
    echo "⚠️  Impossible d'invalider le cache"
fi

# Résultats finaux
echo ""
echo "🎯 Résumé :"
echo "URL HTTPS : https://$DOMAIN_NAME"
echo "Distribution ID : $DISTRIBUTION_ID"
echo ""
echo "📝 Commandes utiles :"
echo "- Vérifier le statut : aws cloudfront get-distribution --id $DISTRIBUTION_ID"
echo "- Invalider le cache : aws cloudfront create-invalidation --id $DISTRIBUTION_ID --paths '/*'"
echo "- Tester HTTPS : curl -I https://$DOMAIN_NAME"

# Ouvrir le site
read -p "Voulez-vous ouvrir le site dans votre navigateur ? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    xdg-open "https://$DOMAIN_NAME" 2>/dev/null || \
    open "https://$DOMAIN_NAME" 2>/dev/null || \
    echo "Impossible d'ouvrir automatiquement le navigateur"
fi 