import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Create application and bind to PORT 3000
const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
} else {
  console.log("⚠️ GEMINI_API_KEY missing. Server will use rich fallback planners.");
}

// ==========================================
// IN-MEMORY DATABASE DESIGN
// ==========================================

// Initial Cabs / Fleet Data
let vehicles = [
  {
    id: "v-hatch",
    category: "Hatchback",
    models: ["Alto", "WagonR"],
    baseRatePerKm: 11,
    seating: "4 Seats + Driver",
    features: ["A/C", "Music System", "Sanitized Cab", "Luggage Carrier"],
    rating: 4.8,
    reviewsCount: 124,
    image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=400",
    description: "Ideal for solo travelers or small cozy families traveling brief distances."
  },
  {
    id: "v-sedan",
    category: "Sedan",
    models: ["Swift Dzire", "Toyota Etios"],
    baseRatePerKm: 13,
    seating: "4 Seats + Driver",
    features: ["A/C", "Aux/Bluetooth", "Premium Seating", "Comfort Suspension", "Sanitized"],
    rating: 4.9,
    reviewsCount: 245,
    image: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=400",
    description: "Premium comfort for medium journeys, pilgrimage, and sight-seeing trips."
  },
  {
    id: "v-suv",
    category: "SUV",
    models: ["Maruti Ertiga", "Innova Crysta"],
    baseRatePerKm: 18,
    seating: "6-7 Seats + Driver",
    features: ["Dual A/C", "Surround Sound", "Generous Luggage Space", "Hill Climb Assist", "GPS Nav"],
    rating: 4.9,
    reviewsCount: 412,
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=400",
    description: "Essential heavy-duty climber for mountain terrains, safe and comfortable for large families."
  },
  {
    id: "v-tt-9",
    category: "Tempo Traveller (9S)",
    models: ["9 Seater Tempo Traveller"],
    baseRatePerKm: 24,
    seating: "9 Seats + Driver",
    features: ["Reclining Push-Back Seats", "Individial A/C Vents", "LED Screens", "Sanitized Audio System", "GPS Tracker"],
    rating: 4.7,
    reviewsCount: 88,
    image: "https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&q=80&w=400",
    description: "Perfect fit for small groups visiting shrines or hill stations without split cab stress."
  },
  {
    id: "v-tt-12",
    category: "Tempo Traveller (12S-26S)",
    models: ["12-26 Seater Tempo Traveller"],
    baseRatePerKm: 28,
    seating: "12-26 Seats + Driver",
    features: ["Luxurious Cabin", "Premium Night Lighting", "Vast Luggage Canopy", "Dedicated Co-driver Service", "Surround Music Layout"],
    rating: 4.8,
    reviewsCount: 112,
    image: "https://images.unsplash.com/photo-1561055657-b9e0bf0fa360?auto=format&fit=crop&q=80&w=400",
    description: "Elite luxury cruisers for larger group tours, school yatras, or corporate events."
  }
];

