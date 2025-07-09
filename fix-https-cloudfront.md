# Guide pour activer HTTPS avec CloudFront

## Problème
S3 Static Website Hosting ne supporte que HTTP. Pour HTTPS, il faut CloudFront.

## Solution : Configurer CloudFront

### Étape 1: Créer une distribution CloudFront

1. **Console AWS** → **CloudFront**
2. Cliquez **"Create Distribution"**
3. **Origin Domain** : Sélectionnez votre bucket S3
4. **Origin Path** : Laissez vide
5. **Viewer Protocol Policy** : **"Redirect HTTP to HTTPS"** ⭐
6. **Allowed HTTP Methods** : **"GET, HEAD, OPTIONS"**
7. **Cache Policy** : **"CachingOptimized"**
8. Cliquez **"Create Distribution"**

### Étape 2: Attendre le déploiement

- ⏱️ **Temps** : 5-15 minutes
- **Status** : "Deployed" (vert)

### Étape 3: Tester HTTPS

Votre site sera disponible sur :
`https://xxxxxxxxx.cloudfront.net`

## Configuration avancée (Optionnel)

### Pour un nom de domaine personnalisé :

1. **Achetez un domaine** sur Route 53 ou ailleurs
2. **Ajoutez le domaine** dans CloudFront :
   - Onglet "General"
   - "Edit" → "Alternate Domain Names (CNAMEs)"
   - Ajoutez votre domaine
3. **Configurez le certificat SSL** :
   - "Edit" → "SSL Certificate"
   - "Request certificate"
   - Ajoutez votre domaine
4. **Pointez votre DNS** vers CloudFront

## Vérification

```bash
# Testez que HTTPS fonctionne
curl -I https://votre-distribution.cloudfront.net
# Doit retourner : HTTP/2 200
```

## Coûts CloudFront

- **Transfert de données** : ~0.085€/GB
- **Requêtes** : ~0.0075€/10,000 requêtes
- **Total estimé** : 1-5€/mois pour un site personnel 