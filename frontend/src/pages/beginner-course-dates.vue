<script setup lang="ts">

const { getSingletonItem } = useDirectusItems();

type BeginnersCourseContent = {
  id: string
  content: string;
}

const { data } = await useAsyncData("beginners-course-content", async () => {
  return await getSingletonItem<BeginnersCourseContent>({ collection: "beginners_courses" }
  );
});

</script>

<template>
  <section class="mx-auto max-w-3xl mt-8 px-3 sm:px-0">
    <h1 class="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
      Beginners course dates
    </h1>
    <div v-if="data.content" class="space-y-4">
      <RichText :content="data.content" />
    </div>

    <div class="mt-5 border border-gray-200 rounded-2xl overflow-hidden bg-white shadow sm:rounded-lg">
      <upcoming-list
        :types="['beginners_course']"
        event-full-label="Course full" />
    </div>
  </section>
</template>

<style scoped lang="scss">

</style>
