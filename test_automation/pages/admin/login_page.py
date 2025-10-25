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
