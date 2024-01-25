<template>
  <div class="lg:flex lg:h-full lg:flex-col">
    <header class="flex items-center justify-between border-b border-gray-200 px-6 py-4 lg:flex-none">
      <h1 class="text-base font-semibold leading-6 text-gray-900">
        <time datetime="2022-01">{{ monthLabel }} {{ calendarStore.getYear }}</time>
      </h1>
      <div class="flex items-center">
        <div class="relative flex items-center rounded-md bg-white shadow-sm md:items-stretch">
          <div
            class="pointer-events-none absolute inset-0 rounded-md ring-1 ring-inset ring-gray-300"
            aria-hidden="true" />
          <button
            type="button"
            class="flex items-center justify-center rounded-l-md py-2 pr-4 pl-3 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:px-2 md:hover:bg-gray-50"
            @click="calendarStore.decrementMonth(1)">
            <span class="sr-only">Previous month</span>
            <ChevronLeftIcon class="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            class="hidden text-sm font-semibold text-gray-900 px-3.5 hover:bg-gray-50 focus:relative md:block"
            @click="calendarStore.resetDate()">
            Today
          </button>
          <span class="relative -mx-px h-5 w-px bg-gray-300 md:hidden" />
          <button
            type="button"
            class="flex items-center justify-center rounded-r-md py-2 pr-3 pl-4 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:px-2 md:hover:bg-gray-50"
            @click="calendarStore.incrementMonth(1)">
            <span class="sr-only">Next month</span>
            <ChevronRightIcon class="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div class="hidden md:ml-4 md:flex md:items-center">
          <!--          <Menu as="div" class="relative">-->
          <!--            <MenuButton type="button" class="flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 gap-x-1.5 hover:bg-gray-50">-->
          <!--              Month view-->
          <!--              &lt;!&ndash;              <ChevronDownIcon class="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />&ndash;&gt;-->
          <!--            </HeadlessMenuButton>-->

          <!--            <transition-->
          <!--              enter-active-class="transition duration-100 ease-out"-->
          <!--              enter-from-class="scale-95 transform opacity-0"-->
          <!--              enter-to-class="scale-100 transform opacity-100"-->
          <!--              leave-active-class="transition duration-75 ease-in"-->
          <!--              leave-from-class="scale-100 transform opacity-100"-->
          <!--              leave-to-class="scale-95 transform opacity-0">-->
          <!--              <HeadlessMenuItems class="absolute right-0 z-10 mt-3 w-36 origin-top-right overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">-->
          <!--                <div class="py-1">-->
          <!--                  <HeadlessMenuItem v-slot="{ active }">-->
          <!--                    <a href="#" :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'block px-4 py-2 text-sm']">Day view</a>-->
          <!--                  </HeadlessMenuItem>-->
          <!--                  <HeadlessMenuItem v-slot="{ active }">-->
          <!--                    <a href="#" :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'block px-4 py-2 text-sm']">Week view</a>-->
          <!--                  </HeadlessMenuItem>-->
          <!--                  <HeadlessMenuItem v-slot="{ active }">-->
          <!--                    <a href="#" :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'block px-4 py-2 text-sm']">Month view</a>-->
          <!--                  </HeadlessMenuItem>-->
          <!--                  <HeadlessMenuItem v-slot="{ active }">-->
          <!--                    <a href="#" :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'block px-4 py-2 text-sm']">Year view</a>-->
          <!--                  </HeadlessMenuItem>-->
          <!--                </div>-->
          <!--              </HeadlessMenuItems>-->
          <!--            </transition>-->
          <!--          </HeadlessMenu>-->
          <template v-if="canAddEvent">
            <div class="ml-6 h-6 w-px bg-gray-300" />
            <nuxt-link
              to="/events/new"
              class="ml-6 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">
              Add event
            </nuxt-link>
          </template>
        </div>
        <Menu as="div" class="relative ml-6 md:hidden">
          <MenuButton
            class="-mx-2 flex items-center rounded-full border border-transparent p-2 text-gray-400 hover:text-gray-500">
            <span class="sr-only">Open Menu</span>
            <EllipsisHorizontalIcon class="h-5 w-5" aria-hidden="true" />
          </MenuButton>

          <transition
            enter-active-class="transition duration-100 ease-out"
            enter-from-class="scale-95 transform opacity-0"
            enter-to-class="scale-100 transform opacity-100"
            leave-active-class="transition duration-75 ease-in"
            leave-from-class="scale-100 transform opacity-100"
            leave-to-class="scale-95 transform opacity-0">
            <MenuItems
              class="absolute right-0 z-10 mt-3 w-36 origin-top-right overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none">
              <div class="py-1">
                <MenuItem v-slot="{ active }">
                  <nuxt-link
                    to="/events/new"
                    :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'block px-4 py-2 text-sm']">
                    Add event
                  </nuxt-link>
                </MenuItem>
              </div>
              <div class="py-1">
                <MenuItem v-slot="{ active }">
                  <button
                    type="button"
                    class="w-full text-left"
                    :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'block px-4 py-2 text-sm']"
                    @click="calendarStore.resetDate()">
                    Go to today
                  </button>
                </MenuItem>
              </div>
              <!--              <div class="py-1">-->
              <!--                <MenuItem v-slot="{ active }">-->
              <!--                  <a href="#" :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'block px-4 py-2 text-sm']">Day view</a>-->
              <!--                </MenuItem>-->
              <!--                <MenuItem v-slot="{ active }">-->
              <!--                  <a href="#" :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'block px-4 py-2 text-sm']">Week view</a>-->
              <!--                </MenuItem>-->
              <!--                <MenuItem v-slot="{ active }">-->
              <!--                  <a href="#" :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'block px-4 py-2 text-sm']">Month view</a>-->
              <!--                </MenuItem>-->
              <!--                <MenuItem v-slot="{ active }">-->
              <!--                  <a href="#" :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'block px-4 py-2 text-sm']">Year view</a>-->
              <!--                </MenuItem>-->
              <!--              </div>-->
            </MenuItems>
          </transition>
        </Menu>
      </div>
    </header>

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
          <div class="hidden w-full lg:grid lg:grid-cols-7 lg:gap-px">
            <div
              v-for="(day, dayIndex) in days"
              :key="dayIndex"
              class="min-h-[120px]"
              :class="[day.isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-500', 'relative px-1 py-2']">
              <time
                :datetime="day.date"
                class="ml-2"
                :class="day.isToday ? 'flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 font-semibold text-white' : undefined">
                {{ day.date.split('-').pop().replace(/^0/, '') }}
              </time>
              <ol v-if="day.events.length > 0" class="mt-2">
                <li
                  v-for="(event, eventIndex) in day.events.slice(0, displayEventsPerDay)"
                  :key="eventIndex"
                  class="mb-1">
                  <nuxt-link
                    v-tooltip="event.name"
                    :to="event.href"
                    :class="getEventBorderColor(event)"
                    class="flex group border-l-4 border-blue-500 pl-1 transition-colors"
                    @mouseenter="hoveringEnter(event)"
                    @mouseleave="hoveringLeave()">
                    <p
                      class="flex-auto truncate font-medium text-gray-900 group-hover:text-indigo-600"
                      :class="getHoverState(event)">
                      {{ event.name }}
                    </p>
                    <time
                      v-if="event.time"
                      :datetime="event.datetime"
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
              :class="[day.isCurrentMonth ? 'bg-white' : 'bg-gray-50', (day.isSelected || day.isToday) && 'font-semibold', day.isSelected && 'text-white', !day.isSelected && day.isToday && 'text-indigo-600', !day.isSelected && day.isCurrentMonth && !day.isToday && 'text-gray-900', !day.isSelected && !day.isCurrentMonth && !day.isToday && 'text-gray-500', 'flex h-14 flex-col px-3 py-2 hover:bg-gray-100 focus:z-10']"
              @click="selectDay(day)">
              <time
                :datetime="day.date"
                :class="[day.isSelected && 'flex h-6 w-6 items-center justify-center rounded-full', day.isSelected && day.isToday && 'bg-indigo-600', day.isSelected && !day.isToday && 'bg-gray-900', 'ml-auto']">
                {{ day.date.split('-').pop().replace(/^0/, '') }}
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
      <div v-if="selectedDay?.events.length > 0" class="py-10 sm:px-6 lg:hidden">
        <ol class="overflow-hidden rounded-lg bg-white text-sm shadow ring-1 ring-black ring-opacity-5 divide-y divide-gray-100">
          <li
            v-for="event in selectedDay.events"
            :key="event.id"
            class="flex p-4 pr-6 group focus-within:bg-gray-50 hover:bg-gray-50">
            <div class="flex-auto">
              <div class="flex flex-row gap-2 items-center">
                <p
                  class="font-semibold text-gray-900 border-l-4 pl-2"
                  :class="getEventBorderColor(event)">
                  {{ event.name }}
                </p>
              </div>
              <time
                v-if="event.time"
                :datetime="event.datetime"
                class="mt-2 flex items-center text-gray-700">
                {{ event.time }}
              </time>
            </div>
            <nuxt-link
              :to="event.href"
              class="ml-6 flex-none self-center rounded-md bg-white px-3 py-2 font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 group-hover:opacity-100 hover:ring-gray-400 focus:opacity-100">
              View<span class="sr-only">, {{ event.name }}</span>
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
                      Events for {{ formatDate(selectedDay.date) }}
                    </DialogTitle>
                    <div class="mt-4 flex">
                      <ol class="flex-grow overflow-hidden bg-white text-sm divide-y divide-gray-100">
                        <li
                          v-for="event in selectedDay.events"
                          :key="event.id"
                          class="flex p-4 pr-6 group focus-within:bg-gray-50 hover:bg-gray-50">
                          <div class="flex-auto">
                            <p
                              class="font-semibold text-gray-900 border-l-4 pl-2"
                              :class="getEventBorderColor(event)">
                              {{ event.name }}
                            </p>
                            <time
                              v-if="event.time"
                              :datetime="event.datetime"
                              class="mt-2 flex items-center text-gray-700">
                              {{ event.time }}
                            </time>
                          </div>
                          <nuxt-link
                            :to="event.href"
                            class="ml-6 flex-none self-center rounded-md bg-white px-3 py-2 font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 group-hover:opacity-100 hover:ring-gray-400 focus:opacity-100">
                            View<span class="sr-only">, {{ event.name }}</span>
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

