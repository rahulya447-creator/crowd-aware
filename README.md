# Crowd-Aware Smart Route Recommendation System

AI-powered route optimization web app that recommends optimal paths based on real-time traffic simulation, crowd density analysis, and intelligent junction management.

## 🎯 Project Overview

This system helps users find the best route between two locations by:
- **A* Pathfinding Algorithm**: Uses real graph-based routing through Delhi's road network
- **Realistic Traffic Simulation**: Time-based traffic patterns (rush hours, weekends, etc.)
- **AI Junction Optimization**: Shows how AI reduces wait times at traffic signals
- **Interactive Map Visualization**: Routes displayed on OpenStreetMap with Leaflet
- **Multiple Route Options**: Compare 3 different paths with detailed metrics

### Key Features

✅ **Real A* Algorithm** - Not simulated! Actual graph-based pathfinding  
✅ **Time-Aware Traffic** - Traffic changes based on time of day and day of week  
✅ **Junction-Level AI** - See "With AI vs Without AI" at each junction  
✅ **Interactive Map** - Visualize routes with color-coded traffic levels  
✅ **Supabase Backend** - All searches and routes saved to database  
✅ **100% Free** - Uses only free tools (Supabase, Leaflet, OpenStreetMap)

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A Supabase account (free tier)

### Installation

