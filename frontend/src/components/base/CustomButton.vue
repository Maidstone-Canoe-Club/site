<template>
  <button
    ref="button"
    :type="type"
    :style="{ 'width': width }"
    :disabled="buttonDisabled"
    :class="computedClass"
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
  disabled?: boolean,
  action: Function,
  type?: "button" | "submit" | "reset" | undefined
}>();

const buttonDisabled = computed(() => {
  return props.disabled || loading.value;
});

const loading = ref(false);

const button = ref(null);
const width = ref<string | null>(null);

onMounted(() => {
  width.value = `${button.value.clientWidth}px`;
});

const computedClass = computed(() => {
  let result = "relative overflow-hidden rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600";

  if (props.disabled) {
    result = "relative overflow-hidden rounded-md bg-indigo-300 text-gray-500 px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600";
  }

  return result;
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
