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
