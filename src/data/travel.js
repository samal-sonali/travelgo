export const destinations = [
  { name: 'Amalfi Coast', country: 'Italy', image: 'photo-1533105079780-92b9be482077', price: '$840', tag: 'Coastal favorite', days: '5 days' },
  { name: 'Kyoto', country: 'Japan', image: 'photo-1493976040374-85c8e12f0c0e', price: '$1,260', tag: 'Culture & calm', days: '7 days' },
  { name: 'Bali', country: 'Indonesia', image: 'photo-1537996194471-e657df975ab4', price: '$920', tag: 'Island escape', days: '6 days' },
  { name: 'Dolomites', country: 'Italy', image: 'photo-1519681393784-d120267933ba', price: '$1,080', tag: 'Outdoors', days: '4 days' },
];

export const stays = [
  { name: 'Casa Angelina', location: 'Praiano, Amalfi Coast', rating: '4.98', price: '$428', image: 'photo-1611892440504-42a792e24d32', category: 'Boutique hotel' },
  { name: 'The Hoxton, Amsterdam', location: 'Canal Belt, Amsterdam', rating: '4.91', price: '$285', image: 'photo-1566073771259-6a8506099945', category: 'Design hotel' },
  { name: 'Alila Ubud', location: 'Payangan, Bali', rating: '4.96', price: '$310', image: 'photo-1571896349842-33c89424de2d', category: 'Nature retreat' },
];

export const packages = [
  { name: 'The slow side of Sicily', place: 'Sicily, Italy', days: '6 nights · 7 days', price: '$1,490', image: 'photo-1516483638261-f4dbaf036963', label: 'Most loved' },
  { name: 'A week in Kyoto', place: 'Kyoto, Japan', days: '5 nights · 6 days', price: '$1,820', image: 'photo-1493976040374-85c8e12f0c0e', label: 'Culture edit' },
  { name: 'Bali, your own way', place: 'Bali, Indonesia', days: '7 nights · 8 days', price: '$1,260', image: 'photo-1537996194471-e657df975ab4', label: 'Island time' },
];

export const flights = [
  { airline: 'Singapore Airlines', code: 'SQ 317', from: 'LHR', to: 'SIN', departure: '11:25', arrival: '07:10', duration: '12h 45m', stops: 'Nonstop', price: '$684', mark: 'SQ' },
  { airline: 'Qatar Airways', code: 'QR 008', from: 'LHR', to: 'DOH', departure: '14:55', arrival: '00:50', duration: '6h 55m', stops: 'Nonstop', price: '$592', mark: 'QR' },
  { airline: 'Emirates', code: 'EK 002', from: 'LHR', to: 'DXB', departure: '13:40', arrival: '00:35', duration: '6h 55m', stops: 'Nonstop', price: '$618', mark: 'EK' },
  { airline: 'Japan Airlines', code: 'JL 044', from: 'LHR', to: 'HND', departure: '09:40', arrival: '07:15', duration: '13h 35m', stops: 'Nonstop', price: '$742', mark: 'JL' },
];

export const imageUrl = (id, width = 900) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;
