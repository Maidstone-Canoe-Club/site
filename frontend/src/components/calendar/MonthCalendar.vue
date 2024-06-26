﻿<script setup lang="ts">
import {
  XMarkIcon
} from "@heroicons/vue/24/outline";
import {
  eachDayOfInterval,
  format,
  startOfMonth,
  startOfWeek,
  endOfWeek,
  endOfMonth,
  getMonth,
  isToday,
  isWithinInterval,
  isSameDay,
  startOfDay,
  endOfDay
} from "date-fns";
import type { EventException, EventItem } from "~/types";
import { useCalendarStore } from "~/store/calendarStore";

type CalendarEvent = {
  id: string,
  title: string,
  type: string,
  time: string,
  dateTime: string,
  href: string,
  bookings?: number,
  maxSpaces?: number,
  spansMultiDays: boolean
}

type CalendarDay = {
  date: string,
  events: CalendarEvent[],
  isCurrentMonth: boolean,
  isToday: boolean,
  isSelected: boolean | undefined
}

const props = withDefaults(defineProps<{
  events: EventItem[],
  exceptions: EventException[],
  displayEventsPerDay?: number,
  loading: boolean
}>(), {
  displayEventsPerDay: 3
});

const store = useCalendarStore();

const days = ref<CalendarDay[]>([]);

const openDayModal = ref<boolean>(false);
const renderExtraRow = computed<boolean>(() => days.value.length > 35);

function eventItemToCalendarEvent (eventItem: EventItem, date: Date): CalendarEvent {
  return {
    id: eventItem.id!,
    title: eventItem.title,
    type: eventItem.type,
    dateTime: format(new Date(eventItem.start_date), "yyyy-MM-ddTHH:mm"),
    time: formatShortTime(eventItem.start_date),
    href: getEventUrl(eventItem, date),
    bookings: eventItem.bookings,
    maxSpaces: eventItem.max_spaces,
    spansMultiDays: spansMultiDays(eventItem)
  };
}

function getEventsForDate (date: Date): CalendarEvent[] {
  return props.events.filter((e) => {
    const start = startOfDay(new Date(e.start_date));
    const end = endOfDay(new Date(e.end_date!));

    const withinDateRange = isWithinInterval(date, {
      start,
      end
    });

    const eventIsSingleDay = isSameDay(start, end);
    return withinDateRange || (eventIsSingleDay && isSameDay(start, date));
  })
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
    .map(e => eventItemToCalendarEvent(e, date));
}

function generateDays (): CalendarDay[] {
  const today = new Date(store.year, store.month, store.day);

  const intervals = eachDayOfInterval({
    start: startOfWeek(startOfMonth(today), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(today), { weekStartsOn: 1 })
  });

  return intervals.map(date => ({
    date: format(date, "yyy-MM-dd"),
    isCurrentMonth: getMonth(date) === store.month,
    isToday: isToday(date),
    isSelected: isToday(date),
    events: getEventsForDate(date)
  }));
}

function isInstanceCancelled (event: EventItem, instance: string) {
  return props.exceptions?.find(e => e.event === event.id && e.instance === instance)?.is_cancelled ?? false;
}

watch(() => props.events, () => {
  days.value = generateDays();
}, { immediate: true, deep: true });

const selectedDay = computed<CalendarDay | undefined>(() => days.value.find(day => day.isSelected));

function selectDay (day: CalendarDay) {
  if (selectedDay.value) {
    selectedDay.value.isSelected = false;
  }
  day.isSelected = true;
}

function openDay (day: CalendarDay) {
  selectDay(day);
  openDayModal.value = true;
}

const eventHovering = ref<string | null>(null);

function hoveringEnter (event: CalendarEvent) {
  eventHovering.value = event.href;
}

function hoveringLeave () {
  eventHovering.value = null;
}

function getHoverState (event: CalendarEvent) {
  if (eventHovering.value === event.href) {
    return "underline  group-hover:text-indigo-600";
  }

  return null;
}

function getEventBorderColor (event: CalendarEvent) {
  const hover = getHoverState(event);

  if (eventHovering.value && !hover) {
    return "border-gray-300";
  }

  switch (event.type) {
  case "club_paddle":
    return "border-blue-500";
  case "pool_session":
    return "border-cyan-500";
  case "paddles_trips_tours":
    return "border-orange-500";
  case "fun_session":
    return "border-violet-500";
  case "social_events":
    return "border-rose-500";
  case "beginners_course":
    return "border-green-500";
  case "race_training":
    return "border-yellow-500";
  case "race":
    return "border-lime-500";
  case "coaching":
    return "border-pink-500";
  case "meetings":
    return "border-red-500";
  default:
    return "border-gray-300";
  }
}

