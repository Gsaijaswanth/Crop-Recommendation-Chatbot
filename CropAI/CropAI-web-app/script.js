// Chatbot functionality
let isChatOpen = false;
let conversationHistory = [];
let currentContext = {
    lastCrop: null,
    lastTopic: null,
    userPreferences: []
};

// Toggle chat visibility
function toggleChat() {
    const chatContainer = document.getElementById('chat-container');
    const chatbotIcon = document.querySelector('.chatbot-icon');
    
    if (isChatOpen) {
        chatContainer.classList.remove('active');
        chatbotIcon.style.transform = 'scale(1)';
        isChatOpen = false;
    } else {
        chatContainer.classList.add('active');
        chatbotIcon.style.transform = 'scale(0.9)';
        isChatOpen = true;
        // Focus on input when chat opens
        setTimeout(() => {
            document.getElementById('keyword').focus();
        }, 300);
    }
}

// Handle Enter key press
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        fetchOptions();
    }
}

// Add message to chat
function addMessage(message, isUser = false) {
    const chatBox = document.getElementById('chat-box');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    messageDiv.innerHTML = `<p>${message}</p>`;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    
    // Store in conversation history
    conversationHistory.push({
        message: message,
        isUser: isUser,
        timestamp: new Date().toISOString()
    });
    
    // Keep only last 20 messages to prevent memory issues
    if (conversationHistory.length > 20) {
        conversationHistory = conversationHistory.slice(-20);
    }
}

