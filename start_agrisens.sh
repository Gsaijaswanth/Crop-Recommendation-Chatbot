#!/bin/bash

# AgriSens Startup Script
echo "🌱 Starting AgriSens - Smart Farming Assistant"
echo "=============================================="

# Activate virtual environment
source agrisens_env/bin/activate

# Function to start services in background
start_service() {
    local service_name=$1
    local command=$2
    local port=$3
    
    echo "Starting $service_name on port $port..."
    $command &
    sleep 3
}

# Start all services
echo "Starting Crop Recommendation System..."
cd AgriSens/CROP-RECOMMENDATION
streamlit run webapp.py --server.port 8501 --server.headless true &
CROP_PID=$!
cd ../..

echo "Starting Plant Disease Identification System..."
cd AgriSens/PLANT-DISEASE-IDENTIFICATION
streamlit run main.py --server.port 8502 --server.headless true &
DISEASE_PID=$!
cd ../..

echo "Starting Web Frontend..."
cd AgriSens/AgriSens-web-app
python3 -m http.server 8080 &
WEB_PID=$!
cd ../..

# Wait a moment for services to start
sleep 5

echo ""
echo "✅ All services started successfully!"
echo ""
echo "🌐 Access the applications at:"
echo "   • Main Web App:     http://localhost:8080"
echo "   • Crop Recommendation: http://localhost:8501"
echo "   • Disease Identification: http://localhost:8502"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    kill $CROP_PID $DISEASE_PID $WEB_PID 2>/dev/null
    echo "✅ All services stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Keep script running
wait
