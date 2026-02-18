from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import json
import os

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
    
    try:
        # 1. Preprocess
        processed_img = preprocess_image(file.read())
        
        # 2. Ensemble Voting
        # We collect probability lists from all 3 models
        all_probs = []
        model_details = {}
        
        for i, model in enumerate(models):
            preds = model.predict(processed_img, verbose=0)
            all_probs.append(preds[0])
            
            # (Optional) Log what each model thought, for debugging
            # ind = np.argmax(preds[0])
            # print(f"Model {i} thinks: {idx_to_class.get(ind)} ({preds[0][ind]:.2f})")

        # 3. Average the Predictions (Soft Voting)
        # This is where the magic happens: confident models overrule confused ones
        avg_pred = np.mean(all_probs, axis=0)
        
        # 4. Get Final Result
        class_idx = np.argmax(avg_pred)
        confidence = float(avg_pred[class_idx])
        predicted_class = idx_to_class.get(class_idx, "Unknown")
        
        return jsonify({
            'diagnosis': predicted_class,
            'confidence': round(confidence * 100, 2),
            'method': f'Ensemble Consensus ({len(models)} models)'
        })

    except Exception as e:
        print(f"Prediction Error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)