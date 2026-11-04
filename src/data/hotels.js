// Hotels for the booking page. Prices are sample nightly rates in USD for a standard room.
// [name, area, stars, guest score /10, reviews, price, pool, free WiFi, breakfast included, free cancellation]
const list = {
  'amalfi-coast': [
    ['Le Sirenuse', 'Positano', 5, 9.6, 1240, 1100, true, true, true, false],
    ['Belmond Hotel Caruso', 'Ravello', 5, 9.6, 980, 1300, true, true, true, true],
    ['Hotel Santa Caterina', 'Amalfi', 5, 9.5, 1610, 750, true, true, true, true],
    ['Hotel Poseidon', 'Positano', 4, 9.1, 2050, 420, true, true, true, false],
    ['Hotel Marina Riviera', 'Amalfi', 4, 9.2, 2380, 280, true, true, false, true],
    ['Hostel Brikette', 'Positano', 2, 8.7, 3120, 110, false, true, true, true],
  ],
  kyoto: [
    ['The Ritz-Carlton, Kyoto', 'Kamogawa River', 5, 9.6, 1450, 1200, true, true, false, true],
    ['Four Seasons Hotel Kyoto', 'Higashiyama', 5, 9.5, 1180, 1100, true, true, true, true],
    ['Hotel Kanra Kyoto', 'Downtown', 4, 9.1, 2210, 300, false, true, true, false],
    ['Hotel The Celestine Kyoto Gion', 'Gion', 4, 9.2, 2840, 260, false, true, false, true],
    ['Mitsui Garden Hotel Kyoto Sanjo', 'Downtown', 3, 8.6, 3390, 140, false, true, false, true],
    ['Piece Hostel Sanjo', 'Downtown', 2, 8.9, 4100, 80, false, true, false, true],
  ],
  tokyo: [
    ['Aman Tokyo', 'Otemachi', 5, 9.7, 860, 1600, true, true, true, true],
    ['The Peninsula Tokyo', 'Marunouchi', 5, 9.5, 1720, 1000, true, true, false, true],
    ['Hotel New Otani Tokyo', 'Akasaka', 5, 8.9, 3650, 380, true, true, false, true],
    ['Park Hotel Tokyo', 'Shiodome', 4, 9.0, 2470, 260, false, true, false, false],
    ['Hotel Gracery Shinjuku', 'Shinjuku', 3, 8.7, 6120, 220, false, true, false, true],
    ['UNPLAN Shinjuku', 'Shinjuku', 2, 8.8, 2980, 90, false, true, false, true],
  ],
  bali: [
    ['Four Seasons Resort Bali at Sayan', 'Ubud', 5, 9.6, 1330, 900, true, true, true, true],
    ['W Bali – Seminyak', 'Seminyak', 5, 9.0, 2760, 420, true, true, false, true],
    ['Alila Ubud', 'Payangan, Ubud', 5, 9.3, 1890, 310, true, true, true, false],
    ['Komaneka at Bisma', 'Ubud', 5, 9.4, 1540, 210, true, true, true, true],
    ['Hard Rock Hotel Bali', 'Kuta', 4, 8.6, 5230, 160, true, true, true, true],
    ['Puri Garden Hotel & Hostel', 'Ubud', 2, 9.0, 2610, 45, true, true, true, true],
  ],
  dolomites: [
    ['Forestis', 'Brixen', 5, 9.6, 640, 950, true, true, true, false],
    ['Hotel Cristallo', 'Cortina d’Ampezzo', 5, 9.0, 1120, 700, true, true, true, true],
    ['Adler Spa Resort Dolomiti', 'Ortisei', 5, 9.4, 1380, 650, true, true, true, true],
    ['Hotel Ambra', 'Cortina d’Ampezzo', 4, 9.0, 870, 240, false, true, true, true],
    ['Rifugio Lagazuoi', 'Falzarego Pass', 2, 9.1, 1460, 140, false, false, true, false],
  ],
  paris: [
    ['Shangri-La Paris', 'Trocadéro', 5, 9.5, 1210, 1400, true, true, false, true],
    ['Le Meurice', 'Tuileries', 5, 9.5, 1090, 1300, false, true, false, true],
    ['Hôtel des Grands Boulevards', 'Grands Boulevards', 4, 8.9, 1930, 280, false, true, false, true],
    ['Hôtel Fabric', 'Oberkampf', 4, 9.0, 2650, 240, false, true, true, false],
    ['citizenM Paris Gare de Lyon', 'Gare de Lyon', 4, 8.8, 4370, 190, false, true, false, true],
    ['Generator Paris', 'Canal Saint-Martin', 2, 8.3, 5820, 110, false, true, false, true],
  ],
  dubai: [
    ['Burj Al Arab Jumeirah', 'Jumeirah', 5, 9.5, 1980, 1600, true, true, true, true],
    ['Atlantis The Palm', 'Palm Jumeirah', 5, 9.0, 7410, 600, true, true, true, true],
    ['Jumeirah Beach Hotel', 'Jumeirah', 5, 9.1, 4880, 450, true, true, true, false],
    ['Address Downtown', 'Downtown', 5, 9.3, 3260, 420, true, true, false, true],
    ['Rove Downtown', 'Downtown', 3, 8.9, 9120, 110, true, true, false, true],
    ['ibis Al Barsha', 'Al Barsha', 3, 8.4, 6030, 70, false, true, false, true],
  ],
  'ha-long-bay': [
    ['Vinpearl Resort & Spa Ha Long', 'Reu Island', 5, 8.8, 2140, 180, true, true, true, true],
    ['Wyndham Legend Halong', 'Bai Chay', 5, 8.6, 2870, 120, true, true, true, true],
    ['Novotel Ha Long Bay', 'Bai Chay', 4, 8.9, 3310, 110, true, true, false, true],
    ['Cat Ba Island Resort & Spa', 'Cat Ba Island', 4, 8.4, 1290, 90, true, true, true, false],
  ],
  london: [
    ['Corinthia London', 'Whitehall', 5, 9.6, 1530, 1100, true, true, false, true],
    ['The Savoy', 'Strand', 5, 9.5, 2210, 950, true, true, false, true],
    ['The Ned', 'City of London', 5, 9.2, 2690, 600, true, true, false, false],
    ['The Hoxton, Holborn', 'Holborn', 4, 9.0, 4120, 260, false, true, false, true],
    ['citizenM Tower of London', 'Tower Hill', 4, 8.9, 5010, 210, false, true, false, true],
    ['Generator London', "King's Cross", 2, 8.2, 6740, 110, false, true, false, true],
  ],
};