1. **Clone or navigate to the project**
   ```bash
   cd crowd-aware
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**

   a. Go to [https://supabase.com](https://supabase.com) and create a free account
   
   b. Create a new project (wait 2-3 minutes for setup)
   
   c. Go to **Settings > API** and copy:
      - Project URL
      - `anon` / `public` key
   
   d. Open `.env` file and replace placeholder values:
      ```env
      VITE_SUPABASE_URL=your_project_url_here
      VITE_SUPABASE_ANON_KEY=your_anon_key_here
      ```

4. **Create database tables**

   a. In Supabase dashboard, go to **SQL Editor**
   
   b. Open `supabase/migrations/20251204112753_create_route_system_tables.sql`
   
   c. Copy the entire SQL content and paste into Supabase SQL Editor
   
   d. Click **Run** to create tables

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   ```
   http://localhost:5173
   ```

---

## 📖 How to Use

### Step 1: Enter Locations

Choose from these predefined Delhi locations:
- Connaught Place
- India Gate
- Chandni Chowk
- Karol Bagh
- Rajouri Garden
- Nehru Place
- Saket
- Dwarka
- Noida Sector 18
- Gurgaon Cyber City
- Lajpat Nagar
- Hauz Khas
- Kashmere Gate
- IFFCO Chowk

**Example searches:**
- "Connaught Place" to "India Gate"
- "Dwarka" to "Noida Sector 18"
- "Karol Bagh" to "Saket"

### Step 2: View Results

The app will show:
1. **Interactive Map** - All routes visualized with color coding
2. **Route Cards** - 3 route options with metrics:
   - Distance and estimated time
   - Crowd level (Low/Medium/High)
   - Junction-by-junction details
3. **AI Optimization** - Time saved at each junction

### Step 3: Explore Junction Details

Click "Junction AI Optimization Details" to see:
- Vehicles waiting
- Wait time WITHOUT AI
- Wait time WITH AI
- Time saved (in seconds)

---

## 🧠 How It Works

### 1. A* Pathfinding Algorithm

The system uses a real **A* (A-Star) algorithm** with:
- **Road Network Graph**: 14 locations connected by actual roads
- **Distance-based costs**: Real distances in kilometers
- **Heuristic function**: Haversine formula for straight-line distance
- **Multiple routes**: Different heuristic weights generate alternative paths

### 2. Realistic Traffic Simulation

Traffic is simulated based on:
- **Time of Day**:
  - Rush hours (8-10 AM, 5-8 PM): Heavy traffic
  - Daytime (10 AM-5 PM): Moderate traffic
  - Night (11 PM-6 AM): Light traffic
- **Day of Week**: Weekends have 30% less traffic
- **Road Type**:
  - Highways: Fast, less crowded
  - Main roads: Moderate speed and crowd
  - Local roads: Slower, more crowded

### 3. AI Junction Optimization

At each junction, AI optimization:
- **Analyzes crowd density** (low/medium/high)
- **Reduces wait time** by 5-45% depending on congestion
- **Higher savings** when traffic is heavy
- **Minimal changes** when traffic is light

The system shows **side-by-side comparison** of traditional signals vs AI-optimized signals.

### 4. Route Scoring

Optimal route is selected using:
```
Score = (Time × 0.7) + (Distance × 0.3)
```
This prioritizes **faster routes** but also considers distance.

---

## 📁 Project Structure

```
crowd-aware/
├── src/
│   ├── components/
│   │   ├── LocationInput.tsx     # Search input form
│   │   ├── RouteCard.tsx         # Route display card
│   │   ├── JunctionDetails.tsx   # Junction AI comparison
│   │   └── MapView.tsx           # Leaflet map component
│   ├── utils/
│   │   ├── roadNetwork.ts        # Delhi road graph (14 locations)
│   │   ├── astar.ts              # A* pathfinding algorithm
│   │   ├── trafficSimulator.ts   # Time-based traffic simulation
│   │   └── routeGenerator.ts     # Main route generation logic
│   ├── types/
│   │   └── route.ts              # TypeScript interfaces
│   ├── lib/
│   │   └── supabase.ts           # Database client
│   └── App.tsx                   # Main application
├── supabase/
│   └── migrations/               # Database schema
├── .env                          # Supabase credentials
└── package.json                  # Dependencies
```

---

## 🛠️ Technologies Used

- **Frontend**: React + TypeScript + Vite
- **Styling**: TailwindCSS
- **Map**: Leaflet + React-Leaflet + OpenStreetMap
- **Backend**: Supabase (PostgreSQL)
- **Algorithm**: A* Pathfinding
- **Icons**: Lucide React

---

## 📊 Database Schema

4 main tables:

1. **user_searches** - User search history
2. **routes** - Generated route options
3. **junctions** - Junction-level traffic data
4. **traffic_data** - Real-time traffic segments (for future use)

All tables have Row Level Security (RLS) enabled with public read/write access for demo purposes.

---

## 🎓 College Project Notes

This project demonstrates:
- ✅ Graph-based pathfinding (A* algorithm)
- ✅ Real-time data simulation
- ✅ Database integration
- ✅ Interactive visualization
- ✅ AI/ML concepts (optimization, prediction)
- ✅ Full-stack development

**Perfect for demonstrating**:
- Computer Science fundamentals (graphs, algorithms)
- Software engineering (modular design, TypeScript)
- Data structures and algorithms
- Web development skills
- Database design

---

## 🔧 Development

### Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm run typecheck  # Check TypeScript types
```

### Adding New Locations

Edit `src/utils/roadNetwork.ts`:
1. Add location to `locations` object
2. Add road connections to `roads` array
3. Roads are bidirectional automatically

---

## 🐛 Troubleshooting

**Issue**: "Start or end location not found in road network"  
**Solution**: Use exact location names from the list above

**Issue**: Map not loading  
**Solution**: Check internet connection (OpenStreetMap tiles require internet)

**Issue**: Routes not saving to database  
**Solution**: Verify Supabase credentials in `.env` file

**Issue**: "Failed to generate routes"  
**Solution**: Check browser console for errors, ensure database tables are created

---

## 📝 Future Enhancements

- [ ] Real traffic API integration (Google Maps, TomTom)
- [ ] User authentication and saved searches
- [ ] Route comparison side-by-side
- [ ] Historical traffic pattern analysis
- [ ] Mobile app version
- [ ] More cities and locations

---

## 👥 Credits

Built as a college project to demonstrate AI-powered route optimization.

**Technologies**: React, TypeScript, Supabase, Leaflet, OpenStreetMap, TailwindCSS

---

## 📄 License

Free to use for educational purposes.