<script setup lang="ts">
import {
  ClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisHorizontalIcon,
  XMarkIcon
} from "@heroicons/vue/24/outline";
import enGB from "date-fns/locale/en-GB/index.js";
import { format, getISODay, setDefaultOptions } from "date-fns";
import { useCalendarStore } from "~/store/calendarStore";
import type { EventItem } from "~/types";

const props = withDefaults(defineProps<{
  events: EventItem[],
  loading: boolean
  displayEventsPerDay?: number
}>(), {
  displayEventsPerDay: 3
});

const eventHovering = ref<string | null>(null);

function hoveringEnter (event: EventItem) {
  eventHovering.value = event.href;
}

function hoveringLeave () {
  eventHovering.value = null;
}

function getHoverState (event: EventItem) {
  if (eventHovering.value === event.href) {
    return "underline  group-hover:text-indigo-600";
  }

  return null;
}

setDefaultOptions({
  locale: enGB,
  weekStartsOn: 1
});

type EventData = {
  id: number,
  name: string,
  time: string,
  datetime: string,
  href: string
}

type Day = {
  date: Date | string,
  events: EventData[],
  isCurrentMonth?: boolean,
  isToday?: boolean,
  isSelected?: boolean
}

const calendarStore = useCalendarStore();
calendarStore.$subscribe((mutation, state) => {
  prepareMonths();
  generateDays();
});

