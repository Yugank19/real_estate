"""
ProVal ML Service — v3.0
Trains a Random Forest Regressor on the Indian real estate dataset at startup.
Every /predict call uses the trained model for inference.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import os
import pickle

from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import Ridge
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_absolute_error

app = Flask(__name__)
CORS(app)

# ── Paths ─────────────────────────────────────────────────────────────────────
BASE_DIR     = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(BASE_DIR, '..', 'dataset', 'properties_dataset_india.csv')
MODEL_PATH   = os.path.join(BASE_DIR, 'model.pkl')

# ── Global model state ────────────────────────────────────────────────────────
model         = None
label_encoders = {}   # one LabelEncoder per categorical column
scaler        = None
model_r2      = 0.0
model_mae     = 0.0
MODEL_NAME    = 'ProVal-RandomForest-v3.0'

# ── Known categories (for encoding unseen values safely) ─────────────────────
KNOWN_TYPES = ['Apartment', 'Villa', 'Condo', 'Penthouse', 'Townhouse',
               'Single Family Home']
KNOWN_CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad',
                'Chennai', 'Pune', 'Kolkata', 'Ahmedabad']

AMENITY_COLS = ['has_pool', 'has_gym', 'has_parking',
                'has_wifi', 'has_garden', 'has_security']

# Mapping from frontend amenity IDs → CSV amenity names
AMENITY_MAP = {
    'pool':     'Pool',
    'gym':      'Gym',
    'parking':  'Parking',
    'wifi':     'WiFi',
    'garden':   'Garden',
    'security': 'Security',
}

# ── Feature engineering ───────────────────────────────────────────────────────
def extract_city(location: str) -> str:
    """Return the city part from 'Mumbai, MH' → 'Mumbai'."""
    return location.split(',')[0].strip() if location else 'Unknown'


def amenities_to_flags(amenities_str: str) -> dict:
    """Convert 'Pool,Gym,Parking' string → {has_pool:1, has_gym:1, ...}."""
    flags = {col: 0 for col in AMENITY_COLS}
    if not isinstance(amenities_str, str):
        return flags
    items = [a.strip() for a in amenities_str.split(',')]
    if 'Pool'     in items: flags['has_pool']     = 1
    if 'Gym'      in items: flags['has_gym']      = 1
    if 'Parking'  in items: flags['has_parking']  = 1
    if 'WiFi'     in items: flags['has_wifi']     = 1
    if 'Garden'   in items: flags['has_garden']   = 1
    if 'Security' in items: flags['has_security'] = 1
    return flags


def build_features(df: pd.DataFrame) -> pd.DataFrame:
    """Turn raw DataFrame rows into the feature matrix used for training/inference."""
    feat = pd.DataFrame()

    # Numeric features
    feat['area']       = df['area'].astype(float)
    feat['bedrooms']   = df['bedrooms'].astype(int)
    feat['bathrooms']  = df['bathrooms'].astype(int)
    feat['year_built'] = df['yearBuilt'].astype(int)
    feat['age']        = 2024 - feat['year_built']

    # Derived ratios
    feat['area_per_bed']  = feat['area'] / (feat['bedrooms'] + 1)
    feat['bath_bed_ratio'] = feat['bathrooms'] / (feat['bedrooms'] + 1)

    # City encoding
    feat['city'] = df['location'].apply(extract_city)
    le_city = label_encoders.get('city')
    if le_city:
        feat['city_enc'] = feat['city'].apply(
            lambda c: le_city.transform([c])[0]
            if c in le_city.classes_ else -1
        )
    else:
        feat['city_enc'] = 0

    # Property type encoding
    le_type = label_encoders.get('type')
    if le_type:
        feat['type_enc'] = df['type'].apply(
            lambda t: le_type.transform([t])[0]
            if t in le_type.classes_ else 0
        )
    else:
        feat['type_enc'] = 0

    # Amenity flags
    amenity_flags = df['amenities'].apply(amenities_to_flags).apply(pd.Series)
    for col in AMENITY_COLS:
        feat[col] = amenity_flags[col] if col in amenity_flags.columns else 0

    # Total amenity count
    feat['amenity_count'] = feat[AMENITY_COLS].sum(axis=1)

    return feat[FEATURE_COLS]


# Final ordered feature list (must match between train and predict)
FEATURE_COLS = [
    'area', 'bedrooms', 'bathrooms', 'age',
    'area_per_bed', 'bath_bed_ratio',
    'city_enc', 'type_enc',
    'has_pool', 'has_gym', 'has_parking',
    'has_wifi', 'has_garden', 'has_security',
    'amenity_count'
]


# ── Training ──────────────────────────────────────────────────────────────────
def train_model():
    global model, label_encoders, scaler, model_r2, model_mae, MODEL_NAME

    print("\n" + "="*55)
    print("  ProVal ML — Training model from dataset...")
    print("="*55)

    if not os.path.exists(DATASET_PATH):
        print(f"[ERROR] Dataset not found at {DATASET_PATH}")
        return False

    df = pd.read_csv(DATASET_PATH)
    print(f"[INFO] Loaded {len(df)} records")

    # Drop rows with missing critical fields
    df = df.dropna(subset=['area', 'bedrooms', 'bathrooms', 'yearBuilt', 'price', 'location', 'type'])
    print(f"[INFO] {len(df)} records after cleaning")

    # Fit label encoders on full dataset
    le_city = LabelEncoder()
    le_city.fit(df['location'].apply(extract_city).unique())
    label_encoders['city'] = le_city

    le_type = LabelEncoder()
    le_type.fit(df['type'].unique())
    label_encoders['type'] = le_type

    # Build feature matrix
    X = build_features(df)
    y = df['price'].astype(float)

    # Train / test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.15, random_state=42
    )

    # Train Random Forest
    rf = RandomForestRegressor(
        n_estimators=200,
        max_depth=12,
        min_samples_split=4,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )
    rf.fit(X_train, y_train)

    # Evaluate
    y_pred    = rf.predict(X_test)
    model_r2  = round(r2_score(y_test, y_pred), 4)
    model_mae = round(mean_absolute_error(y_test, y_pred), 2)

    print(f"[INFO] R² Score : {model_r2}  (1.0 = perfect)")
    print(f"[INFO] MAE      : ₹{model_mae:,.0f}")

    model      = rf
    MODEL_NAME = f'ProVal-RandomForest-v3.0 (R²={model_r2})'

    # Persist model to disk so restarts are faster
    with open(MODEL_PATH, 'wb') as f:
        pickle.dump({'model': model, 'encoders': label_encoders}, f)
    print(f"[INFO] Model saved to {MODEL_PATH}")
    print("="*55 + "\n")
    return True


def load_or_train():
    """Load cached model if available, otherwise train from scratch."""
    global model, label_encoders, MODEL_NAME

    if os.path.exists(MODEL_PATH):
        try:
            with open(MODEL_PATH, 'rb') as f:
                saved = pickle.load(f)
            model          = saved['model']
            label_encoders = saved['encoders']
            MODEL_NAME     = 'ProVal-RandomForest-v3.0 (cached)'
            print(f"[ProVal ML] Loaded cached model from {MODEL_PATH}")
            return
        except Exception as e:
            print(f"[ProVal ML] Cache load failed ({e}), retraining...")

    train_model()


# ── Confidence calculation ────────────────────────────────────────────────────
def calc_confidence(city: str, prop_type: str) -> float:
    """Higher confidence for well-represented cities and types."""
    known_city = any(c.lower() in city.lower() for c in KNOWN_CITIES)
    known_type = prop_type in KNOWN_TYPES
    if known_city and known_type:
        return 0.94
    elif known_city or known_type:
        return 0.88
    return 0.80


# ── /predict endpoint ─────────────────────────────────────────────────────────
@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({'error': 'Model not loaded. Please restart the service.'}), 503

    data = request.get_json(force=True)
    if not data:
        return jsonify({'error': 'No JSON body received'}), 400

    # Extract input
    area       = float(data.get('area', 1000))
    bedrooms   = int(data.get('bedrooms', 2))
    bathrooms  = int(data.get('bathrooms', 2))
    year_built = int(data.get('yearBuilt', 2015))
    prop_type  = data.get('type', 'Apartment')
    location   = data.get('location', 'Mumbai, MH')
    amenities  = data.get('amenities', [])   # list of frontend IDs: ['pool','gym',...]

    # Convert frontend amenity IDs → CSV amenity names string
    csv_amenities = ','.join(AMENITY_MAP[a] for a in amenities if a in AMENITY_MAP)

    # Build a single-row DataFrame matching training schema
    row = pd.DataFrame([{
        'area':       area,
        'bedrooms':   bedrooms,
        'bathrooms':  bathrooms,
        'yearBuilt':  year_built,
        'type':       prop_type,
        'location':   location,
        'amenities':  csv_amenities,
    }])

    # Feature engineering (same pipeline as training)
    X = build_features(row)

    # Predict
    predicted_price = int(model.predict(X)[0])
    predicted_price = max(predicted_price, 100000)   # floor ₹1 lakh

    city       = extract_city(location)
    confidence = calc_confidence(city, prop_type)

    return jsonify({
        'predictedPrice': predicted_price,
        'confidence':     confidence,
        'model':          MODEL_NAME,
    })


# ── /retrain endpoint (admin use) ─────────────────────────────────────────────
@app.route('/retrain', methods=['POST'])
def retrain():
    """Force retrain from dataset — useful after dataset updates."""
    if os.path.exists(MODEL_PATH):
        os.remove(MODEL_PATH)
    success = train_model()
    if success:
        return jsonify({'status': 'ok', 'r2': model_r2, 'mae': model_mae})
    return jsonify({'status': 'error', 'message': 'Training failed'}), 500


# ── /health endpoint ──────────────────────────────────────────────────────────
@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status':  'ok',
        'service': 'ProVal ML Service',
        'version': '3.0',
        'model':   MODEL_NAME,
        'r2':      model_r2,
        'mae':     model_mae,
    })


# ── Entry point ───────────────────────────────────────────────────────────────
if __name__ == '__main__':
    load_or_train()
    print("  POST /predict  — property valuation (ML model)")
    print("  POST /retrain  — retrain model from dataset")
    print("  GET  /health   — health + model metrics")
    print("  Listening on http://0.0.0.0:5000\n")
    app.run(host='0.0.0.0', port=5000, debug=False)
