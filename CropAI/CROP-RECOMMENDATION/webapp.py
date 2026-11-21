## Importing necessary libraries for the web app
import streamlit as st
import numpy as np
import pandas as pd
import joblib
import warnings
warnings.filterwarnings('ignore')
import os
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import classification_report
from sklearn import metrics
from sklearn import tree
from sklearn.metrics import accuracy_score
import warnings
warnings.filterwarnings('ignore')
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import torch
# Display Images
# import Image from pillow to open images
from PIL import Image
import torch.nn.functional as F
import torch.nn as nn
import torch
import pickle
input_size = 7
num_classes = 22

# Note: crop.png was removed during cleanup - using text-based display instead

# Note: Dataset loading moved to load_and_train_model function

# Note: Image display function removed during cleanup - using text-based recommendations

# Load data and train model from CSV
# Get user input for features
class Net_64_128_64(nn.Module):
    def __init__(self, input_size,num_classes):
        super(Net_64_128_64, self).__init__()
        self.fc1 = nn.Linear(input_size, 64)
        self.fc2 = nn.Linear(64, 128)
        self.fc3 = nn.Linear(128, 64)
        self.fc4 = nn.Linear(64, num_classes)


    def forward(self, x):
        x = F.selu(self.fc1(x))
        x = F.selu(self.fc2(x))
        x = F.selu(self.fc3(x))
        x = self.fc4(x)
        return F.softmax(x)


def get_user_input(N, P, K, temperature, humidity, ph, rainfall):# Create a NumPy array from the user input
    user_input_np = np.array([[N, P, K, temperature, humidity, ph, rainfall]])

    # Convert the NumPy array to a PyTorch tensor
    user_input_tensor = torch.tensor(user_input_np, dtype=torch.float32)

    # Load normalization parameters
    normalization_data = np.load("normalization.npz")
    mean = torch.tensor(normalization_data["mean"], dtype=torch.float32)
    std = torch.tensor(normalization_data["std"], dtype=torch.float32)

    # Normalize the user input
    normalized_input = (user_input_tensor - mean) / std

    # Load the trained model
    model = Net_64_128_64(input_size, num_classes) # Assuming input_size and num_classes are defined
    model.load_state_dict(torch.load('model.hdf5')) # Replace with your model file name
    model.eval() # Set the model to evaluation mode

    # Make a prediction
    with torch.no_grad():
        output = model(normalized_input)
        predicted_class_index = output.argmax(dim=1).item()

    # Load the label encoder
    with open("encoder.pkl", "rb") as file:
        encoder = pickle.load(file)

    # Inverse transform the predicted class index to get the crop label
    predicted_label = encoder.inverse_transform([predicted_class_index])[0]

    print(f"Based on the input, the recommended crop is: {predicted_label}")

    return predicted_label
# Load model and 


## Function to make predictions
def predict_crop(nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall):
    # Let the model make predictions for any input - no hardcoded validation
    try:
        # Always use the model to make predictions
        prediction = get_user_input(nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall)
        # If we have the advanced model, get crop name from label encoder
        return prediction 

    except Exception as e:
        print(f"Error in prediction: {str(e)}")
        return [f"Error in prediction: {str(e)}"]


