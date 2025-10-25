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
