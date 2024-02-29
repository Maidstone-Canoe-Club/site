import {
  addDays,
  addWeeks,
  addMonths,
  addYears
} from "date-fns";
import { RRule } from "rrule";
import type { EventItem } from "~/types";

export function getEventInstanceForDate (eventItem: EventItem, date: Date): number {
  if (!eventItem.rrule) {
    throw createError("Event is missing rule");
  }

  const rule = RRule.fromString(eventItem.rrule);
  const eventStart = new Date(eventItem.start_date);
  const untilDate = rule.options.until;

  const end = new Date(date);
  const endDate = untilDate && untilDate < end ? untilDate : date;

  const occurrences = rule.between(eventStart, endDate, true);

  return occurrences.length;
}

export function getEventUrl (eventItem: EventItem, date?: Date) {
  let href = `/events/${eventItem.id}`;

  if (eventItem.isRecurring && date) {
    const instance = getEventInstanceForDate(eventItem, date);
    href += `?instance=${instance}`;
  }

  return href;
}

export function getDateFromInstance (date: string, instance: number, recurringType?: string) {
  let result = new Date(date);
  if (instance && recurringType) {
    switch (recurringType) {
    case "0": // daily
      result = addDays(new Date(date), instance - 1);
      break;
    case "1": // weekly
      result = addWeeks(new Date(date), instance - 1);
      break;
    case "2": // monthly
      result = addMonths(new Date(date), instance - 1);
      break;
    case "3": // yearly
      result = addYears(new Date(date), instance - 1);
      break;
    default:
      throw new Error("Invalid recurring pattern type: " + recurringType);
    }
  }

  return result;
}
