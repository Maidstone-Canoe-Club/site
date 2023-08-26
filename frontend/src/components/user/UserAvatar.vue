<template>
  <img
    v-if="hasAvatar"
    class="h-8 w-8 rounded-full"
    :src="avatarUrl!"
    alt="User avatar">
  <UserCircleIcon
    v-else
    class="h-12 w-12 text-gray-300"
    aria-hidden="true" />
</template>

<script setup lang="ts">
import { UserCircleIcon } from "@heroicons/vue/24/outline";
import { DirectusUser } from "nuxt-directus/dist/runtime/types";

const props = defineProps<{
  user: DirectusUser
}>();

const hasAvatar = computed(() => !!props.user!.avatar);
const avatarUrl = computed(() => getAvatarUrl(props.user));
</script>

<style scoped lang="scss">

</style>
