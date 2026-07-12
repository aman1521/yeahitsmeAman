import os
import json
import sqlite3
import smtplib
import threading
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from http.server import SimpleHTTPRequestHandler, HTTPServer

PORT = 8000
DB_FILE = 'leads.db'
SMTP_SERVER = 'smtp.gmail.com'
SMTP_PORT = 587
OWNER_EMAIL = 'amanchouhan1217@gmail.com'

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

# Send Email Notifications in a background thread to prevent HTTP blocking
def send_email_notifications(name, email, url, phone, role):
    smtp_user = os.environ.get('SMTP_USER')
    smtp_pass = os.environ.get('SMTP_PASSWORD')
    
    if not smtp_user or not smtp_pass:
        print("\n[SMTP Info]: SMTP_USER and SMTP_PASSWORD environment variables are not set. Email notifications skipped.")
        print(f"  - Lead details: Name: {name} | Role: {role} | Email: {email} | Web: {url} | WhatsApp: {phone}\n")
        return
        
    try:
        # Connect to Gmail SMTP
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(smtp_user, smtp_pass)
        
        # 1. Email to Owner (Aman)
        owner_msg = MIMEMultipart()
        owner_msg['From'] = smtp_user
        owner_msg['To'] = OWNER_EMAIL
        owner_msg['Subject'] = f"New Lead Audit Request: {name}"
        
        owner_body = f"""Hello Aman,

You have received a new performance audit request from your portfolio site:

- Name: {name}
- Role: {role}
- Email: {email}
- Website: {url}
- WhatsApp/Phone: {phone}

This lead has been successfully registered in your local leads.db database.

Best regards,
Growth Architect Portfolio Automation"""
        
        owner_msg.attach(MIMEText(owner_body, 'plain'))
        server.sendmail(smtp_user, OWNER_EMAIL, owner_msg.as_string())
        print(f"\n[SMTP Success]: Notification email sent to owner ({OWNER_EMAIL})")
        
        # 2. Email to Customer (Confirmation)
        client_msg = MIMEMultipart()
        client_msg['From'] = smtp_user
        client_msg['To'] = email
        client_msg['Subject'] = "Free Marketing Audit Request Received | Aman Kumar"
        
        client_body = f"""Hello {name},

Thank you for requesting a Free Marketing & SEO Audit for your website ({url}).

Aman has received your details (Role: {role}, WhatsApp: {phone}) and has logged them in the database. He is currently reviewing your site and campaign performance.

To expedite your audit or discuss directly, you can connect with Aman on WhatsApp:
https://wa.me/919115437107

Best regards,
Aman Kumar
Growth Architect & Mentor"""
        
        client_msg.attach(MIMEText(client_body, 'plain'))
        server.sendmail(smtp_user, email, client_msg.as_string())
        print(f"[SMTP Success]: Confirmation email sent to client ({email})\n")
        
        server.quit()
    except Exception as e:
        print("\n[SMTP Error]: Failed to send email notifications:", e)

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
                    
                    # Send background emails
                    threading.Thread(target=send_email_notifications, args=(name, email, url, phone, role)).start()
                    
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