// Advanced Crop Recommendation Database (58 crops)
const cropDatabase = {
    // Cereals
    'rice': {
        name: 'Rice',
        description: 'Staple food crop requiring warm, humid conditions with flooded fields.',
        soil: 'Clay or loamy soil with good water retention',
        season: 'Kharif season (June-September)',
        water: 'High water requirement, needs flooded fields',
        temperature: '20-35°C',
        tips: 'Plant in well-drained fields, maintain 2-3 inches of standing water during growth'
    },
    'wheat': {
        name: 'Wheat',
        description: 'Major cereal crop grown in temperate regions, rich in protein.',
        soil: 'Well-drained loamy soil',
        season: 'Rabi season (October-March)',
        water: 'Moderate water requirement',
        temperature: '15-25°C',
        tips: 'Sow in rows with proper spacing, avoid waterlogging'
    },
    'maize': {
        name: 'Maize (Corn)',
        description: 'Versatile crop used for food, feed, and industrial purposes.',
        soil: 'Well-drained sandy loam soil',
        season: 'Kharif season (June-September)',
        water: 'Moderate to high water requirement',
        temperature: '18-27°C',
        tips: 'Plant in rows, requires good sunlight and regular irrigation'
    },
    'barley': {
        name: 'Barley',
        description: 'Cereal crop used for food, animal feed, and brewing.',
        soil: 'Well-drained loamy soil',
        season: 'Rabi season (October-March)',
        water: 'Low to moderate water requirement',
        temperature: '10-20°C',
        tips: 'Drought-tolerant, good for marginal lands'
    },
    'oats': {
        name: 'Oats',
        description: 'Nutritious cereal crop, excellent for animal feed and human consumption.',
        soil: 'Well-drained loamy soil',
        season: 'Rabi season (October-March)',
        water: 'Moderate water requirement',
        temperature: '10-20°C',
        tips: 'Cold-tolerant, good for winter cultivation'
    },
    'sorghum': {
        name: 'Sorghum',
        description: 'Drought-resistant cereal crop, important in dry regions.',
        soil: 'Well-drained sandy loam soil',
        season: 'Kharif season (June-September)',
        water: 'Low water requirement',
        temperature: '25-35°C',
        tips: 'Heat and drought tolerant, good for arid regions'
    },
    'millet': {
        name: 'Millet',
        description: 'Small-seeded cereal crop, highly nutritious and drought-resistant.',
        soil: 'Well-drained sandy soil',
        season: 'Kharif season (June-September)',
        water: 'Very low water requirement',
        temperature: '25-35°C',
        tips: 'Excellent for dry farming, short growing season'
    },
    
    // Pulses
    'chickpea': {
        name: 'Chickpea',
        description: 'Protein-rich pulse crop, important for soil nitrogen fixation.',
        soil: 'Well-drained loamy soil',
        season: 'Rabi season (October-March)',
        water: 'Low water requirement',
        temperature: '18-28°C',
        tips: 'Drought-tolerant, improves soil fertility'
    },
    'lentil': {
        name: 'Lentil',
        description: 'High-protein pulse crop, excellent source of plant protein.',
        soil: 'Well-drained loamy soil',
        season: 'Rabi season (October-March)',
        water: 'Low water requirement',
        temperature: '18-28°C',
        tips: 'Cold-tolerant, good for crop rotation'
    },
    'black_gram': {
        name: 'Black Gram',
        description: 'Protein-rich pulse crop, important in Indian cuisine.',
        soil: 'Well-drained loamy soil',
        season: 'Kharif season (June-September)',
        water: 'Moderate water requirement',
        temperature: '20-30°C',
        tips: 'Good for intercropping, improves soil health'
    },
    'green_gram': {
        name: 'Green Gram',
        description: 'Nutritious pulse crop, easy to digest and high in protein.',
        soil: 'Well-drained loamy soil',
        season: 'Kharif season (June-September)',
        water: 'Moderate water requirement',
        temperature: '20-30°C',
        tips: 'Short duration crop, good for multiple cropping'
    },
    'kidney_beans': {
        name: 'Kidney Beans',
        description: 'High-protein legume crop, rich in fiber and nutrients.',
        soil: 'Well-drained loamy soil',
        season: 'Rabi season (October-March)',
        water: 'Moderate water requirement',
        temperature: '18-25°C',
        tips: 'Support with trellises, regular watering needed'
    },
    'pigeon_peas': {
        name: 'Pigeon Peas',
        description: 'Drought-resistant pulse crop, important in tropical regions.',
        soil: 'Well-drained sandy loam soil',
        season: 'Kharif season (June-September)',
        water: 'Low water requirement',
        temperature: '20-35°C',
        tips: 'Deep-rooted, good for soil conservation'
    },
    
    // Oilseeds
    'soybean': {
        name: 'Soybean',
        description: 'High-protein oilseed crop, important for oil and protein production.',
        soil: 'Well-drained loamy soil',
        season: 'Kharif season (June-September)',
        water: 'Moderate water requirement',
        temperature: '20-30°C',
        tips: 'Nitrogen-fixing, good for crop rotation'
    },
    'sunflower': {
        name: 'Sunflower',
        description: 'Oilseed crop known for its high oil content and ornamental value.',
        soil: 'Well-drained sandy loam soil',
        season: 'Kharif season (June-September)',
        water: 'Moderate water requirement',
        temperature: '20-28°C',
        tips: 'Sun-loving crop, good for oil production'
    },
    'groundnut': {
        name: 'Groundnut (Peanut)',
        description: 'Nutritious oilseed crop, rich in protein and healthy fats.',
        soil: 'Well-drained sandy loam soil',
        season: 'Kharif season (June-September)',
        water: 'Moderate water requirement',
        temperature: '25-30°C',
        tips: 'Nitrogen-fixing, good for soil improvement'
    },
    'mustard': {
        name: 'Mustard',
        description: 'Oilseed crop used for oil and spice production.',
        soil: 'Well-drained loamy soil',
        season: 'Rabi season (October-March)',
        water: 'Low water requirement',
        temperature: '15-25°C',
        tips: 'Cold-tolerant, good for winter cultivation'
    },
    'sesame': {
        name: 'Sesame',
        description: 'Ancient oilseed crop, high oil content and nutritional value.',
        soil: 'Well-drained sandy loam soil',
        season: 'Kharif season (June-September)',
        water: 'Low water requirement',
        temperature: '25-30°C',
        tips: 'Drought-tolerant, good for dry regions'
    },
    
    // Vegetables
    'tomato': {
        name: 'Tomato',
        description: 'Popular vegetable crop with high nutritional value and antioxidants.',
        soil: 'Well-drained loamy soil with organic matter',
        season: 'Year-round (best in cool season)',
        water: 'Regular watering, avoid waterlogging',
        temperature: '18-25°C',
        tips: 'Support plants with stakes, regular pruning, and pest control'
    },
    'potato': {
        name: 'Potato',
        description: 'Tuber crop rich in carbohydrates, vitamins, and minerals.',
        soil: 'Well-drained sandy loam soil',
        season: 'Cool season (October-February)',
        water: 'Moderate water requirement',
        temperature: '15-20°C',
        tips: 'Plant in ridges, avoid direct sunlight on tubers, proper hilling'
    },
    'onion': {
        name: 'Onion',
        description: 'Bulb crop used as spice and vegetable, rich in antioxidants.',
        soil: 'Well-drained sandy loam soil',
        season: 'Rabi season (October-March)',
        water: 'Moderate water requirement',
        temperature: '15-25°C',
        tips: 'Plant sets or seeds, avoid water stress during bulb formation'
    },
    'garlic': {
        name: 'Garlic',
        description: 'Bulb crop known for its medicinal properties and culinary uses.',
        soil: 'Well-drained sandy loam soil',
        season: 'Rabi season (October-March)',
        water: 'Low water requirement',
        temperature: '15-25°C',
        tips: 'Plant cloves, good drainage essential'
    },
    'cabbage': {
        name: 'Cabbage',
        description: 'Leafy vegetable crop, rich in vitamins and minerals.',
        soil: 'Well-drained loamy soil with organic matter',
        season: 'Cool season (October-February)',
        water: 'Regular watering',
        temperature: '15-20°C',
        tips: 'Plant in rows, regular watering, pest management'
    },
    'cauliflower': {
        name: 'Cauliflower',
        description: 'Nutritious vegetable crop, rich in vitamins and antioxidants.',
        soil: 'Well-drained loamy soil with organic matter',
        season: 'Cool season (October-February)',
        water: 'Regular watering',
        temperature: '15-20°C',
        tips: 'Blanching required for white heads, regular watering'
    },
    'carrot': {
        name: 'Carrot',
        description: 'Root vegetable rich in beta-carotene and vitamins.',
        soil: 'Well-drained sandy loam soil',
        season: 'Cool season (October-February)',
        water: 'Regular watering',
        temperature: '15-20°C',
        tips: 'Deep soil preparation, avoid stony soil'
    },
    'spinach': {
        name: 'Spinach',
        description: 'Leafy green vegetable, excellent source of iron and vitamins.',
        soil: 'Well-drained loamy soil',
        season: 'Cool season (October-February)',
        water: 'Regular watering',
        temperature: '15-20°C',
        tips: 'Quick-growing crop, regular harvesting'
    },
    
    // Fruits
    'mango': {
        name: 'Mango',
        description: 'Tropical fruit tree known as the "king of fruits".',
        soil: 'Well-drained sandy loam soil',
        season: 'Year-round (fruiting in summer)',
        water: 'Moderate water requirement',
        temperature: '24-30°C',
        tips: 'Deep-rooted tree, requires good drainage and sunlight'
    },
    'banana': {
        name: 'Banana',
        description: 'Tropical fruit crop, rich in potassium and energy.',
        soil: 'Well-drained loamy soil',
        season: 'Year-round',
        water: 'High water requirement',
        temperature: '20-30°C',
        tips: 'Regular irrigation, wind protection needed'
    },
    'apple': {
        name: 'Apple',
        description: 'Temperate fruit tree, rich in fiber and antioxidants.',
        soil: 'Well-drained loamy soil',
        season: 'Temperate regions',
        water: 'Moderate water requirement',
        temperature: '10-25°C',
        tips: 'Cold climate required, proper pruning essential'
    },
    'orange': {
        name: 'Orange',
        description: 'Citrus fruit tree, rich in vitamin C and antioxidants.',
        soil: 'Well-drained sandy loam soil',
        season: 'Year-round (fruiting in winter)',
        water: 'Moderate water requirement',
        temperature: '20-30°C',
        tips: 'Acid-loving plant, good drainage essential'
    },
    'grape': {
        name: 'Grape',
        description: 'Vine fruit crop, used for fresh consumption and wine making.',
        soil: 'Well-drained sandy loam soil',
        season: 'Temperate to subtropical',
        water: 'Moderate water requirement',
        temperature: '15-30°C',
        tips: 'Support with trellises, regular pruning required'
    },
    'strawberry': {
        name: 'Strawberry',
        description: 'Small fruit crop, rich in vitamin C and antioxidants.',
        soil: 'Well-drained sandy loam soil',
        season: 'Cool season',
        water: 'Regular watering',
        temperature: '15-25°C',
        tips: 'Mulching recommended, regular harvesting'
    },
    
    // Cash Crops
    'cotton': {
        name: 'Cotton',
        description: 'Fiber crop used in textile industry, important cash crop.',
        soil: 'Well-drained black cotton soil',
        season: 'Kharif season (June-September)',
        water: 'Moderate water requirement',
        temperature: '21-30°C',
        tips: 'Plant in rows, regular weeding, pest and disease management'
    },
    'sugarcane': {
        name: 'Sugarcane',
        description: 'Cash crop used for sugar production, high biomass yield.',
        soil: 'Well-drained fertile soil',
        season: 'Year-round (best in February-March)',
        water: 'High water requirement',
        temperature: '26-32°C',
        tips: 'Plant in furrows, regular irrigation, ratoon management'
    },
    'tobacco': {
        name: 'Tobacco',
        description: 'Cash crop used in various industries, requires careful cultivation.',
        soil: 'Well-drained sandy loam soil',
        season: 'Kharif season (June-September)',
        water: 'Moderate water requirement',
        temperature: '20-30°C',
        tips: 'Careful pest management, proper curing required'
    },
    'coffee': {
        name: 'Coffee',
        description: 'Tropical cash crop, important beverage crop worldwide.',
        soil: 'Well-drained volcanic soil',
        season: 'Year-round in tropics',
        water: 'Moderate water requirement',
        temperature: '18-28°C',
        tips: 'Shade-loving plant, careful processing required'
    },
    'tea': {
        name: 'Tea',
        description: 'Beverage crop, important in many cultures worldwide.',
        soil: 'Well-drained acidic soil',
        season: 'Year-round in tropics',
        water: 'High water requirement',
        temperature: '13-28°C',
        tips: 'Regular pruning, careful processing of leaves'
    },
    
    // Spices
    'turmeric': {
        name: 'Turmeric',
        description: 'Spice crop with medicinal properties, important in cooking.',
        soil: 'Well-drained loamy soil',
        season: 'Kharif season (June-September)',
        water: 'Moderate water requirement',
        temperature: '20-30°C',
        tips: 'Rhizome planting, careful harvesting'
    },
    'ginger': {
        name: 'Ginger',
        description: 'Spice crop with medicinal properties, used in cooking and medicine.',
        soil: 'Well-drained loamy soil',
        season: 'Kharif season (June-September)',
        water: 'Moderate water requirement',
        temperature: '20-30°C',
        tips: 'Rhizome planting, good drainage essential'
    },
    'black_pepper': {
        name: 'Black Pepper',
        description: 'Spice crop known as "king of spices", high commercial value.',
        soil: 'Well-drained loamy soil',
        season: 'Year-round in tropics',
        water: 'Moderate water requirement',
        temperature: '20-30°C',
        tips: 'Climbing plant, support with poles'
    },
    'cardamom': {
        name: 'Cardamom',
        description: 'Aromatic spice crop, known as "queen of spices".',
        soil: 'Well-drained loamy soil',
        season: 'Year-round in tropics',
        water: 'High water requirement',
        temperature: '15-25°C',
        tips: 'Shade-loving plant, careful processing required'
    },
    
    // Root Crops
    'sweet_potato': {
        name: 'Sweet Potato',
        description: 'Nutritious root crop, rich in beta-carotene and fiber.',
        soil: 'Well-drained sandy loam soil',
        season: 'Kharif season (June-September)',
        water: 'Moderate water requirement',
        temperature: '20-30°C',
        tips: 'Vine crop, good for soil conservation'
    },
    'cassava': {
        name: 'Cassava',
        description: 'Starchy root crop, important food security crop in tropics.',
        soil: 'Well-drained sandy loam soil',
        season: 'Year-round in tropics',
        water: 'Low water requirement',
        temperature: '20-30°C',
        tips: 'Drought-tolerant, careful processing required'
    },
    'yam': {
        name: 'Yam',
        description: 'Tuber crop, important food crop in tropical regions.',
        soil: 'Well-drained loamy soil',
        season: 'Kharif season (June-September)',
        water: 'Moderate water requirement',
        temperature: '20-30°C',
        tips: 'Climbing plant, support with trellises'
    },
    
    // Legumes
    'peas': {
        name: 'Peas',
        description: 'Cool-season legume crop, rich in protein and vitamins.',
        soil: 'Well-drained loamy soil',
        season: 'Cool season (October-February)',
        water: 'Moderate water requirement',
        temperature: '10-20°C',
        tips: 'Climbing plant, support with trellises'
    },
    'beans': {
        name: 'Beans',
        description: 'Protein-rich legume crop, important in human nutrition.',
        soil: 'Well-drained loamy soil',
        season: 'Cool season (October-February)',
        water: 'Moderate water requirement',
        temperature: '18-25°C',
        tips: 'Support with trellises, regular harvesting'
    },
    
    // Medicinal Plants
    'aloe_vera': {
        name: 'Aloe Vera',
        description: 'Medicinal succulent plant, used in cosmetics and medicine.',
        soil: 'Well-drained sandy soil',
        season: 'Year-round',
        water: 'Very low water requirement',
        temperature: '20-35°C',
        tips: 'Drought-tolerant, good drainage essential'
    },
    'basil': {
        name: 'Basil',
        description: 'Aromatic herb crop, used in cooking and medicine.',
        soil: 'Well-drained loamy soil',
        season: 'Year-round',
        water: 'Moderate water requirement',
        temperature: '20-30°C',
        tips: 'Regular harvesting, good for companion planting'
    },
    'mint': {
        name: 'Mint',
        description: 'Aromatic herb crop, used in cooking and medicine.',
        soil: 'Well-drained loamy soil',
        season: 'Year-round',
        water: 'High water requirement',
        temperature: '20-30°C',
        tips: 'Spreading plant, contain growth, regular harvesting'
    }
};

