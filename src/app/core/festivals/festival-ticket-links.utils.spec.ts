import { hasFestivalTicketLinks } from './festival-ticket-links.utils';
import { Festival } from './models/festival';

describe('hasFestivalTicketLinks', () => {
  const festival = {
    id: 'festival-1',
    title: 'Example Festival',
    startDate: '2026-07-01',
    endDate: '2026-07-03',
    location: 'Example City',
    transportArranged: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  } satisfies Festival;

  it('returns false when a festival has no ticket links', () => {
    expect(hasFestivalTicketLinks(festival)).toBeFalse();
  });

  it('returns true when a festival has a primary ticket link', () => {
    expect(
      hasFestivalTicketLinks({
        ...festival,
        ticketLinks: { ticketUrl: 'https://tickets.example.com' },
      }),
    ).toBeTrue();
  });

  it('returns true when a festival only has a resale link', () => {
    expect(
      hasFestivalTicketLinks({
        ...festival,
        ticketLinks: { resaleTicketUrl: 'https://resale.example.com' },
      }),
    ).toBeTrue();
  });
});
