import React from 'react';
import { Star } from 'lucide-react';

export default function MovieHeroBanner({ movie, onBookClick }) {
  const genresArray = Array.isArray(movie.genres)
    ? movie.genres
    : (movie.genre ? movie.genre.split(/[\/,]/).map((g) => g.trim()) : ['Action', 'Drama']);
  const languages = movie.languages || (movie.language ? `${movie.language}, English` : 'Hindi, English');
  const durationText = movie.duration
    ? (typeof movie.duration === 'string' && (movie.duration.includes('m') || movie.duration.includes('h'))
      ? movie.duration
      : `${movie.duration}m`)
    : '2h 28m';

  const formattedDate = movie.releaseDate
    ? new Date(movie.releaseDate).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
    : 'Thursday, Nov 12, 2026';

  return (
    <div className="relative w-full overflow-hidden bg-[#111319]">
      <div className="absolute inset-0 z-0">
        <img
          src={movie.backdropImage || movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover object-top opacity-60 filter blur-sm"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#090a0e] via-[#090a0e]/90 to-[#090a0e]/70" />
      </div>

      <div className="relative z-10 p-6 sm:p-10 lg:p-12 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Movie Poster */}
        <div className="md:col-span-4 lg:col-span-3 flex justify-center">
          <div className="relative aspect-[2/3] w-56 sm:w-64 md:w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
            <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-white/10 text-[#ede9e3] text-xs font-mono-cinema font-bold flex items-center space-x-1 shadow-md">
              <span>{movie.rating || '3.5'}</span>
              <Star className="w-3 h-3 fill-[#e5a93c] text-[#e5a93c] ml-0.5 inline" />
            </div>
          </div>
        </div>

        {/* Metadata & Actions */}
        <div className="md:col-span-8 lg:col-span-9 flex flex-col space-y-3">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#ede9e3] tracking-wide uppercase font-sans leading-tight">
            {movie.title}
          </h1>

          <div className="flex items-center flex-wrap gap-2 text-xs sm:text-sm text-gray-400 font-medium tracking-wide">
            <span className="px-1.5 py-0.5 rounded text-[11px] font-bold bg-white/10 text-[#ede9e3] font-mono-cinema">
              {movie.censorshipRating || movie.certificate || 'UA 16+'}
            </span>
            <span className="text-gray-600">•</span>
            <span className="font-semibold text-gray-300 font-mono-cinema">{durationText}</span>
            <span className="text-gray-600">•</span>
            <span>{formattedDate}</span>
            <span className="text-gray-600">•</span>
            <span className="text-gray-300">{genresArray.join(', ')}</span>
            <span className="text-gray-600">•</span>
            <span className="text-gray-300">{languages}</span>
          </div>

          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-3xl pt-1">
            {movie.synopsis || movie.description || 'An extraordinary cinematic journey filled with drama, intense visuals, and thrilling sequences. Experience it on the biggest cinema screens with immersive Dolby Atmos and IMAX sound.'}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={onBookClick}
              className="btn-cinema px-8 py-3.5 rounded-xl text-xs sm:text-sm tracking-wider uppercase cursor-pointer flex items-center justify-center font-bold"
            >
              <span>Book Tickets</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

