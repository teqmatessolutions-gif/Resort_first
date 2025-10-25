# Resort Management System - Test Automation Architecture with Python Playwright

## 🏗️ Architecture Overview

### Framework Design Principles
- **Page Object Model (POM)** - Maintainable and reusable test code
- **Data-Driven Testing** - External test data management
- **Parallel Execution** - Faster test execution
- **Cross-Browser Testing** - Chrome, Firefox, Safari, Edge
- **Mobile Testing** - Responsive design validation
- **API Testing Integration** - Backend validation
- **CI/CD Integration** - Automated test execution

---

## 📁 Project Structure

```
test_automation/
├── config/
│   ├── __init__.py
│   ├── settings.py              # Test configuration
│   ├── browsers.py              # Browser configurations
│   └── environments.py          # Environment settings
├── pages/
│   ├── __init__.py
│   ├── base_page.py             # Base page class
│   ├── admin/
│   │   ├── __init__.py
│   │   ├── login_page.py
│   │   ├── dashboard_page.py
│   │   ├── rooms_page.py
│   │   ├── bookings_page.py
│   │   ├── employees_page.py
│   │   └── reports_page.py
│   └── user/
│       ├── __init__.py
│       ├── home_page.py
│       ├── rooms_page.py
│       ├── booking_page.py
│       └── services_page.py
├── tests/
│   ├── __init__.py
│   ├── conftest.py              # Pytest fixtures
│   ├── admin/
│   │   ├── __init__.py
│   │   ├── test_authentication.py
│   │   ├── test_room_management.py
│   │   ├── test_booking_management.py
│   │   ├── test_employee_management.py
│   │   └── test_dashboard.py
│   ├── user/
│   │   ├── __init__.py
│   │   ├── test_booking_flow.py
│   │   ├── test_room_browsing.py
│   │   └── test_services.py
│   ├── api/
│   │   ├── __init__.py
│   │   ├── test_room_api.py
│   │   ├── test_booking_api.py
│   │   └── test_auth_api.py
│   └── integration/
│       ├── __init__.py
│       ├── test_end_to_end.py
│       └── test_cross_browser.py
├── data/
│   ├── __init__.py
│   ├── test_data.json
│   ├── users.json
│   ├── rooms.json
│   └── bookings.json
├── utils/
│   ├── __init__.py
│   ├── helpers.py
│   ├── api_client.py
│   ├── database_utils.py
│   └── report_utils.py
├── reports/
│   ├── html/
│   ├── screenshots/
│   └── videos/
├── requirements.txt
├── pytest.ini
├── playwright.config.py
└── run_tests.py
```

---

## 🔧 Core Configuration Files

### config/settings.py
```python
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
```

### config/browsers.py
```python
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
```

---

## 📄 Page Object Model Implementation

### pages/base_page.py
```python
from playwright.sync_api import Page, expect
from typing import Optional
import time

class BasePage:
    def __init__(self, page: Page):
        self.page = page
        self.timeout = 30000
    
    def navigate_to(self, url: str):
        """Navigate to a specific URL"""
        self.page.goto(url)
        self.page.wait_for_load_state("networkidle")
    
    def wait_for_element(self, selector: str, timeout: Optional[int] = None):
        """Wait for element to be visible"""
        self.page.wait_for_selector(selector, timeout=timeout or self.timeout)
    
    def click_element(self, selector: str):
        """Click on an element"""
        self.page.click(selector)
    
    def fill_input(self, selector: str, text: str):
        """Fill input field with text"""
        self.page.fill(selector, text)
    
    def get_text(self, selector: str) -> str:
        """Get text content of an element"""
        return self.page.text_content(selector)
    
    def take_screenshot(self, name: str):
        """Take screenshot for debugging"""
        self.page.screenshot(path=f"reports/screenshots/{name}.png")
    
    def wait_for_url(self, url_pattern: str):
        """Wait for URL to match pattern"""
        self.page.wait_for_url(url_pattern)
    
    def scroll_to_element(self, selector: str):
        """Scroll to element"""
        self.page.locator(selector).scroll_into_view_if_needed()
    
    def is_element_visible(self, selector: str) -> bool:
        """Check if element is visible"""
        try:
            return self.page.is_visible(selector)
        except:
            return False
    
    def get_element_count(self, selector: str) -> int:
        """Get count of elements matching selector"""
        return self.page.locator(selector).count()
    
    def wait_for_text(self, selector: str, text: str):
        """Wait for element to contain specific text"""
        expect(self.page.locator(selector)).to_contain_text(text)
```

