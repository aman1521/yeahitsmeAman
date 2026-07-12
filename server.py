import os
import json
import sqlite3
from http.server import SimpleHTTPRequestHandler, HTTPServer

PORT = 8000
DB_FILE = 'leads.db'

# Initialize SQLite Database
def init_db():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS leads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            url TEXT NOT NULL,
            phone TEXT NOT NULL,
            role TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

class CustomHandler(SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/submit-lead':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode('utf-8'))
                name = data.get('name')
                email = data.get('email')
                url = data.get('url')
                phone = data.get('phone')
                role = data.get('role')
                
                if name and email and url and phone and role:
                    # Save to database
                    conn = sqlite3.connect(DB_FILE)
                    c = conn.cursor()
                    c.execute('''
                        INSERT INTO leads (name, email, url, phone, role)
                        VALUES (?, ?, ?, ?, ?)
                    ''', (name, email, url, phone, role))
                    conn.commit()
                    conn.close()
                    
                    # Respond success
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps({"success": True}).encode('utf-8'))
                    return
            except Exception as e:
                print("Error saving lead:", e)
                
            self.send_response(400)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"success": False, "error": "Invalid data"}).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

    # Support preflight OPTIONS requests for CORS
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

if __name__ == '__main__':
    # Change directory to the folder containing this server script to serve assets properly
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    init_db()
    print(f"Starting database-backed portfolio server on port {PORT}...")
    server = HTTPServer(('0.0.0.0', PORT), CustomHandler)
    server.serve_forever()
