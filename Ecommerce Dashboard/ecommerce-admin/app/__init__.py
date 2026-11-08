from flask import Flask
from .config import Config
from .extensions import db, jwt, cors
from .routes import register_routes

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    cors.init_app(app, resources={
        r"/*": {
            "origins": "*",
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization", "site_id", "X-Requested-With"]
        }
    })
    db.init_app(app)
    jwt.init_app(app)

    # Register blueprints
    register_routes(app)

    @app.route('/health')
    @app.route('/api/health')
    def health():
        return {'status': 'healthy', 'service': 'peenakaa-ecommerce-api'}, 200

    return app

