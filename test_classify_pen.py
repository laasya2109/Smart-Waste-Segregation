import io
from server import app

# Create a mock image file
dummy_img = io.BytesIO(b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\rIDATx\x9cc`\x00\x00\x00\x02\x00\x01H\xaf\xa4q\x00\x00\x00\x00IEND\xaeB`\x82')

client = app.test_client()

print("[*] Testing pen classification endpoint...")
response = client.post('/api/classify', data={
    'image': (dummy_img, 'pen.png'),
    'email': 'verify@test.com',
    'description': 'pen'
})

print(f"[+] Status Code: {response.status_code}")
data = response.get_json()
if data and data.get('success'):
    print("[+] Classification Success!")
    print(f"[+] Item Name: {data.get('item_name')}")
    print(f"[+] Category: {data.get('category')}")
    print(f"[+] Bin: {data.get('bin_name')}")
    print(f"[+] Recyclable: {data.get('recyclable')}")
    print(f"[+] Confidence: {data.get('confidence')}%")
    print(f"[+] Objects List: {data.get('objects')}")
else:
    print(f"[!] Classification failed: {data}")
