# Resort Management System - Test Automation Framework

## 🎯 Overview

This is a comprehensive test automation framework built with Python Playwright for the Resort Management System. The framework provides end-to-end testing capabilities including UI testing, API testing, cross-browser testing, and mobile testing.

## 🏗️ Architecture

### Framework Design Principles
- **Page Object Model (POM)** - Maintainable and reusable test code
- **Data-Driven Testing** - External test data management
- **Parallel Execution** - Faster test execution
- **Cross-Browser Testing** - Chrome, Firefox, Safari, Edge
- **Mobile Testing** - Responsive design validation
- **API Testing Integration** - Backend validation
- **CI/CD Integration** - Automated test execution

## 📁 Project Structure

```
test_automation/
├── config/                 # Configuration files
│   ├── settings.py         # Test configuration
│   └── browsers.py         # Browser configurations
├── pages/                  # Page Object Model
│   ├── base_page.py        # Base page class
│   ├── admin/              # Admin page objects
│   │   ├── login_page.py
│   │   └── rooms_page.py
│   └── user/               # User page objects
│       ├── home_page.py
│       └── booking_page.py
├── tests/                  # Test files
│   ├── conftest.py         # Pytest fixtures
│   ├── admin/              # Admin tests
│   │   └── test_room_management.py
│   └── user/               # User tests
│       └── test_booking_flow.py
├── data/                   # Test data
│   └── test_data.json
├── utils/                  # Utility classes
│   └── api_client.py
├── reports/                # Test reports
│   ├── html/
│   ├── screenshots/
│   └── videos/
├── requirements.txt        # Python dependencies
├── pytest.ini             # Pytest configuration
└── run_tests.py           # Test execution script
```

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js (for Playwright)
- Access to the Resort Management System

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd test_automation
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Install Playwright browsers**
   ```bash
   playwright install
   ```

4. **Set up environment variables**
   ```bash
   export BASE_URL="https://www.teqmates.com"
   export HEADLESS="true"
   ```

### Running Tests

#### Basic Test Execution
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

#### Specific Test Categories
```bash
# Run UI tests only
python run_tests.py --ui

# Run mobile tests only
python run_tests.py --mobile

# Run cross-browser tests
python run_tests.py --cross-browser

# Run API tests only
python run_tests.py --api
```

#### Direct Pytest Commands
```bash
# Run specific test file
pytest tests/admin/test_room_management.py

# Run tests with specific markers
pytest -m smoke

# Run tests in parallel
pytest -n auto

# Run tests with HTML report
pytest --html=reports/html/report.html
```

## 🧪 Test Categories

### 1. Smoke Tests (`@pytest.mark.smoke`)
- Critical functionality tests
- Basic user workflows
- Quick validation tests

### 2. UI Tests (`@pytest.mark.ui`)
- User interface testing
- Form validation
- Navigation testing

### 3. Mobile Tests (`@pytest.mark.mobile`)
- Responsive design testing
- Mobile-specific functionality
- Touch interactions

### 4. Cross-Browser Tests (`@pytest.mark.cross_browser`)
- Chrome, Firefox, Safari compatibility
- Browser-specific features
- Cross-platform testing

### 5. API Tests (`@pytest.mark.api`)
- Backend API testing
- Data validation
- Integration testing

## 📊 Test Data Management

### Test Data Structure
```json
{
  "rooms": {
    "valid_room": {
      "number": "TEST001",
      "type": "Deluxe",
      "price": 3000,
      "status": "Available",
      "adults": 2,
      "children": 1
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
    }
  },
  "users": {
    "admin": {
      "email": "admin@teqmates.com",
      "password": "admin123"
    }
  }
}
```

## 🔧 Configuration

### Environment Variables
```bash
# Base URL for testing
BASE_URL=https://www.teqmates.com

# Browser settings
HEADLESS=true
SLOW_MO=0
TIMEOUT=30000

# Database settings
DB_HOST=localhost
DB_PORT=5432
DB_NAME=resort_db
DB_USER=resort_user
DB_PASSWORD=ResortDB2024
```

### Browser Configuration
The framework supports multiple browsers:
- **Chromium** (default)
- **Firefox**
- **WebKit (Safari)**

Mobile devices:
- **iPhone 12**
- **Samsung Galaxy S21**

## 📈 Test Reporting

### HTML Reports
```bash
pytest --html=reports/html/report.html --self-contained-html
```

### Screenshots
- Automatic screenshots on test failures
- Stored in `reports/screenshots/`
- Named with test name and timestamp

### Videos
- Test execution recordings
- Stored in `reports/videos/`
- Useful for debugging complex scenarios

### Coverage Reports
```bash
pytest --cov=src --cov-report=html
```

## 🔄 CI/CD Integration

### GitHub Actions
```yaml
name: Test Automation
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.9'
    - name: Install dependencies
      run: |
        pip install -r requirements.txt
        playwright install
    - name: Run tests
      run: python run_tests.py --headless --parallel
```

