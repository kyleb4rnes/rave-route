import { Festival } from '../models/festival';
import { TimetableLolLineupService } from './timetable-lol-lineup.service';

const catalogueFixture = {
  events: [
    {
      eventSlug: 'api-festival-2026',
      title: 'API Festival 2026',
      startDate: '2026-08-14',
      endDate: '2026-08-15',
      sourceUrl: 'https://api.timetable.lol/api/events/api-festival-2026/planner-data',
      location: {
        displayName: 'Example Venue, Example City, NL',
        venue: 'Example Venue',
        city: 'Example City',
        country: 'NL',
        precision: 'venue',
        source: 'Timetable.lol API',
        verifiedAt: '2026-08-13T00:00:00.000Z',
      },
      imageUrl: 'https://api.timetable.lol/api/events/api-festival-2026/images/example.webp',
      tickets: {
        ticketUrl: 'https://tickets.example.com',
        price: '55.00',
        currency: 'EUR',
      },
      sets: [
        {
          performanceId: 'api-festival-2026:2026-08-14:Main:101:1',
          artist: 'First artist',
          day: '2026-08-14',
          startTime: '18:00',
          endTime: '19:00',
          stage: 'Main',
        },
        {
          performanceId: 'api-festival-2026:2026-08-15:Main:102:1',
          artist: 'Second artist',
          day: '2026-08-15',
          startTime: '19:00',
          endTime: '20:00',
          stage: 'Main',
        },
      ],
    },
  ],
};

const festival: Festival = {
  id: 'festival-id',
  title: 'API Festival 2026',
  startDate: '2026-08-14',
  endDate: '2026-08-14',
  location: 'Example Venue, Example City, NL',
  transportArranged: false,
  accommodationArranged: false,
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-01T00:00:00.000Z',
};

describe('TimetableLolLineupService', () => {
  beforeEach(() => {
    spyOn(window, 'fetch').and.resolveTo(
      new Response(JSON.stringify(catalogueFixture), { status: 200 }),
    );
  });

  it('exposes API-backed festival metadata in catalogue presets', async () => {
    const presets = await new TimetableLolLineupService().loadPresets();

    expect(presets).toEqual([
      jasmine.objectContaining({
        eventSlug: 'api-festival-2026',
        setCount: 2,
        imageUrl: catalogueFixture.events[0].imageUrl,
        ticketLinks: catalogueFixture.events[0].tickets,
        location: jasmine.objectContaining({ venue: 'Example Venue' }),
      }),
    ]);
  });

  it('imports all selected planner sets or filters them to an existing festival range', async () => {
    const service = new TimetableLolLineupService();
    const [preset] = await service.loadPresets();

    const allSets = await service.loadAllSets(preset);
    const matchingSets = await service.loadSets(preset, festival);

    expect(allSets.map((set) => set.artist)).toEqual(['First artist', 'Second artist']);
    expect(matchingSets.map((set) => set.artist)).toEqual(['First artist']);
    expect(allSets[0].source).toEqual(
      jasmine.objectContaining({
        provider: 'timetable-lol',
        performanceId: 'api-festival-2026:2026-08-14:Main:101:1',
      }),
    );
  });
});
