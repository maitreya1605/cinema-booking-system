const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const mongoose = require('mongoose');
const Theater = require('./models/theater');
const Screen = require('./models/screen');

const theatersData = [
  // Delhi
  {
    name: 'PIXORA IMAX – Select Citywalk, Saket',
    city: 'Delhi',
    location: 'Saket District Centre, New Delhi',
    format: 'IMAX 3D Laser',
    distance: '1.4 km away',
    screensInfo: 'Screen 1 (IMAX Laser), Screen 2 (Dolby Atmos)',
    tags: ['IMAX 3D Laser', 'Dolby Atmos 64ch', 'VIP Recliners', 'Gourmet In-Seat Dining'],
    showtimes: ['11:15 AM', '02:45 PM', '06:30 PM', '09:45 PM'],
    shows: [
      { id: 'sh-delhi-1-1', movie: 'Ramayana', time: '11:15 AM', screen: 'IMAX Laser', format: '3D', price: '₹350' },
      { id: 'sh-delhi-1-2', movie: 'The Batman', time: '02:45 PM', screen: 'IMAX Laser', format: '4K', price: '₹320' },
      { id: 'sh-delhi-1-3', movie: 'Drishyam The Conclusion', time: '06:30 PM', screen: 'Dolby Atmos', format: '2D', price: '₹280' },
      { id: 'sh-delhi-1-4', movie: 'Avatar: The Way of Water', time: '09:45 PM', screen: 'IMAX Laser', format: '3D', price: '₹350' }
    ]
  },
  {
    name: 'PIXORA Premiere – Ambience Mall, Vasant Kunj',
    city: 'Delhi',
    location: 'Nelson Mandela Marg, Vasant Kunj, New Delhi',
    format: 'Dolby Atmos 64ch & 4K Laser',
    distance: '3.2 km away',
    screensInfo: 'Screen 1-3 (Dolby Atmos, Gold Lounge)',
    tags: ['Dolby Atmos 64ch', '4K Laser', 'Luxury Lounge', 'Valet Parking'],
    showtimes: ['10:30 AM', '01:45 PM', '05:15 PM', '08:30 PM', '11:00 PM'],
    shows: [
      { id: 'sh-delhi-2-1', movie: 'Stree 2 Sarkate Ka Aatank', time: '10:30 AM', screen: 'Dolby Atmos', format: '2D', price: '₹290' },
      { id: 'sh-delhi-2-2', movie: 'Ramayana', time: '01:45 PM', screen: 'Screen 1', format: '3D', price: '₹340' },
      { id: 'sh-delhi-2-3', movie: 'The Batman', time: '05:15 PM', screen: '4K Laser', format: '4K', price: '₹310' },
      { id: 'sh-delhi-2-4', movie: 'Ghost Soldier', time: '08:30 PM', screen: 'Dolby Atmos', format: '2D', price: '₹280' }
    ]
  },
  {
    name: 'PIXORA Gold – Connaught Place',
    city: 'Delhi',
    location: 'Inner Circle, CP, New Delhi',
    format: '4DX Motion Laser',
    distance: '4.5 km away',
    screensInfo: 'Screen 1-4 (4DX Motion, RealD 3D)',
    tags: ['4DX Dynamic Seats', 'Gold Class Pods', 'Chef Specials'],
    showtimes: ['12:00 PM', '03:30 PM', '07:00 PM', '10:15 PM'],
    shows: [
      { id: 'sh-delhi-3-1', movie: 'Ramayana', time: '12:00 PM', screen: '4DX Dynamic', format: '3D', price: '₹380' },
      { id: 'sh-delhi-3-2', movie: 'Spider-Man: No Way Home', time: '03:30 PM', screen: '4DX Motion', format: '3D', price: '₹380' },
      { id: 'sh-delhi-3-3', movie: 'The Cat in the Hat', time: '07:00 PM', screen: 'Gold Class', format: '2D', price: '₹300' },
      { id: 'sh-delhi-3-4', movie: 'Drishyam The Conclusion', time: '10:15 PM', screen: 'Screen 2', format: '2D', price: '₹280' }
    ]
  },

  // Dehradun
  {
    name: 'PIXORA Luxe – Pacific Mall, Rajpur Road',
    city: 'Dehradun',
    location: 'Pacific Mall, Jakhan, Rajpur Road, Dehradun',
    format: '4DX Motion Laser',
    distance: '2.1 km away',
    screensInfo: 'Screen 1-4 (4DX Motion, RealD 3D)',
    tags: ['4DX Motion Seats', 'Dolby 7.1', 'Zero Reservation Fee', 'Valet Parking'],
    showtimes: ['12:30 PM', '04:00 PM', '07:30 PM', '10:45 PM'],
    shows: [
      { id: 'sh-ddn-1-1', movie: 'Scene', time: '12:00 PM', screen: 'Screen 1', format: '2D', price: '₹250' },
      { id: 'sh-ddn-1-2', movie: 'Udta Teer', time: '03:15 PM', screen: 'Screen 3', format: '2D', price: '₹250' },
      { id: 'sh-ddn-1-3', movie: 'Spider-Man: No Way Home', time: '07:00 PM', screen: '4DX Motion', format: '3D', price: '₹380' },
      { id: 'sh-ddn-1-4', movie: 'The Cat in the Hat', time: '10:15 PM', screen: 'Screen 2', format: '2D', price: '₹220' }
    ]
  },
  {
    name: 'PIXORA Gold – Centrio Mall, Hathibarkala',
    city: 'Dehradun',
    location: 'Centrio Mall, Rabindra Nath Tagore Marg, Dehradun',
    format: 'IMAX Laser & Dolby Atmos',
    distance: '3.0 km away',
    screensInfo: 'Screen 1 (IMAX Laser), Screen 2 (Dolby Atmos)',
    tags: ['IMAX Laser', 'Dolby Atmos', 'Recliner Lounges', 'Cafe PIXORA'],
    showtimes: ['11:00 AM', '02:15 PM', '05:45 PM', '09:00 PM'],
    shows: [
      { id: 'sh-ddn-2-1', movie: 'Ramayana', time: '11:00 AM', screen: 'IMAX Laser', format: '3D', price: '₹340' },
      { id: 'sh-ddn-2-2', movie: 'Stree 2 Sarkate Ka Aatank', time: '02:15 PM', screen: 'Dolby Atmos', format: '2D', price: '₹290' },
      { id: 'sh-ddn-2-3', movie: 'The Batman', time: '05:45 PM', screen: 'IMAX Laser', format: '4K', price: '₹320' },
      { id: 'sh-ddn-2-4', movie: 'Avatar: The Way of Water', time: '09:00 PM', screen: 'Screen 2', format: '3D', price: '₹310' }
    ]
  },

  // Bengaluru
  {
    name: 'PIXORA Royale – Phoenix Marketcity',
    city: 'Bengaluru',
    location: 'Whitefield Main Road, Mahadevapura, Bengaluru',
    format: 'Dolby Cinema 64ch',
    distance: '3.5 km away',
    screensInfo: 'Screen 1-8 (Dolby Cinema, VIP Pods)',
    tags: ['Dolby Vision', 'Private Lounge Pods', 'Free Popcorn Refills', 'Gourmet Bar'],
    showtimes: ['01:00 PM', '05:15 PM', '08:45 PM'],
    shows: [
      { id: 'sh-blr-1-1', movie: 'Ramayana', time: '01:00 PM', screen: 'Dolby Cinema', format: '3D', price: '₹320' },
      { id: 'sh-blr-1-2', movie: 'Drishyam The Conclusion', time: '05:15 PM', screen: 'Screen 4', format: '2D', price: '₹260' },
      { id: 'sh-blr-1-3', movie: 'Avatar: The Way of Water', time: '08:45 PM', screen: 'Dolby Cinema', format: '3D', price: '₹340' }
    ]
  },
  {
    name: 'PIXORA IMAX – Forum South Bangalore',
    city: 'Bengaluru',
    location: 'Kanakapura Road, Konanakunte, Bengaluru',
    format: 'IMAX 3D Laser',
    distance: '5.1 km away',
    screensInfo: 'Screen 1 (IMAX 3D), Screen 2 (Auro 3D)',
    tags: ['IMAX 3D Laser', 'Auro 3D', 'VIP Recliners'],
    showtimes: ['10:45 AM', '02:00 PM', '06:15 PM', '09:30 PM'],
    shows: [
      { id: 'sh-blr-2-1', movie: 'Ramayana', time: '10:45 AM', screen: 'IMAX 3D Laser', format: '3D', price: '₹350' },
      { id: 'sh-blr-2-2', movie: 'The Batman', time: '02:00 PM', screen: 'Auro 3D', format: '4K', price: '₹300' },
      { id: 'sh-blr-2-3', movie: 'Ghost Soldier', time: '06:15 PM', screen: 'Screen 2', format: '2D', price: '₹280' },
      { id: 'sh-blr-2-4', movie: 'Stree 2 Sarkate Ka Aatank', time: '09:30 PM', screen: 'IMAX Laser', format: '2D', price: '₹310' }
    ]
  },

  // Chennai
  {
    name: 'PIXORA Premiere – Express Avenue',
    city: 'Chennai',
    location: 'Club House Road, Royapettah, Chennai',
    format: 'IMAX Laser & Auro 3D',
    distance: '2.8 km away',
    screensInfo: 'Screen 1-6 (IMAX Laser, RGB Laser)',
    tags: ['IMAX 3D Laser', 'Auro 11.1 3D', 'Gold Class Recliner', 'In-Seat Service'],
    showtimes: ['10:45 AM', '03:00 PM', '06:15 PM', '09:30 PM'],
    shows: [
      { id: 'sh-chn-1-1', movie: 'Ramayana', time: '10:45 AM', screen: 'IMAX Laser', format: '3D', price: '₹340' },
      { id: 'sh-chn-1-2', movie: 'The Batman', time: '03:00 PM', screen: 'Screen 2', format: '2D', price: '₹280' },
      { id: 'sh-chn-1-3', movie: 'Scene', time: '06:15 PM', screen: 'Dolby Atmos', format: '2D', price: '₹260' },
      { id: 'sh-chn-1-4', movie: 'Avatar: The Way of Water', time: '09:30 PM', screen: 'IMAX Laser', format: '3D', price: '₹350' }
    ]
  },
  {
    name: 'PIXORA Luxe – Phoenix Marketcity, Velachery',
    city: 'Chennai',
    location: 'Velachery Main Road, Chennai',
    format: 'Dolby Atmos & RGB Laser',
    distance: '4.2 km away',
    screensInfo: 'Screen 1-5 (Dolby Atmos, RGB Laser)',
    tags: ['Dolby Atmos', 'RGB Laser', 'Luxury Dining'],
    showtimes: ['11:30 AM', '02:45 PM', '06:30 PM', '10:00 PM'],
    shows: [
      { id: 'sh-chn-2-1', movie: 'Ramayana', time: '11:30 AM', screen: 'Dolby Atmos', format: '3D', price: '₹330' },
      { id: 'sh-chn-2-2', movie: 'Drishyam The Conclusion', time: '02:45 PM', screen: 'RGB Laser', format: '2D', price: '₹270' },
      { id: 'sh-chn-2-3', movie: 'Spider-Man: No Way Home', time: '06:30 PM', screen: 'Dolby Atmos', format: '3D', price: '₹340' },
      { id: 'sh-chn-2-4', movie: 'Udta Teer', time: '10:00 PM', screen: 'Screen 1', format: '2D', price: '₹250' }
    ]
  }
];

async function seedTheaters() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    // Fetch existing screens to optionally associate
    const screens = await Screen.find().limit(2);
    const screenIds = screens.map(s => s._id);

    console.log('Clearing old theaters...');
    await Theater.deleteMany({});

    const formattedData = theatersData.map(th => ({
      ...th,
      screens: screenIds
    }));

    const created = await Theater.insertMany(formattedData);
    console.log(`Successfully seeded ${created.length} theaters into MongoDB!`);
    created.forEach(th => console.log(`  - [${th.city}] ${th.name} (${th.format})`));

    process.exit(0);
  } catch (err) {
    console.error('Error seeding theaters:', err);
    process.exit(1);
  }
}

seedTheaters();
