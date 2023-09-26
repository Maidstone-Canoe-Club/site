<template>
  <div>
    <div class="input-group">
      <input-date
        id="recurring-start"
        v-model="eventDates.recurring.startDate"
        enable-time-picker
        required
        label="When does the event start?"
        :v="v$.startDate" />

      <input-date
        id="recurring-end"
        v-model="eventDates.recurring.endDate"
        enable-time-picker
        required
        label="When does the event end?"
        :v="v$.endDate" />

      <input-dropdown
        id="recurring-type"
        v-model="eventDates.recurring.recurringType"
        label="How often does the event repeat?"
        :options="recurringTypes" />

      <div>
        <input-field
          id="recurring-occurrences"
          v-model="eventDates.recurring.maxOccurrences"
          type="number"
          label="How many times will the event repeat?" />
        <small>Leave blank to repeat indefinitely</small>
      </div>
    </div>
    <event-wizard-footer
      :show-back-button="showBackButton"
      can-go-next
      @prev="onPrev"
      @next="onNext" />
  </div>
</template>

<script setup lang="ts">
import { useVuelidate, Validation } from "@vuelidate/core";
import { required, helpers } from "@vuelidate/validators";
import { Ref } from "vue";

const emits = defineEmits(["update:eventDates", "prev", "next"]);

const props = defineProps<{
  eventDates: any,
  showBackButton: boolean
}>();

const eventDates = ref(props.eventDates);

watch(() => props.eventDates, (val) => {
  eventDates.value = val;
}, { deep: true });

watch(eventDates, (val) => {
  emits("update:eventDates", val);
}, { deep: true, immediate: true });

const recurringTypes = [
  { id: "daily", name: "Daily" },
  { id: "weekly", name: "Weekly" }
  // { id: "monthly", name: "Monthly" }, // Removed until infinite repeating works
  // { id: "yearly", name: "Yearly" }
];

function onPrev () {
  emits("prev");
}

function beforeEndDate (value, siblings) {
  return value < siblings.endDate;
}

const rules = {
  startDate: { required, before: helpers.withMessage("Start date must be before end date", beforeEndDate) },
  endDate: { required }
};

const v$: Ref<Validation> = useVuelidate(rules, eventDates.value.recurring);

function onNext () {
  v$.value.$touch();

  if (!v$.value.$invalid) {
    emits("next");
  }
}

</script>

<style scoped lang="scss">

</style>
