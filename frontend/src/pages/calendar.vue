﻿<template>
  <div>
    <event-filter
      :events="events"
      @change="onFilterChange" />
    <desktop-calendar
      class="mt-5"
      :events="filteredEvents"
      :loading="loading" />
  </div>
</template>

<script setup lang="ts">
import { addDays, addMonths, addWeeks, getDay, getDaysInMonth, getMonth, getWeeksInMonth, isSameDay } from "date-fns";
import { useCalendarStore } from "~/store/calendarStore";

const calendarStore = useCalendarStore();

const filters = ref<string[]>([]);
const events = ref([]);
const loading = ref(false);

const filteredEvents = computed(() => events.value.filter(e => filters.value.length === 0 ? true : filters.value.includes(e.type)));

const { getItems } = useDirectusItems();

const start = computed(() => new Date(calendarStore.year, calendarStore.month, 1));
const end = computed(() => new Date(calendarStore.year, calendarStore.getMonth + 1, 0, 23, 59, 59));

watch(() => calendarStore.month, async () => {
  await fetchEvents();
});

await fetchEvents();

async function fetchEvents () {
  loading.value = true;
  try {
    const getFilter = {
      _and: [
        {
          status: {
            _neq: "cancelled"
          }
        },
        {
          _or: [
            {
              is_recurring: { _eq: false }
            },
            {
              is_recurring: { _null: true }
            }
          ]
        },
        {
          start_date: { _lte: end.value }
        },
        {
          _or: [
            {
              end_date: { _gt: start.value }
            },
            {
              end_date: { _null: true }
            }
          ]
        }
      ]
    };

    const foundEvents = await getItems({
      collection: "events",
      params: {
        filter: getFilter
      }
    });

    const getRecurringFilter = {
      _and: [
        {
          is_recurring: { _eq: true }
        },
        {
          status: {
            _neq: "cancelled"
          }
        },
        {
          start_date: { _lte: end.value }
        },
        {
          _or: [
            {
              last_occurence: { _gt: start.value }
            },
            {
              last_occurence: { _null: true }
            }
          ]
        }
      ]
    };

    const recurringEvents = await getItems({
      collection: "events",
      params: {
        filter: getRecurringFilter
      }
    });

    if (recurringEvents?.length) {
      const recurringEventIds = recurringEvents.map(e => e.id);

      const eventExceptions = await getItems({
        collection: "event_exception",
        params: {
          filter: {
            event: {
              _in: recurringEventIds
            }
          }
        }
      });

      const recurringPatterns = await getItems({
        collection: "recurring_event_patterns",
        params: {
          filter: {
            event: {
              _in: recurringEventIds
            }
          }
        }
      });

      recurringPatterns.forEach((p) => {
        const event = recurringEvents.find(e => e.id === p.event);
        event.is_recurring = false;
        event.instance = 1;

        const exception = eventExceptions.find(x => x.event === event.id && x.instance === `${event.instance}`);
        if (!exception || !exception.is_cancelled) {
          foundEvents.push(event);
        }

        // TODO: The following code is a hot mess and needs refactoring

        if (p.type === "0") { // daily
          if (p.max_occurences) {
            for (let i = 1; i < p.max_occurences; i++) {
              const repeatedEvent = { ...event };
              repeatedEvent.start_date = addDays(new Date(event.start_date), i);
              repeatedEvent.end_date = addDays(new Date(event.end_date), i);
              repeatedEvent.instance = i + 1;
              const repeatedStartMonth = getMonth(repeatedEvent.start_date);

              // ensure we only add events that fall within the current month
              if (repeatedStartMonth === calendarStore.getMonth) {
                const exception = eventExceptions.find(x => x.event === event.id && x.instance === `${repeatedEvent.instance}`);
                if (!exception || !exception.is_cancelled) {
                  foundEvents.push(repeatedEvent);
                }
              }
            }
          } else {
            const daysInMonth = getDaysInMonth(new Date(calendarStore.getYear, calendarStore.getMonth, 1));
            const startDate = new Date(event.start_date);
            for (let i = 0; i < daysInMonth; i++) {
              const date = new Date(calendarStore.getYear, calendarStore.getMonth, i + 1);

              if (date < startDate) {
                continue;
              }

              if (isRecurringEventOnDate(p, date)) {
                const repeatedEvent = { ...event };
                const instance = countEventOccurences(p, startDate, date);
                repeatedEvent.start_date = addDays(startDate, instance);
                repeatedEvent.end_date = addDays(new Date(event.end_date), instance);
                repeatedEvent.instance = instance + 1;

                const exception = eventExceptions.find(x => x.event === event.id && x.instance === `${repeatedEvent.instance}`);
                if (!exception || !exception.is_cancelled) {
                  foundEvents.push(repeatedEvent);
                }
              }
            }
          }
        } else if (p.type === "1") { // weekly
          if (p.max_occurences) {
            // TODO: clamp this loop to something sensible
            for (let i = 1; i < p.max_occurences; i++) {
              const repeatedEvent = { ...event };
              repeatedEvent.start_date = addWeeks(new Date(event.start_date), i);
              repeatedEvent.end_date = addWeeks(new Date(event.end_date), i);
              repeatedEvent.instance = i + 1;

              const repeatedStartMonth = getMonth(repeatedEvent.start_date);

              // ensure we only add events that fall within the current month
              if (repeatedStartMonth === calendarStore.getMonth) {
                const exception = eventExceptions.find(x => x.event === event.id && x.instance === `${repeatedEvent.instance}`);
                if (!exception || !exception.is_cancelled) {
                  foundEvents.push(repeatedEvent);
                }
              }
            }
          } else {
            const daysInMonth = getDaysInMonth(new Date(calendarStore.getYear, calendarStore.getMonth, 1));
            const startDate = new Date(event.start_date);
            for (let i = 0; i < daysInMonth; i++) {
              const date = new Date(calendarStore.getYear, calendarStore.getMonth, i + 1);

              if (date < startDate) {
                continue;
              }

              if (isRecurringEventOnDate(p, date)) {
                const repeatedEvent = { ...event };
                const instance = countEventOccurences(p, startDate, date);
                repeatedEvent.start_date = addWeeks(startDate, instance);
                repeatedEvent.end_date = addWeeks(new Date(event.end_date), instance);
                repeatedEvent.instance = instance + 1;

                const exception = eventExceptions.find(x => x.event === event.id && x.instance === `${repeatedEvent.instance}`);
                if (!exception || !exception.is_cancelled) {
                  foundEvents.push(repeatedEvent);
                }
              }
            }
          }
        } else if (p.type === "2") { // monthly
          console.log("p", p);
          if (p.max_occurences) {
            // TODO: clamp this loop to something sensible
            for (let i = 1; i < p.max_occurences; i++) {
              const repeatedEvent = { ...event };
              repeatedEvent.start_date = addMonths(new Date(event.start_date), i);
              repeatedEvent.end_date = addMonths(new Date(event.end_date), i);
              repeatedEvent.instance = i + 1;
              const repeatedStartMonth = getMonth(repeatedEvent.start_date);

              console.log("month", repeatedStartMonth, calendarStore.getMonth);
              // ensure we only add events that fall within the current month
              if (repeatedStartMonth === calendarStore.getMonth) {
                const exception = eventExceptions.find(x => x.event === event.id && x.instance === `${repeatedEvent.instance}`);
                if (!exception || !exception.is_cancelled) {
                  foundEvents.push(repeatedEvent);
                }
              }
            }
          } else {
            const daysInMonth = getDaysInMonth(new Date(calendarStore.getYear, calendarStore.getMonth, 1));
            const startDate = new Date(event.start_date);
            for (let i = 0; i < daysInMonth; i++) {
              const date = new Date(calendarStore.getYear, calendarStore.getMonth, i + 1);

              if (date < startDate) {
                continue;
              }

              if (isRecurringEventOnDate(p, date)) {
                const repeatedEvent = { ...event };
                const instance = countEventOccurences(p, startDate, date);
                repeatedEvent.start_date = addWeeks(startDate, instance);
                repeatedEvent.end_date = addWeeks(new Date(event.end_date), instance);
                repeatedEvent.instance = instance + 1;

                const exception = eventExceptions.find(x => x.event === event.id && x.instance === `${repeatedEvent.instance}`);
                if (!exception || !exception.is_cancelled) {
                  foundEvents.push(repeatedEvent);
                }
              }
            }
          }
        }
      });
    }

    events.value = foundEvents;
  } catch (e) {
    console.error("unable to fetch events", e);
  } finally {
    loading.value = false;
  }
}

