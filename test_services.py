#!/usr/bin/env python3
"""
Test script to verify all AgriSens services are running correctly
"""

import requests
import sys
import time

def test_service(name, url, expected_content=None):
    """Test if a service is running and responding"""
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            print(f"✅ {name}: Running (Status: {response.status_code})")
            if expected_content and expected_content in response.text:
                print(f"   ✓ Expected content found")
            return True
        else:
            print(f"❌ {name}: Error (Status: {response.status_code})")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ {name}: Connection failed - {e}")
        return False

def main():
    print("🧪 Testing AgriSens Services")
    print("=" * 40)
    
    services = [
        ("Web Frontend", "http://localhost:8080", "AgriSens"),
        ("Crop Recommendation", "http://localhost:8501", "Streamlit"),
        ("Disease Identification", "http://localhost:8502", "Streamlit")
    ]
    
    all_running = True
    
    for name, url, expected in services:
        if not test_service(name, url, expected):
            all_running = False
        time.sleep(1)  # Small delay between tests
    
    print("\n" + "=" * 40)
    if all_running:
        print("🎉 All services are running successfully!")
        print("\n🌐 Access URLs:")
        print("   • Main Web App:     http://localhost:8080")
        print("   • Crop Recommendation: http://localhost:8501")
        print("   • Disease Identification: http://localhost:8502")
    else:
        print("⚠️  Some services are not running properly.")
        print("   Please check the startup script or start services manually.")
        sys.exit(1)

if __name__ == "__main__":
    main()