function getEventDotColor (event: CalendarEvent) {
  const hover = getHoverState(event);

  if (eventHovering.value && !hover) {
    return "bg-gray-300";
  }

  switch (event.type) {
  case "club_paddle":
    return "bg-blue-500";
  case "pool_session":
    return "bg-cyan-500";
  case "paddles_trips_tours":
    return "bg-orange-500";
  case "fun_session":
    return "bg-violet-500";
  case "social_events":
    return "bg-rose-500";
  case "beginners_course":
    return "bg-green-500";
  case "race_training":
    return "bg-yellow-500";
  case "race":
    return "bg-lime-500";
  case "coaching":
    return "bg-pink-500";
  case "meetings":
    return "bg-red-500";
  default:
    return "bg-gray-300";
  }
}

function formatDate (input: Date | string) {
  return format(new Date(input), "do MMMM");
}

function spacesLeftLabel (event: CalendarEvent) {
  if (event.maxSpaces) {
    const count = event.maxSpaces - (event.bookings || 0);
    if (count === 0) {
      return "Event full";
    }

    return count === 1 ? "1 space left" : `${count} spaces left`;
  }

  return null;
}

function spansMultiDays (event: EventItem) {
  const start = new Date(event.start_date);
  const end = new Date(event.end_date);

  // Reset time part for precise day comparison
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  // The event spans multiple days if the start date and end date are not the same
  return start.getTime() !== end.getTime();
}
</script>