function isRecurringEventOnDate (pattern, date) {
  const dayMap = {
    0: 6,
    1: 0,
    2: 1,
    3: 2,
    4: 3,
    5: 4,
    6: 5
  };

  if (pattern.type === "0") { // daily
    return true;
  }

  // const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  // const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  // let currentDate = startOfMonth;
  // let currentWeekOfMonth = 0;
  //
  // while (currentDate <= endOfMonth) {
  //   if (isSameDay(currentDate, date)) {
  //     currentWeekOfMonth++;
  //     break;
  //   }
  //   currentDate = addWeeks(currentDate, 1);
  // }
  //
  // if (currentWeekOfMonth !== pattern.week_of_month) {
  //   return false;
  // }

  if (dayMap[getDay(date)] !== pattern.day_of_week) {
    return false;
  }

  return true;
}

function countEventOccurences (pattern, startDate, endDate) {
  let currentDate = startDate;
  let count = 0;
  while (currentDate <= endDate) {
    if (isRecurringEventOnDate(pattern, currentDate)) {
      count++;
    }

    if (pattern.type === "0") {
      currentDate = addDays(currentDate, 1);
    } else if (pattern.type === "1") {
      currentDate = addWeeks(currentDate, 1);
    } else {
      throw new Error("Unknown event pattern type: " + pattern.type);
    }
  }

  return count;
}

function onFilterChange (val: Record<string, boolean>) {
  filters.value = Object.keys(val).filter(key => val[key]);
}

</script>

<style scoped lang="scss">

</style>