### Jenkins Pipeline
```groovy
pipeline {
    agent any
    stages {
        stage('Install Dependencies') {
            steps {
                sh 'pip install -r requirements.txt'
                sh 'playwright install'
            }
        }
        stage('Run Tests') {
            steps {
                sh 'python run_tests.py --headless --parallel'
            }
        }
    }
    post {
        always {
            publishHTML([
                allowMissing: false,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'reports/html',
                reportFiles: 'report.html',
                reportName: 'Test Report'
            ])
        }
    }
}
```

## 🛠️ Development Guidelines

### Adding New Tests

1. **Create Page Object**
   ```python
   # pages/admin/new_feature_page.py
   from .base_page import BasePage
   
   class NewFeaturePage(BasePage):
       def __init__(self, page: Page):
           super().__init__(page)
       
       def perform_action(self):
           # Implementation
   ```

2. **Create Test File**
   ```python
   # tests/admin/test_new_feature.py
   import pytest
   
   @pytest.mark.smoke
   class TestNewFeature:
       def test_new_functionality(self, admin_login):
           # Test implementation
   ```

3. **Add Test Data**
   ```json
   // data/test_data.json
   {
     "new_feature": {
       "test_data": "value"
     }
   }
   ```

### Best Practices

1. **Use Page Object Model**
   - Keep page logic separate from test logic
   - Reusable page methods
   - Easy maintenance

2. **Data-Driven Testing**
   - External test data files
   - Parameterized tests
   - Easy data updates

3. **Proper Test Isolation**
   - Each test should be independent
   - Clean up test data
   - Use fixtures for setup/teardown

4. **Meaningful Test Names**
   - Descriptive test method names
   - Clear test documentation
   - Easy to understand failures

## 🐛 Debugging

### Common Issues

1. **Element Not Found**
   ```python
   # Wait for element before interaction
   self.wait_for_element(selector)
   self.click_element(selector)
   ```

2. **Timeout Issues**
   ```python
   # Increase timeout for slow operations
   self.wait_for_element(selector, timeout=60000)
   ```

3. **Cross-Browser Issues**
   ```python
   # Use browser-specific selectors
   if browser_name == "firefox":
       selector = "firefox-specific-selector"
   else:
       selector = "default-selector"
   ```

### Debug Mode
```bash
# Run tests with debug output
pytest -v -s --tb=long

# Run single test with debug
pytest tests/admin/test_room_management.py::TestRoomManagement::test_create_room_successfully -v -s
```

## 📊 Performance Testing

### Load Testing
```python
# tests/performance/test_load.py
import pytest
from concurrent.futures import ThreadPoolExecutor

class TestLoadPerformance:
    def test_concurrent_users(self):
        def simulate_user():
            # User simulation code
            pass
        
        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(simulate_user) for _ in range(10)]
            results = [future.result() for future in futures]
```

### Performance Metrics
- **Page Load Time:** < 3 seconds
- **API Response Time:** < 500ms
- **Test Execution Time:** < 30 minutes for full suite

## 🔒 Security Testing

### Authentication Testing
```python
def test_invalid_login(self, page):
    login_page = AdminLoginPage(page)
    login_page.navigate_to_login()
    login_page.login("invalid@email.com", "wrongpassword")
    assert "Invalid credentials" in login_page.get_error_message()
```

### Data Validation
```python
def test_sql_injection_prevention(self, page):
    # Test SQL injection attempts
    pass
```

## 📱 Mobile Testing

### Mobile Test Execution
```bash
# Run mobile tests
python run_tests.py --mobile

# Test specific mobile device
pytest tests/user/test_booking_flow.py::TestBookingFlow::test_mobile_booking_flow
```

### Mobile Configuration
```python
# Mobile viewport settings
mobile_config = {
    "iPhone 12": {"width": 390, "height": 844},
    "Samsung Galaxy S21": {"width": 384, "height": 854}
}
```

## 🎯 Test Metrics & KPIs

### Key Performance Indicators
- **Test Coverage:** 90%+ code coverage
- **Test Execution Time:** < 30 minutes for full suite
- **Pass Rate:** 95%+ test pass rate
- **Cross-Browser Compatibility:** 100% on Chrome, Firefox, Safari
- **Mobile Compatibility:** 100% on iOS and Android
- **API Response Time:** < 500ms average
- **Page Load Time:** < 3 seconds

### Test Reporting Dashboard
- Real-time test execution status
- Historical test trends
- Failure analysis and trends
- Performance metrics tracking

## 🤝 Contributing

### Code Standards
- Follow PEP 8 style guidelines
- Use type hints for better code clarity
- Write comprehensive docstrings
- Add proper error handling

### Pull Request Process
1. Create feature branch
2. Write tests for new functionality
3. Ensure all tests pass
4. Submit pull request with description
5. Code review and approval
6. Merge to main branch

## 📞 Support

### Getting Help
- Check the documentation
- Review existing test examples
- Check GitHub issues
- Contact the development team

### Reporting Issues
When reporting issues, please include:
- Test execution logs
- Screenshots/videos of failures
- Environment details
- Steps to reproduce

---

**Happy Testing! 🎉**

This framework provides a solid foundation for comprehensive testing of the Resort Management System. With proper configuration and usage, it will help ensure the quality and reliability of your application.
