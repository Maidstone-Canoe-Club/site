import {RRule} from "rrule";
import {addDays, startOfDay} from "date-fns";
import {utcToZonedTime} from "date-fns-tz";

const timeZone = "Europe/London";
const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const formatters = new Map<string, Intl.DateTimeFormat>();

export type Occurrence = {
  start_date: Date,
  end_date: Date,
  instance: number
};

function wallClockTime(date: Date, zone: string) {
  let formatter = formatters.get(zone);

  if (!formatter) {
    // The options toLocaleString uses by default, so the output matches rrule's own conversion exactly
    formatter = new Intl.DateTimeFormat("sv-SE", {
      timeZone: zone,
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric"
    });
    formatters.set(zone, formatter);
  }

  return new Date(formatter.format(date).replace(" ", "T") + "Z").getTime();
}

// Same as rrule's dateInTimeZone, which it applies to every candidate date when a tzid is set.
// rrule calls toLocaleString twice per date there, building a new Intl formatter each time, which
// made expanding a few years of a weekly series take hundreds of milliseconds.
function rezone(date: Date) {
  const offset = wallClockTime(date, timeZone) - wallClockTime(date, localTimeZone);
  return new Date(date.getTime() - offset);
}

/**
 * Expands a recurring event into its occurrences between start and end (inclusive), numbering each
 * occurrence by its position in the series. Gives the same results as building the rule with
 * tzid "Europe/London", just without rrule's slow time zone conversion.
 */
export function getOccurrences(event: any, start: Date, end: Date): Occurrence[] {
  // Parse event start and end dates in 'Europe/London' time zone
  const eventStartDate = utcToZonedTime(event.start_date, timeZone);
  const eventEndDate = utcToZonedTime(event.end_date, timeZone);
  const duration = eventEndDate.getTime() - eventStartDate.getTime();

  const ruleOptions = RRule.parseString(event.rrule);
  ruleOptions.dtstart = eventStartDate;
  // No tzid, the dates are re-zoned below instead
  ruleOptions.tzid = null;

  const rule = new RRule(ruleOptions);

  // Ensure 'start' and 'end' are in 'Europe/London' time zone
  const startLondon = utcToZonedTime(start, timeZone);
  const endLondon = utcToZonedTime(end, timeZone);
  const seriesStartDay = startOfDay(eventStartDate);

  // Re-zoning shifts a date by hours at most, so take an extra day and compare on the re-zoned dates
  const dates = rule.between(eventStartDate, addDays(endLondon, 1), true).map(rezone);

  const occurrences: Occurrence[] = [];
  let countFromSeriesStart = 0;

  for (const date of dates) {
    if (date > endLondon) {
      break;
    }

    if (date >= seriesStartDay) {
      countFromSeriesStart++;
    }

    if (date >= startLondon) {
      occurrences.push({
        start_date: date,
        end_date: new Date(date.getTime() + duration),
        instance: countFromSeriesStart - 1
      });
    }
  }

  return occurrences;
}
