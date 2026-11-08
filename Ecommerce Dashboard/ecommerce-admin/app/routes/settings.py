from flask import Blueprint, jsonify

settings_bp = Blueprint('settings', __name__)

@settings_bp.route('/settings', methods=['GET'])
@settings_bp.route('/api/settings', methods=['GET'])
def get_settings():
    return jsonify({
        'success': True,
        'settings': {
            'store_name': 'Peenakaa (RasayanaBio)',
            'site_domain': 'rasayanabio.com',
            'support_email': 'support@rasayanabio.com',
            'currency': 'INR',
            'timezone': 'Asia/Kolkata'
        }
    }), 200

@settings_bp.route('/currencies', methods=['GET'])
@settings_bp.route('/api/currencies', methods=['GET'])
def get_currencies():
    currencies = [
        {'id': 1, 'code': 'INR', 'symbol': '₹', 'name': 'Indian Rupee', 'exchange_rate': 1.0, 'is_default': True, 'status': 'active'},
        {'id': 2, 'code': 'USD', 'symbol': '$', 'name': 'US Dollar', 'exchange_rate': 0.012, 'is_default': False, 'status': 'active'},
        {'id': 3, 'code': 'EUR', 'symbol': '€', 'name': 'Euro', 'exchange_rate': 0.011, 'is_default': False, 'status': 'active'},
        {'id': 4, 'code': 'GBP', 'symbol': '£', 'name': 'British Pound', 'exchange_rate': 0.0095, 'is_default': False, 'status': 'active'}
    ]
    return jsonify({'success': True, 'currencies': currencies}), 200

