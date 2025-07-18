#!/usr/bin/env python3
"""
Serveur HTTP simple pour Agile Vizion
Lance la page de vente sur http://localhost:8080
"""

import http.server
import socketserver
import os
import webbrowser
import threading
import time
from urllib.parse import urlparse

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def end_headers(self):
        # Ajouter des headers pour éviter les problèmes de cache
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

def open_browser():
    """Ouvre le navigateur après un court délai"""
    time.sleep(1)
    webbrowser.open(f'http://localhost:{PORT}')

def main():
    os.chdir(DIRECTORY)
    
    with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
        print(f"🚀 Serveur Agile Vizion démarré sur http://localhost:{PORT}")
        print(f"📁 Répertoire: {DIRECTORY}")
        print("🌐 Ouverture automatique du navigateur...")
        print("⏹️  Appuyez sur Ctrl+C pour arrêter le serveur")
        
        # Ouvrir le navigateur dans un thread séparé
        browser_thread = threading.Thread(target=open_browser)
        browser_thread.daemon = True
        browser_thread.start()
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Arrêt du serveur...")
            httpd.shutdown()

if __name__ == "__main__":
    main() 