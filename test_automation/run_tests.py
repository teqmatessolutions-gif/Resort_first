#!/usr/bin/env python3
"""
Test execution script for Resort Management System
"""
import subprocess
import sys
import argparse
from pathlib import Path

def run_command(command: list, description: str):
    """Run a command and handle errors"""
    print(f"\n{'='*50}")
    print(f"Running: {description}")
    print(f"Command: {' '.join(command)}")
    print(f"{'='*50}")
    
    result = subprocess.run(command, capture_output=True, text=True)
    
    if result.returncode != 0:
        print(f"❌ {description} failed!")
        print(f"Error: {result.stderr}")
        return False
    else:
        print(f"✅ {description} completed successfully!")
        return True

def main():
    parser = argparse.ArgumentParser(description="Run Resort Management System Tests")
    parser.add_argument("--smoke", action="store_true", help="Run smoke tests only")
    parser.add_argument("--regression", action="store_true", help="Run regression tests")
    parser.add_argument("--api", action="store_true", help="Run API tests only")
    parser.add_argument("--ui", action="store_true", help="Run UI tests only")
    parser.add_argument("--mobile", action="store_true", help="Run mobile tests only")
    parser.add_argument("--cross-browser", action="store_true", help="Run cross-browser tests")
    parser.add_argument("--parallel", action="store_true", help="Run tests in parallel")
    parser.add_argument("--headless", action="store_true", help="Run tests in headless mode")
    
    args = parser.parse_args()
    
    # Base pytest command
    base_cmd = ["python", "-m", "pytest"]
    
    # Add markers based on arguments
    markers = []
    if args.smoke:
        markers.append("smoke")
    if args.regression:
        markers.append("regression")
    if args.api:
        markers.append("api")
    if args.ui:
        markers.append("ui")
    if args.mobile:
        markers.append("mobile")
    if args.cross_browser:
        markers.append("cross_browser")
    
    if markers:
        base_cmd.extend(["-m", " or ".join(markers)])
    
    # Add parallel execution
    if args.parallel:
        base_cmd.extend(["-n", "auto"])
    
    # Add headless mode
    if args.headless:
        base_cmd.extend(["--headless"])
    
    # Add test paths
    if not any([args.smoke, args.regression, args.api, args.ui, args.mobile]):
        base_cmd.append("tests/")
    
    # Run tests
    success = run_command(base_cmd, "Test Execution")
    
    if success:
        print("\n🎉 All tests completed successfully!")
        sys.exit(0)
    else:
        print("\n💥 Some tests failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()