### pages/admin/login_page.py
```python
from .base_page import BasePage
from playwright.sync_api import Page, expect

class AdminLoginPage(BasePage):
    # Selectors
    EMAIL_INPUT = "input[name='email']"
    PASSWORD_INPUT = "input[name='password']"
    LOGIN_BUTTON = "button[type='submit']"
    ERROR_MESSAGE = ".error-message"
    LOGIN_FORM = "form"
    
    def __init__(self, page: Page):
        super().__init__(page)
    
    def navigate_to_login(self):
        """Navigate to admin login page"""
        self.navigate_to("/admin")
        self.wait_for_element(self.LOGIN_FORM)
    
    def login(self, email: str, password: str):
        """Perform login with credentials"""
        self.fill_input(self.EMAIL_INPUT, email)
        self.fill_input(self.PASSWORD_INPUT, password)
        self.click_element(self.LOGIN_BUTTON)
        self.page.wait_for_load_state("networkidle")
    
    def login_successful(self) -> bool:
        """Check if login was successful"""
        try:
            # Wait for redirect to dashboard
            self.page.wait_for_url("**/admin/dashboard", timeout=5000)
            return True
        except:
            return False
    
    def get_error_message(self) -> str:
        """Get error message if login fails"""
        if self.is_element_visible(self.ERROR_MESSAGE):
            return self.get_text(self.ERROR_MESSAGE)
        return ""
    
    def is_login_form_visible(self) -> bool:
        """Check if login form is visible"""
        return self.is_element_visible(self.LOGIN_FORM)
```

### pages/admin/rooms_page.py
```python
from .base_page import BasePage
from playwright.sync_api import Page, expect
from typing import List, Dict

class AdminRoomsPage(BasePage):
    # Selectors
    CREATE_ROOM_BUTTON = "button:has-text('Create Room')"
    ROOM_FORM = "form"
    ROOM_NUMBER_INPUT = "input[name='number']"
    ROOM_TYPE_INPUT = "input[name='type']"
    ROOM_PRICE_INPUT = "input[name='price']"
    ROOM_STATUS_SELECT = "select[name='status']"
    ADULTS_INPUT = "input[name='adults']"
    CHILDREN_INPUT = "input[name='children']"
    IMAGE_INPUT = "input[type='file']"
    SUBMIT_BUTTON = "button[type='submit']"
    ROOM_CARDS = ".room-card"
    EDIT_BUTTON = "button:has-text('Edit')"
    DELETE_BUTTON = "button:has-text('Delete')"
    SUCCESS_MESSAGE = ".success-message"
    ERROR_MESSAGE = ".error-message"
    
    def __init__(self, page: Page):
        super().__init__(page)
    
    def navigate_to_rooms(self):
        """Navigate to rooms management page"""
        self.navigate_to("/admin/rooms")
        self.wait_for_element(self.CREATE_ROOM_BUTTON)
    
    def create_room(self, room_data: Dict):
        """Create a new room with provided data"""
        self.click_element(self.CREATE_ROOM_BUTTON)
        self.wait_for_element(self.ROOM_FORM)
        
        # Fill room details
        self.fill_input(self.ROOM_NUMBER_INPUT, room_data["number"])
        self.fill_input(self.ROOM_TYPE_INPUT, room_data["type"])
        self.fill_input(self.ROOM_PRICE_INPUT, str(room_data["price"]))
        self.page.select_option(self.ROOM_STATUS_SELECT, room_data["status"])
        self.fill_input(self.ADULTS_INPUT, str(room_data["adults"]))
        self.fill_input(self.CHILDREN_INPUT, str(room_data["children"]))
        
        # Upload image if provided
        if "image_path" in room_data:
            self.page.set_input_files(self.IMAGE_INPUT, room_data["image_path"])
        
        self.click_element(self.SUBMIT_BUTTON)
        self.page.wait_for_load_state("networkidle")
    
    def get_room_count(self) -> int:
        """Get total number of rooms displayed"""
        return self.get_element_count(self.ROOM_CARDS)
    
    def get_room_by_number(self, room_number: str) -> Dict:
        """Get room details by room number"""
        room_card = self.page.locator(f".room-card:has-text('{room_number}')")
        if room_card.count() > 0:
            return {
                "number": room_card.locator(".room-number").text_content(),
                "type": room_card.locator(".room-type").text_content(),
                "price": room_card.locator(".room-price").text_content(),
                "status": room_card.locator(".room-status").text_content()
            }
        return {}
    
    def edit_room(self, room_number: str, new_data: Dict):
        """Edit existing room"""
        room_card = self.page.locator(f".room-card:has-text('{room_number}')")
        room_card.locator(self.EDIT_BUTTON).click()
        self.wait_for_element(self.ROOM_FORM)
        
        # Update room details
        if "number" in new_data:
            self.fill_input(self.ROOM_NUMBER_INPUT, new_data["number"])
        if "type" in new_data:
            self.fill_input(self.ROOM_TYPE_INPUT, new_data["type"])
        if "price" in new_data:
            self.fill_input(self.ROOM_PRICE_INPUT, str(new_data["price"]))
        
        self.click_element(self.SUBMIT_BUTTON)
        self.page.wait_for_load_state("networkidle")
    
    def delete_room(self, room_number: str):
        """Delete a room"""
        room_card = self.page.locator(f".room-card:has-text('{room_number}')")
        room_card.locator(self.DELETE_BUTTON).click()
        
        # Handle confirmation dialog
        self.page.on("dialog", lambda dialog: dialog.accept())
        self.page.wait_for_load_state("networkidle")
    
    def get_success_message(self) -> str:
        """Get success message"""
        if self.is_element_visible(self.SUCCESS_MESSAGE):
            return self.get_text(self.SUCCESS_MESSAGE)
        return ""
    
    def get_error_message(self) -> str:
        """Get error message"""
        if self.is_element_visible(self.ERROR_MESSAGE):
            return self.get_text(self.ERROR_MESSAGE)
        return ""
```

