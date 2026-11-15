import React from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import RecommendationsSection from '../components/RecommendationsSection';
import { useCinema } from '../context/CinemaContext';

export default function CatalogPage() {
  const navigate = useNavigate();
  const { movies, searchQuery, setIsGiftCardOpen, openTrailer } = useCinema();

  const handleBookMovie = (movie) => {
    navigate(`/movie/${movie.id || movie._id}`, { state: { movie } });
  };

  // Filter movies by search query
  const displayedMovies = movies.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.title.toLowerCase().includes(q) ||
      (m.synopsis && m.synopsis.toLowerCase().includes(q)) ||
      (m.genre && m.genre.toLowerCase().includes(q))
    );
  });

  return (
    <div className="w-full flex flex-col space-y-6">
      {/* Full-Width Stretched Extreme-to-Extreme Cinematic Banner */}
      <HeroSection
        onBookMovie={handleBookMovie}
        onWatchTrailer={(trailerId) => openTrailer && openTrailer(trailerId)}
      />

      {/* Recommendations Section (Now Showing with exact original card orientation & layout) */}
      <RecommendationsSection
        movies={displayedMovies}
        onSelectMovie={handleBookMovie}
      />
    </div>
  );
}

