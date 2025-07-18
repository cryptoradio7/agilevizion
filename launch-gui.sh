#!/bin/bash

# Script de lancement GUI pour Agile Vizion
# Lance le serveur et ouvre le navigateur

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🚀 Lancement d'Agile Vizion..."
echo "📁 Répertoire: $SCRIPT_DIR"
echo "🌐 URL: http://localhost:8080"

# Ouvrir le navigateur après un délai
(sleep 2 && xdg-open http://localhost:8080) &

# Lancer le serveur Python
python3 server.py 