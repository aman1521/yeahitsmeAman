import os
from datetime import timedelta
from dotenv import load_dotenv

# Load .env
script_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_path = os.path.join(script_dir, '.env')
if os.path.exists(env_path):
    load_dotenv(dotenv_path=env_path, override=True)

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'peenakaa-ecommerce-secret-key-2026')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'peenakaa-jwt-secret-key-2026')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    
    # Database
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL',
        'mysql+pymysql://fashion:E6KEIXA1sliml531@159.65.148.246:3306/ecom_admin'
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = False
    
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_size': 10,
        'pool_recycle': 3600,
        'pool_pre_ping': True,
        'max_overflow': 20,
        'connect_args': {
            'connect_timeout': 10,
            'read_timeout': 30,
            'write_timeout': 30,
            'charset': 'utf8mb4'
        }
    }

