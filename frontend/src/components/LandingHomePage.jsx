import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ChevronDown } from 'lucide-react';
import { useCinema } from '../context/CinemaContext';

export default function LandingHomePage({
  onBookNow: propOnBookNow,
  onNavigate: propOnNavigate,
  onOpenAuth: propOnOpenAuth
}) {
  const navigate = useNavigate();
  const { currentUser, selectedCity, setSelectedCity, cities } = useCinema();
  const [isCityOpen, setIsCityOpen] = useState(false);

  const handleBookNow = propOnBookNow || (() => navigate('/catalog'));
  const handleNavigate = propOnNavigate || ((path) => navigate(`/${path}`));
  const handleOpenAuth = propOnOpenAuth || (() => navigate('/auth'));

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);

  // 4 Pexels Cinema Background Images for the infinite loop carousel
  const slides = [
    {
      id: 1,
      image: 'https://images.pexels.com/photos/39633884/pexels-photo-39633884.jpeg?auto=compress&cs=tinysrgb&w=1920'
    },
    {
      id: 2,
      image: 'https://images.pexels.com/photos/7991266/pexels-photo-7991266.jpeg?auto=compress&cs=tinysrgb&w=1920'
    },
    {
      id: 3,
      image: 'https://images.pexels.com/photos/7991139/pexels-photo-7991139.jpeg?auto=compress&cs=tinysrgb&w=1920'
    },
    {
      id: 4,
      image: 'https://images.pexels.com/photos/7234413/pexels-photo-7234413.jpeg?auto=compress&cs=tinysrgb&w=1920'
    }
  ];

  // Seamless infinite loop: clone the first slide to the end
  const extendedSlides = [...slides, { ...slides[0], id: 'clone-first-slide' }];

  // Auto-slide every 6 seconds shifting smoothly in a forward infinite loop
  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setCurrentSlide((prev) => prev + 1);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // When transition to the cloned first slide finishes, seamlessly snap back to the actual first slide without transition
  const handleTransitionEnd = (e) => {
    if (e.target !== e.currentTarget || e.propertyName !== 'transform') return;
    if (currentSlide >= slides.length) {
      setIsTransitioning(false);
      setCurrentSlide(0);
    }
  };

  // Re-enable smooth transitions on next frame after seamless snap
  useEffect(() => {
    if (!isTransitioning) {
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsTransitioning(true);
        });
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [isTransitioning]);

  // Fallback safety for backgrounded browser tabs
  useEffect(() => {
    if (currentSlide >= slides.length) {
      const fallbackTimer = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentSlide(0);
      }, 750);
      return () => clearTimeout(fallbackTimer);
    }
  }, [currentSlide, slides.length]);

  return (
    <div className="relative w-full h-screen min-h-[600px] bg-black text-white overflow-hidden select-none flex flex-col justify-between font-sans">

      {/* ========================================================= */}
      {/* BACKGROUND SLIDER: SHIFTING HORIZONTALLY (INFINITE LOOP)   */}
      {/* ========================================================= */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <div
          onTransitionEnd={handleTransitionEnd}
          className="flex h-full w-full will-change-transform"
          style={{
            transform: `translateX(-${currentSlide * 100}%)`,
            transition: isTransitioning ? 'transform 700ms ease-in-out' : 'none'
          }}
        >
          {extendedSlides.map((slide, idx) => (
            <div key={`${slide.id}-${idx}`} className="w-full h-full flex-shrink-0 relative">
              <img
                src={slide.image}
                alt="Cinema Background"
                className="w-full h-full object-cover object-center filter brightness-[0.99] contrast-105"
                loading="eager"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Atmospheric Film Grain, Vignette & Deep Shadows */}
      <div className="absolute inset-0 bg-radial from-transparent via-black/40 to-black/90 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/80 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60 pointer-events-none" />

      {/* Subtle Texture Noise Layer for Film Grain Aesthetic */}
      <div
        className="absolute inset-0 opacity-[0.14] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      {/* ========================================================= */}
      {/* MINIMAL TOP HEADER: "PIXORA" (Pure Typography) + Controls */}
      {/* ========================================================= */}
      <header className="relative z-30 w-full px-6 sm:px-12 lg:px-20 pt-8 pb-4 flex items-center justify-between">
        {/* Brand Name in Pure Typography */}
        <div
          onClick={() => {
            setIsTransitioning(true);
            setCurrentSlide(0);
          }}
          className="cursor-pointer group flex flex-col"
        >
          <span className="font-serif-cinema text-2xl sm:text-3xl lg:text-4xl font-bold tracking-[0.2em] text-[#ede9e3] group-hover:text-[#e5a93c] transition-colors">
            PIXORA
          </span>
          <span className="text-[11px] font-medium tracking-[0.25em] uppercase text-gray-400 mt-1">
            The Cinema Experience
          </span>
        </div>

        {/* Right: Location & User Profile / Sign In */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* City Selector */}
          <div className="relative">
            <button
              onClick={() => setIsCityOpen(!isCityOpen)}
              className="flex items-center space-x-1.5 text-xs text-gray-300 hover:text-white px-3 py-1.5 rounded-lg bg-black/50 hover:bg-black/80 border border-white/10 hover:border-white/20 transition-colors cursor-pointer backdrop-blur-md"
            >
              <MapPin className="w-3.5 h-3.5 text-[#e5a93c]" />
              <span className="font-medium tracking-wide">{selectedCity}</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {isCityOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-xl bg-[#111319] border border-white/10 shadow-2xl py-1.5 z-50 animate-fade-in text-left">
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

          {currentUser ? (
            <div
              onClick={() => handleNavigate('tickets')}
              title={currentUser.name}
              className="w-9 h-9 rounded-xl bg-[#171b24] border border-[#e5a93c]/40 flex items-center justify-center font-bold text-xs text-[#e5a93c] cursor-pointer transition-all hover:border-[#e5a93c]"
            >
              {currentUser.name?.[0]?.toUpperCase() || 'U'}
            </div>
          ) : (
            <button
              onClick={handleOpenAuth}
              className="btn-cinema px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* ========================================================= */}
      {/* CENTER HERO CONTENT: Cinematic Editorial Statement + CTA */}
      {/* ========================================================= */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center px-6 sm:px-12 text-center max-w-4xl mx-auto w-full my-auto">

        <h1 className="font-serif-cinema text-3xl sm:text-5xl md:text-6xl text-[#ede9e3] font-normal leading-[1.25] sm:leading-[1.18] tracking-tight px-4 sm:px-6 text-center drop-shadow-xl">
          Where <span className="italic text-[#f3c562]">Every Story</span> Comes Alive, Every <span className="italic text-[#e5a93c]">Emotion</span> Feels Real, and Every Moment Becomes an <span className="italic text-[#f3c562]">Unforgettable Experience</span>
        </h1>

        <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto mt-5 font-normal leading-relaxed">
          Experience cinema in high-definition formats, pristine Dolby Atmos sound, and premium auditorium comfort.
        </p>

        {/* Tactile "Book Now" Button */}
        <div className="mt-8 sm:mt-10 flex flex-col items-center">
          <button
            onClick={handleBookNow}
            className="btn-cinema px-9 sm:px-12 py-3.5 sm:py-4 rounded-xl text-xs sm:text-sm tracking-widest uppercase cursor-pointer flex items-center space-x-2 shadow-xl shadow-[#e5a93c]/20 hover:shadow-2xl hover:shadow-[#e5a93c]/30"
          >
            <span>Book Tickets</span>
          </button>
        </div>
      </main>

      {/* Empty bottom spacer for perfect visual balance */}
      <div className="relative z-20 h-10 sm:h-16 w-full" />
    </div>
  );
}
