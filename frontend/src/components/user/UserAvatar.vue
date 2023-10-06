<template>
  <template v-if="user">
    <nuxt-img
      v-if="hasAvatar"
      class="rounded-full"
      :width="imageSize"
      :height="imageSize"
      :class="sizeClass"
      :src="avatarUrl!"
      alt="User avatar" />
    <UserCircleIcon
      v-else
      class="text-gray-300"
      :class="sizeClass"
      aria-hidden="true" />
  </template>
</template>

<script setup lang="ts">
import { UserCircleIcon } from "@heroicons/vue/24/outline";
import { DirectusUser } from "nuxt-directus/dist/runtime/types";

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
