import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, Calendar, Clock, MapPin, QrCode, AlertCircle, Trash2, CheckCircle2 } from 'lucide-react';

export default function TicketsView({ onBookNew }) {
  const navigate = useNavigate();
  const handleBookNew = onBookNew || (() => navigate('/catalog'));
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setTickets([]);
        setLoading(false);
        return;
      }

      const res = await fetch('/api/bookings/my-tickets', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setTickets(data.bookings || []);
      } else {
        setTickets([]);
      }
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (ticketId) => {
    if (!confirm('Are you sure you want to cancel this booking? Simulated refund will be processed.')) return;
    setCancellingId(ticketId);

    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(`/api/bookings/${ticketId}/cancel`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
      setTickets(tickets.filter(t => t._id !== ticketId));
    } catch (err) {
      console.error('Cancel failed:', err);
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="w-full flex flex-col space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#ede9e3] tracking-tight flex items-center space-x-3">
            <Ticket className="w-6 h-6 text-[#e5a93c]" />
            <span>Cinema Boarding Passes</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1 font-mono-cinema">
            Active digital cinema passes, reserved seats & entrance verification tokens.
          </p>
        </div>

        <button
          onClick={handleBookNew}
          className="btn-cinema px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all cursor-pointer self-start sm:self-auto"
        >
          Book More Shows
        </button>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#e5a93c] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-gray-500 font-mono-cinema">Retrieving your boarding passes...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center rounded-2xl bg-[#111319] border border-white/10 text-center p-8 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-[#e5a93c]/10 border border-[#e5a93c]/20 flex items-center justify-center text-[#e5a93c] mb-4">
            <Ticket className="w-7 h-7" />
          </div>
          <h4 className="text-lg font-bold text-[#ede9e3]">No Active Boarding Passes</h4>
          <p className="text-xs text-gray-400 mt-1 max-w-sm leading-relaxed">
            You haven't reserved any cinema tickets yet. Explore movies now showing and select your favorite seats.
          </p>
          <button
            onClick={handleBookNew}
            className="mt-6 btn-cinema px-6 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
          >
            Explore Now Showing
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          {tickets.map((t) => {
            const movieTitle = t.show?.movie?.title || t.movieTitle || 'Movie Ticket';
            const screen = t.show?.screen?.name || t.screenName || 'Standard Hall';
            const time = t.show?.showTime || t.showTime;
            const isExpired = time ? new Date(time) <= new Date() : false;
            const dateStr = time ? new Date(time).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Today';
            const timeStr = time ? new Date(time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '07:00 PM';
            const seatsStr = Array.isArray(t.seats) ? t.seats.join(', ') : 'Seats';

            return (
              <div
                key={t._id}
                className={`relative flex flex-col sm:flex-row rounded-2xl overflow-hidden bg-[#111319] border shadow-2xl group transition-all ${
                  isExpired ? 'border-white/5 opacity-70' : 'border-white/10 hover:border-[#e5a93c]/40'
                }`}
              >
                {/* Poster / Left visual */}
                <div className="relative sm:w-44 h-48 sm:h-auto overflow-hidden bg-[#090a0e] flex-shrink-0">
                  <img
                    src={t.show?.movie?.posterUrl || t.posterUrl || 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?auto=format&fit=crop&w=400&q=80'}
                    alt={movieTitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black/80 via-transparent to-transparent" />
                  {isExpired && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-bold text-gray-400 uppercase font-mono-cinema">
                      Screening Concluded
                    </div>
                  )}
                </div>

                {/* Perforated Divider (Hidden on mobile) */}
                <div className="hidden sm:flex flex-col justify-between py-2 border-r border-dashed border-white/15 relative">
                  <div className="w-3 h-3 rounded-full bg-[#090a0e] -mt-3.5 -ml-1.5 border border-white/10" />
                  <div className="w-3 h-3 rounded-full bg-[#090a0e] -mb-3.5 -ml-1.5 border border-white/10" />
                </div>

                {/* Ticket Details */}
                <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 text-gray-300 font-mono-cinema">
                        {screen}
                      </span>
                      <div className="flex items-center space-x-2">
                        {isExpired ? (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-gray-500 font-mono-cinema">
                            Archived
                          </span>
                        ) : (
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded font-mono-cinema ${
                            t.bookingStatus === 'Confirmed'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-[#e5a93c]/15 text-[#f3c562] border border-[#e5a93c]/30'
                          }`}>
                            {t.bookingStatus || 'Reserved'}
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-[#ede9e3] mt-2 truncate">
                      {movieTitle}
                    </h3>

                    <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-gray-300 font-mono-cinema">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-3.5 h-3.5 text-[#e5a93c]" />
                        <span>{dateStr}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3.5 h-3.5 text-[#e5a93c]" />
                        <span>{timeStr}</span>
                      </div>
                      <div className="flex items-center space-x-2 col-span-2 pt-1">
                        <span className="text-gray-400 font-medium">SEATS:</span>
                        <span className="font-bold bg-[#e5a93c]/15 text-[#f3c562] px-2.5 py-0.5 rounded border border-[#e5a93c]/30">
                          {seatsStr}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Ticket Footer with Reference & Actions */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-gray-500 font-mono-cinema uppercase tracking-wider">Pass Reference</p>
                      <p className="text-xs font-mono-cinema font-bold text-[#ede9e3] truncate max-w-[140px]">
                        #{t._id.slice(-8).toUpperCase()}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2.5">
                      <button
                        onClick={() => handleCancel(t._id)}
                        disabled={cancellingId === t._id}
                        title="Cancel Booking & Refund"
                        className="p-2 rounded-xl bg-white/5 hover:bg-red-500/15 text-gray-400 hover:text-red-400 border border-white/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-gray-300" title="Valid entrance pass">
                        <QrCode className="w-5 h-5 text-[#e5a93c]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
