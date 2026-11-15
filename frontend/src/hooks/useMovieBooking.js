import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export function useMovieBooking({
  movie,
  activeTheaters = [],
  showToast,
  currentUser,
  logout,
  locationState,
  onBookingSuccess
}) {
  const navigate = useNavigate();

  // Selected booking states
  const [selectedDate, setSelectedDate] = useState(locationState?.selectedDate || 'Tomorrow, 13 Nov');
  const [selectedTime, setSelectedTime] = useState(locationState?.selectedTime || null);
  const [selectedTheater, setSelectedTheater] = useState(locationState?.selectedTheater || activeTheaters[0]?.name || 'PIXORA IMAX');
  const [isSeatModalOpen, setIsSeatModalOpen] = useState(Boolean(locationState?.selectedSeats?.length));
  const [isPaymentGatewayOpen, setIsPaymentGatewayOpen] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState(locationState?.selectedSeats || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState(null);
  const [checkoutBooking, setCheckoutBooking] = useState(null);

  // Live show details from backend
  const [liveShow, setLiveShow] = useState(null);
  const [bookedSeatsList, setBookedSeatsList] = useState([]);

  const getSeatPrice = (seatId) => (['E', 'F', 'G', 'H', 'J'].includes(seatId[0]) ? 340 : 290);
  const validSelectedSeats = useMemo(() => selectedSeats.filter((s) => !bookedSeatsList.includes(s)), [selectedSeats, bookedSeatsList]);
  const totalPrice = validSelectedSeats.reduce((sum, seatId) => sum + getSeatPrice(seatId), 0);

  // Sync selected theater when activeTheaters loads
  useEffect(() => {
    if (activeTheaters.length > 0) setSelectedTheater(activeTheaters[0].name);
    setSelectedTime(null);
    setIsSeatModalOpen(false);
    setSelectedSeats([]);
  }, [activeTheaters]);

  // Fetch real shows from backend
  const fetchShowData = useCallback(async (silent = false) => {
    try {
      const res = await fetch('/api/shows');
      if (res.ok) {
        const data = await res.json();
        if (data?.shows?.length > 0) {
          const match = data.shows.find(
            (s) =>
              (s.movie?.title && s.movie.title.toLowerCase() === movie?.title?.toLowerCase()) ||
              (s.movie?._id === movie?._id) ||
              (movie?._id && s.movie === movie?._id)
          ) || data.shows[0];

          if (match) {
            setLiveShow(match);
            if (Array.isArray(match.bookedSeats)) setBookedSeatsList(match.bookedSeats);
          }
        }
      }
    } catch (err) {
      if (!silent) console.log('Using local show schedule:', err.message);
    }
  }, [movie]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchShowData();
  }, [fetchShowData]);

  // Real-time live polling while seat modal is open
  useEffect(() => {
    if (!isSeatModalOpen || isPaymentGatewayOpen || bookingConfirmed) return;
    const interval = setInterval(() => fetchShowData(true), 3000);
    return () => clearInterval(interval);
  }, [isSeatModalOpen, isPaymentGatewayOpen, bookingConfirmed, fetchShowData]);

  // Strip occupied seats if another user booked them
  useEffect(() => {
    if (isPaymentGatewayOpen || bookingConfirmed || checkoutBooking) return;
    setSelectedSeats((prev) => {
      const conflicts = prev.filter((s) => bookedSeatsList.includes(s));
      if (conflicts.length > 0) {
        showToast(`Seat(s) ${conflicts.join(', ')} is occupied and was unselected.`);
        return prev.filter((s) => !bookedSeatsList.includes(s));
      }
      return prev;
    });
  }, [bookedSeatsList, isPaymentGatewayOpen, bookingConfirmed, checkoutBooking, showToast]);

  const toggleSeat = (seatId) => {
    if (bookedSeatsList.includes(seatId)) {
      showToast(`Seat ${seatId} is already occupied.`);
      setSelectedSeats((prev) => prev.filter((s) => s !== seatId));
      return;
    }
    setSelectedSeats((prev) => (prev.includes(seatId) ? prev.filter((s) => s !== seatId) : [...prev, seatId]));
  };

  const handleConfirmBooking = () => {
    const activeSeats = selectedSeats.filter((s) => !bookedSeatsList.includes(s));
    if (activeSeats.length === 0) {
      showToast('Please select at least one available seat.');
      setSelectedSeats([]);
      return;
    }

    if (activeSeats.length !== selectedSeats.length) {
      setSelectedSeats(activeSeats);
      showToast('Some selected seats were already booked. Selection updated.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!currentUser || !token) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (logout) logout();
      showToast('Please sign in to proceed with booking.');
      navigate('/auth', {
        state: {
          from: `/movie/${movie?.id || movie?._id}`,
          movie,
          selectedSeats: activeSeats,
          selectedTime,
          selectedDate,
          selectedTheater
        }
      });
      return;
    }

    proceedWithReservation(token, activeSeats);
  };

  const proceedWithReservation = async (token, seatsToReserve = validSelectedSeats) => {
    if (seatsToReserve.length === 0) {
      showToast('Please select at least one available seat.');
      return;
    }

    const calculatedAmount = seatsToReserve.reduce((sum, s) => sum + getSeatPrice(s), 0);
    const initialBookingSession = {
      movieTitle: movie.title,
      theaterName: selectedTheater,
      showtime: selectedTime,
      date: selectedDate,
      seats: [...seatsToReserve],
      totalPrice: calculatedAmount > 0 ? calculatedAmount : 340,
      bookingId: null
    };
    setCheckoutBooking(initialBookingSession);

    setIsSubmitting(true);
    try {
      const showId = liveShow?._id || '6af1fcba7a37522313c73a44';
      const bookingRes = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          showId,
          requestedSeats: seatsToReserve,
          totalPrice: calculatedAmount
        })
      });

      if (bookingRes.ok) {
        const bookingData = await bookingRes.json();
        const bId = bookingData.bookingId || bookingData.booking?._id;
        setConfirmedBookingId(bId);
        setCheckoutBooking((prev) => ({
          ...(prev || initialBookingSession),
          bookingId: bId,
          totalPrice: calculatedAmount
        }));
        setIsPaymentGatewayOpen(true);
      } else {
        const errData = await bookingRes.json().catch(() => ({}));
        if (bookingRes.status === 401 || errData.error?.toLowerCase().includes('token') || errData.message?.toLowerCase().includes('token')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          if (logout) logout();
          showToast('Your session has expired. Please sign in to complete your booking.');
          navigate('/auth', {
            state: {
              from: `/movie/${movie.id || movie._id}`,
              movie,
              selectedSeats: seatsToReserve,
              selectedTime,
              selectedDate,
              selectedTheater
            }
          });
          return;
        }

        if (bookingRes.status === 409) {
          showToast(errData.message || 'Seat conflict: A selected seat is already held by another user.');
          fetchShowData(true);
          setSelectedSeats((prev) => prev.filter((s) => !seatsToReserve.includes(s)));
          setCheckoutBooking(null);
        } else {
          showToast(errData.error || errData.message || 'Failed to reserve seats.');
          setCheckoutBooking(null);
        }
      }
    } catch {
      showToast('Unable to reach reservation service. Please check your connection.');
      setCheckoutBooking(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = ({ paymentMethod }) => {
    const finalPrice = checkoutBooking?.totalPrice || totalPrice;
    const finalSeats = checkoutBooking?.seats || validSelectedSeats;
    setIsPaymentGatewayOpen(false);
    setBookingConfirmed(true);
    showToast(`Payment of ₹${finalPrice} successful via ${paymentMethod}!`);
    if (onBookingSuccess) onBookingSuccess(movie, finalSeats, finalPrice);
  };

  const handleSelectShowtime = (theaterName, time) => {
    setSelectedTheater(theaterName);
    if (selectedTime !== time || selectedTheater !== theaterName) {
      setSelectedSeats([]);
    }
    setSelectedTime(time);
    setIsSeatModalOpen(true);
  };

  const scrollToBooking = () => {
    if (selectedTime) {
      setIsSeatModalOpen(true);
    } else {
      const elem = document.getElementById('tickets-booking-section');
      if (elem) elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return {
    selectedDate,
    setSelectedDate,
    selectedTime,
    selectedTheater,
    isSeatModalOpen,
    setIsSeatModalOpen,
    isPaymentGatewayOpen,
    setIsPaymentGatewayOpen,
    selectedSeats,
    isSubmitting,
    bookingConfirmed,
    confirmedBookingId,
    checkoutBooking,
    bookedSeatsList,
    validSelectedSeats,
    totalPrice,
    toggleSeat,
    handleConfirmBooking,
    handlePaymentSuccess,
    handleSelectShowtime,
    scrollToBooking
  };
}

