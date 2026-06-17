import os
import io
import base64
from server import refine_with_groq_vision

# Create a mock 1x1 pixel JPEG image
mock_image_data = base64.b64decode(
    b'/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA='
)

def test_groq_vision():
    print("[*] Creating temporary test image...")
    temp_img_path = "temp_vision_test.jpg"
    with open(temp_img_path, "wb") as f:
        f.write(mock_image_data)
    
    print("[*] Testing Groq Vision model (meta-llama/llama-4-scout-17b-16e-instruct)...")
    try:
        # Ask to refine a "battery" detection (this should map to either battery or another landfill item like pen)
        refined_key = refine_with_groq_vision(temp_img_path, "battery")
        print(f"[+] Groq Vision result: {refined_key}")
    except Exception as e:
        print("[!] Vision refinement test failed:", e)
    finally:
        if os.path.exists(temp_img_path):
            os.remove(temp_img_path)

if __name__ == '__main__':
    test_groq_vision()
