import React, { useState, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import MovieCard from './MovieCard';

export default function RecommendationsSection({
  movies,
  onSelectMovie
}) {
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');

  const genres = ['All', 'Action', 'Horror', 'Comedy', 'Drama', 'Sci-Fi', 'Thriller', 'Animation'];
  const languages = ['All', 'Hindi', 'English', 'Telugu', 'Tamil'];

  // Filter movies by dropdowns
  const filteredList = useMemo(() => {
    return movies.filter(movie => {
      // Genre filter
      const matchGenre = selectedGenre === 'All' ||
        (movie.genreCategory && movie.genreCategory.toLowerCase() === selectedGenre.toLowerCase()) ||
        (movie.genres && movie.genres.some(g => g.toLowerCase() === selectedGenre.toLowerCase())) ||
        (movie.genre && movie.genre.toLowerCase().includes(selectedGenre.toLowerCase()));

      // Language filter
      const matchLang = selectedLanguage === 'All' ||
        (movie.languages && movie.languages.toLowerCase().includes(selectedLanguage.toLowerCase())) ||
        (movie.language && movie.language.toLowerCase().includes(selectedLanguage.toLowerCase()));

      return matchGenre && matchLang;
    });
  }, [movies, selectedGenre, selectedLanguage]);

  return (
    <section className="w-full mt-8 pb-4 flex flex-col space-y-4">
      {/* Header: "Now Showing" (Left) & "All Genres" + "All Language" (Right) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full px-1">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#ede9e3] tracking-tight">
            Now Showing
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
            Curated cinema releases in high definition
          </p>
        </div>

        {/* Top-Right Dropdowns */}
        <div className="flex items-center space-x-3">
          {/* All Genres Dropdown */}
          <div className="relative">
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="appearance-none px-3.5 py-1.5 pr-8 rounded-xl bg-[#111319] text-xs font-medium text-[#ede9e3] border border-white/10 hover:border-[#e5a93c]/40 focus:outline-none focus:border-[#e5a93c] cursor-pointer shadow-sm transition-colors"
            >
              <option value="All">All Genres</option>
              {genres.filter(g => g !== 'All').map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* All Language Dropdown */}
          <div className="relative">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="appearance-none px-3.5 py-1.5 pr-8 rounded-xl bg-[#111319] text-xs font-medium text-[#ede9e3] border border-white/10 hover:border-[#e5a93c]/40 focus:outline-none focus:border-[#e5a93c] cursor-pointer shadow-sm transition-colors"
            >
              <option value="All">All Language</option>
              {languages.filter(l => l !== 'All').map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Movie Cards Grid (5 columns wrapping to next row, exact layout as screenshot) */}
      {filteredList.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5 w-full">
          {filteredList.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onSelect={onSelectMovie}
            />
          ))}
        </div>
      ) : (
        <div className="w-full py-16 flex flex-col items-center justify-center text-center rounded-2xl bg-[#0f1015] border border-white/10">
          <p className="text-gray-400 text-sm font-medium">No movies found for selected genre and language.</p>
          <button
            onClick={() => {
              setSelectedGenre('All');
              setSelectedLanguage('All');
            }}
            className="mt-3 text-xs text-[#d4af37] hover:text-[#f5e6b3] underline font-semibold cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}
    </section>
  );
}
