import os
import requests

# Load environment variables
env_path = os.path.join(os.path.dirname(__file__), '.env')
if os.path.exists(env_path):
    with open(env_path, 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#'):
                key_val = line.split('=', 1)
                if len(key_val) == 2:
                    os.environ[key_val[0].strip()] = key_val[1].strip()

GROQ_API_KEY = os.environ.get('GROQ_API_KEY', '')

def test_groq_connection():
    if not GROQ_API_KEY:
        print("[!] GROQ_API_KEY is missing!")
        return
    
    print("[*] Testing Groq Text API connection...")
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {GROQ_API_KEY}"
    }
    payload = {
        "model": "llama-3.1-8b-instant",
        "messages": [
            {"role": "user", "content": "Say hello from EcoStation AI!"}
        ],
        "temperature": 0.5
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=8)
        if response.status_code == 200:
            content = response.json()['choices'][0]['message']['content']
            print("[+] Connection successful! Response:")
            print(content)
        else:
            print(f"[!] Failed with status code {response.status_code}: {response.text}")
    except Exception as e:
        print("[!] Error contacting Groq:", e)

if __name__ == '__main__':
    test_groq_connection()
