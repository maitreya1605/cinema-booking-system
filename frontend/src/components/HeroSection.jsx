import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';

export const BMS_BANNERS = [
  {
    id: 'ramayana',
    movieTitle: 'RAMAYANA',
    certificate: 'U',
    duration: '3h 15m',
    releaseDate: 'Thursday, Nov 5, 2026',
    description: 'An ancient epic follows a young prince and princess whose marriage and subsequent exile mark the beginning of a legendary journey. Their story of love, duty and destiny shapes the cosmos.',
    bgImage: 'https://upload.wikimedia.org/wikipedia/en/4/48/Ramayana_Part_1_%28poster%29.jpg',
    posterUrl: 'https://upload.wikimedia.org/wikipedia/en/4/48/Ramayana_Part_1_%28poster%29.jpg',
    movieRef: 'RAMAYANA',
    rating: '4.9',
    genres: ['MYTHOLOGY', 'ACTION', 'DRAMA'],
    languages: 'Hindi, Tamil, Telugu, Kannada, English',
    trailerId: 't-ramayana'
  },
  {
    id: 'the-batman',
    movieTitle: 'THE BATMAN',
    certificate: 'UA 16+',
    censorshipRating: 'UA 16+',
    duration: '2h 56m',
    releaseDate: 'Thursday, Nov 12, 2026',
    description: "When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate the city's hidden corruption and question his family's involvement.",
    bgImage: 'https://image.tmdb.org/t/p/w1280/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg',
    posterUrl: 'https://image.tmdb.org/t/p/w780/74xTEgt7R36Fpooo50r9T25onhq.jpg',
    movieRef: 'The Batman',
    rating: '4.6',
    genres: ['ACTION', 'CRIME', 'DRAMA'],
    languages: 'English, Hindi',
    trailerId: 't-batman'
  },
  {
    id: 'avatar-way-of-water',
    movieTitle: 'AVATAR: THE WAY OF WATER',
    certificate: 'UA 16+',
    censorshipRating: 'UA 16+',
    duration: '3h 12m',
    releaseDate: 'Thursday, Nov 12, 2026',
    description: 'Jake Sully lives with his newfound family on the extrasolar moon Pandora. Once a familiar threat returns to finish what was started, Jake must work with Neytiri to protect their clan.',
    bgImage: 'https://image.tmdb.org/t/p/w1280/s16H6tpK2utvwDtzZ8Qy4qm5Emw.jpg',
    posterUrl: 'https://image.tmdb.org/t/p/w780/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg',
    movieRef: 'Avatar: The Way of Water',
    trailerId: 't-avatar'
  },
  {
    id: 'spiderman-no-way-home',
    movieTitle: 'SPIDER-MAN: NO WAY HOME',
    certificate: 'UA 16+',
    censorshipRating: 'UA 16+',
    duration: '2h 28m',
    releaseDate: 'Thursday, Nov 12, 2026',
    description: "With Spider-Man's identity revealed, Peter asks Doctor Strange for help. A dangerous spell fractures reality, unleashing iconic multiverse villains into our world.",
    bgImage: 'https://image.tmdb.org/t/p/w1280/iQFcwSGbZXMkeyKrxbPnwnRo5fl.jpg',
    posterUrl: 'https://image.tmdb.org/t/p/w780/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
    movieRef: 'Spider-Man: No Way Home',
    trailerId: 't-spiderman'
  },
  {
    id: 'black-panther-wakanda',
    movieTitle: 'BLACK PANTHER: WAKANDA FOREVER',
    certificate: 'UA 16+',
    censorshipRating: 'UA 16+',
    duration: '2h 41m',
    releaseDate: 'Thursday, Nov 12, 2026',
    description: "Queen Ramonda, Shuri, M'Baku, Okoye and the Dora Milaje fight to protect their nation from intervening world powers in the wake of King T'Challa's death.",
    bgImage: 'https://image.tmdb.org/t/p/w1280/xDMIl84Qo5Tsu62c9DGWhmPI67A.jpg',
    posterUrl: 'https://image.tmdb.org/t/p/w780/83H0C66AcvkwpG2738VCTHMY9uv.jpg',
    movieRef: 'Black Panther: Wakanda Forever',
    trailerId: 't-blackpanther'
  },
  {
    id: 'dune-part-one',
    movieTitle: 'DUNE: PART ONE',
    certificate: 'U/A',
    duration: '2h 35m',
    releaseDate: 'Thursday, Nov 12, 2026',
    description: "A noble family becomes embroiled in a war for control over the galaxy's most valuable asset on a dangerous desert planet, as young Paul Atreides navigates his epic destiny.",
    bgImage: 'https://image.tmdb.org/t/p/w1280/jYEW5xZkZk2WTrdbMGAPFuBqbDc.jpg',
    posterUrl: 'https://image.tmdb.org/t/p/w780/d5NXSklXo0qyIYkgV94XAgMIckC.jpg',
    movieRef: 'Dune: Part One',
    trailerId: 't-dune'
  }
];

