<script setup lang="ts">
import { required } from "@vuelidate/validators";
import { useVuelidate } from "@vuelidate/core";
import type { EventWizardItem } from "~/components/events/wizard/EventWizard.vue";
import ValidationMessages from "~/components/events/wizard/ValidationMessages.vue";
import type { OccurrenceType } from "~/types/events";
import { BeginnersCourseTemplate, BlankEventTemplate } from "~/utils/events";

type EventType = {
  id: OccurrenceType,
  name: string,
  description: string,
}

type EventTemplateType = {
  id: string,
  name: string,
  description: string
}

const event = defineModel<EventWizardItem>({ required: true });
const templateSelected = ref(false);

const user = useDirectusUser();

const eventTypes: EventType[] = [
  {
    id: "single",
    name: "Single event",
    description: "An event that could last an hour to multiple days, like an open day or a trip"
  },
  {
    id: "multi",
    name: "Multi-day event",
    description: "An event that occurs over multiple days, like a beginners course"
  },
  {
    id: "recurring",
    name: "Recurring event",
    description: "An event that occurs multiple times, like the pool sessions"
  }
];

const templateTypes: EventTemplateType[] = [
  {
    id: "beginners-course",
    name: "Beginners course",
    description: "A pre-filled beginners course with a few options to complete"
  },
  {
    id: "blank",
    name: "Blank event",
    description: "A blank event with no options filled"
  }
];

const templates: Record<string, EventWizardItem> = {
  "beginners-course": BeginnersCourseTemplate,
  blank: BlankEventTemplate
};

const selected = ref<EventType | undefined>(eventTypes.find(t => t.id === event.value.occurrenceType));

const selectedTemplate = ref<EventTemplateType | undefined>();

watch(selected, (val) => {
  event.value.occurrenceType = val?.id;
  event.value.leaders = [user.value!];
}, { deep: true });

watch(selectedTemplate, (val) => {
  if (val) {
    event.value = { ...templates[val.id] };
    selected.value = eventTypes.find(t => t.id === templates[val.id].occurrenceType);
    templateSelected.value = val.id !== "blank";
  }
}, { deep: true });

const rules = {
  occurrenceType: { required }
};

const validator = useVuelidate<EventWizardItem>(rules, event);

</script>

<template>
  <div class="space-y-6">
    <strong>Event type</strong>

    <p>Please select the type of event you'd like to create:</p>

    <RadioGroup
      v-model="selected"
      by="id">
      <RadioGroupLabel class="sr-only">
        Event types
      </RadioGroupLabel>
      <div class="-space-y-px rounded-md bg-white">
        <RadioGroupOption
          v-for="(eventType, index) in eventTypes"
          :key="eventType.id"
          v-slot="{ checked, active }"
          :disabled="templateSelected"
          as="template"
          :value="eventType">
          <div
            :class="[
              index === 0 ? 'rounded-tl-md rounded-tr-md' : '',
              index === eventTypes.length - 1 ? 'rounded-bl-md rounded-br-md' : '',
              checked ? 'z-10 border-indigo-200 bg-indigo-50' : 'border-gray-200',
              templateSelected ? 'opacity-60' : 'cursor-pointer',
              'relative flex border p-4 focus:outline-none']">
            <span
              :class="[checked ? 'bg-indigo-600 border-transparent' : 'bg-white border-gray-300', active ? 'ring-2 ring-offset-2 ring-indigo-600' : '', 'mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded-full border flex items-center justify-center']"
              aria-hidden="true">
              <span class="rounded-full bg-white w-1.5 h-1.5" />
            </span>
            <span class="ml-3 flex flex-col">
              <RadioGroupLabel
                as="span"
                :class="[checked ? 'text-indigo-900' : 'text-gray-900', 'block text-sm font-medium']">{{
                  eventType.name
                }}</RadioGroupLabel>
              <RadioGroupDescription
                as="span"
                :class="[checked ? 'text-indigo-700' : 'text-gray-500', 'block text-sm']">{{
                  eventType.description
                }}</RadioGroupDescription>
            </span>
          </div>
        </RadioGroupOption>
      </div>
    </RadioGroup>

    <p>or, select from a pre-defined template:</p>

    <RadioGroup
      v-model="selectedTemplate"
      by="id">
      <RadioGroupLabel class="sr-only">
        Event types
      </RadioGroupLabel>
      <div class="-space-y-px rounded-md bg-white">
        <RadioGroupOption
          v-for="(template, index) in templateTypes"
          :key="template.id"
          v-slot="{ checked, active }"
          as="template"
          :value="template">
          <div
            :class="[index === 0 ? 'rounded-tl-md rounded-tr-md' : '', index === templateTypes.length - 1 ? 'rounded-bl-md rounded-br-md' : '', checked ? 'z-10 border-indigo-200 bg-indigo-50' : 'border-gray-200', 'relative flex cursor-pointer border p-4 focus:outline-none']">
            <span
              :class="[checked ? 'bg-indigo-600 border-transparent' : 'bg-white border-gray-300', active ? 'ring-2 ring-offset-2 ring-indigo-600' : '', 'mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded-full border flex items-center justify-center']"
              aria-hidden="true">
              <span class="rounded-full bg-white w-1.5 h-1.5" />
            </span>
            <span class="ml-3 flex flex-col">
              <RadioGroupLabel
                as="span"
                :class="[checked ? 'text-indigo-900' : 'text-gray-900', 'block text-sm font-medium']">{{
                  template.name
                }}</RadioGroupLabel>
              <RadioGroupDescription
                as="span"
                :class="[checked ? 'text-indigo-700' : 'text-gray-500', 'block text-sm']">{{
                  template.description
                }}</RadioGroupDescription>
            </span>
          </div>
        </RadioGroupOption>
      </div>
    </RadioGroup>
    <ValidationMessages :v="validator" />

    <div class="footer">
      <hr class="mb-6">
      <slot v-bind="{validator}" />
    </div>
  </div>
</template>
