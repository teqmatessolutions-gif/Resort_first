from .base_page import BasePage
from playwright.sync_api import Page
from typing import List, Dict

class UserHomePage(BasePage):
    # Selectors
    ROOM_CARDS = ".room-card"
    BOOK_NOW_BUTTON = "button:has-text('Book Now')"
    ROOM_IMAGES = ".room-card img"
    AVAILABLE_ROOMS = ".room-card:has-text('Available')"
    
    def __init__(self, page: Page):
        super().__init__(page)
    
    def navigate_to_resort(self):
        """Navigate to resort home page"""
        self.navigate_to("/resort")
        self.wait_for_element(self.ROOM_CARDS)
    
    def get_available_rooms(self) -> List[Dict]:
        """Get list of available rooms"""
        rooms = []
        room_cards = self.page.locator(self.AVAILABLE_ROOMS)
        
        for i in range(room_cards.count()):
            card = room_cards.nth(i)
            room_data = {
                "number": card.locator(".room-number").text_content(),
                "type": card.locator(".room-type").text_content(),
                "price": card.locator(".room-price").text_content(),
                "status": card.locator(".room-status").text_content()
            }
            rooms.append(room_data)
        
        return rooms
    
    def click_book_now(self, room_number: str):
        """Click Book Now button for specific room"""
        room_card = self.page.locator(f".room-card:has-text('{room_number}')")
        room_card.locator(self.BOOK_NOW_BUTTON).click()
        self.page.wait_for_load_state("networkidle")
    
    def get_room_images_count(self) -> int:
        """Get count of room images displayed"""
        return self.get_element_count(self.ROOM_IMAGES)
    
    def is_mobile_layout(self) -> bool:
        """Check if mobile layout is active"""
        viewport = self.page.viewport_size
        return viewport["width"] < 768
