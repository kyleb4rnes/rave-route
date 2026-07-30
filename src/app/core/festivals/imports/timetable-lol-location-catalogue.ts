import { FestivalLocation } from '../models/festival';

/**
 * Reviewed, city-level locations for the bundled Timetable.lol catalogue.
 *
 * These records are deliberately shipped with the app rather than looked up
 * on a user's device. Keep this list under review whenever the timetable
 * catalogue is refreshed; omit an uncertain event rather than guessing.
 */
const curatedAt = '2026-07-30';

function cityLocation(displayName: string, latitude: number, longitude: number): FestivalLocation {
  return {
    displayName,
    latitude,
    longitude,
    precision: 'city',
    source: 'Rave Route curated catalogue',
    verifiedAt: curatedAt,
  };
}

export const timetableLolLocations: Readonly<Record<string, FestivalLocation>> = {
  intents_festival_2025_timetable: cityLocation('Oisterwijk, Netherlands', 51.579, 5.189),
  ultra_music_festival_2026_timetable: cityLocation('Miami, United States', 25.762, -80.192),
  masters_of_hardcore_2026_timetable: cityLocation("'s-Hertogenbosch, Netherlands", 51.697, 5.303),
  rebirth_festival_2026: cityLocation('Haaren, Netherlands', 51.602, 5.223),
  hardfest_2026: cityLocation('Enschede, Netherlands', 52.222, 6.893),
  kingsdance_zwolle_2026: cityLocation('Zwolle, Netherlands', 52.516, 6.083),
  supersized_kingsday_2026_timetable: cityLocation('Best, Netherlands', 51.509, 5.398),
  kingsland_festival_2026_groningen_timetable: cityLocation('Groningen, Netherlands', 53.219, 6.567),
  kingsland_festival_2026_amsterdam_timetable: cityLocation('Amsterdam, Netherlands', 52.367, 4.904),
  gearbox_digital_cologne_2026_timetable: cityLocation('Cologne, Germany', 50.938, 6.960),
  midnight_mafia_2026_timetable: cityLocation('Melbourne, Australia', -37.814, 144.963),
  edc_las_vegas_2026_timetable: cityLocation('Las Vegas, United States', 36.170, -115.140),
  harmony_of_hardcore_2026_timetable: cityLocation('Erp, Netherlands', 51.600, 5.606),
  intents_festival_2026_timetable: cityLocation('Oisterwijk, Netherlands', 51.579, 5.189),
  graspop_2026: cityLocation('Dessel, Belgium', 51.239, 5.114),
  defqon1_2026_timetable: cityLocation('Biddinghuizen, Netherlands', 52.432, 5.770),
  rampage_open_air_2026: cityLocation('Lommel, Belgium', 51.231, 5.307),
  vwab_festival_2026_lineup: cityLocation('Rosmalen, Netherlands', 51.716, 5.367),
  dreamfields_2026_timetable: cityLocation('Lathum, Netherlands', 51.988, 6.024),
  parookaville_2026_timetable: cityLocation('Weeze, Germany', 51.602, 6.143),
  tml_w1_2026: cityLocation('Boom, Belgium', 51.092, 4.371),
  tml_w2_2026: cityLocation('Boom, Belgium', 51.092, 4.371),
  dominator_festival_2026_timetable: cityLocation('Eersel, Netherlands', 51.357, 5.319),
  liquicity_festival_2026_timetable: cityLocation('Langedijk, Netherlands', 52.708, 4.819),
  shutdown_festival_2026_timetable: cityLocation('Schallaburg, Austria', 48.185, 15.340),
  decibel_outdoor_2026_lineup: cityLocation('Hilvarenbeek, Netherlands', 51.502, 5.134),
  freshtival_2026_timetable: cityLocation('Enschede, Netherlands', 52.222, 6.893),
};

export function getTimetableLolLocation(eventSlug: string): FestivalLocation | undefined {
  return timetableLolLocations[eventSlug];
}
