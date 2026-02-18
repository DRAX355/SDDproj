# Skin Disease Detection System 🩺

A full-stack medical analysis application that detects **13 different types of skin diseases** using Deep Learning. The project features a React.js frontend and a Python Flask backend hosting a **Multi-Model Ensemble AI** (EfficientNetB0, ResNet50, MobileNetV2) for high-accuracy predictions.

---

## 🌟 Features

- **Ensemble AI Analysis** — A "Committee of Doctors" approach aggregating votes from EfficientNetB0, ResNet50, and MobileNetV2 to reduce false positives.
- **13 Conditions Detected** — Covers Acne, Melanoma, Eczema, Psoriasis, and more.
- **Role-Based Access** — Dedicated dashboards for Patients (Upload & Scan) and Admins.
- **Real-Time History** — Saves patient reports and diagnosis history locally.
- **Secure Architecture** — Separation of concerns with a dedicated Flask API server.
- **Responsive UI** — Built with React & Tailwind CSS for mobile and desktop.

---

## 📂 Project Structure

```
skin-disease-project/
├── backend/                          # 🐍 Python API Server
│   ├── app.py                        # Flask Server (Entry Point)
│   ├── EfficientNetB0_13class.keras  # AI Model 1
│   ├── ResNet50_13class.keras        # AI Model 2
│   ├── MobileNetV2_13class.keras     # AI Model 3
│   ├── class_indices.json            # Class Labels (0 = Acne, etc.)
│   └── requirements.txt             # Python Dependencies
│
├── frontend/                         # ⚛️ React Application
│   ├── src/
│   │   ├── pages/                    # Dashboard & Auth Screens
│   │   ├── config/                   # Disease Info & Settings
│   │   └── ...
│   └── ...
│
└── README.md
```

---

## 🛠️ Prerequisites

Ensure the following are installed before proceeding:

| Tool | Version | Link |
|------|---------|------|
| Node.js | v16+ | [Download](https://nodejs.org) |
| Python | v3.8+ | [Download](https://python.org) |
| Git | Latest | [Download](https://git-scm.com) |
| Git LFS | Latest | [Download](https://git-lfs.github.com) |

> **Git LFS is required** to download the AI model files.

---

## 🚀 Installation Guide

### Step 1 — Clone the Repository

```bash
git clone https://github.com/DRAX355/SDDproj.git
cd SDDproj
```

Pull the large model files via Git LFS:

```bash
git lfs install
git lfs pull
```

---

### Step 2 — Setup Backend (AI Server)

Navigate to the backend folder and create a virtual environment:

```bash
cd backend
python -m venv venv
```

Activate the virtual environment:

```bash
# Windows (CMD)
venv\Scripts\activate

# Windows (PowerShell)
venv\Scripts\activate.ps1

# macOS / Linux
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

> This installs Flask, TensorFlow, Pillow, and NumPy.

**Verify model files** — ensure these files exist in `backend/` and are **larger than 10 MB** (not 1 KB LFS pointers):
- `EfficientNetB0_13class.keras`
- `ResNet50_13class.keras`
- `MobileNetV2_13class.keras`

Start the backend server:

```bash
python app.py
```

✅ **Success:** You should see `Running on http://127.0.0.1:5000` and `All models loaded successfully!`

> Keep this terminal window **open**.

---

### Step 3 — Setup Frontend (User Interface)

Open a **new terminal window** (keep the backend running in the first).

```bash
cd frontend
npm install
npm run dev
```

✅ **Success:** You should see `Local: http://localhost:5173/`

---

## 🖱️ How to Use

1. Open your browser and go to **http://localhost:5173**
2. Register a new account and select the **Patient** role.
   > The app uses Local Storage for demo purposes.
3. Navigate to the **Patient Dashboard**.
4. Click **Upload Image** and select a photo of a skin condition.
5. Click **Analyze Skin**.
6. The frontend sends the image to the Flask backend, which runs it through all 3 models and calculates a weighted ensemble result.
7. The **Diagnosis, Confidence Score, and Treatment** recommendation appear on screen.

---

## 🧠 Supported Conditions (13 Classes)

| # | Condition |
|---|-----------|
| 1 | Acne and Rosacea |
| 2 | Actinic Keratosis, Basal Cell Carcinoma, and other Malignant Lesions |
| 3 | Atopic Dermatitis |
| 4 | Bullous Disease |
| 5 | Cellulitis, Impetigo, and other Bacterial Infections |
| 6 | Eczema |
| 7 | Exanthems and Drug Eruptions |
| 8 | Hair Loss (Alopecia) and other Hair Diseases |
| 9 | Herpes, HPV, and other STDs |
| 10 | Melanoma Skin Cancer, Nevi, and Moles |
| 11 | Nail Fungus and other Nail Disease |
| 12 | Psoriasis, Lichen Planus, and related diseases |
| 13 | Urticaria Hives |

---

## ❓ Troubleshooting

**"Model not found" or "File too small" errors**

Git LFS did not download the actual model files. Run the following inside the repository folder:

```bash
git lfs pull
```

Confirm the `.keras` files in `backend/` are **larger than 100 MB**.

---

**"Fetch Error" when analyzing an image**

- Ensure the backend is still running (`python app.py` terminal is open).
- Confirm Flask is running on port **5000**.

---

**Tailwind or PostCSS errors**

Reinstall the Tailwind configuration:

```bash
npm install -D tailwindcss@3.4.17 postcss autoprefixer
```

---

## 📜 License

This project is intended for **educational and research purposes only**.