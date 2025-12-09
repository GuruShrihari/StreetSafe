# SafeTrace X - Intelligent Travel & Safety Companion

The ultimate AI-powered platform for modern travelers. SafeTrace X combines intelligent safety routing with comprehensive travel management, helping you plan, navigate, and cherish your journeys with complete peace of mind.

## 🚀 Features

### 🗺️ Intelligent Navigation & Safety
- **Adaptive Routing**: Choose your path based on your needs - **Safe**, **Balanced**, **Stealth**, or **Escort** modes.
- **Real-time Guardian**: Continuous hazard monitoring and route deviation alerts keep you safe.
- **Emergency SOS**: Instant live location sharing with a dedicated guardian dashboard.
- **Interactive Maps**: Beautiful, responsive maps with clear route visualization.

### 📅 Smart Itinerary & Packages
- **AI Itinerary Planner**: Generate personalized day-by-day itineraries based on your interests and time.
- **Curated Packages**: Explore pre-built travel packages for adventure, relaxation, or culture.
- **Dynamic Scheduling**: Automatically adjust your plans if you're running late or want to stay longer.

### 💰 Expense Management
- **Smart Tracking**: Log expenses on the go and categorize them automatically.
- **Budget Alerts**: Set daily or trip limits and get notified before you overspend.
- **Group Splitting**: Easily split bills with fellow travelers.

### ✍️ AI-Enhanced Journaling
- **Smart Memories**: Automatically organize your photos and location history into a cohesive story.
- **AI Enhancements**: Let AI polish your notes into beautiful travelogues.
- **Context Awareness**: The journal knows where you were and suggests details you might have missed.

## 📁 Project Structure

```
.
├── backend/          # FastAPI backend service
├── frontend/         # React + TypeScript frontend
└── README.md
```

## 🛠️ Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install Python dependencies (recommended: use a virtual environment):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install fastapi uvicorn pydantic
# Install other dependencies as needed
```

3. Ensure data files are present:
   - `data/safe_graph.gpickle`
   - `data/hourly_risk_data.csv`

4. Start the backend server:
```bash
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## 🎯 Usage

1. **Plan Your Trip**:
   - Browse **Packages** or create a custom **Itinerary**.
   - Set your budget in **Expenses**.

2. **Navigate Safely**:
   - Use the **Map** to find the safest route to your destination.
   - Select a mode: **Safe**, **Balanced**, **Stealth**, or **Escort**.
   - Activate **SOS** if you feel unsafe.

3. **Capture Memories**:
   - Use **Journaling** to record your experiences.
   - Let AI enhance your entries with context and style.

## 🔧 Configuration

### Backend
- API endpoints are configured in `backend/routes/`
- Routing modes and weights can be adjusted in `backend/config.py`

### Frontend
- API URL can be configured via `VITE_API_URL` environment variable
- Default: `http://localhost:8000`

## 📝 API Endpoints

- `POST /route/{mode}` - Calculate a route
- `POST /alerts/check-status` - Check for safety alerts
- `POST /alerts/reroute` - Recalculate route
- `POST /sos/activate` - Activate SOS session
- `POST /sos/location-update` - Update location
- `GET /sos/status/{token}` - Get guardian status
- `POST /sos/deactivate` - Deactivate SOS

## 🎨 Tech Stack

### Backend
- FastAPI
- Python 3.8+

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Leaflet (maps)
- React Router

## 📄 License

This project is part of the SafeTrace X system.
