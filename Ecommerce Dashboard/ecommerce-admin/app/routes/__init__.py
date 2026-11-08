from .auth import auth_bp
from .portfolio import portfolio_bp
from .products import products_bp
from .orders import orders_bp
from .customers import customers_bp
from .analytics import analytics_bp
from .settings import settings_bp

def register_routes(app):
    app.register_blueprint(auth_bp)
    app.register_blueprint(portfolio_bp)
    app.register_blueprint(products_bp)
    app.register_blueprint(orders_bp)
    app.register_blueprint(customers_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(settings_bp)

