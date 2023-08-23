<template>
  <div>
    <strong>News</strong>
    <pre v-if="newsItems">{{ newsItems }}</pre>
    <pre v-else>No news</pre>
  </div>
</template>

<script setup lang="ts">
// const {getItems} = useDirectusItems();

const newsItems = null;

// async function loadNews(){
//   try{
//     const {data: newsItem}= await useAsyncData("news", () => {
//       return getItems({
//         collection: "news"
//       })
//     })
//
//     return newsItem;
//
//   }catch(e){
//     console.log("didn't work", e);
//     return null;
//   }
// }

</script>
