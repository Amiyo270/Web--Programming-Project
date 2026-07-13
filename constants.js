import { SeatStatus } from './types.js';

export const TICKET_PRICE = 12.50;
export const SHOWTIMES_LIST = ["12:00 PM", "04:00 PM", "08:00 PM"]; // Bangladesh Time (UTC+6)

// Generate seats
const generateSeats = (rows, cols) => {
  const seats = [];
  for (let i = 0; i < rows; i++) {
    const row = [];
    const rowLetter = String.fromCharCode(65 + i);
    for (let j = 0; j < cols; j++) {
      const isBooked = Math.random() < 0.2;
      row.push({
        id: `${rowLetter}${j + 1}`,
        status: isBooked ? SeatStatus.Booked : SeatStatus.Available,
      });
    }
    seats.push(row);
  }
  return seats;
};

const createShowtimes = () => SHOWTIMES_LIST.map(time => ({
  time,
  seats: generateSeats(8, 12)
}));

// ✅ Movies aligned with your database poster URLs
export const FALLBACK_MOVIES = [
  {
    id: 1,
    title: 'Poran',
    posterUrl: 'https://image2url.com/images/1763730217047-8232ed05-96fb-4cd5-8f48-36155f8e3de1.jpg',
    description: 'A romantic thriller filled with suspense, where a college girl falls for a local thug.',
    price: 180,
    showtimes: createShowtimes(),
  },
  {
    id: 2,
    title: 'Priyotoma',
    posterUrl: 'https://image2url.com/images/1763730264212-f1b56430-4021-42fb-8711-d34752941b23.webp',
    description: 'Romantic drama starring Shakib Khan, one of the highest-grossing Bangladeshi films.',
    price: 200,
    showtimes: createShowtimes(),
  },
  {
    id: 3,
    title: 'No Bed of Roses',
    posterUrl: 'https://image2url.com/images/1763730328128-0e1c7739-56c7-4cdb-98a6-5988ca654f4e.jpg',
    description: 'Drama starring Irrfan Khan, exploring family and relationships.',
    price: 220,
    showtimes: createShowtimes(),
  },
  {
    id: 4,
    title: 'Hawa',
    posterUrl: 'https://image2url.com/images/1763730394418-ed947af4-b3af-4b1e-9fd4-eebf41a8d3f2.webp',
    description: 'Mystery-drama set on a fishing trawler, praised for its cinematography.',
    price: 250,
    showtimes: createShowtimes(),
  },
  {
    id: 5,
    title: 'Rehana Maryam Noor',
    posterUrl: 'https://image2url.com/images/1763730437891-f7af5502-8dd4-4fe1-801f-fbed050a9921.webp',
    description: 'Psychological drama, critically acclaimed and selected for Cannes Film Festival.',
    price: 150,
    showtimes: createShowtimes(),
  },
  {
    id: 6,
    title: 'Surongo',
    posterUrl: 'https://i.postimg.cc/bvQ8XSfz/Surongo.jpg',
    description: 'A tragic romance and crime drama about Masud.',
    price: 200,
    showtimes: createShowtimes(),
  },
  {
    id: 7,
    title: 'Dahan',
    posterUrl: 'https://i.postimg.cc/XYPXNCPC/Dahan.jpg',
    description: 'A gripping thriller about a woman seeking justice in a patriarchal society.',
    price: 180,
    showtimes: createShowtimes(),
  },
  {
    id: 8,
    title: 'Shyamol Chhaya',
    posterUrl: 'https://i.postimg.cc/dtzzqQB0/Shaymol-Chaya.jpg',
    description: 'A period drama set during the Bangladesh Liberation War.',
    price: 220,
    showtimes: createShowtimes(),
  },
  {
    id: 9,
    title: 'Monpura',
    posterUrl: 'https://i.postimg.cc/XYSDRHjB/Monpura.jpg ',
    description: 'A romantic drama set in the riverine landscape of Bangladesh.',
    price: 190,
    showtimes: createShowtimes(),
  },
  {
    id: 10,
    title: 'Aynabaji',
    posterUrl: 'https://i.postimg.cc/MTvcbYjY/Aynabaji.jpg',
    description: 'A psychological thriller about identity and deception.',
    price: 210,
    showtimes: createShowtimes(),
  },
  {
    id: 11,
    title: 'Dhaka Attack',
    posterUrl: 'https://i.postimg.cc/RhP4sr5t/Dhaka-Attack.jpg',
    description: 'Action thriller based on real events, featuring intense police operations.',
    price: 200,
    showtimes: createShowtimes(),
  },
  {
    id: 12,
    title: 'Chandrabati',
    posterUrl: 'https://i.postimg.cc/dQZ6J2Sd/Chandrabati.jpg',
    description: 'A historical drama about the legendary poet Chandrabati.',
    price: 175,
    showtimes: createShowtimes(),
  },
];
