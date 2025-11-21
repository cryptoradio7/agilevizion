#!/bin/bash

# Script de lancement pour Agile Vizion
# Lance un serveur local et ouvre le navigateur

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Vérifier que les fichiers nécessaires existent
if [ ! -f "index.html" ]; then
    echo -e "${RED}❌ Erreur: index.html non trouvé dans le répertoire courant${NC}"
    exit 1
fi

if [ ! -f "server.py" ]; then
    echo -e "${RED}❌ Erreur: server.py non trouvé dans le répertoire courant${NC}"
    exit 1
fi

# Vérifier si Python est disponible
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Erreur: Python3 n'est pas installé${NC}"
    exit 1
fi

# Vérifier si le serveur est déjà en cours d'exécution
if pgrep -f "python3.*server.py" > /dev/null && curl -s http://localhost:3004 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Page de vente déjà en cours d'exécution sur le port 3004${NC}"
    echo -e "${BLUE}🌐 URL: ${GREEN}http://localhost:3004${NC}"
    echo -e "${YELLOW}Ouverture du navigateur...${NC}"
    
    # Essayer différents navigateurs
    echo -e "${YELLOW}🌐 Ouverture du navigateur...${NC}"
    if command -v google-chrome &> /dev/null; then
        google-chrome --new-window http://localhost:3004
    elif command -v firefox &> /dev/null; then
        firefox --new-window http://localhost:3004
    elif command -v chromium-browser &> /dev/null; then
        chromium-browser --new-window http://localhost:3004
    else
        xdg-open http://localhost:3004
    fi
    
    echo -e "${GREEN}✅ Page de vente ouverte avec succès!${NC}"
    echo -e "${YELLOW}Appuyez sur Ctrl+C pour fermer${NC}"
    
    # Attendre indéfiniment
    while true; do
        sleep 1
    done
else
    echo -e "${BLUE}🚀 Lancement de la page de vente Agile Vizion...${NC}"
    echo -e "${BLUE}📁 Répertoire: $SCRIPT_DIR${NC}"
    echo -e "${BLUE}🌐 URL: ${GREEN}http://localhost:3004${NC}"

    # Lancer le serveur Python en arrière-plan
    python3 server.py &
    SERVER_PID=$!
    
    # Attendre que le serveur démarre
    echo -e "${BLUE}⏳ Attente du démarrage du serveur...${NC}"
    sleep 3
    
    # Vérifier que le serveur fonctionne
    if curl -s http://localhost:3004 > /dev/null; then
        echo -e "${GREEN}✅ Serveur démarré avec succès!${NC}"
        echo -e "${YELLOW}🌐 Ouverture du navigateur...${NC}"
        sleep 2
        # Essayer différents navigateurs avec l'URL complète
        if command -v google-chrome &> /dev/null; then
            google-chrome --new-window http://localhost:3004
        elif command -v firefox &> /dev/null; then
            firefox --new-window http://localhost:3004
        elif command -v chromium-browser &> /dev/null; then
            chromium-browser --new-window http://localhost:3004
        else
            xdg-open http://localhost:3004
        fi
        echo -e "${YELLOW}Appuyez sur Ctrl+C pour arrêter le serveur${NC}"
        
        # Attendre que l'utilisateur arrête le script
        wait $SERVER_PID
    else
        echo -e "${RED}❌ Erreur: Le serveur n'a pas démarré correctement${NC}"
        kill $SERVER_PID 2>/dev/null
        exit 1
    fi
fi 