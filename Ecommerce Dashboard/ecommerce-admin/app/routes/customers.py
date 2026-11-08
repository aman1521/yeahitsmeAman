from flask import Blueprint, request, jsonify
from app.extensions import db
from sqlalchemy import text
from app.routes.portfolio import get_leads

customers_bp = Blueprint('customers', __name__)

@customers_bp.route('/users/', methods=['GET'])
@customers_bp.route('/api/users/', methods=['GET'])
@customers_bp.route('/users', methods=['GET'])
@customers_bp.route('/api/users', methods=['GET'])
@customers_bp.route('/customers', methods=['GET'])
@customers_bp.route('/api/customers', methods=['GET'])
def get_customers():
    customers = []
    try:
        query = text("""
            SELECT id, email, full_name, phone, preferred_currency, wallet_balance,
                   reward_points, is_active, email_verified, role, created_at
            FROM users
            ORDER BY id DESC
        """)
        rows = db.session.execute(query).fetchall()
        for r in rows:
            customers.append({
                'id': r[0],
                'email': r[1],
                'name': r[2] or r[1],
                'full_name': r[2] or r[1],
                'phone': r[3] or 'N/A',
                'preferred_currency': r[4] or 'INR',
                'wallet_balance': float(r[5] or 0),
                'reward_points': int(r[6] or 0),
                'is_active': bool(r[7]),
                'email_verified': bool(r[8]),
                'role': r[9] or 'customer',
                'type': 'Ecommerce Customer',
                'created_at': r[10].isoformat() if hasattr(r[10], 'isoformat') else str(r[10])
            })
    except Exception as e:
        print(f"[Customers Blueprint] DB error: {e}")

    # Combine with portfolio leads
    try:
        leads_res = get_leads()
        leads_data = leads_res[0].get_json() if hasattr(leads_res[0], 'get_json') else leads_res[0]
        for lead in leads_data.get('leads', []):
            customers.append({
                'id': 1000 + lead['id'],
                'name': lead['name'],
                'full_name': lead['name'],
                'email': lead['email'],
                'phone': lead.get('phone', 'N/A'),
                'service_interest': lead.get('service_interest'),
                'business_vertical': lead.get('business_vertical'),
                'preferred_currency': 'INR',
                'wallet_balance': 0,
                'reward_points': 0,
                'is_active': True,
                'email_verified': True,
                'role': 'lead',
                'type': 'Portfolio Inquiry',
                'created_at': lead.get('created_at')
            })
    except Exception as e:
        print(f"[Customers Blueprint] Error merging leads: {e}")

    return jsonify({
        'success': True,
        'users': customers,
        'customers': customers,
        'total': len(customers),
        'pages': 1
    }), 200

