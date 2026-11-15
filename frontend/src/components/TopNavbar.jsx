import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Film, Search, MapPin, ChevronDown, User, LogOut, X } from 'lucide-react';
import { useCinema } from '../context/CinemaContext';

export default function TopNavbar({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  currentUser,
  onOpenAuth,
  onLogout,
  ticketsCount = 0
}) {
  const cinemaContext = useCinema();
  const navigate = useNavigate();
  const selectedCity = cinemaContext?.selectedCity || 'Delhi';
  const setSelectedCity = cinemaContext?.setSelectedCity || (() => { });
  const cities = cinemaContext?.cities || ['Delhi', 'Dehradun', 'Bengaluru', 'Chennai'];
  const [isCityOpen, setIsCityOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#090a0e]/95 backdrop-blur-md border-b border-white/[0.08] select-none h-25">
      <div className="w-full px-4 sm:px-8 lg:px-10 h-23 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Location */}
        <div className="flex items-center space-x-5 sm:space-x-8 flex-shrink-0">
          {/* Brand Name - PIXORA (Prestige editorial serif) */}
          <div
            onClick={() => setActiveTab('home')}
            className="cursor-pointer group flex items-center"
          >
            <span className="font-serif-cinema text-xl sm:text-2xl font-bold tracking-[0.2em] text-[#ede9e3] group-hover:text-[#e5a93c] transition-colors">
              PIXORA
            </span>
          </div>

          {/* Location Selector */}
          <div className="relative">
            <button
              onClick={() => setIsCityOpen(!isCityOpen)}
              className="flex items-center space-x-1.5 text-xs text-gray-400 hover:text-[#ede9e3] px-2.5 py-1.5 rounded-lg border border-white/5 hover:border-white/15 bg-white/[0.02] transition-colors cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-[#e5a93c]" />
              <span className="font-medium tracking-wide">{selectedCity}</span>
              <ChevronDown className="w-3 h-3 text-gray-500" />
            </button>

            {isCityOpen && (
              <div className="absolute left-0 mt-2 w-40 rounded-xl bg-[#111319] border border-white/10 shadow-2xl py-1.5 z-50 animate-fade-in">
                {cities.map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      setSelectedCity(city);
                      setIsCityOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs font-medium cursor-pointer transition-colors ${selectedCity === city
                      ? 'text-[#e5a93c] font-semibold bg-[#e5a93c]/10'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: Top Global Cinema Search Bar */}
        <div className="flex-1 max-w-xl mx-2 sm:mx-6">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search movies, cinemas, genres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#111319] text-xs sm:text-sm text-[#ede9e3] placeholder-gray-500 border border-white/10 focus:outline-none focus:border-[#e5a93c]/70 focus:ring-1 focus:ring-[#e5a93c]/40 transition-all"
            />
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right: Navigation Links & User Profile */}
        <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
          <nav className="flex items-center space-x-1 sm:space-x-1.5">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer flex items-center space-x-1.5 ${activeTab === 'catalog'
                ? 'text-[#e5a93c] bg-[#e5a93c]/10'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
              <span className="hidden sm:inline">Movies</span>
            </button>

            <button
              onClick={() => setActiveTab('tickets')}
              className={`relative px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer flex items-center space-x-1.5 ${activeTab === 'tickets'
                ? 'text-[#e5a93c] bg-[#e5a93c]/10'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
              <span className="hidden sm:inline">My Tickets</span>
              {ticketsCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#e5a93c] text-[#090a0e] text-[10px] font-bold flex items-center justify-center font-mono-cinema">
                  {ticketsCount}
                </span>
              )}
            </button>

          </nav>

          {/* User Sign In / Profile */}
          {currentUser ? (
            <div className="flex items-center space-x-2 pl-2 border-l border-white/10">
              <div
                title={`${currentUser.name} (${currentUser.email})`}
                className="w-8 h-8 rounded-full bg-[#171b24] border border-[#e5a93c]/40 flex items-center justify-center text-xs font-bold text-[#e5a93c] uppercase cursor-pointer"
              >
                {currentUser.name?.[0] || 'U'}
              </div>
              <button
                onClick={onLogout}
                title="Sign Out"
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="btn-cinema px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer flex items-center space-x-1.5"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
