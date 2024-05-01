<script setup lang="ts">

</script>

<template>
  <section class="mx-auto max-w-3xl mt-8 px-3 sm:px-0">
    <h1 class="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
      Coached paddles & courses
    </h1>
    <div class="space-y-4">
      <p>
        Here you can find a list of upcoming coached paddles and courses we are running. If you are looking for
        beginners
        courses
        <nuxt-link
          to="/beginner-course-dates"
          class="underline text-indigo-500">
          you can find them here
        </nuxt-link>
        or on the
        <nuxt-link to="/calendar" class="underline text-indigo-500">
          calendar
        </nuxt-link>.
      </p>
    </div>

    <upcoming-list
      :types="['coaching']"
      event-full-label="Course full"
      no-items-found-message="There are no coached paddles or courses available yet." />
  </section>
</template>

<style scoped lang="scss">

</style>