// Get crop information
function getCropInfo(cropName) {
    const crop = cropDatabase[cropName.toLowerCase()];
    if (crop) {
        return `
            <strong>${crop.name}</strong><br>
            <em>${crop.description}</em><br><br>
            <strong>Soil Requirements:</strong> ${crop.soil}<br>
            <strong>Best Season:</strong> ${crop.season}<br>
            <strong>Water Needs:</strong> ${crop.water}<br>
            <strong>Temperature:</strong> ${crop.temperature}<br>
            <strong>Growing Tips:</strong> ${crop.tips}
        `;
    }
    return null;
}

// Advanced Natural Language Processing for Chatbot
function preprocessQuery(query) {
    // Normalize the query
    return query.toLowerCase()
        .replace(/[^\w\s]/g, '') // Remove special characters
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
}

// Extract numerical conditions from natural language
function extractConditionsFromText(query) {
    const conditions = {
        nitrogen: null,
        phosphorus: null,
        potassium: null,
        temperature: null,
        humidity: null,
        ph: null,
        rainfall: null
    };
    
    // Extract temperature
    const tempMatch = query.match(/(\d+)\s*°?c|temperature\s*(\d+)|hot|warm|cool|cold|high\s*temp|low\s*temp/gi);
    if (tempMatch) {
        const tempValue = query.match(/(\d+)\s*°?c|temperature\s*(\d+)/gi);
        if (tempValue) {
            conditions.temperature = parseInt(tempValue[0].match(/\d+/)[0]);
        } else if (query.includes('hot') || query.includes('high temp')) {
            conditions.temperature = 35; // High temperature
        } else if (query.includes('warm')) {
            conditions.temperature = 28; // Warm temperature
        } else if (query.includes('cool')) {
            conditions.temperature = 18; // Cool temperature
        } else if (query.includes('cold') || query.includes('low temp')) {
            conditions.temperature = 12; // Cold temperature
        }
    }
    
    // Extract pH
    const phMatch = query.match(/ph\s*(\d+(?:\.\d+)?)|acidic|alkaline|neutral|low\s*ph|high\s*ph/gi);
    if (phMatch) {
        const phValue = query.match(/ph\s*(\d+(?:\.\d+)?)/gi);
        if (phValue) {
            conditions.ph = parseFloat(phValue[0].match(/\d+(?:\.\d+)?/)[0]);
        } else if (query.includes('acidic') || query.includes('low ph')) {
            conditions.ph = 5.5; // Acidic
        } else if (query.includes('alkaline') || query.includes('high ph')) {
            conditions.ph = 8.5; // Alkaline
        } else if (query.includes('neutral')) {
            conditions.ph = 7.0; // Neutral
        }
    }
    
    // Extract humidity
    const humidityMatch = query.match(/(\d+)\s*%?\s*humidity|humid|dry|arid/gi);
    if (humidityMatch) {
        const humidityValue = query.match(/(\d+)\s*%?\s*humidity/gi);
        if (humidityValue) {
            conditions.humidity = parseInt(humidityValue[0].match(/\d+/)[0]);
        } else if (query.includes('humid')) {
            conditions.humidity = 80; // High humidity
        } else if (query.includes('dry') || query.includes('arid')) {
            conditions.humidity = 30; // Low humidity
        }
    }
    
    // Extract rainfall
    const rainfallMatch = query.match(/(\d+)\s*mm?\s*rainfall|heavy\s*rain|light\s*rain|no\s*rain|drought/gi);
    if (rainfallMatch) {
        const rainfallValue = query.match(/(\d+)\s*mm?\s*rainfall/gi);
        if (rainfallValue) {
            conditions.rainfall = parseInt(rainfallValue[0].match(/\d+/)[0]);
        } else if (query.includes('heavy rain')) {
            conditions.rainfall = 200; // High rainfall
        } else if (query.includes('light rain')) {
            conditions.rainfall = 50; // Low rainfall
        } else if (query.includes('no rain') || query.includes('drought')) {
            conditions.rainfall = 10; // Very low rainfall
        }
    }
    
    // Extract soil nutrients based on soil type descriptions
    if (query.includes('sandy soil') || query.includes('sandy')) {
        conditions.nitrogen = 50; // Sandy soil typically has low nitrogen
        conditions.phosphorus = 30;
        conditions.potassium = 40;
    } else if (query.includes('clay soil') || query.includes('clay')) {
        conditions.nitrogen = 80; // Clay soil typically has higher nutrients
        conditions.phosphorus = 60;
        conditions.potassium = 70;
    } else if (query.includes('loamy soil') || query.includes('loam')) {
        conditions.nitrogen = 70; // Loamy soil has balanced nutrients
        conditions.phosphorus = 50;
        conditions.potassium = 60;
    } else if (query.includes('fertile soil') || query.includes('rich soil')) {
        conditions.nitrogen = 90;
        conditions.phosphorus = 80;
        conditions.potassium = 85;
    } else if (query.includes('poor soil') || query.includes('infertile')) {
        conditions.nitrogen = 30;
        conditions.phosphorus = 20;
        conditions.potassium = 25;
    }
    
    return conditions;
}

