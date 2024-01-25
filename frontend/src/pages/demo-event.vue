<template>
  <div class="mt-10">
    <div class="lg:flex lg:items-center lg:justify-between">
      <div class="min-w-0 flex-1">
        <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Beginners Course
        </h2>
        <div class="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
          <div class="mt-2 flex items-center text-sm text-gray-500">
            <MapPinIcon class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
            Maidstone Canoe Club
          </div>
          <div class="mt-2 flex items-center text-sm text-gray-500">
            <CurrencyPoundIcon class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
            £65 per adult &ndash; £45 per junior
          </div>
          <div class="mt-2 flex items-center text-sm text-gray-500">
            <CalendarIcon class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
            January 9, 2024
          </div>
        </div>
      </div>
      <div class="mt-5 flex lg:ml-4 lg:mt-0">
        <span class="sm:ml-3">
          <button type="button" class="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
            <PencilIcon class="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
            Edit
          </button>
        </span>

        <!-- Dropdown -->
        <Menu as="div" class="relative ml-3 sm:hidden">
          <MenuButton class="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:ring-gray-400">
            More
            <ChevronDownIcon class="-mr-1 ml-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
          </MenuButton>

          <transition
            enter-active-class="transition ease-out duration-200"
            enter-from-class="transform opacity-0 scale-95"
            enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition ease-in duration-75"
            leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-95">
            <MenuItems class="absolute right-0 z-10 -mr-1 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <MenuItem v-slot="{ active }">
                <a href="#" :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']">Edit</a>
              </MenuItem>
              <MenuItem v-slot="{ active }">
                <a href="#" :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']">View</a>
              </MenuItem>
            </MenuItems>
          </transition>
        </Menu>
      </div>
    </div>

    <div class="mt-5">
      <div class="grid md:grid-cols-12 gap-10">
        <div class="md:col-span-8 mt-5">
          <p class="mb-3">
            Paddle with us!  If you're thinking of joining Maidstone Canoe Club and learning to paddle, you're in the right place!  Our beginner's courses are designed to give you the basic skills to control the boat.  Once you've completed the course, you'll have the confidence and abilities to join us on our trips, tours and regular paddles on the Medway and beyond.
          </p>
          <p class="mb-3">
            Please note all courses must be pre-booked - all novice paddlers must attend one of our beginner courses.  Full details of the courses and how to get involved in paddling (including how to join the Club if you're already an experience paddler) are available on this page - please take a look if you haven't already.
          </p>
          <p class="mb-3">
            Our courses cost £65 for adults and £45 for children, and are run by our friendly qualified coaches.  They consist of 8 hours coaching time - either 4 x two-hour sessions, 2 x four-hour sessions, or occasionally 1 x eight-hour session- and follow the syllabus for the nationally-recognised British Canoeing Discover Award.
          </p>
          <p class="mb-3">
            Your coaches for this course will be Alan Nevard.   It is suitable for ages 14+.  We will be taking a short break for a working lunch, so please bring a packed lunch.. The dates for this course are:
          </p>
        </div>
        <div class="md:col-span-4">
          <div class="mb-5 mt-5">
            <button
              type="button"
              class="w-full rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
              Book now
            </button>
          </div>
          <div class="mt-2 flex items-center font-semibold">
            <UsersIcon class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
            6/8 attendees
          </div>
          <ul role="list" class="divide-y divide-gray-100">
            <li v-for="person in people" :key="person.email" class="flex items-center justify-between gap-x-6 py-5">
              <div class="flex min-w-0 gap-x-4">
                <img
                  v-if="person.imageUrl"
                  class="h-12 w-12 flex-none rounded-full bg-gray-50"
                  :src="person.imageUrl"
                  alt="">
                <UserCircleIcon
                  v-else
                  class="h-12 w-12 text-gray-300"
                  aria-hidden="true" />
                <div class="min-w-0 flex-auto">
                  <p class="text-sm font-semibold leading-6 text-gray-900">
                    {{ person.name }}
                  </p>
                  <p class="mt-1 truncate text-xs leading-5 text-gray-500">
                    {{ person.email }}
                  </p>
                </div>
              </div>
              <a :href="person.href" class="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">View</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  CalendarIcon,
  UsersIcon,
  ChevronDownIcon,
  CurrencyPoundIcon,
  MapPinIcon,
  PencilIcon
} from "@heroicons/vue/20/solid";
import { UserCircleIcon } from "@heroicons/vue/24/outline";

const people = [

  {
    name: "Leslie Alexander",
    email: "leslie.alexander@example.com",
    imageUrl:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    href: "#"
  },
  {
    name: "Michael Foster",
    email: "michael.foster@example.com",
    imageUrl:
        "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    href: "#"
  },
  {
    name: "Dries Vincent",
    email: "dries.vincent@example.com",
    href: "#"
  },
  {
    name: "Lindsay Walton",
    email: "lindsay.walton@example.com",
    imageUrl:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    href: "#"
  },
  {
    name: "Courtney Henry",
    email: "courtney.henry@example.com",
    imageUrl:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    href: "#"
  },
  {
    name: "Tom Cook",
    email: "tom.cook@example.com",
    imageUrl:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    href: "#"
  }
];

</script>

<style scoped lang="scss">

</style>