---

## 🧪 Test Implementation

### tests/conftest.py
```python
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
    admin_user = test_data["users"]["admin"]
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
```

### tests/admin/test_room_management.py
```python
import pytest
from pages.admin.rooms_page import AdminRoomsPage
from pages.admin.login_page import AdminLoginPage

class TestRoomManagement:
    
    def test_create_room_successfully(self, admin_login, test_data):
        """Test creating a room with valid data"""
        rooms_page = AdminRoomsPage(admin_login.page)
        rooms_page.navigate_to_rooms()
        
        initial_count = rooms_page.get_room_count()
        room_data = test_data["rooms"]["valid_room"]
        
        rooms_page.create_room(room_data)
        
        # Verify room was created
        assert rooms_page.get_success_message() != "", "Success message not displayed"
        assert rooms_page.get_room_count() == initial_count + 1, "Room count did not increase"
        
        # Verify room details
        created_room = rooms_page.get_room_by_number(room_data["number"])
        assert created_room["number"] == room_data["number"]
        assert created_room["type"] == room_data["type"]
        assert created_room["status"] == room_data["status"]
    
    def test_create_room_with_image(self, admin_login, test_data):
        """Test creating a room with image upload"""
        rooms_page = AdminRoomsPage(admin_login.page)
        rooms_page.navigate_to_rooms()
        
        room_data = test_data["rooms"]["room_with_image"]
        rooms_page.create_room(room_data)
        
        # Verify room was created with image
        assert rooms_page.get_success_message() != "", "Success message not displayed"
        
        # Verify image is displayed
        room_card = rooms_page.page.locator(f".room-card:has-text('{room_data['number']}')")
        assert room_card.locator("img").count() > 0, "Room image not displayed"
    
    def test_edit_room(self, admin_login, test_data):
        """Test editing an existing room"""
        rooms_page = AdminRoomsPage(admin_login.page)
        rooms_page.navigate_to_rooms()
        
        # Create a room first
        room_data = test_data["rooms"]["valid_room"]
        rooms_page.create_room(room_data)
        
        # Edit the room
        new_data = {"type": "Premium", "price": "5000"}
        rooms_page.edit_room(room_data["number"], new_data)
        
        # Verify changes
        assert rooms_page.get_success_message() != "", "Success message not displayed"
        updated_room = rooms_page.get_room_by_number(room_data["number"])
        assert updated_room["type"] == new_data["type"]
    
    def test_delete_room(self, admin_login, test_data):
        """Test deleting a room"""
        rooms_page = AdminRoomsPage(admin_login.page)
        rooms_page.navigate_to_rooms()
        
        # Create a room first
        room_data = test_data["rooms"]["valid_room"]
        rooms_page.create_room(room_data)
        
        initial_count = rooms_page.get_room_count()
        
        # Delete the room
        rooms_page.delete_room(room_data["number"])
        
        # Verify room was deleted
        assert rooms_page.get_room_count() == initial_count - 1, "Room count did not decrease"
    
    def test_create_room_validation(self, admin_login, test_data):
        """Test room creation validation"""
        rooms_page = AdminRoomsPage(admin_login.page)
        rooms_page.navigate_to_rooms()
        
        # Test with invalid data
        invalid_data = test_data["rooms"]["invalid_room"]
        rooms_page.create_room(invalid_data)
        
        # Verify validation error
        assert rooms_page.get_error_message() != "", "Validation error not displayed"
    
    @pytest.mark.parametrize("browser_name", ["chromium", "firefox", "webkit"])
    def test_room_management_cross_browser(self, browser_name, test_data):
        """Test room management across different browsers"""
        with sync_playwright() as p:
            browser_config = BrowserConfig.get_browser_config(browser_name)
            browser = getattr(p, browser_config["browser_type"]).launch(headless=True)
            context = browser.new_context()
            page = context.new_page()
            
            # Login
            login_page = AdminLoginPage(page)
            login_page.navigate_to_login()
            admin_user = test_data["users"]["admin"]
            login_page.login(admin_user["email"], admin_user["password"])
            
            # Test room management
            rooms_page = AdminRoomsPage(page)
            rooms_page.navigate_to_rooms()
            assert rooms_page.is_element_visible(rooms_page.CREATE_ROOM_BUTTON), f"Create button not visible in {browser_name}"
            
            browser.close()
```

