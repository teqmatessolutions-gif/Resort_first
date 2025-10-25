# Test Execution Guide

## 🚀 Quick Start Commands

### 1. Setup (First Time Only)
```bash
# Navigate to test automation directory
cd test_automation

# Run setup script
python setup.py

# Or manual setup
pip install -r requirements.txt
playwright install
```

### 2. Basic Test Execution
```bash
# Run all tests
python run_tests.py

# Run smoke tests only (recommended for quick validation)
python run_tests.py --smoke

# Run tests in headless mode (faster, no browser UI)
python run_tests.py --headless

# Run tests in parallel (faster execution)
python run_tests.py --parallel
```

### 3. Specific Test Categories
```bash
# UI Tests - User interface and user workflows
python run_tests.py --ui

# Mobile Tests - Responsive design and mobile functionality
python run_tests.py --mobile

# Cross-Browser Tests - Chrome, Firefox, Safari compatibility
python run_tests.py --cross-browser

# API Tests - Backend API validation
python run_tests.py --api
```

### 4. Advanced Test Execution
```bash
# Run specific test file
pytest tests/admin/test_room_management.py

# Run specific test method
pytest tests/admin/test_room_management.py::TestRoomManagement::test_create_room_successfully

# Run tests with specific markers
pytest -m smoke
pytest -m "smoke or ui"
pytest -m "not slow"

# Run tests with detailed output
pytest -v -s --tb=long

# Run tests with HTML report
pytest --html=reports/html/report.html --self-contained-html
```

## 📊 Test Execution Scenarios

### Scenario 1: Daily Smoke Testing
```bash
# Quick validation of critical functionality
python run_tests.py --smoke --headless --parallel
```
**Duration:** ~5 minutes  
**Coverage:** Critical user workflows

### Scenario 2: Full Regression Testing
```bash
# Complete test suite
python run_tests.py --regression --headless --parallel
```
**Duration:** ~30 minutes  
**Coverage:** All functionality

### Scenario 3: Cross-Browser Testing
```bash
# Test across all supported browsers
python run_tests.py --cross-browser --headless
```
**Duration:** ~45 minutes  
**Coverage:** Chrome, Firefox, Safari compatibility

### Scenario 4: Mobile Testing
```bash
# Test mobile responsiveness
python run_tests.py --mobile --headless
```
**Duration:** ~15 minutes  
**Coverage:** Mobile devices and responsive design

### Scenario 5: API Testing
```bash
# Test backend APIs
python run_tests.py --api
```
**Duration:** ~10 minutes  
**Coverage:** Backend API endpoints

## 🔧 Environment Configuration

### Environment Variables
```bash
# Set base URL for testing
export BASE_URL="https://www.teqmates.com"

# Run in headless mode
export HEADLESS="true"

# Set slow motion for debugging
export SLOW_MO="1000"

# Set timeout for operations
export TIMEOUT="30000"
```

### Test Data Configuration
Update `data/test_data.json` with your specific test data:
```json
{
  "users": {
    "admin": {
      "email": "your-admin@email.com",
      "password": "your-password"
    }
  },
  "rooms": {
    "valid_room": {
      "number": "AUTO001",
      "type": "Deluxe",
      "price": 3000
    }
  }
}
```

## 📈 Test Reporting

### HTML Reports
```bash
# Generate HTML report
pytest --html=reports/html/report.html --self-contained-html

# View report
open reports/html/report.html
```

### Screenshots and Videos
- **Screenshots:** Automatically captured on test failures
- **Videos:** Test execution recordings for debugging
- **Location:** `reports/screenshots/` and `reports/videos/`

### Coverage Reports
```bash
# Generate coverage report
pytest --cov=src --cov-report=html

# View coverage report
open htmlcov/index.html
```

## 🐛 Debugging Tests

### Debug Mode
```bash
# Run with debug output
pytest -v -s --tb=long

# Run single test with debug
pytest tests/admin/test_room_management.py::TestRoomManagement::test_create_room_successfully -v -s

# Run with slow motion for visual debugging
HEADLESS=false SLOW_MO=1000 pytest tests/admin/test_room_management.py
```

### Common Debugging Commands
```bash
# Run tests with maximum verbosity
pytest -vvv -s

# Run tests and stop on first failure
pytest -x

# Run tests and drop into debugger on failure
pytest --pdb

# Run tests with specific browser
pytest --browser=firefox
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
    - name: Run smoke tests
      run: python run_tests.py --smoke --headless --parallel
    - name: Upload test results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: test-results
        path: reports/
```

