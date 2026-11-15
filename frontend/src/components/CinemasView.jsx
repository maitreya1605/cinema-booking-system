import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clapperboard, MapPin, Sparkles, Clock, Ticket, Navigation, ShieldCheck, Loader2 } from 'lucide-react';
import { useCinema } from '../context/CinemaContext';

export default function CinemasView({ onSelectShow, onBookMovie }) {
  const navigate = useNavigate();
  const { movies, theaters, isLoadingTheaters, selectedCity, setSelectedCity, cities } = useCinema();
  const [activeCityFilter, setActiveCityFilter] = useState('All');

  const displayedTheaters = (theaters || []).filter((theater) => {
    if (activeCityFilter === 'All') return true;
    return theater.city && theater.city.toLowerCase() === activeCityFilter.toLowerCase();
  });

  return (
    <div className="w-full flex flex-col space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#ede9e3] tracking-tight flex items-center space-x-2.5">
            <Clapperboard className="w-6 h-6 text-[#e5a93c]" />
            <span>Cinemas & Auditoriums</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Browse verified cinema complexes, IMAX screens, and today's screening slots.
          </p>
        </div>

        {/* 4 Cities Filter Pills */}
        <div className="flex items-center flex-wrap gap-2">
          {['All', ...cities].map((city) => (
            <button
              key={city}
              onClick={() => {
                setActiveCityFilter(city);
                if (city !== 'All') setSelectedCity(city);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeCityFilter === city
                  ? 'bg-[#e5a93c] text-[#090a0e] font-bold shadow-md shadow-[#e5a93c]/20'
                  : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/5'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Loading indicator */}
      {isLoadingTheaters && displayedTheaters.length === 0 && (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <Loader2 className="w-8 h-8 text-[#e5a93c] animate-spin mr-3" />
          <span className="text-sm font-semibold font-mono-cinema">Loading theaters...</span>
        </div>
      )}

      {/* Empty State */}
      {!isLoadingTheaters && displayedTheaters.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-[#111319] border border-white/10 text-gray-400">
          <Clapperboard className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-base font-bold text-white">No theaters found for {activeCityFilter}</p>
          <p className="text-xs text-gray-400 mt-1">Try selecting 'All' or choosing another city.</p>
        </div>
      )}

      {/* Theaters List */}
      <div className="space-y-5">
        {displayedTheaters.map((theater) => {
          const shows = theater.shows && theater.shows.length > 0
            ? theater.shows
            : (theater.showtimes || ['11:00 AM', '03:00 PM', '06:30 PM', '09:45 PM']).map((st, idx) => {
                const sampleMovie = movies[idx % movies.length] || { title: 'Featured Movie' };
                return {
                  id: `sh-${theater._id || theater.id}-${idx}`,
                  movie: sampleMovie.title,
                  time: st,
                  screen: theater.screensInfo || 'Screen 1',
                  format: theater.format || 'IMAX Laser',
                  price: '₹340'
                };
              });

          return (
            <div
              key={theater._id || theater.id || theater.name}
              className="p-5 sm:p-6 rounded-2xl bg-[#111319] border border-white/10 hover:border-[#e5a93c]/30 transition-all shadow-xl flex flex-col space-y-4"
            >
              {/* Theater Info Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg sm:text-xl font-bold text-[#ede9e3]">{theater.name}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-gray-300 font-mono-cinema">
                      {theater.city}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-400 mt-1">
                    <span className="flex items-center text-[#e5a93c] font-semibold">
                      <MapPin className="w-3.5 h-3.5 mr-1" />
                      {theater.distance || '2.0 km away'}
                    </span>
                    <span>•</span>
                    <span>{theater.location}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {(theater.tags || [theater.format || 'IMAX Laser']).map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#e5a93c]/10 border border-[#e5a93c]/30 text-[#f3c562] font-mono-cinema"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Today's Showtimes Grid */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2.5 flex items-center space-x-1.5 font-mono-cinema">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Available Screening Slots</span>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {shows.map((show) => (
                    <div
                      key={show._id || show.id}
                      onClick={() => {
                        if (onBookMovie) {
                          onBookMovie({ title: show.movie, screen: show.screen });
                        } else {
                          const targetMovie = movies.find(m => m.title.toLowerCase().includes(show.movie.toLowerCase())) || movies[0];
                          navigate(`/movie/${targetMovie.id || targetMovie._id}`, { state: { movie: targetMovie } });
                        }
                      }}
                      className="p-3.5 rounded-xl bg-[#090a0e] border border-white/10 hover:border-[#e5a93c] transition-all cursor-pointer group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white group-hover:text-[#e5a93c] transition-colors truncate">
                            {show.movie}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/5 text-gray-300 font-mono-cinema ml-1 flex-shrink-0">
                            {show.format}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">{show.screen}</p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between">
                        <div className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-400 font-mono-cinema">
                          <Clock className="w-3 h-3 text-emerald-500" />
                          <span>{show.time}</span>
                        </div>
                        <span className="text-xs font-bold text-white font-mono-cinema">{show.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
