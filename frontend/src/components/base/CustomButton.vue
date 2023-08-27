<template>
  <button
    ref="button"
    :type="type"
    :class="buttonClass"
    :style="{ 'width': width }"
    :disabled="buttonDisabled"
    class="relative overflow-hidden rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
    @click="onClick">
    <slot />
    <div
      class="absolute transition-opacity inset-0 flex justify-center items-center opacity-0 bg-indigo-600"
      :class="{'opacity-100': loading}">
      <loading-spinner />
    </div>
  </button>
</template>

<script setup lang="ts">
const props = defineProps<{
  class?: string,
  disabled?: boolean,
  action: Function,
  type?: "button" | "submit" | "reset" | undefined
}>();

const buttonDisabled = computed(() => {
  return props.disabled || loading.value;
});

const buttonClass = ref(props.class);

const loading = ref(false);

const button = ref(null);
const width = ref<string | null>(null);

onMounted(() => {
  width.value = `${button.value.clientWidth}px`;
});

async function onClick () {
  loading.value = true;

  try {
    await props.action();
  } finally {
    loading.value = false;
  }
}

</script>
