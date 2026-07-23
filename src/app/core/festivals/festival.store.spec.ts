import { TestBed } from '@angular/core/testing';

import { FESTIVAL_REPOSITORY } from './data/festival-repository.token';
import { FestivalRepository } from './data/festival.repository';
import { Festival } from './models/festival';
import { FestivalStore } from './festival.store';

class InMemoryFestivalRepository implements FestivalRepository {
  constructor(private festivals: Festival[] = []) {}

  async getAll(): Promise<Festival[]> {
    return [...this.festivals];
  }

  async create(festival: Festival): Promise<void> {
    this.festivals = [...this.festivals, festival];
  }

  async update(festival: Festival): Promise<void> {
    this.festivals = this.festivals.map((existingFestival) =>
      existingFestival.id === festival.id ? festival : existingFestival,
    );
  }

  async delete(id: string): Promise<void> {
    this.festivals = this.festivals.filter((festival) => festival.id !== id);
  }
}

class FailingFestivalRepository implements FestivalRepository {
  async getAll(): Promise<Festival[]> {
    throw new Error('Storage failed');
  }

  async create(): Promise<void> {
    throw new Error('Storage failed');
  }

  async update(): Promise<void> {
    throw new Error('Storage failed');
  }

  async delete(): Promise<void> {
    throw new Error('Storage failed');
  }
}

const nextFestival: Festival = {
  id: 'next',
  title: 'Next Festival',
  startDate: '2026-08-14',
  endDate: '2026-08-16',
  location: 'Somerset',
  transportArranged: true,
  accommodationArranged: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const laterFestival: Festival = {
  ...nextFestival,
  id: 'later',
  title: 'Later Festival',
  startDate: '2026-09-04',
  endDate: '2026-09-06',
};

const pastFestival: Festival = {
  ...nextFestival,
  id: 'past',
  title: 'Past Festival',
  startDate: '2026-06-01',
  endDate: '2026-06-03',
};

describe('FestivalStore', () => {
  it('loads repository data and derives home-page festival groups', async () => {
    const store = createStore(new InMemoryFestivalRepository([laterFestival, pastFestival, nextFestival]));

    await store.loadFestivals();

    expect(store.allFestivals().map((festival) => festival.id)).toEqual(['past', 'next', 'later']);
    expect(store.nextFestival()?.id).toBe('next');
    expect(store.laterUpcomingFestivals().map((festival) => festival.id)).toEqual(['later']);
    expect(store.pastFestivals().map((festival) => festival.id)).toEqual(['past']);
  });

  it('creates, timestamps, persists, and sorts a festival', async () => {
    const repository = new InMemoryFestivalRepository([laterFestival]);
    const store = createStore(repository);
    await store.loadFestivals();

    const createdFestival = await store.addFestival({
      title: 'Created Festival',
      startDate: '2026-08-01',
      endDate: '2026-08-03',
      location: 'Bristol',
      transportArranged: false,
      accommodationArranged: false,
    });

    if (!createdFestival) {
      throw new Error('Expected a festival to be created.');
    }

    expect(createdFestival.id).not.toBe('');
    expect(createdFestival.createdAt).toBe(createdFestival.updatedAt);
    expect(store.allFestivals().map((festival) => festival.id)).toEqual([
      createdFestival?.id,
      'later',
    ]);
    expect((await repository.getAll()).map((festival) => festival.id)).toContain(createdFestival.id);
  });

  it('updates and deletes a persisted festival', async () => {
    const repository = new InMemoryFestivalRepository([nextFestival]);
    const store = createStore(repository);
    await store.loadFestivals();

    const updatedFestival = await store.updateFestival('next', {
      title: 'Updated Festival',
      startDate: '2026-08-14',
      endDate: '2026-08-17',
      location: 'Bristol',
      transportArranged: false,
      accommodationArranged: false,
    });

    expect(updatedFestival?.title).toBe('Updated Festival');
    expect(store.getFestivalById('next')?.location).toBe('Bristol');
    expect(await store.deleteFestival('next')).toBeTrue();
    expect(store.getFestivalById('next')).toBeUndefined();
    expect(await repository.getAll()).toEqual([]);
  });

  it('reports a repository load failure without leaving the store loading', async () => {
    const store = createStore(new FailingFestivalRepository());

    await store.loadFestivals();

    expect(store.loading()).toBeFalse();
    expect(store.allFestivals()).toEqual([]);
    expect(store.error()).toBe('We could not load your festivals. Please try again.');
  });
});

function createStore(repository: FestivalRepository): FestivalStore {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [FestivalStore, { provide: FESTIVAL_REPOSITORY, useValue: repository }],
  });

  return TestBed.inject(FestivalStore);
}
