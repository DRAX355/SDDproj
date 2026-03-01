from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import json
import os
import cv2  # Added for skin detection

app = Flask(__name__)
CORS(app)

# --- CONFIGURATION ---
# We now load the Committee of 3 Models
MODEL_FILES = [
    'EfficientNetB0_13class.keras',
    'ResNet50_13class.keras',
    'MobileNetV2_13class.keras'
]
CLASS_INDICES_PATH = 'class_indices.json'

models = []

print(f"🚀 Loading Ensemble Committee ({len(MODEL_FILES)} models)...")
for m_path in MODEL_FILES:
    try:
        if os.path.exists(m_path):
            print(f"   • Loading {m_path}...", end=" ")
            # Load model (Compile=False makes it load faster/safer for prediction only)
            model = tf.keras.models.load_model(m_path, compile=False)
            models.append(model)
            print("✅")
        else:
            print(f"\n   ❌ Warning: {m_path} missing. Please download it from Kaggle.")
    except Exception as e:
        print(f"\n   ❌ Error loading {m_path}: {e}")

print(f"🏁 System Ready. {len(models)} models active.")

# Load Class Names
idx_to_class = {}
try:
    with open(CLASS_INDICES_PATH, 'r') as f:
        class_indices = json.load(f)
        idx_to_class = {v: k for k, v in class_indices.items()}
except Exception as e:
    print(f"Error loading class indices: {e}")


# --- NEW GATEKEEPER 1: OPENCV SKIN DETECTION ---
def is_valid_skin_image(image_bytes):
    """
    Checks if the uploaded image actually contains human skin tones.
    Prevents random objects (cars, dogs, trees) from being processed.
    """
    try:
        # Convert bytes to numpy array, then to OpenCV image
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            return False
            
        # Convert to HSV color space (better for isolating colors regardless of lighting)
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        
        # Define typical human skin color bounds in HSV (covers dark to light skin)
        lower_skin = np.array([0, 20, 50], dtype=np.uint8)
        upper_skin = np.array([20, 255, 255], dtype=np.uint8)
        
        # Create a mask that isolates skin colors
        mask = cv2.inRange(hsv, lower_skin, upper_skin)
        
        # Calculate the percentage of the image that is "skin"
        skin_percent = (cv2.countNonZero(mask) / (img.shape[0] * img.shape[1])) * 100
        
        # If less than 5% of the image is skin, reject it
        if skin_percent < 5.0:
            return False
        return True
    except Exception as e:
        print(f"Skin detection error: {e}")
        return True # Fallback to true if OpenCV fails, let the AI threshold catch it


def preprocess_image(image_bytes):
    """
    Standardize image for the Ensemble.
    Since we built preprocessing INTO the models during training,
    we just need to provide raw resized RGB images (0-255 range).
    """
    img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    img = img.resize((224, 224))
    img_array = np.array(img)
    
    # CRITICAL: Do NOT divide by 255 here. 
    # Our updated training script added 'preprocess_input' layers inside the models.
    # They expect raw 0-255 values.
    
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

@app.route('/predict', methods=['POST'])
def predict():
    if not models:
        return jsonify({'error': 'No models loaded. Check backend files.'}), 500
    
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400
    
    file = request.files['image']
    image_bytes = file.read() # Read once into memory
    
    try:
        # --- GATEKEEPER 1 CHECK ---
        if not is_valid_skin_image(image_bytes):
            return jsonify({
                'error': 'Invalid Image',
                'message': 'No human skin detected. Please upload a clear photo of a skin condition.'
            }), 400

        # 1. Preprocess
        processed_img = preprocess_image(image_bytes)
        
        # 2. Ensemble Voting & Breakdown Collection
        all_probs = []
        model_names = ['EfficientNet B0', 'ResNet 50', 'MobileNet V2']
        model_breakdown = []
        
        for i, model in enumerate(models):
            preds = model.predict(processed_img, verbose=0)
            all_probs.append(preds[0])
            
            # Get individual prediction for the breakdown
            m_idx = np.argmax(preds[0])
            m_conf = float(preds[0][m_idx])
            m_class = idx_to_class.get(m_idx, "Unknown")
            
            model_breakdown.append({
                'model': model_names[i],
                'diagnosis': m_class,
                'confidence': round(m_conf * 100, 2)
            })

        # 3. Average the Predictions (Soft Voting)
        avg_pred = np.mean(all_probs, axis=0)
        
        # 4. Get Final Result
        class_idx = np.argmax(avg_pred)
        confidence = float(avg_pred[class_idx])
        predicted_class = idx_to_class.get(class_idx, "Unknown")
        
        # --- GATEKEEPER 2: CONFIDENCE THRESHOLD ---
        if confidence < 0.40:
            return jsonify({
                'error': 'Uncertain Prediction',
                'message': 'The AI does not recognize this image. Ensure it is a clear, up-close photo of the skin.'
            }), 400
            
        return jsonify({
            'diagnosis': predicted_class,
            'confidence': round(confidence * 100, 2),
            'method': f'Ensemble Consensus ({len(models)} models)',
            'breakdown': model_breakdown  # <--- NEW DATA ADDED HERE
        })

    except Exception as e:
        print(f"Prediction Error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)