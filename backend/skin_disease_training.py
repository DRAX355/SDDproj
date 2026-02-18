#Kaggle model training code just for reference, Models will be downloadable from backend directly
#Not necessary to run this
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout, BatchNormalization
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import ReduceLROnPlateau, EarlyStopping, ModelCheckpoint
import os
import shutil
import json
import numpy as np
from sklearn.utils.class_weight import compute_class_weight

# --- 1. CONFIGURATION ---
DATASET_HANDLE = "shubhamgoel27/dermnet"
IMG_SIZE = (224, 224)
BATCH_SIZE = 32

# --- 2. THE 13 TARGET CLASSES (General Skin Diseases) ---
KEEP_CLASSES = [
    "Acne and Rosacea Photos",
    "Actinic Keratosis Basal Cell Carcinoma and other Malignant Lesions",
    "Atopic Dermatitis Photos",
    "Bullous Disease Photos",
    "Cellulitis Impetigo and other Bacterial Infections",
    "Eczema Photos",
    "Exanthems and Drug Eruptions",
    "Hair Loss Photos Alopecia and other Hair Diseases",
    "Herpes HPV and other STDs Photos",
    "Melanoma Skin Cancer Nevi and Moles",
    "Nail Fungus and other Nail Disease",
    "Psoriasis pictures Lichen Planus and related diseases",
    "Urticaria Hives"
]

def prepare_dataset():
    print("📥 Downloading Dermnet Dataset...")
    try:
        import kagglehub
        dataset_path = kagglehub.dataset_download(DATASET_HANDLE)
    except Exception as e:
        print("Kagglehub failed, using default path.")
        dataset_path = "../input/dermnet"

    train_dir = os.path.join(dataset_path, 'train')
    if not os.path.exists(train_dir):
        for root, dirs, files in os.walk(dataset_path):
            if 'train' in dirs:
                train_dir = os.path.join(root, 'train')
                break
                
    print(f"📂 Original dataset found at: {train_dir}")
    
    clean_train = "./clean_dataset/train"
    if os.path.exists(clean_train):
        shutil.rmtree("./clean_dataset")
    os.makedirs(clean_train)

    print("🧹 Filtering down to the 13 general disease classes...")
    copied_count = 0
    for class_name in os.listdir(train_dir):
        if any(target in class_name for target in KEEP_CLASSES) or class_name in KEEP_CLASSES:
            src = os.path.join(train_dir, class_name)
            dst = os.path.join(clean_train, class_name)
            shutil.copytree(src, dst)
            print(f"  ✅ Kept: {class_name}")
            copied_count += 1
            
    print(f"Total classes kept: {copied_count}")
    return clean_train

def build_and_train_model(model_name, train_gen, val_gen, num_classes, class_weights):
    print(f"\n{'='*50}\n🚀 Training {model_name}\n{'='*50}")
    
    # EXACT PREPROCESSING FIX (No global rescale)
    inputs = tf.keras.Input(shape=(224, 224, 3))
    
    if model_name == 'EfficientNetB0':
        base_model = tf.keras.applications.EfficientNetB0(weights='imagenet', include_top=False, input_tensor=inputs)
    elif model_name == 'ResNet50':
        x = tf.keras.applications.resnet50.preprocess_input(inputs)
        base_model = tf.keras.applications.ResNet50(weights='imagenet', include_top=False, input_tensor=x)
    elif model_name == 'MobileNetV2':
        x = tf.keras.applications.mobilenet_v2.preprocess_input(inputs)
        base_model = tf.keras.applications.MobileNetV2(weights='imagenet', include_top=False, input_tensor=x)
    
    base_model.trainable = False
    
    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = BatchNormalization()(x)
    x = Dense(512, activation='relu')(x)
    x = Dropout(0.5)(x)
    predictions = Dense(num_classes, activation='softmax')(x)
    
    model = Model(inputs=inputs, outputs=predictions)
    
    # Callbacks
    early_stop = EarlyStopping(monitor='val_accuracy', patience=4, restore_best_weights=True, verbose=1)
    reduce_lr = ReduceLROnPlateau(monitor='val_loss', factor=0.3, patience=2, min_lr=1e-7, verbose=1)
    
    # Phase 1: Train Top
    model.compile(optimizer=Adam(learning_rate=0.001), loss='categorical_crossentropy', metrics=['accuracy'])
    print("Phase 1: Warming up top layers (Accuracy will start low, this is normal)...")
    model.fit(
        train_gen, 
        validation_data=val_gen, 
        epochs=10, 
        callbacks=[early_stop, reduce_lr],
        class_weight=class_weights # Forces AI to learn rare diseases equally
    )
    
    # Phase 2: Fine-tuning deeper layers
    print("Phase 2: Fine-tuning deeper layers safely...")
    base_model.trainable = True
    
    # CRITICAL FIX: Keep BatchNormalization frozen so the brain doesn't scramble!
    for layer in base_model.layers:
        if isinstance(layer, tf.keras.layers.BatchNormalization):
            layer.trainable = False
            
    # Freeze bottom layers, only train top 50
    for layer in base_model.layers[:-50]:
        layer.trainable = False
        
    model.compile(optimizer=Adam(learning_rate=1e-5), loss='categorical_crossentropy', metrics=['accuracy'])
    
    # Checkpoint ensures we save the highest accuracy epoch automatically
    filename = f"{model_name}_13class.keras"
    checkpoint = ModelCheckpoint(filename, monitor='val_accuracy', save_best_only=True, mode='max', verbose=1)
    early_stop_ft = EarlyStopping(monitor='val_accuracy', patience=5, restore_best_weights=True, verbose=1)
    
    model.fit(
        train_gen, 
        validation_data=val_gen, 
        epochs=15, 
        callbacks=[early_stop_ft, reduce_lr, checkpoint],
        class_weight=class_weights
    )
    
    print(f"💾 Best {model_name} version saved securely to {filename}")

def main():
    train_dir = prepare_dataset()
    
    # Data Augmentation (No rescale=1./255 here, the models handle their own math)
    datagen = ImageDataGenerator(
        rotation_range=30,
        width_shift_range=0.2,
        height_shift_range=0.2,
        zoom_range=0.2,
        horizontal_flip=True,
        validation_split=0.2 
    )
    
    train_gen = datagen.flow_from_directory(
        train_dir,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='training'
    )
    
    val_gen = datagen.flow_from_directory(
        train_dir,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='validation'
    )
    
    print(f"\n🎯 Training on {train_gen.num_classes} classes.")
    
    # Calculate Class Weights to fix Imbalance
    classes = np.unique(train_gen.classes)
    weights = compute_class_weight('balanced', classes=classes, y=train_gen.classes)
    class_weights = dict(zip(classes, weights))
    print("⚖️ Applied Class Balancing Weights to prevent AI from favoring common diseases.")
    
    # Save the class dictionary mapping
    with open('class_indices.json', 'w') as f:
        json.dump(train_gen.class_indices, f)
    print("💾 Saved class_indices.json")
    
    # Train the 3 Models (The Committee)
    build_and_train_model('EfficientNetB0', train_gen, val_gen, train_gen.num_classes, class_weights)
    build_and_train_model('ResNet50', train_gen, val_gen, train_gen.num_classes, class_weights)
    build_and_train_model('MobileNetV2', train_gen, val_gen, train_gen.num_classes, class_weights)
    
    print("\n🎉 ALL DONE! Please download the three .keras files and the class_indices.json file from the output panel.")

if __name__ == "__main__":
    main()