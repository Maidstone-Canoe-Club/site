<script setup lang="ts">
withDefaults(defineProps<{
  title?: string,
  headline?: string
}>(), {
  title: "title",
  headline: undefined
});
</script>

<template>
  <div
    class="h-full w-full flex items-start justify-start border-solid border-white border-[12px] relative"
    style="{'font-family': 'Karla, Arial, sans-serif'}">
    <div
      class="flex items-start justify-start h-full"
      :style="{backgroundImage: 'linear-gradient(45deg, rgba(167,239,233,0.3) 0%, rgba(132,186,244,0.3) 50%, rgba(255,255,255,0.0) 100%)'}">
      <div
        class="flex flex-col justify-between w-full h-full relative">
        <img
          src="/images/logo-no-text.svg"
          alt=""
          class="absolute left-[300px] top-[-200px] opacity-30"
          width="1200"
          height="1200">
        <div class="p-20 flex flex-col gap-1">
          <p
            v-if="headline"
            class="text-[30px] m-0 font-bold uppercase tracking-right">
            {{ headline }}
          </p>
          <h1
            class="text-[80px] font-bold text-left text-pretty mt-0 leading-tight"
            style="font-family: 'Space Grotesk', Arial, sans-serif">
            {{ title }}
          </h1>
        </div>
        <p class="text-2xl pb-10 px-20 font-bold mb-0">
          maidstonecanoeclub.net
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>