### tests/user/test_booking_flow.py
```python
import pytest
from pages.user.home_page import UserHomePage
from pages.user.booking_page import UserBookingPage

class TestBookingFlow:
    
    def test_guest_booking_successful(self, page, test_data):
        """Test complete guest booking flow"""
        home_page = UserHomePage(page)
        booking_page = UserBookingPage(page)
        
        # Navigate to resort page
        home_page.navigate_to_resort()
        
        # Browse rooms
        rooms = home_page.get_available_rooms()
        assert len(rooms) > 0, "No available rooms found"
        
        # Select a room for booking
        room = rooms[0]
        home_page.click_book_now(room["number"])
        
        # Fill booking form
        booking_data = test_data["bookings"]["valid_booking"]
        booking_page.fill_booking_form(booking_data)
        
        # Submit booking
        booking_page.submit_booking()
        
        # Verify booking success
        assert booking_page.get_success_message() != "", "Booking success message not displayed"
    
    def test_booking_with_room_images(self, page, test_data):
        """Test booking form displays room images"""
        home_page = UserHomePage(page)
        booking_page = UserBookingPage(page)
        
        home_page.navigate_to_resort()
        rooms = home_page.get_available_rooms()
        
        home_page.click_book_now(rooms[0]["number"])
        
        # Verify room images are displayed in booking form
        assert booking_page.get_room_images_count() > 0, "Room images not displayed in booking form"
    
    def test_booking_validation(self, page, test_data):
        """Test booking form validation"""
        home_page = UserHomePage(page)
        booking_page = UserBookingPage(page)
        
        home_page.navigate_to_resort()
        rooms = home_page.get_available_rooms()
        home_page.click_book_now(rooms[0]["number"])
        
        # Test with invalid data
        invalid_data = test_data["bookings"]["invalid_booking"]
        booking_page.fill_booking_form(invalid_data)
        booking_page.submit_booking()
        
        # Verify validation errors
        assert booking_page.get_validation_errors() != [], "Validation errors not displayed"
    
    def test_mobile_booking_flow(self, mobile_page, test_data):
        """Test booking flow on mobile device"""
        home_page = UserHomePage(mobile_page)
        booking_page = UserBookingPage(mobile_page)
        
        home_page.navigate_to_resort()
        
        # Verify responsive design
        assert home_page.is_mobile_layout(), "Mobile layout not detected"
        
        # Test booking on mobile
        rooms = home_page.get_available_rooms()
        home_page.click_book_now(rooms[0]["number"])
        
        # Verify mobile booking form
        assert booking_page.is_mobile_form_visible(), "Mobile booking form not visible"
```

