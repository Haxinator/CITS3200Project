from flask import Flask
from config import Config


# Create Flask application
app = Flask(__name__)

# Load configuration from Config class
app.config.from_object(Config)


# Import routes, models, and sockets modules
from app import routes
