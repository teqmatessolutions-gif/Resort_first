#!/usr/bin/env python3
"""
Setup script for Resort Management System Test Automation Framework
"""
import subprocess
import sys
import os
from pathlib import Path

def run_command(command: list, description: str):
    """Run a command and handle errors"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed!")
        print(f"Error: {e.stderr}")
        return False

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 9):
        print("❌ Python 3.9 or higher is required!")
        print(f"Current version: {sys.version}")
        return False
    print(f"✅ Python version {sys.version.split()[0]} is compatible")
    return True

def install_dependencies():
    """Install Python dependencies"""
    return run_command([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], 
                      "Installing Python dependencies")

def install_playwright():
    """Install Playwright browsers"""
    return run_command([sys.executable, "-m", "playwright", "install"], 
                      "Installing Playwright browsers")

def create_directories():
    """Create necessary directories"""
    directories = [
        "reports/html",
        "reports/screenshots", 
        "reports/videos",
        "test_data/images"
    ]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
        print(f"✅ Created directory: {directory}")

def create_env_file():
    """Create .env file with default settings"""
    env_content = """# Test Automation Environment Variables
BASE_URL=https://www.teqmates.com
HEADLESS=false
SLOW_MO=0
TIMEOUT=30000

# Database Configuration (if needed)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=resort_db
DB_USER=resort_user
DB_PASSWORD=ResortDB2024
"""
    
    env_file = Path(".env")
    if not env_file.exists():
        with open(env_file, "w") as f:
            f.write(env_content)
        print("✅ Created .env file with default settings")
    else:
        print("ℹ️  .env file already exists")

def run_sample_test():
    """Run a sample test to verify setup"""
    print("\n🧪 Running sample test to verify setup...")
    return run_command([sys.executable, "-m", "pytest", "tests/admin/test_room_management.py::TestRoomManagement::test_create_room_successfully", "-v", "--headless"], 
                      "Running sample test")

def main():
    """Main setup function"""
    print("🚀 Setting up Resort Management System Test Automation Framework")
    print("=" * 70)
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Install dependencies
    if not install_dependencies():
        print("❌ Failed to install dependencies. Please check your Python environment.")
        sys.exit(1)
    
    # Install Playwright browsers
    if not install_playwright():
        print("❌ Failed to install Playwright browsers.")
        sys.exit(1)
    
    # Create directories
    create_directories()
    
    # Create .env file
    create_env_file()
    
    print("\n" + "=" * 70)
    print("🎉 Setup completed successfully!")
    print("\n📋 Next steps:")
    print("1. Update .env file with your specific settings")
    print("2. Update test_data.json with your test data")
    print("3. Run tests: python run_tests.py --smoke")
    print("\n📚 For more information, see README.md")
    
    # Ask if user wants to run sample test
    response = input("\n❓ Would you like to run a sample test? (y/n): ").lower().strip()
    if response in ['y', 'yes']:
        run_sample_test()

if __name__ == "__main__":
    main()
