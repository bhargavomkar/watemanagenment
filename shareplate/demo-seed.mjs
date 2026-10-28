import crypto from 'node:crypto';

const demoPassword = 'DemoFood123!';

function makeUser(name, email, role, location, lat = null, lon = null) {
  const salt = crypto.randomBytes(16).toString('hex');
  return {
    id: crypto.randomUUID(), name, email, role, location, lat, lon, salt,
    password: crypto.scryptSync(demoPassword, salt, 64).toString('hex'),
    createdAt: new Date().toISOString(),
  };
}

function dateAfter(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function createDemoData() {
  const owners = [
    makeUser('Green Leaf Hotel Kitchen', 'greenleaf.demo@shareplate.local', 'restaurant', 'Indiranagar, Bengaluru', 12.9784, 77.6408),
    makeUser('Lakeview Residency Kitchen', 'lakeview.demo@shareplate.local', 'restaurant', 'Koramangala, Bengaluru', 12.9352, 77.6245),
    makeUser('Sunrise Grand Hotel Kitchen', 'sunrise.demo@shareplate.local', 'restaurant', 'MG Road, Bengaluru', 12.9756, 77.6050),
  ];
  const club = makeUser('Bengaluru Community Meals', 'club.demo@shareplate.local', 'club', 'Bengaluru', 12.9716, 77.5946);
  const rows = [
    [0, 'Fresh veg biryani meal boxes', 18, 70, 'discount', 1, '12:30', '13:30', null, null],
    [0, 'Assorted breakfast buns and fruit', 12, 0, 'donation', 1, '17:00', '18:00', null, null],
    [1, 'Paneer curry with rice packs', 14, 90, 'discount', 1, '19:00', '20:00', club.id, '19:30'],
    [1, 'Freshly baked bread baskets', 10, 0, 'donation', 2, '10:00', '11:00', null, null],
    [2, 'Lunch thali surplus portions', 20, 80, 'discount', 1, '13:00', '14:00', null, null],
    [2, 'Seasonal fruit and snack boxes', 9, 0, 'donation', 2, '16:00', '17:00', club.id, '16:30'],
  ];
  const createdAt = new Date().toISOString();
  const offers = rows.map(([owner, food, meals, price, type, days, from, until, clubId, fallbackAt]) => ({
    id: crypto.randomUUID(), ownerId: owners[owner].id, food, meals, price, type,
    location: owners[owner].location, date: dateAfter(days), from, until,
    lat: owners[owner].lat, lon: owners[owner].lon, clubId, fallbackAt,
    fallbackActive: false, status: 'available', createdAt,
  }));
  return { users: [...owners, club], offers, claims: [], sessions: [] };
}
