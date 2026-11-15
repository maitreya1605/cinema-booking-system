import React, { createContext, useContext, useState, useEffect } from 'react';
import { RECOMMENDATIONS } from '../data/moviesData';

const CinemaContext = createContext(null);

export const CITIES = ['Delhi', 'Dehradun', 'Bengaluru', 'Chennai'];

export function CinemaProvider({ children }) {
  const [selectedCity, setSelectedCityState] = useState(() => {
    try {
      return localStorage.getItem('selectedCity') || 'Delhi';
    } catch {
      return 'Delhi';
    }
  });

  const setSelectedCity = (city) => {
    setSelectedCityState(city);
    try {
      localStorage.setItem('selectedCity', city);
    } catch {}
  };

  const [movies, setMovies] = useState(RECOMMENDATIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState(null);

  // Modals state
  const [isGiftCardOpen, setIsGiftCardOpen] = useState(false);
  const [isOffersOpen, setIsOffersOpen] = useState(false);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [selectedTrailerId, setSelectedTrailerId] = useState(null);

  // User auth state
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Fetch backend movies and deduplicate with recommendations
  useEffect(() => {
    async function fetchBackendMovies() {
      try {
        const res = await fetch('/api/movies');
        if (res.ok) {
          const data = await res.json();
          if (data && data.movies && data.movies.length > 0) {
            const normalize = (str) =>
              (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');

            const backendFormatted = data.movies.map((m) => ({
              id: m._id,
              _id: m._id,
              title: m.title,
              category: m.genre?.[0] || 'Cinema',
              genre: m.genre ? m.genre.join('/') : 'Action/Drama',
              genres: m.genre || ['Action', 'Drama'],
              genreCategory: m.genre?.[0] || 'Action',
              year: m.releaseDate ? new Date(m.releaseDate).getFullYear().toString() : '2026',
              rating: m.rating || '4.8',
              votes: m.votes || '140K+ Votes',
              posterUrl: m.posterUrl || 'https://image.tmdb.org/t/p/w780/8Y4oJ5iUs3hgPcDB3SIEmsNYjZk.jpg',
              backdropImage: m.backdropImage || m.posterUrl,
              synopsis: m.description,
              description: m.description,
              duration: typeof m.duration === 'number' ? `${m.duration}m` : (m.duration || '120m'),
              languages: m.language ? `${m.language}, English` : 'English, Hindi',
              language: m.language || 'English',
              censorshipRating: m.censorshipRating || m.certificate || 'UA 16+',
              certificate: m.certificate || m.censorshipRating || 'UA 16+'
            }));

            // Merge static recommendations with backend data without duplicating
            const merged = [...RECOMMENDATIONS].map((staticMovie) => {
              const matchedBackend = backendFormatted.find(
                (bm) => normalize(bm.title) === normalize(staticMovie.title)
              );
              if (matchedBackend) {
                return {
                  ...staticMovie,
                  _id: matchedBackend._id,
                  id: matchedBackend._id,
                  staticId: staticMovie.id,
                  duration: matchedBackend.duration || staticMovie.duration,
                  votes: matchedBackend.votes || staticMovie.votes,
                  posterUrl: staticMovie.posterUrl || matchedBackend.posterUrl,
                  censorshipRating: matchedBackend.censorshipRating || staticMovie.censorshipRating || staticMovie.certificate || 'UA 16+',
                  certificate: matchedBackend.certificate || staticMovie.certificate || staticMovie.censorshipRating || 'UA 16+'
                };
              }
              return {
                ...staticMovie,
                censorshipRating: staticMovie.censorshipRating || staticMovie.certificate || 'UA 16+',
                certificate: staticMovie.certificate || staticMovie.censorshipRating || 'UA 16+'
              };
            });

            // Append backend movies not present in recommendations
            backendFormatted.forEach((bm) => {
              const exists = merged.some(
                (m) => normalize(m.title) === normalize(bm.title)
              );
              if (!exists) {
                merged.push(bm);
              }
            });

            setMovies(merged);
          }
        }
      } catch (err) {
        console.log('Backend movies notice:', err.message);
      }
    }
    fetchBackendMovies();
  }, []);

  // Fetch backend theaters dynamically from /api/theaters
  const [theaters, setTheaters] = useState([]);
  const [isLoadingTheaters, setIsLoadingTheaters] = useState(false);

  const fetchTheaters = async (city) => {
    setIsLoadingTheaters(true);
    try {
      const url = city && city !== 'All' ? `/api/theaters?city=${encodeURIComponent(city)}` : '/api/theaters';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data && data.theaters) {
          setTheaters(data.theaters);
        }
      }
    } catch (err) {
      console.log('Backend theaters notice:', err.message);
    } finally {
      setIsLoadingTheaters(false);
    }
  };

  useEffect(() => {
    fetchTheaters();
  }, []);

  const showToast = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const login = (user, token) => {
    if (token) localStorage.setItem('token', token);
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      setCurrentUser(user);
      showToast(`Welcome back, ${user.name}!`);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    showToast('Signed out successfully');
  };

  const openTrailer = (trailerId) => {
    setSelectedTrailerId(trailerId);
    setIsTrailerOpen(true);
  };

  return (
    <CinemaContext.Provider
      value={{
        movies,
        theaters,
        isLoadingTheaters,
        fetchTheaters,
        selectedCity,
        setSelectedCity,
        cities: CITIES,
        searchQuery,
        setSearchQuery,
        notification,
        showToast,
        currentUser,
        login,
        logout,
        // Modals
        isGiftCardOpen,
        setIsGiftCardOpen,
        isOffersOpen,
        setIsOffersOpen,
        isTrailerOpen,
        setIsTrailerOpen,
        selectedTrailerId,
        openTrailer
      }}
    >
      {children}
    </CinemaContext.Provider>
  );
}

export function useCinema() {
  const context = useContext(CinemaContext);
  if (!context) {
    throw new Error('useCinema must be used within a CinemaProvider');
  }
  return context;
}

