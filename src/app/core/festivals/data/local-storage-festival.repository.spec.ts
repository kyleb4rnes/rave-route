import { Festival } from '../models/festival';
import { LocalStorageFestivalRepository } from './local-storage-festival.repository';

const festival: Festival = {
  id: 'festival-id',
  title: 'Festival',
  startDate: '2026-08-14',
  endDate: '2026-08-16',
  location: 'Somerset',
  transportArranged: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('LocalStorageFestivalRepository', () => {
  let repository: LocalStorageFestivalRepository;

  beforeEach(() => {
    localStorage.clear();
    repository = new LocalStorageFestivalRepository();
  });

  afterEach(() => localStorage.clear());

  it('creates, reads, updates, and deletes festival data', async () => {
    await repository.create(festival);
    expect(await repository.getAll()).toEqual([festival]);

    const updatedFestival = { ...festival, title: 'Updated Festival' };
    await repository.update(updatedFestival);
    expect(await repository.getAll()).toEqual([updatedFestival]);

    await repository.delete(festival.id);
    expect(await repository.getAll()).toEqual([]);
  });
});