---

## 📊 Test Data Management

### data/test_data.json
```json
{
  "rooms": {
    "valid_room": {
      "number": "TEST001",
      "type": "Deluxe",
      "price": 3000,
      "status": "Available",
      "adults": 2,
      "children": 1,
      "image_path": "test_data/images/room1.jpg"
    },
    "room_with_image": {
      "number": "TEST002",
      "type": "Premium",
      "price": 5000,
      "status": "Available",
      "adults": 3,
      "children": 2,
      "image_path": "test_data/images/room2.jpg"
    },
    "invalid_room": {
      "number": "",
      "type": "",
      "price": -100,
      "status": "Available",
      "adults": 0,
      "children": -1
    }
  },
  "bookings": {
    "valid_booking": {
      "guest_name": "Test Guest",
      "guest_email": "test@example.com",
      "guest_mobile": "9876543210",
      "check_in": "2025-11-01",
      "check_out": "2025-11-03",
      "adults": 2,
      "children": 1
    },
    "invalid_booking": {
      "guest_name": "",
      "guest_email": "invalid-email",
      "guest_mobile": "123",
      "check_in": "2025-10-01",
      "check_out": "2025-10-01",
      "adults": 0,
      "children": -1
    }
  },
  "users": {
    "admin": {
      "email": "admin@teqmates.com",
      "password": "admin123"
    },
    "employee": {
      "email": "employee@teqmates.com",
      "password": "employee123"
    }
  }
}
```

---

## 🔧 Utility Classes

### utils/api_client.py
```python
import requests
import json
from typing import Dict, Any
from config.settings import settings

class APIClient:
    def __init__(self):
        self.base_url = settings.API_URL
        self.session = requests.Session()
        self.session.headers.update({
            "Content-Type": "application/json",
            "Accept": "application/json"
        })
    
    def authenticate(self, email: str, password: str) -> str:
        """Authenticate and get access token"""
        response = self.session.post(
            f"{self.base_url}/auth/login",
            json={"email": email, "password": password}
        )
        response.raise_for_status()
        return response.json()["access_token"]
    
    def get_rooms(self, token: str = None) -> Dict[str, Any]:
        """Get all rooms"""
        headers = {}
        if token:
            headers["Authorization"] = f"Bearer {token}"
        
        response = self.session.get(
            f"{self.base_url}/rooms/test",
            headers=headers
        )
        response.raise_for_status()
        return response.json()
    
    def create_room(self, room_data: Dict[str, Any], token: str) -> Dict[str, Any]:
        """Create a new room"""
        headers = {"Authorization": f"Bearer {token}"}
        
        response = self.session.post(
            f"{self.base_url}/rooms/test",
            json=room_data,
            headers=headers
        )
        response.raise_for_status()
        return response.json()
    
    def create_booking(self, booking_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a guest booking"""
        response = self.session.post(
            f"{self.base_url}/bookings/guest",
            json=booking_data
        )
        response.raise_for_status()
        return response.json()
    
    def get_bookings(self, token: str) -> Dict[str, Any]:
        """Get all bookings"""
        headers = {"Authorization": f"Bearer {token}"}
        
        response = self.session.get(
            f"{self.base_url}/bookings",
            headers=headers
        )
        response.raise_for_status()
        return response.json()
```