export default function HeroSection({ onBookMovie, onWatchTrailer }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const total = BMS_BANNERS.length;

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused, total]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const currentBanner = BMS_BANNERS[currentIndex];

  const handleBook = () => {
    if (onBookMovie) {
      onBookMovie({
        id: currentBanner.id,
        title: currentBanner.movieTitle,
        description: currentBanner.description,
        synopsis: currentBanner.description,
        posterUrl: currentBanner.posterUrl,
        backdropImage: currentBanner.bgImage,
        certificate: currentBanner.certificate || 'UA 16+',
        censorshipRating: currentBanner.censorshipRating || currentBanner.certificate || 'UA 16+',
        duration: currentBanner.duration,
        rating: currentBanner.rating || '4.8',
        genres: currentBanner.genres || ['ACTION', 'DRAMA'],
        genre: currentBanner.genre || 'Action / Drama',
        genreCategory: 'Action',
        languages: currentBanner.languages || 'Hindi, English',
        year: '2026',
        releaseDate: currentBanner.releaseDate
      });
    }
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative -mx-2 sm:-mx-3 lg:-mx-4 w-[calc(100%+16px)] sm:w-[calc(100%+24px)] lg:w-[calc(100%+32px)] overflow-hidden select-none"
    >
      {/* Banner Container stretched till extreme ends without side borders and with square edges */}
      <div className="relative w-full min-h-[260px] sm:min-h-[290px] md:min-h-[330px] rounded-none overflow-hidden bg-[#10141f] border-y border-white/10 border-x-0 shadow-2xl flex items-center">

        {/* Background Cover Image with Enhanced Visibility (+10% visibility improvement) */}
        <img
          key={currentBanner.id}
          src={currentBanner.bgImage}
          alt={currentBanner.movieTitle}
          className="absolute inset-0 w-full h-full object-cover object-center opacity-80 filter brightness-[0.55] contrast-115 select-none pointer-events-none transition-opacity duration-700"
        />

        {/* Deep Slate/Midnight Gradient Overlays for Ambient Texture and Crystal Clear Typography */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#10141f] via-[#10141f]/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#10141f] via-transparent to-[#10141f]/50 z-10 pointer-events-none" />

        {/* Main Content Layout stretched edge to edge */}
        <div className="relative w-full h-full flex flex-col md:flex-row items-start md:items-center justify-between px-6 sm:px-10 md:px-14 lg:px-16 py-8 md:py-10 z-20 gap-6">

          {/* LEFT: NAME • DURATION & META • DESCRIPTION • BOOK BUTTON */}
          <div className="flex-1 flex flex-col justify-center space-y-3 max-w-2xl">
            {/* NAME: Large Bold White Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-[#ede9e3] tracking-wide uppercase font-sans leading-tight">
              {currentBanner.movieTitle}
            </h1>

            {/* DURATION & META LINE: U • 3h 15m • Thursday, Nov 5, 2026 */}
            <div className="flex items-center flex-wrap gap-2 text-xs sm:text-sm text-gray-400 font-medium tracking-wide">
              <span className="px-1.5 py-0.5 rounded text-[11px] font-bold bg-white/10 text-[#ede9e3] font-mono-cinema">{currentBanner.certificate}</span>
              <span className="text-gray-600">•</span>
              <span className="font-semibold text-gray-300 font-mono-cinema">{currentBanner.duration}</span>
              <span className="text-gray-600">•</span>
              <span className="text-gray-300">{currentBanner.releaseDate}</span>
            </div>

            {/* DESCRIPTION: 2-line clean synopsis */}
            <p className="text-xs sm:text-sm text-gray-300 line-clamp-2 sm:line-clamp-3 leading-relaxed font-normal pt-0.5">
              {currentBanner.description}
            </p>

            {/* BOOK BUTTON: Crisp Warm Amber Cinema Button */}
            <div className="pt-2 sm:pt-3">
              <button
                onClick={handleBook}
                className="btn-cinema px-8 sm:px-10 py-2.5 rounded-xl text-xs sm:text-sm tracking-wider uppercase cursor-pointer"
              >
                Book Tickets
              </button>
            </div>
          </div>

          {/* RIGHT: Movie Poster Card with Centered Play Button */}
          <div className="relative flex-shrink-0 self-center md:self-auto flex items-center pr-2 sm:pr-4">
            <div
              onClick={() => onWatchTrailer && onWatchTrailer(currentBanner.trailerId)}
              title="Watch Trailer"
              className="group/poster relative w-32 sm:w-40 md:w-44 lg:w-48 aspect-[2/3] rounded-xl sm:rounded-2xl overflow-hidden border border-white/15 shadow-2xl cursor-pointer transition-all duration-300 hover:scale-105 hover:border-[#e5a93c]/60"
            >
              <img
                src={currentBanner.posterUrl}
                alt={currentBanner.movieTitle}
                className="w-full h-full object-cover"
              />

              {/* Dark Hover Tint & Round Play Button Overlay */}
              <div className="absolute inset-0 bg-black/40 group-hover/poster:bg-black/20 transition-colors flex items-center justify-center">
                <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/70 backdrop-blur-md border border-white/40 group-hover/poster:border-[#e5a93c] group-hover/poster:scale-110 flex items-center justify-center shadow-2xl transition-all">
                  <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-white text-white ml-0.5 group-hover/poster:fill-[#e5a93c] group-hover/poster:text-[#e5a93c] transition-colors" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Nav Arrow Left */}
        <button
          onClick={prevSlide}
          title="Previous"
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/70 hover:bg-black text-white hover:text-[#e5a93c] flex items-center justify-center border border-white/10 hover:border-[#e5a93c]/50 shadow-lg z-30 transition-all cursor-pointer backdrop-blur-sm"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Carousel Nav Arrow Right */}
        <button
          onClick={nextSlide}
          title="Next"
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/70 hover:bg-black text-white hover:text-[#e5a93c] flex items-center justify-center border border-white/10 hover:border-[#e5a93c]/50 shadow-lg z-30 transition-all cursor-pointer backdrop-blur-sm"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

      </div>
    </div>
  );
}
