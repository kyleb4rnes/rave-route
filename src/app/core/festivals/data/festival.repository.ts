import { Festival } from '../models/festival';

export interface FestivalRepository {
  getAll(): Promise<Festival[]>;
  create(festival: Festival): Promise<void>;
  update(festival: Festival): Promise<void>;
  delete(id: string): Promise<void>;
}
