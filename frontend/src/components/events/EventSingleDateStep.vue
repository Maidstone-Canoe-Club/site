<template>
  <div>
    <div class="flex w-full">
      <div class="flex justify-center gap-3 sm:gap-6 w-full flex-col sm:flex-row">
        <input-date
          id="start-date"
          v-model="eventItem.start_date"
          class="w-full sm:w-auto"
          label="Start date"
          enable-time-picker
          :v="v$.start_date" />
        <div class="h-full justify-center items-center hidden sm:flex">
          <ArrowRightIcon class="w-6 h-6 text-gray-400" />
        </div>
        <input-date
          id="end-date"
          v-model="eventItem.end_date"
          class="w-full sm:w-auto"
          enable-time-picker
          label="End date"
          :v="v$.end_date" />
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
import { required } from "@vuelidate/validators";

import { ArrowRightIcon } from "@heroicons/vue/24/outline";
import { Ref } from "vue";

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

const rules = {
  start_date: { required },
  end_date: { required }
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
