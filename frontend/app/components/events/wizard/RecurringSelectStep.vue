<script setup lang="ts">
import { format } from "date-fns";
import { useVuelidate } from "@vuelidate/core";
import { required } from "@vuelidate/validators";
import type { EventItem } from "~/types";
import type { EditRecurringType } from "~/components/events/wizard/EventWizard.vue";

const props = defineProps<{
  originalEvent?: EventItem,
  instance?: number
}>();

const editRecurringType = defineModel<EditRecurringType>("editRecurringType", { required: true });

type EditRecurringTypeOption = {
  id: EditRecurringType,
  name: string,
  description: string,
  disabled?: boolean
}

const options: EditRecurringTypeOption[] = [
  {
    id: "all",
    name: "All instances",
    description: "All instances of this event will share the changes"
  },
  {
    id: "single-instance",
    name: "Just this instance",
    description: "Only one instance event will be changed",
    disabled: true
  }
];

const selected = ref(options.find(o => o.id === editRecurringType.value));

const eventDate = computed(() => {
  const dates = getDatesOfInstance(props.originalEvent!, props.instance!);
  return format(new Date(dates.start), "dd/MM/yyyy, h:mmaa");
});

watch(selected, (val) => {
  if (val) {
    editRecurringType.value = val.id;
  }
});

const rules = {
  editRecurringType: { required }
};

const validator = useVuelidate(rules, {
  editRecurringType
});

</script>

<template>
  <div class="space-y-6">
    <p>
      Do you want to make changes to all instances of the event
      <strong>{{ originalEvent!.title }}</strong> or just the event that falls on <strong>{{ eventDate }}</strong>?
    </p>

    <p>
      <i>Note: Editing a single instance of a recurring event is still being worked on. For now you can edit all
        instances
        of a recurring event.</i>
    </p>

    <RadioGroup v-model="selected">
      <RadioGroupLabel class="sr-only">
        Privacy setting
      </RadioGroupLabel>
      <div class="-space-y-px rounded-md bg-white">
        <RadioGroupOption
          v-for="(option, index) in options"
          :key="option.id"
          v-slot="{ checked, active }"
          as="template"
          :disabled="option.disabled"
          :value="option">
          <div
            :class="[
              index === 0 ? 'rounded-tl-md rounded-tr-md' : '',
              index === options.length - 1 ? 'rounded-bl-md rounded-br-md' : '',
              checked ? 'z-10 border-indigo-200 bg-indigo-50' : 'border-gray-200',
              'relative flex border p-4 focus:outline-none',
              option.disabled ? 'opacity-60' : 'cursor-pointer'
            ]">
            <span
              :class="[checked ? 'bg-indigo-600 border-transparent' : 'bg-white border-gray-300', active ? 'ring-2 ring-offset-2 ring-indigo-600' : '', 'mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded-full border flex items-center justify-center']"
              aria-hidden="true">
              <span class="rounded-full bg-white w-1.5 h-1.5" />
            </span>
            <span class="ml-3 flex flex-col">
              <RadioGroupLabel
                as="span"
                :class="[checked ? 'text-indigo-900' : 'text-gray-900', 'block text-sm font-medium']">{{
                  option.name
                }}</RadioGroupLabel>
              <RadioGroupDescription
                as="span"
                :class="[checked ? 'text-indigo-700' : 'text-gray-500', 'block text-sm']">{{
                  option.description
                }}</RadioGroupDescription>
            </span>
          </div>
        </RadioGroupOption>
      </div>
    </RadioGroup>

    <div class="footer">
      <hr class="mb-6">
      <slot v-bind="{validator}" />
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>
