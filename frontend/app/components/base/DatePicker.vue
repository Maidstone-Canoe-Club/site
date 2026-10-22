<template>
  <vue-date-picker
    v-model="internalValue"
    :placeholder="placeholder"
    auto-apply
    :config="{ closeOnAutoApply: false }"
    :time-config="{ is24: false, enableTimePicker: enableTimePicker ?? false }"
    :formats="{ input: formatDate, preview: formatDate }"
    :min-date="minDate"
    :max-date="maxDate"
    :locale="enGB">
    <template #calendar-icon>
      <span class="dp__clock-icon">
        <CalendarDaysIcon />
        Click to select date
      </span>
    </template>
    <template #clock-icon>
      <span class="dp__clock-icon">
        <ClockIcon />
        Click to select time
      </span>
    </template>
  </vue-date-picker>
</template>

<script setup lang="ts">
import { VueDatePicker } from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import { format } from "date-fns";
import { enGB } from "date-fns/locale";
import { CalendarDaysIcon, ClockIcon } from "@heroicons/vue/24/outline";

const emits = defineEmits(["update:modelValue"]);

const props = defineProps<{
  modelValue: Date | number | null | undefined,
  enableTimePicker?: boolean,
  minDate?: Date | string
  maxDate?: Date | string
  placeholder?: string
}>();

const internalValue = ref(props.modelValue);

watch(() => props.modelValue, (val) => {
  internalValue.value = props.modelValue;
});

watch(internalValue, (val) => {
  emits("update:modelValue", val);
});

const formatDate = (date: Date | number) => {
  let resultFormat = "dd MMM yyyy";
  if (props.enableTimePicker) {
    resultFormat += " - hh:mmaaa";
  }

  return format(date, resultFormat);
};

</script>

<style scoped lang="postcss">
::v-deep(.dp__clock-icon){
  display: flex;
  align-items: center;
  gap: .5rem;
}

/* The menu can be teleported outside this component, so theme it with the picker's own variables.
   :root raises the specificity above the picker's defaults whatever order the stylesheets load in. */
:global(:root .dp--theme-light) {
  --dp-primary-color: #4646e5;
  --dp-font-family: 'Karla', Arial, sans-serif;
}

:global(.dp--button-bottom) {
  color: white;
  background-color: #4646e5;

  &:hover {
    background-color: #6366f1;
  }
}
</style>