export const hotelImages = [
  // Generic hotel photos, used as illustrations.
  'photo-1542314831-068cd1dbfeeb', 'photo-1551882547-ff40c63fe5fa', 'photo-1520250497591-112f2f40a3f4', 'photo-1582719478250-c89cae4dc85b',
  'photo-1564501049412-61c2a3083791', 'photo-1445019980597-93fa8acb246c', 'photo-1590490360182-c33d57733427', 'photo-1578683010236-d716f9a3f461',
  'photo-1584132967334-10e028bd69f7', 'photo-1596394516093-501ba68a0ba6', 'photo-1618773928121-c32242e63f39', 'photo-1505693416388-ac5ce068fe85',
  'photo-1611892440504-42a792e24d32', 'photo-1566073771259-6a8506099945', 'photo-1571896349842-33c89424de2d', 'photo-1455587734955-081b22074882',
  'photo-1563911302283-d2bc129e7570', 'photo-1631049307264-da0ec9d70304',
];

let n = 0;
export const hotels = Object.entries(list).flatMap(([slug, rows]) => rows.map(([name, area, stars, score, reviews, price, pool, wifi, breakfast, freeCancel]) => ({
  id: `${slug}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`, slug, name, area, stars, score, reviews, price, pool, wifi, breakfast, freeCancel,
  image: hotelImages[n++ % hotelImages.length],
})));

export const roomTypes = [['Standard room', 1], ['Deluxe room', 1.35], ['Suite', 2.1]];
export const TAX_RATE = 0.12;