const monthLabel = ref();
const days = ref<Day[]>([]);
const selectedDay = computed(() => days.value.find((day: Day) => day.isSelected));
const openDayModal = ref(false);

function selectDay (day: Day) {
  if (selectedDay.value) {
    selectedDay.value.isSelected = false;
  }
  day.isSelected = true;
}

function openDay (day: Day) {
  if (selectedDay.value) {
    selectedDay.value.isSelected = false;
  }
  day.isSelected = true;
  openDayModal.value = true;
}

const prepareMonths = () => {
  monthLabel.value = new Intl.DateTimeFormat("en-GB", { month: "long" }).format(
    new Date(
      calendarStore.getYear,
      calendarStore.getMonth,
      calendarStore.getDay
    )
  );
};

function generateDays () {
  days.value = [];

  const firstDayOfMonth = getISODay(new Date(calendarStore.getYear, calendarStore.getMonth, 1)) - 1;
  const daysInCurrentMonth = new Date(calendarStore.getYear, calendarStore.getMonth + 1, 0).getDate();
  const totalGrid = firstDayOfMonth <= 5 ? 35 : 42;
  const lastMonthDays = totalGrid - daysInCurrentMonth - firstDayOfMonth;

  for (let i = firstDayOfMonth; i > 0; i--) {
    const date = new Date(calendarStore.getYear, calendarStore.getMonth, 0);
    date.setDate(date.getDate() - i);
    days.value.push({
      date: format(date, "yyyy-MM-dd"),
      events: []
    });
  }

  for (let i = 0; i < daysInCurrentMonth; i++) {
    const date = new Date(calendarStore.getYear, calendarStore.getMonth, i + 1);
    const isToday = date.setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0);
    days.value.push({
      date: format(date, "yyyy-MM-dd"),
      events: getEventsForDay(date),
      isCurrentMonth: true,
      isSelected: isToday,
      isToday
    });
  }

  const lastDayOfMonth = getISODay(new Date(calendarStore.getYear, calendarStore.getMonth, daysInCurrentMonth));
  const count = 7 - lastDayOfMonth;
  if (count !== 7) {
    for (let i = 0; i < count; i++) {
      const date = new Date(calendarStore.getYear, calendarStore.getMonth, i + 1);
      days.value.push({
        date: format(date, "yyyy-MM-dd"),
        events: []
      });
    }
  }
}