// Initial Custom Packages Design
let tourPackages = [
  {
    id: "pkg-chardham",
    title: "Char Dham Yatra Complete Sacred Pilgrimage",
    category: "Pilgrimage",
    duration: "10 Days / 9 Nights",
    route: "Haridwar ➔ Barkot ➔ Yamunotri ➔ Uttarkashi ➔ Gangotri ➔ Guptkashi ➔ Kedarnath ➔ Joshimath ➔ Badrinath ➔ Rishikesh",
    highlights: ["Sankalp Pooja at Haridwar", "Darshan at Kedarnath & Badrinath", "Exclusive Ganga Aarti in Rishikesh", "Experienced mountain/ghat drivers", "VIP temple access assistance"],
    startingPrice: 32500,
    rating: 4.95,
    spotsLeft: 4,
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&q=80&w=600",
    description: "The complete sacred Himalayan yatra encompassing all four holy shrines. Fully secure transport with emergency medical updates & stay-overs."
  },
  {
    id: "pkg-kedarnath",
    title: "Kedarnath Dham Spiritual Escape",
    category: "Pilgrimage",
    duration: "4 Days / 3 Nights",
    route: "Haridwar ➔ Guptkashi ➔ Sonprayag ➔ Gaurikund ➔ Kedarnath Dham ➔ Haridwar",
    highlights: ["Scenic Mandakini river drive", "Night trek halts at Kedarnath top", "Local sightseeing around Rudraprayag", "Helicopter booking coordinates support"],
    startingPrice: 14200,
    rating: 4.9,
    spotsLeft: 7,
    image: "https://images.unsplash.com/photo-1624590393245-c49ab5ee1fa7?auto=format&fit=crop&q=80&w=600",
    description: "Dedicated spiritual circuit curated for devotees wishing to trek or fly premium copter directly into the holy Lord Shiva shrine at Kedarnath."
  },
  {
    id: "pkg-mussoorie",
    title: "Queen of Hills - Mussoorie Family Getaway",
    category: "Hill Station",
    duration: "3 Days / 2 Nights",
    route: "Dehradun ➔ Mussoorie Lal Tibba ➔ Kempty Falls ➔ George Everest Peak ➔ Dhanaulti Echo Park",
    highlights: ["Spectacular mountain view drive", "George Everest sunset stroll", "Adventure activities in Dhanaulti", "Comfort sightseeing with halts"],
    startingPrice: 7500,
    rating: 4.8,
    spotsLeft: 9,
    image: "https://images.unsplash.com/photo-1582234032274-0697223b3749?auto=format&fit=crop&q=80&w=600",
    description: "Rejuvenating weekend escape around the cloud mist of Mussoorie and gorgeous snow vistas of Dhanaulti."
  },
  {
    id: "pkg-nainital",
    title: "Lake Paradise Nainital & Lake Districts Tour",
    category: "Hill Station",
    duration: "4 Days / 3 Nights",
    route: "Kathgodam ➔ Nainital Mall Road ➔ Bhimtal Lake ➔ Sattal Cascade Lakes ➔ Mukteshwar Ridge Viewpoint",
    highlights: ["Boating over glassy Naini lake", "Exploring ancient Mukteshwar Dham", "Scenic fruit orchards passes", "Sunset photography points"],
    startingPrice: 10400,
    rating: 4.85,
    spotsLeft: 5,
    image: "https://images.unsplash.com/photo-1627856013091-fed6e4e30025?auto=format&fit=crop&q=80&w=600",
    description: "Perfect romantic or family vacation among the magnificent emerald green lakes of Kumaon region."
  },
  {
    id: "pkg-auli",
    title: "Auli Snow Slopes & Valley of Adventure",
    category: "Hill Station",
    duration: "5 Days / 4 Nights",
    route: "Haridwar ➔ Rishikesh Ganga Banks ➔ Joshimath Heights ➔ Auli Meadow Slopes ➔ Gorson Bugyal Meadow Walk",
    highlights: ["Rishikesh adventure rafting option", "Asia's highest ropeway chair lift ride", "Glorious peaks of Nanda Devi panorama", "Meadow trekking with snow gears"],
    startingPrice: 16800,
    rating: 4.92,
    spotsLeft: 6,
    image: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&q=80&w=600",
    description: "An absolute thrill ride ascending deep towards Joshimath cable lines towards pristine ski hills of India."
  },
  {
    id: "pkg-corbett",
    title: "Jim Corbett Wilderness Safari & River Drive",
    category: "Wildlife",
    duration: "3 Days / 2 Nights",
    route: "Delhi/Kathgodam ➔ Corbett Jungle Gates ➔ Dhikala Zone Track ➔ Garjiya Temple River Bank",
    highlights: ["4x4 open Gypsy morning tiger safari", "Premium jungle eco-resort halt", "Spot wild elephants on Ramganga rivers", "Experienced forest naturalists guides"],
    startingPrice: 11200,
    rating: 4.78,
    spotsLeft: 8,
    image: "https://images.unsplash.com/photo-1615959189197-48400dc1542a?auto=format&fit=crop&q=80&w=600",
    description: "Exquisite venture into Asia's oldest national forest reserve tracking leopards, tigers, and hundreds of bird genres."
  }
];

