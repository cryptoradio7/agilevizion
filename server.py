from http.server import HTTPServer, SimpleHTTPRequestHandler
import os

class LanguageHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        # Si l'URL est la racine, rediriger vers /fr/
        if self.path == '/':
            self.send_response(302)
            self.send_header('Location', '/fr/')
            self.end_headers()
            return

        # Gérer les chemins /fr/ et /en/
        if self.path.startswith('/fr/') or self.path.startswith('/en/'):
            # Retirer le préfixe de langue pour trouver le vrai fichier
            real_path = self.path[4:]  # Enlève /fr/ ou /en/
            if not real_path:
                real_path = '/'
            self.path = real_path

        # Gérer le cas où le chemin se termine par /
        if self.path.endswith('/'):
            self.path += 'index.html'

        return SimpleHTTPRequestHandler.do_GET(self)

if __name__ == '__main__':
    server_address = ('', 8000)
    httpd = HTTPServer(server_address, LanguageHandler)
    print('Serveur démarré sur http://localhost:8000')
    httpd.serve_forever() 