<template>
  <div class="lg:flex lg:h-full lg:flex-col">
    <div class="relative">
      <div class="shadow ring-1 ring-black ring-opacity-5 lg:flex lg:flex-auto lg:flex-col">
        <div
          class="grid grid-cols-7 gap-px border-b border-gray-300 bg-gray-200 text-center text-xs font-semibold leading-6 text-gray-700 lg:flex-none">
          <div class="bg-white py-2">
            M<span class="sr-only sm:not-sr-only">on</span>
          </div>
          <div class="bg-white py-2">
            T<span class="sr-only sm:not-sr-only">ue</span>
          </div>
          <div class="bg-white py-2">
            W<span class="sr-only sm:not-sr-only">ed</span>
          </div>
          <div class="bg-white py-2">
            T<span class="sr-only sm:not-sr-only">hu</span>
          </div>
          <div class="bg-white py-2">
            F<span class="sr-only sm:not-sr-only">ri</span>
          </div>
          <div class="bg-white py-2">
            S<span class="sr-only sm:not-sr-only">at</span>
          </div>
          <div class="bg-white py-2">
            S<span class="sr-only sm:not-sr-only">un</span>
          </div>
        </div>
        <div class="flex bg-gray-200 text-xs leading-6 text-gray-700 lg:flex-auto">
          <div
            class="hidden w-full lg:grid lg:grid-cols-7 lg:gap-px"
            :class="{
              'lg:grid-rows-6': renderExtraRow
            }">
            <div
              v-for="day in days"
              :key="day.date"
              class="h-[156px]"
              :class="[day.isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-500', 'relative px-1 py-2']">
              <time
                :datetime="day.date"
                class="ml-2"
                :class="day.isToday ? 'flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 font-semibold text-white' : undefined">
                {{ day.date.split('-').pop()?.replace(/^0/, '') }}
              </time>
              <ol v-if="day.events.length > 0" class="mt-2">
                <li
                  v-for="(event, eventIndex) in day.events.slice(0, displayEventsPerDay)"
                  :key="eventIndex"
                  class="mb-1">
                  <nuxt-link
                    v-tooltip="event.title"
                    :to="event.href"
                    :class="[!day.isCurrentMonth ? 'opacity-50' : '', getEventBorderColor(event)]"
                    class="flex group border-l-4 border-blue-500 pl-1 transition-colors"
                    @mouseenter="hoveringEnter(event)"
                    @mouseleave="hoveringLeave()">
                    <p
                      class="flex-auto truncate font-medium text-gray-900 group-hover:text-indigo-600"
                      :class="getHoverState(event)">
                      {{ event.title }}
                    </p>
                    <time
                      v-if="event.time && !event.spansMultiDays"
                      :datetime="event.dateTime"
                      class="ml-3 hidden flex-none text-gray-500 group-hover:text-indigo-600 xl:block">
                      {{ event.time }}
                    </time>
                  </nuxt-link>
                </li>
                <button
                  v-if="day.events.length > displayEventsPerDay"
                  class="text-indigo-500 hover:text-indigo-600 ml-2"
                  @click="openDay(day)">
                  + {{ day.events.length - displayEventsPerDay }} more
                </button>
              </ol>
            </div>
          </div>
          <div class="isolate grid w-full grid-cols-7 gap-px lg:hidden">
            <button
              v-for="(day, daySmallIndex) in days"
              :key="daySmallIndex"
              type="button"
              :class="[
                day.isCurrentMonth ? 'bg-white' : 'bg-gray-50',
                (day.isSelected || day.isToday) && 'font-semibold',
                day.isSelected && 'text-white',
                !day.isSelected && day.isToday && 'text-indigo-600',
                !day.isSelected && day.isCurrentMonth && !day.isToday && 'text-gray-900',
                !day.isSelected && !day.isCurrentMonth && !day.isToday && 'text-gray-500',
                'flex h-14 flex-col px-3 py-2 hover:bg-gray-100 focus:z-10']"
              @click="selectDay(day)">
              <time
                :datetime="day.date"
                :class="[
                  day.isToday && 'bg-indigo-600 text-white',
                  day.isSelected && !day.isToday && 'bg-gray-900',
                  'flex h-6 w-6 items-center justify-center rounded-full ml-auto']">
                {{ day.date.split('-').pop()?.replace(/^0/, '') }}
              </time>
              <span class="sr-only">{{ day.events.length }} events</span>
              <span v-if="day.events.length > 0" class="mt-auto flex flex-wrap-reverse -mx-0.5">
                <span
                  v-for="event in day.events"
                  :key="event.id + '-small'"
                  :class="getEventDotColor(event)"
                  class="mb-1 rounded-full mx-0.5 h-1.5 w-1.5" />
              </span>
            </button>
          </div>
        </div>
      </div>
      <div v-if="selectedDay && selectedDay.events.length > 0" class="py-10 sm:px-6 lg:hidden">
        <ol
          class="overflow-hidden rounded-lg bg-white text-sm shadow ring-1 ring-black ring-opacity-5 divide-y divide-gray-100">
          <li
            v-for="event in selectedDay.events"
            :key="event.id"
            class="flex items-center p-4 pr-6 group focus-within:bg-gray-50 hover:bg-gray-50">
            <div class="flex flex-col gap-2 w-full">
              <div class="flex flex-row gap-2 items-center">
                <p
                  class="font-semibold text-gray-900 border-l-4 pl-2"
                  :class="getEventBorderColor(event)">
                  {{ event.title }}
                </p>
              </div>
              <div
                v-if="(event.time && !event.spansMultiDays) || spacesLeftLabel(event)"
                class="flex gap-2 items-center">
                <time
                  v-if="event.time && !event.spansMultiDays"
                  :datetime="event.dateTime"
                  class="flex items-center text-gray-700">
                  {{ event.time }}
                </time>
                <span
                  v-if="spacesLeftLabel(event)"
                  class="inline-flex items-center rounded-full bg-indigo-50 px-1.5 py-0.5 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                  {{ spacesLeftLabel(event) }}
                </span>
              </div>
            </div>
            <nuxt-link
              :to="event.href"
              class="ml-6 flex-none self-center rounded-md bg-white px-3 py-2 font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 group-hover:opacity-100 hover:ring-gray-400 focus:opacity-100">
              View<span class="sr-only">, {{ event.title }}</span>
            </nuxt-link>
          </li>
        </ol>
      </div>
      <div
        :class="[loading ? 'opacity-100' : 'opacity-0']"
        class="absolute bg-gray-500 bg-opacity-5 inset-0 transition-opacity flex items-center justify-center pointer-events-none">
        <loading-spinner
          size="50px"
          color="#6366F1" />
      </div>
    </div>
    <TransitionRoot as="template" :show="openDayModal">
      <Dialog as="div" class="relative z-10" @close="openDayModal = false">
        <TransitionChild
          as="template"
          enter="ease-out duration-300"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="ease-in duration-200"
          leave-from="opacity-100"
          leave-to="opacity-0">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </TransitionChild>

        <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <TransitionChild
              as="template"
              enter="ease-out duration-300"
              enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enter-to="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leave-from="opacity-100 translate-y-0 sm:scale-100"
              leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
              <DialogPanel
                class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div class="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    class="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    @click="openDayModal = false">
                    <span class="sr-only">Close</span>
                    <XMarkIcon class="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div class="sm:flex sm:items-start">
                  <div class="mt-3 w-full text-center sm:mt-0 sm:text-left">
                    <DialogTitle as="h3" class="text-base font-semibold leading-6 text-gray-900">
                      Events for {{ formatDate(selectedDay!.date) }}
                    </DialogTitle>
                    <div class="mt-4 flex">
                      <ol class="flex-grow overflow-hidden bg-white text-sm divide-y divide-gray-100">
                        <li
                          v-for="event in selectedDay!.events"
                          :key="event.id"
                          class="flex p-4 pr-6 group focus-within:bg-gray-50 hover:bg-gray-50">
                          <div class="flex-auto">
                            <p
                              class="font-semibold text-gray-900 border-l-4 pl-2"
                              :class="getEventBorderColor(event)">
                              {{ event.title }}
                            </p>
                            <time
                              v-if="event.time && !event.spansMultiDays"
                              :datetime="event.dateTime"
                              class="mt-2 flex items-center text-gray-700">
                              {{ event.time }}
                            </time>
                          </div>
                          <nuxt-link
                            :to="event.href"
                            class="ml-6 flex-none self-center rounded-md bg-white px-3 py-2 font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 group-hover:opacity-100 hover:ring-gray-400 focus:opacity-100">
                            View<span class="sr-only">, {{ event.title }}</span>
                          </nuxt-link>
                        </li>
                      </ol>
                    </div>
                  </div>
                </div>
                <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    class="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                    @click="openDayModal = false">
                    Deactivate
                  </button>
                  <button
                    type="button"
                    class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    @click="openDayModal = false">
                    Cancel
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<style scoped lang="scss">

</style>