### Jenkins Pipeline
```groovy
pipeline {
    agent any
    stages {
        stage('Setup') {
            steps {
                sh 'pip install -r requirements.txt'
                sh 'playwright install'
            }
        }
        stage('Smoke Tests') {
            steps {
                sh 'python run_tests.py --smoke --headless --parallel'
            }
        }
        stage('Full Tests') {
            when {
                branch 'main'
            }
            steps {
                sh 'python run_tests.py --regression --headless --parallel'
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

## 📱 Mobile Testing

### Mobile Test Execution
```bash
# Run mobile tests
python run_tests.py --mobile

# Test specific mobile device
pytest tests/user/test_booking_flow.py::TestBookingFlow::test_mobile_booking_flow
```

### Mobile Device Configuration
```python
# Available mobile devices
mobile_devices = {
    "iPhone 12": {"width": 390, "height": 844},
    "Samsung Galaxy S21": {"width": 384, "height": 854}
}
```

## 🌐 Cross-Browser Testing

### Browser-Specific Testing
```bash
# Test specific browser
pytest --browser=chromium
pytest --browser=firefox
pytest --browser=webkit

# Test all browsers
python run_tests.py --cross-browser
```

### Browser Configuration
```python
# Browser settings
browsers = {
    "chromium": {"headless": True, "args": ["--no-sandbox"]},
    "firefox": {"headless": True},
    "webkit": {"headless": True}
}
```

## ⚡ Performance Testing

### Load Testing
```bash
# Run performance tests
pytest tests/performance/ -v

# Test with specific load
pytest tests/performance/test_load.py::TestLoadPerformance::test_concurrent_user_load
```

### Performance Metrics
- **Page Load Time:** < 3 seconds
- **API Response Time:** < 500ms
- **Test Execution Time:** < 30 minutes for full suite

## 🔒 Security Testing

### Security Test Execution
```bash
# Run security tests
pytest -m security

# Test authentication
pytest tests/security/test_authentication.py
```

### Security Test Categories
- Authentication and authorization
- Input validation
- SQL injection prevention
- XSS protection
- CSRF protection

## 📊 Test Metrics

### Key Performance Indicators
- **Test Coverage:** 90%+ code coverage
- **Pass Rate:** 95%+ test pass rate
- **Execution Time:** < 30 minutes for full suite
- **Cross-Browser Compatibility:** 100% on supported browsers
- **Mobile Compatibility:** 100% on iOS and Android

### Test Reporting Dashboard
- Real-time test execution status
- Historical test trends
- Failure analysis and trends
- Performance metrics tracking

## 🛠️ Troubleshooting

### Common Issues

1. **Playwright Installation Issues**
   ```bash
   # Reinstall Playwright
   pip uninstall playwright
   pip install playwright
   playwright install
   ```

2. **Browser Launch Issues**
   ```bash
   # Install system dependencies
   playwright install-deps
   ```

3. **Test Data Issues**
   ```bash
   # Verify test data file
   python -c "import json; print(json.load(open('data/test_data.json')))"
   ```

4. **Environment Issues**
   ```bash
   # Check environment variables
   python -c "import os; print(os.getenv('BASE_URL'))"
   ```

### Getting Help
- Check the README.md for detailed documentation
- Review existing test examples
- Check GitHub issues for known problems
- Contact the development team

## 🎯 Best Practices

### Test Development
1. **Use Page Object Model** - Keep page logic separate from test logic
2. **Data-Driven Testing** - Use external test data files
3. **Proper Test Isolation** - Each test should be independent
4. **Meaningful Test Names** - Descriptive test method names
5. **Comprehensive Assertions** - Verify all expected outcomes

### Test Execution
1. **Run Smoke Tests First** - Quick validation before full suite
2. **Use Parallel Execution** - Faster test execution
3. **Headless Mode for CI/CD** - Faster and more reliable
4. **Regular Test Maintenance** - Update tests with application changes
5. **Monitor Test Metrics** - Track pass rates and execution times

### Test Data Management
1. **Use Unique Test Data** - Avoid conflicts between tests
2. **Clean Up Test Data** - Remove test data after execution
3. **Externalize Test Data** - Use JSON files for test data
4. **Parameterized Tests** - Use pytest.mark.parametrize for data-driven tests

---

**Happy Testing! 🎉**

This guide provides comprehensive instructions for executing tests in the Resort Management System Test Automation Framework. Follow these guidelines for effective test execution and maintenance.