// Initial Bookings Database
let bookings = [
  {
    id: "BK-8491",
    customerName: "Rakesh Sharma",
    customerPhone: "+91 98765 43210",
    pickupLocation: "Dehradun Airport (DED)",
    dropLocation: "Haridwar Temple Ghati",
    pickupDate: "2026-06-25",
    pickupTime: "14:30",
    passengers: 3,
    vehicleType: "Sedan (Swift Dzire)",
    bookingType: "Airport Transfer",
    specialNotes: "Need sanitised cab with empty trunk for heavy travel-bags.",
    estimatedFare: 1850,
    status: "Confirmed",
    driverName: "Sohan Singh Negi",
    driverPhone: "+91 88765 11223",
    driverVerified: true,
    createdDate: "2026-06-19T10:15:00Z"
  },
  {
    id: "BK-9022",
    customerName: "Anjali Gupta",
    customerPhone: "+91 87654 32109",
    pickupLocation: "Haridwar Railway Station",
    dropLocation: "Guptkashi Homestay",
    pickupDate: "2026-06-28",
    pickupTime: "06:00",
    passengers: 5,
    vehicleType: "SUV (Innova Crysta)",
    bookingType: "Outstation Cabs",
    specialNotes: "Pilgrimage. Senior citizen on board. Please drive gently over uphill turns.",
    estimatedFare: 7200,
    status: "Pending",
    driverName: "Pending Allocations",
    driverPhone: "",
    driverVerified: false,
    createdDate: "2026-06-20T03:22:00Z"
  }
];

// Initial Reviews Database
let reviews = [
  {
    id: "rev-1",
    userName: "Amit K.",
    rating: 5,
    text: "Outstanding Char Dham Yatra experience! Our driver Negiji was highly experienced with mountain hairpins. His local knowledge of roadside dhabas made the trip so cozy.",
    date: "June 14, 2026",
    verifiedTrip: "Char Dham Yatra Complete"
  },
  {
    id: "rev-2",
    userName: "Meenakshi Desai",
    rating: 5,
    text: "Extremely reliable airport pickup from Dehradun Airport to Mussoorie. The cab was spotlessly clean, properly sanitized, and had a working high-quality music system.",
    date: "June 18, 2026",
    verifiedTrip: "Airport Transfer to Mussoorie"
  },
  {
    id: "rev-3",
    userName: "Dr. Sandeep Vardhan",
    rating: 4,
    text: "Booked a SUV for my parents for Haridwar sightseeing. Very smooth handling, great communication with backend coordinators, highly recommended.",
    date: "June 19, 2026",
    verifiedTrip: "Haridwar Local"
  }
];

// ==========================================
// API ENDPOINTS HANDLERS
// ==========================================

// 1. GET ALL VEHICLES
app.get("/api/fleet", (req, res) => {
  res.json({ success: true, data: vehicles });
});

// 2. GET ALL TOUR PACKAGES
app.get("/api/packages", (req, res) => {
  res.json({ success: true, data: tourPackages });
});

// 3. BOOKINGS SERVICES
app.get("/api/bookings", (req, res) => {
  res.json({ success: true, data: bookings });
});

app.post("/api/bookings", (req, res) => {
  const {
    customerName,
    customerPhone,
    pickupLocation,
    dropLocation,
    pickupDate,
    pickupTime,
    passengers,
    vehicleType,
    bookingType,
    specialNotes,
    estimatedFare
  } = req.body;

  if (!customerName || !customerPhone || !pickupLocation || !dropLocation || !pickupDate) {
    return res.status(400).json({ success: false, message: "Missing required booking details." });
  }

  // Generate randomized booking ID
  const randomId = "BK-" + Math.floor(1000 + Math.random() * 9000);
  const newBooking = {
    id: randomId,
    customerName,
    customerPhone,
    pickupLocation,
    dropLocation,
    pickupDate,
    pickupTime: pickupTime || "08:00",
    passengers: parseInt(passengers) || 1,
    vehicleType: vehicleType || "Sedan",
    bookingType: bookingType || "Local Taxi",
    specialNotes: specialNotes || "",
    estimatedFare: parseInt(estimatedFare) || 2500,
    status: "Pending",
    driverName: "Pending Allocations",
    driverPhone: "",
    driverVerified: false,
    createdDate: new Date().toISOString()
  };

  bookings.unshift(newBooking);
  res.json({ success: true, message: "Ride booking registered successfully!", data: newBooking });
});

