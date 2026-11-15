import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, CheckCircle2 } from 'lucide-react';

function SeatButton({ seatId, num, isBooked, isSelected, onToggle }) {
  return (
    <button
      disabled={isBooked}
      onClick={() => onToggle(seatId)}
      title={isBooked ? 'Occupied' : `Seat ${seatId}`}
      className={`w-6 h-6 sm:w-7 sm:h-7 rounded text-[10px] sm:text-[11px] font-bold flex items-center justify-center transition-all cursor-pointer font-mono-cinema ${isBooked
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
          : isSelected
            ? 'bg-[#e5a93c] border border-[#d4972b] text-black font-black shadow-md shadow-[#e5a93c]/30 scale-105'
            : 'bg-white text-gray-800 hover:border-black hover:text-black hover:bg-gray-50 border border-gray-300 shadow-xs'
        }`}
    >
      {num}
    </button>
  );
}

export default function SeatBookingModal({
  isOpen,
  onClose,
  movie,
  selectedTheater,
  selectedTime,
  selectedDate,
  bookedSeatsList = [],
  validSelectedSeats = [],
  totalPrice = 0,
  isSubmitting = false,
  bookingConfirmed = false,
  confirmedBookingId = null,
  checkoutBooking = null,
  toggleSeat,
  handleConfirmBooking
}) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white text-gray-900 shadow-2xl p-5 sm:p-7 flex flex-col space-y-4 my-auto border border-gray-200"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 flex items-center justify-center transition-colors cursor-pointer z-10 border border-gray-200"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Info */}
        <div className="pr-10 border-b border-gray-200 pb-3">
          <div className="flex items-center space-x-2">
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-100 border border-gray-300 text-gray-800 font-mono-cinema flex-shrink-0">
              {movie.censorshipRating || movie.certificate || 'UA 16+'}
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{movie.title}</h3>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Screening at <strong className="text-gray-900">{selectedTheater}</strong> • <strong className="text-amber-600 font-mono-cinema">{selectedTime}</strong> • {selectedDate}
          </p>
        </div>

        {bookingConfirmed ? (
          /* Booking Confirmed State */
          <div className="py-6 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-2xl sm:text-3xl font-bold text-gray-900">Tickets Confirmed!</h4>
            <p className="text-xs sm:text-sm text-gray-600 max-w-md">
              Your seats <strong className="text-amber-600 font-mono-cinema">{(checkoutBooking?.seats || validSelectedSeats).join(', ')}</strong> have been successfully reserved.
            </p>

            <div className="p-5 rounded-xl bg-gray-50 border border-gray-200 w-full max-w-md text-left text-xs space-y-2.5 shadow-sm text-gray-700">
              <div className="flex justify-between text-gray-500">
                <span>Auditorium:</span>
                <span className="font-semibold text-gray-900">{selectedTheater}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Showtime:</span>
                <span className="font-semibold text-gray-900 font-mono-cinema">{selectedTime} • {selectedDate}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Reserved Seats:</span>
                <span className="font-bold text-amber-600 font-mono-cinema">{(checkoutBooking?.seats || validSelectedSeats).join(', ')}</span>
              </div>
              <div className="flex justify-between text-gray-500 pt-2 border-t border-gray-200">
                <span>Total Amount:</span>
                <span className="font-bold text-gray-900 text-sm font-mono-cinema">₹{checkoutBooking?.totalPrice || totalPrice}</span>
              </div>
              {confirmedBookingId && (
                <div className="pt-2 border-t border-gray-200 flex justify-between items-center text-[10px] text-gray-500 font-mono-cinema">
                  <span>BOOKING ID:</span>
                  <span className="font-bold text-amber-700">{confirmedBookingId.slice(-8).toUpperCase()}</span>
                </div>
              )}
            </div>

            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => {
                  onClose();
                  navigate('/tickets');
                }}
                className="btn-cinema px-6 py-3 rounded-xl text-xs tracking-wider uppercase cursor-pointer"
              >
                View My Tickets
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-xl text-xs uppercase tracking-wider cursor-pointer border border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Seat Selection Layout */
          <>
            {/* Screen Arc (Black) */}
            <div className="w-full flex flex-col items-center pt-2">
              <div className="w-full max-w-md h-8 relative flex items-center justify-center">
                <svg className="w-full h-8 overflow-visible" viewBox="0 0 500 40">
                  <path
                    d="M 20 32 Q 250 8 480 32"
                    stroke="#000000"
                    strokeWidth="4"
                    strokeLinecap="round"
                    fill="none"
                    className="drop-shadow-[0_4px_8px_rgba(0,0,0,0.25)]"
                  />
                </svg>
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.35em] text-black -mt-1 mb-3 font-mono-cinema">
                SCREEN
              </span>

              {/* Legend */}
              <div className="flex items-center justify-center space-x-6 sm:space-x-8 text-xs font-medium text-gray-600 mb-2">
                <div className="flex items-center space-x-2">
                  <span className="w-3.5 h-3.5 rounded-sm border border-gray-300 bg-white shadow-xs inline-block" />
                  <span>Available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-3.5 h-3.5 rounded-sm bg-[#e5a93c] border border-[#d4972b] inline-block shadow-xs" />
                  <span className="text-gray-900 font-bold">Selected</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-3.5 h-3.5 rounded-sm bg-gray-200 border border-gray-300 inline-block" />
                  <span className="text-gray-400">Occupied</span>
                </div>
              </div>
            </div>

            {/* Seat Grid */}
            <div className="w-full flex flex-col items-center space-y-4 py-1 overflow-x-auto">
              {/* CLASSIC Section (₹290) */}
              <div className="flex flex-col items-center space-y-2">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-500 font-mono-cinema">
                  CLASSIC (₹290)
                </h4>
                <div className="flex flex-col items-center space-y-1.5">
                  {['A', 'B', 'C', 'D'].map((row) => (
                    <div key={row} className="flex items-center space-x-2">
                      <span className="w-4 text-xs font-bold text-gray-400 text-center font-mono-cinema">{row}</span>
                      <div className="flex space-x-1 sm:space-x-1.5">
                        {[11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((num) => {
                          const seatId = `${row}${num}`;
                          const isBooked = bookedSeatsList.includes(seatId);
                          const isSelected = !isBooked && validSelectedSeats.includes(seatId);
                          return (
                            <SeatButton
                              key={seatId}
                              seatId={seatId}
                              num={num}
                              isBooked={isBooked}
                              isSelected={isSelected}
                              onToggle={toggleSeat}
                            />
                          );
                        })}
                      </div>
                      <span className="w-4 text-xs font-bold text-gray-400 text-center font-mono-cinema">{row}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* PRIME Section (₹340) */}
              <div className="flex flex-col items-center space-y-2 pt-1">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-500 font-mono-cinema">
                  PRIME (₹340)
                </h4>
                <div className="flex flex-col items-center space-y-1.5">
                  {['E', 'F', 'G', 'H', 'J'].map((row) => (
                    <div key={row} className="flex items-center space-x-2">
                      <span className="w-4 text-xs font-bold text-gray-400 text-center font-mono-cinema">{row}</span>
                      <div className="flex space-x-1 sm:space-x-1.5">
                        {[14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4].map((num) => {
                          const seatId = `${row}${num}`;
                          const isBooked = bookedSeatsList.includes(seatId);
                          const isSelected = !isBooked && validSelectedSeats.includes(seatId);
                          return (
                            <SeatButton
                              key={seatId}
                              seatId={seatId}
                              num={num}
                              isBooked={isBooked}
                              isSelected={isSelected}
                              onToggle={toggleSeat}
                            />
                          );
                        })}
                      </div>
                      <div className="w-2.5 sm:w-4" />
                      <div className="flex space-x-1 sm:space-x-1.5">
                        {[3, 2, 1].map((num) => {
                          const seatId = `${row}${num}`;
                          const isBooked = bookedSeatsList.includes(seatId);
                          const isSelected = !isBooked && validSelectedSeats.includes(seatId);
                          return (
                            <SeatButton
                              key={seatId}
                              seatId={seatId}
                              num={num}
                              isBooked={isBooked}
                              isSelected={isSelected}
                              onToggle={toggleSeat}
                            />
                          );
                        })}
                      </div>
                      <span className="w-4 text-xs font-bold text-gray-400 text-center font-mono-cinema">{row}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Checkout Bar */}
            <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 mt-1">
              <div>
                <p className="text-xs text-gray-500 font-medium">
                  Selected Seats: <strong className="text-amber-600 font-bold font-mono-cinema">{validSelectedSeats.length > 0 ? validSelectedSeats.join(', ') : 'None'}</strong>
                </p>
                <p className="text-2xl font-black text-gray-900 mt-0.5 font-mono-cinema">₹{totalPrice}</p>
              </div>

              <button
                disabled={validSelectedSeats.length === 0 || isSubmitting}
                onClick={handleConfirmBooking}
                className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center transition-all cursor-pointer ${validSelectedSeats.length === 0 || isSubmitting
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                    : 'btn-cinema'
                  }`}
              >
                <span>{isSubmitting ? 'Reserving...' : `Confirm & Pay ₹${totalPrice}`}</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

