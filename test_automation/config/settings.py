import os
from pathlib import Path

class Settings:
    # Base URLs
    BASE_URL = os.getenv("BASE_URL", "https://www.teqmates.com")
    ADMIN_URL = f"{BASE_URL}/admin"
    USER_URL = f"{BASE_URL}/resort"
    API_URL = f"{BASE_URL}/api"
    
    # Test Configuration
    HEADLESS = os.getenv("HEADLESS", "false").lower() == "true"
    SLOW_MO = int(os.getenv("SLOW_MO", "0"))
    TIMEOUT = int(os.getenv("TIMEOUT", "30000"))
    
    # Browser Configuration
    BROWSERS = ["chromium", "firefox", "webkit"]
    MOBILE_DEVICES = ["iPhone 12", "Samsung Galaxy S21"]
    
    # Test Data Paths
    DATA_DIR = Path(__file__).parent.parent / "data"
    TEST_DATA_FILE = DATA_DIR / "test_data.json"
    USERS_FILE = DATA_DIR / "users.json"
    
    # Reports Configuration
    REPORTS_DIR = Path(__file__).parent.parent / "reports"
    SCREENSHOTS_DIR = REPORTS_DIR / "screenshots"
    VIDEOS_DIR = REPORTS_DIR / "videos"
    
    # Database Configuration
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = os.getenv("DB_PORT", "5432")
    DB_NAME = os.getenv("DB_NAME", "resort_db")
    DB_USER = os.getenv("DB_USER", "resort_user")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "ResortDB2024")

settings = Settings()
