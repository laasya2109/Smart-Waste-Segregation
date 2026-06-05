import requests
import json
import time

BASE_URL = "http://127.0.0.1:5001"

def run_tests():
    print("Starting integration verification tests...")
    
    # 1. Register a test user
    print("\n--- Testing Registration ---")
    reg_payload = {
        "name": "Validation Account",
        "email": "verify@test.com",
        "password": "verifypassword"
    }
    try:
        r = requests.post(f"{BASE_URL}/api/register", json=reg_payload)
        print("Status Code:", r.status_code)
        print("Response:", r.json())
    except Exception as e:
        print("Failed to register:", e)
        return

    # 2. Login
    print("\n--- Testing Login ---")
    login_payload = {
        "email": "verify@test.com",
        "password": "verifypassword"
    }
    try:
        r = requests.post(f"{BASE_URL}/api/login", json=login_payload)
        print("Status Code:", r.status_code)
        print("Response:", r.json())
    except Exception as e:
        print("Failed to log in:", e)
        return

    # 3. NLP Search
    print("\n--- Testing NLP Search ---")
    nlp_payload = {
        "query": "Old battery"
    }
    try:
        r = requests.post(f"{BASE_URL}/api/nlp", json=nlp_payload)
        print("Status Code:", r.status_code)
        print("Response:", r.json())
    except Exception as e:
        print("Failed NLP query:", e)
        return

    # 4. Stats Endpoint
    print("\n--- Testing User Statistics ---")
    try:
        r = requests.get(f"{BASE_URL}/api/stats?email=verify@test.com")
        print("Status Code:", r.status_code)
        print("Response:", r.json())
    except Exception as e:
        print("Failed to load statistics:", e)
        return

    # 5. History Endpoint
    print("\n--- Testing History Log ---")
    try:
        r = requests.get(f"{BASE_URL}/api/history?email=verify@test.com")
        print("Status Code:", r.status_code)
        print("Response:", r.json())
    except Exception as e:
        print("Failed to load history:", e)
        return

    print("\nIntegration tests completed.")

if __name__ == '__main__':
    run_tests()
