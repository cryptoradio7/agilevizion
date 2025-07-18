#!/bin/bash

# Script de lancement pour Agile Vizion
# Lance un serveur local et ouvre le navigateur

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Vérifier que les fichiers nécessaires existent
if [ ! -f "index.html" ]; then
    echo "❌ Erreur: index.html non trouvé dans le répertoire courant"
    exit 1
fi

if [ ! -f "server.py" ]; then
    echo "❌ Erreur: server.py non trouvé dans le répertoire courant"
    exit 1
fi

# Vérifier si Python est disponible
if ! command -v python3 &> /dev/null; then
    echo "❌ Erreur: Python3 n'est pas installé"
    exit 1
fi

echo "🚀 Lancement d'Agile Vizion..."
echo "📁 Répertoire: $SCRIPT_DIR"
echo "🌐 URL: http://localhost:8080"

# Ouvrir le navigateur après un délai
(sleep 2 && xdg-open http://localhost:8080) &

# Lancer le serveur Python
python3 server.py 