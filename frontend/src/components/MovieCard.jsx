import React from 'react';
import { Star } from 'lucide-react';

export default function MovieCard({ movie, onSelect }) {
  // Format rating for top-right badge (e.g. "3.5 ★")
  const ratingValue = movie.rating
    ? (typeof movie.rating === 'string' && movie.rating.includes('/')
        ? (parseFloat(movie.rating) / 2).toFixed(1)
        : movie.rating)
    : '3.5';

  // Format Line 1: "U/A • HORROR • COMEDY"
  const certificate = movie.certificate || 'U/A';
  const genresArray = Array.isArray(movie.genres)
    ? movie.genres
    : (movie.genre ? movie.genre.split(/[\/,]/).map(g => g.trim().toUpperCase()) : ['HORROR', 'COMEDY']);
  
  const metaLine = `${certificate} • ${genresArray.slice(0, 2).join(' • ')}`;

  // Format Line 3: "Hindi, English"
  const languagesLine = movie.languages || (movie.language ? `${movie.language}, English` : 'Hindi, English');

  return (
    <div
      onClick={() => onSelect && onSelect(movie)}
      className="group flex flex-col cursor-pointer transition-transform duration-200 hover:-translate-y-1 select-none"
    >
      {/* Poster Image Container with authentic 2:3 cinematic framing */}
      <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-[#111319] border border-white/[0.08] shadow-md group-hover:border-[#e5a93c]/50 group-hover:shadow-xl group-hover:shadow-[#e5a93c]/5 transition-all">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Top-Right Rating Badge: "3.5 ★" */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <div className="px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-[#ede9e3] text-[11px] font-mono-cinema font-medium flex items-center space-x-1 shadow-md">
            <span>{ratingValue}</span>
            <Star className="w-2.5 h-2.5 fill-[#e5a93c] text-[#e5a93c] ml-0.5 inline" />
          </div>
        </div>
      </div>

      {/* Text UI & Placement Below the Poster */}
      <div className="pt-2 px-0.5 flex flex-col">
        {/* Line 1: Certification & Genres */}
        <p className="text-[10px] sm:text-[11px] text-gray-400 font-semibold tracking-wider uppercase truncate font-mono-cinema">
          {metaLine}
        </p>

        {/* Line 2: Title */}
        <h3
          title={movie.title}
          className="text-sm sm:text-base font-bold text-[#ede9e3] mt-0.5 leading-snug line-clamp-1 group-hover:text-[#e5a93c] transition-colors"
        >
          {movie.title}
        </h3>

        {/* Line 3: Languages */}
        <p className="text-xs text-gray-500 mt-0.5 truncate">
          {languagesLine}
        </p>
      </div>
    </div>
  );
}
