import json
from server import app

client = app.test_client()

print("Testing /api/chat endpoint...")
response = client.post('/api/chat', json={"query": "How do I compost banana peels?"})
print("Status Code:", response.status_code)
print("Response JSON:", response.get_json())
