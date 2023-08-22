<template>
  <div>
    <strong>News</strong>
    <pre>{{ newsItems }}</pre>
  </div>
</template>

<script setup lang="ts">
const {getItems} = useDirectusItems();

const {
  data: newsItems,
  pending,
  error
} = await useAsyncData("news", () => {
  return getItems({
    collection: "news"
  })
})
</script>
