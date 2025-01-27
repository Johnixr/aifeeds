from http.server import HTTPServer, SimpleHTTPRequestHandler
import json
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(message)s',
    filename='theme_detection.log',
    filemode='a'
)

class ThemeDebugHandler(SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/log':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                log_data = json.loads(post_data.decode('utf-8'))
                logging.info(f"Theme Detection: {json.dumps(log_data, indent=2)}")
                print(f"Theme Detection: {json.dumps(log_data, indent=2)}")  # Also print to console
                
                # Send response
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
            super().do_GET()
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        SimpleHTTPRequestHandler.end_headers(self)

if __name__ == "__main__":
    port = 3456
    server_address = ("", port)
    httpd = HTTPServer(server_address, ThemeDebugHandler)
    print(f"Server running on port {port}...")
    print(f"Logging theme detection data to theme_detection.log")
    httpd.serve_forever()
