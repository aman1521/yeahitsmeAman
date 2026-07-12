import sqlite3

DB_FILE = 'leads.db'

def view_leads():
    try:
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        c.execute('SELECT * FROM leads ORDER BY timestamp DESC')
        rows = c.fetchall()
        
        if not rows:
            print("\nNo leads found in the database yet!")
            return
        
        print("\n=== CAPTURED LEADS (SQLite) ===")
        print(f"{'ID':<4} | {'Name':<18} | {'Email':<22} | {'Role':<15} | {'Website':<28} | {'Phone':<15} | {'Timestamp':<20}")
        print("-" * 130)
        for row in rows:
            # row format: (id, name, email, url, phone, role, timestamp)
            print(f"{row[0]:<4} | {row[1]:<18} | {row[2]:<22} | {row[5]:<15} | {row[3]:<28} | {row[4]:<15} | {row[6]:<20}")
        print(f"\nTotal leads captured: {len(rows)}\n")
        conn.close()
    except Exception as e:
        print("Error reading leads database:", e)
        
if __name__ == '__main__':
    view_leads()
