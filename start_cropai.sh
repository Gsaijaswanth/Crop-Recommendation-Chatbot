#!/bin/bash

# CropAI Startup Script
echo "🌱 Starting CropAI - Smart Farming Assistant"
echo "=============================================="

# Kill any existing processes on these ports
echo "Cleaning up any existing processes..."
lsof -ti:8501 | xargs kill -9 2>/dev/null
lsof -ti:8502 | xargs kill -9 2>/dev/null
lsof -ti:5000 | xargs kill -9 2>/dev/null
lsof -ti:8080 | xargs kill -9 2>/dev/null

# Activate virtual environment
source cropai_env/bin/activate

# Start Crop Recommendation API Server
echo "Starting Crop Recommendation API Server on port 5000..."
cd CropAI/CROP-RECOMMENDATION
python api_server.py > ../../logs/api_server.log 2>&1 &
API_PID=$!
cd ../..
sleep 2

# Start Crop Recommendation Streamlit App
echo "Starting Crop Recommendation Web App on port 8501..."
cd CropAI/CROP-RECOMMENDATION
streamlit run webapp.py --server.port 8501 --server.headless true > ../../logs/crop_app.log 2>&1 &
CROP_PID=$!
cd ../..
sleep 3

# Start Plant Disease Identification System
echo "Starting Plant Disease Detection on port 8502..."
cd CropAI/PLANT-DISEASE-IDENTIFICATION
streamlit run main.py --server.port 8502 --server.headless true > ../../logs/disease_app.log 2>&1 &
DISEASE_PID=$!
cd ../..
sleep 3

# Start Web Frontend
echo "Starting Main Website on port 8080..."
cd CropAI/CropAI-web-app
python3 -m http.server 8080 > ../../logs/web_frontend.log 2>&1 &
WEB_PID=$!
cd ../..

# Wait for services to fully start
sleep 5

echo ""
echo "✅ All services started successfully!"
echo ""
echo "🌐 Access the applications at:"
echo "   📱 Main Website:           http://localhost:8080"
echo "   🌾 Crop Recommendation:    http://localhost:8501"
echo "   🔬 Disease Detection:      http://localhost:8502"
echo "   🤖 API Server:             http://localhost:5000"
echo ""
echo "📝 Logs are saved in the 'logs' directory"
echo ""
echo "⏹️  Press Ctrl+C to stop all services"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    kill $CROP_PID $DISEASE_PID $WEB_PID $API_PID 2>/dev/null
    echo "✅ All services stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Keep script running
wait