// 4. BOOKING ACTIONS (Update Status / Assign Driver)
app.post("/api/bookings/:id/update", (req, res) => {
  const { id } = req.params;
  const { status, driverName, driverPhone, driverVerified } = req.body;

  const bIndex = bookings.findIndex(b => b.id === id);
  if (bIndex === -1) {
    return res.status(404).json({ success: false, message: "Booking record not found." });
  }

  const updatedBooking = {
    ...bookings[bIndex],
    ...(status && { status }),
    ...(driverName && { driverName }),
    ...(driverPhone !== undefined && { driverPhone }),
    ...(driverVerified !== undefined && { driverVerified })
  };

  bookings[bIndex] = updatedBooking;
  res.json({ success: true, message: "Booking file updated safely.", data: updatedBooking });
});

// 5. REVIEWS ENGINES
app.get("/api/reviews", (req, res) => {
  res.json({ success: true, data: reviews });
});

app.post("/api/reviews", (req, res) => {
  const { userName, rating, text, verifiedTrip } = req.body;

  if (!userName || !rating || !text) {
    return res.status(400).json({ success: false, message: "Required fields missing for posting review." });
  }

  const newReview = {
    id: "rev-" + Date.now(),
    userName,
    rating: parseInt(rating) || 5,
    text,
    date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    verifiedTrip: verifiedTrip || "Uttarakhand Guest Tour"
  };

  reviews.unshift(newReview);
  res.json({ success: true, message: "Thank you! Review saved successfully.", data: newReview });
});

// ==========================================
// GOOGLE GEMINI AI ENDPOINTS
// ==========================================

// AI Trip Route Planner endpoint
app.post("/api/ai/planner", async (req, res) => {
  const { days, budget, interests, travelers } = req.body;

  if (!days || !budget) {
    return res.status(400).json({ success: false, message: "Please enter expected days and travel budget styles." });
  }

  const prompt = `You are the chief AI travel strategist behind Devbhoomi Cabs (Uttarakhand's absolute leading tour and transport service). 
Generate a highly descriptive, premium, and interactive Himalayan tour itinerary based on:
- Days available: ${days} Days
- Travel budget level: ${budget} (Budget/Standard/Luxury)
- Travelers: ${travelers || 'Family / Friends'}
- Core interests: ${interests || 'Pilgrimage, sight-seeing, and spiritual hills'}

Format the response strictly as valid JSON, using the schema below (Do NOT add markdown blocks or code blocks, just pure JSON string):
{
  "routeName": "Give a stunning local spiritual/scenic title for the route",
  "totalEstimatedFuelFare": "Approx fare in INR for sedan cab (e.g. ₹15,500)",
  "recommendedVehicle": "Pick the optimum vehicle (e.g., Alto for small budget, Innova Crysta for Luxury/mountain group)",
  "geographicalAlerts": "Crucial hill safety tips e.g., cloudburst, peak season traffic tips",
  "itinerary": [
    {
      "day": 1,
      "title": "Day Title",
      "route": "Start ➔ Stop",
      "activities": ["Activity 1", "Activity 2"],
      "insiderTip": "A local tip about a key food joint, photo spot, or pooja booking"
    }
  ]
}`;

  // If Gemini client isn't available, invoke the Fallback local simulation
  if (!ai) {
    console.log("No API Key. Returning beautiful simulated local itinerary.");
    return res.json(getSimulatedItinerary(days, budget, interests));
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const contentText = response.text || "";
    // Clean potential raw json wrapping in prompt
    let cleanJson = contentText;
    if (contentText.includes("```json")) {
      cleanJson = contentText.split("```json")[1].split("```")[0];
    } else if (contentText.includes("```")) {
      cleanJson = contentText.split("```")[1].split("```")[0];
    }
    
    // Parse to ensure compliance before returning
    const parsed = JSON.parse(cleanJson.trim());
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error("Gemini Content Planner Failure: ", error.message);
    res.json(getSimulatedItinerary(days, budget, interests)); // return high-quality fallback on error
  }
});

