<template>
  <component
    :is="rootTag"
    v-if="isVisible || useShow"
    v-show="isVisible"
    class="state-wrapper">
    <slot />
  </component>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  name: string,
  rootTag?: string,
  show?: boolean,
  useShow?: boolean
}>(), {
  rootTag: "div",
  show: false,
  useShow: false
});

const currentState = inject("currentState");

const isCurrentState = computed(() => props.name === currentState.value);
const isVisible = computed(() => isCurrentState.value || props.show);

const register = inject("register");
const unregister = inject("unregister");

onMounted(() => {
  register(props.name);
});

onUnmounted(() => {
  unregister(props.name);
});

</script>

<style scoped lang="scss">

</style>
