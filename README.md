# Driver Drowsiness Detection System - Frontend

A real-time monitoring dashboard for tracking driver drowsiness and fatigue alerts in fleet management.

## Features

- **Real-time Dashboard**: Monitor active drivers, trips, vehicles, and drowsiness alerts
- **Driver Management**: Register, edit, and track drivers with medical conditions and risk schedules
- **Trip Tracking**: Start/end trips, assign vehicles, and monitor active journeys
- **Alert System**: Track drowsiness alerts including:
  - Microsleep detection
  - Yawning detection
  - Head tilting/nodding
  - PERCLOS (eye closure) monitoring
- **Alert Heat Map**: Geographic visualization of drowsiness alerts using Leaflet maps
- **Statistics & Charts**: Visual analytics with ApexCharts for alert trends and driver status
- **Vehicle Management**: Register and assign vehicles to trips

## Tech Stack

- **React** - UI framework
- **Vite** - Build tool
- **Material Tailwind** - UI components
- **Tailwind CSS** - Styling
- **ApexCharts** - Data visualization
- **Leaflet** - Map visualization
- **Hero Icons** - Icons

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/
├── api/              # API client for backend communication
├── context/          # React context providers
├── layouts/          # Page layouts (dashboard, auth)
├── pages/
│   ├── auth/         # Sign in/up pages
│   └── dashboard/
│       ├── components/   # Dashboard components
│       │   ├── AlertHeatMap.jsx      # Geographic alert visualization
│       │   ├── AlertNotification.jsx # Alert notifications
│       │   ├── DriversTable.jsx      # Driver management table
│       │   ├── StatsCharts.jsx       # Statistics charts
│       │   └── VehiclesTable.jsx     # Vehicle management
│       ├── home.jsx      # Main dashboard
│       ├── tables.jsx    # Data tables view
│       └── profile.jsx   # User profile
└── widgets/          # Reusable UI components
    ├── cards/        # Statistics cards
    ├── charts/       # Chart components
    └── layout/       # Navigation, sidebar, footer
```

## Environment

Requires a backend API server for drowsiness detection data. The frontend fetches:
- Driver information and status
- Active/completed trips
- Drowsiness alerts with GPS coordinates
- Vehicle assignments