// AI Customer Support Chatbot
app.post("/api/ai/chat", async (req, res) => {
  const { message, chatHistory } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, message: "Chat content empty." });
  }

  const promptHeader = `You are "Mandakini", the official 24/7 AI Travel Host of "Devbhoomi Cabs" (Uttarakhand). You are highly specialized in local sightseeing spots, Char Dham yatra rituals, motorable passes, snow conditions in Auli, rafting levels in Rishikesh, flight times out of Jolly Grant airport (Dehradun), and cab booking operations.
Tone: Warm, hospitable (expressing 'Atithi Devo Bhava'), professional, precise, and highly resourceful. Answer briefly (under 130 words). Mention our Devbhoomi Cab service benefits: experienced mountain pilots, zero hidden costs, 24x7 SOS assist.`;

  // Provide fallback chatbot response if API key is missing
  if (!ai) {
    return res.json({
      success: true,
      text: getSimulatedChatbotResponse(message)
    });
  }

  try {
    // Generate context content
    const systemPromptMessage = promptHeader + "\n\nUser Question: " + message;
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: systemPromptMessage,
    });

    res.json({ success: true, text: response.text });
  } catch (error: any) {
    console.error("Gemini Chat Failure: ", error.message);
    res.json({
      success: true,
      text: getSimulatedChatbotResponse(message)
    });
  }
});

// AI Intelligent Fare Estimator & Distance API Proxy
app.post("/api/ai/fare-estimator", (req, res) => {
  const { startPoint, endPoint, vehicleId } = req.body;

  if (!startPoint || !endPoint || !vehicleId) {
    return res.status(400).json({ success: false, message: "Start, Destination points and vehicle type are needed to estimate fare." });
  }

  // Define realistic grid distances inside Uttarakhand
  const keyDistances: { [key: string]: number } = {
    "dehradun_airport-haridwar": 42,
    "dehradun_airport-rishikesh": 31,
    "dehradun_airport-mussoorie": 60,
    "dehradun_airport-nainital": 275,
    "haridwar-nainital": 240,
    "haridwar-guptkashi": 210,
    "haridwar-kedarnath": 250,
    "haridwar-badrinath": 305,
    "haridwar-rishikesh": 20,
    "haridwar-dehradun": 52,
    "rishikesh-auli": 250,
    "rishikesh-joshimath": 235,
    "delhi-nainital": 310,
    "delhi-haridwar": 220,
    "delhi-dehradun": 245,
    "delhi-kedarnath": 450,
    "dehradun-mussoorie": 34,
    "dehradun-badrinath": 320
  };

  const lookupKey1 = `${startPoint.toLowerCase().trim().replace(/ /g, "_")}-${endPoint.toLowerCase().trim().replace(/ /g, "_")}`;
  const lookupKey2 = `${endPoint.toLowerCase().trim().replace(/ /g, "_")}-${startPoint.toLowerCase().trim().replace(/ /g, "_")}`;

  // Find approximate distance, default to a robust estimate if arbitrary
  let distanceKm = keyDistances[lookupKey1] || keyDistances[lookupKey2] || 150;
  
  // Custom variation if arbitrary route
  if (distanceKm === 150) {
    distanceKm = Math.floor(40 + Math.random() * 320); 
  }

  const selectedVehicle = vehicles.find(v => v.id === vehicleId) || vehicles[1];
  const ratePerKm = selectedVehicle.baseRatePerKm;
  
  // Complete breakdown
  const cleanBaseFare = distanceKm * ratePerKm;
  const hillServiceCharges = Math.floor(distanceKm > 100 ? 500 : 200); // Mountain climb wear taxes
  const statePermitTax = Math.floor(distanceKm > 200 ? 450 : 150);
  const driverBhattaNightAllowance = 350;
  const grandTotal = cleanBaseFare + hillServiceCharges + statePermitTax + driverBhattaNightAllowance;

  res.json({
    success: true,
    data: {
      route: `${startPoint} ➔ ${endPoint}`,
      distanceKm,
      vehicle: selectedVehicle.category,
      baseFareBreakdown: `₹${cleanBaseFare} (${distanceKm} km × ₹${ratePerKm}/km)`,
      hillTaxes: hillServiceCharges,
      statePermitTax,
      driverAllowance: driverBhattaNightAllowance,
      estimatedTotalFare: grandTotal,
      tripDurationHrs: (distanceKm / 42).toFixed(1) // Mountain driving speeds average 42 km/hr safely
    }
  });
});

// ==========================================
// VITE DEV SERVER OR STATIC PRODUCTION LOGIC
// ==========================================

async function initializeApp() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Premium Uttarakhand Devbhoomi Cabs Server booting on http://localhost:${PORT}`);
    console.log(`🌍 Sandbox Mode Active. Host: 0.0.0.0`);
  });
}

initializeApp().catch(err => {
  console.error("Initialization Failed: ", err);
});

