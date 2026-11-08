import os
import sqlite3
from flask import Blueprint, jsonify

portfolio_bp = Blueprint('portfolio', __name__)

@portfolio_bp.route('/portfolio/leads', methods=['GET'])
@portfolio_bp.route('/api/portfolio/leads', methods=['GET'])
@portfolio_bp.route('/leads', methods=['GET'])
def get_leads():
    candidates = [
        os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))), 'leads.db'),
        os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'leads.db'),
        'leads.db'
    ]
    for db_path in candidates:
        if os.path.exists(db_path):
            try:
                conn = sqlite3.connect(db_path)
                cur = conn.cursor()
                cur.execute('SELECT id, name, email, url, phone, role, timestamp FROM leads ORDER BY id DESC')
                rows = cur.fetchall()
                conn.close()
                leads = [{
                    'id': r[0],
                    'name': r[1],
                    'email': r[2],
                    'service_interest': r[3],
                    'phone': r[4],
                    'business_vertical': r[5],
                    'created_at': r[6],
                    'type': 'Portfolio Inquiry',
                    'role': 'lead',
                    'is_active': True
                } for r in rows]
                return jsonify({'success': True, 'leads': leads, 'total': len(leads)}), 200
            except Exception as e:
                print(f"[Portfolio Leads Blueprint] SQLite error: {e}")

    return jsonify({'success': True, 'leads': [], 'total': 0}), 200

