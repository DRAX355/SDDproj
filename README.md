# Skin Disease Detection System 🩺

A full-stack medical analysis application that detects 23 different types of skin diseases using Deep Learning.

This project consists of a React.js Frontend for the user interface and a Python Flask Backend that hosts the trained AI model.

## 🌟 Features

- **AI Analysis**: Detects 23 skin conditions (Acne, Melanoma, Eczema, etc.) with a custom trained MobileNetV2/EfficientNet model.
- **Role-Based Access**: Dedicated dashboards for Patients (Upload & Scan) and Admins.
- **Real-Time History**: Saves patient reports and diagnosis history locally.
- **Secure Architecture**: Separation of concerns with a dedicated API server for AI processing.
- **Responsive UI**: Built with Tailwind CSS to work on mobile and desktop.

## 📂 Project Structure

```
skin-disease-project/
├── backend/                   # 🐍 Python API Server
│   ├── app.py                 # Flask Server (Entry Point)
│   ├── skin_disease_model.h5  # The Trained AI Model
│   ├── class_indices.json     # Class Labels (0 = Acne, etc.)
│   └── requirements.txt       # Python Dependencies
│
├── frontend/                  # ⚛️ React Application
│   ├── src/                   # Source Code
│   │   ├── pages/             # Dashboard & Auth Screens
│   │   ├── config/            # Disease Info & Settings
│   │   └── ...
│   └── ...
│
└── README.md                  # This file
```

## 🛠️ Prerequisites

Before running the project, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.8 or higher) - [Download](https://www.python.org/)
- **Git** - [Download](https://git-scm.com/)

## 🚀 Installation Guide

Follow these steps exactly to set up the project on your local machine.

### Step 1: Clone the Repository

Open your terminal (Command Prompt/PowerShell) and run:

```bash
git clone https://github.com/DRAX#%%/skin-disease-detection.git
cd skin-disease-detection
```

### Step 2: Setup Backend (The AI Server)

The backend requires Python libraries to run the AI model.

1. Navigate to the backend folder and create venv:
   ```bash
   cd backend
   ```
   ```bash
   python -m venv venv
   ```
   for cmd:
   ```bash
   venv\Scripts\activate
   ```
   for powershell:
   ```bash
   venv\Scripts\activate.ps1
   ```

3. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
   *(Note: This installs Flask, TensorFlow, Pillow, and NumPy)*

4. **CRITICAL: Verify the Model**
   
   Ensure that the file `skin_disease_model.h5` exists inside the `backend/` folder.
   
   If you cloned this repo and the file is missing (due to GitHub size limits), please download the model manually from [Your External Link] and place it in the `backend/` folder.

5. Start the Backend Server:
   ```bash
   python app.py
   ```

✅ **Success**: You should see `Running on http://127.0.0.1:5000` and `Model loaded successfully!`.

*(Keep this terminal window OPEN)*

### Step 3: Setup Frontend (The User Interface)

Open a NEW terminal window (keep the backend running in the first one).

1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Start the Web App:
   ```bash
   npm run dev
   ```

✅ **Success**: You should see `Local: http://localhost:5173/`.

## 🖱️ How to Use

1. Open your browser and go to `http://localhost:5173`.
2. Register a new account (Select "Patient" role).
   - *Note: This is a demo app, so data is saved to your browser's Local Storage.*
3. Go to the **Patient Dashboard**.
4. Click **Upload Image** and select a photo of a skin condition.
5. Click **Analyze Skin**.
   - The frontend sends the image to your running Python backend.
   - The backend processes it with the `.h5` model.
6. The result (Diagnosis, Confidence, Treatment) appears on your screen.

## 🧠 Supported Diseases (23 Classes)

The model is trained to identify the following conditions:

- Acne and Rosacea
- Actinic Keratosis
- Atopic Dermatitis
- Bullous Disease
- Cellulitis
- Eczema
- Exanthems and Drug Eruptions
- Hair Loss (Alopecia)
- Herpes HPV and other STDs
- Light Diseases and Pigmentation
- Lupus and Connective Tissue
- Melanoma Skin Cancer
- Nail Fungus
- Poison Ivy and Contact Dermatitis
- Psoriasis
- Scabies and Lyme Disease
- Seborrheic Keratoses
- Systemic Disease
- Tinea Ringworm and Fungal
- Urticaria Hives
- Vascular Tumors
- Vasculitis
- Warts and Viral Infections

## ❓ Troubleshooting

### 1. "Fetch Error" or "Network Error" when analyzing:

- **Is the Backend running?** Check if the terminal running `python app.py` is still open.
- **Is it running on port 5000?** The frontend expects `http://localhost:5000`.

### 2. "Model not found" error in Backend terminal:

- Make sure `skin_disease_model.h5` is strictly inside the `backend/` folder, not in a subfolder or outside it.
- Make sure the filename matches exactly.

### 3. "Tailwind" or "PostCSS" errors in Frontend:

- If you see version errors, run: 
  ```bash
  npm install -D tailwindcss@3.4.17 postcss autoprefixer
  ```
  inside the `frontend` folder.

## 📜 License

This project is for educational and research purposes.