### utils/database_utils.py
```python
import psycopg2
from psycopg2.extras import RealDictCursor
from config.settings import settings
from typing import List, Dict, Any

class DatabaseUtils:
    def __init__(self):
        self.connection = None
        self.connect()
    
    def connect(self):
        """Connect to PostgreSQL database"""
        try:
            self.connection = psycopg2.connect(
                host=settings.DB_HOST,
                port=settings.DB_PORT,
                database=settings.DB_NAME,
                user=settings.DB_USER,
                password=settings.DB_PASSWORD
            )
        except Exception as e:
            print(f"Database connection failed: {e}")
            raise
    
    def execute_query(self, query: str, params: tuple = None) -> List[Dict[str, Any]]:
        """Execute SELECT query and return results"""
        try:
            with self.connection.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(query, params)
                return cursor.fetchall()
        except Exception as e:
            print(f"Query execution failed: {e}")
            raise
    
    def execute_update(self, query: str, params: tuple = None) -> int:
        """Execute INSERT/UPDATE/DELETE query"""
        try:
            with self.connection.cursor() as cursor:
                cursor.execute(query, params)
                self.connection.commit()
                return cursor.rowcount
        except Exception as e:
            self.connection.rollback()
            print(f"Update execution failed: {e}")
            raise
    
    def get_rooms(self) -> List[Dict[str, Any]]:
        """Get all rooms from database"""
        query = "SELECT * FROM rooms ORDER BY id"
        return self.execute_query(query)
    
    def get_bookings(self) -> List[Dict[str, Any]]:
        """Get all bookings from database"""
        query = """
        SELECT b.*, br.room_id, r.number as room_number, r.type as room_type
        FROM bookings b
        LEFT JOIN booking_rooms br ON b.id = br.booking_id
        LEFT JOIN rooms r ON br.room_id = r.id
        ORDER BY b.id
        """
        return self.execute_query(query)
    
    def create_test_room(self, room_data: Dict[str, Any]) -> int:
        """Create a test room in database"""
        query = """
        INSERT INTO rooms (number, type, price, status, adults, children, image_url)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        RETURNING id
        """
        params = (
            room_data["number"],
            room_data["type"],
            room_data["price"],
            room_data["status"],
            room_data["adults"],
            room_data["children"],
            room_data.get("image_url")
        )
        result = self.execute_query(query, params)
        return result[0]["id"]
    
    def cleanup_test_data(self):
        """Clean up test data"""
        queries = [
            "DELETE FROM booking_rooms WHERE booking_id IN (SELECT id FROM bookings WHERE guest_email LIKE '%test%')",
            "DELETE FROM bookings WHERE guest_email LIKE '%test%'",
            "DELETE FROM rooms WHERE number LIKE 'TEST%'"
        ]
        
        for query in queries:
            try:
                self.execute_update(query)
            except Exception as e:
                print(f"Cleanup failed for query: {query}, Error: {e}")
    
    def close(self):
        """Close database connection"""
        if self.connection:
            self.connection.close()
```

---

## 🚀 Test Execution & CI/CD Integration

### pytest.ini
```ini
[tool:pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = 
    --strict-markers
    --strict-config
    --verbose
    --tb=short
    --html=reports/html/report.html
    --self-contained-html
    --screenshot=on
    --video=on
markers =
    smoke: Smoke tests
    regression: Regression tests
    api: API tests
    ui: UI tests
    mobile: Mobile tests
    cross_browser: Cross browser tests
    slow: Slow tests
```

### playwright.config.py
```python
from playwright.sync_api import Playwright, sync_playwright
import pytest

def run_tests(playwright: Playwright):
    # Configure browsers
    browsers = [
        playwright.chromium.launch(headless=True),
        playwright.firefox.launch(headless=True),
        playwright.webkit.launch(headless=True)
    ]
    
    # Run tests
    pytest.main([
        "tests/",
        "--browser=chromium",
        "--browser=firefox", 
        "--browser=webkit",
        "--html=reports/html/cross_browser_report.html"
    ])

if __name__ == "__main__":
    with sync_playwright() as playwright:
        run_tests(playwright)
```

