import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional, List, Dict
from datetime import datetime


def get_smtp_config():
    """Get SMTP configuration from environment variables."""
    return {
        'host': os.getenv('SMTP_HOST', 'smtp.gmail.com'),
        'port': int(os.getenv('SMTP_PORT', '587')),
        'username': os.getenv('SMTP_USER', ''),
        'password': os.getenv('SMTP_PASSWORD', ''),
        'from_email': os.getenv('SMTP_FROM_EMAIL', os.getenv('SMTP_USER', 'noreply@elysianretreat.com')),
        'from_name': os.getenv('SMTP_FROM_NAME', 'Elysian Retreat'),
        'use_tls': os.getenv('SMTP_USE_TLS', 'true').lower() == 'true'
    }


def send_email(
    to_email: str,
    subject: str,
    html_content: str,
    to_name: Optional[str] = None
) -> bool:
    """
    Send an email using SMTP.
    
    Args:
        to_email: Recipient email address
        subject: Email subject
        html_content: HTML email content
        to_name: Optional recipient name
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        config = get_smtp_config()
        
        # Skip sending if SMTP not configured
        if not config['username'] or not config['password']:
            print(f"[Email] SMTP not configured. Would send email to {to_email}: {subject}")
            return False
        
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = f"{config['from_name']} <{config['from_email']}>"
        msg['To'] = to_email
        
        # Add HTML content
        html_part = MIMEText(html_content, 'html')
        msg.attach(html_part)
        
        # Connect to SMTP server and send
        with smtplib.SMTP(config['host'], config['port']) as server:
            if config['use_tls']:
                server.starttls()
            server.login(config['username'], config['password'])
            server.send_message(msg)
        
        print(f"[Email] Successfully sent email to {to_email}: {subject}")
        return True
        
    except Exception as e:
        print(f"[Email] Failed to send email to {to_email}: {str(e)}")
        return False


def create_booking_confirmation_email(
    guest_name: str,
    booking_id: int,
    booking_type: str,  # 'room' or 'package'
    check_in: str,
    check_out: str,
    rooms: List[Dict],
    total_amount: Optional[float] = None,
    package_name: Optional[str] = None
) -> str:
    """
    Create HTML email template for booking confirmation.
    
    Args:
        guest_name: Guest's name
        booking_id: Booking ID
        booking_type: Type of booking ('room' or 'package')
        check_in: Check-in date
        check_out: Check-out date
        rooms: List of room dictionaries with 'number' and 'type'
        total_amount: Optional total amount
        package_name: Optional package name
    
    Returns:
        str: HTML email content
    """
    if rooms:
        rooms_html = ''.join([
            f'<li><strong>Room {room.get("number", "N/A")}</strong> - {room.get("type", "N/A")}</li>'
            for room in rooms
        ])
    else:
        rooms_html = '<li>No rooms assigned</li>'
    
    booking_title = f"Package: {package_name}" if booking_type == 'package' and package_name else "Room Booking"
    
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .header {{
                background: linear-gradient(135deg, #f59e0b, #d97706);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
            }}
            .content {{
                background: #f9fafb;
                padding: 30px;
                border-radius: 0 0 10px 10px;
            }}
            .booking-details {{
                background: white;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }}
            .detail-row {{
                padding: 10px 0;
                border-bottom: 1px solid #e5e7eb;
            }}
            .detail-row:last-child {{
                border-bottom: none;
            }}
            .detail-label {{
                font-weight: bold;
                color: #6b7280;
                display: inline-block;
                width: 150px;
            }}
            .detail-value {{
                color: #111827;
            }}
            .rooms-list {{
                list-style: none;
                padding: 0;
            }}
            .rooms-list li {{
                padding: 8px 0;
                border-bottom: 1px solid #e5e7eb;
            }}
            .rooms-list li:last-child {{
                border-bottom: none;
            }}
            .footer {{
                text-align: center;
                padding: 20px;
                color: #6b7280;
                font-size: 14px;
            }}
            .highlight {{
                background: #fef3c7;
                padding: 15px;
                border-left: 4px solid #f59e0b;
                margin: 20px 0;
                border-radius: 4px;
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>✨ Elysian Retreat</h1>
            <p>Booking Confirmation</p>
        </div>
        
        <div class="content">
            <p>Dear {guest_name},</p>
            
            <p>Thank you for your booking! We are delighted to confirm your reservation at Elysian Retreat.</p>
            
            <div class="highlight">
                <strong>Booking Confirmation Number: #{booking_id}</strong><br>
                <strong>Booking Type: {booking_title}</strong>
            </div>
            
            <div class="booking-details">
                <h2 style="margin-top: 0; color: #f59e0b;">Booking Details</h2>
                
                <div class="detail-row">
                    <span class="detail-label">Check-in:</span>
                    <span class="detail-value">{check_in}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Check-out:</span>
                    <span class="detail-value">{check_out}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Rooms:</span>
                    <span class="detail-value">
                        <ul class="rooms-list">
                            {rooms_html}
                        </ul>
                    </span>
                </div>
            </div>
            
            <div class="highlight">
                <strong>Important Information:</strong><br>
                • Please arrive at the resort on your check-in date<br>
                • Check-in time is from 2:00 PM onwards<br>
                • Check-out time is before 11:00 AM<br>
                • Please bring a valid ID proof for verification<br>
                • For any queries, please contact us at: <a href="mailto:info@elysianretreat.com">info@elysianretreat.com</a>
            </div>
            
            <p>We look forward to welcoming you and ensuring you have a memorable stay at Elysian Retreat!</p>
            
            <p>Warm regards,<br>
            <strong>The Elysian Retreat Team</strong></p>
        </div>
        
        <div class="footer">
            <p>This is an automated confirmation email. Please do not reply to this email.</p>
            <p>&copy; {datetime.now().year} Elysian Retreat. All rights reserved.</p>
        </div>
    </body>
    </html>
    """
    
    return html

