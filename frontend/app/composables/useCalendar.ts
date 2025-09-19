import {
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  getMonth,
  isSameDay,
  isToday,
  isWithinInterval,
  startOfDay,
  startOfMonth,
  startOfWeek
} from "date-fns";
import { RRule } from "rrule";
import type { EventItem } from "~/types";

export type CalendarEvent = {
  id: string,
  name: string,
  time: string,
  dateTime: string,
  href: string
}

export type CalendarDay = {
  date: string,
  events: CalendarEvent[],
  isCurrentMonth: boolean,
  isToday: boolean,
  isSelected: boolean | undefined
}

export function useCalendar () {
  const year = ref(new Date().getFullYear());
  const month = ref(new Date().getMonth());
  const day = ref(new Date().getDate());

  function getDaysInMonth (year: number, month: number) {
    const date = new Date(year, month + 1, 0);
    return date.getDate();
  }

  function incrementYear (val: number) {
    year.value = year.value + val;
  }

  function decrementYear (val: number) {
    year.value = year.value - val;
  }

  function incrementMonth (val: number) {
    if (month.value === 11) {
      incrementYear(1);
      month.value = 0;
      return;
    }

    month.value = month.value + val;

    const daysInMonth = getDaysInMonth(year.value, month.value);
    if (day.value > daysInMonth) {
      day.value = daysInMonth;
    }
  }

  function decrementMonth (val: number) {
    if (month.value === 0) {
      decrementYear(1);
      month.value = 11;
      return;
    }

    month.value = month.value - val;
  }

  function resetDate () {
    year.value = new Date().getFullYear();
    month.value = new Date().getMonth();
    day.value = new Date().getDate();
  }

  function eventItemToCalendarEvent (eventItem: EventItem, date: Date): CalendarEvent {
    return {
      id: eventItem.id!,
      name: eventItem.title,
      dateTime: format(new Date(eventItem.start_date), "yyyy-MM-ddTHH:mm"),
      time: format(new Date(eventItem.start_date), "HHaa"),
      href: getEventUrl(eventItem, date)
    };
  }

  function getEventsForDate (events: EventItem[], date: Date): CalendarEvent[] {
    return events.filter((e) => {
      const start = new Date(e.start_date);
      const end = new Date(e.end_date);

      if (!e.is_recurring) {
        const withinDateRange = isWithinInterval(date, {
          start,
          end
        });

        const eventIsSingleDay = isSameDay(start, end);
        return withinDateRange || (eventIsSingleDay && isSameDay(start, date));
      }

      const rule = RRule.fromString(e.rrule);

      const nextDates = rule.between(
        startOfDay(date),
        endOfDay(date)
      );

      return nextDates.length > 0;
    }).map(e => eventItemToCalendarEvent(e, date));
  }

  function generateDays (events?: EventItem[]) {
    const intervals = eachDayOfInterval({
      start: startOfWeek(startOfMonth(new Date(year.value, month.value, day.value)), { weekStartsOn: 1 }),
      end: endOfWeek(endOfMonth(new Date(year.value, month.value, day.value)), { weekStartsOn: 1 })
    });

    return intervals.map((date) => {
      const isCurrentMonth = getMonth(date) === month.value;
      return {
        date: format(date, "yyy-MM-dd"),
        isCurrentMonth,
        isToday: isToday(date),
        isSelected: false,
        events: isCurrentMonth && events ? getEventsForDate(events, date) : []
      };
    });
  }

  return {
    year,
    month,
    day,
    incrementMonth,
    decrementMonth,
    generateDays
  };
}
