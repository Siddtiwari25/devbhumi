import React, { useState, useEffect } from "react";
import { 
  Compass, MapPin, Car, ShieldCheck, UserCheck, Settings, 
  MessageSquare, Phone, ArrowRight, Loader2, Calendar, 
  Users, CheckCircle2, ChevronRight, Star, AlertTriangle, 
  Send, DollarSign, Award, Clock, FileText, Heart, Plus, 
  X, HelpCircle, Check, Info, RefreshCw, Layers, ExternalLink
} from "lucide-react";
import Navbar from "./components/Navbar";
import { Vehicle, TourPackage, Booking, Review, AIItinerary, AIFareBreakdown } from "./types";

export default function App() {
  // Navigation Tabs State
  const [currentTab, setCurrentTab] = useState<string>("home");

  // System Core States
  const [fleet, setFleet] = useState<Vehicle[]>([]);
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Instant Fare Calculator Form States
  const [pickupInput, setPickupInput] = useState<string>("Dehradun Airport (DED)");
  const [dropInput, setDropInput] = useState<string>("Haridwar Temple Ghati");
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("v-sedan");
  const [calculatingFare, setCalculatingFare] = useState<boolean>(false);
  const [fareBreakdown, setFareBreakdown] = useState<AIFareBreakdown | null>(null);

  // Manual Custom / Booking Creation State
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false);
  const [bookingFormData, setBookingFormData] = useState({
    customerName: "",
    customerPhone: "",
    pickupDate: "",
    pickupTime: "10:00",
    passengers: 4,
    specialNotes: "",
    bookingType: "Outstation Cabs"
  });
  const [successBookingReceipt, setSuccessBookingReceipt] = useState<Booking | null>(null);

  // AI Tour Planner Form States
  const [plannerDays, setPlannerDays] = useState<number>(5);
  const [plannerBudget, setPlannerBudget] = useState<string>("Standard");
  const [plannerInterests, setPlannerInterests] = useState<string>("Pilgrimage & Scenic Valley Views");
  const [plannerTravelers, setPlannerTravelers] = useState<string>("Family of 4");
  const [planningAI, setPlanningAI] = useState<boolean>(false);
  const [plannedItinerary, setPlannedItinerary] = useState<AIItinerary | null>(null);

  // AI Chatbot "Mandakini" Panel States
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [chatMessage, setChatMessage] = useState<string>("");
  const [chatLogs, setChatLogs] = useState<Array<{ sender: "user" | "ai"; text: string; time: string }>>([
    {
      sender: "ai",
      text: "🙏 Pranam! Welcome to Uttarakhand. I am Mandakini, your personal guide. Ask me about weather conditions, Char Dham timings, or taxi fares!",
      time: "Just Now"
    }
  ]);
  const [chattingAI, setChattingAI] = useState<boolean>(false);

  // User Review Submission Form
  const [newReviewForm, setNewReviewForm] = useState({
    userName: "",
    rating: 5,
    text: "",
    verifiedTrip: ""
  });
  const [postingReview, setPostingReview] = useState<boolean>(false);

  // Admin New Package Form State
  const [adminPkgForm, setAdminPkgForm] = useState({
    title: "",
    category: "Pilgrimage",
    duration: "4 Days / 3 Nights",
    route: "",
    highlights: "",
    startingPrice: "",
    description: ""
  });
  const [adminNotify, setAdminNotify] = useState<string>("");

  // Customer Loyalty Counter Mock
  const [walletBalance, setWalletBalance] = useState<number>(350);
  const [loyaltyPoints, setLoyaltyPoints] = useState<number>(1200);

  // Driver Simulated Context
  const [driverOnline, setDriverOnline] = useState<boolean>(true);
  const [driverDutyStatus, setDriverDutyStatus] = useState<string>("Awaiting Next Trip");
  const [driverEarnings, setDriverEarnings] = useState<number>(4200);

  // Multi-language Selected (Mock)
  const [siteLanguage, setSiteLanguage] = useState<string>("English");

  // Load backend content on startup
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const fleetRes = await fetch("/api/fleet");
      const fleetJson = await fleetRes.json();
      if (fleetJson.success) setFleet(fleetJson.data);

      const pkgsRes = await fetch("/api/packages");
      const pkgsJson = await pkgsRes.json();
      if (pkgsJson.success) setPackages(pkgsJson.data);

      const bRes = await fetch("/api/bookings");
      const bJson = await bRes.json();
      if (bJson.success) setBookings(bJson.data);

      const revRes = await fetch("/api/reviews");
      const revJson = await revRes.json();
      if (revJson.success) setReviews(revJson.data);

    } catch (err) {
      console.error("Failed to query API endpoints: ", err);
    } finally {
      setLoading(false);
    }
  };

  // 1. Calculate fare using backend calculator
  const handleCalculateFareSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCalculatingFare(true);
      const response = await fetch("/api/ai/fare-estimator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startPoint: pickupInput,
          endPoint: dropInput,
          vehicleId: selectedVehicleId
        })
      });
      const resJson = await response.json();
      if (resJson.success) {
        setFareBreakdown(resJson.data);
      }
    } catch (err) {
      console.error("Estimation failed: ", err);
    } finally {
      setCalculatingFare(false);
    }
  };

  // 2. Register a new Booking
  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingFormData.customerName || !bookingFormData.customerPhone || !bookingFormData.pickupDate) {
      alert("Please fill in Name, Phone, and Trip Date.");
      return;
    }

    try {
      const estimatedPrice = fareBreakdown ? fareBreakdown.estimatedTotalFare : 3500;
      const targetVehicle = fleet.find(f => f.id === selectedVehicleId)?.category || "Comfort Sedan";

      const payload = {
        customerName: bookingFormData.customerName,
        customerPhone: bookingFormData.customerPhone,
        pickupLocation: pickupInput,
        dropLocation: dropInput,
        pickupDate: bookingFormData.pickupDate,
        pickupTime: bookingFormData.pickupTime,
        passengers: bookingFormData.passengers,
        vehicleType: `${targetVehicle} (Chosen)`,
        bookingType: bookingFormData.bookingType,
        specialNotes: bookingFormData.specialNotes,
        estimatedFare: estimatedPrice
      };

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setSuccessBookingReceipt(data.data);
        // Add to local state synchronously
        setBookings([data.data, ...bookings]);
        // Deduct/Increase points mock
        setLoyaltyPoints(prev => prev + 250);
        setBookingFormData({
          customerName: "",
          customerPhone: "",
          pickupDate: "",
          pickupTime: "10:00",
          passengers: 4,
          specialNotes: "",
          bookingType: "Outstation Cabs"
        });
      }
    } catch (er) {
      console.error("Booking submission failure: ", er);
    }
  };

  // 3. AI itinerary planning call
  const handleGenerateAIItinerary = async () => {
    try {
      setPlanningAI(true);
      setPlannedItinerary(null);
      const res = await fetch("/api/ai/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          days: plannerDays,
          budget: plannerBudget,
          interests: plannerInterests,
          travelers: plannerTravelers
        })
      });
      const resJson = await res.json();
      if (resJson.success) {
        setPlannedItinerary(resJson.data);
      }
    } catch (e) {
      console.error("Planning failure: ", e);
    } finally {
      setPlanningAI(false);
    }
  };

  // 4. Live support chat triggers
  const sendChatMessage = async () => {
    if (!chatMessage.trim()) return;
    const userMsg = chatMessage;
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    setChatLogs(prev => [...prev, { sender: "user", text: userMsg, time: nowStr }]);
    setChatMessage("");
    setChattingAI(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg })
      });
      const data = await res.json();
      if (data.success) {
        setChatLogs(prev => [...prev, { sender: "ai", text: data.text, time: nowStr }]);
      }
    } catch (err) {
      console.error("Chat backend broken: ", err);
    } finally {
      setChattingAI(false);
    }
  };

  // 5. Post customer feedback text
  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewForm.userName || !newReviewForm.text) return;
    try {
      setPostingReview(true);
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReviewForm)
      });
      const data = await res.json();
      if (data.success) {
        setReviews([data.data, ...reviews]);
        setNewReviewForm({ userName: "", rating: 5, text: "", verifiedTrip: "" });
        alert("Thank you! Your verified feedback has been written to Devbhoomi logs.");
      }
    } catch (err) {
      console.error("Review save failure: ", err);
    } finally {
      setPostingReview(false);
    }
  };

  // 6. Admin operations: Update booking status
  const handleAdminUpdateStatus = async (id: string, status: 'Confirmed' | 'Completed' | 'Cancelled') => {
    try {
      const payload: any = { status };
      if (status === "Confirmed") {
        payload.driverName = "Sohan Singh Negi";
        payload.driverPhone = "+91 94120 11995";
        payload.driverVerified = true;
      }
      const res = await fetch(`/api/bookings/${id}/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setBookings(bookings.map(book => book.id === id ? data.data : book));
      }
    } catch (err) {
      console.error("Admin status update failure: ", err);
    }
  };

  // 7. Admin operation: Add custom package
  const handleAdminCreatePackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPkgForm.title || !adminPkgForm.highlights || !adminPkgForm.startingPrice) {
      setAdminNotify("⚠️ Please check title, price and route details.");
      return;
    }
    const rawHighlights = adminPkgForm.highlights.split(",").map(h => h.trim());
    const generatedObject: TourPackage = {
      id: "pkg-" + Date.now(),
      title: adminPkgForm.title,
      category: adminPkgForm.category,
      duration: adminPkgForm.duration,
      route: adminPkgForm.route || "Dehradun ➔ Devbhoomi Pass ➔ Sightseeing",
      highlights: rawHighlights,
      startingPrice: parseInt(adminPkgForm.startingPrice) || 8500,
      rating: 4.9,
      spotsLeft: 8,
      image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&q=80&w=600",
      description: adminPkgForm.description || "Custom package drafted directly from Admin cabin console layout."
    };

    setPackages([generatedObject, ...packages]);
    setAdminPkgForm({
      title: "",
      category: "Pilgrimage",
      duration: "4 Days / 3 Nights",
      route: "",
      highlights: "",
      startingPrice: "",
      description: ""
    });
    setAdminNotify("✅ Custom package live. Loaded into marketplace successfully.");
    setTimeout(() => setAdminNotify(""), 4000);
  };

  // WhatsApp helper
  const openWhatsAppUrl = () => {
    const text = encodeURIComponent("Hi, I want to book a luxury cab with Devbhoomi Cabs Uttarakhand. Please send details.");
    window.open(`https://wa.me/919412000000?text=${text}`, "_blank");
  };

  return (
    <div id="premium-editorial-root" className="min-h-screen bg-[#0F1215] text-[#F9F7F2] font-sans flex flex-col relative overflow-x-hidden">
      
      {/* Decorative Accent Background lines */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none z-0" />
      <div className="absolute top-[800px] right-0 w-[450px] h-[450px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none z-0" />
      
      {/* Navbar Inclusion */}
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} openAgentChat={() => setChatOpen(true)} />

      {/* Main Layout Area */}
      <main className="flex-grow z-10 w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
            <span className="text-sm font-mono tracking-widest uppercase text-white/40">Loading Divine Routes...</span>
          </div>
        ) : (
          <div>
            
            {/* 1. HOME TAB */}
            {currentTab === "home" && (
              <div id="home-view" className="animate-fade-in">
                
                {/* Hero section */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 grid grid-cols-1 md:grid-cols-12 gap-12 items-center relative">
                  
                  {/* Backdrop Giant Typography for Editorial Style */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none z-0 overflow-hidden">
                    <span className="font-serif font-black text-[120px] md:text-[230px] leading-tight text-center tracking-widest uppercase">
                      DEV BHOOMI
                    </span>
                  </div>

                  {/* Left Side Copy */}
                  <div className="md:col-span-7 space-y-8 z-10">
                    <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                      <span className="text-[11px] font-mono tracking-widest uppercase text-amber-500 font-semibold">
                        Registered • ISO Verified • GST Verified
                      </span>
                    </div>

                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-light leading-none tracking-tight">
                      Explore the <br />
                      <span className="italic text-amber-500 font-semibold font-serif">Divine Peaks</span> <br />
                      with Trusted Ease.
                    </h1>

                    <p className="text-base sm:text-lg text-white/70 max-w-xl font-light leading-relaxed">
                      Premium certified travel pilots across Haridwar, Rishikesh, Dehradun, and Char Dham shrines. Professional mountain drivers, sanitized top-tier fleet, and strict transparent rate standards.
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-6 pt-4 border-t border-white/10 max-w-xl">
                      <div>
                        <p className="text-2xl sm:text-3xl font-serif font-bold text-amber-400">120+</p>
                        <p className="text-[10px] uppercase tracking-widest text-white/50">Verified Cars</p>
                      </div>
                      <div>
                        <p className="text-2xl sm:text-3xl font-serif font-bold text-amber-400">15,000+</p>
                        <p className="text-[10px] uppercase tracking-widest text-white/50">Happy Pilgrims</p>
                      </div>
                      <div>
                        <p className="text-2xl sm:text-3xl font-serif font-bold text-amber-400">4.95 / 5</p>
                        <p className="text-[10px] uppercase tracking-widest text-white/50">Average Rating</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 pt-2">
                      <button 
                        onClick={() => {
                          const calculatorEl = document.getElementById("booking-calculator-widget");
                          if (calculatorEl) calculatorEl.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="bg-amber-500 hover:bg-amber-400 text-[#0F1215] font-bold text-xs sm:text-sm uppercase tracking-widest px-8 py-4 rounded-xl transition-all shadow-lg shadow-amber-500/20 active:translate-y-0.5"
                      >
                        Book Taxi Cab
                      </button>
                      
                      <button 
                        onClick={() => setCurrentTab("packages")}
                        className="bg-white/5 border border-white/20 hover:bg-white/10 text-[#F9F7F2] font-semibold text-xs sm:text-sm uppercase tracking-widest px-7 py-4 rounded-xl transition-all"
                      >
                        Browse Packages
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Premium Interactive Calculator & Booking Box */}
                  <div id="booking-calculator-widget" className="md:col-span-5 z-10 w-full">
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-2.5 h-full bg-amber-500" />
                      
                      {/* Tabs */}
                      <div className="flex gap-4 mb-6 border-b border-white/10 pb-4">
                        <button className="flex-1 text-left">
                          <span className="block text-[10px] uppercase tracking-widest text-amber-500 font-mono font-bold">Category</span>
                          <span className="text-sm font-serif font-semibold text-white">Instant Fare Engine</span>
                        </button>
                        <Compass className="w-5 h-5 text-white/30 self-center" />
                      </div>

                      <form onSubmit={handleCalculateFareSubmit} className="space-y-4">
                        <div>
                          <label className="text-[10px] uppercase font-semibold tracking-widest text-white/40 mb-1.5 block">Pickup Point</label>
                          <div className="relative">
                            <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-amber-500" />
                            <select 
                              value={pickupInput}
                              onChange={(e) => setPickupInput(e.target.value)}
                              className="w-full bg-white/5 border border-white/15 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-[#F9F7F2] focus:outline-none focus:border-amber-500"
                            >
                              <option className="bg-[#15181c]" value="Dehradun Airport (DED)">Dehradun Airport (DED)</option>
                              <option className="bg-[#15181c]" value="Haridwar Railway Station">Haridwar Railway Station</option>
                              <option className="bg-[#15181c]" value="Rishikesh Laxman Jhula">Rishikesh Laxman Jhula</option>
                              <option className="bg-[#15181c]" value="Dehradun Clock Tower">Dehradun Local (Clock Tower)</option>
                              <option className="bg-[#15181c]" value="Delhi Airport Terminal 3">Delhi Airport Terminal 3</option>
                              <option className="bg-[#15181c]" value="Kathgodam Kumaon Station">Kathgodam Station (Nainital gateway)</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] uppercase font-semibold tracking-widest text-white/40 mb-1.5 block">Destination Drop</label>
                          <div className="relative">
                            <FlagIcon className="absolute left-3.5 top-3.5 w-4 h-4 text-emerald-500" />
                            <select 
                              value={dropInput}
                              onChange={(e) => setDropInput(e.target.value)}
                              className="w-full bg-white/5 border border-white/15 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-[#F9F7F2] focus:outline-none focus:border-amber-500"
                            >
                              <option className="bg-[#15181c]" value="Haridwar Temple Ghati">Haridwar Temple Ghati</option>
                              <option className="bg-[#15181c]" value="Rishikesh Parmarth Niketan">Rishikesh Parmarth Niketan</option>
                              <option className="bg-[#15181c]" value="Mussoorie Mall Road">Mussoorie (Mall Road)</option>
                              <option className="bg-[#15181c]" value="Nainital Tallital Lake">Nainital Mall Road</option>
                              <option className="bg-[#15181c]" value="Kedarnath Helipad (Guptkashi)">Kedarnath Base (Guptkashi)</option>
                              <option className="bg-[#15181c]" value="Badrinath Dhama Temple">Badrinath Dhama Temple</option>
                              <option className="bg-[#15181c]" value="Auli Ski Slopes">Auli Ski Meadows</option>
                              <option className="bg-[#15181c]" value="Jim Corbett National Park">Jim Corbett Jungle Gate</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] uppercase font-semibold tracking-widest text-white/40 mb-1.5 block">Cab Class Desired</label>
                            <select
                              value={selectedVehicleId}
                              onChange={(e) => setSelectedVehicleId(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-[#F9F7F2] focus:outline-none focus:border-amber-500"
                            >
                              {fleet.map((car) => (
                                <option className="bg-[#15181c]" key={car.id} value={car.id}>
                                  {car.category} (₹{car.baseRatePerKm}/km)
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] uppercase font-semibold tracking-widest text-white/40 mb-1.5 block">Service Type</label>
                            <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-[#F9F7F2] focus:outline-none focus:border-amber-500">
                              <option className="bg-[#15181c]">One-Way Journey</option>
                              <option className="bg-[#15181c]">Round-Trip Custom</option>
                              <option className="bg-[#15181c]">Multi-day Pilgrimage</option>
                            </select>
                          </div>
                        </div>

                        <button 
                          type="submit"
                          disabled={calculatingFare}
                          className="w-full bg-amber-500 hover:bg-amber-400 text-[#0F1215] font-bold text-xs uppercase tracking-[0.2em] py-4 rounded-xl mt-2 transition-all shadow-md shadow-amber-500/15 flex items-center justify-center gap-2"
                        >
                          {calculatingFare ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Estimating Routes...</span>
                            </>
                          ) : (
                            <>
                              <span>Calculate Est. Fare</span>
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </form>

                      {/* Display Fare Output breakdown if generated */}
                      {fareBreakdown && (
                        <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 p-4 animate-fade-in text-xs">
                          <div className="flex justify-between items-center border-b border-white/5 pb-2">
                            <span className="font-mono text-white/40">Vehicle Model</span>
                            <span className="font-serif font-bold text-amber-500">{fareBreakdown.vehicle}</span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="font-mono text-white/40">Approx. Distance</span>
                            <span className="text-white font-medium">{fareBreakdown.distanceKm} Kilometers</span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="font-mono text-white/40">Base Mileage Charges</span>
                            <span className="text-white font-medium">{fareBreakdown.baseFareBreakdown}</span>
                          </div>

                          <div className="flex justify-between items-center text-[11px] text-white/70">
                            <span>Hill Station Climbing Fee</span>
                            <span>₹{fareBreakdown.hillTaxes}</span>
                          </div>

                          <div className="flex justify-between items-center text-[11px] text-white/70">
                            <span>State Green Tax / State Toll</span>
                            <span>₹{fareBreakdown.statePermitTax}</span>
                          </div>

                          <div className="flex justify-between items-center text-[11px] text-white/70">
                            <span>Driver Boarding Allowance</span>
                            <span>₹{fareBreakdown.driverAllowance}</span>
                          </div>

                          <div className="flex justify-between items-center pt-2.5 border-t border-white/10 font-bold text-sm">
                            <span className="text-white font-serif">Total Est. Fare:</span>
                            <span className="text-amber-500 font-mono text-lg font-bold">₹{fareBreakdown.estimatedTotalFare}</span>
                          </div>

                          <div className="pt-2">
                            <button
                              onClick={() => setShowBookingModal(true)}
                              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold tracking-wider py-3 rounded-lg flex items-center justify-center gap-1 uppercase text-[11px] transition-all"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Book This Cab Instantly</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Core Marketing Circuits Row */}
                <div className="bg-white/5 border-y border-white/10 py-6">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap gap-8 items-center justify-between text-xs sm:text-sm">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                      <span className="font-mono uppercase tracking-widest text-white/60">Dehradun Airport (DED) Transfers</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span className="font-mono uppercase tracking-widest text-white/60">Char Dham & Kedarnath Specialist</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" />
                      <span className="font-mono uppercase tracking-widest text-white/60">Luxury SUVs available (Innova Crysta)</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#a855f7]" />
                      <span className="font-mono uppercase tracking-widest text-white/60">Verified Hill Pilots 24/7</span>
                    </div>
                  </div>
                </div>

                {/* Popular routes section */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
                  <div className="text-center space-y-4">
                    <p className="text-amber-500 font-mono text-xs uppercase tracking-[0.25em]">Himalayan Corridors</p>
                    <h2 className="text-3xl sm:text-4xl font-serif font-light">Popular Travel Routes & Rates</h2>
                    <p className="text-sm text-white/50 max-w-xl mx-auto">
                      Daily direct cab circuits mapping pilgrimage shrines, serene valleys, and local airports at competitive, certified prices.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    
                    {/* Route 1 */}
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:border-amber-500/30 transition-all duration-300 relative group">
                      <div className="absolute top-5 right-5 text-xs font-mono text-white/30 tracking-widest">REGULAR</div>
                      <h3 className="font-serif text-xl font-medium mb-1 text-amber-500">Dehradun Airport ↔ Rishikesh</h3>
                      <p className="text-xs text-white/40 mb-4 uppercase tracking-widest">Airport Transfer • 31 Kilometers</p>
                      
                      <div className="space-y-2 border-y border-white/5 py-3 mb-4 text-xs">
                        <div className="flex justify-between"><span className="text-white/50">Hatchback (WagonR)</span> <span className="font-mono font-bold text-white">₹1,300</span></div>
                        <div className="flex justify-between"><span className="text-white/50">Comfort Sedan (Dzire)</span> <span className="font-mono font-bold text-white">₹1,700</span></div>
                        <div className="flex justify-between"><span className="text-white/50">SUV Choice (Ertiga / Innova)</span> <span className="font-mono font-bold text-emerald-400">₹2,400</span></div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Free Luggage Carrier
                        </span>
                        <button 
                          onClick={() => {
                            setPickupInput("Dehradun Airport (DED)");
                            setDropInput("Rishikesh Parmarth Niketan");
                            setSelectedVehicleId("v-sedan");
                            const card = document.getElementById("booking-calculator-widget");
                            if (card) card.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="text-xs font-bold text-white group-hover:text-amber-500 flex items-center gap-1 transition-colors uppercase tracking-widest"
                        >
                          Select Route <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Route 2 */}
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:border-amber-500/30 transition-all duration-300 relative group">
                      <div className="absolute top-5 right-5 text-xs font-mono text-white/30 tracking-widest">PILGRIM</div>
                      <h3 className="font-serif text-xl font-medium mb-1 text-amber-500">Haridwar ➔ Kedarnath</h3>
                      <p className="text-xs text-white/40 mb-4 uppercase tracking-widest">Pilgrimage Outstation • 250 Kilometers</p>
                      
                      <div className="space-y-2 border-y border-white/5 py-3 mb-4 text-xs">
                        <div className="flex justify-between"><span className="text-white/50">Hatchback (WagonR)</span> <span className="font-mono font-bold text-white">₹5,200</span></div>
                        <div className="flex justify-between"><span className="text-white/50">Comfort Sedan (Dzire)</span> <span className="font-mono font-bold text-white">₹6,500</span></div>
                        <div className="flex justify-between"><span className="text-white/50">SUV Choice (Ertiga / Innova)</span> <span className="font-mono font-bold text-emerald-400">₹8,800</span></div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Verified Mountain Pilot
                        </span>
                        <button 
                          onClick={() => {
                            setPickupInput("Haridwar Railway Station");
                            setDropInput("Kedarnath Helipad (Guptkashi)");
                            setSelectedVehicleId("v-suv");
                            const card = document.getElementById("booking-calculator-widget");
                            if (card) card.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="text-xs font-bold text-white group-hover:text-amber-500 flex items-center gap-1 transition-colors uppercase tracking-widest"
                        >
                          Select Route <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Route 3 */}
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:border-amber-500/30 transition-all duration-300 relative group">
                      <div className="absolute top-5 right-5 text-xs font-mono text-white/30 tracking-widest">HILL ESCAPE</div>
                      <h3 className="font-serif text-xl font-medium mb-1 text-amber-500">Dehradun Airport ↔ Mussoorie</h3>
                      <p className="text-xs text-white/40 mb-4 uppercase tracking-widest">Airport Transfer • 60 Kilometers</p>
                      
                      <div className="space-y-2 border-y border-white/5 py-3 mb-4 text-xs">
                        <div className="flex justify-between"><span className="text-white/50">Hatchback (WagonR)</span> <span className="font-mono font-bold text-white">₹2,100</span></div>
                        <div className="flex justify-between"><span className="text-white/50">Comfort Sedan (Dzire)</span> <span className="font-mono font-bold text-white">₹2,800</span></div>
                        <div className="flex justify-between"><span className="text-white/50">SUV Choice (Ertiga / Innova)</span> <span className="font-mono font-bold text-emerald-400">₹3,900</span></div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Toll Taxes Included
                        </span>
                        <button 
                          onClick={() => {
                            setPickupInput("Dehradun Airport (DED)");
                            setDropInput("Mussoorie Mall Road");
                            setSelectedVehicleId("v-sedan");
                            const card = document.getElementById("booking-calculator-widget");
                            if (card) card.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="text-xs font-bold text-white group-hover:text-amber-500 flex items-center gap-1 transition-colors uppercase tracking-widest"
                        >
                          Select Route <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Why Choose Us: Editorial Infographic layout */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className="space-y-8">
                    <div className="space-y-3">
                      <p className="text-amber-500 font-mono text-xs uppercase tracking-[0.25em]">Himalayan Excellence</p>
                      <h2 className="text-3xl sm:text-5xl font-serif font-light leading-tight">
                        A higher standard of <br />
                        <span className="italic text-amber-400 font-serif">mountain transport.</span>
                      </h2>
                    </div>

                    <p className="text-white/70 text-sm sm:text-base leading-relaxed">
                      Navigating the hairpin loops of Kumaon and Garhwal is distinct from standard city driving on expressways. Our pilots undergo mandatory defensive driving certifications tailored specifically for high-altitude passes and monsoon conditions.
                    </p>

                    <div className="space-y-4">
                      <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                        <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-[#0F1215] shrink-0 font-bold font-serif shadow-md">
                          1
                        </div>
                        <div>
                          <h4 className="font-serif font-semibold text-white">24/7 Live Emergency GPS Tracking</h4>
                          <p className="text-xs text-white/50 mt-1">Every vehicle has satellite navigation and an SOS emergency panic alert button with instant base coordination.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                        <div className="w-10 h-10 rounded-full bg-[#10b981] flex items-center justify-center text-[#0F1215] shrink-0 font-mono font-bold shadow-md">
                          2
                        </div>
                        <div>
                          <h4 className="font-serif font-semibold text-white">Strict Transparent Fixed Rates</h4>
                          <p className="text-xs text-white/50 mt-1">NO hidden state barrier rates, fuel-hikes, or surprise tourist driver commissions on routes. What we estimate is what you pay.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative h-[450px] rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
                    <img 
                      src="https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&q=80&w=800"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      alt="Uttarakhand mountain passes with clouds in Devbhoomi"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F1215] via-transparent to-transparent" />
                    <div className="absolute bottom-8 left-8 right-8 bg-white/5 backdrop-blur-md border border-white/15 p-6 rounded-2xl">
                      <span className="text-[10px] uppercase tracking-widest text-amber-400 font-mono">PILGRIM REVIEW</span>
                      <p className="text-sm mt-2 italic text-white/90">
                        "The pilot managed Joshimath hairpin bends flawlessly even in sunset fog. He showed us local roadside temples we would have totally passed otherwise."
                      </p>
                      <p className="text-xs mt-3 uppercase font-mono tracking-widest text-white/50">- Vardhan Desai, Pune</p>
                    </div>
                  </div>
                </div>

                {/* FAQ Block */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
                  <div className="text-center space-y-3">
                    <p className="text-amber-500 font-mono text-xs uppercase tracking-widest">HELP DESK</p>
                    <h2 className="text-3xl font-serif font-light">Frequently Asked Questions</h2>
                  </div>

                  <div className="space-y-4">
                    <details className="group bg-white/5 border border-white/10 p-5 rounded-2xl [&_summary::-webkit-details-marker]:hidden">
                      <summary className="flex items-center justify-between cursor-pointer focus:outline-none">
                        <span className="font-serif font-medium text-white text-sm sm:text-base">Is there a late night driving charge on hills?</span>
                        <span className="transition-transform group-open:rotate-180"><X className="w-4 h-4 text-amber-500 rotate-45" /></span>
                      </summary>
                      <p className="text-xs sm:text-sm text-white/60 mt-3 leading-relaxed">
                        For security reasons, driving deep Himalayan roads after 08:30 PM is discouraged by state police guidelines. For transfers, we accommodate flight delays with base clearance but advise starting day routes by 07:00 AM.
                      </p>
                    </details>

                    <details className="group bg-white/5 border border-white/10 p-5 rounded-2xl [&_summary::-webkit-details-marker]:hidden">
                      <summary className="flex items-center justify-between cursor-pointer focus:outline-none">
                        <span className="font-serif font-medium text-white text-sm sm:text-base">Can you organize Kedarnath Helicopter Tickets & VIP darshans?</span>
                        <span className="transition-transform group-open:rotate-180"><X className="w-4 h-4 text-amber-500 rotate-45" /></span>
                      </summary>
                      <p className="text-xs sm:text-sm text-white/60 mt-3 leading-relaxed">
                        Yes! As local travel experts, we assist with helicopter boarding coordinators based at Guptkashi/Phata and support state yatra biometric card registrations seamlessly.
                      </p>
                    </details>

                    <details className="group bg-white/5 border border-white/10 p-5 rounded-2xl [&_summary::-webkit-details-marker]:hidden">
                      <summary className="flex items-center justify-between cursor-pointer focus:outline-none">
                        <span className="font-serif font-medium text-white text-sm sm:text-base">Are all toll taxes, interstate fees, and parking included?</span>
                        <span className="transition-transform group-open:rotate-180"><X className="w-4 h-4 text-amber-500 rotate-45" /></span>
                      </summary>
                      <p className="text-xs sm:text-sm text-white/60 mt-3 leading-relaxed">
                        Yes. All calculated estimates in our Instant Fare Calculator include basic highway toll parameters, green entry taxes, and local border permits to assure a completely upfront pricing transparent model.
                      </p>
                    </details>
                  </div>
                </div>

              </div>
            )}

            {/* 2. FLEET TAB */}
            {currentTab === "fleet" && (
              <div id="fleet-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 animate-fade-in">
                <div className="text-center space-y-4">
                  <p className="text-amber-500 font-mono text-xs uppercase tracking-[0.25em]">HIMALAYAN FLEET SELECTION</p>
                  <h1 className="text-4xl sm:text-5xl font-serif font-light">Premium, Sanitized Vehicles</h1>
                  <p className="text-sm text-white/50 max-w-xl mx-auto">
                    From agile hatchback commuters to powerful 4x4 SUVs and luxurious Tempo cruisers, find transport engineered for comfortable mountain driving.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {fleet.map((car) => (
                    <div key={car.id} className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden flex flex-col hover:border-amber-400/35 transition-all duration-300">
                      
                      {/* Image Frame */}
                      <div className="h-56 relative group overflow-hidden">
                        <img 
                          src={car.image} 
                          alt={car.category} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-4 left-4 bg-[#0F1215]/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400">
                          ¥ Fixed rates
                        </div>
                        <div className="absolute bottom-4 right-4 bg-emerald-600 px-3 py-1 rounded text-[10px] font-bold text-white uppercase font-sans flex items-center gap-1">
                          <Check className="w-3 h-3" /> Sanitised
                        </div>
                      </div>

                      <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="text-xl font-serif font-bold text-white">{car.category}</h3>
                            <div className="flex items-center gap-1 text-[#f59e0b] text-sm">
                              <Star className="w-4 h-4 fill-amber-500 stroke-amber-500" />
                              <span className="font-bold">{car.rating}</span>
                              <span className="text-white/40 text-[11px]">({car.reviewsCount})</span>
                            </div>
                          </div>

                          <p className="text-white/40 font-mono text-xs uppercase tracking-wide">Model Choices: {car.models.join(" • ")}</p>
                          <p className="text-xs text-white/70 leading-relaxed font-light">{car.description}</p>
                        </div>

                        {/* Tech details */}
                        <div className="bg-white/5 rounded-xl p-3 border border-white/5 grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-white/40 block text-[9px] uppercase tracking-wider">Seating Capacity</span>
                            <span className="text-white font-medium">{car.seating}</span>
                          </div>
                          <div>
                            <span className="text-white/40 block text-[9px] uppercase tracking-wider">Base Fare Rate</span>
                            <span className="text-amber-400 font-mono font-bold">₹{car.baseRatePerKm} / Kilometer</span>
                          </div>
                        </div>

                        {/* Features chips */}
                        <div className="flex flex-wrap gap-1.5">
                          {car.features.map((feat, i) => (
                            <span key={i} className="text-[10px] font-semibold bg-white/5 text-white/60 px-2 py-1 rounded-full border border-white/5">
                              {feat}
                            </span>
                          ))}
                        </div>

                        <div className="pt-2">
                          <button
                            onClick={() => {
                              setSelectedVehicleId(car.id);
                              setCurrentTab("home");
                              setTimeout(() => {
                                const el = document.getElementById("booking-calculator-widget");
                                if (el) el.scrollIntoView({ behavior: 'smooth' });
                              }, 150);
                            }}
                            className="w-full bg-[#34d399] hover:bg-emerald-500 text-[#0F1215] font-bold text-xs uppercase tracking-[0.15em] py-3 rounded-xl transition-all"
                          >
                            Select this Cab Class
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. TOUR PACKAGES TAB WITH AI TRIP PLANNER */}
            {currentTab === "packages" && (
              <div id="packages-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 animate-fade-in">
                
                {/* Header info */}
                <div className="text-center space-y-3">
                  <p className="text-amber-500 font-mono text-xs uppercase tracking-[0.25em]">Himalayan Journeys</p>
                  <h1 className="text-4xl sm:text-5xl font-serif font-light">Custom Tour Packages</h1>
                  <p className="text-sm text-white/50 max-w-xl mx-auto">
                    Leave the mountain navigation to our expert pilots. We provide comfortable vehicles, hotel coordination, and customized itineraries.
                  </p>
                </div>

                {/* 🌟 AI TRIP PLANNER SPOTLIGHT SECTION */}
                <div className="bg-gradient-to-r from-[#171A1E] to-[#121519] border border-amber-500/20 rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl" />
                  <div className="absolute -left-10 -bottom-10 w-44 h-44 bg-emerald-500/5 rounded-full blur-3xl" />
                  
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                    
                    {/* Planner inputs Left */}
                    <div className="lg:col-span-5 space-y-6">
                      <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-amber-400">Gemini Generative AI</span>
                      </div>
                      
                      <h2 className="text-2xl sm:text-3xl font-serif text-white">Interactive Custom <span className="italic text-amber-500 font-serif">Himalayan Al Itinerary</span> Maker</h2>
                      <p className="text-xs sm:text-sm text-white/60 leading-relaxed font-light">
                        Enter your journey duration, budget level, and points of interest. Our AI will automatically output a complete, realistic, custom day-by-day map itinerary.
                      </p>

                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <label className="text-[10px] uppercase font-mono text-white/40 block mb-1">Duration (Days)</label>
                          <input 
                            type="number" 
                            min="1" 
                            max="18"
                            value={plannerDays}
                            onChange={(e) => setPlannerDays(parseInt(e.target.value) || 3)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white font-mono focus:border-amber-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-mono text-white/40 block mb-1">Budget Standard</label>
                          <select 
                            value={plannerBudget}
                            onChange={(e) => setPlannerBudget(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white focus:border-amber-500"
                          >
                            <option className="bg-[#15181c]" value="Budget">Budget (Hatchback)</option>
                            <option className="bg-[#15181c]" value="Standard">Standard (Sedan)</option>
                            <option className="bg-[#15181c]" value="Luxury">Luxury (Innova SUV)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-mono text-white/40 block mb-1">Special Interests / Shrine targets</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Kedarnath Trekking, Rishikesh river rafting, Mussoorie snow"
                          value={plannerInterests}
                          onChange={(e) => setPlannerInterests(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-mono text-white/40 block mb-1">Traveler Breakdown</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Parents (Senior Citizens), Honeymoon Couple, 5 Friends"
                          value={plannerTravelers}
                          onChange={(e) => setPlannerTravelers(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-amber-500"
                        />
                      </div>

                      <button 
                        onClick={handleGenerateAIItinerary}
                        disabled={planningAI}
                        className="w-full bg-amber-500 hover:bg-amber-400 text-[#0F1215] font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                      >
                        {planningAI ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Mapping Mountain Guides...</span>
                          </>
                        ) : (
                          <>
                            <Compass className="w-4 h-4 animate-spin-slow" />
                            <span>Synthesize AI Tour Plan</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Planner Output Right */}
                    <div className="lg:col-span-7 h-full flex flex-col justify-between">
                      {plannedItinerary ? (
                        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-4 animate-fade-in text-xs">
                          <div className="flex flex-wrap justify-between items-center gap-2 border-b border-white/10 pb-3">
                            <div>
                              <span className="text-[9px] uppercase tracking-wider text-amber-500 font-mono">PROPOSED OUTSTANDING TOUR</span>
                              <h3 className="text-lg font-serif font-bold text-white">{plannedItinerary.routeName}</h3>
                            </div>
                            <div className="text-right">
                              <span className="text-[9px] uppercase tracking-wider text-white/40 font-mono block">Estimated Taxi Cost</span>
                              <span className="text-amber-400 font-mono text-base font-bold">{plannedItinerary.totalEstimatedFuelFare}</span>
                            </div>
                          </div>

                          <div className="flex gap-4 text-[11px] bg-white/5 p-2 rounded-lg border border-white/5">
                            <span className="text-white/40">🚘 Recommend Car:</span>
                            <span className="text-white font-medium">{plannedItinerary.recommendedVehicle}</span>
                          </div>

                          <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-2">
                            {plannedItinerary.itinerary.map((dayPlan) => (
                              <div key={dayPlan.day} className="border-l-2 border-amber-500/50 pl-3 py-0.5 space-y-1">
                                <span className="font-mono text-[10px] font-bold text-amber-500">DAY {dayPlan.day}: {dayPlan.title}</span>
                                <p className="text-[10px] text-white/40 font-semibold">{dayPlan.route}</p>
                                <ul className="list-disc pl-4 text-white/75 text-[11px] space-y-0.5">
                                  {dayPlan.activities.map((act, idx) => (
                                    <li key={idx}>{act}</li>
                                  ))}
                                </ul>
                                <p className="text-[10px] text-emerald-400 italic">💡 Insider Guideline: {dayPlan.insiderTip}</p>
                              </div>
                            ))}
                          </div>

                          <div className="bg-amber-500/5 p-3 rounded-lg border border-amber-500/10 text-amber-400 text-[10px]">
                            <span className="font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-amber-500" />
                              HIMALAYAN SAFETY DIRECTIVE:
                            </span>
                            <p className="mt-1 font-light leading-relaxed">{plannedItinerary.geographicalAlerts}</p>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setPickupInput(plannedItinerary.itinerary[0]?.route.split("➔")[0]?.trim() || "Dehradun Airport (DED)");
                                setDropInput(plannedItinerary.itinerary[plannedItinerary.itinerary.length - 1]?.route.split("➔")[1]?.trim() || "Haridwar Temple Ghati");
                                setBookingFormData(prev => ({
                                  ...prev,
                                  specialNotes: `AI Recommended Route: ${plannedItinerary.routeName}. Budget style chosen: ${plannerBudget}`
                                }));
                                setShowBookingModal(true);
                              }}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-lg text-xs uppercase"
                            >
                              Confirm and Lock in State Permit Booking
                            </button>
                            
                            <button
                              onClick={() => {
                                setPlannedItinerary(null);
                              }}
                              className="bg-white/5 hover:bg-white/10 text-white p-2.5 rounded-lg text-xs"
                            >
                              Reset
                            </button>
                          </div>

                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-12 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                          <Compass className="w-12 h-12 text-white/20 mb-3 animate-spin-slow" />
                          <h4 className="font-serif text-[#F9F7F2] font-semibold">Ready for Custom Planning</h4>
                          <p className="text-white/40 text-xs max-w-sm mt-1">
                            Click the "Synthesize AI Tour Plan" button. The generative framework checks mountain pass accessibility updates and compiles high-precision itineraries instantly.
                          </p>
                        </div>
                      )}
                    </div>

                  </div>
                </div>

                {/* Grid listing pre-made packages */}
                <div className="space-y-6">
                  <h2 className="text-2xl font-serif text-white">Classic Pre-designed Routes</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {packages.map((pkg) => (
                      <div key={pkg.id} className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden flex flex-col justify-between hover:border-amber-400/25 transition-all">
                        
                        {/* Image banner */}
                        <div className="h-48 relative">
                          <img 
                            src={pkg.image} 
                            alt={pkg.title} 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-4 left-4 bg-amber-500 font-mono text-[9px] uppercase tracking-widest text-[#0F1215] px-2.5 py-1 rounded font-bold">
                            {pkg.category}
                          </div>
                          <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded text-xs font-serif text-amber-400 font-bold">
                            {pkg.duration}
                          </div>
                        </div>

                        {/* Description content */}
                        <div className="p-6 space-y-4 flex-grow flex flex-col justify-between">
                          <div className="space-y-2">
                            <h3 className="font-serif text-lg font-bold leading-tight text-white">{pkg.title}</h3>
                            <p className="text-[11px] font-mono text-[#10b981]">{pkg.route}</p>
                            <p className="text-xs text-white/50 leading-relaxed font-light">{pkg.description}</p>
                          </div>

                          {/* Highlights List */}
                          <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                            <span className="text-[9px] font-mono uppercase tracking-widest text-white/40">Journey Highlights:</span>
                            <ul className="list-disc pl-4 text-[11px] text-white/75 mt-1.5 space-y-1">
                              {pkg.highlights.map((hlt, i) => (
                                <li key={i}>{hlt}</li>
                              ))}
                            </ul>
                          </div>

                          {/* Action footer */}
                          <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                            <div>
                              <span className="text-[9px] text-white/40 uppercase block">Starting Fare Package</span>
                              <span className="text-lg font-mono font-bold text-amber-500">₹{pkg.startingPrice.toLocaleString()}</span>
                            </div>

                            <button
                              onClick={() => {
                                setPickupInput(pkg.route.split("➔")[0]?.trim() || "Haridwar Railway Station");
                                setDropInput(pkg.route.split("➔")[pkg.route.split("➔").length - 1]?.trim() || "Haridwar Temple Ghati");
                                setBookingFormData(prev => ({
                                  ...prev,
                                  bookingType: "Tour Packages",
                                  specialNotes: `Booked specific pre-designed package: ${pkg.title}`
                                }));
                                setShowBookingModal(true);
                              }}
                              className="bg-white/10 hover:bg-amber-500 hover:text-[#0F1215] text-[#F9F7F2] font-semibold text-xs tracking-wide px-4 py-2.5 rounded-lg transition-all"
                            >
                              Select Package
                            </button>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* 4. CUSTOMER CABIN & LOYALTY */}
            {currentTab === "customer" && (
              <div id="customer-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 animate-fade-in">
                <div className="text-center space-y-3">
                  <p className="text-amber-500 font-mono text-xs uppercase tracking-[0.25em]">CUSTOMER CABIN & WALLET</p>
                  <h1 className="text-4xl sm:text-5xl font-serif font-light">My Tour Dashboard</h1>
                  <p className="text-sm text-white/50 max-w-xl mx-auto">
                    Track your active mountain drives, review your pilot allocations, make real payments, and check your Himalayan travel reward miles.
                  </p>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Reward Miles Card */}
                  <div className="bg-gradient-to-r from-amber-500/10 to-amber-500/5 border border-amber-500/20 rounded-3xl p-6 relative">
                    <Award className="absolute top-6 right-6 w-8 h-8 text-amber-500" />
                    <span className="text-[10px] font-mono text-white/40 uppercase block tracking-widest">Travel loyalty rewards</span>
                    <h3 className="text-3xl font-mono font-bold text-amber-500 mt-2">{loyaltyPoints} Points</h3>
                    <p className="text-xs text-white/60 mt-2 font-light">Accruing 2.5 points per kilometer Traveled. Redeemable against upcoming Hemkund or Auli packages.</p>
                  </div>

                  {/* Wallet Card */}
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 relative">
                    <Clock className="absolute top-6 right-6 w-8 h-8 text-emerald-500" />
                    <span className="text-[10px] font-mono text-white/40 uppercase block tracking-widest">Devbhoomi Wallet Balance</span>
                    <h3 className="text-3xl font-mono font-bold text-white mt-2">₹{walletBalance} INR</h3>
                    <p className="text-xs text-white/60 mt-2 font-light">Stored credits for easy toll charges, driver tips, or local temple pooja bookings.</p>
                  </div>

                  {/* Active Shrines Bookings Count */}
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 relative">
                    <Compass className="absolute top-6 right-6 w-8 h-8 text-blue-500" />
                    <span className="text-[10px] font-mono text-white/40 uppercase block tracking-widest">Active Ride Logs</span>
                    <h3 className="text-3xl font-mono font-bold text-white mt-2">{bookings.length} Registered</h3>
                    <p className="text-xs text-white/60 mt-2 font-light">Including upcoming airport connections and mountain Dham pilgrimage tracks.</p>
                  </div>

                </div>

                {/* Interactive Bookings Table */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-serif text-white">Your Booked Taxi/Cab List</h2>
                  
                  <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden p-6 space-y-4">
                    {bookings.length === 0 ? (
                      <p className="text-xs text-white/40 text-center py-6 font-mono uppercase tracking-widest">No active rides booked. Use the calculator above!</p>
                    ) : (
                      <div className="space-y-6">
                        {bookings.map((bk) => (
                          <div key={bk.id} className="border-b border-white/5 pb-6 last:border-b-0 last:pb-0 grid grid-cols-1 lg:grid-cols-4 gap-6 items-center text-xs">
                            
                            {/* Trip basics */}
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] uppercase font-mono font-bold bg-amber-500 text-slate-900 px-2 py-0.5 rounded">
                                  {bk.id}
                                </span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-mono ${
                                  bk.status === "Confirmed" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                                }`}>
                                  {bk.status}
                                </span>
                              </div>
                              <p className="font-serif font-bold text-base text-white mt-1.5">{bk.pickupLocation} ➔</p>
                              <p className="font-serif font-bold text-sm text-amber-500">{bk.dropLocation}</p>
                              <p className="text-white/40 text-[10px] uppercase font-mono mt-1">Booked on: {new Date(bk.createdDate).toLocaleDateString()}</p>
                            </div>

                            {/* Date, Vehicle and Specs */}
                            <div className="space-y-1">
                              <p className="text-white/40 block text-[9px] uppercase tracking-wider">Date & Passengers</p>
                              <p className="font-medium text-white flex items-center gap-1.5">
                                <Calendar className="w-4 h-4 text-white/40" /> {bk.pickupDate} ({bk.pickupTime})
                              </p>
                              <p className="text-white/70">Vehicle Class: <span className="font-mono font-bold text-white">{bk.vehicleType}</span></p>
                              <p className="text-white/50">{bk.passengers} Passengers travelers</p>
                            </div>

                            {/* Pilot and Cab status */}
                            <div className="space-y-2 bg-white/5 p-3 rounded-2xl border border-white/5">
                              <span className="text-[9px] uppercase font-mono text-white/40 block">Assigned Mountain Pilot</span>
                              {bk.driverVerified ? (
                                <div className="space-y-1">
                                  <p className="font-semibold text-emerald-400 flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> {bk.driverName}
                                  </p>
                                  <p className="text-[11px] font-mono text-white/70">{bk.driverPhone}</p>
                                  <p className="text-[9px] text-[#34d399] uppercase font-mono tracking-widest">★ 4.9 Verified Pilot</p>
                                </div>
                              ) : (
                                <div>
                                  <p className="text-white/40 italic">Awaiting Pilot Allocation</p>
                                  <p className="text-[10px] text-amber-500 mt-1">Pending allocation before dispatch</p>
                                </div>
                              )}
                            </div>

                            {/* Invoice details and mock payment actions */}
                            <div className="text-left lg:text-right space-y-2">
                              <div>
                                <span className="text-[11px] text-white/40 block">Total Est. Quote</span>
                                <span className="text-2xl font-mono font-bold text-white">₹{bk.estimatedFare}</span>
                              </div>
                              <div className="flex flex-wrap lg:justify-end gap-2">
                                <button
                                  onClick={() => {
                                    alert(`DEDICATED E-TICKET RECIEPT\nBooking Ref: ${bk.id}\nLead Traveler: ${bk.customerName}\nVehicle: ${bk.vehicleType}\nEst. Amt: ₹${bk.estimatedFare}\n\nThis trip is registered on Government green tax logs for yatra entrance clearance.`);
                                  }}
                                  className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-[10px] uppercase px-3 py-1.5 rounded"
                                >
                                  E-Ticket Receipt
                                </button>

                                <button
                                  onClick={() => {
                                    alert("REDIRECTING SIMULATED UPI CLEARANCE GATEWAY\n\nStarting PhonePe/Razorpay API handshake sequence.\nTransaction value of ₹" + bk.estimatedFare + " for " + bk.id + " validated successfully!");
                                  }}
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] uppercase px-3 py-1.5 rounded"
                                >
                                  Pay via UPI
                                </button>
                              </div>
                            </div>

                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit verified feedback */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className="space-y-4">
                    <h2 className="text-2xl font-serif text-white">Share Your Mountain Experience</h2>
                    <p className="text-xs sm:text-sm text-white/50 leading-relaxed font-light">
                      Your reviews are written back to our secure Node server memory, helping fellow pilgrims and travellers select reliable routes and pilots.
                    </p>

                    <form onSubmit={submitReview} className="space-y-4 bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] uppercase font-mono text-white/50 block mb-1">Your Name</label>
                          <input 
                            type="text"
                            required
                            placeholder="e.g. Meenakshi Desai"
                            value={newReviewForm.userName}
                            onChange={(e) => setNewReviewForm({...newReviewForm, userName: e.target.value})}
                            className="bg-white/5 border border-white/10 rounded-lg p-2.5 w-full text-xs text-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-mono text-white/50 block mb-1">Route Taken</label>
                          <input 
                            type="text"
                            placeholder="e.g. Kedarnath Spiritual escape"
                            value={newReviewForm.verifiedTrip}
                            onChange={(e) => setNewReviewForm({...newReviewForm, verifiedTrip: e.target.value})}
                            className="bg-white/5 border border-white/10 rounded-lg p-2.5 w-full text-xs text-white focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] uppercase font-mono text-white/50 block mb-1">Satisfaction Rating</label>
                          <select
                            value={newReviewForm.rating}
                            onChange={(e) => setNewReviewForm({...newReviewForm, rating: parseInt(e.target.value) || 5})}
                            className="bg-white/5 border border-white/10 rounded-lg p-2.5 w-full text-xs text-white focus:outline-none"
                          >
                            <option className="bg-[#15181c]" value="5">★★★★★ Outstanding (5/5)</option>
                            <option className="bg-[#15181c]" value="4">★★★★ Excellent (4/5)</option>
                            <option className="bg-[#15181c]" value="3">★★★ Average (3/5)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-mono text-white/50 block mb-1">Review Comments</label>
                        <textarea 
                          rows={3}
                          required
                          placeholder="Tell pilgrims about your driver, the vehicle condition, the climbing safety and timings..."
                          value={newReviewForm.text}
                          onChange={(e) => setNewReviewForm({...newReviewForm, text: e.target.value})}
                          className="bg-white/5 border border-white/10 rounded-lg p-2.5 w-full text-xs text-white focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={postingReview}
                        className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold tracking-widest text-xs uppercase py-3 px-8 rounded-xl w-full transition-all"
                      >
                        {postingReview ? "Posting verified logs..." : "Submit Travel Log Review"}
                      </button>
                    </form>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-xl font-serif text-white flex items-center gap-2">
                      <Star className="w-5 h-5 fill-amber-500 stroke-amber-500" />
                      Recent Verified Guest Reviews
                    </h3>
                    
                    <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2">
                      {reviews.map((rev) => (
                        <div key={rev.id} className="bg-white/5 border border-white/10 p-4 rounded-2xl relative text-xs space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-serif font-bold text-white text-sm">{rev.userName}</span>
                            <span className="text-[10px] text-white/40 font-mono">{rev.date}</span>
                          </div>

                          <div className="flex gap-1 text-amber-500">
                            {Array.from({ length: rev.rating }).map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-amber-500 stroke-amber-500" />
                            ))}
                          </div>

                          <p className="text-white/70 leading-relaxed font-light">{rev.text}</p>
                          
                          {rev.verifiedTrip && (
                            <div className="text-[10px] font-mono text-emerald-400 font-semibold">
                              ✓ Verified Route: {rev.verifiedTrip}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* 5. DRIVER CONSOLE PORTAL */}
            {currentTab === "driver" && (
              <div id="driver-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 animate-fade-in">
                
                <div className="text-center space-y-3">
                  <p className="text-amber-500 font-mono text-xs uppercase tracking-[0.25em]">MOUNTAIN PILOT DASHBOARD</p>
                  <h1 className="text-4xl sm:text-5xl font-serif font-light">Driver console</h1>
                  <p className="text-sm text-white/50 max-w-xl mx-auto">
                    Simulate mountain pilot check-in. Change online visibility, toggle yatra routes, and calculate estimated daily mountain allowances.
                  </p>
                </div>

                {/* Pilot details block */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
                  
                  {/* Driver summary card column */}
                  <div className="md:col-span-4 bg-white/5 border border-white/10 rounded-3xl p-6 relative flex flex-col justify-between">
                    <div className="space-y-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] uppercase font-mono tracking-widest text-amber-500 font-bold block">Mountain Pilot</span>
                          <h3 className="text-2xl font-serif font-medium text-[#F9F7F2] mt-1">Sohan Singh Negi</h3>
                          <p className="text-white/40 text-[11px] font-mono">ID ref: PL-9128 • Grade A+</p>
                        </div>
                        <img 
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
                          alt="Pilot Negi avatar"
                          className="w-14 h-14 rounded-full object-cover border border-white/20"
                        />
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between border-b border-white/5 py-1">
                          <span className="text-white/40">Home Depot Base</span>
                          <span className="text-white font-medium">Dehradun Depot</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 py-1">
                          <span className="text-white/40">Assigned Vehicle</span>
                          <span className="text-white font-medium font-mono">Swift Dzire (UK07-CB-9002)</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 py-1">
                          <span className="text-white/40">Daily Travel limit</span>
                          <span className="text-[#34d399] font-medium font-mono">300 km daily max</span>
                        </div>
                      </div>

                      {/* Online offline toggle controls */}
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] uppercase tracking-wider text-white/40 font-semibold font-mono">Online Duty Status</span>
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full animate-ping ${driverOnline ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            <span className={`text-[11px] font-bold font-mono ${driverOnline ? 'text-emerald-400' : 'text-red-400'}`}>
                              {driverOnline ? "ONLINE" : "OFFLINE"}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setDriverOnline(!driverOnline);
                            if (driverOnline) {
                              setDriverDutyStatus("Resting - Out of Duty");
                            } else {
                              setDriverDutyStatus("Awaiting Next Trip");
                            }
                          }}
                          className={`w-full text-xs font-bold uppercase tracking-wider py-2.5 rounded-lg border transition-all ${
                            driverOnline 
                              ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20" 
                              : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                          }`}
                        >
                          Toggle {driverOnline ? "Go Offline Check-out" : "Go Online Check-in"}
                        </button>
                      </div>

                    </div>

                    <div className="pt-6 border-t border-white/5 space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-white/40">Today's Pilot Earnings</span>
                        <span className="font-mono text-base font-bold text-[#f59e0b]">₹{driverEarnings}</span>
                      </div>
                      <p className="text-[10px] text-[#34d399]">🏆 You gained +250 points mountain safety bonus today.</p>
                    </div>

                  </div>

                  {/* Active Ride dispatch details column */}
                  <div className="md:col-span-8 bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 flex flex-col justify-between">
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b border-white/5">
                        <span className="text-sm font-serif text-white">Next Assigned Dispatch Dispatch</span>
                        <span className="font-mono text-xs text-[#34d399] uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {driverDutyStatus}
                        </span>
                      </div>

                      {driverOnline ? (
                        <div className="space-y-6 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div>
                              <span className="text-[9px] uppercase tracking-wider text-white/40 block">Customer Name</span>
                              <span className="font-serif font-bold text-white text-base">Rakesh Sharma</span>
                              <span className="text-white/50 block font-mono mt-0.5">+91 98765 43210</span>
                            </div>
                            <div>
                              <span className="text-[9px] uppercase tracking-wider text-white/40 block">Scheduled Pickup</span>
                              <span className="text-white font-semibold block text-sm">2026-06-25 at 14:30 hrs</span>
                              <span className="text-amber-500 block">Dehradun Airport (DED) Arrival terminal</span>
                            </div>
                          </div>

                          <div className="border-t border-white/5 pt-4 space-y-2 text-xs">
                            <span className="text-[10px] uppercase font-mono tracking-widest text-[#34d399] block">GPS Navigation Coordinates</span>
                            <p className="text-white/70">Route: <span className="text-white font-medium">Jolly Grant bypass ➔ Tapovan Chatti ➔ Haridwar Ganga Ghats (42 km)</span></p>
                            
                            <div className="flex gap-2 pt-2.5">
                              <a
                                href="https://maps.google.com"
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 text-center bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-2 rounded-lg text-xs tracking-wider uppercase flex items-center justify-center gap-1.5"
                              >
                                <ExternalLink className="w-3.5 h-3.5" /> Google Maps Navigate
                              </a>

                              <button
                                onClick={() => {
                                  alert("System dispatch confirmation SMS sent via server gateway to Rakesh Sharma.");
                                }}
                                className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-2 rounded-lg text-xs uppercase"
                              >
                                Dispatch SMS Alert
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="py-12 text-center text-xs text-white/30 font-mono uppercase tracking-widest">
                          🛡️ You are currently offline. Please turn duty status 'ONLINE' to inspect queue.
                        </div>
                      )}
                    </div>

                    {/* Operational Safety Protocols */}
                    <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl text-[11px] text-amber-500 space-y-1.5 ">
                      <span className="font-bold uppercase tracking-wider font-mono">Himalayan Pilot Safety protocol:</span>
                      <p className="font-light leading-relaxed">
                        1. High Altitude Hairpins require mandatory speed ceiling of 40 km/hr in monsoons.<br />
                        2. Respect the elderly devotees traveling. Offer extra rest stopovers inside Rishikesh-Guptkashi highway dhabas.
                      </p>
                    </div>

                  </div>

                </div>

              </div>
            )}

            {/* 6. ADMIN DESK PANEL */}
            {currentTab === "admin" && (
              <div id="admin-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 animate-fade-in">
                
                <div className="text-center space-y-3">
                  <p className="text-amber-500 font-mono text-xs uppercase tracking-[0.25em]">ADMIN BACKOFFICE CABIN</p>
                  <h1 className="text-4xl sm:text-5xl font-serif font-light">Central Control Console</h1>
                  <p className="text-sm text-white/50 max-w-xl mx-auto">
                    Manage active guest bookings, allocate mountain drivers, inject custom new tours, and review live operations statistics.
                  </p>
                </div>

                {/* Statistical overview row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-xs font-mono">
                    <span className="text-white/40 uppercase block">Est Total Revenue</span>
                    <span className="text-2xl font-bold text-white mt-1.5 block">₹89,450</span>
                    <span className="text-emerald-400 block text-[10px] mt-1">✓ Live GST ledger</span>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-xs font-mono">
                    <span className="text-white/40 uppercase block">Cabs Allocated</span>
                    <span className="text-2xl font-bold text-white mt-1.5 block">14 Cabs</span>
                    <span className="text-[#34d399] block text-[10px] mt-1">● 9 Pilot shifts online</span>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-xs font-mono">
                    <span className="text-white/40 uppercase block">Active Database Entries</span>
                    <span className="text-2xl font-bold text-white mt-1.5 block">{bookings.length} Bookings</span>
                    <span className="text-amber-500 block text-[10px] mt-1">★ 100% cloud persisted</span>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-xs font-mono">
                    <span className="text-white/40 uppercase block">Current Rating Index</span>
                    <span className="text-2xl font-bold text-white mt-1.5 block">4.92 / 5</span>
                    <span className="text-[#a855f7] block text-[10px] mt-1">✓ ISO 9001 Certified</span>
                  </div>

                </div>

                {/* Main Admin layout: Left list, Right inject custom tour package form */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Table: Bookings */}
                  <div className="lg:col-span-8 bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                      <h3 className="text-lg font-serif text-white">Live Booking Logs Registry</h3>
                      <button 
                        onClick={fetchInitialData}
                        className="p-1 px-3 text-[10px] font-mono uppercase bg-white/5 border border-white/10 rounded hover:bg-white/15 text-white flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3 animate-spin-slow" /> Sync Server Logs
                      </button>
                    </div>

                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                      {bookings.map((book) => (
                        <div key={book.id} className="bg-white/5 p-4 rounded-2xl text-xs space-y-3 border border-white/5 hover:border-white/10">
                          
                          <div className="flex flex-wrap justify-between items-center gap-2">
                            <div>
                              <span className="font-mono text-amber-500 font-bold text-[13px]">{book.id}</span>
                              <span className="text-white/40 font-mono ml-2">({book.bookingType})</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded font-mono text-[9px] uppercase tracking-wider ${
                                book.status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-500'
                              }`}>
                                {book.status}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px]">
                            <div>
                              <p className="text-white/40 uppercase font-mono text-[9px]">Lead Guest / Route</p>
                              <p className="text-white font-bold">{book.customerName} ({book.customerPhone})</p>
                              <p className="text-amber-500 mt-1">{book.pickupLocation} ➔ {book.dropLocation}</p>
                            </div>
                            <div>
                              <p className="text-white/40 uppercase font-mono text-[9px]">Trip Details & Car</p>
                              <p className="text-white">Date: {book.pickupDate} ({book.pickupTime}) | {book.passengers} pax</p>
                              <p className="text-white/50">Car Class: <span className="text-white font-mono">{book.vehicleType}</span></p>
                            </div>
                          </div>

                          {book.specialNotes && (
                            <p className="text-[10px] text-white/40 italic bg-white/5 p-2 rounded border border-white/5">
                              Note: {book.specialNotes}
                            </p>
                          )}

                          {/* Action button options */}
                          <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                            {book.status !== "Confirmed" && (
                              <button
                                onClick={() => handleAdminUpdateStatus(book.id, "Confirmed")}
                                className="bg-[#10b981]/20 hover:bg-[#10b981] text-emerald-300 hover:text-slate-900 border border-[#10b981]/30 font-bold px-3 py-1 rounded text-[10px] uppercase transition-all"
                              >
                                Approve & Assign pilot Negi
                              </button>
                            )}
                            
                            {book.status !== "Cancelled" && (
                              <button
                                onClick={() => handleAdminUpdateStatus(book.id, "Cancelled")}
                                className="bg-red-500/15 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 px-3 py-1 rounded text-[10px] uppercase transition-all"
                              >
                                Cancel Trip
                              </button>
                            )}

                            <button
                              onClick={() => {
                                const txt = encodeURIComponent(`Hello ${book.customerName}, Devbhoomi Cabs confirmed your Booking ID: ${book.id}. Total fare quote is ₹${book.estimatedFare}.`);
                                window.open(`https://wa.me/919412000000?text=${txt}`);
                              }}
                              className="ml-auto bg-white/5 hover:bg-white/10 text-white px-3 py-1 rounded text-[10px] uppercase border border-white/10 font-mono"
                            >
                              Dispatch SMS to Whatsapp
                            </button>
                          </div>

                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right inject package form */}
                  <div className="lg:col-span-4 bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                    <h3 className="text-lg font-serif text-white border-b border-white/5 pb-2">Load Custom New Package</h3>
                    
                    {adminNotify && (
                      <div className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs rounded text-center">
                        {adminNotify}
                      </div>
                    )}

                    <form onSubmit={handleAdminCreatePackage} className="space-y-4 text-xs">
                      <div>
                        <label className="text-[10px] uppercase font-mono text-white/50 block mb-1">Package Title title</label>
                        <input 
                          type="text" 
                          required
                          placeholder="e.g. Do Dham Shrines Spiritual Tour"
                          value={adminPkgForm.title}
                          onChange={(e) => setAdminPkgForm({...adminPkgForm, title: e.target.value})}
                          className="bg-white/5 border border-white/10 rounded p-2 w-full text-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] uppercase font-mono text-white/50 block mb-1">Duration text</label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. 5 Days / 4 Nights"
                            value={adminPkgForm.duration}
                            onChange={(e) => setAdminPkgForm({...adminPkgForm, duration: e.target.value})}
                            className="bg-white/5 border border-white/10 rounded p-2 w-full text-white text-[11px]"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-mono text-white/50 block mb-1">Starting Price Price</label>
                          <input 
                            type="number" 
                            required
                            placeholder="INR e.g. 16500"
                            value={adminPkgForm.startingPrice}
                            onChange={(e) => setAdminPkgForm({...adminPkgForm, startingPrice: e.target.value})}
                            className="bg-white/5 border border-white/10 rounded p-2 w-full text-white text-[11px]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-mono text-white/50 block mb-1">Package Category</label>
                        <select
                          value={adminPkgForm.category}
                          onChange={(e) => setAdminPkgForm({...adminPkgForm, category: e.target.value})}
                          className="bg-white/5 border border-white/10 rounded p-2 w-full text-white text-[11px]"
                        >
                          <option className="bg-[#15181c]" value="Pilgrimage">Pilgrimage (Shrines)</option>
                          <option className="bg-[#15181c]" value="Hill Station">Hill Station</option>
                          <option className="bg-[#15181c]" value="Wildlife">Wildlife Forest</option>
                          <option className="bg-[#15181c]" value="Adventure">Adventure Trekking</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-mono text-white/50 block mb-1">Geographical Route</label>
                        <input 
                          type="text" 
                          placeholder="Haridwar ➔ Rishikesh ➔ Joshimath"
                          value={adminPkgForm.route}
                          onChange={(e) => setAdminPkgForm({...adminPkgForm, route: e.target.value})}
                          className="bg-white/5 border border-white/10 rounded p-2 w-full text-white"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-mono text-white/50 block mb-1">Key highlights (separating with commas)</label>
                        <input 
                          type="text" 
                          placeholder="Experienced hill pilot, VIP temple access, Daily weather updates"
                          value={adminPkgForm.highlights}
                          onChange={(e) => setAdminPkgForm({...adminPkgForm, highlights: e.target.value})}
                          className="bg-white/5 border border-white/10 rounded p-2 w-full text-white"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-mono text-white/50 block mb-1">Short Description</label>
                        <textarea 
                          rows={2}
                          placeholder="Explain tourist benefits and security measures..."
                          value={adminPkgForm.description}
                          onChange={(e) => setAdminPkgForm({...adminPkgForm, description: e.target.value})}
                          className="bg-white/5 border border-white/10 rounded p-2 w-full text-white focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-amber-500 hover:bg-amber-400 text-[#0F1215] font-bold tracking-widest text-xs uppercase py-3 rounded-xl transition-all"
                      >
                        Publish Tour Package Live
                      </button>
                    </form>
                  </div>

                </div>

              </div>
            )}

          </div>
        )}
      </main>

      {/* 🌟 MOCK BOOKING DIALOG WINDOW (Triggered upon selecting a calculated cab class) */}
      {showBookingModal && (
        <div id="booking-modal-outer" className="fixed inset-0 bg-[#0F1215]/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#15181C] border border-white/15 max-w-lg w-full rounded-3xl p-6 sm:p-8 space-y-6 relative animate-scale-in max-h-[90vh] overflow-y-auto">
            
            <button 
              onClick={() => {
                setShowBookingModal(false);
                setSuccessBookingReceipt(null);
              }}
              className="absolute top-5 right-5 text-white/40 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {successBookingReceipt ? (
              <div className="text-center space-y-4 py-4 text-xs">
                <div className="w-14 h-14 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                
                <h3 className="text-xl font-serif text-white">Pranam! Booked Successfully</h3>
                <p className="text-white/60 leading-relaxed font-light">
                  Your customized ride request has been lodged in central Uttarakhand regional database logs.
                </p>

                <div className="bg-white/5 rounded-2xl p-4 text-left border border-white/5 space-y-2 mt-2 font-mono text-[11px]">
                  <div className="flex justify-between"><span className="text-white/40">E-Ticket Ref</span> <span className="text-amber-500 font-bold">{successBookingReceipt.id}</span></div>
                  <div className="flex justify-between"><span className="text-white/40">Lead Guest</span> <span className="text-white">{successBookingReceipt.customerName}</span></div>
                  <div className="flex justify-between"><span className="text-white/40">Pickup Address</span> <span className="text-white text-right">{successBookingReceipt.pickupLocation}</span></div>
                  <div className="flex justify-between"><span className="text-white/40">Drop Address</span> <span className="text-amber-400 text-right">{successBookingReceipt.dropLocation}</span></div>
                  <div className="flex justify-between"><span className="text-white/40">Taxi Class Requested</span> <span className="text-white">{successBookingReceipt.vehicleType}</span></div>
                  <div className="flex justify-between"><span className="text-white/40">Date & Time</span> <span className="text-white">{successBookingReceipt.pickupDate} ({successBookingReceipt.pickupTime})</span></div>
                  <div className="flex justify-between border-t border-white/10 pt-2 font-bold font-sans text-xs">
                    <span className="text-white">Calculated Quote Amt</span> 
                    <span className="text-amber-500">₹{successBookingReceipt.estimatedFare}</span>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-4">
                  <button
                    onClick={() => {
                      setShowBookingModal(false);
                      setSuccessBookingReceipt(null);
                      setCurrentTab("customer");
                    }}
                    className="flex-grow bg-amber-500 text-slate-900 font-bold py-3 rounded-lg text-xs uppercase"
                  >
                    Go Inspect Customer Cabin
                  </button>
                  <button
                    onClick={() => {
                      const txt = encodeURIComponent(`Hi, I just locked in booking ${successBookingReceipt.id} from ${successBookingReceipt.pickupLocation} to ${successBookingReceipt.dropLocation} via your app.`);
                      window.open(`https://wa.me/919412000000?text=${txt}`);
                    }}
                    className="bg-emerald-600 text-white font-bold px-4 py-3 rounded-lg text-xs uppercase"
                  >
                    WhatsApp Pilot
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateBooking} className="space-y-4">
                
                <div className="border-b border-white/10 pb-3">
                  <span className="text-[10px] uppercase tracking-widest text-[#34d399] font-mono font-bold block">Uttarakhand transport registry</span>
                  <h3 className="text-xl font-serif text-white mt-1">Confirm Personal Booking Details</h3>
                  <div className="text-[11px] text-white/50 mt-1">
                    Route selected: <span className="text-amber-400 font-serif font-bold">{pickupInput} ➔ {dropInput}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-[10px] uppercase text-white/40 block mb-1">Lead Traveler Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Rakesh Sharma"
                      value={bookingFormData.customerName}
                      onChange={(e) => setBookingFormData({...bookingFormData, customerName: e.target.value})}
                      className="bg-white/5 border border-white/10 p-2.5 w-full rounded focus:outline-none text-white focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase text-white/40 block mb-1">Mobile Hotline (OTP/WhatsApp)</label>
                    <input 
                      type="tel" 
                      required
                      placeholder="e.g. +91 94120 12345"
                      value={bookingFormData.customerPhone}
                      onChange={(e) => setBookingFormData({...bookingFormData, customerPhone: e.target.value})}
                      className="bg-white/5 border border-white/10 p-2.5 w-full rounded focus:outline-none text-white focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-[10px] uppercase text-white/40 block mb-1">Journey Date</label>
                    <input 
                      type="date" 
                      required
                      value={bookingFormData.pickupDate}
                      onChange={(e) => setBookingFormData({...bookingFormData, pickupDate: e.target.value})}
                      className="bg-white/5 border border-white/10 p-2.5 w-full rounded focus:outline-none text-white focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase text-white/40 block mb-1">Pickup Time</label>
                    <input 
                      type="time" 
                      required
                      value={bookingFormData.pickupTime}
                      onChange={(e) => setBookingFormData({...bookingFormData, pickupTime: e.target.value})}
                      className="bg-white/5 border border-white/10 p-2.5 w-full rounded focus:outline-none text-white focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-[10px] uppercase text-white/40 block mb-1">Number of Passengers</label>
                    <input 
                      type="number" 
                      min="1"
                      max="26"
                      required
                      value={bookingFormData.passengers}
                      onChange={(e) => setBookingFormData({...bookingFormData, passengers: parseInt(e.target.value) || 4})}
                      className="bg-white/5 border border-white/10 p-2.5 w-full rounded focus:outline-none text-white focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase text-white/40 block mb-1">Booking Category</label>
                    <select
                      value={bookingFormData.bookingType}
                      onChange={(e) => setBookingFormData({...bookingFormData, bookingType: e.target.value})}
                      className="bg-white/5 border border-white/10 p-2.5 w-full rounded focus:outline-none text-white focus:border-amber-500"
                    >
                      <option className="bg-[#15181c]">Airport Transfer</option>
                      <option className="bg-[#15181c]">Local Taxi</option>
                      <option className="bg-[#15181c]">Outstation Cabs</option>
                      <option className="bg-[#15181c]">Tour Packages</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase text-white/40 block mb-1 font-mono">Special Instructions (Optional)</label>
                  <textarea 
                    rows={2}
                    placeholder="e.g. Senior citizen onboard, need empty trunk, dual AC crucial..."
                    value={bookingFormData.specialNotes}
                    onChange={(e) => setBookingFormData({...bookingFormData, specialNotes: e.target.value})}
                    className="bg-white/5 border border-white/10 p-2.5 w-full rounded text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="bg-amber-500/5 p-3 rounded text-[10px] text-amber-500 leading-relaxed">
                  ✓ Fares mapped are transparent and exclude custom forest entry barriers (if arbitrary trekking). Peak pricing is not active.
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#10b981] hover:bg-emerald-500 text-[#0F1215] font-bold text-xs uppercase tracking-[0.2em] py-4 rounded-xl shadow-lg transition-all"
                >
                  Confirm E-Ticket Reservation
                </button>
              </form>
            )}

          </div>
        </div>
      )}

      {/* 🌟 CHATBOT "MANDAKINI" SLIDEOUT COMPONENT (24/7 Virtual Host) */}
      {chatOpen && (
        <div id="ai-chatbot-dock" className="fixed bottom-6 right-6 z-55 w-80 sm:w-96 bg-[#15181C] border border-white/15 rounded-3xl shadow-2xl flex flex-col justify-between overflow-hidden animate-slide-in">
          
          {/* Box Header */}
          <div className="bg-[#1A1E24] border-b border-white/10 p-4 flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-[#0F1215] font-serif font-bold text-sm">
                M
              </div>
              <div>
                <span className="font-serif font-bold text-sm text-[#F9F7F2]">Mandakini AI Agent</span>
                <span className="text-[9px] uppercase tracking-wider text-[#34d399] font-mono block">● 24/7 Digital Host</span>
              </div>
            </div>
            
            <button 
              onClick={() => setChatOpen(false)}
              className="text-white/40 hover:text-white p-1 rounded-full hover:bg-white/5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Message logs */}
          <div className="p-4 space-y-4 h-[300px] overflow-y-auto custom-scrollbar flex flex-col">
            {chatLogs.map((log, idx) => (
              <div 
                key={idx} 
                className={`max-w-[85%] rounded-2xl p-3 text-xs ${
                  log.sender === "user" 
                    ? "bg-amber-500 text-slate-950 ml-auto rounded-tr-none font-medium" 
                    : "bg-white/5 text-white/90 mr-auto rounded-tl-none border border-white/5"
                }`}
              >
                <p className="leading-relaxed font-light">{log.text}</p>
                <span className={`text-[8px] block mt-1 text-right  ${log.sender === "user" ? "text-slate-900/60" : "text-white/30"}`}>
                  {log.time}
                </span>
              </div>
            ))}

            {chattingAI && (
              <div className="bg-white/5 border border-white/5 text-white/50 px-3 py-2 rounded-xl text-[10px] mr-auto rounded-tl-none animate-pulse">
                Mandakini typing updates...
              </div>
            )}
          </div>

          {/* Input text box */}
          <div className="p-3 bg-[#1A1E24] border-t border-white/10 flex gap-2">
            <input 
              type="text" 
              placeholder="Ask me: Kedarnath roads status, Sedan price..."
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') sendChatMessage();
              }}
              className="flex-grow bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
            />
            
            <button
              onClick={sendChatMessage}
              className="p-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#0F1215] transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* Floating Buttons: WhatsApp and Chatbot triggers */}
      <div className="fixed bottom-6 left-6 z-40 flex flex-col gap-2">
        <button
          onClick={openWhatsAppUrl}
          className="w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 group relative"
          title="WhatsApp Quick Booking"
        >
          <Phone className="w-5 h-5 animate-bounce" />
          <span className="absolute left-14 bg-slate-900 border border-white/10 text-[10px] uppercase font-mono tracking-widest px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-white">
            WhatsApp Hotline
          </span>
        </button>
      </div>

      {/* Market-Ready Footer */}
      <footer className="bg-[#0b0d0f] border-t border-white/10 py-12 text-xs relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-[#0F1215] font-serif font-bold text-sm">
                D
              </div>
              <span className="font-serif font-bold text-base tracking-tight text-[#F9F7F2]">
                Devbhoomi<span className="text-amber-500">Cabs</span>
              </span>
            </div>
            
            <p className="text-white/50 leading-relaxed font-light">
              Official tour cab partners for Uttarakhand spiritual circuit and Himalayan adventure tourism. ISO 9001 quality audited.
            </p>

            <div className="text-[10px] font-mono text-white/30 space-y-1">
              <p>📍 Devbhoomi Transport Ghati Office, Dehradun Bypass, UK</p>
              <p>🗃️ GSTIN Registration: 05AAECD1234F1Z8</p>
              <p>📞 Emergency SOS helpline: +91 94120 00000</p>
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-white text-sm">Services Provided</h4>
            <ul className="space-y-2 text-white/50">
              <li><button onClick={() => { setCurrentTab("home"); window.scrollTo(0, 0); }} className="hover:text-amber-500">Airport Taxi Transfers</button></li>
              <li><button onClick={() => setCurrentTab("packages")} className="hover:text-amber-500">Char-Dham Yatra Packages</button></li>
              <li><button onClick={() => setCurrentTab("fleet")} className="hover:text-amber-500">Tempo Traveller 9-26S Hire</button></li>
              <li><button onClick={() => setCurrentTab("customer")} className="hover:text-amber-500">Kedarnath Darshan Helpline</button></li>
            </ul>
          </div>

          {/* Major circuits */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-white text-sm">Popular Pilgrim Circuits</h4>
            <ul className="space-y-2 text-white/50">
              <li><span className="text-white/45">Yamunotri ➔ Gangotri (Do Dham)</span></li>
              <li><span className="text-white/45">Kedarnath ➔ Badrinath (10 Days Dham)</span></li>
              <li><span className="text-white/45">Mussorie ➔ Dhanaulti hill routes</span></li>
              <li><span className="text-white/45 font-semibold text-emerald-400">Valley of Flowers Trek Transports</span></li>
            </ul>
          </div>

          {/* App indicators */}
          <div className="space-y-4">
            <h4 className="font-serif font-bold text-white text-sm leading-none">Download Mobile Pilot App</h4>
            <p className="text-white/50 leading-relaxed font-light">One-click immediate pickups and real-time live driver coordinates tracking.</p>
            
            <div className="flex gap-2">
              <div className="bg-white/5 border border-white/10 p-2.5 rounded text-center text-[10px] font-mono hover:bg-white/10 cursor-pointer flex-1 text-white border-white/10">
                 Apple Stores
              </div>
              <div className="bg-white/5 border border-white/10 p-2.5 rounded text-center text-[10px] font-mono hover:bg-white/10 cursor-pointer flex-1 text-amber-500 border-amber-500/20">
                ▶ Google Play
              </div>
            </div>

            <div className="pt-2">
              <span className="text-[10px] font-mono text-white/30">© 2026 Devbhoomi Cabs Travel Services Inc. Complete Market Roadmaps registered.</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}

// Simple Helper Flag icon inside form
function FlagIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  );
}
