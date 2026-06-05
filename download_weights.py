import urllib.request
import os

def download_weights():
    url = "https://huggingface.co/kendrickfff/waste-classification-yolov8-ken/resolve/main/yolov8n-waste-12cls-best.pt"
    output_path = "best.pt"
    
    print("[*] Starting download of pre-trained waste model weights...")
    try:
        # Download weights from Hugging Face resolve endpoint
        urllib.request.urlretrieve(url, output_path)
        print("[+] Download complete! Saved weights file as 'best.pt'")
        
        # Verify model loading and print class list
        from ultralytics import YOLO
        model = YOLO(output_path)
        print("[+] Model loaded successfully!")
        print("[*] Detected custom waste classes in model:")
        for cls_id, cls_name in model.names.items():
            print(f"    - Class {cls_id}: {cls_name}")
            
    except Exception as e:
        print(f"[-] Error: Failed to download or verify weights: {e}")

if __name__ == '__main__':
    download_weights()