### run_tests.py
```python
#!/usr/bin/env python3
"""
Test execution script for Resort Management System
"""
import subprocess
import sys
import argparse
from pathlib import Path

def run_command(command: list, description: str):
    """Run a command and handle errors"""
    print(f"\n{'='*50}")
    print(f"Running: {description}")
    print(f"Command: {' '.join(command)}")
    print(f"{'='*50}")
    
    result = subprocess.run(command, capture_output=True, text=True)
    
    if result.returncode != 0:
        print(f"❌ {description} failed!")
        print(f"Error: {result.stderr}")
        return False
    else:
        print(f"✅ {description} completed successfully!")
        return True

def main():
    parser = argparse.ArgumentParser(description="Run Resort Management System Tests")
    parser.add_argument("--smoke", action="store_true", help="Run smoke tests only")
    parser.add_argument("--regression", action="store_true", help="Run regression tests")
    parser.add_argument("--api", action="store_true", help="Run API tests only")
    parser.add_argument("--ui", action="store_true", help="Run UI tests only")
    parser.add_argument("--mobile", action="store_true", help="Run mobile tests only")
    parser.add_argument("--cross-browser", action="store_true", help="Run cross-browser tests")
    parser.add_argument("--parallel", action="store_true", help="Run tests in parallel")
    parser.add_argument("--headless", action="store_true", help="Run tests in headless mode")
    
    args = parser.parse_args()
    
    # Base pytest command
    base_cmd = ["python", "-m", "pytest"]
    
    # Add markers based on arguments
    markers = []
    if args.smoke:
        markers.append("smoke")
    if args.regression:
        markers.append("regression")
    if args.api:
        markers.append("api")
    if args.ui:
        markers.append("ui")
    if args.mobile:
        markers.append("mobile")
    if args.cross_browser:
        markers.append("cross_browser")
    
    if markers:
        base_cmd.extend(["-m", " or ".join(markers)])
    
    # Add parallel execution
    if args.parallel:
        base_cmd.extend(["-n", "auto"])
    
    # Add headless mode
    if args.headless:
        base_cmd.extend(["--headless"])
    
    # Add test paths
    if not any([args.smoke, args.regression, args.api, args.ui, args.mobile]):
        base_cmd.append("tests/")
    
    # Run tests
    success = run_command(base_cmd, "Test Execution")
    
    if success:
        print("\n🎉 All tests completed successfully!")
        sys.exit(0)
    else:
        print("\n💥 Some tests failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()
```

### requirements.txt
```txt
pytest==7.4.3
playwright==1.40.0
pytest-playwright==0.4.3
pytest-html==4.1.1
pytest-xdist==3.3.1
pytest-cov==4.1.0
requests==2.31.0
psycopg2-binary==2.9.9
python-dotenv==1.0.0
allure-pytest==2.13.2
```

---

## 📊 Reporting & Analytics

### utils/report_utils.py
```python
import json
import os
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any

class TestReportGenerator:
    def __init__(self):
        self.reports_dir = Path("reports")
        self.reports_dir.mkdir(exist_ok=True)
    
    def generate_summary_report(self, test_results: Dict[str, Any]):
        """Generate test execution summary report"""
        report = {
            "timestamp": datetime.now().isoformat(),
            "total_tests": test_results.get("total", 0),
            "passed": test_results.get("passed", 0),
            "failed": test_results.get("failed", 0),
            "skipped": test_results.get("skipped", 0),
            "duration": test_results.get("duration", 0),
            "browsers_tested": test_results.get("browsers", []),
            "test_categories": test_results.get("categories", {}),
            "failed_tests": test_results.get("failed_tests", [])
        }
        
        # Calculate pass rate
        if report["total_tests"] > 0:
            report["pass_rate"] = (report["passed"] / report["total_tests"]) * 100
        else:
            report["pass_rate"] = 0
        
        # Save report
        report_file = self.reports_dir / f"test_summary_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        return report
    
    def generate_browser_compatibility_report(self, browser_results: Dict[str, Any]):
        """Generate cross-browser compatibility report"""
        report = {
            "timestamp": datetime.now().isoformat(),
            "browsers": browser_results,
            "compatibility_score": self._calculate_compatibility_score(browser_results)
        }
        
        report_file = self.reports_dir / f"browser_compatibility_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        return report
    
    def _calculate_compatibility_score(self, browser_results: Dict[str, Any]) -> float:
        """Calculate overall browser compatibility score"""
        total_tests = sum(result.get("total", 0) for result in browser_results.values())
        total_passed = sum(result.get("passed", 0) for result in browser_results.values())
        
        if total_tests > 0:
            return (total_passed / total_tests) * 100
        return 0
```

---

## 🔄 CI/CD Integration

