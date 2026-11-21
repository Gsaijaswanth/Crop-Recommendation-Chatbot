from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import joblib
import os

app = Flask(__name__)

# Load the model and data
def load_model_and_data():
    """Load the advanced model and data from CSV"""
    try:
        # Load the advanced dataset
        df = pd.read_csv('advanced_crop_dataset.csv')
        
        # Prepare features and target
        X = df[['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']]
        y = df['label']
        
        # Encode labels
        le = LabelEncoder()
        y_encoded = le.fit_transform(y)
        
        # Train Random Forest model
        model = RandomForestClassifier(
            n_estimators=200,
            max_depth=20,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1
        )
        model.fit(X, y_encoded)
        
        return model, le, df
        
    except Exception as e:
        print(f"Error loading model: {e}")
        return None, None, None

# Load model and data
model, label_encoder, df = load_model_and_data()

@app.route('/api/predict', methods=['POST'])
def predict_crop():
    try:
        # Get the input data
        data = request.get_json()
        print(data)
        # Extract features
        nitrogen = data.get('nitrogen', 50)
        phosphorus = data.get('phosphorus', 50)
        potassium = data.get('potassium', 50)
        temperature = data.get('temperature', 25)
        humidity = data.get('humidity', 60)
        ph = data.get('ph', 7.0)
        rainfall = data.get('rainfall', 100)
        
        # Make prediction
        if model is not None and label_encoder is not None:
            # Prepare input array
            input_data = np.array([nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall]).reshape(1, -1)
            
            # Get prediction
            prediction = model.predict(input_data)[0]
            crop_name = label_encoder.inverse_transform([prediction])[0]
            
            # Get prediction probabilities
            probabilities = model.predict_proba(input_data)[0]
            confidence = max(probabilities) * 100
            
            # Get top 3 predictions
            top_indices = np.argsort(probabilities)[-3:][::-1]
            top_predictions = []
            
            for idx in top_indices:
                crop = label_encoder.inverse_transform([idx])[0]
                conf = probabilities[idx] * 100
                top_predictions.append({
                    'crop': crop,
                    'confidence': conf
                })
            
            return jsonify({
                'success': True,
                'predictions': top_predictions,
                'input_conditions': {
                    'nitrogen': nitrogen,
                    'phosphorus': phosphorus,
                    'potassium': potassium,
                    'temperature': temperature,
                    'humidity': humidity,
                    'ph': ph,
                    'rainfall': rainfall
                }
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Model not loaded'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'crop_count': len(df['label'].unique()) if df is not None else 0
    })

if __name__ == '__main__':
    print("Starting API server...")
    print(f"Model loaded: {model is not None}")
    if df is not None:
        print(f"Supporting {len(df['label'].unique())} crops")
    app.run(host='0.0.0.0', port=5000, debug=False)
