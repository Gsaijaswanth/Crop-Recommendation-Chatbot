# AgriSens - Local Setup Guide

## 🌱 Smart Farming Assistant

This project is an AI-powered smart farming assistant that provides crop recommendations, plant disease identification, and farming guidance.

## 🚀 Quick Start

### Option 1: Using the Startup Script (Recommended)
```bash
./start_agrisens.sh
```

### Option 2: Manual Setup

1. **Activate the virtual environment:**
   ```bash
   source agrisens_env/bin/activate
   ```

2. **Start Crop Recommendation System:**
   ```bash
   cd AgriSens/CROP-RECOMMENDATION
   streamlit run webapp.py --server.port 8501
   ```

3. **Start Plant Disease Identification:**
   ```bash
   cd AgriSens/PLANT-DISEASE-IDENTIFICATION
   streamlit run main.py --server.port 8502
   ```

4. **Start Web Frontend:**
   ```bash
   cd AgriSens/AgriSens-web-app
   python3 -m http.server 8080
   ```

## 🌐 Access the Applications

Once all services are running, you can access:

- **Main Web App**: http://localhost:8080
- **Crop Recommendation**: http://localhost:8501
- **Disease Identification**: http://localhost:8502

## 📋 System Requirements

- Python 3.8 or higher
- macOS (tested on macOS 12.0+)
- At least 4GB RAM (for TensorFlow models)
- Internet connection (for initial setup)

## 🔧 Project Structure

```
crop-recommendation-chatbot/
├── agrisens_env/                 # Python virtual environment
├── AgriSens/
│   ├── AgriSens-web-app/         # Main web frontend (HTML/CSS/JS)
│   ├── CROP-RECOMMENDATION/      # ML-based crop recommendation
│   ├── PLANT-DISEASE-IDENTIFICATION/ # CNN-based disease detection
│   └── Datasets/                 # Training datasets
├── requirements.txt              # Python dependencies
├── start_agrisens.sh            # Startup script
└── LOCAL_SETUP.md               # This file
```

## 🧠 Features

### 1. Crop Recommendation System
- **Location**: `AgriSens/CROP-RECOMMENDATION/`
- **Port**: 8501
- **Technology**: Streamlit + Scikit-learn
- **Models**: Random Forest (99.55% accuracy)
- **Input**: Soil nutrients (N, P, K), temperature, humidity, pH, rainfall
- **Output**: Recommended crop for given conditions

### 2. Plant Disease Identification
- **Location**: `AgriSens/PLANT-DISEASE-IDENTIFICATION/`
- **Port**: 8502
- **Technology**: Streamlit + TensorFlow/Keras
- **Model**: CNN trained on 70,295+ plant images
- **Supported Crops**: 14 crops (Apple, Tomato, Corn, etc.)
- **Supported Diseases**: 38 different plant diseases
- **Input**: Plant leaf image upload
- **Output**: Disease diagnosis and recommendations

### 3. Web Frontend
- **Location**: `AgriSens/AgriSens-web-app/`
- **Port**: 8080
- **Technology**: HTML5, CSS3, JavaScript
- **Features**: 
  - Modern responsive design
  - Integration with ML services
  - Weather forecast integration
  - Smart farming guide

## 🔍 Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   lsof -i :8501  # Check what's using port 8501
   kill -9 <PID>  # Kill the process
   ```

2. **TensorFlow issues:**
   - Ensure you're using Python 3.8-3.9
   - Check that TensorFlow is properly installed: `python -c "import tensorflow; print(tensorflow.__version__)"`

3. **Model files missing:**
   - Ensure `trained_plant_disease_model.keras` exists in the disease identification folder
   - Ensure pickle files (RF.pkl, etc.) exist in the crop recommendation folder

4. **Dependencies conflicts:**
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt --force-reinstall
   ```

### Logs and Debugging

- Check Streamlit logs in the terminal where you started the services
- For TensorFlow issues, check for GPU/CPU compatibility warnings
- Ensure all required files are present in their respective directories

## 📊 Performance Notes

- **Crop Recommendation**: Fast (< 1 second per prediction)
- **Disease Identification**: Moderate (2-5 seconds per image)
- **Memory Usage**: ~2-3GB for disease identification model
- **CPU Usage**: Moderate during image processing

## 🔄 Stopping Services

To stop all services:
1. Press `Ctrl+C` in the terminal running the startup script
2. Or manually kill processes:
   ```bash
   pkill -f streamlit
   pkill -f "python.*http.server"
   ```

## 📝 Development Notes

- The project uses separate virtual environments for isolation
- All ML models are pre-trained and ready to use
- The web frontend is static and doesn't require additional setup
- Streamlit apps run in headless mode for production use

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Happy Farming! 🌾**
