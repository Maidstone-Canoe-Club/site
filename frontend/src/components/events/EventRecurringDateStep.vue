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
import { useVuelidate, Validation } from "@vuelidate/core/dist";
import { required } from "@vuelidate/validators";
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
  { id: "weekly", name: "Weekly" },
  { id: "monthly", name: "Monthly" },
  { id: "yearly", name: "Yearly" }
];

function onPrev () {
  emits("prev");
}

const rules = {
  startDate: { required }
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
