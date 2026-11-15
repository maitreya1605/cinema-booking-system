import React, { useMemo } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useCinema } from '../context/CinemaContext';
import { useMovieBooking } from '../hooks/useMovieBooking';
import MovieHeroBanner from './MovieHeroBanner';
import CinemaShowtimes from './CinemaShowtimes';
import SeatBookingModal from './SeatBookingModal';
import PaymentGatewayModal from './PaymentGatewayModal';

export default function MovieDetailPage({ movie: propMovie, onBookingSuccess }) {
  const { id } = useParams();
  const location = useLocation();
  const { movies, theaters, showToast, selectedCity, currentUser, logout } = useCinema();

  const movie = useMemo(() => {
    if (propMovie) return propMovie;
    const norm = (str) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanId = norm(id);

    const match = movies.find(
      (m) =>
        String(m.id || '').toLowerCase() === String(id || '').toLowerCase() ||
        String(m._id || '').toLowerCase() === String(id || '').toLowerCase() ||
        (m.staticId && String(m.staticId).toLowerCase() === String(id || '').toLowerCase())
    ) || (cleanId && movies.find((m) => norm(m.title) === cleanId || norm(m.title).includes(cleanId)));

    if (match) return match;
    if (location.state?.movie?.title) {
      const matchState = movies.find((m) => norm(m.title) === norm(location.state.movie.title));
      return matchState ? { ...matchState, ...location.state.movie } : location.state.movie;
    }
    return movies[0] || null;
  }, [id, propMovie, location.state, movies]);

  // Filter cinemas dynamically by selectedCity
  const activeTheaters = useMemo(() => {
    if (!theaters || theaters.length === 0) return [];
    const cityTheaters = theaters.filter(
      (th) => !selectedCity || (th.city && th.city.toLowerCase() === selectedCity.toLowerCase())
    );
    return cityTheaters.length > 0 ? cityTheaters : theaters;
  }, [theaters, selectedCity]);

  // Custom hook encapsulating reservation, seat locks, payment states, and polling
  const booking = useMovieBooking({
    movie,
    activeTheaters,
    showToast,
    currentUser,
    logout,
    locationState: location.state,
    onBookingSuccess
  });

  if (!movie) return null;

  return (
    <div className="w-full flex flex-col animate-fade-in pb-16">
      {/* Hero Movie Banner & Details Section */}
      <MovieHeroBanner movie={movie} onBookClick={booking.scrollToBooking} />

      {/* In-Page Cinema Showtimes & Seat Booking Section */}
      <CinemaShowtimes
        selectedDate={booking.selectedDate}
        setSelectedDate={booking.setSelectedDate}
        activeTheaters={activeTheaters}
        selectedTheater={booking.selectedTheater}
        selectedTime={booking.selectedTime}
        onSelectShowtime={booking.handleSelectShowtime}
        selectedCity={selectedCity}
      />

      {/* Pop-up Modal for Seat Selection and Checkout */}
      <SeatBookingModal
        isOpen={booking.isSeatModalOpen}
        onClose={() => booking.setIsSeatModalOpen(false)}
        movie={movie}
        selectedTheater={booking.selectedTheater}
        selectedTime={booking.selectedTime}
        selectedDate={booking.selectedDate}
        bookedSeatsList={booking.bookedSeatsList}
        validSelectedSeats={booking.validSelectedSeats}
        totalPrice={booking.totalPrice}
        isSubmitting={booking.isSubmitting}
        bookingConfirmed={booking.bookingConfirmed}
        confirmedBookingId={booking.confirmedBookingId}
        checkoutBooking={booking.checkoutBooking}
        toggleSeat={booking.toggleSeat}
        handleConfirmBooking={booking.handleConfirmBooking}
      />

      {/* Indian Payment Gateway Modal */}
      <PaymentGatewayModal
        isOpen={booking.isPaymentGatewayOpen}
        onClose={() => booking.setIsPaymentGatewayOpen(false)}
        bookingDetails={
          booking.checkoutBooking || {
            movieTitle: movie.title,
            theaterName: booking.selectedTheater,
            showtime: booking.selectedTime,
            date: booking.selectedDate,
            seats: booking.validSelectedSeats,
            totalPrice: booking.totalPrice,
            bookingId: booking.confirmedBookingId
          }
        }
        onPaymentSuccess={booking.handlePaymentSuccess}
        onPaymentFailure={(err) => showToast(err || 'Payment failed')}
      />
    </div>
  );
}