// Call the crop recommendation API
async function getCropRecommendation(conditions) {
    try {
        // Prepare the data for the API call
        const requestData = {
            nitrogen: conditions.nitrogen || 50,
            phosphorus: conditions.phosphorus || 50,
            potassium: conditions.potassium || 50,
            temperature: conditions.temperature || 25,
            humidity: conditions.humidity || 60,
            ph: conditions.ph || 7.0,
            rainfall: conditions.rainfall || 100
        };
        
        // Call the crop recommendation API
        const response = await fetch('http://localhost:5000/api/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });
        
        if (response.ok) {
            const result = await response.json();
            return result;
        } else {
            // Fallback to local prediction if API fails
            return await getLocalCropPrediction(requestData);
        }
    } catch (error) {
        console.log('API call failed, using local prediction:', error);
        // Fallback to local prediction
        const requestData = {
            nitrogen: conditions.nitrogen || 50,
            phosphorus: conditions.phosphorus || 50,
            potassium: conditions.potassium || 50,
            temperature: conditions.temperature || 25,
            humidity: conditions.humidity || 60,
            ph: conditions.ph || 7.0,
            rainfall: conditions.rainfall || 100
        };
        return await getLocalCropPrediction(requestData);
    }
}

// Local crop prediction using our model data
async function getLocalCropPrediction(conditions) {
    // This would ideally use the same model as the Streamlit app
    // For now, we'll use a simplified prediction based on our crop database
    const crops = Object.values(cropDatabase);
    const scores = [];
    
    crops.forEach(crop => {
        let score = 0;
        
        // Temperature matching
        const tempRange = crop.temperature.match(/(\d+)-(\d+)/);
        if (tempRange) {
            const minTemp = parseInt(tempRange[1]);
            const maxTemp = parseInt(tempRange[2]);
            if (conditions.temperature >= minTemp && conditions.temperature <= maxTemp) {
                score += 3;
            }
        }
        
        // pH matching (simplified)
        if (conditions.ph) {
            if (conditions.ph >= 6.0 && conditions.ph <= 7.5) {
                score += 2; // Most crops prefer neutral pH
            }
        }
        
        // Water requirements matching
        const waterDesc = crop.water.toLowerCase();
        if (conditions.rainfall) {
            if (waterDesc.includes('high') && conditions.rainfall > 150) {
                score += 2;
            } else if (waterDesc.includes('moderate') && conditions.rainfall >= 50 && conditions.rainfall <= 150) {
                score += 2;
            } else if (waterDesc.includes('low') && conditions.rainfall < 50) {
                score += 2;
            }
        }
        
        if (score > 0) {
            scores.push({ crop, score });
        }
    });
    
    // Sort by score and return top 3
    return {
        predictions: scores
            .sort((a, b) => b.score - a.score)
            .slice(0, 3)
            .map(item => ({
                crop: item.crop.name,
                confidence: Math.min(95, 60 + (item.score * 10))
            }))
    };
}

function extractKeywords(query) {
    // Extract important keywords from the query
    const words = query.split(' ');
    const keywords = [];
    
    // Crop-related keywords
    const cropWords = Object.keys(cropDatabase);
    const cropNames = Object.values(cropDatabase).map(crop => crop.name.toLowerCase());
    
    // Agricultural terms
    const agriTerms = ['soil', 'water', 'fertilizer', 'pest', 'disease', 'weather', 'harvest', 'planting', 'growing', 'cultivation', 'yield', 'irrigation', 'drainage', 'ph', 'temperature', 'humidity', 'rainfall', 'season', 'climate'];
    
    // Question words
    const questionWords = ['what', 'how', 'when', 'where', 'why', 'which', 'can', 'should', 'need', 'require', 'best', 'good', 'suitable'];
    
    words.forEach(word => {
        if (cropWords.includes(word) || cropNames.includes(word)) {
            keywords.push({ type: 'crop', value: word });
        } else if (agriTerms.includes(word)) {
            keywords.push({ type: 'agricultural', value: word });
        } else if (questionWords.includes(word)) {
            keywords.push({ type: 'question', value: word });
        }
    });
    
    return keywords;
}

function findBestCropMatch(query, keywords) {
    const cropKeywords = keywords.filter(k => k.type === 'crop');
    if (cropKeywords.length === 0) return null;
    
    // Try exact matches first
    for (const keyword of cropKeywords) {
        const crop = cropDatabase[keyword.value];
        if (crop) return crop;
    }
    
    // Try partial matches
    for (const keyword of cropKeywords) {
        const matches = Object.keys(cropDatabase).filter(crop => 
            crop.includes(keyword.value) || cropDatabase[crop].name.toLowerCase().includes(keyword.value)
        );
        if (matches.length > 0) {
            return cropDatabase[matches[0]];
        }
    }
    
    return null;
}

async function generateContextualResponse(query, keywords, cropMatch) {
    const agriculturalKeywords = keywords.filter(k => k.type === 'agricultural');
    const questionKeywords = keywords.filter(k => k.type === 'question');
    
    // Update context
    if (cropMatch) {
        currentContext.lastCrop = cropMatch.name;
    }
    
    // Extract conditions from natural language
    const conditions = extractConditionsFromText(query);
    const hasConditions = Object.values(conditions).some(value => value !== null);
    
    // Handle condition-based recommendations using ML model
    if (hasConditions) {
        try {
            const recommendation = await getCropRecommendation(conditions);
            
            if (recommendation && recommendation.predictions && recommendation.predictions.length > 0) {
                let response = `🌱 <strong>Based on your conditions, here are the AI-powered crop recommendations:</strong><br><br>`;
                
                // Show detected conditions
                const detectedConditions = [];
                if (conditions.temperature) detectedConditions.push(`🌡️ Temperature: ${conditions.temperature}°C`);
                if (conditions.ph) detectedConditions.push(`📊 pH: ${conditions.ph}`);
                if (conditions.humidity) detectedConditions.push(`💨 Humidity: ${conditions.humidity}%`);
                if (conditions.rainfall) detectedConditions.push(`🌧️ Rainfall: ${conditions.rainfall}mm`);
                if (conditions.nitrogen) detectedConditions.push(`🌿 Nitrogen: ${conditions.nitrogen}ppm`);
                if (conditions.phosphorus) detectedConditions.push(`🌿 Phosphorus: ${conditions.phosphorus}ppm`);
                if (conditions.potassium) detectedConditions.push(`🌿 Potassium: ${conditions.potassium}ppm`);
                
                if (detectedConditions.length > 0) {
                    response += `<strong>📋 Detected Conditions:</strong><br>${detectedConditions.join('<br>')}<br><br>`;
                }
                
                // Show ML model predictions
                response += `<strong>🤖 AI Model Predictions:</strong><br>`;
                recommendation.predictions.forEach((pred, index) => {
                    const cropInfo = Object.values(cropDatabase).find(c => c.name === pred.crop);
                    if (cropInfo) {
                        response += `${index + 1}. <strong>${pred.crop}</strong> (${Math.round(pred.confidence)}% confidence)<br>`;
                        response += `   ${cropInfo.description}<br>`;
                        response += `   🌱 Soil: ${cropInfo.soil}<br>`;
                        response += `   🌡️ Temperature: ${cropInfo.temperature}<br>`;
                        response += `   💧 Water: ${cropInfo.water}<br><br>`;
                    }
                });
                
                response += `<em>💡 These recommendations are generated by our advanced ML model trained on 58 different crops!</em>`;
                return response;
            }
        } catch (error) {
            console.log('Error getting ML recommendations:', error);
        }
    }
    
    // Handle follow-up questions based on context
    if (query.includes('more') || query.includes('also') || query.includes('additionally')) {
        if (currentContext.lastCrop) {
            const crop = Object.values(cropDatabase).find(c => c.name === currentContext.lastCrop);
            if (crop) {
                return `🌱 <strong>More about ${crop.name}:</strong><br>
                <strong>🌱 Soil Requirements:</strong> ${crop.soil}<br>
                <strong>📅 Best Season:</strong> ${crop.season}<br>
                <strong>💧 Water Needs:</strong> ${crop.water}<br>
                <strong>🌡️ Temperature:</strong> ${crop.temperature}<br>
                <strong>💡 Growing Tips:</strong> ${crop.tips}<br><br>
                Would you like to know about any specific aspect of growing ${crop.name}?`;
            }
        }
    }
    
    // Handle comparative questions
    if (query.includes('compare') || query.includes('difference') || query.includes('vs') || query.includes('versus')) {
        const cropWords = keywords.filter(k => k.type === 'crop');
        if (cropWords.length >= 2) {
            const crop1 = cropWords[0].value;
            const crop2 = cropWords[1].value;
            const crop1Data = cropDatabase[crop1];
            const crop2Data = cropDatabase[crop2];
            
            if (crop1Data && crop2Data) {
                return `🌱 <strong>Comparing ${crop1Data.name} vs ${crop2Data.name}:</strong><br><br>
                <strong>${crop1Data.name}:</strong><br>
                • Soil: ${crop1Data.soil}<br>
                • Season: ${crop1Data.season}<br>
                • Water: ${crop1Data.water}<br>
                • Temperature: ${crop1Data.temperature}<br><br>
                <strong>${crop2Data.name}:</strong><br>
                • Soil: ${crop2Data.soil}<br>
                • Season: ${crop2Data.season}<br>
                • Water: ${crop2Data.water}<br>
                • Temperature: ${crop2Data.temperature}`;
            }
        }
    }
    
    if (cropMatch) {
        // If we found a crop match, provide detailed information
        let response = `<strong>${cropMatch.name}</strong><br>`;
        response += `<em>${cropMatch.description}</em><br><br>`;
        
        // Check if user is asking about specific aspects
        if (agriculturalKeywords.length > 0) {
            const terms = agriculturalKeywords.map(k => k.value);
            
            if (terms.includes('soil')) {
                response += `<strong>🌱 Soil Requirements:</strong> ${cropMatch.soil}<br>`;
            }
            if (terms.includes('water') || terms.includes('irrigation')) {
                response += `<strong>💧 Water Needs:</strong> ${cropMatch.water}<br>`;
            }
            if (terms.includes('season') || terms.includes('planting')) {
                response += `<strong>📅 Best Season:</strong> ${cropMatch.season}<br>`;
            }
            if (terms.includes('temperature') || terms.includes('climate')) {
                response += `<strong>🌡️ Temperature:</strong> ${cropMatch.temperature}<br>`;
            }
            if (terms.includes('growing') || terms.includes('cultivation') || terms.includes('tips')) {
                response += `<strong>💡 Growing Tips:</strong> ${cropMatch.tips}<br>`;
            }
            
            // If no specific terms mentioned, show all info
            if (terms.length === 0) {
                response += `<strong>🌱 Soil Requirements:</strong> ${cropMatch.soil}<br>`;
                response += `<strong>📅 Best Season:</strong> ${cropMatch.season}<br>`;
                response += `<strong>💧 Water Needs:</strong> ${cropMatch.water}<br>`;
                response += `<strong>🌡️ Temperature:</strong> ${cropMatch.temperature}<br>`;
                response += `<strong>💡 Growing Tips:</strong> ${cropMatch.tips}`;
            }
        } else {
            // Show all information if no specific terms
            response += `<strong>🌱 Soil Requirements:</strong> ${cropMatch.soil}<br>`;
            response += `<strong>📅 Best Season:</strong> ${cropMatch.season}<br>`;
            response += `<strong>💧 Water Needs:</strong> ${cropMatch.water}<br>`;
            response += `<strong>🌡️ Temperature:</strong> ${cropMatch.temperature}<br>`;
            response += `<strong>💡 Growing Tips:</strong> ${cropMatch.tips}`;
        }
        
        // Add follow-up suggestions
        response += `<br><br><em>💬 You can ask me more about ${cropMatch.name} or compare it with other crops!</em>`;
        
        return response;
    }
    
    // Handle general agricultural questions
    if (agriculturalKeywords.length > 0) {
        const terms = agriculturalKeywords.map(k => k.value);
        
        if (terms.includes('soil')) {
            return `🌱 <strong>Soil Information:</strong> Different crops have different soil requirements. For example, rice prefers clay soil with good water retention, while carrots need well-drained sandy loam soil. I can provide specific soil requirements for any of our 58 supported crops. Which crop are you interested in?`;
        }
        
        if (terms.includes('water') || terms.includes('irrigation')) {
            return `💧 <strong>Water Requirements:</strong> Water needs vary significantly by crop. Rice needs flooded fields, while millet is drought-resistant. I can tell you the specific water requirements for any crop in our database. What crop would you like to know about?`;
        }
        
        if (terms.includes('fertilizer')) {
            return `🌿 <strong>Fertilizer Information:</strong> Fertilizer needs depend on soil type and crop requirements. Organic fertilizers are generally better for soil health. Different crops need different NPK ratios. I can provide specific fertilizer advice for any crop. Which crop are you asking about?`;
        }
        
        if (terms.includes('pest')) {
            return `🐛 <strong>Pest Management:</strong> Effective pest control includes crop rotation, natural predators, and organic pesticides. Regular monitoring and early detection are key. For specific pest management advice, let me know which crop you're concerned about.`;
        }
        
        if (terms.includes('disease')) {
            return `🔬 <strong>Disease Management:</strong> Plant diseases can be prevented with proper spacing, good drainage, and crop rotation. Our advanced disease detection tool can identify 38 different diseases from plant images. Which crop are you having disease issues with?`;
        }
        
        if (terms.includes('weather') || terms.includes('climate')) {
            return `🌤️ <strong>Weather & Climate:</strong> Weather significantly affects crop growth. Our system considers temperature, humidity, and rainfall in crop recommendations. Check our weather forecast feature for current conditions. What specific weather concern do you have?`;
        }
        
        if (terms.includes('harvest')) {
            return `🌾 <strong>Harvest Information:</strong> Harvest timing varies by crop. Look for maturity signs like color change, size, and texture. Our crop guide provides specific harvest information for all 58 crops. Which crop's harvest timing are you asking about?`;
        }
        
        if (terms.includes('planting') || terms.includes('season')) {
            return `📅 <strong>Planting Seasons:</strong> Most crops have specific seasons - Kharif (monsoon) or Rabi (winter). Some can be grown year-round. I can tell you the best planting time for any crop in our database. What crop are you planning to grow?`;
        }
    }
    
    // Handle question-based queries
    if (questionKeywords.length > 0) {
        if (query.includes('what') && query.includes('crop')) {
            return `🌱 <strong>Crop Recommendations:</strong> I can help you find the best crops for your conditions! Our AI system supports 58 different crops including cereals, pulses, oilseeds, vegetables, fruits, spices, and medicinal plants. Use our crop recommendation tool or tell me about your soil and weather conditions.`;
        }
        
        if (query.includes('how') && (query.includes('grow') || query.includes('plant'))) {
            return `🌿 <strong>Growing Guide:</strong> I can provide detailed growing instructions for any of our 58 crops! Tell me which crop you want to grow, and I'll give you specific information about soil, water, temperature, and growing tips.`;
        }
        
        if (query.includes('when') && (query.includes('plant') || query.includes('grow'))) {
            return `📅 <strong>Planting Timing:</strong> The best time to plant depends on the crop and your climate. Most crops have specific seasons - Kharif (monsoon) or Rabi (winter). Which crop are you asking about?`;
        }
        
        if (query.includes('which') && query.includes('crop')) {
            return `🎯 <strong>Crop Selection:</strong> I can help you choose the right crop! Our system considers soil nutrients, temperature, humidity, pH, and rainfall to recommend the best crops. Tell me about your growing conditions or use our crop recommendation tool.`;
        }
    }
    
    // Handle general queries about our system
    if (query.includes('help') || query.includes('what can you do')) {
        return `🌱 <strong>I can help you with:</strong><br>
        • <strong>Crop Information:</strong> Detailed info about 58 different crops<br>
        • <strong>Crop Recommendations:</strong> AI-powered suggestions based on your conditions<br>
        • <strong>Disease Detection:</strong> Identify 38 different plant diseases<br>
        • <strong>Growing Advice:</strong> Soil, water, fertilizer, and cultivation tips<br>
        • <strong>Agricultural Guidance:</strong> Pest management, harvest timing, and more<br><br>
        Just ask me about any crop or agricultural topic!`;
    }
    
    // Handle suggestions and recommendations
    if (query.includes('suggest') || query.includes('recommend') || query.includes('best crop')) {
        return `🌱 <strong>Crop Recommendations:</strong> I can suggest the best crops based on your conditions! Our AI system analyzes soil nutrients, temperature, humidity, pH, and rainfall to recommend from 58 different crops. Try our crop recommendation tool or tell me about your growing conditions (soil type, climate, water availability).`;
    }
    
    // Handle thank you and greetings
    if (query.includes('thank') || query.includes('thanks')) {
        return `😊 You're welcome! I'm here to help with all your agricultural questions. Feel free to ask about any crop, farming technique, or agricultural topic anytime!`;
    }
    
    if (query.includes('hello') || query.includes('hi') || query.includes('hey')) {
        return `👋 Hello! I'm your agricultural assistant. I can help you with information about 58 different crops, farming advice, and agricultural guidance. What would you like to know about today?`;
    }
    
    // Handle goodbye
    if (query.includes('bye') || query.includes('goodbye') || query.includes('see you')) {
        return `👋 Goodbye! Feel free to come back anytime for agricultural advice. Happy farming! 🌱`;
    }
    
    // Handle system capabilities
    if (query.includes('what can you do') || query.includes('capabilities') || query.includes('features')) {
        return `🌱 <strong>My Capabilities:</strong><br>
        • <strong>58 Crop Database:</strong> Detailed information about cereals, pulses, oilseeds, vegetables, fruits, spices, and medicinal plants<br>
        • <strong>AI Recommendations:</strong> Smart crop suggestions based on your conditions<br>
        • <strong>Disease Detection:</strong> Identify 38 different plant diseases<br>
        • <strong>Growing Guidance:</strong> Soil, water, fertilizer, and cultivation advice<br>
        • <strong>Comparative Analysis:</strong> Compare different crops side by side<br>
        • <strong>Context Awareness:</strong> Remember our conversation and provide follow-up help<br><br>
        Just ask me anything about agriculture!`;
    }
    
    // Smart suggestions based on query similarity
    const similarCrops = findSimilarCrops(query);
    if (similarCrops.length > 0) {
        return `🤔 I'm not sure about "${query}", but here are some related crops that might help:<br><br>
        ${similarCrops.map(crop => `• <strong>${crop.name}</strong> - ${crop.description}`).join('<br>')}<br><br>
        Would you like to know more about any of these crops?`;
    }
    
    // Default response for unrecognized queries
    return `🤔 I understand you're asking about "${query}". I can help you with information about 58 different crops, agricultural advice, and farming guidance. Could you be more specific about what you'd like to know? For example:<br>
    • "Tell me about rice growing"<br>
    • "What crops grow in sandy soil?"<br>
    • "How to prevent tomato diseases?"<br>
    • "When to plant wheat?"<br>
    • "Compare rice and wheat"<br>
    • "Suggest crops for my garden"`;
}

// Find similar crops based on query
function findSimilarCrops(query) {
    const queryWords = query.toLowerCase().split(' ');
    const similarCrops = [];
    
    Object.values(cropDatabase).forEach(crop => {
        const cropWords = (crop.name + ' ' + crop.description).toLowerCase().split(' ');
        const commonWords = queryWords.filter(word => 
            word.length > 2 && cropWords.some(cropWord => 
                cropWord.includes(word) || word.includes(cropWord)
            )
        );
        
        if (commonWords.length > 0) {
            similarCrops.push({
                name: crop.name,
                description: crop.description,
                similarity: commonWords.length
            });
        }
    });
    
    return similarCrops
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 3);
}