function getEventsForDay (date: Date): EventData[] {
  return props.events
    .sort((a, b) => {
      const aStart = new Date(a.start_date);
      const bEnd = new Date(b.start_date);
      return aStart - bEnd;
    })
    .filter((e) => {
      if (e.is_recurring) {
        return false;
      }

      const start = new Date(e.start_date).setHours(0, 0, 0, 0);
      const end = new Date(e.end_date).setHours(0, 0, 0, 0);
      const toCheck = date.setHours(0, 0, 0, 0);
      const dayMatches = start === toCheck;

      if (toCheck >= start && toCheck <= end) {
        return true;
      }

      return dayMatches;
    }).map((e) => {
      const startDate = new Date(e.start_date);
      let title = e.title;

      if (e.event_index && e.event_count) {
        title = `(${e.event_index}/${e.event_count}) ${e.title}`;
      }

      let href = `/events/${e.parent_event || e.id}`;

      if (e.instance) {
        href += "?instance=" + e.instance;
      }

      const eventStart = new Date(e.start_date).setHours(0, 0, 0, 0);
      const toCheck = date.setHours(0, 0, 0, 0);

      // Only show the time value is the event start date is the day we are loading events for
      // eg single events that span multiple days
      const showTime = eventStart === toCheck;

      return {
        id: e.id,
        status: e.status,
        name: title,
        time: showTime ? format(startDate, "h:mmaa") : null,
        datetime: `${format(startDate, "yyyy-MM-dd")}T${format(startDate, "H:mm")}`,
        parentId: e.parent_event,
        type: e.type,
        href
      };
    });
}

watch(() => props.events, () => {
  generateDays();
}, { immediate: true, deep: true });

onMounted(() => {
  prepareMonths();
});

const user = useDirectusUser();
const canAddEvent = computed(() => hasRole(user.value, "Member"));

function formatDate (input: Date) {
  return format(new Date(input), "do MMMM");
}

function getEventBorderColor (event: EventItem) {
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
    return "border-line-500";
  case "coaching":
    return "border-red-500";
  default:
    return "border-gray-300";
  }
}

function getEventDotColor (event: EventItem) {
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
    return "bg-line-500";
  case "coaching":
    return "bg-red-500";
  default:
    return "bg-gray-300";
  }
}

</script>

<style scoped lang="scss">

</style>
