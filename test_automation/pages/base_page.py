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
