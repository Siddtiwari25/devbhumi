# ⛰️ Devbhoomi Cabs Uttarakhand Portal

A highly-polished, premium, full-stack tourism and transport portal for Uttarakhand, featuring **AI-Powered Route Planners**, **Dynamic Fare Estimators**, and a **Virtual Support Assistant ("Mandakini")**. 

This application utilizes a robust dual-layer architecture: a blazing-fast **Vite + React** single-page application as the client and a high-performance **Node.js + Express** server handling secure, server-side Google Gemini AI orchestration.

---

## 🗺️ Live Development Info
* **Dev Link:** [Uttarakhand Devbhoomi Cabs](https://ais-dev-qkdeescloekt5ayrehohic-821255176299.asia-southeast1.run.app)
* **Design Aesthetic:** Deep "Himalayan Slate" Dark Mode with Amber accents, combining Swiss clean grids, custom typography pairs, and responsive editorial layout margins.

---

## ⚡ Key Application Modules

1. **Instant AI Fare Estimator:** Real-time distance, toll taxes, state green tax parameters, driver Bhatta allowance, and vehicle category rate calculations corresponding to real Himalayan routes.
2. **Divine Tour Planner:** Generates customized day-by-day itineraries using the **Gemini 3.5 Flash** model based on days, budget class, travel sizes, and interests.
3. **Mandakini AI Concierge:** 24/7 warm local guide chatbot assisting pilgrims with route closures, weather guidelines, Char Dham darshan regulations, and cab details.
4. **Live Interactive Fleet Deck:** Showcases Hatchbacks, Sedans, SUVs, and high-capacity Tempo Travellers with comprehensive specifications, base fares, and seating guidelines.
5. **Interactive Booking Console:** Direct booking form generating valid ticket receipts, assigning verified local drivers, and tracking trip logs securely.
6. **Unified Admin Dashboard Cabin:** Fully integrated control panel letting administrators monitor active bookings, update driver allocations, adjust ride status, and draft custom tour packages.

---

## 🛠️ Architecture and Tech Stack

* **Frontend:** React 19, Vite 6, Tailwind CSS 4, Motion, Lucide React (for premium icons)
* **Backend:** Express, Node.js, TSX, esbuild
* **AI Orchestration:** `@google/genai` TypeScript SDK (server-side to protect keys under zero-leak security rules)
* **In-Memory Fallbacks:** Intelligent static itinerary generators and contextual chatbot patterns that load instantly if your Gemini API key is missing.

---

## 🚀 Local Installation Guild

Follow these step-by-step instructions to download, configure, and boot the application on your local workstation.

### 1. Prerequisites
Ensure you have the following installed:
* **Node.js** (v18.0.0 or higher, recommended v20+)
* **npm** (usually bundled with Node.js)

### 2. Setup the Codebase
Extract your exported zip bundle or clone the project, and open your preferred terminal inside the project root:
```bash
cd devbhoomi-cabs-applet
```

### 3. Install Dependencies
Install all required package registries and node modules:
```bash
npm install
```

### 4. Setup Local Environment Variables
Before launching, you must define your credentials. Create a `.env` file in the root of the directory (ignored by `.gitignore` to keep things secure):
```bash
cp .env.example .env
```
Open the newly created `.env` file and insert your API credentials:
```env
# Google Gemini API Key - Get your own from https://aistudio.google.com/
GEMINI_API_KEY="AIzaSyYourActualGeminiKeyHere"

# Self-referential URL where this applet is hosted (e.g. localhost during dev)
APP_URL="http://localhost:3000"
```
*Note: If `GEMINI_API_KEY` is undefined, the portal will auto-detect this and load rich fallback planners, ensuring full functionality with or without internet connectivity.*

### 5. Start Local Development Server
Boot the Node.js Express server which wraps the Vite compiler in real-time middleware:
```bash
npm run dev
```
Upon success, you will see output like:
```text
🚀 Premium Uttarakhand Devbhoomi Cabs Server booting on http://localhost:3000
🌍 Sandbox Mode Active. Host: 0.0.0.0
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser of choice to interact with the application locally!

---

## 📦 Production Compiling and Execution

To bundle all assets into minified production files and run the stand-alone node server:

```bash
# Clean, verify, and bundle files
npm run build

# Boot the compiled standalone build output
npm run start
```

### Build Commands Under the Hood:
1. `vite build` translates TypeScript and React modules into an optimized static bundle written inside the `/dist` directory.
2. `esbuild server.ts [...] --outfile=dist/server.cjs` compiles the Express server file into a single, light, self-contained CommonJS executable inside `/dist`. This protects you from Node’s strict module resolution rules and ensures fast boots.
3. `node dist/server.cjs` runs the server standalone using Node.

---

## 🐙 Push Code to GitHub

To store, share, and track the codebase inside your personal GitHub repository:

### 1. Initialize Git in Project Root
```bash
git init
```

### 2. Add files and make first commit
The pre-configured `.gitignore` will safely block large modules like `node_modules` or local `.env` keys.
```bash
git add .
git commit -m "feat: initial commit of Devbhoomi Cabs Uttarakhand Portal"
```

### 3. Push to your Remote Repository
Create an empty repository on [GitHub](https://github.com/), copy the remote URL, and run:
```bash
# Rename default branch to main
git branch -M main

# Link your local repo to GitHub
git remote add origin https://github.com/USERNAME/REPOSITORY-NAME.git

# Push to your main branch
git push -u origin main
```

---

## 🌐 Deployment Guidelines

Because this is a full-stack application (powered by an Express backend dynamically handling AI requests, proxying API keys, and managing in-memory booking states), **it must be deployed to a host that supports a running Node.js runtime process (not just a static host like GitHub Pages)**.

### Option A: Render, Fly.io, or Heroku (Highly Recommended)
1. Log in to your platform terminal dashboard (e.g., [Render](https://render.com/)).
2. Connect your newly pushed GitHub Repository.
3. Set the following build settings:
   * **Runtime:** Node
   * **Build Command:** `npm install && npm run build`
   * **Start Command:** `npm run start` (this executes `node dist/server.cjs` on port `3000`)
4. Add your **Environment Variables**:
   * Add `GEMINI_API_KEY` corresponding to your Google AI Studio API key.
   * Add `NODE_ENV` as `production`.

### Option B: Google Cloud Run (Containerized Deployment)
The package.json scripts and ports are fully standardized for container deployment:
* The Express server listens to `0.0.0.0` over Port `3000` (which is standard for Cloud Run ingress systems).
* You can deploy a Cloud Run service using GCloud CLI:
  ```bash
  gcloud run deploy devbhoomi-cabs --source . --port 3000 --allow-unauthenticated
  ```

---

*🙏 Atithi Devo Bhava | Wishing you a safe, memorable, and spiritual journey across the majestic peaks of Uttarakhand!*
