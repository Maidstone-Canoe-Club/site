<script setup lang="ts">

</script>

<template>
  <section class="mx-auto max-w-3xl mt-8 px-3 sm:px-0">
    <h1 class="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
      Beginners Course dates
    </h1>
    <div class="space-y-4">
      <p>
        Online booking for our current courses can be
        <NuxtLink
          to="/calendar"
          class="underline text-indigo-500">
          found on our calendar
        </NuxtLink>
        .
        Courses run from April to September. We add new dates throughout the summer - to be notified when
        new dates are released, please follow us on
        <NuxtLink
          to="https://www.facebook.com/MaidstoneCanoeClub/"
          class="underline text-indigo-500">
          Facebook.
        </NuxtLink>
      </p>
      <p>
        If you're already a competent paddler and would like to join the Club, please
        <NuxtLink
          to="/come-paddle/memberships"
          class="underline text-indigo-500">
          see our membership options.
        </NuxtLink>
      </p>
    </div>

    <div class="mt-5 border border-gray-200 rounded-2xl bg-white shadow sm:rounded-lg">
      <upcoming-list
        :types="['beginners_course']"
        event-full-label="Course full" />
    </div>
  </section>
</template>

<style scoped lang="scss">

</style>
