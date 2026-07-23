import { FestivalSet } from './festival-set';

export interface Festival {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  imageUrl?: string;
  location: string;
  transportArranged: boolean;
  accommodationArranged?: boolean;
  lineupSets?: readonly FestivalSet[];
  createdAt: string;
  updatedAt: string;
}
