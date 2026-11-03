export const destinations = [
  { name: 'Amalfi Coast', slug: 'amalfi-coast', country: 'Italy', region: 'Europe', image: 'photo-1533105079780-92b9be482077', price: '$840', from: 840, tag: 'Coastal favorite', days: '5 days', vibes: ['beach', 'romance', 'food'] },
  { name: 'Kyoto', slug: 'kyoto', country: 'Japan', region: 'Asia', image: 'photo-1493976040374-85c8e12f0c0e', price: '$1,260', from: 1260, tag: 'Culture & calm', days: '7 days', vibes: ['culture', 'food'] },
  { name: 'Tokyo', slug: 'tokyo', country: 'Japan', region: 'Asia', image: 'photo-1540959733332-eab4deabeeaf', price: '$1,150', from: 1150, tag: 'Neon & tradition', days: '6 days', vibes: ['city', 'culture', 'food', 'adventure'] },
  { name: 'Bali', slug: 'bali', country: 'Indonesia', region: 'Asia', image: 'photo-1537996194471-e657df975ab4', price: '$920', from: 920, tag: 'Island escape', days: '6 days', vibes: ['beach', 'culture', 'romance'] },
  { name: 'Dolomites', slug: 'dolomites', country: 'Italy', region: 'Europe', image: 'photo-1519681393784-d120267933ba', price: '$1,080', from: 1080, tag: 'Outdoors', days: '4 days', vibes: ['adventure'] },
  { name: 'Paris', slug: 'paris', country: 'France', region: 'Europe', image: 'photo-1502602898657-3e91760cbb34', price: '$760', from: 760, tag: 'City of light', days: '4 days', vibes: ['city', 'romance', 'food', 'culture'] },
  { name: 'Dubai', slug: 'dubai', country: 'UAE', region: 'Middle East', image: 'photo-1512453979798-5ea266f8880c', price: '$990', from: 990, tag: 'Skyline & sand', days: '5 days', vibes: ['city', 'beach', 'adventure'] },
  { name: 'Ha Long Bay', slug: 'ha-long-bay', country: 'Vietnam', region: 'Asia', image: 'photo-1528127269322-539801943592', price: '$680', from: 680, tag: 'Hidden gem', days: '5 days', vibes: ['adventure', 'beach'] },
  { name: 'London', slug: 'london', country: 'United Kingdom', region: 'Europe', image: 'photo-1513635269975-59663e0ac1ad', price: '$720', from: 720, tag: 'Weekend classic', days: '3 days', vibes: ['city', 'culture', 'food'] },
];

export const stays = [
  { name: 'Casa Angelina', location: 'Praiano, Amalfi Coast', rating: '4.98', price: '$428', image: 'photo-1611892440504-42a792e24d32', category: 'Boutique hotel' },
  { name: 'The Hoxton, Amsterdam', location: 'Canal Belt, Amsterdam', rating: '4.91', price: '$285', image: 'photo-1566073771259-6a8506099945', category: 'Design hotel' },
  { name: 'Alila Ubud', location: 'Payangan, Bali', rating: '4.96', price: '$310', image: 'photo-1571896349842-33c89424de2d', category: 'Nature retreat' },
];

export const packages = [
  { name: 'The slow side of Sicily', place: 'Sicily, Italy', days: '6 nights · 7 days', price: '$1,490', image: 'photo-1516483638261-f4dbaf036963', label: 'Most loved', category: 'Culture', rating: '4.9' },
  { name: 'A week in Kyoto', place: 'Kyoto, Japan', days: '5 nights · 6 days', price: '$1,820', image: 'photo-1493976040374-85c8e12f0c0e', label: 'Culture edit', category: 'Culture', rating: '4.8' },
  { name: 'Bali, your own way', place: 'Bali, Indonesia', days: '7 nights · 8 days', price: '$1,260', image: 'photo-1537996194471-e657df975ab4', label: 'Island time', category: 'Beach', rating: '4.9' },
  { name: 'Alpine lakes by rail', place: 'Swiss Alps, Switzerland', days: '5 nights · 6 days', price: '$2,140', image: 'photo-1476514525535-07fb3b4ae5f1', label: 'Trending', category: 'Adventure', rating: '4.9' },
  { name: 'Turquoise water retreat', place: 'Maldives', days: '4 nights · 5 days', price: '$2,380', image: 'photo-1507525428034-b723cf961d3e', label: 'Honeymoon pick', category: 'Beach', rating: '5.0' },
  { name: 'Desert & skyline', place: 'Dubai, UAE', days: '4 nights · 5 days', price: '$1,150', image: 'photo-1512453979798-5ea266f8880c', label: 'New', category: 'City', rating: '4.7' },
];

