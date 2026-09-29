import { Festival } from './models/festival';

/** Returns whether a festival has at least one external ticket destination. */
export function hasFestivalTicketLinks(festival: Festival): boolean {
  return Boolean(festival.ticketLinks?.ticketUrl || festival.ticketLinks?.resaleTicketUrl);
}