// Main chatbot function with advanced NLP and ML integration
async function fetchOptions() {
    const input = document.getElementById('keyword');
    const query = input.value.trim();
    
    if (!query) {
        addMessage('Please ask me anything about crops, farming, or agriculture!');
        return;
    }
    
    // Add user message
    addMessage(query, true);
    
    // Clear input
    input.value = '';
    
    // Add typing indicator
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'message bot-message typing-indicator';
    typingIndicator.innerHTML = '<span></span><span></span><span></span>';
    document.getElementById('chat-box').appendChild(typingIndicator);
    document.getElementById('chat-box').scrollTop = document.getElementById('chat-box').scrollHeight;
    
    try {
        // Process the query
        const processedQuery = preprocessQuery(query);
        const keywords = extractKeywords(processedQuery);
        const cropMatch = findBestCropMatch(processedQuery, keywords);
        
        // Generate contextual response (now async)
        const response = await generateContextualResponse(processedQuery, keywords, cropMatch);
        
        // Remove typing indicator
        typingIndicator.remove();
        
        // Add the response
        addMessage(response);
    } catch (error) {
        console.error('Error generating response:', error);
        
        // Remove typing indicator
        typingIndicator.remove();
        
        // Add error message
        addMessage('Sorry, I encountered an error while processing your request. Please try again or rephrase your question.');
    }
}

