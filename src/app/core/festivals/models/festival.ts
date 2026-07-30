import { FestivalSet } from './festival-set';

export interface FestivalLocation {
  displayName: string;
  latitude: number;
  longitude: number;
  precision: 'city' | 'venue';
  source: string;
  verifiedAt: string;
}

export interface FestivalCatalogueSource {
  provider: 'timetable-lol';
  eventSlug: string;
  sourceUrl: string;
}

export interface Festival {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  imageUrl?: string;
  location: string;
  locationMetadata?: FestivalLocation;
  transportArranged: boolean;
  accommodationArranged?: boolean;
  lineupSets?: readonly FestivalSet[];
  /** Undefined legacy records are treated as custom unless they have a catalogue source. */
  isCustom?: boolean;
  catalogueSource?: FestivalCatalogueSource;
  createdAt: string;
  updatedAt: string;
}

export function isCustomFestival(festival: Festival): boolean {
  return festival.isCustom ?? !festival.catalogueSource;
}
