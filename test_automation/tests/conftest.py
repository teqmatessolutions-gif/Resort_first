import pytest
from playwright.sync_api import sync_playwright, Browser, BrowserContext, Page
from config.settings import settings
from config.browsers import BrowserConfig
import json
from pathlib import Path

@pytest.fixture(scope="session")
def browser():
    """Browser fixture for the entire test session"""
    with sync_playwright() as p:
        browser_config = BrowserConfig.get_browser_config("chromium")
        browser = getattr(p, browser_config["browser_type"]).launch(
            headless=settings.HEADLESS,
            slow_mo=settings.SLOW_MO,
            args=browser_config["args"]
        )
        yield browser
        browser.close()

@pytest.fixture(scope="function")
def context(browser: Browser):
    """Browser context fixture for each test"""
    context = browser.new_context(
        viewport={"width": 1920, "height": 1080},
        ignore_https_errors=True
    )
    yield context
    context.close()

@pytest.fixture(scope="function")
def page(context: BrowserContext):
    """Page fixture for each test"""
    page = context.new_page()
    yield page
    page.close()

@pytest.fixture(scope="session")
def test_data():
    """Load test data from JSON files"""
    data = {}
    for file_name in ["test_data.json", "users.json", "rooms.json", "bookings.json"]:
        file_path = settings.DATA_DIR / file_name
        if file_path.exists():
            with open(file_path, 'r') as f:
                data[file_name.replace('.json', '')] = json.load(f)
    return data

@pytest.fixture(scope="function")
def admin_login(page: Page, test_data):
    """Admin login fixture"""
    from pages.admin.login_page import AdminLoginPage
    login_page = AdminLoginPage(page)
    login_page.navigate_to_login()
    admin_user = test_data["test_data"]["users"]["admin"]
    login_page.login(admin_user["email"], admin_user["password"])
    assert login_page.login_successful(), "Admin login failed"
    return login_page

@pytest.fixture(scope="function")
def mobile_context(browser: Browser):
    """Mobile browser context fixture"""
    mobile_config = BrowserConfig.get_mobile_config("iPhone 12")
    context = browser.new_context(
        viewport=mobile_config["viewport"],
        user_agent=mobile_config["user_agent"]
    )
    yield context
    context.close()

@pytest.fixture(scope="function")
def mobile_page(mobile_context: BrowserContext):
    """Mobile page fixture"""
    page = mobile_context.new_page()
    yield page
    page.close()
