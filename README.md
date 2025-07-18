# 🚀 Landing Page Agile Vizion

## 📋 Description
Landing page moderne et responsive pour Agile Vizion, développée avec HTML5, CSS3 et JavaScript vanilla. Cette page présente les services et solutions de l'entreprise avec une interface utilisateur moderne et des animations fluides.

## 🌐 Configuration des Ports

### **Ports Utilisés**
- **Landing Page** : Port 3004 (http://localhost:3004)
- **BLOCKS** : Port 3001 (http://localhost:3001)
- **CRM Frontend** : Port 3002 (http://localhost:3002)
- **CRM Backend** : Port 3003 (http://localhost:3003)

### **Architecture des Applications**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Landing Page  │    │     BLOCKS      │    │   CRM Frontend  │    │   CRM Backend   │
│   (Static HTML) │    │   (React/Vite)  │    │   (React/Vite)  │    │   (Node.js)     │
│   Port: 3004    │    │   Port: 3001    │    │   Port: 3002    │    │   Port: 3003    │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Lancement Rapide

### **Méthode 1 : Script de Lancement Principal**
```bash
./launch.sh
```

### **Méthode 2 : Script GUI (pour le lanceur desktop)**
```bash
./launch-gui.sh
```

### **Méthode 3 : Lancement Manuel**
```bash
# Démarrer le serveur Python
python3 server.py

# Ouvrir le navigateur
xdg-open http://localhost:3004
```

## 📁 Structure du Projet

```
PAGE_VENTE/
├── index.html          # Page principale
├── styles.css          # Styles CSS
├── script.js           # JavaScript
├── lang.js             # Fichier de langues
├── server.py           # Serveur Python
├── launch.sh           # Script de lancement principal
├── launch-gui.sh       # Script de lancement GUI
├── Landing-Page-Final.desktop  # Lanceur desktop
├── icon-landing-page.png       # Icône PNG
├── icon-landing-page.svg       # Icône SVG
└── specs/              # Spécifications
```

## 🔧 Configuration du Serveur

### **Serveur Python (server.py)**
- **Port** : 3004
- **Protocole** : HTTP
- **Gestion des erreurs** : Port déjà utilisé
- **CORS** : Activé pour le développement

### **Variables d'Environnement**
```bash
PORT=3004
HOST=localhost
```

## 🎨 Fonctionnalités

### **Interface Utilisateur**
- ✅ Design responsive
- ✅ Animations fluides
- ✅ Thème vert moderne
- ✅ Navigation intuitive
- ✅ Support multilingue

### **Performance**
- ✅ Chargement rapide
- ✅ Optimisation des images
- ✅ Code minifié
- ✅ Cache navigateur

## 🌐 URLs d'Accès

### **Environnement Local**
- **Landing Page** : http://localhost:3004
- **BLOCKS** : http://localhost:3001
- **CRM Frontend** : http://localhost:3002
- **CRM Backend API** : http://localhost:3003/api

### **Environnement de Production**
- **Landing Page** : https://agilevizion.com
- **BLOCKS** : https://blocks.agilevizion.com
- **CRM** : https://crm.agilevizion.com

## 🛠️ Développement

### **Prérequis**
- Python 3.7+
- Navigateur web moderne
- Serveur HTTP (optionnel)

### **Installation**
```bash
# Cloner le repository
git clone https://github.com/cryptoradio7/agilevizion.git

# Se placer dans le répertoire
cd PAGE_VENTE

# Lancer l'application
./launch.sh
```

### **Modification du Contenu**
1. **HTML** : Modifier `index.html`
2. **Styles** : Modifier `styles.css`
3. **JavaScript** : Modifier `script.js`
4. **Langues** : Modifier `lang.js`

## 🔍 Dépannage

### **Problèmes Courants**

#### **Port 3004 déjà utilisé**
```bash
# Vérifier les processus
ps aux | grep python3

# Tuer le processus
kill -9 <PID>

# Relancer
./launch.sh
```

#### **Erreur de permissions**
```bash
# Rendre les scripts exécutables
chmod +x launch.sh launch-gui.sh server.py
```

#### **Page blanche**
```bash
# Vérifier les logs du serveur
python3 server.py

# Vérifier les erreurs console (F12)
```

## 📞 Support

Pour toute question ou problème :
- **Email** : support@agilevizion.com
- **Documentation** : https://docs.agilevizion.com
- **Issues** : https://github.com/cryptoradio7/agilevizion/issues

## 📄 Licence

© 2024 Agile Vizion. Tous droits réservés.

---

**Dernière mise à jour** : 18 juillet 2024
**Version** : 2.0.0
**Statut** : Production Ready ✅ 