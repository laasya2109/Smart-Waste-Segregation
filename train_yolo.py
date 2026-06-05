# ==========================================================
# EcoStation - Custom YOLOv8 Waste Classifier Training Script
# ==========================================================
# Use this script to train your own custom model on waste classes:
# plastic_bottle, glass_bottle, cardboard, newspaper, metal_can, battery, etc.
# Ensure you have the 'ultralytics' library installed:
# pip install ultralytics

import os
from ultralytics import YOLO

def check_dataset_ready():
    # Helper to check if dataset directory is present
    yaml_path = 'waste_dataset/data.yaml'
    if not os.path.exists(yaml_path):
        print(f"[-] Error: '{yaml_path}' not found.")
        print("[*] Please create a 'waste_dataset' folder with 'train/' and 'val/' subfolders, and configure 'data.yaml'.")
        return False
    return True

def train_custom_model():
    if not check_dataset_ready():
        return

    print("[+] Loading pre-trained YOLOv8m (Medium) backbone...")
    # Load the COCO-pretrained weights as the starting point for Transfer Learning
    model = YOLO('yolov8m.pt')

    print("[+] Starting training on custom waste dataset...")
    # Train the model. Modify parameters depending on your hardware:
    # - epochs: Number of complete passes through the dataset.
    # - imgsz: Input image dimensions (640x640 is standard).
    # - batch: Number of images per training batch (reduce if running out of GPU memory).
    # - device: 0 to train on CUDA GPU, or 'cpu' if no NVIDIA GPU is available.
    model.train(
        data='waste_dataset/data.yaml',
        epochs=50,
        imgsz=640,
        batch=16,
        device='cpu', # Change to 0 for NVIDIA GPU execution
        workers=4,
        project='runs/train',
        name='ecostation_yolov8m'
    )
    
    print("[+] Training completed successfully!")
    print("[*] Your optimized weights file will be saved at: runs/train/ecostation_yolov8m/weights/best.pt")
    print("[*] Simply rename it to 'yolov8m.pt' and place it in this workspace to use it automatically!")

if __name__ == '__main__':
    train_custom_model()
