from flask import Flask
from config import Config
# from flask_sqlalchemy import SQLAlchemy
# from flask_migrate import Migrate
# from flask_login import LoginManager
# from flask_socketio import SocketIO

# Create Flask application
app = Flask(__name__)

# Load configuration from Config class
app.config.from_object(Config)

# Initialize SQLAlchemy for database management

# Import routes, models, and sockets modules
from app import routes
