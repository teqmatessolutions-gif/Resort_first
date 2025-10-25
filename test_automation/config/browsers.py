from playwright.sync_api import sync_playwright
from .settings import settings

class BrowserConfig:
    @staticmethod
    def get_browser_config(browser_name="chromium"):
        configs = {
            "chromium": {
                "browser_type": "chromium",
                "args": [
                    "--no-sandbox",
                    "--disable-dev-shm-usage",
                    "--disable-gpu",
                    "--window-size=1920,1080"
                ]
            },
            "firefox": {
                "browser_type": "firefox",
                "args": []
            },
            "webkit": {
                "browser_type": "webkit",
                "args": []
            }
        }
        return configs.get(browser_name, configs["chromium"])
    
    @staticmethod
    def get_mobile_config(device_name="iPhone 12"):
        mobile_configs = {
            "iPhone 12": {
                "viewport": {"width": 390, "height": 844},
                "user_agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X)"
            },
            "Samsung Galaxy S21": {
                "viewport": {"width": 384, "height": 854},
                "user_agent": "Mozilla/5.0 (Linux; Android 11; SM-G991B)"
            }
        }
        return mobile_configs.get(device_name, mobile_configs["iPhone 12"])
