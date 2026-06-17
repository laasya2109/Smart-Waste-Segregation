import os
import io
from server import app

# Create a mock image file
dummy_img = io.BytesIO(b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\rIDATx\x9cc`\x00\x00\x00\x02\x00\x01H\xaf\xa4q\x00\x00\x00\x00IEND\xaeB`\x82')

client = app.test_client()

print("Testing YOLO classification endpoint with custom description 'plastic bottle'...")
response = client.post('/api/classify', data={
    'image': (dummy_img, 'test_item.png'),
    'email': 'verify@test.com',
    'description': 'plastic bottle'
})

print("Status Code:", response.status_code)
print("Response JSON keys:", response.get_json().keys() if response.get_json() else None)
print("Detected objects list:", response.get_json().get('objects') if response.get_json() else None)
