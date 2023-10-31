<template>
  <div v-if="roleLabel">
    <span class="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
      {{ roleLabel }}
    </span>
  </div>
</template>

<script setup lang="ts">
import type { DirectusUser } from "nuxt-directus/dist/runtime/types";

const props = defineProps<{
  user: DirectusUser
}>();

const roleLabel = computed(() => {
  if (!props.user || !props.user.role) {
    return null;
  }

  switch (props.user.role.name) {
  case "Administrator": return "Admin";
  case "Coach": return "Coach/PAA";
  case "Committee": return "Committee Member";
  case "Member": return "Club Member";
  case "Junior": return "Junior";
  case "Unverified":
  case "Unapproved": return "Non-member";
  default: return null;
  }
});

</script>

<style scoped lang="scss">

</style>
