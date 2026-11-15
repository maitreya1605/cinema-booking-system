const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const mongoose = require('mongoose');
const Movie = require('./models/movie');
const Screen = require('./models/screen');
const Show = require('./models/show');
const User = require('./models/user');
const Booking = require('./models/booking');
const bcrypt = require('bcryptjs');

const seedData = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding.");

    // 1. Clear existing seed collections
    await Show.deleteMany({});
    await Movie.deleteMany({});
    await Screen.deleteMany({});

    console.log("Cleared old shows, movies, and screens.");

    // 2. Create Screens
    const screen1 = await Screen.create({
      name: "IMAX Hall 1 - Laser",
      capacity: 48,
      seatLayout: {
        rows: [
          { rowId: "A", totalSeats: 12, category: "Standard" },
          { rowId: "B", totalSeats: 12, category: "Premium" },
          { rowId: "C", totalSeats: 12, category: "Premium" },
          { rowId: "D", totalSeats: 12, category: "VIP" }
        ]
      }
    });

    const screen2 = await Screen.create({
      name: "Dolby Atmos Cinema 2",
      capacity: 36,
      seatLayout: {
        rows: [
          { rowId: "A", totalSeats: 12, category: "Standard" },
          { rowId: "B", totalSeats: 12, category: "Standard" },
          { rowId: "C", totalSeats: 12, category: "VIP" }
        ]
      }
    });

    console.log("Screens created.");

    // 3. Create Movies in exact matching order of NOW_SHOWING_MOVIES (15 movies)
    const moviesData = [
      {
        title: "RAMAYANA",
        description: "An ancient epic follows Prince Rama and Princess Sita whose marriage and subsequent fourteen-year exile mark the beginning of a legendary journey. When the ten-headed demon king Ravana abducts Sita, Lord Rama, joined by Lakshmana and an army of Vanaras led by Lord Hanuman, embarks on a righteous crusade across the sea to destroy darkness and restore Dharma.",
        genre: ["Action", "Drama", "Mythology"],
        duration: 195,
        language: "Hindi, Tamil, Telugu, Kannada, English",
        posterUrl: "https://upload.wikimedia.org/wikipedia/en/4/48/Ramayana_Part_1_%28poster%29.jpg",
        backdropImage: "https://upload.wikimedia.org/wikipedia/en/4/48/Ramayana_Part_1_%28poster%29.jpg",
        rating: "4.9",
        votes: "250K+ Votes",
        censorshipRating: "U",
        certificate: "U",
        releaseDate: new Date("2026-11-05")
      },
      {
        title: "Stree 2 Sarkate Ka Aatank",
        description: "The town of Chanderi is haunted once again by a terrifying headless monster known as Sarkata. Vicky and his friends must unite with the mysterious Stree to defeat the evil curse.",
        genre: ["Horror", "Comedy"],
        duration: 147,
        language: "Hindi, English",
        posterUrl: "https://image.tmdb.org/t/p/w780/nfnhwfUEFuSOxxf4jDdBlY6Lccw.jpg",
        backdropImage: "https://image.tmdb.org/t/p/w1280/nfnhwfUEFuSOxxf4jDdBlY6Lccw.jpg",
        rating: "4.8",
        votes: "310K+ Votes",
        censorshipRating: "UA 16+",
        certificate: "UA 16+",
        releaseDate: new Date("2024-08-15")
      },
      {
        title: "Devra Part 1",
        description: "A fearless coastal chieftain wages a relentless war against ruthless maritime smugglers to protect his clan and preserve ancient warrior heritage.",
        genre: ["Action", "Drama"],
        duration: 178,
        language: "Hindi, English, Telugu",
        posterUrl: "https://image.tmdb.org/t/p/w780/lQfuaXjANoTsdx5iS0gCXlK9D2L.jpg",
        backdropImage: "https://image.tmdb.org/t/p/w1280/lQfuaXjANoTsdx5iS0gCXlK9D2L.jpg",
        rating: "4.4",
        votes: "160K+ Votes",
        censorshipRating: "UA 16+",
        certificate: "UA 16+",
        releaseDate: new Date("2024-09-27")
      },
      {
        title: "Yudhra",
        description: "A young man with intense anger issues goes undercover into an unforgiving criminal syndicate to avenge his parents and dismantle the drug cartel from within.",
        genre: ["Action", "Thriller"],
        duration: 142,
        language: "Hindi, English",
        posterUrl: "https://image.tmdb.org/t/p/w780/cwmVHD41mGDQyPyCAsR8x6aMGc2.jpg",
        backdropImage: "https://image.tmdb.org/t/p/w1280/cwmVHD41mGDQyPyCAsR8x6aMGc2.jpg",
        rating: "4.0",
        votes: "85K+ Votes",
        censorshipRating: "UA 16+",
        certificate: "UA 16+",
        releaseDate: new Date("2024-09-20")
      },
      {
        title: "Dancing Village: The Curse Begins",
        description: "A student dancer travels to an isolated mystical village to appease a spirit entity only to discover a terrifying ancient curse that demands sacrifice.",
        genre: ["Horror", "Mystery"],
        duration: 122,
        language: "Hindi, English",
        posterUrl: "https://upload.wikimedia.org/wikipedia/en/1/14/Dancing_Village_The_Curse_Begins_film_poster.jpg",
        backdropImage: "https://upload.wikimedia.org/wikipedia/en/1/14/Dancing_Village_The_Curse_Begins_film_poster.jpg",
        rating: "3.8",
        votes: "52K+ Votes",
        censorshipRating: "A",
        certificate: "A",
        releaseDate: new Date("2024-04-11")
      },
      {
        title: "Binny And Family",
        description: "A heartwarming and comedic story of three generations discovering love, humor, and shared bonds across cultural divides.",
        genre: ["Drama", "Comedy"],
        duration: 121,
        language: "Hindi, English",
        posterUrl: "https://upload.wikimedia.org/wikipedia/en/7/72/Binny_And_Family_film_poster.jpg",
        backdropImage: "https://upload.wikimedia.org/wikipedia/en/7/72/Binny_And_Family_film_poster.jpg",
        rating: "4.1",
        votes: "40K+ Votes",
        censorshipRating: "U",
        certificate: "U",
        releaseDate: new Date("2024-09-27")
      },
      {
        title: "The Batman",
        description: "When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate the city's hidden corruption and question his family's involvement.",
        genre: ["Action", "Crime", "Drama"],
        duration: 176,
        language: "English, Hindi",
        posterUrl: "https://image.tmdb.org/t/p/w780/74xTEgt7R36Fpooo50r9T25onhq.jpg",
        backdropImage: "https://image.tmdb.org/t/p/w1280/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg",
        rating: "4.6",
        votes: "180K+ Votes",
        censorshipRating: "UA 16+",
        certificate: "UA 16+",
        releaseDate: new Date("2022-03-04")
      },
      {
        title: "Avatar: The Way of Water",
        description: "Jake Sully lives with his newfound family formed on the extrasolar moon Pandora. Once a familiar threat returns, Jake must work with Neytiri to protect their clan.",
        genre: ["Sci-Fi", "Adventure", "Action"],
        duration: 192,
        language: "English, Hindi, Telugu",
        posterUrl: "https://image.tmdb.org/t/p/w780/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
        backdropImage: "https://image.tmdb.org/t/p/w1280/s16H6tpK2utvwDtzZ8Qy4qm5Emw.jpg",
        rating: "4.7",
        votes: "420K+ Votes",
        censorshipRating: "UA 16+",
        certificate: "UA 16+",
        releaseDate: new Date("2022-12-16")
      },
      {
        title: "Spider-Man: No Way Home",
        description: "With Spider-Man's identity now revealed, Peter asks Doctor Strange for help. A dangerous spell fractures reality, unleashing iconic multiverse villains into our world.",
        genre: ["Action", "Adventure", "Sci-Fi"],
        duration: 148,
        language: "English, Hindi, Tamil",
        posterUrl: "https://image.tmdb.org/t/p/w780/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
        backdropImage: "https://image.tmdb.org/t/p/w1280/iQFcwSGbZXMkeyKrxbPnwnRo5fl.jpg",
        rating: "4.9",
        votes: "550K+ Votes",
        censorshipRating: "UA 13+",
        certificate: "UA 13+",
        releaseDate: new Date("2021-12-17")
      },
      {
        title: "Doctor Strange in the Multiverse of Madness",
        description: "Doctor Strange teams up with a mysterious teenage girl from his dreams who can travel across the multiverse to battle unprecedented cosmic threats.",
        genre: ["Action", "Fantasy", "Sci-Fi"],
        duration: 126,
        language: "English, Hindi",
        posterUrl: "https://image.tmdb.org/t/p/w780/9Gtg2DzBhmYamXBS1hKAhiwbBKS.jpg",
        backdropImage: "https://image.tmdb.org/t/p/w1280/wcKFYIiVDvRURrzglV9kGu7fpfY.jpg",
        rating: "4.3",
        votes: "160K+ Votes",
        censorshipRating: "UA 13+",
        certificate: "UA 13+",
        releaseDate: new Date("2022-05-06")
      },
      {
        title: "Black Panther: Wakanda Forever",
        description: "The people of Wakanda fight to protect their home from intervening world powers as they mourn the death of King T'Challa.",
        genre: ["Action", "Adventure", "Sci-Fi"],
        duration: 161,
        language: "English, Hindi",
        posterUrl: "https://image.tmdb.org/t/p/w780/83H0C66AcvkwpG2738VCTHMY9uv.jpg",
        backdropImage: "https://image.tmdb.org/t/p/w1280/xDMIl84Qo5Tsu62c9DGWhmPI67A.jpg",
        rating: "4.5",
        votes: "140K+ Votes",
        censorshipRating: "UA 16+",
        certificate: "UA 16+",
        releaseDate: new Date("2022-11-11")
      },
      {
        title: "Ghost Soldier",
        description: "Heaven sent, hell to pay. A covert military operative embarks on a perilous high-stakes mission to protect humanity from dark forces across international borders.",
        genre: ["Action", "Drama"],
        duration: 92,
        language: "English",
        posterUrl: "https://image.tmdb.org/t/p/w780/8Y4oJ5iUs3hgPcDB3SIEmsNYjZk.jpg",
        backdropImage: "https://image.tmdb.org/t/p/w1280/8Y4oJ5iUs3hgPcDB3SIEmsNYjZk.jpg",
        rating: "4.5",
        votes: "95K+ Votes",
        censorshipRating: "UA 16+",
        certificate: "UA 16+",
        releaseDate: new Date("2026-11-13")
      },
      {
        title: "Dune: Part One",
        description: "A noble family becomes embroiled in a war for control over the galaxy's most valuable asset on a dangerous desert planet, as young Paul Atreides navigates his epic destiny.",
        genre: ["Sci-Fi", "Adventure"],
        duration: 155,
        language: "English, Hindi",
        posterUrl: "https://image.tmdb.org/t/p/w780/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
        backdropImage: "https://image.tmdb.org/t/p/w1280/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
        rating: "4.6",
        votes: "190K+ Votes",
        censorshipRating: "UA 16+",
        certificate: "UA 16+",
        releaseDate: new Date("2021-10-22")
      },
      {
        title: "Thor: Love and Thunder",
        description: "Thor enlists the help of Valkyrie, Korg and ex-girlfriend Jane Foster to fight Gorr the God Butcher, who intends to make the gods extinct.",
        genre: ["Action", "Adventure", "Comedy"],
        duration: 119,
        language: "English, Hindi",
        posterUrl: "https://image.tmdb.org/t/p/w780/pIkRyD18kl4FhoCNQuWxWu5cBLM.jpg",
        backdropImage: "https://image.tmdb.org/t/p/w1280/pIkRyD18kl4FhoCNQuWxWu5cBLM.jpg",
        rating: "4.1",
        votes: "115K+ Votes",
        censorshipRating: "UA 13+",
        certificate: "UA 13+",
        releaseDate: new Date("2022-07-08")
      },
      {
        title: "Fantastic Beasts: The Secrets of Dumbledore",
        description: "Professor Albus Dumbledore must assist Newt Scamander and his brave team to stop the powerful dark wizard Gellert Grindelwald from seizing control of the wizarding world.",
        genre: ["Fantasy", "Adventure"],
        duration: 142,
        language: "English, Hindi",
        posterUrl: "https://image.tmdb.org/t/p/w780/3c5GNLB4yRSLBby0trHoA1DSQxQ.jpg",
        backdropImage: "https://image.tmdb.org/t/p/w1280/3c5GNLB4yRSLBby0trHoA1DSQxQ.jpg",
        rating: "4.2",
        votes: "88K+ Votes",
        censorshipRating: "UA 13+",
        certificate: "UA 13+",
        releaseDate: new Date("2022-04-15")
      }
    ];

    const createdMovies = await Movie.insertMany(moviesData);
    console.log(`Inserted ${createdMovies.length} movies.`);

    // 4. Create Shows for Today & Tomorrow
    const now = new Date();
    const showsToCreate = [];

    createdMovies.forEach((movie, idx) => {
      const showDate1 = new Date(now.getTime() + (idx * 2 + 1) * 3600 * 1000);
      const showDate2 = new Date(now.getTime() + (idx * 2 + 25) * 3600 * 1000);

      showsToCreate.push({
        movie: movie._id,
        screen: idx % 2 === 0 ? screen1._id : screen2._id,
        showTime: showDate1,
        price: 15,
        bookedSeats: ["A3", "A4", "B1"]
      });

      showsToCreate.push({
        movie: movie._id,
        screen: idx % 2 === 0 ? screen2._id : screen1._id,
        showTime: showDate2,
        price: 18,
        bookedSeats: ["C2", "C3"]
      });
    });

    await Show.insertMany(showsToCreate);
    console.log(`Created ${showsToCreate.length} scheduled shows.`);

    // Re-link any existing user bookings to new shows so tickets are never orphaned
    const existingBookings = await Booking.find({});
    if (existingBookings.length > 0) {
      const allShows = await Show.find({}).populate('movie screen');
      for (const b of existingBookings) {
        const matchingShow = allShows.find(s => s.movie?.title === b.movieTitle) || allShows[0];
        if (matchingShow) {
          b.show = matchingShow._id;
          b.showTime = matchingShow.showTime;
          b.movieTitle = matchingShow.movie?.title || b.movieTitle;
          b.posterUrl = matchingShow.movie?.posterUrl || b.posterUrl;
          b.screenName = matchingShow.screen?.name || b.screenName;
          await b.save();
        }
      }
      console.log(`Re-linked ${existingBookings.length} existing booking(s) to active shows.`);
    }

    // 5. Remove any demo accounts
    await User.deleteMany({ email: { $in: ["user@cinema.com", "admin@cinema.com"] } });
    console.log("Demo accounts removed.");

    console.log("SEEDING COMPLETED SUCCESSFULLY!");
    process.exit(0);

  } catch (err) {
    console.error("Seeding failed:", err.message);
    process.exit(1);
  }
};

seedData();