export const flights = [
  { airline: 'Singapore Airlines', code: 'SQ 317', from: 'LHR', to: 'SIN', departure: '11:25', arrival: '07:10', duration: '12h 45m', stops: 'Nonstop', price: '$684', mark: 'SQ' },
  { airline: 'Qatar Airways', code: 'QR 008', from: 'LHR', to: 'DOH', departure: '14:55', arrival: '00:50', duration: '6h 55m', stops: 'Nonstop', price: '$592', mark: 'QR' },
  { airline: 'Emirates', code: 'EK 002', from: 'LHR', to: 'DXB', departure: '13:40', arrival: '00:35', duration: '6h 55m', stops: 'Nonstop', price: '$618', mark: 'EK' },
  { airline: 'Japan Airlines', code: 'JL 044', from: 'LHR', to: 'HND', departure: '09:40', arrival: '07:15', duration: '13h 35m', stops: 'Nonstop', price: '$742', mark: 'JL' },
];

export const airlines = [
  ['SQ', 'Singapore Airlines'], ['QR', 'Qatar Airways'], ['EK', 'Emirates'], ['JL', 'Japan Airlines'],
  ['LH', 'Lufthansa'], ['AF', 'Air France'], ['BA', 'British Airways'], ['EY', 'Etihad Airways'],
];

export const stats = [
  { value: 120000, suffix: '+', label: 'Happy travellers' },
  { value: 85, suffix: '', label: 'Countries covered' },
  { value: 2400, suffix: '+', label: 'Curated experiences' },
  { value: 4.9, decimals: 1, suffix: '/5', label: 'Average guest rating' },
];

export const reviews = [
  { name: 'Camille R.', trip: 'Amalfi Coast, Italy', avatar: 'photo-1534528741775-53994a69daeb', text: 'Travel isn’t always about going far. Sometimes it’s about seeing differently. TravelGo planned every detail, and still left room for the magic.' },
  { name: 'Daniel K.', trip: 'Kyoto, Japan', avatar: 'photo-1507003211169-0a1dd7228f2d', text: 'The ryokan they found us was the highlight of the year. Quiet, beautiful, and nothing like the places that show up in every search.' },
  { name: 'Priya S.', trip: 'Bali, Indonesia', avatar: 'photo-1494790108377-be9c29b29330', text: 'Our flight got cancelled at midnight and a real person had us rebooked before we’d even left the airport. That’s why we keep coming back.' },
  { name: 'Marcus T.', trip: 'Dolomites, Italy', avatar: 'photo-1500648767791-00dcc994a43e', text: 'Hut-to-hut hiking without the stress of planning it. Every refuge was booked, every transfer was on time. Already planning the next one.' },
];

export const blogs = [
  { title: 'How to pack for two weeks with only a carry-on', category: 'Travel tips', read: '6 min read', image: 'photo-1488646953014-85cb44e25828', excerpt: 'A simple system for packing light without leaving the good stuff at home.' },
  { title: 'The great road trips worth taking slowly', category: 'Inspiration', read: '8 min read', image: 'photo-1469854523086-cc02fe5d8800', excerpt: 'Five routes where the drive is the destination, and the detours are the point.' },
  { title: 'Shoulder season: the smartest time to travel', category: 'Guides', read: '5 min read', image: 'photo-1501785888041-af3ef285b470', excerpt: 'Fewer crowds, softer prices and better light. Here’s when to go, and where.' },
];

export const imageUrl = (id, width = 900) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;
