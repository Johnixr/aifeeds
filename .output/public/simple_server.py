from http.server import HTTPServer, SimpleHTTPRequestHandler
import logging
import json
from datetime import datetime

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(message)s',
    handlers=[
        logging.FileHandler('theme_detection.log'),
        logging.StreamHandler()
    ]
)

class ThemeDetectionHandler(SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/log':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                log_data = json.loads(post_data.decode('utf-8'))
                logging.info(f"Theme Detection: {json.dumps(log_data, indent=2)}")
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
                self.send_header('Access-Control-Allow-Headers', 'Content-Type')
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'ok'}).encode())
            except Exception as e:
                logging.error(f"Error processing log: {str(e)}")
                self.send_error(500)
        else:
            self.send_error(404)
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        SimpleHTTPRequestHandler.end_headers(self)

handler = ThemeDetectionHandler
handler.extensions_map.update({
    ".js": "application/javascript",
    ".html": "text/html",
})

if __name__ == "__main__":
    server_address = ("", 3456)
    httpd = HTTPServer(server_address, handler)
    print(f"Server running on port {server_address[1]}...")
    print(f"Logging theme detection data to theme_detection.log")
    httpd.serve_forever()
