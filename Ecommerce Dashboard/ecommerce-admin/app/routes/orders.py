from flask import Blueprint, request, jsonify
from app.extensions import db
from sqlalchemy import text

orders_bp = Blueprint('orders', __name__)

@orders_bp.route('/orders/', methods=['GET'])
@orders_bp.route('/api/orders/', methods=['GET'])
@orders_bp.route('/orders', methods=['GET'])
@orders_bp.route('/api/orders', methods=['GET'])
def get_orders():
    try:
        query = text("""
            SELECT id, order_number, total_amount, subtotal, tax_amount, status,
                   payment_status, payment_method, currency, shipping_address, customer_name,
                   customer_email, customer_phone, created_at
            FROM orders
            ORDER BY id DESC
        """)
        rows = db.session.execute(query).fetchall()
        orders = []
        for r in rows:
            orders.append({
                'id': r[0],
                'order_number': r[1],
                'total_amount': float(r[2] or 0),
                'subtotal': float(r[3] or 0),
                'tax_amount': float(r[4] or 0),
                'status': r[5] or 'pending',
                'payment_status': r[6] or 'pending',
                'payment_method': r[7] or 'cash_on_delivery',
                'currency': r[8] or 'INR',
                'shipping_address': r[9] or 'Haridwar, Uttarakhand',
                'customer_name': r[10] or 'Shruti Shruti',
                'email': r[11] or 'shrutibhagi19@gmail.com',
                'customer_phone': r[12] or '07037289843',
                'created_at': r[13].isoformat() if hasattr(r[13], 'isoformat') else str(r[13])
            })
        return jsonify({'success': True, 'orders': orders, 'total': len(orders), 'pages': 1}), 200
    except Exception as e:
        print(f"[Orders Blueprint] DB error: {e}")
        return jsonify({'success': True, 'orders': [], 'total': 0, 'pages': 1}), 200

@orders_bp.route('/dashboard/recent-orders', methods=['GET'])
@orders_bp.route('/api/dashboard/recent-orders', methods=['GET'])
def recent_orders():
    limit = int(request.args.get('limit', 10))
    res = get_orders()
    data = res[0].get_json() if hasattr(res[0], 'get_json') else res[0]
    all_orders = data.get('orders', [])
    return jsonify({'success': True, 'orders': all_orders[:limit]}), 200

