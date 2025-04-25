
import { tables, seats, responses } from '../mockData';

export const getStats = () => {
  const activeTables = tables.filter(table => table.status === 'active').length;
  const activeSeats = seats.filter(seat => seat.status !== 'unavailable').length;
  const occupiedSeats = seats.filter(seat => seat.status === 'occupied').length;
  const serviceRequests = responses.filter(
    resp => resp.answer === 'SERVICE' && 
    new Date(resp.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  ).length;
  const satisfactionRate = Math.round(
    (responses.filter(resp => resp.answer === 'YES').length / responses.length) * 100
  );

  return {
    activeTables,
    activeSeats,
    occupiedSeats,
    serviceRequests,
    satisfactionRate
  };
};