// ==========================================
// STATIC PRE-CALCULATED FALLBACKS
// ==========================================

function getSimulatedItinerary(days: number, budget: string, interests: string) {
  const isBudget = budget.toLowerCase() === "budget";
  const vehicle = isBudget ? "Alto / WagonR Hatchback" : "Innova Crysta SUV";
  
  return {
    success: true,
    data: {
      routeName: "Classic Devbhoomi Scenic Panorama",
      totalEstimatedFuelFare: isBudget ? "₹12,400" : "₹22,800",
      recommendedVehicle: vehicle + " with Hill Climbing Pilots",
      geographicalAlerts: "Regular evening monsoon showers; we recommend starting mountain drives before 07:00 AM.",
      itinerary: [
        {
          day: 1,
          title: "Divine Arrival & Himalayan Mist Entry",
          route: "Dehradun Airport (DED) ➔ Haridwar Ganga Ghats",
          activities: [
            "Smooth airport landing pickup via mountain pilot",
            "Checking into comfortable riverside boutique homestay",
            "Evening exclusive VIP VIP Chandi Ghati Ganga Aarti experience"
          ],
          insiderTip: "Order hot local kachoris at Mohan Ji Poori Wale near Har Ki Pauri for an unforgettable local treat."
        },
        {
          day: 2,
          title: "Valley Mist Ascents & Adventure Thrills",
          route: "Haridwar ➔ Rishikesh ➔ Devprayag Sangam Drive",
          activities: [
            "Sacred stopover at Bhagirathi & Alaknanda junction",
            "Rishikesh suspended bridge walks & temple logs entry",
            "Optional early morning light river rafting"
          ],
          insiderTip: "Capture amazing panoramic frames at the river confluence viewpoint just before entering the main highway corridor."
        },
        {
          day: 3,
          title: "The Golden Sunset Crest Sightings",
          route: "Rishikesh ➔ Queen of Hills Mussoorie Crests",
          activities: [
            "Driving through lush sal woods on Dehradun bypass",
            "Strolling down historical Mussoorie Mall Road",
            "Watching the mountain winterline effect from Landour hills"
          ],
          insiderTip: "Enjoy piping hot ginger herbal tea at Landour Bakehouse while overlooking pristine pine peaks."
        }
      ]
    }
  };
}

function getSimulatedChatbotResponse(message: string): string {
  const msg = message.toLowerCase();
  
  if (msg.includes("char dham") || msg.includes("yatra") || msg.includes("kedarnath") || msg.includes("badrinath")) {
    return "🙏 Greetings from Devbhoomi! Our elite Char Dham packages (Yamunotri ➔ Gangotri ➔ Kedarnath ➔ Badrinath) feature 10 days of curated driving with highly qualified mountain pilots. We manage point-to-point transfers from Haridwar or Jolly Grant airport, supply daily Himalayan track/weather updates, and coordinate local homestay/helicopter allocations. Would you like our AI to draft your interactive Dham planner now?";
  }
  if (msg.includes("price") || msg.includes("cost") || msg.includes("fare") || msg.includes("rate") || msg.includes("estimate")) {
    return "🚘 Hello! Devbhoomi Cabs is built on strict transparent pricing: Hatchbacks from ₹11/km, Sedans from ₹13/km, and deep-mountain SUVs from ₹18/km. All fares include toll parameters, mountain permit costs, and driver allowance with absolutely ZERO surprise fees. You can use our Instant AI Fare Estimator directly above to calculate your exact trip budget!";
  }
  if (msg.includes("airport") || msg.includes("dehradun") || msg.includes("pickup") || msg.includes("ded")) {
    return "✈️ Jolly Grant Airport (Dehradun) is our core terminal! We run prompt 24/7 transfers: Rishikesh from ₹1,400, Haridwar from ₹1,800, and Mussoorie from ₹2,200. Your mountain pilot will greet you outside the luggage carousel with a personalized greeting placard. Book easily through our booking dashboard!";
  }
  
  return "🙏 Greeting from Devbhoomi Cab Service Uttarakhand! I am Mandakini, your virtual Himalayan host. I can assist you with local sightseeing guides, peak weather updates, taxi availability rates (Hatchback/Sedan/SUV/Tempo Travellers), and booking state clearances. Please let me know which majestic destinations you hope to explore!";
}
