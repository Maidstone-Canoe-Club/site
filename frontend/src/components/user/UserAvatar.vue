<template>
  <div
    v-if="user"
    class="relative"
    :class="sizeClass">
    <img
      v-if="hasAvatar"
      class="rounded-full absolute inset-0 z-10"
      :width="imageSize"
      :height="imageSize"
      :src="avatarUrl!"
      alt="">
    <UserCircleIcon
      class="text-gray-300 absolute block inset-0 z-9"
      aria-hidden="true" />
  </div>
</template>

<script setup lang="ts">
import { UserCircleIcon } from "@heroicons/vue/24/outline";
import type { DirectusUser } from "nuxt-directus/dist/runtime/types";

const props = withDefaults(defineProps<{
  user: DirectusUser,
  imageSize?: number,
  sizeClass?: string
}>(), {
  imageSize: 50,
  sizeClass: "w-8 h-8"
});

const hasAvatar = computed(() => props.user!.avatar);
const avatarUrl = computed(() => getAvatarUrl(props.user, props.imageSize));
</script>

<style scoped lang="scss">

</style>
