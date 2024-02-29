<template>
  <div>
    <RadioGroup v-model="selectedEventType">
      <RadioGroupLabel class="text-base font-semibold leading-6 text-gray-900">
        Select an event type
      </RadioGroupLabel>

      <div class="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-3 sm:gap-x-4">
        <RadioGroupOption
          v-for="eventType in eventTypes"
          :key="eventType.id"
          v-slot="{ active, checked }"
          as="template"
          :value="eventType">
          <div :class="[active ? 'border-indigo-600 ring-2 ring-indigo-600' : 'border-gray-300', 'relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none']">
            <span class="flex flex-1">
              <span class="flex flex-col">
                <RadioGroupLabel as="span" class="block text-sm font-medium text-gray-900">{{ eventType.title }}</RadioGroupLabel>
                <RadioGroupDescription as="span" class="mt-1 flex items-center text-sm text-gray-500">{{ eventType.description }}</RadioGroupDescription>
              </span>
            </span>
            <CheckCircleIcon :class="[!checked ? 'invisible' : '', 'h-5 w-5 text-indigo-600']" aria-hidden="true" />
            <span :class="[active ? 'border' : 'border-2', checked ? 'border-indigo-600' : 'border-transparent', 'pointer-events-none absolute -inset-px rounded-lg']" aria-hidden="true" />
          </div>
        </RadioGroupOption>
      </div>
    </RadioGroup>
    <event-wizard-footer
      :show-back-button="showBackButton"
      :can-go-next="canGoNext"
      @prev="onPrev"
      @next="onNext" />
  </div>
</template>

<script setup lang="ts">
import { CheckCircleIcon } from "@heroicons/vue/20/solid";

const emits = defineEmits(["update:eventType", "prev", "next"]);

const props = defineProps<{
  eventType: string,
  showBackButton: boolean
}>();

const eventType = ref(props.eventType);

const eventTypes = [
  { id: "single", title: "Single event", description: "An event that will only occur once, but could span multiple days, like a trip" },
  { id: "multi", title: "Multi day event", description: "An event that occurs over multiple days, like a beginners course" },
  { id: "recurring", title: "Recurring event", description: "An event that repeats, like a Sunday paddle or the kids club" }
];

const selectedEventType = ref(eventTypes.find(e => e.id === props.eventType));

watch(() => props.eventType, (val) => {
  eventType.value = val;
});

watch(eventType, (val) => {
  emits("update:eventType", val);
}, { immediate: true });

watch(selectedEventType, (val) => {
  eventType.value = val.id;
}, { deep: true });

const canGoNext = computed(() => !!eventType.value);

function onPrev () {
  emits("prev");
}

function onNext () {
  emits("next");
}

</script>

<style scoped lang="scss">

</style>