## Streamlit code for the web app interface
def main():  
    # # Setting the title of the web app
    st.markdown("<h1 style='text-align: center;'>SMART CROP RECOMMENDATIONS", unsafe_allow_html=True)
    
    st.sidebar.title("CropAI")
    # # Input fields for the user to enter the environmental factors
    st.sidebar.header("Enter Crop Details")
    nitrogen = st.sidebar.number_input("Nitrogen", min_value=0.0, max_value=140.0, value=0.0, step=0.1)
    phosphorus = st.sidebar.number_input("Phosphorus", min_value=0.0, max_value=145.0, value=0.0, step=0.1)
    potassium = st.sidebar.number_input("Potassium", min_value=0.0, max_value=205.0, value=0.0, step=0.1)
    temperature = st.sidebar.number_input("Temperature (°C)", min_value=0.0, max_value=51.0, value=0.0, step=0.1)
    humidity = st.sidebar.number_input("Humidity (%)", min_value=0.0, max_value=100.0, value=0.0, step=0.1)
    ph = st.sidebar.number_input("pH Level", min_value=0.0, max_value=14.0, value=0.0, step=0.1)
    rainfall = st.sidebar.number_input("Rainfall (mm)", min_value=0.0, max_value=500.0, value=0.0, step=0.1)
    inputs=[[nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall]]                                               
   
    # # Make prediction using the model
    if st.sidebar.button("Predict"):
        try:
            # Always let the model make predictions - no hardcoded validation
            prediction = predict_crop(nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall)
            
            # Display the model's prediction
            st.success(f"🌱 **Model Prediction: {prediction}**")
            
            # Display input values
            st.info(f"📊 **Input Analysis:** N={nitrogen}, P={phosphorus}, K={potassium}, Temp={temperature}°C, Humidity={humidity}%, pH={ph}, Rainfall={rainfall}mm")
            
            # Show contextual warnings based on input conditions (but don't block prediction)
            warnings = []
            if temperature <= 0:
                warnings.append("⚠️ Temperature is 0°C or below - this may not be suitable for most crops")
            elif temperature < 5:
                warnings.append("⚠️ Very low temperature - only cold-hardy crops may survive")
            
            if humidity <= 0:
                warnings.append("⚠️ Humidity is 0% - plants need moisture to survive")
            elif humidity < 20:
                warnings.append("⚠️ Very low humidity - may cause plant stress")
            
            if ph <= 0 or ph > 14:
                warnings.append("⚠️ pH value outside normal range (0-14) - check measurement")
            elif ph < 4.0 or ph > 9.0:
                warnings.append("⚠️ pH outside optimal soil range (4.0-9.0) - may affect crop growth")
            
            if rainfall <= 0:
                warnings.append("⚠️ No rainfall - irrigation will be essential")
            elif rainfall < 200:
                warnings.append("⚠️ Low rainfall - consider drought-resistant crops or irrigation")
            
            if nitrogen == 0 and phosphorus == 0 and potassium == 0:
                warnings.append("⚠️ No nutrients detected - soil may need fertilization")
            
            # Display warnings if any
            if warnings:
                st.warning("**⚠️ Growing Condition Warnings:**")
                for warning in warnings:
                    st.warning(warning)
            
            # Provide crop-specific advice based on model prediction
            crop_name = prediction.lower()
            if 'rice' in crop_name:
                st.info("🌾 **Rice Growing Tips:** Requires 20-30°C temperature, 1000-2000mm rainfall, pH 6.0-7.0")
            elif 'wheat' in crop_name:
                st.info("🌾 **Wheat Growing Tips:** Best in 15-25°C temperature, 500-1000mm rainfall, pH 6.0-7.5")
            elif 'maize' in crop_name:
                st.info("🌽 **Maize Growing Tips:** Needs 18-27°C temperature, 600-1000mm rainfall, pH 6.0-7.0")
            elif 'cotton' in crop_name:
                st.info("🌿 **Cotton Growing Tips:** Requires 21-30°C temperature, 500-1000mm rainfall, pH 5.8-8.0")
            elif 'sugarcane' in crop_name:
                st.info("🎋 **Sugarcane Growing Tips:** Needs 20-30°C temperature, 1000-1500mm rainfall, pH 6.0-7.5")
            elif 'mango' in crop_name:
                st.info("🥭 **Mango Growing Tips:** Requires 24-30°C temperature, 750-2500mm rainfall, pH 5.5-7.5")
            elif 'banana' in crop_name:
                st.info("🍌 **Banana Growing Tips:** Needs 20-30°C temperature, 1000-2000mm rainfall, pH 6.0-7.5")
            elif 'coconut' in crop_name:
                st.info("🥥 **Coconut Growing Tips:** Requires 20-30°C temperature, 1000-2000mm rainfall, pH 5.0-8.0")
            elif 'potato' in crop_name:
                st.info("🥔 **Potato Growing Tips:** Best in 15-20°C temperature, 500-800mm rainfall, pH 4.8-5.5")
            elif 'tomato' in crop_name:
                st.info("🍅 **Tomato Growing Tips:** Needs 18-25°C temperature, 600-1000mm rainfall, pH 6.0-6.8")
            elif 'healthy' in crop_name:
                st.info("✅ **Healthy Plant:** Your conditions are suitable for this crop!")
            else:
                st.info("🌱 **General Tips:** Ensure adequate water, nutrients, and suitable temperature for optimal growth")
                
        except Exception as e:
            st.error(f"❌ Error making prediction: {str(e)}")


## Running the main function
if __name__ == '__main__':
    main()

