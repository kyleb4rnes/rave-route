import { inject, Injectable } from '@angular/core';

import { ImageStorageService } from '../../images/image-storage.service';
import { Festival } from '../models/festival';
import { FestivalRepository } from './festival.repository';

const storageKey = 'rave-route.festivals.v1';

@Injectable({ providedIn: 'root' })
export class LocalStorageFestivalRepository implements FestivalRepository {
  private readonly imageStorage = inject(ImageStorageService);

  async getAll(): Promise<Festival[]> {
    const storedFestivals = localStorage.getItem(storageKey);

    if (!storedFestivals) {
      return [];
    }

    const festivals = JSON.parse(storedFestivals) as unknown;

    if (!Array.isArray(festivals)) {
      throw new Error('Stored festival data is not a list.');
    }

    const parsedFestivals = festivals as Festival[];
    const migratedFestivals = await Promise.all(
      parsedFestivals.map(async (festival) => {
        if (!festival.imageUrl) {
          return festival;
        }

        try {
          const imageUrl = await this.imageStorage.storeImage(festival.imageUrl);

          return imageUrl === festival.imageUrl ? festival : { ...festival, imageUrl };
        } catch {
          // Keep legacy data available if the device file system is temporarily unavailable.
          return festival;
        }
      }),
    );

    if (migratedFestivals.some((festival, index) => festival !== parsedFestivals[index])) {
      this.save(migratedFestivals);
    }

    return migratedFestivals;
  }

  async create(festival: Festival): Promise<void> {
    const festivals = await this.getAll();

    this.save([...festivals, festival]);
  }

  async update(festival: Festival): Promise<void> {
    const festivals = await this.getAll();

    this.save(festivals.map((existingFestival) => (existingFestival.id === festival.id ? festival : existingFestival)));
  }

  async delete(id: string): Promise<void> {
    const festivals = await this.getAll();

    this.save(festivals.filter((festival) => festival.id !== id));
  }

  private save(festivals: Festival[]): void {
    localStorage.setItem(storageKey, JSON.stringify(festivals));
  }
}
