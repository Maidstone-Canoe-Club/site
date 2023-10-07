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
      :class="{'opacity-100': internalLoading}">
      <loading-spinner />
    </div>
  </button>
</template>

<script setup lang="ts">

const emits = defineEmits(["click"]);

const props = defineProps<{
  disabled?: boolean,
  action?: Function,
  type?: "button" | "submit" | "reset" | undefined,
  loading?: boolean
}>();

const buttonDisabled = computed(() => {
  return props.disabled || internalLoading.value;
});

const internalLoading = ref(false);

watch(() => props.loading, (val) => {
  if (val !== undefined) {
    internalLoading.value = val;
  }
});

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
  emits("click");
  console.log("clicked");
  if (!props.action) {
    console.log("no action");
    return;
  }
  console.log("action");
  internalLoading.value = true;

  try {
    await props.action();
    console.log("here?");
  } finally {
    internalLoading.value = false;
  }
}

</script>
