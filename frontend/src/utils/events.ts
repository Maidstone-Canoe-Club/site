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

  if (eventItem.is_recurring && date) {
    const instance = getEventInstanceForDate(eventItem, date);
    href += `?instance=${instance}`;
  }

  return href;
}

export function getDatesOfInstance (event: EventItem, instance: number) {
  const startDate = new Date(event.start_date);
  const endDate = new Date(event.end_date);

  const duration = endDate.getTime() - startDate.getTime();
  const ruleData = RRule.fromString(event.rrule!);

  // TODO: This will need some optimisation in the future.
  // Has to iterator over each date to get to the current instance
  const all = ruleData.all((_, i) => {
    return i < instance + 1;
  });

  const start = all[instance];
  start.setHours(startDate.getHours(), startDate.getMinutes(), startDate.getSeconds());
  const end = new Date(endDate.getTime() + duration);

  return {
    start,
    end
  };
}
