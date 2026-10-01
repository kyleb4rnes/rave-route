import { Festival } from './models/festival';
import { getAccommodationSearchUrl, getTransportSearchUrl } from './festival-plan-links.utils';

const festival: Festival = {
  id: 'festival-id',
  title: 'Example Festival',
  startDate: '2026-08-14',
  endDate: '2026-08-16',
  location: 'Boom, Belgium',
  transportArranged: false,
  accommodationArranged: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('festival plan links', () => {
  it('builds a transport search for the festival destination', () => {
    const url = new URL(getTransportSearchUrl(festival));

    expect(url.hostname).toBe('www.google.com');
    expect(url.searchParams.get('destination')).toBe('Boom, Belgium');
    expect(url.searchParams.get('travelmode')).toBe('transit');
  });

  it('builds an accommodation search covering the final festival night', () => {
    const url = new URL(getAccommodationSearchUrl(festival));

    expect(url.hostname).toBe('www.booking.com');
    expect(url.searchParams.get('ss')).toBe('Boom, Belgium');
    expect(url.searchParams.get('checkin')).toBe('2026-08-14');
    expect(url.searchParams.get('checkout')).toBe('2026-08-17');
  });
});
