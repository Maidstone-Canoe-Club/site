<template>
  <div>
    <div class="flex w-full">
      <div class="flex justify-center gap-3 sm:gap-6 w-full flex-col sm:flex-row">
        <input-date
          id="start-date"
          v-model="eventItem.startDate"
          class="w-full sm:w-auto"
          label="Start date"
          enable-time-picker
          :v="v$.startDate" />
        <div class="h-full justify-center items-center hidden sm:flex">
          <ArrowRightIcon class="w-6 h-6 text-gray-400" />
        </div>
        <input-date
          id="end-date"
          v-model="eventItem.endDate"
          class="w-full sm:w-auto"
          enable-time-picker
          label="End date"
          :v="v$.endDate" />
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
import { useVuelidate } from "@vuelidate/core";
import type { Validation } from "@vuelidate/core";
import { required, helpers } from "@vuelidate/validators";
import { ArrowRightIcon } from "@heroicons/vue/24/outline";
import type { Ref } from "vue";
import { addHours, formatISO } from "date-fns";

const emits = defineEmits(["update:eventItem", "prev", "next"]);

const props = defineProps<{
   eventItem: any,
   showBackButton: boolean
 }>();

const eventItem = ref(props.eventItem);

watch(() => props.eventItem, (val) => {
  eventItem.value = val;
}, { deep: true });

watch(eventItem, (val) => {
  emits("update:eventItem", val);
}, { deep: true, immediate: true });

watch(() => eventItem.value.startDate, (val) => {
  if (val && !eventItem.value.endDate) {
    eventItem.value.endDate = formatISO(addHours(new Date(val), 1));
  }
});

function beforeEndDate (value, siblings) {
  return value < siblings.endDate;
}

const rules = {
  startDate: { required, before: helpers.withMessage("Start date must be before end date", beforeEndDate) },
  endDate: { required }
};

const v$: Ref<Validation> = useVuelidate(rules, eventItem);

function onPrev () {
  emits("prev");
}

function onNext () {
  v$.value.$touch();

  if (!v$.value.$invalid) {
    emits("next");
  }
}
</script>

<style scoped lang="scss">

</style>
