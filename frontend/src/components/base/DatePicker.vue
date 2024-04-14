<template>
  <vue-date-picker
    v-model="internalValue"
    :format="formatDate"
    :placeholder="placeholder"
    auto-apply
    :close-on-auto-apply="false"
    :enable-time-picker="enableTimePicker ?? false"
    :min-date="minDate"
    :max-date="maxDate"
    utc
    locale="en-GB">
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
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import { format } from "date-fns";
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

::v-deep(.dp__active_date) {
  background-color: #4646e5;
}

::v-deep(.dp__button_bottom){
  color: white;
  background-color: #4646e5;

  &:hover {
    background-color: #6366f1;
  }
}

::v-deep(.dp__menu),
::v-deep(.dp__input){
  font-family: 'Karla', Arial, sans-serif;
}
</style>
