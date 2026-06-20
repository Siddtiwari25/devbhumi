import React from "react";
import { Phone, Compass, MapPin, Car, ShieldCheck, UserCheck, Settings, MessageSquare, Flame } from "lucide-react";

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openAgentChat: () => void;
}

export default function Navbar({ currentTab, setCurrentTab, openAgentChat }: NavbarProps) {
  const tabs = [
    { id: "home", label: "Home Base", icon: Compass },
    { id: "fleet", label: "Himalayan Fleet", icon: Car },
    { id: "packages", label: "Tour Packages", icon: MapPin },
    { id: "customer", label: "Customer Cabin", icon: UserCheck },
    { id: "driver", label: "Driver Panel", icon: ShieldCheck },
    { id: "admin", label: "Admin Desk", icon: Settings },
  ];

  return (
    <header id="main-header" className="sticky top-0 z-40 w-full bg-[#0F1215]/95 backdrop-blur-md border-b border-white/10 shadow-lg transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Brand Brand based on Editorial Aesthetic theme */}
          <div 
            onClick={() => setCurrentTab("home")} 
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-all">
              <span className="text-[#0F1215] font-serif font-bold text-xl">D</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-serif font-bold tracking-tight uppercase leading-none text-[#F9F7F2] group-hover:text-amber-400 transition-colors">
                Devbhoomi
              </span>
              <span className="text-[9px] uppercase tracking-[0.3em] text-amber-500 font-semibold font-mono">
                Premium Cabs
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2">
            {tabs.map((tab) => {
              const IconComp = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-btn-${tab.id}`}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-sans text-xs uppercase tracking-wider font-medium transition-all duration-200 ${
                    isActive 
                      ? "bg-amber-500 text-[#0F1215] font-bold shadow-md shadow-amber-500/10" 
                      : "text-white/70 hover:text-[#F9F7F2] hover:bg-white/5"
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Hotline / Call to Action */}
          <div className="flex items-center gap-3">
            <a 
              href="tel:+919876543210" 
              className="hidden sm:flex flex-col text-right"
            >
              <span className="text-[10px] uppercase tracking-widest text-white/40 leading-none">24/7 Helpline</span>
              <span className="font-mono text-sm font-semibold text-amber-500 hover:text-amber-400 transition-colors">
                +91 94120 00000
              </span>
            </a>
            
            <button
              onClick={openAgentChat}
              className="flex items-center gap-2 bg-white/5 border border-white/20 hover:bg-amber-500 hover:text-[#0F1215] hover:border-amber-500 text-amber-500 px-4 py-2.5 rounded-full text-xs uppercase tracking-widest font-semibold transition-all duration-300"
            >
              <MessageSquare className="w-3.5 h-3.5 animate-pulse" />
              <span>AI Host</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Sub-Navigation Bar matching Editorial colors */}
      <div className="lg:hidden bg-white/5 border-t border-white/10 py-2 px-1 flex justify-around overflow-x-auto gap-0.5">
        {tabs.map((tab) => {
          const IconComp = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex flex-col items-center gap-1 px-1 py-1 rounded-md text-[9px] uppercase tracking-wider font-semibold transition-all min-w-[58px] ${
                isActive 
                  ? "bg-amber-500 text-[#0F1215]" 
                  : "text-white/60 hover:text-white"
              }`}
            >
              <IconComp className="w-4 h-4" />
              <span>{tab.label.split(" ")[0]}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