### .github/workflows/test-automation.yml
```yaml
name: Test Automation

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        browser: [chromium, firefox, webkit]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.9'
    
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt
        playwright install
    
    - name: Run tests
      run: |
        python run_tests.py --cross-browser --headless --parallel
      env:
        BASE_URL: ${{ secrets.BASE_URL }}
        HEADLESS: true
    
    - name: Upload test results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: test-results-${{ matrix.browser }}
        path: reports/
    
    - name: Upload screenshots
      uses: actions/upload-artifact@v3
      if: failure()
      with:
        name: screenshots-${{ matrix.browser }}
        path: reports/screenshots/
```

---

## 📈 Performance Testing

### tests/performance/test_load.py
```python
import pytest
import time
from playwright.sync_api import sync_playwright
from concurrent.futures import ThreadPoolExecutor
from pages.admin.login_page import AdminLoginPage
from pages.user.home_page import UserHomePage

class TestLoadPerformance:
    
    def test_concurrent_user_load(self, test_data):
        """Test system performance under concurrent user load"""
        def simulate_user_session():
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                context = browser.new_context()
                page = context.new_page()
                
                start_time = time.time()
                
                # Simulate user browsing
                home_page = UserHomePage(page)
                home_page.navigate_to_resort()
                home_page.get_available_rooms()
                
                end_time = time.time()
                browser.close()
                
                return end_time - start_time
        
        # Run 10 concurrent user sessions
        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(simulate_user_session) for _ in range(10)]
            response_times = [future.result() for future in futures]
        
        # Verify all requests completed within acceptable time
        max_response_time = max(response_times)
        assert max_response_time < 5.0, f"Response time too slow: {max_response_time}s"
        
        # Verify average response time
        avg_response_time = sum(response_times) / len(response_times)
        assert avg_response_time < 3.0, f"Average response time too slow: {avg_response_time}s"
    
    def test_database_performance(self, test_data):
        """Test database query performance"""
        from utils.database_utils import DatabaseUtils
        
        db = DatabaseUtils()
        
        # Test room query performance
        start_time = time.time()
        rooms = db.get_rooms()
        room_query_time = time.time() - start_time
        
        # Test booking query performance
        start_time = time.time()
        bookings = db.get_bookings()
        booking_query_time = time.time() - start_time
        
        # Verify query performance
        assert room_query_time < 1.0, f"Room query too slow: {room_query_time}s"
        assert booking_query_time < 2.0, f"Booking query too slow: {booking_query_time}s"
        
        db.close()
```

---

## 🎯 Test Execution Commands

### Basic Test Execution
```bash
# Run all tests
python run_tests.py

# Run smoke tests only
python run_tests.py --smoke

# Run tests in headless mode
python run_tests.py --headless

# Run tests in parallel
python run_tests.py --parallel
```

### Cross-Browser Testing
```bash
# Run cross-browser tests
python run_tests.py --cross-browser

# Run specific browser
pytest tests/ --browser=chromium
pytest tests/ --browser=firefox
pytest tests/ --browser=webkit
```

### Mobile Testing
```bash
# Run mobile tests
python run_tests.py --mobile

# Run specific mobile device
pytest tests/user/test_booking_flow.py::TestBookingFlow::test_mobile_booking_flow
```

### API Testing
```bash
# Run API tests only
python run_tests.py --api

# Run specific API test
pytest tests/api/test_room_api.py
```

---

## 📊 Test Metrics & KPIs

### Key Performance Indicators
- **Test Coverage:** 90%+ code coverage
- **Test Execution Time:** < 30 minutes for full suite
- **Pass Rate:** 95%+ test pass rate
- **Cross-Browser Compatibility:** 100% on Chrome, Firefox, Safari
- **Mobile Compatibility:** 100% on iOS and Android
- **API Response Time:** < 500ms average
- **Page Load Time:** < 3 seconds

### Test Reporting
- **HTML Reports:** Detailed test execution reports
- **Screenshots:** Automatic screenshots on failures
- **Videos:** Test execution recordings
- **Performance Metrics:** Response time and load testing results
- **Coverage Reports:** Code coverage analysis

---

This comprehensive test automation architecture provides a robust, scalable framework for testing your resort management system using Python Playwright. The framework supports cross-browser testing, mobile testing, API testing, and performance testing, ensuring comprehensive coverage of your application.
