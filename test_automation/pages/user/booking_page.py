from .base_page import BasePage
from playwright.sync_api import Page
from typing import List, Dict

class UserBookingPage(BasePage):
    # Selectors
    BOOKING_FORM = "form"
    GUEST_NAME_INPUT = "input[name='guest_name']"
    GUEST_EMAIL_INPUT = "input[name='guest_email']"
    GUEST_MOBILE_INPUT = "input[name='guest_mobile']"
    CHECK_IN_INPUT = "input[name='check_in']"
    CHECK_OUT_INPUT = "input[name='check_out']"
    ADULTS_INPUT = "input[name='adults']"
    CHILDREN_INPUT = "input[name='children']"
    SUBMIT_BUTTON = "button[type='submit']"
    SUCCESS_MESSAGE = ".success-message"
    ERROR_MESSAGE = ".error-message"
    VALIDATION_ERRORS = ".validation-error"
    ROOM_SELECTION = ".room-selection"
    ROOM_IMAGES = ".room-selection img"
    
    def __init__(self, page: Page):
        super().__init__(page)
    
    def fill_booking_form(self, booking_data: Dict):
        """Fill booking form with provided data"""
        self.wait_for_element(self.BOOKING_FORM)
        
        self.fill_input(self.GUEST_NAME_INPUT, booking_data["guest_name"])
        self.fill_input(self.GUEST_EMAIL_INPUT, booking_data["guest_email"])
        self.fill_input(self.GUEST_MOBILE_INPUT, booking_data["guest_mobile"])
        self.fill_input(self.CHECK_IN_INPUT, booking_data["check_in"])
        self.fill_input(self.CHECK_OUT_INPUT, booking_data["check_out"])
        self.fill_input(self.ADULTS_INPUT, str(booking_data["adults"]))
        self.fill_input(self.CHILDREN_INPUT, str(booking_data["children"]))
    
    def submit_booking(self):
        """Submit the booking form"""
        self.click_element(self.SUBMIT_BUTTON)
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
    
    def get_validation_errors(self) -> List[str]:
        """Get list of validation errors"""
        errors = []
        error_elements = self.page.locator(self.VALIDATION_ERRORS)
        
        for i in range(error_elements.count()):
            error_text = error_elements.nth(i).text_content()
            if error_text:
                errors.append(error_text)
        
        return errors
    
    def get_room_images_count(self) -> int:
        """Get count of room images in booking form"""
        return self.get_element_count(self.ROOM_IMAGES)
    
    def is_mobile_form_visible(self) -> bool:
        """Check if mobile booking form is visible"""
        return self.is_element_visible(self.BOOKING_FORM)
