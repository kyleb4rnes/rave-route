import { Injectable } from '@angular/core';

import { Festival } from '../models/festival';
import { FestivalRepository } from './festival.repository';

const storageKey = 'rave-route.festivals.v1';

@Injectable({ providedIn: 'root' })
export class LocalStorageFestivalRepository implements FestivalRepository {
  async getAll(): Promise<Festival[]> {
    const storedFestivals = localStorage.getItem(storageKey);

    if (!storedFestivals) {
      return [];
    }

    const festivals = JSON.parse(storedFestivals) as unknown;

    if (!Array.isArray(festivals)) {
      throw new Error('Stored festival data is not a list.');
    }

    return festivals as Festival[];
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
