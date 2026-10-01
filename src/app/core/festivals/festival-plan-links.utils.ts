import { Festival } from './models/festival';

export function getTransportSearchUrl(festival: Festival): string {
  const params = new URLSearchParams({
    api: '1',
    destination: festival.location,
    travelmode: 'transit',
  });

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export function getAccommodationSearchUrl(festival: Festival): string {
  const params = new URLSearchParams({
    ss: festival.location,
    checkin: festival.startDate,
    checkout: addDays(festival.endDate, 1),
    group_adults: '2',
    no_rooms: '1',
  });

  return `https://www.booking.com/searchresults.html?${params.toString()}`;
}

function addDays(dateKey: string, days: number): string {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);

  return date.toISOString().slice(0, 10);
}
