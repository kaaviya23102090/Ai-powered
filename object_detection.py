from ultralytics import YOLO
import cv2
import numpy as np
from PIL import Image

model = YOLO("yolov8n.pt")  # Load pre-trained YOLOv8 model

def detect_obstacles(image):
    img = Image.open(image).convert('RGB')
    img = np.array(img)

    results = model(img)
    obstacles = []
    
    for result in results:
        for box in result.boxes:
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            label = result.names[int(box.cls)]
            confidence = float(box.conf)
            
            if confidence > 0.5:  # Confidence threshold
                obstacles.append({"label": label, "confidence": confidence})
    
    return obstacles
