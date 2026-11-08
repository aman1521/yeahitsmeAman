from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta

analytics_bp = Blueprint('analytics', __name__)

def generate_sales_days(num_days=30):
    result = []
    now = datetime.now()
    for i in range(num_days - 1, -1, -1):
        d = now - timedelta(days=i)
        base_sales = 650 + int((i % 7) * 90) + (i % 3) * 40
        orders = max(1, base_sales // 650)
        result.push = result.append({
            'date': d.strftime('%Y-%m-%d'),
            'sales': base_sales,
            'orders': orders,
            'products_sold': orders * 2,
            'customers': max(1, int(orders * 0.9))
        })
    return result

@analytics_bp.route('/dashboard/stats', methods=['GET'])
@analytics_bp.route('/api/dashboard/stats', methods=['GET'])
def dashboard_stats():
    return jsonify({
        'orders': {'total': 17, 'change_percentage': 21.4, 'last_month': 14, 'last_week': 6},
        'sales': {'total': 19583.27, 'change_percentage': 28.5, 'last_month': 15200.0, 'last_week': 6820.0},
        'products': {'total': 17, 'active': 16, 'featured': 5},
        'users': {'total': 7, 'active': 7},
        'recent_reviews': 8
    }), 200

@analytics_bp.route('/dashboard/sales-chart', methods=['GET'])
@analytics_bp.route('/api/dashboard/sales-chart', methods=['GET'])
def sales_chart():
    days = int(request.args.get('days', 30))
    chart_data = generate_sales_days(days)
    return jsonify({'success': True, 'chart_data': chart_data, 'sales': chart_data}), 200

@analytics_bp.route('/dashboard/top-products', methods=['GET'])
@analytics_bp.route('/api/dashboard/top-products', methods=['GET'])
def top_products():
    products = [
        {'id': 28, 'name': 'Female Vitality', 'sales_count': 4, 'total_revenue': 3322.00, 'price': 840.00, 'rating': 4.9, 'stock': 100},
        {'id': 34, 'name': 'Stress & Anxiety Relief', 'sales_count': 3, 'total_revenue': 1941.00, 'price': 647.00, 'rating': 4.9, 'stock': 100},
        {'id': 33, 'name': 'Sleep Support', 'sales_count': 4, 'total_revenue': 3079.92, 'price': 769.98, 'rating': 4.8, 'stock': 100},
        {'id': 24, 'name': 'Bio Burner', 'sales_count': 3, 'total_revenue': 2160.00, 'price': 720.00, 'rating': 4.9, 'stock': 100},
        {'id': 21, 'name': 'Multivitamin Gummies', 'sales_count': 3, 'total_revenue': 2009.97, 'price': 669.99, 'rating': 4.7, 'stock': 100}
    ]
    return jsonify({'success': True, 'products': products}), 200