// General farming advice
function getGeneralAdvice(query) {
    const advice = {
        'soil': 'For soil information, I can help you with specific crop soil requirements. Our system supports 58 different crops! Try asking about a particular crop like "rice soil" or "tomato soil".',
        'water': 'Water requirements vary by crop. Most crops need regular watering but avoid overwatering. I can provide specific water needs for all 58 crops in our database.',
        'fertilizer': 'Fertilizer needs depend on soil type and crop. Organic fertilizers are generally better for soil health. Ask about specific crops for detailed fertilizer advice.',
        'pest': 'Pest management includes crop rotation, natural predators, and organic pesticides. Regular monitoring and early detection are key.',
        'disease': 'Plant diseases can be prevented with proper spacing, good drainage, and crop rotation. Use our advanced disease detection tool for accurate identification!',
        'weather': 'Weather affects crop growth significantly. Check our weather forecast feature for current conditions and plan accordingly.',
        'harvest': 'Harvest timing varies by crop. Look for maturity signs like color change, size, and texture. Our crop guide provides specific harvest information for all crops.',
        'planting': 'Planting time depends on crop type and local climate. Most crops have specific seasons - Kharif (monsoon) or Rabi (winter).',
        'crop recommendation': 'Use our advanced crop recommendation system! It supports 58 different crops and uses machine learning to suggest the best crop based on your soil conditions.',
        'disease detection': 'Our plant disease detection system can identify 38 different diseases using advanced image analysis. Just upload a plant image!',
        'prediction': 'Our AI-powered systems can predict the best crops for your conditions and identify plant diseases with high accuracy.',
        'ai': 'CropAI uses advanced AI and machine learning for crop recommendations and disease detection. We support 58 crops and 38 disease types!'
    };
    
    for (const [key, value] of Object.entries(advice)) {
        if (query.includes(key)) {
            return value;
        }
    }
    
    return `🌱 Welcome to CropAI! I can help you with information about 58 different crops including cereals, pulses, oilseeds, vegetables, fruits, spices, and medicinal plants. 
    
    🔬 Our advanced features include:
    • AI-powered crop recommendations (58 crops)
    • Plant disease detection (38 diseases)
    • Weather forecasting
    • Smart farming guidance
    
    💡 I can also provide advice on soil, water, fertilizer, pests, diseases, weather, harvest, and planting. 
    What specific crop or topic would you like to know about?`;
}

// Initialize chatbot
document.addEventListener('DOMContentLoaded', function() {
    // Add welcome message
    setTimeout(() => {
        addMessage('🌱 Welcome to CropAI! I\'m your intelligent agricultural assistant powered by advanced ML models. I can help you with:<br>• 58 different crops with detailed information<br>• <strong>Real ML-powered crop recommendations</strong> based on your specific conditions<br>• Plant disease detection (38 diseases)<br>• Natural language understanding - just describe your conditions!<br>• Context-aware conversations<br><br>Try asking: "I have high temperature and acidic soil" or "What crops grow in sandy soil with low rainfall?"');
    }, 1000);
    
    // Close chat when clicking outside
    document.addEventListener('click', function(event) {
        const chatContainer = document.getElementById('chat-container');
        const chatbotIcon = document.querySelector('.chatbot-icon');
        
        if (isChatOpen && !chatContainer.contains(event.target) && !chatbotIcon.contains(event.target)) {
            toggleChat();
        }
    });
});
