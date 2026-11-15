import React from 'react';
import { Clock, MapPin } from 'lucide-react';

const DATES = [
  { month: 'Nov', dayNum: '13', dayName: 'Tomorrow', label: 'Tomorrow, 13 Nov' },
  { month: 'Nov', dayNum: '14', dayName: 'Sat', label: 'Sat, 14 Nov' },
  { month: 'Nov', dayNum: '15', dayName: 'Sun', label: 'Sun, 15 Nov' },
  { month: 'Nov', dayNum: '16', dayName: 'Mon', label: 'Mon, 16 Nov' },
  { month: 'Nov', dayNum: '17', dayName: 'Tue', label: 'Tue, 17 Nov' },
  { month: 'Nov', dayNum: '18', dayName: 'Wed', label: 'Wed, 18 Nov' },
  { month: 'Nov', dayNum: '19', dayName: 'Thu', label: 'Thu, 19 Nov' },
];

export default function CinemaShowtimes({
  selectedDate,
  setSelectedDate,
  activeTheaters = [],
  selectedTheater,
  selectedTime,
  onSelectShowtime,
  selectedCity
}) {
  return (
    <div id="tickets-booking-section" className="w-full flex flex-col space-y-6 pt-2">
      {/* Date Slot Strip */}
      <div className="w-full bg-[#111319] border-y border-white/10 flex items-center overflow-x-auto scrollbar-none">
        <div className="flex items-stretch">
          {DATES.map((d) => {
            const isSelected = selectedDate === d.label;
            return (
              <button
                key={d.label}
                onClick={() => setSelectedDate(d.label)}
                className={`group flex flex-col items-center justify-center min-w-[90px] sm:min-w-[110px] py-3.5 px-4 transition-all cursor-pointer relative ${isSelected
                    ? 'bg-[#e5a93c]/15 text-white border-b-2 border-[#e5a93c]'
                    : 'bg-transparent text-gray-400 hover:text-white border-b-2 border-transparent hover:border-white/20'
                  }`}
              >
                <span className={`text-[11px] font-bold tracking-wider uppercase transition-colors ${isSelected ? 'text-[#e5a93c]' : 'text-gray-500 group-hover:text-gray-300'}`}>
                  {d.month}
                </span>
                <span className={`text-2xl sm:text-3xl font-black mt-0.5 leading-none transition-colors font-mono-cinema ${isSelected ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                  {d.dayNum}
                </span>
                <span className={`text-xs font-medium mt-1 transition-colors ${isSelected ? 'text-[#f3c562]' : 'text-gray-400 group-hover:text-gray-200'}`}>
                  {d.dayName}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Theaters & Showtimes Listing */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-2 text-xs uppercase tracking-widest text-gray-400 font-bold">
            <MapPin className="w-3.5 h-3.5 text-[#e5a93c]" />
            <span>Cinemas in <strong className="text-[#ede9e3]">{selectedCity || 'Delhi'}</strong></span>
          </div>
          <span className="text-[11px] font-semibold text-gray-500 font-mono-cinema">
            {activeTheaters.length} {activeTheaters.length === 1 ? 'Cinema' : 'Cinemas'} Available
          </span>
        </div>

        {activeTheaters.map((th) => (
          <div
            key={th._id || th.id || th.name}
            className={`p-5 sm:p-6 rounded-2xl bg-[#111319] border transition-all ${selectedTime && selectedTheater === th.name
                ? 'border-[#e5a93c]/70 shadow-xl shadow-[#e5a93c]/10'
                : 'border-white/10 hover:border-white/20'
              }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#ede9e3]">{th.name}</h3>
                <div className="flex items-center space-x-2 text-xs text-gray-400 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#e5a93c]" />
                  <span>{th.location}</span>
                </div>
              </div>
            </div>

            {/* Showtimes Pills */}
            <div className="pt-3 flex flex-wrap items-center gap-2.5">
              {(th.showtimes || []).map((time) => {
                const isActive = selectedTime === time && selectedTheater === th.name;
                return (
                  <button
                    key={time}
                    onClick={() => onSelectShowtime(th.name, time)}
                    className={`px-4 py-2 rounded-xl text-xs font-mono-cinema font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${isActive
                        ? 'bg-[#e5a93c] text-[#090a0e] shadow-md shadow-[#e5a93c]/30 font-extrabold scale-105'
                        : 'bg-[#090a0e] text-gray-300 hover:text-white border border-white/10 hover:border-[#e5a93c]/40'
                      }`}
                  >
                    <Clock className="w-3 h-3" />
                    <span>{time}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

