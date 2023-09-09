<template>
  <component
    :is="rootTag"
    class="state-manager">
    <slot v-bind="functionality" />
  </component>
</template>

<script setup lang="ts">

const props = withDefaults(defineProps<{
  modelValue: string,
  rootTag?: string,
  defaultState?: string
}>(), {
  rootTag: "div",
  defaultState: "default"
});

watch(() => props.modelValue, (val) => {
  pushState(val);
});

const functionality = computed(() => ({
  setState: pushState,
  goBack: popState,
  currentState,
  canGoBack: stateHistory.value.length > 1
}));

const currentState = computed(() => stateHistory.value[stateHistory.value.length - 1]);

const registeredStates = ref([]);
const stateHistory = ref([]);

provide("register", registerState);
provide("unregister", unregisterState);
provide("currentState", currentState);

function registerState (name: string) {
  if (registeredStates.value.includes(name)) {
    throw new Error(`Duplicate state name: ${name}`);
  }
  registeredStates.value.push(name);
  if (name === props.defaultState) {
    pushState(name);
  }
}

function unregisterState (name: string) {
  const index = registeredStates.value.findIndex(n => n === name);
  registeredStates.value.splice(index, 1);
}

function pushState (state: string) {
  if (stateHistory.value.length !== 0 && !registeredStates.value.includes(state)) {
    throw new Error(`Cannot navigate to unregistered state: ${state}`);
  }

  if (state !== currentState.value) {
    stateHistory.value.push(state);
  }
}

function popState () {
  if (stateHistory.value.length > 1) {
    stateHistory.value.pop();
  } else {
    stateHistory.value.pop();
    pushState(props.defaultState);
  }
}

</script>

<style scoped lang="scss">

</style>
